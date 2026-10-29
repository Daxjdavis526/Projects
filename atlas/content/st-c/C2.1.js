// The Frenet–Serret frame: T, N, B along a unit-speed space curve, the
// Frenet–Serret equations and why their matrix is antisymmetric.
import { lesson, mcq, multi, num, match, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6, cross, norm, unit } from './_dg.js';

const t = String.raw;

// Viviani's curve on the sphere of radius 2
const VIV = ['1 + cos(t)', 'sin(t)', '2*sin(t/2)'];
const vivFixed = (at, show, caption) => ({ type: 'c3-curve', params: { curve: { param: VIV, t: [0, r6(4 * Math.PI)] }, at, fixed: true, show, readouts: [], range: 2.4, yaw: 2.1, pitch: 0.35, scale: { frame: 1.1 } }, caption });
const vecTeX = (v) => t`(${v.map((x) => nice(x, 3)).join(',\ ')})`;

export default lesson({
  id: 'st-c.C2.1',
  title: 'The Frenet–Serret frame',
  minutes: 13, difficulty: 3,
  intro: t`A space curve has no “left”, so its curvature is a magnitude, $\kappa(s) = |\mathbf T'(s)| \ge 0$. Where $\kappa > 0$ it still carries a natural orthonormal frame: the unit tangent $\mathbf T = \alpha'$, the **principal normal** $\mathbf N = \mathbf T'/\kappa$ (the direction the curve is bending), and the **binormal** $\mathbf B = \mathbf T\times\mathbf N$. As you slide along the curve the frame turns, and its turning is captured entirely by two functions of $s$ — the curvature and a new one, the torsion $\tau$:

$$\frac{d}{ds}\begin{pmatrix}\mathbf T\\ \mathbf N\\ \mathbf B\end{pmatrix} = \begin{pmatrix}0 & \kappa & 0\\ -\kappa & 0 & \tau\\ 0 & -\tau & 0\end{pmatrix}\begin{pmatrix}\mathbf T\\ \mathbf N\\ \mathbf B\end{pmatrix}$$

These are the **Frenet–Serret equations**. The matrix is antisymmetric — and that is no accident: it is what keeps the frame orthonormal as it moves.`,
  symbols: [
    { tex: 's', text: 'arc length along the curve' },
    { tex: t`\mathbf T`, text: t`the unit tangent $\alpha'(s)$` },
    { tex: t`\mathbf N`, text: t`the principal normal $\mathbf T'/\kappa$: the unit vector toward which the curve bends (defined only where $\kappa > 0$)` },
    { tex: t`\mathbf B`, text: t`the binormal $\mathbf T\times\mathbf N$, perpendicular to the osculating plane spanned by $\mathbf T$ and $\mathbf N$` },
    { tex: t`\kappa`, text: t`the curvature $|\mathbf T'|$, in $\text{m}^{-1}$: how fast the curve bends` },
    { tex: t`\tau`, text: t`the torsion, in $\text{m}^{-1}$: how fast the osculating plane twists about $\mathbf T$. This course uses $\mathbf B' = -\tau\mathbf N$; some books flip the sign` },
  ],
  why: t`An orthonormal frame carried along a curve, turning by an antisymmetric matrix, is the one-dimensional ancestor of a connection: in module C12 the connection coefficients in an orthonormal frame are antisymmetric for exactly the same reason. In relativity the same construction gives the frame an accelerating, rotating observer carries.`,
  visual: {
    type: 'c3-curve',
    title: 'A frame that rides the curve',
    lead: t`Viviani’s curve, where a cylinder of radius 1 cuts a sphere of radius 2. Slide the point (or press Play) and watch the frame: $\mathbf T$ (blue) along the curve, $\mathbf N$ (orange) toward the bend, $\mathbf B$ (teal) out of the osculating plane. The readouts give $\kappa$ and $\tau$ at the point.`,
    tasks: [
      t`Watch $\kappa$ as the point goes round: it never drops below 0.5. Every curve on a sphere of radius $R$ has $\kappa \ge 1/R$ (one of the practice proofs).`,
      t`At the top of the sphere, $t = \pi$, the torsion is 0 and the curvature is largest, about 1.12: there the osculating plane momentarily stops twisting.`,
      t`At $t = 0$ and $t = 2\pi$ the curve passes through the same point $(2, 0, 0)$ with torsion $+0.375$ and $-0.375$. Two passages, two frames.`,
    ],
    params: {
      curve: { param: VIV, t: [0, r6(4 * Math.PI)] },
      at: 1, show: ['T', 'N', 'B'], toggles: ['B', 'circle'], readouts: ['t', 'kappa', 'tau'], range: 2.4, speed: 0.8, yaw: 2.1, pitch: 0.35, scale: { frame: 1.1 },
    },
    caption: t`$\kappa$ and $\tau$ are computed from numerical derivatives of the curve, $\kappa = |\alpha'\times\alpha''|/|\alpha'|^3$ and $\tau = (\alpha'\times\alpha'')\cdot\alpha'''/|\alpha'\times\alpha''|^2$, so they do not depend on $t$ being arc length. The frame vectors are drawn shortened.`,
  },
  example: {
    prompt: t`Prove the Frenet–Serret equations. Start from a unit-speed curve with $\kappa > 0$, define $\mathbf N = \mathbf T'/\kappa$ and $\mathbf B = \mathbf T\times\mathbf N$, and show that $\mathbf B'$ is a multiple of $\mathbf N$ (which defines $\tau$) and that $\mathbf N' = -\kappa\mathbf T + \tau\mathbf B$.`,
    visual: vivFixed(1, ['T', 'N', 'B'], t`The frame at one point of Viviani’s curve. Three mutually perpendicular unit vectors, right-handed.`),
    steps: [
      { label: 'T prime', text: t`$\mathbf T' = \kappa\mathbf N$ is the definition of $\mathbf N$. It is perpendicular to $\mathbf T$ because $\mathbf T\cdot\mathbf T = 1$ gives $2\,\mathbf T\cdot\mathbf T' = 0$.` },
      { label: 'B prime is perpendicular to B', text: t`$\mathbf B$ is a unit vector too, so the same argument gives $\mathbf B\cdot\mathbf B' = 0$.` },
      { label: 'B prime is perpendicular to T', text: t`Differentiate $\mathbf B = \mathbf T\times\mathbf N$: $\;\mathbf B' = \mathbf T'\times\mathbf N + \mathbf T\times\mathbf N' = \kappa\,\mathbf N\times\mathbf N + \mathbf T\times\mathbf N' = \mathbf T\times\mathbf N'$, which is perpendicular to $\mathbf T$.` },
      { label: 'Define torsion', text: t`Perpendicular to both $\mathbf T$ and $\mathbf B$, the vector $\mathbf B'$ must be a multiple of $\mathbf N$. Call the multiple $-\tau$: $\;\mathbf B' = -\tau\mathbf N$.` },
      { label: 'N prime', text: t`$\mathbf N = \mathbf B\times\mathbf T$ (a right-handed frame), so $\mathbf N' = \mathbf B'\times\mathbf T + \mathbf B\times\mathbf T' = -\tau\,\mathbf N\times\mathbf T + \kappa\,\mathbf B\times\mathbf N = \tau\mathbf B - \kappa\mathbf T$, using $\mathbf N\times\mathbf T = -\mathbf B$ and $\mathbf B\times\mathbf N = -\mathbf T$.` },
      { label: 'Check the pattern', text: t`The coefficient of $\mathbf N$ in $\mathbf T'$ is $\kappa$, the coefficient of $\mathbf T$ in $\mathbf N'$ is $-\kappa$; likewise $\tau$ and $-\tau$. In general, differentiating $\mathbf e_i\cdot\mathbf e_j = \delta_{ij}$ forces $\mathbf e_i'\cdot\mathbf e_j = -\mathbf e_j'\cdot\mathbf e_i$: the matrix of any moving orthonormal frame is antisymmetric.` },
    ],
    answer: t`$\mathbf T' = \kappa\mathbf N$, $\;\mathbf N' = -\kappa\mathbf T + \tau\mathbf B$, $\;\mathbf B' = -\tau\mathbf N$ — an antisymmetric matrix, because the frame stays orthonormal.`,
  },
  practice: [
    num({
      id: 'kappa-from-Tprime', difficulty: 1,
      gen(r) {
        const [p, q, k] = r.pick([[3, 4, 5], [5, 12, 13], [8, 6, 10], [12, 5, 13], [6, 8, 10]]);
        const sc = r.pick([0.01, 0.1, 0.02]);
        return {
          prompt: t`At a point of a unit-speed curve (lengths in metres), $\mathbf T = (1, 0, 0)$ and $\mathbf T' = (0,\ ${nice(p * sc)},\ ${nice(q * sc)})\ \text{m}^{-1}$. What is the curvature there?`,
          visual: { type: 'calc-vectors3d', params: { range: 2, vectors: [{ to: [1.5, 0, 0], color: 'accent', label: t`\mathbf T` }, { from: [1.5, 0, 0], to: [1.5, r6(1.2 * p / k), r6(1.2 * q / k)], color: 'warn', label: t`\mathbf T'` }] }, caption: t`$\mathbf T$ and the direction of $\mathbf T'$ (drawn at a fixed length, not to scale), perpendicular to it.` },
          answer: k * sc, units: 'm^-1', tol: { rel: 0.005 },
          errors: [{ value: (p + q) * sc, feedback: t`Add the components in quadrature: $\kappa = |\mathbf T'| = \sqrt{T_y'^2 + T_z'^2}$.` }],
          hints: [t`$\kappa = |\mathbf T'|$.`],
          teach: t`The curvature is the length of $\mathbf T'$, and $\mathbf N$ is its direction.`,
          explain: t`$\kappa = \sqrt{${nice(p * sc)}^2 + ${nice(q * sc)}^2} = ${nice(k * sc)}\ \text{m}^{-1}$, so the radius of curvature is $${nice(1 / (k * sc), 3)}\ \text{m}$ and $\mathbf N = \mathbf T'/\kappa = (0,\ ${nice(p / k)},\ ${nice(q / k)})$.`,
        };
      },
    }),
    mcq({
      id: 'why-perp', difficulty: 1,
      prompt: t`Why is $\mathbf T'(s)$ always perpendicular to $\mathbf T(s)$ for a unit-speed curve?`,
      visual: vivFixed(2.2, ['T', 'N'], t`$\mathbf T$ and $\mathbf N = \mathbf T'/\kappa$ at a point of Viviani’s curve.`),
      choices: [
        t`Because $|\mathbf T| = 1$ for all $s$: differentiating $\mathbf T\cdot\mathbf T = 1$ gives $2\,\mathbf T\cdot\mathbf T' = 0$`,
        'Because the acceleration of any moving body is perpendicular to its velocity',
        'Because the curve lies in a plane',
        t`Because $\kappa$ is constant`,
      ],
      answer: 0,
      why: {
        1: t`Only at constant speed. A rocket speeding up along a straight line has acceleration parallel to its velocity; in general $\alpha'' = \dot v\,\mathbf T + v^2\kappa\mathbf N$.`,
        2: 'Space curves need not be planar; the argument uses only the length of T.',
        3: t`$\kappa$ may vary from point to point; $\mathbf T\perp\mathbf T'$ holds everywhere regardless.`,
      },
      hints: ['What do you know about the length of T, for every s?'],
      teach: 'A vector of constant length is always perpendicular to its own derivative.',
      explain: t`Constant length is the whole reason. The same fact makes $\mathbf B' \perp \mathbf B$ and $\mathbf N' \perp \mathbf N$ — the diagonal of the Frenet matrix is zero.`,
    }),
    match({
      id: 'equations-meaning', difficulty: 2,
      prompt: 'Match each statement to what it says about the moving frame.',
      left: [t`$\mathbf T' = \kappa\mathbf N$`, t`$\mathbf B' = -\tau\mathbf N$`, t`$\mathbf N' = -\kappa\mathbf T + \tau\mathbf B$`, t`$\mathbf B = \mathbf T\times\mathbf N$`],
      right: ['The direction of motion turns toward N at rate κ', 'The osculating plane tips about T at rate τ', 'N swings back toward −T and out of the plane toward B', 'The frame is right-handed', 'The speed along the curve is constant'],
      answer: [0, 1, 2, 3],
      visual: vivFixed(4, ['T', 'N', 'B', 'circle'], t`The frame and the osculating circle (dashed), which lies in the plane of $\mathbf T$ and $\mathbf N$.`),
      hints: [t`$\mathbf B$ is the normal of the osculating plane: if $\mathbf B$ changes, the plane tips.`, 'Which equation holds by definition rather than by differentiation?'],
      teach: 'κ measures bending within the osculating plane; τ measures the plane itself twisting about the tangent.',
      explain: t`$\mathbf T'$ and $\mathbf B'$ each involve a single rate; $\mathbf N'$ is caught between them, losing ground to $\mathbf T$ at rate $\kappa$ and gaining toward $\mathbf B$ at rate $\tau$. Unit speed is the setting of the equations, not one of them.`,
    }),
    num({
      id: 'binormal-z', difficulty: 2,
      gen(r) {
        // both vectors close to the plane facing the default camera, so the osculating plane is seen face on
        let v1, v2, c;
        for (let k = 0; k < 40; k++) {
          const a = r.int(1, 3), b = r.int(1, 2), cc = r.pick([-1, 1, 2]);
          v1 = [-1, a, 2 - a]; v2 = [b, cc - 2 * b, -cc + r.int(0, 1)]; c = cross(v1, v2);
          if (norm(c) >= 1 && Math.abs(c[2]) >= 1) break;
        }
        const B = unit(c);
        return {
          prompt: t`At one instant a drone’s velocity is $\alpha' = (${v1.join(',\ ')})$ m/s and its acceleration $\alpha'' = (${v2.join(',\ ')})\ \text{m/s}^2$. Find the $z$-component of the binormal $\mathbf B$ of its path, to 3 significant figures.`,
          visual: { type: 'calc-vectors3d', params: { range: 3, vectors: [{ to: v1, color: 'accent', label: t`\alpha'` }, { to: v2, color: 'violet', label: t`\alpha''` }], parallelograms: [{ u: v1, v: v2, color: 'gold', alpha: 0.2 }] }, caption: t`Velocity and acceleration, and the parallelogram they span: it lies in the osculating plane. Drag to turn it.` },
          answer: B[2], tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: c[2], feedback: t`That is the $z$-component of $\alpha'\times\alpha''$ before normalizing. Divide by its length, $${nice(norm(c), 4)}$.` }].filter((e) => Math.abs(e.value - B[2]) > 0.01),
          hints: [t`$\mathbf B$ is the unit normal of the osculating plane, which contains $\alpha'$ and $\alpha''$ — at any speed.`, t`$\mathbf B = \dfrac{\alpha'\times\alpha''}{|\alpha'\times\alpha''|}$, and $\alpha'\times\alpha'' = ${vecTeX(c)}$.`],
          teach: t`In any parameter, $\mathbf B = \alpha'\times\alpha''/|\alpha'\times\alpha''|$: the tangential part of the acceleration drops out of the cross product.`,
          explain: t`$\alpha'\times\alpha'' = ${vecTeX(c)}$, of length $${nice(norm(c), 4)}$, so $\mathbf B = ${vecTeX(B)}$ and $B_z = ${nice(B[2], 3)}$. Writing $\alpha'' = \dot v\,\mathbf T + v^2\kappa\,\mathbf N$, only the $\mathbf N$ part survives $\alpha'\times\alpha''$, giving $v^3\kappa\,\mathbf B$.`,
        };
      },
    }),
    multi({
      id: 'matrix-props', difficulty: 3,
      prompt: t`Let $A$ be the Frenet–Serret matrix $\begin{pmatrix}0 & \kappa & 0\\ -\kappa & 0 & \tau\\ 0 & -\tau & 0\end{pmatrix}$. Select every true statement.`,
      visual: vivFixed(5.5, ['T', 'N', 'B'], 'The frame at another point: still orthonormal, as it is everywhere.'),
      choices: [
        t`$A^{\mathsf T} = -A$`,
        t`The zeros on the diagonal come from $|\mathbf T| = |\mathbf N| = |\mathbf B| = 1$`,
        'An antisymmetric matrix of coefficients keeps an orthonormal frame orthonormal as it moves',
        t`The eigenvalues of $A$ are $\kappa$ and $\tau$`,
        t`The zero in the corner ($\mathbf T'$ has no $\mathbf B$ part) is forced by antisymmetry alone`,
      ],
      answer: [0, 1, 2],
      why: {
        3: t`An antisymmetric real matrix has eigenvalues $0$ and $\pm i\sqrt{\kappa^2 + \tau^2}$: it generates rotations, not stretches.`,
        4: t`Antisymmetry only pairs the corners, $A_{13} = -A_{31}$. That both vanish is the *definition* of $\mathbf N$: $\mathbf T'$ points along $\mathbf N$.`,
      },
      hints: [t`Differentiate $\mathbf e_i\cdot\mathbf e_j = \delta_{ij}$ for the frame vectors $\mathbf e_i$.`, t`For the eigenvalues, compute $\det(A - \lambda I) = -\lambda^3 - \lambda(\kappa^2 + \tau^2)$.`],
      teach: 'Any moving orthonormal frame turns by an antisymmetric matrix; the Frenet frame is the one adapted so that T′ has only an N component.',
      explain: t`If $\mathbf e_i' = \sum_j A_{ij}\mathbf e_j$, differentiating $\mathbf e_i\cdot\mathbf e_j = \delta_{ij}$ gives $A_{ij} + A_{ji} = 0$. Conversely $\frac{d}{ds}(\mathbf e_i\cdot\mathbf e_j)$ vanishes whenever $A$ is antisymmetric and the frame is orthonormal, so the frame stays orthonormal. The eigenvalues $0, \pm i\sqrt{\kappa^2 + \tau^2}$ say the frame rotates about one axis at angular speed $\sqrt{\kappa^2 + \tau^2}$ per unit length.`,
    }),
    mcq({
      id: 'darboux', difficulty: 3,
      prompt: t`Which vector $\boldsymbol\omega$ makes all three Frenet–Serret equations take the form $\mathbf X' = \boldsymbol\omega\times\mathbf X$ (for $\mathbf X = \mathbf T, \mathbf N, \mathbf B$)?`,
      visual: { type: 'c3-curve', params: { curve: { param: ['1.6*cos(t)', '1.6*sin(t)', '0.4*t'], t: [-6, 6] }, at: 0.6, fixed: true, show: ['T', 'N', 'B'], readouts: [], range: 2.4 }, caption: 'A helix and its frame. The frame rotates about a fixed axis as it slides — which axis?' },
      choices: [t`$\boldsymbol\omega = \tau\mathbf T + \kappa\mathbf B$`, t`$\boldsymbol\omega = \kappa\mathbf T + \tau\mathbf B$`, t`$\boldsymbol\omega = \kappa\mathbf N$`, t`$\boldsymbol\omega = \tau\mathbf N + \kappa\mathbf B$`],
      answer: 0,
      why: {
        1: t`Check $\mathbf T$: $(\kappa\mathbf T + \tau\mathbf B)\times\mathbf T = \tau\,\mathbf B\times\mathbf T = \tau\mathbf N$, not $\kappa\mathbf N$.`,
        2: t`$\kappa\mathbf N\times\mathbf T = -\kappa\mathbf B$: wrong direction entirely. The rotation axis cannot lie along $\mathbf N$, which is itself turning.`,
        3: t`$(\tau\mathbf N + \kappa\mathbf B)\times\mathbf B = \tau\mathbf T$, but $\mathbf B' = -\tau\mathbf N$.`,
      },
      hints: [t`Use $\mathbf T\times\mathbf N = \mathbf B$, $\mathbf N\times\mathbf B = \mathbf T$, $\mathbf B\times\mathbf T = \mathbf N$.`, t`Try each candidate on $\mathbf T$ first: it must give $\kappa\mathbf N$.`],
      teach: t`The Darboux vector $\boldsymbol\omega = \tau\mathbf T + \kappa\mathbf B$ is the frame’s angular velocity per unit length.`,
      explain: t`$\boldsymbol\omega\times\mathbf T = \kappa\,\mathbf B\times\mathbf T = \kappa\mathbf N$; $\;\boldsymbol\omega\times\mathbf N = \tau\,\mathbf T\times\mathbf N + \kappa\,\mathbf B\times\mathbf N = \tau\mathbf B - \kappa\mathbf T$; $\;\boldsymbol\omega\times\mathbf B = \tau\,\mathbf T\times\mathbf B = -\tau\mathbf N$. ✓ The frame spins about $\boldsymbol\omega$ at $|\boldsymbol\omega| = \sqrt{\kappa^2 + \tau^2}$ radians per unit length: bending turns it about $\mathbf B$, twisting about $\mathbf T$. For a helix $\boldsymbol\omega$ is constant — along the axis.`,
    }),
    order({
      id: 'sphere-kappa', difficulty: 3,
      prompt: t`Prove that a unit-speed curve on a sphere of radius $R$ centred at the origin has $\kappa \ge 1/R$ everywhere. Order the steps.`,
      visual: vivFixed(3.6, ['T', 'N', 'circle'], t`Viviani’s curve on a sphere of radius 2: its osculating circles are never larger than the sphere’s great circles.`),
      items: [
        t`On the sphere, $\alpha\cdot\alpha = R^2$; differentiating, $\alpha\cdot\mathbf T = 0$.`,
        t`Differentiate again: $\mathbf T\cdot\mathbf T + \alpha\cdot\mathbf T' = 0$, so $\alpha\cdot\kappa\mathbf N = -1$.`,
        t`By Cauchy–Schwarz, $1 = |\alpha\cdot\kappa\mathbf N| \le |\alpha|\,\kappa = R\kappa$.`,
        t`Hence $\kappa \ge 1/R$, with equality where $\mathbf N$ points straight at the centre — as on a great circle.`,
      ],
      hints: ['Start from the constraint that keeps the curve on the sphere, and differentiate it twice.', t`$\mathbf T\cdot\mathbf T = 1$ and $\mathbf T' = \kappa\mathbf N$.`],
      teach: 'Differentiating a constraint twice turns it into a bound on curvature.',
      explain: t`The sphere forces the curve to bend at least as much as its great circles. In the explorer Viviani’s curve has $\kappa \ge 0.5 = 1/R$, touching the bound at $(2, 0, 0)$, where $\mathbf N$ points at the centre.`,
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student derives $\mathbf N'$ from $\mathbf N = \mathbf B\times\mathbf T$:

$$\mathbf N' = \mathbf B'\times\mathbf T + \mathbf B\times\mathbf T' = (-\tau\mathbf N)\times\mathbf T + \mathbf B\times(\kappa\mathbf N) = \tau\mathbf B + \kappa\mathbf T.$$

Where is the mistake?`,
      visual: vivFixed(2.8, ['T', 'N', 'B'], t`A right-handed frame: $\mathbf T\times\mathbf N = \mathbf B$, $\mathbf N\times\mathbf B = \mathbf T$, $\mathbf B\times\mathbf T = \mathbf N$.`),
      choices: [
        t`$\mathbf B\times\mathbf N = -\mathbf T$, so the last term is $-\kappa\mathbf T$`,
        t`$\mathbf N\times\mathbf T = +\mathbf B$, so the first term is $-\tau\mathbf B$`,
        t`$\mathbf N = \mathbf T\times\mathbf B$, so the whole computation starts wrong`,
        t`$\mathbf B' = +\tau\mathbf N$, so the first term has the wrong sign`,
      ],
      answer: 0,
      why: {
        1: t`$\mathbf N\times\mathbf T = -\mathbf T\times\mathbf N = -\mathbf B$, so $(-\tau\mathbf N)\times\mathbf T = \tau\mathbf B$ — that term is right.`,
        2: t`$\mathbf T\times\mathbf B = -\mathbf N$. The student’s starting point $\mathbf N = \mathbf B\times\mathbf T$ is correct.`,
        3: t`$\mathbf B' = -\tau\mathbf N$ is this course’s convention (some books use $+$, with $\tau$ flipped). Within one convention the student used it correctly.`,
      },
      hints: ['Check each cross product against the cyclic order T → N → B → T.', t`$\mathbf N\times\mathbf B = \mathbf T$; what is $\mathbf B\times\mathbf N$?`],
      teach: 'In a right-handed frame, cyclic products are positive and reversed ones negative: B × N = −T.',
      explain: t`$\mathbf B\times\mathbf N = -\mathbf T$, so $\mathbf N' = \tau\mathbf B - \kappa\mathbf T$. With $+\kappa\mathbf T$ the matrix would not be antisymmetric, and $\frac{d}{ds}(\mathbf T\cdot\mathbf N) = \kappa + \kappa \ne 0$ — the frame would stop being orthonormal.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-coaster', difficulty: 3, transfer: true,
      gen(r) {
        const [k, ta, w] = r.pick([[0.08, 0.06, 0.1], [0.05, 0.12, 0.13], [0.12, 0.05, 0.13], [0.06, 0.08, 0.1]]);
        const v = r.pick([15, 20, 25]);
        return {
          prompt: t`A roller-coaster corkscrew is a helix with curvature $\kappa = ${k}\ \text{m}^{-1}$ and torsion $\tau = ${ta}\ \text{m}^{-1}$. A car runs through it at $${v}\ \text{m/s}$. If the riders’ seats followed the Frenet frame, at what angular speed would the riders turn, in rad/s?`,
          visual: (() => {
            const a = k / (w * w), b = ta / (w * w), sc = 2.2 / Math.max(a, b * Math.PI);
            return { type: 'c3-curve', params: { curve: { param: [`${r6(a * sc)}*cos(t)`, `${r6(a * sc)}*sin(t)`, `${r6(b * sc)}*t`], t: [r6(-Math.PI), r6(Math.PI)] }, at: 0.8, fixed: true, show: ['T', 'N', 'B'], readouts: [], range: 2.6, scale: { frame: 0.8 } }, caption: t`One turn of the corkscrew (radius $${nice(a, 3)}\ \text{m}$, rising $${nice(2 * Math.PI * b, 3)}\ \text{m}$ per turn), scaled down, with the Frenet frame at the car. Real tracks are banked to suit the riders, so a seat’s frame is not exactly Frenet.` };
          })(),
          answer: v * w, units: 'rad/s', tol: { rel: 0.01 },
          errors: [{ value: v * k, feedback: t`That counts only the bending, about $\mathbf B$. The frame also twists about $\mathbf T$ at rate $\tau$: the angular velocity per metre is the Darboux vector $\tau\mathbf T + \kappa\mathbf B$.` }, { value: v * (k + ta), feedback: t`The two rates are perpendicular components of one angular velocity: add them in quadrature, not directly.` }],
          hints: [t`Per metre of track the frame turns at $|\boldsymbol\omega| = |\tau\mathbf T + \kappa\mathbf B| = \sqrt{\kappa^2 + \tau^2}$.`, t`Per second, multiply by the speed: $\Omega = v\sqrt{\kappa^2 + \tau^2}$.`],
          teach: t`A frame carried along a curve at speed $v$ rotates at $v\sqrt{\kappa^2 + \tau^2}$ radians per second.`,
          explain: t`$\sqrt{${k}^2 + ${ta}^2} = ${w}\ \text{m}^{-1}$, so $\Omega = ${v} \times ${w} = ${nice(v * w)}$ rad/s — a full turn every $${nice((2 * Math.PI) / (v * w), 3)}$ s.`,
        };
      },
    }),
    num({
      id: 'cp-dT-dt', difficulty: 2,
      gen(r) {
        const v = r.pick([3, 4, 5, 8]), rate = r.pick([0.6, 1.2, 2, 2.4]);
        return {
          prompt: t`A particle moves along a curve (lengths in metres) at speed $${v}\ \text{m/s}$. Its unit tangent changes at the rate $|d\mathbf T/dt| = ${rate}$ rad/s. What is the curvature of its path?`,
          visual: vivFixed(1.5, ['T', 'N'], 'A curve with its unit tangent and principal normal at one point.'),
          answer: rate / v, units: 'm^-1', tol: { rel: 0.005 },
          errors: [{ value: rate * v, feedback: t`Convert a rate per second into a rate per metre by dividing by the speed: $\kappa = |d\mathbf T/ds| = |d\mathbf T/dt|/v$.` }],
          hints: [t`$\dfrac{d\mathbf T}{dt} = \dfrac{d\mathbf T}{ds}\dfrac{ds}{dt} = v\kappa\,\mathbf N$.`, t`So $\kappa = \dfrac{|d\mathbf T/dt|}{v}$.`],
          teach: 'Curvature is a rate per unit length; a rate per unit time must be divided by the speed.',
          explain: t`$\kappa = ${rate}/${v} = ${nice(rate / v, 3)}\ \text{m}^{-1}$, a radius of curvature of $${nice(v / rate, 3)}\ \text{m}$. In a general parameter all three equations pick up the speed: $\dot{\mathbf T} = v\kappa\mathbf N$, $\dot{\mathbf N} = v(-\kappa\mathbf T + \tau\mathbf B)$, $\dot{\mathbf B} = -v\tau\mathbf N$.`,
        };
      },
    }),
    mcq({
      id: 'cp-undefined', difficulty: 2,
      prompt: t`The curve $\alpha(t) = (t,\ t^3,\ 0)$ has $\kappa = 0$ at $t = 0$, an inflection. What happens to the Frenet frame there?`,
      visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-1.6, 1.6], equal: true, aspect: 'wide', curves: [{ fn: 'x^3', color: 'accent', width: 2.4 }], arrows: [{ from: [-0.8, -0.512], to: [r6(-0.8 + 0.5 * 1.92 / Math.hypot(1, 1.92)), r6(-0.512 - 0.5 / Math.hypot(1, 1.92))], color: 'warn', label: 'N' }, { from: [0.8, 0.512], to: [r6(0.8 - 0.5 * 1.92 / Math.hypot(1, 1.92)), r6(0.512 + 0.5 / Math.hypot(1, 1.92))], color: 'warn', label: 'N' }], points: [{ x: 0, y: 0, color: 'gold', label: 'κ = 0' }] }, caption: t`The principal normal at $x = \pm0.8$: it points into the bend, so it is on opposite sides of the curve before and after the inflection.` },
      choices: [
        t`$\mathbf T$ is still defined, but $\mathbf N = \mathbf T'/\kappa$ and $\mathbf B = \mathbf T\times\mathbf N$ are not — and $\mathbf N$ flips across the point`,
        t`The whole frame is undefined, since the curve is singular there`,
        t`Nothing: $\mathbf N$ and $\mathbf B$ pass smoothly through the point`,
        t`$\mathbf N$ becomes $\mathbf B$ and $\mathbf B$ becomes $-\mathbf N$`,
      ],
      answer: 0,
      why: {
        1: t`The curve is regular, $\alpha'(0) = (1, 0, 0) \ne 0$, so $\mathbf T$ is fine. Only the frame built from $\mathbf T'$ fails.`,
        2: t`$\mathbf N$ points toward the bend: toward $-y$ before the inflection and $+y$ after. A unit vector cannot do that continuously through a point where $\mathbf T' = 0$.`,
        3: 'No such swap is defined; the formulas simply divide by κ = 0.',
      },
      hints: [t`Which frame vector is defined using a division by $\kappa$?`],
      teach: 'The Frenet frame needs κ > 0; at an inflection N and B are undefined and N can jump.',
      explain: t`Regularity gives $\mathbf T$; the rest needs $\kappa > 0$. This is a real limitation: later, frames that never fail (parallel transport, “Bishop frames”) replace Frenet’s where curves straighten.`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §1-5', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), §2.3', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
    { label: 'Needham, Visual Differential Geometry and Forms, Act I', url: 'https://press.princeton.edu/books/hardcover/9780691203690/visual-differential-geometry-and-forms' },
  ],
});
