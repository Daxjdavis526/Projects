// The inertia tensor (Taylor §10.2–10.4): for a body turning about a fixed
// point (or its centre of mass), L = Σ m r × (ω × r) = Iω with
// I_ij = Σ m(r²δ_ij − x_i x_j). Moments on the diagonal, products of inertia
// (with their minus sign) off it; L is parallel to ω only along special
// directions (M7.2). Building I from parts: each part's own tensor plus the
// tensor parallel-axis shift m(d²1 − d dᵀ). Kinetic energy T = ½ωᵀIω.
// Worked: a one-winged satellite (box bus + one solar wing mounted above
// centre), its CM, full tensor and the 6.5° between L and ω for a spin about
// body z. Practice: products of point masses, a point's I_yz, the dumbbell's
// L, the cube about its corner, T with a product term, a wing's shift.
// Transfer: a binary's I_xy oscillating at twice the orbital frequency (why
// gravitational waves come at 2f_orb).
// Links (not reused): math2210.C3-4.7 (first meeting with the tensor, the
// box satellite), math2270.LA-9.1 / LA-11.1 (eigen-picture), prog.P3.3 (eigh).
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { sci, r6, gpic, seg, lab, distinct } from './_cm.js';
import { SAT, satScene, boxFaces, matTeX, vecTeX, mvec, shift } from './_cm4.js';

const t = String.raw;
const DEG = Math.PI / 180;

const W = (() => {
  const I = SAT.I, [, ycm, zcm] = SAT.cm;
  const own = (p) => p.I.map((r) => r.slice());
  const dB = [0 - SAT.cm[0], 0 - ycm, 0 - zcm], dW = [0, 2.3 - ycm, 0.4 - zcm];
  const w = 0.1, L = mvec(I, [0, 0, w]);
  const ang = Math.atan2(Math.hypot(L[0], L[1]), L[2]) / DEG;
  return { I, ycm, zcm, own, dB, dW, sB: shift(300, dB), sW: shift(30, dW), w, L, ang };
})();
const [IXX, IYY, IZZ, IYZ] = [W.I[0][0], W.I[1][1], W.I[2][2], W.I[1][2]];

// a satellite picture with ω (and L) drawn from the centre of mass, ω = (0, sin a, cos a)
function satPic(a, { L = false, caption, extra = {} } = {}) {
  const w = [0, Math.sin(a), Math.cos(a)], Lv = mvec(W.I, w), s = 2.1 / Math.hypot(...Lv);
  return {
    type: 'calc-vectors3d',
    params: satScene({ extra: { grid: false, scale: 1.25, vectors: [{ to: w.map((x) => r6(2.1 * x)), color: 'accent', label: '\\vec\\omega' }, ...(L ? [{ to: Lv.map((x) => r6(s * x)), color: 'gold', label: '\\vec L' }] : [])], ...extra } }),
    caption,
  };
}

export default lesson({
  id: 'phys3550.M7.1',
  title: 'The inertia tensor',
  minutes: 18, difficulty: 3,
  intro: t`Spin a body about a fixed axis through its centre and each bit of mass $m_\alpha$ at $\vec r_\alpha$ moves with $\vec v = \vec\omega\times\vec r_\alpha$. Add up $m\,\vec r\times\vec v$ and the angular momentum is **linear in $\vec\omega$ but not, in general, parallel to it**: a $3\times3$ symmetric array, the **inertia tensor**, turns $\vec\omega$ into $\vec L$. Its diagonal holds the familiar moments of inertia; off the diagonal sit the **products of inertia**, which measure how lopsided the mass is, and carry a minus sign. Whenever they are not zero, spinning about $z$ gives an $\vec L$ that leans away from $z$ — and as the body turns, that leaning $\vec L$ turns with it, which takes a torque.`,
  equation: t`\vec L = \mathbf I\,\vec\omega,\qquad I_{ij} = \sum_\alpha m_\alpha\big(r_\alpha^2\,\delta_{ij} - x_{\alpha i}\,x_{\alpha j}\big),\qquad T = \tfrac12\,\vec\omega\cdot\mathbf I\,\vec\omega`,
  symbols: [
    { tex: '\\vec L', text: 'angular momentum about the chosen origin (the fixed point or the centre of mass), kg·m²/s' },
    { tex: '\\vec\\omega', text: 'angular velocity, rad/s: its direction is the rotation axis (right-hand rule), its size the rate' },
    { tex: '\\mathbf I', text: 'the inertia tensor: a symmetric $3\\times3$ array of components $I_{ij}$, each in kg·m²' },
    { tex: 'm_\\alpha,\\ \\vec r_\\alpha', text: 'the mass of the $\\alpha$-th bit of the body (kg) and its position from the origin (m); for a continuous body the sum becomes $\\int\\rho\\,dV$' },
    { tex: 'x_{\\alpha i}', text: 'the components $(x, y, z)$ of $\\vec r_\\alpha$, labelled $i = 1, 2, 3$' },
    { tex: '\\delta_{ij}', text: 'the Kronecker delta: 1 when $i = j$, 0 otherwise — so the diagonal is $I_{xx} = \\sum m(y^2 + z^2)$ and so on' },
    { tex: 'I_{xy} = -\\sum m\\,xy', text: 'a **product of inertia**: zero when the mass is balanced across the $x = 0$ or the $y = 0$ plane' },
    { tex: 'T', text: 'rotational kinetic energy, J' },
  ],
  why: t`Attitude control, spin stability and a spacecraft's wobble all start from this matrix — and it is the first **tensor** you meet: general relativity's metric and stress–energy are symmetric arrays of the same kind, and the mass quadrupole, $Q_{ij} = (\operatorname{tr}\mathbf I)\,\delta_{ij} - 3I_{ij}$, is what radiates gravitational waves.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'Spin a lopsided satellite',
    lead: t`A 330 kg satellite: a box bus (blue) with one solar wing (gold) on its $+y$ side, mounted 0.4 m above the bus's centre. Arrows start at the centre of mass. Steer $\vec\omega$ (blue) with the two angles and watch $\vec L = \mathbf I\vec\omega$ (gold). Drag the picture to turn it.`,
    tasks: [
      t`$\alpha = 0$: $\vec\omega$ straight up the bus's long axis — yet $\vec L$ leans about $6.5^\circ$ toward $-y$. That lean is the product of inertia $I_{yz}$.`,
      t`$\beta = 90^\circ$: sweep $\alpha$ and find where the angle between them falls to zero — near $79^\circ$. There, and only along a few such directions, $\vec L \parallel \vec\omega$.`,
      t`$\beta = 0$, $\alpha = 90^\circ$: $\vec\omega$ along $x$, across the wing's mirror plane, and $\vec L$ lines up exactly.`,
    ],
    params: satScene({ extra: {
      grid: false, scale: 1.2,
      constants: { Ixx: r6(IXX), Iyy: r6(IYY), Izz: r6(IZZ), Iyz: r6(IYZ) },
      sliders: [
        { key: 'al', label: 'Tilt from $z$, $\\alpha$', min: 0, max: 180, step: 0.5, value: 0, unit: '^\\circ', explain: 'The angle between $\\vec\\omega$ and the bus’s long axis.' },
        { key: 'be', label: 'Azimuth from $x$, $\\beta$', min: 0, max: 360, step: 1, value: 90, unit: '^\\circ', explain: 'Which way $\\vec\\omega$ tilts, measured round from $+x$ toward $+y$.' },
      ],
      vectors: [
        { to: ['2.1*sin(al*pi/180)*cos(be*pi/180)', '2.1*sin(al*pi/180)*sin(be*pi/180)', '2.1*cos(al*pi/180)'], color: 'accent', label: '\\vec\\omega' },
        { to: ['2.1*Ixx*sin(al*pi/180)*cos(be*pi/180)/sqrt((Ixx*sin(al*pi/180)*cos(be*pi/180))^2 + (Iyy*sin(al*pi/180)*sin(be*pi/180) + Iyz*cos(al*pi/180))^2 + (Iyz*sin(al*pi/180)*sin(be*pi/180) + Izz*cos(al*pi/180))^2)',
          '2.1*(Iyy*sin(al*pi/180)*sin(be*pi/180) + Iyz*cos(al*pi/180))/sqrt((Ixx*sin(al*pi/180)*cos(be*pi/180))^2 + (Iyy*sin(al*pi/180)*sin(be*pi/180) + Iyz*cos(al*pi/180))^2 + (Iyz*sin(al*pi/180)*sin(be*pi/180) + Izz*cos(al*pi/180))^2)',
          '2.1*(Iyz*sin(al*pi/180)*sin(be*pi/180) + Izz*cos(al*pi/180))/sqrt((Ixx*sin(al*pi/180)*cos(be*pi/180))^2 + (Iyy*sin(al*pi/180)*sin(be*pi/180) + Iyz*cos(al*pi/180))^2 + (Iyz*sin(al*pi/180)*sin(be*pi/180) + Izz*cos(al*pi/180))^2)'], color: 'gold', label: '\\vec L' },
      ],
      readouts: [
        { label: 'angle between $\\vec\\omega$ and $\\vec L$ (deg)', expr: 'acos(min(1, (Ixx*(sin(al*pi/180)*cos(be*pi/180))^2 + Iyy*(sin(al*pi/180)*sin(be*pi/180))^2 + Izz*cos(al*pi/180)^2 + 2*Iyz*sin(al*pi/180)*sin(be*pi/180)*cos(al*pi/180))/sqrt((Ixx*sin(al*pi/180)*cos(be*pi/180))^2 + (Iyy*sin(al*pi/180)*sin(be*pi/180) + Iyz*cos(al*pi/180))^2 + (Iyz*sin(al*pi/180)*sin(be*pi/180) + Izz*cos(al*pi/180))^2)))*180/pi', digits: 3 },
        { label: '$T$ per $(\\mathrm{rad/s})^2$ (J)', expr: '0.5*(Ixx*(sin(al*pi/180)*cos(be*pi/180))^2 + Iyy*(sin(al*pi/180)*sin(be*pi/180))^2 + Izz*cos(al*pi/180)^2 + 2*Iyz*sin(al*pi/180)*sin(be*pi/180)*cos(al*pi/180))', digits: 4 },
      ],
    } }),
    caption: t`Bus: 300 kg, $1.0\times1.0\times1.6$ m; wing: 30 kg, $1.0\times3.0$ m, centred 2.3 m out along $+y$ and 0.4 m up. Both uniform; the yoke and every other part are left out. Arrows show directions only (each drawn the same length).`,
  },
  example: {
    prompt: t`Find the satellite's inertia tensor about its centre of mass, with axes parallel to the bus's edges ($z$ along the long axis, the wing along $+y$). Then spin it at $${W.w}$ rad/s about body $z$: how far does $\vec L$ lean from $\vec\omega$?`,
    visual: satPic(0, { L: true, caption: t`The satellite spinning about body $z$ (blue): $\vec L$ (gold) leans away from the wing. Drag to turn it.` }),
    steps: [
      { label: 'Centre of mass', text: t`Bus (300 kg) at the origin, wing (30 kg) at $(0,\ 2.3,\ 0.4)$ m: $y_{\text{cm}} = \frac{30\times2.3}{330} = ${sci(W.ycm, 3)}$ m and $z_{\text{cm}} = \frac{30\times0.4}{330} = ${sci(W.zcm, 3)}$ m. Every position below is measured from here.` },
      { label: 'Own tensors', text: t`A uniform box with edges $a, b, c$ has, about its own centre, $I_{xx} = \tfrac{m}{12}(b^2 + c^2)$ and so on, and no products (it is symmetric). Bus: $\operatorname{diag}(89.0,\ 89.0,\ 50.0)$; wing: $\operatorname{diag}(22.5,\ 2.50,\ 25.0)$ kg·m².` },
      { label: 'Shift each part', text: t`The tensor parallel-axis theorem: a part of mass $m$ whose centre sits at $\vec d$ from the new origin adds $m\big(d^2\delta_{ij} - d_id_j\big)$. For the wing, $\vec d = (0,\ ${sci(W.dW[1], 4)},\ ${sci(W.dW[2], 3)})$ m, so it adds $30\,(d_y^2 + d_z^2) = ${sci(W.sW[0][0], 4)}$ to $I_{xx}$ and $-30\,d_yd_z = ${sci(W.sW[1][2], 4)}$ to $I_{yz}$.` },
      { label: 'Add', text: t`Summing own tensors and shifts for both parts: $$\mathbf I = ${matTeX(W.I, 4)}\ \text{kg m}^2.$$` },
      { label: 'Spin about z', text: t`$\vec\omega = (0, 0, ${W.w})$ rad/s picks out the third column: $\vec L = \mathbf I\vec\omega = (0,\ ${sci(W.L[1], 3)},\ ${sci(W.L[2], 4)})$ kg·m²/s. The lean is $\arctan\big(|I_{yz}|/I_{zz}\big) = ${sci(W.ang, 3)}^\circ$, toward $-y$.` },
      { label: 'Sense check', text: t`The $x$ row and column hold only $I_{xx}$: the satellite is mirror-symmetric across the $x = 0$ plane, so every $xy$ and $xz$ product cancels. The moments obey the triangle rule $I_{yy} + I_{zz} \ge I_{xx}$ ($${sci(IYY + IZZ, 4)} \ge ${sci(IXX, 4)}$), as any real body's must. And $I_{yz} < 0$: the wing's mass sits where $y$ and $z$ are both positive.` },
    ],
    answer: t`$I_{xx} = ${sci(IXX, 4)}$, $I_{yy} = ${sci(IYY, 3)}$, $I_{zz} = ${sci(IZZ, 4)}$, $I_{yz} = ${sci(IYZ, 3)}$ kg·m², the other products zero. Spun about $z$, $\vec L$ leans $${sci(W.ang, 3)}^\circ$ from $\vec\omega$.`,
  },
  practice: [
    num({
      id: 'pt-Ixy', difficulty: 1,
      gen(r) {
        const P = r.shuffle([[1, 2], [-2, 1], [2, -1], [-1, -2], [2, 2], [-1, 1]]).slice(0, 3);
        const ms = P.map(() => r.pick([1, 2, 3]));
        const sumxy = () => P.reduce((s, p, k) => s + ms[k] * p[0] * p[1], 0);
        if (sumxy() === 0) P[2] = P[2][0] * P[2][1] > 0 ? [2, 2] : [-2, 2];
        const I2 = -sumxy();
        return {
          prompt: t`Three small masses lie in the $xy$-plane: ${P.map((p, k) => t`$${ms[k]}$ kg at $(${p[0]}, ${p[1]})$ m`).join(', ')}. Find the product of inertia $I_{xy}$ about the origin.`,
          answer: I2, units: 'kg m^2', tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -I2, feedback: t`The product of inertia carries a minus sign: $I_{xy} = -\sum m\,xy$.` }, { value: P.reduce((s, p, k) => s + ms[k] * (p[0] ** 2 + p[1] ** 2), 0), feedback: t`That is $I_{zz} = \sum m(x^2 + y^2)$, the moment about the $z$-axis. A product multiplies two different coordinates.` }].filter((e) => e.value !== I2),
          hints: [t`$I_{xy} = -\sum_\alpha m_\alpha x_\alpha y_\alpha$: one term per mass.`],
          teach: t`A product of inertia is minus the mass-weighted sum of a product of two coordinates; masses in the first and third quadrants make it negative.`,
          explain: t`$I_{xy} = -(${P.map((p, k) => `${ms[k]}\\cdot(${p[0]})(${p[1]})`).join(' + ')}) = ${I2}$ kg·m². Masses in quadrants with $xy > 0$ pull it negative; those with $xy < 0$ push it positive.`,
          visual: gpic({ x: [-3, 3], y: [-3, 3], equal: true, xlabel: 'x (m)', ylabel: 'y (m)', points: P.map((p, k) => ({ x: p[0], y: p[1], color: 'accent', r: 4 + 2 * ms[k], label: `${ms[k]} kg`, labelDx: 10, labelDy: -10 })) }, t`The three masses in the $xy$-plane, dots sized by mass.`, 'Three point masses in a plane'),
        };
      },
    }),
    expr({
      id: 'pt-Iyz', difficulty: 1,
      prompt: t`A single point mass $m$ sits at $(x, y, z)$. Write the component $I_{yz}$ of its inertia tensor about the origin.`,
      answer: '-m*y*z', answerTeX: t`-m\,yz`, lhs: 'I_{yz}', vars: { m: [0.5, 3], x: [-2, 2], y: [-2, 2], z: [-2, 2] },
      errors: [{ answer: 'm*y*z', feedback: t`Off the diagonal $\delta_{yz} = 0$, which leaves $-m\,x_yx_z$: the minus sign stays.` }, { answer: 'm*(y^2 + z^2)', feedback: t`That is the diagonal element $I_{xx}$, the moment about the $x$-axis.` }, { answer: 'm*(x^2 + y^2 + z^2 - y*z)', feedback: t`The $r^2$ term comes with $\delta_{ij}$, which is zero off the diagonal.` }],
      hints: [t`Use $I_{ij} = m(r^2\delta_{ij} - x_ix_j)$ with $i = y$, $j = z$.`],
      teach: t`Off the diagonal the Kronecker delta vanishes, so a product of inertia is just $-m\,x_ix_j$.`,
      explain: t`$I_{yz} = m(r^2\cdot0 - yz) = -m\,yz$. For a whole body, add one such term per bit of mass: $I_{yz} = -\int\rho\,yz\,dV$.`,
      visual: { type: 'calc-vectors3d', params: { range: 2.4, grid: false, scale: 1.3, points: [{ at: [1.2, 1.8, 1.4], color: 'gold', label: 'm' }], components: [{ to: [1.2, 1.8, 1.4], color: 'ink3' }] }, caption: t`A point mass at $(x, y, z)$, with the path along $x$, then $y$, then $z$ that locates it. Drag to turn.` },
    }),
    mcq({
      id: 'dumbbell', difficulty: 2,
      prompt: t`A dumbbell — two equal masses on a light rod through the origin — is forced to spin about the $z$-axis, with the rod tilted $30^\circ$ away from that axis. At the moment shown, which way does $\vec L$ point?`,
      visual: gpic({ x: [-2, 2], y: [-1.6, 1.9], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg([0, -1.5], [0, 1.6], 'ink3', 1.2, true), seg([-0.6, -1.039], [0.6, 1.039], 'ink2', 2.2)], points: [{ x: 0.6, y: 1.039, color: 'accent', r: 8 }, { x: -0.6, y: -1.039, color: 'accent', r: 8 }, lab(0.12, 1.75, 'ω (z-axis)', 'accent', 0, 0), lab(0.1, 1.0, '30°', 'ink2')], arrows: [{ from: [0, 0], to: [0, 1.5], color: 'accent', width: 2 }] }, t`Side view: the rod (grey) and its two masses, the spin axis vertical. Not to scale.`, 'A tilted dumbbell spinning about a vertical axis'),
      choices: [
        t`Perpendicular to the rod, in the plane of the rod and the $z$-axis — tilted $60^\circ$ from $z$, and turning round with the dumbbell`,
        t`Straight along $z$, because that is the spin axis`,
        t`Along the rod, because the mass lies along the rod`,
        t`It is zero: the two masses' angular momenta cancel`,
      ],
      answer: 0,
      why: {
        1: t`$\vec L \parallel \vec\omega$ only when $\vec\omega$ lies along a principal axis, and the tilted rod is lopsided about $z$. Each mass's $m\vec r\times\vec v$ is perpendicular to its $\vec r$.`,
        2: t`$\vec r\times\vec v$ is perpendicular to $\vec r$, so no mass contributes anything along the rod.`,
        3: t`The masses are on opposite sides but also move in opposite directions, so their $\vec r\times\vec v$ are equal, not opposite.`,
      },
      hints: [t`Each mass has $\vec L_\alpha = m\,\vec r_\alpha\times(\vec\omega\times\vec r_\alpha)$. Which directions is that perpendicular to?`, t`$\vec\omega\times\vec r$ points straight out of the plane of the rod and the axis; $\vec r\times$ that lies back in the plane, at right angles to $\vec r$.`],
      teach: t`$\vec L = \mathbf I\vec\omega$ need not be parallel to $\vec\omega$: for a lopsided body it leans, and it turns round with the body.`,
      explain: t`$\vec L = 2m\,\vec r\times(\vec\omega\times\vec r)$ is perpendicular to $\vec r$ and lies in the plane of $\vec r$ and $\vec\omega$, so it points $90^\circ$ from the rod — $60^\circ$ from $z$. As the dumbbell turns, $\vec L$ sweeps round a cone; a changing $\vec L$ needs a torque, supplied by the bearings. This is why a car wheel needs balancing weights on both rims ("dynamic balance").`,
    }),
    num({
      id: 'cube-corner', difficulty: 2,
      gen(r) {
        const M = r.pick([2, 4, 6, 8]), a = r.pick([0.2, 0.3, 0.4, 0.5]);
        const ans = -(M * a * a) / 4;
        return {
          prompt: t`A uniform cube of mass ${M} kg and edge ${a} m has one corner at the origin and edges along $+x$, $+y$, $+z$. Find its product of inertia $I_{xy}$ about that corner, using $I_{xy} = -\int\rho\,xy\,dV$.`,
          answer: ans, units: 'kg m^2', tol: { rel: 0.005 },
          errors: distinct([{ value: -ans, feedback: t`The product of inertia carries a minus sign, and here $xy > 0$ everywhere in the cube.` }, { value: 0, feedback: t`About the cube's centre the products vanish by symmetry; about a corner the mass is all on one side, so they do not.` }, { value: -(M * a * a) / 12, feedback: t`$\int_0^a\!\!\int_0^a xy\,dx\,dy = a^4/4$, so with $\rho = M/a^3$ and the $\int dz = a$, $I_{xy} = -Ma^2/4$.` }], ans),
          hints: [t`$\rho = M/a^3$; the integral factorizes: $\int_0^a x\,dx\int_0^a y\,dy\int_0^a dz$.`, t`Each one-dimensional integral of $x$ is $a^2/2$, so $I_{xy} = -\frac{M}{a^3}\cdot\frac{a^2}{2}\cdot\frac{a^2}{2}\cdot a$.`],
          teach: t`About a point that is not a centre of symmetry, products of inertia appear — they say the mass is lopsided as seen from there.`,
          explain: t`$I_{xy} = -\frac{M}{a^3}\cdot\frac{a^2}{2}\cdot\frac{a^2}{2}\cdot a = -\frac{Ma^2}{4} = ${sci(ans, 3)}$ kg·m². The same comes from the parallel-axis shift: the centre is at $\vec d = (a/2, a/2, a/2)$ and adds $-Md_xd_y = -Ma^2/4$ to the centre's zero. (The diagonal is $I_{xx} = \tfrac23Ma^2$.)`,
          visual: { type: 'calc-vectors3d', params: { range: 1.6, grid: false, scale: 1.35, parallelograms: boxFaces([1.2, 1.2, 1.2], [0.6, 0.6, 0.6], 'accent', 0.22) }, caption: t`The cube with one corner at the origin (drawn with edge 1.2 units, not to scale). Drag to turn.` },
        };
      },
    }),
    num({
      id: 'ke-tensor', difficulty: 3,
      gen(r) {
        const wy = r.pick([0.05, 0.08, 0.1]), wz = r.pick([0.06, 0.1, 0.12]);
        const w = [0, wy, wz], Tke = 0.5 * (IYY * wy * wy + IZZ * wz * wz + 2 * IYZ * wy * wz);
        return {
          prompt: t`The satellite of the worked example has $I_{yy} = ${sci(IYY, 3)}$, $I_{zz} = ${sci(IZZ, 4)}$ and $I_{yz} = ${sci(IYZ, 3)}$ kg·m² (its $x$ row and column hold only $I_{xx}$). It turns with $\vec\omega = (0,\ ${wy},\ ${wz})$ rad/s. Find its rotational kinetic energy $T = \tfrac12\vec\omega\cdot\mathbf I\vec\omega$, in joules.`,
          answer: Tke, units: 'J', tol: { rel: 0.005 },
          errors: distinct([{ value: 0.5 * (IYY * wy * wy + IZZ * wz * wz), feedback: t`$\vec\omega\cdot\mathbf I\vec\omega$ has a cross term $2I_{yz}\omega_y\omega_z$: here it is negative, and not small.` }, { value: IYY * wy * wy + IZZ * wz * wz + 2 * IYZ * wy * wz, feedback: t`Keep the $\tfrac12$: $T = \tfrac12\vec\omega\cdot\vec L$.` }, { value: 0.5 * (IYY * wy * wy + IZZ * wz * wz + IYZ * wy * wz), feedback: t`The product term appears twice, once as $I_{yz}\omega_y\omega_z$ and once as $I_{zy}\omega_z\omega_y$.` }], Tke),
          hints: [t`First $\vec L = \mathbf I\vec\omega$: $L_y = I_{yy}\omega_y + I_{yz}\omega_z$, $L_z = I_{yz}\omega_y + I_{zz}\omega_z$.`, t`Then $T = \tfrac12(\omega_yL_y + \omega_zL_z) = \tfrac12\big(I_{yy}\omega_y^2 + 2I_{yz}\omega_y\omega_z + I_{zz}\omega_z^2\big)$.`],
          teach: t`Rotational kinetic energy is a quadratic form in $\vec\omega$; products of inertia add cross terms.`,
          explain: t`$T = \tfrac12\big(${sci(IYY, 3)}\cdot${wy}^2 + 2(${sci(IYZ, 3)})(${wy})(${wz}) + ${sci(IZZ, 4)}\cdot${wz}^2\big) = ${sci(Tke, 3)}$ J. The negative product lowers the energy for an $\vec\omega$ in the first quadrant of the $yz$-plane, because there $\vec L$ leans away from $\vec\omega$ and $\vec\omega\cdot\vec L$ shrinks.`,
          visual: satPic(Math.atan2(wy, wz), { caption: t`The satellite with this $\vec\omega$ (blue). Drag to turn.` }),
        };
      },
    }),
    multi({
      id: 'props', difficulty: 2,
      prompt: t`Which statements about an inertia tensor are true for **every** rigid body?`,
      visual: { type: 'calc-vectors3d', params: satScene({ extra: { grid: false, scale: 1.2 } }), caption: t`The worked example's satellite, a body with one mirror plane ($x = 0$). Drag to turn.` },
      choices: [t`It is symmetric: $I_{xy} = I_{yx}$ and so on`, t`Its diagonal elements are positive`, t`Its components depend on the origin about which they are taken`, t`Its products of inertia are negative`, t`$\vec L$ is parallel to $\vec\omega$ when $\vec\omega$ lies along a coordinate axis`],
      answer: [0, 1, 2],
      why: { 3: t`A product's sign depends on where the mass sits: $-\sum m\,xy$ is positive for mass in the quadrants where $xy < 0$.`, 4: t`Only along a principal axis ([M7.2](#/lesson/phys3550.M7.2)). The worked satellite spun about its $z$-axis has $\vec L$ leaning $6.5^\circ$ away.` },
      hints: [t`Look at the formula $I_{ij} = \sum m(r^2\delta_{ij} - x_ix_j)$: what does swapping $i$ and $j$ do? Can $r^2 - x^2$ be negative?`, t`The parallel-axis theorem changes every component when the origin moves.`],
      teach: t`The inertia tensor is a symmetric matrix with positive diagonal, built about a chosen point.`,
      explain: t`$x_ix_j = x_jx_i$, so $\mathbf I$ is symmetric; $I_{xx} = \sum m(y^2 + z^2) > 0$; and moving the origin adds $M(d^2\delta_{ij} - d_id_j)$. Products can have either sign, and only principal directions give $\vec L\parallel\vec\omega$.`,
    }),
    num({
      id: 'wing-shift', difficulty: 2,
      gen(r) {
        const m = r.pick([12, 20, 25, 40]), dy = r.pick([1.5, 1.8, 2.2, 2.6]), dz = r.pick([-0.5, -0.3, 0.3, 0.5]);
        const ans = -m * dy * dz;
        return {
          prompt: t`A ${m} kg solar wing is a thin uniform plate in the $xy$-plane of its own, symmetric about its centre. That centre sits at $\vec d = (0,\ ${dy},\ ${dz})$ m from a spacecraft's centre of mass. What does the wing add to the spacecraft's $I_{yz}$ about the centre of mass?`,
          answer: ans, units: 'kg m^2', tol: { rel: 0.005 },
          errors: distinct([{ value: -ans, feedback: t`The shift adds $m(d^2\delta_{yz} - d_yd_z) = -m\,d_yd_z$: keep the minus sign.` }, { value: m * (dy * dy + dz * dz), feedback: t`That is the shift's contribution to $I_{xx}$, $m(d_y^2 + d_z^2)$. For a product, $\delta_{yz} = 0$.` }, { value: 0, feedback: t`The wing's **own** products about its centre are zero, but the shift adds $-m\,d_yd_z$, which is not.` }], ans),
          hints: [t`Total $I_{yz}$ = the wing's own $I_{yz}$ about its centre (zero, by its symmetry) plus the shift term.`, t`Shift term: $m(d^2\delta_{ij} - d_id_j)$ with $i = y$, $j = z$.`],
          teach: t`The tensor parallel-axis theorem adds $M(d^2\delta_{ij} - d_id_j)$: a part far off-centre brings a product of inertia with it.`,
          explain: t`$-m\,d_yd_z = -${m}\times${dy}\times(${dz}) = ${sci(ans, 3)}$ kg·m². A wing mounted ${dz > 0 ? 'above' : 'below'} the centre of mass tilts the principal axes; mounting it level with the centre of mass ($d_z = 0$) would remove this product.`,
          visual: gpic({ x: [-1.2, 3.6], y: [-1.1, 1.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '0.8', lower: '-0.8', from: -0.5, to: 0.5, color: 'accent', alpha: 0.35 }, { fn: r6(dz / 2 + 0.04), lower: r6(dz / 2 - 0.04), from: 0.8, to: 3.4, color: 'gold', alpha: 0.7 }], curves: [seg([-1.1, 0], [3.5, 0], 'ink4', 1, true), seg([0, -1], [0, 1.2], 'ink4', 1, true)], points: [{ x: 0, y: 0, color: 'ink', r: 4, label: 'CM', labelDx: -30, labelDy: -10 }, { x: 2.1, y: r6(dz / 2), color: 'warn', r: 4, label: 'wing centre', labelDx: -30, labelDy: dz > 0 ? -14 : 16 }, lab(3.5, 0.15, 'y', 'ink3'), lab(0.12, 1.15, 'z', 'ink3')] }, t`Side view (looking along $-x$): the bus and the wing, offset ${dz > 0 ? 'above' : 'below'} the centre of mass. Schematic, not to scale.`, 'A box with a flat panel offset to one side'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lean', difficulty: 3,
      gen(r) {
        const ax = r.pick(['y', 'z']);
        const ang = ax === 'z' ? Math.atan(Math.abs(IYZ) / IZZ) / DEG : Math.atan(Math.abs(IYZ) / IYY) / DEG;
        return {
          prompt: t`The worked example's satellite, $$\mathbf I = ${matTeX(W.I, 4)}\ \text{kg m}^2,$$ is spun about its body $${ax}$-axis. By what angle does $\vec L$ lean away from $\vec\omega$?`,
          answer: ang, units: 'deg', tol: { rel: 0.01 },
          errors: distinct([{ value: Math.atan(Math.abs(IYZ) / (ax === 'z' ? IYY : IZZ)) / DEG, feedback: t`$\vec\omega$ along $${ax}$ picks out the $${ax}$ column of $\mathbf I$: the angle is $\arctan(|I_{yz}|/I_{${ax}${ax}})$.` }, { value: 0, feedback: t`$I_{yz}$ is not zero, so the $${ax}$-axis is not a principal axis: $\vec L$ leans.` }], ang),
          hints: [t`$\vec\omega = \omega\hat ${ax}$ gives $\vec L = \omega\,(\text{the } ${ax}\text{ column of }\mathbf I)$.`, t`The lean is $\arctan$ of the off-axis part over the on-axis part: $|I_{yz}|/I_{${ax}${ax}}$.`],
          teach: t`Spinning about a coordinate axis picks out one column of $\mathbf I$; any product of inertia in it tilts $\vec L$.`,
          explain: t`$\vec L = \omega(0,\ ${ax === 'z' ? sci(IYZ, 3) : sci(IYY, 3)},\ ${ax === 'z' ? sci(IZZ, 4) : sci(IYZ, 3)})$, so the lean is $\arctan(${sci(Math.abs(IYZ), 3)}/${sci(ax === 'z' ? IZZ : IYY, 4)}) = ${sci(ang, 3)}^\circ$. ${ax === 'y' ? 'Bigger than about $z$, because the moment about $y$ is smaller.' : ''}`,
          visual: satPic(ax === 'z' ? 0 : Math.PI / 2, { caption: t`The satellite with $\vec\omega$ along body $${ax}$. Drag to turn.` }),
        };
      },
    }),
    mcq({
      id: 'cp-binary', difficulty: 3, transfer: true,
      prompt: t`Two equal stars of mass $m$ orbit their centre of mass on a circle of radius $r$ in the $xy$-plane, at angle $\phi = \Omega t$: positions $\pm r(\cos\phi, \sin\phi, 0)$. A system's gravitational-wave emission is driven by how its mass quadrupole — built from $\mathbf I$ — changes. How does $I_{xy}$ change in time, and so at what frequency are the waves emitted?`,
      visual: gpic({ x: [-1.6, 1.6], y: [-1.3, 1.3], equal: true, xlabel: 'x', ylabel: 'y', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: true }, seg([-0.866, -0.5], [0.866, 0.5], 'ink3', 1, true)], points: [{ x: 0.866, y: 0.5, color: 'gold', r: 8, label: 'm', labelDx: 10, labelDy: -8 }, { x: -0.866, y: -0.5, color: 'gold', r: 8, label: 'm', labelDx: 10, labelDy: -8 }, { x: 0, y: 0, color: 'ink3', r: 3 }, lab(0.42, 0.1, 'φ', 'ink2')], arrows: [{ from: [0.866, 0.5], to: [0.566, 1.02], color: 'accent' }, { from: [-0.866, -0.5], to: [-0.566, -1.02], color: 'accent' }] }, t`The binary at one instant, seen from above the orbital plane: equal stars on opposite sides of their centre of mass, moving anticlockwise (arrows).`, 'Two stars on opposite sides of a circular orbit'),
      choices: [
        t`$I_{xy} = -mr^2\sin2\Omega t$: it repeats every half orbit, so the waves come at **twice** the orbital frequency`,
        t`$I_{xy} = -mr^2\sin\Omega t$, so the waves come at the orbital frequency`,
        t`$I_{xy}$ is constant, because the orbit is circular, so no waves are emitted`,
        t`$I_{xy} = -2mr^2\sin\Omega t\cos\Omega t$, which repeats once per orbit`,
      ],
      answer: 0,
      why: {
        1: t`Work it out: $I_{xy} = -\sum m\,xy = -2m\,r^2\cos\phi\sin\phi = -mr^2\sin2\phi$. The doubled angle comes from the product of two coordinates.`,
        2: t`The moments $I_{zz} = 2mr^2$ and the trace stay fixed, but $I_{xx}$, $I_{yy}$ and $I_{xy}$ change as the pair turns: a turning dumbbell looks the same after half a turn, not after none.`,
        3: t`$2\sin\Omega t\cos\Omega t = \sin2\Omega t$: it repeats every **half** orbit — after half a turn the two stars have swapped places and the mass distribution is the same.`,
      },
      hints: [t`$I_{xy} = -\sum m\,xy$ with both stars: $x = \pm r\cos\phi$, $y = \pm r\sin\phi$ (same signs for each star).`, t`Use $2\sin\phi\cos\phi = \sin2\phi$. After how much of an orbit does the pair look the same?`],
      teach: t`A two-body system looks the same after half a turn, so its inertia tensor — and its gravitational-wave signal — repeats at twice the orbital frequency.`,
      explain: t`$I_{xy} = -2m\,r^2\cos\phi\sin\phi = -mr^2\sin2\Omega t$, and $I_{xx} = 2mr^2\sin^2\Omega t = mr^2(1 - \cos2\Omega t)$. Everything that changes, changes at $2\Omega$, so the gravitational waves come at twice the orbital frequency: a neutron-star pair LIGO hears at 100 Hz is orbiting 50 times a second. (The quadrupole $Q_{ij} = (\operatorname{tr}\mathbf I)\delta_{ij} - 3I_{ij}$; see [the gravitational-wave chirp](#/explore/chirp).)`,
    }),
    mcq({
      id: 'cp-mirror', difficulty: 2,
      prompt: t`A satellite is mirror-symmetric across its $x = 0$ plane (for every bit of mass at $(x, y, z)$ there is an equal one at $(-x, y, z)$), but has nothing else special. Which products of inertia about its centre of mass must vanish?`,
      visual: { type: 'calc-vectors3d', params: satScene({ extra: { grid: false, scale: 1.2, planes: [{ normal: [1, 0, 0], d: 0, size: 2.2, color: 'violet', alpha: 0.12 }] } }), caption: t`A satellite with its mirror plane $x = 0$ (violet). Drag to turn.` },
      choices: [t`$I_{xy}$ and $I_{xz}$; $I_{yz}$ need not`, t`All three, because the body is symmetric`, t`Only $I_{yz}$, the one not involving $x$`, t`None: symmetry only affects the diagonal`],
      answer: 0,
      why: {
        1: t`One mirror plane cancels only the products that change sign when $x \to -x$. $yz$ is unchanged, and the worked satellite's $I_{yz} = ${sci(IYZ, 3)}$ kg·m² shows it survives.`,
        2: t`Backwards: $yz$ does not change sign under $x \to -x$, so its sum does not cancel. The ones with an $x$ in them do.`,
        3: t`The diagonal is a sum of squares and never cancels; it is the products that pairs of mirror masses cancel.`,
      },
      hints: [t`Pair each mass at $(x, y, z)$ with its mirror at $(-x, y, z)$. Which of $xy$, $xz$, $yz$ change sign?`],
      teach: t`Each mirror plane kills the two products of inertia that change sign under the reflection.`,
      explain: t`The pair contributes $m\,xy + m(-x)y = 0$ to the sum for $I_{xy}$, and likewise for $I_{xz}$, but $2m\,yz$ to $I_{yz}$. So the normal to a mirror plane is always a principal axis — the shortcut [M7.2](#/lesson/phys3550.M7.2) uses.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §10.2–10.4: rotation about a fixed axis, the inertia tensor', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'H. Goldstein, C. Poole and J. Safko, Classical Mechanics, 3rd ed. (2002), §5.3: the inertia tensor and the moment of inertia', url: 'https://www.pearson.com/en-us/subject-catalog/p/classical-mechanics/P200000006389' },
  ],
});
