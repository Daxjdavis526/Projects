// Vectors, dot and cross products revisited — what you get by combining them:
// the scalar triple product (signed volume, coplanarity, handedness, torque
// about an axis), the vector triple product, v = ω × r and L = r × p.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt, frac } from '../../src/core/format.js';
import { vecTeX, pointTeX, add, sub, scale, dot, cross, norm, triple, box, tripleExpr } from './_space.js';

const t = String.raw;
const D = Math.PI / 180;
const fit = (...vs) => Math.max(3, Math.ceil(Math.max(...vs.flat().map(Math.abs))) + 0.5);
const rand3 = (r, lo = -3, hi = 3) => [r.int(lo, hi), r.int(lo, hi), r.int(lo, hi)];
const scene = (params, caption = 'Drag to rotate.') => ({ type: 'calc-vectors3d', params, caption });

// the Explore: a and b fixed in the floor, c free
const A = [2, 0, 0], B = [0.8, 2, 0], C = ['cx', 'cy', 'cz'];

const OMEGA = 7.2921e-5, R_EARTH = 6.371e6;   // rad/s (sidereal), m (mean radius)
const SITES = [['Kennedy Space Center, Florida', 28.6], ['Baikonur, Kazakhstan', 45.9], ['Kourou, French Guiana', 5.2], ['Vandenberg, California', 34.7], ['Wenchang, China', 19.6], ['Plesetsk, Russia', 62.9]];

export default lesson({
  id: 'math2210.C3-1.2',
  title: 'Vectors, dot and cross products revisited',
  minutes: 12, difficulty: 3,
  intro: t`You can already take dot and cross products. Combine them and two new tools appear. The **scalar triple product** is the volume of the slanted box — the **parallelepiped** — that three vectors span, signed by their handedness:

$$\vec a\cdot(\vec b\times\vec c) = \det\begin{pmatrix} a_x & a_y & a_z\\ b_x & b_y & b_z\\ c_x & c_y & c_z\end{pmatrix} = \pm V$$

It is **zero exactly when the three vectors lie in one plane**. The **vector triple product** expands as $\vec a\times(\vec b\times\vec c) = \vec b\,(\vec a\cdot\vec c) - \vec c\,(\vec a\cdot\vec b)$. Physics leans on both: torque about an axis, the velocity $\vec v = \vec\omega\times\vec r$ of a spinning body, angular momentum $\vec L = \vec r\times\vec p$ — and, two lessons from now, Kepler’s orbits.`,
  symbols: [
    { tex: '\\vec a\\cdot(\\vec b\\times\\vec c)', text: 'the scalar triple product: a **number**, whose units are the product of the three vectors’ units (m³ for three displacements)' },
    { tex: '\\det(\\ldots)', text: t`the $3\times3$ determinant with rows $\vec a$, $\vec b$, $\vec c$; expanding along the first row gives $a_x(b_yc_z - b_zc_y) - a_y(b_xc_z - b_zc_x) + a_z(b_xc_y - b_yc_x)$, which is exactly $\vec a\cdot(\vec b\times\vec c)$` },
    { tex: 'V', text: t`the volume of the parallelepiped with edges $\vec a$, $\vec b$, $\vec c$: base area $|\vec b\times\vec c|$ times the height of $\vec a$ above that base` },
    { tex: '\\pm', text: t`$+$ when $(\vec a, \vec b, \vec c)$ is right-handed, like $(\hat\imath, \hat\jmath, \hat k)$; $-$ when it is left-handed. Swapping any two vectors flips the sign; shifting all three round in a cycle does not` },
    { tex: '\\vec a\\times(\\vec b\\times\\vec c)', text: t`the vector triple product, “BAC minus CAB”: a vector lying in the plane of $\vec b$ and $\vec c$. The brackets matter — $(\vec a\times\vec b)\times\vec c$ is a different vector` },
  ],
  why: t`Volumes from three vectors become the Jacobian factor $|\det|$ of a change of variables in multiple integrals (C3-4); torque about an axis is a triple product; and the vector triple product is the step that turns Newton’s law of gravity into the conserved Laplace–Runge–Lenz vector of lesson C3-2.5.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'The box three vectors span',
    lead: t`$\vec a$ (blue) and $\vec b$ (amber) lie in the floor, spanning a gold base of area $|\vec a\times\vec b| = 4$. Move $\vec c$ (green) with the sliders: the box it adds is the parallelepiped, and the dashed line is the height of $\vec c$ above the base. Drag to turn the picture.`,
    tasks: [
      t`Slide $c_x$ and $c_y$: the box leans, but the triple product stays $4c_z$ — only the height above the base counts, as with a stack of sliding cards.`,
      t`Bring $c_z$ to $0$: $\vec c$ lies in the plane of $\vec a$ and $\vec b$, the box flattens, and the triple product is $0$.`,
      t`Push $c_z$ below the floor: the volume is the same, but the triple product turns negative — $(\vec a, \vec b, \vec c)$ is now left-handed.`,
    ],
    params: {
      range: 3,
      sliders: [
        { key: 'cx', label: '$c_x$', min: -2, max: 2, step: 0.1, value: 0.5, explain: 'Slides the top of the box along $x$.' },
        { key: 'cy', label: '$c_y$', min: -2, max: 2, step: 0.1, value: 0.6, explain: 'Slides the top of the box along $y$.' },
        { key: 'cz', label: '$c_z$', min: -2, max: 2.5, step: 0.1, value: 1.5, explain: 'The height of $\\vec c$ above the base.' },
      ],
      ...box(A, B, C),
      segments: [{ from: C, to: ['cx', 'cy', 0], color: 'ink3', dash: true }],
      readouts: [
        { label: '$\\vec a\\cdot(\\vec b\\times\\vec c)$', expr: tripleExpr(A, B, C), digits: 3 },
        { label: 'base $|\\vec a\\times\\vec b|$', expr: '4', digits: 3 },
        { label: 'height $c_z$', expr: 'cz', digits: 3 },
      ],
    },
    caption: 'Drag to rotate; scroll or pinch to zoom. To scale: the floor grid has one square per unit. The gold faces are the base and the top; the violet faces are the sides.',
  },
  example: {
    prompt: t`A spacecraft turns itself with three **reaction wheels**: spinning a wheel up exerts a torque on the craft along that wheel’s axis. The wheels are mounted along $\vec a = \langle 1, 0, 1\rangle$, $\vec b = \langle 0, 1, 1\rangle$ and $\vec c = \langle 1, 1, 0\rangle$. Can they produce a torque in every direction? Would they still, if a cheaper design mounted the third wheel along $\vec c\,' = \langle 1, 1, 2\rangle$?`,
    visual: scene({ range: 2.4, ...box([1, 0, 1], [0, 1, 1], [1, 1, 0]), vectors: [{ to: [1, 0, 1], color: 'accent', label: t`\vec a` }, { to: [0, 1, 1], color: 'warn', label: t`\vec b` }, { to: [1, 1, 0], color: 'good', label: t`\vec c` }, { to: [1, 1, 2], color: 'violet', dash: true, label: t`\vec c\,'` }] }, 'Drag to rotate. The three wheel axes and the box they span; dashed violet, the alternative axis c′, which lies in the plane of a and b.'),
    steps: [
      { label: 'What to test', text: t`The wheel torques add up to $h_1\vec a + h_2\vec b + h_3\vec c$. Those combinations fill all of space unless the three axes lie in one plane — and **the triple product is zero exactly when they do**.` },
      { label: 'Cross two axes', text: t`$\vec b\times\vec c = \langle (1)(0) - (1)(1),\ (1)(1) - (0)(0),\ (0)(1) - (1)(1)\rangle = \langle -1, 1, -1\rangle$.` },
      { label: 'Dot with the third', text: t`$\vec a\cdot(\vec b\times\vec c) = -1 + 0 - 1 = -2 \ne 0$: the axes span a box of volume 2, so every torque can be made. The minus sign only says the order $(\vec a, \vec b, \vec c)$ is left-handed; listing them as $(\vec b, \vec a, \vec c)$ gives $+2$.` },
      { label: 'The cheaper design', text: t`$\vec b\times\vec c\,' = \langle (1)(2) - (1)(1),\ (1)(1) - (0)(2),\ (0)(1) - (1)(1)\rangle = \langle 1, 1, -1\rangle$ and $\vec a\cdot\langle 1, 1, -1\rangle = 1 + 0 - 1 = 0$. The box is flat: indeed $\vec c\,' = \vec a + \vec b$.` },
      { label: 'What is lost', text: t`Every wheel torque now lies in the plane of $\vec a$ and $\vec b$, so nothing can push along its normal $\vec n = \vec a\times\vec b = \langle -1, -1, 1\rangle$. A disturbance about that direction would build up with nothing to cancel it.` },
      { label: 'Sense check', text: t`$\vec n$ is perpendicular to all three axes of the cheap design: $\vec n\cdot\vec a = 0$, $\vec n\cdot\vec b = 0$ and $\vec n\cdot\vec c\,' = -1 - 1 + 2 = 0$. Real spacecraft often fly four wheels so that any three of them still span space if one fails.` },
    ],
    answer: t`Yes: $\vec a\cdot(\vec b\times\vec c) = -2 \ne 0$, so the axes are not coplanar. The cheaper layout has $\vec a\cdot(\vec b\times\vec c\,') = 0$ and can make no torque along $\langle -1, -1, 1\rangle$.`,
  },
  practice: [
    num({
      id: 'triple-compute', difficulty: 2,
      gen(r) {
        let a, b, c, T;
        do { a = rand3(r); b = rand3(r); c = rand3(r); T = triple(a, b, c); } while (T === 0 || Math.abs(T) > 40);
        const prod = norm(a) * norm(b) * norm(c);
        return {
          prompt: t`Compute $\vec a\cdot(\vec b\times\vec c)$ for $\vec a = ${vecTeX(a)}$, $\vec b = ${vecTeX(b)}$ and $\vec c = ${vecTeX(c)}$.`,
          answer: T, tol: { rel: 1e-9, abs: 1e-9 },
          errors: [{ value: -T, feedback: t`Check the order: swapping two of the vectors flips the sign. Compute $\vec b\times\vec c$ first, then dot it with $\vec a$.` }, { value: prod, feedback: t`$|\vec a||\vec b||\vec c|$ is the volume only for three perpendicular vectors; the triple product also counts how they lean.` }].filter((e) => Math.abs(e.value - T) > 0.05),
          hints: [t`First $\vec b\times\vec c = ${vecTeX(cross(b, c))}$.`, t`Then dot with $\vec a$: $(${a[0]})(${cross(b, c)[0]}) + (${a[1]})(${cross(b, c)[1]}) + (${a[2]})(${cross(b, c)[2]})$.`],
          teach: 'Cross two of the vectors, then dot with the third — or expand the 3×3 determinant of the rows a, b, c.',
          explain: t`$\vec b\times\vec c = ${vecTeX(cross(b, c))}$, so $\vec a\cdot(\vec b\times\vec c) = ${T}$: the box they span has volume $${Math.abs(T)}$, and the order $(\vec a, \vec b, \vec c)$ is ${T > 0 ? 'right' : 'left'}-handed.`,
          visual: scene({ range: fit(add(add(a, b), c), a, b, c), ...box(a, b, c) }, 'Drag to rotate. The parallelepiped spanned by a, b and c, to scale.'),
        };
      },
    }),
    num({
      id: 'coplanar-k', difficulty: 2,
      gen(r) {
        let a, b, n, p, q, k;
        do {
          a = rand3(r, -3, 3); b = rand3(r, -3, 3); n = cross(a, b);
          p = r.int(-3, 3); q = r.int(-3, 3);
          k = n[0] ? -(p * n[1] + q * n[2]) / n[0] : NaN;
        } while (!n[0] || !Number.isInteger(2 * k) || k === 0 || Math.abs(k) > 8);
        return {
          prompt: t`For which number $k$ do the vectors $${vecTeX(a)}$, $${vecTeX(b)}$ and $\langle k, ${p}, ${q}\rangle$ lie in one plane?`,
          answer: k, tol: { rel: 1e-9, abs: 1e-9 },
          hints: [t`Three vectors are coplanar exactly when their triple product is $0$.`, t`$${vecTeX(a)}\times${vecTeX(b)} = ${vecTeX(n)}$, so the condition is $${n[0]}k + (${n[1]})(${p}) + (${n[2]})(${q}) = 0$.`],
          teach: 'Coplanar means zero volume: set the triple product equal to 0 and solve.',
          explain: t`The third vector must be perpendicular to $\vec n = ${vecTeX(n)}$, the normal of the plane of the first two: $${n[0]}k + ${p * n[1] + q * n[2]} = 0$, so $k = ${frac(k)}$.`,
          visual: scene({ range: fit(a, b), planes: [{ normal: n, d: 0, size: 2.6, color: 'violet', alpha: 0.2, showNormal: true, normalLabel: t`\vec n` }], vectors: [{ to: a, color: 'accent' }, { to: b, color: 'warn' }] }, 'Drag to rotate. The first two vectors and the plane through them; the third must lie in it too.'),
        };
      },
    }),
    mcq({
      id: 'swap', difficulty: 2,
      prompt: t`Three vectors have $\vec a\cdot(\vec b\times\vec c) = 7$. What is $\vec c\cdot(\vec b\times\vec a)$?`,
      choices: ['−7', '7', '0', 'It cannot be found without the components'],
      answer: 0,
      why: {
        1: t`Only cycling all three keeps the sign: $\vec c\cdot(\vec a\times\vec b) = 7$. Here $\vec a$ and $\vec c$ have swapped places, and one swap flips the sign.`,
        2: t`Zero would mean the vectors are coplanar, but they span a box of volume 7 whichever order you list them in.`,
        3: 'Both are the same determinant with two rows exchanged, so one number fixes the other.',
      },
      hints: [t`$\vec c\cdot(\vec b\times\vec a)$ is the determinant with rows $\vec c, \vec b, \vec a$.`, 'Exchanging two rows of a determinant changes its sign.'],
      teach: 'The triple product keeps its sign when the vectors are cycled and changes sign when two are swapped.',
      explain: t`Rows $\vec c, \vec b, \vec a$ are rows $\vec a, \vec b, \vec c$ with the first and third swapped, so the determinant is $-7$: the same box, listed in the opposite handedness.`,
      visual: scene({ range: 3, ...box([2, 0, 0.3], [0.5, 2, 0], [0.3, 0.6, 1.8]) }, 'Drag to rotate. One box, whatever order you list its edges in.'),
    }),
    num({
      id: 'tetra-volume', difficulty: 2,
      gen(r) {
        let P, Q, R, S, V;
        do { P = rand3(r, -2, 2); Q = rand3(r, -2, 3); R = rand3(r, -2, 3); S = rand3(r, -2, 3); V = Math.abs(triple(sub(Q, P), sub(R, P), sub(S, P))) / 6; } while (V < 1);
        const u = sub(Q, P), v = sub(R, P), w = sub(S, P);
        return {
          prompt: t`Find the volume of the tetrahedron with vertices $P${pointTeX(P)}$, $Q${pointTeX(Q)}$, $R${pointTeX(R)}$ and $S${pointTeX(S)}$, to 3 significant figures.`,
          answer: V, tol: { rel: 0.005 },
          errors: [{ value: 6 * V, feedback: 'That is the parallelepiped on the three edges; a tetrahedron is one sixth of it.' }, { value: 3 * V, feedback: 'A tetrahedron is ⅓ × base × height with a triangular base (half a parallelogram): one sixth of the box, not one half.' }, { value: 2 * V, feedback: 'One third of the box would be a pyramid on the whole parallelogram; the base here is a triangle, half of it.' }],
          hints: [t`Use the three edges from one vertex: $\overrightarrow{PQ} = ${vecTeX(u)}$, $\overrightarrow{PR} = ${vecTeX(v)}$, $\overrightarrow{PS} = ${vecTeX(w)}$.`, t`$V = \tfrac16\,|\overrightarrow{PQ}\cdot(\overrightarrow{PR}\times\overrightarrow{PS})|$.`],
          teach: 'A tetrahedron is one sixth of the parallelepiped on three of its edges.',
          explain: t`$\overrightarrow{PQ}\cdot(\overrightarrow{PR}\times\overrightarrow{PS}) = ${triple(u, v, w)}$, so $V = \tfrac16(${Math.abs(triple(u, v, w))}) = ${nice(V, 4)}$: ⅓ × (triangle, half the parallelogram) × height.`,
          visual: scene({ range: fit(P, Q, R, S), triangles: [[P, Q, R], [P, Q, S], [P, R, S], [Q, R, S]].map((pts) => ({ pts, color: 'gold', alpha: 0.16 })), points: [{ at: P, label: 'P' }, { at: Q, label: 'Q' }, { at: R, label: 'R' }, { at: S, label: 'S' }] }, 'Drag to rotate. The tetrahedron PQRS.'),
        };
      },
    }),
    mcq({
      id: 'bac-cab', difficulty: 3,
      gen(r) {
        let a, b, c, vals;
        do {
          a = rand3(r, -2, 2); b = rand3(r, -2, 2); c = rand3(r, -2, 2);
          const right = sub(scale(b, dot(a, c)), scale(c, dot(a, b)));
          vals = [right, scale(right, -1), cross(cross(a, b), c), add(scale(b, dot(a, c)), scale(c, dot(a, b)))];
        } while (vals[0].every((x) => x === 0) || new Set(vals.map((v) => v.join())).size < 4);
        return {
          prompt: t`Use $\vec a\times(\vec b\times\vec c) = \vec b\,(\vec a\cdot\vec c) - \vec c\,(\vec a\cdot\vec b)$ to compute $\vec a\times(\vec b\times\vec c)$ for $\vec a = ${vecTeX(a)}$, $\vec b = ${vecTeX(b)}$, $\vec c = ${vecTeX(c)}$.`,
          choices: vals.map((v) => t`$${vecTeX(v)}$`), answer: 0,
          why: {
            1: t`The signs are swapped: it is $\vec b(\vec a\cdot\vec c)$ **minus** $\vec c(\vec a\cdot\vec b)$ — “BAC minus CAB”.`,
            2: t`That is $(\vec a\times\vec b)\times\vec c$. The cross product is not associative: the brackets change the answer.`,
            3: t`The two terms are subtracted, not added.`,
          },
          hints: [t`$\vec a\cdot\vec c = ${dot(a, c)}$ and $\vec a\cdot\vec b = ${dot(a, b)}$.`, t`So the answer is $${dot(a, c)}\,${vecTeX(b)} - (${dot(a, b)})\,${vecTeX(c)}$.`],
          teach: 'a × (b × c) = b(a·c) − c(a·b): it lies in the plane of b and c.',
          explain: t`$\vec b(\vec a\cdot\vec c) - \vec c(\vec a\cdot\vec b) = ${dot(a, c)}\,${vecTeX(b)} - (${dot(a, b)})\,${vecTeX(c)} = ${vecTeX(vals[0])}$. Check by brute force: $\vec b\times\vec c = ${vecTeX(cross(b, c))}$ and $\vec a\times${vecTeX(cross(b, c))} = ${vecTeX(cross(a, cross(b, c)))}$.`,
          visual: scene({ range: 3, planes: cross(b, c).some((x) => x) ? [{ normal: cross(b, c), d: 0, size: 2.4, color: 'violet', alpha: 0.16 }] : [], vectors: [{ to: a, color: 'accent', label: t`\vec a` }, { to: b, color: 'warn', label: t`\vec b` }, { to: c, color: 'good', label: t`\vec c` }] }, 'Drag to rotate. The violet plane is spanned by b and c: the answer lies in it.'),
        };
      },
    }),
    num({
      id: 'omega-r', difficulty: 2,
      gen(r) {
        const [site, lat] = r.pick(SITES), v = OMEGA * R_EARTH * Math.cos(lat * D);
        const s = 2, rr = [s * Math.cos(lat * D), 0, s * Math.sin(lat * D)];
        return {
          prompt: t`Earth spins with angular velocity $\vec\omega = \omega\hat k$, $\omega = 7.292\times10^{-5}$ rad/s, so a point at position $\vec r$ (from Earth’s centre) moves with $\vec v = \vec\omega\times\vec r$. How fast does the launch site at ${site}, latitude $${lat}^\circ$, move? Take Earth as a sphere of radius $6371$ km.`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: OMEGA * R_EARTH * Math.sin(lat * D), feedback: t`$|\vec\omega\times\vec r| = \omega r\sin\alpha$ uses the angle $\alpha$ between $\vec\omega$ (the axis) and $\vec r$, which is $90^\circ$ minus the latitude.` }, { value: OMEGA * R_EARTH, feedback: 'That is the speed at the equator. Away from it, the site is closer to the axis.' }].filter((e) => Math.abs(e.value - v) > 0.01 * v),
          hints: [t`$|\vec\omega\times\vec r| = \omega R\sin\alpha$, with $\alpha$ the angle between the axis and $\vec r$: $\alpha = 90^\circ - ${lat}^\circ$.`, t`$\sin(90^\circ - \lambda) = \cos\lambda$: the speed is $\omega R\cos\lambda$, the angular speed times the distance from the axis.`],
          teach: 'For a rigid rotation v = ω × r, so the speed is ω times the distance from the axis.',
          explain: t`$|\vec v| = \omega R\cos ${lat}^\circ = (7.292\times10^{-5})(6.371\times10^{6})(${nice(Math.cos(lat * D), 4)}) = ${fmt(v, 3)}$ m/s, eastward. A rocket launched east gets this for free — one reason launch sites sit as close to the equator as geography and politics allow.`,
          visual: scene({ range: 2.8, grid: false, spheres: [{ centre: [0, 0, 0], radius: s, color: 'teal' }], curves: [{ param: [`${rr[0]}*cos(t)`, `${rr[0]}*sin(t)`, `${rr[2]}`], t: [0, 2 * Math.PI], color: 'ink3' }], vectors: [{ from: [0, 0, s], to: [0, 0, s + 0.9], color: 'violet', label: t`\vec\omega` }, { to: rr, color: 'accent', label: t`\vec r` }, { from: rr, to: add(rr, [0, 0.9, 0]), color: 'gold', label: t`\vec v` }] }, 'Drag to rotate. Earth (teal), the spin axis direction ω, the site’s position r and its velocity v along its circle of latitude. Lengths not to scale.'),
        };
      },
    }),
    mcq({
      id: 'free-particle', difficulty: 3,
      prompt: t`A meteoroid far from any planet moves in a straight line at constant velocity $\vec v$, passing a point $O$ at closest distance $b$. As it travels, what happens to its angular momentum about $O$, $\vec L = \vec r\times m\vec v$?`,
      choices: ['It stays constant, with magnitude mvb', 'It is largest at closest approach and falls off on either side', 'It is zero, because no force acts', 'It flips sign as the meteoroid passes O'],
      answer: 0,
      why: {
        1: t`$|\vec r|$ is smallest at closest approach, but the angle between $\vec r$ and $\vec v$ changes too, and $|\vec r|\sin\theta = b$ stays the same.`,
        2: t`No force means no **change** in $\vec L$, not zero $\vec L$: $|\vec L| = mvb$, which is not zero unless the path runs through $O$.`,
        3: t`The direction of $\vec r\times\vec v$ is fixed by which way the path turns about $O$ — always the same way along a straight line.`,
      },
      hints: [t`Write $\vec r(t) = \vec r_0 + \vec v\,t$ and expand $\vec r(t)\times\vec v$.`, t`$\vec v\times\vec v = \vec 0$.`],
      teach: 'With no force, r × v is constant: its size is v times the closest-approach distance.',
      explain: t`$\vec r(t)\times\vec v = (\vec r_0 + \vec v t)\times\vec v = \vec r_0\times\vec v$, the same at every moment, with $|\vec L| = mvb$. Geometrically, in equal times the radius sweeps triangles with equal bases on the line and the same height $b$: **equal areas in equal times**, Kepler’s second law with the force switched off.`,
      visual: {
        type: 'graph',
        params: {
          x: [-4.2, 4.2], y: [-0.7, 2.9], equal: true, aspect: 'wide', axes: false, grid: false,
          curves: [{ fn: '2', color: 'ink3', dash: true }],
          shade: [{ fn: 'min(2, -2*x)', lower: '-2*x/3', from: -3, to: 0, color: 'gold', alpha: 0.3 }, { fn: 'min(2, 2*x)', lower: '2*x/3', from: 0, to: 3, color: 'gold', alpha: 0.3 }],
          arrows: [{ from: [0, 0], to: [-3, 2], color: 'accent', label: 'r₁', labelDx: -22, labelDy: 0 }, { from: [0, 0], to: [1, 2], color: 'accent', label: 'r₂', labelDx: 6, labelDy: 6 }, { from: [-3, 2], to: [-1, 2], color: 'good', label: 'v Δt', labelDx: -30, labelDy: -14 }, { from: [1, 2], to: [3, 2], color: 'good', label: 'v Δt', labelDx: -30, labelDy: -14 }],
          points: [{ x: 0, y: 0, color: 'gold', label: 'O', labelDx: -6, labelDy: 14 }, { x: 0, y: 2, color: 'ink3', r: 2.5 }],
        },
        caption: 'The straight path (dashed) and the triangles the radius sweeps in two equal time intervals: the same base vΔt on the path, the same height b = 2 above O. Not to scale.',
      },
    }),
    mcq({
      id: 'magnetic-work', difficulty: 2,
      prompt: t`A charged particle in a magnetic field feels $\vec F = q\,\vec v\times\vec B$. Why can a static magnetic field never change the particle’s speed?`,
      choices: [
        t`The power $\vec F\cdot\vec v = q\,(\vec v\times\vec B)\cdot\vec v$ is a triple product with $\vec v$ twice, so it is always zero`,
        t`Because $\vec B$ is always perpendicular to $\vec v$`,
        t`Because the magnetic force is too weak to matter`,
        t`It does change the speed, but the changes cancel over each turn`,
      ],
      answer: 0,
      why: {
        1: t`$\vec B$ can point any way relative to $\vec v$ (a helix has $\vec v$ partly along $\vec B$). It is the **force** that is always perpendicular to $\vec v$.`,
        2: 'Magnetic forces steer particle beams in accelerators and trap them in fusion reactors; they are anything but weak.',
        3: 'The power is zero at every instant, not just on average.',
      },
      hints: ['The rate at which a force does work is the power, P = F · v.', t`A triple product with a repeated vector spans a flat box.`],
      teach: 'A triple product with two equal vectors is zero, so a force of the form v × B does no work.',
      explain: t`$P = \vec F\cdot\vec v = q\,\vec v\cdot(\vec v\times\vec B)$: the box spanned by $\vec v$, $\vec v$ and $\vec B$ is flat, so $P = 0$ at every instant. The field bends the path — circles and helices — but the kinetic energy never changes.`,
      visual: scene({ range: 2.2, vectors: [{ to: [1.6, 0, 0.3], color: 'good', label: t`\vec v` }, { to: [0.6, 0, 1.7], color: 'violet', label: t`\vec B` }, { to: cross([1.6, 0, 0.3], [0.6, 0, 1.7]).map((x) => x * 0.65), color: 'warn', label: t`\vec F` }] }, 'Drag to rotate. For a positive charge, F = qv × B stands perpendicular to both v and B. Lengths not to scale.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-volume', difficulty: 2,
      gen(r) {
        let a, b, c, T;
        do { a = rand3(r); b = rand3(r); c = rand3(r); T = triple(a, b, c); } while (T === 0 || Math.abs(T) > 40);
        return {
          prompt: t`Find the volume of the parallelepiped with edges $${vecTeX(a)}$, $${vecTeX(b)}$ and $${vecTeX(c)}$.`,
          answer: Math.abs(T), tol: { rel: 1e-9, abs: 1e-9 },
          errors: T < 0 ? [{ value: T, feedback: 'A volume is the absolute value of the triple product; the sign only records the handedness.' }] : [],
          hints: [t`$V = |\vec a\cdot(\vec b\times\vec c)|$.`],
          teach: 'Volume = |a · (b × c)|.',
          explain: t`$\vec a\cdot(\vec b\times\vec c) = ${T}$, so $V = ${Math.abs(T)}$.`,
          visual: scene({ range: fit(add(add(a, b), c), a, b, c), ...box(a, b, c) }),
        };
      },
    }),
    num({
      id: 'cp-axis-torque', difficulty: 3,
      gen(r) {
        let rv, F, tau;
        do {
          rv = [r.intExcept(-9, 9, [0]) / 10, r.intExcept(-9, 9, [0]) / 10, r.int(-9, 9) / 10];
          F = [r.int(-8, 8) * 5, r.int(-8, 8) * 5, r.int(-8, 8) * 5];
          tau = dot([2 / 3, 1 / 3, 2 / 3], cross(rv, F));
        } while (Math.abs(tau) < 3 || norm(F) === 0);
        const total = norm(cross(rv, F));
        const S = 2.2 / Math.max(...rv.map(Math.abs));
        return {
          prompt: t`A thruster mounted at $\vec r = ${vecTeX(rv)}$ m from a spacecraft’s centre of mass fires with force $\vec F = ${vecTeX(F)}$ N. The craft is spinning about the axis along the unit vector $\hat u = \tfrac13\langle 2, 1, 2\rangle$. What torque does the thruster exert **about that axis**, $\hat u\cdot(\vec r\times\vec F)$?`,
          answer: tau, units: 'N m', tol: { rel: 0.005, abs: 0.01 },
          errors: [{ value: total, feedback: t`That is the whole torque $|\vec r\times\vec F|$. Only its component along the axis, $\hat u\cdot(\vec r\times\vec F)$, turns the craft about that axis.` }].filter((e) => Math.abs(e.value - tau) > 0.05),
          hints: [t`First $\vec r\times\vec F = ${vecTeX(cross(rv, F).map((x) => +x.toFixed(4)))}$ N·m.`, t`Then dot with $\hat u = \langle \tfrac23, \tfrac13, \tfrac23\rangle$.`],
          teach: 'The torque about an axis is the component of r × F along the axis — the triple product û · (r × F).',
          explain: t`$\vec r\times\vec F = ${vecTeX(cross(rv, F).map((x) => +x.toFixed(4)))}$ N·m and $\hat u\cdot(\vec r\times\vec F) = ${nice(tau, 4)}$ N·m${tau < 0 ? ' — negative, so it slows a spin in the +û sense' : ''}. The rest of $\vec r\times\vec F$ (its full size is $${nice(total, 4)}$ N·m) only tilts the spin axis.`,
          visual: scene({ range: 3, lines: [{ point: [0, 0, 0], dir: [2, 1, 2], t: [-1, 1], color: 'teal', dash: true, label: t`\hat u` }], vectors: [{ to: scale(rv, S), color: 'accent', label: t`\vec r` }, { from: scale(rv, S), to: add(scale(rv, S), scale(F, 1.4 / norm(F))), color: 'warn', label: t`\vec F` }] }, 'Drag to rotate. The spin axis (teal), the thruster’s position r and its force F. Only directions are to scale.'),
        };
      },
    }),
    mcq({
      id: 'cp-gps', difficulty: 3, transfer: true,
      prompt: t`A navigation receiver with a perfect clock finds its position from its ranges to three satellites. The fix is only good if the three unit vectors pointing at them are far from coplanar: the volume $|\hat u_1\cdot(\hat u_2\times\hat u_3)|$ of the box they span measures this (0 means no fix at all). Which sky gives the best fix?`,
      choices: [
        t`Three satellites at $30^\circ$ elevation, spread $120^\circ$ apart in azimuth`,
        t`Three satellites at $80^\circ$ elevation, spread $120^\circ$ apart in azimuth`,
        t`Three satellites on the horizon ($0^\circ$ elevation), spread $120^\circ$ apart`,
        t`Three satellites at $30^\circ$ elevation, all within $10^\circ$ of each other in azimuth`,
      ],
      answer: 0,
      why: {
        1: t`Near the zenith the three directions bunch together: the box is thin, with volume $0.08$ against $0.97$ for the $30^\circ$ sky.`,
        2: t`On the horizon all three vectors lie in the horizontal plane: the triple product is exactly $0$, and the receiver cannot tell its height.`,
        3: t`Bunched in azimuth, the three directions are nearly parallel: the volume is only $0.002$.`,
      },
      hints: ['Picture the box spanned by the three unit vectors. When is it flat?', t`Unit vectors that are close to each other, or that all lie in one plane, give a nearly flat box.`],
      teach: 'Three directions span space well when their triple product is far from zero — nearly perpendicular, never nearly coplanar.',
      explain: t`At $30^\circ$ elevation and $120^\circ$ apart the triple product is $0.97$, close to the maximum of 1, which three mutually perpendicular directions reach (at $35.3^\circ$ elevation). Real receivers also solve for their clock error, so they need a fourth satellite, but the geometry rule is the same: satellites spread around and up the sky give the best fix.`,
      visual: scene({ range: 1.6, axisLabels: ['E', 'N', 'U'], planes: [{ normal: [0, 0, 1], d: 0, size: 1.4, color: 'teal', alpha: 0.1 }], vectors: [0, 120, 240].map((az) => ({ to: [Math.cos(30 * D) * Math.sin(az * D), Math.cos(30 * D) * Math.cos(az * D), Math.sin(30 * D)].map((x) => +(1.3 * x).toFixed(3)), color: 'gold' })) }, 'Drag to rotate. The first sky: three unit vectors at 30° elevation, 120° apart, from the receiver at the origin (scaled up 1.3×).'),
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §2.4 The Cross Product (triple products)', url: 'https://openstax.org/books/calculus-volume-3/pages/2-4-the-cross-product' },
    { label: 'IERS: Earth’s rotation rate, 7.292115 × 10⁻⁵ rad/s', url: 'https://www.iers.org/IERS/EN/Science/EarthRotation/UT1LOD.html' },
  ],
});
