// Complex vector spaces and inner products — the bra-ket algebra the rest of
// the course is written in. math2270.LA-13.1 did the matrix side (conjugate
// transposes, Hermitian matrices); this lesson adds Dirac's notation, the
// conjugate-linear bra, components as inner products, and functions as
// vectors with ⟨f|g⟩ = ∫f*g dx. Every number is computed here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { cx, cmul, conj, abs2, inner, norm, argand, seg, label, r6 } from './_qm.js';

const t = String.raw;
const D = Math.PI / 180;
const S2 = Math.SQRT1_2;

/** A complex number as TeX: 2 - i, 3i, -1 + 2i … (integers or short decimals). */
function zTeX([re, im]) {
  const n = (v) => nice(v, 4);
  if (Math.abs(im) < 1e-12) return n(re);
  const m = Math.abs(im), ip = Math.abs(m - 1) < 1e-12 ? 'i' : `${n(m)}i`;
  if (Math.abs(re) < 1e-12) return `${im < 0 ? '-' : ''}${ip}`;
  return `${n(re)} ${im < 0 ? '-' : '+'} ${ip}`;
}
const colTeX = (v) => t`\begin{pmatrix} ${v.map(zTeX).join(t` \\ `)} \end{pmatrix}`;
const rowTeX = (v) => t`\begin{pmatrix} ${v.map(zTeX).join(' & ')} \end{pmatrix}`;
const plain = (z) => zTeX(z).replace(/-/g, '−');

// the worked example's vectors
const A = [cx(1), cx(0, 1), cx(1, -1)], B = [cx(0, 1), cx(1), cx(0)], PSI = [cx(2), cx(0), cx(1, 1)];

/** A polarization ellipse (Ex, Ey) = (cos χ cos ωt, sin χ sin ωt) with a polarizer axis at β. */
function ellipse(chi, beta, caption) {
  const c = Math.cos(chi * D), s = Math.sin(chi * D), cb = Math.cos(beta * D), sb = Math.sin(beta * D);
  return {
    type: 'graph',
    params: {
      x: [-1.6, 1.6], y: [-1.2, 1.2], aspect: 'wide', equal: true, xlabel: 'Ex', ylabel: 'Ey', xticks: 4, yticks: 4,
      curves: [
        { param: [`${r6(c)}*cos(t)`, `${r6(s)}*sin(t)`], t: [0, 6.2832], color: 'gold', width: 2.6 },
        seg(-1.15 * cb, -1.15 * sb, 1.15 * cb, 1.15 * sb, 'violet', 2, [6, 4]),
      ],
      points: [label(1.15 * cb, 1.15 * sb, 'polarizer axis', 'violet', 6, -8)],
    },
    caption,
  };
}

export default lesson({
  id: 'phys4700.M0.1',
  title: 'Complex vector spaces and inner products',
  minutes: 12, difficulty: 2,
  intro: t`A quantum state is a vector in a complex vector space. Dirac wrote it as a **ket**, $|\psi\rangle$. Every ket has a **bra**, $\langle\psi|$: its conjugate transpose, a row of complex conjugates. A bra meeting a ket makes a complex number, the **inner product**:

$$\langle\phi|\psi\rangle = \sum_i \phi_i^{*}\,\psi_i \qquad\text{or, for functions,}\qquad \langle\phi|\psi\rangle = \int \phi^{*}(x)\,\psi(x)\,dx$$

The conjugate keeps every length real: $\langle\psi|\psi\rangle = \sum|\psi_i|^2 \ge 0$. Its price is that order matters: $\langle\psi|\phi\rangle = \langle\phi|\psi\rangle^{*}$. In an orthonormal basis the components of a state are inner products, $\psi_i = \langle e_i|\psi\rangle$, and in the rest of this course **those components are probability amplitudes**. ([Complex inner products and Hermitian matrices](#/lesson/math2270.LA-13.1) did the matrix side; this lesson adds the notation and functions as vectors.)`,
  symbols: [
    { tex: '|\\psi\\rangle', text: 'a ket: a state vector, written as a column of complex components' },
    { tex: '\\langle\\phi|', text: t`a bra: the conjugate transpose of $|\phi\rangle$, a row of the conjugated components` },
    { tex: '\\langle\\phi|\\psi\\rangle', text: 'their inner product, a complex number; it is linear in the ket and conjugate-linear in the bra' },
    { tex: '\\phi_i^{*},\\ \\psi_i', text: t`the $i$-th components; the star is the complex conjugate ($i \to -i$), so $z^*z = |z|^2$` },
    { tex: '\\phi(x),\\ \\psi(x)', text: t`functions as vectors: one component for each point $x$. A wave function in one dimension has units of $\text{m}^{-1/2}$` },
    { tex: 'dx', text: t`the sum over components becomes an integral over $x$` },
  ],
  why: 'Every prediction quantum mechanics makes is an inner product: the probability of a measurement result is the squared size of ⟨result|state⟩.',
  visual: {
    type: 'graph',
    title: 'An inner product is a sum of arrows',
    lead: t`Here $|\phi\rangle = \tfrac{1}{\sqrt2}(1,\ i)$ is fixed and $|\psi\rangle = (\cos\alpha,\ e^{i\delta}\sin\alpha)$ is yours to turn. The left panels show each component in its own complex plane. The right panel adds the products $\phi_1^{*}\psi_1$ (blue) and $\phi_2^{*}\psi_2$ (orange) tip to tail: their sum, in gold, is $\langle\phi|\psi\rangle$. The dashed red arrow is what you get **without** the conjugate.`,
    tasks: [
      'Set α = 45° and δ = 90°: ψ is φ itself, and the gold arrow reaches 1.',
      'Now set δ = 270°: the two products cancel. ψ is orthogonal to φ, though neither of its components is zero.',
      'Back at δ = 90°, follow the dashed red arrow: without the conjugate, φ would be orthogonal to itself.',
    ],
    params: {
      x: [-1.35, 7.0], y: [-1.75, 1.75], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [
        { key: 'a', label: 'Mixing angle $\\alpha$', min: 0, max: 90, step: 1, value: 35, unit: '^\\circ', explain: 'How the length of ψ is shared: cos²α in component 1, sin²α in component 2.' },
        { key: 'd', label: 'Relative phase $\\delta$', min: 0, max: 360, step: 5, value: 120, unit: '^\\circ', explain: 'The phase of ψ’s second component relative to its first.' },
      ],
      constants: { k: 0.70711, c2: 2.8, c3: 5.6 },
      curves: [
        { param: ['t', '0'], t: [-1.15, 1.15], color: 'ink4', width: 1 }, { param: ['0', 't'], t: [-1.15, 1.15], color: 'ink4', width: 1 },
        { param: ['2.8 + t', '0'], t: [-1.15, 1.15], color: 'ink4', width: 1 }, { param: ['2.8', 't'], t: [-1.15, 1.15], color: 'ink4', width: 1 },
        { param: ['5.6 + t', '0'], t: [-1.3, 1.3], color: 'ink4', width: 1 }, { param: ['5.6', 't'], t: [-1.3, 1.3], color: 'ink4', width: 1 },
        { param: ['5.6 + cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: [2, 4] },
      ],
      arrows: [
        { from: [0, 0], to: ['k', 0], color: 'violet', width: 2.4, label: 'φ₁', labelDx: -4, labelDy: 14 },
        { from: [0, 0], to: ['cos(a*pi/180)', 0.001], color: 'gold', width: 2.4, dash: [5, 3], label: 'ψ₁', labelDx: 4, labelDy: -10 },
        { from: [2.8, 0], to: [2.8, 'k'], color: 'violet', width: 2.4, label: 'φ₂', labelDx: 6, labelDy: 0 },
        { from: [2.8, 0], to: ['2.8 + sin(a*pi/180)*cos(d*pi/180)', 'sin(a*pi/180)*sin(d*pi/180)'], color: 'gold', width: 2.4, dash: [5, 3], label: 'ψ₂', labelDx: 6, labelDy: -6 },
        { from: [5.6, 0], to: ['5.6 + k*cos(a*pi/180)', 0.001], color: 'accent', width: 2.6 },
        { from: ['5.6 + k*cos(a*pi/180)', 0], to: ['5.6 + k*cos(a*pi/180) + k*sin(a*pi/180)*sin(d*pi/180)', '-k*sin(a*pi/180)*cos(d*pi/180)'], color: 'warn', width: 2.6 },
        { from: ['5.6 + k*cos(a*pi/180)', 0], to: ['5.6 + k*cos(a*pi/180) - k*sin(a*pi/180)*sin(d*pi/180)', 'k*sin(a*pi/180)*cos(d*pi/180)'], color: 'bad', width: 1.8, dash: [4, 4] },
        { from: [5.6, 0], to: ['5.6 + k*cos(a*pi/180) + k*sin(a*pi/180)*sin(d*pi/180) + 0.0001', '-k*sin(a*pi/180)*cos(d*pi/180)'], color: 'gold', width: 3, label: '⟨φ|ψ⟩', labelDx: 6, labelDy: -8 },
      ],
      points: [
        label(-1.2, 1.6, 'component 1', 'ink2', 0, 4), label(1.6, 1.6, 'component 2', 'ink2', 0, 4), label(4.35, 1.6, 'the sum ⟨φ|ψ⟩', 'ink2', 0, 4),
        label(1.05, 0, 'Re', 'ink3', 0, 12), label(0, 1.1, 'Im', 'ink3', 6, 0),
        label(6.75, -1.2, 'dashed circle: |z| = 1', 'ink3', 0, 0, 'right'),
      ],
      readouts: [
        { label: '$\\operatorname{Re}\\langle\\phi|\\psi\\rangle$', expr: 'k*(cos(a*pi/180) + sin(a*pi/180)*sin(d*pi/180))', digits: 3 },
        { label: '$\\operatorname{Im}\\langle\\phi|\\psi\\rangle$', expr: '-k*sin(a*pi/180)*cos(d*pi/180)', digits: 3 },
        { label: '$|\\langle\\phi|\\psi\\rangle|^2$', expr: '0.5*((cos(a*pi/180) + sin(a*pi/180)*sin(d*pi/180))^2 + (sin(a*pi/180)*cos(d*pi/180))^2)', digits: 3 },
      ],
    },
    caption: t`Both states have length 1, so $|\langle\phi|\psi\rangle|$ never leaves the dashed unit circle (the Schwarz inequality). The arrows are exact; only the layout is schematic.`,
  },
  example: {
    prompt: t`Take $|a\rangle = ${colTeX(A)}$, $|b\rangle = ${colTeX(B)}$ and $|\psi\rangle = ${colTeX(PSI)}$ in $\mathbb C^3$. Normalize $|a\rangle$, show that $|b\rangle$ is orthogonal to it, and find the component of $|\psi\rangle$ along the unit vector $|\hat a\rangle$.`,
    visual: argand([0, 1, 2].map((k) => ({ title: `component ${k + 1}`, arrows: [{ z: A[k], color: 'gold', label: `a${'₁₂₃'[k]}` }, { z: B[k], color: 'accent', label: `b${'₁₂₃'[k]}`, ldx: 6, ldy: 10 }] })), { R: 1.5, caption: t`The components of $|a\rangle$ (gold) and $|b\rangle$ (blue), each in its own complex plane. $b_3 = 0$ is a dot.` }),
    steps: [
      { label: 'Length', text: t`$\langle a|a\rangle = |1|^2 + |i|^2 + |1 - i|^2 = 1 + 1 + 2 = 4$, so $\| a\| = 2$ and $|\hat a\rangle = \tfrac12 ${colTeX(A)}$.` },
      { label: 'The bra', text: t`Conjugate every entry and lay it on its side: $\langle a| = ${rowTeX(A.map(conj))}$.` },
      { label: 'Orthogonality', text: t`$\langle a|b\rangle = (1)(i) + (-i)(1) + (1 + i)(0) = i - i = 0$. The vectors are orthogonal, though no component of either is zero.` },
      { label: 'Without the conjugate', text: t`$\sum a_i b_i = (1)(i) + (i)(1) + 0 = 2i$ would wrongly call them not orthogonal. The conjugate is not decoration.` },
      { label: 'A component', text: t`$\langle\hat a|\psi\rangle = \tfrac12\big[(1)(2) + (-i)(0) + (1 + i)(1 + i)\big] = \tfrac12(2 + 2i) = 1 + i$.` },
      { label: 'Check the order', text: t`$\langle\psi|\hat a\rangle = \tfrac12\big[(2)(1) + (0)(i) + (1 - i)(1 - i)\big] = \tfrac12(2 - 2i) = 1 - i$: the complex conjugate, as it must be.` },
    ],
    answer: t`$\|a\| = 2$; $\langle a|b\rangle = 0$; $\langle\hat a|\psi\rangle = 1 + i$, with $|\langle\hat a|\psi\rangle| = \sqrt2$.`,
  },
  practice: [
    mcq({
      id: 'bra', difficulty: 1,
      prompt: t`$|\psi\rangle = ${colTeX([cx(2, -1), cx(0, 3)])}$. Which is $\langle\psi|$?`,
      visual: argand([{ title: 'ψ₁', arrows: [{ z: [2, -1], color: 'gold', label: '2 − i' }] }, { title: 'ψ₂', arrows: [{ z: [0, 3], color: 'gold', label: '3i' }] }], { R: 3.2, caption: t`The two components of $|\psi\rangle$ in their complex planes.` }),
      choices: [t`$\begin{pmatrix} 2 + i & -3i \end{pmatrix}$`, t`$\begin{pmatrix} 2 - i & 3i \end{pmatrix}$`, t`$\begin{pmatrix} 2 + i \\ -3i \end{pmatrix}$`, t`$\begin{pmatrix} -2 + i & -3i \end{pmatrix}$`],
      answer: 0,
      why: {
        1: 'That is the transpose without the conjugate. A bra conjugates every component.',
        2: 'The entries are conjugated, but a column is still a ket. A bra is a row.',
        3: t`Conjugating $2 - i$ flips the sign of its imaginary part only: $2 + i$, not $-2 + i$.`,
      },
      hints: ['A bra is the conjugate transpose: two operations.', t`Conjugate each entry ($i \to -i$), then write them as a row.`],
      teach: t`$\langle\psi|$ is the row of complex conjugates of $|\psi\rangle$’s components.`,
      explain: t`Conjugate: $2 - i \to 2 + i$ and $3i \to -3i$; transpose to a row. Then $\langle\psi|\psi\rangle = (2 + i)(2 - i) + (-3i)(3i) = 5 + 9 = 14$, real and positive.`,
    }),
    num({
      id: 'norm3', difficulty: 1,
      gen(r) {
        const v = [cx(r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])), cx(0, r.intExcept(-3, 3, [0])), cx(r.intExcept(-3, 3, [0]))];
        const ans = norm(v);
        const naive = Math.sqrt(Math.hypot(...v.reduce((s, z) => [s[0] + cmul(z, z)[0], s[1] + cmul(z, z)[1]], [0, 0])));
        return {
          prompt: t`Find the length $\|\psi\| = \sqrt{\langle\psi|\psi\rangle}$ of $|\psi\rangle = ${colTeX(v)}$.`,
          visual: argand(v.map((z, k) => ({ title: `ψ${'₁₂₃'[k]}`, circle: Math.hypot(...z), arrows: [{ z, color: 'gold', label: plain(z) }] })), { R: 4.3, caption: 'Each component as an arrow; the dotted circle marks its modulus |ψᵢ|.' }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: naive, feedback: t`You squared the components without conjugating: $\sum\psi_i^2$ mixes signs. Use $\sum\psi_i^*\psi_i = \sum|\psi_i|^2$.` }, { value: ans * ans, feedback: t`That is $\langle\psi|\psi\rangle$. The length is its square root.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\langle\psi|\psi\rangle = \sum_i |\psi_i|^2$, and $|a + bi|^2 = a^2 + b^2$.`, 'Add the squared moduli, then take the square root.'],
          teach: 'The length of a complex vector is the square root of the sum of its components’ squared moduli.',
          explain: t`$\langle\psi|\psi\rangle = ${v.map((z) => fmt(abs2(z), 3)).join(' + ')} = ${fmt(ans * ans, 4)}$, so $\|\psi\| = ${fmt(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'component-weight', difficulty: 2,
      gen(r) {
        const [p, q] = r.pick([[3, 1], [1, 2], [2, 1], [1, 3], [3, 2], [2, 3], [4, 1], [1, 4]]);
        const ans = (p + q) ** 2 / (2 * (p * p + q * q));
        return {
          prompt: t`In $\mathbb C^2$ the vectors $|1\rangle = \tfrac{1}{\sqrt2}${colTeX([cx(1), cx(0, 1)])}$ and $|2\rangle = \tfrac{1}{\sqrt2}${colTeX([cx(0, 1), cx(1)])}$ form an orthonormal basis. Normalize $|\psi\rangle \propto ${colTeX([cx(p), cx(0, q)])}$ and expand it as $c_1|1\rangle + c_2|2\rangle$. What is $|c_1|^2$?`,
          visual: argand([{ title: 'component 1', arrows: [{ z: [S2, 0], color: 'violet', label: '|1⟩' }, { z: [0, S2], color: 'accent', label: '|2⟩', ldx: 6, ldy: 0 }, { z: [p / Math.hypot(p, q), 0.001], color: 'gold', label: 'ψ', ldx: 0, ldy: 14 }] }, { title: 'component 2', arrows: [{ z: [0, S2], color: 'violet', label: '|1⟩', ldx: 6, ldy: 0 }, { z: [S2, 0], color: 'accent', label: '|2⟩' }, { z: [0.001, q / Math.hypot(p, q)], color: 'gold', label: 'ψ', ldx: -18, ldy: 0 }] }], { R: 1.15, caption: 'The basis vectors and the normalized state, component by component.' }),
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: (p - q) ** 2 / (2 * (p * p + q * q)), feedback: t`You used $|1\rangle$’s components without conjugating: $c_1 = \langle 1|\psi\rangle$ needs $\langle 1| = \tfrac{1}{\sqrt2}(1,\ -i)$.` },
            { value: (p + q) ** 2 / 2, feedback: t`Normalize $|\psi\rangle$ first: divide by $\sqrt{${p * p} + ${q * q}}$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$c_1 = \langle 1|\psi\rangle$, with the bra $\langle 1| = \tfrac{1}{\sqrt2}(1,\ -i)$.`, t`Normalized, $|\psi\rangle = \tfrac{1}{\sqrt{${p * p + q * q}}}(${p},\ ${q}i)$, so $\langle 1|\psi\rangle = \tfrac{${p} + ${q}}{\sqrt{2}\sqrt{${p * p + q * q}}}$.`],
          teach: t`The component of $|\psi\rangle$ along a basis vector $|e\rangle$ is the inner product $\langle e|\psi\rangle$ — with the basis vector conjugated.`,
          explain: t`$c_1 = \langle 1|\psi\rangle = \dfrac{(1)(${p}) + (-i)(${q}i)}{\sqrt2\,\sqrt{${p * p + q * q}}} = \dfrac{${p + q}}{\sqrt{${2 * (p * p + q * q)}}}$, so $|c_1|^2 = ${fmt(ans, 4)}$, and $|c_2|^2 = ${fmt(1 - ans, 4)}$: the two add to 1.`,
        };
      },
    }),
    mcq({
      id: 'antilinear', difficulty: 2,
      prompt: t`Two states have $\langle\phi|\psi\rangle = 2 - i$. What is $\langle 3i\,\psi|\phi\rangle$, the inner product of the ket $3i|\psi\rangle$’s bra with $|\phi\rangle$?`,
      visual: argand([{ title: '⟨φ|ψ⟩', arrows: [{ z: [2, -1], color: 'gold', label: '2 − i' }] }], { R: 2.4, caption: t`The given inner product $\langle\phi|\psi\rangle$ in the complex plane.` }),
      choices: [t`$3 - 6i$`, t`$-3 + 6i$`, t`$-3 - 6i$`, t`$3 + 6i$`],
      answer: 0,
      why: {
        1: t`That is $3i\,\langle\psi|\phi\rangle$. The bra of $3i|\psi\rangle$ is $(3i)^*\langle\psi| = -3i\langle\psi|$: a number leaves a bra conjugated.`,
        2: t`That is $-3i\,\langle\phi|\psi\rangle$. Swapping the order also conjugates: $\langle\psi|\phi\rangle = (2 - i)^* = 2 + i$.`,
        3: t`Both conjugations were missed: $3i(2 - i) = 3 + 6i$.`,
      },
      hints: [t`Two rules: $\langle c\psi| = c^*\langle\psi|$, and $\langle\psi|\phi\rangle = \langle\phi|\psi\rangle^*$.`, t`So $\langle 3i\psi|\phi\rangle = (-3i)(2 + i)$.`],
      teach: 'The inner product is linear in the ket and conjugate-linear in the bra; swapping the two conjugates the result.',
      explain: t`$\langle 3i\psi|\phi\rangle = (3i)^*\langle\psi|\phi\rangle = (-3i)(2 + i) = -6i - 3i^2 = 3 - 6i$.`,
    }),
    num({
      id: 'function-inner', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 3, 5, 7]);
        const ans = 2 / (k * Math.PI), kk = k === 1 ? '' : k;
        return {
          prompt: t`On $0 \le x \le L$, take $u(x) = 1/\sqrt L$ and $v(x) = e^{i${k === 1 ? '' : k}\pi x/L}/\sqrt L$, both of length 1. Find $|\langle u|v\rangle|$, where $\langle u|v\rangle = \int_0^L u^*(x)\,v(x)\,dx$.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 1], y: [-1.25, 1.25], aspect: 'wide', xlabel: 'x / L', ylabel: '√L × value',
              curves: [{ fn: '1', color: 'ink2', width: 2, label: 'u', labelAt: 0.03, labelDy: -10 }, { fn: `cos(${k}*pi*x)`, color: 'accent', width: 2.4, label: 'Re v', labelAt: 0.5 / k + 0.02, labelDx: 4 }, { fn: `sin(${k}*pi*x)`, color: 'warn', width: 2.4, dash: [6, 4], label: 'Im v', labelAt: Math.min(0.9, 1.5 / k), labelDy: 14 }],
              shade: [{ fn: `sin(${k}*pi*x)`, from: 0, to: 1, color: 'warn', alpha: 0.18 }],
            },
            caption: t`The real (blue) and imaginary (orange, dashed) parts of $v$, with $u$ in grey. The shaded area is $\int\operatorname{Im} v\,dx$.`,
          },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1 / (k * Math.PI), feedback: t`Check the antiderivative’s limits: $\big[e^{i${kk}\pi x/L}\big]_0^L = e^{i${kk}\pi} - 1 = -2$.` }],
          hints: [t`$\langle u|v\rangle = \dfrac1L\displaystyle\int_0^L e^{i${kk}\pi x/L}\,dx$ (conjugating the real $u$ changes nothing).`, t`The antiderivative is $\dfrac{L}{i${kk}\pi}e^{i${kk}\pi x/L}$; at the limits $e^{i${kk}\pi} - 1 = -2$.`],
          teach: t`For functions the inner product is an integral; complex exponentials are orthogonal only when their phases complete whole turns over the interval.`,
          explain: t`$\langle u|v\rangle = \dfrac{1}{i${kk}\pi}\big(e^{i${kk}\pi} - 1\big) = \dfrac{-2}{i${kk}\pi} = \dfrac{2i}{${kk}\pi}$, so $|\langle u|v\rangle| = \dfrac{2}{${kk}\pi} = ${fmt(ans, 4)}$. The real part averages to zero; the imaginary part does not, because $${kk}\pi$ is an odd number of half-turns. With $e^{2\pi i n x/L}$ instead, every pair would be orthogonal.`,
        };
      },
    }),
    code({
      id: 'braket-numpy', difficulty: 2,
      prompt: t`Write \`braket(a, b)\`, which returns $\langle a|b\rangle = \sum_i a_i^* b_i$ for two complex NumPy arrays, and \`normalize(v)\`, which returns $v/\|v\|$. Use \`np.conj\` (or \`np.vdot\`, which conjugates its first argument). Careful: \`np.dot\` does **not** conjugate.`,
      starter: t`import numpy as np

def braket(a, b):
    # <a|b> = sum of conj(a_i) * b_i
    pass

def normalize(v):
    pass

a = np.array([1, 1j, 1 - 1j])
b = np.array([1j, 1, 0])
print(braket(a, b))
`,
      answer: t`import numpy as np

def braket(a, b):
    return np.sum(np.conj(a) * b)

def normalize(v):
    return v / np.sqrt(braket(v, v).real)

a = np.array([1, 1j, 1 - 1j])
b = np.array([1j, 1, 0])
print(braket(a, b))`,
      tests: [
        { name: '⟨a|a⟩ is 4 for a = (1, i, 1 − i)', code: 'abs(braket(np.array([1, 1j, 1 - 1j]), np.array([1, 1j, 1 - 1j])) - 4) < 1e-12' },
        { name: 'a = (1, i, 1 − i) and b = (i, 1, 0) are orthogonal', code: 'abs(braket(np.array([1, 1j, 1 - 1j]), np.array([1j, 1, 0]))) < 1e-12' },
        { name: 'swapping the order conjugates: ⟨b|a⟩ = ⟨a|b⟩*', code: 'abs(braket(np.array([2, 1j]), np.array([1 + 1j, 3])) - np.conj(braket(np.array([1 + 1j, 3]), np.array([2, 1j])))) < 1e-12' },
        { name: 'braket conjugates its first argument: ⟨i|1⟩ = −i', code: 'abs(braket(np.array([1j]), np.array([1])) - (-1j)) < 1e-12' },
        { name: 'normalize returns a vector of length 1 in the same direction', code: 'abs(braket(normalize(np.array([3, 4j])), normalize(np.array([3, 4j]))) - 1) < 1e-12 and abs(normalize(np.array([3, 4j]))[1] - 0.8j) < 1e-12' },
      ],
      hints: ['`np.conj(a) * b` multiplies component by component; `np.sum` adds them.', 'The length is `np.sqrt(braket(v, v).real)`: ⟨v|v⟩ is real, but NumPy stores it as a complex number.'],
      teach: 'In code, as on paper, the bra is the conjugated vector: forgetting the conjugate is the commonest bug in quantum programs.',
      explain: t`\`np.sum(np.conj(a) * b)\` is the definition. \`np.vdot(a, b)\` does the same in one call; \`np.dot(a, b)\` would give $2i$ for the example pair instead of $0$.`,
    }),
    mcq({
      id: 'plane-wave-error', difficulty: 3, kind: 'error',
      prompt: t`A student checks the length of the wave $\psi(x) = e^{ikx}$ on $0 \le x \le L$ and writes

$$\langle\psi|\psi\rangle = \int_0^L e^{ikx}\,e^{ikx}\,dx = \frac{e^{2ikL} - 1}{2ik},$$

then worries that this is complex, and even zero when $kL = \pi$. Where is the mistake?`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 1], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'x / L', ylabel: '',
          curves: [{ fn: 'cos(2*pi*x)', color: 'bad', width: 2, dash: [6, 4], label: 'Re e^(2ikx)', labelAt: 0.32, labelDy: 14 }, { fn: '1', color: 'good', width: 2.6, label: '|ψ|² = 1', labelAt: 0.75, labelDy: -10 }],
        },
        caption: t`With $kL = \pi$: the real part of $e^{ikx}e^{ikx}$ (red, dashed) averages to zero, while $\psi^*\psi = |\psi|^2$ (green) is 1 everywhere.`,
      },
      choices: [
        t`The bra needs the conjugate: $\langle\psi|\psi\rangle = \int_0^L e^{-ikx}e^{ikx}\,dx = L$`,
        t`The antiderivative is wrong: it should be $(e^{2ikL} - 1)/(ik)$`,
        t`Nothing is wrong: a plane wave really has zero length when $kL = \pi$`,
        t`The limits should run from $-L$ to $L$`,
      ],
      answer: 0,
      why: {
        1: t`$\int e^{2ikx}dx = e^{2ikx}/(2ik)$ is right. The integrand is the problem.`,
        2: t`A nonzero vector never has zero length; $\langle\psi|\psi\rangle = \int|\psi|^2dx$ is a sum of positive numbers.`,
        3: 'The interval was given; changing it does not fix a missing conjugate.',
      },
      hints: [t`Which factor in $\langle\psi|\psi\rangle$ comes from the bra?`, t`$\psi^*\psi = |\psi|^2$, and $|e^{ikx}| = 1$.`],
      teach: t`$\langle\psi|\psi\rangle = \int\psi^*\psi\,dx = \int|\psi|^2dx$: real and positive for any nonzero $\psi$.`,
      explain: t`The bra conjugates: $\psi^*\psi = e^{-ikx}e^{ikx} = 1$, so $\langle\psi|\psi\rangle = L$ and $\|\psi\| = \sqrt L$. Normalized, the wave is $e^{ikx}/\sqrt L$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-component', difficulty: 2,
      gen(r) {
        const p = r.intExcept(-3, 3, [0]), q = r.intExcept(-3, 3, [0]), s = r.intExcept(-2, 2, [0]);
        const N2 = p * p + q * q + s * s, ans = (p * p + q * q) / (2 * N2);
        return {
          prompt: t`In $\mathbb C^3$, $|e_1\rangle = \tfrac{1}{\sqrt2}(1,\ 1,\ 0)$ is one vector of an orthonormal basis. The state is $|\psi\rangle \propto (${p},\ ${q}i,\ ${s})$. After normalizing, what is $|\langle e_1|\psi\rangle|^2$?`,
          visual: argand([{ title: 'ψ₁', arrows: [{ z: [p, 0.001], color: 'gold', label: String(p).replace('-', '−') }] }, { title: 'ψ₂', arrows: [{ z: [0.001, q], color: 'gold', label: `${String(q).replace('-', '−')}i` }] }, { title: 'ψ₃', arrows: [{ z: [s, 0.001], color: 'gold', label: String(s).replace('-', '−') }] }], { R: 3.4, caption: 'The unnormalized components of ψ.' }),
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: (p + q) ** 2 / (2 * N2), feedback: t`$${p} + ${q}i$ is a complex number: its squared modulus is $${p}^2 + ${q}^2$, not $(${p} + ${q})^2$.` },
            { value: (p * p + q * q) / 2, feedback: t`Normalize first: divide by $\langle\psi|\psi\rangle = ${N2}$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\langle e_1|\psi\rangle = \tfrac{1}{\sqrt2}(\psi_1 + \psi_2)$ for the normalized $\psi$.`],
          teach: t`A component is an inner product with the basis vector, taken after normalizing the state.`,
          explain: t`$\langle\psi|\psi\rangle = ${N2}$; $\langle e_1|\psi\rangle = \dfrac{${p} + ${q}i}{\sqrt2\sqrt{${N2}}}$, so $|\langle e_1|\psi\rangle|^2 = \dfrac{${p * p} + ${q * q}}{${2 * N2}} = ${fmt(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-schwarz', difficulty: 2,
      prompt: t`$|\phi\rangle$ and $|\psi\rangle$ are both unit vectors. Which value **cannot** be their inner product $\langle\phi|\psi\rangle$?`,
      visual: {
        type: 'graph',
        params: {
          x: [-1.7, 1.7], y: [-1.25, 1.25], aspect: 'wide', equal: true, xlabel: 'Re', ylabel: 'Im', xticks: 6, yticks: 4,
          points: [{ x: 0.6, y: 0.9, color: 'gold', label: '0.6 + 0.9i' }, { x: 0.6, y: 0.8, color: 'gold', label: '0.6 + 0.8i', labelDx: 9, labelDy: 10 }, { x: -1, y: 0, color: 'gold', label: '−1' }, { x: 0, y: 0.5, color: 'gold', label: '0.5i', labelDx: -36 }],
        },
        caption: 'The four candidate values in the complex plane.',
      },
      choices: [t`$0.6 + 0.9i$`, t`$0.6 + 0.8i$`, t`$-1$`, t`$0.5i$`],
      answer: 0,
      why: {
        1: t`$|0.6 + 0.8i| = 1$ exactly: possible, when $|\psi\rangle = (0.6 + 0.8i)|\phi\rangle$, the same state times a phase.`,
        2: t`$|\psi\rangle = -|\phi\rangle$ gives $-1$; the magnitude is 1, the limit, and allowed.`,
        3: t`Its magnitude, 0.5, is below 1: two states partly along each other.`,
      },
      hints: [t`The Schwarz inequality: $|\langle\phi|\psi\rangle|^2 \le \langle\phi|\phi\rangle\langle\psi|\psi\rangle$.`],
      teach: t`For unit vectors $|\langle\phi|\psi\rangle| \le 1$, with equality only when one is the other times a phase.`,
      explain: t`$|0.6 + 0.9i|^2 = 0.36 + 0.81 = 1.17 > 1$, which the Schwarz inequality forbids. In quantum mechanics $|\langle\phi|\psi\rangle|^2$ will be a probability, so it had better not exceed 1.`,
    }),
    num({
      id: 'cp-lidar', difficulty: 3, transfer: true,
      gen(r) {
        const chi = r.pick([20, 25, 30, 35, 40]), beta = r.pick([30, 45, 60, 75]);
        const c = Math.cos(chi * D), s = Math.sin(chi * D), cb = Math.cos(beta * D), sb = Math.sin(beta * D);
        const ans = (cb * c) ** 2 + (sb * s) ** 2;
        const realSlip = Math.cos((beta - chi) * D) ** 2;
        return {
          prompt: t`A satellite lidar tells ice crystals from water droplets in clouds by the polarization of the laser light they send back (NASA’s CALIPSO did this from 2006 to 2023). Light’s polarization is a complex 2-vector of horizontal and vertical field components, a Jones vector. Suppose the returned light is in the elliptical state $|E\rangle = (\cos${chi}^\circ,\ i\sin${chi}^\circ)$. A polarizer at $\beta = ${beta}^\circ$ from horizontal passes the component along $|\beta\rangle = (\cos\beta,\ \sin\beta)$, and the fraction of the power it transmits is $|\langle\beta|E\rangle|^2$. Find that fraction.`,
          visual: ellipse(chi, beta, t`The field’s tip traces this ellipse once per optical cycle; the violet line is the polarizer’s axis. Not to scale.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: realSlip, feedback: t`You dropped the $i$: that treats the light as linearly polarized at $${chi}^\circ$. The $i$ puts the vertical component a quarter-cycle behind, so the cross term has no real part and the two contributions add as squares.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\langle\beta|E\rangle = \cos\beta\cos\chi + i\sin\beta\sin\chi$ ($|\beta\rangle$ is real, so conjugating it changes nothing).`, t`$|a + ib|^2 = a^2 + b^2$ with $a = \cos${beta}^\circ\cos${chi}^\circ$ and $b = \sin${beta}^\circ\sin${chi}^\circ$.`],
          teach: t`A transmitted fraction is the squared modulus of an inner product, and the $i$ in a Jones vector is a phase that changes it.`,
          explain: t`$|\langle\beta|E\rangle|^2 = \cos^2${beta}^\circ\cos^2${chi}^\circ + \sin^2${beta}^\circ\sin^2${chi}^\circ = ${fmt(ans, 4)}$. Turning the polarizer traces out the ellipse: the most power passes along its long axis (horizontal, $\cos^2${chi}^\circ = ${fmt(c * c, 3)}$) and the least along its short one. The same squared inner product will give every quantum probability in this course.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §3.1 and Appendix A', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Townsend, A Modern Approach to Quantum Mechanics, 2nd ed., ch. 1', url: 'https://uscibooks.aip.org/books/a-modern-approach-to-quantum-mechanics-2nd-edition/' },
  ],
});
