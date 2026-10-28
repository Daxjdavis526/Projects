// Principal curvatures: the shape operator S = I⁻¹II, its eigenvalues κ1, κ2
// (the extreme normal curvatures) and perpendicular eigenvectors (principal
// directions); Euler's formula; umbilics and asymptotic directions; torus,
// saddle, a paraboloidal dish.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';
import { torus, forms } from './_surf.js';

const t = String.raw;
const DEG = Math.PI / 180;
const TAU = r6(2 * Math.PI);

const QUAD = '0.5*(k1*x^2 + k2*y^2)';
const sec = (th) => [`t*cos(${th})`, `t*sin(${th})`, `0.5*(k1*(t*cos(${th}))^2 + k2*(t*sin(${th}))^2)`];
const eulerGraph = (k1, k2, caption, extra = {}) => ({
  type: 'graph',
  params: { x: [0, 180], y: [Math.min(k1, k2, 0) - 0.3, Math.max(k1, k2, 0) + 0.3], xlabel: 'direction θ (degrees)', ylabel: 'κn', xticks: 6, curves: [{ fn: `${k1}*cos(x*pi/180)^2 + ${k2}*sin(x*pi/180)^2`, color: 'accent', width: 2.4 }], hlines: [{ y: 0, color: 'ink3' }], ...extra },
  caption,
});

const quadPic = (k1, k2, th, caption) => ({ type: 'surface3d', params: { z: `0.5*(${k1}*x^2 + ${k2}*y^2)`, domain: [[-1.4, 1.4], [-1.4, 1.4]], alpha: 0.6, pitch: 0.32, yaw: -0.6, dist: 6.5, zclip: 4, curves: [{ param: ['t', '0', `0.5*${k1}*t^2`], t: [-1.4, 1.4], color: 'accent', width: 2 }, { param: ['0', 't', `0.5*${k2}*t^2`], t: [-1.4, 1.4], color: 'violet', width: 2 }, ...(th === null ? [] : [{ param: [`t*cos(${r6(th * DEG)})`, `t*sin(${r6(th * DEG)})`, `0.5*(${k1}*(t*cos(${r6(th * DEG)}))^2 + ${k2}*(t*sin(${r6(th * DEG)}))^2)`], t: [-1.4, 1.4], color: 'gold', width: 3 }])] }, caption });

export default lesson({
  id: 'st-c.C5.2',
  title: 'Principal curvatures',
  minutes: 13, difficulty: 3,
  equation: t`\kappa_n(\theta) = \kappa_1\cos^2\theta + \kappa_2\sin^2\theta`,
  intro: t`Turn a direction round a point and $\kappa_n$ swings between a largest value $\kappa_1$ and a smallest $\kappa_2$, the **principal curvatures**, reached in two **perpendicular** principal directions. Measured from the first of them, every other normal curvature follows Euler’s formula above. Behind it is the **shape operator** $S$, the linear map that says how $\mathbf n$ turns as you move: $S(\mathbf w) = -D_{\mathbf w}\mathbf n$. In the basis $\mathbf X_u$, $\mathbf X_v$ its matrix is

$$S = \begin{pmatrix} E & F \\ F & G \end{pmatrix}^{-1}\begin{pmatrix} L & M \\ M & N \end{pmatrix},$$

and $\kappa_1$, $\kappa_2$ are its eigenvalues, the principal directions its eigenvectors. Where $E = G = 1$ and $F = 0$ this is just the symmetric matrix of $\mathrm{II}$.`,
  symbols: [
    { tex: t`\kappa_1,\ \kappa_2`, text: t`the principal curvatures, $\kappa_1 \ge \kappa_2$: the largest and smallest normal curvatures at the point (signed by $\mathbf n$)` },
    { tex: t`\theta`, text: t`the angle of a tangent direction from the first principal direction` },
    { tex: t`\kappa_n(\theta)`, text: t`the normal curvature in that direction (C5.1)` },
    { tex: 'S', text: t`the shape operator (Weingarten map): $\mathbf w \mapsto -D_{\mathbf w}\mathbf n$, a linear map of the tangent plane to itself` },
  ],
  why: t`Eigenvalues of a symmetric operator again: principal stresses, moments of inertia, normal modes. Here they compress a surface’s bending at a point into two numbers — and C5.3 builds the Gaussian curvature $K = \kappa_1\kappa_2$ from them.`,
  visual: {
    type: 'surface3d',
    title: 'Two numbers for every direction',
    lead: t`The surface $z = \tfrac12(\kappa_1x^2 + \kappa_2y^2)$ has principal curvatures $\kappa_1$ and $\kappa_2$ at the origin, along the $x$- and $y$-axes (blue and violet). Turn the gold normal section and read its curvature.`,
    tasks: [
      t`With $\kappa_1 = 0.9$ and $\kappa_2 = -0.5$: the readout runs from $0.9$ at $\theta = 0$ down to $-0.5$ at $\theta = 90^\circ$, and never outside that range.`,
      t`Find the direction where $\kappa_n = 0$: about $\theta = 53^\circ$, where $\tan^2\theta = 0.9/0.5$. Along it the gold curve hugs the tangent plane — an **asymptotic direction**.`,
      t`Set $\kappa_1 = \kappa_2$: every direction gives the same value. The point is an **umbilic**, like any point of a sphere.`,
    ],
    params: {
      z: QUAD, domain: [[-1.6, 1.6], [-1.6, 1.6]], alpha: 0.62, pitch: 0.32, yaw: -0.6, dist: 7, n: 40,
      sliders: [
        { key: 'k1', label: t`$\kappa_1$`, min: -1.5, max: 1.5, step: 0.05, value: 0.9, explain: t`The normal curvature along the $x$-axis.` },
        { key: 'k2', label: t`$\kappa_2$`, min: -1.5, max: 1.5, step: 0.05, value: -0.5, explain: t`The normal curvature along the $y$-axis.` },
        { key: 'th', label: t`Direction $\theta$`, min: 0, max: 3.1416, step: 0.01, value: 0.5, explain: t`Angle of the normal section from the $x$-axis, in radians.` },
      ],
      curves: [{ param: sec('th'), t: [-1.6, 1.6], color: 'gold', width: 3.2 }, { param: sec('0'), t: [-1.6, 1.6], color: 'accent', width: 1.8 }, { param: sec('1.5708'), t: [-1.6, 1.6], color: 'violet', width: 1.8 }],
      readouts: [{ label: t`$\kappa_n$`, expr: 'k1*cos(th)^2 + k2*sin(th)^2', digits: 3 }, { label: t`$\theta$ (deg)`, expr: 'th*180/pi', digits: 3 }],
    },
    caption: t`Every smooth surface looks like this near a point, to second order, once the axes are turned to the principal directions (the quadratic is its osculating paraboloid). Units are arbitrary; $\mathbf n$ points up.`,
  },
  example: {
    prompt: t`Find the principal curvatures and directions of the saddle $\mathbf X(x, y) = (x, y, xy)$ at the point $(1, 0, 0)$.`,
    visual: { type: 'surface3d', params: { z: 'x*y', domain: [[-1.8, 1.8], [-1.8, 1.8]], zscale: 0.6, alpha: 0.6, pitch: 0.4, yaw: -0.8, dist: 8, curves: [{ param: ['1 + 0.8165*t', '0.5774*t', '(1 + 0.8165*t)*0.5774*t'], t: [-0.9, 0.9], color: 'gold', width: 3.2 }, { param: ['1 - 0.8165*t', '0.5774*t', '(1 - 0.8165*t)*0.5774*t'], t: [-0.9, 0.9], color: 'violet', width: 3.2 }] }, caption: t`The saddle (heights scaled by 0.6) with curves through $(1, 0, 0)$ in the two principal directions: $\kappa = +\tfrac12$ (gold) and $\kappa = -\tfrac12$ (violet).` },
    steps: [
      { label: 'First form', text: t`$\mathbf X_x = (1, 0, y) = (1, 0, 0)$ and $\mathbf X_y = (0, 1, x) = (0, 1, 1)$: $E = 1$, $F = 0$, $G = 2$.` },
      { label: 'Normal and second form', text: t`$\mathbf n = (-y, -x, 1)/\sqrt{1 + x^2 + y^2} = (0, -1, 1)/\sqrt2$. $\mathbf X_{xx} = \mathbf X_{yy} = 0$ and $\mathbf X_{xy} = (0, 0, 1)$, so $L = N = 0$, $M = 1/\sqrt2$.` },
      { label: 'Shape operator', text: t`$S = \begin{pmatrix} 1 & 0 \\ 0 & 2 \end{pmatrix}^{-1}\begin{pmatrix} 0 & 1/\sqrt2 \\ 1/\sqrt2 & 0 \end{pmatrix} = \begin{pmatrix} 0 & 1/\sqrt2 \\ 1/(2\sqrt2) & 0 \end{pmatrix}$. Not symmetric — the basis is not orthonormal — but its eigenvalues are real.` },
      { label: 'Eigenvalues', text: t`$\kappa^2 = \tfrac{1}{\sqrt2}\cdot\tfrac{1}{2\sqrt2} = \tfrac14$, so $\kappa_1 = \tfrac12$, $\kappa_2 = -\tfrac12$.` },
      { label: 'Directions', text: t`For $\kappa = \tfrac12$: $-\tfrac12a + \tfrac{1}{\sqrt2}b = 0$, so $(a, b) = (\sqrt2, 1)$, i.e. $\sqrt2\mathbf X_x + \mathbf X_y = (\sqrt2, 1, 1)$. For $-\tfrac12$: $(-\sqrt2, 1, 1)$. Their dot product is $-2 + 1 + 1 = 0$ ✓ perpendicular.` },
      { label: 'Sense check', text: t`At the origin the same saddle has $\kappa = \pm1$; at $(1, 0)$ the surface is tilted and bends less. The two values are opposite, so their mean is 0 here; C5.3 shows the mean of the principal curvatures of $z = xy$ is $-xy/(1 + x^2 + y^2)^{3/2}$, zero exactly on the axes.` },
    ],
    answer: t`$\kappa_{1,2} = \pm\tfrac12$, in the directions $(\pm\sqrt2, 1, 1)$, which are perpendicular.`,
  },
  practice: [
    mcq({
      id: 'perp', difficulty: 1,
      prompt: t`The graph shows a surface’s normal curvature $\kappa_n$ against direction at one point. What is always true of the two directions where $\kappa_n$ is largest and smallest?`,
      visual: eulerGraph(1.1, -0.4, t`$\kappa_n$ against the angle $\theta$ of the direction, at one point of a surface. It repeats every $180^\circ$.`, { y: [-0.7, 1.4] }),
      choices: ['They are perpendicular', 'They run along the coordinate curves', t`They are $45^\circ$ apart`, t`They are the directions where $\kappa_n = 0$`],
      answer: 0,
      why: {
        1: 'Coordinates are a choice; principal directions are geometric. They coincide only for special coordinates (such as those of a surface of revolution).',
        2: t`At $45^\circ$ from the principal direction $\kappa_n$ is the average $(\kappa_1 + \kappa_2)/2$, not an extreme.`,
        3: t`Those are the asymptotic directions, which exist only when $\kappa_1$ and $\kappa_2$ have opposite signs and lie between the principal ones.`,
      },
      hints: [t`Euler’s formula $\kappa_1\cos^2\theta + \kappa_2\sin^2\theta$ is extreme at $\theta = 0$ and $\theta = 90^\circ$.`],
      teach: 'The principal directions are eigenvectors of the self-adjoint shape operator, so they are perpendicular.',
      explain: t`In the graph the maximum is at $0^\circ$ and the minimum at $90^\circ$. That is no accident: $S$ is self-adjoint with respect to the metric, and eigenvectors of a self-adjoint operator for different eigenvalues are orthogonal.`,
    }),
    num({
      id: 'euler', difficulty: 2,
      gen(r) {
        const k1 = r.pick([0.8, 1.2, 2]), k2 = r.pick([-0.6, -0.3, 0.4]), th = r.pick([20, 30, 50, 70]);
        const k = k1 * Math.cos(th * DEG) ** 2 + k2 * Math.sin(th * DEG) ** 2;
        return {
          prompt: t`At a point, the principal curvatures are $\kappa_1 = ${k1}\ \text{m}^{-1}$ and $\kappa_2 = ${k2}\ \text{m}^{-1}$. What is the normal curvature in the direction $${th}^\circ$ from the first principal direction, in $\text{m}^{-1}$?`,
          visual: quadPic(k1, k2, th, t`The surface near the point, turned so the first principal direction is the $x$-axis (blue; violet is the second). Gold: the normal section at $${th}^\circ$.`),
          answer: k, units: 'm^-1', tol: { rel: 0.01, abs: 0.002 },
          errors: [{ value: k1 * Math.cos(th * DEG) + k2 * Math.sin(th * DEG), feedback: t`The weights are $\cos^2\theta$ and $\sin^2\theta$ — they add up to 1, so $\kappa_n$ stays between $\kappa_2$ and $\kappa_1$.` }, { value: k1 * Math.sin(th * DEG) ** 2 + k2 * Math.cos(th * DEG) ** 2, feedback: t`$\theta$ is measured from the *first* principal direction, so $\kappa_1$ gets the $\cos^2\theta$.` }].filter((e) => Math.abs(e.value - k) > 0.03 * Math.abs(k) + 0.005),
          hints: [t`$\kappa_n = \kappa_1\cos^2\theta + \kappa_2\sin^2\theta$.`],
          teach: 'Euler’s formula: the normal curvature is a weighted average of the principal curvatures, with weights cos²θ and sin²θ.',
          explain: t`$\kappa_n = ${k1}\cos^2 ${th}^\circ + (${k2})\sin^2 ${th}^\circ = ${nice(k, 4)}\ \text{m}^{-1}$.`,
        };
      },
    }),
    num({
      id: 'sym-eig', difficulty: 2,
      gen(r) {
        const L = r.pick([2, 1, -1, 3]), N = r.pick([0, 1, -2]), M = r.pick([1, 2, -1]);
        const k1 = (L + N) / 2 + Math.sqrt(((L - N) / 2) ** 2 + M * M);
        return {
          prompt: t`At a point where the coordinates are orthonormal ($E = G = 1$, $F = 0$), the second fundamental form has $L = ${L}$, $M = ${M}$, $N = ${N}$ (in $\text{m}^{-1}$). What is the larger principal curvature $\kappa_1$?`,
          visual: { type: 'surface3d', params: { z: `0.5*(${L}*x^2 + 2*(${M})*x*y + ${N}*y^2)`, domain: [[-1.2, 1.2], [-1.2, 1.2]], zscale: 0.5, alpha: 0.65, pitch: 0.35, yaw: -0.6, dist: 6 }, caption: t`The osculating paraboloid $z = \tfrac12(Lx^2 + 2Mxy + Ny^2)$ (heights scaled by 0.5): the surface near the point, to second order.` },
          answer: k1, units: 'm^-1', tol: { rel: 0.01 },
          errors: [{ value: L, feedback: t`$L$ is the normal curvature along $\mathbf X_u$, but with $M \ne 0$ that is not a principal direction. Find the eigenvalues.` }, { value: (L + N) / 2, feedback: t`That is the mean of the eigenvalues ($H$, C5.3). Add $\sqrt{((L - N)/2)^2 + M^2}$.` }].filter((e) => Math.abs(e.value - k1) > 0.02 * Math.abs(k1)),
          hints: [t`$S = \begin{pmatrix} ${L} & ${M} \\ ${M} & ${N} \end{pmatrix}$. Its eigenvalues solve $\kappa^2 - (L + N)\kappa + (LN - M^2) = 0$.`, t`$\kappa = \frac{L + N}{2} \pm\sqrt{\left(\frac{L - N}{2}\right)^2 + M^2}$; take the $+$.`],
          teach: 'With orthonormal coordinates the shape operator is the symmetric matrix of II, and the principal curvatures are its eigenvalues.',
          explain: t`$\kappa_1 = \tfrac{${L + N}}{2} + \sqrt{${nice(((L - N) / 2) ** 2)} + ${M * M}} = ${nice(k1, 4)}\ \text{m}^{-1}$, and $\kappa_2 = ${nice(L + N - k1, 4)}\ \text{m}^{-1}$. Rotating the axes to the eigenvectors removes the $xy$ term, as in the Explore picture.`,
        };
      },
    }),
    num({
      id: 'torus-principal', difficulty: 3,
      gen(r) {
        const R = r.pick([3, 4, 5]), rr = r.pick([1, 1.5]), vdeg = r.pick([0, 45, 135, 180]);
        const fm = forms(torus(R, rr), 0, vdeg * DEG), k = -Math.cos(vdeg * DEG) / (R + rr * Math.cos(vdeg * DEG));
        return {
          prompt: t`On the torus with $R = ${R}$ m and $r = ${rr}$ m (outward normal), the principal directions are along the horizontal circles and the tube’s circles. Using $L = -(R + r\cos v)\cos v$ and $E = (R + r\cos v)^2$, find the principal curvature along the horizontal circle at $v = ${vdeg}^\circ$, in $\text{m}^{-1}$ (with its sign).`,
          visual: { type: 'surface3d', params: { surface: [`(${R} + ${rr}*cos(v))*cos(u)`, `(${R} + ${rr}*cos(v))*sin(u)`, `${rr}*sin(v)`], domain: [[0, TAU], [0, TAU]], alpha: 0.55, pitch: 0.55, dist: r6(2.7 * (R + rr)), curves: [{ param: [`(${R} + ${rr}*cos(${r6(vdeg * DEG)}))*cos(t)`, `(${R} + ${rr}*cos(${r6(vdeg * DEG)}))*sin(t)`, `${r6(rr * Math.sin(vdeg * DEG))}`], t: [0, TAU], color: 'gold', width: 3 }, { param: [`(${R} + ${rr}*cos(t))`, '0', `${rr}*sin(t)`], t: [0, TAU], color: 'violet', width: 2.6 }] }, caption: t`The horizontal circle at $v = ${vdeg}^\circ$ (gold) and a tube circle (violet): the two principal directions at each point.` },
          answer: k, units: 'm^-1', tol: { rel: 0.01, abs: 0.001 },
          errors: [{ value: -1 / (R + rr * Math.cos(vdeg * DEG)), feedback: t`$1/(R + r\cos v)$ is the circle’s own curvature. Only its component along $\mathbf n$ counts, which brings in $\cos v$ (Meusnier).` }, { value: -k, feedback: t`Check the sign: $\mathbf X_{uu}$ points at the axis, and on the outside ($\cos v > 0$) that is away from the outward normal.` }, { value: -1 / rr, feedback: t`$-1/r$ is the other principal curvature, along the tube’s circles.` }].filter((e) => Math.abs(e.value - k) > 0.03 * Math.abs(k) + 0.002),
          hints: [t`On a surface of revolution $F = M = 0$, so the coordinate directions are principal and $\kappa = L/E$ along the circles.`, t`$L/E = -\cos v/(R + r\cos v)$; evaluate at $v = ${vdeg}^\circ$.`],
          teach: 'On a surface of revolution the principal curvatures are L/E along the parallels and N/G along the meridians.',
          explain: t`$\kappa = -\cos ${vdeg}^\circ/(${R} + ${rr}\cos ${vdeg}^\circ) = ${nice(fm.L / fm.E, 3)}\ \text{m}^{-1}$; the other is $N/G = -1/r = ${nice(-1 / rr, 3)}\ \text{m}^{-1}$ everywhere. ${vdeg < 90 ? 'Both negative: the outside of the torus is sphere-like.' : 'Opposite signs: the inside of the torus is saddle-like.'}`,
        };
      },
    }),
    num({
      id: 'asymptotic', difficulty: 3,
      gen(r) {
        const k1 = r.pick([0.5, 1, 2, 3]), k2 = r.pick([-0.5, -1, -2]);
        const th = Math.atan(Math.sqrt(-k1 / k2)) / DEG;
        return {
          prompt: t`At a saddle point the principal curvatures are $\kappa_1 = ${k1}$ and $\kappa_2 = ${k2}$ (in $\text{m}^{-1}$). At what angle from the first principal direction is the normal curvature zero (an **asymptotic direction**), in degrees between 0 and 90?`,
          visual: quadPic(k1, k2, null, t`The surface near the saddle point, to second order: it bends up along the first principal direction (blue) and down along the second (violet).`),
          answer: th, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 45, feedback: t`$45^\circ$ is right only when $\kappa_1 = -\kappa_2$. Solve $\kappa_1\cos^2\theta + \kappa_2\sin^2\theta = 0$.` }, { value: Math.atan(-k1 / k2) / DEG, feedback: t`You found $\tan\theta = -\kappa_1/\kappa_2$; it is $\tan^2\theta$ that equals that ratio.` }].filter((e) => Math.abs(e.value - th) > 0.02 * th),
          hints: [t`Set $\kappa_1\cos^2\theta + \kappa_2\sin^2\theta = 0$ and divide by $\cos^2\theta$.`, t`$\tan^2\theta = -\kappa_1/\kappa_2 = ${nice(-k1 / k2, 4)}$.`],
          teach: t`Asymptotic directions, where $\kappa_n = 0$, exist where $\kappa_1$ and $\kappa_2$ have opposite signs: $\tan^2\theta = -\kappa_1/\kappa_2$.`,
          explain: t`$\tan\theta = \sqrt{${nice(-k1 / k2, 4)}}$, so $\theta = ${nice(th, 4)}^\circ$ (and its mirror image $-${nice(th, 4)}^\circ$). On the saddle $z = xy$ the asymptotic directions are the coordinate lines — which are straight lines in space.`,
        };
      },
    }),
    mcq({
      id: 'umbilic', difficulty: 2,
      prompt: t`A point where $\kappa_1 = \kappa_2$ is called an **umbilic**. What is true there?`,
      visual: { type: 'surface3d', params: { z: '0.35*(x^2 + y^2)', domain: [[-1.6, 1.6], [-1.6, 1.6]], alpha: 0.65, pitch: 0.35, dist: 7, curves: [0, 0.6, 1.2, 1.8, 2.4].map((a) => ({ param: [`t*cos(${a})`, `t*sin(${a})`, '0.35*t^2'], t: [-1.6, 1.6], color: 'gold', width: 1.8 })) }, caption: 'A paraboloid of revolution: at its vertex every normal section is the same parabola.' },
      choices: ['Every tangent direction is a principal direction', t`$\kappa_n = 0$ in every direction`, 'There are no principal directions', 'The shape operator is the zero map'],
      answer: 0,
      why: {
        1: t`That is a *planar* umbilic, $\kappa_1 = \kappa_2 = 0$ (a point of a plane). A sphere’s points are umbilics with $\kappa_n = \mp1/a$.`,
        2: t`The opposite: $S = \kappa\,\mathrm{Id}$ has every vector as an eigenvector.`,
        3: t`Only when the common value is 0. In general $S = \kappa\,\mathrm{Id}$.`,
      },
      hints: [t`If both eigenvalues are equal to $\kappa$, then $S = \kappa\,\mathrm{Id}$. Which vectors are eigenvectors?`],
      teach: 'At an umbilic the shape operator is a multiple of the identity, so the normal curvature is the same in every direction.',
      explain: t`$S = \kappa\,\mathrm{Id}$: every direction is principal and $\kappa_n = \kappa$ in all of them. Every point of a sphere is an umbilic; a theorem says the sphere and the plane are the only connected surfaces made entirely of umbilics.`,
    }),
    order({
      id: 'euler-proof', difficulty: 3,
      prompt: 'Prove Euler’s formula. Order the steps.',
      visual: eulerGraph(0.9, -0.5, t`Euler’s formula with $\kappa_1 = 0.9$, $\kappa_2 = -0.5$.`),
      items: [
        t`$S$ is self-adjoint for the metric, so it has orthonormal eigenvectors $\mathbf e_1$, $\mathbf e_2$ with eigenvalues $\kappa_1$, $\kappa_2$.`,
        t`A unit tangent vector at angle $\theta$ from $\mathbf e_1$ is $\mathbf w = \cos\theta\,\mathbf e_1 + \sin\theta\,\mathbf e_2$.`,
        t`The normal curvature in direction $\mathbf w$ is $\kappa_n = \mathrm{II}(\mathbf w, \mathbf w) = \langle S\mathbf w, \mathbf w\rangle$.`,
        t`$S\mathbf w = \kappa_1\cos\theta\,\mathbf e_1 + \kappa_2\sin\theta\,\mathbf e_2$.`,
        t`Dot with $\mathbf w$: $\kappa_n = \kappa_1\cos^2\theta + \kappa_2\sin^2\theta$.`,
      ],
      hints: [t`Start from the eigenvectors of $S$ and write the direction in that basis.`, t`$\mathrm{II}(\mathbf w, \mathbf w) = \langle S\mathbf w, \mathbf w\rangle$ is how the second fundamental form and the shape operator are related.`],
      teach: 'Euler’s formula is the quadratic form of a symmetric operator written in its eigenbasis.',
      explain: t`So the extreme values of $\kappa_n$ are $\kappa_1$ and $\kappa_2$, at $\theta = 0$ and $90^\circ$. The same algebra gives the normal stress on a plane at angle $\theta$ to the principal stresses — Mohr’s circle.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-dish', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([5, 7, 10]), rho = r.pick([2, 3, 4]);
        const hp = rho / (2 * f), Rm = 2 * f * (1 + hp * hp) ** 1.5, Rp = 2 * f * Math.sqrt(1 + hp * hp);
        return {
          prompt: t`A radio dish is the paraboloid $z = \rho^2/(4f)$ with focal length $f = ${f}$ m. At the vertex both radii of curvature are $2f = ${2 * f}$ m. At the rim, $\rho = ${rho}$ m, the principal directions are the meridian and the circle. What is the radius of curvature along the **meridian** there, in metres? (For a profile $z = h(\rho)$ the meridian’s curvature is $h''/(1 + h'^2)^{3/2}$.)`,
          visual: { type: 'surface3d', params: { surface: [`v*cos(u)`, `v*sin(u)`, `v^2/${4 * f}`], domain: [[0, TAU], [0, rho]], alpha: 0.6, pitch: 0.45, dist: r6(3.2 * rho), axes: false, curves: [{ param: ['t', '0', `t^2/${4 * f}`], t: [0, rho], color: 'gold', width: 3 }, { param: [`${rho}*cos(t)`, `${rho}*sin(t)`, `${r6((rho * rho) / (4 * f))}`], t: [0, TAU], color: 'violet', width: 3 }] }, caption: 'The dish, to scale, with a meridian (gold) and the rim circle (violet).' },
          answer: Rm, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: 2 * f, feedback: t`$2f$ is the vertex value. Away from the axis the meridian flattens: divide $h''$ by $(1 + h'^2)^{3/2}$.` }, { value: Rp, feedback: t`That is the radius along the rim circle, $2f\sqrt{1 + h'^2}$. The meridian’s has the power $3/2$.` }].filter((e) => Math.abs(e.value - Rm) > 0.004 * Rm),
          hints: [t`$h' = \rho/(2f) = ${nice(hp, 4)}$ and $h'' = 1/(2f)$.`, t`$\kappa_m = \dfrac{1/(2f)}{(1 + h'^2)^{3/2}}$, and the radius is $1/\kappa_m = 2f(1 + h'^2)^{3/2}$.`],
          teach: 'On a surface of revolution the principal curvatures are those of the meridian and of the parallel (the latter reduced by Meusnier’s factor).',
          explain: t`$R_m = 2f(1 + ${nice(hp * hp, 4)})^{3/2} = ${nice(Rm, 4)}$ m, while along the rim circle $R_p = 2f\sqrt{1 + h'^2} = ${nice(Rp, 4)}$ m. The unequal radii are why a piece cut from the edge of a paraboloid is not a piece of a sphere: off-axis mirror segments must be figured individually.`,
        };
      },
    }),
    num({
      id: 'cp-shape', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, 3]), x0 = r.pick([0.5, 1, 2]);
        const G = 1 + k * k * x0 * x0, M = k / Math.sqrt(G), kap = k / G;
        return {
          prompt: t`On the saddle $z = ${k === 1 ? '' : k}xy$ at the point $(${x0}, 0)$: $E = 1$, $F = 0$, $G = ${nice(G)}$, $L = N = 0$ and $M = ${nice(M, 4)}$. Find the positive principal curvature.`,
          visual: { type: 'surface3d', params: { z: `${k}*x*y`, domain: [[-2.2, 2.2], [-2.2, 2.2]], zscale: r6(0.4 / k), alpha: 0.6, pitch: 0.4, yaw: -0.8, dist: 9, curves: [{ param: [`${x0}`, 't', `${k * x0}*t`], t: [-1, 1], color: 'violet', width: 3 }, { param: [`${x0} + t`, '0', '0'], t: [-1, 1], color: 'accent', width: 3 }] }, caption: t`The saddle (heights scaled) with the two coordinate lines through $(${x0}, 0)$ — both straight in space, so neither is principal.` },
          answer: kap, tol: { rel: 0.005 },
          errors: [{ value: M, feedback: t`With $G \ne 1$ the matrix of $\mathrm{II}$ is not the shape operator: use $S = \mathrm I^{-1}\mathrm{II}$.` }].filter((e) => Math.abs(e.value - kap) > 0.01 * kap),
          hints: [t`$S = \begin{pmatrix} 1 & 0 \\ 0 & 1/G \end{pmatrix}\begin{pmatrix} 0 & M \\ M & 0 \end{pmatrix} = \begin{pmatrix} 0 & M \\ M/G & 0 \end{pmatrix}$.`, t`Its eigenvalues satisfy $\kappa^2 = M^2/G$.`],
          teach: t`In non-orthonormal coordinates the principal curvatures are the eigenvalues of $\mathrm I^{-1}\mathrm{II}$, not of $\mathrm{II}$.`,
          explain: t`$\kappa = M/\sqrt G = ${nice(M, 4)}/${nice(Math.sqrt(G), 4)} = ${nice(kap, 4)} = ${k}/(1 + ${k * k}x^2)$ at $x = ${x0}$. The other is $-${nice(kap, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-rev', difficulty: 2,
      prompt: 'On any surface of revolution, the principal directions at a point are along the meridian and along the circle of latitude. Why?',
      visual: { type: 'surface3d', params: { surface: ['(1.2 + 0.5*sin(1.5*v))*cos(u)', '(1.2 + 0.5*sin(1.5*v))*sin(u)', 'v'], domain: [[0, TAU], [-1.6, 1.6]], alpha: 0.6, pitch: 0.25, dist: 7.5, axes: false, curves: [{ param: ['(1.2 + 0.5*sin(1.5*t))', '0', 't'], t: [-1.6, 1.6], color: 'gold', width: 3 }, { param: [`${r6(1.2 + 0.5 * Math.sin(0.75))}*cos(t)`, `${r6(1.2 + 0.5 * Math.sin(0.75))}*sin(t)`, '0.5'], t: [0, TAU], color: 'violet', width: 3 }] }, caption: 'A surface of revolution with a meridian (gold) and a circle of latitude (violet).' },
      choices: [
        'Reflection in the meridian’s plane is a symmetry of the surface, so it maps the principal directions to principal directions; the only pair of perpendicular directions it preserves is meridian and circle',
        'Because the meridian and circle are both plane curves',
        t`Because the coordinates are orthogonal, $F = 0$`,
        'Because the meridian is a geodesic',
      ],
      answer: 0,
      why: {
        1: 'Every normal section is a plane curve, in every direction; that singles out nothing.',
        2: t`$F = 0$ is not enough: a surface can have orthogonal coordinates with $M \ne 0$. What is needed is $F = M = 0$ — which the symmetry delivers.`,
        3: 'It is a geodesic (by the same symmetry), but being a geodesic and being principal are different things: a helix on a cylinder is a geodesic in a direction that is not principal.',
      },
      hints: ['Think about the mirror that contains the axis and the point.'],
      teach: t`A mirror symmetry of the surface through a point forces the principal directions to lie along and across the mirror.`,
      explain: t`The reflection fixes the meridian direction and reverses the circle direction, and it carries $S$ to itself, so these two directions are eigenvectors. In coordinates: $F = 0$ and $M = 0$, so $S$ is diagonal with $\kappa = L/E$ and $N/G$.`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §3-2 and §3-3', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), §8.1–8.2', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
  ],
});
