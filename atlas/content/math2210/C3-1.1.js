// Coordinates in three dimensions, read as shapes: each equation removes a
// free direction, inequalities fill solids, a missing variable means "extends
// along that axis", and distances to axes and planes come from Pythagoras.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { pointTeX, norm, deg } from './_space.js';

const t = String.raw;
const fitRange = (pts) => Math.max(3, Math.ceil(Math.max(...pts.flat().map(Math.abs))) + 0.5);
const TAU = 2 * Math.PI;

// a horizontal circle of radius r at height h, centred on the z-axis
const ring = (r, h, extra = {}) => ({ param: [`${r}*cos(t)`, `${r}*sin(t)`, `${h}`], t: [0, TAU], ...extra });

// Earth (radius 6.371 thousand km) and the Arctic Circle at latitude 66.56°
const R_E = 6.371, LAT = 66.5636 * Math.PI / 180;
const Z0 = R_E * Math.sin(LAT), RHO = R_E * Math.cos(LAT);

export default lesson({
  id: 'math2210.C3-1.1',
  title: 'Coordinates in three dimensions',
  minutes: 9, difficulty: 2,
  intro: t`Calculus II gave you points, distances and spheres in space. Multivariable calculus needs one more skill: reading an equation or inequality in $x$, $y$ and $z$ as a **shape**. Count the conditions. With none, you have all of space; each independent equation removes one free direction — **one equation makes a surface, two make a curve, three pick out points** — and inequalities fill solids. A variable that is missing is free, so the shape extends along that axis:

$$x^2 + y^2 + z^2 = 9 \;\;\text{(a sphere)}, \qquad x^2 + y^2 = 9 \;\;\text{(a cylinder: } z \text{ is free)}$$

Distances to the axes and the coordinate planes come straight from Pythagoras: the point $(x, y, z)$ is $\sqrt{x^2 + y^2}$ from the $z$-axis and $|z|$ from the $xy$-plane.`,
  symbols: [
    { tex: '(x, y, z)', text: t`coordinates along three perpendicular axes, **right-handed**: curl the fingers of your right hand from $x$ to $y$ and the thumb points along $z$` },
    { tex: '\\sqrt{x^2 + y^2}', text: t`the distance from the $z$-axis — the radius of the cylinder about the $z$-axis through the point. Likewise $\sqrt{y^2 + z^2}$ from the $x$-axis and $\sqrt{x^2 + z^2}$ from the $y$-axis` },
    { tex: '|z|', text: t`the distance from the $xy$-plane (the floor); $|x|$ and $|y|$ are the distances from the $yz$- and $xz$-planes` },
    { tex: '\\text{octant}', text: t`one of the eight regions cut out by the three coordinate planes; in the first octant $x$, $y$ and $z$ are all positive` },
  ],
  why: t`Every triple integral needs its solid described by inequalities, every moment of inertia about the $z$-axis is built from the distance $\sqrt{x^2 + y^2}$, and the cylindrical and spherical coordinates of lesson C3-1.5 are made from exactly these distances.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'One point, its distances, and the shapes through it',
    lead: t`Move the point $P$ with the sliders and drag the picture to turn it. The dashed path walks along $x$, then $y$, then $z$; the gold segment is the shortest path from $P$ to the $z$-axis. Switch on the cylinder about the $z$-axis and the sphere about the origin that pass through $P$.`,
    tasks: [
      t`Set $P = (1, 2, 2)$: it is $3$ from the origin but only $\sqrt5 \approx 2.24$ from the $z$-axis.`,
      t`Show the cylinder and change only $z$: the distance to the $z$-axis does not change — $P$ slides along a vertical line of the cylinder $x^2 + y^2 = \text{constant}$.`,
      t`Show the sphere and move $P$ so that $|OP|$ stays $3$, for example to $(2, 2, 1)$ or $(0, 0, -3)$: every such point lies on the one sphere $x^2 + y^2 + z^2 = 9$.`,
    ],
    params: {
      range: 4.5,
      sliders: [
        { key: 'px', label: '$x$', min: -4, max: 4, step: 0.5, value: 1, explain: 'The coordinate along the $x$-axis.' },
        { key: 'py', label: '$y$', min: -4, max: 4, step: 0.5, value: 2, explain: 'The coordinate along the $y$-axis.' },
        { key: 'pz', label: '$z$', min: -4, max: 4, step: 0.5, value: 2, explain: 'The height above the floor (negative: below it).' },
      ],
      toggles: [
        { key: 'cyl', label: 'Cylinder through $P$ about the $z$-axis', value: false, explain: 'All points at the same distance from the $z$-axis.' },
        { key: 'sph', label: 'Sphere through $P$ about the origin', value: false, explain: 'All points at the same distance from the origin.' },
      ],
      components: [{ to: ['px', 'py', 'pz'], color: 'accent' }],
      segments: [
        { from: ['px', 'py', 'pz'], to: [0, 0, 'pz'], color: 'gold', width: 2.6 },
        { from: [0, 0, 0], to: ['px', 'py', 'pz'], color: 'ink3', dash: true },
        ...[0, 1, 2, 3].map((k) => ({ from: [`sqrt(px^2 + py^2)*cos(${k}*pi/2)`, `sqrt(px^2 + py^2)*sin(${k}*pi/2)`, -4], to: [`sqrt(px^2 + py^2)*cos(${k}*pi/2)`, `sqrt(px^2 + py^2)*sin(${k}*pi/2)`, 4], color: 'teal', when: 'cyl' })),
      ],
      curves: [-4, -2, 0, 2, 4].map((h) => ring('sqrt(px^2 + py^2)', h, { color: 'teal', when: 'cyl' })).concat([ring('sqrt(px^2 + py^2)', 'pz', { color: 'teal', width: 2.4, when: 'cyl' })]),
      spheres: [{ centre: [0, 0, 0], radius: 'sqrt(px^2 + py^2 + pz^2)', color: 'violet', when: 'sph' }],
      points: [{ at: ['px', 'py', 'pz'], color: 'gold', label: 'P' }, { at: [0, 0, 'pz'], color: 'gold', r: 3 }],
      readouts: [
        { label: '$|OP|$', expr: 'sqrt(px^2 + py^2 + pz^2)', digits: 3 },
        { label: 'to the $z$-axis $\\sqrt{x^2 + y^2}$', expr: 'sqrt(px^2 + py^2)', digits: 3 },
        { label: 'to the $xy$-plane $|z|$', expr: 'abs(pz)', digits: 3 },
      ],
    },
    caption: 'Drag to rotate; scroll or pinch to zoom. Right-handed axes, to scale; the grid lies in the xy-plane, one square per unit. The cylinder and the sphere are drawn as wire frames; both go on without end or all the way round.',
  },
  example: {
    prompt: t`Treat Earth as the sphere $x^2 + y^2 + z^2 = R^2$, with $R = 6371$ km and the $z$-axis along its spin axis. The Arctic Circle lies at latitude $66.56^\circ$ N, in the plane $z = R\sin 66.56^\circ$. What curve do the sphere and the plane share, and how long is it?`,
    visual: {
      type: 'calc-vectors3d',
      params: {
        range: 7.5, grid: false,
        spheres: [{ centre: [0, 0, 0], radius: R_E, color: 'teal' }],
        planes: [{ normal: [0, 0, 1], d: +Z0.toFixed(3), size: 4.2, color: 'violet', alpha: 0.18 }],
        lines: [{ point: [0, 0, 0], dir: [0, 0, 1], t: [-7.4, 7.4], color: 'ink3', dash: true }],
        curves: [ring(+RHO.toFixed(4), +Z0.toFixed(4), { color: 'gold', width: 3 })],
        segments: [{ from: [0, 0, +Z0.toFixed(4)], to: [+RHO.toFixed(4), 0, +Z0.toFixed(4)], color: 'gold', dash: true }],
      },
      caption: 'Drag to rotate. Earth (teal, three great circles), the plane of the Arctic Circle (violet) and their shared curve (gold); the dashed line is the spin axis. Thousands of km, to scale.',
    },
    steps: [
      { label: 'Two equations, one curve', text: t`A point of the Arctic Circle satisfies both $x^2 + y^2 + z^2 = R^2$ and $z = z_0$, with $z_0 = R\sin 66.56^\circ = 5845$ km. Two independent equations in space leave one free direction: a curve.` },
      { label: 'Substitute', text: t`Put $z = z_0$ into the sphere: $x^2 + y^2 = R^2 - z_0^2 = R^2(1 - \sin^2 66.56^\circ) = (R\cos 66.56^\circ)^2$.` },
      { label: 'Read it as a distance from the axis', text: t`$\sqrt{x^2 + y^2} = R\cos 66.56^\circ = 2534$ km: every point of the curve is $2534$ km from the spin axis. So it is a **circle of radius 2534 km around the $z$-axis**, at height $5845$ km. It is also where the sphere meets the cylinder $x^2 + y^2 = 2534^2$.` },
      { label: 'Length', text: t`$2\pi \times 2534 = 15\,920$ km.` },
      { label: 'Sense check', text: t`At the equator ($z = 0$) the same steps give the full radius $6371$ km and a length of $40\,030$ km. The Arctic Circle is shorter by the factor $\cos 66.56^\circ = 0.398$, as it should be so close to the pole.` },
    ],
    answer: t`A circle of radius $R\cos 66.56^\circ \approx 2534$ km about Earth’s axis, $5845$ km above the equatorial plane; its length is about $15\,920$ km.`,
  },
  practice: [
    mcq({
      id: 'closest-plane', difficulty: 1,
      gen(r) {
        let pts, iy, iz, ix, io;
        const argmin = (f) => pts.reduce((b, p, k) => (f(p) < f(pts[b]) ? k : b), 0);
        const unique = (f) => { const v = pts.map(f).sort((a, b) => a - b); return v[0] < v[1]; };
        do {
          pts = Array.from({ length: 4 }, () => [r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0])]);
          iy = argmin((p) => Math.abs(p[1])); iz = argmin((p) => Math.abs(p[2])); ix = argmin((p) => Math.abs(p[0])); io = argmin(norm);
        } while (!(unique((p) => Math.abs(p[1])) && unique((p) => Math.abs(p[2])) && unique((p) => Math.abs(p[0])) && unique(norm)) || new Set([iy, iz, ix, io]).size < 4);
        const names = ['P', 'Q', 'R', 'S'];
        const order = [iy, iz, ix, io];
        return {
          prompt: t`Which of the points $P${pointTeX(pts[0])}$, $Q${pointTeX(pts[1])}$, $R${pointTeX(pts[2])}$, $S${pointTeX(pts[3])}$ is closest to the $xz$-plane?`,
          choices: order.map((k) => t`$${names[k]}${pointTeX(pts[k])}$`),
          answer: 0,
          why: {
            1: t`$${names[iz]}$ has the smallest $|z|$: it is closest to the $xy$-plane, the floor.`,
            2: t`$${names[ix]}$ has the smallest $|x|$: it is closest to the $yz$-plane.`,
            3: t`$${names[io]}$ is closest to the origin, which is a different question: distance to a plane uses one coordinate only.`,
          },
          hints: [t`The $xz$-plane is where $y = 0$.`, t`A point’s distance from the plane $y = 0$ is $|y|$.`],
          teach: 'The distance from a coordinate plane is the size of the one coordinate that the plane sets to zero.',
          explain: t`The $xz$-plane is $y = 0$, so the distance from it is $|y|$. The smallest is $|${pts[iy][1]}|$, for $${names[iy]}$.`,
          visual: { type: 'calc-vectors3d', params: { range: 4.5, planes: [{ normal: [0, 1, 0], d: 0, size: 4, color: 'violet', alpha: 0.18 }], points: pts.map((p, k) => ({ at: p, label: names[k], color: 'gold' })) }, caption: 'Drag to rotate. The violet square is part of the xz-plane, y = 0.' },
        };
      },
    }),
    num({
      id: 'axis-distance', difficulty: 2,
      gen(r) {
        const [a, b, L] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 6, 10], [4, 3, 5], [12, 5, 13]]);
        const axis = r.pick([0, 1, 2]), other = r.intExcept(-6, 6, [0]);
        const sa = r.sign(), sb = r.sign();
        const P = [0, 0, 0], idx = [0, 1, 2].filter((k) => k !== axis);
        P[axis] = other; P[idx[0]] = sa * a; P[idx[1]] = sb * b;
        const name = 'xyz'[axis];
        const errs = [{ value: norm(P), feedback: t`That is the distance from the origin. The distance from the ${name}-axis ignores the ${name}-coordinate.` }, { value: Math.abs(other), feedback: t`That is how far along the axis the point sits, not how far it is from the axis.` }];
        const S = 1 / Math.max(1, Math.max(a, b, Math.abs(other)) / 5);
        const foot = P.map((v, k) => (k === axis ? v : 0));
        return {
          prompt: t`How far is the point $${pointTeX(P)}$ from the $${name}$-axis?`,
          answer: L, tol: { rel: 1e-6, abs: 1e-6 },
          errors: errs.filter((e) => Math.abs(e.value - L) > 1e-6),
          hints: [t`The nearest point of the $${name}$-axis is $${pointTeX(foot)}$: same $${name}$, the other two coordinates zero.`, t`Distance $= \sqrt{(${P[idx[0]]})^2 + (${P[idx[1]]})^2}$.`],
          teach: 'The distance from a coordinate axis uses the two coordinates perpendicular to it.',
          explain: t`The foot of the perpendicular is $${pointTeX(foot)}$, so the distance is $\sqrt{${a * a} + ${b * b}} = ${L}$. The ${name}-coordinate, ${other}, only says where along the axis the foot is.`,
          visual: {
            type: 'calc-vectors3d',
            params: {
              range: 5.5, lines: [{ point: [0, 0, 0], dir: [0, 1, 2].map((k) => (k === axis ? 1 : 0)), t: [-5.4, 5.4], color: 'teal', width: 2.6 }],
              points: [{ at: P.map((v) => v * S), label: 'P', color: 'gold' }, { at: foot.map((v) => v * S), color: 'teal', r: 3.5 }],
              segments: [{ from: P.map((v) => v * S), to: foot.map((v) => v * S), color: 'gold', dash: true }],
            },
            caption: t`Drag to rotate. The ${name}-axis in teal and the perpendicular from $P$ to it, dashed${S < 1 ? '; scaled down to fit' : ''}.`,
          },
        };
      },
    }),
    mcq({
      id: 'missing-variable', difficulty: 2,
      prompt: t`In three dimensions, what does the equation $x^2 + z^2 = 9$ describe?`,
      choices: [t`A cylinder of radius 3 whose axis is the $y$-axis`, t`A circle of radius 3 in the $xz$-plane`, t`A sphere of radius 3`, t`A cylinder of radius 3 whose axis is the $z$-axis`],
      answer: 0,
      why: {
        1: t`That is only its trace in the plane $y = 0$. Since $y$ does not appear, every point $(x, y, z)$ with $x^2 + z^2 = 9$ counts, for every $y$.`,
        2: t`A sphere needs all three squares: $x^2 + y^2 + z^2 = 9$.`,
        3: t`A cylinder about the $z$-axis is $x^2 + y^2 = 9$: the free variable (the axis) is the one that is missing, here $y$.`,
      },
      hints: ['Which variable is missing? It can take any value.', t`Slide the circle $x^2 + z^2 = 9$ along the direction of the missing variable.`],
      teach: 'A missing variable is free: the surface is the curve you see, slid along that variable’s axis.',
      explain: t`For every $y$, the points with $x^2 + z^2 = 9$ form the same circle of radius 3; stacked along the $y$-axis they make a circular cylinder whose axis is the $y$-axis.`,
      visual: { type: 'calc-vectors3d', params: { range: 4, curves: [{ param: ['3*cos(t)', '0', '3*sin(t)'], t: [0, TAU], color: 'gold', width: 2.6 }] }, caption: t`Drag to rotate. The trace of the surface in the plane $y = 0$. What happens at other values of $y$?` },
    }),
    num({
      id: 'sphere-plane', difficulty: 2,
      gen(r) {
        const [R, d, rr] = r.pick([[5, 3, 4], [5, 4, 3], [13, 5, 12], [13, 12, 5], [10, 6, 8], [10, 8, 6]]);
        const c = [r.int(-2, 2), r.int(-2, 2), r.int(-3, 3)], k = c[2] + r.sign() * d;
        const shift = (v, name) => (v === 0 ? `${name}^2` : v > 0 ? `(${name} - ${v})^2` : `(${name} + ${-v})^2`);
        const S = 4 / R;
        return {
          prompt: t`The sphere $${shift(c[0], 'x')} + ${shift(c[1], 'y')} + ${shift(c[2], 'z')} = ${R * R}$ meets the plane $z = ${k}$ in a circle. What is the circle’s radius?`,
          answer: rr, tol: { rel: 1e-6, abs: 1e-6 },
          errors: [{ value: Math.sqrt(Math.abs(R * R - k * k)), feedback: t`Measure the plane from the sphere’s centre, which is at height $${c[2]}$: the plane is $|${k} - (${c[2]})| = ${d}$ away from it.` }, { value: R, feedback: 'That is the sphere’s radius; only a plane through the centre cuts a circle that large.' }].filter((e) => Math.abs(e.value - rr) > 1e-6),
          hints: [t`Substitute $z = ${k}$: what is left is an equation in $x$ and $y$.`, t`$${shift(c[0], 'x')} + ${shift(c[1], 'y')} = ${R * R} - (${k} - (${c[2]}))^2$.`],
          teach: 'A plane at distance d from the centre of a sphere of radius R cuts it in a circle of radius √(R² − d²).',
          explain: t`With $z = ${k}$: $${shift(c[0], 'x')} + ${shift(c[1], 'y')} = ${R * R} - ${d * d} = ${rr * rr}$, a circle of radius $${rr}$ centred at $(${c[0]}, ${c[1]}, ${k})$ — Pythagoras with hypotenuse $${R}$ and one side $${d}$.`,
          visual: {
            type: 'calc-vectors3d',
            params: { range: 5, spheres: [{ centre: c.map((v) => v * S), radius: 4, color: 'teal' }], planes: [{ normal: [0, 0, 1], d: k * S, centre: [c[0] * S, c[1] * S, k * S], size: 4.4, color: 'violet', alpha: 0.2 }], points: [{ at: c.map((v) => v * S), color: 'teal', r: 3.5 }] },
            caption: 'Drag to rotate. The sphere (teal) and the plane (violet), scaled down together to fit.',
          },
        };
      },
    }),
    mcq({
      id: 'which-region', difficulty: 2,
      prompt: 'Which inequalities describe the solid between the two domes in the picture (it fills the space between them, above the floor)?',
      choices: [t`$1 \le x^2 + y^2 + z^2 \le 4,\ z \ge 0$`, t`$1 \le x^2 + y^2 \le 4,\ z \ge 0$`, t`$x^2 + y^2 + z^2 \le 4,\ z \ge 0$`, t`$1 \le x^2 + y^2 + z^2 \le 2,\ z \ge 0$`],
      answer: 0,
      why: {
        1: t`Without $z^2$ these are cylinders: $1 \le x^2 + y^2 \le 4$ is a thick tube that goes up forever.`,
        2: t`That is the whole solid half-ball of radius 2, inner dome included: it leaves out the hole of radius 1.`,
        3: t`The bounds apply to $x^2 + y^2 + z^2$, which is the **square** of the distance: radius 2 means $4$.`,
      },
      hints: [t`Each dome is part of a sphere centred at the origin: what are their radii (one grid square is one unit)?`, t`Between spheres of radius $a$ and $b$: $a^2 \le x^2 + y^2 + z^2 \le b^2$.`],
      teach: 'Inequalities on the distance from the origin give balls and shells; the extra condition z ≥ 0 keeps the upper half.',
      explain: t`The domes are hemispheres of radius 1 and 2 about the origin, so the solid is $1 \le x^2 + y^2 + z^2 \le 4$ with $z \ge 0$: half of a spherical shell.`,
      visual: {
        type: 'calc-vectors3d',
        params: {
          range: 2.6,
          curves: [1, 2].flatMap((R) => [
            { param: [`${R}*cos(t)`, `${R}*sin(t)`, '0'], t: [0, TAU], color: 'violet' },
            { param: [`${R}*cos(t)`, '0', `${R}*sin(t)`], t: [0, Math.PI], color: 'violet' },
            { param: ['0', `${R}*cos(t)`, `${R}*sin(t)`], t: [0, Math.PI], color: 'violet' },
            { param: [`${R * Math.cos(Math.PI / 4)}*cos(t)`, `${R * Math.cos(Math.PI / 4)}*sin(t)`, `${R * Math.sin(Math.PI / 4)}`], t: [0, TAU], color: 'violet' },
          ]),
        },
        caption: 'Drag to rotate. Two domes, centred on the origin, drawn as wire frames; the floor grid has one square per unit.',
      },
    }),
    expr({
      id: 'diameter-sphere', difficulty: 3,
      gen(r) {
        let P, Q, C, R2;
        do {
          P = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)];
          Q = P.map((v) => v + 2 * r.int(-3, 3));
          C = P.map((v, k) => (v + Q[k]) / 2);
          R2 = P.reduce((s, v, k) => s + (v - C[k]) ** 2, 0);
        } while (R2 < 4 || C.every((v) => v === 0));
        const sq = (v, n) => (v === 0 ? `${n}^2` : `(${n} ${v > 0 ? '-' : '+'} ${Math.abs(v)})^2`);
        const eq = `${sq(C[0], 'x')} + ${sq(C[1], 'y')} + ${sq(C[2], 'z')} = ${R2}`;
        return {
          prompt: t`The points $P${pointTeX(P)}$ and $Q${pointTeX(Q)}$ are the ends of a diameter of a sphere. Write an equation of the sphere.`,
          answer: eq, answerTeX: eq,
          vars: { x: [-3, 3], y: [-3, 3], z: [-3, 3] }, mode: 'equation', keys: [['=', '=']],
          errors: [{ answer: `${sq(C[0], 'x')} + ${sq(C[1], 'y')} + ${sq(C[2], 'z')} = ${4 * R2}`, feedback: t`$|PQ|^2 = ${4 * R2}$ is the diameter squared; the radius is half the diameter, so $r^2 = |PQ|^2/4$.` }],
          hints: ['The centre is the midpoint of PQ: average the coordinates.', t`The centre is $${pointTeX(C)}$; the radius is the distance from it to $P$.`],
          teach: 'A diameter fixes a sphere: its midpoint is the centre and half its length the radius.',
          explain: t`Centre $= \tfrac12(P + Q) = ${pointTeX(C)}$ and $r^2 = |P - C|^2 = ${R2}$, so $${eq}$.`,
          visual: { type: 'calc-vectors3d', params: { range: fitRange([P, Q]), points: [{ at: P, label: 'P', color: 'gold' }, { at: Q, label: 'Q', color: 'gold' }], segments: [{ from: P, to: Q, color: 'gold', dash: true }] }, caption: 'Drag to rotate. The diameter PQ.' },
        };
      },
    }),
    mcq({
      id: 'left-handed', difficulty: 2,
      prompt: t`Engineers name frames by where their axes point. Which of these frames is **left-handed**?`,
      choices: [t`$x$ east, $y$ north, $z$ down`, t`$x$ east, $y$ north, $z$ up (“ENU”)`, t`$x$ north, $y$ east, $z$ down (“NED”, used in aircraft navigation)`, t`$x$ forward, $y$ out the right wing, $z$ down (an aircraft’s body frame)`],
      answer: 0,
      why: {
        1: t`East $\times$ north points up (curl your right fingers from east to north), so ENU is right-handed — the picture.`,
        2: t`North $\times$ east points down, so NED is right-handed. Swapping two axes **and** flipping the third keeps the handedness.`,
        3: t`Forward $\times$ right points down, so this is right-handed — it is NED carried by the aircraft.`,
      },
      hints: [t`For a right-handed frame, $\hat x\times\hat y$ must equal $\hat z$.`, t`Use the picture: east $\times$ north points up.`],
      teach: 'A frame is right-handed when the first axis crossed with the second gives the third.',
      explain: t`With $x$ east and $y$ north, $\hat x\times\hat y$ points up. A frame whose $z$ points down then has $\hat x\times\hat y = -\hat z$: left-handed. Mixing such a frame into a calculation silently flips the sign of every cross product — torques, angular momenta, magnetic forces.`,
      visual: { type: 'calc-vectors3d', params: { range: 2, grid: false, axes: false, vectors: [{ to: [1.6, 0, 0], color: 'accent', label: t`\text{east}` }, { to: [0, 1.6, 0], color: 'good', label: t`\text{north}` }, { to: [0, 0, 1.6], color: 'warn', label: t`\text{up}` }] }, caption: 'Drag to rotate. The east–north–up frame, which is right-handed.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-axis-distance', difficulty: 2,
      gen(r) {
        const [b, c, L] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]);
        const P = [r.intExcept(-9, 9, [0]), r.sign() * b, r.sign() * c];
        const S = 5 / Math.max(...P.map(Math.abs));
        return {
          prompt: t`How far is the point $${pointTeX(P)}$ from the $x$-axis?`,
          answer: L, tol: { rel: 1e-6, abs: 1e-6 },
          errors: [{ value: norm(P), feedback: 'That is the distance from the origin; leave out the x-coordinate.' }],
          hints: [t`Use the two coordinates perpendicular to the $x$-axis.`],
          teach: 'Distance from the x-axis: √(y² + z²).',
          explain: t`$\sqrt{(${P[1]})^2 + (${P[2]})^2} = \sqrt{${b * b + c * c}} = ${L}$.`,
          visual: { type: 'calc-vectors3d', params: { range: 5.5, lines: [{ point: [0, 0, 0], dir: [1, 0, 0], t: [-5.4, 5.4], color: 'teal', width: 2.6 }], points: [{ at: P.map((v) => v * S), label: 'P', color: 'gold' }] }, caption: 'Drag to rotate. The x-axis in teal; the point, scaled down to fit.' },
        };
      },
    }),
    mcq({
      id: 'cp-two-equations', difficulty: 2,
      prompt: t`In space, which set of points satisfies both $x^2 + y^2 = 4$ and $z = 3$?`,
      choices: [t`A circle of radius 2 around the $z$-axis, 3 above the $xy$-plane`, t`A cylinder of radius 2 around the $z$-axis`, t`A flat disc of radius 2 at height 3`, t`A sphere of radius 2 centred at $(0, 0, 3)$`],
      answer: 0,
      why: {
        1: t`That is the first equation alone. The second pins $z$ to $3$, keeping one ring of the cylinder.`,
        2: t`A disc would be $x^2 + y^2 \le 4$; the equation keeps only its rim.`,
        3: t`A sphere centred at $(0, 0, 3)$ would be $x^2 + y^2 + (z - 3)^2 = 4$, a single equation.`,
      },
      hints: ['Each equation is a surface. The points on both lie where the two surfaces meet.'],
      teach: 'Two equations in space usually cut out a curve: where the two surfaces meet.',
      explain: t`$x^2 + y^2 = 4$ is a cylinder of radius 2 about the $z$-axis and $z = 3$ a horizontal plane; they meet in the circle of radius 2 at height 3.`,
      visual: { type: 'calc-vectors3d', params: { range: 4, curves: [-3, -1, 1, 3].map((h) => ring(2, h, { color: 'teal' })), segments: [0, 1, 2, 3].map((k) => ({ from: [2 * Math.cos((k * Math.PI) / 2), 2 * Math.sin((k * Math.PI) / 2), -3.5], to: [2 * Math.cos((k * Math.PI) / 2), 2 * Math.sin((k * Math.PI) / 2), 3.5], color: 'teal' })), planes: [{ normal: [0, 0, 1], d: 3, size: 3, color: 'violet', alpha: 0.2 }] }, caption: 'Drag to rotate. The cylinder x² + y² = 4 (teal wire frame) and the plane z = 3 (violet).' },
    }),
    num({
      id: 'cp-elevation', difficulty: 3, transfer: true,
      gen(r) {
        const [e0, n0, h] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [12, 5, 13], [4, 3, 5]]);
        const k = r.pick([60, 80, 100]), u = r.pick([300, 420, 550, 800]);
        const E = r.sign() * e0 * k, N = r.sign() * n0 * k, H = h * k;
        const el = deg(Math.atan2(u, H));
        const S = 4 / Math.max(H, u);
        return {
          prompt: t`A tracking antenna uses its local east–north–up frame: $x$ east, $y$ north, $z$ up, origin at the antenna. A satellite is at $(${E}, ${N}, ${u})$ km in this frame. What is its **elevation angle** — the angle of the line of sight above the horizontal plane — to 0.1°?`,
          answer: el, units: 'deg', tol: { rel: 0, abs: 0.1 },
          errors: [{ value: 90 - el, feedback: 'That is the angle from the vertical (the zenith angle). Elevation is measured up from the horizontal.' }, { value: deg(Math.atan2(u, Math.abs(E))), feedback: t`The horizontal distance combines east and north: $\sqrt{x^2 + y^2}$, not $|x|$ alone.` }],
          hints: [t`The horizontal distance to the point under the satellite is its distance from the $z$-axis, $\sqrt{x^2 + y^2}$.`, t`$\tan(\text{elevation}) = \dfrac{z}{\sqrt{x^2 + y^2}} = \dfrac{${u}}{${H}}$.`],
          teach: 'Elevation compares the height of a point with its distance from the vertical axis through the observer.',
          explain: t`The horizontal distance is $\sqrt{${E}^2 + ${N}^2} = ${H}$ km, so the elevation is $\arctan\frac{${u}}{${H}} = ${nice(el, 3)}^\circ$; the slant range is $\sqrt{${H}^2 + ${u}^2} = ${fmt(Math.hypot(H, u), 4)}$ km. Antennas track a pass by steering exactly this angle, together with the azimuth: the compass bearing of the line of sight’s shadow.`,
          visual: {
            type: 'calc-vectors3d',
            params: { range: 4.5, axisLabels: ['E', 'N', 'U'], points: [{ at: [E * S, N * S, u * S], label: t`\text{sat}`, color: 'gold' }, { at: [E * S, N * S, 0], color: 'ink3', r: 3 }], vectors: [{ to: [E * S, N * S, u * S], color: 'gold' }], segments: [{ from: [0, 0, 0], to: [E * S, N * S, 0], color: 'ink3', dash: true }, { from: [E * S, N * S, 0], to: [E * S, N * S, u * S], color: 'ink3', dash: true }] },
            caption: 'Drag to rotate. The line of sight (gold) and its shadow on the horizontal plane (dashed); scaled to fit.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §2.2 Vectors in Three Dimensions', url: 'https://openstax.org/books/calculus-volume-3/pages/2-2-vectors-in-three-dimensions' },
    { label: 'OpenStax Calculus Vol. 3, §2.6 Quadric Surfaces (cylinders and traces)', url: 'https://openstax.org/books/calculus-volume-3/pages/2-6-quadric-surfaces' },
  ],
});
