// Quadratic forms and principal axes: q(x) = xᵀAx, rotating to the
// eigenvector axes removes the cross term, conics and quadrics, definiteness,
// the Rayleigh quotient, and the Hessian test seen again.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { matTeX, tupleTeX } from './_la.js';
import { eigSym2, symInt2, intEigvec, formPic } from './_ortho.js';

const t = String.raw;
const T = t`^{\mathsf T}`;
const TH = '0.5*atan2(2*b, a - c)';
const L1 = '(a + c)/2 + sqrt(((a - c)/2)^2 + b^2)', L2 = '(a + c)/2 - sqrt(((a - c)/2)^2 + b^2)';
const formTeX = (a, b2, c) => {
  // a x² + b2 xy + c y² as TeX
  const term = (k, v, first) => (k === 0 ? '' : `${k < 0 ? (first ? '-' : ' - ') : first ? '' : ' + '}${Math.abs(k) === 1 ? '' : Math.abs(k)}${v}`);
  let s = term(a, 'x^2', true);
  s += term(b2, 'xy', !s);
  s += term(c, 'y^2', !s);
  return s || '0';
};

export default lesson({
  id: 'math2270.LA-11.2',
  title: 'Quadratic forms and principal axes',
  minutes: 13, difficulty: 3,
  intro: t`A **quadratic form** is a sum of squares and cross products, such as $q = 5x^2 - 4xy + 8y^2$. Every one is $\mathbf x${T}A\mathbf x$ for a symmetric $A$ — the squares' coefficients on the diagonal, *half* of each cross coefficient off it. The cross term is what tilts its level curves. Rotate to the eigenvector axes of $A$ (the spectral theorem, LA-11.1): with $\mathbf y = Q${T}\mathbf x$,

$$q(\mathbf x) = \mathbf x${T}A\mathbf x = \lambda_1y_1^2 + \lambda_2y_2^2 + \dots + \lambda_ny_n^2$$

No cross terms remain. So the eigenvalues decide the shape: all positive and $q = 1$ is an ellipse (an ellipsoid in 3D) with semi-axes $1/\sqrt{\lambda_i}$ along the **principal axes** — the form is **positive definite**, its graph a bowl; mixed signs and it is a hyperbola, the graph a saddle. This is the second-derivative test of [Calculus III](#/lesson/math2210.C3-3.7) — the Hessian is a symmetric matrix — and the classification of [quadric surfaces](#/lesson/math2210.C3-1.4).`,
  symbols: [
    { tex: t`\mathbf x${T}A\mathbf x`, text: t`the quadratic form: for $A = \begin{bmatrix} a & b \\ b & c \end{bmatrix}$ it is $ax^2 + 2bxy + cy^2$` },
    { tex: 'A', text: t`the symmetric matrix of the form: diagonal entries are the coefficients of the squares, off-diagonal entries half the cross coefficients` },
    { tex: t`\lambda_i`, text: t`the eigenvalues of $A$: the coefficients of the form in principal axes` },
    { tex: t`\mathbf y = Q${T}\mathbf x`, text: t`coordinates along the orthonormal eigenvectors $\mathbf q_i$ — a rotation (or reflection) of the axes, so lengths are unchanged` },
    { tex: t`y_i`, text: t`the coordinate along the principal axis $\mathbf q_i$: $y_i = \mathbf q_i\cdot\mathbf x$` },
  ],
  why: 'Energy is a quadratic form — kinetic energy ½ωᵀIω, the potential energy near any equilibrium, the stored energy of a strained solid — so the principal axes of a form are where physics decouples, and its signs decide stability.',
  visual: {
    type: 'c3-contour',
    title: 'Ellipse, hyperbola, bowl, saddle',
    lead: t`Level curves of $q = ax^2 + 2bxy + cy^2$. The gold curve is $q = 1$. Green and orange arrows are the unit eigenvectors of $A = \begin{bmatrix} a & b \\ b & c \end{bmatrix}$ — the principal axes. Switch to 3D to see the surface $z = q(x, y)$.`,
    tasks: [
      'At the start (a = 5, b = −2, c = 8, scaled by 1/36 for the picture): an ellipse whose axes are exactly the eigenvector arrows.',
      'Raise |b| until λ₂ (readout) goes negative: the ellipse breaks into a hyperbola, and in 3D the bowl becomes a saddle.',
      'Set b = 0: the axes line up with x and y, and the form has no cross term to begin with.',
    ],
    params: {
      f: 'a*x^2 + 2*b*x*y + c*y^2', x: [-4, 4], y: [-2, 2], levels: [-2, -1, -0.5, 0.5, 1, 2, 4], highlight: '1', toggle3d: true, aspect: 'wide', zscale: 0.5,
      sliders: [
        { key: 'a', label: t`$a$ (coefficient of $x^2$)`, min: -0.4, max: 0.4, step: 0.01, value: 0.14, explain: t`The top-left entry of $A$.` },
        { key: 'b', label: t`$b$ (half the coefficient of $xy$)`, min: -0.4, max: 0.4, step: 0.01, value: -0.06, explain: t`The off-diagonal entry of $A$: the form has $2bxy$.` },
        { key: 'c', label: t`$c$ (coefficient of $y^2$)`, min: -0.4, max: 0.4, step: 0.01, value: 0.22, explain: t`The bottom-right entry of $A$.` },
      ],
      arrows: [
        { from: [0, 0], to: [`cos(${TH})`, `sin(${TH})`], color: 'good', label: 'q₁' },
        { from: [0, 0], to: [`-sin(${TH})`, `cos(${TH})`], color: 'warn', label: 'q₂' },
      ],
      readouts: [
        { label: t`$\lambda_1$`, expr: L1, digits: 3 },
        { label: t`$\lambda_2$`, expr: L2, digits: 3 },
      ],
    },
    caption: 'Level curves at the values labelled; gold: q = 1. Arrows: unit eigenvectors (q₁ for the larger eigenvalue). In 3D the heights are halved for the picture.',
  },
  example: {
    prompt: t`Find the principal axes of the conic $5x^2 - 4xy + 8y^2 = 36$, and its semi-axes.`,
    visual: formPic([[5, -2], [-2, 8]], { x: [-4.8, 4.8], y: [-3, 3], levels: [9, 36, 81], highlight: '36', caption: 'Level curves of 5x² − 4xy + 8y²; gold: the conic = 36. Arrows: unit eigenvectors of the form’s matrix.' }),
    steps: [
      { label: 'The matrix', text: t`Squares on the diagonal, half the cross coefficient off it: $A = ${matTeX([[5, -2], [-2, 8]])}$. Check: $\mathbf x${T}A\mathbf x = 5x^2 - 2xy - 2yx + 8y^2$ ✓.` },
      { label: 'Eigenvalues', text: t`$\lambda^2 - 13\lambda + 36 = (\lambda - 4)(\lambda - 9)$: $\lambda_1 = 9$, $\lambda_2 = 4$. Both positive — an ellipse.` },
      { label: 'Principal axes', text: t`$\lambda = 9$: $(5 - 9)x - 2y = 0$, so $\mathbf q_1 = \tfrac1{\sqrt5}(1, -2)$. $\lambda = 4$: $x - 2y = 0$, so $\mathbf q_2 = \tfrac1{\sqrt5}(2, 1)$. Perpendicular ✓.` },
      { label: 'Rotate', text: t`In the coordinates $y_1 = \mathbf q_1\cdot\mathbf x$, $y_2 = \mathbf q_2\cdot\mathbf x$, the equation is $9y_1^2 + 4y_2^2 = 36$, that is $\dfrac{y_1^2}{4} + \dfrac{y_2^2}{9} = 1$.` },
      { label: 'Semi-axes', text: t`$\sqrt{36/9} = 2$ along $\mathbf q_1$ and $\sqrt{36/4} = 3$ along $\mathbf q_2$. The **larger** eigenvalue gives the **shorter** axis: the form grows fastest that way.` },
      { label: 'Sense check', text: t`The tip of the long axis, $3\mathbf q_2 = (6/\sqrt5, 3/\sqrt5)$, has $x^2 = 7.2$, $xy = 3.6$, $y^2 = 1.8$: $5(7.2) - 4(3.6) + 8(1.8) = 36$ ✓. And the area $\pi\cdot2\cdot3 = 6\pi$ matches the general $\pi k/\sqrt{\det A} = 36\pi/6$ ✓.` },
    ],
    answer: t`Principal axes along $(1, -2)$ and $(2, 1)$; the ellipse $\dfrac{y_1^2}{4} + \dfrac{y_2^2}{9} = 1$ has semi-axes 2 and 3 along them.`,
  },
  practice: [
    num({
      id: 'matrix-of-form', difficulty: 1,
      gen(r) {
        const a = r.intExcept(-5, 6, [0]), b2 = r.intExcept(-8, 8, [0]), c = r.intExcept(-5, 6, [0]), ask = r.pick(['off', 'a', 'c']);
        const ans = ask === 'off' ? b2 / 2 : ask === 'a' ? a : c;
        return {
          prompt: t`Write $q = ${formTeX(a, b2, c)}$ as $\mathbf x${T}A\mathbf x$ with $A$ symmetric. What is ${ask === 'off' ? 'the off-diagonal entry $a_{12} = a_{21}$' : ask === 'a' ? 'the entry $a_{11}$' : 'the entry $a_{22}$'}?`,
          answer: ans, tol: { rel: 1e-3, abs: 1e-3 },
          errors: ask === 'off' ? [{ value: b2, feedback: t`The cross term is $a_{12}xy + a_{21}yx = 2a_{12}xy$: each off-diagonal entry is **half** the coefficient of $xy$.` }] : [],
          hints: [t`$\mathbf x${T}\begin{bmatrix} a_{11} & a_{12} \\ a_{12} & a_{22} \end{bmatrix}\mathbf x = a_{11}x^2 + 2a_{12}xy + a_{22}y^2$.`],
          teach: 'A symmetric matrix of a form holds the square coefficients on its diagonal and half of each cross coefficient off it.',
          explain: t`$A = ${matTeX([[a, b2 / 2], [b2 / 2, c]])}$, so the entry is $${nice(ans)}$.`,
          visual: formPic([[a, b2 / 2], [b2 / 2, c]], { axes: false, levels: 7, caption: 'Level curves of the form (labels show its values). The tilt comes from the cross term.' }),
        };
      },
    }),
    mcq({
      id: 'classify', difficulty: 2,
      prompt: t`Is $q = x^2 + 4xy + y^2$ positive definite (that is, $q > 0$ for every $\mathbf x \ne \mathbf 0$)?`,
      choices: [
        t`No: its matrix $\begin{bmatrix} 1 & 2 \\ 2 & 1 \end{bmatrix}$ has eigenvalues $3$ and $-1$, so $q < 0$ along $(1, -1)$`,
        'Yes: both diagonal coefficients are positive',
        'Yes: x², y² and xy are each positive near the origin',
        'Cannot tell without plotting it',
      ],
      answer: 0,
      why: {
        1: t`Positive diagonal entries only say $q > 0$ along the two coordinate axes. Along $(1, -1)$: $1 - 4 + 1 = -2 < 0$.`,
        2: t`$xy$ is negative whenever $x$ and $y$ have opposite signs.`,
        3: 'The eigenvalues decide it without any plot: definite exactly when they all share a sign.',
      },
      hints: ['Try x = 1, y = −1.', t`The matrix is $\begin{bmatrix} 1 & 2 \\ 2 & 1 \end{bmatrix}$: its trace is 2 and its determinant $-3$.`],
      teach: 'A form is positive definite exactly when every eigenvalue of its matrix is positive — positive diagonal entries are not enough.',
      explain: t`$\det A = -3 < 0$ means the eigenvalues have opposite signs (3 and −1): an indefinite form, a saddle. In principal axes $q = 3y_1^2 - y_2^2$, negative along $\mathbf q_2 = \tfrac1{\sqrt2}(1, -1)$.`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-0.5, 4], aspect: 'wide', xlabel: 's', ylabel: 'q', curves: [{ fn: 'x^2', color: 'accent', label: 'along the x-axis: q(s, 0)', labelAt: 1.3, labelDx: 8 }, { fn: 'x^2', color: 'warn', dash: [6, 4], label: 'along the y-axis: q(0, s)', labelAt: -1.7, labelDy: 18 }] }, caption: 'Slices of the form along the two coordinate axes: both are upward parabolas s². Is that enough to make q a bowl?' },
    }),
    num({
      id: 'semi-axis', difficulty: 2,
      gen(r) {
        const { A, l } = symInt2(r, { range: 6, sign: 'pos' }), k = r.pick([l[0], 2 * l[0], l[0] * l[1], 4 * l[0]]), longer = r.bool(0.5);
        const ans = Math.sqrt(k / (longer ? l[1] : l[0]));
        const [[a, b], [, c]] = A;
        return {
          prompt: t`The conic $${formTeX(a, 2 * b, c)} = ${k}$ is an ellipse. How long is its ${longer ? 'longer' : 'shorter'} semi-axis? (3 significant figures)`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(k / (longer ? l[0] : l[1])), feedback: `That is the ${longer ? 'shorter' : 'longer'} one: the larger eigenvalue makes the form grow fastest, so its axis is the shorter.` }, { value: k / (longer ? l[1] : l[0]), feedback: t`$\lambda y^2 = k$ gives $y = \sqrt{k/\lambda}$ — take the square root.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`In principal axes the conic is $\lambda_1y_1^2 + \lambda_2y_2^2 = ${k}$; the eigenvalues of $${matTeX(A)}$ are needed.`, t`The eigenvalues are $${l[0]}$ and $${l[1]}$; a semi-axis is $\sqrt{${k}/\lambda}$.`],
          teach: 'In principal axes an ellipse λ₁y₁² + λ₂y₂² = k has semi-axes √(k/λ₁) and √(k/λ₂).',
          explain: t`$\lambda = ${l[0]}, ${l[1]}$, so the semi-axes are $\sqrt{${k}/${l[0]}} \approx ${nice(Math.sqrt(k / l[0]), 3)}$ along $${tupleTeX(intEigvec(A, l[0]))}$ and $\sqrt{${k}/${l[1]}} \approx ${nice(Math.sqrt(k / l[1]), 3)}$ along $${tupleTeX(intEigvec(A, l[1]))}$.`,
          visual: formPic(A, { axes: false, labels: false, levels: [k], highlight: `${k}`, x: [-1.8 * Math.sqrt(k / l[1]), 1.8 * Math.sqrt(k / l[1])], y: [-0.9 * Math.sqrt(k / l[1]) - 0.2, 0.9 * Math.sqrt(k / l[1]) + 0.2], caption: 'The ellipse itself (gold). Its axes are tilted: find them from the matrix, not by eye.' }),
        };
      },
    }),
    num({
      id: 'rayleigh', difficulty: 2,
      gen(r) {
        const { A, l } = symInt2(r, { range: 6 }), want = r.pick(['max', 'min']);
        const [[a, b], [, c]] = A;
        const ans = want === 'max' ? l[0] : l[1];
        return {
          prompt: t`What is the ${want === 'max' ? 'largest' : 'smallest'} value of $q = ${formTeX(a, 2 * b, c)}$ on the unit circle $x^2 + y^2 = 1$?`,
          answer: ans, tol: { rel: 1e-3, abs: 1e-3 },
          errors: [{ value: want === 'max' ? Math.max(a, c) : Math.min(a, c), feedback: t`That is $q$ at $(1, 0)$ or $(0, 1)$. The cross term lets a tilted direction do ${want === 'max' ? 'better' : 'worse'}: the extremes are the eigenvalues.` }].filter((e) => Math.abs(e.value - ans) > 1e-3),
          hints: [t`On the unit circle, $q = \lambda_1y_1^2 + \lambda_2y_2^2$ with $y_1^2 + y_2^2 = 1$ — a weighted average of the eigenvalues.`, t`The eigenvalues of $${matTeX(A)}$ are needed.`],
          teach: 'On the unit sphere a quadratic form ranges exactly from its smallest to its largest eigenvalue, reached along the eigenvectors (the Rayleigh quotient).',
          explain: t`The eigenvalues are $${l[0]}$ and $${l[1]}$, so $q$ ranges over $[${l[1]}, ${l[0]}]$ on the circle; the ${want === 'max' ? 'maximum' : 'minimum'} $${ans}$ is reached at $\pm$ the unit eigenvector along $${tupleTeX(intEigvec(A, ans))}$.`,
          visual: (() => { const pic = formPic(A, { axes: false, levels: 7, x: [-2.4, 2.4], y: [-1.2, 1.2], caption: 'Level curves of the form and the unit circle (dashed). The question is which level curves the circle reaches.' }); pic.params.curves = [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * Math.PI], color: 'ink', width: 2, dash: [5, 4] }]; return pic; })(),
        };
      },
    }),
    num({
      id: 'hessian', difficulty: 3,
      gen(r) {
        const { A, l } = symInt2(r, { range: 4, sign: r.bool(0.5) ? 'indef' : 'pos' });
        const H = A.map((row) => row.map((v) => 2 * v)), [[a, b], [, c]] = A;
        const cubic = r.pick(['x^3', 'y^3', 'x y^2', 'x^2 y']);
        const cubicTeX = { 'x^3': 'x^3', 'y^3': 'y^3', 'x y^2': 'xy^2', 'x^2 y': 'x^2y' }[cubic];
        return {
          prompt: t`$f(x, y) = ${formTeX(a, 2 * b, c)} + ${cubicTeX}$ has a critical point at the origin. Its Hessian there is $H = \begin{bmatrix} f_{xx} & f_{xy} \\ f_{xy} & f_{yy} \end{bmatrix}$. Find the **smaller** eigenvalue of $H$.`,
          answer: 2 * l[1], tol: { rel: 1e-3, abs: 1e-3 },
          errors: [{ value: l[1], feedback: t`Those are the eigenvalues of the form's own matrix $A$; the Hessian of $\mathbf x${T}A\mathbf x$ is $2A$, so its eigenvalues are doubled.` }],
          hints: [t`At the origin the cubic term contributes nothing to second derivatives. $f_{xx} = ${2 * a}$, $f_{xy} = ${2 * b}$, $f_{yy} = ${2 * c}$.`, t`$H = ${matTeX(H)}$: use $\lambda = \tfrac{f_{xx} + f_{yy}}2 \pm \sqrt{\left(\tfrac{f_{xx} - f_{yy}}2\right)^2 + f_{xy}^2}$.`],
          teach: 'Near a critical point f ≈ f(p) + ½ hᵀHh: the Hessian’s eigenvalues classify the point — all positive a minimum, mixed signs a saddle.',
          explain: t`$H = ${matTeX(H)}$ has eigenvalues $${2 * l[0]}$ and $${2 * l[1]}$: ${l[1] > 0 ? 'both positive, so the origin is a local minimum (a bowl)' : 'opposite signs, so the origin is a saddle'}. The second-derivative test of Calculus III ($D = f_{xx}f_{yy} - f_{xy}^2$) is the same statement: $D = \det H = \lambda_1\lambda_2$.`,
          visual: { type: 'surface3d', params: { z: `${a}*x^2 + ${2 * b}*x*y + ${c}*y^2 + ${cubic.replace(' ', '*')}`, domain: [[-1.2, 1.2], [-1.2, 1.2]] }, caption: 'The surface z = f(x, y) near the origin. Drag to rotate.' },
        };
      },
    }),
    mcq({
      id: 'quadric', difficulty: 2,
      prompt: t`In principal axes a form in three variables is $q = 2y_1^2 + 2y_2^2 - y_3^2$. What surface is $q = 1$?`,
      choices: ['A hyperboloid of one sheet', 'A hyperboloid of two sheets', 'An ellipsoid', 'A cone'],
      answer: 0,
      why: {
        1: t`Two sheets needs two negative signs with a positive level ($-y_1^2 - y_2^2 + y_3^2 = 1$ type), so that $y_3$ can never be 0. Here $y_3 = 0$ gives the circle $2y_1^2 + 2y_2^2 = 1$: the surface is connected.`,
        2: 'An ellipsoid needs all three eigenvalues positive.',
        3: t`A cone is the level $q = 0$, not $q = 1$.`,
      },
      hints: [t`Signs $(+, +, -)$. Slice at fixed $y_3$: what curve do you get, and does it exist for every $y_3$?`],
      teach: 'The signs of the eigenvalues (the signature) and the level decide which quadric a form makes.',
      explain: t`Each slice $y_3 = h$ is the circle $2y_1^2 + 2y_2^2 = 1 + h^2$, which exists for every $h$ and grows with $|h|$: one connected sheet, waisted at $h = 0$. The same counting of signs is next lesson's subject, and it is what separates time from space in relativity.`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-1.6, 1.6], aspect: 'wide', equal: true, xlabel: 'y₁', ylabel: 'y₃', curves: [{ param: ['cosh(t)/sqrt(2)', 'sinh(t)'], t: [-1.3, 1.3], color: 'accent' }, { param: ['-cosh(t)/sqrt(2)', 'sinh(t)'], t: [-1.3, 1.3], color: 'accent' }] }, caption: 'The slice y₂ = 0 of the surface: the hyperbola 2y₁² − y₃² = 1. One slice alone does not decide between one sheet and two.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-axis', difficulty: 2,
      gen(r) {
        const { A, l } = symInt2(r, { range: 6, sign: 'pos' }), [[a, b], [, c]] = A, k = l[0] * l[1];
        return {
          prompt: t`The ellipse $${formTeX(a, 2 * b, c)} = ${k}$: how long is its shorter semi-axis? (3 significant figures)`,
          answer: Math.sqrt(k / l[0]), tol: { rel: 0.005 },
          hints: [t`Semi-axes are $\sqrt{${k}/\lambda}$ for the eigenvalues $\lambda$ of $${matTeX(A)}$.`],
          teach: 'Semi-axes are √(k/λ); the larger eigenvalue gives the shorter one.',
          explain: t`$\lambda = ${l[0]}, ${l[1]}$: semi-axes $\sqrt{${k}/${l[0]}} = ${nice(Math.sqrt(k / l[0]), 3)}$ and $\sqrt{${k}/${l[1]}} = ${nice(Math.sqrt(k / l[1]), 3)}$.`,
          visual: formPic(A, { axes: false, labels: false, levels: [k], highlight: `${k}`, x: [-1.8 * Math.sqrt(l[0]), 1.8 * Math.sqrt(l[0])], y: [-0.9 * Math.sqrt(l[0]) - 0.2, 0.9 * Math.sqrt(l[0]) + 0.2], caption: 'The ellipse (gold).' }),
        };
      },
    }),
    num({
      id: 'cp-gps', difficulty: 3, transfer: true,
      gen(r) {
        const { A, l } = symInt2(r, { range: 9, sign: 'pos', minQ: 2 });
        return {
          prompt: t`A GPS receiver's horizontal position error has covariance matrix $P = ${matTeX(A)}\ \text{m}^2$ (east, north). Its 1σ error ellipse is $\mathbf x${T}P^{-1}\mathbf x = 1$, whose semi-axes are $\sqrt{\lambda_i}$ for the eigenvalues $\lambda_i$ of $P$. How long is the major semi-axis, in metres?`,
          answer: Math.sqrt(l[0]), units: 'm', tol: { rel: 0.005 },
          errors: [{ value: l[0], feedback: t`$\lambda$ is a variance, in m²: the semi-axis is its square root.` }, { value: Math.sqrt(Math.max(A[0][0], A[1][1])), feedback: 'That is the larger of the east and north standard deviations. The correlation (off-diagonal term) tilts the ellipse and stretches it beyond both.' }].filter((e) => Math.abs(e.value - Math.sqrt(l[0])) > 0.005 * Math.sqrt(l[0])),
          hints: [t`The eigenvalues of $P$ are $\tfrac{${A[0][0]} + ${A[1][1]}}2 \pm \sqrt{\left(\tfrac{${A[0][0]} - ${A[1][1]}}2\right)^2 + ${A[0][1] ** 2}}$.`, t`$P^{-1}$ has eigenvalues $1/\lambda_i$, so in principal axes the ellipse is $y_1^2/\lambda_1 + y_2^2/\lambda_2 = 1$.`],
          teach: 'An error ellipse is the level set of a quadratic form; its principal axes are the eigenvectors of the covariance matrix, its semi-axes the square roots of the eigenvalues.',
          explain: t`$\lambda = ${l[0]}, ${l[1]}$ m², so the semi-axes are $${nice(Math.sqrt(l[0]), 3)}$ m and $${nice(Math.sqrt(l[1]), 3)}$ m, the major one along $${tupleTeX(intEigvec(A, l[0]))}$ (east, north). Satellite geometry (dilution of precision) decides how elongated this ellipse is.`,
          visual: formPic(A, { axes: false, labels: false, levels: 5, x: [-2.4, 2.4], y: [-1.5, 1.5], caption: 'Level curves of xᵀPx, whose axes lie along the same eigenvectors as the error ellipse’s (the ellipse itself, xᵀP⁻¹x = 1, has its long axis where these curves are narrowest).' }),
        };
      },
    }),
    mcq({
      id: 'cp-surface', difficulty: 2,
      prompt: t`A symmetric $3\times3$ matrix $A$ has eigenvalues $4$, $4$ and $1$. What is the surface $\mathbf x${T}A\mathbf x = 1$?`,
      choices: ['An elongated (prolate) spheroid, a cigar: semi-axes ½, ½ and 1', 'A sphere of radius ½', 'A flattened (oblate) spheroid: semi-axes 4, 4 and 1', 'A hyperboloid'],
      answer: 0,
      why: {
        1: t`A sphere needs all three eigenvalues equal; along the third axis the semi-axis is $1/\sqrt1 = 1$, twice as long.`,
        2: t`Semi-axes are $1/\sqrt{\lambda}$, not $\lambda$: $1/\sqrt4 = \tfrac12$. The two equal axes are the short ones.`,
        3: 'All three eigenvalues are positive, so the form is positive definite: a closed surface.',
      },
      hints: [t`In principal axes: $4y_1^2 + 4y_2^2 + y_3^2 = 1$.`],
      teach: 'Semi-axes of xᵀAx = 1 are 1/√λ along the eigenvectors; a repeated eigenvalue gives a surface of revolution.',
      explain: t`$4y_1^2 + 4y_2^2 + y_3^2 = 1$ has semi-axes $\tfrac12, \tfrac12, 1$: round in the $y_1y_2$-plane (any orthonormal pair in that two-dimensional eigenspace will do as axes) and twice as long along $\mathbf q_3$ — a cigar.`,
    }),
  ],
  sources: [
    { label: 'Lay, Lay and McDonald, Linear Algebra and Its Applications (6th ed.), §7.2–7.3: quadratic forms and constrained optimization', url: 'https://www.pearson.com/en-us/subject-catalog/p/linear-algebra-and-its-applications/P200000006235/9780135851203' },
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §6.4: Positive definite matrices', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Kaplan and Hegarty, Understanding GPS/GNSS (3rd ed.), ch. 11: position error and dilution of precision', url: 'https://us.artechhouse.com/Understanding-GPSGNSS-Principles-and-Applications-Third-Edition-P1938.aspx' },
  ],
});
