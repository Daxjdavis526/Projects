// Bosons, fermions and exchange symmetry (Griffiths & Schroeter §5.1). The
// exchange operator P̂₁₂ swaps the labels of two particles; for identical
// particles it commutes with Ĥ, and the symmetrization postulate demands
// P̂₁₂ψ = +ψ (bosons, integer spin) or −ψ (fermions, half-integer spin).
// Two particles in states a and b: ψ± = [ψa(1)ψb(2) ± ψb(1)ψa(2)]/√2; the
// minus sign vanishes for a = b (Pauli). With spin, the whole state is
// (anti)symmetric: for two electrons a symmetric spatial part goes with the
// spin singlet. Explore: |ψ(x₁, x₂)|² on the configuration square — bosons
// bunch on the diagonal, fermions have a node there. Worked example: two
// electrons in a 1 nm box, polarized and unpolarized. Counting states:
// g², g(g + 1)/2, g(g − 1)/2. Code: symmetrization on a grid and the rms
// separation. Transfers: the Hong–Ou–Mandel dip; why spin-polarized fermions
// stop colliding (DeMarco & Jin's evaporative cooling of ⁴⁰K). The
// thermodynamic counting is phys3700.T7.2; it is linked, not repeated.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { HB2M_EVNM2 } from '../phys4700/_qm.js';
import { r6, seg, label, pairPic, levelPic } from './_q2.js';

const t = String.raw;
const K1 = HB2M_EVNM2 * Math.PI ** 2;           // eV nm²: π²ħ²/2mₑ, so E_n = K1 n²/L²
const LX = 1, KX = K1 / (LX * LX);

/** g single-particle states for each of two particles: a g × g grid of product states, diagonal in gold. */
const gridPic = (g, caption) => ({
  type: 'graph',
  params: {
    x: [0.3, g + 0.7], y: [0.3, g + 0.7], aspect: 'wide', equal: true, xlabel: 'state of particle 2', ylabel: 'state of particle 1', xticks: g, yticks: g, axesAt: 'edge', grid: false,
    points: Array.from({ length: g * g }, (_, k) => { const i = Math.floor(k / g) + 1, j = (k % g) + 1; return { x: j, y: i, r: 5, color: i === j ? 'gold' : 'accent' }; }),
    curves: [seg(0.5, 0.5, g + 0.5, g + 0.5, 'ink3', 1, [4, 4])],
  },
  caption,
});

/** Box levels n = 1…nmax for one particle (energies in units of E₁), with optional electrons drawn as arrows. */
function boxLevels(nmax, occ = [], caption) {
  const levels = Array.from({ length: nmax }, (_, k) => ({ E: (k + 1) ** 2, x0: 0.6, x1: 2.4, color: 'ink2', label: `n = ${k + 1}`, dx: 8 }));
  const arrows = occ.map(([n, up, slot]) => ({ from: [r6(1.2 + 0.6 * slot), r6(n * n - (up ? 0.9 : -0.9) * 0.6 - (up ? 0 : 0))], to: [r6(1.2 + 0.6 * slot), r6(n * n + (up ? 0.9 : -0.9) * 0.6)], color: up ? 'gold' : 'violet', width: 2.6 }));
  return levelPic(levels, { y: [0, nmax * nmax + 2], x: [0, 3.4], ylabel: 'energy (units of E₁)', caption, arrows });
}

export default lesson({
  id: 'phys4710.M1.1',
  title: 'Bosons, fermions and exchange symmetry',
  minutes: 16, difficulty: 3,
  intro: t`Two electrons are not two small balls with names. Nothing distinguishes them, so swapping their labels — the **exchange operator** $\hat P_{12}$, with $\hat P_{12}\psi(\vec r_1, \vec r_2) = \psi(\vec r_2, \vec r_1)$ — cannot change anything measurable. Since $\hat P_{12}^2 = 1$, its eigenvalues are $\pm1$, and nature uses both: the wave function of identical **bosons** (integer spin) is symmetric, that of identical **fermions** (half-integer spin) antisymmetric. With one particle in state $a$ and one in $b$:

$$\begin{gathered} \psi_\pm(\vec r_1, \vec r_2) = \frac{1}{\sqrt2}\Big[\psi_a(\vec r_1)\psi_b(\vec r_2) \pm \psi_b(\vec r_1)\psi_a(\vec r_2)\Big] \end{gathered}$$

For fermions with $a = b$ this is zero: **no two identical fermions in the same state** — Pauli’s exclusion principle, now a consequence of antisymmetry. The signs also change where the particles are likely to be found, as if they attracted or repelled, though no force acts.`,
  symbols: [
    { tex: '\\psi_\\pm(\\vec r_1, \\vec r_2)', text: t`the two-particle wave function: $|\psi_\pm|^2$ is the probability density for finding one particle at $\vec r_1$ and the other at $\vec r_2$` },
    { tex: '\\psi_a,\\ \\psi_b', text: t`two orthonormal one-particle states (including spin, if the particles have it)` },
    { tex: '\\pm', text: '+ for identical bosons (photons, ⁴He atoms, pions), − for identical fermions (electrons, protons, neutrons, ³He atoms)' },
    { tex: '\\hat P_{12}', text: t`the exchange operator: swaps every coordinate (position and spin) of particle 1 with particle 2` },
    { tex: '1/\\sqrt2', text: t`normalization, for $a \ne b$` },
  ],
  why: 'Exchange symmetry builds the periodic table, holds up white dwarfs, makes metals conduct, gives superfluid helium and lasers — and is the most common reason a two-particle calculation goes wrong.',
  visual: {
    ...pairPic({ a: 1, b: 2, s: -1, controls: true, readout: true }),
    title: 'Two particles in a box',
    lead: t`The joint density $|\psi(x_1, x_2)|^2$ of two non-interacting particles in an infinite well, one in state $a$, one in state $b$. Each point of the square is one configuration: particle 1 at $x_1$, particle 2 at $x_2$. Bright means likely.`,
    tasks: [
      'With a = 1, b = 2, switch between bosons, distinguishable particles and fermions. Fermions have a dark diagonal — they are never found at the same place — and their rms separation is the largest.',
      'Bosons pile up along the diagonal: the separation drops to about three-fifths of the distinguishable value. That is the exchange “force”: a correlation from symmetry, not an interaction.',
      'Set a = b. Bosons give a single symmetric blob; fermions give nothing at all — the density is zero everywhere. Pauli’s principle in one picture.',
    ],
  },
  example: {
    prompt: t`Two non-interacting electrons are confined in a one-dimensional infinite well of width $L = ${LX}$ nm, where one electron’s levels are $E_n = n^2E_1$ with $E_1 = \pi^2\hbar^2/2m_eL^2$. Find the two-electron ground-state energy and its spatial wave function (a) if both spins are up, and (b) with no restriction on spin.`,
    visual: boxLevels(3, [[1, true, 0], [2, true, 0]], 'Case (a): both spins up. The spin state is symmetric, so the spatial part must be antisymmetric, which forbids putting both electrons in n = 1.'),
    steps: [
      { label: 'One electron', text: t`$E_1 = \pi^2\hbar^2/2m_eL^2 = \pi^2\times${fmt(HB2M_EVNM2, 5)}\ \text{eV nm}^2/(${LX}\ \text{nm})^2 = ${fmt(KX, 4)}$ eV.` },
      { label: 'Whole state', text: t`The total state is a spatial part times a spin part, and the **whole** must be antisymmetric under exchange. So a symmetric spin state needs an antisymmetric spatial part, and vice versa.` },
      { label: 'Spins parallel', text: t`$|{\uparrow\uparrow}\rangle$ is symmetric, so the spatial part must be $\psi_-$. With $a = b = 1$ that vanishes; the lowest choice is $a = 1$, $b = 2$: $E = (1 + 4)E_1 = ${fmt(5 * KX, 4)}$ eV.` },
      { label: 'Spins free', text: t`The spin singlet $\tfrac{1}{\sqrt2}(|{\uparrow\downarrow}\rangle - |{\downarrow\uparrow}\rangle)$ is antisymmetric, so the spatial part may be symmetric — including $\psi_1(x_1)\psi_1(x_2)$, both electrons in $n = 1$. $E = 2E_1 = ${fmt(2 * KX, 4)}$ eV.` },
      { label: 'Sense check', text: t`Pauli’s rule as chemists state it — at most two electrons per orbital, with opposite spins — is this result. Forcing the spins parallel costs $3E_1 = ${fmt(3 * KX, 3)}$ eV here: the exchange energy that lesson M1.2 meets in atoms.` },
    ],
    answer: t`(a) $\psi = \tfrac{1}{\sqrt2}[\psi_1(x_1)\psi_2(x_2) - \psi_2(x_1)\psi_1(x_2)]$, $E = 5E_1 = ${fmt(5 * KX, 3)}$ eV; (b) $\psi = \psi_1(x_1)\psi_1(x_2)$ times the singlet, $E = 2E_1 = ${fmt(2 * KX, 3)}$ eV.`,
  },
  practice: [
    mcq({
      id: 'read-density', difficulty: 2,
      prompt: t`The picture shows $|\psi(x_1, x_2)|^2$ for two particles in a box. Which wave function produces it?`,
      visual: pairPic({ a: 1, b: 2, s: 1, caption: 'A two-particle density on the configuration square; dashed: x₁ = x₂.' }),
      choices: [
        t`$\tfrac{1}{\sqrt2}[\psi_1(x_1)\psi_2(x_2) + \psi_2(x_1)\psi_1(x_2)]$`,
        t`$\tfrac{1}{\sqrt2}[\psi_1(x_1)\psi_2(x_2) - \psi_2(x_1)\psi_1(x_2)]$`,
        t`$\psi_1(x_1)\psi_2(x_2)$`,
        t`$\psi_1(x_1)\psi_1(x_2)$`,
      ],
      answer: 0,
      why: {
        1: t`The antisymmetric combination vanishes on the whole diagonal $x_1 = x_2$; this density is largest there.`,
        2: t`A product of distinguishable particles is not symmetric under reflection in the diagonal: particle 1 in $\psi_1$ is mostly central, particle 2 in $\psi_2$ is off-centre. This picture is mirror-symmetric about the dashed line.`,
        3: t`Both particles in $\psi_1$ give one central blob with no structure; this density has two lobes along the diagonal.`,
      },
      hints: ['Is the picture the same after reflecting it in the dashed line? Is it zero on that line?', 'Identical particles always give a density symmetric under x₁ ↔ x₂; the sign decides whether the diagonal is bright or dark.'],
      teach: 'For identical particles |ψ|² is symmetric about the diagonal; bosons are enhanced on it, fermions vanish on it.',
      explain: t`The density is symmetric about $x_1 = x_2$ and brightest near the diagonal: the symmetric (boson) combination. The cross term $+2\psi_1(x_1)\psi_2(x_2)\psi_2(x_1)\psi_1(x_2)$ adds probability where the particles coincide; with the minus sign the same term removes it.`,
    }),
    num({
      id: 'count-states', difficulty: 2,
      gen(r) {
        const g = r.int(3, 6);
        const kind = r.pick(['distinguishable', 'bosons', 'fermions']);
        const ans = kind === 'distinguishable' ? g * g : kind === 'bosons' ? (g * (g + 1)) / 2 : (g * (g - 1)) / 2;
        const what = kind === 'distinguishable' ? 'two distinguishable particles' : kind === 'bosons' ? 'two identical bosons' : 'two identical fermions';
        return {
          prompt: t`Each particle can occupy any of $g = ${g}$ single-particle states (spin included). How many distinct two-particle states are there for ${what}?`,
          visual: gridPic(g, 'Every pairing (state of particle 1, state of particle 2). Gold: both particles in the same state.'),
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [
            { value: g * g, feedback: t`$g^2$ counts ordered pairs — right for distinguishable particles only. For identical particles, (state $i$, state $j$) and (state $j$, state $i$) are one state.` },
            { value: (g * (g + 1)) / 2, feedback: t`That is the boson count: it keeps the ${g} diagonal states with both particles in one state.` },
            { value: (g * (g - 1)) / 2, feedback: 'That is the fermion count: it drops the diagonal, where antisymmetry gives zero.' },
          ].filter((e) => e.value !== ans),
          hints: ['Distinguishable: every square of the grid. Identical: a state and its mirror image across the diagonal are the same state.', 'Fermions also lose the gold diagonal; bosons keep it.'],
          teach: 'Two particles in g states: g² distinguishable, g(g + 1)/2 bosonic and g(g − 1)/2 fermionic states.',
          explain: t`For ${what}: $${ans}$ states. Identical particles count each unordered pair once; fermions exclude doubly occupied states. Statistical mechanics turns this counting into Bose–Einstein and Fermi–Dirac distributions ([Bosons and fermions](#/lesson/phys3700.T7.2)).`,
        };
      },
    }),
    num({
      id: 'polarized-ground', difficulty: 2,
      gen(r) {
        const N = r.int(2, 5), L = r.pick([0.5, 1, 2]);
        const spin = r.pick(['polarized', 'free']);
        const E1 = K1 / (L * L);
        const units = spin === 'polarized' ? Array.from({ length: N }, (_, k) => (k + 1) ** 2).reduce((a, b) => a + b, 0) : Array.from({ length: N }, (_, k) => (Math.floor(k / 2) + 1) ** 2).reduce((a, b) => a + b, 0);
        const ans = units * E1;
        const other = spin === 'polarized' ? Array.from({ length: N }, (_, k) => (Math.floor(k / 2) + 1) ** 2).reduce((a, b) => a + b, 0) : Array.from({ length: N }, (_, k) => (k + 1) ** 2).reduce((a, b) => a + b, 0);
        return {
          prompt: t`${N} non-interacting electrons fill the lowest states of a one-dimensional infinite well of width $${L}$ nm, where $E_1 = ${fmt(E1, 4)}$ eV. ${spin === 'polarized' ? 'A strong field holds every spin up.' : 'Their spins are free.'} What is the total ground-state energy, in eV?`,
          visual: boxLevels(4, [], t`One electron’s levels $E_n = n^2E_1$ in the well.`),
          answer: ans, units: 'eV', tol: { rel: 0.003 },
          errors: [
            { value: other * E1, feedback: spin === 'polarized' ? 'With every spin up, the spin part is symmetric, so no two electrons may share a level: one per level.' : 'With spins free, each level takes two electrons (one up, one down).' },
            { value: N * E1, feedback: 'Identical fermions cannot all sit in n = 1.' },
          ].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [spin === 'polarized' ? t`One electron per level: $E = (1^2 + 2^2 + \dots + ${N}^2)E_1$.` : t`Two electrons per level: fill $n = 1$ twice, then $n = 2$ twice, and so on.`, t`Multiply the sum of $n^2$ by $E_1 = ${fmt(E1, 4)}$ eV.`],
          teach: 'Fermions fill levels from the bottom, one per state; spin doubles the room in each spatial level.',
          explain: t`The sum of $n^2$ is ${units}, so $E = ${units}\times${fmt(E1, 4)} = ${fmt(ans, 4)}$ eV. ${spin === 'polarized' ? 'Polarizing the spins forces electrons into higher levels' : 'Pairing spins lets two electrons share each level'} — the same reason a magnetized electron gas costs energy.`,
        };
      },
    }),
    mcq({
      id: 'singlet-same-orbital', difficulty: 2,
      prompt: t`Two electrons occupy the same spatial orbital, $\psi_a(\vec r_1)\psi_a(\vec r_2)$. What must their spin state be?`,
      visual: boxLevels(2, [[1, true, 0], [1, false, 1]], 'Two electrons in one spatial level, drawn as an up and a down arrow.'),
      choices: [
        t`The singlet $\tfrac{1}{\sqrt2}(|{\uparrow\downarrow}\rangle - |{\downarrow\uparrow}\rangle)$`,
        t`$|{\uparrow\downarrow}\rangle$, one up and one down`,
        t`Any of the three triplet states`,
        t`$\tfrac{1}{\sqrt2}(|{\uparrow\downarrow}\rangle + |{\downarrow\uparrow}\rangle)$`,
      ],
      answer: 0,
      why: {
        1: t`$|{\uparrow\downarrow}\rangle$ is neither symmetric nor antisymmetric under exchange: it is half triplet, half singlet. Identical particles must be in an exchange eigenstate.`,
        2: t`The spatial part is symmetric, so the spin part must be antisymmetric; the triplet states are symmetric.`,
        3: t`That is the $m = 0$ member of the triplet: symmetric, so not allowed with a symmetric spatial part.`,
      },
      hints: ['Is ψa(r₁)ψa(r₂) symmetric or antisymmetric under exchange? Then what must the spin part be?'],
      teach: 'For two electrons, the total (space × spin) state is antisymmetric: a symmetric spatial part pairs with the antisymmetric spin singlet.',
      explain: t`$\psi_a(\vec r_1)\psi_a(\vec r_2)$ is symmetric, so the spin part must be the antisymmetric singlet. “Opposite spins” in the chemist’s picture means precisely this entangled state, not the product $|{\uparrow\downarrow}\rangle$.`,
    }),
    code({
      id: 'symmetrize-grid', difficulty: 3,
      prompt: t`Build two-particle wave functions on a grid. With the box states $\psi_n(x) = \sqrt2\sin(n\pi x)$ on $0 \le x \le 1$, write \`pair(a, b, sign)\`, which returns the 2D array \`P[i, j]\` $= \psi(x_1 = x_i, x_2 = x_j)$: the product $\psi_a(x_1)\psi_b(x_2)$ when \`sign\` is 0, and the normalized symmetric (\`sign = 1\`) or antisymmetric (\`sign = -1\`) combination otherwise. Normalize with the grid sum, $\sum|P|^2\,\Delta x^2 = 1$. Then write \`rms_sep(P)\`, which returns $\sqrt{\langle(x_1 - x_2)^2\rangle}$.`,
      starter: t`import numpy as np

x = np.linspace(0, 1, 301)
dx = x[1] - x[0]

def psi(n):
    return np.sqrt(2) * np.sin(n * np.pi * x)

def pair(a, b, sign):
    pass

def rms_sep(P):
    pass

for s in (1, 0, -1):
    print(s, rms_sep(pair(1, 2, s)))
`,
      answer: t`import numpy as np

x = np.linspace(0, 1, 301)
dx = x[1] - x[0]

def psi(n):
    return np.sqrt(2) * np.sin(n * np.pi * x)

def pair(a, b, sign):
    A = np.outer(psi(a), psi(b))          # A[i, j] = psi_a(x_i) psi_b(x_j)
    P = A if sign == 0 else A + sign * A.T
    return P / np.sqrt((P**2).sum() * dx * dx)

def rms_sep(P):
    X1, X2 = np.meshgrid(x, x, indexing='ij')
    w = P**2
    return np.sqrt(((X1 - X2)**2 * w).sum() / w.sum())

for s in (1, 0, -1):
    print(s, rms_sep(pair(1, 2, s)))
`,
      tests: [
        { name: 'the antisymmetric function changes sign under exchange: P.T equals −P', code: 'np.allclose(pair(1, 2, -1).T, -pair(1, 2, -1))' },
        { name: 'the antisymmetric function vanishes on the diagonal x₁ = x₂', code: 'np.allclose(np.diag(pair(1, 3, -1)), 0)' },
        { name: 'each combination is normalized on the grid', code: 'all(abs((pair(2, 3, s)**2).sum() * dx * dx - 1) < 1e-9 for s in (1, -1))' },
        { name: 'rms separations for a = 1, b = 2: about 0.196 (bosons), 0.321 (distinguishable), 0.410 (fermions)', code: 'abs(rms_sep(pair(1, 2, 1)) - 0.1963) < 2e-3 and abs(rms_sep(pair(1, 2, 0)) - 0.3215) < 2e-3 and abs(rms_sep(pair(1, 2, -1)) - 0.4101) < 2e-3' },
        { name: 'for a = 1, b = 3 (no overlap term) exchange makes no difference to the separation', code: 'abs(rms_sep(pair(1, 3, 1)) - rms_sep(pair(1, 3, -1))) < 1e-6' },
      ],
      hints: ['`np.outer(u, v)[i, j]` is u[i]·v[j], so `np.outer(psi(a), psi(b))` is ψa(x₁)ψb(x₂); its transpose is ψb(x₁)ψa(x₂).', 'For the separation, make the grids with `np.meshgrid(x, x, indexing="ij")` and average (x₁ − x₂)² with weight P².'],
      teach: 'Exchange symmetry is a statement about a 2D array: symmetric means P equals its transpose, antisymmetric means P equals minus its transpose.',
      explain: t`Exchange swaps the two indices, so symmetrizing is \`A + A.T\` and antisymmetrizing \`A - A.T\`. The separations, $0.196 < 0.321 < 0.410$, are the exchange “force” in numbers. For $a = 1$, $b = 3$ they coincide, because the exchange term is proportional to $|\langle x\rangle_{ab}|^2 = |\int x\,\psi_a\psi_b\,dx|^2$, which vanishes when $a + b$ is even — the subject of lesson M1.2.`,
    }),
    multi({
      id: 'which-fermions', difficulty: 2,
      prompt: t`Which of these are fermions? A composite particle is a fermion if it contains an odd number of fermions. Select all that apply.`,
      choices: [t`a $^3$He atom (2 protons, 1 neutron, 2 electrons)`, t`a $^4$He atom (2 protons, 2 neutrons, 2 electrons)`, 'a neutron', 'a photon', t`a $^{87}$Rb atom (37 protons, 50 neutrons, 37 electrons)`, t`a $^{40}$K atom (19 protons, 21 neutrons, 19 electrons)`],
      answer: [0, 2, 5],
      why: {
        1: t`Six spin-½ constituents: an even number, so $^4$He is a boson — which is why it becomes a superfluid at 2.17 K.`,
        3: 'The photon has spin 1: a boson.',
        4: t`124 constituents, even: $^{87}$Rb is a boson — the first Bose–Einstein condensate (1995) was made of it.`,
      },
      hints: ['Count protons + neutrons + electrons. Odd → fermion; even → boson.'],
      teach: 'Pauli’s principle applies to every fermion, not only electrons; composite particles are fermions when built from an odd number of fermions.',
      explain: t`$^3$He (5 constituents), the neutron and $^{40}$K (59) are fermions; $^4$He (6), $^{87}$Rb (124) and the photon are bosons. The difference is dramatic at low temperature: $^4$He is superfluid below 2.17 K, while $^3$He atoms must first pair up, and become superfluid only below a few millikelvin (about 1 mK at zero pressure).`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-hom', difficulty: 3, transfer: true,
      prompt: t`In the Hong–Ou–Mandel experiment, two photons enter a 50:50 beam splitter at the same moment, one in each input port. If the photons are identical in every respect (frequency, polarization, timing), the detectors at the two outputs **never** fire together. Why?`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [0, 0.6], aspect: 'wide', xlabel: 'delay between the photons (coherence times)', ylabel: 'P(one photon in each output)', xticks: 8, yticks: 3, axesAt: 'edge', curves: [{ fn: '0.5*(1 - exp(-x^2))', color: 'accent', width: 2.6 }, { fn: '0.5', color: 'ink3', width: 1.6, dash: [6, 4] }], legend: [{ label: 'identical photons', color: 'accent' }, { label: 'distinguishable', color: 'ink3', dash: [6, 4] }], legendAt: 'br' }, caption: 'Coincidence probability against the delay between the photons: the Hong–Ou–Mandel dip (Gaussian wave packets, ideal splitter).' },
      choices: [
        'The two paths to “one photon in each output” (both transmitted, both reflected) have equal and opposite amplitudes; for bosons they cancel, so the photons always leave together',
        'Photons repel each other, so they cannot reach different detectors',
        'Photons are fermions, so they cannot share an output',
        'The beam splitter absorbs one photon whenever two arrive at once',
      ],
      answer: 0,
      why: {
        1: 'Photons do not interact with each other in empty space or in a beam splitter. The effect is interference between two-photon amplitudes.',
        2: 'Photons have spin 1: they are bosons, and they leave the splitter together, not apart.',
        3: 'No energy is lost: both photons are always detected, but at the same output.',
      },
      hints: ['There are two ways to get one photon at each detector: both transmitted, or both reflected. Each reflection carries a factor i.', 'For identical particles these two histories are indistinguishable, so their amplitudes add before squaring.'],
      teach: 'Bosonic exchange symmetry makes identical photons bunch: the two-photon amplitudes for leaving separately cancel.',
      explain: t`“Both transmitted” has amplitude $(1/\sqrt2)^2$ and “both reflected” $(i/\sqrt2)^2 = -\tfrac12$; for identical bosons these add to zero. As the delay grows the photons become distinguishable and the coincidence rate returns to ½. The dip is a standard test of single-photon sources for quantum communication, and the same bosonic bunching is why lasers work.`,
    }),
    num({
      id: 'cp-degeneracy', difficulty: 3,
      prompt: t`Two non-interacting electrons in a one-dimensional box, spins free. The first excited level has one electron in $n = 1$ and one in $n = 2$, energy $5E_1$. Counting spin, how many independent two-electron states have this energy?`,
      visual: boxLevels(3, [[1, true, 0], [2, true, 0]], 'One electron in n = 1, one in n = 2 (spins drawn up only for illustration).'),
      answer: 4, tol: { rel: 0, abs: 0.5 },
      errors: [
        { value: 2, feedback: 'Two spatial combinations (symmetric and antisymmetric) — but each carries a different number of spin states.' },
        { value: 8, feedback: t`That counts distinguishable particles: $2\times2$ orbital orderings times 4 spin states. Identical electrons halve it.` },
        { value: 3, feedback: 'The triplet with the antisymmetric spatial part gives 3; the singlet with the symmetric spatial part adds one more.' },
      ],
      hints: [t`The spatial part can be $\psi_+$ (symmetric) or $\psi_-$ (antisymmetric) of $\psi_1, \psi_2$.`, t`$\psi_+$ pairs with the singlet (1 state); $\psi_-$ with the triplet (3 states).`],
      teach: 'For two electrons the allowed states are (symmetric space × singlet) and (antisymmetric space × triplet).',
      explain: t`$\psi_+\times$ singlet gives 1 state and $\psi_-\times$ triplet gives 3: a fourfold level. Without interactions all four share $5E_1$; add the Coulomb repulsion and the triplet, whose electrons avoid each other, drops below the singlet — helium’s ortho/para splitting in lesson M1.2.`,
    }),
    mcq({
      id: 'cp-k40', difficulty: 3, transfer: true,
      prompt: t`Cooling a gas of $^{40}$K atoms (fermions) by evaporation needs collisions to re-thermalize it. At microkelvin temperatures only s-wave collisions occur — the relative wave function of a colliding pair has $l = 0$, which is even under $\vec r_1 - \vec r_2 \to -(\vec r_1 - \vec r_2)$. DeMarco and Jin (1999) found that a gas with every atom in the same spin state stops re-thermalizing. Why?`,
      visual: pairPic({ a: 1, b: 2, s: -1, caption: 'Two identical fermions in the same spin state (a box, for illustration): the probability of finding them together vanishes on the diagonal.' }),
      choices: [
        'With identical spin states the spatial wave function must be antisymmetric, so the relative motion has odd l: s-wave collisions are forbidden, and identical fermions barely collide when cold',
        'Fermions repel through the exchange force, so they bounce off without exchanging energy',
        'At microkelvin temperatures atoms stop moving, so no collisions happen in any gas',
        'Potassium atoms are bosons, so they condense instead of colliding',
      ],
      answer: 0,
      why: {
        1: 'The “exchange force” is a correlation, not an interaction; it cannot exchange energy. The point is that the s-wave channel is closed.',
        2: 'Bosonic gases at the same temperature re-thermalize fine: atoms still move at centimetres per second.',
        3: t`$^{40}$K has 59 spin-½ constituents: a fermion.`,
      },
      hints: ['Exchanging two atoms swaps their positions, so it sends the relative coordinate r₁ − r₂ to −(r₁ − r₂). What is the parity of an l = 0 relative wave function?', 'With the spin part symmetric, the spatial part must be antisymmetric: odd under r → −r.'],
      teach: 'Identical fermions in the same spin state have an antisymmetric spatial wave function, so they cannot scatter in the s-wave.',
      explain: t`Exchange of identical atoms reverses the relative coordinate; the relative wave function picks up $(-1)^l$. In the same spin state the spatial part must be odd, so $l = 0$ is forbidden and the lowest channel is $l = 1$, frozen out at microkelvin temperatures. DeMarco and Jin cooled a mixture of two spin states instead, reaching the first degenerate Fermi gas of atoms.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §5.1', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'C. K. Hong, Z. Y. Ou & L. Mandel, Phys. Rev. Lett. 59, 2044 (1987)', url: 'https://doi.org/10.1103/PhysRevLett.59.2044' },
    { label: 'B. DeMarco & D. S. Jin, “Onset of Fermi degeneracy in a trapped atomic gas”, Science 285, 1703 (1999)', url: 'https://doi.org/10.1126/science.285.5434.1703' },
  ],
});
