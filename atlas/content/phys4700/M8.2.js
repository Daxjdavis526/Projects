// Degenerate perturbation theory (Griffiths & Schroeter §7.2). Within a
// g-fold degenerate level, the first-order energies are the eigenvalues of
// W_ij = ⟨ψᵢ⁰|Ĥ′|ψⱼ⁰⟩ and the "good" states its eigenvectors; a Hermitian Â
// that commutes with Ĥ⁰ and Ĥ′ and has distinct eigenvalues in the level picks
// them out. The linear Stark effect of hydrogen's n = 2: parity and m kill all
// of W but ⟨200|Ĥ′|210⟩ = −3eaℰ, so the level splits into ±3eaℰ and a
// doubly degenerate 0; the good states (ψ₂₀₀ ± ψ₂₁₀)/√2 carry permanent dipole
// moments ∓3ea. Explore: ⟨Ĥ′⟩ in cos α ψ₂₀₀ + sin α ψ₂₁₀ — the good states
// are its extremes. Honest limit: 2s and 2p are split by the Lamb shift
// (4.4 μeV) and 2p by fine structure (45 μeV), so the effect is linear only
// above a few hundred V/cm. 2D box examples with a quadrant step and with
// xy. Transfer: the motional Stark effect that measures field pitch in
// tokamaks. Constants CODATA 2022 (a₀, e); deuterium AME2020.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H, QE, U, seg, label, r6 } from './_qm.js';
import { A0, M_H2 } from '../phys2710/_constants.js';

const t = String.raw;
const EA = A0;                                   // e·a₀/e: the Stark energy per (V/m), in eV per (V/m) = a₀ in metres
const STARK_UEV_PER_KVCM = 3 * A0 * 1e5 * 1e6;   // μeV per kV/cm for 3eaℰ
const D = Math.PI / 180;

/** The n = 2 Stark fan: ±3eaℰ and a doubly degenerate zero, against ℰ in kV/cm. */
function fanPic({ Emax = 100, mark = null, numbers = true, caption }) {
  const k = r6(STARK_UEV_PER_KVCM), ytop = r6(STARK_UEV_PER_KVCM * Emax * 1.25);
  return {
    type: 'graph',
    params: {
      x: [0, Emax], y: [-ytop, ytop], aspect: 'wide', xlabel: 'electric field ℰ (kV/cm)', ylabel: 'shift (μeV)', axesAt: 'edge', xticks: 5, yticks: numbers ? 4 : 0,
      curves: [
        { fn: `${k}*x`, color: 'warn', width: 2.4, label: '(ψ₂₀₀ − ψ₂₁₀)/√2', labelAt: Emax * 0.3, labelDx: -20, labelDy: -20 },
        { fn: '0', color: 'accent', width: 3, label: 'ψ₂₁₁, ψ₂₁₋₁ (unshifted)', labelAt: Emax * 0.62, labelDx: 0, labelDy: -12 },
        { fn: `-${k}*x`, color: 'good', width: 2.4, label: '(ψ₂₀₀ + ψ₂₁₀)/√2', labelAt: Emax * 0.3, labelDx: -20, labelDy: 22 },
      ],
      ...(mark !== null ? { vlines: [{ x: mark, color: 'ink3' }] } : {}),
    },
    caption,
  };
}

/** A square well seen from above with a shaded region where the perturbation acts. */
function squarePic({ region = [0, 0.5, 0, 0.5], fn = null, caption }) {
  const [x1, x2, y1, y2] = region;
  return {
    type: 'graph',
    params: {
      x: [-0.1, 1.1], y: [-0.08, 1.08], aspect: 'wide', equal: true, xlabel: 'x / a', ylabel: 'y / a', axesAt: 'edge', xticks: 2, yticks: 2,
      shade: fn ? [{ fn: '1', from: 0, to: 1, color: 'teal', alpha: 0.12 }] : [{ fn: `${y2}`, lower: `${y1}`, from: x1, to: x2, color: 'teal', alpha: 0.4 }],
      curves: [seg(0, 0, 1, 0, 'ink2', 3), seg(1, 0, 1, 1, 'ink2', 3), seg(1, 1, 0, 1, 'ink2', 3), seg(0, 1, 0, 0, 'ink2', 3),
        seg(0, 0.5, 1, 0.5, 'violet', 1.4, [5, 4]), seg(0.5, 0, 0.5, 1, 'gold', 1.4, [5, 4])],
      points: fn ? [label(0.75, 0.25, 'H′ = V₀xy/a²', 'teal', 0, 0, 'center')] : [label((x1 + x2) / 2, (y1 + y2) / 2, 'V₀', 'teal', 0, 0, 'center')],
      legend: [{ label: 'node of ψ₁₂', color: 'violet', dash: [5, 4] }, { label: 'node of ψ₂₁', color: 'gold', dash: [5, 4] }], legendAt: 'tr',
    },
    caption,
  };
}

/** A 4×4 matrix W for the n = 2 states, drawn as a grid of cells, with given cells highlighted. */
function gridPic(caption) {
  const names = ['200', '211', '210', '21−1'], pts = [];
  names.forEach((n, i) => { pts.push(label(i + 0.5, 4.35, n, 'ink2', 0, 0, 'center')); pts.push(label(-0.15, 3.5 - i, n, 'ink2', 0, 0, 'right')); });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) pts.push(label(j + 0.5, 3.5 - i, '?', 'ink3', 0, 0, 'center'));
  const curves = [];
  for (let k = 0; k <= 4; k++) { curves.push(seg(0, k, 4, k, 'ink4', 1)); curves.push(seg(k, 0, k, 4, 'ink4', 1)); }
  return { type: 'graph', params: { x: [-1.4, 5.4], y: [-0.3, 4.7], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, points: pts }, caption };
}

// the worked example's numbers
const EX_F = 100;                                       // kV/cm
const EX_SHIFT = STARK_UEV_PER_KVCM * EX_F;             // μeV
const LAMB_UEV = (H * 1057.8e6) / QE * 1e6;             // μeV, the 2s–2p Lamb shift (≈ 1057.8 MHz)

export default lesson({
  id: 'phys4700.M8.2',
  title: 'Degenerate perturbation theory',
  minutes: 18, difficulty: 3,
  intro: t`When several states share an energy, any combination of them is an equally good unperturbed state — but a perturbation usually picks out particular combinations, the **good states**, and shifts them by different amounts. Find them by writing $\hat H'$ as a matrix $W$ within the degenerate level and diagonalizing it:

$$\begin{gathered} W_{ij} = \langle\psi_i^0|\hat H'|\psi_j^0\rangle \\ \det\big(W - E^1\,\mathbb 1\big) = 0 \end{gathered}$$

The eigenvalues are the first-order shifts; the eigenvectors are the good states, and in that basis the non-degenerate formulas work again. A shortcut: if some Hermitian operator $\hat A$ commutes with both $\hat H^0$ and $\hat H'$ and has different eigenvalues for the degenerate states, its eigenstates are good. Hydrogen’s $n = 2$ level in an electric field — the linear Stark effect — is the classic case.`,
  symbols: [
    { tex: '\\psi_i^0', text: t`the $g$ unperturbed states that share the energy $E^0$ (any orthonormal choice)` },
    { tex: 'W_{ij}', text: t`the matrix of $\hat H'$ within the degenerate level: a $g\times g$ Hermitian matrix, in energy units` },
    { tex: 'E^1', text: 'a first-order energy shift: one of the eigenvalues of W' },
    { tex: '\\mathbb 1', text: t`the $g\times g$ identity matrix` },
    { tex: '\\hat A', text: t`a Hermitian operator with $[\hat A, \hat H^0] = [\hat A, \hat H'] = 0$; its eigenstates with distinct eigenvalues are good states` },
  ],
  why: 'Most of the spectrum of real atoms, molecules and solids is degenerate perturbation theory: Stark and Zeeman splittings, fine structure, crystal-field splitting, and the band gaps that open where free-electron states cross.',
  visual: {
    type: 'graph',
    title: 'The good states are where the shift is extreme',
    lead: t`Hydrogen’s $n = 2$ level in a field $\mathcal E$ along $z$, with $\hat H' = e\mathcal E z$. Mix the 2s and 2p₀ states, $\psi = \cos\alpha\,\psi_{200} + \sin\alpha\,\psi_{210}$, and watch the electron’s probability density along the $z$-axis and the expectation value $\langle\hat H'\rangle$ — which, for a good state, is its first-order shift. Positive $z$ is up the field.`,
    tasks: [
      'At α = 0 (pure 2s) the density is symmetric and ⟨z⟩ = 0: no first-order shift, though the state is not good.',
      'At α = 45° the electron sits on the −z side: ⟨z⟩ = −3a and the shift is −3eaℰ, the lowest possible. That mixture is a good state.',
      'Step through α: the shift is −3eaℰ sin 2α, extreme exactly at ±45°. Diagonalizing W finds those extremes.',
    ],
    params: {
      x: [-16, 16], y: [0, 6], aspect: 'wide', xlabel: 'z / a (along the field)', ylabel: 'z²|ψ|² on the z-axis', axesAt: 'edge', xticks: 8, yticks: 0,
      sliders: [{ key: 'al', label: t`Mixing angle $\alpha$`, min: -90, max: 90, step: 5, value: 20, unit: '^\\circ', explain: t`How much $\psi_{210}$ (the $2p$ state with $m = 0$) is mixed into $\psi_{200}$ (the 2s state).` }],
      curves: [{ fn: 'x^2*(cos(al*pi/180)*(2 - abs(x)) + sin(al*pi/180)*x)^2*exp(-abs(x))', color: 'gold', width: 2.6, samples: 1200 }],
      shade: [{ fn: 'x^2*(cos(al*pi/180)*(2 - abs(x)) + sin(al*pi/180)*x)^2*exp(-abs(x))', from: -16, to: 16, color: 'gold', alpha: 0.15 }],
      vlines: [{ x: '-3*sin(2*al*pi/180)', color: 'accent', label: '⟨z⟩' }],
      readouts: [
        { label: '⟨z⟩ / a', expr: '-3*sin(2*al*pi/180)', digits: 3 },
        { label: '⟨H′⟩ / eaℰ', expr: '-3*sin(2*al*pi/180)', digits: 3 },
      ],
    },
    caption: t`Exact non-relativistic hydrogen functions, $\psi_{200} \propto (2 - r/a)e^{-r/2a}$ and $\psi_{210} \propto (r/a)e^{-r/2a}\cos\theta$, drawn along the $z$-axis only (elsewhere not shown), weighted by $z^2$ as a radial probability is weighted by $r^2$, so the outer lobes that dominate $\langle z\rangle$ show up; arbitrary units. $a$ is the Bohr radius. The 2s–2p splittings of fine structure and the Lamb shift are ignored.`,
  },
  example: {
    prompt: t`Find the first-order Stark shifts of hydrogen’s four $n = 2$ states in a field $\mathcal E\hat z$ ($\hat H' = e\mathcal Ez$), and the good states. How big are the shifts at $\mathcal E = ${EX_F}$ kV/cm?`,
    visual: fanPic({ Emax: 100, caption: t`The $n = 2$ level against field: two good states shift linearly, two are untouched. First order only; the tiny fine-structure and Lamb splittings at zero field are left out.` }),
    steps: [
      { label: 'The matrix', text: t`$W$ is $4\times4$ in the basis $\psi_{200}, \psi_{211}, \psi_{210}, \psi_{21-1}$. Two symmetries empty most of it.` },
      { label: 'Parity', text: t`$z$ is odd under $\vec r \to -\vec r$, and every state of given $l$ has parity $(-1)^l$. So $\langle\psi|z|\psi'\rangle = 0$ unless the two have opposite parity: every diagonal element vanishes, and so does any element between two $l = 1$ states.` },
      { label: 'Angular momentum', text: t`$[\hat L_z, z] = 0$, so $z$ cannot change $m$: $\langle 200|z|21{\pm1}\rangle = 0$. Only $\langle 200|z|210\rangle$ survives.` },
      { label: 'The integral', text: t`With $\psi_{200} = R_{20}Y_0^0$ and $\psi_{210} = R_{21}Y_1^0$: the angular part $\int Y_0^0\cos\theta\,Y_1^0\,d\Omega = 1/\sqrt3$, and the radial part $\int_0^\infty R_{20}R_{21}\,r^3\,dr = \dfrac{a}{\sqrt{48}}\displaystyle\int_0^\infty\big(1 - \tfrac u2\big)u^4e^{-u}du = \dfrac{a}{\sqrt{48}}(24 - 60) = -\dfrac{9a}{\sqrt3}$. So $W_{200,210} = -3ea\mathcal E$.` },
      { label: 'Diagonalize', text: t`In the $\{\psi_{200}, \psi_{210}\}$ block $W = -3ea\mathcal E\begin{pmatrix}0 & 1\\ 1 & 0\end{pmatrix}$, with eigenvalues $\mp3ea\mathcal E$ for $(\psi_{200} \pm \psi_{210})/\sqrt2$. $\psi_{211}$ and $\psi_{21-1}$ stay at zero. $\hat L_z$ commutes with $\hat H^0$ and $z$, which is why $m$ stays a good label.` },
      { label: 'Numbers', text: t`$ea\mathcal E$ is $a = ${fmt(A0 * 1e9, 6)}$ nm times $\mathcal E$: at $${EX_F}$ kV/cm, $3ea\mathcal E = ${fmt(EX_SHIFT, 4)}\ \mu$eV, or $${fmt((EX_SHIFT * 1e-6 * QE) / H / 1e9, 4)}$ GHz. That swamps the Lamb shift between 2s and 2p ($${fmt(LAMB_UEV, 2)}\ \mu$eV), which the “degenerate” model ignores — so the linear Stark effect holds above a few hundred V/cm, and below that the shift is quadratic.` },
    ],
    answer: t`Shifts $-3ea\mathcal E$, $0$, $0$, $+3ea\mathcal E$ for $(\psi_{200} + \psi_{210})/\sqrt2$, $\psi_{211}$, $\psi_{21-1}$, $(\psi_{200} - \psi_{210})/\sqrt2$: $\pm${fmt(EX_SHIFT, 3)}\ \mu$eV at $${EX_F}$ kV/cm.`,
  },
  practice: [
    mcq({
      id: 'which-nonzero', difficulty: 2,
      prompt: t`For hydrogen’s $n = 2$ level and $\hat H' = e\mathcal Ez$, which elements of the $4\times4$ matrix $W$ are nonzero?`,
      visual: gridPic(t`The matrix $W_{ij} = \langle 2lm|\hat H'|2l'm'\rangle$, rows and columns labelled $nlm$. Which cells survive?`),
      choices: [
        t`Only $\langle200|\hat H'|210\rangle$ and $\langle210|\hat H'|200\rangle$`,
        t`The four diagonal elements`,
        t`Every element between $l = 0$ and $l = 1$: $\langle200|\hat H'|21m\rangle$ for $m = 1, 0, -1$, and their transposes`,
        t`$\langle211|\hat H'|21{-1}\rangle$ and its transpose`,
      ],
      answer: 0,
      why: {
        1: t`Each state has definite parity and $z$ is odd, so $\langle\psi|z|\psi\rangle = 0$: a state alone has no permanent dipole moment.`,
        2: t`Parity allows them, but $z$ commutes with $\hat L_z$, so it cannot connect $m = 0$ to $m = \pm1$.`,
        3: t`Two $l = 1$ states have the same parity, so $z$ between them vanishes; and $m$ differs by 2.`,
      },
      hints: [t`$z$ is odd under parity, and states with orbital quantum number $l$ have parity $(-1)^l$.`, t`$[\hat L_z, z] = 0$: what does that say about $\langle m|z|m'\rangle$ when $m \ne m'$?`],
      teach: 'Symmetries — parity and conserved Lz — empty most of a perturbation matrix before any integral is done.',
      explain: t`Parity kills the diagonal and the $l = 1$ to $l = 1$ elements; $m$-conservation kills $\langle200|z|21{\pm1}\rangle$. Only $\langle200|z|210\rangle = -3a$ is left, with its transpose.`,
    }),
    num({
      id: 'stark-ghz', difficulty: 2,
      gen(r) {
        const F = r.pick([5, 10, 20, 40, 60]);          // kV/cm
        const dE = 6 * A0 * F * 1e5, ans = (dE * QE) / H / 1e9;
        return {
          prompt: t`In a field of $${F}$ kV/cm, how far apart, in GHz, are the highest and lowest Stark components of hydrogen’s $n = 2$ level? ($a = ${fmt(A0 * 1e9, 6)}$ nm.)`,
          visual: fanPic({ Emax: 70, mark: F, numbers: false, caption: t`The $n = 2$ Stark fan; the grey line marks ${F} kV/cm. Shifts not labelled.` }),
          answer: ans, units: 'GHz', tol: { rel: 0.005 },
          errors: [{ value: ans / 2, feedback: t`That is one component’s shift, $3ea\mathcal E$. The outer components are $+3ea\mathcal E$ and $-3ea\mathcal E$: $6ea\mathcal E$ apart.` }, { value: ans / 3, feedback: t`The matrix element is $3ea\mathcal E$, not $ea\mathcal E$.` }],
          hints: [t`The outer pair are $\pm3ea\mathcal E$, so they are $6ea\mathcal E$ apart.`, t`$ea\mathcal E$ in eV is $a$ in metres times $\mathcal E$ in V/m: $${tex(A0, 6)}\times${F}\times10^{5}$. Then multiply by $e/h$ for hertz.`],
          teach: 'The linear Stark effect of n = 2 hydrogen spreads the level over ±3eaℰ.',
          explain: t`$6ea\mathcal E = 6(${tex(A0, 6)})(${F}\times10^{5})\ \text{eV} = ${tex(dE, 4)}$ eV, so $\Delta E/h = ${fmt(ans, 4)}$ GHz. Linear in the field: a hallmark of degeneracy, since a non-degenerate level can only shift quadratically.`,
        };
      },
    }),
    num({
      id: 'two-by-two', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 4, 6]), b = r.pick([-2, 0, 1, 3]), c = r.pick([2, 3, 4, 5]);
        const m = (a + b) / 2, d = Math.sqrt(((a - b) / 2) ** 2 + c * c), ans = m + d;
        return {
          prompt: t`A doubly degenerate level at $E^0$ feels a perturbation whose matrix in the level is $W = \begin{pmatrix} ${a} & ${c}\\ ${c} & ${b}\end{pmatrix}$ meV. What is the larger first-order energy shift, in meV?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [r6(-(Math.abs(m) + d) * 1.3), r6((Math.abs(m) + d) * 1.3)], aspect: 'wide', xlabel: 'strength λ of the perturbation (λ = 1 is the W given)', ylabel: 'shift (meV)', axesAt: 'edge', xticks: 4, yticks: 0, curves: [{ fn: `${r6(m + d)}*x`, color: 'gold', width: 2.6 }, { fn: `${r6(m - d)}*x`, color: 'gold', width: 2.6 }, { fn: `${r6(a)}*x`, color: 'ink3', width: 1.4, dash: [5, 4] }, { fn: `${r6(b)}*x`, color: 'ink3', width: 1.4, dash: [5, 4] }], legend: [{ label: 'eigenvalues of λW', color: 'gold' }, { label: 'diagonal elements of λW', color: 'ink3', dash: [5, 4] }], legendAt: 'tl' }, caption: 'The two first-order shifts as the perturbation is turned up (gold), against the diagonal elements alone (dashed). Shift values not labelled.' },
          answer: ans, units: 'meV', tol: { rel: 0.005, abs: 0.005 },
          errors: [{ value: Math.max(a, b), feedback: t`The diagonal elements are the shifts only if the off-diagonal ones vanish. Here $W_{12} = ${c}$ meV mixes the states: diagonalize.` }, { value: m + Math.sqrt(((a - b) / 2) ** 2 + c), feedback: t`Square the off-diagonal element: the eigenvalues are $\tfrac{W_{11} + W_{22}}{2} \pm \sqrt{\big(\tfrac{W_{11} - W_{22}}{2}\big)^2 + |W_{12}|^2}$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * Math.abs(ans) + 0.01),
          hints: [t`The shifts are the eigenvalues of $W$: solve $\det(W - E^1\mathbb 1) = 0$.`, t`For a $2\times2$ Hermitian matrix: $E^1_\pm = \tfrac{W_{11} + W_{22}}{2} \pm \sqrt{\big(\tfrac{W_{11} - W_{22}}{2}\big)^2 + |W_{12}|^2}$.`],
          teach: 'In a degenerate level, the first-order shifts are the eigenvalues of the perturbation matrix W, not its diagonal elements.',
          explain: t`$E^1_+ = ${fmt(m, 3)} + \sqrt{${fmt(((a - b) / 2) ** 2, 4)} + ${c * c}} = ${fmt(ans, 4)}$ meV. The two shifts straddle the diagonal values: the off-diagonal coupling pushes them apart, as in every avoided crossing.`,
        };
      },
    }),
    num({
      id: 'quadrant', difficulty: 3,
      gen(r) {
        const V = r.pick([10, 20, 30, 50, 80]);          // meV
        const ans = (32 * V) / (9 * Math.PI ** 2);
        return {
          prompt: t`A particle in a two-dimensional square box ($0 < x, y < a$) has a doubly degenerate first excited level: $\psi_{12} = \tfrac2a\sin\tfrac{\pi x}{a}\sin\tfrac{2\pi y}{a}$ and $\psi_{21}$ (the same with $x$ and $y$ swapped). A perturbation $V_0 = ${V}$ meV acts only in the quadrant $0 < x, y < a/2$. Using $\int_0^{a/2}\tfrac2a\sin^2\tfrac{n\pi x}{a}dx = \tfrac12$ and $\int_0^{a/2}\tfrac2a\sin\tfrac{\pi x}{a}\sin\tfrac{2\pi x}{a}dx = \tfrac{4}{3\pi}$, by how much does the perturbation split the level?`,
          visual: squarePic({ caption: t`The box from above with the perturbed quadrant (teal) and the nodal lines of the two degenerate states. Each state puts a quarter of its probability in the quadrant, but they overlap there unequally.` }),
          answer: ans, units: 'meV', tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`The diagonal elements are equal ($V_0/4$ each), but the off-diagonal one is not zero: diagonalize.` }, { value: (16 * V) / (9 * Math.PI ** 2), feedback: t`That is $W_{12}$; the two shifts are $\tfrac14V_0 \pm W_{12}$, so the splitting is $2W_{12}$.` }],
          hints: [t`$W_{11} = W_{22} = V_0\cdot\tfrac12\cdot\tfrac12 = \tfrac14V_0$.`, t`$W_{12} = V_0\big(\tfrac{4}{3\pi}\big)^2$, because the $x$ and $y$ integrals factor.`, t`The shifts are $\tfrac14V_0 \pm W_{12}$; the splitting is $2W_{12}$.`],
          teach: 'With equal diagonal elements, a degenerate pair splits by twice the off-diagonal element, and the good states are the symmetric and antisymmetric combinations.',
          explain: t`$W = V_0\begin{pmatrix}\frac14 & \frac{16}{9\pi^2}\\ \frac{16}{9\pi^2} & \frac14\end{pmatrix}$, eigenvalues $V_0\big(\tfrac14 \pm \tfrac{16}{9\pi^2}\big)$: the splitting is $\tfrac{32}{9\pi^2}V_0 = ${fmt(ans, 4)}$ meV. The good states are $(\psi_{12} \pm \psi_{21})/\sqrt2$, symmetric or antisymmetric about the diagonal $x = y$ — the perturbation’s own symmetry.`,
        };
      },
    }),
    mcq({
      id: 'commuting', difficulty: 2,
      prompt: t`In the Stark problem, which operator commutes with both $\hat H^0$ (hydrogen) and $\hat H' = e\mathcal Ez$, and so tells you that the good states have definite $m$?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.6, yaw: 0.6, pitch: 0.3, vectors: [{ to: [0, 0, 1.3], color: 'warn', label: '\\vec{\\mathcal E}' }], curves: [{ param: ['0.9*cos(t)', '0.9*sin(t)', '0'], t: [0, 6.2832], color: 'accent' }], points: [{ at: [0, 0, 0], label: 'proton', color: 'gold' }] }, caption: 'The field along z (orange) and a rotation about it (blue circle): turning the atom about the field axis changes nothing. Drag to rotate.' },
      choices: [t`$\hat L_z$`, t`$\hat L_x$`, t`$\hat L^2$`, t`the parity operator`],
      answer: 0,
      why: {
        1: t`A rotation about $x$ tips the field: $[\hat L_x, z] = -i\hbar y \ne 0$.`,
        2: t`$\hat L^2$ commutes with $\hat H^0$ but not with $z$: the field mixes $l = 0$ with $l = 1$, which is exactly how the good states arise.`,
        3: t`The field breaks parity: $z$ is odd, so parity anticommutes with $\hat H'$. That is why the good states, mixtures of $l = 0$ and $1$, have no definite parity.`,
      },
      hints: ['Which rotations leave a field along z unchanged?', t`Check $[\hat L_z, z]$: $\hat L_z = -i\hbar\,\partial/\partial\phi$ and $z = r\cos\theta$ has no $\phi$ in it.`],
      teach: 'An operator that commutes with H⁰ and H′ labels the good states: here Lz, because the field is symmetric about its own axis.',
      explain: t`$z$ does not depend on $\phi$, so $[\hat L_z, z] = 0$, and $\hat L_z$ commutes with hydrogen’s $\hat H^0$ too. Within $n = 2$ its eigenvalues $m = 1, -1$ are distinct from $m = 0$, so $\psi_{211}$ and $\psi_{21-1}$ are good on their own; only the two $m = 0$ states need the $2\times2$ diagonalization.`,
    }),
    num({
      id: 'dipole', difficulty: 2,
      prompt: t`The good state $(\psi_{200} + \psi_{210})/\sqrt2$ has $\langle z\rangle = -3a$: the electron sits off-centre, so the atom carries a permanent electric dipole moment $p = 3ea$ (pointing along $+z$). What is $p$ in units of $10^{-30}$ C m? ($a = ${tex(A0, 9)}$ m, $e = ${tex(QE, 10)}$ C.)`,
      visual: { type: 'graph', params: { x: [-16, 16], y: [0, 6], aspect: 'wide', xlabel: 'z / a', ylabel: 'z²|ψ|² on the z-axis', axesAt: 'edge', xticks: 8, yticks: 0, curves: [{ fn: '0.5*x^2*((2 - abs(x)) + x)^2*exp(-abs(x))', color: 'gold', width: 2.6, samples: 1200 }], vlines: [{ x: 0, color: 'ink3', label: 'proton' }] }, caption: t`The density of $(\psi_{200} + \psi_{210})/\sqrt2$ along the $z$-axis, weighted by $z^2$ (arbitrary units): lopsided toward $-z$, so the electron’s average position is below the proton.` },
      answer: (3 * QE * A0) / 1e-30, tol: { rel: 0.005 },
      errors: [{ value: (QE * A0) / 1e-30, feedback: t`The displacement is $3a$, not $a$.` }],
      hints: [t`$p = e\times|\langle z\rangle| = 3ea$.`],
      teach: 'Degenerate mixing gives n = 2 hydrogen a permanent dipole moment, which is why its Stark shift is linear.',
      explain: t`$p = 3(${tex(QE, 4)})(${tex(A0, 4)}) = ${tex(3 * QE * A0, 4)}$ C m — about 7.6 debye, larger than the dipole moment of a water molecule (1.85 debye). The energy $-\vec p\cdot\vec{\mathcal E} = \mp3ea\mathcal E$ is the linear Stark shift.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mse', difficulty: 3, transfer: true,
      gen(r) {
        const keV = r.pick([40, 60, 80, 100]), B = r.pick([1.5, 2, 2.5, 3]);
        const v = Math.sqrt((2 * keV * 1e3 * QE) / (M_H2 * U)), F = v * B, ans = 6 * A0 * F * 1e3;      // meV
        return {
          prompt: t`Tokamaks measure the direction of their internal magnetic field with the **motional Stark effect**. A beam of fast deuterium atoms ($m = ${fmt(M_H2, 7)}$ u) at $${keV}$ keV crosses a field $B = ${B}$ T at right angles. In the atoms’ own frame there is an electric field $\mathcal E = vB$ (the speed is small enough to drop the factor $\gamma$). How far apart, in meV, are the outermost Stark components of the atoms’ $n = 2$ level? (Deuterium’s Bohr radius is within 0.03% of hydrogen’s; use $a = ${fmt(A0 * 1e9, 6)}$ nm.)`,
          visual: { type: 'graph', params: { x: [-2, 2], y: [-1.1, 1.1], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', arrows: [{ from: [-1.8, 0], to: [-0.2, 0], color: 'gold', width: 3, label: 'v (beam)', labelDx: -30, labelDy: -12 }, { from: [0.6, -0.9], to: [0.6, 0.9], color: 'teal', width: 2.4, label: 'B', labelDx: 8, labelDy: 6 }, { from: [1.2, 0], to: [1.2, -0.8], color: 'warn', width: 2.4, label: 'ℰ = v × B (atom’s frame)', labelDx: 8, labelDy: 14 }], points: [{ x: 0, y: 0, r: 6, color: 'gold', label: 'D atom', labelDx: -10, labelDy: 18 }] }, caption: 'A beam atom crossing the field (schematic, directions only): in its own frame it feels an electric field perpendicular to both v and B.' },
          answer: ans, units: 'meV', tol: { rel: 0.01 },
          errors: [{ value: ans / 2, feedback: t`One component shifts by $3ea\mathcal E$; the outermost pair are $6ea\mathcal E$ apart.` }, { value: 6 * A0 * Math.sqrt((2 * keV * 1e3 * QE) / (M_H2 * U / 2)) * B * 1e3, feedback: 'The beam is deuterium, about twice the mass of hydrogen.' }],
          hints: [t`$v = \sqrt{2K/m}$ with $K = ${keV}$ keV.`, t`Then $\mathcal E = vB$, and the outer splitting is $6ea\mathcal E$, which in eV is $6a\mathcal E$ with $a$ in metres.`],
          teach: 'A fast atom crossing a magnetic field feels an electric field v × B, and its degenerate levels split linearly in it.',
          explain: t`$v = ${tex(v, 4)}$ m/s, so $\mathcal E = vB = ${tex(F, 3)}$ V/m — far above any field you could apply with electrodes in a plasma — and $6ea\mathcal E = ${fmt(ans, 3)}$ meV. Real systems watch the Balmer-α line ($n = 3 \to 2$), whose Stark pattern is richer; the polarization of its components gives the direction of $\vec v\times\vec B$, and so the pitch of the field lines, which is how tokamak current profiles are measured (Levinton et al. 1989).`,
        };
      },
    }),
    mcq({
      id: 'cp-ground', difficulty: 2,
      prompt: t`Why does hydrogen’s **ground state** show no linear Stark effect, while $n = 2$ does?`,
      visual: { type: 'graph', params: { x: [0, 100], y: [-1600, 1600], aspect: 'wide', xlabel: 'electric field ℰ (kV/cm)', ylabel: 'shift (μeV)', axesAt: 'edge', xticks: 5, yticks: 0, curves: [{ fn: `${r6(STARK_UEV_PER_KVCM)}*x`, color: 'warn', width: 2 }, { fn: '0', color: 'accent', width: 2 }, { fn: `-${r6(STARK_UEV_PER_KVCM)}*x`, color: 'good', width: 2 }, { fn: `-${r6(0.5 * 4.5 * 4 * Math.PI * 8.8541878188e-12 * A0 ** 3 * 1e10 / QE * 1e6)}*x^2`, color: 'gold', width: 2.6, dash: [6, 4] }], legend: [{ label: 'n = 2 components', color: 'accent' }, { label: 'n = 1 (dashed)', color: 'gold', dash: [6, 4] }], legendAt: 'tl' }, caption: 'Stark shifts against field: the n = 2 components (solid) and the ground state (dashed: quadratic, and about 0.02 μeV at 100 kV/cm — invisible on this scale). Shifts not labelled.' },
      choices: [
        t`It is non-degenerate and has definite parity, so $\langle100|z|100\rangle = 0$; its shift starts at second order, $\propto\mathcal E^2$`,
        t`The ground state is too tightly bound for an electric field to affect it at all`,
        t`Its first-order shift is $-3ea\mathcal E$, like $n = 2$, but smaller`,
        t`An electric field cannot act on a state with $l = 0$`,
      ],
      answer: 0,
      why: {
        1: t`It is affected — at second order it is polarized, with a shift $-\tfrac12\alpha_p\mathcal E^2$ ($\alpha_p$ is the polarizability). Only the linear term is missing.`,
        2: t`The $-3ea\mathcal E$ comes from mixing the degenerate 2s and 2p; $n = 1$ has no partner to mix with at the same energy.`,
        3: t`2s also has $l = 0$, and it takes part in the linear effect by mixing with 2p.`,
      },
      hints: [t`A linear shift needs a nonzero first-order term. What is $\langle\psi|z|\psi\rangle$ for a state of definite parity?`],
      teach: 'A non-degenerate state of definite parity has no permanent dipole moment, so its Stark shift is quadratic.',
      explain: t`For a non-degenerate state the first-order shift is $e\mathcal E\langle100|z|100\rangle = 0$ by parity. The second-order shift $-\tfrac12\alpha_p\mathcal E^2$, with $\alpha_p = 4.5(4\pi\epsilon_0)a^3$, is a polarization: the field induces a dipole. $n = 2$ is different because its degeneracy lets states of opposite parity mix freely, giving a permanent dipole.`,
    }),
    num({
      id: 'cp-xy', difficulty: 3,
      gen(r) {
        const V = r.pick([20, 40, 60, 100]);              // meV
        const w12 = V * (16 / (9 * Math.PI ** 2)) ** 2, ans = 2 * w12;
        return {
          prompt: t`The square box of the practice problem now feels $\hat H' = V_0\,xy/a^2$ with $V_0 = ${V}$ meV. For the degenerate pair $\psi_{12}, \psi_{21}$ you need $\langle1|x|1\rangle = \langle2|x|2\rangle = a/2$ and $\langle1|x|2\rangle = -\dfrac{16a}{9\pi^2}$ (one-dimensional well states). How far apart, in meV, are the two first-order energies?`,
          visual: squarePic({ fn: true, caption: t`The box with the perturbation $V_0xy/a^2$ spread over it, strongest in the corner $x = y = a$, and the nodal lines of the two degenerate states.` }),
          answer: ans, units: 'meV', tol: { rel: 0.005 },
          errors: [{ value: w12, feedback: t`The shifts are $W_{11} \pm W_{12}$: they are $2W_{12}$ apart.` }, { value: 2 * V * (16 / (9 * Math.PI ** 2)), feedback: t`$W_{12} = V_0\langle1|x|2\rangle\langle2|y|1\rangle/a^2$: both factors carry $16/9\pi^2$, so it is squared.` }],
          hints: [t`$W_{11} = \langle12|xy|12\rangle V_0/a^2 = V_0\langle1|x|1\rangle\langle2|y|2\rangle/a^2 = V_0/4$, and $W_{22}$ is the same.`, t`$W_{12} = \langle12|\hat H'|21\rangle = V_0\langle1|x|2\rangle\langle2|y|1\rangle/a^2 = V_0\big(\tfrac{16}{9\pi^2}\big)^2$.`],
          teach: 'For a separable perturbation the matrix elements factor into one-dimensional integrals.',
          explain: t`$W_{12} = V_0\big(\tfrac{16}{9\pi^2}\big)^2 = ${fmt(w12, 4)}$ meV, so the energies $\tfrac14V_0 \pm W_{12}$ are $${fmt(ans, 4)}$ meV apart, with good states $(\psi_{12} \pm \psi_{21})/\sqrt2$. The perturbation is symmetric under $x \leftrightarrow y$, and so are the good states (or antisymmetric).`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §7.2', url: 'https://www.cambridge.org/9781316995433' },
        { label: 'Levinton et al., “Magnetic field pitch-angle measurements in the PBX-M tokamak using the motional Stark effect”, Phys. Rev. Lett. 63, 2060 (1989)', url: 'https://doi.org/10.1103/PhysRevLett.63.2060' },
  ],
});
