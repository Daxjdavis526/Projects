// The infinite square well — ψ must vanish at both walls, so only whole
// numbers of half-wavelengths fit: Eₙ = n²h²/8mL², ψₙ = √(2/L) sin(nπx/L).
// The ground state is not at zero energy. Worked example: an electron in a
// 1 nm box and its 2 → 1 photon. Quantum-dot colours (with the simple
// model's honest shortfall against measured CdSe dots), a finite-difference
// eigenvalue solver in NumPy, a proton in a nucleus, and the confinement
// energy of electrons in a white dwarf. Every number is computed here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HC, well, ladder, label, seg, U_KG } from './_schrodinger.js';
import { spectrumStrip } from './_diagrams.js';
import { MPC2 } from './_constants.js';
import * as S from '../../src/viz/model/mp-schrodinger.js';

const t = String.raw;
const HC_MEVFM = HC;                                  // 1239.84 MeV fm: the same digits as eV nm
const KB_EV = 8.617333262e-5;                         // eV/K

// CdSe quantum dots (bulk band gap at 300 K and the effective masses used in Brus's model)
const CDSE = { gap: 1.74, me: 0.13, mh: 0.45 };
const dotModel = (R) => CDSE.gap + S.boxEnergy(1, R, 1) * (1 / CDSE.me + 1 / CDSE.mh);
/** Yu, Qu, Guo & Peng (2003): the measured first absorption peak (nm) of a CdSe dot of diameter D (nm), by inverting their sizing curve. */
function yuPeak(D) {
  const f = (l) => 1.6122e-9 * l ** 4 - 2.6575e-6 * l ** 3 + 1.6242e-3 * l ** 2 - 0.4277 * l + 41.57;
  let lo = 500, hi = 660;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (f(m) < D) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

/** The energy diagram alone, from the mp-schrodinger simulation. */
const levels = (L, n, extra = {}, caption) => well({ well: 'infinite', L, n, panels: ['energy'], hide: ['energy', 'scale'], ...extra }, caption);

export default lesson({
  id: 'phys2710.MP7.2',
  title: 'The infinite square well',
  minutes: 14, difficulty: 2,
  intro: t`Trap a particle between two walls it can never cross, a distance $L$ apart. Its wave function must be zero at both walls, so only waves that fit a **whole number of half-wavelengths** survive: $\lambda_n = 2L/n$. With de Broglie’s $p = h/\lambda$ and $E = p^2/2m$, the energy can take only the values

$$E_n = \frac{n^2h^2}{8mL^2}, \qquad \psi_n(x) = \sqrt{\frac 2L}\,\sin\frac{n\pi x}{L}, \qquad n = 1, 2, 3, \ldots$$

Quantization is not put in by hand: it comes from the boundary conditions. And **the lowest energy is not zero** — a confined particle always moves. For an electron in a box 1 nm wide, $E_1 = 0.376$ eV.`,
  symbols: [
    { tex: 'E_n', text: 'the energy of the nth stationary state (all kinetic: the potential energy is zero inside the box), in J or eV' },
    { tex: 'n', text: 'the quantum number, 1, 2, 3 …: the number of half-wavelengths across the box' },
    { tex: 'h', text: t`Planck’s constant, $6.626\times10^{-34}$ J s` },
    { tex: 'm', text: 'the particle’s mass, in kg' },
    { tex: 'L', text: 'the width of the box, in m' },
    { tex: '\\psi_n(x)', text: t`the normalised wave function of state $n$, for $0 \le x \le L$ (zero outside), in $\text{m}^{-1/2}$` },
  ],
  why: 'The box is the simplest model of confinement — and confinement sets the colour of a quantum dot, the size of atoms, and the pressure that holds up a white dwarf.',
  visual: {
    type: 'mp-schrodinger',
    title: 'Standing waves in a box',
    lead: t`Top: the box (grey walls) and its levels. Bottom: the chosen state’s $\psi$ and $|\psi|^2$. Each level is a standing wave with $n$ half-wavelengths between the walls.`,
    tasks: [
      'Step n from 1 to 4: one more half-wavelength each time, one more node, and the energy climbs as n² — 0.376, 1.50, 3.38, 6.02 eV.',
      'Halve the width to 0.5 nm: every level rises fourfold. Squeezing costs energy.',
      'Raise the mass tenfold: every level drops tenfold. Heavy particles have closely spaced levels — which is why a ball in a box looks classical.',
    ],
    params: { mode: 'bound', well: 'infinite', L: 1, n: 1, show: 'both', controls: ['L', 'mass', 'n', 'show'] },
  },
  example: {
    prompt: t`An electron is confined to a box 1.0 nm wide. Find $E_1$ and $E_2$ in eV, and the wavelength of the photon it emits when it drops from $n = 2$ to $n = 1$.`,
    visual: well({ well: 'infinite', L: 1, n: 2, show: 'psi' }, t`An electron in a 1.0 nm box: the levels (top) and $\psi_2$ (bottom), with two half-wavelengths across the box.`),
    steps: [
      { label: 'Use eV and nm', text: t`Write $E_n = \dfrac{n^2(hc)^2}{8(mc^2)L^2}$, with $hc = 1240$ eV nm and $m_ec^2 = 511\,000$ eV, so no powers of ten are needed.` },
      { label: 'Ground state', text: t`$E_1 = \dfrac{(1240\ \text{eV nm})^2}{8(511\,000\ \text{eV})(1.0\ \text{nm})^2} = ${fmt(S.boxEnergy(1, 1), 3)}$ eV.` },
      { label: 'First excited state', text: t`$E_2 = 2^2E_1 = ${fmt(S.boxEnergy(2, 1), 3)}$ eV.` },
      { label: 'The photon', text: t`It carries off the difference, $\Delta E = E_2 - E_1 = 3E_1 = ${fmt(S.boxEnergy(2, 1) - S.boxEnergy(1, 1), 3)}$ eV, so $\lambda = hc/\Delta E = 1240/${fmt(S.boxEnergy(2, 1) - S.boxEnergy(1, 1), 3)} = ${fmt(HC / (S.boxEnergy(2, 1) - S.boxEnergy(1, 1)), 3)}$ nm — infrared.` },
      { label: 'Sense check', text: t`Shrink the box to an atom’s size, 0.1 nm, and $E_1$ grows a hundredfold to ${fmt(S.boxEnergy(1, 0.1), 3)} eV — the scale of atomic binding energies. A box is a crude atom, but it gets the size of things right.` },
    ],
    answer: t`$E_1 = ${fmt(S.boxEnergy(1, 1), 3)}$ eV, $E_2 = ${fmt(S.boxEnergy(2, 1), 3)}$ eV, and the photon has $\lambda = ${fmt(HC / (S.boxEnergy(2, 1) - S.boxEnergy(1, 1)), 3)}$ nm.`,
  },
  practice: [
    num({
      id: 'ground', difficulty: 1,
      gen(r) {
        const L = r.pick([0.5, 0.8, 1.5, 2, 3]), E = S.boxEnergy(1, L);
        return {
          prompt: t`What is the ground-state energy of an electron in a box ${L} nm wide, in eV?`,
          answer: E, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: E / (4 * Math.PI * Math.PI), feedback: t`That is $h^2$ replaced by $\hbar^2$. Either write $E_1 = h^2/8mL^2$ or $\pi^2\hbar^2/2mL^2$ — they are equal.` }],
          hints: [t`$E_1 = \dfrac{(hc)^2}{8\,m_ec^2\,L^2}$ with $hc = 1240$ eV nm and $m_ec^2 = 511\,000$ eV.`],
          teach: 'E₁ = h²/8mL²: for an electron, 0.376 eV × (1 nm / L)².',
          explain: t`$E_1 = \dfrac{1240^2}{8(511\,000)(${L})^2}\ \text{eV} = ${fmt(E, 3)}$ eV, or $0.376\ \text{eV}\times(1/${L})^2$.`,
          visual: levels(L, 1, {}, t`The levels of an electron in a box ${L} nm wide (energy numbers hidden).`),
        };
      },
    }),
    num({
      id: 'squeeze', difficulty: 1,
      gen(r) {
        const k = r.pick([2, 3, 0.5, 4]);
        return {
          prompt: t`A particle sits in the ground state of a box. The box is made ${k > 1 ? `${k} times wider` : 'half as wide'}. By what factor does the ground-state energy change? (Give the new energy divided by the old.)`,
          answer: 1 / (k * k), tol: { rel: 0.005 },
          errors: [{ value: 1 / k, feedback: t`$E_1 \propto 1/L^2$, not $1/L$: the wavelength scales with $L$, the momentum as $1/L$, and the energy as the momentum squared.` }],
          hints: [t`$E_1 = h^2/8mL^2$: only $L$ changes.`],
          teach: 'Confinement energy grows as 1/L²: squeeze a box to half its width and every level rises fourfold.',
          explain: t`$E_1 \propto 1/L^2$, so the factor is $1/${k}^2 = ${fmt(1 / (k * k), 3)}$. ${k < 1 ? 'Squeezing raises every level.' : 'Room to spread out lowers every level.'}`,
          visual: ladder({
            boxes: [{ x0: 0, x1: 1, levels: [1, 4], names: ['n = 1', 'n = 2'], title: 'width L' }, { x0: 1.7, x1: 1.7 + Math.min(1.4, k), levels: [], title: k > 1 ? `width ${k}L` : 'width L/2' }],
            x: [-0.2, 3.4], y: [-0.2, 5.4],
            caption: 'The original box with its two lowest levels, and the new box (its levels not drawn). Widths are not to scale.',
          }),
        };
      },
    }),
    num({
      id: 'transition', difficulty: 2,
      gen(r) {
        const L = r.pick([0.6, 0.8, 1, 1.2]), [ni, nf] = r.pick([[2, 1], [3, 1], [3, 2], [4, 3]]);
        const dE = S.boxEnergy(ni, L) - S.boxEnergy(nf, L), lam = HC / dE;
        return {
          prompt: t`An electron in a box ${L} nm wide drops from $n = ${ni}$ to $n = ${nf}$. What is the wavelength of the photon it emits, in nm?`,
          answer: lam, units: 'nm', tol: { rel: 0.01 },
          errors: [
            { value: HC / S.boxEnergy(ni, L), feedback: t`The photon carries the *difference* between the levels, $E_{${ni}} - E_{${nf}}$, not the whole of $E_{${ni}}$.` },
            { value: HC / ((ni - nf) ** 2 * S.boxEnergy(1, L)), feedback: t`$E_n \propto n^2$, so the gap is $(${ni}^2 - ${nf}^2)E_1$, not $(${ni} - ${nf})^2E_1$.` },
          ],
          hints: [t`$\Delta E = (${ni}^2 - ${nf}^2)E_1$, with $E_1 = 0.376\ \text{eV}\times(1\ \text{nm}/L)^2$.`, t`$\lambda = hc/\Delta E$ with $hc = 1240$ eV nm.`],
          teach: t`A jump between box levels emits $\Delta E = (n_i^2 - n_f^2)E_1$ — the gaps widen as $n$ grows.`,
          explain: t`$E_1 = ${fmt(S.boxEnergy(1, L), 3)}$ eV, so $\Delta E = ${ni * ni - nf * nf}E_1 = ${fmt(dE, 3)}$ eV and $\lambda = 1240/${fmt(dE, 3)} = ${fmt(lam, 3)}$ nm${lam > 700 ? ', in the infrared' : lam < 400 ? ', in the ultraviolet' : ', visible light'}.`,
          visual: levels(L, ni, { top: 5 }, t`The levels of an electron in a box ${L} nm wide; the upper level of the jump is gold.`),
        };
      },
    }),
    mcq({
      id: 'read-state', difficulty: 1,
      prompt: t`The picture shows $\psi$ for one stationary state of a particle in a box. What is that state’s energy, in units of the ground-state energy $E_1$?`,
      choices: ['16', '9', '4', '25'],
      answer: 0,
      why: {
        1: 'Count half-wavelengths, not nodes inside the box: three interior nodes means four half-wavelengths, n = 4.',
        2: t`$n = 4$ is right, but the energy goes as $n^2$, not $n$.`,
        3: 'Five half-wavelengths would need four interior nodes; this wave has three.',
      },
      hints: ['How many half-wavelengths (humps) fit between the walls? That is n.', t`Then $E_n = n^2E_1$.`],
      teach: 'n counts half-wavelengths across the box (n − 1 interior nodes), and the energy is n²E₁.',
      explain: t`Four humps, so $n = 4$ and $E_4 = 16E_1$. The more nodes a wave has, the more sharply it curves, and the more kinetic energy it carries.`,
      visual: well({ well: 'infinite', L: 1, n: 4, show: 'psi', panels: ['wave'], hide: ['axis'] }, 'One stationary state’s ψ in a box (walls shaded grey).'),
    }),
    mcq({
      id: 'zero-point', difficulty: 2,
      prompt: t`Why can a particle in a box never have zero energy?`,
      choices: [
        t`Zero energy would need $\lambda \to \infty$, a flat $\psi$ — which cannot vanish at the walls without being zero everywhere`,
        'Zero energy would mean zero temperature, which can never be reached',
        'The walls keep pushing on the particle, giving it energy',
        'It can: the ground state at absolute zero has E = 0',
      ],
      answer: 0,
      why: {
        1: 'The zero-point energy has nothing to do with heat: a single isolated particle in the ground state still has E₁.',
        2: 'Inside the box no force acts at all (V = 0); the energy is the kinetic energy of the standing wave.',
        3: t`$n = 0$ makes $\psi_0 = \sin 0 = 0$ everywhere: no particle at all. The lowest state is $n = 1$.`,
      },
      hints: [t`What would $\psi$ look like for $E = 0$, i.e. $p = 0$?`, t`The uncertainty principle gives the same answer: confined to $\Delta x \lesssim L$, the particle must have $\Delta p \gtrsim \hbar/L$.`],
      teach: 'Confinement forces a minimum curvature on ψ, so the lowest energy E₁ is above zero — the zero-point energy.',
      explain: t`$E = 0$ means $p = 0$ and no curvature: $\psi$ would be a constant. A constant that is zero at the walls is zero everywhere. The least-curved wave that fits is half a sine, with $E_1 = h^2/8mL^2 > 0$. Even at absolute zero, a confined particle moves.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.15, 1.15], y: [-0.3, 1.7], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [seg(0, -0.25, 0, 1.6, 'ink2', 2.6), seg(1, -0.25, 1, 1.6, 'ink2', 2.6), seg(0, 0, 1, 0, 'ink4', 1, true), { fn: 'sin(pi*x)', domain: [0, 1], color: 'accent', width: 2.4 }, seg(0, 1.3, 1, 1.3, 'bad', 2, true)],
          points: [label(0.5, 0.45, 'n = 1: half a wavelength, E₁ > 0', 'accent', 0, 0, 'center'), label(0.5, 1.3, 'a flat ψ (E = 0) cannot be zero at the walls', 'bad', 0, -12, 'center')],
        },
        caption: 'Inside the walls (grey): the ground state, half a sine wave, and a flat wave with zero kinetic energy that fails to vanish at the walls. Heights are schematic.',
      },
    }),
    num({
      id: 'quantum-dot', difficulty: 3,
      gen(r) {
        const R = r.pick([3, 3.5, 4]), E = dotModel(R), lam = HC / E;
        const eOnly = CDSE.gap + S.boxEnergy(1, R, CDSE.me);
        return {
          prompt: t`A cadmium selenide quantum dot is a crystal a few nanometres across. A photon of energy at least the band gap, 1.74 eV in bulk CdSe, lifts an electron and leaves a “hole”; each is then confined in the dot. In the simplest model the electron (effective mass $0.13\,m_e$) and the hole ($0.45\,m_e$) each gain the ground-state energy of a sphere of radius $R$, $\hbar^2\pi^2/2mR^2$ — the same as a box of width $R$. What wavelength does this model predict for the light of a dot with $R = ${R}$ nm, in nm?`,
          answer: lam, units: 'nm', tol: { rel: 0.01 },
          errors: [
            { value: HC / eOnly, feedback: 'Both carriers are confined: add the hole’s confinement energy too, with its own effective mass.' },
            { value: HC / CDSE.gap, feedback: 'That is the bulk band gap alone. Confinement adds energy and shifts the light bluer.' },
          ],
          hints: [t`For an electron of mass $m_e$, $\hbar^2\pi^2/2m_eR^2 = 0.376\ \text{eV}\times(1\ \text{nm}/R)^2$; divide by 0.13 and by 0.45 for the two carriers.`, t`$E = 1.74\ \text{eV} + 0.376\ \text{eV}\,(1/${R})^2\left(\frac{1}{0.13} + \frac{1}{0.45}\right)$, then $\lambda = 1240/E$.`],
          teach: 'Confinement adds h²/8mR²-type energy to the band gap, so smaller dots glow bluer.',
          explain: t`Confinement adds $${fmt(E - CDSE.gap, 3)}$ eV, so $E = ${fmt(E, 3)}$ eV and $\lambda = ${fmt(lam, 3)}$ nm. Measured dots of diameter ${2 * R} nm absorb most strongly near ${Math.round(yuPeak(2 * R) / 5) * 5} nm (and glow a little redder still): the model overestimates the shift, because the walls are not infinitely high, the electron and hole attract each other, and effective masses grow at high energy. But it gets the trend and the scale right — which is how dot colours are designed.`,
          visual: spectrumStrip({ from: 400, to: 750, marks: [{ nm: HC / CDSE.gap, label: 'bulk CdSe band gap (713 nm)', align: 'right', dx: -4 }], caption: 'The visible spectrum (screen colours approximate) with the band gap of bulk CdSe marked: a large crystal absorbs everything bluer than this. Confinement in a dot pushes its colour bluer.' }),
        };
      },
    }),
    code({
      id: 'fd-box', difficulty: 3,
      prompt: t`Most wells have no formula for their levels, so physicists solve the Schrödinger equation numerically. On a grid of spacing $h$, $\psi''(x_i) \approx (\psi_{i+1} - 2\psi_i + \psi_{i-1})/h^2$, which turns $-\frac{\hbar^2}{2m}\psi'' = E\psi$ into a matrix eigenvalue problem $H\psi = E\psi$. $H$ has $2t$ on its diagonal and $-t$ on the two diagonals beside it, with $t = \hbar^2/2mh^2$. Finish \`box_levels(N, L)\`: build $H$ for $N$ interior grid points in a box of width $L$ nm (with $\psi = 0$ at both walls) and return its eigenvalues, in eV, lowest first. Check them against $n^2E_1$.`,
      starter: t`import numpy as np

hbar2_2m = 0.0380998      # ħ²/2mₑ in eV nm² (an electron)

def box_levels(N, L):
    h = L / (N + 1)       # grid spacing: N interior points between the walls
    t = hbar2_2m / h**2
    # build the N×N matrix H and return np.linalg.eigvalsh(H)
    pass

E = box_levels(500, 1.0)
print("lowest four levels (eV):", E[:4])
print("in units of E1:", E[:4] / E[0])
`,
      answer: t`import numpy as np

hbar2_2m = 0.0380998

def box_levels(N, L):
    h = L / (N + 1)
    t = hbar2_2m / h**2
    H = np.diag(np.full(N, 2 * t)) - t * np.eye(N, k=1) - t * np.eye(N, k=-1)
    return np.linalg.eigvalsh(H)

E = box_levels(500, 1.0)
print("lowest four levels (eV):", E[:4])
print("in units of E1:", E[:4] / E[0])`,
      tests: [
        { name: t`$E_1$ for a 1 nm box is 0.376 eV (within 0.1%)`, code: 'abs(box_levels(500, 1.0)[0] - 0.37603) < 0.0004' },
        { name: t`the levels go as $n^2$: $E_2/E_1 = 4$ and $E_3/E_1 = 9$ (within 0.5%)`, code: '(lambda E: abs(E[1]/E[0] - 4) < 0.02 and abs(E[2]/E[0] - 9) < 0.045)(box_levels(500, 1.0))' },
        { name: t`doubling the width quarters $E_1$`, code: 'abs(box_levels(400, 2.0)[0] - 0.37603/4) < 0.0002' },
        { name: 'the eigenvalues come back lowest first', code: 'bool(np.all(np.diff(box_levels(50, 1.0)) > 0))' },
      ],
      hints: [t`\`np.diag(np.full(N, 2*t))\` puts $2t$ on the diagonal; \`np.eye(N, k=1)\` is a matrix of ones just above it.`, t`\`H = np.diag(np.full(N, 2*t)) - t*np.eye(N, k=1) - t*np.eye(N, k=-1)\`, then \`return np.linalg.eigvalsh(H)\` (for a symmetric matrix; it sorts the eigenvalues).`],
      teach: 'On a grid, the Schrödinger equation becomes a matrix whose eigenvalues are the energy levels.',
      explain: t`With 500 points the lowest levels agree with $n^2h^2/8mL^2$ to a few parts in $10^5$; the error grows for high $n$, whose waves are less well sampled. The same matrix with $V(x_i)$ added to the diagonal solves any well — the double well in the next lessons is done exactly this way.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-nucleus', difficulty: 2,
      gen(r) {
        const L = r.pick([5, 10, 15]), E = (HC_MEVFM * HC_MEVFM) / (8 * MPC2 * L * L);
        return {
          prompt: t`Model a proton confined in a nucleus as a particle in a one-dimensional box ${L} fm wide ($1\ \text{fm} = 10^{-15}$ m). What is its ground-state energy, in MeV? ($m_pc^2 = 938.3$ MeV and $hc = 1240$ MeV fm.)`,
          answer: E, units: 'MeV', tol: { rel: 0.01 },
          errors: [{ value: E / (4 * Math.PI * Math.PI), feedback: t`That uses $\hbar$ where $h$ belongs: $E_1 = (hc)^2/8mc^2L^2$.` }],
          hints: [t`$E_1 = \dfrac{(hc)^2}{8\,m_pc^2\,L^2}$, with $hc$ in MeV fm and $L$ in fm.`],
          teach: 'The same formula at nuclear sizes gives MeV energies — the scale of nuclear physics.',
          explain: t`$E_1 = \dfrac{1240^2}{8(938.3)(${L})^2} = ${fmt(E, 3)}$ MeV. Nuclear energies are millions of times atomic ones because nuclei are about $10^5$ times smaller ($E \propto 1/L^2$) and protons 1836 times heavier.`,
          visual: ladder({ boxes: [{ x0: 0, x1: 1, levels: [1, 4, 9], names: ['E₁ = ?', 'E₂ = 4E₁', 'E₃ = 9E₁'], highlight: [0] }], x: [-0.4, 1.8], y: [-0.4, 10.5], caption: 'A proton in a nucleus modelled as a one-dimensional box: the three lowest levels, to scale relative to each other.' }),
        };
      },
    }),
    mcq({
      id: 'cp-narrow', difficulty: 2,
      prompt: t`An electron in a box emits light of wavelength $\lambda$ when it drops from $n = 2$ to $n = 1$. The same jump in a box half as wide emits light of wavelength:`,
      choices: [t`$\lambda/4$`, t`$\lambda/2$`, t`$2\lambda$`, t`$4\lambda$`],
      answer: 0,
      why: {
        1: t`Energies go as $1/L^2$: halving $L$ multiplies the gap by 4, not 2.`,
        2: 'A narrower box raises the levels and widens the gap, so the photon is bluer — shorter, not longer.',
        3: t`The gap grows fourfold, so the wavelength *shrinks* fourfold: $\lambda \propto 1/\Delta E$.`,
      },
      hints: [t`How does $E_2 - E_1 = 3h^2/8mL^2$ change when $L$ halves? And $\lambda = hc/\Delta E$.`],
      teach: 'Level gaps scale as 1/L², so photon wavelengths scale as L²: a smaller box glows bluer.',
      explain: t`$\Delta E \propto 1/L^2$ grows by 4, so $\lambda = hc/\Delta E$ shrinks by 4. The same rule — smaller is bluer — sets the colours of quantum dots.`,
      visual: ladder({
        boxes: [{ x0: 0, x1: 1, levels: [0.5, 2], names: ['n = 1', 'n = 2'], title: 'width L' }, { x0: 2.1, x1: 2.6, levels: [2, 8], names: ['n = 1', 'n = 2'], title: 'width L/2' }],
        arrows: [{ x: 0.5, from: 2, to: 0.5, label: 'λ' }, { x: 2.35, from: 8, to: 2, label: '?' }],
        x: [-0.3, 3.4], y: [-0.5, 9.4],
        caption: 'Two boxes, the second half as wide, with their two lowest levels drawn to the same energy scale, and the 2 → 1 jump in each.',
      }),
    }),
    num({
      id: 'cp-white-dwarf', difficulty: 3, transfer: true,
      gen(r) {
        const rho = r.pick([1e8, 3e8, 1e9]), n = rho / (2 * U_KG), d = n ** (-1 / 3) * 1e9;     // carbon–oxygen: one electron per two nucleons
        const E = S.boxEnergy(1, d) / 1000, kT = KB_EV * 1e7 / 1000;
        return {
          prompt: t`A white dwarf is the carbon–oxygen core a star like the Sun leaves behind: about a solar mass squeezed to Earth’s size. Where its density is $${tex(rho, 1)}$ kg/m³, its electrons are spaced about $d = ${fmt(d * 1000, 3)}$ pm apart. Treat one electron as confined to a one-dimensional box of width $d$: what is its ground-state energy, in keV?`,
          answer: E, units: 'keV', tol: { rel: 0.01 },
          errors: [{ value: E / (4 * Math.PI * Math.PI), feedback: t`$E_1 = h^2/8mL^2$ — with $h$, not $\hbar$.` }],
          hints: [t`$E_1 = 0.376\ \text{eV}\times(1\ \text{nm}/d)^2$ for an electron; $d = ${fmt(d, 3)}$ nm.`, t`$(1/${fmt(d, 3)})^2 = ${tex(1 / (d * d), 3)}$; multiply by 0.376 eV and convert to keV.`],
          teach: 'Squeezed to picometre spacings, electrons gain confinement energies of tens to hundreds of keV — far more than their thermal energy.',
          explain: t`$E_1 = 0.376\ \text{eV}/${fmt(d, 3)}^2 = ${fmt(E, 3)}$ keV. The star’s interior is about $10^7$ K, where $kT$ is only ${fmt(kT, 2)} keV: the electrons’ energy comes from confinement, not heat, and so does their pressure — **degeneracy pressure**, which holds the star up even as it cools. ${E > 100 ? 'At over 100 keV the electrons approach their rest energy, 511 keV, and this non-relativistic formula is already overestimating; push the density higher and they become relativistic — the road to Chandrasekhar’s mass limit.' : 'Denser regions push the electrons towards their rest energy, 511 keV — the road to Chandrasekhar’s mass limit.'} (A box is a rough model; the full treatment adds the exclusion principle and three dimensions.)`,
          visual: {
            type: 'graph',
            params: {
              x: [-1, 7], y: [-0.15, 1.4], xlog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'energy (eV), logarithmic', ylabel: '', yticks: 0, grid: false,
              curves: [seg(Math.log10(kT * 1000), 0, Math.log10(kT * 1000), 1, 'warn', 2.6), seg(Math.log10(511e3), 0, Math.log10(511e3), 1, 'violet', 2.6), seg(-1, 0, 7, 0, 'ink3', 1.2)],
              points: [label(Math.log10(kT * 1000), 1, 'thermal energy kT at 10⁷ K', 'warn', 0, -12, 'center'), label(Math.log10(511e3), 1, 'electron rest energy, 511 keV', 'violet', 0, -12, 'center'), label(-0.85, 1.25, 'where does the confinement energy E₁ fall?', 'gold', 0, 0, 'left')],
            },
            caption: 'Two energies for scale on a logarithmic axis: an electron’s thermal energy in a white dwarf’s interior, and its rest energy.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §7.4 (the quantum particle in a box)', url: 'https://openstax.org/books/university-physics-volume-3/pages/7-4-the-quantum-particle-in-a-box' },
    { label: 'Yu, Qu, Guo & Peng (2003), Experimental determination of the extinction coefficient of CdTe, CdSe and CdS nanocrystals, Chem. Mater. 15, 2854', url: 'https://doi.org/10.1021/cm034081k' },
    { label: 'Brus (1984), Electron–electron and electron–hole interactions in small semiconductor crystallites, J. Chem. Phys. 80, 4403', url: 'https://doi.org/10.1063/1.447218' },
  ],
});
