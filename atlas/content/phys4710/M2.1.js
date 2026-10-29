// Translations, momentum and generators (Griffiths & Schroeter §6.1–6.2;
// Sakurai §1.6). T̂(a)ψ(x) = ψ(x − a) is Taylor's series of e^(−a d/dx), so
// T̂(a) = e^(−iap̂/ħ): momentum generates translations. Plane waves are its
// eigenstates (eigenvalue e^(−ika)); T̂†x̂T̂ = x̂ + a. A Hamiltonian that
// commutes with every T̂(a) commutes with p̂, and ⟨p⟩ is conserved — the
// quantum Noether theorem (phys3550.M4.5 is the classical one). A crystal
// commutes only with T̂(a) for lattice vectors: Bloch states, crystal momentum
// ħq conserved modulo 2πħ/a, and a ring of N atoms has N values of q.
// Time translations: Û(t) = e^(−iĤt/ħ), with energy as generator; quantum
// beats between two levels at ΔE/h. Explore: the Taylor series of the shift
// operator summed term by term on sin x + ½ sin 3x — the k = 3 part needs more
// terms, because p̂ brings down ħk. Transfer: e^(ikx̂) translates momentum —
// a photon's recoil in an atom interferometer (Rb-87 D2 at 780.241 nm, Steck).
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HB2M_EVNM2, M_RB87, RB_D2, CS_HFS, U } from '../phys4700/_qm.js';
import { H, r6, seg, label } from './_q2.js';

const t = String.raw;
const HFS_H = 1420405751.768, HFS_RB = 6834682610.904;          // Hz (hydrogen maser; Steck)
const ATOMS = [
  { name: 'rubidium-87', line: 'D2 line at $780.241$ nm', m: M_RB87, lam: RB_D2 },
  { name: 'caesium-133', line: 'D2 line at $852.347$ nm', m: 132.905451961 * U, lam: 852.34727582e-9 },
  { name: 'sodium-23', line: 'D2 line at $589.158$ nm', m: 22.9897692820 * U, lam: 589.158326e-9 },
];

/** Re ψ for a plane wave and its translate. */
const wavePic = (k, a, caption) => ({
  type: 'graph',
  params: {
    x: [0, 3], y: [-1.5, 1.5], aspect: 'wide', xlabel: 'x (nm)', ylabel: 'Re ψ', xticks: 6, yticks: 0, axesAt: 'edge',
    curves: [{ fn: `cos(${r6(k)}*x)`, color: 'accent', width: 2.2, label: 'ψ(x)', labelAt: 0.05, labelDy: -14 }, { fn: `cos(${r6(k)}*(x - ${a}))`, color: 'gold', width: 2.2, dash: [6, 4], label: 'ψ(x − a)', labelAt: r6(a + 0.05), labelDy: -14 }],
    arrows: [{ from: [0, 1.3], to: [a, 1.3], color: 'ink2', width: 1.6, label: 'a', labelDx: 4, labelDy: -2 }],
  },
  caption,
});

/** The free-electron parabola folded into −π/a < q ≤ π/a (reduced zone), in units where π/a = 1. */
const foldPic = (caption) => ({
  type: 'graph',
  params: {
    x: [-1, 1], y: [0, 9.5], aspect: 'wide', xlabel: 'crystal momentum q (units of π/a)', ylabel: 'energy (units of ħ²π²/2ma²)', xticks: 4, yticks: 3, axesAt: 'edge',
    curves: [{ fn: 'x^2', color: 'accent', width: 2.4 }, { fn: '(x - 2)^2', color: 'violet', width: 2.4 }, { fn: '(x + 2)^2', color: 'gold', width: 2.4 }],
  },
  caption,
});

export default lesson({
  id: 'phys4710.M2.1',
  title: 'Translations, momentum and generators',
  minutes: 16, difficulty: 3,
  intro: t`Shift a wave function to the right by $a$: the new one is $\psi(x - a)$. Taylor’s theorem writes that as $\sum_n \frac{(-a)^n}{n!}\psi^{(n)}(x)$, an exponential of the derivative — and since $\hat p = -i\hbar\,d/dx$,

$$\hat T(a) = e^{-ia\hat p/\hbar}$$

Momentum is the **generator** of translations: a tiny shift is $\hat T(\epsilon) \approx 1 - i\epsilon\hat p/\hbar$. If the Hamiltonian looks the same after every shift, $[\hat T(a), \hat H] = 0$, then $[\hat p, \hat H] = 0$ and momentum is conserved. This is Noether’s theorem in quantum form: **a continuous symmetry, its generator, and a conserved quantity are one fact**. The same pattern runs through this module: rotations and angular momentum (M2.2), time translations and energy.`,
  symbols: [
    { tex: '\\hat T(a)', text: t`the translation operator: $\hat T(a)\psi(x) = \psi(x - a)$, the same state moved a distance $a$ to the right` },
    { tex: 'a', text: 'the displacement, in m (or nm)' },
    { tex: '\\hat p', text: t`the momentum operator, $-i\hbar\,d/dx$ in position space` },
    { tex: '\\hbar', text: t`the reduced Planck constant: it converts $a\hat p$ (an action) into a pure number for the exponential` },
    { tex: 'e^{-ia\\hat p/\\hbar}', text: t`the operator exponential, defined by its power series $\sum_n(-ia\hat p/\hbar)^n/n!$` },
  ],
  why: 'Generators are how physics turns symmetries into conservation laws and selection rules — in quantum field theory, particle physics and general relativity, where momentum and energy generate spacetime translations.',
  visual: {
    type: 'graph',
    title: 'Building a shift from derivatives',
    lead: t`The blue curve is the Taylor series of $e^{-a\,d/dx}$ applied to $f(x) = \sin x + \tfrac12\sin3x$, summed up to $N$ terms. Dashed grey: $f(x)$. Dashed gold: the target, $f(x - a)$.`,
    tasks: [
      'With a = 1, add terms one at a time: by N ≈ 6 the sum has reached the shifted curve for the slow part, but the wiggly sin 3x part still needs several more.',
      'Each derivative of sin 3x brings down a factor 3, as p̂ brings down ħk on a plane wave: high-momentum parts of a state need more terms. The full exponential handles every k exactly.',
      'Make a = 2π: the shifted curve lands back on f, because f has period 2π. A potential with that symmetry commutes with T̂(2π) only — the start of Bloch’s theorem.',
    ],
    params: {
      x: [-6.3, 6.3], y: [-2.4, 2.4], aspect: 'wide', xlabel: 'x', ylabel: 'f', xticks: 6, yticks: 4, axesAt: 'edge',
      sliders: [
        { key: 'a', label: t`Shift $a$`, min: 0, max: 6.3, step: 0.1, value: 1, explain: 'How far to move the function to the right.' },
        { key: 'N', label: t`Terms $N$`, min: 0, max: 30, step: 1, value: 6, explain: 'The highest power of a kept in the Taylor series of the shift.' },
      ],
      curves: [
        { fn: 'sin(x) + 0.5*sin(3*x)', color: 'ink3', width: 1.6, dash: [6, 4] },
        { fn: 'sin(x - a) + 0.5*sin(3*(x - a))', color: 'gold', width: 2.4, dash: [6, 4] },
        { sum: '((-a)^k/gamma(k + 1))*(sin(x + k*pi/2) + 0.5*3^k*sin(3*x + k*pi/2))', k: [0, 'N'], color: 'accent', width: 2.6 },
      ],
      legend: [{ label: 'f(x)', color: 'ink3', dash: [6, 4] }, { label: 'f(x − a)', color: 'gold', dash: [6, 4] }, { label: 'Taylor sum', color: 'accent' }],
      legendAt: 'tr',
    },
    caption: 'Exact partial sums of Σ (−a)ⁿ/n! · dⁿf/dxⁿ. The y-range is clipped: early partial sums for large a shoot off the top.',
  },
  example: {
    prompt: t`Show that a plane wave is an eigenstate of $\hat T(a)$, find what $\hat T(a)$ does to $\hat x$, and say what is conserved for a free electron and for an electron in a crystal with lattice spacing $a = 0.4$ nm.`,
    visual: wavePic(6, 0.4, 'A plane wave (real part) and the same wave shifted by a: the shift only changes its phase.'),
    steps: [
      { label: 'Plane wave', text: t`$\hat p\,e^{ikx} = \hbar k\,e^{ikx}$, so $\hat T(a)e^{ikx} = e^{-iak}e^{ikx}$: an eigenstate with eigenvalue $e^{-ika}$, a pure phase. A state of definite momentum looks the same everywhere, so moving it changes nothing but a phase.` },
      { label: 'Moving x', text: t`$\hat T$ is unitary ($\hat T^\dagger = \hat T(-a)$), and $\hat T^\dagger(a)\,\hat x\,\hat T(a) = \hat x + a$: in the shifted state, every position measurement reads $a$ more. To first order in $a$ this is $\tfrac{i a}{\hbar}[\hat p, \hat x] = a$, from $[\hat x, \hat p] = i\hbar$.` },
      { label: 'Free particle', text: t`$\hat H = \hat p^2/2m$ commutes with $\hat p$, so $[\hat T(a), \hat H] = 0$ for every $a$, and $\tfrac{d}{dt}\langle\hat p\rangle = \tfrac{i}{\hbar}\langle[\hat H, \hat p]\rangle = 0$: momentum is conserved.` },
      { label: 'Crystal', text: t`With $V(x + a) = V(x)$, only $\hat T(a)$ and its powers commute with $\hat H$; $\hat p$ does not, since $[\hat p, V] = -i\hbar V'(x) \neq 0$. Stationary states can still be chosen as eigenstates of $\hat T(a)$: $\psi(x + a) = e^{iqa}\psi(x)$ — Bloch’s theorem.` },
      { label: 'Crystal momentum', text: t`$\hbar q$ is conserved, but only modulo $2\pi\hbar/a$, because $q$ and $q + 2\pi/a$ give the same phase $e^{iqa}$. For $a = 0.4$ nm that period, times $c$, is $hc/a = ${fmt(1239.84198 / 0.4, 4)}$ eV — the momentum a lattice can absorb in one Bragg reflection.` },
    ],
    answer: t`$\hat T(a)e^{ikx} = e^{-ika}e^{ikx}$; $\hat T^\dagger\hat x\hat T = \hat x + a$; free electron: $\hat p$ conserved; crystal: only $\hbar q$, modulo $2\pi\hbar/a$.`,
  },
  practice: [
    num({
      id: 'plane-phase', difficulty: 2,
      gen(r) {
        const E = r.pick([1, 2, 5, 10]), a = r.pick([0.1, 0.2, 0.25, 0.5]);
        const k = Math.sqrt(E / HB2M_EVNM2), ans = k * a;
        return {
          prompt: t`An electron of kinetic energy $${E}$ eV is in a plane-wave state $e^{ikx}$. Translating it by $a = ${a}$ nm multiplies it by $e^{-i\theta}$. What is $\theta = ka$, in radians? ($\hbar^2/2m_e = ${fmt(HB2M_EVNM2, 6)}$ eV nm².)`,
          visual: wavePic(k, a, 'Re ψ before (blue) and after (gold) the shift, for this electron.'),
          answer: ans, units: 'rad', tol: { rel: 0.005 },
          errors: [{ value: k * k * a, feedback: t`$\theta = ka$, with $k = \sqrt{E/(\hbar^2/2m_e)}$ — take the square root.` }, { value: ans / (2 * Math.PI), feedback: t`That is $\theta/2\pi$, the shift in wavelengths. The phase is $ka$ itself.` }],
          hints: [t`$k = \sqrt{2m_eE}/\hbar = \sqrt{E/(\hbar^2/2m_e)}$ in $\text{nm}^{-1}$.`, t`$k = ${fmt(k, 4)}\ \text{nm}^{-1}$; multiply by $a$.`],
          teach: t`A plane wave is an eigenstate of every translation, with eigenvalue $e^{-ika}$: moving a momentum eigenstate only changes its phase.`,
          explain: t`$k = ${fmt(k, 4)}\ \text{nm}^{-1}$, so $\theta = ka = ${fmt(ans, 4)}$ rad. A global phase cannot be measured — but in an interferometer, where only one path is shifted, it becomes a fringe shift.`,
        };
      },
    }),
    mcq({
      id: 'which-commute', difficulty: 2,
      prompt: t`For which potential does $\hat p$ commute with $\hat H = \hat p^2/2m + V(\hat x)$?`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [-1.5, 2.5], aspect: 'wide', xlabel: 'x', ylabel: 'V', xticks: 8, yticks: 0, axesAt: 'edge', curves: [{ fn: '1.6', color: 'accent', width: 2.4, label: 'P', labelAt: -3.6, labelDy: -12 }, { fn: '0.5*cos(3*x) - 0.6', color: 'gold', width: 2.2, label: 'Q', labelAt: -3.6, labelDy: 18 }, { fn: '0.25*x - 0.1', color: 'violet', width: 2.2, label: 'R', labelAt: 3.4, labelDy: -12 }] }, caption: 'Three potentials: P constant, Q periodic, R a uniform slope.' },
      choices: [t`Only P, the constant: $[\hat p, V] = -i\hbar V'(x)$ vanishes only when $V' = 0$ everywhere`, t`P and Q: a periodic potential is also translation invariant`, t`All three: momentum is always conserved`, t`Only R: a uniform force conserves momentum`],
      answer: 0,
      why: {
        1: t`Q is invariant only under shifts by its period, $2\pi/3$, not under every shift. Then $\hat T(2\pi/3)$ commutes with $\hat H$, but $\hat p$ — the generator of all shifts — does not.`,
        2: t`Ehrenfest: $d\langle p\rangle/dt = -\langle V'\rangle$, which is nonzero for Q and R.`,
        3: t`A uniform force changes momentum steadily: $d\langle p\rangle/dt = -V' = $ constant $\neq 0$.`,
      },
      hints: [t`Compute $[\hat p, V(\hat x)]f = -i\hbar(Vf)' + i\hbar Vf'$.`],
      teach: 'p̂ commutes with Ĥ only if V is unchanged by every translation, which means V is constant.',
      explain: t`$[\hat p, V] = -i\hbar V'$, so $\hat p$ is conserved only for constant $V$. A periodic potential keeps a discrete symmetry and conserves crystal momentum instead; the sloped potential keeps neither (it is symmetric under a shift combined with a change of energy, which is another story).`,
    }),
    expr({
      id: 'shift-x', difficulty: 3,
      prompt: t`Using $\hat T(a) = e^{-ia\hat p/\hbar}$ and $\hat T^\dagger(a) = e^{ia\hat p/\hbar}$, what is $\hat T^\dagger(a)\,\hat x\,\hat T(a)$? Write it in terms of $x$ (standing for $\hat x$) and $a$.`,
      visual: { type: 'graph', params: { x: [-3, 5], y: [0, 1.15], aspect: 'wide', xlabel: 'x', ylabel: '|ψ|²', xticks: 8, yticks: 0, axesAt: 'edge', curves: [{ fn: 'exp(-x^2)', color: 'accent', width: 2.4 }, { fn: 'exp(-(x - 2)^2)', color: 'gold', width: 2.4, dash: [6, 4] }], vlines: [{ x: 0, color: 'accent' }, { x: 2, color: 'gold' }] }, caption: 'A packet and the same packet translated by a = 2 (dashed), with their mean positions.' },
      answer: 'x + a', answerTeX: t`\hat x + a`,
      vars: { x: [-2, 2], a: [-2, 2] }, lhs: '\\hat T^\\dagger(a)\\,\\hat x\\,\\hat T(a)',
      errors: [{ answer: 'x - a', feedback: t`$\hat T(a)$ moves the state to the right, so expectation values of $\hat x$ increase by $a$. Check the sign of $[\hat p, \hat x] = -i\hbar$.` }, { answer: 'x', feedback: t`$\hat x$ does not commute with $\hat p$, so the exponentials do not cancel around it.` }],
      hints: [t`For small $a$: $(1 + ia\hat p/\hbar)\,\hat x\,(1 - ia\hat p/\hbar) \approx \hat x + \tfrac{ia}{\hbar}[\hat p, \hat x]$.`, t`$[\hat p, \hat x] = -i\hbar$, and higher commutators vanish, so the first-order answer is exact.`],
      teach: 'Conjugating x̂ by a translation shifts it: T̂†x̂T̂ = x̂ + a, the operator statement that the state has moved.',
      explain: t`$\hat T^\dagger\hat x\hat T = \hat x + \tfrac{ia}{\hbar}[\hat p, \hat x] + \dots = \hat x + a$, and the series stops because $[\hat p, [\hat p, \hat x]] = 0$. So $\langle\psi|\hat T^\dagger\hat x\hat T|\psi\rangle = \langle x\rangle + a$: the packet’s mean position moves by $a$, as the picture shows, while $\langle p\rangle$ is unchanged.`,
    }),
    num({
      id: 'ring-q', difficulty: 3,
      gen(r) {
        const N = r.pick([6, 8, 10, 12]), a = r.pick([0.14, 0.25, 0.3]);
        const ans = (2 * Math.PI) / (N * a);
        return {
          prompt: t`A ring molecule has $N = ${N}$ identical atoms spaced $a = ${a}$ nm around its circumference, so translating by $Na$ returns every electron to its start: $\hat T(a)^N = 1$. Bloch states satisfy $\hat T(a)\psi = e^{-iqa}\psi$. What is the smallest nonzero allowed $|q|$, in $\text{nm}^{-1}$?`,
          visual: { type: 'graph', params: { x: [-1.5, 1.5], y: [-1.25, 1.25], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.4 }], points: Array.from({ length: N }, (_, j) => ({ x: r6(Math.cos((2 * Math.PI * j) / N)), y: r6(Math.sin((2 * Math.PI * j) / N)), r: 7, color: 'accent' })) }, caption: `The ring of ${N} atoms (circumference not to scale).` },
          answer: ans, units: 'nm^-1', tol: { rel: 0.005 },
          errors: [{ value: Math.PI / (N * a), feedback: t`$e^{-iqNa} = 1$ needs $qNa = 2\pi j$, so the step is $2\pi/Na$.` }, { value: (2 * Math.PI) / a, feedback: t`$2\pi/a$ is the period of $q$ (the whole Brillouin zone); the spacing between allowed values is $N$ times smaller.` }],
          hints: [t`$\hat T(a)^N = 1$ means $e^{-iqNa} = 1$.`, t`So $q = 2\pi j/(Na)$ with integer $j$.`],
          teach: 'A ring of N cells allows N Bloch states: the eigenvalues of T̂(a) are the N-th roots of unity.',
          explain: t`$q = 2\pi j/Na$, so the smallest nonzero is $2\pi/(${N}\times${a}) = ${fmt(ans, 4)}\ \text{nm}^{-1}$. There are exactly ${N} distinct values, $j = 0, \dots, ${N - 1}$, matching the ${N} atomic orbitals that combine into one band — benzene’s six π orbitals ($N = 6$) are this calculation.`,
        };
      },
    }),
    mcq({
      id: 'crystal-momentum', difficulty: 3,
      prompt: t`An electron moving through a perfect crystal Bragg-reflects: its momentum $\hbar k$ jumps to $\hbar(k - 2\pi/a)$. Which conservation law survives?`,
      visual: foldPic('Free-electron energies drawn against crystal momentum q: the parabola E ∝ k², folded back into −π/a < q ≤ π/a by subtracting multiples of 2π/a.'),
      choices: [
        t`Crystal momentum $\hbar q$, modulo $2\pi\hbar/a$: the lattice is symmetric only under shifts by $a$, so momentum is conserved only up to multiples of $2\pi\hbar/a$`,
        t`Ordinary momentum $\hbar k$, exactly: momentum is always conserved`,
        'None: a crystal conserves nothing about the electron’s motion',
        t`Velocity: the electron leaves with the same speed and direction`,
      ],
      answer: 0,
      why: {
        1: 'Ordinary momentum is conserved only for symmetry under every translation; the lattice takes up the 2πħ/a (and the crystal recoils, imperceptibly).',
        2: 'The discrete symmetry still gives a conservation law, in the weaker modular form.',
        3: 'A Bragg reflection reverses the direction of motion along the lattice.',
      },
      hints: [t`Which translations leave the crystal unchanged? Which generator, then, is conserved?`, t`$e^{-iqa}$ is the same for $q$ and $q + 2\pi/a$.`],
      teach: 'A discrete translation symmetry conserves crystal momentum, defined only modulo the reciprocal lattice.',
      explain: t`Only $\hat T(a)$ and its powers commute with $\hat H$, and their eigenvalue $e^{-iqa}$ cannot tell $q$ from $q + 2\pi/a$. So $\hbar q$ is conserved modulo $2\pi\hbar/a$ — the folded picture. The same rule governs X-ray and neutron diffraction and phonon scattering (“umklapp” processes).`,
    }),
    num({
      id: 'time-beat', difficulty: 2,
      gen(r) {
        const [name, nu] = r.pick([['the caesium-133 clock transition', CS_HFS], ['the rubidium-87 ground-state hyperfine splitting', HFS_RB], ['hydrogen’s 21-cm hyperfine splitting', HFS_H]]);
        const ans = 1e12 / nu;    // ps
        return {
          prompt: t`Time translation is generated by energy: $\hat U(t) = e^{-i\hat Ht/\hbar}$ multiplies each stationary state by $e^{-iE_nt/\hbar}$. An atom is put in an equal superposition of the two levels of ${name}, $\Delta E/h = ${String(Math.round(nu * 1000) / 1000)}$ Hz. After how long does the relative phase return to its starting value, in ps?`,
          visual: { type: 'graph', params: { x: [0, 3], y: [-1.2, 1.2], aspect: 'wide', xlabel: 'time (periods of the beat)', ylabel: 'cos(relative phase)', xticks: 3, yticks: 2, axesAt: 'edge', curves: [{ fn: 'cos(2*pi*x)', color: 'accent', width: 2.4 }] }, caption: 'The cosine of the relative phase between the two parts of the superposition, in units of its own period.' },
          answer: ans, units: 'ps', tol: { rel: 0.005 },
          errors: [{ value: ans / (2 * Math.PI), feedback: t`The relative phase is $\Delta E\,t/\hbar = 2\pi\nu t$; it returns after $t = 1/\nu$, not $1/2\pi\nu$.` }],
          hints: [t`The relative phase is $(E_2 - E_1)t/\hbar = 2\pi\nu t$.`, t`It returns to its start when $2\pi\nu t = 2\pi$.`],
          teach: 'Energy generates time translations; only energy differences show up, as beats at ΔE/h.',
          explain: t`$t = 1/\nu = ${fmt(ans, 5)}$ ps. The overall phase $e^{-iE_1t/\hbar}$ is unobservable; the relative phase is what an atomic clock counts.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-recoil', difficulty: 3, transfer: true,
      gen(r) {
        const A = r.pick(ATOMS);
        const ans = (H / (A.m * A.lam)) * 1000;    // mm/s
        return {
          prompt: t`Just as $e^{-ia\hat p/\hbar}$ translates position, $e^{i\kappa\hat x}$ translates momentum: it adds $\hbar\kappa$. Absorbing a photon of wave number $\kappa = 2\pi/\lambda$ does exactly this to an atom, the “kick” that splits the matter waves in the atom-interferometer gravimeters and gyroscopes being developed for navigation without GPS. For ${A.name} on its ${A.line} (mass $${fmt(A.m / U, 9)}$ u, $1$ u $= ${fmt(U * 1e27, 11)}\times10^{-27}$ kg), what recoil velocity $\hbar\kappa/m$ does one photon give, in mm/s?`,
          visual: { type: 'graph', params: { x: [-1, 3], y: [0, 1.15], aspect: 'wide', xlabel: 'momentum p (units of ħκ)', ylabel: '|φ(p)|²', xticks: 4, yticks: 0, axesAt: 'edge', curves: [{ fn: 'exp(-(x/0.15)^2)', color: 'accent', width: 2.4, samples: 2000 }, { fn: 'exp(-((x - 1)/0.15)^2)', color: 'gold', width: 2.4, dash: [6, 4], samples: 2000 }], arrows: [{ from: [0.15, 0.9], to: [0.85, 0.9], color: 'ink2', width: 1.8, label: '+ħκ', labelDx: -30, labelDy: -10 }] }, caption: 'An atom’s momentum distribution before (blue) and after (gold) absorbing one photon: the whole distribution moves by ħκ.' },
          answer: ans, units: 'mm/s', tol: { rel: 0.005 },
          errors: [{ value: ans / (2 * Math.PI), feedback: t`$\hbar\kappa = \hbar\cdot2\pi/\lambda = h/\lambda$: do not lose the $2\pi$.` }],
          hints: [t`$v = \hbar\kappa/m = h/(m\lambda)$.`, t`$m = ${tex(A.m, 6)}$ kg, $\lambda = ${tex(A.lam, 7)}$ m.`],
          teach: 'Position generates translations in momentum, exactly as momentum generates translations in position.',
          explain: t`$v = h/(m\lambda) = ${fmt(ans, 4)}$ mm/s. A light pulse that puts each atom in a superposition of “kicked” and “not kicked” is a beam splitter for matter waves; after a few hundred milliseconds the two paths are millimetres apart, and gravity’s different effect on them shows up as a phase.`,
        };
      },
    }),
    multi({
      id: 'cp-conserved', difficulty: 2,
      prompt: t`An electron moves near a large, flat, uniformly charged plate in the $xy$-plane, so $V$ depends only on $z$: $V = V(z)$. Which quantities are conserved? Select all that apply.`,
      visual: { type: 'graph', params: { x: [0, 5], y: [0, 3], aspect: 'wide', xlabel: 'z (distance from the plate)', ylabel: 'V(z)', xticks: 0, yticks: 0, axesAt: 'edge', curves: [{ fn: '0.5*x + 0.3', color: 'accent', width: 2.4 }] }, caption: 'The potential depends on height z only; it is the same at every x and y.' },
      choices: [t`$p_x$`, t`$p_y$`, t`$p_z$`, t`the energy`],
      answer: [0, 1, 3],
      why: { 2: t`$V$ changes with $z$, so $[\hat p_z, \hat H] = -i\hbar\,\partial V/\partial z \neq 0$: the field accelerates the electron along $z$.` },
      hints: ['Which translations leave V(z) unchanged? And does the Hamiltonian change in time?'],
      teach: t`Each symmetry of $\hat H$ has its generator conserved: translations in $x$ and $y$ conserve $p_x$ and $p_y$; time independence conserves energy.`,
      explain: t`Shifts along $x$ and $y$ leave $V(z)$ alone, so $\hat p_x$ and $\hat p_y$ commute with $\hat H$; $\hat H$ has no explicit time dependence, so energy is conserved; $p_z$ is not.`,
    }),
    mcq({
      id: 'cp-generator', difficulty: 3,
      prompt: t`A unitary operator $\hat U(\epsilon) \approx 1 - i\epsilon\hat G/\hbar$ represents a continuous symmetry. Why must the generator $\hat G$ be Hermitian?`,
      visual: wavePic(5, 0.5, 'A translation: the state moves, its norm is unchanged.'),
      choices: [
        t`So that $\hat U$ is unitary and preserves probabilities: $\hat U^\dagger\hat U \approx 1 + i\epsilon(\hat G^\dagger - \hat G)/\hbar$ equals 1 only if $\hat G^\dagger = \hat G$ — which also makes $\hat G$ an observable that can be conserved`,
        'Because all operators in quantum mechanics are Hermitian',
        t`Because $\hat G$ must commute with $\hat H$`,
        t`So that $\hat U$ is Hermitian too`,
      ],
      answer: 0,
      why: {
        1: t`Many important operators are not Hermitian: $\hat T(a)$ itself, the ladder operators $\hat a$, $\hat a^\dagger$.`,
        2: t`Commuting with $\hat H$ is what makes $\hat G$ *conserved*, for a symmetry of $\hat H$. Hermiticity is needed for any generator of a unitary transformation, symmetry or not.`,
        3: t`$\hat T(a) = e^{-ia\hat p/\hbar}$ is unitary but not Hermitian; its eigenvalues are phases, not real numbers.`,
      },
      hints: [t`Expand $\hat U^\dagger\hat U$ to first order in $\epsilon$.`, t`$\hat U^\dagger \approx 1 + i\epsilon\hat G^\dagger/\hbar$.`],
      teach: 'Unitary symmetry operators have Hermitian generators: the observables that symmetries conserve.',
      explain: t`$\hat U^\dagger\hat U \approx 1 + \tfrac{i\epsilon}{\hbar}(\hat G^\dagger - \hat G)$, which is 1 only for Hermitian $\hat G$. So every continuous symmetry hands us an observable — momentum for translations, angular momentum for rotations, energy for time shifts.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §6.1–6.2 and §6.8', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'J. J. Sakurai & J. Napolitano, Modern Quantum Mechanics, §1.6', url: 'https://www.cambridge.org/9781108473224' },
    { label: 'D. A. Steck, “Rubidium 87 D Line Data” and “Cesium D Line Data”', url: 'https://steck.us/alkalidata/' },
  ],
});
