// Principal axes (Taylor §10.4–10.5): the directions where L ∥ ω are the
// eigenvectors of the inertia tensor, Iê = λê, found from det(I − λ1) = 0;
// a real symmetric I always has three real principal moments and three
// perpendicular principal axes, and in those axes I is diagonal, L = (λ₁ω₁,
// λ₂ω₂, λ₃ω₃), T = ½Σλᵢωᵢ². Shortcuts: the normal to a mirror plane and a
// symmetry axis are principal; a symmetric body has a whole plane of them.
// Worked: M7.1's one-winged satellite — x principal by its mirror, the yz
// block's quadratic, the minor axis 11.1° from y toward the wing, and the bus's
// long axis turning out to be the INTERMEDIATE axis (a teaser for M7.4).
// Explore: la-map2d with the yz block as a map ω ↦ L; L ∥ ω only on the eigen-lines.
// Practice: symmetry shortcuts, an L-bracket about its CM (1/12 and 1/3 of mℓ²),
// a 2×2 block's moments, the cube about its corner (Ma²/6 about the diagonal),
// testing a candidate axis, the trace, the order of steps. Transfer: a
// spinner's magnetometer boom tilting its major axis.
// Links (not reused): math2270.LA-11.1 (spectral theorem), prog.P3.3 (eigh),
// math2270 boss (principal angle of a 2×2 block — not repeated here).
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { sci, r6, gpic, seg, lab, distinct } from './_cm.js';
import { SAT, satScene, boxFaces, matTeX, eigSym, tensorOf, pointPart, mvec } from './_cm4.js';

const t = String.raw;
const DEG = Math.PI / 180;

const [IXX, IYY, IZZ, IYZ] = [SAT.I[0][0], SAT.I[1][1], SAT.I[2][2], SAT.I[1][2]];
const EX = (() => {
  const tr = IYY + IZZ, det = IYY * IZZ - IYZ * IYZ, disc = Math.sqrt((tr / 2) ** 2 - det);
  const l1 = tr / 2 - disc, l2 = tr / 2 + disc;
  const v = SAT.vecs[0], sg = Math.sign(v[1]), th = Math.atan2(sg * v[2], sg * v[1]) / DEG;   // angle of the l1 axis from +y toward +z
  const e1 = [0, Math.cos(th * DEG), Math.sin(th * DEG)], e2 = [0, -Math.sin(th * DEG), Math.cos(th * DEG)];
  return { tr, det, l1, l2, th, e1, e2, Ie1: mvec(SAT.I, e1) };
})();

// the satellite with its principal axes drawn through the centre of mass
function satAxesPic(caption, { labels = true } = {}) {
  const L = 2.4, ax = (v, color, name) => ({ point: [0, 0, 0], dir: v.map(r6), t: [-L, L], color, ...(labels ? { label: name } : {}) });
  return { type: 'calc-vectors3d', params: satScene({ extra: { grid: false, axes: false, scale: 1.2, lines: [ax(EX.e1, 'accent', '\\hat e_1'), ax(EX.e2, 'teal', '\\hat e_2'), ax([1, 0, 0], 'violet', '\\hat e_3')] } }), caption };
}

// a 2×2 block as a map of ω onto L: a unit circle of ω's and its image
const blockMap = (A, extra = {}, caption = t`The $2\times2$ block as a map, in units of 100 kg·m²: unit $\vec\omega$'s in the plane (faint circle) and their $\vec L$'s (bold ellipse).`) => ({ type: 'la-map2d', params: { A, shape: 'circle', grid: false, columns: false, readout: false, view: 2.6, ...extra }, caption });

export default lesson({
  id: 'phys3550.M7.2',
  title: 'Principal axes',
  minutes: 16, difficulty: 3,
  intro: t`[M7.1](#/lesson/phys3550.M7.1) showed $\vec L = \mathbf I\vec\omega$ leaning away from $\vec\omega$. But for every rigid body there are **three perpendicular directions where it does not lean**: spin about one of them and $\vec L$ lies exactly along $\vec\omega$. Those are the **principal axes**, and the factor $\lambda$ that $\mathbf I$ stretches them by is the **principal moment** about each. In linear-algebra words they are the eigenvectors and eigenvalues of $\mathbf I$, and because $\mathbf I$ is real and symmetric the three $\lambda$'s are always real and the three axes always perpendicular. Use them as your body axes and the tensor becomes diagonal: $L_1 = \lambda_1\omega_1$, $L_2 = \lambda_2\omega_2$, $L_3 = \lambda_3\omega_3$ — every rigid body, however lopsided, behaves like three independent moments of inertia.`,
  equation: t`\mathbf I\,\hat e = \lambda\,\hat e \quad\Longleftrightarrow\quad \det(\mathbf I - \lambda\mathbf 1) = 0`,
  symbols: [
    { tex: '\\mathbf I', text: 'the inertia tensor about the centre of mass (or a fixed point), kg·m²' },
    { tex: '\\hat e', text: 'a **principal axis**: a unit vector that $\\mathbf I$ only stretches, never turns' },
    { tex: '\\lambda', text: 'the **principal moment** about that axis, kg·m² — the moment of inertia for a spin about it' },
    { tex: '\\mathbf 1', text: 'the $3\\times3$ identity matrix' },
    { tex: '\\det(\\mathbf I - \\lambda\\mathbf 1) = 0', text: 'the characteristic equation: a cubic in $\\lambda$ whose three roots are the principal moments' },
  ],
  why: t`Spacecraft are designed, balanced and spun about principal axes; the stability of a spin depends on whether its axis has the largest, smallest or middle principal moment ([M7.4](#/lesson/phys3550.M7.4)). And "find the frame where a symmetric tensor is diagonal" returns in normal modes ([M8.2](#/lesson/phys3550.M8.2)), stress and the metric of general relativity.`,
  visual: {
    type: 'la-map2d',
    title: 'Where L lines up with ω',
    lead: t`The $yz$ part of the satellite's tensor from [M7.1](#/lesson/phys3550.M7.1), in units of 100 kg·m², as a map: every unit $\vec\omega$ in the $yz$-plane (the faint circle) is sent to its $\vec L$ (the bold ellipse). Turn $\vec\omega$ with the slider and compare the two arrows.`,
    tasks: [
      t`At $\theta = 0$ ($\vec\omega$ along $y$), $\vec L$ is turned toward $-z$ and shorter: the product of inertia at work.`,
      t`Find the two angles where $\vec L$ points along $\vec\omega$: near $11^\circ$ and $101^\circ$. They are the dashed eigen-lines — and they are perpendicular.`,
      t`The ellipse's longest and shortest radii lie on the same dashed lines: the principal moments are the largest and smallest stretches.`,
    ],
    params: {
      A: [[r6(IYY / 100), r6(IYZ / 100)], [r6(IYZ / 100), r6(IZZ / 100)]], shape: 'circle', grid: false, ghost: true, columns: false, eigen: true, view: 2.6,
      sliders: [{ key: 'th', label: 'Direction of $\\vec\\omega$, $\\theta$ from $y$', min: 0, max: 180, step: 0.5, value: 0, unit: '^\\circ', explain: 'The angle of the unit $\\vec\\omega$ from body $+y$ toward $+z$.' }],
      x: ['cos(th*pi/180)', 'sin(th*pi/180)'], xName: 'ω', imageName: 'L', readout: ['A', 'x', 'Ax'],
    },
    caption: t`Horizontal: the $y$ components; vertical: the $z$ components. $\vec L$ is in units of 100 kg·m²/s for a unit $\vec\omega$ (1 rad/s). The $x$ direction, already principal, is left out.`,
  },
  example: {
    prompt: t`Find the principal moments and axes of [M7.1](#/lesson/phys3550.M7.1)'s satellite, $$\mathbf I = ${matTeX(SAT.I, 4)}\ \text{kg m}^2.$$ Which body direction is closest to each axis?`,
    visual: satAxesPic(t`The satellite with its three principal axes through the centre of mass. $\hat e_1$ (blue) leans toward the wing; $\hat e_2$ (teal) is nearly the bus's long axis. Drag to turn.`),
    steps: [
      { label: 'Use the symmetry', text: t`The $x$ row and column hold only $I_{xx}$, so $\mathbf I\hat x = ${sci(IXX, 4)}\,\hat x$: the normal to the mirror plane is a principal axis, with $\lambda = ${sci(IXX, 4)}$ kg·m². What is left is the $2\times2$ block in $y$ and $z$.` },
      { label: 'Characteristic equation', text: t`$\det\begin{bmatrix} ${sci(IYY, 4)} - \lambda & ${sci(IYZ, 4)} \\ ${sci(IYZ, 4)} & ${sci(IZZ, 4)} - \lambda \end{bmatrix} = 0$ gives $\lambda^2 - ${sci(EX.tr, 4)}\,\lambda + ${sci(EX.det, 5)} = 0$: the sum of the roots is the trace, their product the determinant.` },
      { label: 'Roots', text: t`$\lambda = \tfrac12(${sci(EX.tr, 4)}) \pm \sqrt{(${sci(EX.tr / 2, 4)})^2 - ${sci(EX.det, 5)}}$, so $\lambda_1 = ${sci(EX.l1, 3)}$ and $\lambda_2 = ${sci(EX.l2, 4)}$ kg·m². With $\lambda_3 = ${sci(IXX, 4)}$ about $x$, the order is $\lambda_1 < \lambda_2 < \lambda_3$.` },
      { label: 'Axes', text: t`For $\lambda_1$: $(I_{yy} - \lambda_1)e_y + I_{yz}e_z = 0$, so $e_z/e_y = (\lambda_1 - I_{yy})/I_{yz} = ${sci(Math.tan(EX.th * DEG), 3)}$: $\hat e_1$ lies $${sci(EX.th, 3)}^\circ$ from $+y$ toward $+z$. $\hat e_2$ is perpendicular to it in the $yz$-plane, $${sci(EX.th, 3)}^\circ$ from $+z$; $\hat e_3 = \hat x$.` },
      { label: 'Check', text: t`$\mathbf I\hat e_1 = (0,\ ${sci(EX.Ie1[1], 4)},\ ${sci(EX.Ie1[2], 3)})$, which is $${sci(EX.l1, 3)}\times(0,\ ${sci(EX.e1[1], 4)},\ ${sci(EX.e1[2], 3)})$ ✓: stretched, not turned. And $\lambda_1 + \lambda_2 = ${sci(EX.l1 + EX.l2, 4)} = I_{yy} + I_{zz}$ ✓.` },
      { label: 'Read it', text: t`The smallest moment belongs to the axis along which the mass is strung out — toward the wing, tipped up because the wing sits above the centre. The surprise is $\hat e_2$, almost the bus's long axis: it has the **middle** moment. Spinning the satellite about its long axis would be spinning about its intermediate axis, which [M7.4](#/lesson/phys3550.M7.4) shows is unstable.` },
    ],
    answer: t`$\lambda_1 = ${sci(EX.l1, 3)}$ kg·m² about an axis $${sci(EX.th, 3)}^\circ$ from $+y$ toward $+z$ (toward the wing); $\lambda_2 = ${sci(EX.l2, 4)}$ kg·m² about the perpendicular axis $${sci(EX.th, 3)}^\circ$ from the bus's long axis; $\lambda_3 = ${sci(IXX, 4)}$ kg·m² about $x$.`,
  },
  practice: [
    multi({
      id: 'sym-shortcuts', difficulty: 1,
      prompt: t`A uniform rectangular block has edges of three different lengths. Which of these lines through its centre are principal axes?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.8, grid: false, scale: 1.3, parallelograms: boxFaces([2.4, 1.4, 0.8], [0, 0, 0], 'accent', 0.22) }, caption: t`A uniform block centred on the origin, edges along the axes. Drag to turn.` },
      choices: [t`The line through the centres of two opposite faces, parallel to an edge`, t`Each of the other two lines parallel to an edge`, t`A body diagonal, from one corner to the opposite corner`, t`A line parallel to the long edges but passing 10 cm off the centre`],
      answer: [0, 1],
      why: { 2: t`Spin it about a body diagonal and $\vec L$ leans: with three different edge lengths, $I_{xx}$, $I_{yy}$ and $I_{zz}$ differ, so $\mathbf I(1, 1, 1) \propto (I_{xx}, I_{yy}, I_{zz})$ is not along $(1, 1, 1)$. (For a cube it would be.)`, 3: t`Principal axes about the centre of mass pass through the centre of mass. About a different point the tensor changes (parallel-axis theorem), and so do its axes.` },
      hints: [t`A block has three mirror planes. The normal to a mirror plane is always a principal axis.`],
      teach: t`The normal to every mirror plane, and every axis of symmetry, is a principal axis — no algebra needed.`,
      explain: t`The three mirror planes kill every product of inertia, so the tensor about the centre is already diagonal in the edge directions: those three lines are the principal axes. A body diagonal is principal only if the moments it mixes are equal, as for a cube.`,
    }),
    num({
      id: 'L-bracket', difficulty: 3,
      gen(r) {
        const m = r.pick([0.2, 0.3, 0.5, 0.8]), l = r.pick([0.2, 0.3, 0.4, 0.5]);
        const small = (m * l * l) / 12;
        return {
          prompt: t`An L-shaped bracket is two thin uniform rods, each of mass ${m} kg and length ${l} m, joined at a right-angled corner: one along $+x$ from the origin, one along $+y$. About its centre of mass, $(\ell/4, \ell/4)$, its in-plane tensor is $$\begin{bmatrix} I_{xx} & I_{xy} \\ I_{xy} & I_{yy} \end{bmatrix} = \begin{bmatrix} 5/24 & 1/8 \\ 1/8 & 5/24 \end{bmatrix} m\ell^2.$$ Find the **smaller** in-plane principal moment.`,
          answer: small, units: 'kg m^2', tol: { rel: 0.005 },
          errors: distinct([{ value: (5 * m * l * l) / 24, feedback: t`That is a diagonal element, the moment about the $x$-direction through the centre of mass. The product of inertia is not zero, so $x$ is not a principal axis.` }, { value: (m * l * l) / 3, feedback: t`That is the larger principal moment, $(\tfrac{5}{24} + \tfrac18)m\ell^2$, about the line $y = x$.` }, { value: (m * l * l) / 8, feedback: t`$\tfrac18$ is the product of inertia. The eigenvalues of $\begin{bmatrix} a & c \\ c & a \end{bmatrix}$ are $a \pm c$.` }], small),
          hints: [t`The bracket is mirror-symmetric across the line $y = x$, so that line and the one perpendicular to it are the principal directions.`, t`For $\begin{bmatrix} a & c \\ c & a \end{bmatrix}$ the eigenvectors are $(1, 1)$ and $(1, -1)$ with eigenvalues $a + c$ and $a - c$.`],
          teach: t`Equal diagonal elements put the principal axes at $45^\circ$, along the body's line of mirror symmetry and across it.`,
          explain: t`$\lambda = \left(\tfrac{5}{24} - \tfrac18\right)m\ell^2 = \tfrac{1}{12}m\ell^2 = ${sci(small, 3)}$ kg·m², about the axis along $(1, -1)$: the mass lies close to that line through the centre of mass. The larger one, $\tfrac13m\ell^2$, is about the mirror line $y = x$, from which the rods' far ends stand well off.`,
          visual: gpic({ x: [-0.25, 1.15], y: [-0.25, 1.15], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg([0, 0], [1, 0], 'accent', 6), seg([0, 0], [0, 1], 'accent', 6), seg([-0.15, -0.15], [1.05, 1.05], 'ink3', 1, true), seg([-0.15, 0.65], [0.65, -0.15], 'ink3', 1, true)], points: [{ x: 0.25, y: 0.25, color: 'gold', r: 5, label: 'CM', labelDx: 8, labelDy: -10 }, lab(1.05, 0.08, 'x', 'ink3'), lab(0.08, 1.08, 'y', 'ink3')] }, t`The bracket (blue), its centre of mass and two dashed lines through it at $45^\circ$. Not to scale.`, 'An L-shaped bracket with two diagonal lines through its centre of mass'),
        };
      },
    }),
    num({
      id: 'block-2x2', difficulty: 2,
      gen(r) {
        const a = r.pick([40, 60, 80]), b = r.pick([120, 150, 180]), c = r.pick([-30, -20, 20, 30]);
        const big = (a + b) / 2 + Math.sqrt(((a - b) / 2) ** 2 + c * c);
        return {
          prompt: t`A satellite is mirror-symmetric across its $z = 0$ plane, so $z$ is a principal axis. The rest of its inertia tensor about the centre of mass is $$\begin{bmatrix} I_{xx} & I_{xy} \\ I_{xy} & I_{yy} \end{bmatrix} = \begin{bmatrix} ${a} & ${c} \\ ${c} & ${b} \end{bmatrix}\ \text{kg m}^2.$$ Find the larger of its two principal moments in the $xy$-plane.`,
          answer: big, units: 'kg m^2', tol: { rel: 0.003 },
          errors: distinct([{ value: b, feedback: t`$I_{yy}$ is the moment about the $y$-axis, which is not principal while $I_{xy} \ne 0$. The principal moment is a little larger.` }, { value: b + Math.abs(c), feedback: t`Adding the product is right only when the diagonal elements are equal. Solve $\lambda^2 - (a + b)\lambda + (ab - c^2) = 0$.` }, { value: (a + b) / 2 + Math.sqrt(((a - b) / 2) ** 2 - c * c), feedback: t`The discriminant is $\left(\frac{a - b}{2}\right)^2 + c^2$: the product of inertia pushes the moments apart, never together.` }], big),
          hints: [t`$\det\begin{bmatrix} a - \lambda & c \\ c & b - \lambda \end{bmatrix} = 0$.`, t`$\lambda = \frac{a + b}{2} \pm \sqrt{\left(\frac{a - b}{2}\right)^2 + c^2}$.`],
          teach: t`For a symmetric $2\times2$ block the principal moments sit symmetrically about the mean of the diagonal, pushed apart by the product of inertia.`,
          explain: t`$\lambda = \frac{${a + b}}{2} + \sqrt{${(a - b) / 2}^2 + ${c}^2} = ${sci(big, 4)}$ kg·m². The two moments always straddle the diagonal elements: the largest principal moment is at least the largest diagonal entry.`,
          visual: blockMap([[r6(a / 100), r6(c / 100)], [r6(c / 100), r6(b / 100)]]),
        };
      },
    }),
    num({
      id: 'cube-diagonal', difficulty: 3,
      gen(r) {
        const M = r.pick([2, 4, 6]), a = r.pick([0.2, 0.3, 0.5]);
        const ans = (M * a * a) / 6;
        return {
          prompt: t`A uniform cube (mass ${M} kg, edge ${a} m) has, about one corner and with axes along its edges, $$\mathbf I = Ma^2\begin{bmatrix} \tfrac23 & -\tfrac14 & -\tfrac14 \\ -\tfrac14 & \tfrac23 & -\tfrac14 \\ -\tfrac14 & -\tfrac14 & \tfrac23 \end{bmatrix}.$$ The body diagonal $(1, 1, 1)$ is a principal axis. Find the principal moment about it.`,
          answer: ans, units: 'kg m^2', tol: { rel: 0.005 },
          errors: distinct([{ value: (2 * M * a * a) / 3, feedback: t`$\tfrac23Ma^2$ is $I_{xx}$, about an edge. Multiply $\mathbf I$ by $(1, 1, 1)$ and read off the stretch.` }, { value: (11 * M * a * a) / 12, feedback: t`$\tfrac{11}{12}Ma^2$ is the other principal moment (twice), about any axis through the corner perpendicular to the diagonal.` }, { value: (M * a * a) / 3, feedback: t`Each row sums to $\tfrac23 - \tfrac14 - \tfrac14$: both products count.` }], ans),
          hints: [t`Compute $\mathbf I(1, 1, 1)$: each component is a row sum.`, t`Row sum $= \tfrac23 - \tfrac14 - \tfrac14 = \tfrac16$, so $\mathbf I(1,1,1) = \tfrac16Ma^2(1,1,1)$.`],
          teach: t`To test a candidate axis, multiply: if $\mathbf I\hat e$ comes out parallel to $\hat e$, the stretch is the principal moment.`,
          explain: t`$\mathbf I(1, 1, 1) = \tfrac16Ma^2(1, 1, 1)$, so $\lambda = \tfrac16Ma^2 = ${sci(ans, 3)}$ kg·m² — the same as the moment about any axis through the cube's **centre**, since the diagonal passes through it. The other two principal moments are $\tfrac23 + \tfrac14 = \tfrac{11}{12}$ (times $Ma^2$), a repeated root: every axis through the corner perpendicular to the diagonal is principal.`,
          visual: { type: 'calc-vectors3d', params: { range: 1.6, grid: false, scale: 1.3, parallelograms: boxFaces([1.2, 1.2, 1.2], [0.6, 0.6, 0.6], 'accent', 0.2), lines: [{ point: [0, 0, 0], dir: [1, 1, 1], t: [0, 1.5], color: 'gold' }] }, caption: t`The cube about its corner, with the body diagonal (gold). Drawn with edge 1.2 units. Drag to turn.` },
        };
      },
    }),
    mcq({
      id: 'test-axis', difficulty: 2,
      prompt: t`For the tensor $\mathbf I = \begin{bmatrix} 3 & 1 & 0 \\ 1 & 3 & 0 \\ 0 & 0 & 5 \end{bmatrix}$ kg·m², is $\hat e = (1, 0, 0)$ a principal axis?`,
      visual: blockMap([[3, 1], [1, 3]], { view: 4.6 }, t`The $xy$ block as a map, in kg·m²: unit vectors in the plane (faint circle) and their images under $\mathbf I$ (bold ellipse).`),
      choices: [t`No: $\mathbf I\hat e = (3, 1, 0)$ is not parallel to $\hat e$`, t`Yes: it is a coordinate axis`, t`Yes, with $\lambda = 3$, the diagonal element`, t`Only if the body spins fast enough`],
      answer: 0,
      why: { 1: t`Coordinate axes are principal only when the products of inertia in their row vanish; here $I_{xy} = 1$.`, 2: t`$3$ is the moment about $x$, but $x$ is not principal: $\mathbf I\hat x$ also has a $y$ part.`, 3: t`Principal axes are a property of the mass distribution alone; the spin rate does not enter.` },
      hints: [t`Multiply: $\mathbf I\hat e$ is the first column of $\mathbf I$. Is it a multiple of $(1, 0, 0)$?`],
      teach: t`A principal axis is one that $\mathbf I$ maps onto a multiple of itself.`,
      explain: t`$\mathbf I\hat e = (3, 1, 0)$ leans toward $y$, so no. Here $(1, 1, 0)/\sqrt2$ and $(1, -1, 0)/\sqrt2$ are principal (moments 4 and 2), and $z$ is (moment 5).`,
    }),
    order({
      id: 'steps', difficulty: 2,
      prompt: t`Put the steps for finding a body's principal axes in order.`,
      visual: satAxesPic(t`The satellite and its three principal axes. Drag to turn.`, { labels: false }),
      items: [t`Choose the origin (the centre of mass) and axes; compute every $I_{ij}$`, t`Use any symmetry: a mirror plane's normal is already a principal axis`, t`Solve $\det(\mathbf I - \lambda\mathbf 1) = 0$ for the principal moments`, t`For each $\lambda$, solve $(\mathbf I - \lambda\mathbf 1)\hat e = 0$ for its axis`, t`Check: $\sum\lambda = \operatorname{tr}\mathbf I$, and the axes are perpendicular`],
      hints: [t`You need the tensor before its eigenvalues, and the eigenvalues before their eigenvectors.`],
      teach: t`Tensor, then moments (the characteristic equation), then axes, then checks.`,
      explain: t`The eigenvalues come first because each eigenvector is found by substituting one of them back into $(\mathbf I - \lambda\mathbf 1)\hat e = 0$. Symmetry, used early, splits a cubic into a known root and a quadratic. Numerically, [numpy's \`eigh\`](#/lesson/prog.P3.3) does all of it at once.`,
    }),
    num({
      id: 'trace', difficulty: 2,
      gen(r) {
        const d = [r.pick([120, 150]), r.pick([200, 240]), r.pick([260, 300])], c = r.pick([-15, -25, 20]);
        const I = [[d[0], c, 0], [c, d[1], 0], [0, 0, d[2]]], { vals } = eigSym(I);
        return {
          prompt: t`A spacecraft's tensor about its centre of mass is $$\mathbf I = ${matTeX(I, 3)}\ \text{kg m}^2.$$ Two of its principal moments are $${sci(vals[0], 4)}$ and $${sci(vals[2], 4)}$ kg·m². Without solving the cubic, find the third.`,
          answer: vals[1], units: 'kg m^2', tol: { rel: 0.003 },
          errors: distinct([{ value: d[1], feedback: t`$I_{yy}$ is close, but $y$ is not a principal axis. Use the trace: $\lambda_1 + \lambda_2 + \lambda_3 = I_{xx} + I_{yy} + I_{zz}$.` }, { value: d[0] + d[1] + d[2], feedback: t`That is the whole trace. Subtract the two moments you already know.` }], vals[1]),
          hints: [t`The trace (the sum of the diagonal) is the same in every set of axes, so it equals the sum of the principal moments.`],
          teach: t`The trace of $\mathbf I$ equals the sum of the principal moments.`,
          explain: t`$\lambda = (${d[0]} + ${d[1]} + ${d[2]}) - ${sci(vals[0], 4)} - ${sci(vals[2], 4)} = ${sci(vals[1], 4)}$ kg·m². (Rotation of the axes leaves the trace and the determinant unchanged — the two quickest checks on any eigen-solver's output.)`,
          visual: blockMap([[r6(d[0] / 100), r6(c / 100)], [r6(c / 100), r6(d[1] / 100)]], { view: 3.4 }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-boom', difficulty: 3, transfer: true,
      gen(r) {
        const mb = r.pick([2, 3, 4]), a = r.pick([20, 30, 40]);
        const bus = { m: 500, c: [0, 0, 0], I: [[185, 0, 0], [0, 185, 0], [0, 0, 250]] };
        const mag = pointPart(mb, [4 * Math.cos(a * DEG), 0, 4 * Math.sin(a * DEG)]);
        const I = tensorOf([bus, mag]), { vals, vecs } = eigSym(I), tilt = Math.acos(Math.abs(vecs[2][2])) / DEG;
        return {
          prompt: t`A spin-stabilized probe has a squat cylindrical bus with $\mathbf I = \operatorname{diag}(185, 185, 250)$ kg·m² about its centre, spin axis $z$. A ${mb} kg magnetometer is deployed on a 4 m light boom from the bus's centre, pointing $${a}^\circ$ above the $x$-axis in the $xz$-plane. About the new centre of mass, $$\mathbf I = ${matTeX(I, 4)}\ \text{kg m}^2.$$ By what angle does the axis of **largest** principal moment now tilt away from $z$?`,
          answer: tilt, units: 'deg', tol: { rel: 0.02 },
          errors: distinct([{ value: 0, feedback: t`$I_{xz} \ne 0$, so $z$ is no longer principal: the boom has tipped the axes.` }, { value: a, feedback: t`The boom's direction is not the principal axis; the tilt comes from the $xz$ block's eigenvector.` }], tilt),
          hints: [t`$y$ is still principal ($y = 0$ is a mirror plane). Work with the $xz$ block.`, t`The principal angle of a block $\begin{bmatrix} a & c \\ c & b \end{bmatrix}$ satisfies $\tan2\theta = 2c/(a - b)$; or find the eigenvector of the larger root directly.`],
          teach: t`An off-axis appendage brings a product of inertia that tips the principal axes; a spinner must be re-balanced to spin about its new major axis.`,
          explain: t`The $xz$ block's larger eigenvalue is $${sci(vals[2], 4)}$ kg·m², and its eigenvector lies $${sci(tilt, 3)}^\circ$ from $z$. Left alone, a probe spun about its geometric $z$-axis would now cone about this tilted axis — which is why spinners carry balance masses and are re-trimmed after a boom deploys.`,
          visual: gpic({ x: [-1.6, 4.8], y: [-1.4, 3.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '0.6', lower: '-0.6', from: -1, to: 1, color: 'accent', alpha: 0.35 }], curves: [seg([0, 0], [r6(4 * Math.cos(a * DEG)), r6(4 * Math.sin(a * DEG))], 'ink2', 1.6), seg([0, -1.3], [0, 2.4], 'ink4', 1, true), seg([-1.5, 0], [4.3, 0], 'ink4', 1, true)], points: [{ x: r6(4 * Math.cos(a * DEG)), y: r6(4 * Math.sin(a * DEG)), color: 'warn', r: 6, label: 'magnetometer', labelDx: -100, labelDy: 2 }, lab(0.12, 2.45, 'z (spin)', 'ink3'), lab(4.25, 0.15, 'x', 'ink3'), lab(0.75, 0.3, `${a}°`, 'ink2')] }, t`The probe seen side-on (in the $xz$-plane): the bus (blue) and the boom. Schematic, not to scale.`, 'A cylinder with a long boom at an angle'),
        };
      },
    }),
    mcq({
      id: 'cp-symmetric', difficulty: 2,
      prompt: t`A uniform cylinder has principal moments $\lambda_1 = \lambda_2 \ne \lambda_3$ about its centre, with $\hat e_3$ along its axis. Which lines through its centre are principal axes?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.6, grid: false, scale: 1.3, curves: [{ param: ['0.7*cos(t)', '0.7*sin(t)', 1], t: [0, 6.2832], color: 'accent' }, { param: ['0.7*cos(t)', '0.7*sin(t)', -1], t: [0, 6.2832], color: 'accent' }], segments: [{ from: [0.7, 0, -1], to: [0.7, 0, 1], color: 'accent' }, { from: [-0.7, 0, -1], to: [-0.7, 0, 1], color: 'accent' }, { from: [0, 0.7, -1], to: [0, 0.7, 1], color: 'accent' }, { from: [0, -0.7, -1], to: [0, -0.7, 1], color: 'accent' }] }, caption: t`A cylinder centred on the origin, axis along $z$. Drag to turn.` },
      choices: [t`The axis $\hat e_3$, and **every** line through the centre perpendicular to it`, t`Only the axis and the two lines through the centre parallel to $x$ and $y$`, t`Only the cylinder's axis`, t`Every line through the centre`],
      answer: 0,
      why: { 1: t`Nothing singles out $x$ and $y$: turn the cylinder about its axis and it looks the same. With a repeated eigenvalue, every vector in that eigenvalue's plane is an eigenvector.`, 2: t`Spin it about a diameter and $\vec L = \lambda_1\vec\omega$ exactly: diameters are principal too.`, 3: t`A line tilted between the axis and a diameter mixes $\lambda_1$ and $\lambda_3$, which differ: $\vec L$ leans.` },
      hints: [t`In principal axes $\mathbf I = \operatorname{diag}(\lambda_1, \lambda_1, \lambda_3)$. What does it do to any $\vec\omega = (\omega_1, \omega_2, 0)$?`],
      teach: t`A repeated principal moment gives a whole plane of principal axes.`,
      explain: t`$\mathbf I(\omega_1, \omega_2, 0) = \lambda_1(\omega_1, \omega_2, 0)$: any vector in the plane perpendicular to the axis is stretched by $\lambda_1$ and not turned. This freedom is what makes a symmetric body's free precession simple ([M7.4](#/lesson/phys3550.M7.4)).`,
    }),
    num({
      id: 'cp-lean-principal', difficulty: 3,
      gen(r) {
        const l1 = r.pick([100, 150, 200]), l3 = r.pick([300, 400, 500]);
        const ang = Math.atan(l3 / l1) / DEG - 45;
        return {
          prompt: t`A body with principal moments $\lambda_1 = ${l1}$ and $\lambda_3 = ${l3}$ kg·m² is spun with $\vec\omega$ exactly halfway between $\hat e_1$ and $\hat e_3$ ($45^\circ$ from each). By how many degrees does $\vec L$ lean away from $\vec\omega$?`,
          answer: ang, units: 'deg', tol: { rel: 0.01 },
          errors: distinct([{ value: Math.atan(l3 / l1) / DEG, feedback: t`That is the angle of $\vec L$ from $\hat e_1$. Subtract the $45^\circ$ at which $\vec\omega$ sits.` }, { value: 45 - Math.atan(l1 / l3) / DEG, feedback: t`$\vec L$ leans toward the axis with the **larger** moment, $\hat e_3$: $\tan\phi = L_3/L_1 = \lambda_3/\lambda_1$.` }], ang),
          hints: [t`In principal axes $\vec L = (\lambda_1\omega_1, 0, \lambda_3\omega_3)$ with $\omega_1 = \omega_3$.`, t`$\vec L$'s angle from $\hat e_1$ is $\arctan(\lambda_3/\lambda_1)$.`],
          teach: t`In principal axes $\vec L$ is $\vec\omega$ with each component stretched by its own moment, so it leans toward the axis with the larger moment.`,
          explain: t`$\vec L \propto (${l1}, 0, ${l3})$, at $\arctan(${l3}/${l1}) = ${sci(ang + 45, 3)}^\circ$ from $\hat e_1$: $${sci(ang, 3)}^\circ$ past $\vec\omega$, toward $\hat e_3$.`,
          visual: blockMap([[r6(l1 / 100), 0], [0, r6(l3 / 100)]], { view: r6(l3 / 100 + 0.5) }, t`In principal axes ($\hat e_1$ across, $\hat e_3$ up), in units of 100 kg·m²: unit $\vec\omega$'s (faint circle) and their $\vec L$'s (bold ellipse).`),
        };
      },
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §10.4–10.5: principal axes; finding them', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'G. Strang, Introduction to Linear Algebra, 5th ed. (2016), §6.4: symmetric matrices', url: 'https://math.mit.edu/~gs/linearalgebra/' },
  ],
});
