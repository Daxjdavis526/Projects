// Hermitian operators and eigenvalues — observables. The adjoint defined by
// ⟨φ|Aψ⟩ = ⟨A†φ|ψ⟩, Hermitian operators, the proof that their eigenvalues are
// real and their eigenvectors orthogonal, the spectral decomposition
// A = Σ a|a⟩⟨a|, expectation values from it, and operators on functions
// (x and −i d/dx are Hermitian; d/dx is not). math2270.LA-13.1 did 2×2
// eigenvalue drill and the Pauli matrices; this lesson works in bra-ket form,
// in three dimensions and on functions. Every number is computed here.
import { lesson, mcq, multi, num, order, code } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { GAMMA_E, seg, label, r6, blochPic } from './_qm.js';

const t = String.raw;
const GHZ_T = GAMMA_E / (2 * Math.PI) / 1e9;      // GHz/T: 28.024 95…
const D_NV = 2.870;                                 // GHz, the NV centre's zero-field splitting (room temperature, approximate)

/** p(λ) for the 3×3 block matrix, with the λ-axis numbers hidden. */
function charPic(a, b, m) {
  const roots = [a, b - m, b + m], lo = Math.min(...roots) - 1.6, hi = Math.max(...roots) + 1.6;
  const p = (x) => (a - x) * ((b - x) ** 2 - m * m);
  let M = 0;
  for (let i = 0; i <= 200; i++) M = Math.max(M, Math.abs(p(lo + ((hi - lo) * i) / 200)));
  const Y = r6(0.55 * M);
  return {
    type: 'graph',
    params: {
      x: [r6(lo), r6(hi)], y: [-Y, Y], aspect: 'wide', xlabel: 'λ', ylabel: 'det(A − λI)', xticks: 0, yticks: 0,
      curves: [{ fn: `(${a} - x)*((${b} - x)^2 - ${m * m})`, color: 'accent', width: 2.4 }],
    },
    caption: 'The characteristic polynomial det(A − λI): each crossing of the axis is an eigenvalue. The λ-axis numbers are hidden.',
  };
}

/** Bars of probability |cᵢ|² standing at each eigenvalue. */
function barsPic(vals, probs, unit, caption) {
  const lo = Math.min(...vals) - 1, hi = Math.max(...vals) + 1;
  return {
    type: 'graph',
    params: {
      x: [lo, hi], y: [0, 1.05], aspect: 'wide', xlabel: `eigenvalue (${unit})`, ylabel: 'probability |cᵢ|²', axesAt: 'edge',
      curves: vals.map((v, i) => seg(v, 0, v, probs[i], 'gold', 7)),
      points: vals.map((v, i) => label(v, probs[i], fmt(probs[i], 3), 'gold', 0, -12, 'center')),
    },
    caption,
  };
}

/** A three-level diagram: |±1⟩ at D ± γB and |0⟩ at 0, with the two transitions. */
const nvLevels = {
  type: 'graph',
  params: {
    x: [0, 10], y: [-0.6, 4.4], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [seg(1.5, 0, 4.5, 0, 'accent', 3), seg(5.5, 3.3, 8.5, 3.3, 'accent', 3), seg(5.5, 2.5, 8.5, 2.5, 'accent', 3), seg(5.5, 2.9, 8.5, 2.9, 'ink3', 1.4, [4, 4])],
    arrows: [{ from: [3.0, 0.05], to: [6.2, 3.25], color: 'gold', width: 2.2 }, { from: [4.2, 0.05], to: [6.8, 2.45], color: 'violet', width: 2.2 }],
    points: [label(1.5, 0, 'mₛ = 0', 'ink2', -6, 0, 'right'), label(8.5, 3.3, 'mₛ = +1: D + γB', 'ink2', 8, 0), label(8.5, 2.5, 'mₛ = −1: D − γB', 'ink2', 8, 0), label(8.5, 2.9, 'D (no field)', 'ink3', 8, 0), label(4.45, 1.55, 'f₊', 'gold', -8, 0, 'right'), label(5.6, 1.35, 'f₋', 'violet', 8, 0)],
  },
  caption: 'The NV centre’s spin-1 levels in a field along its axis (frequencies E/h). Not to scale: the splitting 2γB is far smaller than D in a weak field.',
};

export default lesson({
  id: 'phys4700.M0.2',
  title: 'Hermitian operators and eigenvalues',
  minutes: 14, difficulty: 3,
  intro: t`An **operator** $\hat A$ turns kets into kets; in a basis it is a matrix with elements $A_{ij} = \langle e_i|\hat A|e_j\rangle$. Its **adjoint** $\hat A^\dagger$ is the operator that does the same job from the other side of an inner product, $\langle\phi|\hat A\psi\rangle = \langle\hat A^\dagger\phi|\psi\rangle$ for every pair; for a matrix it is the conjugate transpose. An operator equal to its adjoint is **Hermitian**, and Hermitian operators are the **observables** of quantum mechanics because of what their eigenvectors do:

$$\hat A\,|a\rangle = a\,|a\rangle, \qquad \hat A = \hat A^\dagger$$

The eigenvalues $a$ are real — the possible results of a measurement. Eigenvectors of different eigenvalues are orthogonal, and together they form a basis, so $\hat A = \sum_a a\,|a\rangle\langle a|$: the operator is nothing but its results and the states that give them. The same holds for operators on functions: position $x$ and $-i\,d/dx$ are Hermitian; $d/dx$ alone is not.`,
  symbols: [
    { tex: '\\hat A', text: 'an operator: a linear rule that turns a ket into another ket; in a basis, a square matrix' },
    { tex: '|a\\rangle', text: t`an eigenvector (eigenket) of $\hat A$: a state that $\hat A$ only rescales` },
    { tex: 'a', text: t`its eigenvalue, the scale factor; for an observable, a possible measured value, in the observable’s units` },
    { tex: '\\hat A^\\dagger', text: t`the adjoint (“A dagger”): for a matrix, conjugate every entry and transpose, $(A^\dagger)_{ij} = A_{ji}^{*}$` },
    { tex: '|a\\rangle\\langle a|', text: t`an outer product: the operator that projects any ket onto $|a\rangle$ (for a unit $|a\rangle$)` },
  ],
  why: 'Every measurable quantity in quantum mechanics — energy, momentum, spin — is a Hermitian operator, and its eigenvalues are the only results a measurement can give.',
  visual: {
    type: 'calc-vectors3d',
    title: 'Every 2×2 Hermitian matrix is a vector',
    lead: t`Any $2\times2$ Hermitian matrix can be written $H = a_0 I + \vec b\cdot\vec\sigma$ (the Pauli matrices of [LA-13.1](#/lesson/math2270.LA-13.1)). Its eigenvalues are $a_0 \pm |\vec b|$, and its two eigenvectors, drawn as points on the sphere of two-component states, sit at the two ends of the line along $\vec b$ — **opposite ends of a diameter, which is what orthogonal means there**.`,
    tasks: [
      'Tip b̂ from the pole to the equator: H gains complex off-diagonal entries, but its eigenvalues stay a₀ ± |b|.',
      'Shrink |b| to 0: the eigenvalues meet and H = a₀I. Every vector is then an eigenvector.',
      'Turn φ: only the phase of H₁₂ changes, and the eigenvectors swing round the sphere.',
    ],
    params: {
      range: 1.4, yaw: 0.6, pitch: 0.3,
      sliders: [
        { key: 'th', label: 'Polar angle $\\theta$ of $\\hat b$', min: 0, max: 180, step: 5, value: 50, unit: '^\\circ', explain: 'The direction of b from the z-axis; θ = 0 makes H diagonal.' },
        { key: 'ph', label: 'Azimuth $\\phi$ of $\\hat b$', min: 0, max: 355, step: 5, value: 130, unit: '^\\circ', explain: 'Turning b about z changes the phase of the off-diagonal entry.' },
        { key: 'b', label: 'Length $|\\vec b|$', min: 0, max: 2, step: 0.1, value: 1, explain: 'Half the gap between the two eigenvalues.' },
        { key: 'a0', label: 'Offset $a_0$', min: -2, max: 2, step: 0.1, value: 0.5, explain: 'Adds the same amount to both eigenvalues; it moves no eigenvector.' },
      ],
      spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink3' }],
      lines: [{ point: [0, 0, 0], dir: ['sin(th*pi/180)*cos(ph*pi/180)', 'sin(th*pi/180)*sin(ph*pi/180)', 'cos(th*pi/180)'], t: [-1.25, 1.25], color: 'violet' }],
      points: [
        { at: [0, 0, 1], label: '+z', color: 'ink3' }, { at: [1, 0, 0], label: '+x', color: 'ink3' }, { at: [0, 1, 0], label: '+y', color: 'ink3' },
        { at: ['sin(th*pi/180)*cos(ph*pi/180)', 'sin(th*pi/180)*sin(ph*pi/180)', 'cos(th*pi/180)'], label: '|a_+\\rangle', color: 'good' },
        { at: ['-sin(th*pi/180)*cos(ph*pi/180)', '-sin(th*pi/180)*sin(ph*pi/180)', '-cos(th*pi/180)'], label: '|a_-\\rangle', color: 'warn' },
      ],
      readouts: [
        { label: '$H_{11}$', expr: 'a0 + b*cos(th*pi/180)', digits: 3 },
        { label: '$H_{22}$', expr: 'a0 - b*cos(th*pi/180)', digits: 3 },
        { label: '$\\operatorname{Re}H_{12}$', expr: 'b*sin(th*pi/180)*cos(ph*pi/180)', digits: 3 },
        { label: '$\\operatorname{Im}H_{12}$', expr: '-b*sin(th*pi/180)*sin(ph*pi/180)', digits: 3 },
        { label: '$a_+$', expr: 'a0 + b', digits: 3 },
        { label: '$a_-$', expr: 'a0 - b', digits: 3 },
      ],
    },
    caption: t`The sphere holds the two-component unit states, each up to an overall phase (the Bloch sphere of the next module). Drag to rotate. The matrix $H$ itself is not drawn; its entries are read out below.`,
  },
  example: {
    prompt: t`Find the eigenvalues and orthonormal eigenvectors of $A = \begin{pmatrix} 2 & 1 - i \\ 1 + i & 3 \end{pmatrix}$, write $A$ as $\sum a\,|a\rangle\langle a|$, and use that to find $\langle A\rangle$ in the state $|e_1\rangle = (1,\ 0)$.`,
    visual: barsPic([1, 4], [2 / 3, 1 / 3], 'units of A', t`The probabilities $|\langle a|e_1\rangle|^2$ at the two eigenvalues. Their balance point is $\langle A\rangle$.`),
    steps: [
      { label: 'Hermitian?', text: t`Conjugate and transpose: the diagonal 2, 3 is real and $(1 - i)^* = 1 + i$ sits in the mirror position. So $A^\dagger = A$.` },
      { label: 'Eigenvalues', text: t`$\det(A - \lambda I) = (2 - \lambda)(3 - \lambda) - (1 - i)(1 + i) = \lambda^2 - 5\lambda + 4 = 0$, so $\lambda = 1$ or $4$. Real, as promised.` },
      { label: 'Eigenvectors', text: t`For $\lambda = 1$: $(A - I)v = 0$ gives $v_1 + (1 - i)v_2 = 0$, so $|a_1\rangle = \tfrac{1}{\sqrt3}(1 - i,\ -1)$. For $\lambda = 4$: $-2v_1 + (1 - i)v_2 = 0$, so $|a_4\rangle = \tfrac{1}{\sqrt6}(1 - i,\ 2)$.` },
      { label: 'Orthogonal', text: t`$\langle a_1|a_4\rangle = \tfrac{1}{\sqrt{18}}\big[(1 + i)(1 - i) + (-1)(2)\big] = \tfrac{1}{\sqrt{18}}(2 - 2) = 0$.` },
      { label: 'Spectral form', text: t`$A = 1\cdot|a_1\rangle\langle a_1| + 4\cdot|a_4\rangle\langle a_4|$. Check one entry: $A_{12} = 1\cdot\tfrac{(1 - i)(-1)}{3} + 4\cdot\tfrac{(1 - i)(2)}{6} = (1 - i)\left(-\tfrac13 + \tfrac43\right) = 1 - i$. ✓` },
      { label: 'Expectation value', text: t`$|\langle a_1|e_1\rangle|^2 = \tfrac{|1 + i|^2}{3} = \tfrac23$ and $|\langle a_4|e_1\rangle|^2 = \tfrac{|1 + i|^2}{6} = \tfrac13$, so $\langle A\rangle = 1\cdot\tfrac23 + 4\cdot\tfrac13 = 2$ — which is $A_{11}$, as $\langle e_1|A|e_1\rangle$ must be.` },
    ],
    answer: t`Eigenvalues 1 and 4, with $|a_1\rangle = \tfrac{1}{\sqrt3}(1 - i,\ -1)$ and $|a_4\rangle = \tfrac{1}{\sqrt6}(1 - i,\ 2)$; $\langle A\rangle = 2$ in $|e_1\rangle$.`,
  },
  practice: [
    mcq({
      id: 'dagger', difficulty: 1,
      prompt: t`What is the adjoint $A^\dagger$ of $A = \begin{pmatrix} 1 & 2i \\ 3 & 4 - i \end{pmatrix}$?`,
      choices: [t`$\begin{pmatrix} 1 & 3 \\ -2i & 4 + i \end{pmatrix}$`, t`$\begin{pmatrix} 1 & 3 \\ 2i & 4 - i \end{pmatrix}$`, t`$\begin{pmatrix} 1 & -2i \\ 3 & 4 + i \end{pmatrix}$`, t`$\begin{pmatrix} -1 & -3 \\ 2i & -4 + i \end{pmatrix}$`],
      answer: 0,
      why: {
        1: 'That is the transpose. The adjoint also conjugates every entry.',
        2: 'That is the complex conjugate, still untransposed.',
        3: 'Conjugation flips the sign of the imaginary parts only, not of whole entries.',
      },
      hints: ['Two operations: transpose, and conjugate every entry.', t`$(A^\dagger)_{12} = A_{21}^{*} = 3$ and $(A^\dagger)_{21} = A_{12}^{*} = -2i$.`],
      teach: t`The adjoint of a matrix is its conjugate transpose: $(A^\dagger)_{ij} = A_{ji}^{*}$.`,
      explain: t`Transposing swaps $2i$ and $3$; conjugating turns $2i$ into $-2i$ and $4 - i$ into $4 + i$. Since $A^\dagger \ne A$, this $A$ is not Hermitian.`,
    }),
    num({
      id: 'eig3', difficulty: 2,
      gen(r) {
        const [c, d] = r.pick([[3, 4], [4, 3], [4, -3], [-3, 4], [3, -4]]), m = 5;
        const b = r.int(-2, 3), a = r.intExcept(-4, 9, [b + m, b - m, b]);
        const ans = Math.max(a, b + m);
        const cz = `${c} ${d < 0 ? '+' : '-'} ${Math.abs(d)}i`, cc = `${c} ${d < 0 ? '-' : '+'} ${Math.abs(d)}i`;
        return {
          prompt: t`Find the **largest** eigenvalue of the Hermitian matrix $A = \begin{pmatrix} ${a} & 0 & 0 \\ 0 & ${b} & ${cz} \\ 0 & ${cc} & ${b} \end{pmatrix}$.`,
          visual: charPic(a, b, m),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [
            { value: Math.max(a, b + Math.abs(c) + Math.abs(d)), feedback: t`The off-diagonal entry enters through its modulus, $|${cz}| = \sqrt{${c * c} + ${d * d}} = 5$, not through $|${c}| + |${d}|$.` },
            { value: Math.max(a, b + 25), feedback: t`$\det$ gives $(${b} - \lambda)^2 = |${cz}|^2 = 25$, so $\lambda - ${b} = \pm5$, not $\pm25$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.1),
          hints: ['The matrix is block-diagonal: a 1×1 block and a 2×2 block, each with its own eigenvalues.', t`For the $2\times2$ block, $(${b} - \lambda)^2 - |${cz}|^2 = 0$.`],
          teach: 'A block-diagonal matrix’s eigenvalues are those of its blocks; a 2×2 Hermitian block with equal diagonal entries b and off-diagonal z has eigenvalues b ± |z|.',
          explain: t`The first block gives $${a}$. The second gives $${b} \pm |${cz}| = ${b} \pm 5$, that is $${b - m}$ and $${b + m}$. The largest of $${a}$, $${b - m}$, $${b + m}$ is $${ans}$. All three are real, as for every Hermitian matrix.`,
        };
      },
    }),
    num({
      id: 'expect-spectral', difficulty: 2,
      gen(r) {
        const vals = r.pick([[-1, 0, 2], [-2, 1, 3], [0, 1, 4], [-3, 0, 1], [1, 2, 5]]);
        const P = [[0.25, 0.5, 0.25], [0.5, 0.25, 0.25], [0.2, 0.3, 0.5], [0.1, 0.6, 0.3], [0.4, 0.4, 0.2]];
        const avg = (pr) => Math.round(vals.reduce((s, v, i) => s + v * pr[i], 0) * 1e9) / 1e9;
        let k = r.int(0, P.length - 1);
        while (Math.abs(avg(P[k])) < 0.05) k = (k + 1) % P.length;     // never a zero answer
        const probs = P[k], ans = avg(probs);
        const amps = probs.map((p) => Math.sqrt(p));
        const ampTeX = [t`${nice(amps[0], 4)}`, t`${nice(amps[1], 4)}\,i`, t`${nice(amps[2], 4)}\,e^{i\pi/3}`];
        return {
          prompt: t`An observable $\hat A$ (in meV) has eigenvalues $${vals.join(', ')}$ with orthonormal eigenvectors $|a_1\rangle$, $|a_2\rangle$, $|a_3\rangle$. A system is in the state $|\psi\rangle = ${ampTeX[0]}\,|a_1\rangle + ${ampTeX[1]}\,|a_2\rangle + ${ampTeX[2]}\,|a_3\rangle$. Find $\langle\psi|\hat A|\psi\rangle$, in meV.`,
          visual: barsPic(vals, probs, 'meV', t`The weights $|c_i|^2$ standing at each eigenvalue (the bar heights are the answer’s ingredients, not the answer).`),
          answer: ans, tol: { rel: 0.01, abs: 0.005 }, units: 'meV',
          errors: [
            { value: vals.reduce((s, v, i) => s + v * amps[i], 0), feedback: t`You weighted with the amplitudes $|c_i|$. The weights are $|c_i|^2$.` },
            { value: (vals[0] + vals[1] + vals[2]) / 3, feedback: 'That is the plain average of the eigenvalues; each must be weighted by its probability.' },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 + 0.01 * Math.abs(ans)),
          hints: [t`With $\hat A = \sum a\,|a\rangle\langle a|$, $\langle\psi|\hat A|\psi\rangle = \sum_i a_i\,|c_i|^2$.`, t`The phases ($i$, $e^{i\pi/3}$) drop out of $|c_i|^2$.`],
          teach: t`In the eigenbasis, an expectation value is the eigenvalues averaged with weights $|c_i|^2$.`,
          explain: t`$|c_i|^2 = ${probs.join(', ')}$ (they sum to 1), so $\langle\hat A\rangle = ${vals.map((v, i) => `(${v})(${probs[i]})`).join(' + ')} = ${fmt(ans, 3)}$ meV. The phases of the $c_i$ never enter.`,
        };
      },
    }),
    multi({
      id: 'hermitian-ops', difficulty: 3,
      prompt: t`Acting on functions that vanish as $x \to \pm\infty$, with $\langle f|g\rangle = \int f^*g\,dx$, which operators are Hermitian? Select all that apply.`,
      visual: {
        type: 'graph',
        params: {
          x: [-4, 4], y: [-1.15, 1.15], aspect: 'wide', xlabel: 'x', ylabel: '', yticks: 0,
          curves: [{ fn: 'exp(-x^2/2)*cos(2*x)', color: 'accent', width: 2.2, label: 'Re f', labelAt: 0.35, labelDy: -6 }, { fn: 'exp(-(x - 0.5)^2/2)*sin(1.4*x)', color: 'warn', width: 2.2, dash: [6, 4], label: 'Re g', labelAt: 1.8, labelDy: -10 }],
        },
        caption: 'Two functions that die away at both ends, so every boundary term [f* g] from integrating by parts vanishes.',
      },
      choices: [t`$x$ (multiply by $x$)`, t`$\dfrac{d}{dx}$`, t`$i\dfrac{d}{dx}$`, t`$\dfrac{d^2}{dx^2}$`, t`$x\dfrac{d}{dx}$`],
      answer: [0, 2, 3],
      why: {
        1: t`Integrating by parts, $\langle f|g'\rangle = -\langle f'|g\rangle$: the minus sign makes $d/dx$ anti-Hermitian.`,
        4: t`$(x\,d/dx)^\dagger = (d/dx)^\dagger x^\dagger = -\frac{d}{dx}x = -1 - x\frac{d}{dx}$, not $x\,d/dx$. A product of two Hermitian operators is Hermitian only if they commute.`,
      },
      hints: [t`Integrate $\langle f|\hat A g\rangle$ by parts and see whether you get $\langle\hat A f|g\rangle$; the boundary terms vanish.`, t`A factor of $i$ conjugates to $-i$ when it moves into the bra, which can cancel the minus sign from integrating by parts.`],
      teach: t`Integration by parts makes $d/dx$ anti-Hermitian; one factor of $i$ fixes that, two derivatives fix it too.`,
      explain: t`$x$ is real, so it moves freely. $\langle f|g'\rangle = -\langle f'|g\rangle$ makes $d/dx$ anti-Hermitian, and $i\,d/dx$ Hermitian: $\langle f|ig'\rangle = i\langle f|g'\rangle = -i\langle f'|g\rangle = \langle if'|g\rangle$, since a factor $i$ leaves a bra as $-i$. Two integrations by parts make $d^2/dx^2$ Hermitian. So $-i\hbar\,d/dx$, the momentum operator, is Hermitian, and $-\tfrac{\hbar^2}{2m}\tfrac{d^2}{dx^2}$, the kinetic energy, is too.`,
    }),
    order({
      id: 'real-proof', difficulty: 2,
      prompt: t`Put the steps of the proof that a Hermitian operator’s eigenvalues are real in order.`,
      items: [
        t`Start from $\hat A|a\rangle = a|a\rangle$ with $|a\rangle \ne 0$.`,
        t`Take the inner product with $|a\rangle$: $\langle a|\hat A a\rangle = a\langle a|a\rangle$.`,
        t`Move $\hat A$ into the bra, using $\hat A^\dagger = \hat A$: $\langle a|\hat A a\rangle = \langle\hat A a|a\rangle = a^{*}\langle a|a\rangle$.`,
        t`Subtract: $(a - a^{*})\langle a|a\rangle = 0$.`,
        t`Since $\langle a|a\rangle > 0$, $a = a^{*}$: the eigenvalue is real.`,
      ],
      visual: barsPic([-1.5, 0.5, 2], [0.3, 0.5, 0.2], 'any units', 'A Hermitian operator’s spectrum lies on the real line: every eigenvalue is a real number, a possible measured value.'),
      hints: ['The proof compares two ways of evaluating the same inner product.', t`A number pulled out of a bra comes out conjugated: $\langle c\,a| = c^{*}\langle a|$.`],
      teach: 'Hermiticity lets an operator act on either side of an inner product; doing it both ways forces the eigenvalue to equal its own conjugate.',
      explain: t`Evaluate $\langle a|\hat A a\rangle$ with $\hat A$ acting right (giving $a$) and acting left (giving $a^*$); the two must agree, and $\langle a|a\rangle \neq 0$. The same trick with two different eigenvectors gives $(a - b^*)\langle b|a\rangle = 0$, so eigenvectors of different eigenvalues are orthogonal.`,
    }),
    code({
      id: 'spin1-eigh', difficulty: 3,
      prompt: t`The matrix $S_y = \tfrac{1}{\sqrt2}\begin{pmatrix} 0 & -i & 0 \\ i & 0 & -i \\ 0 & i & 0 \end{pmatrix}$ (in units of $\hbar$) will turn out to be a spin-1 particle’s angular momentum along $y$. Write \`spectral(A)\`, returning the eigenvalues (ascending) and a matrix whose **columns** are orthonormal eigenvectors (use \`np.linalg.eigh\`, which is for Hermitian matrices), and \`rebuild(vals, vecs)\`, returning $\sum_k \lambda_k |v_k\rangle\langle v_k|$.`,
      starter: t`import numpy as np

Sy = np.array([[0, -1j, 0], [1j, 0, -1j], [0, 1j, 0]]) / np.sqrt(2)

def spectral(A):
    # eigenvalues (ascending) and eigenvectors as columns
    pass

def rebuild(vals, vecs):
    # sum of lambda_k |v_k><v_k|
    pass

vals, vecs = spectral(Sy)
print(np.round(vals, 6))
`,
      answer: t`import numpy as np

Sy = np.array([[0, -1j, 0], [1j, 0, -1j], [0, 1j, 0]]) / np.sqrt(2)

def spectral(A):
    vals, vecs = np.linalg.eigh(A)
    return vals, vecs

def rebuild(vals, vecs):
    out = np.zeros((len(vals), len(vals)), dtype=complex)
    for k in range(len(vals)):
        v = vecs[:, k]
        out += vals[k] * np.outer(v, v.conj())
    return out

vals, vecs = spectral(Sy)
print(np.round(vals, 6))`,
      tests: [
        { name: 'the eigenvalues of Sy are −1, 0, +1 (in units of ħ)', code: 'np.allclose(spectral(Sy)[0], [-1, 0, 1])' },
        { name: 'the eigenvectors are orthonormal: V†V = I', code: 'np.allclose(spectral(Sy)[1].conj().T @ spectral(Sy)[1], np.eye(3))' },
        { name: 'each column v satisfies Sy v = λ v', code: 'all(np.allclose(Sy @ spectral(Sy)[1][:, k], spectral(Sy)[0][k] * spectral(Sy)[1][:, k]) for k in range(3))' },
        { name: 'rebuild gives Sy back', code: 'np.allclose(rebuild(*spectral(Sy)), Sy)' },
        { name: 'it works for another Hermitian matrix too', code: 'np.allclose(rebuild(*spectral(np.array([[2, 1 - 1j], [1 + 1j, 3]]))), [[2, 1 - 1j], [1 + 1j, 3]])' },
      ],
      hints: ['`np.linalg.eigh(A)` already returns ascending real eigenvalues and orthonormal eigenvector columns.', '`np.outer(v, v.conj())` is the matrix |v⟩⟨v|; add up λₖ times each one.'],
      teach: t`A Hermitian matrix is the sum of its eigenvalues times the projectors onto its eigenvectors.`,
      explain: t`\`eigh\` exploits Hermiticity: it guarantees real eigenvalues and orthonormal eigenvectors, which a general \`eig\` does not. The eigenvectors here are complex — a Hermitian matrix need not have real ones — and the three projectors rebuild $S_y$ exactly.`,
    }),
    mcq({
      id: 'matrix-element', difficulty: 2,
      prompt: t`For a Hermitian operator, $\langle 1|\hat A|2\rangle = 3 - 2i$ in some orthonormal basis. What is $\langle 2|\hat A|1\rangle$?`,
      visual: {
        type: 'graph',
        params: { x: [-1, 4.2], y: [-2.6, 2.6], aspect: 'wide', equal: true, xlabel: 'Re', ylabel: 'Im', xticks: 5, yticks: 5, points: [{ x: 3, y: -2, color: 'gold', label: '⟨1|A|2⟩ = 3 − 2i' }] },
        caption: 'The given matrix element in the complex plane.',
      },
      choices: [t`$3 + 2i$`, t`$3 - 2i$`, t`$-3 + 2i$`, 'It cannot be found without more information'],
      answer: 0,
      why: {
        1: t`Equal entries in mirror positions is the rule for a real *symmetric* matrix; a Hermitian one has mirrored entries that are complex conjugates.`,
        2: 'That negates the whole number; Hermiticity conjugates it.',
        3: t`Hermiticity is exactly that information: $A_{21} = A_{12}^{*}$.`,
      },
      hints: [t`$\langle 2|\hat A|1\rangle = \langle\hat A^\dagger 2|1\rangle = \langle 1|\hat A^\dagger|2\rangle^{*}$.`],
      teach: t`For a Hermitian operator, $\langle\phi|\hat A|\psi\rangle = \langle\psi|\hat A|\phi\rangle^{*}$.`,
      explain: t`$\langle 2|\hat A|1\rangle = \langle 1|\hat A|2\rangle^{*} = 3 + 2i$. With $\phi = \psi$ the same rule says $\langle\psi|\hat A|\psi\rangle$ equals its own conjugate: every expectation value of an observable is real.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-spectral-entry', difficulty: 3,
      gen(r) {
        const l1 = r.int(-3, 4), l2 = r.intExcept(-3, 4, [l1]);
        const ans = (l2 - l1) / 2;
        return {
          prompt: t`A Hermitian $2\times2$ matrix has eigenvalue $${l1}$ with eigenvector $|1\rangle = \tfrac{1}{\sqrt2}(1,\ i)$ and eigenvalue $${l2}$ with $|2\rangle = \tfrac{1}{\sqrt2}(1,\ -i)$. Build it as $A = ${l1}\,|1\rangle\langle 1| + ${l2}\,|2\rangle\langle 2|$. What is the imaginary part of its top-right entry $A_{12}$?`,
          visual: blochPic({ points: [{ at: [0, 1, 0], label: '|1\\rangle', color: 'gold' }, { at: [0, -1, 0], label: '|2\\rangle', color: 'gold' }], marks: false, caption: 'The two eigenvectors on the sphere of states: at opposite ends of a diameter, as orthogonal states must be. Drag to rotate.' }),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -ans, feedback: t`The sign is off. $|1\rangle\langle1|$ has top-right entry $(1)(i)^{*}/2 = -i/2$: the bra conjugates.` }].filter((e) => Math.abs(e.value - ans) > 0.1),
          hints: [t`The top-right entry of $|v\rangle\langle v|$ is $v_1 v_2^{*}$.`, t`$|1\rangle\langle1|$ has $A_{12} = -\tfrac{i}{2}$ and $|2\rangle\langle2|$ has $+\tfrac{i}{2}$.`],
          teach: t`Each projector $|v\rangle\langle v|$ has entries $v_i v_j^{*}$; an observable is the eigenvalue-weighted sum of them.`,
          explain: t`$A_{12} = ${l1}\left(-\tfrac{i}{2}\right) + ${l2}\left(\tfrac{i}{2}\right) = \tfrac{${l2} - (${l1})}{2}\,i$, so $\operatorname{Im}A_{12} = ${nice(ans)}$. The diagonal is $\tfrac{${l1} + ${l2}}{2}$, real, and $A_{21} = A_{12}^{*}$: Hermitian, as it must be.`,
        };
      },
    }),
    mcq({
      id: 'cp-degenerate', difficulty: 3,
      prompt: t`A Hermitian operator has the eigenvalue 3 twice: two eigenvectors $|u\rangle$ and $|v\rangle$, not multiples of each other, but **not orthogonal** either. Which statement is right?`,
      visual: blochPic({ marks: false, points: [], extra: { vectors: [{ to: [1, 0, 0], color: 'gold', label: '|u\\rangle' }, { to: [0.6, 0.8, 0], color: 'accent', label: '|v\\rangle' }, { to: [0, 1, 0], color: 'good', label: '|v_\\perp\\rangle' }], planes: [{ normal: [0, 0, 1], d: 0, size: 1.3, color: 'violet', alpha: 0.15 }] }, caption: 'A real 3D sketch of a two-dimensional eigenspace (violet plane), not a Bloch sphere: u and v lie in it, and so does the perpendicular combination. Schematic.' }),
      choices: [
        t`Every combination $\alpha|u\rangle + \beta|v\rangle$ is also an eigenvector with eigenvalue 3, so an orthogonal pair can be chosen`,
        'Then the operator cannot be Hermitian, since Hermitian eigenvectors are always orthogonal',
        t`A combination of $|u\rangle$ and $|v\rangle$ is never an eigenvector`,
        'A Hermitian operator never repeats an eigenvalue',
      ],
      answer: 0,
      why: {
        1: 'The theorem guarantees orthogonality only for different eigenvalues. Within a repeated eigenvalue, eigenvectors need not be orthogonal.',
        2: t`For the same eigenvalue, $\hat A(\alpha u + \beta v) = 3(\alpha u + \beta v)$: combinations stay eigenvectors. (For different eigenvalues they would not.)`,
        3: t`Repeats are common: the identity matrix repeats one eigenvalue in every direction, and hydrogen’s levels are degenerate.`,
      },
      hints: [t`Apply $\hat A$ to $\alpha|u\rangle + \beta|v\rangle$.`, 'The orthogonality proof divides by the difference of the two eigenvalues.'],
      teach: 'Within a degenerate eigenvalue every combination of eigenvectors is again an eigenvector, so Gram–Schmidt can always make them orthonormal.',
      explain: t`$\hat A(\alpha|u\rangle + \beta|v\rangle) = 3(\alpha|u\rangle + \beta|v\rangle)$. The eigenvectors for 3 fill a plane, and any two orthogonal vectors in it will do, e.g. $|u\rangle$ and $|v\rangle - \langle u|v\rangle|u\rangle$, normalized. Only *across* different eigenvalues is orthogonality automatic.`,
    }),
    num({
      id: 'cp-nv', difficulty: 3, transfer: true,
      gen(r) {
        const df = r.pick([0.8, 1.4, 2.8, 5.6, 11.2, 22.4]);
        const B = df / 1e3 / (2 * GHZ_T) * 1e6;        // μT
        return {
          prompt: t`A nitrogen-vacancy centre in diamond is a spin-1 defect used as a quantum magnetometer, and is being developed for space magnetometry. With a field $B$ along its axis, its spin Hamiltonian, in frequency units, is

$$\hat H/h = \begin{pmatrix} D + \gamma B & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & D - \gamma B \end{pmatrix},$$

with $D = ${D_NV}$ GHz and $\gamma = ${fmt(GHZ_T, 4)}$ GHz/T (the free electron’s value; the NV’s differs by under 0.1%). Microwaves drive transitions from the middle level to the other two, and the two resonances are found ${df} MHz apart. What is $B$, in μT?`,
          visual: nvLevels,
          answer: B, units: 'μT', tol: { rel: 0.01 },
          errors: [{ value: 2 * B, feedback: t`The two resonances are at $D \pm \gamma B$, so they are $2\gamma B$ apart, not $\gamma B$.` }],
          hints: [t`The eigenvalues are the diagonal entries; the resonances are at $f_\pm = D \pm \gamma B$.`, t`$f_+ - f_- = 2\gamma B$, so $B = \Delta f/(2\gamma)$.`],
          teach: t`The measured frequencies are differences of eigenvalues of the Hamiltonian; read the field off from their splitting.`,
          explain: t`$B = \dfrac{\Delta f}{2\gamma} = \dfrac{${df}\ \text{MHz}}{2\times${fmt(GHZ_T * 1e3, 5)}\ \text{MHz/T}} = ${fmt(B, 3)}\ \mu\text{T}$. Earth’s field at the surface is 25–65 μT. $D$ itself cancels from the difference, which helps: it drifts with temperature.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §3.2–3.3 and Appendix A', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Barry et al., “Sensitivity optimization for NV-diamond magnetometry”, Rev. Mod. Phys. 92, 015004 (2020)', url: 'https://doi.org/10.1103/RevModPhys.92.015004' },
    { label: 'CODATA 2022 recommended values (NIST)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
