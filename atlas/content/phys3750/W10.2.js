// Bound states as standing waves: separate ψ = φ(x)e^{−iEt/ħ} and the
// time-independent equation in a box with impenetrable walls is the fixed–fixed
// string problem of W5.2 — the same sine shapes and the same k_n = nπ/L. What
// differs is the frequency ladder: the string's ω ∝ k gives evenly spaced
// harmonics, Schrödinger's ω ∝ k² gives E_n ∝ n². Superpositions slosh at the
// difference frequency (beats, W2.2); a standing wave is two travelling waves
// with momenta ±ħk_n. Context: a GaAs quantum-well infrared photodetector.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;
const H = 6.62607015e-34, ME = 9.1093837139e-31, QE = 1.602176634e-19, HC_EVNM = 1239.841984;
const E1eV = (L, m = 1) => (H * H) / (8 * m * ME * (L * 1e-9) ** 2) / QE;   // ground level of an infinite well, eV (L in nm, m in electron masses)
const MGAAS = 0.067;   // conduction-band effective mass of GaAs, in electron masses

// the worked example: an 8 nm GaAs quantum well
const EX = (() => {
  const L = 8, E1 = E1eV(L, MGAAS), E2 = 4 * E1, dE = E2 - E1;
  return { L, E1, E2, dE, lam: HC_EVNM / dE / 1000 };
})();

/** The infinite well as a still picture. */
const well = (p, caption) => ({ type: 'mp-schrodinger', params: { mode: 'bound', well: 'infinite', L: 1, mass: 1, controls: false, readout: false, ...p }, caption });

export default lesson({
  id: 'phys3750.W10.2',
  title: 'Bound states as standing waves',
  minutes: 15, difficulty: 3,
  intro: t`Look for solutions that oscillate at one frequency, $\psi = \varphi(x)\,e^{-iEt/\hbar}$ — separation of variables, as for the [string’s standing waves](#/lesson/phys3750.W5.2). The time part leaves $-\frac{\hbar^2}{2m}\varphi'' + V\varphi = E\varphi$. In a box with impenetrable walls, $V = 0$ inside and $\varphi = 0$ at $x = 0$ and $x = L$, so $\varphi'' = -k^2\varphi$ with fixed ends: **exactly the string’s problem**. The shapes are the string’s harmonics, $\varphi_n = \sqrt{2/L}\,\sin(n\pi x/L)$, with $k_n = n\pi/L$. Only the frequency ladder differs, because $\omega = \hbar k^2/2m$ instead of $\omega = vk$:

$$E_n = \hbar\omega_n = \frac{n^2\pi^2\hbar^2}{2mL^2}$$

Boundary conditions quantize $k$ on a string and in an atom alike; the dispersion relation decides what that does to the frequencies. [The infinite square well](#/lesson/phys2710.MP7.2) treats the same box as quantum mechanics.`,
  symbols: [
    { tex: 'E_n', text: 'the energy of the $n$th stationary state, $\\hbar\\omega_n$, in J (or eV)' },
    { tex: 'n', text: 'the mode number, $1, 2, 3, \\dots$ — the state has $n - 1$ nodes inside the box, like the $n$th harmonic' },
    { tex: 'L', text: 'the width of the box, in m' },
    { tex: 'm', text: 'the particle’s mass, in kg (in a crystal, an effective mass)' },
    { tex: '\\hbar', text: 'the reduced Planck constant, $1.0546\\times10^{-34}$ J s' },
    { tex: '\\varphi_n(x)', text: 'the spatial shape, $\\sqrt{2/L}\\,\\sin(n\\pi x/L)$, normalised so $\\int_0^L|\\varphi_n|^2dx = 1$; units m⁻¹ᐟ²' },
  ],
  why: t`Every quantized level — in quantum dots, nuclei, the infrared detectors on satellites — is a standing wave whose allowed wavenumbers come from boundary conditions, exactly as for a guitar string.`,
  visual: {
    type: 'mp-schrodinger',
    title: 'The string’s harmonics, the box’s levels',
    lead: t`Above: the box and its levels; below: the chosen state $\varphi_n$ or $|\varphi_n|^2$. Compare the shapes with a string’s harmonics and the spacing with theirs.`,
    tasks: [
      t`Step through $n = 1, 2, 3, 4$: the shapes are the string’s harmonics, with $n - 1$ nodes. But the levels go 1, 4, 9, 16 times $E_1$ — not 1, 2, 3, 4.`,
      t`Double the width $L$. A string’s fundamental would halve; here every level drops to a quarter.`,
      t`Lower the mass (a light effective mass, as in a semiconductor): every level rises in proportion, $E_n \propto 1/m$.`,
    ],
    params: { mode: 'bound', well: 'infinite', L: 1, mass: 1, n: 1, show: 'psi', controls: ['n', 'L', 'mass', 'show'] },
    caption: t`An ideal box: perfectly rigid walls, so $\varphi$ vanishes there exactly. Real wells are finite, and their levels sit a little lower. Energies in eV, widths in nm, mass in electron masses.`,
  },
  example: {
    prompt: t`A quantum-well infrared photodetector (QWIP) is a layer of gallium arsenide ${EX.L} nm thick between layers of a wider-gap alloy. Electrons inside move as free particles of effective mass $m^* = ${MGAAS}\,m_e$, trapped between the walls. Model it as an infinite well: find $E_1$ and $E_2$, and the wavelength of the light that lifts an electron from one to the other. How would the answer change if the levels were spaced like a string’s?`,
    steps: [
      { label: 'Same shapes', text: t`Inside, $\varphi'' = -k^2\varphi$ with $\varphi(0) = \varphi(L) = 0$: so $\varphi_n \propto \sin(n\pi x/L)$ and $k_n = n\pi/L$, as for a string fixed at both ends.` },
      { label: 'Ground level', text: t`$E_1 = \dfrac{\pi^2\hbar^2}{2m^*L^2} = \dfrac{h^2}{8m^*L^2}$. With $h^2/8m_e = 0.376\ \text{eV nm}^2$: $E_1 = \dfrac{0.376}{${MGAAS}\times${EX.L}^2} = ${tn(EX.E1)}$ eV.` },
      { label: 'Next level', text: t`$E_2 = 4E_1 = ${tn(EX.E2)}$ eV, so the gap is $3E_1 = ${tn(EX.dE)}$ eV.` },
      { label: 'Wavelength', text: t`$\lambda = hc/\Delta E = (1240\ \text{eV nm})/${tn(EX.dE)}\ \text{eV} = ${tn(EX.lam)}\ \mu\text{m}$: mid-infrared, in the 3–5 μm window where the atmosphere is clear and warm objects glow.` },
      { label: 'String spacing', text: t`If the levels went as $n$ instead of $n^2$, the gap would be $E_1$ alone and the wavelength three times longer. The $n^2$ ladder comes from $\omega \propto k^2$, not from the walls.` },
      { label: 'Honest check', text: t`Real barriers are a few tenths of an eV high, so the wave leaks into them, the effective width grows and the levels sit lower; designers solve the finite well. The infinite well gets the size and the scaling right.` },
    ],
    answer: t`$E_1 = ${tn(EX.E1)}$ eV, $E_2 = ${tn(EX.E2)}$ eV; the $1 \to 2$ transition absorbs light near $${tn(EX.lam)}\ \mu\text{m}$. Evenly spaced levels would have put it at three times that wavelength.`,
    visual: well({ L: 5, mass: MGAAS, n: 2, show: 'psi', top: 3, hide: ['energy', 'scale'] }, t`Levels and the $n = 2$ state of a GaAs well with infinite walls (an idealisation), drawn 5 nm wide: the shapes and the $1 : 4 : 9$ ladder do not depend on the width.`),
  },
  practice: [
    match({
      id: 'string-box', difficulty: 2,
      prompt: t`Match each feature to how it compares between a string fixed at both ends (length $L$) and a particle in a box (width $L$).`,
      visual: well({ n: 3, show: 'psi', top: 4, hide: ['energy'] }, t`The $n = 3$ state of a box — the same shape as a string’s third harmonic.`),
      left: [t`The shape of mode $n$`, t`The allowed wavenumbers`, t`The frequency of mode $n$`, t`What sets the frequency scale`],
      right: ['sin(nπx/L) for both', 'kₙ = nπ/L for both', 'string: ∝ n; box: ∝ n²', 'string: v = √(T/μ); box: ħ/2m', 'string: ∝ n²; box: ∝ n', 'kₙ = 2nπ/L for the box only'],
      answer: [0, 1, 2, 3],
      hints: ['Boundary conditions fix the shapes and the wavenumbers; the equation’s dispersion relation turns wavenumbers into frequencies.', 'String: ω = vk. Box: ω = ħk²/2m.'],
      teach: 'Same boundary conditions, same shapes and wavenumbers; different dispersion relations, different frequency ladders.',
      explain: t`Both solve $\varphi'' = -k^2\varphi$ with $\varphi = 0$ at the ends, so $\varphi_n \propto \sin(n\pi x/L)$ and $k_n = n\pi/L$. The string turns $k_n$ into $\omega_n = vk_n \propto n$; the box into $\omega_n = \hbar k_n^2/2m \propto n^2$.`,
    }),
    num({
      id: 'ladder', difficulty: 2,
      gen(r) {
        const [na, nb] = r.pick([[2, 3], [3, 5], [2, 5], [4, 3], [3, 4]]), Ea = r.pick([0.8, 1.2, 2.7, 4.5]);
        const Eb = Ea * (nb / na) ** 2;
        return {
          prompt: t`In an infinite well, the level $n = ${na}$ has energy ${Ea} eV. What is the energy of the level $n = ${nb}$, in eV?`,
          visual: well({ n: na, show: 'psi', top: 5, hide: ['energy', 'scale'] }, t`The levels of a box and the $n = ${na}$ state; the energy numbers are hidden.`),
          answer: Eb, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: (Ea * nb) / na, feedback: t`That spaces the levels like a string’s harmonics, $\propto n$. In a box $E_n \propto n^2$.` }],
          hints: [t`$E_n = n^2E_1$.`, t`$E_{${nb}} = (${nb}/${na})^2\,E_{${na}}$.`],
          teach: t`Box levels go as $n^2$: the ratio of two levels is the square of the ratio of their mode numbers.`,
          explain: t`$E_1 = ${Ea}/${na * na} = ${tn(Ea / (na * na))}$ eV, so $E_{${nb}} = ${nb * nb}E_1 = ${tn(Eb)}$ eV.`,
        };
      },
    }),
    mcq({
      id: 'why-n2', difficulty: 2,
      prompt: t`A guitar string’s harmonics are evenly spaced in frequency, while a box’s energy levels spread apart as $n^2$ — though both have the same boundary conditions and the same sine shapes. What causes the difference?`,
      visual: curvesPic([{ fn: 'x', color: 'violet', width: 2.2, label: 'string: ω = v k', labelAt: 2.2, labelDx: -110, labelDy: -10 }, { fn: 'x^2/4', color: 'accent', width: 2.2, label: 'box: ω = ħk²/2m', labelAt: 3.3, labelDx: 10, labelDy: 12 }], [0, 4.2], [0, 4.5], t`The two dispersion relations (illustrative units), with the allowed wavenumbers $k_n = n\pi/L$ marked: equal steps in $k$ give equal steps in $\omega$ on the line, growing steps on the parabola.`, { xlabel: 'k (units of π/L)', ylabel: 'ω', vlines: [1, 2, 3, 4].map((x) => ({ x, color: 'ink4' })) }),
      choices: [
        t`The dispersion relation: $\omega \propto k$ for the string, $\omega \propto k^2$ for Schrödinger’s equation`,
        t`The walls of a box are softer than a string’s fixed ends, so higher modes push further into them`,
        t`Normalisation: $\int|\varphi|^2dx = 1$ squeezes the higher modes and raises their energies`,
        t`Quantum energies must be whole multiples of $hf$, which forces a square law`,
      ],
      answer: 0,
      why: {
        1: t`These walls are perfectly rigid, exactly like the string’s ends: $\varphi = 0$ there. Soft walls would lower the high levels, not make the $n^2$ law.`,
        2: 'Normalisation fixes the amplitude of each mode, not its frequency. A string’s modes can be normalised too.',
        3: t`$E = hf$ links one level’s energy to its own frequency; it does not say the frequencies are multiples of one another.`,
      },
      hints: ['Both problems give the same allowed wavenumbers. What turns a wavenumber into a frequency?', t`Put $k_n = n\pi/L$ into each $\omega(k)$.`],
      teach: 'Boundary conditions pick the wavenumbers; the dispersion relation picks the frequencies.',
      explain: t`$k_n = n\pi/L$ for both. The string’s $\omega = vk$ gives $\omega_n \propto n$; Schrödinger’s $\omega = \hbar k^2/2m$ gives $\omega_n \propto n^2$. A stiff piano string, whose dispersion bends upward a little, has slightly stretched overtones for the same reason.`,
    }),
    num({
      id: 'slosh-period', difficulty: 3,
      gen(r) {
        const L = r.pick([0.5, 0.8, 1, 2]);
        const E1 = E1eV(L), dE = 3 * E1, T = (H / QE / dE) * 1e15;
        return {
          prompt: t`An electron in an infinite well ${L} nm wide is put in the superposition $(\varphi_1e^{-iE_1t/\hbar} + \varphi_2e^{-iE_2t/\hbar})/\sqrt2$. Its probability density sloshes from side to side. What is the period of the sloshing, in fs? ($E_1 = h^2/8m_eL^2$, and $h^2/8m_e = 0.376\ \text{eV nm}^2$.)`,
          visual: well({ L, super: [1, 2], play: false, show: 'prob', top: 3, hide: ['energy', 'moments'] }, t`$|\psi|^2$ of the two-state superposition at one instant: lopsided, and it swings back and forth.`),
          answer: T, units: 'fs', tol: { rel: 0.01 },
          errors: [
            { value: (H / QE / E1) * 1e15, feedback: t`The density beats at the *difference* frequency, $(E_2 - E_1)/h$, like two beating oscillators — not at $E_1/h$.` },
            { value: (H / QE / dE) * 1e15 / (2 * Math.PI), feedback: t`$\hbar/\Delta E$ is $1/\omega$, not the period. Use $T = h/\Delta E = 2\pi\hbar/\Delta E$.` },
          ],
          hints: [t`$|\psi|^2$ contains $\cos\big((E_2 - E_1)t/\hbar\big)$: the cross term between the two states.`, t`$T = h/(E_2 - E_1) = h/3E_1$, with $h = 4.136\times10^{-15}$ eV s.`],
          teach: t`A superposition of two standing waves beats at their difference frequency, $(E_2 - E_1)/h$.`,
          explain: t`$E_1 = ${tn(E1)}$ eV, $E_2 - E_1 = ${tn(dE)}$ eV, $T = h/\Delta E = ${tn(T)}$ fs. These are the beats of [two coupled oscillators](#/lesson/phys3750.W2.2): each stationary state alone has a constant $|\psi|^2$; only the mixture moves.`,
        };
      },
    }),
    num({
      id: 'window-prob', difficulty: 3,
      gen(r) {
        const n = r.pick([1, 3, 5, 7]);
        const P = 0.25 - Math.sin((n * Math.PI) / 2) / (2 * n * Math.PI);
        return {
          prompt: t`A particle in a box of width $L$ is in the state $n = ${n}$, $\varphi = \sqrt{2/L}\,\sin(${n}\pi x/L)$. What is the probability of finding it in the left quarter, $0 < x < L/4$? Give three decimal places.`,
          visual: well({ n, show: 'prob', window: [0, 0.25], top: 7, hide: ['prob', 'energy'] }, t`$|\varphi_{${n}}|^2$ with the left quarter shaded ($L = 1$ nm here; the answer does not depend on $L$).`),
          answer: P, tol: { rel: 0, abs: 0.0015 }, integrand: `2*sin(${n}*pi*x)^2`, limits: [0, 0.25],
          errors: [{ value: 0.25, feedback: t`A quarter is the classical answer — a particle bouncing at constant speed spends equal time everywhere. The standing wave’s $\sin^2$ puts more or less than a quarter in the end region.` }],
          hints: [t`$P = \int_0^{L/4}\frac2L\sin^2\frac{${n}\pi x}{L}\,dx$. Use $\sin^2u = \tfrac12(1 - \cos2u)$.`, t`The result is $\tfrac14 - \dfrac{\sin(n\pi/2)}{2n\pi}$.`],
          teach: t`Probabilities in a standing wave follow $\sin^2$: near a wall, less than the classical share in the ground state.`,
          explain: t`$P = \tfrac14 - \dfrac{\sin(${n}\pi/2)}{2\cdot${n}\pi} = ${P.toFixed(3)}$. As $n$ grows the correction shrinks like $1/n$ and the classical $\tfrac14$ returns — the correspondence principle.`,
        };
      },
    }),
    mcq({
      id: 'momentum', difficulty: 3,
      prompt: t`A particle in a box is in the state $n$, $\varphi_n \propto \sin(k_nx)$. You measure its momentum. Roughly what do you find?`,
      visual: curvesPic([{ fn: 'sin(3*pi*x)', color: 'accent', width: 2.4, domain: [0, 1], label: 'sin(kx)', labelAt: 0.16, labelDy: -8 }, { fn: '0.5*cos(3*pi*x - 1.1)', color: 'gold', dash: [5, 4], width: 1.3, domain: [0, 1] }, { fn: '-0.5*cos(3*pi*x + 1.1)', color: 'violet', dash: [5, 4], width: 1.3, domain: [0, 1] }], [-0.05, 1.05], [-1.3, 1.3], t`A standing wave (blue) is the sum of two waves running opposite ways; dashed, the two travelling parts at one instant (shapes illustrative).`, { xlabel: 'x / L', ylabel: '', arrows: [{ from: [0.62, 1.12], to: [0.8, 1.12], color: 'gold' }, { from: [0.38, 1.12], to: [0.2, 1.12], color: 'violet' }] }),
      choices: [
        t`Either about $+\hbar k_n$ or about $-\hbar k_n$, with equal chances: the standing wave is two travelling waves`,
        t`Exactly zero: a standing wave does not move, so neither does the particle`,
        t`Exactly $\hbar k_n/2$, half of each travelling wave’s momentum`,
        t`Any value between $-\hbar k_n$ and $+\hbar k_n$, all equally likely, as for a bouncing ball`,
      ],
      answer: 0,
      why: {
        1: t`The *average* is zero, because the two directions are equally likely. A single measurement finds one of them.`,
        2: t`Momentum $\hbar k$ belongs to each travelling wave $e^{\pm ikx}$; nothing halves it.`,
        3: t`A bouncing ball has speed $|v|$ all the time, so even classically its momentum is $\pm mv$, not spread evenly in between.`,
      },
      hints: [t`$\sin(kx) = \dfrac{e^{ikx} - e^{-ikx}}{2i}$.`, t`Each $e^{\pm ikx}$ has momentum $\pm\hbar k$.`],
      teach: t`A standing wave is two counter-propagating travelling waves, so its momentum is $\pm\hbar k_n$, not zero.`,
      explain: t`$\sin(k_nx) = (e^{ik_nx} - e^{-ik_nx})/2i$: equal parts momentum $+\hbar k_n$ and $-\hbar k_n$. The walls cut the sine off, so the momentum is really spread over a width of about $h/L$ around each value — sharp only for large $n$. A string’s standing wave is the same two travelling waves of [d’Alembert](#/lesson/phys3750.W5.1).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-qwip', difficulty: 3, transfer: true,
      gen(r) {
        const lam = r.pick([4, 5, 8, 10]);
        const E = HC_EVNM / (lam * 1000), L = Math.sqrt((3 * 0.37603) / (MGAAS * E));
        return {
          prompt: t`A thermal camera for an Earth-observation satellite needs a GaAs quantum well that absorbs at ${lam} μm through the $1 \to 2$ transition. Modelling the well as infinite, with effective mass $m^* = ${MGAAS}\,m_e$ and $h^2/8m_e = 0.376\ \text{eV nm}^2$, how wide should it be, in nm? ($hc = 1240$ eV nm.)`,
          visual: well({ L: 5, mass: MGAAS, n: 2, show: 'psi', top: 3, hide: ['energy', 'scale'] }, t`A GaAs well’s first two levels (width not to the answer’s scale). Infinite walls are an idealisation; real designs solve the finite well.`),
          answer: L, units: 'nm', tol: { rel: 0.01 },
          errors: [
            { value: L / Math.sqrt(3), feedback: t`The photon must supply $E_2 - E_1 = 3E_1$, not $E_1$.` },
            { value: L * Math.sqrt(MGAAS), feedback: t`Use the effective mass, $${MGAAS}\,m_e$: a lighter mass raises every level, so the well must be wider.` },
          ],
          hints: [t`Photon energy: $E = hc/\lambda = 1240/${lam * 1000}$ eV.`, t`Set $3E_1 = 3\times\dfrac{0.376\ \text{eV nm}^2}{${MGAAS}\,L^2} = E$ and solve for $L$.`],
          teach: t`A box’s level spacing scales as $1/mL^2$: to absorb longer wavelengths, widen the well.`,
          explain: t`$E = ${tn(E)}$ eV, so $L = \sqrt{3\times0.376/(${MGAAS}\times${tn(E)})} = ${tn(L)}$ nm — a few tens of atomic layers. In practice the finite barriers make the right width somewhat smaller.`,
        };
      },
    }),
    num({
      id: 'cp-gap', difficulty: 2,
      gen(r) {
        const [na, nb] = r.pick([[2, 3], [3, 4], [1, 3], [2, 4]]), E1 = r.pick([0.15, 0.4, 1.1]);
        const D = +(E1 * (nb * nb - na * na)).toPrecision(3), key = D / (nb * nb - na * na);
        return {
          prompt: t`In an infinite well, the gap between the levels $n = ${na}$ and $n = ${nb}$ is ${D} eV. What is the ground-state energy $E_1$, in eV?`,
          visual: well({ n: nb, show: 'psi', top: 5, hide: ['energy', 'scale'] }, t`A box’s levels, numbers hidden; the chosen state is $n = ${nb}$.`),
          answer: key, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: D / (nb - na), feedback: t`Evenly spaced levels would give that; a box’s gaps grow: $E_{${nb}} - E_{${na}} = (${nb}^2 - ${na}^2)E_1$.` }],
          hints: [t`$E_n = n^2E_1$.`, t`$E_{${nb}} - E_{${na}} = ${nb * nb - na * na}\,E_1$.`],
          teach: t`Box gaps are $(n_b^2 - n_a^2)E_1$: read $E_1$ off any one of them.`,
          explain: t`$E_1 = ${D}/${nb * nb - na * na} = ${tn(key)}$ eV.`,
        };
      },
    }),
    mcq({
      id: 'cp-double', difficulty: 2,
      prompt: t`You double the length of a guitar string (same tension and density) and the width of an electron’s box. What happens to the string’s fundamental frequency and to the box’s ground-state energy?`,
      visual: { type: 'wave-string', params: { mode: 'standing', show: 'mode', n: 1, controls: false, play: false, time: 0.004, readout: false }, caption: 'A string vibrating in its fundamental, one instant (amplitude exaggerated).' },
      choices: [
        'The string’s frequency halves; the box’s energy falls to a quarter',
        'Both halve: the wavelength doubles in each',
        'Both fall to a quarter, because the boundary conditions are the same',
        'The string’s frequency falls to a quarter; the box’s energy halves',
      ],
      answer: 0,
      why: {
        1: t`The wavelength does double in each — but the box’s frequency goes as $k^2$, so it falls by four.`,
        2: t`Same boundary conditions give the same $k_1 = \pi/L$, which halves in both; the string’s $\omega = vk$ only halves.`,
        3: 'That swaps the two dispersion relations.',
      },
      hints: [t`Both have $k_1 = \pi/L$.`, t`String: $\omega = vk$. Box: $E = \hbar^2k^2/2m$.`],
      teach: t`Doubling the length halves $k_1$; then $\omega \propto k$ halves, $E \propto k^2$ quarters.`,
      explain: t`$k_1 = \pi/L$ halves in both. The string’s $f_1 = v/2L$ halves; the box’s $E_1 = \pi^2\hbar^2/2mL^2$ falls to a quarter.`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 15: The Schrödinger equation (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/8/' },
    { label: 'Levine, Quantum-well infrared photodetectors, J. Appl. Phys. 74, R1 (1993)', url: 'https://doi.org/10.1063/1.354252' },
    { label: 'Vurgaftman, Meyer & Ram-Mohan, Band parameters for III–V compound semiconductors, J. Appl. Phys. 89, 5815 (2001): GaAs electron mass 0.067 mₑ', url: 'https://doi.org/10.1063/1.1368156' },
  ],
});
