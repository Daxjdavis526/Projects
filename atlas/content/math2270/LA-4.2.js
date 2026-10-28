// The matrix of a linear map: its columns are the images of the standard
// basis vectors. Maps between spaces of different sizes, maps given by their
// images of a non-standard basis, the cross product as a matrix, the Jacobian.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { tupleTeX, matTeX, map2d } from './_la.js';
import { arrows2 } from './_spaces.js';

const t = String.raw;
const cosd = (d) => Math.cos((d * Math.PI) / 180), sind = (d) => Math.sin((d * Math.PI) / 180);
const ORD = ['first', 'second', 'third'];
// non-standard bases with determinant ±1, so the matrix comes out in whole numbers
const BASES = [[[1, 1], [1, 2]], [[2, 1], [1, 1]], [[1, 0], [1, 1]], [[1, 2], [0, 1]], [[1, -1], [0, 1]], [[1, 1], [0, 1]], [[3, 1], [2, 1]]];
// three reaction-control thrusters on a 2.4 m × 1.2 m craft (top view): position (m), unit force direction
const THRUSTERS = [{ at: [1.2, 0.6], dir: [0, -1] }, { at: [-1.2, 0.6], dir: [0, -1] }, { at: [-1.2, -0.6], dir: [1, 0] }];
const torqueArm = ({ at, dir }) => at[0] * dir[1] - at[1] * dir[0];

export default lesson({
  id: 'math2270.LA-4.2',
  title: 'The matrix of a linear map',
  minutes: 11, difficulty: 2,
  intro: t`Every linear map $T$ from $\mathbb R^n$ to $\mathbb R^m$ is multiplication by an $m\times n$ matrix — and you can write that matrix down by watching what $T$ does to the standard basis vectors. Column $j$ is the image of $\mathbf e_j$:

$$A = \big[\,T(\mathbf e_1)\ \ T(\mathbf e_2)\ \cdots\ T(\mathbf e_n)\,\big], \qquad T(\mathbf x) = A\mathbf x$$

The reason is superposition. Any $\mathbf x$ is $x_1\mathbf e_1 + \dots + x_n\mathbf e_n$, so $T(\mathbf x) = x_1T(\mathbf e_1) + \dots + x_nT(\mathbf e_n)$ — exactly the column picture of $A\mathbf x$. This is how a reflection, a camera’s projection, a spinning body’s velocity field or a spacecraft’s thruster layout becomes a grid of numbers.`,
  symbols: [
    { tex: t`T`, text: t`a linear map from $\mathbb R^n$ (inputs with $n$ components) to $\mathbb R^m$ (outputs with $m$ components)` },
    { tex: t`\mathbf e_j`, text: t`the $j$-th standard basis vector: $1$ in slot $j$, $0$ everywhere else (in the plane, $\mathbf e_1 = (1, 0)$ and $\mathbf e_2 = (0, 1)$)` },
    { tex: t`T(\mathbf e_j)`, text: t`its image, a vector with $m$ components — column $j$ of $A$` },
    { tex: 'A', text: t`the **standard matrix** of $T$: $m$ rows (one per output), $n$ columns (one per input)` },
    { tex: t`x_1, \dots, x_n`, text: t`the components of the input $\mathbf x$ — the weights on the columns` },
  ],
  why: 'Physics writes every linear relation this way: the rotation between two reference frames, the inertia tensor taking angular velocity to angular momentum, a Lorentz transformation — and, in general relativity, the Jacobian of a coordinate change, the matrix that transforms every vector’s components.',
  visual: {
    type: 'la-map2d',
    title: 'Ax is built from the columns',
    lead: t`The arrows $A\mathbf e_1$ and $A\mathbf e_2$ are the columns of $A$. Choose an input $\mathbf x$ with the sliders: its image is built tip to tail as $x_1$ copies of column 1 followed by $x_2$ copies of column 2. Drag the column tips and watch every image follow.`,
    tasks: [
      'With x = (2, 1), Ax is two copies of Ae₁ (green, dashed) then one of Ae₂ (orange, dashed): Ax = 2a₁ + a₂.',
      'Set x = (1, 0): Ax is the first column itself. Set x = (0, 1): the second. The columns are T(e₁) and T(e₂).',
      'Drag the tip of Ae₁ and watch the first column of the readout matrix change with it — and Ax with it.',
    ],
    params: {
      A: [[1.5, -1], [0.5, 1]], drag: true, snap: 0.5, x: ['x1', 'x2'], combo: true, view: 3.2, readout: ['A', 'x', 'Ax'],
      sliders: [
        { key: 'x1', label: t`Input component $x_1$`, min: -2, max: 3, step: 0.5, value: 2, explain: t`How many copies of column 1 go into $A\mathbf x$.` },
        { key: 'x2', label: t`Input component $x_2$`, min: -2, max: 3, step: 0.5, value: 1, explain: t`How many copies of column 2 go into $A\mathbf x$.` },
      ],
    },
    caption: 'Faint: the plane before the map; bold: after it. Green and orange: the columns a₁ = Ae₁ and a₂ = Ae₂ (drag their tips; they snap to half units). Gold: Ax, built tip to tail from x₁a₁ and x₂a₂.',
  },
  example: {
    prompt: t`Find the matrix of the reflection of the plane in the line through the origin at $30^\circ$ above the $x$-axis.`,
    visual: map2d([[0.5, 0.866], [0.866, -0.5]], { view: 1.9, eigen: true, colNames: ['T(e₁)', 'T(e₂)'], caption: 'The reflection: the faint F and its mirror image. Violet dashed: the mirror line (points on it stay put, λ = 1) and the perpendicular line (each point flips to the other side, λ = −1). Entries rounded to 3 decimals.' }),
    steps: [
      { label: 'Plan', text: t`$T$ is linear, so its matrix has columns $T(\mathbf e_1)$ and $T(\mathbf e_2)$. Find where the reflection sends each.` },
      { label: 'The rule', text: t`Reflecting in a line at angle $\varphi$ sends a unit arrow at angle $\alpha$ to the unit arrow at angle $2\varphi - \alpha$: it lands as far past the mirror as it started before it. Here $\varphi = 30^\circ$.` },
      { label: 'Column 1', text: t`$\mathbf e_1$ is at $0^\circ$, so it goes to $60^\circ$: $T(\mathbf e_1) = (\cos60^\circ, \sin60^\circ) = (\tfrac12, \tfrac{\sqrt3}{2})$.` },
      { label: 'Column 2', text: t`$\mathbf e_2$ is at $90^\circ$, so it goes to $60^\circ - 90^\circ = -30^\circ$: $T(\mathbf e_2) = (\cos(-30^\circ), \sin(-30^\circ)) = (\tfrac{\sqrt3}{2}, -\tfrac12)$.` },
      { label: 'Assemble', text: t`$$A = \begin{bmatrix} \tfrac12 & \tfrac{\sqrt3}{2} \\ \tfrac{\sqrt3}{2} & -\tfrac12 \end{bmatrix}$$` },
      { label: 'Check', text: t`Points on the mirror line must stay put: $A(\tfrac{\sqrt3}{2}, \tfrac12) = (\tfrac{\sqrt3}{4} + \tfrac{\sqrt3}{4},\ \tfrac34 - \tfrac14) = (\tfrac{\sqrt3}{2}, \tfrac12)$ ✓. In general the reflection in the line at angle $\varphi$ is $\begin{bmatrix} \cos2\varphi & \sin2\varphi \\ \sin2\varphi & -\cos2\varphi \end{bmatrix}$.` },
    ],
    answer: t`$A = \begin{bmatrix} \tfrac12 & \tfrac{\sqrt3}{2} \\ \tfrac{\sqrt3}{2} & -\tfrac12 \end{bmatrix}$ — its columns are where $\mathbf e_1$ and $\mathbf e_2$ land.`,
  },
  practice: [
    num({
      id: 'read-columns', difficulty: 1,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const A = [[r.int(-2, 2), r.int(-2, 2)], [r.int(-2, 2), r.int(-2, 2)]], i = r.int(0, 1), j = r.int(0, 1);
          if (A[0][0] * A[1][1] - A[0][1] * A[1][0] === 0 || A[i][j] === 0) continue;
          return {
            prompt: t`The picture shows a linear map of the plane: the arrows are the images of $\mathbf e_1$ and $\mathbf e_2$. What is the entry $a_{${i + 1}${j + 1}}$ (row ${i + 1}, column ${j + 1}) of its matrix?`,
            answer: A[i][j], tol: { rel: 0, abs: 0.01 },
            errors: i !== j && A[j][i] !== A[i][j] ? [{ value: A[j][i], feedback: t`That is $a_{${j + 1}${i + 1}}$. Column ${j + 1} is the image of $\mathbf e_${j + 1}$; row ${i + 1} picks its ${ORD[i]} component.` }] : [],
            hints: [t`Column ${j + 1} of the matrix is the arrow $A\mathbf e_${j + 1}$.`, t`Read the ${ORD[i]} (${i ? 'vertical' : 'horizontal'}) coordinate of the tip of $A\mathbf e_${j + 1}$ on the background grid.`],
            teach: 'The columns of a map’s matrix are the images of the basis vectors: read them straight off the picture.',
            explain: t`The tips are at $A\mathbf e_1 = ${tupleTeX([A[0][0], A[1][0]])}$ and $A\mathbf e_2 = ${tupleTeX([A[0][1], A[1][1]])}$, so $A = ${matTeX(A)}$ and $a_{${i + 1}${j + 1}} = ${A[i][j]}$.`,
            visual: map2d(A, { view: 2.6, caption: 'The map’s picture. Read the arrow tips against the fixed background grid (the axes with numbers), not the bent image grid.' }),
          };
        }
        return { prompt: t`Column 1 of a map's matrix is $(2, 1)$. What is $a_{21}$?`, answer: 1, hints: ['Row 2 of column 1.'], teach: 'Columns are images.', explain: t`$a_{21} = 1$.` };
      },
    }),
    mcq({
      id: 'size', difficulty: 1,
      prompt: t`A camera model maps a point $(x, y, z)$ in space linearly to a point $(u, v)$ on the image plane: $T:\mathbb R^3 \to \mathbb R^2$. What shape is its matrix?`,
      choices: [t`$2\times3$: two rows, three columns`, t`$3\times2$: three rows, two columns`, t`$3\times3$, because space is three-dimensional`, t`$2\times2$, because the image is flat`],
      answer: 0,
      why: {
        1: t`The columns are the images $T(\mathbf e_1)$, $T(\mathbf e_2)$, $T(\mathbf e_3)$: one column per input, each with 2 components. So 3 columns of height 2.`,
        2: t`A $3\times3$ matrix would produce 3 outputs. $T$ produces 2.`,
        3: t`A $2\times2$ matrix accepts only 2 inputs; $T$ needs all three of $x$, $y$, $z$.`,
      },
      hints: ['How many columns? One for each standard basis vector of the input space.', 'How tall is each column? As many components as an output has.'],
      teach: 'A linear map from ℝⁿ to ℝᵐ has an m×n matrix: n columns (one per input direction), each of height m.',
      explain: t`Three inputs give three columns $T(\mathbf e_1)$, $T(\mathbf e_2)$, $T(\mathbf e_3)$, and each is a point $(u, v)$ — so the matrix is $2\times3$. (A real pinhole camera divides by depth and is not linear; an orthographic camera, or a pinhole camera written in homogeneous coordinates, is.)`,
      visual: { type: 'calc-vectors3d', params: { range: 1.6, vectors: [{ to: [1.2, 0, 0], color: 'accent', label: t`\mathbf e_1` }, { to: [0, 1.2, 0], color: 'warn', label: t`\mathbf e_2` }, { to: [0, 0, 1.2], color: 'good', label: t`\mathbf e_3` }], planes: [{ normal: [0, 0, 1], d: 0, size: 1.4, color: 'violet', alpha: 0.18 }] }, caption: 'The three standard basis vectors of ℝ³ — the inputs whose images become the columns — and a flat image plane (violet). Drag to rotate.' },
    }),
    mcq({
      id: 'projection-line', difficulty: 2,
      prompt: t`Which matrix projects the plane onto the line $y = x$ (dropping each point perpendicularly onto the line)?`,
      choices: [t`$\begin{bmatrix} \tfrac12 & \tfrac12 \\ \tfrac12 & \tfrac12 \end{bmatrix}$`, t`$\begin{bmatrix} 1 & 1 \\ 1 & 1 \end{bmatrix}$`, t`$\begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix}$`, t`$\begin{bmatrix} \tfrac12 & -\tfrac12 \\ -\tfrac12 & \tfrac12 \end{bmatrix}$`],
      answer: 0,
      why: {
        1: t`That sends $\mathbf e_1$ to $(1, 1)$, which is longer than $\mathbf e_1$ itself. The foot of the perpendicular from $(1, 0)$ to the line is $(\tfrac12, \tfrac12)$.`,
        2: t`That swaps the coordinates: the *reflection* in $y = x$. A projection flattens the plane onto the line.`,
        3: t`That is the projection onto the other diagonal, $y = -x$: it sends $(1, 1)$ to $\mathbf 0$ instead of leaving it alone.`,
      },
      hints: [t`Find the images of $\mathbf e_1 = (1, 0)$ and $\mathbf e_2 = (0, 1)$: drop a perpendicular from each onto the line.`, t`The foot of the perpendicular from $(1, 0)$ to $y = x$ is the point of the line halfway between, $(\tfrac12, \tfrac12)$.`],
      teach: 'To find a projection’s matrix, project each basis vector and use the results as columns.',
      explain: t`$T(\mathbf e_1) = (\tfrac12, \tfrac12)$ and, by symmetry, $T(\mathbf e_2) = (\tfrac12, \tfrac12)$. Check: points on the line stay put, $A(1, 1) = (1, 1)$, and the perpendicular direction is flattened, $A(1, -1) = \mathbf 0$. Projecting twice changes nothing: $A^2 = A$.`,
      visual: arrows2([{ to: [1, 0], color: 'accent', label: 'e₁', labelDx: 4, labelDy: 12 }, { to: [0, 1], color: 'warn', label: 'e₂', labelDx: -22, labelDy: -6 }], { x: [-1.6, 2.4], y: [-1.2, 1.7], curves: [{ fn: 'x', color: 'violet', dash: true, label: 'y = x', labelAt: 1.45, labelDx: 8, labelDy: 6 }], caption: 'The basis vectors and the line y = x (violet dashed) they are projected onto.' }),
    }),
    num({
      id: 'cross-matrix', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const w = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], i = r.int(0, 2), j = r.int(0, 2);
          const W = [[0, -w[2], w[1]], [w[2], 0, -w[0]], [-w[1], w[0], 0]];
          if (i === j || W[i][j] === 0) continue;
          const col = [W[0][j], W[1][j], W[2][j]];
          return {
            prompt: t`A rigid body spins with angular velocity $\boldsymbol\omega = ${tupleTeX(w)}$ rad/s. The velocity of the point at position $\mathbf r$ is $\mathbf v = \boldsymbol\omega\times\mathbf r$, a linear map of $\mathbf r$. What is the entry in row ${i + 1}, column ${j + 1} of its $3\times3$ matrix?`,
            answer: W[i][j], tol: { rel: 0, abs: 0.01 },
            hints: [t`Column ${j + 1} is the image of $\mathbf e_${j + 1}$: compute $\boldsymbol\omega\times\mathbf e_${j + 1}$.`, t`$\boldsymbol\omega\times\mathbf e_${j + 1} = ${tupleTeX(col)}$ — now read its ${ORD[i]} component.`],
            teach: 'Any linear map has a matrix — even a cross product with a fixed vector; build it column by column from the images of e₁, e₂, e₃.',
            explain: t`The columns are $\boldsymbol\omega\times\mathbf e_1$, $\boldsymbol\omega\times\mathbf e_2$, $\boldsymbol\omega\times\mathbf e_3$: $$\begin{bmatrix} 0 & -\omega_3 & \omega_2 \\ \omega_3 & 0 & -\omega_1 \\ -\omega_2 & \omega_1 & 0 \end{bmatrix} = ${matTeX(W)}.$$ It is **antisymmetric** ($W^{\mathsf T} = -W$), which is why a rotation’s velocity field never stretches the body.`,
            visual: { type: 'calc-vectors3d', params: { range: 3, vectors: [{ to: w, color: 'gold', label: t`\boldsymbol\omega` }] }, caption: 'The angular-velocity vector ω (gold) along the spin axis, in rad/s. The body is not drawn. Drag to rotate.' },
          };
        }
        return { prompt: t`$\boldsymbol\omega = (0, 0, 1)$. Entry in row 2, column 1 of the matrix of $\mathbf r \mapsto \boldsymbol\omega\times\mathbf r$?`, answer: 1, hints: ['ω × e₁ = (0, 1, 0).'], teach: 'Columns are images.', explain: t`$\boldsymbol\omega\times\mathbf e_1 = (0, 1, 0)$.` };
      },
    }),
    num({
      id: 'basis-images', difficulty: 3,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const [v1, v2] = r.pick(BASES), p = [r.int(-3, 3), r.int(-3, 3)], q = [r.int(-3, 3), r.int(-3, 3)], i = r.int(0, 1), j = r.int(0, 1);
          const V = [[v1[0], v2[0]], [v1[1], v2[1]]], d = V[0][0] * V[1][1] - V[0][1] * V[1][0];
          const Vi = [[V[1][1] / d, -V[0][1] / d], [-V[1][0] / d, V[0][0] / d]];
          const TV = [[p[0], q[0]], [p[1], q[1]]];
          const A = TV.map((row) => [row[0] * Vi[0][0] + row[1] * Vi[1][0], row[0] * Vi[0][1] + row[1] * Vi[1][1]]);
          if (p.every((z) => !z) || q.every((z) => !z) || A[i][j] === 0 || A[i][j] === TV[i][j]) continue;
          const e = j === 0 ? [Vi[0][0], Vi[1][0]] : [Vi[0][1], Vi[1][1]];     // e_j = e[0] v1 + e[1] v2
          return {
            prompt: t`A linear map $T$ of the plane sends $\mathbf v_1 = ${tupleTeX(v1)}$ to $${tupleTeX(p)}$ and $\mathbf v_2 = ${tupleTeX(v2)}$ to $${tupleTeX(q)}$. Find the entry $a_{${i + 1}${j + 1}}$ of its standard matrix $A$.`,
            answer: A[i][j], tol: { rel: 0, abs: 0.01 },
            errors: [{ value: TV[i][j], feedback: t`That reads the images of $\mathbf v_1$, $\mathbf v_2$ as the columns — but the columns are the images of $\mathbf e_1$, $\mathbf e_2$. Write $\mathbf e_${j + 1}$ as a combination of $\mathbf v_1$ and $\mathbf v_2$ first.` }],
            hints: [t`Column ${j + 1} is $T(\mathbf e_${j + 1})$. Write $\mathbf e_${j + 1} = c_1\mathbf v_1 + c_2\mathbf v_2$.`, t`$\mathbf e_${j + 1} = (${nice(e[0])})\mathbf v_1 + (${nice(e[1])})\mathbf v_2$.`, t`So $T(\mathbf e_${j + 1}) = (${nice(e[0])})${tupleTeX(p)} + (${nice(e[1])})${tupleTeX(q)}$; read its ${ORD[i]} component.`],
            teach: 'When a map is known on a different basis, express each eᵢ in that basis; equivalently A = [T(v₁) T(v₂)][v₁ v₂]⁻¹.',
            explain: t`$\mathbf e_${j + 1} = (${nice(e[0])})\mathbf v_1 + (${nice(e[1])})\mathbf v_2$, so column ${j + 1} is $T(\mathbf e_${j + 1}) = ${tupleTeX([A[0][j], A[1][j]])}$. The whole matrix is $A = ${matTeX(TV)}${matTeX(V)}^{-1} = ${matTeX(A)}$ — check that $A\mathbf v_1 = ${tupleTeX(p)}$.`,
            visual: arrows2([
              { to: v1, color: 'accent', label: 'v₁', labelDx: 6, labelDy: -8 }, { to: v2, color: 'accent', label: 'v₂', labelDx: 6, labelDy: 10 },
              ...(p.some((z) => z) ? [{ to: p, color: 'warn', label: 'T(v₁)', labelDx: 6, labelDy: -8 }] : []),
              ...(q.some((z) => z) ? [{ to: q, color: 'warn', label: 'T(v₂)', labelDx: 6, labelDy: 10 }] : []),
            ], { caption: 'Blue: the vectors whose images are known. Orange: those images. The images of e₁ and e₂ are what you need.' }),
          };
        }
        return { prompt: t`$T(1, 1) = (2, 2)$ and $T(1, 2) = (2, 4)$. Find $a_{11}$.`, answer: 2, hints: ['e₁ = 2v₁ − v₂.'], teach: 'Express e₁ in the given basis.', explain: t`$T(\mathbf e_1) = 2(2, 2) - (2, 4) = (2, 0)$.` };
      },
    }),
    num({
      id: 'jacobian', difficulty: 3,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const th = r.pick([30, 45, 60, 120, 135, 150]), r0 = r.pick([1.5, 2, 2.5, 3]), [i, j] = r.pick([[0, 1], [1, 1], [0, 0], [1, 0]]);
          const J = [[cosd(th), -r0 * sind(th)], [sind(th), r0 * cosd(th)]];
          const slip = j === 1 ? [[0, -sind(th)], [0, cosd(th)]][i][1] : null;
          const P = [r0 * cosd(th), r0 * sind(th)];
          return {
            prompt: t`The polar-coordinate map $F(r, \theta) = (r\cos\theta,\ r\sin\theta)$ is not linear, but near any point it is almost linear: its best linear approximation, the derivative, has the **Jacobian matrix**, whose column 1 is $\big(\tfrac{\partial x}{\partial r}, \tfrac{\partial y}{\partial r}\big)$ (how $(x, y)$ moves as $r$ alone changes) and column 2 is $\big(\tfrac{\partial x}{\partial\theta}, \tfrac{\partial y}{\partial\theta}\big)$. At $r = ${r0}$, $\theta = ${th}^\circ$, what is the entry in row ${i + 1}, column ${j + 1}? Give 3 significant figures.`,
            answer: J[i][j], tol: { rel: 0.005, abs: 0.005 }, sigfigs: 3,
            errors: slip !== null && Math.abs(slip - J[i][j]) > 0.01 ? [{ value: slip, feedback: t`Differentiating $r\cos\theta$ or $r\sin\theta$ with respect to $\theta$ keeps the factor $r = ${r0}$.` }] : [],
            hints: [t`Hold $\theta$ fixed and differentiate with respect to $r$ for column 1; hold $r$ fixed and differentiate with respect to $\theta$ for column 2 (with $\theta$ in radians).`, t`Column 1 is $(\cos\theta, \sin\theta)$; column 2 is $(-r\sin\theta,\ r\cos\theta)$. Now put in $r = ${r0}$ and $\theta = ${th}^\circ$.`],
            teach: 'The derivative of a smooth map at a point is a linear map; its matrix, the Jacobian, has columns that say how the outputs move when one input moves.',
            explain: t`$J = \begin{bmatrix} \cos\theta & -r\sin\theta \\ \sin\theta & r\cos\theta \end{bmatrix} = \begin{bmatrix} ${nice(J[0][0], 3)} & ${nice(J[0][1], 3)} \\ ${nice(J[1][0], 3)} & ${nice(J[1][1], 3)} \end{bmatrix}$. Column 1 points straight outward along the ray; column 2 points along the circle, $r$ times longer — a small turn $\Delta\theta$ moves the point $r\,\Delta\theta$. In general relativity the Jacobian of a coordinate change, $\partial x'^{\mu}/\partial x^{\nu}$, is exactly the matrix that converts every vector’s components.`,
            visual: { type: 'graph', params: { x: [-3.6, 3.6], y: [-0.6, 3.6], aspect: 'wide', equal: true, xlabel: 'x', ylabel: 'y', curves: [{ param: [`${r0}*cos(t)`, `${r0}*sin(t)`], t: [0, Math.PI], color: 'ink3', dash: true, width: 1.4, label: `r = ${r0}`, labelAt: 0.25, labelDx: 6, labelDy: 0 }, { param: [`t*${cosd(th)}`, `t*${sind(th)}`], t: [0, 3.5], color: 'ink3', dash: true, width: 1.4 }], points: [{ x: P[0], y: P[1], color: 'gold', r: 5.5, label: `(r, θ) = (${r0}, ${th}°)`, labelDx: th > 90 ? -12 : 10, labelDy: -12, labelAlign: th > 90 ? 'right' : 'left' }] }, caption: 'The point, the circle r = constant through it and the ray θ = constant through it. The two Jacobian columns point along these two curves.' },
          };
        }
        return { prompt: t`Jacobian of polar coordinates at $r = 2$, $\theta = 0$: entry row 2, column 2?`, answer: 2, hints: ['r cos θ.'], teach: 'Jacobian columns.', explain: '2 cos 0 = 2.' };
      },
    }),
    code({
      id: 'matrix-of', difficulty: 2,
      prompt: t`Write a function \`matrix_of(T, n)\` that returns the matrix of a linear map \`T\` defined on $\mathbb R^n$ (a NumPy array): apply \`T\` to each standard basis vector and use the results as the columns. Then use it to set \`W\` to the matrix of $\mathbf r \mapsto \boldsymbol\omega\times\mathbf r$ for $\boldsymbol\omega = (0, 0, 2)$ rad/s, a body spinning about the $z$-axis.`,
      starter: t`import numpy as np

def matrix_of(T, n):
    # TODO: apply T to each column of the n x n identity matrix,
    # then stack the results side by side as columns
    pass

omega = np.array([0.0, 0.0, 2.0])
W = None     # TODO: the matrix of r -> np.cross(omega, r)
print(W)
`,
      answer: t`import numpy as np

def matrix_of(T, n):
    I = np.eye(n)
    return np.column_stack([T(I[:, j]) for j in range(n)])

omega = np.array([0.0, 0.0, 2.0])
W = matrix_of(lambda r: np.cross(omega, r), 3)
print(W)
`,
      tests: [
        { name: 'a quarter-turn rotation of the plane gives [[0, −1], [1, 0]]', code: 'np.allclose(matrix_of(lambda x: np.array([-x[1], x[0]]), 2), [[0, -1], [1, 0]])' },
        { name: 'a map from ℝ³ to ℝ² gives a 2 × 3 matrix', code: 'np.allclose(matrix_of(lambda x: np.array([x[0] + 2*x[2], 3*x[1]]), 3), [[1, 0, 2], [0, 3, 0]])' },
        { name: 'W is [[0, −2, 0], [2, 0, 0], [0, 0, 0]]', code: 'np.allclose(W, [[0, -2, 0], [2, 0, 0], [0, 0, 0]])' },
        { name: 'W times r is the velocity ω × r', code: 'np.allclose(W @ np.array([1.0, 2.0, 3.0]), np.cross(omega, [1.0, 2.0, 3.0]))' },
      ],
      hints: [t`\`np.eye(n)\` is the identity; its column \`j\` is the basis vector $\mathbf e_{j+1}$ (Python counts from 0).`, t`\`np.column_stack([T(I[:, j]) for j in range(n)])\` puts the images side by side as columns.`],
      teach: 'Computing a map’s matrix is mechanical: feed it the standard basis vectors one at a time and stack the answers as columns.',
      explain: t`\`matrix_of\` is the definition of the standard matrix in code. For the spin, $\boldsymbol\omega\times\mathbf e_1 = (0, 2, 0)$ and $\boldsymbol\omega\times\mathbf e_2 = (-2, 0, 0)$, while $\boldsymbol\omega\times\mathbf e_3 = \mathbf 0$ — points on the axis do not move.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-reflect', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const phi = r.pick([15, 22.5, 60, 75, 105, 120, 150]), i = r.int(0, 1), j = r.int(0, 1);
          const A = [[cosd(2 * phi), sind(2 * phi)], [sind(2 * phi), -cosd(2 * phi)]];
          if (Math.abs(A[i][j]) < 0.05) continue;
          const L = 2.2;
          return {
            prompt: t`Find the entry $a_{${i + 1}${j + 1}}$ of the matrix that reflects the plane in the line through the origin at $${phi}^\circ$ to the $x$-axis. Give 3 significant figures.`,
            answer: A[i][j], tol: { rel: 0.005, abs: 0.005 }, sigfigs: 3,
            hints: [t`Column ${j + 1} is the image of $\mathbf e_${j + 1}$, at angle ${j ? '$90^\\circ$' : '$0^\\circ$'}. A reflection in the line at angle $\varphi$ sends angle $\alpha$ to $2\varphi - \alpha$.`],
            teach: 'Build a reflection’s matrix from the images of e₁ and e₂: each lands as far past the mirror line as it started before it.',
            explain: t`$\mathbf e_1$ goes to angle $${2 * phi}^\circ$ and $\mathbf e_2$ to $${2 * phi - 90}^\circ$, so $A = \begin{bmatrix} \cos${2 * phi}^\circ & \sin${2 * phi}^\circ \\ \sin${2 * phi}^\circ & -\cos${2 * phi}^\circ \end{bmatrix} \approx \begin{bmatrix} ${nice(A[0][0], 3)} & ${nice(A[0][1], 3)} \\ ${nice(A[1][0], 3)} & ${nice(A[1][1], 3)} \end{bmatrix}$.`,
            visual: arrows2([{ to: [1, 0], color: 'accent', label: 'e₁', labelDx: 4, labelDy: 12 }, { to: [0, 1], color: 'warn', label: 'e₂', labelDx: -22, labelDy: -6 }], { x: [-2.4, 2.4], y: [-1.3, 1.3], curves: [{ param: [`t*${cosd(phi)}`, `t*${sind(phi)}`], t: [-L, L], color: 'violet', dash: true, label: 'mirror', labelAt: phi > 70 && phi < 110 ? 1.15 : 1.6, labelDx: 8, labelDy: 0 }], caption: `The mirror line at ${phi}° (violet dashed) and the basis vectors to reflect.` }),
          };
        }
        return { prompt: t`Reflection in the line at $60^\circ$: entry $a_{11}$?`, answer: -0.5, hints: ['cos 120°.'], teach: 'Columns are images.', explain: t`$\cos120^\circ = -0.5$.` };
      },
    }),
    mcq({
      id: 'cp-formula', difficulty: 1,
      prompt: t`What is the standard matrix of $T(x, y, z) = (x - 2z,\ 3y + z)$?`,
      choices: [t`$\begin{bmatrix} 1 & 0 & -2 \\ 0 & 3 & 1 \end{bmatrix}$`, t`$\begin{bmatrix} 1 & 0 \\ 0 & 3 \\ -2 & 1 \end{bmatrix}$`, t`$\begin{bmatrix} 1 & -2 \\ 3 & 1 \end{bmatrix}$`, t`$\begin{bmatrix} 1 & 0 & -2 \\ 0 & 3 & 1 \\ 0 & 0 & 0 \end{bmatrix}$`],
      answer: 0,
      why: {
        1: t`That is the transpose. Column $j$ must be $T(\mathbf e_j)$: $T(1, 0, 0) = (1, 0)$, a column of height 2.`,
        2: t`Each row needs a slot for every input: the first output $x - 2z$ is $1x + 0y - 2z$, so its row is $(1, 0, -2)$, not $(1, -2)$.`,
        3: t`$T$ has two outputs, so its matrix has two rows. A row of zeros would add a third output that is always 0 — a different map, into $\mathbb R^3$.`,
      },
      hints: [t`Compute $T(\mathbf e_1)$, $T(\mathbf e_2)$ and $T(\mathbf e_3)$; they are the columns.`],
      teach: 'Column j is T(eⱼ); equivalently, row i lists the coefficients of every input in output i, zeros included.',
      explain: t`$T(\mathbf e_1) = (1, 0)$, $T(\mathbf e_2) = (0, 3)$, $T(\mathbf e_3) = (-2, 1)$. Side by side they make the $2\times3$ matrix $\begin{bmatrix} 1 & 0 & -2 \\ 0 & 3 & 1 \end{bmatrix}$.`,
    }),
    num({
      id: 'cp-thrusters', difficulty: 3, transfer: true,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const F = [r.pick([5, 10, 22]), r.pick([5, 10, 22]), r.pick([5, 10, 22])], u = [r.pick([0, 0.25, 0.5, 1]), r.pick([0, 0.25, 0.5, 1]), r.pick([0, 0.5, 1])];
          const arm = THRUSTERS.map(torqueArm), col3 = F.map((f, j) => f * arm[j]);
          const tau = col3.reduce((s, c, j) => s + c * u[j], 0);
          if (Math.abs(tau) < 0.5 || u.filter((x) => x > 0).length < 2) continue;
          const naive = F.reduce((s, f, j) => s + f * u[j], 0) * 1.2;
          const body = [[-1.2, -0.6], [1.2, -0.6], [1.2, 0.6], [-1.2, 0.6], [-1.2, -0.6]];
          return {
            prompt: t`A small spacecraft (top view in the picture) has three reaction-control thrusters. Thruster 1 at $(1.2, 0.6)$ m and thruster 2 at $(-1.2, 0.6)$ m each push the craft in the $-y$ direction; thruster 3 at $(-1.2, -0.6)$ m pushes in $+x$. Their full thrusts are ${F[0]}, ${F[1]} and ${F[2]} N. The map from throttle settings $\mathbf u = (u_1, u_2, u_3)$ to the net force and torque $(F_x, F_y, \tau)$ is linear; column $j$ of its matrix is what thruster $j$ alone does at full throttle. Find the net torque $\tau$ about the centre of mass (counterclockwise positive) for $\mathbf u = (${u.join(', ')})$, in N·m.`,
            answer: tau, units: 'N m', tol: { rel: 0.005, abs: 0.01 },
            errors: Math.abs(naive - tau) > 0.05 ? [{ value: naive, feedback: t`Each thruster has its own lever arm and turning sense: its torque is $x F_y - y F_x$, with signs, and thruster 3’s arm is 0.6 m.` }] : [],
            hints: [t`Row 3 of the matrix holds each thruster’s full-thrust torque, $\tau_j = x_jF_{y,j} - y_jF_{x,j}$.`, t`Thruster 1: $1.2\cdot(-${F[0]}) = ${nice(col3[0])}$ N·m; thruster 2: $(-1.2)(-${F[1]}) = ${nice(col3[1])}$ N·m; thruster 3: $-(-0.6)(${F[2]}) = ${nice(col3[2])}$ N·m.`, t`Then $\tau = ${nice(col3[0])}u_1 + ${nice(col3[1])}u_2 + ${nice(col3[2])}u_3$.`],
            teach: 'A thruster layout is a linear map from throttles to force and torque; its columns are what each thruster does alone, and flight software inverts it to choose which thrusters to fire.',
            explain: t`The third row of the matrix is $(${col3.map((c) => nice(c)).join(',\\ ')})$ N·m, so $\tau = ${col3.map((c, j) => `(${nice(c)})(${u[j]})`).join(' + ')} = ${nice(tau, 4)}$ N·m. The full matrix is $$\begin{bmatrix} 0 & 0 & ${F[2]} \\ -${F[0]} & -${F[1]} & 0 \\ ${nice(col3[0])} & ${nice(col3[1])} & ${nice(col3[2])} \end{bmatrix}$$ and real flight software solves the reverse problem — which throttles give the force and torque it wants — usually with more thrusters than unknowns and the extra condition that no throttle is negative.`,
            visual: {
              type: 'graph',
              params: {
                x: [-2.2, 2.2], y: [-1.4, 1.4], aspect: 'wide', equal: true, xlabel: 'x (m)', ylabel: 'y (m)', axesAt: 'edge',
                curves: body.slice(0, 4).map((p, k) => ({ param: [`${p[0]} + t*(${body[k + 1][0] - p[0]})`, `${p[1]} + t*(${body[k + 1][1] - p[1]})`], t: [0, 1], color: 'ink3', width: 1.8 })),
                points: [{ x: 0, y: 0, color: 'ink2', r: 4, label: 'centre of mass', labelDx: 8, labelDy: 12 }, ...THRUSTERS.map((th, j) => ({ x: th.at[0], y: th.at[1], color: 'gold', r: 5, label: String(j + 1), labelDx: th.at[0] > 0 ? 8 : -16, labelDy: th.at[1] > 0 ? -12 : 14 }))],
                arrows: THRUSTERS.map((th) => ({ from: th.at, to: [th.at[0] + 0.55 * th.dir[0], th.at[1] + 0.55 * th.dir[1]], color: 'warn', width: 2.4 })),
              },
              caption: 'Top view of the craft (grey outline), its centre of mass and the three thrusters (gold). Orange arrows: the direction each thruster pushes the craft — its exhaust leaves the other way. Arrow lengths do not show thrust.',
            },
          };
        }
        return { prompt: t`Thrusters with torques $-12$, $12$ and $6$ N·m at full thrust; $\mathbf u = (1, 0, 1)$. Net torque?`, answer: -6, units: 'N m', hints: ['Add with weights.', '−12 + 6.'], teach: 'Row 3 dotted with u.', explain: t`$-12 + 6 = -6$ N·m.` };
      },
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §8.2', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Lay, Lay & McDonald, Linear Algebra and Its Applications (6th ed.), §1.9', url: 'https://www.pearson.com/en-us/subject-catalog/p/linear-algebra-and-its-applications/P200000006235/9780135851203' },
  ],
});
