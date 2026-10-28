// Complex inner products and Hermitian matrices: why the inner product of
// complex vectors conjugates one factor, and why Hermitian matrices (Aᴴ = A)
// have real eigenvalues and orthogonal eigenvectors — the observables of
// quantum mechanics, worked through the Pauli matrices.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { cx, cmul, conj, abs2, cabs, cexp, inner, naive, cnorm, cmatvec, cTeX, ctupleTeX, cvecTeX, cmatTeX, phasors, bloch, blochOf } from './_cplx.js';

const t = String.raw;
const H = t`^{\mathsf H}`;
const DEG = Math.PI / 180;
const S2 = Math.SQRT1_2;
const PAIRS = [[0.6, 0.8], [0.8, 0.6], [5 / 13, 12 / 13], [12 / 13, 5 / 13], [0.28, 0.96], [0.96, 0.28]];
const amp = (x) => (Math.abs(x - 5 / 13) < 1e-9 ? t`\tfrac{5}{13}` : Math.abs(x - 12 / 13) < 1e-9 ? t`\tfrac{12}{13}` : nice(x));

// a random 2×2 Hermitian matrix [[a, b − ci], [b + ci, d]] with integer entries
function herm(r) {
  const a = r.int(-3, 5), d = r.intExcept(-3, 5, [a]), b = r.intExcept(-3, 3, [0]), c = r.intExcept(-3, 3, [0]);
  const m = (a + d) / 2, del = (a - d) / 2, S = del * del + b * b + c * c;
  return { a, b, c, d, m, del, S, A: [[cx(a), cx(b, -c)], [cx(b, c), cx(d)]], hi: m + Math.sqrt(S), lo: m - Math.sqrt(S) };
}

// det(A − λI) for a Hermitian 2×2, with the diagonal entries marked; x-axis numbers hidden
function charPic({ a, d, m, S }, caption) {
  const w = 1.7 * Math.sqrt(S) + 1;
  return {
    type: 'graph',
    params: {
      x: [m - w, m + w], y: [-1.3 * S - 0.6, 1.4 * S + 1], aspect: 'wide', xlabel: 'λ', ylabel: 'p(λ)', xticks: 0,
      curves: [{ fn: `(${a} - x)*(${d} - x) - ${S - ((a - d) / 2) ** 2}`, color: 'accent', width: 2.4, label: 'p(λ) = det(A − λI)', labelAt: m + 0.62 * w, labelDx: 8, labelDy: 4 }],
      vlines: [{ x: a, label: 'a₁₁', color: 'ink3' }, { x: d, label: 'a₂₂', color: 'ink3' }],
    },
    caption: caption || 'The characteristic polynomial of this A, with its diagonal entries marked (axis numbers hidden). It dips to a negative minimum, so it always crosses zero twice: two real eigenvalues.',
  };
}

export default lesson({
  id: 'math2270.LA-13.1',
  title: 'Complex inner products and Hermitian matrices',
  minutes: 13, difficulty: 3,
  intro: t`Quantum states are vectors with **complex** components, and the dot product of LA-10.1 breaks on them: for the nonzero vector $(1, i)$ it gives $1\cdot1 + i\cdot i = 1 + i^2 = 0$. The cure is to **conjugate the first factor**:
$$\langle\mathbf u, \mathbf v\rangle = \mathbf u${H}\mathbf v = \bar u_1 v_1 + \bar u_2 v_2 + \dots + \bar u_n v_n, \qquad \|\mathbf v\|^2 = \langle\mathbf v, \mathbf v\rangle = |v_1|^2 + \dots + |v_n|^2$$
Since $\bar z z = |z|^2$, every length is real and positive again. The price: $\langle\mathbf v, \mathbf u\rangle = \overline{\langle\mathbf u, \mathbf v\rangle}$, so the order matters. (This is the physics convention; many mathematics books conjugate the second factor instead.) The complex partner of a symmetric matrix is a **Hermitian** matrix, $A${H} = A$, and the spectral theorem of [LA-11.1](#/lesson/math2270.LA-11.1) carries over: **its eigenvalues are real and its eigenvectors for different eigenvalues are orthogonal.** In quantum mechanics every measurable quantity is a Hermitian matrix — an *observable* — its eigenvalues are the possible results, and $|\langle\mathbf e_k, \psi\rangle|^2$ is the probability of getting result $k$.`,
  symbols: [
    { tex: t`\mathbf u, \mathbf v`, text: t`vectors in $\mathbb C^n$: columns of complex numbers` },
    { tex: t`\bar z`, text: t`the complex conjugate of $z = a + bi$: $\bar z = a - bi$, its mirror image in the real axis; $\bar z z = a^2 + b^2 = |z|^2$` },
    { tex: t`\mathbf u${H}`, text: t`the conjugate transpose: transpose, then conjugate every entry ($\mathbf u^\dagger$ in physics books)` },
    { tex: t`\langle\mathbf u, \mathbf v\rangle`, text: t`the complex inner product, a complex number; linear in $\mathbf v$, conjugate-linear in $\mathbf u$` },
    { tex: t`\|\mathbf v\|`, text: t`the length of $\mathbf v$: $\sqrt{\langle\mathbf v, \mathbf v\rangle}$, always real and $\ge 0$` },
    { tex: t`A${H} = A`, text: t`Hermitian: $a_{ji} = \overline{a_{ij}}$ — the diagonal is real and each entry below it is the conjugate of its mirror above` },
    { tex: t`\psi,\ \mathbf e_k`, text: t`a quantum state (a unit vector) and the unit eigenvector of an observable for its $k$-th result` },
  ],
  why: 'Quantum mechanics is linear algebra over the complex numbers: states are unit vectors, measurable quantities are Hermitian matrices, and every probability is the squared length of an inner product.',
  visual: {
    type: 'graph',
    title: 'Why the conjugate is there',
    lead: t`A vector $\mathbf z = (z_1, z_2)$ in $\mathbb C^2$: the two left panels are the complex planes of its components (dashed: their conjugates). The right panel adds products tip to tail. Blue and orange are the plain squares $z_1^2$ and $z_2^2$; green are $\bar z_1 z_1 = |z_1|^2$ and $\bar z_2 z_2 = |z_2|^2$, which always lie on the positive real axis.`,
    tasks: [
      'Set r₁ = r₂ = 1, φ₁ = 0° and φ₂ = 90°, so z = (1, i). The plain squares 1 and −1 cancel: without the conjugate, this nonzero vector would have length 0.',
      'Turn either phase: the green total |z₁|² + |z₂|² never moves. The conjugate removes each component’s phase.',
      'Turn both phases by the same angle (an overall phase): the green total stays put while the blue–orange sum swings round — it is not even a real number.',
    ],
    params: {
      x: [-1.45, 8.75], y: [-2.55, 2.55], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [
        { key: 'r1', label: t`$|z_1|$`, min: 0, max: 1, step: 0.05, value: 1, explain: t`The modulus of the first component.` },
        { key: 'p1', label: t`phase of $z_1$`, min: 0, max: 360, step: 5, value: 0, unit: t`^\circ`, explain: t`Its angle in the complex plane: $z_1 = |z_1|e^{i\varphi_1}$.` },
        { key: 'r2', label: t`$|z_2|$`, min: 0, max: 1, step: 0.05, value: 1, explain: t`The modulus of the second component.` },
        { key: 'p2', label: t`phase of $z_2$`, min: 0, max: 360, step: 5, value: 60, unit: t`^\circ`, explain: t`Its angle: $z_2 = |z_2|e^{i\varphi_2}$.` },
      ],
      curves: [
        ...[0, 2.75].flatMap((c) => [{ param: [`${c} + t`, '0'], t: [-1.25, 1.25], color: 'ink4', width: 1 }, { param: [`${c}`, 't'], t: [-1.25, 1.25], color: 'ink4', width: 1 }, { param: [`${c} + cos(t)`, 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: [2, 4] }]),
        { param: ['6.55 + t', '0'], t: [-2.1, 2.1], color: 'ink4', width: 1 }, { param: ['6.55', 't'], t: [-2.1, 2.1], color: 'ink4', width: 1 },
      ],
      arrows: [
        { from: [0, 0], to: ['r1*cos(p1*pi/180)', 'r1*sin(p1*pi/180)'], color: 'gold', width: 2.6, label: 'z₁' },
        { from: [0, 0], to: ['r1*cos(p1*pi/180)', '-r1*sin(p1*pi/180)'], color: 'ink3', width: 1.6, dash: [4, 4], label: 'conj z₁' },
        { from: [2.75, 0], to: ['2.75 + r2*cos(p2*pi/180)', 'r2*sin(p2*pi/180)'], color: 'gold', width: 2.6, label: 'z₂' },
        { from: [2.75, 0], to: ['2.75 + r2*cos(p2*pi/180)', '-r2*sin(p2*pi/180)'], color: 'ink3', width: 1.6, dash: [4, 4], label: 'conj z₂' },
        { from: [6.55, 0], to: ['6.55 + r1^2*cos(2*p1*pi/180)', 'r1^2*sin(2*p1*pi/180)'], color: 'accent', width: 2.4, label: 'z₁²' },
        { from: ['6.55 + r1^2*cos(2*p1*pi/180)', 'r1^2*sin(2*p1*pi/180)'], to: ['6.55 + r1^2*cos(2*p1*pi/180) + r2^2*cos(2*p2*pi/180)', 'r1^2*sin(2*p1*pi/180) + r2^2*sin(2*p2*pi/180)'], color: 'warn', width: 2.4, label: 'z₂²' },
        { from: [6.55, 0], to: ['6.55 + r1^2', 0], color: 'good', width: 4 },
        { from: ['6.55 + r1^2', 0], to: ['6.55 + r1^2 + r2^2', 0], color: 'good', width: 4, label: '|z₁|² + |z₂|²', labelDy: 18 },
      ],
      points: [
        { x: -1.25, y: 1.45, r: 0, label: 'component z₁', color: 'ink2' },
        { x: 1.5, y: 1.45, r: 0, label: 'component z₂', color: 'ink2' },
        { x: 4.6, y: 2.25, r: 0, label: 'products, tip to tail', color: 'ink2' },
      ],
      readouts: [
        { label: t`$\operatorname{Re}(z_1^2 + z_2^2)$`, expr: 'r1^2*cos(2*p1*pi/180) + r2^2*cos(2*p2*pi/180)', digits: 3 },
        { label: t`$\operatorname{Im}(z_1^2 + z_2^2)$`, expr: 'r1^2*sin(2*p1*pi/180) + r2^2*sin(2*p2*pi/180)', digits: 3 },
        { label: t`$\|\mathbf z\|^2 = |z_1|^2 + |z_2|^2$`, expr: 'r1^2 + r2^2', digits: 3 },
      ],
    },
    caption: 'Left: the components of z, each in its own complex plane (dotted circles have radius 1). Right: squares added tip to tail, without conjugation (blue, orange) and with it (green). All drawn to scale.',
  },
  example: {
    prompt: t`The Pauli matrix $\sigma_y = ${cmatTeX([[cx(0), cx(0, -1)], [cx(0, 1), cx(0)]])}$ measures an electron’s spin along $y$ (in units of $\hbar/2$). Check that it is Hermitian, find its eigenvalues and unit eigenvectors, check that the eigenvectors are orthogonal, and find the probability that an electron prepared spin-up along $z$, $\psi = (1, 0)$, is found spin-up along $y$.`,
    visual: bloch({ state: [0, 0, 1], marks: ['y'], caption: t`The Bloch sphere: each spin state (up to an overall phase) is a point. The eigenvectors of $\sigma_y$ sit at ±y and ψ = (1, 0) at the top. Orthogonal states are opposite ends of a diameter — a picture of the states, not of the vectors in ℂ². Drag to rotate.` }),
    steps: [
      { label: 'Hermitian?', text: t`Transpose: $${cmatTeX([[cx(0), cx(0, 1)], [cx(0, -1), cx(0)]])}$; conjugate every entry: $${cmatTeX([[cx(0), cx(0, -1)], [cx(0, 1), cx(0)]])} = \sigma_y$. ✓ It is **not** symmetric ($-i \ne i$) — conjugation is what makes it work.` },
      { label: 'Eigenvalues', text: t`$\det(\sigma_y - \lambda I) = (-\lambda)(-\lambda) - (-i)(i) = \lambda^2 + i^2 = \lambda^2 - 1$, so $\lambda = \pm1$. Real, as promised: a spin measurement along $y$ gives $\pm\hbar/2$ and nothing else.` },
      { label: 'Eigenvectors', text: t`$\lambda = 1$: the first row of $\sigma_y - I$ says $-v_1 - iv_2 = 0$, so $v_1 = -iv_2$; take $v_2 = i$: $\mathbf e_+ = \tfrac{1}{\sqrt2}(1, i)$. Check: $\sigma_y(1, i) = (-i\cdot i,\ i\cdot1) = (1, i)$. ✓ Likewise $\lambda = -1$ gives $\mathbf e_- = \tfrac{1}{\sqrt2}(1, -i)$.` },
      { label: 'Orthogonal', text: t`$\langle(1, i), (1, -i)\rangle = \bar1\cdot1 + \bar i\cdot(-i) = 1 + (-i)(-i) = 1 + i^2 = 0$. ✓ Without the conjugate you would get $1 + i(-i) = 2$ and conclude, wrongly, that they are far from perpendicular.` },
      { label: 'Probability', text: t`$\langle\mathbf e_+, \psi\rangle = \tfrac{1}{\sqrt2}\big(\bar1\cdot1 + \bar i\cdot0\big) = \tfrac{1}{\sqrt2}$, so $P(+) = \tfrac12$; likewise $P(-) = \tfrac12$. Sense check: the two add to $1 = \|\psi\|^2$, because $\mathbf e_\pm$ are an orthonormal basis.` },
    ],
    answer: t`$\sigma_y${H} = \sigma_y$; eigenvalues $\pm1$ with $\mathbf e_\pm = \tfrac{1}{\sqrt2}(1, \pm i)$, orthogonal under the complex inner product; spin-up along $y$ with probability $\tfrac12$.`,
  },
  practice: [
    num({
      id: 'norm', difficulty: 1,
      gen(r) {
        const z = [cx(r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0])), cx(r.int(-4, 4), r.intExcept(-4, 4, [0]))];
        const ans = cnorm(z), nv = naive(z, z)[0], drop = Math.hypot(z[0][0], z[1][0]);
        const errors = [];
        if (nv > 0 && Math.abs(Math.sqrt(nv) - ans) > 0.01 * ans) errors.push({ value: Math.sqrt(nv), feedback: t`That is $\sqrt{z_1^2 + z_2^2}$ without conjugating: $(a + bi)^2 = a^2 - b^2 + 2abi$ subtracts the imaginary parts. Use $|z_k|^2 = a^2 + b^2$.` });
        if (drop > 0 && Math.abs(drop - ans) > 0.01 * ans) errors.push({ value: drop, feedback: 'That uses only the real parts. The imaginary parts count too: |a + bi|² = a² + b².' });
        return {
          prompt: t`Find the length $\|\mathbf z\|$ of $\mathbf z = ${ctupleTeX(z)}$ in $\mathbb C^2$.`,
          answer: ans, tol: { rel: 0.004 }, errors,
          hints: [t`$\|\mathbf z\|^2 = |z_1|^2 + |z_2|^2$ and $|a + bi|^2 = a^2 + b^2$.`, t`$|z_1|^2 = ${abs2(z[0])}$ and $|z_2|^2 = ${abs2(z[1])}$.`],
          teach: t`The length of a complex vector adds the squared moduli of its components: $\|\mathbf z\|^2 = \sum|z_k|^2$.`,
          explain: t`$\|\mathbf z\|^2 = ${abs2(z[0])} + ${abs2(z[1])} = ${abs2(z[0]) + abs2(z[1])}$, so $\|\mathbf z\| = ${nice(ans)}$. Each $|z_k|^2 = \bar z_k z_k$ is the squared length of that component’s arrow in its complex plane.`,
          visual: phasors([{ name: 'z', v: z, color: 'gold' }], { caption: 'Each component of z as an arrow in its own complex plane. The squared length of z is the sum of the squared lengths of these arrows.' }),
        };
      },
    }),
    num({
      id: 'inner', difficulty: 2,
      gen(r) {
        let u, v, ip, nv;
        for (let k = 0; k < 200; k++) {
          u = [cx(r.int(-3, 3), r.intExcept(-3, 3, [0])), cx(r.intExcept(-3, 3, [0]), r.int(-3, 3))];
          v = [cx(r.intExcept(-3, 3, [0]), r.int(-3, 3)), cx(r.int(-3, 3), r.intExcept(-3, 3, [0]))];
          ip = inner(u, v); nv = naive(u, v);
          if (Math.abs(ip[0]) > 0.5 && Math.abs(ip[1]) > 0.5 && Math.abs(nv[0] - ip[0]) > 0.5 && Math.abs(nv[1] - ip[1]) > 0.5 && Math.abs(nv[1] + ip[1]) > 0.5) break;
        }
        const part = r.int(0, 1), name = part ? t`\operatorname{Im}` : t`\operatorname{Re}`, ans = ip[part];
        const bu = u.map(conj);
        return {
          prompt: t`For $\mathbf u = ${ctupleTeX(u)}$ and $\mathbf v = ${ctupleTeX(v)}$, find $${name}\,\langle\mathbf u, \mathbf v\rangle$, with $\langle\mathbf u, \mathbf v\rangle = \bar u_1 v_1 + \bar u_2 v_2$.`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: nv[part], feedback: t`That is $u_1v_1 + u_2v_2$ with no conjugate. Conjugate the entries of $\mathbf u$ first: $\bar u_1 = ${cTeX(bu[0])}$, $\bar u_2 = ${cTeX(bu[1])}$.` }],
          hints: [t`Conjugate $\mathbf u$: $\bar{\mathbf u} = ${ctupleTeX(bu)}$.`, t`Multiply out $(${cTeX(bu[0])})(${cTeX(v[0])}) + (${cTeX(bu[1])})(${cTeX(v[1])})$ using $i^2 = -1$.`],
          teach: 'The complex inner product conjugates the first vector’s entries, then multiplies and adds as usual.',
          explain: t`$(${cTeX(bu[0])})(${cTeX(v[0])}) = ${cTeX(cmul(bu[0], v[0]))}$ and $(${cTeX(bu[1])})(${cTeX(v[1])}) = ${cTeX(cmul(bu[1], v[1]))}$, so $\langle\mathbf u, \mathbf v\rangle = ${cTeX(ip)}$ and the ${part ? 'imaginary' : 'real'} part is $${ans}$. Swapping the order gives the conjugate, $\langle\mathbf v, \mathbf u\rangle = ${cTeX(conj(ip))}$.`,
          visual: phasors([{ name: 'u', v: u, color: 'accent' }, { name: 'v', v: v, color: 'warn' }], { caption: 'The components of u (blue) and v (orange), each component in its own complex plane.' }),
        };
      },
    }),
    mcq({
      id: 'which-hermitian', difficulty: 1,
      prompt: t`Which matrix is Hermitian?`,
      choices: [
        t`$${cmatTeX([[cx(2), cx(1, -3)], [cx(1, 3), cx(-5)]])}$`,
        t`$${cmatTeX([[cx(2), cx(1, 3)], [cx(1, 3), cx(-5)]])}$`,
        t`$${cmatTeX([[cx(2, 1), cx(1, -3)], [cx(1, 3), cx(-5)]])}$`,
        t`$${cmatTeX([[cx(2), cx(1, -3)], [cx(-1, -3), cx(-5)]])}$`,
      ],
      answer: 0,
      why: {
        1: t`Symmetric, but not Hermitian: the entry below the diagonal must be the **conjugate** of the one above, $\overline{1 + 3i} = 1 - 3i$.`,
        2: t`A Hermitian matrix has a real diagonal, since $a_{11} = \overline{a_{11}}$. Here $a_{11} = 2 + i$.`,
        3: t`$-1 - 3i$ is minus the conjugate of $1 - 3i$: that pattern, $A${H} = -A$ off the diagonal, belongs to skew-Hermitian matrices.`,
      },
      hints: [t`Hermitian means $a_{ji} = \overline{a_{ij}}$: reflect across the diagonal, then conjugate.`],
      teach: 'A Hermitian matrix has a real diagonal, and each entry below the diagonal is the complex conjugate of its mirror image above.',
      explain: t`For the first matrix $a_{21} = 1 + 3i = \overline{1 - 3i} = \overline{a_{12}}$ and the diagonal $2, -5$ is real, so $A${H} = A$.`,
    }),
    num({
      id: 'eig-herm', difficulty: 2,
      gen(r) {
        const h = herm(r), want = r.int(0, 1), ans = want ? h.hi : h.lo;
        const nS = h.del * h.del + h.b * h.b - h.c * h.c, errors = [];
        if (nS >= 0) { const w = want ? h.m + Math.sqrt(nS) : h.m - Math.sqrt(nS); if (Math.abs(w - ans) > 0.02) errors.push({ value: w, feedback: t`You used $a_{12}a_{21}$ as if it were $(${h.b} + ${Math.abs(h.c)}i)^2$. For a Hermitian matrix $a_{12}a_{21} = \overline{a_{21}}a_{21} = |a_{21}|^2 = ${h.b * h.b + h.c * h.c}$.` }); }
        const naiveDiag = want ? Math.max(h.a, h.d) : Math.min(h.a, h.d);
        if (Math.abs(naiveDiag - ans) > 0.02) errors.push({ value: naiveDiag, feedback: 'That is a diagonal entry. The off-diagonal entries push the eigenvalues apart: they lie outside the diagonal entries.' });
        return {
          prompt: t`Find the ${want ? 'larger' : 'smaller'} eigenvalue of the Hermitian matrix $A = ${cmatTeX(h.A)}$.`,
          answer: ans, tol: { rel: 0.003, abs: 0.01 }, errors,
          hints: [t`$\det(A - \lambda I) = (${h.a} - \lambda)(${h.d} - \lambda) - a_{12}a_{21}$, and $a_{12}a_{21} = (${cTeX(h.A[0][1])})(${cTeX(h.A[1][0])}) = ${h.b * h.b + h.c * h.c}$.`, t`So $\lambda = \tfrac{${h.a + h.d}}{2} \pm \sqrt{\big(\tfrac{${h.a - h.d}}{2}\big)^2 + ${h.b * h.b + h.c * h.c}}$.`],
          teach: t`For a $2\times2$ Hermitian matrix, $\lambda = m \pm \sqrt{\delta^2 + |a_{12}|^2}$ with $m$ the mean and $\delta$ half the difference of the diagonal entries — real, because the square root is of a sum of squares.`,
          explain: t`$a_{12}a_{21} = |a_{12}|^2 = ${h.b * h.b + h.c * h.c}$, so $\lambda = ${nice(h.m)} \pm \sqrt{${nice(h.del * h.del)} + ${h.b * h.b + h.c * h.c}} = ${nice(h.m)} \pm ${nice(Math.sqrt(h.S))}$: $\lambda = ${nice(h.hi)}$ or $${nice(h.lo)}$. Both real, whatever the entries — the quantity under the root can never be negative.`,
          visual: charPic(h),
        };
      },
    }),
    num({
      id: 'phase-matters', difficulty: 3,
      gen(r) {
        const [p, q] = r.pick(PAIRS), phi = r.pick([0, 60, 90, 120, 180, 240, 300]);
        const psi = [cx(p), cmul(cx(q), cexp(phi * DEG))];
        const P = (1 + 2 * p * q * Math.cos(phi * DEG)) / 2, noPhase = (1 + 2 * p * q) / 2;
        const errors = [{ value: Math.sqrt(P), feedback: t`That is the modulus of the amplitude $\langle\mathbf e_{+x}, \psi\rangle$. The probability is its square.` }];
        if (Math.abs(noPhase - P) > 0.005) errors.push({ value: noPhase, feedback: t`That ignores the phase $e^{i${phi}^\circ}$ — as if $\psi$ were $(${amp(p)}, ${amp(q)})$. The phase changes how the two components add.` });
        return {
          prompt: t`A spin is in the state $\psi = \big(${amp(p)},\ ${amp(q)}\,e^{i\,${phi}^\circ}\big)$ (a unit vector). Spin-up along $x$ is $\mathbf e_{+x} = \tfrac{1}{\sqrt2}(1, 1)$, the eigenvector of $\sigma_x = ${cmatTeX([[cx(0), cx(1)], [cx(1), cx(0)]])}$ for $+1$. Find the probability $|\langle\mathbf e_{+x}, \psi\rangle|^2$ of measuring spin-up along $x$.`,
          answer: P, tol: { rel: 0.005, abs: 0.002 }, errors: errors.filter((e) => Math.abs(e.value - P) > 0.004),
          hints: [t`$\langle\mathbf e_{+x}, \psi\rangle = \tfrac{1}{\sqrt2}\big(${amp(p)} + ${amp(q)}\,e^{i\,${phi}^\circ}\big)$ (the entries of $\mathbf e_{+x}$ are real, so conjugating them changes nothing).`, t`$|a + b e^{i\varphi}|^2 = a^2 + b^2 + 2ab\cos\varphi$ for real $a, b$.`],
          teach: 'The relative phase between components is physical: it changes the probabilities of measurements along other axes.',
          explain: t`$|\langle\mathbf e_{+x}, \psi\rangle|^2 = \tfrac12\Big(\big(${amp(p)}\big)^2 + \big(${amp(q)}\big)^2 + 2\cdot${amp(p)}\cdot${amp(q)}\cos ${phi}^\circ\Big) = ${nice(P)}$. A measurement along $z$ would give $${nice(p * p)}$ and $${nice(q * q)}$ whatever the phase; along $x$ the phase decides.`,
          visual: bloch({ state: blochOf(psi), marks: ['z', 'x'], caption: 'The state ψ on the Bloch sphere, with spin-up and spin-down along z and along x marked. Its phase sets how far it turns round the z-axis. Drag to rotate.' }),
        };
      },
    }),
    mcq({
      id: 'why-conj', difficulty: 1,
      prompt: t`Why does the complex inner product conjugate one of its factors?`,
      choices: [
        t`So that $\langle\mathbf v, \mathbf v\rangle = \sum|v_k|^2$ is real and positive for every nonzero $\mathbf v$`,
        t`So that it is symmetric: $\langle\mathbf u, \mathbf v\rangle = \langle\mathbf v, \mathbf u\rangle$`,
        t`So that it is linear in both slots`,
        t`Because complex numbers cannot be multiplied without conjugating one of them`,
      ],
      answer: 0,
      why: {
        1: t`It is not symmetric: swapping the vectors conjugates the result, $\langle\mathbf v, \mathbf u\rangle = \overline{\langle\mathbf u, \mathbf v\rangle}$.`,
        2: t`Conjugation costs linearity in the first slot: $\langle c\mathbf u, \mathbf v\rangle = \bar c\,\langle\mathbf u, \mathbf v\rangle$.`,
        3: t`Complex numbers multiply perfectly well; the issue is that $z^2$ is not $|z|^2$ — $i^2 = -1$.`,
      },
      hints: [t`Compute $(1, i)\cdot(1, i)$ without any conjugate. What should the length of a nonzero vector be?`],
      teach: t`$\bar z z = |z|^2 \ge 0$, while $z^2$ can be negative or complex: the conjugate is what makes lengths real and positive.`,
      explain: t`Without it, $(1, i)$ would have “length squared” $1 + i^2 = 0$. With it, $\|(1, i)\|^2 = |1|^2 + |i|^2 = 2$. The cost is conjugate symmetry instead of symmetry.`,
      visual: phasors([{ name: 'conj z', v: [cx(1), cx(0, -1)], color: 'ink3', dash: [4, 4] }, { name: 'z', v: [cx(1), cx(0, 1)], color: 'gold' }], { circle: 1, labels: false, caption: 'z = (1, i): the first component is 1, the second i (gold), with their conjugates dashed. Squaring i gives −1, which cancels the 1² of the first component.' }),
    }),
    num({
      id: 'expect', difficulty: 2,
      gen(r) {
        const h = herm(r), [p, q] = r.pick(PAIRS), ph = r.pick([cx(1), cx(0, 1), cx(-1), cx(0, -1)]);
        const psi = [cx(p), cmul(cx(q), ph)];
        const ev = inner(psi, cmatvec(h.A, psi))[0], diagOnly = h.a * p * p + h.d * q * q, nv = naive(psi, cmatvec(h.A, psi))[0];
        const errors = [];
        if (Math.abs(diagOnly - ev) > 0.01) errors.push({ value: diagOnly, feedback: t`That keeps only $a_{11}|\psi_1|^2 + a_{22}|\psi_2|^2$. The off-diagonal entries contribute too, through $2\operatorname{Re}(\bar\psi_1 a_{12}\psi_2)$.` });
        if (Math.abs(nv - ev) > 0.01 && Math.abs(nv - diagOnly) > 0.01) errors.push({ value: nv, feedback: t`That is the real part of $\psi^{\mathsf T}A\psi$, with no conjugate on the left-hand $\psi$. Use $\psi${H}A\psi$.` });
        return {
          prompt: t`An observable is $A = ${cmatTeX(h.A)}$ and the state is the unit vector $\psi = ${cvecTeX(psi)}$. Find the expected value $\langle\psi, A\psi\rangle = \psi${H}A\psi$, the average of many measurements of $A$.`,
          answer: ev, tol: { rel: 0.003, abs: 0.005 }, errors,
          hints: [t`First $A\psi = ${cvecTeX(cmatvec(h.A, psi))}$.`, t`Then $\langle\psi, A\psi\rangle = \bar\psi_1 (A\psi)_1 + \bar\psi_2 (A\psi)_2$ — conjugate the entries of $\psi$.`],
          teach: t`The expected value $\psi${H}A\psi$ of a Hermitian $A$ is always real: it equals its own conjugate.`,
          explain: t`$A\psi = ${cvecTeX(cmatvec(h.A, psi))}$ and $\psi${H}(A\psi) = ${nice(ev)}$ — real, as it must be for an observable. It lies between the eigenvalues $${nice(h.lo)}$ and $${nice(h.hi)}$, as an average of them weighted by probabilities must.`,
          visual: phasors([{ name: 'ψ', v: psi, color: 'gold' }], { circle: 1, caption: 'The components of ψ in their complex planes (dotted: radius 1). The phase of the second component matters for the off-diagonal terms.' }),
        };
      },
    }),
    code({
      id: 'pauli', difficulty: 2,
      prompt: t`Build the Pauli matrices in NumPy and test their key property. Fill in \`sy\` and \`sz\`; write \`is_hermitian(A)\` (true when $A$ equals its conjugate transpose \`A.conj().T\`, to rounding: use \`np.allclose\`); write \`sigma_n(theta, phi)\`, the spin matrix $\mathbf n\cdot\boldsymbol\sigma = n_x\sigma_x + n_y\sigma_y + n_z\sigma_z$ along the unit vector $\mathbf n = (\sin\theta\cos\varphi, \sin\theta\sin\varphi, \cos\theta)$; and set \`vals\` to the eigenvalues of \`sigma_n(0.7, 1.9)\` from \`np.linalg.eigvalsh\`, the eigenvalue routine for Hermitian matrices.`,
      starter: t`import numpy as np

sx = np.array([[0, 1], [1, 0]], dtype=complex)
sy = None    # sigma_y
sz = None    # sigma_z

def is_hermitian(A):
    # True when A equals its conjugate transpose (to rounding)
    return False

def sigma_n(theta, phi):
    # n . sigma for n = (sin(theta)cos(phi), sin(theta)sin(phi), cos(theta))
    return np.zeros((2, 2), dtype=complex)

vals = None   # eigenvalues of sigma_n(0.7, 1.9), ascending
print(vals)
`,
      answer: t`import numpy as np

sx = np.array([[0, 1], [1, 0]], dtype=complex)
sy = np.array([[0, -1j], [1j, 0]])
sz = np.array([[1, 0], [0, -1]], dtype=complex)

def is_hermitian(A):
    return np.allclose(A, A.conj().T)

def sigma_n(theta, phi):
    n = [np.sin(theta) * np.cos(phi), np.sin(theta) * np.sin(phi), np.cos(theta)]
    return n[0] * sx + n[1] * sy + n[2] * sz

vals = np.linalg.eigvalsh(sigma_n(0.7, 1.9))
print(vals)
`,
      tests: [
        { name: t`\`sy\` is $\sigma_y = \begin{bmatrix} 0 & -i \\ i & 0 \end{bmatrix}$`, code: 'sy is not None and np.allclose(sy, [[0, -1j], [1j, 0]])' },
        { name: t`\`sz\` is $\sigma_z = \operatorname{diag}(1, -1)$`, code: 'sz is not None and np.allclose(sz, [[1, 0], [0, -1]])' },
        { name: t`\`is_hermitian\` accepts all three Pauli matrices`, code: 'all(is_hermitian(np.asarray(M, dtype=complex)) for M in (sx, sy, sz))' },
        { name: t`\`is_hermitian\` rejects the symmetric but non-Hermitian $\begin{bmatrix} 0 & i \\ i & 0 \end{bmatrix}$`, code: 'not is_hermitian(np.array([[0, 1j], [1j, 0]]))' },
        { name: t`$\mathbf n\cdot\boldsymbol\sigma$ is Hermitian for a tilted direction`, code: 'is_hermitian(sigma_n(1.1, 0.4)) and not np.allclose(sigma_n(1.1, 0.4), 0)' },
        { name: t`the eigenvalues of $\mathbf n\cdot\boldsymbol\sigma$ are $-1$ and $+1$, whatever the direction`, code: 'vals is not None and np.allclose(vals, [-1, 1])' },
        { name: t`$\sigma_x\sigma_y - \sigma_y\sigma_x = 2i\sigma_z$`, code: 'sy is not None and sz is not None and np.allclose(sx @ sy - sy @ sx, 2j * sz)' },
      ],
      hints: [t`\`1j\` is $i$ in Python. \`A.conj().T\` is $A${H}$.`, t`\`sigma_n\` is a weighted sum of three matrices: \`n[0]*sx + n[1]*sy + n[2]*sz\`.`],
      teach: 'Spin along any direction n is the Hermitian matrix n·σ, whose eigenvalues are always ±1: a spin-½ measurement gives ±ħ/2 along every axis.',
      explain: t`Every $\mathbf n\cdot\boldsymbol\sigma$ squares to $I$ (because $\sigma_j^2 = I$ and different Pauli matrices anticommute) and has trace 0, so its eigenvalues are $+1$ and $-1$. That is the Stern–Gerlach result: whichever way the magnet points, the beam splits in two. The commutator $[\sigma_x, \sigma_y] = 2i\sigma_z$ is why spin components along different axes cannot be known together.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gap', difficulty: 2,
      gen(r) {
        const h = herm(r), gap = 2 * Math.sqrt(h.S), nS = h.del * h.del + h.b * h.b - h.c * h.c;
        const errors = [{ value: Math.abs(h.a - h.d), feedback: 'That is the difference of the diagonal entries. The off-diagonal coupling widens the gap.' }];
        if (nS >= 0) errors.push({ value: 2 * Math.sqrt(nS), feedback: t`$a_{12}a_{21}$ is $|a_{12}|^2 = ${h.b * h.b + h.c * h.c}$, not the square of a complex number.` });
        return {
          prompt: t`The Hermitian matrix $A = ${cmatTeX(h.A)}$ is the energy of a two-level system, in meV. Find the gap $\lambda_{\max} - \lambda_{\min}$ between its two eigenvalues, in meV.`,
          answer: gap, units: 'meV', tol: { rel: 0.004 }, errors: errors.filter((e) => Math.abs(e.value - gap) > 0.01 * gap),
          hints: [t`$\lambda = m \pm \sqrt{\delta^2 + |a_{12}|^2}$, so the gap is $2\sqrt{\delta^2 + |a_{12}|^2}$ with $\delta$ half the difference of the diagonal entries.`],
          teach: t`The eigenvalue gap of a $2\times2$ Hermitian matrix is $2\sqrt{\delta^2 + |a_{12}|^2}$.`,
          explain: t`$\delta = ${nice(h.del)}$ and $|a_{12}|^2 = ${h.b * h.b + h.c * h.c}$, so the gap is $2\sqrt{${nice(h.S)}} = ${nice(gap)}$ meV.`,
          visual: charPic(h),
        };
      },
    }),
    num({
      id: 'cp-prob', difficulty: 2,
      gen(r) {
        let psi, P;
        for (let k = 0; k < 100; k++) {
          psi = [cx(r.int(-3, 3), r.intExcept(-3, 3, [0])), cx(r.intExcept(-3, 3, [0]), r.int(-3, 3))];
          P = abs2(psi[1]) / (abs2(psi[0]) + abs2(psi[1]));
          if (Math.abs(P - 0.5) > 0.02) break;
        }
        const n2 = abs2(psi[0]) + abs2(psi[1]);
        return {
          prompt: t`A spin state is given, not yet normalized, as $\psi = ${ctupleTeX(psi)}$. A measurement of spin along $z$ ($\sigma_z = \operatorname{diag}(1, -1)$) is made. Find the probability of the result $-1$ (spin-down).`,
          answer: P, tol: { rel: 0.004 },
          errors: [{ value: abs2(psi[0]) / n2, feedback: 'That is the probability of spin-up, the first component.' }, { value: Math.sqrt(P), feedback: 'That is the modulus of the normalized amplitude; the probability is its square.' }].filter((e) => Math.abs(e.value - P) > 0.01),
          hints: [t`Spin-down is $\mathbf e_2 = (0, 1)$, so the amplitude is the second component — after dividing $\psi$ by its length.`],
          teach: t`A probability is $|\langle\mathbf e_k, \psi\rangle|^2 / \|\psi\|^2$ when $\psi$ is not a unit vector.`,
          explain: t`$|\psi_2|^2 = ${abs2(psi[1])}$ and $\|\psi\|^2 = ${abs2(psi[0])} + ${abs2(psi[1])} = ${n2}$, so $P(-1) = ${abs2(psi[1])}/${n2} = ${nice(P)}$.`,
          visual: phasors([{ name: 'ψ', v: psi, color: 'gold' }], { caption: 'The two components of ψ, each in its own complex plane (not normalized).' }),
        };
      },
    }),
    multi({
      id: 'cp-props', difficulty: 2,
      prompt: t`Which statements hold for **every** Hermitian matrix? Select all that apply.`,
      choices: [
        'Its eigenvalues are real',
        'Its diagonal entries are real',
        'Eigenvectors for different eigenvalues are orthogonal (complex inner product)',
        'All its entries are real',
        'Its eigenvectors can always be chosen with real components',
        t`$A${H}A = I$`,
      ],
      answer: [0, 1, 2],
      why: {
        3: t`$\sigma_y$ is Hermitian with entries $\pm i$.`,
        4: t`$\sigma_y$’s eigenvectors $(1, \pm i)/\sqrt2$ have no real multiples.`,
        5: t`That defines a *unitary* matrix (LA-13.2). $2I$ is Hermitian and $(2I)${H}(2I) = 4I$.`,
      },
      hints: [t`Test each claim on $\sigma_y = ${cmatTeX([[cx(0), cx(0, -1)], [cx(0, 1), cx(0)]])}$.`],
      teach: 'Hermitian matrices have real eigenvalues, a real diagonal and orthogonal eigenvectors — but complex entries and complex eigenvectors are allowed.',
      explain: t`If $A\mathbf v = \lambda\mathbf v$ with $\|\mathbf v\| = 1$, then $\lambda = \mathbf v${H}A\mathbf v$, and this number equals its own conjugate when $A${H} = A$ — so it is real. A similar two-line argument gives orthogonality. $\sigma_y$ refutes the other three.`,
    }),
    num({
      id: 'cp-magnetometer', difficulty: 3, transfer: true,
      gen(r) {
        const B = [r.int(-25, 25), r.int(-20, 20), r.int(30, 55)], Bm = Math.hypot(...B), k = 42.58;
        const f = k * Bm;
        return {
          prompt: t`A proton-precession magnetometer — flown on spacecraft and towed behind survey aircraft — measures a magnetic field through the spin of protons. In a field $\mathbf B$ a proton’s spin energy is the Hermitian matrix $$H = -\frac{\gamma\hbar}{2}\,(B_x\sigma_x + B_y\sigma_y + B_z\sigma_z) = -\frac{\gamma\hbar}{2}\begin{bmatrix} B_z & B_x - iB_y \\ B_x + iB_y & -B_z \end{bmatrix}$$ with $\gamma/2\pi = 42.58$ MHz/T. The instrument detects the frequency $f = \Delta E/h$, where $\Delta E$ is the gap between the two eigenvalues of $H$ (and $h = 2\pi\hbar$). The field is $\mathbf B = (${B.join(', ')})\ \mu\text{T}$. What frequency does it read, in Hz?`,
          answer: f, units: 'Hz', tol: { rel: 0.005 },
          errors: [
            { value: f / 2, feedback: t`That is one eigenvalue’s distance from zero. The gap between $+\tfrac{\gamma\hbar}{2}|\mathbf B|$ and $-\tfrac{\gamma\hbar}{2}|\mathbf B|$ is twice that.` },
            { value: k * Math.abs(B[2]), feedback: t`That uses $B_z$ alone. The eigenvalues of $\mathbf B\cdot\boldsymbol\sigma$ are $\pm|\mathbf B|$: the off-diagonal entries count, through $|B_x + iB_y|^2 = B_x^2 + B_y^2$.` },
            { value: 2 * Math.PI * f, feedback: t`That is the angular frequency $\omega = \gamma|\mathbf B|$ in rad/s. The instrument reads $f = \omega/2\pi$.` },
          ].filter((e) => Math.abs(e.value - f) > 0.01 * f),
          hints: [t`The matrix $\mathbf B\cdot\boldsymbol\sigma$ is Hermitian with trace 0 and determinant $-B_z^2 - |B_x + iB_y|^2 = -|\mathbf B|^2$. Its eigenvalues are $\pm|\mathbf B|$.`, t`So $\Delta E = \gamma\hbar|\mathbf B|$ and $f = \Delta E/h = (\gamma/2\pi)\,|\mathbf B|$. Mind the units: MHz/T times μT gives Hz.`],
          teach: 'The eigenvalues of B·σ are ±|B| whichever way B points, so the energy splitting — and the measured frequency — depends only on the field’s strength.',
          explain: t`$|\mathbf B| = \sqrt{${B.map((b) => b * b).join(' + ')}} = ${nice(Bm)}\ \mu\text{T}$; the eigenvalues of $H$ are $\mp\tfrac{\gamma\hbar}{2}|\mathbf B|$, the gap is $\gamma\hbar|\mathbf B|$, and $f = 42.58\ \text{MHz/T} \times ${nice(Bm)}\times10^{-6}\ \text{T} = ${nice(f)}$ Hz. Because the eigenvalues ignore direction, the magnetometer needs no orientation — one reason the instrument is so robust. (Real instruments use protons in water or kerosene, whose effective $\gamma$ differs from the bare proton’s by about 25 parts per million.)`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 4], y: [-1.5, 1.5], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [{ param: ['0.8 + 1.6*t', '0.8'], t: [0, 1], color: 'accent', width: 3, label: 'upper level', labelAt: 1, labelDx: 8, labelDy: 4 }, { param: ['0.8 + 1.6*t', '-0.8'], t: [0, 1], color: 'accent', width: 3, label: 'lower level', labelAt: 1, labelDx: 8, labelDy: 4 }],
              arrows: [{ from: [1.6, -0.75], to: [1.6, 0.75], color: 'gold', width: 2.4, label: 'ΔE = h f', labelDx: 8, labelDy: 30 }],
            },
            caption: 'The two eigenvalues of H as energy levels (schematic; the spacing is not to scale). The magnetometer measures the gap.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), complex vectors and matrices', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC, Complex matrices; fast Fourier transform', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
    { label: 'CODATA 2018: proton gyromagnetic ratio γₚ/2π = 42.577 MHz/T', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?gammapbar' },
  ],
});
