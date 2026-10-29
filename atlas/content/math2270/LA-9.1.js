// Eigenvectors: the directions a linear map does not turn, with the factor λ
// it stretches them by — and the principal axes of a spinning body.
import { lesson, mcq, num, match, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { matvec, det2, matTeX, tupleTeX, colTeX, map2d } from './_la.js';
import { withEigen, intDir } from './_eig.js';

const t = String.raw;
const parallel = (u, v) => Math.abs(u[0] * v[1] - u[1] * v[0]) < 1e-9;
const isEig = (A, v) => !v.every((x) => x === 0) && parallel(matvec(A, v), v);

// eigenvalue pairs that give tidy matrices
const LAMS = [[3, 1], [4, 2], [2, -1], [3, -2], [5, 2], [1, -3], [4, -1], [2, 6]];

export default lesson({
  id: 'math2270.LA-9.1',
  title: 'Eigenvectors: directions a map preserves',
  minutes: 12, difficulty: 2,
  intro: t`A linear map turns most vectors to new directions. But some special directions it only stretches (or shrinks, or reverses): along those, $A$ acts like multiplication by a number. A nonzero vector with
$$A\mathbf v = \lambda\mathbf v, \qquad \mathbf v \ne \mathbf 0$$
is an **eigenvector** of $A$, and $\lambda$ is its **eigenvalue**. The whole line through $\mathbf v$ is carried onto itself — an invariant direction. In physics these directions are where a problem becomes simple. The angular momentum of a rigid body is $\mathbf L = I\boldsymbol\omega$, with $I$ the inertia tensor ([C3-4.7](#/lesson/math2210.C3-4.7)); spin it about an eigenvector of $I$ — a **principal axis** — and $\mathbf L$ points along $\boldsymbol\omega$, so it turns without wobbling, with the eigenvalue as its moment of inertia ([Physics I's single moment of inertia](#/lesson/phys2210.M10.2) is this eigenvalue for a symmetric body).`,
  symbols: [
    { tex: 'A', text: t`a square ($n\times n$) matrix — a linear map of a space to itself` },
    { tex: t`\mathbf v`, text: t`an eigenvector: a **nonzero** vector whose direction $A$ does not change (any nonzero multiple of it is one too)` },
    { tex: t`\lambda`, text: t`its eigenvalue, a number: the stretch factor along $\mathbf v$. It may be negative (the direction is reversed) or zero (the direction is squashed to $\mathbf 0$)` },
    { tex: t`A\mathbf v`, text: t`the image of $\mathbf v$ — for an eigenvector, a multiple of $\mathbf v$ itself` },
  ],
  why: 'Normal modes of vibration, principal axes of rotation and of stress, energy levels in quantum mechanics and the growth rates of any linear process are all eigenvalues: they are what a linear map does once you look along the right directions.',
  visual: {
    type: 'la-map2d',
    title: 'Hunting for directions the map does not turn',
    lead: t`$A$ is a map you can change by dragging the column tips. The dashed arrow $\mathbf x$ is a unit-ish vector you turn with the slider; the gold arrow is $A\mathbf x$. Most of the time they point different ways. The violet dashed lines are the directions where they agree — the eigenvector lines, labelled with their eigenvalues.`,
    tasks: [
      'Turn x to 0° and then to 135°: there Ax lies along x, stretched by 3 and by 2 — the two eigenvalues.',
      'Drag the columns to (0, 1) and (−1, 0), a quarter turn: the violet lines vanish. A rotation turns every direction (LA-9.4).',
      'Make the matrix symmetric — columns (2, 1) and (1, 2): the two lines become perpendicular.',
    ],
    params: {
      A: [[3, 1], [0, 2]], drag: true, snap: 0.5, eigen: true, shape: 'F', view: 2.8,
      x: ['1.6*cos(ph*pi/180)', '1.6*sin(ph*pi/180)'], xName: 'x', imageName: 'Ax',
      sliders: [{ key: 'ph', label: t`Direction of $\mathbf x$`, min: -180, max: 180, step: 5, value: 60, unit: t`^\circ`, explain: t`Turns the input vector $\mathbf x$ around the origin.` }],
      readout: ['A', 'x', 'Ax'],
    },
    caption: 'Faint: the plane before the map; bold: after it. Dashed grey: x; gold: Ax. Violet dashed: the eigenvector lines (none for a rotation). Column tips snap to half-units.',
  },
  example: {
    prompt: t`$A = ${matTeX([[4, 1], [2, 3]])}$ has eigenvalues $5$ and $2$. Find an eigenvector for each, and check that $(1, 0)$ is not one.`,
    visual: map2d([[4, 1], [2, 3]], { eigen: true, view: 3, shape: 'F', caption: 'A with its two eigenvector lines (violet, dashed): the F is stretched by 5 along one and by 2 along the other.' }),
    steps: [
      { label: 'Rewrite', text: t`$A\mathbf v = \lambda\mathbf v$ is $(A - \lambda I)\mathbf v = \mathbf 0$: an eigenvector is a nonzero vector in the null space of $A - \lambda I$.` },
      { label: 'Lambda = 5', text: t`$A - 5I = ${matTeX([[-1, 1], [2, -2]])}$. Its rows both say $-v_1 + v_2 = 0$, so $\mathbf v = (1, 1)$. Check: $A(1, 1) = (5, 5) = 5(1, 1)$. ✓` },
      { label: 'Lambda = 2', text: t`$A - 2I = ${matTeX([[2, 1], [2, 1]])}$: $2v_1 + v_2 = 0$, so $\mathbf v = (1, -2)$. Check: $A(1, -2) = (2, -4) = 2(1, -2)$. ✓` },
      { label: 'Not every vector', text: t`$A(1, 0) = (4, 2)$, which is not a multiple of $(1, 0)$: the map turns that direction.` },
      { label: 'Meaning', text: t`Any multiple — $(3, 3)$, $(-2, 4)$ — works equally well: an eigenvector names a *line*. And the null spaces had to be nonzero; that is exactly the condition $\det(A - \lambda I) = 0$ that finds the eigenvalues in the next lesson.` },
    ],
    answer: t`$\lambda = 5$: $\mathbf v = (1, 1)$; $\lambda = 2$: $\mathbf v = (1, -2)$ (or any nonzero multiples).`,
  },
  practice: [
    mcq({
      id: 'is-eigen', difficulty: 1,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const { A, vecs } = withEigen(r, r.pick(LAMS));
          const v = intDir(vecs[r.int(0, 1)]);
          const pool = [[1, 0], [0, 1], [v[1], v[0]], [v[0] + 1, v[1]], [1, 1], [1, -1], [2, 1], [1, 2]]
            .filter((w) => !isEig(A, w) && !parallel(w, v));
          const uniq = pool.filter((w, i) => pool.findIndex((z) => parallel(z, w)) === i);
          if (uniq.length < 3) continue;
          const wr = r.shuffle(uniq).slice(0, 3), lam = matvec(A, v)[0] / v[0] || matvec(A, v)[1] / v[1];
          return {
            prompt: t`Which vector is an eigenvector of $A = ${matTeX(A)}$?`,
            choices: [t`$${tupleTeX(v)}$`, ...wr.map((w) => t`$${tupleTeX(w)}$`)],
            answer: 0,
            why: Object.fromEntries(wr.map((w, i) => [i + 1, t`$A${tupleTeX(w)} = ${tupleTeX(matvec(A, w))}$, which is not a multiple of $${tupleTeX(w)}$: the map turns this direction.`])),
            hints: [t`Multiply each candidate by $A$ and ask: is the result a multiple of the candidate?`],
            teach: t`$\mathbf v$ is an eigenvector when $A\mathbf v$ is a multiple of $\mathbf v$ — same line through the origin.`,
            explain: t`$A${tupleTeX(v)} = ${tupleTeX(matvec(A, v))} = ${nice(lam)}${tupleTeX(v)}$: an eigenvector with eigenvalue $${nice(lam)}$.`,
            visual: map2d(A, { view: 2.6, caption: 'The map A: the faint F and grid before, the bold ones after.' }),
          };
        }
        return { prompt: t`Which vector is an eigenvector of $${matTeX([[2, 0], [0, 3]])}$?`, choices: ['$(1, 0)$', '$(1, 1)$', '$(1, 2)$', '$(2, 1)$'], answer: 0, why: { 1: 'It is turned.', 2: 'It is turned.', 3: 'It is turned.' }, hints: ['Multiply.'], teach: 'Av must be a multiple of v.', explain: '(2, 0) = 2(1, 0).' };
      },
    }),
    num({
      id: 'find-lambda', difficulty: 1,
      gen(r) {
        const { A, vecs, lams } = withEigen(r, r.pick(LAMS));
        const k = r.int(0, 1), v = intDir(vecs[k]), Av = matvec(A, v), lam = lams[k];
        const i = v[0] !== 0 ? 0 : 1;
        const errors = Math.abs(Av[i] - lam) > 1e-9 && Math.abs(Av[i] + lam) > 1e-9 ? [{ value: Av[i], feedback: t`That is a component of $A\mathbf v$. Divide it by the matching component of $\mathbf v$.` }] : [];
        if (A[0][0] !== lam && A[0][0] !== -lam && !errors.some((e) => e.value === A[0][0])) errors.push({ value: A[0][0], feedback: 'The diagonal entries are eigenvalues only for a triangular matrix. Compute Av.' });
        return {
          prompt: t`$\mathbf v = ${tupleTeX(v)}$ is an eigenvector of $A = ${matTeX(A)}$. What is its eigenvalue?`,
          answer: lam, tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`Compute $A\mathbf v$ and compare it with $\mathbf v$.`],
          teach: t`The eigenvalue is the factor in $A\mathbf v = \lambda\mathbf v$: compare matching components.`,
          explain: t`$A\mathbf v = ${tupleTeX(Av)} = ${lam}\,${tupleTeX(v)}$, so $\lambda = ${lam}$.${lam < 0 ? ' A negative eigenvalue: the map reverses this line.' : ''}`,
          visual: map2d(A, { view: 2.8, x: v.map((z) => z / Math.max(1, Math.hypot(...v)) * 1.4), xName: 'v', imageName: 'Av', caption: 'The map A, with v (dashed, scaled to fit) and its image Av (gold) on the same line.' }),
        };
      },
    }),
    num({
      id: 'eigvec', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const { A, vecs, lams } = withEigen(r, r.pick(LAMS));
          const j = r.int(0, 1), v = vecs[j], lam = lams[j];
          if (v[0] === 0 || A[0][1] === 0) continue;
          const y = v[1] / v[0];
          if (y === 0) continue;
          const inv = A[0][1] / (lam - A[0][0]);
          return {
            prompt: t`$A = ${matTeX(A)}$ has the eigenvalue $\lambda = ${lam}$. Its eigenvectors are the multiples of $(1, y)$. Find $y$.`,
            answer: y, tol: { rel: 0.005, abs: 0.005 },
            errors: Number.isFinite(inv) && Math.abs(inv - y) > 1e-9 && Math.abs(inv + y) > 1e-9 ? [{ value: inv, feedback: t`Solve the first row of $(A - \lambda I)\mathbf v = \mathbf 0$ for $y$ carefully: $(${A[0][0]} - ${lam}) + ${A[0][1]}y = 0$.` }] : [],
            hints: [t`$(A - ${lam}I)\mathbf v = \mathbf 0$ with $A - ${lam}I = ${matTeX([[A[0][0] - lam, A[0][1]], [A[1][0], A[1][1] - lam]])}$.`, t`The first row says $${A[0][0] - lam} + (${A[0][1]})y = 0$.`],
            teach: t`An eigenvector for $\lambda$ is a nonzero solution of $(A - \lambda I)\mathbf v = \mathbf 0$; one row is enough in two dimensions.`,
            explain: t`$y = ${nice(y)}$: $A(1, ${nice(y)}) = ${tupleTeX(matvec(A, [1, y]))} = ${lam}(1, ${nice(y)})$. ✓ The second row of $A - ${lam}I$ is a multiple of the first — it has to be, or only $\mathbf 0$ would solve the system.`,
            visual: map2d(A, { view: 2.8, caption: 'The map A. Its eigenvector lines are not drawn here: finding one is the question.' }),
          };
        }
        return { prompt: t`$A = ${matTeX([[4, 1], [2, 3]])}$, $\lambda = 2$: find $y$ in $(1, y)$.`, answer: -2, hints: ['(4 − 2) + y = 0.', 'y = −2.'], teach: 'Solve (A − λI)v = 0.', explain: '$y = -2$.' };
      },
    }),
    mcq({
      id: 'zero-eig', difficulty: 2,
      prompt: t`$\lambda = 0$ is an eigenvalue of a matrix $A$. Which statement must be true?`,
      choices: [t`$A$ is not invertible: some nonzero $\mathbf v$ has $A\mathbf v = \mathbf 0$`, t`$A$ has no eigenvalues at all`, t`The eigenvector is $\mathbf v = \mathbf 0$`, t`$A$ is the zero matrix`],
      answer: 0,
      why: {
        1: t`Zero is a perfectly good eigenvalue: it says the map squashes a whole line to $\mathbf 0$.`,
        2: t`Eigenvectors are nonzero by definition — even when the eigenvalue is 0.`,
        3: t`Only one direction need be squashed; $${matTeX([[1, 0], [0, 0]])}$ has eigenvalues 1 and 0.`,
      },
      hints: [t`Write out $A\mathbf v = 0\cdot\mathbf v$ with $\mathbf v \ne \mathbf 0$.`],
      teach: t`$\lambda = 0$ is an eigenvalue exactly when $A$ has a nonzero null space — when $A$ is singular.`,
      explain: t`$A\mathbf v = \mathbf 0$ with $\mathbf v \ne \mathbf 0$ means the null space is not just $\{\mathbf 0\}$, so $A$ cannot be undone: $\det A = 0$. The eigenvectors for $\lambda = 0$ are the nonzero vectors of the null space.`,
      visual: map2d([[1, 0.5], [0.5, 0.25]], { view: 2.2, eigen: true, caption: 'A singular map: the whole plane is squashed onto one line. The direction it kills (violet, λ = 0) is an eigenvector line.' }),
    }),
    match({
      id: 'gallery', difficulty: 2,
      prompt: 'Match each map of the plane with its real eigenvalues and eigenvectors.',
      left: [t`Reflection in the line $y = x$`, t`Projection onto the $x$-axis`, t`The shear $${matTeX([[1, 1], [0, 1]])}$`, t`Rotation by $90^\circ$`, t`Scaling by 3: $3I$`],
      right: ['λ = 1 and λ = −1, on perpendicular lines', 'λ = 1 and λ = 0', 'λ = 1 only, on a single line', 'no real eigenvectors', 'λ = 3, and every vector is an eigenvector'],
      answer: [0, 1, 2, 3, 4],
      hints: ['For each map ask: which lines through the origin land on themselves, and how are they stretched?', 'A reflection keeps its mirror line (λ = 1) and flips the perpendicular line (λ = −1); a projection keeps its target line and kills the direction it projects along.'],
      teach: 'The eigenvectors of a geometric map are the lines it sends onto themselves; the eigenvalues say what happens along them.',
      explain: t`Reflection in $y = x$: $(1, 1)$ is kept ($\lambda = 1$), $(1, -1)$ is reversed ($\lambda = -1$). Projection onto the $x$-axis: $(1, 0)$ kept, $(0, 1)$ sent to $\mathbf 0$. The shear keeps only the $x$-axis — one line, not enough for a basis (LA-9.3). A quarter turn moves every line. $3I$ stretches everything by 3, so every nonzero vector qualifies.`,
    }),
    mcq({
      id: 'wobble', difficulty: 2,
      prompt: t`A satellite in free space is set spinning with angular velocity $\boldsymbol\omega$ along a direction that is **not** an eigenvector of its inertia tensor $I$. What does that mean for its angular momentum $\mathbf L = I\boldsymbol\omega$?`,
      choices: [
        t`$\mathbf L$ is not parallel to $\boldsymbol\omega$; since $\mathbf L$ stays fixed in space, the spin axis wobbles`,
        t`Nothing: $\mathbf L$ is parallel to $\boldsymbol\omega$ for every spin direction`,
        t`$\mathbf L$ is parallel to $\boldsymbol\omega$ but smaller`,
        t`$\mathbf L = \mathbf 0$, so the satellite stops`,
      ],
      answer: 0,
      why: {
        1: t`Only along eigenvectors of $I$ does $I\boldsymbol\omega$ point along $\boldsymbol\omega$. A lopsided body has just three such axes.`,
        2: t`Parallel would make $\boldsymbol\omega$ an eigenvector of $I$ — the opposite of what was given.`,
        3: t`$I$ is invertible (every moment of inertia is positive), so $I\boldsymbol\omega \ne \mathbf 0$ whenever $\boldsymbol\omega \ne \mathbf 0$.`,
      },
      hints: [t`$\mathbf L = I\boldsymbol\omega$ is parallel to $\boldsymbol\omega$ exactly when $I\boldsymbol\omega = \lambda\boldsymbol\omega$.`, t`With no torque, $\mathbf L$ is constant. If $\boldsymbol\omega$ is not along $\mathbf L$, can $\boldsymbol\omega$ stay put?`],
      teach: 'Angular momentum is parallel to the spin only about a principal axis — an eigenvector of the inertia tensor.',
      explain: t`Off a principal axis, $I\boldsymbol\omega$ points elsewhere. With no torque $\mathbf L$ is fixed in space, so $\boldsymbol\omega$ — and the body — must move around it: the wobble of a badly thrown football or a mis-balanced satellite ([C3-4.7](#/lesson/math2210.C3-4.7) has the numbers; [phys3550's rigid-body module](#/lesson/phys3550.M7.2) the full dynamics).`,
      visual: map2d([[3, 1], [1, 2]], { view: 2.6, eigen: true, x: [0, 1], xName: 'ω', imageName: 'L = Iω', shape: 'none', grid: false, columns: false, caption: 'A 2D slice of an inertia tensor I as a map: ω (dashed) along a non-principal direction gives L = Iω (gold) pointing elsewhere. Violet dashed: the principal axes. Units arbitrary.' }),
    }),
    code({
      id: 'principal-axes', difficulty: 3,
      prompt: t`A satellite is modelled as point masses: \`m[k]\` kilograms at positions \`r[k]\` metres from the origin $O$. Write \`inertia_tensor(m, r)\` returning the $3\times3$ inertia tensor about $O$,
$$I = \sum_k m_k\big(|\mathbf r_k|^2\,\mathbb 1 - \mathbf r_k\mathbf r_k^{\mathsf T}\big),$$
(so $I_{xx} = \sum m(y^2 + z^2)$ and $I_{xy} = -\sum m\,xy$), then use \`np.linalg.eigh\` to set \`moments\` (the principal moments, ascending) and \`axes\` (the principal axes, as columns).`,
      starter: t`import numpy as np

m = np.array([300.0, 25.0, 25.0, 12.0])           # bus, two solar panels, antenna (kg)
r = np.array([[0.0, 0.0, 0.1],
              [2.2, 0.3, 0.0],
              [-2.2, -0.3, 0.0],
              [0.3, 0.5, 1.4]])                    # positions (m)

def inertia_tensor(m, r):
    I = np.zeros((3, 3))
    # add each mass's contribution
    return I

I = inertia_tensor(m, r)
moments, axes = None, None
`,
      answer: t`import numpy as np

m = np.array([300.0, 25.0, 25.0, 12.0])           # bus, two solar panels, antenna (kg)
r = np.array([[0.0, 0.0, 0.1],
              [2.2, 0.3, 0.0],
              [-2.2, -0.3, 0.0],
              [0.3, 0.5, 1.4]])                    # positions (m)

def inertia_tensor(m, r):
    I = np.zeros((3, 3))
    for mk, rk in zip(m, r):
        I += mk * (rk @ rk * np.eye(3) - np.outer(rk, rk))
    return I

I = inertia_tensor(m, r)
moments, axes = np.linalg.eigh(I)
print(np.round(I, 2))
print("principal moments (kg m^2):", np.round(moments, 2))`,
      tests: [
        { name: t`one mass of 2 kg at $(1, 0, 0)$ gives $\operatorname{diag}(0, 2, 2)$`, code: 'np.allclose(inertia_tensor(np.array([2.0]), np.array([[1.0, 0.0, 0.0]])), np.diag([0.0, 2.0, 2.0]))' },
        { name: t`a mass at $(1, 1, 0)$ has the product of inertia $I_{xy} = -m$`, code: 'abs(inertia_tensor(np.array([1.0]), np.array([[1.0, 1.0, 0.0]]))[0, 1] + 1) < 1e-12' },
        { name: t`the satellite’s tensor is symmetric, with $I_{xx} \approx 34.0$ kg m²`, code: 'np.allclose(I, I.T) and abs(I[0, 0] - 34.02) < 0.01' },
        { name: 'moments are the eigenvalues, in ascending order', code: 'moments is not None and np.allclose(moments, np.linalg.eigvalsh(I)) and all(np.diff(moments) >= 0)' },
        { name: t`each column of \`axes\` is a principal axis: $I\mathbf a = \lambda\mathbf a$`, code: 'axes is not None and all(np.allclose(I @ axes[:, k], moments[k] * axes[:, k]) for k in range(3))' },
        { name: 'the principal axes are perpendicular unit vectors', code: 'axes is not None and np.allclose(axes.T @ axes, np.eye(3))' },
      ],
      hints: ['For one mass: `mk * (rk @ rk * np.eye(3) - np.outer(rk, rk))` — `rk @ rk` is |r|², and `np.outer(rk, rk)` is the matrix r rᵀ. Add one such term per mass.', '`moments, axes = np.linalg.eigh(I)`: `eigh` is the routine for symmetric matrices; it returns real eigenvalues in ascending order and orthonormal eigenvectors as columns.'],
      teach: 'The principal moments and axes of a body are the eigenvalues and eigenvectors of its (symmetric) inertia tensor.',
      explain: t`The products of inertia (the off-diagonal entries) are what make $\mathbf L = I\boldsymbol\omega$ point away from $\boldsymbol\omega$. \`eigh\` finds the three perpendicular directions where they vanish: in the basis of \`axes\` the tensor is diagonal — \`axes.T @ I @ axes\` is \`np.diag(moments)\`, a change of basis (LA-7.3) to the body's own principal frame. Attitude-control engineers compute exactly this from CAD mass models. (The origin here is a reference point, not exactly the centre of mass; dynamics uses the tensor about the centre of mass, but the eigen-calculation is the same.)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lambda', difficulty: 2,
      gen(r) {
        const { A, vecs, lams } = withEigen(r, r.pick(LAMS));
        const k = r.int(0, 1), v = intDir(vecs[k]).map((x) => -x);
        return {
          prompt: t`$\mathbf v = ${tupleTeX(v)}$ is an eigenvector of $A = ${matTeX(A)}$. Find its eigenvalue.`,
          answer: lams[k], tol: { rel: 0, abs: 0.01 },
          hints: [t`Compute $A\mathbf v$.`],
          teach: t`$\lambda$ is the factor in $A\mathbf v = \lambda\mathbf v$.`,
          explain: t`$A\mathbf v = ${tupleTeX(matvec(A, v))} = ${lams[k]}\,${tupleTeX(v)}$.`,
          visual: map2d(A, { view: 2.6 }),
        };
      },
    }),
    num({
      id: 'cp-inertia', difficulty: 3, transfer: true,
      gen(r) {
        const l1 = r.pick([50, 75, 100]), l2 = r.pick([125, 150, 200]);
        const [p, q] = r.pick([[3, 4], [4, 3], [4, -3], [3, -4]]);
        const Ixx = (p * p * l1 + q * q * l2) / 25, Iyy = (q * q * l1 + p * p * l2) / 25, Ixy = (p * q * (l1 - l2)) / 25;
        const I = [[Ixx, Ixy], [Ixy, Iyy]], ask = r.pick([[p, q, l1], [-q, p, l2]]);
        const v = [ask[0], ask[1]], Lv = matvec(I, v);
        return {
          prompt: t`In the plane of its solar arrays, a satellite's inertia tensor is $I = ${matTeX(I)}$ kg m². An engineer proposes to spin it about the axis along $${tupleTeX(v)}$. Check that this is a principal axis, and give its principal moment of inertia.`,
          answer: ask[2], units: 'kg m^2', tol: { rel: 0.002 },
          errors: [{ value: Lv[0], feedback: t`That is a component of $I\mathbf v$; divide by the matching component of $\mathbf v$ (here $${v[0]}$).` }, { value: I[0][0], feedback: t`$I_{xx}$ is the moment about the $x$-axis, which is not a principal axis here (the products of inertia are not zero).` }].filter((e) => Math.abs(e.value - ask[2]) > 0.01 * ask[2]),
          hints: [t`A principal axis is an eigenvector of $I$: compute $I\mathbf v$ and see whether it is a multiple of $\mathbf v$.`, t`$I${tupleTeX(v)} = ${tupleTeX(Lv)}$.`],
          teach: 'A principal axis is an eigenvector of the inertia tensor, and its eigenvalue is the moment of inertia about that axis.',
          explain: t`$I${tupleTeX(v)} = ${tupleTeX(Lv)} = ${ask[2]}${tupleTeX(v)}$: an eigenvector, so spinning about it keeps $\mathbf L$ along $\boldsymbol\omega$, with moment $${ask[2]}$ kg m². The other principal axis, perpendicular to it, has moment $${ask[2] === l1 ? l2 : l1}$ kg m² (the tensor is symmetric, so its principal axes are perpendicular — LA-11).`,
          visual: {
            type: 'calc-vectors3d',
            params: {
              range: 3,
              parallelograms: (() => {
                // the arrays lie along the axis of the smaller moment, (p, q)
                const u = [p / 5, q / 5, 0], n = [-q / 5, p / 5, 0], at = (a, b, z) => [a * u[0] + b * n[0], a * u[1] + b * n[1], z], sc = (w, k) => w.map((z) => z * k);
                return [
                  { at: at(-3, -0.45, 0), u: sc(u, 2.3), v: sc(n, 0.9), color: 'accent', alpha: 0.3 },
                  { at: at(0.7, -0.45, 0), u: sc(u, 2.3), v: sc(n, 0.9), color: 'accent', alpha: 0.3 },
                  { at: at(-0.5, -0.5, -0.4), u, v: n, color: 'gold', alpha: 0.3 },
                  { at: at(-0.5, -0.5, 0.4), u, v: n, color: 'gold', alpha: 0.3 },
                ];
              })(),
              segments: [{ from: [(-2.4 * v[0]) / Math.hypot(...v), (-2.4 * v[1]) / Math.hypot(...v), 0], to: [(2.4 * v[0]) / Math.hypot(...v), (2.4 * v[1]) / Math.hypot(...v), 0], color: 'warn', dash: true }],
              points: [{ at: [(2.5 * v[0]) / Math.hypot(...v), (2.5 * v[1]) / Math.hypot(...v), 0], color: 'warn', label: t`\text{axis}` }],
            },
            caption: 'A sketch, not to scale: the bus (gold) and the two solar arrays (blue) in the x–y plane, with the proposed spin axis (dashed). Drag to rotate.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-zero-vector', difficulty: 2,
      prompt: t`Why does the definition of an eigenvector insist that $\mathbf v \ne \mathbf 0$?`,
      choices: [
        t`Because $A\mathbf 0 = \lambda\mathbf 0$ for every number $\lambda$, so allowing $\mathbf 0$ would make every number an eigenvalue`,
        t`Because the zero vector is not in the space`,
        t`Because $\lambda$ would then have to be 0`,
        t`It does not matter: $\mathbf 0$ is an eigenvector of every matrix`,
      ],
      answer: 0,
      why: {
        1: t`$\mathbf 0$ is in every vector space — it is the one vector every subspace must contain.`,
        2: t`$A\mathbf 0 = \lambda\mathbf 0$ holds for *every* $\lambda$, not just 0 — that is the problem.`,
        3: 'If it were allowed, eigenvalues would carry no information at all.',
      },
      hints: [t`Try $\mathbf v = \mathbf 0$ in $A\mathbf v = \lambda\mathbf v$ with $\lambda = 7$, then with $\lambda = -2$.`],
      teach: 'Eigenvectors are nonzero, because the zero vector satisfies Av = λv for every λ.',
      explain: t`$A\mathbf 0 = \mathbf 0 = \lambda\mathbf 0$ for every $\lambda$. Excluding $\mathbf 0$ is what makes “$\lambda$ is an eigenvalue” mean something: some actual direction is stretched by exactly $\lambda$. (Eigen*values* may be 0; eigen*vectors* may not.)`,
      visual: map2d([[2, 1], [1, 2]], { view: 2.4, eigen: true, caption: 'A map with its eigenvector lines. Every line passes through the origin, but the origin alone carries no direction.' }),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §6.1', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC, Lecture 21: Eigenvalues and eigenvectors', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
    { label: 'Taylor, Classical Mechanics, §10.4–10.6 (principal axes)', url: 'https://uscibooks.aip.org/books/classical-mechanics/' },
  ],
});
