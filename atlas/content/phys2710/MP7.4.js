// The harmonic oscillator — V = ½mω²x² gives equally spaced levels
// Eₙ = (n + ½)ħω, starting half a quantum above the bottom (zero-point
// energy), with Hermite functions Hₙ(ξ)e^{−ξ²/2}. The ground state spends
// 15.7% of its time beyond its classical turning points; at large n,
// |ψ|² approaches the classical density, piled up at the turning points.
// Molecular vibration: CO's stretch at 2143 cm⁻¹ (force constant, zero-point
// motion, isotope shift); HCl and HF. LIGO's 10 kg mirrors near their
// quantum ground state. Every number is computed here.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, C, QE, KB } from './_constants.js';
import { U_KG, well, seg, label, r6 } from './_schrodinger.js';
import * as S from '../../src/viz/model/mp-schrodinger.js';

const t = String.raw;
const m_C12 = 12, m_C13 = 13.00335483507, m_O16 = 15.99491461957, m_O18 = 17.99915961286;   // u (AME2020)
const red = (a, b) => (a * b) / (a + b);
// heteronuclear diatomics: harmonic wavenumbers ωₑ (cm⁻¹, Huber & Herzberg / NIST) and reduced masses (u)
const MOL = {
  HCl: { name: 'hydrogen chloride (H³⁵Cl)', we: 2990.95, mu: red(1.00782503190, 34.968852682) },
  CO: { name: 'carbon monoxide (¹²C¹⁶O)', we: 2169.81, mu: red(m_C12, m_O16) },
  HF: { name: 'hydrogen fluoride', we: 4138.32, mu: red(1.00782503190, 18.99840316273) },
};
const omegaOf = (wn) => 2 * Math.PI * C * 100 * wn;                 // rad/s from a wavenumber in cm⁻¹
const CO_FUND = 2143.27;                                            // cm⁻¹, the observed CO fundamental (v = 0 → 1)
const CO_MU = red(m_C12, m_O16);
const coOmega = omegaOf(CO_FUND), coHw = (HBAR * coOmega) / QE, coK = CO_MU * U_KG * coOmega ** 2, coA = Math.sqrt(HBAR / (CO_MU * U_KG * coOmega));

/** The probability of finding oscillator state n beyond its classical turning points. */
function outside(n) {
  const A = S.oscTurning(n, 1), N = 40000, X = 12;
  let s = 0;
  for (let i = 0; i < N; i++) { const x = A + ((X - A) * (i + 0.5)) / N; s += S.oscPsi(n, x, 1) ** 2 * ((X - A) / N); }
  return 2 * s;
}

/** ψₙ(ξ) = Hₙ(ξ)e^{−ξ²/2}/√(2ⁿn!√π) as an Atlas expression of x (= ξ). */
const HERM = { 0: '1', 1: '2x', 2: '4x^2 - 2', 3: '8x^3 - 12x', 4: '16x^4 - 48x^2 + 12' };
const herm = (n) => {
  const norm = 1 / Math.sqrt(2 ** n * [1, 1, 2, 6, 24][n] * Math.sqrt(Math.PI));
  return { type: 'graph', params: { x: [-4, 4], y: [-0.9, 0.9], aspect: 'wide', axesAt: 'edge', xlabel: 'ξ = x/b', ylabel: 'ψ (units of b^(−1/2))', curves: [{ fn: `${r6(norm)}*(${HERM[n]})*exp(-x^2/2)`, color: 'violet', width: 2.4 }], vlines: [{ x: r6(-Math.sqrt(2 * n + 1)), label: 'turning point', color: 'gold' }, { x: r6(Math.sqrt(2 * n + 1)), color: 'gold' }] }, caption: `The oscillator state whose Hermite polynomial is asked for, with its classical turning points ξ = ±√(2n + 1) (gold).` };
};

/** Four energy ladders side by side; one is the oscillator’s. */
const ladders = (() => {
  const cols = [
    { x: 0.2, E: [0.5, 1.5, 2.5, 3.5, 4.5], name: 'P' },
    { x: 1.4, E: [0, 1, 2, 3, 4], name: 'Q' },
    { x: 2.6, E: [0.3, 1.2, 2.7, 4.8], name: 'R' },
    { x: 3.8, E: [1, 2, 3, 4, 5], name: 'S' },
  ];
  const curves = [seg(0, 0, 4.8, 0, 'ink2', 2.2)], points = [];
  for (const c of cols) { for (const E of c.E) curves.push(seg(c.x, E, c.x + 0.8, E, 'accent', 2)); points.push(label(c.x + 0.4, -0.35, c.name, 'ink', 0, 0, 'center')); }
  points.push(label(4.75, 0, 'bottom of the potential', 'ink3', 0, -10, 'right'));
  return { type: 'graph', params: { x: [0, 4.8], y: [-0.7, 5.4], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves, points }, caption: 'Four ladders of energy levels, all drawn from the same bottom of the potential energy (the line along the base) and to the same scale.' };
})();

export default lesson({
  id: 'phys2710.MP7.4',
  title: 'The harmonic oscillator',
  minutes: 15, difficulty: 3,
  intro: t`Near the bottom of almost any potential well, the potential is a parabola, $V = \tfrac12 kx^2 = \tfrac12 m\omega^2x^2$ — so the quantum harmonic oscillator describes vibrating molecules, atoms in crystals and in traps, and even the modes of light. Its levels are **equally spaced**,

$$E_n = \left(n + \tfrac12\right)\hbar\omega, \qquad n = 0, 1, 2, \ldots$$

and the lowest sits half a quantum above the bottom: the **zero-point energy** $\tfrac12\hbar\omega$. The wave functions are Hermite polynomials times a Gaussian, $\psi_n \propto H_n(\xi)\,e^{-\xi^2/2}$ with $\xi = x/b$ and $b = \sqrt{\hbar/m\omega}$. Unlike a classical mass on a spring, the quantum oscillator can be found beyond its turning points — and for large $n$ its probability density approaches the classical one.`,
  symbols: [
    { tex: 'E_n', text: 'the energy of the nth level, in J or eV' },
    { tex: 'n', text: 'the quantum number 0, 1, 2 … — the number of nodes of ψ' },
    { tex: '\\omega', text: t`the classical angular frequency $\sqrt{k/m}$, in rad/s` },
    { tex: '\\hbar\\omega', text: 'the energy quantum: the spacing between neighbouring levels' },
    { tex: 'k', text: 'the spring constant (for a molecule, the bond’s force constant), in N/m' },
    { tex: 'm', text: 'the oscillating mass in kg (for a two-atom molecule, the reduced mass m₁m₂/(m₁ + m₂))' },
    { tex: 'b', text: t`$\sqrt{\hbar/m\omega}$, the oscillator’s natural length; $\xi = x/b$ is position measured in it` },
  ],
  why: 'Every vibration in nature is approximately harmonic near equilibrium, so this ladder of equal steps sets molecular infrared spectra, heat capacities of solids, and the quantum noise floor of LIGO’s mirrors.',
  visual: {
    type: 'mp-schrodinger',
    title: 'The quantum oscillator',
    lead: t`Top: the parabola $V = \tfrac12 m\omega^2x^2$ and its equally spaced levels, each drawn between its classical turning points. Bottom: $|\psi_n|^2$, with the classically forbidden regions shaded and the classical probability density (gold, dashed) for comparison.`,
    tasks: [
      'n = 0: a single Gaussian hump, largest at the centre — where a classical oscillator is least likely to be. About 16% of it lies beyond the turning points.',
      'Step n up to 10: the quantum density becomes a row of wiggles whose average follows the classical curve, piled up at the turning points.',
      'Double ħω: the levels spread apart and the wave narrows — b = √(ħ/mω) shrinks by √2.',
    ],
    params: { mode: 'bound', well: 'harmonic', hw: 0.5, n: 0, show: 'prob', classical: true, controls: ['hw', 'mass', 'n', 'show', 'classical'] },
  },
  example: {
    prompt: t`A carbon monoxide molecule absorbs infrared light at a wavenumber of $2143\ \text{cm}^{-1}$ (wavelength 4.67 μm), when its vibration jumps from $n = 0$ to $n = 1$. Treat the bond as a harmonic spring. Find the vibrational quantum $\hbar\omega$, the bond’s force constant $k$, the zero-point energy, and how far the atoms’ separation spreads in the ground state.`,
    visual: well({ well: 'harmonic', hw: 0.27, mass: 1, n: 0, show: 'prob', classical: false, top: 5 }, t`The oscillator’s levels (top) and its ground state’s $|\psi|^2$ (bottom), for $\hbar\omega = 0.27$ eV. The horizontal scale is for an electron-mass oscillator: a CO molecule’s is about 110 times narrower.`),
    steps: [
      { label: 'The quantum', text: t`The photon supplies $E_1 - E_0 = \hbar\omega$. With $\tilde\nu = 2143\ \text{cm}^{-1}$: $\omega = 2\pi c\tilde\nu = 2\pi(3.00\times10^{10}\ \text{cm/s})(2143\ \text{cm}^{-1}) = ${tex(coOmega, 3)}$ rad/s, and $\hbar\omega = ${fmt(coHw, 3)}$ eV.` },
      { label: 'Reduced mass', text: t`Both atoms move: the oscillating mass is $\mu = \dfrac{m_\text{C}m_\text{O}}{m_\text{C} + m_\text{O}} = \dfrac{(12.00)(15.995)}{27.995}\ \text{u} = ${fmt(CO_MU, 4)}$ u $= ${tex(CO_MU * U_KG, 3)}$ kg.` },
      { label: 'Force constant', text: t`$k = \mu\omega^2 = (${tex(CO_MU * U_KG, 3)})(${tex(coOmega, 3)})^2 = ${fmt(coK, 3)}$ N/m — a stiff spring: stretching it 1 pm takes about 2 nN.` },
      { label: 'Zero-point energy', text: t`$E_0 = \tfrac12\hbar\omega = ${fmt(coHw / 2, 3)}$ eV. Even at absolute zero, every CO molecule vibrates with this much energy.` },
      { label: 'How far it moves', text: t`The ground state’s classical turning point is $b = \sqrt{\hbar/\mu\omega} = ${fmt(coA * 1e12, 3)}$ pm, about 4% of the 113 pm bond length: the atoms jitter by a few picometres, and are sometimes found further out.` },
      { label: 'Sense check', text: t`$\hbar\omega = 0.27$ eV is about ten times room-temperature $kT$ (0.026 eV), so at room temperature almost every molecule is in $n = 0$ — which is why the absorption starts there. Real bonds are slightly anharmonic: the true $1 \to 2$ line sits about 27 cm⁻¹ below $0 \to 1$.` },
    ],
    answer: t`$\hbar\omega = ${fmt(coHw, 3)}$ eV, $k = ${fmt(coK, 3)}$ N/m, $E_0 = ${fmt(coHw / 2, 3)}$ eV, and the ground-state spread is about ${fmt(coA * 1e12, 2)} pm.`,
  },
  practice: [
    mcq({
      id: 'lowest', difficulty: 1,
      prompt: t`A quantum harmonic oscillator has angular frequency $\omega$. What is the lowest energy it can have, measured from the bottom of its potential?`,
      choices: [t`$\tfrac12\hbar\omega$`, '0', t`$\hbar\omega$`, t`$\tfrac12 kA^2$, for whatever amplitude $A$ it was started with`],
      answer: 0,
      why: {
        1: 'Zero would mean sitting still at the bottom: exact position and exact momentum at once, which the uncertainty principle forbids.',
        2: t`$\hbar\omega$ is the *spacing* between levels; the ladder starts half a step up.`,
        3: 'That is the classical energy, which can be anything. Quantum mechanically only (n + ½)ħω is allowed.',
      },
      hints: [t`Put $n = 0$ into $E_n = (n + \tfrac12)\hbar\omega$.`],
      teach: 'The oscillator’s ladder starts at the zero-point energy ½ħω and climbs in equal steps of ħω.',
      explain: t`$E_0 = \tfrac12\hbar\omega$. The ground state is a Gaussian of width $\Delta x = b/\sqrt2$ with momentum spread $\Delta p = \hbar/(b\sqrt2)$, so $\Delta x\,\Delta p = \hbar/2$ exactly — the least the uncertainty principle allows, and the energy that comes with it is $\tfrac12\hbar\omega$.`,
      visual: well({ well: 'harmonic', hw: 0.5, n: 0, panels: ['energy'], hide: ['energy', 'scale'] }, 'The parabola and its lowest levels (energies hidden). The gold level is the lowest.'),
    }),
    num({
      id: 'quantum', difficulty: 2,
      gen(r) {
        const key = r.pick(Object.keys(MOL)), M = MOL[key], om = omegaOf(M.we), k = +(M.mu * U_KG * om * om).toPrecision(3);
        const hw = (HBAR * Math.sqrt(k / (M.mu * U_KG))) / QE;
        const heavy = Math.max(...{ HCl: [1.00782503190, 34.968852682], CO: [m_C12, m_O16], HF: [1.00782503190, 18.99840316273] }[key]);
        return {
          prompt: t`The bond in ${M.name} acts as a spring of force constant $k = ${fmt(k, 3)}$ N/m, and the molecule’s reduced mass is $\mu = ${fmt(M.mu, 4)}$ u ($1\ \text{u} = 1.661\times10^{-27}$ kg). What is its vibrational energy quantum $\hbar\omega$, in eV?`,
          answer: hw, units: 'eV', tol: { rel: 0.01 },
          errors: [
            { value: (HBAR * Math.sqrt(k / (heavy * U_KG))) / QE, feedback: t`Both atoms move. Use the reduced mass $\mu$, not the heavier atom’s mass.` },
            { value: (2 * Math.PI * HBAR * Math.sqrt(k / (M.mu * U_KG))) / QE, feedback: t`That is $h\omega$. The quantum is $\hbar\omega$, with $\omega = \sqrt{k/\mu}$ in rad/s.` },
          ],
          hints: [t`$\omega = \sqrt{k/\mu}$ with $\mu$ in kg.`, t`$\hbar\omega$ in joules, then divide by $1.602\times10^{-19}$ J/eV.`],
          teach: 'A bond’s vibrational quantum is ħ√(k/μ) — tenths of an eV, which is infrared light.',
          explain: t`$\mu = ${tex(M.mu * U_KG, 3)}$ kg, $\omega = \sqrt{${fmt(k, 3)}/\mu} = ${tex(Math.sqrt(k / (M.mu * U_KG)), 3)}$ rad/s, and $\hbar\omega = ${fmt(hw, 3)}$ eV — a photon of wavelength ${fmt(1239.84 / hw / 1000, 3)} μm, in the infrared. Light hydrogen atoms make HCl and HF vibrate fast.`,
          visual: well({ well: 'harmonic', hw: 0.3, n: 1, panels: ['energy'], hide: ['energy', 'scale'] }, 'The oscillator’s equally spaced levels; the quantum is the gap between neighbours.'),
        };
      },
    }),
    num({
      id: 'outside', difficulty: 2,
      gen(r) {
        const n = r.pick([0, 1, 2]), P = outside(n);
        return {
          prompt: t`A quantum oscillator is in its state $n = ${n}$. A classical oscillator with the same energy would swing between turning points at $x = \pm b\sqrt{${2 * n + 1}}$. What is the probability that a measurement finds the quantum oscillator *beyond* those turning points? (Integrate $|\psi_${n}|^2$ numerically, or read it off the simulation’s window.)`,
          answer: P, tol: { rel: 0.02 },
          errors: [{ value: 0, feedback: 'Classically the answer would be zero. Quantum mechanically ψ has tails in the forbidden regions.' }],
          hints: [t`$P = 1 - \displaystyle\int_{-A}^{A}|\psi_${n}|^2\,dx$, with $A = b\sqrt{${2 * n + 1}}$.`, n === 0 ? t`For $n = 0$, $|\psi_0|^2 = \frac{1}{\sqrt\pi\,b}e^{-x^2/b^2}$, so the inside probability is $\operatorname{erf}(1) = 0.8427$.` : t`Numerically: sample $|\psi_${n}|^2$ on a fine grid and add up the parts with $|x| > A$.`],
          teach: 'A quantum oscillator spends a fair fraction of its time where a classical one could never be — 16% in the ground state.',
          explain: t`$P = ${fmt(P, 3)}$. ${n === 0 ? 'For the ground state it is exactly 1 − erf(1) = erfc(1).' : 'The fraction shrinks slowly as n grows'} — towards zero as $n \to \infty$, the classical limit.`,
          visual: well({ well: 'harmonic', hw: 0.5, n, show: 'prob', panels: ['wave'], hide: ['axis'] }, t`$|\psi_${n}|^2$ with the classically forbidden regions — beyond the turning points — shaded grey.`),
        };
      },
    }),
    mcq({
      id: 'classical', difficulty: 2,
      prompt: t`For the state $n = 10$, the dashed curve is the classical probability density of an oscillator with the same energy. Why is the classical curve largest near the turning points?`,
      choices: [
        'The oscillator moves slowest there, so it spends the most time there',
        'The restoring force is weakest there',
        'The potential energy is lowest there',
        'Tunnelling piles probability up against the forbidden region',
      ],
      answer: 0,
      why: {
        1: t`The force $-kx$ is *strongest* at the turning points.`,
        2: 'The potential energy is highest at the turning points — that is why the oscillator stops there.',
        3: 'The dashed curve is purely classical: a mass on a spring, timed. No tunnelling is involved.',
      },
      hints: ['A classical density is the fraction of each cycle spent near each x. Where is the mass slow?'],
      teach: 'Classically, probability goes as 1/speed; at large n the quantum |ψ|², averaged over its wiggles, matches it — the correspondence principle.',
      explain: t`A classical oscillator’s density is $1/\big(\pi\sqrt{A^2 - x^2}\big)$, largest where it stops and turns. The $n = 10$ quantum density wiggles around the same shape — Bohr’s correspondence principle at work — while the ground state does the opposite, peaking at the centre.`,
      visual: well({ well: 'harmonic', hw: 0.5, n: 10, show: 'prob', classical: true, panels: ['wave'], hide: ['axis'] }, 'The n = 10 state’s |ψ|² (blue) and the classical density at the same energy (gold, dashed); forbidden regions shaded.'),
    }),
    expr({
      id: 'hermite', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4]);
        const ans = { 2: '4xi^2 - 2', 3: '8xi^3 - 12xi', 4: '16xi^4 - 48xi^2 + 12' }[n];
        const anTeX = { 2: t`4\xi^2 - 2`, 3: t`8\xi^3 - 12\xi`, 4: t`16\xi^4 - 48\xi^2 + 12` }[n];
        const wrong = { 2: '4xi^2 - 4', 3: '8xi^3 - 8xi', 4: '16xi^4 - 32xi^2 + 12' }[n];
        const prev = { 2: t`H_1 = 2\xi,\ H_0 = 1`, 3: t`H_2 = 4\xi^2 - 2,\ H_1 = 2\xi`, 4: t`H_3 = 8\xi^3 - 12\xi,\ H_2 = 4\xi^2 - 2` }[n];
        return {
          prompt: t`The oscillator’s wave functions are $\psi_n \propto H_n(\xi)e^{-\xi^2/2}$, where the Hermite polynomials obey $H_0 = 1$, $H_1 = 2\xi$ and $H_{n+1} = 2\xi H_n - 2nH_{n-1}$. Find $H_${n}(\xi)$.`,
          answer: ans, answerTeX: anTeX, lhs: t`H_${n}(\xi)`,
          vars: { xi: [-2, 2] },
          errors: [{ answer: wrong, feedback: t`In $H_{n+1} = 2\xi H_n - 2nH_{n-1}$, the $n$ is the index of the polynomial you start from: to get $H_${n}$, use $n = ${n - 1}$.` }],
          hints: [t`Start from ${'$'}${prev}${'$'}.`, t`$H_${n} = 2\xi H_${n - 1} - 2(${n - 1})H_${n - 2}$.`],
          teach: 'Each Hermite polynomial follows from the two before it; Hₙ has n roots — the nodes of ψₙ.',
          explain: t`$H_${n} = ${anTeX}$, a polynomial of degree ${n} with ${n} real roots: the ${n} nodes of $\psi_${n}$, all between its turning points.`,
          visual: herm(n),
        };
      },
    }),
    num({
      id: 'isotope', difficulty: 2,
      gen(r) {
        const [lab, mC, mO] = r.pick([['¹³C¹⁶O', m_C13, m_O16], ['¹²C¹⁸O', m_C12, m_O18], ['¹³C¹⁸O', m_C13, m_O18]]);
        const mu2 = red(mC, mO), wn = CO_FUND * Math.sqrt(CO_MU / mu2);
        return {
          prompt: t`Ordinary carbon monoxide, ¹²C¹⁶O ($\mu = ${fmt(CO_MU, 5)}$ u), absorbs at $2143.3\ \text{cm}^{-1}$. The rarer isotopic molecule ${lab} has the same bond — the same spring constant — but reduced mass $\mu = ${fmt(mu2, 5)}$ u. At what wavenumber does it absorb, in cm⁻¹?`,
          answer: wn, units: 'cm^-1', tol: { rel: 0.0005 },
          errors: [{ value: CO_FUND * (CO_MU / mu2), feedback: t`$\omega = \sqrt{k/\mu}$: the frequency goes as $1/\sqrt\mu$, so take the square root of the mass ratio.` }, { value: CO_FUND * Math.sqrt(mu2 / CO_MU), feedback: 'A heavier molecule vibrates more slowly, not faster: the ratio is upside down.' }],
          hints: [t`$\tilde\nu \propto \omega = \sqrt{k/\mu}$ with the same $k$.`, t`$\tilde\nu' = 2143.3\ \text{cm}^{-1}\times\sqrt{${fmt(CO_MU, 5)}/${fmt(mu2, 5)}}$.`],
          teach: 'Same bond, heavier atoms: the vibration slows as 1/√μ — the isotope shift.',
          explain: t`$\tilde\nu' = 2143.3\times\sqrt{${fmt(CO_MU, 5)}/${fmt(mu2, 5)}} = ${fmt(wn, 5)}\ \text{cm}^{-1}$.${lab === '¹³C¹⁶O' ? ' The measured value is 2096.1 cm⁻¹.' : ''} Astronomers use exactly this shift to measure carbon and oxygen isotope ratios in comets, interstellar clouds and planetary atmospheres.`,
          visual: well({ well: 'harmonic', hw: 0.27, n: 1, panels: ['energy'], hide: ['energy', 'scale'] }, 'The vibrational ladder. A heavier isotope keeps the same parabola (the same bond) but has more closely spaced levels.'),
        };
      },
    }),
    num({
      id: 'jitter', difficulty: 3,
      gen(r) {
        const key = r.pick(Object.keys(MOL)), M = MOL[key], om = omegaOf(M.we), b = Math.sqrt(HBAR / (M.mu * U_KG * om));
        const hw = (HBAR * om) / QE;
        return {
          prompt: t`${M.name[0].toUpperCase() + M.name.slice(1)} vibrates with $\hbar\omega = ${fmt(hw, 3)}$ eV (reduced mass ${fmt(M.mu, 4)} u). In its ground state, how far from equilibrium is the classical turning point, $b = \sqrt{\hbar/\mu\omega}$, in pm?`,
          answer: b * 1e12, units: 'pm', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(HBAR / (2 * M.mu * U_KG * om)) * 1e12, feedback: t`That is $\Delta x = b/\sqrt2$, the standard deviation of the position. The turning point of $E_0 = \tfrac12\hbar\omega = \tfrac12\mu\omega^2A^2$ is $A = b$.` }],
          hints: [t`Get $\omega$ from $\hbar\omega$: $\omega = (${fmt(hw, 3)}\times1.602\times10^{-19}\ \text{J})/(1.055\times10^{-34}\ \text{J s})$.`, t`Then $b = \sqrt{\hbar/(\mu\omega)}$ with $\mu$ in kg.`],
          teach: 'Zero-point motion is a few picometres for a molecule: small next to the bond, but never zero.',
          explain: t`$\omega = ${tex(om, 3)}$ rad/s and $b = ${fmt(b * 1e12, 3)}$ pm. Bonds are about 90–130 pm long, so the zero-point jitter is several percent of the bond — more for the light hydrogen compounds.`,
          visual: well({ well: 'harmonic', hw: 0.3, n: 0, show: 'prob', panels: ['wave'], hide: ['axis'] }, 'The ground state’s |ψ|²; the classically forbidden regions beyond ±b are shaded. Horizontal scale schematic.'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-force-constant', difficulty: 2,
      gen(r) {
        const key = r.pick(['HCl', 'HF']), M = MOL[key], fund = { HCl: 2885.98, HF: 3961.42 }[key], om = omegaOf(fund), k = M.mu * U_KG * om * om;
        return {
          prompt: t`${M.name[0].toUpperCase() + M.name.slice(1)} absorbs infrared light at ${fmt(fund, 6)} cm⁻¹ as its vibration goes from $n = 0$ to $n = 1$. Treating the bond as a harmonic spring, with reduced mass $\mu = ${fmt(M.mu, 4)}$ u, what is its force constant, in N/m?`,
          answer: k, units: 'N/m', tol: { rel: 0.01 },
          errors: [{ value: M.mu * U_KG * (C * 100 * fund) ** 2, feedback: t`$\omega = 2\pi c\tilde\nu$ — the $2\pi$ turns the wavenumber’s frequency into an angular frequency.` }],
          hints: [t`$\omega = 2\pi c\tilde\nu$, with $c = 3.00\times10^{10}$ cm/s.`, t`$k = \mu\omega^2$, with $\mu$ in kg.`],
          teach: 'An infrared line gives ω directly, and k = μω² follows.',
          explain: t`$\omega = 2\pi(3.00\times10^{10})(${fmt(fund, 6)}) = ${tex(om, 3)}$ rad/s and $k = \mu\omega^2 = ${fmt(k, 3)}$ N/m. (Using the observed line, which anharmonicity lowers by about 3%, gives a slightly softer spring than the true curvature.)`,
          visual: well({ well: 'harmonic', hw: 0.36, n: 1, panels: ['energy'], hide: ['energy', 'scale'] }, 'The vibrational levels; the absorbed photon lifts the molecule from the lowest level to the next (gold).'),
        };
      },
    }),
    mcq({
      id: 'cp-ladders', difficulty: 2,
      prompt: t`Which ladder of energy levels belongs to a quantum harmonic oscillator?`,
      choices: ['P', 'Q', 'R', 'S'],
      answer: 0,
      fixedOrder: true,
      why: {
        1: 'Equal steps, but starting at the bottom: that leaves out the zero-point energy ½ħω.',
        2: 'Steps that widen with n belong to a box-like well, not a parabola.',
        3: 'Equal steps, but the first is a whole quantum up. The ground state is only half a step above the bottom.',
      },
      hints: ['Two things to check: equal spacing, and where the lowest level sits.'],
      teach: 'An oscillator’s ladder has equal steps ħω, starting ½ħω above the bottom.',
      explain: t`P: equally spaced levels with the lowest at half a step, $E_n = (n + \tfrac12)\hbar\omega$. R’s widening steps are an infinite-well pattern ($\propto n^2$).`,
      visual: ladders,
    }),
    num({
      id: 'cp-ligo', difficulty: 3, transfer: true,
      prompt: t`In 2021 LIGO physicists cooled the motion of the Hanford detector’s 40 kg mirrors — the differential mode of the four, which acts like a single oscillator of mass 10 kg swinging at 77.6 Hz — almost to its quantum ground state. In the ground state, what is the spread (standard deviation) of that oscillator’s position, $\Delta x = \sqrt{\hbar/2m\omega}$, in metres?`,
      answer: Math.sqrt(HBAR / (2 * 10 * 2 * Math.PI * 77.6)), units: 'm', tol: { rel: 0.01 },
      errors: [{ value: Math.sqrt(HBAR / (2 * 10 * 77.6)), feedback: t`Use the angular frequency $\omega = 2\pi f$, not $f$.` }],
      hints: [t`$\omega = 2\pi(77.6\ \text{Hz}) = 488$ rad/s.`, t`$\Delta x = \sqrt{1.055\times10^{-34}/(2\times10\times488)}$ m.`],
      teach: 'Even a 10 kg oscillator has a zero-point spread ħ/2mω — tiny, but within reach of an instrument built to see 10⁻¹⁹ m.',
      explain: t`$\Delta x = ${tex(Math.sqrt(HBAR / (2 * 10 * 2 * Math.PI * 77.6)), 3)}$ m — about a ten-thousandth of a proton’s radius. One quantum $\hbar\omega$ corresponds to a temperature $\hbar\omega/k_B$ of only ${fmt((HBAR * 2 * Math.PI * 77.6) / KB * 1e9, 2)} nK; the team reached an average of about 11 quanta, at 77 nK. LIGO measures mirror motions this small every day, which is why quantum noise limits its sensitivity.`,
      visual: {
        type: 'graph',
        params: {
          x: [-3.5, 3.5], y: [0, 0.68], aspect: 'wide', axesAt: 'edge', xlabel: 'mirror displacement x (units of the unknown Δx)', ylabel: '', yticks: 0,
          curves: [{ fn: 'exp(-x^2/2)/sqrt(2*pi)', color: 'accent', width: 2.4 }],
          shade: [{ fn: 'exp(-x^2/2)/sqrt(2*pi)', from: -1, to: 1, color: 'gold', alpha: 0.35 }],
          arrows: [{ from: [0, 0.48], to: [1, 0.48], color: 'gold' }, { from: [0, 0.48], to: [-1, 0.48], color: 'gold' }],
          points: [label(0, 0.48, '± Δx = ?', 'gold', 0, -12, 'center')],
        },
        caption: 'The ground state’s probability density for the oscillator’s position: a Gaussian whose standard deviation is the zero-point spread Δx.',
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §7.5 (the quantum harmonic oscillator)', url: 'https://openstax.org/books/university-physics-volume-3/pages/7-5-the-quantum-harmonic-oscillator' },
    { label: 'NIST Chemistry WebBook: diatomic constants for CO, HCl and HF (after Huber & Herzberg, 1979)', url: 'https://webbook.nist.gov/chemistry/form-ser/' },
    { label: 'Whittle et al. (2021), Approaching the motional ground state of a 10-kg object, Science 372, 1333', url: 'https://doi.org/10.1126/science.abh2634' },
  ],
});
