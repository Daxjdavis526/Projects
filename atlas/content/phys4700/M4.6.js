// Dirac notation (Griffiths & Schroeter §3.6). Kets as vectors, bras as the
// linear functionals ⟨α| = |α⟩†, components ⟨eₙ|ψ⟩, operators as matrices
// Q_mn = ⟨e_m|Q̂|e_n⟩, outer products and projectors Pₙ = |eₙ⟩⟨eₙ|, the
// completeness relation Σ|eₙ⟩⟨eₙ| = 1 (and ∫|p⟩⟨p|dp = 1), ψ(x) = ⟨x|ψ⟩,
// Φ(p) = ⟨p|ψ⟩, ⟨x|p⟩ = e^{ipx/ħ}/√(2πħ); a change of basis as B†QB.
// Explore: a real two-dimensional state space with a rotatable basis — the
// two projections add head to tail to the state. Worked: an operator given as
// outer products, its matrix, spectrum and spectral form. Transfer: basis
// misalignment in satellite quantum key distribution. Every number is
// computed here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { argand, cmul, conj, abs2, cadd, seg, label, r6 } from './_qm.js';

const t = String.raw;
const D = Math.PI / 180;

/** A real 2D state space: |ψ⟩ at angle th, an orthonormal basis turned by be, projections dashed. */
function planePic({ th, be, caption, showPsi = true, proj = true, names = ['e₁', 'e₂'], extra = {} }) {
  const c = (a) => r6(Math.cos(a * D)), s = (a) => r6(Math.sin(a * D));
  const p1 = Math.cos((th - be) * D), p2 = Math.sin((th - be) * D);
  const arrows = [
    { from: [0, 0], to: [c(be), s(be)], color: 'accent', width: 2.2, label: names[0], labelDx: 6, labelDy: -6 },
    { from: [0, 0], to: [r6(-Math.sin(be * D)), c(be)], color: 'accent', width: 2.2, label: names[1], labelDx: 6, labelDy: -6 },
  ];
  if (showPsi) arrows.push({ from: [0, 0], to: [c(th), s(th)], color: 'gold', width: 3, label: '|ψ⟩', labelDx: 6, labelDy: -8 });
  const curves = [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: [2, 4] }];
  if (proj && showPsi) {
    const q1 = [p1 * Math.cos(be * D), p1 * Math.sin(be * D)], q2 = [-p2 * Math.sin(be * D), p2 * Math.cos(be * D)];
    curves.push(seg(Math.cos(th * D), Math.sin(th * D), q1[0], q1[1], 'violet', 1.6, [5, 4]), seg(Math.cos(th * D), Math.sin(th * D), q2[0], q2[1], 'violet', 1.6, [5, 4]));
    arrows.push({ from: [0, 0], to: q1.map(r6), color: 'violet', width: 2 }, { from: [0, 0], to: q2.map(r6), color: 'violet', width: 2 });
  }
  return { type: 'graph', params: { x: [-1.35, 1.35], y: [-1.2, 1.2], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, arrows, ...extra }, caption };
}

/** Complex amplitudes as arrows, one panel per component. */
const ampPic = (comps, names, caption) => argand(comps.map((z, k) => ({ title: names[k], arrows: [{ z, color: 'gold' }], circle: 1 })), { R: 1.15, caption });

export default lesson({
  id: 'phys4700.M4.6',
  title: 'Dirac notation',
  minutes: 16, difficulty: 3,
  intro: t`Dirac’s notation writes a state as a **ket** $|\psi\rangle$, a vector that exists before any basis is chosen. Its **bra** $\langle\psi|$ is the conjugate-transposed row that turns any ket into a number, $\langle\psi|\phi\rangle$. A basis gives components $\langle e_n|\psi\rangle$ and turns every operator into a matrix of numbers $Q_{mn}$. The **outer product** $|e_n\rangle\langle e_n|$ projects onto one basis vector, and adding all of them gives the identity:

$$\begin{gathered} \sum_n|e_n\rangle\langle e_n| = \hat 1 \\ Q_{mn} = \langle e_m|\hat Q|e_n\rangle \end{gathered}$$

Inserting that identity anywhere is the most useful move in quantum mechanics: with position and momentum bases, $\int|x\rangle\langle x|\,dx = \int|p\rangle\langle p|\,dp = \hat 1$, it gives $\psi(x) = \langle x|\psi\rangle$, $\Phi(p) = \langle p|\psi\rangle$ and the Fourier transform between them.`,
  symbols: [
    { tex: '|\\psi\\rangle', text: 'a ket: the state as an abstract vector, before any basis is chosen' },
    { tex: '\\langle\\psi|', text: t`its bra, $|\psi\rangle^\dagger$: complex-conjugated and transposed, so that $\langle\psi|\psi\rangle$ is a real length squared` },
    { tex: '|e_n\\rangle', text: t`an orthonormal basis, $\langle e_m|e_n\rangle = \delta_{mn}$ — for example the eigenvectors of some observable` },
    { tex: '|e_n\\rangle\\langle e_n|', text: t`the projection operator onto $|e_n\rangle$: it keeps the component $\langle e_n|\psi\rangle$ along $|e_n\rangle$ and discards the rest` },
    { tex: '\\hat 1', text: 'the identity operator' },
    { tex: 'Q_{mn}', text: t`the matrix element of $\hat Q$ in that basis: row $m$, column $n$` },
  ],
  why: 'Every quantum calculation from here on — spin, angular momentum, perturbation theory, quantum computing — is matrix algebra in a well-chosen basis, written in bras and kets.',
  visual: {
    type: 'graph',
    title: 'Projectors add up to the identity',
    lead: t`A real two-dimensional state space. The gold arrow is $|\psi\rangle$; the blue arrows are an orthonormal basis $|e_1\rangle$, $|e_2\rangle$ that you can turn. The violet arrows are $|e_1\rangle\langle e_1|\psi\rangle$ and $|e_2\rangle\langle e_2|\psi\rangle$.`,
    tasks: [
      'Turn the basis: the components change, but the two violet projections always add head to tail to the same |ψ⟩ — that is Σ|eₙ⟩⟨eₙ| = 1.',
      'The squares of the two components always sum to 1: the probabilities of the two results of measuring in this basis.',
      'Line e₁ up with |ψ⟩: one component is 1 and the other 0. A ket has components only once a basis is chosen.',
    ],
    params: {
      x: [-1.35, 1.35], y: [-1.2, 1.2], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [
        { key: 'th', label: t`State angle $\theta_\psi$`, min: 0, max: 180, step: 5, value: 60, unit: '^\\circ', explain: t`$|\psi\rangle = \cos\theta_\psi|x\rangle + \sin\theta_\psi|y\rangle$ in a fixed reference basis.` },
        { key: 'be', label: t`Basis angle $\beta$`, min: 0, max: 90, step: 5, value: 15, unit: '^\\circ', explain: t`The basis $|e_1\rangle$, $|e_2\rangle$ turned by $\beta$ from the reference axes.` },
      ],
      curves: [
        { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: [2, 4] },
        { param: ['cos(th*pi/180) + (cos((th - be)*pi/180)*cos(be*pi/180) - cos(th*pi/180))*t', 'sin(th*pi/180) + (cos((th - be)*pi/180)*sin(be*pi/180) - sin(th*pi/180))*t'], t: [0, 1], color: 'violet', width: 1.4, dash: [5, 4] },
        { param: ['cos(th*pi/180) + (-sin((th - be)*pi/180)*sin(be*pi/180) - cos(th*pi/180))*t', 'sin(th*pi/180) + (sin((th - be)*pi/180)*cos(be*pi/180) - sin(th*pi/180))*t'], t: [0, 1], color: 'violet', width: 1.4, dash: [5, 4] },
      ],
      arrows: [
        { from: [0, 0], to: ['cos(be*pi/180)', 'sin(be*pi/180)'], color: 'accent', width: 2.2, label: 'e₁', labelDx: 6, labelDy: -6 },
        { from: [0, 0], to: ['-sin(be*pi/180)', 'cos(be*pi/180)'], color: 'accent', width: 2.2, label: 'e₂', labelDx: 6, labelDy: -6 },
        { from: [0, 0], to: ['cos((th - be)*pi/180)*cos(be*pi/180)', 'cos((th - be)*pi/180)*sin(be*pi/180)'], color: 'violet', width: 2 },
        { from: [0, 0], to: ['-sin((th - be)*pi/180)*sin(be*pi/180)', 'sin((th - be)*pi/180)*cos(be*pi/180)'], color: 'violet', width: 2 },
        { from: [0, 0], to: ['cos(th*pi/180)', 'sin(th*pi/180)'], color: 'gold', width: 3, label: '|ψ⟩', labelDx: 6, labelDy: -8 },
      ],
      readouts: [
        { label: t`$\langle e_1|\psi\rangle$`, expr: 'cos((th - be)*pi/180)', digits: 3 },
        { label: t`$\langle e_2|\psi\rangle$`, expr: 'sin((th - be)*pi/180)', digits: 3 },
        { label: t`$|\langle e_1|\psi\rangle|^2 + |\langle e_2|\psi\rangle|^2$`, expr: 'cos((th - be)*pi/180)^2 + sin((th - be)*pi/180)^2', digits: 4 },
      ],
    },
    caption: 'A real slice of a complex space, so every amplitude here is a real number; in general the components are complex and only their moduli could be drawn as lengths. The dotted circle is the set of unit kets.',
  },
  example: {
    prompt: t`In an orthonormal basis $|1\rangle$, $|2\rangle$, an observable is $\hat Q = \epsilon\big(|1\rangle\langle1| - |2\rangle\langle2| + i|1\rangle\langle2| - i|2\rangle\langle1|\big)$, with $\epsilon$ a real energy. Find its matrix, check it is Hermitian, find its eigenvalues, and find the probability that a system in $|1\rangle$ gives the larger one.`,
    visual: ampPic([[1, 0], [0, 0]], ['⟨1|ψ⟩', '⟨2|ψ⟩'], t`The state $|1\rangle$: component 1 along $|1\rangle$, nothing along $|2\rangle$. The question is its components along the eigenvectors of $\hat Q$.`),
    steps: [
      { label: 'Matrix elements', text: t`$Q_{mn} = \langle m|\hat Q|n\rangle$, and $\langle m|\big(|a\rangle\langle b|\big)|n\rangle = \delta_{ma}\delta_{bn}$: each outer product $|a\rangle\langle b|$ puts its coefficient in row $a$, column $b$. So $\mathsf Q = \epsilon\begin{pmatrix} 1 & i \\ -i & -1 \end{pmatrix}$.` },
      { label: 'Hermitian', text: t`$(c|a\rangle\langle b|)^\dagger = c^*|b\rangle\langle a|$, so $(i|1\rangle\langle2|)^\dagger = -i|2\rangle\langle1|$, which is in $\hat Q$. In the matrix: $Q_{21} = -i = Q_{12}^*$. ✓` },
      { label: 'Eigenvalues', text: t`Trace 0 and determinant $\epsilon^2(-1 - (i)(-i)) = -2\epsilon^2$, so $\lambda^2 = 2\epsilon^2$: $\lambda_\pm = \pm\sqrt2\,\epsilon$.` },
      { label: 'Eigenvector', text: t`For $+\sqrt2\epsilon$: $(1 - \sqrt2)a + ib = 0$ gives $b = -i(\sqrt2 - 1)a$. Normalized, $|a|^2 = \dfrac{1}{1 + (\sqrt2 - 1)^2} = \dfrac{2 + \sqrt2}{4}$.` },
      { label: 'Probability', text: t`$P(+\sqrt2\epsilon) = |\langle q_+|1\rangle|^2 = |a|^2 = \dfrac{2 + \sqrt2}{4} = ${fmt((2 + Math.SQRT2) / 4, 4)}$, and $P(-\sqrt2\epsilon) = ${fmt((2 - Math.SQRT2) / 4, 4)}$.` },
      { label: 'Check', text: t`$\langle Q\rangle = \sqrt2\epsilon(${fmt((2 + Math.SQRT2) / 4, 4)} - ${fmt((2 - Math.SQRT2) / 4, 4)}) = \epsilon$, which is also $\langle1|\hat Q|1\rangle = Q_{11} = \epsilon$ read straight from the matrix. Spectral form: $\hat Q = \sqrt2\epsilon\,|q_+\rangle\langle q_+| - \sqrt2\epsilon\,|q_-\rangle\langle q_-|$.` },
    ],
    answer: t`$\mathsf Q = \epsilon\begin{pmatrix} 1 & i \\ -i & -1 \end{pmatrix}$, Hermitian, eigenvalues $\pm\sqrt2\,\epsilon$; from $|1\rangle$, $P(+\sqrt2\epsilon) = (2 + \sqrt2)/4 \approx ${fmt((2 + Math.SQRT2) / 4, 3)}$.`,
  },
  practice: [
    mcq({
      id: 'bra', difficulty: 1,
      prompt: t`What is the bra of $|\alpha\rangle = 2i|1\rangle - 3|2\rangle + (1 - i)|3\rangle$?`,
      visual: ampPic([[0, 2], [-3, 0], [1, -1]].map((z) => z.map((v) => r6(v / Math.sqrt(15)))), ['⟨1|α⟩', '⟨2|α⟩', '⟨3|α⟩'], t`The ket’s components (divided by $\sqrt{15}$ to fit), each drawn in its own complex plane.`),
      choices: [
        t`$-2i\langle1| - 3\langle2| + (1 + i)\langle3|$`,
        t`$2i\langle1| - 3\langle2| + (1 - i)\langle3|$`,
        t`$-2i\langle1| + 3\langle2| - (1 - i)\langle3|$`,
        t`$\tfrac{1}{\sqrt{15}}\big(2i\langle1| - 3\langle2| + (1 - i)\langle3|\big)$`,
      ],
      answer: 0,
      why: {
        1: t`The bra’s coefficients are the **complex conjugates** of the ket’s: $\langle\alpha| = \sum c_n^*\langle n|$.`,
        2: t`That negates every coefficient; conjugation flips only the sign of the imaginary parts.`,
        3: t`Normalizing is a separate step, and the coefficients still need conjugating.`,
      },
      hints: [t`$\langle\alpha| = |\alpha\rangle^\dagger$: transpose and complex-conjugate.`],
      teach: 'A bra carries the complex conjugates of its ket’s components, so that ⟨α|α⟩ = Σ|cₙ|² is real and positive.',
      explain: t`$\langle\alpha| = (2i)^*\langle1| + (-3)^*\langle2| + (1 - i)^*\langle3|$ $= -2i\langle1| - 3\langle2| + (1 + i)\langle3|$. Then $\langle\alpha|\alpha\rangle = 4 + 9 + 2 = 15$, real as it must be.`,
    }),
    num({
      id: 'transition', difficulty: 2,
      gen(r) {
        const pool = [[1, 0], [0, 1], [1, 1], [2, 0], [1, -1], [0, 2], [-1, 1], [0, -1]];
        let a, b, P;
        do {
          a = [r.pick(pool), r.pick(pool)]; b = [r.pick(pool), r.pick(pool)];
          const ab = cadd(cmul(conj(a[0]), b[0]), cmul(conj(a[1]), b[1]));
          const na = abs2(a[0]) + abs2(a[1]), nb = abs2(b[0]) + abs2(b[1]);
          P = na && nb ? abs2(ab) / (na * nb) : 0;
        } while (P < 0.05 || P > 0.95);
        const z = (c) => { const [re, im] = c; if (!im) return `${re}`; const ims = im === 1 ? 'i' : im === -1 ? '-i' : `${im}i`; return re ? `(${re}${im > 0 ? '+' : ''}${ims})` : ims; };
        const zt = (c) => { const q = z(c); return q === '1' ? '' : q === '-1' ? '-' : q; };
        const ket = (v) => t`${zt(v[0])}|{+}\rangle ${zt(v[1]).startsWith('-') ? '' : '+'} ${zt(v[1])}|{-}\rangle`;
        const noConj = abs2(cadd(cmul(a[0], b[0]), cmul(a[1], b[1]))) / ((abs2(a[0]) + abs2(a[1])) * (abs2(b[0]) + abs2(b[1])));
        return {
          prompt: t`A spin is prepared in the state proportional to $|\beta\rangle = ${ket(b)}$. A measurement asks whether it is in the state proportional to $|\alpha\rangle = ${ket(a)}$. With both normalized, the probability is $\dfrac{|\langle\alpha|\beta\rangle|^2}{\langle\alpha|\alpha\rangle\langle\beta|\beta\rangle}$. What is it?`,
          visual: ampPic([...a, ...b].map((c) => c.map((v) => r6(v / 2))), ['⟨+|α⟩', '⟨−|α⟩', '⟨+|β⟩', '⟨−|β⟩'], 'The unnormalized components of the two kets (halved to fit), each in its own complex plane.'),
          answer: P, tol: { rel: 0.005 },
          errors: [{ value: noConj, feedback: t`The bra $\langle\alpha|$ carries the complex conjugates of $|\alpha\rangle$’s components; you multiplied without conjugating.` }].filter((e) => Math.abs(e.value - P) > 0.01),
          hints: [t`$\langle\alpha|\beta\rangle = \alpha_+^*\beta_+ + \alpha_-^*\beta_-$.`, t`Divide $|\langle\alpha|\beta\rangle|^2$ by $\langle\alpha|\alpha\rangle = |\alpha_+|^2 + |\alpha_-|^2$ and by $\langle\beta|\beta\rangle$.`],
          teach: 'An inner product conjugates the bra’s components; the probability of finding one state in another is the squared overlap of the normalized kets.',
          explain: t`The overlap is $\langle\alpha|\beta\rangle = ${(() => { const ab = cadd(cmul(conj(a[0]), b[0]), cmul(conj(a[1]), b[1])); return `${ab[0]}${ab[1] >= 0 ? '+' : ''}${ab[1]}i`; })()}$, with $\langle\alpha|\alpha\rangle = ${abs2(a[0]) + abs2(a[1])}$ and $\langle\beta|\beta\rangle = ${abs2(b[0]) + abs2(b[1])}$, so $P = ${fmt(P, 4)}$.`,
        };
      },
    }),
    num({
      id: 'expect-outer', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, -1]);
        const s = r.pick([[1, 1, 1], [2, 1, 1], [1, 2, 1], [1, 1, 2], [0, 1, 2], [2, 1, 2], [1, 2, 2]]);
        const N2 = s.reduce((q, v) => q + v * v, 0), ans = (a * s[0] * s[0] + 2 * b * s[1] * s[2]) / N2;
        const bs = b === 1 ? '' : b === -1 ? '-' : `${b}`;
        return {
          prompt: t`An observable is $\hat Q = ${a === 1 ? '' : a}\,|1\rangle\langle1| + ${bs}\big(|2\rangle\langle3| + |3\rangle\langle2|\big)$ (in units of $\hbar$). A system is in $|\psi\rangle = \tfrac{1}{\sqrt{${N2}}}\big(${s[0] ? t`${s[0] === 1 ? '' : s[0]}|1\rangle + ` : ''}${s[1] === 1 ? '' : s[1]}|2\rangle + ${s[2] === 1 ? '' : s[2]}|3\rangle\big)$. What is $\langle Q\rangle$, in units of $\hbar$?`,
          visual: { type: 'graph', params: { x: [0, 4], y: [0, 1.1], aspect: 'wide', xlabel: 'component of |ψ⟩ along |1⟩, |2⟩, |3⟩', ylabel: 'amplitude', xticks: 0, yticks: 2, axesAt: 'edge', curves: s.map((v, k) => seg(k + 1, 0, k + 1, v / Math.sqrt(N2), ['gold', 'accent', 'violet'][k], 10)), points: s.map((v, k) => label(k + 1, v / Math.sqrt(N2), `⟨${k + 1}|ψ⟩`, ['gold', 'accent', 'violet'][k], 0, -14, 'center')) }, caption: 'The state’s (real) components in the basis the operator is written in.' },
          answer: ans, tol: { rel: 0.005, abs: 1e-6 },
          errors: [{ value: (a * s[0] * s[0] + b * s[1] * s[2]) / N2, feedback: t`Both $|2\rangle\langle3|$ and $|3\rangle\langle2|$ contribute: $\langle\psi|2\rangle\langle3|\psi\rangle + \langle\psi|3\rangle\langle2|\psi\rangle = 2c_2c_3$ for real components.` }, { value: a * s[0] * s[0] + 2 * b * s[1] * s[2], feedback: t`Include the normalization $1/${N2}$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Sandwich each outer product: $\langle\psi|m\rangle\langle n|\psi\rangle = c_m^*c_n$.`, t`$\langle Q\rangle = ${a}|c_1|^2 + ${b}\,(c_2^*c_3 + c_3^*c_2)$.`],
          teach: 'An outer product |m⟩⟨n| sandwiched between ⟨ψ| and |ψ⟩ gives cₘ*cₙ: expectation values are read off component by component.',
          explain: t`$\langle Q\rangle = \tfrac{1}{${N2}}\big(${a}\cdot${s[0] * s[0]} + ${b}\cdot2\cdot${s[1]}\cdot${s[2]}\big) = ${fmt(ans, 4)}\,\hbar$.`,
        };
      },
    }),
    mcq({
      id: 'outer-matrix', difficulty: 2,
      prompt: t`With $|\alpha\rangle = \begin{pmatrix} 1 \\ i \end{pmatrix}$ and $|\beta\rangle = \begin{pmatrix} 2 \\ 1 + i \end{pmatrix}$, what is the matrix of the operator $|\alpha\rangle\langle\beta|$?`,
      visual: ampPic([[1, 0], [0, 1], [2, 0], [1, 1]].map((z) => z.map((v) => r6(v / 2))), ['α₁', 'α₂', 'β₁', 'β₂'], 'The components of the two kets (halved to fit).'),
      choices: [
        t`$\begin{pmatrix} 2 & 1 - i \\ 2i & 1 + i \end{pmatrix}$`,
        t`$\begin{pmatrix} 2 & 1 + i \\ 2i & -1 + i \end{pmatrix}$`,
        t`$\begin{pmatrix} 2 & 2i \\ 1 - i & 1 + i \end{pmatrix}$`,
        t`$2 + (1 + i)i = 1 + i$, a number`,
      ],
      answer: 0,
      why: {
        1: t`The bra $\langle\beta|$ is the conjugate row $(2,\ 1 - i)$; you used $(2,\ 1 + i)$.`,
        2: t`That is the transpose. Row $m$, column $n$ is $\alpha_m\beta_n^*$.`,
        3: t`A number is $\langle\beta|\alpha\rangle$, bra first. Ket times bra — column times row — is a matrix.`,
      },
      hints: [t`$|\alpha\rangle\langle\beta|$ is a column times a row: entry $(m, n) = \alpha_m\beta_n^*$.`, t`$\langle\beta| = (2,\ 1 - i)$.`],
      teach: 'A ket times a bra is an operator: column times conjugate row, entry by entry αₘβₙ*.',
      explain: t`$\begin{pmatrix} 1 \\ i \end{pmatrix}(2,\ 1 - i) = \begin{pmatrix} 2 & 1 - i \\ 2i & i(1 - i) \end{pmatrix}$, and $i(1 - i) = 1 + i$. Acting on any $|\gamma\rangle$ it gives $|\alpha\rangle\langle\beta|\gamma\rangle$: always a multiple of $|\alpha\rangle$.`,
    }),
    mcq({
      id: 'insert-one', difficulty: 2,
      prompt: t`Insert the identity $\hat 1 = \int|x\rangle\langle x|\,dx$ into $\Phi(p) = \langle p|\psi\rangle$, with $\langle x|p\rangle = e^{ipx/\hbar}/\sqrt{2\pi\hbar}$. What do you get?`,
      choices: [
        t`$\Phi(p) = \dfrac{1}{\sqrt{2\pi\hbar}}\displaystyle\int e^{-ipx/\hbar}\,\psi(x)\,dx$`,
        t`$\Phi(p) = \dfrac{1}{\sqrt{2\pi\hbar}}\displaystyle\int e^{+ipx/\hbar}\,\psi(x)\,dx$`,
        t`$\Phi(p) = \displaystyle\int e^{-ipx/\hbar}\,\psi(x)\,dx$`,
        t`$\Phi(p) = \dfrac{1}{\sqrt{2\pi\hbar}}\displaystyle\int e^{-ipx/\hbar}\,\psi(x)\,dp$`,
      ],
      answer: 0,
      why: {
        1: t`$\langle p|x\rangle = \langle x|p\rangle^* = e^{-ipx/\hbar}/\sqrt{2\pi\hbar}$: swapping bra and ket conjugates.`,
        2: t`The $1/\sqrt{2\pi\hbar}$ belongs to $\langle p|x\rangle$; without it $\Phi$ is not normalized.`,
        3: t`The inserted identity sums over positions, so the integral is over $x$.`,
      },
      hints: [t`$\langle p|\psi\rangle = \int\langle p|x\rangle\langle x|\psi\rangle\,dx$.`, t`$\langle p|x\rangle = \langle x|p\rangle^*$ and $\langle x|\psi\rangle = \psi(x)$.`],
      teach: 'Inserting a complete set of states turns an abstract bracket into an integral (or a sum) over components.',
      explain: t`$\langle p|\psi\rangle = \int\langle p|x\rangle\langle x|\psi\rangle\,dx$ $= \tfrac{1}{\sqrt{2\pi\hbar}}\int e^{-ipx/\hbar}\psi(x)\,dx$: the Fourier transform of the last lesson, now a one-line consequence of $\hat 1 = \int|x\rangle\langle x|\,dx$.`,
    }),
    code({
      id: 'change-basis', difficulty: 3,
      prompt: t`Change of basis as matrix algebra. Put the kets of a new orthonormal basis in the **columns** of a matrix \`B\`; then any operator’s matrix in the new basis is $\mathsf B^\dagger\mathsf Q\mathsf B$, since $(\mathsf B^\dagger\mathsf Q\mathsf B)_{mn} = \langle f_m|\hat Q|f_n\rangle$. Write \`to_basis(Q, B)\`, build \`By\` from the $S_y$ eigenvectors $|{\pm y}\rangle = (1, \pm i)/\sqrt2$, and write \`projector_sum(B)\` returning $\sum_n|f_n\rangle\langle f_n|$. Spin matrices are in units of $\hbar$.`,
      starter: t`import numpy as np

Sx = 0.5 * np.array([[0, 1], [1, 0]], dtype=complex)
Sy = 0.5 * np.array([[0, -1j], [1j, 0]], dtype=complex)
Sz = 0.5 * np.array([[1, 0], [0, -1]], dtype=complex)

def to_basis(Q, B):
    pass

By = None          # columns: |+y>, |-y>

def projector_sum(B):
    pass

print(np.round(to_basis(Sy, By), 6))
`,
      answer: t`import numpy as np

Sx = 0.5 * np.array([[0, 1], [1, 0]], dtype=complex)
Sy = 0.5 * np.array([[0, -1j], [1j, 0]], dtype=complex)
Sz = 0.5 * np.array([[1, 0], [0, -1]], dtype=complex)

def to_basis(Q, B):
    return B.conj().T @ Q @ B

By = np.array([[1, 1], [1j, -1j]]) / np.sqrt(2)          # columns: |+y>, |-y>

def projector_sum(B):
    return sum(np.outer(B[:, n], B[:, n].conj()) for n in range(B.shape[1]))

print(np.round(to_basis(Sy, By), 6))`,
      tests: [
        { name: t`$S_y$ is diagonal in its own basis, $\mathrm{diag}(\tfrac12, -\tfrac12)$`, code: 'np.allclose(to_basis(Sy, By), np.diag([0.5, -0.5]))' },
        { name: t`the projectors onto $|{\pm y}\rangle$ add up to the identity`, code: 'np.allclose(projector_sum(By), np.eye(2))' },
        { name: t`$S_z$ in the $y$ basis is still Hermitian with eigenvalues $\pm\tfrac12$`, code: 'np.allclose(to_basis(Sz, By), to_basis(Sz, By).conj().T) and np.allclose(np.sort(np.linalg.eigvalsh(to_basis(Sz, By))), [-0.5, 0.5])' },
        { name: t`the commutator $[S_z, S_x] = iS_y$ holds in the new basis too`, code: 'np.allclose(to_basis(Sz, By) @ to_basis(Sx, By) - to_basis(Sx, By) @ to_basis(Sz, By), 1j * to_basis(Sy, By))' },
        { name: 'works for a random unitary basis in 4 dimensions', code: 'np.allclose(projector_sum(np.linalg.qr(np.arange(16).reshape(4, 4) + 1j * np.eye(4) + np.eye(4) * 5)[0]), np.eye(4))' },
      ],
      hints: ['`B.conj().T` is B†. Matrix products use `@`.', '`np.outer(u, v.conj())` is the matrix |u⟩⟨v|; sum it over the columns of B.'],
      teach: 'A change of basis is B†QB with the new kets as B’s columns; eigenvalues, Hermiticity and commutators survive it unchanged.',
      explain: t`In its own eigenbasis $S_y$ is diagonal — that is what diagonalizing means. $S_z$ becomes off-diagonal there, and the commutation relations are unchanged, because $\mathsf B$ is unitary: $\mathsf B^\dagger\mathsf B = \mathsf 1$ lets you insert it between any two factors.`,
    }),
    num({
      id: 'plane-prob', difficulty: 2,
      gen(r) {
        const [th, be] = r.pick([[35, 10], [50, 10], [70, 25], [80, 25], [60, 40], [80, 55], [20, 55], [35, 70], [10, 40]]);
        const ans = Math.sin((th - be) * D) ** 2;
        return {
          prompt: t`In a real two-dimensional state space, $|\psi\rangle = \cos ${th}^\circ|x\rangle + \sin ${th}^\circ|y\rangle$. A measurement is made in the basis turned by $${be}^\circ$: $|e_1\rangle = \cos ${be}^\circ|x\rangle + \sin ${be}^\circ|y\rangle$, $|e_2\rangle = -\sin ${be}^\circ|x\rangle + \cos ${be}^\circ|y\rangle$. What is the probability of the result belonging to $|e_2\rangle$?`,
          visual: planePic({ th, be, proj: false, caption: 'The state (gold) and the measurement basis (blue). Not drawn: the projections.' }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.cos((th - be) * D) ** 2, feedback: t`That is $|\langle e_1|\psi\rangle|^2$; the question asks about $|e_2\rangle$.` }, { value: Math.sin((th - be) * D), feedback: 'Square the amplitude to get the probability.' }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\langle e_2|\psi\rangle = -\sin\beta\cos\theta + \cos\beta\sin\theta$.`, t`That is $\sin(\theta - \beta)$; square it.`],
          teach: 'The probability of a basis result is the squared component along that basis ket, whichever basis the state was written in.',
          explain: t`$\langle e_2|\psi\rangle = \sin(${th}^\circ - ${be}^\circ) = ${fmt(Math.sin((th - be) * D), 4)}$, so $P = ${fmt(ans, 4)}$; the two probabilities add to 1 because $|e_1\rangle\langle e_1| + |e_2\rangle\langle e_2| = \hat 1$.`,
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-projector', difficulty: 2,
      prompt: t`For a unit ket $|e\rangle$, what are the eigenvalues of the projector $\hat P = |e\rangle\langle e|$, on a space of three or more dimensions?`,
      visual: planePic({ th: 55, be: 20, caption: t`$\hat P_1 = |e_1\rangle\langle e_1|$ sends $|\psi\rangle$ to the violet arrow along $|e_1\rangle$. Applying it twice changes nothing more.` }),
      choices: [
        t`$1$ (once, for $|e\rangle$) and $0$ (for every ket orthogonal to $|e\rangle$)`,
        t`Only $1$: it is a kind of identity`,
        t`$\pm1$, like a reflection`,
        t`$\langle e|e\rangle$ and its complex conjugate`,
      ],
      answer: 0,
      why: {
        1: t`It kills every ket orthogonal to $|e\rangle$: those are eigenvectors with eigenvalue 0.`,
        2: t`A reflection squares to the identity; a projector squares to itself, $\hat P^2 = |e\rangle\langle e|e\rangle\langle e| = \hat P$, so $\lambda^2 = \lambda$.`,
        3: t`$\langle e|e\rangle = 1$ is a number, not a list of eigenvalues; and $\hat P$ is Hermitian, so its eigenvalues are real.`,
      },
      hints: [t`Compute $\hat P^2$. What does $\lambda^2 = \lambda$ allow?`],
      teach: 'A projector satisfies P² = P, so its eigenvalues are 1 on the space it keeps and 0 on the space it discards.',
      explain: t`$\hat P|e\rangle = |e\rangle$ and $\hat P|f\rangle = 0$ for $\langle e|f\rangle = 0$. Measuring “is the system in $|e\rangle$?” is measuring $\hat P$: result 1 with probability $\langle\psi|\hat P|\psi\rangle = |\langle e|\psi\rangle|^2$.`,
    }),
    mcq({
      id: 'cp-dagger', difficulty: 2,
      prompt: t`What is the Hermitian conjugate of the operator $c\,|\alpha\rangle\langle\beta|$, where $c$ is a complex number?`,
      choices: [t`$c^*|\beta\rangle\langle\alpha|$`, t`$c^*|\alpha\rangle\langle\beta|$`, t`$c\,|\beta\rangle\langle\alpha|$`, t`$c^*\langle\beta|\alpha\rangle$`],
      answer: 0,
      why: {
        1: t`Conjugating the number is not enough: the ket and bra swap roles too.`,
        2: t`The coefficient must be conjugated as well, or $i|1\rangle\langle2|$ would equal its own adjoint’s negative.`,
        3: t`That is a number; the adjoint of an operator is an operator.`,
      },
      hints: [t`Check with matrices: $(|\alpha\rangle\langle\beta|)_{mn} = \alpha_m\beta_n^*$. What is the conjugate transpose?`],
      teach: 'Taking the adjoint reverses the order of everything and conjugates every number: (c|α⟩⟨β|)† = c*|β⟩⟨α|.',
      explain: t`$\big((c\,|\alpha\rangle\langle\beta|)^\dagger\big)_{mn} = \big(c\,\alpha_n\beta_m^*\big)^*$ $= c^*\beta_m\alpha_n^*$, the matrix of $c^*|\beta\rangle\langle\alpha|$. That is why $\hat Q$ in the worked example needed $-i|2\rangle\langle1|$ alongside $i|1\rangle\langle2|$.`,
    }),
    num({
      id: 'cp-qkd', difficulty: 2, transfer: true,
      gen(r) {
        const d = r.pick([2, 3, 4, 5, 6]);
        const ans = 100 * Math.sin(d * D) ** 2;
        return {
          prompt: t`In 2017 the Micius satellite distributed quantum keys to ground stations by sending single photons in polarization states such as $|H\rangle$ and $|V\rangle$ (one orthonormal basis) or $|D\rangle$ and $|A\rangle$ (another, at $45^\circ$). If the receiving telescope’s polarization analyser is turned by $${d}^\circ$ from the satellite’s frame — the satellite rolls as it passes — a photon sent as $|H\rangle$ is measured in the basis $|H'\rangle = \cos ${d}^\circ|H\rangle + \sin ${d}^\circ|V\rangle$, $|V'\rangle = -\sin ${d}^\circ|H\rangle + \cos ${d}^\circ|V\rangle$. What percentage of such photons give the wrong bit, $V'$?`,
          visual: planePic({ th: 0, be: 18, proj: false, names: ['H′', 'V′'], caption: 'The photon’s polarization state |H⟩ (gold) and the receiver’s turned basis (blue), angle exaggerated for clarity.' }),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 * Math.sin(d * D), feedback: 'The error probability is the squared amplitude, sin²δ.' }, { value: 100 * Math.cos(d * D) ** 2, feedback: t`That is the probability of the right bit, $|\langle H'|H\rangle|^2$.` }],
          hints: [t`$\langle V'|H\rangle = -\sin\delta$.`, t`The error rate is $\sin^2\delta$ — express it as a percentage.`],
          teach: 'A misaligned measurement basis is a change of basis: the error rate is the squared overlap with the wrong basis ket.',
          explain: t`$|\langle V'|H\rangle|^2 = \sin^2 ${d}^\circ = ${fmt(ans, 3)}$%. A few-degree misalignment costs a few tenths of a percent of the quantum bit error rate, which security proofs count against the eavesdropper — so Micius’s ground stations actively tracked and compensated the polarization rotation.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §3.6', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Liao et al., “Satellite-to-ground quantum key distribution”, Nature 549, 43 (2017)', url: 'https://doi.org/10.1038/nature23655' },
  ],
});
