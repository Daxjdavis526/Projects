// Adding angular momenta (Griffiths & Schroeter §4.4.3; Sakurai §3.8). Two
// spins ½: the product basis |m₁m₂⟩ against the total-spin basis |s m⟩ —
// the triplet (symmetric) and the singlet (antisymmetric), built by lowering
// |↑↑⟩ with S₋ = S₁₋ + S₂₋; S₁·S₂ = ½(S² − S₁² − S₂²) = ħ²/4 or −3ħ²/4;
// the rule j₁ ⊗ j₂ = |j₁ − j₂| ⊕ … ⊕ (j₁ + j₂) and Clebsch–Gordan
// coefficients (l ⊗ ½ in closed form). The hyperfine Hamiltonian A S·I of
// hydrogen's ground state: the singlet lies hν below the triplet, and Fermi's
// contact formula (phys3600.M6.6 ends on the contact term) gives
// ν = (16/3)α²cR∞(μₚ/μ_B)(1 + aₑ)(1 + mₑ/mₚ)⁻³ = 1420.485 MHz against the
// measured 1420.405 751 768 MHz (56 ppm high: relativistic, QED and
// proton-structure corrections). Explore: the Breit–Rabi diagram of the four
// hyperfine levels against B. Code: Clebsch–Gordan by diagonalizing S² on
// the 4-dimensional space. Transfers: 21 cm Doppler velocities in radio
// astronomy, and the field sensitivity of hydrogen masers. CODATA 2022.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { GE, MU_B, H, C, GAMMA_P_HZ, seg, label, r6 } from './_qm.js';
import { RINF, MP_ME } from '../phys2710/_constants.js';

const t = String.raw;
const D = Math.PI / 180;
const HFS = 1420405751.768;                     // Hz, hydrogen ground-state hyperfine frequency, measured with hydrogen masers (Hellwig et al. 1970)
const ALPHA = 7.2973525643e-3;                  // fine-structure constant (CODATA 2022)
const MU_P = 1.41060679545e-26;                 // J/T, proton magnetic moment (CODATA 2022)
const AE = 1.15965218059e-3;                    // electron magnetic-moment anomaly (CODATA 2022)
const NU_F0 = (16 / 3) * ALPHA ** 2 * C * RINF * (MU_P / MU_B);       // Fermi's formula, infinite proton mass, g = 2
const NU_F = NU_F0 * (1 + AE) * (1 + 1 / MP_ME) ** -3;               // with the electron anomaly and the reduced mass
const GEH = (GE * MU_B) / H / 1e6;             // MHz/T, the electron's |g|μ_B/h
const GPH = GAMMA_P_HZ / 1e6;                  // MHz/T, the proton's
const A_MHZ = HFS / 1e6;
const clockShift = (B) => { const b = (GEH + GPH) * 1e6 * B; return (b * b) / (Math.sqrt(HFS * HFS + b * b) + HFS); };   // Hz, stable form

/** Product states of j₁ ⊗ j₂ stacked by total m: a dot for each, columns by m. */
function countPic(j1, j2, caption) {
  const pts = [], ms = [];
  for (let a = -j1; a <= j1 + 1e-9; a++) for (let b = -j2; b <= j2 + 1e-9; b++) ms.push(a + b);
  const counts = {};
  for (const m of ms) counts[m] = (counts[m] || 0) + 1;
  for (const [m, n] of Object.entries(counts)) for (let k = 0; k < n; k++) pts.push({ x: +m, y: k + 0.5, r: 6, color: 'accent' });
  const M = j1 + j2;
  return {
    type: 'graph',
    params: { x: [r6(-M - 0.8), r6(M + 0.8)], y: [0, Math.max(...Object.values(counts)) + 0.6], aspect: 'wide', xlabel: 'total m = m₁ + m₂', ylabel: 'number of product states', xticks: 2 * M + 2, yticks: 0, axesAt: 'edge', points: pts },
    caption,
  };
}

/** Two unit spin arrows in a plane, an angle g apart. */
const twoSpins = (g, caption) => ({
  type: 'graph',
  params: {
    x: [-1.4, 1.4], y: [-1.15, 1.2], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    arrows: [{ from: [-0.7, 0], to: [-0.7, 1], color: 'gold', width: 2.6, label: 'spin 1', labelDx: 6, labelDy: -4 }, { from: [0.1, 0], to: [r6(0.1 + Math.sin(g * D)), r6(Math.cos(g * D))], color: 'violet', width: 2.6, label: 'spin 2', labelDx: 6, labelDy: -4 }],
    curves: [{ param: [`0.1 + 0.35*sin(t)`, `0.35*cos(t)`], t: [0, r6(g * D)], color: 'ink3', width: 1.4 }],
  },
  caption,
});

export default lesson({
  id: 'phys4700.M6.3',
  title: 'Adding angular momenta',
  minutes: 18, difficulty: 3,
  intro: t`Two spin-½ particles have four product states, $|{\uparrow\uparrow}\rangle, |{\uparrow\downarrow}\rangle, |{\downarrow\uparrow}\rangle, |{\downarrow\downarrow}\rangle$. Their **total** spin $\hat{\vec S} = \hat{\vec S}_1 + \hat{\vec S}_2$ is again an angular momentum, and the states of definite $S^2$ and $S_z$ are three with $s = 1$ — the **triplet**, symmetric under exchange — and one with $s = 0$, the **singlet**, antisymmetric:

$$\begin{gathered} |1\,1\rangle = |{\uparrow\uparrow}\rangle \\ |1\,0\rangle = \tfrac{1}{\sqrt2}\big(|{\uparrow\downarrow}\rangle + |{\downarrow\uparrow}\rangle\big) \\ |1\,{-1}\rangle = |{\downarrow\downarrow}\rangle \\ |0\,0\rangle = \tfrac{1}{\sqrt2}\big(|{\uparrow\downarrow}\rangle - |{\downarrow\uparrow}\rangle\big) \end{gathered}$$

In general $j_1$ and $j_2$ combine to every $j$ from $|j_1 - j_2|$ to $j_1 + j_2$ in whole steps, and the expansion coefficients are the **Clebsch–Gordan coefficients**. In hydrogen the electron’s and proton’s spins couple this way; the triplet and singlet differ in energy by $h\times1420.4$ MHz — the 21-cm line.`,
  symbols: [
    { tex: '|{\\uparrow\\downarrow}\\rangle', text: t`a product state: particle 1 spin up along $z$, particle 2 spin down` },
    { tex: '|s\\,m\\rangle', text: t`a state of total spin: $S^2 = s(s+1)\hbar^2$ and $S_z = m\hbar$` },
    { tex: '\\hat{\\vec S} = \\hat{\\vec S}_1 + \\hat{\\vec S}_2', text: 'the total spin operator; each part acts on its own particle' },
    { tex: 'j_1,\\ j_2', text: 'the angular momentum quantum numbers being added (spins, orbital, or both)' },
    { tex: '\\text{Clebsch–Gordan coefficient}', text: t`$\langle j_1m_1;\ j_2m_2|j\,m\rangle$: the amplitude of a product state in a total-$j$ state` },
  ],
  why: 'Addition of angular momenta gives atomic term symbols, fine and hyperfine structure, the 21-cm line, nuclear spins, and the Bell states of quantum information — the singlet is the most famous entangled state.',
  visual: {
    type: 'graph',
    title: 'The four hyperfine levels of hydrogen',
    lead: t`Hydrogen’s ground state: $\hat H = A\,\hat{\vec S}\cdot\hat{\vec I}/\hbar^2$ couples the electron spin $\vec S$ to the proton spin $\vec I$, and a field $B$ adds each spin’s Zeeman energy. Energies in MHz (energy divided by $h$). Move the field and read the levels.`,
    tasks: [
      'At B = 0 three levels coincide — the triplet, F = 1 — and the singlet, F = 0, lies 1420.4 MHz below. That gap is the 21-cm line.',
      'A small field splits the triplet into three, but the F = 1, m = 0 level moves only quadratically: the maser’s field-insensitive “clock” transition.',
      'By 100 mT the levels have regrouped in two pairs by the electron’s spin: the field has broken the coupling, and the product states are now the eigenstates.',
    ],
    params: {
      x: [0, 100], y: [-2050, 1900], aspect: 'wide', xlabel: 'B (mT)', ylabel: 'E/h (MHz)', xticks: 5, yticks: 6, axesAt: 'edge',
      sliders: [{ key: 'b', label: t`Field $B$`, min: 0, max: 100, step: 1, value: 20, unit: '\\text{mT}', explain: 'A steady magnetic field along z.' }],
      curves: [
        { fn: `${r6(A_MHZ / 4)} + ${r6((GEH - GPH) / 1000)}*x/2`, color: 'accent', width: 2.2 },
        { fn: `${r6(A_MHZ / 4)} - ${r6((GEH - GPH) / 1000)}*x/2`, color: 'accent', width: 2.2 },
        { fn: `${r6(-A_MHZ / 4)} + sqrt(${r6(A_MHZ)}^2 + (${r6((GEH + GPH) / 1000)}*x)^2)/2`, color: 'gold', width: 2.6 },
        { fn: `${r6(-A_MHZ / 4)} - sqrt(${r6(A_MHZ)}^2 + (${r6((GEH + GPH) / 1000)}*x)^2)/2`, color: 'violet', width: 2.6 },
      ],
      vlines: [{ x: 'b', color: 'ink3' }],
      points: [label(1.5, A_MHZ / 4, 'F = 1', 'accent', 4, -12), label(1.5, (-3 * A_MHZ) / 4, 'F = 0', 'violet', 4, 14)],
      readouts: [
        { label: 'clock transition (F = 1, m = 0 to F = 0) (MHz)', expr: `sqrt(${r6(A_MHZ)}^2 + (${r6((GEH + GPH) / 1000)}*b)^2)`, digits: 7 },
        { label: 'electron Zeeman energy gμ_B B/h (MHz)'.replace('μ_B', 'μB'), expr: `${r6(GEH / 1000)}*b`, digits: 4 },
      ],
    },
    caption: t`The Breit–Rabi formula for $\hat H = A\,\hat{\vec S}\cdot\hat{\vec I}/\hbar^2 + g_e\mu_BB\hat S_z/\hbar - g_p\mu_NB\hat I_z/\hbar$, with the measured $A/h = 1420.405\,751\,768$ MHz. Gold: the $F = 1$, $m = 0$ level; violet: $F = 0$. Exact for the ground state; the proton’s Zeeman term is drawn but is 658 times smaller than the electron’s.`,
  },
  example: {
    prompt: t`Build the total-spin states of two spins ½ from $|{\uparrow\uparrow}\rangle$, find the eigenvalues of $\hat{\vec S}_1\cdot\hat{\vec S}_2$, and use Fermi’s contact formula to predict the hyperfine frequency of hydrogen.`,
    visual: countPic(0.5, 0.5, t`The four product states sorted by total $m$: one at $m = 1$, two at $m = 0$, one at $m = -1$. A triplet takes one from each column; the leftover $m = 0$ state is the singlet.`),
    steps: [
      { label: 'Top state', text: t`$|{\uparrow\uparrow}\rangle$ has $m = 1$, the largest possible, so it must be $|1\,1\rangle$.` },
      { label: 'Lower it', text: t`$\hat S_- = \hat S_{1-} + \hat S_{2-}$ and $\hat S_-|1\,1\rangle = \sqrt2\,\hbar|1\,0\rangle$, while $\hat S_{1-}|{\uparrow\uparrow}\rangle + \hat S_{2-}|{\uparrow\uparrow}\rangle = \hbar\big(|{\downarrow\uparrow}\rangle + |{\uparrow\downarrow}\rangle\big)$. So $|1\,0\rangle = \tfrac{1}{\sqrt2}(|{\uparrow\downarrow}\rangle + |{\downarrow\uparrow}\rangle)$; lowering again gives $|{\downarrow\downarrow}\rangle$.` },
      { label: 'The singlet', text: t`The one remaining $m = 0$ state is orthogonal to $|1\,0\rangle$: $|0\,0\rangle = \tfrac{1}{\sqrt2}(|{\uparrow\downarrow}\rangle - |{\downarrow\uparrow}\rangle)$. $\hat S_\pm$ annihilate it, so $s = 0$.` },
      { label: 'Dot product', text: t`$\hat S^2 = \hat S_1^2 + \hat S_2^2 + 2\hat{\vec S}_1\cdot\hat{\vec S}_2$, so $\hat{\vec S}_1\cdot\hat{\vec S}_2 = \tfrac12\big[s(s+1) - \tfrac34 - \tfrac34\big]\hbar^2$: $+\tfrac14\hbar^2$ in the triplet, $-\tfrac34\hbar^2$ in the singlet. A coupling $A\,\hat{\vec S}\cdot\hat{\vec I}/\hbar^2$ therefore splits them by exactly $A$.` },
      { label: 'Fermi’s formula', text: t`The contact interaction — the delta-function term in a magnetic dipole’s field, met at the end of [the magnetic dipole](#/lesson/phys3600.M6.6) — gives $A/h = \tfrac{16}{3}\alpha^2cR_\infty\,\dfrac{\mu_p}{\mu_B}$ for $g_e = 2$ and an infinitely heavy proton: $${fmt(NU_F0 / 1e6, 7)}$ MHz. With the electron’s anomaly $(1 + a_e)$ and the reduced-mass factor $(1 + m_e/m_p)^{-3}$ (the electron’s density at the proton scales as $\mu^3$): $${fmt(NU_F / 1e6, 7)}$ MHz.` },
      { label: 'Compare', text: t`Measured: $1420.405\,751\,768$ MHz. Fermi’s formula is $${fmt((NU_F / HFS - 1) * 1e6, 2)}$ parts per million high; relativistic (Breit), QED, recoil and proton-structure corrections account for the rest. The wavelength is $c/\nu = ${fmt((C / HFS) * 100, 5)}$ cm.` },
    ],
    answer: t`Triplet $|1\,m\rangle$ (symmetric) with $\hat{\vec S}_1\cdot\hat{\vec S}_2 = \tfrac14\hbar^2$; singlet (antisymmetric) with $-\tfrac34\hbar^2$. Fermi’s formula gives $${fmt(NU_F / 1e6, 6)}$ MHz against the measured $1420.406$ MHz.`,
  },
  practice: [
    mcq({
      id: 'j-values', difficulty: 2,
      prompt: t`An electron in a d orbital ($l = 2$) has spin $s = \tfrac12$. What values can its total angular momentum $j$ take, and how many states $|j\,m_j\rangle$ are there altogether?`,
      visual: countPic(2, 0.5, t`The ten product states $|m_l, m_s\rangle$ of $l = 2$ and $s = \tfrac12$, sorted by total $m = m_l + m_s$.`),
      choices: [t`$j = \tfrac32, \tfrac52$; 10 states`, t`$j = \tfrac12, \tfrac32, \tfrac52$; 12 states`, t`$j = \tfrac52$ only; 6 states`, t`$j = 2, 3$; 12 states`],
      answer: 0,
      why: {
        1: t`$j$ runs from $|l - s| = \tfrac32$ to $l + s = \tfrac52$: there is no $j = \tfrac12$. And the count must equal $(2l + 1)(2s + 1) = 10$.`,
        2: t`$\tfrac52$ supplies only 6 of the 10 product states; the other 4 form $j = \tfrac32$.`,
        3: t`Adding a half-integer to an integer gives half-integers.`,
      },
      hints: [t`$j = |j_1 - j_2|, \dots, j_1 + j_2$ in whole steps.`, t`Check: $\sum(2j + 1)$ must equal $(2l + 1)(2s + 1)$.`],
      teach: 'j₁ ⊗ j₂ contains each j from |j₁ − j₂| to j₁ + j₂ once, and the number of states is conserved.',
      explain: t`$j = \tfrac52$ (6 states) and $j = \tfrac32$ (4 states): $6 + 4 = 10 = 5\times2$. In the picture, the top column ($m = \tfrac52$) has one state, which starts $j = \tfrac52$; every other column has two, one for each $j$. These are the $d_{3/2}$ and $d_{5/2}$ levels split by spin–orbit coupling.`,
    }),
    num({
      id: 's1s2', difficulty: 2,
      gen(r) {
        const a = r.pick([0, 30, 45, 60, 120, 135]);
        const ans = -0.25 + Math.sin(2 * a * D) / 2;
        return {
          prompt: t`Two spins ½ are in $|\psi\rangle = \cos${a}^\circ\,|{\uparrow\downarrow}\rangle + \sin${a}^\circ\,|{\downarrow\uparrow}\rangle$. What is $\langle\hat{\vec S}_1\cdot\hat{\vec S}_2\rangle$, in units of $\hbar^2$?`,
          visual: { type: 'graph', params: { x: [0, 5], y: [-1.1, 1.1], aspect: 'wide', xlabel: 'product state', ylabel: 'amplitude', xticks: 0, yticks: 2, axesAt: 'edge', curves: [seg(0, 0, 5, 0, 'ink3', 1), seg(1, 0, 1, 0, 'gold', 10), seg(2, 0, 2, r6(Math.cos(a * D)), 'gold', 10), seg(3, 0, 3, r6(Math.sin(a * D)), 'gold', 10), seg(4, 0, 4, 0, 'gold', 10)], points: [label(1, 0, '↑↑', 'ink2', 0, 14, 'center'), label(2, 0, '↑↓', 'ink2', 0, 14, 'center'), label(3, 0, '↓↑', 'ink2', 0, 14, 'center'), label(4, 0, '↓↓', 'ink2', 0, 14, 'center')] }, caption: 'The state’s amplitudes in the product basis.' },
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: -0.25, feedback: t`$\hat{\vec S}_1\cdot\hat{\vec S}_2$ includes $\hat S_{1x}\hat S_{2x} + \hat S_{1y}\hat S_{2y} = \tfrac12(\hat S_{1+}\hat S_{2-} + \hat S_{1-}\hat S_{2+})$, which swaps $\uparrow\downarrow \leftrightarrow \downarrow\uparrow$ and gives a cross term.` }, { value: 0.25, feedback: 'That is the triplet value; this state mixes triplet and singlet.' }].filter((e) => Math.abs(e.value - ans) > 0.005),
          hints: [t`Write the state in the triplet/singlet basis: $|1\,0\rangle$ with amplitude $\tfrac{\cos\alpha + \sin\alpha}{\sqrt2}$, $|0\,0\rangle$ with $\tfrac{\cos\alpha - \sin\alpha}{\sqrt2}$.`, t`$\langle\hat{\vec S}_1\cdot\hat{\vec S}_2\rangle = \tfrac14P_{\text{triplet}} - \tfrac34P_{\text{singlet}}$.`],
          teach: 'S₁·S₂ is diagonal in the total-spin basis: +¼ħ² on the triplet and −¾ħ² on the singlet.',
          explain: t`$P_{\text{triplet}} = \tfrac12(1 + \sin2\alpha)$ and $P_{\text{singlet}} = \tfrac12(1 - \sin2\alpha)$, so $\langle\hat{\vec S}_1\cdot\hat{\vec S}_2\rangle = -\tfrac14 + \tfrac12\sin2\alpha = ${fmt(ans, 4)}\,\hbar^2$.`,
        };
      },
    }),
    num({
      id: 'p-singlet', difficulty: 3,
      gen(r) {
        const g = r.pick([30, 45, 60, 90, 120, 180]);
        const ans = (1 - Math.cos(g * D)) / 4;
        return {
          prompt: t`Spin 1 is prepared up along $z$; spin 2 is prepared up along a direction at $${g}^\circ$ to $z$ (in the $xz$-plane). The two are uncorrelated: the state is the product $|{+z}\rangle|{+n}\rangle$. What is the probability that a measurement of the total spin finds the singlet, $s = 0$?`,
          visual: twoSpins(g, t`The two spin directions, $${g}^\circ$ apart.`),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: (1 - Math.cos(g * D)) / 2, feedback: t`$|\langle0\,0|\psi\rangle|^2 = \tfrac12\sin^2(\gamma/2)$: the singlet amplitude carries a $1/\sqrt2$.` }, { value: 0.25, feedback: 'Only for unpolarized spins is the singlet probability ¼; here it depends on the angle.' }].filter((e) => Math.abs(e.value - ans) > 0.005),
          hints: [t`$|{+n}\rangle = \cos\tfrac\gamma2|{\uparrow}\rangle + \sin\tfrac\gamma2|{\downarrow}\rangle$, so the product has $|{\uparrow\downarrow}\rangle$ amplitude $\sin\tfrac\gamma2$ and no $|{\downarrow\uparrow}\rangle$.`, t`$\langle0\,0|\psi\rangle = \tfrac{1}{\sqrt2}\sin\tfrac\gamma2$.`],
          teach: 'For two spins pointing in directions an angle γ apart, the singlet probability is (1 − cos γ)/4: zero when parallel, ½ when antiparallel.',
          explain: t`$P(s = 0) = \tfrac12\sin^2\tfrac{\gamma}{2} = \tfrac14(1 - \cos\gamma) = ${fmt(ans, 4)}$. Even antiparallel spins are only half singlet: $|{\uparrow\downarrow}\rangle = \tfrac{1}{\sqrt2}(|1\,0\rangle + |0\,0\rangle)$.`,
        };
      },
    }),
    num({
      id: 'cg-half', difficulty: 3,
      gen(r) {
        const l = r.pick([1, 2, 3]), m2 = r.pick([-1, 1, 3, -3, 5].filter((k) => Math.abs(k) <= 2 * l + 1));
        const m = m2 / 2, ans = (l + m + 0.5) / (2 * l + 1);
        return {
          prompt: t`For an orbital angular momentum $l = ${l}$ combined with spin ½, the stretched state is $|j = l + \tfrac12,\ m\rangle = \sqrt{\dfrac{l + m + \frac12}{2l + 1}}\,|m - \tfrac12\rangle|{\uparrow}\rangle + \sqrt{\dfrac{l - m + \frac12}{2l + 1}}\,|m + \tfrac12\rangle|{\downarrow}\rangle$. In $|j = ${2 * l + 1}/2,\ m = ${m2}/2\rangle$, what is the probability that the electron’s spin is up?`,
          visual: countPic(l, 0.5, t`The product states of $l = ${l}$ and $s = \tfrac12$ by total $m$; each column with two states mixes them into $j = l \pm \tfrac12$.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1 - ans, feedback: 'That is the probability of spin down.' }, { value: 0.5, feedback: 'The two components are not equally weighted except at m = 0 (which needs half-integer l).' }].filter((e) => Math.abs(e.value - ans) > 0.005),
          hints: [t`The spin-up component carries the first Clebsch–Gordan coefficient; square it.`, t`$P(\uparrow) = (l + m + \tfrac12)/(2l + 1)$ with $l = ${l}$, $m = ${fmt(m, 2)}$.`],
          teach: 'Clebsch–Gordan coefficients squared are the probabilities of each product state inside a total-j state.',
          explain: t`$P(\uparrow) = (${l} + ${fmt(m, 2)} + 0.5)/${2 * l + 1} = ${fmt(ans, 4)}$. At $m = j$ it is 1 (spin up, $m_l = l$); at $m = -j$ it is 0. In between, total $j$ is sharp but neither $m_l$ nor $m_s$ is.`,
        };
      },
    }),
    code({
      id: 'cg-diag', difficulty: 3,
      prompt: t`Find the Clebsch–Gordan states of two spins ½ by diagonalization. Build each spin operator on the 4-dimensional space with Kronecker products — $\hat S_{1k} = \tfrac12\sigma_k\otimes\mathbb 1$, $\hat S_{2k} = \mathbb 1\otimes\tfrac12\sigma_k$ (units of $\hbar$), basis order $\uparrow\uparrow, \uparrow\downarrow, \downarrow\uparrow, \downarrow\downarrow$ — and form $\hat S^2 = \sum_k(\hat S_{1k} + \hat S_{2k})^2$. Write \`S2\` (the matrix), and \`total_spin_states()\` returning the eigenvalues of $\hat S^2$ (ascending) and the eigenvectors as columns, using \`np.linalg.eigh\`. Also write \`singlet\` as a 4-vector.`,
      starter: t`import numpy as np

sx = np.array([[0, 1], [1, 0]]) / 2
sy = np.array([[0, -1j], [1j, 0]]) / 2
sz = np.array([[1, 0], [0, -1]]) / 2
I2 = np.eye(2)

S2 = None

def total_spin_states():
    pass

singlet = None
`,
      answer: t`import numpy as np

sx = np.array([[0, 1], [1, 0]]) / 2
sy = np.array([[0, -1j], [1j, 0]]) / 2
sz = np.array([[1, 0], [0, -1]]) / 2
I2 = np.eye(2)

S = [np.kron(s, I2) + np.kron(I2, s) for s in (sx, sy, sz)]
S2 = sum(Sk @ Sk for Sk in S)

def total_spin_states():
    return np.linalg.eigh(S2)

singlet = np.array([0, 1, -1, 0]) / np.sqrt(2)
`,
      tests: [
        { name: t`$\hat S^2$ has eigenvalues $0, 2, 2, 2$ (that is, $s = 0$ once and $s = 1$ three times)`, code: 'np.allclose(total_spin_states()[0], [0, 2, 2, 2])' },
        { name: t`the $s = 0$ eigenvector is the singlet, up to a phase`, code: 'abs(abs(np.vdot(total_spin_states()[1][:, 0], singlet)) - 1) < 1e-10' },
        { name: t`$\hat S^2$ annihilates the singlet and keeps $|1\,0\rangle$ with eigenvalue 2`, code: 'np.allclose(S2 @ singlet, 0) and np.allclose(S2 @ (np.array([0, 1, 1, 0]) / np.sqrt(2)), 2 * np.array([0, 1, 1, 0]) / np.sqrt(2))' },
        { name: t`$\hat{\vec S}_1\cdot\hat{\vec S}_2 = \tfrac12(\hat S^2 - \tfrac32)$ has eigenvalues $-\tfrac34$ and $\tfrac14$`, code: 'np.allclose(np.linalg.eigvalsh((S2 - 1.5 * np.eye(4)) / 2), [-0.75, 0.25, 0.25, 0.25])' },
        { name: 'the product state |↑↓⟩ is not an eigenvector of S²', code: 'not np.allclose(S2 @ np.array([0, 1, 0, 0]), (np.array([0, 1, 0, 0]) @ S2 @ np.array([0, 1, 0, 0])) * np.array([0, 1, 0, 0]))' },
      ],
      hints: ['`np.kron(A, B)` is A ⊗ B. The total component is S₁ₖ + S₂ₖ = kron(σₖ/2, I) + kron(I, σₖ/2).', 'Sum the squares of the three total components; `np.linalg.eigh` returns ascending eigenvalues and eigenvectors as columns.'],
      teach: 'Clebsch–Gordan coefficients are the eigenvectors of S² in the product basis.',
      explain: t`The eigenvalue 0 belongs to $(|{\uparrow\downarrow}\rangle - |{\downarrow\uparrow}\rangle)/\sqrt2$; the eigenvalue $2 = 1\cdot(1 + 1)$ to a three-dimensional space that \`eigh\` may return in any orthonormal basis — diagonalize $\hat S_z$ inside it to recover $|1\,1\rangle, |1\,0\rangle, |1\,{-1}\rangle$. The same few lines, with larger matrices, add any two angular momenta.`,
    }),
    mcq({
      id: 'not-eigen', difficulty: 2,
      prompt: t`Which of these two-spin states is **not** an eigenstate of the total $\hat S^2$?`,
      visual: countPic(0.5, 0.5, 'The four product states by total m. The two at m = 0 are where product states and total-spin states differ.'),
      choices: [t`$|{\uparrow\downarrow}\rangle$`, t`$|{\uparrow\uparrow}\rangle$`, t`$\tfrac{1}{\sqrt2}(|{\uparrow\downarrow}\rangle - |{\downarrow\uparrow}\rangle)$`, t`$|{\downarrow\downarrow}\rangle$`],
      answer: 0,
      why: {
        1: t`$|{\uparrow\uparrow}\rangle = |1\,1\rangle$: the only state with $m = 1$.`,
        2: t`That is the singlet, $s = 0$.`,
        3: t`$|{\downarrow\downarrow}\rangle = |1\,{-1}\rangle$.`,
      },
      hints: [t`$|{\uparrow\downarrow}\rangle = \tfrac{1}{\sqrt2}(|1\,0\rangle + |0\,0\rangle)$.`],
      teach: 'Antiparallel product states are half triplet, half singlet; only symmetric or antisymmetric combinations have definite total spin.',
      explain: t`$|{\uparrow\downarrow}\rangle$ has $S_z = 0$ but no definite $S^2$: a measurement gives $s = 1$ or $s = 0$ with probability $\tfrac12$ each. “Antiparallel” is not the same as “total spin zero”.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-21cm', difficulty: 2, transfer: true,
      gen(r) {
        const v = r.pick([-220, -120, -45, 60, 150, 250]);           // km/s, positive = receding
        const fobs = HFS * (1 - (v * 1e3) / C);
        const ans = v;
        return {
          prompt: t`Radio astronomers map the Milky Way’s spiral arms with the 21-cm line of cold hydrogen — the spin flip from the triplet to the singlet, at $\nu_0 = 1420.405\,751\,768$ MHz. A cloud is seen at $\nu = ${fmt(fobs / 1e6, 10)}$ MHz. Using the radio Doppler convention $v = c(\nu_0 - \nu)/\nu_0$, what is its line-of-sight velocity, in km/s (positive = moving away)?`,
          visual: { type: 'graph', params: { x: [1419.2, 1421.6], y: [0, 1.15], aspect: 'wide', xlabel: 'frequency (MHz)', ylabel: 'brightness (scaled)', xticks: 6, yticks: 0, axesAt: 'edge', curves: [{ fn: `exp(-(x - ${r6(fobs / 1e6)})^2/(2*0.04^2))`, color: 'accent', width: 2.4, samples: 2000 }], vlines: [{ x: r6(A_MHZ), color: 'gold', label: 'ν₀ (rest)' }] }, caption: 'The cloud’s line (blue) against the rest frequency (gold). Line width schematic.' },
          answer: ans, units: 'km/s', tol: { rel: 0.005, abs: 0.3 },
          errors: [{ value: -ans, feedback: t`A lower frequency means the cloud is receding (positive $v$); a higher one, approaching.` }],
          hints: [t`$v = c\,\dfrac{\nu_0 - \nu}{\nu_0}$ with $c = 299\,792.458$ km/s.`, t`$\nu_0 - \nu = ${fmt((HFS - fobs) / 1e3, 6)}$ kHz.`],
          teach: 'The hyperfine line is so sharp that its Doppler shift gives the velocity of hydrogen clouds across the Galaxy to a fraction of a km/s.',
          explain: t`$v = c(\nu_0 - \nu)/\nu_0 = ${fmt(ans, 4)}$ km/s. Mapping such velocities around the Galaxy gave its rotation curve — flat out to large radii, an early sign of dark matter. The transition is so slow (lifetime about 11 million years) that only the vast amounts of hydrogen in space make it bright.`,
        };
      },
    }),
    num({
      id: 'cp-maser', difficulty: 3, transfer: true,
      gen(r) {
        const BnT = r.pick([20, 50, 100, 200]);
        const ans = clockShift(BnT * 1e-9) * 1e3;      // mHz
        return {
          prompt: t`Active hydrogen masers — the frequency standards at the stations of NASA’s Deep Space Network and at radio telescopes for very-long-baseline interferometry — oscillate on the transition from $F = 1, m = 0$ to $F = 0$. From the Breit–Rabi formula its frequency is $\sqrt{\nu_0^2 + \big((g_e\mu_B + g_p\mu_N)B/h\big)^2}$ with $(g_e\mu_B + g_p\mu_N)/h = ${fmt(GEH + GPH, 7)}$ MHz/T. Inside its magnetic shields the maser sits in a field of $${BnT}$ nT. How far, in mHz, is its frequency shifted from $\nu_0$?`,
          visual: { type: 'graph', params: { x: [0, 300], y: [0, 26], aspect: 'wide', xlabel: 'B (nT)', ylabel: 'shift (mHz)', xticks: 6, yticks: 4, axesAt: 'edge', curves: [{ fn: `${r6((((GEH + GPH) * 1e6 * 1e-9) ** 2) / (2 * HFS) * 1e3)}*x^2`, color: 'gold', width: 2.4 }] }, caption: 'The clock transition’s shift against field: quadratic, so first-order field noise does not move it.' },
          answer: ans, units: 'mHz', tol: { rel: 0.01 },
          errors: [{ value: (GEH + GPH) * 1e6 * BnT * 1e-9 * 1e3, feedback: t`That is the linear Zeeman shift of an $m = \pm1$ level; the $m = 0$ clock transition shifts only quadratically, by about $b^2/2\nu_0$.` }],
          hints: [t`With $b = ${fmt(GEH + GPH, 7)}\ \text{MHz/T}\times B$, the shift is $\sqrt{\nu_0^2 + b^2} - \nu_0 \approx b^2/2\nu_0$.`, t`$B = ${BnT}\times10^{-9}$ T, so $b = ${fmt((GEH + GPH) * 1e6 * BnT * 1e-9, 4)}$ Hz.`],
          teach: 'Choosing m = 0 states makes a clock transition insensitive to the field at first order; the residual shift is quadratic.',
          explain: t`$b = ${fmt((GEH + GPH) * 1e6 * BnT * 1e-9, 4)}$ Hz, so the shift is $b^2/2\nu_0 = ${fmt(ans, 3)}$ mHz — a fractional $${tex((ans / 1e3) / HFS, 2)}$. Masers measure and hold their internal field (by driving the field-sensitive $\Delta m = \pm1$ Zeeman transitions) so that this shift is known; their day-to-day stability, a part in $10^{15}$, is what lets the Deep Space Network track spacecraft by Doppler and VLBI arrays synthesize Earth-sized telescopes.`,
        };
      },
    }),
    mcq({
      id: 'cp-lower', difficulty: 2,
      prompt: t`In hydrogen’s ground state the hyperfine Hamiltonian is $A\,\hat{\vec S}\cdot\hat{\vec I}/\hbar^2$ with $A > 0$. Which level is lower, and by how much?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [-1.2, 0.6], aspect: 'wide', xlabel: '', ylabel: 'energy (units of A)', xticks: 0, yticks: 0, axesAt: 'edge', curves: [seg(0.4, 0.25, 2.6, 0.25, 'accent', 2.6), seg(0.4, -0.75, 2.6, -0.75, 'violet', 2.6)], points: [label(2.65, 0.25, 'three states', 'accent', 4, 0), label(2.65, -0.75, 'one state', 'violet', 4, 0)] }, caption: 'The two hyperfine levels at zero field, to scale in units of A, unlabelled.' },
      choices: [
        t`The singlet ($F = 0$), at $-\tfrac34A$, lies $A$ below the triplet ($F = 1$) at $+\tfrac14A$`,
        t`The triplet, because parallel spins attract`,
        t`The singlet, $\tfrac34A$ below the triplet`,
        t`They are degenerate until a magnetic field is applied`,
      ],
      answer: 0,
      why: {
        1: t`With $A > 0$, the state with the larger $\hat{\vec S}\cdot\hat{\vec I}$ — the triplet, $+\tfrac14\hbar^2$ — has the higher energy.`,
        2: t`The singlet sits at $-\tfrac34A$ and the triplet at $+\tfrac14A$: the gap is the whole of $A$, not $\tfrac34A$.`,
        3: t`The contact interaction splits them with no external field at all; that splitting is the 21-cm line.`,
      },
      hints: [t`$\hat{\vec S}\cdot\hat{\vec I} = +\tfrac14\hbar^2$ (triplet) or $-\tfrac34\hbar^2$ (singlet).`],
      teach: 'For a positive coupling A, the singlet is the ground state, A below the triplet.',
      explain: t`$E = +\tfrac14A$ for $F = 1$ and $-\tfrac34A$ for $F = 0$: the gap is $A = h\times1420.4$ MHz $= ${fmt((H * HFS) / 1.602176634e-19 * 1e6, 4)}\ \mu$eV. In the ground state the electron’s and proton’s spins are anti-aligned, but their magnetic moments — the electron’s points against its spin — are aligned.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §4.4.3 and §7.5', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'CODATA 2022 recommended values (α, μₚ, aₑ, R∞)', url: 'https://physics.nist.gov/cuu/Constants/' },
    { label: 'Ewen & Purcell, “Observation of a line in the galactic radio spectrum”, Nature 168, 356 (1951)', url: 'https://doi.org/10.1038/168356a0' },
  ],
});
