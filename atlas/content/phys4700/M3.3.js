// The harmonic oscillator by ladder operators (Griffiths & Schroeter §2.3.1;
// Sakurai §2.3). Derived: Ĥ = ħω(a†a + ½) from [x̂, p̂] = iħ; [a, a†] = 1;
// a† and a step the eigenvalues of N = a†a by ±1; ‖a|n⟩‖² = n ≥ 0 forces
// a|0⟩ = 0, whose solution is the Gaussian ground state with E₀ = ħω/2;
// a†|n⟩ = √(n+1)|n+1⟩. Applications: matrix elements of x and p, the virial
// split, the Δn = ±1 selection rule, molecular zero-point motion.
// phys2710.MP7.4 met the levels and Hermite functions; this lesson derives
// them from the algebra alone. Fundamentals: CO 2143.27 cm⁻¹, H³⁵Cl
// 2885.98 cm⁻¹, H₂ 4161.17 cm⁻¹ (NIST; as used in phys2710.MP11.2); masses AME2020.
import { lesson, mcq, num, order, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, C, U } from './_qm.js';
import { seg, label, r6 } from './_wells.js';

const t = String.raw;
const red = (a, b) => ((a * b) / (a + b)) * U;
const MOL = {
  CO: { name: 'carbon monoxide, ¹²C¹⁶O', tex: t`^{12}\text{C}^{16}\text{O}`, nu: 2143.27, mu: red(12, 15.99491461957), bond: 112.8 },
  HCl: { name: 'hydrogen chloride, H³⁵Cl', tex: t`\text{H}^{35}\text{Cl}`, nu: 2885.98, mu: red(1.00782503190, 34.968852682), bond: 127.5 },
  H2: { name: 'molecular hydrogen, H₂', tex: t`\text{H}_2`, nu: 4161.17, mu: red(1.00782503190, 1.00782503190), bond: 74.1 },
};
const zp = (M) => Math.sqrt(HBAR / (2 * M.mu * 2 * Math.PI * C * M.nu * 100)) * 1e12;   // pm: √(ħ/2μω)
const SUB = '₀₁₂₃₄₅₆₇₈₉';

/** The oscillator's ladder: rungs at n + ½ (units of ħω), optional arrows [{ from, to, color, label }] and a highlighted rung. */
function ladderPic({ top = 6, arrows = [], hi = null, caption, labels = true }) {
  const curves = [], points = [];
  const k = Math.sqrt(2 * top + 1) / 1.1, edge = Math.min(1.45, Math.sqrt(2 * (top + 1.3)) / k);
  curves.push({ fn: `0.5*(${r6(k)}*x)^2`, color: 'ink3', width: 1.6, domain: [r6(-edge), r6(edge)] });
  for (let n = 0; n <= top; n++) {
    const a = Math.sqrt(2 * n + 1) / k;
    curves.push(seg(-a, n + 0.5, a, n + 0.5, n === hi ? 'gold' : 'accent', n === hi ? 3 : 2));
    if (labels) points.push(label(1.28, n + 0.5, `n = ${n}`, n === hi ? 'gold' : 'ink2', 0, 0, 'left'));
  }
  return {
    type: 'graph',
    params: {
      x: [-1.5, 1.75], y: [0, r6(top + 1.3)], aspect: 'wide', xlabel: '', ylabel: 'energy (units of ħω)', xticks: 0, yticks: 4, axesAt: 'edge',
      curves, points,
      arrows: arrows.map((A) => ({ from: [A.x ?? 0, A.from + 0.5], to: [A.x ?? 0, A.to + 0.5], color: A.color || 'warn', width: 2.4, ...(A.label ? { label: A.label, labelDx: A.dx ?? 8, labelDy: A.dy ?? 0 } : {}) })),
    },
    caption: caption || 'The oscillator’s rungs, ħω apart, starting at ħω/2. The parabola is V(x), drawn schematically.',
  };
}

const oscPic = (n, caption, extra = {}) => ({ type: 'mp-schrodinger', params: { mode: 'bound', well: 'harmonic', hw: 0.5, n, show: 'prob', controls: false, readout: false, panels: ['energy', 'wave'], top: Math.max(n + 2, 4), ...extra }, caption });

export default lesson({
  id: 'phys4700.M3.3',
  title: 'The harmonic oscillator: ladder operators',
  minutes: 18, difficulty: 3,
  intro: t`The oscillator $\hat H = \hat p^2/2m + \tfrac12m\omega^2\hat x^2$ can be solved without a single differential equation. Factor it with the **ladder operators**

$$\hat a = \sqrt{\frac{m\omega}{2\hbar}}\Big(\hat x + \frac{i\hat p}{m\omega}\Big),\qquad \hat a^\dagger = \sqrt{\frac{m\omega}{2\hbar}}\Big(\hat x - \frac{i\hat p}{m\omega}\Big),\qquad [\hat a, \hat a^\dagger] = 1$$

so that $\hat H = \hbar\omega\big(\hat N + \tfrac12\big)$ with the **number operator** $\hat N = \hat a^\dagger\hat a$. The commutator alone shows that $\hat a^\dagger$ climbs one rung, $\hbar\omega$ up, and $\hat a$ climbs down; that the ladder has a bottom rung with $\hat a|0\rangle = 0$; and so that $E_n = \big(n + \tfrac12\big)\hbar\omega$. ([The first look](#/lesson/phys2710.MP7.4) found the same levels from the shapes of the wave functions.)`,
  symbols: [
    { tex: '\\hat a,\\ \\hat a^\\dagger', text: t`the lowering and raising operators: $\hat a|n\rangle = \sqrt n\,|n-1\rangle$, $\hat a^\dagger|n\rangle = \sqrt{n+1}\,|n+1\rangle$; dimensionless` },
    { tex: '\\hat N = \\hat a^\\dagger\\hat a', text: t`the number operator, whose eigenvalue $n = 0, 1, 2, \dots$ counts the quanta $\hbar\omega$ above the ground state` },
    { tex: '|n\\rangle', text: t`the $n$-th stationary state, $\psi_n(x)$ in position space` },
    { tex: '\\omega', text: t`the classical angular frequency $\sqrt{k/m}$, in rad/s` },
    { tex: 'm', text: 'the oscillating mass (the reduced mass, for a molecule), in kg' },
    { tex: '\\hat x,\\ \\hat p', text: t`position and momentum operators, with $[\hat x, \hat p] = i\hbar$` },
    { tex: '\\hbar', text: 'the reduced Planck constant, in J s' },
  ],
  why: 'The same algebra quantizes every field — photons and phonons are the rungs of oscillator ladders — and returns, almost unchanged, for angular momentum.',
  visual: {
    type: 'mp-schrodinger',
    title: 'Climb the ladder',
    lead: t`An electron in a harmonic well. Each press of $\hat a^\dagger$ moves it up one rung: one more node in $\psi$, one more $\hbar\omega$ of energy. Watch where the probability sits compared with a classical particle at the same energy.`,
    tasks: [
      'Step n from 0 to 5: the rungs are equally spaced, and the lowest sits ħω/2 above the bottom of the parabola.',
      'Turn on the classical density at n = 0: the quantum particle is most likely in the middle; the classical one at the turning points.',
      'Go to n = 10: the quantum density starts to hug the classical curve, apart from its wiggles.',
    ],
    params: { mode: 'bound', well: 'harmonic', hw: 0.5, n: 0, show: 'both', controls: ['n', 'hw', 'mass', 'classical', 'show'] },
    caption: 'Exact eigenstates of the ideal oscillator (Hermite functions). Real molecular potentials flatten at high energy, so their upper rungs crowd together.',
  },
  example: {
    prompt: t`Using only $[\hat x, \hat p] = i\hbar$, show that $\hat H = \hbar\omega(\hat a^\dagger\hat a + \tfrac12)$, that the eigenvalues are $(n + \tfrac12)\hbar\omega$ with $n = 0, 1, 2, \dots$, and find the ground state $\psi_0(x)$.`,
    visual: ladderPic({ top: 4, hi: 0, arrows: [{ from: 1, to: 2, label: 'a†', x: -0.25 }, { from: 3, to: 2, label: 'a', x: 0.25, color: 'violet' }], caption: 'The ladder: a† raises by ħω, a lowers. The bottom rung is where a gives zero.' }),
    steps: [
      { label: 'Multiply out', text: t`$\hat a^\dagger\hat a = \tfrac{m\omega}{2\hbar}\Big(\hat x^2 + \tfrac{\hat p^2}{m^2\omega^2} + \tfrac{i}{m\omega}[\hat x, \hat p]\Big) = \dfrac{\hat H}{\hbar\omega} - \tfrac12$, since $\tfrac{i}{m\omega}(i\hbar) = -\tfrac{\hbar}{m\omega}$. So $\hat H = \hbar\omega(\hat N + \tfrac12)$.` },
      { label: 'The key commutator', text: t`The same algebra gives $[\hat a, \hat a^\dagger] = -\tfrac{i}{\hbar}[\hat x, \hat p] = 1$. Then $[\hat N, \hat a^\dagger] = \hat a^\dagger[\hat a, \hat a^\dagger] = \hat a^\dagger$ and $[\hat N, \hat a] = -\hat a$.` },
      { label: 'Raising and lowering', text: t`If $\hat N|n\rangle = n|n\rangle$, then $\hat N\hat a^\dagger|n\rangle = \hat a^\dagger(\hat N + 1)|n\rangle = (n + 1)\hat a^\dagger|n\rangle$: $\hat a^\dagger|n\rangle$ is an eigenstate with eigenvalue $n + 1$. Likewise $\hat a|n\rangle$ has $n - 1$.` },
      { label: 'The ladder has a bottom', text: t`$\|\hat a|n\rangle\|^2 = \langle n|\hat a^\dagger\hat a|n\rangle = n$, and a squared length cannot be negative. Lowering forever would reach negative $n$, so it must stop at a state with $\hat a|0\rangle = 0$, which has $n = 0$. Climbing from there gives $n = 0, 1, 2, \dots$ and $E_n = (n + \tfrac12)\hbar\omega$.` },
      { label: 'The ground state', text: t`In position space $\hat a\psi_0 = 0$ reads $\Big(x + \tfrac{\hbar}{m\omega}\tfrac{d}{dx}\Big)\psi_0 = 0$, so $\psi_0'/\psi_0 = -m\omega x/\hbar$ and $\psi_0 = \big(\tfrac{m\omega}{\pi\hbar}\big)^{1/4}e^{-m\omega x^2/2\hbar}$: a Gaussian, with $E_0 = \tfrac12\hbar\omega$.` },
      { label: 'Sense check', text: t`The ground state is a minimum-uncertainty Gaussian, with $\sigma_x\sigma_p = \hbar/2$, and its energy $\tfrac12\hbar\omega$ is the least the uncertainty principle allows: squeezing $x$ would raise the kinetic energy more than it lowers the potential.` },
    ],
    answer: t`$\hat H = \hbar\omega(\hat a^\dagger\hat a + \tfrac12)$; $E_n = (n + \tfrac12)\hbar\omega$, $n = 0, 1, 2, \dots$; $\psi_0 = (m\omega/\pi\hbar)^{1/4}e^{-m\omega x^2/2\hbar}$.`,
  },
  practice: [
    mcq({
      id: 'a-adag', difficulty: 1,
      prompt: t`What is $\hat a\hat a^\dagger|n\rangle$?`,
      visual: ladderPic({ top: 4, hi: 2, arrows: [{ from: 2, to: 3, label: 'a† first', x: -0.3 }, { from: 3, to: 2, label: 'then a', x: 0.3, color: 'violet' }], caption: 'Up a rung and back down: you return to |n⟩ (here n = 2), but each step multiplies by a square root.' }),
      choices: [t`$(n + 1)|n\rangle$`, t`$n|n\rangle$`, t`$|n\rangle$`, t`$\sqrt{n(n + 1)}\,|n\rangle$`],
      answer: 0,
      why: {
        1: t`$n|n\rangle$ is $\hat a^\dagger\hat a|n\rangle$, the other order. They differ by $[\hat a, \hat a^\dagger] = 1$.`,
        2: t`Each step carries a factor: $\hat a^\dagger|n\rangle = \sqrt{n+1}|n+1\rangle$, then $\hat a|n+1\rangle = \sqrt{n+1}|n\rangle$.`,
        3: t`Going up from $n$ and back down uses the same rung gap twice: both factors are $\sqrt{n+1}$.`,
      },
      hints: [t`$\hat a\hat a^\dagger = \hat a^\dagger\hat a + [\hat a, \hat a^\dagger]$.`, t`$\hat a^\dagger\hat a|n\rangle = n|n\rangle$ and $[\hat a, \hat a^\dagger] = 1$.`],
      teach: t`$\hat a\hat a^\dagger = \hat N + 1$: the order of ladder operators matters, by exactly the commutator.`,
      explain: t`$\hat a\hat a^\dagger|n\rangle = \sqrt{n+1}\,\hat a|n+1\rangle = (n + 1)|n\rangle$, which agrees with $\hat a\hat a^\dagger = \hat N + 1$.`,
    }),
    num({
      id: 'x2-n', difficulty: 2,
      gen(r) {
        const n = r.int(0, 6);
        const ans = n + 0.5;
        return {
          prompt: t`Using $\hat x = \sqrt{\hbar/2m\omega}\,(\hat a + \hat a^\dagger)$, find $\langle x^2\rangle$ in the state $|${n}\rangle$, in units of $\hbar/m\omega$.`,
          visual: oscPic(n, t`The state $|${n}\rangle$’s density in its well. $\langle x^2\rangle$ measures how far it spreads.`),
          answer: ans, tol: { rel: 0.001 },
          errors: [
            { value: 2 * n + 1, feedback: t`Keep the prefactor: $\hat x^2 = \tfrac{\hbar}{2m\omega}(\hat a + \hat a^\dagger)^2$.` },
            { value: n || NaN, feedback: t`$\hat a\hat a^\dagger$ contributes $n + 1$, not $n$: the two cross terms give $\hat a^\dagger\hat a + \hat a\hat a^\dagger = 2n + 1$.` },
          ].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - ans) > 1e-6),
          hints: [t`$(\hat a + \hat a^\dagger)^2 = \hat a^2 + \hat a\hat a^\dagger + \hat a^\dagger\hat a + \hat a^{\dagger2}$; $\hat a^2$ and $\hat a^{\dagger2}$ change $n$ by 2, so their expectation values vanish.`, t`$\langle n|\hat a\hat a^\dagger + \hat a^\dagger\hat a|n\rangle = (n + 1) + n$.`],
          teach: t`Write $\hat x$ in ladder operators; only terms with as many raisings as lowerings survive in an expectation value.`,
          explain: t`$\langle x^2\rangle = \tfrac{\hbar}{2m\omega}(2n + 1) = ${ans}\,\hbar/m\omega$. Even the ground state has $\langle x^2\rangle = \hbar/2m\omega$: zero-point motion.`,
        };
      },
    }),
    num({
      id: 'two-up', difficulty: 2,
      gen(r) {
        const n = r.int(0, 7);
        const ans = Math.sqrt((n + 1) * (n + 2));
        return {
          prompt: t`What is the matrix element $\langle ${n + 2}|\,(\hat a^\dagger)^2\,|${n}\rangle$?`,
          visual: ladderPic({ top: Math.max(5, n + 3), hi: n, arrows: [{ from: n, to: n + 1, x: -0.2, label: 'a†' }, { from: n + 1, to: n + 2, x: 0.2, label: 'a†' }], caption: 'Two raisings in a row. Each multiplies by √(rung number reached).' }),
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: (n + 1) * (n + 2), feedback: t`Each step gives a square root: $\sqrt{n+1}$, then $\sqrt{n+2}$.` },
            { value: Math.sqrt(n * (n + 1)) || NaN, feedback: t`Raising uses $\sqrt{n+1}$ (the rung reached), not $\sqrt n$.` },
            { value: 1, feedback: t`The ladder operators are not normalized steps: $\hat a^\dagger|n\rangle = \sqrt{n+1}|n+1\rangle$.` },
          ].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - ans) > 0.01),
          hints: [t`$\hat a^\dagger|n\rangle = \sqrt{n+1}\,|n+1\rangle$.`, t`Apply it twice: $\sqrt{${n + 1}}\sqrt{${n + 2}}\,|${n + 2}\rangle$.`],
          teach: t`$\hat a^\dagger|n\rangle = \sqrt{n+1}|n+1\rangle$: climbing to rung $k$ costs a factor $\sqrt k$.`,
          explain: t`$(\hat a^\dagger)^2|${n}\rangle = \sqrt{${n + 1}\cdot${n + 2}}\,|${n + 2}\rangle$, so the element is $\sqrt{${(n + 1) * (n + 2)}} = ${fmt(ans, 4)}$. Matrix elements like this, from $\hat x^2$, decide the strength of overtone transitions.`,
        };
      },
    }),
    num({
      id: 'virial', difficulty: 2,
      gen(r) {
        const n = r.int(0, 5), hw = r.pick([0.1, 0.2, 0.25, 0.5]);
        const ans = 0.5 * (n + 0.5) * hw;
        return {
          prompt: t`A particle is in the oscillator state $|${n}\rangle$ with $\hbar\omega = ${hw}$ eV. What is its mean potential energy $\langle V\rangle = \tfrac12m\omega^2\langle x^2\rangle$, in eV?`,
          visual: oscPic(n, t`The state $|${n}\rangle$ in its well. The total energy line is fixed; how it splits between kinetic and potential is the question.`, { hw }),
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [
            { value: (n + 0.5) * hw, feedback: t`That is the whole energy $E_${n}$. The potential energy is on average half of it.` },
            { value: 0.5 * n * hw || NaN, feedback: t`Include the zero-point half quantum: $E_n = (n + \tfrac12)\hbar\omega$.` },
          ].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$\langle x^2\rangle = (n + \tfrac12)\hbar/m\omega$.`, t`$\langle V\rangle = \tfrac12m\omega^2(n + \tfrac12)\tfrac{\hbar}{m\omega} = \tfrac12(n + \tfrac12)\hbar\omega$.`],
          teach: t`In every oscillator eigenstate the energy splits evenly: $\langle T\rangle = \langle V\rangle = \tfrac12E_n$ (the virial theorem).`,
          explain: t`$\langle V\rangle = \tfrac12(${n} + \tfrac12)(${hw}) = ${fmt(ans, 4)}$ eV, exactly half of $E_${n}$. The kinetic energy takes the other half — the same split a classical oscillator has on time average.`,
        };
      },
    }),
    order({
      id: 'ladder-steps', difficulty: 2,
      prompt: t`Put the steps of the algebraic solution in order.`,
      items: [
        t`Factor: $\hat H = \hbar\omega(\hat a^\dagger\hat a + \tfrac12)$.`,
        t`Compute $[\hat a, \hat a^\dagger] = 1$ from $[\hat x, \hat p] = i\hbar$.`,
        t`Show $\hat a^\dagger$ raises $n$ by 1 and $\hat a$ lowers it.`,
        t`Use $\|\hat a|n\rangle\|^2 = n \ge 0$: the ladder must end at $\hat a|0\rangle = 0$.`,
        t`Solve $\hat a\psi_0 = 0$ for the Gaussian and build $|n\rangle = (\hat a^\dagger)^n|0\rangle/\sqrt{n!}$.`,
      ],
      visual: ladderPic({ top: 5, hi: 0, arrows: [{ from: 0, to: 1, x: -0.15 }, { from: 1, to: 2, x: -0.15 }, { from: 2, to: 3, x: -0.15 }], caption: 'Build the whole ladder from the bottom rung with a†.' }),
      hints: ['You need the commutator before you can say what a† does to an eigenstate.', 'The bottom rung is found before the higher states are built from it.'],
      teach: 'Factor the Hamiltonian, use the commutator to show the operators step the spectrum, find the bottom, and build upward.',
      explain: t`Factor → commutator → stepping → the bottom from positivity → the ground state, then everything else by $\hat a^\dagger$. No differential equation beyond the first-order $\hat a\psi_0 = 0$.`,
    }),
    mcq({
      id: 'zero-energy', difficulty: 2, kind: 'error',
      prompt: t`A student argues: “The ground state satisfies $\hat a|0\rangle = 0$. So $\hat H|0\rangle = \hbar\omega\,\hat a^\dagger\hat a|0\rangle = 0$, and the ground-state energy is zero.” Where is the error?`,
      visual: oscPic(0, 'The ground state in its well: the level sits above the bottom of the parabola.'),
      choices: [
        t`$\hat H = \hbar\omega(\hat a^\dagger\hat a + \tfrac12)$: the $\tfrac12$ from the commutator gives $E_0 = \tfrac12\hbar\omega$`,
        t`$\hat a|0\rangle$ is $|{-1}\rangle$, not 0`,
        t`$\hat a^\dagger\hat a|0\rangle = |0\rangle$, so $E_0 = \hbar\omega$`,
        'Nothing; the ground state of the quantum oscillator has zero energy, like a classical one at rest',
      ],
      answer: 0,
      why: {
        1: t`There is no rung below 0: $\hat a|0\rangle$ is the zero vector, which is why the ladder stops.`,
        2: t`$\hat a^\dagger\hat a|0\rangle = \hat a^\dagger(0) = 0$; the energy comes from the $\tfrac12$.`,
        3: t`A state with zero energy would need $x = 0$ and $p = 0$ at once, which the uncertainty principle forbids.`,
      },
      hints: [t`Multiply out $\hat a^\dagger\hat a$ again: what is left over from $[\hat x, \hat p]$?`],
      teach: t`The commutator leaves $\tfrac12\hbar\omega$ behind when $\hat H$ is factored: that is the zero-point energy.`,
      explain: t`$\hat a^\dagger\hat a = \hat H/\hbar\omega - \tfrac12$, so $\hat H|0\rangle = \hbar\omega(0 + \tfrac12)|0\rangle$. The half quantum is real: it shows up in the specific heat of solids, the Casimir force and the isotope shifts of molecular energies.`,
    }),
    num({
      id: 'zero-point', difficulty: 3,
      gen(r) {
        const M = r.pick([MOL.CO, MOL.HCl, MOL.H2]);
        const ans = zp(M);
        return {
          prompt: t`The vibration of ${M.name} is close to a harmonic oscillator of reduced mass $\mu = ${fmt(M.mu / U, 6)}$ u and wavenumber $\tilde\nu = ${M.nu}\ \text{cm}^{-1}$ (so $\omega = 2\pi c\tilde\nu$). In its ground state, what is the spread $\sigma_x = \sqrt{\langle x^2\rangle} = \sqrt{\hbar/2\mu\omega}$ of its bond length, in pm? ($1\ \text{u} = ${fmt(U * 1e27, 9)}\times10^{-27}$ kg.)`,
          visual: { type: 'graph', params: { x: [-4, 4], y: [0, 1.15], aspect: 'wide', xlabel: 'bond stretch x / σₓ', ylabel: '|ψ₀|² (scaled)', xticks: 8, yticks: 0, axesAt: 'edge', curves: [{ fn: 'exp(-x^2/2)', color: 'accent', width: 2.4 }], shade: [{ fn: 'exp(-x^2/2)', from: -1, to: 1, color: 'gold', alpha: 0.4 }] }, caption: 'The ground state’s Gaussian spread of bond lengths, ±σₓ shaded. Real bonds are slightly anharmonic.' },
          answer: ans, units: 'pm', tol: { rel: 0.005 },
          errors: [
            { value: ans * Math.SQRT2, feedback: t`$\langle x^2\rangle = \hbar/2\mu\omega$ in the ground state; you used $\hbar/\mu\omega$.` },
            { value: ans * Math.sqrt(2 * Math.PI), feedback: t`$\omega = 2\pi c\tilde\nu$ is an angular frequency: include the $2\pi$.` },
            { value: ans / 10, feedback: t`Convert the wavenumber to m⁻¹: $1\ \text{cm}^{-1} = 100\ \text{m}^{-1}$.` },
          ],
          hints: [t`$\omega = 2\pi c\tilde\nu$ with $\tilde\nu$ in m⁻¹: $${M.nu}\ \text{cm}^{-1} = ${M.nu * 100}\ \text{m}^{-1}$.`, t`$\sigma_x = \sqrt{\hbar/(2\mu\omega)}$ with $\hbar = ${fmt(HBAR * 1e34, 6)}\times10^{-34}$ J s.`],
          teach: t`Even at absolute zero a bond vibrates: its length spreads by $\sqrt{\hbar/2\mu\omega}$.`,
          explain: t`$\omega = ${fmt(2 * Math.PI * C * M.nu * 100 / 1e14, 4)}\times10^{14}$ rad/s, so $\sigma_x = ${fmt(ans, 3)}$ pm — about $${fmt((100 * ans) / M.bond, 2)}$% of the ${M.bond} pm bond length. The wavenumber used is the observed $0 \to 1$ band, which includes a little anharmonicity, so this is good to a few per cent.`,
        };
      },
    }),
    code({
      id: 'ladder-matrix', difficulty: 3,
      prompt: t`Ladder operators as matrices. In the basis $|0\rangle, \dots, |N-1\rangle$, \`lowering(N)\` should return the $N\times N$ matrix of $\hat a$, whose only nonzero entries are $\langle n-1|\hat a|n\rangle = \sqrt n$ just above the diagonal (\`np.diag(values, 1)\` puts values there). Then \`hamiltonian(N)\` returns $\hat a^\dagger\hat a + \tfrac12$ (units of $\hbar\omega$), and \`x_matrix(N)\` returns $(\hat a + \hat a^\dagger)/\sqrt2$ (units of $\sqrt{\hbar/m\omega}$).`,
      starter: t`import numpy as np

def lowering(N):
    pass

def hamiltonian(N):
    pass

def x_matrix(N):
    pass

a = lowering(4)
print(a)
print(a @ a.T - a.T @ a)
`,
      answer: t`import numpy as np

def lowering(N):
    return np.diag(np.sqrt(np.arange(1, N)), 1)

def hamiltonian(N):
    a = lowering(N)
    return a.T @ a + 0.5 * np.eye(N)

def x_matrix(N):
    a = lowering(N)
    return (a + a.T) / np.sqrt(2)

a = lowering(4)
print(a)
print(a @ a.T - a.T @ a)`,
      tests: [
        { name: t`$\hat a|3\rangle = \sqrt3\,|2\rangle$`, code: 'abs(lowering(5)[2, 3] - np.sqrt(3)) < 1e-12' },
        { name: t`$[\hat a, \hat a^\dagger] = 1$ except in the last row, where the cut-off basis shows`, code: 'np.allclose(np.diag((lowering(6) @ lowering(6).T - lowering(6).T @ lowering(6)))[:-1], 1)' },
        { name: t`the energies are $0.5, 1.5, 2.5, \dots$`, code: 'np.allclose(np.linalg.eigvalsh(hamiltonian(8)), np.arange(8) + 0.5)' },
        { name: t`$\langle x^2\rangle$ in $|3\rangle$ is $3.5$`, code: 'abs((x_matrix(10) @ x_matrix(10))[3, 3] - 3.5) < 1e-12' },
        { name: t`$\hat x$ connects $|3\rangle$ only to $|2\rangle$ and $|4\rangle$`, code: 'np.count_nonzero(np.abs(x_matrix(10)[3]) > 1e-12) == 2' },
      ],
      hints: ['`np.sqrt(np.arange(1, N))` gives √1 … √(N−1); `np.diag(v, 1)` places them one step above the diagonal.', 'The raising operator is the transpose of the lowering one (its entries are real).'],
      teach: 'In the number basis the ladder operators are simple matrices, and every oscillator matrix element follows from them.',
      explain: t`$\hat a$ has $\sqrt1, \sqrt2, \dots$ above the diagonal. $\hat a\hat a^\dagger - \hat a^\dagger\hat a$ is the identity except for its last entry, $-(N-1)$: a finite matrix cannot satisfy $[\hat a, \hat a^\dagger] = 1$ exactly (the trace of a commutator is zero), which is one reason the oscillator needs an infinite-dimensional space.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-product', difficulty: 3,
      gen(r) {
        const n = r.int(1, 6);
        const ans = n + 0.5;
        return {
          prompt: t`In the oscillator state $|${n}\rangle$, $\langle x\rangle = \langle p\rangle = 0$, $\langle x^2\rangle = (n + \tfrac12)\tfrac{\hbar}{m\omega}$ and, by the same algebra with $\hat p = i\sqrt{\hbar m\omega/2}\,(\hat a^\dagger - \hat a)$, $\langle p^2\rangle = (n + \tfrac12)\hbar m\omega$. Find $\sigma_x\sigma_p$ in units of $\hbar$.`,
          visual: oscPic(n, t`The state $|${n}\rangle$: wider than the ground state, with more nodes.`),
          answer: ans, tol: { rel: 0.002 },
          errors: [
            { value: 0.5, feedback: t`Only $|0\rangle$ sits on the bound $\hbar/2$; excited states lie above it.` },
            { value: ans * ans, feedback: t`Take the square root of $\langle x^2\rangle\langle p^2\rangle$.` },
          ],
          hints: [t`$\sigma_x^2 = \langle x^2\rangle$ and $\sigma_p^2 = \langle p^2\rangle$ because the means vanish.`, t`$\sigma_x\sigma_p = \sqrt{(n + \tfrac12)^2\hbar^2}$.`],
          teach: t`In $|n\rangle$, $\sigma_x\sigma_p = (n + \tfrac12)\hbar$: only the ground state is a minimum-uncertainty state.`,
          explain: t`$\sigma_x\sigma_p = (${n} + \tfrac12)\hbar = ${ans}\,\hbar$, ${2 * n + 1} times the minimum $\hbar/2$.`,
        };
      },
    }),
    mcq({
      id: 'cp-selection', difficulty: 3,
      prompt: t`Light drives a molecule’s vibration through its dipole moment, which is proportional to the stretch $\hat x = \sqrt{\hbar/2\mu\omega}\,(\hat a + \hat a^\dagger)$. In the harmonic approximation, which transitions can a single photon drive?`,
      visual: ladderPic({ top: 4, arrows: [{ from: 0, to: 1, x: -0.4, label: '?' }, { from: 0, to: 2, x: 0, label: '?' }, { from: 1, to: 2, x: 0.4, label: '?' }], caption: 'Candidate transitions up the ladder.' }),
      choices: [
        t`Only $\Delta n = \pm1$, so every absorption line of the ladder is at the same frequency $\omega$`,
        t`Any $\Delta n$, each at frequency $\Delta n\,\omega$`,
        t`Only $0 \to 1$; higher rungs cannot absorb`,
        t`Only $\Delta n = \pm2$, because the energy is quadratic in $x$`,
      ],
      answer: 0,
      why: {
        1: t`$\langle m|(\hat a + \hat a^\dagger)|n\rangle$ is zero unless $m = n \pm 1$: a $0 \to 2$ overtone needs anharmonicity (it is seen, but about a hundred times weaker in CO).`,
        2: t`$\langle n + 1|\hat a^\dagger|n\rangle = \sqrt{n+1} \neq 0$ for every $n$: hot molecules absorb from upper rungs too, at the same $\omega$.`,
        3: t`$\Delta n = \pm2$ comes from $\hat x^2$, which governs Raman-type processes, not single-photon dipole absorption.`,
      },
      hints: [t`Which $\langle m|$ give a nonzero $\langle m|\hat a|n\rangle$ or $\langle m|\hat a^\dagger|n\rangle$?`, t`$\hat a|n\rangle \propto |n-1\rangle$ and $\hat a^\dagger|n\rangle \propto |n+1\rangle$, and different rungs are orthogonal.`],
      teach: t`Because $\hat x \propto \hat a + \hat a^\dagger$, dipole transitions of a harmonic oscillator obey $\Delta n = \pm1$.`,
      explain: t`$\hat a$ lowers by one and $\hat a^\dagger$ raises by one, so $\langle m|\hat x|n\rangle = \sqrt{\tfrac{\hbar}{2\mu\omega}}\big(\sqrt n\,\delta_{m,n-1} + \sqrt{n+1}\,\delta_{m,n+1}\big)$. All allowed lines sit at $\omega$, which is why an infrared spectrum shows one strong band per vibration.`,
    }),
    num({
      id: 'cp-plume', difficulty: 2, transfer: true,
      gen(r) {
        const [M, why] = r.pick([[MOL.CO, 'from incomplete combustion in a kerosene or methane engine'], [MOL.HCl, 'from the ammonium-perchlorate oxidizer of a solid rocket motor']]);
        const ans = 1e4 / M.nu;
        return {
          prompt: t`Infrared sensors that track rocket launches look for the light emitted by hot molecules in the exhaust plume. One emitter is ${M.name}, ${why}. Its vibration is nearly harmonic with fundamental wavenumber $${M.nu}\ \text{cm}^{-1}$, and the $\Delta n = \pm1$ rule means that every rung of its ladder emits near this one frequency. At what wavelength, in μm?`,
          visual: ladderPic({ top: 4, arrows: [{ from: 1, to: 0, x: -0.3, color: 'bad' }, { from: 2, to: 1, x: -0.1, color: 'bad' }, { from: 3, to: 2, x: 0.1, color: 'bad' }, { from: 4, to: 3, x: 0.3, color: 'bad' }], caption: 'Hot molecules fill many rungs; each Δn = −1 step emits one photon of energy ħω. Real bonds are slightly anharmonic, so the upper steps emit at slightly longer wavelengths.' }),
          answer: ans, units: 'μm', tol: { rel: 0.005 },
          errors: [{ value: ans / 2, feedback: t`One rung is one quantum $\hbar\omega$; $\lambda = 1/\tilde\nu$.` }, { value: 2 * Math.PI * ans, feedback: t`A wavenumber in cm⁻¹ is $1/\lambda$ directly; no $2\pi$.` }],
          hints: [t`$\lambda = 1/\tilde\nu$.`, t`$1/(${M.nu}\ \text{cm}^{-1}) = ${tex(1 / M.nu, 4)}$ cm; convert to μm.`],
          teach: t`Every $\Delta n = 1$ step of a harmonic ladder emits the same photon, so a molecule has one characteristic infrared band.`,
          explain: t`$\lambda = 10^4/${M.nu}\ \mu\text{m} = ${fmt(ans, 4)}\ \mu\text{m}$, in the mid-infrared. Anharmonicity spreads the hot rungs’ lines a little to the long side, broadening the band, but the ladder picture explains why a plume glows in a few narrow bands.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §2.3', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'NIST Chemistry WebBook: carbon monoxide and hydrogen chloride vibrational data', url: 'https://webbook.nist.gov/chemistry/' },
  ],
});
