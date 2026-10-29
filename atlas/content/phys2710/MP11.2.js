// Rotational and vibrational spectra — the rigid rotor E = hB J(J + 1) and
// the harmonic vibrator E = (v + ½)hf; carbon monoxide’s microwave lines and
// the bond length they give; hydrogen chloride’s infrared band with its P and
// R branches, the missing line at the origin, and the ³⁵Cl/³⁷Cl isotope
// splitting; force constants; a Python fit of measured HCl lines; which
// molecules absorb infrared, and the greenhouse effect as CO₂’s 15 µm bending
// mode, stated honestly. A virtual spectrometer on model/mp-molecule.js
// (Huber & Herzberg constants); every number is computed here or there.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H, C } from './_constants.js';
import { U_KG } from './_quanta.js';
import * as M from '../../src/viz/model/mp-molecule.js';
import { seg, label, frame, r6 } from './_atoms.js';

const t = String.raw;
const muOf = (a, b) => (a * b) / (a + b);
const MS = M.MASS;
const rFromB = (Bhz, mu) => Math.sqrt(H / (8 * Math.PI ** 2 * Bhz * mu * U_KG)) * 1e12;   // pm, B in Hz
const kFrom = (wcm, mu) => mu * U_KG * (2 * Math.PI * C * 100 * wcm) ** 2;            // N/m
// carbon monoxide’s J = 1 ← 0 lines (CDMS), GHz
const CO_LINES = {
  '12C16O': { ghz: 115.2712018, mu: muOf(MS.C12, MS.O16), label: '¹²C¹⁶O' },
  '13C16O': { ghz: 110.2013543, mu: muOf(MS.C13, MS.O16), label: '¹³C¹⁶O' },
  '12C18O': { ghz: 109.7821734, mu: muOf(MS.C12, 17.99915961214), label: '¹²C¹⁸O' },
};
const CO = CO_LINES['12C16O'];
const CO_I = H / (8 * Math.PI ** 2 * (CO.ghz * 1e9 / 2));
// measured H³⁵Cl fundamental lines, cm⁻¹ (the classic data, e.g. Rank et al. 1965): [m, ν]
const HCL_LINES = [[1, 2906.25], [2, 2925.90], [3, 2944.91], [4, 2963.29], [-1, 2865.10], [-2, 2843.62], [-3, 2821.56], [-4, 2798.94]];
const MU_HCL = muOf(MS.H, MS.Cl35);
// least squares ν = c0 + c1 m + c2 m² (normal equations), for the coding exercise’s key
const FIT = (() => {
  const S = (f) => HCL_LINES.reduce((s, [m, n]) => s + f(m, n), 0);
  const A = [[S(() => 1), S((m) => m), S((m) => m * m)], [S((m) => m), S((m) => m * m), S((m) => m ** 3)], [S((m) => m * m), S((m) => m ** 3), S((m) => m ** 4)]];
  const b = [S((m, n) => n), S((m, n) => m * n), S((m, n) => m * m * n)];
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) { const f = A[j][i] / A[i][i]; for (let k = i; k < 3; k++) A[j][k] -= f * A[i][k]; b[j] -= f * b[i]; }
  const x = [0, 0, 0];
  for (let i = 2; i >= 0; i--) x[i] = (b[i] - A[i].slice(i + 1).reduce((s, a, k) => s + a * x[i + 1 + k], 0)) / A[i][i];
  const [c0, c1, c2] = x, B0 = (c1 - c2) / 2, B1 = (c1 + c2) / 2;
  return { c0, c1, c2, B0, B1, r0: rFromB(B0 * C * 100, MU_HCL) };
})();
// D³⁵Cl’s P(1) and R(0), computed from the isotope-scaled constants (model), cm⁻¹
const DCL_GAP = (() => { const b = M.band(M.constants('DCl35'), 300); const f = (br, J) => +b.find((l) => l.branch === br && l.J === J).nu.toFixed(2); return [f('P', 1), f('R', 0)]; })();
const CO2_BEND = 667.38;                                   // cm⁻¹, CO₂’s ν₂ bending fundamental

/** CO₂’s three vibrations, schematic: atoms as dots with arrows for their motion. */
const co2Modes = (() => {
  const atoms = (y) => [{ x: -1.6, y, r: 8, color: 'bad' }, { x: 0, y, r: 9, color: 'ink2' }, { x: 1.6, y, r: 8, color: 'bad' }];
  const arr = (x, y, dx, dy, c = 'gold') => ({ from: [x, y], to: [r6(x + dx), r6(y + dy)], color: c, width: 2.2 });
  return {
    type: 'graph',
    params: frame([-2.6, 11.2], [-0.2, 5.8], {
      aspect: 'wide',
      points: [...atoms(5), ...atoms(3), ...atoms(1),
        label(2.4, 5, 'symmetric stretch, 1388 cm⁻¹: no dipole change', 'ink2', 8, 0, 'left'),
        label(2.4, 3, 'bend, 667 cm⁻¹ (15 µm): dipole changes', 'good', 8, 0, 'left'),
        label(2.4, 1, 'asymmetric stretch, 2349 cm⁻¹ (4.3 µm): dipole changes', 'good', 8, 0, 'left')],
      arrows: [arr(-1.6, 5, -0.7, 0), arr(1.6, 5, 0.7, 0), arr(-1.6, 3, 0, 0.7), arr(1.6, 3, 0, 0.7), arr(0, 3, 0, -0.7), arr(-1.6, 1, 0.6, 0), arr(1.6, 1, 0.6, 0), arr(0, 1, -0.7, 0)],
    }),
    caption: 'Carbon dioxide’s three ways to vibrate, schematic (oxygen red, carbon grey; arrows show one half-cycle). The bend comes in two perpendicular versions with the same frequency.',
  };
})();

export default lesson({
  id: 'phys2710.MP11.2',
  title: 'Rotational and vibrational spectra',
  minutes: 17, difficulty: 3,
  intro: t`A diatomic molecule can rotate end over end and its bond can stretch like a spring, and quantum mechanics lets it do both only in steps:

$$E_{v,J} = \left(v + \tfrac12\right)hf_0 + \frac{\hbar^2}{2I}\,J(J+1)$$

A photon absorbed or emitted carries one unit of angular momentum, so $J$ must change by exactly one. Pure rotation ($v$ fixed) gives a ladder of **microwave** lines spaced by $\hbar^2/(2\pi\hbar I) = 2B$, which read off the moment of inertia and so the bond length. Vibration plus rotation ($v = 0 \to 1$, $J \to J \pm 1$) gives an **infrared band**: a P branch and an R branch on either side of an empty centre. Each line’s position is set by the masses and the bond — and its height by the Boltzmann populations of the levels it starts from.

> The harmonic oscillator came in [The harmonic oscillator](#/lesson/phys2710.MP7.4), and level populations in [Maxwell–Boltzmann statistics](#/lesson/phys2710.MP10.1).`,
  symbols: [
    { tex: 'v', text: 'the vibrational quantum number, $0, 1, 2, \\ldots$' },
    { tex: 'f_0', text: 'the vibration frequency, $f_0 = \\dfrac{1}{2\\pi}\\sqrt{k/\\mu}$, with $k$ the bond’s force constant in N/m' },
    { tex: 'J', text: 'the rotational quantum number, $0, 1, 2, \\ldots$; level $J$ has $2J + 1$ states' },
    { tex: 'I', text: 'the moment of inertia about the centre of mass, $I = \\mu r^2$ for a bond of length $r$' },
    { tex: '\\mu', text: 'the reduced mass $m_1m_2/(m_1 + m_2)$: for HCl just under the hydrogen atom’s mass' },
    { tex: '\\hbar', text: t`Planck’s constant over $2\pi$, $1.0546\times10^{-34}$ J s. Spectroscopists write the rotational energy as $hB\,J(J+1)$, with the rotational constant $B = \hbar/(4\pi I)$ in Hz (or $B/c$ in cm⁻¹)` },
  ],
  why: 'Molecular spectra measure bond lengths to a thousandth of a picometre, trace cold gas between the stars, sense pollutants and propellant leaks — and decide which gases trap Earth’s heat.',
  visual: {
    type: 'mp-molecule',
    title: 'Hydrogen chloride’s infrared band',
    lead: t`Top: the rotational ladders of the ground and the first excited vibrational level, with every allowed jump ($\Delta J = \pm1$). Bottom: the spectrum they make, line heights from the Boltzmann populations at the chosen temperature. Orange: P branch; blue: R branch; violet: the heavier isotope.`,
    tasks: [
      'Find the gap in the middle, near 2886 cm⁻¹: no line is allowed there, because a photon must change J by one.',
      'Compare the spacings: the R lines crowd together to the right, the P lines spread out to the left. The bond is a little longer when vibrating, so B is smaller in v = 1.',
      'Every line has a violet partner about 2 cm⁻¹ lower and a third as strong: H³⁷Cl, with its heavier chlorine. Raise T and watch both branches spread to higher J.',
    ],
    params: { molecule: 'HCl', mode: 'ir', T: 300 },
  },
  example: {
    prompt: t`Carbon monoxide’s lowest rotational line, $J = 1 \leftarrow 0$, is at ${CO.ghz} GHz — the line radio astronomers use to map cold gas across the Galaxy. Find the molecule’s moment of inertia and its bond length.`,
    visual: { type: 'mp-molecule', params: { molecule: 'CO', mode: 'microwave', T: 10, line: 0, isotopes: false, controls: false }, caption: 'Carbon monoxide’s rotational ladder and its microwave absorption lines at 10 K, the J = 1 ← 0 line highlighted. Line heights relative.' },
    steps: [
      { label: 'The line', text: t`Rotational energies are $hB\,J(J+1)$, so $J = 1 \leftarrow 0$ absorbs $hB(2 - 0) = 2hB$: $f = 2B$, and $B = ${fmt(CO.ghz / 2, 7)}$ GHz.` },
      { label: 'Moment of inertia', text: t`$B = \dfrac{\hbar}{4\pi I} = \dfrac{h}{8\pi^2 I}$, so $I = \dfrac{h}{8\pi^2B} = \dfrac{6.626\times10^{-34}}{8\pi^2(${fmt(CO.ghz / 2, 5)}\times10^{9})} = ${tex(CO_I, 4)}$ kg m².` },
      { label: 'Reduced mass', text: t`$\mu = \dfrac{(12.000)(15.995)}{12.000 + 15.995}\ \text{u} = ${fmt(CO.mu, 5)}$ u $= ${tex(CO.mu * U_KG, 4)}$ kg.` },
      { label: 'Bond length', text: t`$r = \sqrt{I/\mu} = ${fmt(rFromB(CO.ghz * 1e9 / 2, CO.mu), 4)}$ pm.` },
      { label: 'Sense check', text: t`A bond of about 0.11 nm is the size of atoms, as it must be. The J = 1 level lies $hf/k_B = ${fmt((H * CO.ghz * 1e9) / 1.380649e-23, 3)}$ K above J = 0, so even 10 K clouds keep it populated — which is why CO, not the far more abundant H₂, shows where cold gas is.` },
    ],
    answer: t`$I = ${tex(CO_I, 3)}$ kg m² and $r = ${fmt(rFromB(CO.ghz * 1e9 / 2, CO.mu), 4)}$ pm (the tabulated $r_e$, at the bottom of the potential, is 112.8 pm).`,
  },
  practice: [
    num({
      id: 'next-line', difficulty: 1,
      gen(r) {
        const J = r.pick([1, 2, 3, 4]), ans = CO.ghz * (J + 1);
        return {
          prompt: t`Carbon monoxide’s $J = 1 \leftarrow 0$ line is at ${CO.ghz} GHz. Treating it as a rigid rotor, at what frequency is the $J = ${J + 1} \leftarrow ${J}$ line, in GHz?`,
          answer: ans, units: 'GHz', tol: { rel: 0.002 },
          errors: [{ value: CO.ghz * (J + 1) * (J + 2) / 2, feedback: t`That is the energy of level ${J + 1}, not the jump: lines sit at $2B(J+1)$, equally spaced.` }, { value: CO.ghz * J, feedback: t`A $J + 1 \leftarrow J$ line is at $2B(J+1)$; for $J = ${J}$ that is ${J + 1} times the first line.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$E_{J+1} - E_J = hB[(J+1)(J+2) - J(J+1)] = 2hB(J+1)$.`, t`The first line is $2B = ${CO.ghz}$ GHz; multiply by $J + 1 = ${J + 1}$.`],
          teach: 'A rigid rotor’s lines are equally spaced, at 2B, 4B, 6B …',
          explain: t`$f = 2B(J+1) = ${J + 1} \times ${CO.ghz} = ${fmt(ans, 6)}$ GHz. Measured lines sit slightly lower (230.538 GHz for $J = 2 \leftarrow 1$): the spinning molecule stretches a little, the centrifugal distortion.`,
          visual: { type: 'mp-molecule', params: { molecule: 'CO', mode: 'microwave', T: 60, line: J, isotopes: false, controls: false, readout: false, hide: ['numbers'] }, caption: 'Carbon monoxide’s rotational lines; the one asked for is gold. The frequency scale is left off.' },
        };
      },
    }),
    num({
      id: 'isotope-bond', difficulty: 2,
      gen(r) {
        const key = r.pick(['13C16O', '12C18O']), L = CO_LINES[key], ans = rFromB(L.ghz * 1e9 / 2, L.mu);
        return {
          prompt: t`The isotopologue ${L.label} has its $J = 1 \leftarrow 0$ line at ${L.ghz} GHz; its reduced mass is ${fmt(L.mu, 5)} u. What bond length does that give, in pm?`,
          answer: ans, units: 'pm', tol: { rel: 0.002 },
          errors: [{ value: rFromB(L.ghz * 1e9, L.mu), feedback: t`The line is at $2B$: halve the frequency first.` }, { value: ans * Math.sqrt(L.mu / 28), feedback: 'Use the reduced mass, not the molecule’s total mass.' }],
          hints: [t`$B = f/2$, $I = h/(8\pi^2 B)$, and $r = \sqrt{I/\mu}$.`, t`$\mu = ${fmt(L.mu, 5)} \times 1.6605\times10^{-27}$ kg.`],
          teach: 'Isotopes change the masses, not the bond: the same bond length must come out of every isotopologue’s rotational constant.',
          explain: t`$r = ${fmt(ans, 4)}$ pm — the same as ordinary CO (113.09 pm) to a hundredth of a picometre. The heavier isotope rotates more slowly, exactly as its larger reduced mass predicts. Comparing lines of isotopologues is how radio astronomers measure isotope ratios in other galaxies.`,
          visual: { type: 'mp-molecule', params: { molecule: 'CO', mode: 'microwave', T: 30, isotopes: true, controls: false, readout: false, hide: ['numbers'] }, caption: 'Rotational lines of ¹²CO and, violet, ¹³CO: the heavier isotope’s lines sit lower in proportion. Frequency scale left off.' },
        };
      },
    }),
    num({
      id: 'force-constant', difficulty: 2,
      gen(r) {
        const [name, w, mu, note] = r.pick([['hydrogen chloride (H³⁵Cl)', 2885.98, MU_HCL, 'its fundamental band'], ['carbon monoxide', 2143.27, CO.mu, 'its fundamental band'], ['hydrogen (H₂)', 4161.17, MS.H / 2, 'its vibration, seen by Raman scattering']]);
        const ans = kFrom(w, mu);
        return {
          prompt: t`The vibration of ${name} is at ${w} cm⁻¹ (${note}); its reduced mass is ${fmt(mu, 5)} u. Treating the bond as a spring, what is its force constant, in N/m?`,
          answer: ans, units: 'N/m', tol: { rel: 0.01 },
          errors: [{ value: ans / (4 * Math.PI ** 2), feedback: t`Use the angular frequency: $\omega = 2\pi c\tilde\nu$, then $k = \mu\omega^2$.` }, { value: ans / 1e4, feedback: t`Convert cm⁻¹ to m⁻¹ (×100) before multiplying by $c$ in m/s.` }],
          hints: [t`$f = c\tilde\nu$ with $\tilde\nu$ in m⁻¹, and $k = \mu(2\pi f)^2$.`, t`$f = (2.998\times10^{8})(${w}\times10^{2}) = ${tex(C * 100 * w, 4)}$ Hz.`],
          teach: 'A vibration wavenumber and a reduced mass give the bond’s stiffness: k = μ(2πcν̃)².',
          explain: t`$k = ${fmt(ans, 3)}$ N/m. ${name.startsWith('carbon') ? 'Carbon monoxide’s triple bond is about four times stiffer than HCl’s single bond.' : 'A few hundred newtons per metre: a stiff spring, stretched by molecular forces of nanonewtons.'} (These use the fundamental; the anharmonic $\omega_e$ gives values a few per cent higher.)`,
          visual: { type: 'graph', params: { x: [-0.6, 0.9], y: [0, 6], aspect: 'wide', xlabel: 'stretch r − rₑ (in units of 0.1 nm)', ylabel: 'energy', yticks: 0, axesAt: 'edge', curves: [{ fn: '5*(1 - exp(-2.5*x))^2', domain: [-0.35, 0.9], color: 'accent', width: 2.4 }, { fn: '31.25*x^2', domain: [-0.42, 0.42], color: 'ink3', width: 1.6, dash: true }], hlines: [0.6, 1.7, 2.7].map((y) => ({ y, color: 'ink4' })) }, caption: 'A bond’s potential energy (blue, a Morse curve) and the parabola of a spring that matches it at the bottom (dashed), with the lowest vibrational levels. Schematic shape, no scales.' },
        };
      },
    }),
    num({
      id: 'isotope-shift', difficulty: 2,
      gen(r) {
        const [from, to, nu0, muA, muB, meas] = r.pick([['H³⁵Cl', 'D³⁵Cl', 2885.98, MU_HCL, muOf(MS.D, MS.Cl35), 2090.78], ['H³⁵Cl', 'H³⁷Cl', 2885.98, MU_HCL, muOf(MS.H, MS.Cl37), 2883.88], ['¹²C¹⁶O', '¹³C¹⁶O', 2143.27, CO.mu, muOf(MS.C13, MS.O16), 2096.07]]);
        const ans = nu0 * Math.sqrt(muA / muB);
        return {
          prompt: t`${from}’s fundamental band is centred at ${nu0} cm⁻¹. Assuming the same spring (force constant) and a harmonic vibration, predict where ${to}’s is, in cm⁻¹. (Reduced masses: ${fmt(muA, 5)} u and ${fmt(muB, 5)} u.)`,
          answer: ans, units: 'cm^-1', tol: { rel: 2e-4 },
          errors: [{ value: nu0 * (muA / muB), feedback: t`Frequency goes as $1/\sqrt{\mu}$, not $1/\mu$.` }, { value: nu0 * Math.sqrt(muB / muA), feedback: 'Heavier atoms vibrate more slowly: the frequency must go down.' }],
          hints: [t`$\tilde\nu \propto \sqrt{k/\mu}$ with $k$ the same.`, t`$\tilde\nu' = ${nu0}\sqrt{${fmt(muA, 5)}/${fmt(muB, 5)}}$.`],
          teach: 'Isotopes share the bond but not the mass, so vibration frequencies scale as 1/√μ.',
          explain: t`$\tilde\nu' = ${fmt(ans, 6)}$ cm⁻¹; measured, ${meas} cm⁻¹. ${to === 'D³⁵Cl' ? 'The 21 cm⁻¹ miss is anharmonicity: the measured band centre includes a correction that scales differently with mass. The mass scaling of the true harmonic frequency ωₑ is exact.' : 'The prediction is within a fraction of a wavenumber.'}`,
          visual: { type: 'mp-molecule', params: { molecule: to.startsWith('D') ? 'DCl' : to.includes('13') ? 'CO' : 'HCl', mode: 'ir', T: 300, panels: ['spectrum'], controls: false, readout: false, hide: ['numbers'], isotopes: !to.startsWith('D') }, caption: 'The band of the heavier molecule (wavenumber scale left off).' },
        };
      },
    }),
    mcq({
      id: 'no-center', difficulty: 2,
      prompt: 'Hydrogen chloride’s infrared band has lines on both sides of 2886 cm⁻¹ but none at it. Why?',
      choices: [
        'A photon carries one unit of angular momentum, so J must change by ±1; a pure vibrational jump with J unchanged is forbidden for HCl',
        'The line at the centre is there, but too weak to see at room temperature',
        'Molecules cannot vibrate without rotating, so v and J must both change by the same amount',
        'The centre line is absorbed by the H³⁷Cl molecules',
      ],
      answer: 0,
      why: {
        1: 'It is not weak but absent: no amount of gas or temperature makes it appear.',
        2: 'A molecule in J = 0 vibrates without rotating; the rule is about what one photon can change.',
        3: 'H³⁷Cl has its own band, slightly lower, with the same gap.',
      },
      hints: ['A photon has spin 1. What does absorbing one do to the molecule’s angular momentum?'],
      teach: 'Electric-dipole transitions change J by ±1, so a diatomic band has P and R branches and a hole at its centre.',
      explain: 'Angular momentum is conserved: the photon’s one unit must go into the molecule’s rotation, so ΔJ = ±1 and there is no Q branch (ΔJ = 0) for a molecule like HCl. The gap between P(1) and R(0) is about 4B wide, twice the line spacing.',
      visual: { type: 'mp-molecule', params: { molecule: 'HCl', mode: 'ir', T: 300, isotopes: false, controls: false, readout: false }, caption: 'Hydrogen chloride’s fundamental band at 300 K: the allowed jumps (top) and the lines they make (bottom).' },
    }),
    multi({
      id: 'ir-active', difficulty: 2,
      prompt: 'A vibration absorbs infrared light only if it changes the molecule’s electric dipole moment. Which of these do?',
      choices: ['the stretch of carbon monoxide (CO)', 'the stretch of hydrogen chloride (HCl)', 'the stretch of nitrogen (N₂)', 'the stretch of oxygen (O₂)', 'the bend of carbon dioxide (CO₂)', 'the symmetric stretch of carbon dioxide'],
      answer: [0, 1, 4],
      why: {
        2: 'Two identical atoms share the electrons evenly: N₂ has no dipole moment however far its bond stretches.',
        3: 'O₂ is symmetric too — no dipole, no infrared vibrational absorption.',
        5: 'Both oxygens move out together: the molecule stays symmetric and its dipole stays zero.',
      },
      hints: ['Is the molecule symmetric before the vibration? Does the vibration break the symmetry?'],
      teach: 'Infrared absorption needs an oscillating dipole: N₂, O₂ and CO₂’s symmetric stretch cannot absorb; CO, HCl and CO₂’s bend can.',
      explain: 'CO and HCl have permanent dipoles that change as the bond stretches. N₂ and O₂ — 99% of the air — are transparent in the infrared. CO₂ has no permanent dipole, but its bend and asymmetric stretch create an oscillating one, so it absorbs strongly at 15 µm and 4.3 µm.',
      visual: co2Modes,
    }),
    code({
      id: 'rovib-fit', difficulty: 3,
      prompt: t`Label the lines of HCl’s band by $m$: $m = J + 1$ for R($J$) and $m = -J$ for P($J$). Then $\tilde\nu = \nu_0 + (B_1 + B_0)m + (B_1 - B_0)m^2$. Fit a quadratic to the measured lines with \`np.polyfit(m, nu, 2)\` (it returns the $m^2$, $m$ and constant coefficients, in that order), find \`nu0\`, \`B0\` and \`B1\` in cm⁻¹, and the bond length \`r0\` in pm from $B_0 = h/(8\pi^2 c\,\mu r^2)$ (with $c$ in cm/s).`,
      starter: t`import numpy as np

m  = np.array([${HCL_LINES.map((l) => l[0]).join(', ')}])
nu = np.array([${HCL_LINES.map((l) => l[1].toFixed(2)).join(', ')}])     # cm^-1, H35Cl

h = 6.62607015e-34       # J s
c = 2.99792458e10        # cm/s
mu = ${MU_HCL.toFixed(7)} * 1.66053906892e-27   # kg

nu0 = B0 = B1 = r0 = None

print(nu0, B0, B1, r0)
`,
      answer: t`import numpy as np

m  = np.array([${HCL_LINES.map((l) => l[0]).join(', ')}])
nu = np.array([${HCL_LINES.map((l) => l[1].toFixed(2)).join(', ')}])     # cm^-1, H35Cl

h = 6.62607015e-34       # J s
c = 2.99792458e10        # cm/s
mu = ${MU_HCL.toFixed(7)} * 1.66053906892e-27   # kg

c2, c1, nu0 = np.polyfit(m, nu, 2)
B0 = (c1 - c2) / 2
B1 = (c1 + c2) / 2
r0 = np.sqrt(h / (8 * np.pi**2 * c * B0 * mu)) * 1e12    # m -> pm

print(nu0, B0, B1, r0)`,
      tests: [
        { name: t`the band origin $\nu_0$ is ${fmt(FIT.c0, 6)} cm⁻¹`, code: `abs(nu0 - ${r6(FIT.c0)}) < 0.01` },
        { name: t`$B_0 = ${fmt(FIT.B0, 4)}$ cm⁻¹ and $B_1 = ${fmt(FIT.B1, 4)}$ cm⁻¹`, code: `abs(B0 - ${r6(FIT.B0)}) < 0.002 and abs(B1 - ${r6(FIT.B1)}) < 0.002` },
        { name: t`the bond length $r_0$ is ${fmt(FIT.r0, 4)} pm`, code: `abs(r0 - ${r6(FIT.r0)}) < 0.05` },
        { name: 'the results are printed', code: '_stdout.count(".") >= 4' },
      ],
      hints: [t`\`c2, c1, nu0 = np.polyfit(m, nu, 2)\`; then $B_1 + B_0 = c_1$ and $B_1 - B_0 = c_2$.`, t`$cB_0$ (cm/s times cm⁻¹) is a frequency in Hz, so $r = \sqrt{h/(8\pi^2cB_0\mu)}$ comes out in metres: multiply by $10^{12}$ for pm.`],
      teach: 'Fitting a band’s lines against m separates the vibration (ν₀) from the rotation of each level (B₀, B₁) — and B₀ gives the bond length.',
      explain: t`$\nu_0 = ${fmt(FIT.c0, 6)}$ cm⁻¹, $B_0 = ${fmt(FIT.B0, 4)}$ and $B_1 = ${fmt(FIT.B1, 4)}$ cm⁻¹, so $r_0 = ${fmt(FIT.r0, 4)}$ pm. $B_1 < B_0$: averaged over a vibration the bond is longer — the potential is softer on the stretched side. Eight lines from a student spectrometer pin the bond to a tenth of a picometre.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-greenhouse', difficulty: 2, transfer: true,
      prompt: t`Carbon dioxide’s bending vibration absorbs at ${CO2_BEND} cm⁻¹. What wavelength is that, in µm — and compare it with the peak of Earth’s thermal emission at 288 K.`,
      answer: 1e4 / CO2_BEND, units: 'um', tol: { rel: 0.005 },
      errors: [{ value: CO2_BEND / 1e4, feedback: t`Invert: $\lambda = 1/\tilde\nu$, and 1 cm⁻¹ corresponds to $10^4$ µm.` }],
      hints: [t`$\lambda = 1/\tilde\nu = 1/(${CO2_BEND}\ \text{cm}^{-1})$ in cm; 1 cm $= 10^4$ µm.`],
      teach: 'CO₂’s bending mode sits at 15 µm, in the middle of the infrared that Earth radiates to space.',
      explain: t`$\lambda = 10^4/${CO2_BEND} = ${fmt(1e4 / CO2_BEND, 4)}$ µm. Earth’s surface radiates most strongly near $b/T = ${fmt(2.897771955e3 / 288, 3)}$ µm, and strongly at 15 µm too. Stated honestly: at the band’s centre the air is already opaque, so the 15 µm light that escapes to space is emitted high up, where the air is cold and radiates less. Adding CO₂ widens the band’s wings and lifts that emitting level higher and colder, so Earth sheds less heat until it warms: about 3.9 W/m² less for a doubling of CO₂ (IPCC AR6).`,
      visual: { type: 'mp-blackbody', params: { T: 288, axis: 'lambda', controls: false, readout: false, swatch: false, band: false }, caption: 'The thermal emission of a 288 K blackbody — Earth’s surface, roughly. Where does 667 cm⁻¹ fall?' },
    }),
    num({
      id: 'cp-gap', difficulty: 3,
      gen(r) {
        const [lab, p1, r0, mu] = r.pick([['H³⁵Cl', 2865.10, 2906.25, MU_HCL], ['D³⁵Cl', ...DCL_GAP, muOf(MS.D, MS.Cl35)]]);
        const B = (r0 - p1) / 4;
        return {
          prompt: t`In ${lab}’s infrared band the lines on either side of the gap are P(1) at ${p1} cm⁻¹ and R(0) at ${r0} cm⁻¹${lab.startsWith('D') ? ' (computed from its tabulated constants)' : ' (measured)'}. The gap is about $4B$. Estimate $B$, in cm⁻¹.`,
          answer: B, units: 'cm^-1', tol: { rel: 0.005 },
          errors: [{ value: (r0 - p1) / 2, feedback: t`P(1) is $\nu_0 - 2B$ and R(0) is $\nu_0 + 2B$: the gap is $4B$, twice the ordinary spacing.` }],
          hints: [t`R(0) $= \nu_0 + 2B$ and P(1) $= \nu_0 - 2B$ (taking $B_0 \approx B_1$).`, t`$B = (${r0} - ${p1})/4$.`],
          teach: 'The gap at a band’s centre is 4B: twice the spacing of the lines on either side.',
          explain: t`$B = ${fmt(B, 4)}$ cm⁻¹, which with $\mu = ${fmt(mu, 5)}$ u gives $r = ${fmt(rFromB(B * C * 100, mu), 4)}$ pm — within a picometre of the careful fit. One pair of lines is enough for a good estimate of a bond length.`,
          visual: { type: 'mp-molecule', params: { molecule: lab.startsWith('D') ? 'DCl' : 'HCl', mode: 'ir', T: 300, panels: ['spectrum'], isotopes: false, controls: false, readout: false, hide: ['numbers'] }, caption: 'The band, with its central gap between P(1) and R(0). Wavenumber scale left off.' },
        };
      },
    }),
    mcq({
      id: 'cp-co-tracer', difficulty: 2, transfer: true,
      prompt: 'Cold molecular clouds, where stars form, are mostly H₂ at 10–20 K. Yet astronomers map them with the 115 GHz line of carbon monoxide, about ten thousand times rarer. Why not H₂ itself?',
      choices: [
        'H₂ has no dipole moment, so it has no ordinary rotational lines; its weakest allowed one needs a level about 510 K up, which a 20 K cloud barely populates. CO’s J = 1 level is only 5.5 K up',
        'H₂ molecules are too light to rotate',
        'H₂ absorbs at 115 GHz too, but Earth’s atmosphere blocks it',
        'At 20 K hydrogen is frozen solid and cannot emit',
      ],
      answer: 0,
      why: {
        1: 'Light molecules rotate fastest of all: H₂’s rotational constant is about 60 cm⁻¹, thirty times CO’s.',
        2: 'H₂ has no line at 115 GHz: with no dipole, it has no electric-dipole rotational spectrum at all.',
        3: 'In the near-vacuum of a cloud, H₂ stays a gas even at 10 K.',
      },
      hints: ['What does a molecule need in order to absorb or emit a photon by rotating?', 'Compare hB(2)/k for CO with the clouds’ temperature.'],
      teach: 'Only molecules with a dipole moment have rotational lines; CO’s low-lying J = 1 level makes it the thermometer and tracer of cold gas.',
      explain: t`A rotating molecule radiates only if it has an electric dipole to swing round. H₂ has none; its rotation shows only in a weak quadrupole line from $J = 2$, about 510 K above the ground state — unexcited at 20 K. CO has a small dipole and a $J = 1$ level just $${fmt((H * CO.ghz * 1e9) / 1.380649e-23, 2)}$ K up, so collisions keep it excited and it shines at 115 GHz; astronomers then scale from CO to H₂.`,
      visual: { type: 'mp-molecule', params: { molecule: 'CO', mode: 'microwave', T: 20, isotopes: false, controls: false, readout: false }, caption: 'Carbon monoxide’s rotational levels and lines at 20 K: only the lowest few are excited.' },
    }),
  ],
  sources: [
    { label: 'Huber & Herzberg, Constants of Diatomic Molecules (1979), via the NIST Chemistry WebBook', url: 'https://webbook.nist.gov/chemistry/' },
    { label: 'CDMS: Cologne Database for Molecular Spectroscopy (CO line frequencies)', url: 'https://cdms.astro.uni-koeln.de/' },
    { label: 'OpenStax University Physics Vol. 3, §9.2 Molecular spectra', url: 'https://openstax.org/books/university-physics-volume-3/pages/9-2-molecular-spectra' },
    { label: 'IPCC AR6 WG1 (2021), Chapter 7: The Earth’s energy budget, climate feedbacks and climate sensitivity', url: 'https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-7/' },
    { label: 'Bolatto, Wolfire & Leroy (2013), The CO-to-H₂ conversion factor, ARA&A 51, 207', url: 'https://doi.org/10.1146/annurev-astro-082812-140944' },
  ],
});
