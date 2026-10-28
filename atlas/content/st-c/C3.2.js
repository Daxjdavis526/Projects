// Tangent planes and normals: T_pS = span{X_u, X_v} as the velocities of
// curves on the surface; the unit normal and its orientation; level surfaces;
// what the tangent vectors alone can and cannot see.
import { lesson, mcq, multi, num, expr, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6, mesh, norm, dot } from './_dg.js';

const t = String.raw;
const DEG = Math.PI / 180;
const TAU = r6(2 * Math.PI);

// the torus R = 2, r = 0.8, and its partials, as expression strings
const TOR = (u, v) => [`(2 + 0.8*cos(${v}))*cos(${u})`, `(2 + 0.8*cos(${v}))*sin(${u})`, `0.8*sin(${v})`];
// the saddle X(u, v) = (u, v, uv)
const SAD = (u, v) => [`${u}`, `${v}`, `${u}*${v}`];
const saddlePic = (u0, v0, { vectors = [], caption, planes = [], dom = 1.5 } = {}) => ({
  type: 'calc-vectors3d',
  params: {
    range: dom > 1.6 ? 2.6 : 2, grid: false,
    curves: mesh(SAD, [-dom, dom], [-dom, dom], { nu: 8, nv: 8, color: 'ink3', width: 1 }),
    points: [{ at: [u0, v0, u0 * v0], color: 'gold', label: 'p' }],
    vectors, planes,
  },
  caption,
});
const vecTeX = (v) => t`(${v.map((x) => nice(x, 3)).join(',\ ')})`;

export default lesson({
  id: 'st-c.C3.2',
  title: 'Tangent planes and normals',
  minutes: 12, difficulty: 3,
  intro: t`At a point $p = \mathbf X(u_0, v_0)$ of a regular surface $S$, the **tangent plane** $T_pS$ is the plane spanned by $\mathbf X_u$ and $\mathbf X_v$. It deserves its name because it is exactly the set of velocities of curves that run along the surface through $p$ — a description that mentions no coordinates, so $T_pS$ is the same whichever patch you use. Perpendicular to it is the **unit normal**

$$\mathbf n = \frac{\mathbf X_u\times\mathbf X_v}{|\mathbf X_u\times\mathbf X_v|},$$

defined up to a sign: swapping the roles of $u$ and $v$ flips it. Notice what each object needs. Lengths and angles of curves *in* the surface use only tangent vectors; $\mathbf n$ sticks out into the surrounding space. That split — **tangent data versus normal data** — runs through the rest of this course.`,
  symbols: [
    { tex: 'T_pS', text: t`the tangent plane at $p$: all velocities of curves on $S$ through $p$ (a 2D vector space)` },
    { tex: t`\mathbf X_u,\ \mathbf X_v`, text: t`the coordinate velocities at $p$: a basis of $T_pS$ for a regular patch` },
    { tex: t`\mathbf n`, text: 'the unit normal: perpendicular to the tangent plane, length 1, sign fixed by the order (u, v)' },
    { tex: t`|\mathbf X_u\times\mathbf X_v|`, text: 'the area stretch factor, nonzero because the patch is regular' },
  ],
  why: t`The next module measures lengths on a surface with $E = \mathbf X_u\cdot\mathbf X_u$, $F = \mathbf X_u\cdot\mathbf X_v$, $G = \mathbf X_v\cdot\mathbf X_v$ — the **first fundamental form**, prototype of the metric $g_{\mu\nu}$. It drops $\mathbf n$ entirely. Module C5 brings $\mathbf n$ back to measure bending; Gauss’s surprise (C6) is that part of that bending can be recovered without it — which is what lets spacetime be curved with no normal direction to bend into.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'A moving tangent plane',
    lead: t`A torus drawn by its coordinate curves. At the point $\mathbf X(u_0, v_0)$ you see $\tfrac12\mathbf X_u$ (blue), $\mathbf X_v$ (gold), the unit normal $\mathbf n$ (red) and a patch of the tangent plane (violet).`,
    tasks: [
      t`Move the point around. $\mathbf n$ is always perpendicular to the plane, and the plane always contains both coordinate velocities.`,
      t`Switch the orientation to $(v, u)$: $\mathbf n$ flips to the other side. The tangent plane does not change — only the choice of which side is “up”.`,
      t`Take $v_0 = \pi \approx 3.14$, the inner equator: the outward normal now points toward the axis, and the area factor is at its smallest, $0.8 \times 1.2 = 0.96$.`,
    ],
    params: {
      range: 3, grid: false,
      sliders: [
        { key: 'a', label: '$u_0$', min: 0, max: 6.28, step: 0.01, value: 1.4, explain: 'Angle round the central axis, in radians.' },
        { key: 'b', label: '$v_0$', min: 0, max: 6.28, step: 0.01, value: 0.9, explain: 'Angle round the tube, in radians; 0 is the outer equator.' },
      ],
      choices: [{ key: 'o', label: 'Orientation', options: [[1, '$(u, v)$'], [-1, '$(v, u)$']], value: 1, explain: t`Which cross product defines $\mathbf n$: $\mathbf X_u\times\mathbf X_v$ or $\mathbf X_v\times\mathbf X_u$.` }],
      curves: mesh(TOR, [0, TAU], [0, TAU], { nu: 16, nv: 10, closedU: true, closedV: true, color: 'ink3', width: 1 }),
      points: [{ at: TOR('a', 'b'), color: 'gold' }],
      planes: [{ normal: ['cos(b)*cos(a)', 'cos(b)*sin(a)', 'sin(b)'], point: TOR('a', 'b'), size: 0.75, color: 'violet', alpha: 0.3 }],
      vectors: [
        { from: TOR('a', 'b'), to: [`(2 + 0.8*cos(b))*cos(a) - 0.5*(2 + 0.8*cos(b))*sin(a)`, `(2 + 0.8*cos(b))*sin(a) + 0.5*(2 + 0.8*cos(b))*cos(a)`, '0.8*sin(b)'], color: 'accent', label: t`\tfrac12\mathbf X_u` },
        { from: TOR('a', 'b'), to: [`(2 + 0.8*cos(b))*cos(a) - 0.8*sin(b)*cos(a)`, `(2 + 0.8*cos(b))*sin(a) - 0.8*sin(b)*sin(a)`, '0.8*sin(b) + 0.8*cos(b)'], color: 'gold', label: t`\mathbf X_v` },
        { from: TOR('a', 'b'), to: [`(2 + 0.8*cos(b))*cos(a) + o*cos(b)*cos(a)`, `(2 + 0.8*cos(b))*sin(a) + o*cos(b)*sin(a)`, '0.8*sin(b) + o*sin(b)'], color: 'bad', label: t`\mathbf n` },
      ],
      readouts: [
        { label: t`$\mathbf n$`, vec: ['o*cos(b)*cos(a)', 'o*cos(b)*sin(a)', 'o*sin(b)'], digits: 3 },
        { label: t`$|\mathbf X_u\times\mathbf X_v|$`, expr: '0.8*(2 + 0.8*cos(b))', digits: 3 },
      ],
    },
    caption: t`The torus $\big((2 + 0.8\cos v)\cos u,\ (2 + 0.8\cos v)\sin u,\ 0.8\sin v\big)$. Arrows are to scale except $\mathbf X_u$, drawn at half length. With orientation $(u, v)$, $\mathbf n = (\cos v\cos u,\ \cos v\sin u,\ \sin v)$ points out of the tube.`,
  },
  example: {
    prompt: t`A cooling tower is shaped like the hyperboloid $x^2 + y^2 - z^2 = 1$ (in units of its waist radius), parameterized as $\mathbf X(u, v) = (\cosh v\cos u,\ \cosh v\sin u,\ \sinh v)$. Find the unit normal and the tangent plane at the point with $u = 0$, $v = \ln 2$, and check the normal against the gradient of $F = x^2 + y^2 - z^2$.`,
    visual: { type: 'surface3d', params: { surface: ['cosh(v)*cos(u)', 'cosh(v)*sin(u)', 'sinh(v)'], domain: [[0, TAU], [-1.3, 1.3]], alpha: 0.8, yaw: 0.2, pitch: 0.25, dist: 9, curves: [{ param: ['1.25 + 0.5*t', '0', '0.75 + 0.5*t*(5/3)'], t: [-0.8, 0.8], color: 'gold', width: 3 }, { param: ['1.25', 't', '0.75'], t: [-0.8, 0.8], color: 'gold', width: 3 }, { param: ['1.25 + 0.6*t*5/sqrt(34)', '0', '0.75 - 0.6*t*3/sqrt(34)'], t: [0, 1.6], color: 'bad', width: 3.5 }] }, caption: t`The hyperboloid, two tangent directions at $(\tfrac54, 0, \tfrac34)$ (gold) and the normal line (red). It is a ruled surface: through every point run two straight lines, and both lie in the tangent plane.` },
    steps: [
      { label: 'The point', text: t`$\cosh(\ln 2) = \tfrac12(2 + \tfrac12) = \tfrac54$ and $\sinh(\ln 2) = \tfrac34$, so $p = (\tfrac54, 0, \tfrac34)$. Check: $\tfrac{25}{16} - \tfrac{9}{16} = 1$ ✓.` },
      { label: 'Tangent vectors', text: t`$\mathbf X_u = (-\cosh v\sin u,\ \cosh v\cos u,\ 0) = (0, \tfrac54, 0)$ and $\mathbf X_v = (\sinh v\cos u,\ \sinh v\sin u,\ \cosh v) = (\tfrac34, 0, \tfrac54)$.` },
      { label: 'Cross product', text: t`$\mathbf X_u\times\mathbf X_v = \big(\tfrac54\cdot\tfrac54 - 0,\ 0 - 0,\ 0 - \tfrac54\cdot\tfrac34\big) = \tfrac54\,(\tfrac54, 0, -\tfrac34)$.` },
      { label: 'Unit normal', text: t`$\mathbf n = \dfrac{(5, 0, -3)}{\sqrt{34}} \approx (0.857, 0, -0.514)$. It points outward and downward: above the waist the wall leans out.` },
      { label: 'Tangent plane', text: t`$(5, 0, -3)\cdot\big((x, y, z) - p\big) = 0$, i.e. $5x - 3z = \tfrac{25}4 - \tfrac94 = 4$.` },
      { label: 'Check with the gradient', text: t`$\nabla F = (2x, 2y, -2z) = (\tfrac52, 0, -\tfrac32)$ at $p$ — parallel to $(5, 0, -3)$ ✓. A level surface’s gradient is normal to it, because $F$ is constant along every curve in the surface.` },
    ],
    answer: t`$\mathbf n = (5, 0, -3)/\sqrt{34}$ and the tangent plane is $5x - 3z = 4$, agreeing with $\nabla F \parallel (x, y, -z)$.`,
  },
  practice: [
    mcq({
      id: 'in-plane', difficulty: 1,
      prompt: t`On the saddle $\mathbf X(u, v) = (u, v, uv)$ at $(u, v) = (1, 1)$, $\mathbf X_u = (1, 0, 1)$ and $\mathbf X_v = (0, 1, 1)$. Which vector lies in the tangent plane there?`,
      visual: saddlePic(1, 1, { vectors: [{ from: [1, 1, 1], to: [2, 1, 2], color: 'accent', label: t`\mathbf X_u` }, { from: [1, 1, 1], to: [1, 2, 2], color: 'gold', label: t`\mathbf X_v` }], caption: t`The saddle $z = uv$ drawn by its coordinate curves over $|u|, |v| \le 1.5$, with $\mathbf X_u$ and $\mathbf X_v$ at $p = \mathbf X(1, 1)$.` }),
      choices: [t`$(2, -1, 1)$`, t`$(-1, -1, 1)$`, t`$(1, 1, 1)$`, t`$(1, 2, 1)$`],
      answer: 0,
      why: {
        1: t`That is $\mathbf X_u\times\mathbf X_v$: perpendicular to the tangent plane.`,
        2: t`That is the position $\mathbf X(1, 1)$ — a point, not a tangent vector. It is not of the form $a\mathbf X_u + b\mathbf X_v$.`,
        3: t`$a(1, 0, 1) + b(0, 1, 1) = (a, b, a + b)$; with $a = 1$, $b = 2$ that is $(1, 2, 3)$, not $(1, 2, 1)$.`,
      },
      hints: [t`Every tangent vector is $a\mathbf X_u + b\mathbf X_v = (a, b, a + b)$.`, 'Read a and b off the first two components, then check the third.'],
      teach: t`A vector is tangent exactly when it is a combination $a\mathbf X_u + b\mathbf X_v$ — equivalently, when it is perpendicular to $\mathbf X_u\times\mathbf X_v$.`,
      explain: t`$(2, -1, 1) = 2\mathbf X_u - \mathbf X_v$: it is the velocity of the curve $\mathbf X(1 + 2t,\ 1 - t)$ at $t = 0$. Its dot product with the normal direction $(-1, -1, 1)$ is $-2 + 1 + 1 = 0$ ✓.`,
    }),
    expr({
      id: 'helicoid-plane', difficulty: 2,
      gen(r) {
        const c = r.pick([1, 2, 3]), u0 = r.pick([1, 2, 3]), half = r.bool(0.5);
        const v0 = half ? Math.PI / 2 : 0;
        const p = [u0 * Math.cos(v0), u0 * Math.sin(v0), c * v0];
        const nn = [c * Math.sin(v0), -c * Math.cos(v0), u0].map((x) => r6(x));
        const ans = half ? `${c}x + ${u0}z = ${r6(u0 * c * Math.PI / 2)}` : `-${c}y + ${u0}z = 0`;
        return {
          prompt: t`Find the tangent plane of the helicoid $\mathbf X(u, v) = (u\cos v,\ u\sin v,\ ${c}v)$ at $u = ${u0}$, $v = ${half ? t`\pi/2` : '0'}$, as an equation in $x$, $y$, $z$.`,
          visual: { type: 'surface3d', params: { surface: ['u*cos(v)', 'u*sin(v)', `${c}*v`], domain: [[-3.2, 3.2], [-1.6, 3.2]], zscale: r6(0.55 / c), alpha: 0.8, pitch: 0.45, curves: [{ param: [`${u0}*cos(t)`, `${u0}*sin(t)`, `${c}*t`], t: [-1.6, 3.2], color: 'gold', width: 2.4 }] }, caption: t`The helicoid (heights scaled by $${r6(0.55 / c)}$), with the helix $u = ${u0}$ through the point.` },
          answer: ans, mode: 'equation', vars: { x: [-3, 3], y: [-3, 3], z: [-3, 3] },
          answerTeX: half ? t`${c}x + ${u0}z = ${nice(u0 * c)}\pi/2` : t`-${c}y + ${u0}z = 0`,
          errors: [{ answer: half ? `${c}x + ${u0}z = 0` : `${c}y + ${u0}z = 0`, feedback: half ? t`The plane must pass through the point $(0, ${u0}, ${c}\pi/2)$: plug it in to get the right-hand side.` : t`Check the sign of the normal: $\mathbf X_u\times\mathbf X_v = (${c}\sin v,\ -${c}\cos v,\ u)$.` }],
          hints: [t`$\mathbf X_u = (\cos v, \sin v, 0)$ and $\mathbf X_v = (-u\sin v,\ u\cos v,\ ${c})$, so $\mathbf X_u\times\mathbf X_v = (${c}\sin v,\ -${c}\cos v,\ u)$.`, t`At the point, the normal is $${vecTeX(nn)}$ and the point is $${vecTeX(p.map((x) => r6(x)))}$${half ? t` (the last coordinate is $${c}\pi/2$)` : ''}.`],
          teach: t`The tangent plane at $p$ is $(\mathbf X_u\times\mathbf X_v)\cdot(\mathbf x - p) = 0$.`,
          explain: half ? t`Normal $(${c}, 0, ${u0})$ through $(0, ${u0}, ${c}\pi/2)$: $${c}x + ${u0}(z - ${c}\pi/2) = 0$, i.e. $${c}x + ${u0}z = ${nice(u0 * c)}\pi/2$.` : t`Normal $(0, -${c}, ${u0})$ through $(${u0}, 0, 0)$: $-${c}y + ${u0}z = 0$. The plane contains the whole ruling line $v = 0$ (the $x$-axis segment), as it must.`,
        };
      },
    }),
    mcq({
      id: 'flip', difficulty: 2,
      prompt: t`A patch is re-labelled by swapping its coordinates: $\bar{\mathbf X}(s, t) = \mathbf X(t, s)$. What happens at each point?`,
      visual: saddlePic(0.6, -0.5, { vectors: [{ from: [0.6, -0.5, -0.3], to: [r6(0.6 + 0.5 / Math.sqrt(1.61)), r6(-0.5 - 0.6 / Math.sqrt(1.61)), r6(-0.3 + 1 / Math.sqrt(1.61))], color: 'bad', label: t`\mathbf n` }, { from: [0.6, -0.5, -0.3], to: [r6(0.6 - 0.5 / Math.sqrt(1.61)), r6(-0.5 + 0.6 / Math.sqrt(1.61)), r6(-0.3 - 1 / Math.sqrt(1.61))], color: 'violet', label: t`-\mathbf n` }], caption: t`The two unit normals at a point of the saddle. A choice of coordinates picks one of them.` }),
      choices: [
        t`The tangent plane is unchanged; the unit normal becomes $-\mathbf n$`,
        t`The tangent plane rotates by $90^\circ$; the normal is unchanged`,
        'Both are unchanged: they are geometric',
        t`The unit normal is unchanged, since $|\mathbf X_u\times\mathbf X_v| = |\mathbf X_v\times\mathbf X_u|$`,
      ],
      answer: 0,
      why: {
        1: t`The span of $\{\mathbf X_u, \mathbf X_v\}$ does not care about order; it is the same plane.`,
        2: t`The plane is geometric; the *sign* of $\mathbf n$ is a choice, made by the order of the coordinates.`,
        3: t`The lengths agree but the vectors are opposite: $\mathbf X_v\times\mathbf X_u = -\mathbf X_u\times\mathbf X_v$.`,
      },
      hints: [t`$\bar{\mathbf X}_s = \mathbf X_v$ and $\bar{\mathbf X}_t = \mathbf X_u$.`],
      teach: 'The tangent plane is geometric; the sign of the unit normal is an orientation, chosen by the order of the coordinates.',
      explain: t`$\bar{\mathbf X}_s\times\bar{\mathbf X}_t = \mathbf X_v\times\mathbf X_u = -\mathbf X_u\times\mathbf X_v$: the Jacobian of the swap has determinant $-1$. A surface on which a consistent choice exists everywhere is **orientable** — the Möbius band is the classic one that is not.`,
    }),
    num({
      id: 'coord-angle', difficulty: 2,
      gen(r) {
        const u0 = r.pick([1, -1, 0.5, 1.5]), v0 = r.pick([1, 1.2, -0.5, 1.5]);
        const Xu = [1, 0, v0], Xv = [0, 1, u0];
        const cosA = dot(Xu, Xv) / (norm(Xu) * norm(Xv)), ang = Math.acos(cosA) / DEG;
        return {
          prompt: t`At the point $(u, v) = (${u0}, ${v0})$ of the saddle $\mathbf X(u, v) = (u, v, uv)$, what angle do the two coordinate curves make with each other, in degrees?`,
          visual: saddlePic(u0, v0, { caption: t`The saddle’s coordinate curves: straight lines in space, crossing at angles that vary from point to point.` }),
          answer: ang, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 90, feedback: t`The coordinate lines look perpendicular from above, but they also climb: compute $\cos\theta = \mathbf X_u\cdot\mathbf X_v/(|\mathbf X_u||\mathbf X_v|)$.` }],
          hints: [t`$\mathbf X_u = (1, 0, v) = (1, 0, ${v0})$ and $\mathbf X_v = (0, 1, u) = (0, 1, ${u0})$.`, t`$\cos\theta = \dfrac{uv}{\sqrt{1 + v^2}\sqrt{1 + u^2}}$.`],
          teach: t`The angle between coordinate curves comes from dot products of tangent vectors: $\cos\theta = \mathbf X_u\cdot\mathbf X_v/(|\mathbf X_u||\mathbf X_v|)$.`,
          explain: t`$\cos\theta = \dfrac{${nice(u0 * v0)}}{\sqrt{${nice(1 + v0 * v0)}}\sqrt{${nice(1 + u0 * u0)}}} = ${nice(cosA, 4)}$, so $\theta = ${nice(ang, 4)}^\circ$. The numerator $\mathbf X_u\cdot\mathbf X_v$ is what the next module calls $F$; the coordinate curves are perpendicular exactly where $F = 0$.`,
        };
      },
    }),
    order({
      id: 'plane-independent', difficulty: 3,
      prompt: t`Show that $\operatorname{span}\{\mathbf X_u, \mathbf X_v\}$ at $p$ is exactly the set of velocities of curves on $S$ through $p$ — so it does not depend on the patch. Order the steps.`,
      visual: { type: 'calc-vectors3d', params: { range: 3, grid: false, curves: [...mesh(TOR, [0, TAU], [0, TAU], { nu: 16, nv: 10, closedU: true, closedV: true, color: 'ink3', width: 1 }), { param: TOR('0.6 + 0.5*t', '0.9 + t'), t: [-1, 1], color: 'gold', width: 2.6 }], points: [{ at: TOR(0.6, 0.9), color: 'gold', label: 'p' }] }, caption: t`A curve on the torus through $p$, written in coordinates as $\mathbf X(u(t), v(t))$.` },
      items: [
        t`A curve on $S$ through $p$ can be written $\gamma(t) = \mathbf X(u(t), v(t))$ with $(u(0), v(0)) = (u_0, v_0)$.`,
        t`Chain rule: $\gamma'(0) = u'(0)\,\mathbf X_u + v'(0)\,\mathbf X_v$, which lies in the span.`,
        t`Conversely, $a\mathbf X_u + b\mathbf X_v$ is the velocity at $t = 0$ of the curve $\mathbf X(u_0 + at,\ v_0 + bt)$.`,
        t`So the span equals the set of velocities of curves on $S$ through $p$ — a description that uses no patch at all.`,
      ],
      hints: ['Two inclusions: every curve velocity is in the span, and every vector in the span is a curve velocity.', 'Use the chain rule for the first, and a straight line in the (u, v)-plane for the second.'],
      teach: 'The tangent plane is the set of velocities of curves in the surface — a definition that needs no coordinates.',
      explain: t`This is the definition of a tangent space that survives in module C9, where there is no surrounding $\mathbb R^3$: tangent vectors are velocities of curves (or, equivalently, directional derivatives — lesson st-a A2.3).`,
    }),
    mcq({
      id: 'level-normal', difficulty: 2,
      prompt: t`A surface is given implicitly as a level set $F(x, y, z) = c$ with $\nabla F \ne 0$. Why is $\nabla F$ normal to it?`,
      visual: { type: 'calc-vectors3d', params: { range: 2.2, spheres: [{ centre: [0, 0, 0], radius: 1.5, color: 'teal' }], vectors: [{ from: [r6(1.5 * Math.sin(0.9) * Math.cos(0.5)), r6(1.5 * Math.sin(0.9) * Math.sin(0.5)), r6(1.5 * Math.cos(0.9))], to: [r6(2.3 * Math.sin(0.9) * Math.cos(0.5)), r6(2.3 * Math.sin(0.9) * Math.sin(0.5)), r6(2.3 * Math.cos(0.9))], color: 'bad', label: t`\nabla F` }], curves: [{ param: [`1.5*sin(0.9 + t)*cos(0.5)`, `1.5*sin(0.9 + t)*sin(0.5)`, '1.5*cos(0.9 + t)'], t: [-0.5, 0.5], color: 'gold', width: 2.4 }] }, caption: t`The sphere $x^2 + y^2 + z^2 = 2.25$, a curve on it (gold) and the gradient of $F = x^2 + y^2 + z^2$ at a point.` },
      choices: [
        t`For every curve $\gamma$ in the surface, $F(\gamma(t)) = c$; differentiating, $\nabla F\cdot\gamma' = 0$, so $\nabla F$ is perpendicular to every tangent vector`,
        t`Because $\nabla F$ points in the direction in which $F$ is constant`,
        t`Because $\nabla F$ has length 1`,
        t`Only for spheres, where $\nabla F$ is radial`,
      ],
      answer: 0,
      why: {
        1: t`The gradient points where $F$ *increases* fastest; the directions in which $F$ stays constant are the tangent ones, perpendicular to it.`,
        2: t`$\nabla F$ need not be a unit vector; it is normal whatever its length. Divide by $|\nabla F|$ to get $\mathbf n$.`,
        3: t`The argument works for any level surface; the worked example used it on a hyperboloid.`,
      },
      hints: ['Every curve lying in the surface keeps F constant. Differentiate that.'],
      teach: 'The gradient of F is perpendicular to every curve in a level set of F, so it is normal to the level surface.',
      explain: t`The chain rule gives $\frac{d}{dt}F(\gamma(t)) = \nabla F\cdot\gamma'(t) = 0$. Since tangent vectors are exactly such $\gamma'$, $\nabla F \perp T_pS$. With $\nabla F \ne 0$ the implicit function theorem also guarantees the level set is a regular surface near $p$.`,
    }),
    multi({
      id: 'tangent-only', difficulty: 3,
      prompt: t`Suppose you know only the dot products $\mathbf X_u\cdot\mathbf X_u$, $\mathbf X_u\cdot\mathbf X_v$ and $\mathbf X_v\cdot\mathbf X_v$ at every point of a patch — nothing about $\mathbf n$. Which of these can you compute? Select every one.`,
      visual: saddlePic(0.4, 0.7, { vectors: [{ from: [0.4, 0.7, 0.28], to: [1.4, 0.7, 0.98], color: 'accent', label: t`\mathbf X_u` }, { from: [0.4, 0.7, 0.28], to: [0.4, 1.7, 0.68], color: 'gold', label: t`\mathbf X_v` }], caption: t`Two tangent vectors at a point of the saddle. Their lengths and the angle between them are the only data allowed.` }),
      choices: [
        'The length of a curve drawn on the surface',
        'The angle at which two curves on the surface cross',
        t`The area of a region of the surface, using $|\mathbf X_u\times\mathbf X_v|^2 = |\mathbf X_u|^2|\mathbf X_v|^2 - (\mathbf X_u\cdot\mathbf X_v)^2$`,
        'Whether the surface lies on one side of its tangent plane near a point',
        'Which direction in space the surface faces',
      ],
      answer: [0, 1, 2],
      why: {
        3: t`That is about how the surface curves away from the plane — second derivatives along $\mathbf n$, invisible in these dot products.`,
        4: t`Facing is the direction of $\mathbf n$ in space. A rolled-up sheet and a flat one have the same dot products and face very differently.`,
      },
      hints: [t`A curve’s speed is $|u'\mathbf X_u + v'\mathbf X_v|$: expand the square.`, 'Lagrange’s identity turns the cross product’s length into dot products.'],
      teach: 'Lengths, angles and areas on a surface need only dot products of tangent vectors; where the surface faces and how it bends need the normal.',
      explain: t`$|u'\mathbf X_u + v'\mathbf X_v|^2 = u'^2\,\mathbf X_u\cdot\mathbf X_u + 2u'v'\,\mathbf X_u\cdot\mathbf X_v + v'^2\,\mathbf X_v\cdot\mathbf X_v$: that is the first fundamental form of module C4. It is everything an inhabitant of the surface can measure, and it never mentions $\mathbf n$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lander', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([0.002, 0.003, 0.004]), b = r.pick([0.001, 0.002, 0.005]), x0 = r.pick([20, 30, 40]), y0 = r.pick([-15, 10, 25]);
        const fx = 2 * a * x0, fy = 2 * b * y0, slope = Math.atan(Math.hypot(fx, fy)) / DEG;
        return {
          prompt: t`A lunar lander’s terrain model gives the floor of a small crater near the landing site as $z = ${a}x^2 + ${b}y^2$ (metres, $z$ up). Its legs tolerate slopes up to about $12^\circ$. What is the slope at the touchdown point $(x, y) = (${x0}, ${y0})$ m — the angle between the surface normal and the vertical — in degrees?`,
          visual: { type: 'surface3d', params: { z: `${a}*x^2 + ${b}*y^2`, domain: [[-50, 50], [-50, 50]], tangentAt: [x0, y0], gradient: false, planeSize: 15, dist: 135, pitch: 0.45, axes: false, readouts: [] }, caption: t`The crater floor over a 100 m square, drawn to true scale, with the tangent plane at the touchdown point (gold).` },
          answer: slope, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: Math.atan(fx + fy) / DEG, feedback: t`The two slopes combine as a vector: the normal is $(-f_x, -f_y, 1)$, so $\tan(\text{slope}) = \sqrt{f_x^2 + f_y^2}$.` }, { value: (Math.hypot(fx, fy) * 180) / Math.PI, feedback: t`That is $\sqrt{f_x^2 + f_y^2}$ converted straight to degrees. It is the tangent of the angle: take the arctangent.` }].filter((e) => Math.abs(e.value - slope) > 0.02 * slope),
          hints: [t`For a graph $z = f(x, y)$, $\mathbf X_x\times\mathbf X_y = (-f_x, -f_y, 1)$, and the angle $\theta$ from vertical has $\cos\theta = 1/\sqrt{1 + f_x^2 + f_y^2}$.`, t`Here $f_x = ${nice(2 * a)}x = ${nice(fx)}$ and $f_y = ${nice(2 * b)}y = ${nice(fy)}$.`],
          teach: 'The slope of terrain is the angle between its normal and the vertical: tan θ = |∇f|.',
          explain: t`$\tan\theta = \sqrt{${nice(fx)}^2 + ${nice(fy)}^2} = ${nice(Math.hypot(fx, fy), 3)}$, so $\theta = ${nice(slope, 3)}^\circ$ — ${slope < 12 ? 'inside' : 'outside'} the $12^\circ$ limit. (The quadratic floor is a model; real terrain maps come from stereo images or laser altimetry at a few-metre resolution.)`,
        };
      },
    }),
    expr({
      id: 'cp-sphere-plane', difficulty: 2,
      gen(r) {
        const p = r.pick([[1, 2, 2], [2, -1, 2], [2, 2, -1], [-2, 1, 2]]);
        return {
          prompt: t`Find the tangent plane to the sphere $x^2 + y^2 + z^2 = 9$ at $(${p.join(', ')})$.`,
          visual: { type: 'calc-vectors3d', params: { range: 3.5, spheres: [{ centre: [0, 0, 0], radius: 3, color: 'teal' }], points: [{ at: p, color: 'gold', label: 'p' }] }, caption: 'The sphere of radius 3 (three great circles) and the point.' },
          answer: `${p[0]}x + ${p[1]}y + ${p[2]}z = 9`, mode: 'equation', vars: { x: [-3, 3], y: [-3, 3], z: [-3, 3] },
          answerTeX: t`${p[0]}x ${p[1] < 0 ? '-' : '+'} ${Math.abs(p[1])}y ${p[2] < 0 ? '-' : '+'} ${Math.abs(p[2])}z = 9`,
          hints: [t`The gradient of $x^2 + y^2 + z^2$ is $2(x, y, z)$: on a sphere the normal is the radius.`],
          teach: t`The tangent plane to the sphere $|\mathbf x| = R$ at $p$ is $p\cdot\mathbf x = R^2$.`,
          explain: t`Normal $p = (${p.join(', ')})$ through $p$: $p\cdot(\mathbf x - p) = 0$, i.e. $p\cdot\mathbf x = |p|^2 = 9$.`,
        };
      },
    }),
    mcq({
      id: 'cp-drop-normal', difficulty: 2,
      prompt: t`The next module describes a surface by $E = \mathbf X_u\cdot\mathbf X_u$, $F = \mathbf X_u\cdot\mathbf X_v$ and $G = \mathbf X_v\cdot\mathbf X_v$ alone. Which of these is **lost** in passing to $E$, $F$, $G$?`,
      visual: { type: 'calc-vectors3d', params: { range: 2.5, grid: false, curves: [...mesh((u, v) => [`cos(${u})`, `sin(${u})`, `${v}`], [0, 3.1416], [-1.2, 1.2], { nu: 8, nv: 4, color: 'accent', width: 1.2 }), ...mesh((u, v) => [`${u} - 1.6`, `-1.4`, `${v}`], [-1.57, 1.57], [-1.2, 1.2], { nu: 8, nv: 4, color: 'gold', width: 1.2 })] }, caption: 'A flat sheet (gold) and the same sheet bent into a half-cylinder (blue): every length and angle drawn on it is unchanged by the bending.' },
      choices: ['The direction of the unit normal in space', 'The lengths of curves on the surface', 'The angles between curves on the surface', 'The areas of regions on the surface'],
      answer: 0,
      why: {
        1: t`Speeds of curves are built from $E$, $F$, $G$: $|\gamma'|^2 = Eu'^2 + 2Fu'v' + Gv'^2$.`,
        2: t`Angles come from dot products of tangent vectors, which $E$, $F$, $G$ give.`,
        3: t`$|\mathbf X_u\times\mathbf X_v| = \sqrt{EG - F^2}$.`,
      },
      hints: ['Which of these points out of the surface rather than along it?'],
      teach: 'The first fundamental form keeps everything measurable within the surface and drops the normal.',
      explain: 'Bend a sheet of paper without stretching: E, F, G stay the same while the normal swings round. Module C4 calls such surfaces isometric; the question for C5–C6 is how much curvature survives the loss of n.',
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §2-4 and §2-6', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), §4.4 and §6.1', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
  ],
});
