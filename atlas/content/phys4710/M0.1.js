// Where exact solutions stop (bridge into PHYS 4710). The exactly solvable
// list — box, oscillator, hydrogen, free particle — ends as soon as two
// electrons repel: helium's 1/r₁₂ term couples the coordinates. Two-particle
// states live in the tensor product of one-particle spaces (dimensions
// multiply). The toolkit: perturbation theory (a small parameter), the
// variational principle (an upper bound on the ground state), WKB (slowly
// varying potentials), and numerical diagonalization. Explore: the anharmonic
// oscillator p²/2 + x²/2 + λx⁴ — its exact ground energy (diagonalized here
// in the oscillator basis) against perturbation theory to fourth order
// (Bender & Wu's coefficients ½, ¾, −21/8, 333/16, −30885/128: an asymptotic
// series that diverges for every λ) and a Gaussian variational bound. Worked
// example: the quartic correction to an atom's ground state in an optical
// lattice, −E_R/4 whatever the depth, checked against the exact band bottom
// (plane-wave diagonalization). CODATA 2022; AME2020 masses.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H, HBAR, QE, RYD, A0, r6, seg, label, eigSym, anharmonicE0, goldenMin, HE, LIP_TOTAL } from './_q2.js';

const t = String.raw;
const U = 1.66053906892e-27;                       // kg, atomic mass unit (CODATA 2022)
const PT = [0.5, 0.75, -21 / 8, 333 / 16, -30885 / 128];
const ptE = (l, ord) => PT.slice(0, ord + 1).reduce((s, c, k) => s + c * l ** k, 0);
const varE = (l) => goldenMin((b) => b / 2 + 1 / (8 * b) + (3 * l) / (16 * b * b), 0.2, 3)[1];
const LS = Array.from({ length: 21 }, (_, i) => i * 0.025);
const EX = LS.map((l) => anharmonicE0(l));
const VA = LS.map(varE);
const poly = (ys, color, width = 2.6, dash) => ys.slice(1).map((y, i) => seg(LS[i], ys[i], LS[i + 1], y, color, width, dash));

/** The lattice band bottom E₀/E_R for depth V₀ (in E_R): plane waves e^{2inkx}, n = −20…20. */
function latticeE0(V0) {
  const N = 41, M = [];
  for (let i = 0; i < N; i++) M.push(Array.from({ length: N }, (_, j) => (i === j ? 4 * (i - 20) ** 2 + V0 / 2 : Math.abs(i - j) === 1 ? -V0 / 4 : 0)));
  return eigSym(M)[0];
}
const V0X = 20, EXL = latticeE0(V0X);
const ATOMS = [
  { name: 'rubidium-87', m: 86.909180531, lam: 1064 },
  { name: 'strontium-88', m: 87.905612253, lam: 813.4 },
  { name: 'lithium-6', m: 6.0151228874, lam: 1064 },
  { name: 'potassium-40', m: 39.963998166, lam: 1064 },
];
const recoilHz = (a) => H / (2 * a.m * U * (a.lam * 1e-9) ** 2);     // E_R/h = h/(2mλ²)
const RB = recoilHz(ATOMS[0]);

/** The lattice potential V₀ sin²(kx) and its harmonic approximation, x in lattice periods. */
const latticePic = (V0, caption, quartic = false) => ({
  type: 'graph',
  params: {
    x: [-0.75, 0.75], y: [-1, r6(V0 * 1.25)], aspect: 'wide', xlabel: 'x / (λ/2)', ylabel: 'V / Eᵣ', xticks: 6, yticks: 4, axesAt: 'edge',
    curves: [
      { fn: `${V0}*sin(pi*x)^2`, color: 'accent', width: 2.6, label: 'V₀ sin²kx', labelAt: 0.5, labelDy: -14 },
      { fn: `${V0}*(pi*x)^2`, color: 'ink3', width: 1.8, dash: [6, 4], label: 'harmonic', labelAt: 0.3, labelDx: 10 },
      ...(quartic ? [{ fn: `${V0}*((pi*x)^2 - (pi*x)^4/3)`, color: 'gold', width: 2, dash: [2, 4], label: 'with x⁴ term', labelAt: -0.4, labelDx: -60, labelDy: -14 }] : []),
    ],
  },
  caption,
});

export default lesson({
  id: 'phys4710.M0.1',
  title: 'Where exact solutions stop',
  minutes: 14, difficulty: 2,
  intro: t`Quantum Mechanics I solved a short list exactly: the infinite well, the harmonic oscillator, the free particle and hydrogen. Add **one more electron** and the list ends. Helium’s Hamiltonian is two hydrogen-like pieces plus a repulsion that depends on both positions at once:

$$\begin{gathered} \hat H = \hat H_0 + \hat H' \\ \hat H_0 = \sum_{i=1}^{2}\Big(-\frac{\hbar^2}{2m_e}\nabla_i^2 - \frac{2e^2}{4\pi\epsilon_0 r_i}\Big) \\ \hat H' = \frac{e^2}{4\pi\epsilon_0|\vec r_1 - \vec r_2|} \end{gathered}$$

Without $\hat H'$ the equation separates and the answer is a product of hydrogen orbitals. With it, nothing separates, and no closed form exists. This course is about what to do then: find a **small parameter** and expand (perturbation theory), bound the ground state from above (the variational principle), use a slowly varying potential (WKB), or diagonalize a matrix on a computer — and in every case, **check the approximation against something you trust**.`,
  symbols: [
    { tex: '\\hat H_0', text: 'the part of the Hamiltonian we can solve exactly: here two independent electrons, each bound to a nucleus of charge 2e' },
    { tex: '\\hat H\'', text: 'the rest — here the electrons’ mutual repulsion, which couples their coordinates' },
    { tex: '\\nabla_i^2', text: t`the Laplacian acting on electron $i$’s coordinates only, $\vec r_i$` },
    { tex: 'r_i', text: t`electron $i$’s distance from the nucleus, in m` },
    { tex: '|\\vec r_1 - \\vec r_2|', text: t`the distance between the two electrons, often written $r_{12}$` },
    { tex: 'm_e,\\ e,\\ \\epsilon_0', text: 'the electron’s mass, the elementary charge, and the vacuum permittivity' },
  ],
  why: 'Almost every real quantum system — atoms beyond hydrogen, molecules, solids, nuclei, atoms in traps — is solved approximately; knowing which approximation applies, and how wrong it is, is the working physicist’s skill.',
  visual: {
    type: 'graph',
    title: 'An anharmonic oscillator, three ways',
    lead: t`The ground-state energy of $\hat H = \tfrac12\hat p^2 + \tfrac12\hat x^2 + \lambda\hat x^4$ (units $\hbar = m = \omega = 1$) against the strength $\lambda$ of the quartic term. Gold: the exact answer, from a 60-state matrix diagonalization. Green: the best Gaussian trial function. The other curves are perturbation theory, $E = \tfrac12 + \tfrac34\lambda - \tfrac{21}{8}\lambda^2 + \dots$, truncated at the order you choose.`,
    tasks: [
      'At first order the straight line is fine below λ ≈ 0.05 and then runs high. Add the second order: better for small λ, but it turns down and falls below the exact curve.',
      'Go to fourth order: the curve leaves even sooner. The coefficients grow factorially, so the series diverges for every λ > 0 — it is asymptotic, useful only at small λ and low order.',
      'The green variational curve never falls below gold, at any λ: it is an upper bound, as module M4 proves.',
    ],
    params: {
      x: [0, 0.5], y: [0.45, 1.0], aspect: 'wide', xlabel: 'λ (quartic strength)', ylabel: 'E₀ / ħω', xticks: 5, yticks: 5, axesAt: 'edge',
      choices: [{ key: 'ord', label: 'Perturbation theory to order', options: [[1, 'first'], [2, 'second'], [3, 'third'], [4, 'fourth']], value: 1, explain: 'How many terms of the series in powers of λ to keep.' }],
      curves: [
        ...poly(EX, 'gold', 3.2),
        ...poly(VA, 'good', 2, [6, 4]),
        { fn: '0.5 + 0.75*x', color: 'accent', width: 2, when: 'step(1.5 - ord)' },
        { fn: '0.5 + 0.75*x - 2.625*x^2', color: 'violet', width: 2, when: 'step(0.5 - abs(ord - 2))' },
        { fn: '0.5 + 0.75*x - 2.625*x^2 + 20.8125*x^3', color: 'warn', width: 2, when: 'step(0.5 - abs(ord - 3))' },
        { fn: '0.5 + 0.75*x - 2.625*x^2 + 20.8125*x^3 - 241.2890625*x^4', color: 'bad', width: 2, when: 'step(ord - 3.5)' },
      ],
      legend: [{ label: 'exact (numerical)', color: 'gold' }, { label: 'Gaussian variational', color: 'good', dash: [6, 4] }, { label: 'perturbation series', color: 'accent' }],
      legendAt: 'tl',
    },
    caption: 'Exact: the lowest eigenvalue of H in the first 60 oscillator states (converged to better than 10⁻⁸ here). Variational: $\\psi \\propto e^{-bx^2}$ with b chosen to minimise ⟨H⟩. Perturbation coefficients from Bender & Wu (1969). Dimensionless units.',
  },
  example: {
    prompt: t`An ultracold $^{87}$Rb atom sits in one well of an optical lattice, $V(x) = V_0\sin^2 kx$, made by a $1064$ nm laser ($k = 2\pi/\lambda$), with depth $V_0 = ${V0X}E_R$, where $E_R = \hbar^2k^2/2m$ is the recoil energy. Treat each well as a harmonic oscillator plus a small quartic correction. Find the ground-state energy to first order, judge the small parameter, and compare with the exact answer.`,
    visual: latticePic(V0X, t`One lattice well (blue), its harmonic approximation (dashed) and the harmonic potential with the first correction, $-V_0k^4x^4/3$ (gold dots). Energies in recoil units.`, true),
    steps: [
      { label: 'Expand the well', text: t`$\sin^2 kx = k^2x^2 - \tfrac13k^4x^4 + \dots$, so $V \approx V_0k^2x^2 - \tfrac13V_0k^4x^4$. The quadratic term is an oscillator with $\tfrac12m\omega^2 = V_0k^2$, which gives $\hbar\omega = 2\sqrt{V_0E_R}$.` },
      { label: 'Zeroth order', text: t`At $V_0 = ${V0X}E_R$: $\hbar\omega = 2\sqrt{${V0X}}\,E_R = ${fmt(2 * Math.sqrt(V0X), 4)}E_R$, so $E_0^{(0)} = \tfrac12\hbar\omega = ${fmt(Math.sqrt(V0X), 4)}E_R$.` },
      { label: 'First order', text: t`The correction is the expectation value of the quartic term in the oscillator ground state, where $\langle x^4\rangle = 3\big(\hbar/2m\omega\big)^2$: $E^{(1)} = -\tfrac13V_0k^4\cdot3\Big(\dfrac{\hbar}{2m\omega}\Big)^2 = -\dfrac{\hbar^2k^2}{8m} = -\tfrac14E_R$ — the same at every depth.` },
      { label: 'Small parameter', text: t`The correction compared with the level spacing is $\tfrac14E_R/\hbar\omega = 1/\bigl(8\sqrt{V_0/E_R}\bigr) = ${fmt(1 / (8 * Math.sqrt(V0X)), 3)}$: small, so first order should be good. In a shallow lattice ($V_0 \approx E_R$) it is not small, and the harmonic picture fails.` },
      { label: 'Exact check', text: t`Diagonalizing the Hamiltonian in plane waves $e^{2inkx}$ ($n = -20\dots20$) gives the bottom of the lowest band, $E_0 = ${fmt(EXL, 5)}E_R$. First order gives $${fmt(Math.sqrt(V0X) - 0.25, 5)}E_R$: off by $${fmt(Math.sqrt(V0X) - 0.25 - EXL, 2)}E_R$, against $${fmt(Math.sqrt(V0X) - EXL, 2)}E_R$ for the bare oscillator.` },
      { label: 'Real numbers', text: t`For $^{87}$Rb at $1064$ nm, $E_R/h = h/2m\lambda^2 = ${fmt(RB, 4)}$ Hz, so the quartic correction lowers the ground state by $${fmt(RB / 4, 3)}$ Hz $\times h$ — and the level spacing is $${fmt((2 * Math.sqrt(V0X) * RB) / 1e3, 3)}$ kHz $\times h$.` },
    ],
    answer: t`$E_0 \approx 2\sqrt{V_0E_R}/2 - E_R/4 = ${fmt(Math.sqrt(V0X) - 0.25, 4)}E_R$, against the exact $${fmt(EXL, 4)}E_R$; the small parameter is $1/(8\sqrt{V_0/E_R}) \approx ${fmt(1 / (8 * Math.sqrt(V0X)), 2)}$.`,
  },
  practice: [
    mcq({
      id: 'which-exact', difficulty: 1,
      prompt: t`Which of these has energy levels known in closed form?`,
      visual: {
        type: 'graph',
        params: {
          x: [-2.4, 2.4], y: [-1.2, 1.3], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [seg(0, 0, -1.4, 0.7, 'ink3', 1.6, [4, 4]), seg(0, 0, 1.2, 0.9, 'ink3', 1.6, [4, 4]), seg(-1.4, 0.7, 1.2, 0.9, 'warn', 1.6, [4, 4])],
          points: [{ x: 0, y: 0, r: 9, color: 'bad', label: '+2e', labelDx: 10, labelDy: 14 }, { x: -1.4, y: 0.7, r: 6, color: 'accent', label: 'e⁻ 1', labelDx: -14, labelDy: -12 }, { x: 1.2, y: 0.9, r: 6, color: 'accent', label: 'e⁻ 2', labelDx: 6, labelDy: -12 },
            label(-0.75, 0.2, 'r₁', 'ink3', -14, 6), label(0.65, 0.3, 'r₂', 'ink3', 8, 8), label(-0.1, 0.8, 'r₁₂', 'warn', 0, -12, 'center')],
        },
        caption: 'Helium: a nucleus of charge +2e and two electrons. Not to scale.',
      },
      choices: [t`A hydrogen-like ion such as He$^+$ (one electron, nucleus of charge $Ze$)`, t`The helium atom`, t`An oscillator with a small $x^4$ term added`, t`A hydrogen atom in a uniform electric field`],
      answer: 0,
      why: {
        1: t`The repulsion $e^2/4\pi\epsilon_0r_{12}$ couples the two electrons; the Schrödinger equation does not separate and has no closed-form solution.`,
        2: t`The quartic term breaks the ladder-operator algebra; its energies come from series or numerics, as in the Explore picture.`,
        3: t`The field adds $eEz$, which spoils the spherical symmetry (and, strictly, makes every level a resonance that can ionize). It is treated by perturbation theory — module M3.`,
      },
      hints: [t`Count the bodies and the symmetry. One particle in a central $1/r$ potential is the case solved in QM I.`],
      teach: 'Closed forms exist only for a handful of one-body problems with high symmetry; one extra interaction ends them.',
      explain: t`He$^+$ is hydrogen with $e^2 \to Ze^2$: $E_n = -Z^2\,(13.6\ \text{eV})/n^2$ (with its reduced mass). Everything else on the list needs an approximation. The picture shows why helium does: $r_{12}$ involves both electrons at once.`,
    }),
    num({
      id: 'tensor-dim', difficulty: 1,
      gen(r) {
        const [n1, d1] = r.pick([['a spin-½ particle', 2], ['a spin-1 particle', 3], ['a particle in the four lowest states of a well', 4], ['a spin-3/2 nucleus', 4]]);
        const [n2, d2] = r.pick([['a spin-½ particle', 2], ['a spin-1 particle', 3], ['a three-level atom', 3], ['a particle in the five lowest states of a well', 5]]);
        const ans = d1 * d2;
        return {
          prompt: t`System 1 is ${n1} (${d1} basis states); system 2 is ${n2} (${d2} basis states). How many basis states does the combined two-particle system have?`,
          visual: { type: 'graph', params: { x: [0, d2 + 1], y: [0, d1 + 1], aspect: 'wide', xlabel: 'state of system 2', ylabel: 'state of system 1', xticks: d2 + 1, yticks: d1 + 1, axesAt: 'edge', points: Array.from({ length: d1 * d2 }, (_, k) => ({ x: (k % d2) + 1, y: Math.floor(k / d2) + 1, r: 5, color: 'accent' })) }, caption: 'Each dot is a product basis state |i⟩|j⟩: one state of system 1 paired with one of system 2.' },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: d1 + d2, feedback: t`Dimensions multiply in a tensor product: every state of system 1 pairs with every state of system 2. Adding them would be a direct sum — one system that is *either* 1 *or* 2.` }].filter((e) => e.value !== ans),
          hints: [t`A basis of the pair is $|i\rangle_1|j\rangle_2$ for every $i$ and every $j$.`],
          teach: 'Two-particle states live in the tensor product of the one-particle spaces, whose dimension is the product of the two dimensions.',
          explain: t`$${d1}\times${d2} = ${ans}$ product states $|i\rangle|j\rangle$, and general states are superpositions of them — including entangled ones that are not products. This multiplication is why many-particle problems get large fast: 50 spins ½ need $2^{50} \approx 10^{15}$ amplitudes.`,
        };
      },
    }),
    num({
      id: 'first-order-x4', difficulty: 2,
      gen(r) {
        const l = r.pick([0.01, 0.02, 0.03, 0.04, 0.05]);
        const ans = 0.5 + 0.75 * l;
        return {
          prompt: t`For $\hat H = \tfrac12\hat p^2 + \tfrac12\hat x^2 + \lambda\hat x^4$ (units $\hbar = m = \omega = 1$) with $\lambda = ${l}$, use first-order perturbation theory, $E_0 \approx E_0^{(0)} + \lambda\langle0|\hat x^4|0\rangle$, with $\langle0|\hat x^4|0\rangle = \tfrac34$ in these units. What is the ground-state energy, in units of $\hbar\omega$? Give four significant figures.`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [0, 3], aspect: 'wide', xlabel: 'x', ylabel: 'V(x)', xticks: 6, yticks: 3, axesAt: 'edge', curves: [{ fn: '0.5*x^2', color: 'ink3', width: 1.8, dash: [6, 4] }, { fn: `0.5*x^2 + ${l}*x^4`, color: 'accent', width: 2.6 }, { fn: `0.5*exp(-x^2)/1.3 + 0.5`, color: 'gold', width: 2 }], hlines: [{ y: 0.5, color: 'gold' }] }, caption: 'The oscillator (dashed), the oscillator with the quartic term (blue), and the unperturbed ground state drawn at its energy ½ (gold, height not to scale).' },
          answer: ans, tol: { rel: 0.0005 },
          errors: [{ value: 0.5 + l, feedback: t`$\langle x^4\rangle$ in the ground state is $\tfrac34$, not 1: $\langle x^4\rangle = 3\langle x^2\rangle^2$ for a Gaussian, with $\langle x^2\rangle = \tfrac12$.` }, { value: 0.75 * l, feedback: 'That is only the correction; add the unperturbed energy ½.' }],
          hints: [t`$E_0^{(0)} = \tfrac12$.`, t`$E_0 \approx \tfrac12 + \tfrac34\lambda$.`],
          teach: 'First-order perturbation theory: the energy shift is the expectation value of the perturbation in the unperturbed state.',
          explain: t`$E_0 \approx 0.5 + 0.75\times${l} = ${fmt(ans, 5)}$; the exact value is $${fmt(anharmonicE0(l), 6)}$. First order overestimates, because the second-order correction is always negative for a ground state.`,
        };
      },
    }),
    num({
      id: 'lattice-depth', difficulty: 2,
      gen(r) {
        const p = r.pick([1, 2, 5]);
        const ans = (1 / (8 * p / 100)) ** 2;
        return {
          prompt: t`In an optical lattice the quartic correction to each well’s ground state is $-E_R/4$, while the level spacing is $\hbar\omega = 2\sqrt{V_0E_R}$. How deep must the lattice be — $V_0$ in units of $E_R$ — for the correction to be only ${p}% of $\hbar\omega$?`,
          visual: { type: 'graph', params: { x: [0, 200], y: [0, 0.2], aspect: 'wide', xlabel: 'V₀ / Eᵣ', ylabel: '(Eᵣ/4) / ħω', xticks: 4, yticks: 4, axesAt: 'edge', curves: [{ fn: '1/(8*sqrt(x))', color: 'accent', width: 2.4, domain: [0.5, 200] }], hlines: [{ y: p / 100, color: 'gold', label: `${p}%` }] }, caption: 'The size of the correction relative to the level spacing, against depth.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1 / (8 * p / 100), feedback: t`That is $\sqrt{V_0/E_R}$; square it to get the depth.` }, { value: ans / 4, feedback: t`$\hbar\omega = 2\sqrt{V_0E_R}$, so the ratio is $1/(8\sqrt{V_0/E_R})$, with an 8.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Set $\dfrac{E_R/4}{2\sqrt{V_0E_R}} = \dfrac{1}{8\sqrt{V_0/E_R}}$ equal to ${p / 100}.`, t`$\sqrt{V_0/E_R} = 1/(8\times${p / 100})$; square it.`],
          teach: 'Every approximation has a small parameter; state it, and find where it stops being small.',
          explain: t`$\sqrt{V_0/E_R} = ${fmt(1 / (8 * p / 100), 4)}$, so $V_0 = ${fmt(ans, 4)}E_R$. The correction falls only as $V_0^{-1/2}$: deep lattices are harmonic, but slowly.`,
        };
      },
    }),
    match({
      id: 'choose-method', difficulty: 2,
      prompt: t`Match each problem to the approximation that suits it best.`,
      left: [
        t`Hydrogen in a laboratory field of $10^6$ V/m, where $eEa_0 \ll 13.6$ eV`,
        t`Helium’s ground state, where the repulsion is not small but only $E_0$ is wanted`,
        t`An alpha particle tunnelling through a wide Coulomb barrier`,
        t`Fifty interacting spins on a computer, exactly`,
      ],
      right: ['perturbation theory', 'the variational principle', 'WKB', 'numerical diagonalization', 'separation of variables'],
      answer: [0, 1, 2, 3],
      hints: ['Ask of each: is there a small parameter? Is only the ground state needed? Does the potential vary slowly on the scale of a wavelength?', 'Fifty spins have 2⁵⁰ states — but numerics still beats a closed form that does not exist. Separation of variables is the exact method, available only when nothing couples the coordinates.'],
      teach: 'Choose the method by what the problem offers: a small parameter, a ground state only, a slowly varying potential, or a matrix small enough to diagonalize.',
      explain: t`Weak field → perturbation theory (module M3). No small parameter, ground state only → variational (M4). Slowly varying barrier → WKB (M5). A finite matrix → diagonalize it, as the Explore picture did; for 50 spins one uses symmetry and sparse methods, since $2^{50}$ is too many to store densely. Separation of variables is what fails in all four.`,
    }),
    num({
      id: 'stark-small', difficulty: 2,
      gen(r) {
        const E = r.pick([1e5, 1e6, 1e7, 5e7]);
        const ans = (E * A0) / RYD;    // eE a0 in eV over 13.6 eV, e cancels
        return {
          prompt: t`A hydrogen atom sits in a uniform field of $${tex(E, 2)}$ V/m. The natural small parameter is the work the field does across one Bohr radius, $eEa_0$, compared with the binding energy $13.6$ eV. What is $eEa_0/(13.6\ \text{eV})$? ($a_0 = ${fmt(A0 * 1e12, 6)}$ pm.)`,
          visual: { type: 'graph', params: { x: [-8, 8], y: [-2, 0.6], aspect: 'wide', xlabel: 'z / a₀', ylabel: 'V (hartree)', xticks: 8, yticks: 4, axesAt: 'edge', curves: [{ fn: '-1/abs(x)', color: 'ink3', width: 1.6, dash: [6, 4] }, { fn: '-1/abs(x) + 0.05*x', color: 'accent', width: 2.4 }], hlines: [{ y: -0.5, color: 'gold', label: '1s level' }] }, caption: 'The Coulomb potential along the field axis (dashed) and tilted by a uniform field (blue). The tilt is enormously exaggerated: a laboratory field tilts it by far less than a line width.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: E * A0, feedback: t`That is $eEa_0$ in eV; divide by the $13.6$ eV binding energy to get the ratio.` }],
          hints: [t`$eEa_0$ in eV is $E\times a_0$ with $E$ in V/m and $a_0$ in m.`, t`$a_0 = ${tex(A0, 6)}$ m; divide the result by $13.6$ eV.`],
          teach: 'The size of a perturbation is judged against the energy scale of the unperturbed system.',
          explain: t`$eEa_0 = ${tex(E * A0, 3)}$ eV, and the ratio is $${tex(ans, 3)}$. Even the strongest steady laboratory fields are a small perturbation to an atom — the atomic field is $e/4\pi\epsilon_0a_0^2 \approx 5\times10^{11}$ V/m — which is why the Stark effect (lesson M3.2) is a perturbation problem.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lattice-shift', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick(ATOMS.slice(1));
        const fr = recoilHz(a), ans = fr / 4;
        return {
          prompt: t`Optical lattice clocks and quantum simulators trap atoms in standing waves of light. For ${a.name} (mass $${fmt(a.m, 9)}$ u) in a lattice of wavelength $${a.lam}$ nm, the recoil energy is $E_R = \hbar^2k^2/2m = h^2/2m\lambda^2$. The quartic part of each well lowers the ground state by $E_R/4$ at first order. Express that shift as a frequency, $E_R/4h$, in Hz. ($h = ${fmt(H * 1e34, 9)}\times10^{-34}$ J s, $1\ \text{u} = ${fmt(U * 1e27, 11)}\times10^{-27}$ kg.)`,
          visual: latticePic(10, t`A lattice well and its harmonic approximation (energies in recoil units; depth $10E_R$ for illustration).`),
          answer: ans, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: fr, feedback: t`That is $E_R/h$ itself; the correction is a quarter of it.` }, { value: fr / 4 / (2 * Math.PI), feedback: t`$E_R/h = h/2m\lambda^2$ already gives ordinary frequency; do not divide by $2\pi$ again.` }],
          hints: [t`$E_R/h = h/(2m\lambda^2)$ with $m = ${fmt(a.m, 6)}\times${fmt(U * 1e27, 6)}\times10^{-27}$ kg and $\lambda = ${a.lam}\times10^{-9}$ m.`, t`Divide by 4.`],
          teach: t`The first-order quartic correction of a sinusoidal lattice is $-E_R/4$ whatever the depth.`,
          explain: t`$E_R/h = ${fmt(fr, 4)}$ Hz, so the shift is $${fmt(ans, 4)}$ Hz. Light atoms recoil hardest: lithium’s $E_R$ is over ten times rubidium’s, which is why lithium lattices must be deeper to look harmonic.`,
        };
      },
    }),
    mcq({
      id: 'cp-asymptotic', difficulty: 3,
      prompt: t`For the anharmonic oscillator at $\lambda = 0.1$, the error of perturbation theory is $${fmt(ptE(0.1, 1) - anharmonicE0(0.1), 2)}$ at first order, $${fmt(ptE(0.1, 2) - anharmonicE0(0.1), 2)}$ at second, $${fmt(ptE(0.1, 3) - anharmonicE0(0.1), 2)}$ at third and $${fmt(ptE(0.1, 4) - anharmonicE0(0.1), 2)}$ at fourth (in units of $\hbar\omega$). What does this say?`,
      visual: { type: 'graph', params: { x: [0.5, 4.5], y: [-0.03, 0.03], aspect: 'wide', xlabel: 'order of perturbation theory', ylabel: 'error in E₀ (ħω)', xticks: 4, yticks: 4, axesAt: 'edge', points: [1, 2, 3, 4].map((k) => ({ x: k, y: r6(ptE(0.1, k) - anharmonicE0(0.1)), r: 6, color: 'warn' })), hlines: [{ y: 0, color: 'ink3' }] }, caption: 'The error of each truncation at λ = 0.1, against the exact numerical energy.' },
      choices: [
        'The series is asymptotic: its terms shrink at first and then grow, so there is a best order to stop at, and more terms make it worse',
        'The exact numerical energy must be wrong, because a series always improves with more terms',
        'The series converges, but slowly; a few more terms will fix it',
        'Perturbation theory fails because λ = 0.1 is not small',
      ],
      answer: 0,
      why: {
        1: 'A diagonalization converged to 10⁻⁸ is far more trustworthy than a truncated series. A series need not improve term by term.',
        2: 'The coefficients grow like k! (Bender & Wu): the series diverges for every λ > 0. More terms eventually make it worse.',
        3: 'At low order the series does well at λ = 0.1 (first-order error under 3%). What fails is the idea of adding ever more terms.',
      },
      hints: ['Look at the size of the terms: 0.075, −0.026, +0.021, −0.024 at λ = 0.1. Are they shrinking?', 'A series whose coefficients grow factorially has zero radius of convergence but can still be a good approximation when truncated early.'],
      teach: 'Perturbation series in quantum mechanics are often asymptotic: truncate them at low order, and check against something exact.',
      explain: t`At $\lambda = 0.1$ the terms are $0.075, -0.026, +0.021, -0.024, \dots$ — they shrink up to the third and then grow. Bender and Wu proved the coefficients grow factorially, so the series has zero radius of convergence (a negative $\lambda$, however small, makes the well unbounded below). Truncated sensibly it is still excellent; that is how quantum electrodynamics’ series is used too.`,
    }),
    num({
      id: 'cp-independent', difficulty: 2,
      gen(r) {
        const [name, Z, meas] = r.pick([['helium', 2, HE.total], ['the lithium ion Li$^+$', 3, LIP_TOTAL]]);
        const ans = -2 * Z * Z * RYD;
        return {
          prompt: t`Drop the electron–electron repulsion from ${name} (nuclear charge $${Z}e$, two electrons). Each electron then sits in the hydrogen-like $1s$ state with energy $-Z^2\times${fmt(RYD, 6)}$ eV. What is the ground-state energy of this independent-electron model, in eV?`,
          visual: { type: 'graph', params: { x: [0, 3], y: [r6(ans * 1.15), 0], aspect: 'wide', xlabel: '', ylabel: 'energy (eV)', xticks: 0, yticks: 4, axesAt: 'edge', curves: [seg(0.3, -meas, 1.3, -meas, 'gold', 3)], points: [label(1.35, -meas, 'measured', 'gold', 6, 0)] }, caption: t`The measured ground-state energy (the sum of both ionization energies, NIST), to compare with your answer.` },
          answer: ans, units: 'eV', tol: { rel: 0.002 },
          errors: [{ value: -Z * Z * RYD, feedback: 'There are two electrons; each contributes its own −Z² × 13.6 eV.' }, { value: -2 * Z * RYD, feedback: 'The hydrogen-like energy scales as Z², not Z.' }],
          hints: [t`$E_0 = 2\times(-Z^2\times13.606\ \text{eV})$.`],
          teach: 'Without the repulsion, the electrons are independent and their energies add.',
          explain: t`$E_0 = -2\times${Z * Z}\times${fmt(RYD, 6)} = ${fmt(ans, 5)}$ eV, against the measured $${fmt(-meas, 5)}$ eV. The neglected repulsion is worth $${fmt(meas + ans, 3)}$ eV — ${fmt((100 * (-ans - meas)) / -ans, 2)}% of the total. Not small enough to ignore, and not small enough for comfort: lessons M4.1–M4.2 do far better with the variational principle.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §5.2 and Part II introduction', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'C. M. Bender & T. T. Wu, “Anharmonic oscillator”, Phys. Rev. 184, 1231 (1969)', url: 'https://doi.org/10.1103/PhysRev.184.1231' },
    { label: 'NIST Atomic Spectra Database: ionization energies of He and Li⁺', url: 'https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html' },
  ],
});
