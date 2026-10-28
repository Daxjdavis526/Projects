// Angular momentum operators (Griffiths & Schroeter §4.3). L = r × p; the
// commutators [L_x, L_y] = iħL_z (cyclic) and [L², L_i] = 0; the ladders
// L± = L_x ± iL_y with [L_z, L±] = ±ħL±; eigenvalues found from the algebra
// alone — ħ²l(l + 1) and ħm, m = −l…l, 2l an integer — with
// L±|l m⟩ = ħ√(l(l + 1) − m(m ± 1)) |l m±1⟩; L_z = −iħ∂/∂φ. The vector-model
// cone, labelled as a cartoon. Code: angular momentum matrices for any l.
// Transfer: a CubeSat reaction wheel, where the cone has closed to 10⁻¹⁶ rad.
// phys2710.MP8.3 met |L| = √(l(l + 1))ħ and the cone at the introductory
// level; this lesson derives them. Every number is computed here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, seg, label, r6 } from './_qm.js';

const t = String.raw;
const ladderC = (l, m, s = 1) => Math.sqrt(l * (l + 1) - m * (m + s));     // ⟨l, m±1|L±|l, m⟩/ħ

/** The rungs m = −l … l of one l, with an arrow from m to m + s. */
function ladderPic(l, m, s, caption) {
  const curves = [], points = [];
  for (let k = -l; k <= l; k++) {
    curves.push(seg(0.3, k, 1.7, k, k === m ? 'gold' : 'accent', k === m ? 3 : 2));
    points.push(label(1.78, k, `m = ${k}`.replace('-', '−'), 'ink2', 2, 0));
  }
  return {
    type: 'graph',
    params: {
      x: [0, 2.6], y: [r6(-l - 0.7), r6(l + 0.7)], aspect: 'wide', xlabel: '', ylabel: 'Lz / ħ', xticks: 0, yticks: 0, axes: false, grid: false, curves, points,
      arrows: [{ from: [1, m + 0.08 * s], to: [1, m + s - 0.08 * s], color: 'violet', width: 2.6, label: s > 0 ? 'L₊' : 'L₋', labelDx: 8, labelDy: 0 }],
    },
    caption,
  };
}

/** The vector-model cone for l, m at a fixed azimuth, on calc-vectors3d. */
function conePic(l, m, caption) {
  const L = Math.sqrt(l * (l + 1)), rho = Math.sqrt(l * (l + 1) - m * m);
  return {
    type: 'calc-vectors3d',
    params: {
      range: r6(L * 1.15), yaw: 0.6, pitch: 0.45,
      vectors: [{ to: [r6(-rho * 0.643), r6(rho * 0.766), m], color: 'gold', label: '\\vec L' }],
      curves: [{ param: [`${r6(rho)}*cos(t)`, `${r6(rho)}*sin(t)`, String(m)], t: [0, 6.2832], color: 'accent' }],
      segments: [{ from: [r6(-rho * 0.643), r6(rho * 0.766), m], to: [0, 0, m], color: 'ink3', dash: true }],
    },
    caption,
  };
}

export default lesson({
  id: 'phys4700.M5.3',
  title: 'Angular momentum operators',
  minutes: 17, difficulty: 3,
  intro: t`The orbital angular momentum $\hat{\vec L} = \hat{\vec r}\times\hat{\vec p}$ has components that do not commute with each other — but each commutes with $\hat L^2$. So you can know the length of $\vec L$ and **one** component, conventionally $L_z$, never two. The commutators alone, through the **ladder operators** $\hat L_\pm = \hat L_x \pm i\hat L_y$, fix every possible result:

$$\begin{gathered} [\hat L_x, \hat L_y] = i\hbar\hat L_z \\ \hat L^2f_l^m = \hbar^2l(l+1)\,f_l^m \\ \hat L_zf_l^m = \hbar m\,f_l^m \end{gathered}$$

with $m = -l, -l + 1, \dots, l$ and $l$ a whole or half-whole number. $\hat L_+$ climbs from $m$ to $m + 1$, $\hat L_-$ descends, and the ladder stops at $\pm l$.`,
  symbols: [
    { tex: '\\hat L_x,\\ \\hat L_y,\\ \\hat L_z', text: t`the components of angular momentum, e.g. $\hat L_z = \hat x\hat p_y - \hat y\hat p_x = -i\hbar\,\partial/\partial\phi$, in J s` },
    { tex: '\\hat L^2', text: t`$\hat L_x^2 + \hat L_y^2 + \hat L_z^2$, the squared length, in $(\text{J s})^2$` },
    { tex: '\\hat L_\\pm', text: t`the raising and lowering operators $\hat L_x \pm i\hat L_y$; not Hermitian, $\hat L_\pm^\dagger = \hat L_\mp$` },
    { tex: 'f_l^m', text: t`a simultaneous eigenfunction of $\hat L^2$ and $\hat L_z$ (for orbital motion, a spherical harmonic $Y_l^m$)` },
    { tex: 'l,\\ m', text: t`the quantum numbers: $|\vec L| = \sqrt{l(l+1)}\,\hbar$ and $L_z = m\hbar$ with $|m| \le l$` },
    { tex: '\\hbar', text: t`the reduced Planck constant, $${tex(HBAR, 5)}$ J s` },
  ],
  why: 'The same algebra governs orbital motion, spin, nuclear and molecular rotation and every addition of angular momenta — it is where spin ½ first appears as a possibility.',
  visual: {
    type: 'calc-vectors3d',
    title: 'The vector model — a cartoon of what the algebra allows',
    lead: t`An arrow of length $\sqrt{l(l+1)}$ (in units of $\hbar$) whose $z$-component is $m$. Because $L_x$ and $L_y$ cannot also be sharp, the picture smears the arrow round the cone. Choose $l$ and $m$, and slide the azimuth.`,
    tasks: [
      'With m = l the arrow is as close to the z-axis as it can get — but never on it: √(l(l+1)) > l.',
      'Raise l at m = l: the minimum tilt shrinks roughly as 1/√l. Classical angular momentum is the large-l limit.',
      'Slide the azimuth: every point on the circle is equally (un)likely. The arrow’s azimuth is not a physical quantity at all.',
    ],
    params: {
      range: 3.2, yaw: 0.6, pitch: 0.45,
      sliders: [
        { key: 'l', label: t`$l$`, min: 1, max: 3, step: 1, value: 2, explain: t`Sets the length $\sqrt{l(l+1)}\,\hbar$.` },
        { key: 'm', label: t`$m$ (held within $\pm l$)`, min: -3, max: 3, step: 1, value: 1, explain: t`Sets $L_z = m\hbar$; values beyond $\pm l$ are clamped.` },
        { key: 'ph', label: t`Azimuth $\phi$ (not observable)`, min: 0, max: 360, step: 5, value: 130, unit: '^\\circ', explain: t`Where on the cone the cartoon arrow is drawn — nothing in the state picks a value.` },
      ],
      vectors: [{ to: ['sqrt(l*(l + 1) - max(-l, min(l, m))^2)*cos(ph*pi/180)', 'sqrt(l*(l + 1) - max(-l, min(l, m))^2)*sin(ph*pi/180)', 'max(-l, min(l, m))'], color: 'gold', label: '\\vec L' }],
      curves: [{ param: ['sqrt(l*(l + 1) - max(-l, min(l, m))^2)*cos(t)', 'sqrt(l*(l + 1) - max(-l, min(l, m))^2)*sin(t)', 'max(-l, min(l, m))'], t: [0, 6.2832], color: 'accent' }],
      segments: [{ from: ['sqrt(l*(l + 1) - max(-l, min(l, m))^2)*cos(ph*pi/180)', 'sqrt(l*(l + 1) - max(-l, min(l, m))^2)*sin(ph*pi/180)', 'max(-l, min(l, m))'], to: [0, 0, 'max(-l, min(l, m))'], color: 'ink3', dash: true }],
      readouts: [
        { label: t`$|\vec L|/\hbar = \sqrt{l(l+1)}$`, expr: 'sqrt(l*(l + 1))', digits: 4 },
        { label: t`$L_z/\hbar$`, expr: 'max(-l, min(l, m))', digits: 2 },
        { label: t`angle from $z$ (degrees)`, expr: 'acos(max(-l, min(l, m))/sqrt(l*(l + 1)))*180/pi', digits: 3 },
      ],
    },
    caption: t`A teaching cartoon, not a picture of the state: no arrow with definite $L_x$ and $L_y$ exists, and the cone only shows which lengths and $z$-components are allowed. Lengths in units of $\hbar$. Drag to rotate.`,
  },
  example: {
    prompt: t`Using only $[\hat L_i, \hat L_j] = i\hbar\epsilon_{ijk}\hat L_k$, find the possible eigenvalues of $\hat L^2$ and $\hat L_z$.`,
    visual: ladderPic(2, 0, 1, t`The ladder for $l = 2$: five rungs $m = -2 \dots 2$. $\hat L_+$ moves up one rung, and annihilates the top one.`),
    steps: [
      { label: 'Ladder commutators', text: t`$[\hat L_z, \hat L_\pm] = [\hat L_z, \hat L_x] \pm i[\hat L_z, \hat L_y] = i\hbar\hat L_y \pm \hbar\hat L_x = \pm\hbar\hat L_\pm$, and $[\hat L^2, \hat L_\pm] = 0$.` },
      { label: 'Climbing', text: t`If $\hat L_zf = \mu f$, then $\hat L_z(\hat L_\pm f) = \hat L_\pm\hat L_zf \pm \hbar\hat L_\pm f = (\mu \pm \hbar)(\hat L_\pm f)$. $\hat L_\pm f$ is another eigenfunction, $\hbar$ higher or lower, with the same $\hat L^2$ eigenvalue $\lambda$.` },
      { label: 'A top rung', text: t`$L_z^2 \le L^2$ in any eigenstate, so the climb must stop at a top function with $\hat L_+f_t = 0$. Use $\hat L^2 = \hat L_-\hat L_+ + \hat L_z^2 + \hbar\hat L_z$: with $\hat L_zf_t = \hbar lf_t$, $\lambda = \hbar^2l^2 + \hbar^2l = \hbar^2l(l+1)$.` },
      { label: 'A bottom rung', text: t`Likewise $\hat L_-f_b = 0$ with $\hat L^2 = \hat L_+\hat L_- + \hat L_z^2 - \hbar\hat L_z$ gives $\lambda = \hbar^2\bar l(\bar l - 1)$, so $\bar l = -l$.` },
      { label: 'Whole steps', text: t`From $-l$ to $+l$ in whole steps: $2l$ is a non-negative integer. So $l = 0, \tfrac12, 1, \tfrac32, \dots$ and $m = -l, \dots, l$, $2l + 1$ values.` },
      { label: 'Normalization', text: t`$\|\hat L_+f_l^m\|^2 = \langle f|\hat L_-\hat L_+f\rangle = \hbar^2\big[l(l+1) - m(m+1)\big]$, so $\hat L_\pm f_l^m = \hbar\sqrt{l(l+1) - m(m\pm1)}\,f_l^{m\pm1}$. For orbital motion, $\hat L_z = -i\hbar\,\partial_\phi$ forces $e^{im\phi}$ to be single-valued: $m$, and so $l$, must be integers. Half-integers are left for spin.` },
    ],
    answer: t`$L^2 = \hbar^2l(l+1)$ and $L_z = \hbar m$, with $l = 0, \tfrac12, 1, \dots$ and $m = -l, \dots, l$; orbital angular momentum allows only integer $l$.`,
  },
  practice: [
    num({
      id: 'ladder-coef', difficulty: 2,
      gen(r) {
        const l = r.pick([1, 2, 3, 4]), m = r.int(-l, l - 1);
        const ans = ladderC(l, m, 1);
        return {
          prompt: t`$\hat L_+|l, m\rangle = c\,\hbar\,|l, m + 1\rangle$. Find $c$ for $l = ${l}$, $m = ${m}$.`,
          visual: ladderPic(l, m, 1, t`The rungs of $l = ${l}$; $\hat L_+$ takes $m = ${m}$ (gold) one rung up.`),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: Math.sqrt(l * (l + 1) - m * (m - 1)), feedback: t`That is the lowering coefficient, $\sqrt{l(l+1) - m(m - 1)}$. Raising uses $m(m + 1)$.` }, { value: Math.sqrt(l * l - m * m), feedback: t`$\hat L^2$’s eigenvalue is $l(l+1)$, not $l^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$c = \sqrt{l(l+1) - m(m+1)}$.`],
          teach: 'L± change m by one and multiply by ħ√(l(l + 1) − m(m ± 1)), which vanishes at the ends of the ladder.',
          explain: t`$c = \sqrt{${l * (l + 1)} - (${m})(${m + 1})} = \sqrt{${l * (l + 1) - m * (m + 1)}} = ${fmt(ans, 4)}$. It is largest in the middle of the ladder and zero for $m = l$, where $\hat L_+$ has nowhere to go.`,
        };
      },
    }),
    num({
      id: 'lx2', difficulty: 2,
      gen(r) {
        const l = r.pick([1, 2, 3]), m = r.int(-l, l);
        const ans = (l * (l + 1) - m * m) / 2;
        return {
          prompt: t`In the state $|l, m\rangle = |${l}, ${m}\rangle$, what is $\langle L_x^2\rangle$ in units of $\hbar^2$? (Use $\hat L^2 = \hat L_x^2 + \hat L_y^2 + \hat L_z^2$ and the symmetry between $x$ and $y$.)`,
          visual: conePic(l, m, t`The cartoon cone for $l = ${l}$, $m = ${m}$: the arrow’s projection on the $xy$-plane has fixed length, but no fixed direction. Drag to rotate.`),
          answer: ans, tol: { rel: 0.002, abs: 1e-9 },
          errors: [{ value: l * (l + 1) - m * m, feedback: t`That is $\langle L_x^2 + L_y^2\rangle$; by symmetry $L_x^2$ gets half.` }, { value: (l * l - m * m) / 2, feedback: t`$\langle L^2\rangle = l(l+1)\hbar^2$, not $l^2\hbar^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\langle L_x^2\rangle + \langle L_y^2\rangle = \hbar^2[l(l+1) - m^2]$.`, t`$\langle L_x^2\rangle = \langle L_y^2\rangle$ by rotational symmetry about $z$.`],
          teach: 'In |l, m⟩ the transverse components average to zero but their squares do not: ⟨Lₓ²⟩ = ħ²[l(l + 1) − m²]/2.',
          explain: t`$\langle L_x^2\rangle = \tfrac{\hbar^2}{2}\big[${l * (l + 1)} - ${m * m}\big] = ${fmt(ans, 3)}\,\hbar^2$, while $\langle L_x\rangle = 0$. Even at $m = l$ it is $l\hbar^2/2 > 0$: the transverse components can never vanish together.`,
        };
      },
    }),
    mcq({
      id: 'lz-x', difficulty: 2,
      prompt: t`With $\hat L_z = \hat x\hat p_y - \hat y\hat p_x$ and $[\hat x, \hat p_x] = i\hbar$, what is $[\hat L_z, \hat x]$?`,
      visual: { type: 'graph', params: { x: [-1.3, 1.3], y: [-1.1, 1.1], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: [2, 4] }], arrows: [{ from: [0, 0], to: [1, 0], color: 'accent', width: 2.4, label: 'x̂ direction' }, { from: [1, 0], to: [1, 0.45], color: 'gold', width: 2.4, label: 'small turn about z: δx ∝ −y, δy ∝ +x', labelDx: 8, labelDy: -4 }] }, caption: t`$\hat L_z$ generates rotations about $z$: a small turn moves a point on the $+x$ axis toward $+y$. Schematic.` },
      choices: [t`$i\hbar\,\hat y$`, t`$-i\hbar\,\hat y$`, t`$i\hbar\,\hat x$`, t`$0$, since $\hat L_z$ involves only $\hat p_x$ and $\hat p_y$`],
      answer: 0,
      why: {
        1: t`$[\hat x\hat p_y - \hat y\hat p_x, \hat x] = -\hat y[\hat p_x, \hat x] = -\hat y(-i\hbar) = +i\hbar\hat y$: watch the order in $[\hat p_x, \hat x] = -i\hbar$.`,
        2: t`Only $\hat p_x$ fails to commute with $\hat x$, and it comes multiplied by $\hat y$.`,
        3: t`$\hat L_z$ contains $\hat p_x$, which does not commute with $\hat x$.`,
      },
      hints: [t`$\hat x$ commutes with $\hat x$, $\hat y$ and $\hat p_y$; only $[\hat p_x, \hat x] = -i\hbar$ survives.`],
      teach: t`$\hat L_z$ rotates position vectors about $z$: $[\hat L_z, \hat x] = i\hbar\hat y$ and $[\hat L_z, \hat y] = -i\hbar\hat x$.`,
      explain: t`$[\hat L_z, \hat x] = -\hat y[\hat p_x, \hat x] = i\hbar\hat y$, and similarly $[\hat L_z, \hat y] = -i\hbar\hat x$. Together they say $\hat L_z/\hbar$ generates rotations about $z$ — the deep reason $\hat L$ is conserved whenever $V$ is rotationally symmetric.`,
    }),
    code({
      id: 'l-matrices', difficulty: 3,
      prompt: t`Build the angular momentum matrices for any $l$ (whole or half-whole), in units of $\hbar$, in the basis $m = l, l - 1, \dots, -l$. $\mathsf L_z$ is diagonal with entries $m$; $\mathsf L_+$ has $\sqrt{l(l+1) - m(m+1)}$ just **above** the diagonal (it moves $m$ up, toward the first row); $\mathsf L_- = \mathsf L_+^\dagger$; $\mathsf L_x = (\mathsf L_+ + \mathsf L_-)/2$ and $\mathsf L_y = (\mathsf L_+ - \mathsf L_-)/2i$. Write \`ang_mom(l)\` returning \`Lx, Ly, Lz\`.`,
      starter: t`import numpy as np

def ang_mom(l):
    m = np.arange(l, -l - 1, -1)          # l, l-1, ..., -l
    pass

Lx, Ly, Lz = ang_mom(1)
print(np.round(Lx, 4))
`,
      answer: t`import numpy as np

def ang_mom(l):
    m = np.arange(l, -l - 1, -1)          # l, l-1, ..., -l
    Lz = np.diag(m).astype(complex)
    Lp = np.diag(np.sqrt(l * (l + 1) - m[1:] * (m[1:] + 1)), 1).astype(complex)
    Lm = Lp.conj().T
    Lx = (Lp + Lm) / 2
    Ly = (Lp - Lm) / 2j
    return Lx, Ly, Lz

Lx, Ly, Lz = ang_mom(1)
print(np.round(Lx, 4))`,
      tests: [
        { name: t`$[L_x, L_y] = iL_z$ for $l = 1$, $\tfrac32$, 2 and 3`, code: 'all(np.allclose(A[0] @ A[1] - A[1] @ A[0], 1j * A[2]) for A in [ang_mom(l) for l in (1, 1.5, 2, 3)])' },
        { name: t`$L^2 = l(l+1)\,\mathbb 1$`, code: 'all(np.allclose(sum(M @ M for M in ang_mom(l)), l * (l + 1) * np.eye(int(2 * l + 1))) for l in (0.5, 1, 2.5, 4))' },
        { name: t`$l = \tfrac12$ gives the spin matrices $\tfrac12\sigma_x$, $\tfrac12\sigma_y$`, code: 'np.allclose(ang_mom(0.5)[0], [[0, 0.5], [0.5, 0]]) and np.allclose(ang_mom(0.5)[1], [[0, -0.5j], [0.5j, 0]])' },
        { name: t`$L_x$ has eigenvalues $-l, \dots, l$ like $L_z$`, code: 'np.allclose(np.sort(np.linalg.eigvalsh(ang_mom(2)[0])), [-2, -1, 0, 1, 2])' },
      ],
      hints: ['`np.diag(v, 1)` places v just above the diagonal; the entry in row k, column k+1 takes m[k+1] up to m[k], so use m[1:].', '`Lp.conj().T` is L₋.'],
      teach: 'The commutation relations fix the angular momentum matrices completely for every l, half-integers included.',
      explain: t`The same few lines give the spin-½ matrices at $l = \tfrac12$, the spin-1 matrices of the earlier lessons at $l = 1$, and every orbital case. $\mathsf L_x$ has exactly the same eigenvalues as $\mathsf L_z$ — the $z$-axis was never special.`,
    }),
    mcq({
      id: 'half-integer', difficulty: 2,
      prompt: t`The ladder argument allows $l = \tfrac12, \tfrac32, \dots$ Why can orbital angular momentum not take those values?`,
      visual: { type: 'graph', params: { x: [0, 12.57], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'φ (rad)', ylabel: 'cos(mφ)', xticks: 4, yticks: 2, axesAt: 'edge', curves: [{ fn: 'cos(0.5*x)', color: 'bad', width: 2.4 }, { fn: 'cos(x)', color: 'accent', width: 2, dash: [6, 4] }], vlines: [{ x: 6.2832, color: 'gold', label: 'φ = 2π' }], legend: [{ label: 'm = ½', color: 'bad' }, { label: 'm = 1', color: 'accent', dash: [6, 4] }], legendAt: 'bl' }, caption: t`The real part of $e^{im\phi}$: for $m = \tfrac12$ it changes sign after one full turn.` },
      choices: [
        t`$L_z = -i\hbar\,\partial_\phi$ has eigenfunctions $e^{im\phi}$, which must be single-valued: $e^{im2\pi} = 1$ needs integer $m$`,
        t`The commutation relations forbid half-integers`,
        t`Half-integer $l$ would give a negative $L^2$`,
        t`Half-integers are allowed for orbital motion but only in heavy atoms`,
      ],
      answer: 0,
      why: {
        1: t`The algebra allows them — that is exactly how spin ½ fits.`,
        2: t`$l(l+1) > 0$ for every $l > 0$, half-integers included.`,
        3: t`No orbital state anywhere has half-integer $l$; heavy atoms change energies, not this.`,
      },
      hints: [t`What is the $\phi$-dependence of an $L_z$ eigenfunction, and what happens at $\phi = 2\pi$?`],
      teach: 'Orbital angular momentum is integer because wave functions are single-valued in φ; half-integer values belong to spin, which is not a function of angles.',
      explain: t`$e^{i\phi/2}$ returns to $-1$ after one turn, so it is not a function on the sphere. Spin ½ escapes the argument because its states are not functions of $\theta$ and $\phi$ at all — and indeed a spinor does change sign under a $2\pi$ rotation (lesson M6.1).`,
    }),
    num({
      id: 'robertson-l', difficulty: 3,
      gen(r) {
        const l = r.pick([1, 2, 3]), m = r.int(-l, l);
        const prod = (l * (l + 1) - m * m) / 2, bound = Math.abs(m) / 2;
        return {
          prompt: t`In $|l, m\rangle = |${l}, ${m}\rangle$, $\langle L_x\rangle = \langle L_y\rangle = 0$. What is $\sigma_{L_x}\sigma_{L_y}$ in units of $\hbar^2$? Compare it with Robertson’s bound $\tfrac{\hbar}{2}|\langle L_z\rangle|$.`,
          visual: conePic(l, m, t`The cone for $l = ${l}$, $m = ${m}$. Drag to rotate.`),
          answer: prod, tol: { rel: 0.002, abs: 1e-9 },
          errors: [{ value: bound, feedback: t`That is Robertson’s bound, $|m|/2$; the product itself is $[l(l+1) - m^2]/2$, which meets the bound only when $|m| = l$.` }, { value: prod * prod, feedback: t`$\sigma_{L_x} = \sigma_{L_y} = \hbar\sqrt{[l(l+1) - m^2]/2}$: their product is that radicand, not its square.` }].filter((e) => Math.abs(e.value - prod) > 0.01),
          hints: [t`$\sigma_{L_x}^2 = \langle L_x^2\rangle = \tfrac{\hbar^2}{2}[l(l+1) - m^2]$, and the same for $L_y$.`, t`The product is $\tfrac{\hbar^2}{2}[l(l+1) - m^2]$.`],
          teach: 'States |l, ±l⟩ are the minimum-uncertainty states of the transverse angular momentum components.',
          explain: t`$\sigma_{L_x}\sigma_{L_y} = ${fmt(prod, 3)}\,\hbar^2$ against the bound $${fmt(bound, 3)}\,\hbar^2$. ${Math.abs(m) === l ? t`With $|m| = l$ the bound is met exactly: $l(l+1) - l^2 = l$.` : t`It is met only when $|m| = l$; here the state wastes some of its angular momentum in the transverse spread.`}`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-wheel', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([0.005, 0.01, 0.03, 0.1]);       // N m s
        const l = L / HBAR, ans = 1 / Math.sqrt(l);
        return {
          prompt: t`A CubeSat reaction wheel stores $L = ${L}$ N m s of angular momentum along its axis. Treat it as a quantum state $|l, l\rangle$ with the largest possible $L_z$. In the vector model, the angle between $\vec L$ and the axis satisfies $\cos\theta = l/\sqrt{l(l+1)}$, so $\theta \approx 1/\sqrt l$ for large $l$. Estimate $\theta$, in radians.`,
          visual: conePic(3, 3, 'The cone for l = 3, m = 3: the arrow leans from the axis by acos(3/√12) = 30°. For a wheel, l is about 10³¹. Drag to rotate.'),
          answer: ans, units: 'rad', tol: { rel: 0.02 },
          errors: [{ value: 1 / l, feedback: t`For large $l$, $\cos\theta \approx 1 - \tfrac{1}{2l}$, so $\theta^2/2 \approx 1/2l$: $\theta \approx 1/\sqrt l$, not $1/l$.` }],
          hints: [t`$l \approx L/\hbar$, with $\hbar = ${tex(HBAR, 4)}$ J s.`, t`$\theta \approx 1/\sqrt l$.`],
          teach: 'The quantum “cone” closes as 1/√l: for any macroscopic rotor, angular momentum behaves as a classical vector.',
          explain: t`$l \approx ${tex(l, 3)}$, so $\theta \approx ${tex(ans, 2)}$ rad — far below any star tracker’s resolution (about $10^{-5}$ rad). Quantum angular momentum becomes classical not because the rules change but because the cone narrows to nothing.`,
        };
      },
    }),
    mcq({
      id: 'cp-both', difficulty: 2,
      prompt: t`Is there any state with definite values of both $L_x$ and $L_z$?`,
      visual: conePic(1, 1, t`$l = 1$, $m = 1$: $L_z$ is sharp, but the transverse components are not. Drag to rotate.`),
      choices: [
        t`Only states with $l = 0$, where every component is zero`,
        t`None at all, since $[\hat L_x, \hat L_z] \ne 0$`,
        t`Yes: $|l, \pm l\rangle$, where $\vec L$ points along $z$`,
        t`Yes, any state with $m = 0$`,
      ],
      answer: 0,
      why: {
        1: t`A nonzero commutator forbids sharp values only where its average is nonzero; for $l = 0$, $\hat L_x f = \hat L_z f = 0$ trivially.`,
        2: t`$\langle L_x^2\rangle = l\hbar^2/2 > 0$ even for $m = l$: the transverse components are never sharp.`,
        3: t`With $m = 0$, $\langle L_x^2\rangle = l(l+1)\hbar^2/2$: $L_x$ is spread out, not zero.`,
      },
      hints: [t`$\langle L_x^2\rangle = \tfrac{\hbar^2}{2}[l(l+1) - m^2]$. When is it zero?`],
      teach: 'Incompatible observables can share an eigenstate only where the commutator annihilates it — here, only for l = 0.',
      explain: t`$\langle L_x^2\rangle = \tfrac{\hbar^2}{2}[l(l+1) - m^2]$ vanishes only if $l(l+1) = m^2$, which needs $l = m = 0$. The s states are spherically symmetric and have no angular momentum along any axis.`,
    }),
    num({
      id: 'cp-lplm', difficulty: 2,
      gen(r) {
        const l = r.pick([1, 2, 3, 4]), m = r.int(-l + 1, l);
        const ans = l * (l + 1) - m * (m - 1);
        return {
          prompt: t`Compute $\langle l, m|\hat L_+\hat L_-|l, m\rangle$ in units of $\hbar^2$ for $l = ${l}$, $m = ${m}$, using $\hat L_+\hat L_- = \hat L^2 - \hat L_z^2 + \hbar\hat L_z$.`,
          visual: ladderPic(l, m, -1, t`$\hat L_-$ takes the gold rung one step down; $\hat L_+$ then brings it back.`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: l * (l + 1) - m * (m + 1), feedback: t`$\hat L_+\hat L_- = \hat L^2 - \hat L_z^2 + \hbar\hat L_z$: the sign of the last term is $+$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Each term acts on $|l, m\rangle$ by a number: $l(l+1)$, $m^2$ and $m$.`],
          teach: t`$\hat L_+\hat L_- = \hat L^2 - \hat L_z^2 + \hbar\hat L_z$ gives the squared norm of $\hat L_-|l, m\rangle$, $\hbar^2[l(l+1) - m(m-1)]$.`,
          explain: t`$${l * (l + 1)} - ${m * m} + ${m} = ${ans}$, which is $\|\hat L_-|l, m\rangle\|^2/\hbar^2$ — the square of the lowering coefficient. It vanishes only at the bottom rung $m = -l$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §4.3', url: 'https://www.cambridge.org/9781316995433' },
  ],
});
