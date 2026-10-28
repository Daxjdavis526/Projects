// Atoms and the exchange force (Griffiths & Schroeter §5.1.2, §5.2). The
// exchange "force": ⟨(x₁ − x₂)²⟩ = ⟨x²⟩a + ⟨x²⟩b − 2⟨x⟩a⟨x⟩b ∓ 2|⟨x⟩ab|² —
// a correlation from symmetry, present only when the two states overlap.
// Helium's excited states 1snl: a symmetric spatial part (spin singlet,
// parahelium) or an antisymmetric one (spin triplet, orthohelium); first-order
// perturbation theory gives E⁽⁰⁾ + J ± K with the Coulomb integral J and the
// exchange integral K (hydrogenic, Z = 2: J₁ₛ₂ₛ = 34/81, K₁ₛ₂ₛ = 32/729,
// J₁ₛ₂ₚ = 118/243, K₁ₛ₂ₚ = 224/6561 hartree, checked by quadrature), so the
// triplet lies 2K lower — sign right, size three times too big because the
// outer electron is screened. Measured NIST levels: 2³S 19.820, 2¹S 20.616,
// 2³P 20.964, 2¹P 21.218 eV above the ground state; the 1083 nm, 58.4 nm and
// 2.06 μm lines. Hund's first rule; the nitrogen–oxygen ionization dip.
// Transfer: metastable helium at 1083 nm in exoplanet atmospheres
// (WASP-107b, Spake et al. 2018).
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { HC_EVNM } from '../phys2710/_constants.js';
import { C, EH, RYD, HE, r6, seg, label, pairPic, levelPic } from './_q2.js';

const t = String.raw;
const E0G = -HE.total;                               // ground state, eV below He²⁺ + 2e
const LIM = -HE.ie2;                                 // He⁺(1s) + e at rest
const LV = { g: E0G, s3: E0G + HE.s3, s1: E0G + HE.s1, p3: E0G + HE.p3, p1: E0G + HE.p1 };
const E0X = -4 * RYD * (1 + 1 / 4);                  // 1s n=2, no repulsion
const J2S = (34 / 81) * EH, K2S = (32 / 729) * EH, J2P = (118 / 243) * EH, K2P = (224 / 6561) * EH;
const SCR = LIM - RYD / 4;                           // outer electron sees Z = 1: −54.42 − 3.40 eV
const lam = (dE) => HC_EVNM / dE;                    // nm

/** ⟨x²⟩ₙ, ⟨x⟩ₐᵦ for the infinite well of width 1. */
const x2 = (n) => 1 / 3 - 1 / (2 * n * n * Math.PI ** 2);
const xab = (a, b) => ((a + b) % 2 ? (-8 * a * b) / (Math.PI ** 2 * (a * a - b * b) ** 2) : 0);
const sep2 = (a, b, s) => x2(a) + x2(b) - 0.5 - 2 * s * xab(a, b) ** 2;

/** Helium's measured levels in two columns (singlet left, triplet right), optional model levels. */
function hePic({ caption, models = false, arrows = [], hideLabels = false, extra = {} } = {}) {
  const L = (E, x0, color, text, when) => ({ E, x0, x1: x0 + 1.2, color, label: hideLabels ? undefined : text, ...(when ? { when } : {}) });
  const levels = [L(LV.g, 0.4, 'accent', '1¹S'), L(LV.s1, 0.4, 'accent', '2¹S'), L(LV.p1, 0.4, 'accent', '2¹P'), L(LV.s3, 2.4, 'gold', '2³S'), L(LV.p3, 2.4, 'gold', '2³P')];
  const pic = levelPic(levels, { y: [-81, -52], x: [0, 4.4], ylabel: 'energy (eV)', caption, arrows, yticks: 6, extra });
  pic.params.curves.push({ ...seg(0.2, LIM, 4.2, LIM, 'ink3', 1.4), dash: [6, 4] });
  pic.params.points.push(label(2.2, LIM, 'He⁺ + e⁻', 'ink3', 0, -10, 'center'), label(1, -80.4, 'singlet (para)', 'accent', 0, 0, 'center'), label(3, -80.4, 'triplet (ortho)', 'gold', 0, 0, 'center'));
  if (models) {
    const m = [[E0X + J2S + K2S, 0.4, 'step(0.5 - abs(model - 1))'], [E0X + J2S - K2S, 2.4, 'step(0.5 - abs(model - 1))'], [E0X + J2P + K2P, 0.4, 'step(0.5 - abs(model - 1))'], [E0X + J2P - K2P, 2.4, 'step(0.5 - abs(model - 1))'], [SCR, 0.4, 'step(model - 1.5)'], [SCR, 2.4, 'step(model - 1.5)']];
    for (const [E, x0, when] of m) pic.params.curves.push({ ...seg(x0, E, x0 + 1.2, E, 'good', 2), dash: [5, 4], when });
  }
  return pic;
}

export default lesson({
  id: 'phys4710.M1.2',
  title: 'Atoms and the exchange force',
  minutes: 18, difficulty: 3,
  intro: t`Lesson M1.1 showed identical fermions avoiding each other and bosons bunching. In an atom this changes the energy: the electrons repel, so a state that keeps them apart costs less. For helium with one electron in $1s$ and one in $nl$, first-order perturbation theory in the repulsion gives

$$\begin{gathered} E_\pm = E^{(0)} + J \pm K \\ J = \Big\langle \psi_a\psi_b \Big|\frac{e^2}{4\pi\epsilon_0r_{12}}\Big|\psi_a\psi_b\Big\rangle,\quad K = \Big\langle \psi_a\psi_b \Big|\frac{e^2}{4\pi\epsilon_0r_{12}}\Big|\psi_b\psi_a\Big\rangle \end{gathered}$$

The upper sign belongs to the symmetric spatial state, whose spins form a singlet (**parahelium**); the lower sign to the antisymmetric spatial state, a spin triplet (**orthohelium**). Since $K > 0$, the triplet lies lower, by $2K$. No spin force does this — the spins only decide which spatial symmetry is allowed. That is the **exchange interaction**, and it is behind Hund’s rules and ferromagnetism.`,
  symbols: [
    { tex: 'E^{(0)}', text: t`the energy without the electron–electron repulsion: two hydrogen-like levels, $-Z^2(13.6\ \text{eV})(1 + 1/n^2)$ for $1s\,nl$` },
    { tex: 'J', text: t`the **Coulomb (direct) integral**: the classical repulsion of two charge clouds $|\psi_a|^2$ and $|\psi_b|^2$, in eV` },
    { tex: 'K', text: t`the **exchange integral**: the same operator between the state and its exchanged copy — no classical analogue; positive, in eV` },
    { tex: '\\psi_a,\\ \\psi_b', text: t`the two one-electron orbitals, here $1s$ and $nl$` },
    { tex: 'r_{12}', text: 'the distance between the two electrons' },
    { tex: '\\pm', text: '+ for the spin singlet (symmetric in space), − for the spin triplet (antisymmetric in space)' },
  ],
  why: 'The exchange energy orders the levels of every atom, decides which way spins line up in molecules and magnets, and makes iron magnetic — an electrostatic effect wearing a spin label.',
  visual: {
    ...hePic({ models: true }),
    title: 'Helium’s two families',
    lead: t`Helium’s measured lowest levels (NIST), singlets on the left, triplets on the right, in eV below the bare nucleus. Compare each triplet with the singlet of the same configuration, and try the two models.`,
    tasks: [
      'Every triplet lies below its singlet: 2³S under 2¹S by 0.80 eV, 2³P under 2¹P by 0.25 eV. There is no triplet partner of the ground state: 1s² cannot be antisymmetric in space.',
      'Show first-order theory with unscreened hydrogenic orbitals: the ordering is right, but the levels sit too high and the splittings (2K) are too big.',
      'Show the screened model — the outer electron sees the nucleus shielded to charge 1: it lands close to the measured centres. Screening is most of the story; exchange is the splitting.',
    ],
    params: {
      ...hePic({ models: true }).params,
      choices: [{ key: 'model', label: 'Model', options: [[0, 'measured only'], [1, 'first order, Z = 2 orbitals'], [2, 'screened outer electron']], value: 0, explain: 'Dashed green levels: a model’s prediction for the n = 2 levels, drawn beside the measured ones.' }],
    },
    caption: 'Measured levels from the NIST Atomic Spectra Database; the triplet P levels’ fine-structure splitting (0.000 13 eV) is far too small to show. First order: E⁽⁰⁾ + J ± K with hydrogenic orbitals for Z = 2. Screened: the outer electron as hydrogen (Z = 1) outside He⁺, with no exchange term. Energy scale broken by nothing: the gap to the ground state is real.',
  },
  example: {
    prompt: t`Two electrons in a 1D infinite well of width $L = 1$ nm occupy states $a = 1$ and $b = 2$. Compute the rms separation $\sqrt{\langle(x_1 - x_2)^2\rangle}$ for a spatial wave function that is symmetric (spin singlet), antisymmetric (spin triplet), and for distinguishable particles, and say what it means for the Coulomb repulsion.`,
    visual: pairPic({ a: 1, b: 2, s: -1, caption: 'The antisymmetric (spin-triplet) density: no weight on the diagonal, so the electrons are rarely close.' }),
    steps: [
      { label: 'Expand', text: t`$\langle(x_1 - x_2)^2\rangle = \langle x_1^2\rangle + \langle x_2^2\rangle - 2\langle x_1x_2\rangle$. The first two are the same for every case: $\langle x^2\rangle_a + \langle x^2\rangle_b$.` },
      { label: 'Cross term', text: t`For $\psi_\pm$, $\langle x_1x_2\rangle = \langle x\rangle_a\langle x\rangle_b \pm |\langle x\rangle_{ab}|^2$ with the overlap $\langle x\rangle_{ab} = \int x\,\psi_a\psi_b\,dx$. Distinguishable particles have no second term.` },
      { label: 'Box integrals', text: t`$\langle x^2\rangle_n = L^2\big(\tfrac13 - \tfrac{1}{2n^2\pi^2}\big)$, $\langle x\rangle_n = L/2$, and $\langle x\rangle_{12} = -\dfrac{16L}{9\pi^2} = ${fmt(xab(1, 2), 4)}L$.` },
      { label: 'Numbers', text: t`Distinguishable: $\langle(x_1 - x_2)^2\rangle = ${fmt(sep2(1, 2, 0), 4)}L^2$. Symmetric: subtract $2|\langle x\rangle_{12}|^2 = ${fmt(2 * xab(1, 2) ** 2, 4)}L^2$ to get $${fmt(sep2(1, 2, 1), 4)}L^2$; antisymmetric: add it, $${fmt(sep2(1, 2, -1), 4)}L^2$. The rms separations are $${fmt(Math.sqrt(sep2(1, 2, 1)), 3)}$, $${fmt(Math.sqrt(sep2(1, 2, 0)), 3)}$ and $${fmt(Math.sqrt(sep2(1, 2, -1)), 3)}$ nm.` },
      { label: 'Meaning', text: t`In the spin triplet the electrons sit on average farther apart than if they were distinguishable, and the singlet pushes them together. With a repulsion between them, the triplet therefore has the lower energy — Hund’s first rule — although no force depends on spin.` },
    ],
    answer: t`rms separations $${fmt(Math.sqrt(sep2(1, 2, 1)), 3)}$ nm (singlet), $${fmt(Math.sqrt(sep2(1, 2, 0)), 3)}$ nm (distinguishable), $${fmt(Math.sqrt(sep2(1, 2, -1)), 3)}$ nm (triplet); the triplet’s electrons repel less.`,
  },
  practice: [
    num({
      id: 'rms-sep', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [2, 3], [1, 4], [3, 4]]);
        const s = r.pick([1, -1]), L = r.pick([0.5, 2, 3]);
        const ans = L * Math.sqrt(sep2(a, b, s));
        return {
          prompt: t`Two electrons in a 1D infinite well of width $L = ${L}$ nm occupy states $${a}$ and $${b}$, with a spatial wave function that is ${s > 0 ? 'symmetric (spin singlet)' : 'antisymmetric (spin triplet)'}. Using $\langle x^2\rangle_n = L^2(\tfrac13 - \tfrac{1}{2n^2\pi^2})$, $\langle x\rangle_n = L/2$ and $\langle x\rangle_{ab} = -\dfrac{8abL}{\pi^2(a^2 - b^2)^2}$ (for $a + b$ odd), find the rms separation $\sqrt{\langle(x_1 - x_2)^2\rangle}$, in nm.`,
          visual: pairPic({ a, b, s, caption: `The joint density for states ${a} and ${b}.` }),
          answer: ans, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: L * Math.sqrt(sep2(a, b, -s)), feedback: s > 0 ? 'The symmetric state brings the electrons together: subtract 2|⟨x⟩ab|², do not add it.' : 'The antisymmetric state keeps the electrons apart: add 2|⟨x⟩ab|².' }, { value: L * Math.sqrt(sep2(a, b, 0)), feedback: 'That is the distinguishable result; identical particles add the exchange term ∓2|⟨x⟩ab|².' }, { value: L * L * sep2(a, b, s), feedback: 'That is ⟨(x₁ − x₂)²⟩ in nm²; take the square root.' }],
          hints: [t`$\langle(x_1 - x_2)^2\rangle = \langle x^2\rangle_a + \langle x^2\rangle_b - 2\langle x\rangle_a\langle x\rangle_b \mp 2|\langle x\rangle_{ab}|^2$, upper sign symmetric.`, t`$\langle x\rangle_{${a}${b}} = ${fmt(xab(a, b), 4)}L$.`],
          teach: 'The exchange term ∓2|⟨x⟩ab|² pulls symmetric pairs together and pushes antisymmetric pairs apart; it needs overlap between the two states.',
          explain: t`$\langle(x_1 - x_2)^2\rangle = ${fmt(sep2(a, b, s), 4)}L^2$, so the rms separation is $${fmt(Math.sqrt(sep2(a, b, s)), 4)}\times${L} = ${fmt(ans, 4)}$ nm. Distinguishable particles would give $${fmt(L * Math.sqrt(sep2(a, b, 0)), 4)}$ nm.`,
        };
      },
    }),
    mcq({
      id: 'why-ortho-lower', difficulty: 2,
      prompt: t`Why does helium’s $1s2s$ triplet ($2^3S$) lie $0.80$ eV **below** the singlet ($2^1S$)?`,
      visual: hePic({ caption: 'Helium’s measured levels: singlets left, triplets right.' }),
      choices: [
        'The triplet’s spatial wave function is antisymmetric, so the electrons avoid each other and their Coulomb repulsion is smaller',
        'Parallel electron spins attract magnetically',
        'The triplet has three states, and more states means lower energy',
        'The singlet’s electrons are in different orbitals from the triplet’s',
      ],
      answer: 0,
      why: {
        1: t`The magnetic interaction of two electron spins at atomic distances is about $10^{-4}$ eV — thousands of times too small, and it would not favour parallel spins in this geometry anyway.`,
        2: 'Degeneracy does not lower energy; the number of states and the energy are separate questions.',
        3: 'Both are 1s2s. Only the symmetry of the spatial combination differs.',
      },
      hints: ['What does the spin state force on the spatial wave function? Then what does that do to the repulsion?'],
      teach: 'The exchange splitting is electrostatic: spin symmetry selects the spatial symmetry, which sets how close the electrons get.',
      explain: t`In the triplet the spatial part is antisymmetric and vanishes where $\vec r_1 = \vec r_2$, so the average $1/r_{12}$ is smaller: $J - K$ instead of $J + K$. The splitting is $2K$, measured $${fmt(HE.s1 - HE.s3, 3)}$ eV.`,
    }),
    num({
      id: 'first-order', difficulty: 3,
      gen(r) {
        const [cfg, J, K, meas] = r.pick([['1s2s', J2S, K2S, { 1: LV.s1, [-1]: LV.s3 }], ['1s2p', J2P, K2P, { 1: LV.p1, [-1]: LV.p3 }]]);
        const s = r.pick([1, -1]);
        const ans = E0X + J + s * K;
        return {
          prompt: t`Estimate the energy of helium’s ${cfg} ${s > 0 ? 'singlet' : 'triplet'} to first order, using hydrogenic orbitals for $Z = 2$: $E^{(0)} = ${fmt(E0X, 5)}$ eV, Coulomb integral $J = ${fmt(J, 4)}$ eV, exchange integral $K = ${fmt(K, 4)}$ eV. Give $E$ in eV (measured from the bare nucleus plus two electrons at rest).`,
          visual: hePic({ caption: 'The measured levels, for comparison after you answer.' }),
          answer: ans, units: 'eV', tol: { rel: 0.002 },
          errors: [{ value: E0X + J - s * K, feedback: s > 0 ? 'The singlet has the symmetric spatial part: + K.' : 'The triplet has the antisymmetric spatial part: − K.' }, { value: E0X + s * K, feedback: t`Include the direct Coulomb integral $J$ as well.` }],
          hints: [t`$E = E^{(0)} + J \pm K$: upper sign for the singlet.`],
          teach: 'First-order perturbation theory gives E⁽⁰⁾ + J ± K for helium’s 1snl levels, the triplet lower by 2K.',
          explain: t`$E = ${fmt(E0X, 5)} + ${fmt(J, 4)} ${s > 0 ? '+' : '-'} ${fmt(K, 4)} = ${fmt(ans, 5)}$ eV. Measured: $${fmt(meas[s], 5)}$ eV. The model is $${fmt(ans - meas[s], 2)}$ eV too high, because a hydrogenic $Z = 2$ outer orbital ignores screening by the $1s$ electron, which lets the outer one spread out and repel less — and the predicted splitting $2K = ${fmt(2 * K, 3)}$ eV overshoots the measured $${fmt(meas[1] - meas[-1], 3)}$ eV for the same reason.`,
        };
      },
    }),
    num({
      id: 'he-lines', difficulty: 2,
      gen(r) {
        const [name, up, lo, upl, lol] = r.pick([['the triplet line $2^3P \\to 2^3S$', HE.p3, HE.s3, LV.p3, LV.s3], ['the resonance line $2^1P \\to 1^1S$', HE.p1, 0, LV.p1, LV.g], ['the singlet line $2^1P \\to 2^1S$', HE.p1, HE.s1, LV.p1, LV.s1]]);
        const ans = lam(up - lo);
        return {
          prompt: t`Helium’s measured levels lie, above the ground state, at $2^3S$: $${fmt(HE.s3, 6)}$ eV, $2^1S$: $${fmt(HE.s1, 6)}$ eV, $2^3P$: $${fmt(HE.p3, 6)}$ eV, $2^1P$: $${fmt(HE.p1, 6)}$ eV. What is the vacuum wavelength of ${name}, in nm? ($hc = ${fmt(HC_EVNM, 9)}$ eV nm.)`,
          visual: hePic({ caption: 'The measured levels (singlets left, triplets right).', arrows: [{ from: [up === HE.p3 ? 3 : 1, r6(upl)], to: [up === HE.p3 ? 3 : 1, r6(lol)], color: 'warn', width: 2.4 }] }),
          answer: ans, units: 'nm', tol: { rel: 0.001 },
          errors: [{ value: lam(up), feedback: 'Use the difference between the two levels, not the upper level’s height above the ground state.' }].filter((e) => Math.abs(e.value - ans) > 0.002 * ans),
          hints: [t`$\lambda = hc/\Delta E$ with $\Delta E$ the difference of the two levels.`],
          teach: 'Spectral lines come in two families that do not mix: singlet–singlet and triplet–triplet (ΔS = 0).',
          explain: t`$\Delta E = ${fmt(up - lo, 5)}$ eV, so $\lambda = ${fmt(ans, 6)}$ nm. Lines between the singlet and triplet families are almost absent, because the electric-dipole operator does not touch spin: early spectroscopists thought there were two kinds of helium.`,
        };
      },
    }),
    mcq({
      id: 'n-o-dip', difficulty: 3,
      prompt: t`Nitrogen ($2p^3$) has a first ionization energy of $14.53$ eV; oxygen ($2p^4$), with one more proton, has only $13.62$ eV. Why the dip?`,
      visual: { type: 'mp-shells', params: { Z: 8, minZ: 1, maxZ: 18, panels: ['ie'], controls: false, hide: ['unpaired'] }, caption: 'Measured first ionization energies (NIST) against Z; oxygen marked.' },
      choices: [
        'Nitrogen’s three 2p electrons have parallel spins in three different orbitals; oxygen’s fourth must pair in an occupied orbital, gaining extra repulsion and no exchange energy, so it is easier to remove',
        'Oxygen’s nucleus attracts its electrons more weakly than nitrogen’s',
        'Oxygen’s outer electron is in the 3s subshell',
        'Paired spins repel each other magnetically',
      ],
      answer: 0,
      why: {
        1: 'Oxygen’s nuclear charge is larger. The dip comes from the electrons’ arrangement, not the nucleus.',
        2: 'Oxygen is 1s² 2s² 2p⁴: no 3s electron.',
        3: 'Spin–spin magnetic energies are tiny (about 10⁻⁴ eV); the effect is electrostatic — the paired electron shares an orbital and has no exchange partner of the same spin in it.',
      },
      hints: ['Hund’s first rule: put electrons in separate orbitals with parallel spins first. Where must oxygen’s fourth 2p electron go?', 'An electron sharing an orbital overlaps its partner heavily (large J) and, with opposite spin, gets no exchange reduction from it.'],
      teach: 'Hund’s first rule — maximum total spin — is the exchange energy at work in every atom.',
      explain: t`Half-filled $2p^3$ is especially stable: three parallel spins in three orbitals keep apart (exchange lowers each pair’s repulsion by $K$). Oxygen’s fourth electron must share an orbital with an opposite-spin partner, so it is repelled more and is removed for $0.9$ eV less. The same dip repeats at phosphorus/sulfur and arsenic/selenium.`,
    }),
    mcq({
      id: 'no-force', difficulty: 2,
      prompt: t`A student says: “The exchange force is a fifth fundamental force that pushes electrons with parallel spins apart.” What is wrong with this?`,
      visual: pairPic({ a: 1, b: 2, s: -1, caption: 'Two non-interacting fermions in a box (spatially antisymmetric). The hole along the diagonal appears with no interaction at all.' }),
      choices: [
        'Nothing pushes: the correlation follows from the antisymmetry of the wave function and appears even for non-interacting particles; energies change only through forces that already exist, here the Coulomb repulsion',
        'The exchange force exists but attracts parallel spins',
        'The exchange force acts only between bosons',
        'It is a magnetic force between the spins, not a new force',
      ],
      answer: 0,
      why: {
        1: 'Fermions in a spatially antisymmetric state are found farther apart, not closer; and the effect is not a force at all.',
        2: 'Bosons show the opposite correlation (bunching); fermions show avoidance. Neither is a force.',
        3: 'Magnetic spin–spin energies are thousands of times too small to explain exchange splittings.',
      },
      hints: ['The picture is for particles that do not interact. Where does the dark diagonal come from?'],
      teach: '“Exchange force” is a nickname for a correlation produced by symmetry, not an interaction.',
      explain: t`The box electrons in the picture feel no force at all, yet are rarely close: that is antisymmetry. With a real interaction present (Coulomb), the correlation changes its average value — that is the exchange energy $\mp K$. No new force carries it.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-exoplanet', difficulty: 3, transfer: true,
      gen(r) {
        const v = r.pick([-25, -15, -8, 6, 12]);
        const l0 = lam(HE.p3 - HE.s3), ans = (l0 * v * 1e3) / C * 1000;     // pm
        return {
          prompt: t`Metastable orthohelium ($2^3S$, lifetime about 2 hours) absorbs starlight at the $2^3S \to 2^3P$ line, at $${fmt(l0, 6)}$ nm in vacuum. The James Webb and ground-based telescopes use this line to catch helium escaping from hot exoplanets such as WASP-107b. Gas streaming with a line-of-sight velocity of $${v}$ km/s (positive = away from us) shifts the absorption by $\Delta\lambda = \lambda v/c$. What is $\Delta\lambda$, in pm?`,
          visual: hePic({ caption: 'Helium’s levels; the triplet line from 2³S, a level that cannot decay to the singlet ground state by an electric-dipole photon.', arrows: [{ from: [3, r6(LV.s3)], to: [3, r6(LV.p3)], color: 'warn', width: 2.4 }] }),
          answer: ans, units: 'pm', tol: { rel: 0.005 },
          errors: [{ value: -ans, feedback: 'Motion away from us stretches the wavelength (redshift): Δλ has the sign of v.' }],
          hints: [t`$\Delta\lambda = \lambda v/c$ with $c = 299\,792.458$ km/s.`, t`$${fmt(l0, 6)}\ \text{nm}\times${v}/299\,792.458 = $ … nm; convert to pm.`],
          teach: 'Orthohelium’s 2³S level is metastable because decay to the singlet ground state needs a spin flip, so it builds up and absorbs at 1083 nm.',
          explain: t`$\Delta\lambda = ${fmt(l0, 6)}\ \text{nm}\times(${v}/299\,792.458) = ${fmt(ans, 3)}$ pm. The 2³S level can only reach $1^1S$ by flipping a spin, so it survives for hours in a thin gas and acts as a sensitive absorber; Spake et al. (2018) detected WASP-107b’s escaping helium this way.`,
        };
      },
    }),
    mcq({
      id: 'cp-no-overlap', difficulty: 3,
      prompt: t`Two electrons in a 1D box occupy states $1$ and $3$. How does the rms separation of the spatially antisymmetric state compare with the symmetric one?`,
      visual: pairPic({ a: 1, b: 3, s: -1, caption: 'The antisymmetric density for states 1 and 3.' }),
      choices: [
        t`They are equal: $\langle x\rangle_{13} = \int x\,\psi_1\psi_3\,dx = 0$ by the box’s symmetry about its centre, so the exchange term in $\langle(x_1 - x_2)^2\rangle$ vanishes`,
        'The antisymmetric state is always farther apart',
        'The symmetric state is farther apart for states of the same parity',
        'They cannot be compared, because the antisymmetric state is not normalizable',
      ],
      answer: 0,
      why: {
        1: t`Only if $\langle x\rangle_{ab} \neq 0$. Here the overlap integral vanishes, although the densities still differ in detail (the diagonal is still dark).`,
        2: t`The exchange term is $\mp2|\langle x\rangle_{ab}|^2$ — never of the opposite sign, and here zero.`,
        3: t`Antisymmetrizing two different states always gives a normalizable function.`,
      },
      hints: [t`About the centre of the box, $\psi_1$ and $\psi_3$ are both even, while $x - L/2$ is odd.`],
      teach: 'The exchange contribution to a quantity needs the two orbitals to overlap through that quantity’s operator.',
      explain: t`$\psi_1$ and $\psi_3$ are both even about $L/2$, so $\int(x - L/2)\psi_1\psi_3\,dx = 0$, and with orthogonality $\langle x\rangle_{13} = 0$. The second moment of the separation is blind to the symmetry here, though higher moments are not: the diagonal is still empty. In atoms, $K$ involves $1/r_{12}$, which does not vanish this way, so every 1snl pair is split.`,
    }),
    num({
      id: 'cp-split', difficulty: 2,
      prompt: t`In first-order theory, helium’s $1s2p$ singlet and triplet differ by $2K$ with $K = \tfrac{112}{6561}Z$ hartree for hydrogenic orbitals of charge $Z = 2$ (1 hartree $= ${fmt(EH, 8)}$ eV). Compute $2K$ in eV.`,
      visual: hePic({ caption: 'The measured levels: 2¹P and 2³P are the top pair.' }),
      answer: 2 * K2P, units: 'eV', tol: { rel: 0.003 },
      errors: [{ value: K2P, feedback: 'The singlet is at J + K and the triplet at J − K: they differ by 2K.' }],
      hints: [t`$K = \tfrac{112}{6561}\times2$ hartree $= ${fmt(K2P / EH, 5)}$ hartree.`, 'Double it and convert to eV.'],
      teach: 'Singlet and triplet of the same configuration are split by twice the exchange integral.',
      explain: t`$2K = 2\times${fmt(K2P / EH, 5)}\times${fmt(EH, 6)} = ${fmt(2 * K2P, 4)}$ eV, against the measured $${fmt(HE.p1 - HE.p3, 3)}$ eV. The order is right and the size is too large: the 2p electron really sits outside a screened core, where it overlaps the 1s electron — and so exchanges with it — much less than an unscreened orbital would.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §5.1.2 and §5.2.1', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'NIST Atomic Spectra Database (He I levels and ionization energies)', url: 'https://physics.nist.gov/PhysRefData/ASD/levels_form.html' },
    { label: 'J. J. Spake et al., “Helium in the eroding atmosphere of an exoplanet”, Nature 557, 68 (2018)', url: 'https://doi.org/10.1038/s41586-018-0067-5' },
  ],
});
