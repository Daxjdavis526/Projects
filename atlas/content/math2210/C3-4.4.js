// Triple integrals: columns, strips and slabs. Integrate up each vertical
// column of the solid, then over its shadow on the floor (a double integral
// with strips) — the nested limits, the six orders, mass and average values.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt, tex } from '../../src/core/format.js';
import { r6 } from './_integrals.js';

const t = String.raw;

// the faces of the tetrahedron with corners O, (a,0,0), (0,b,0), (0,0,c), for calc-vectors3d
const tetraFaces = (a, b, c, alpha = 0.16) => [
  { pts: [[0, 0, 0], [a, 0, 0], [0, b, 0]], color: 'accent', alpha: alpha + 0.08 },
  { pts: [[a, 0, 0], [0, b, 0], [0, 0, c]], color: 'accent2', alpha },
  { pts: [[0, 0, 0], [a, 0, 0], [0, 0, c]], color: 'ink3', alpha: 0.05 },
  { pts: [[0, 0, 0], [0, b, 0], [0, 0, c]], color: 'ink3', alpha: 0.05 },
];
const corners = (a, b, c) => [
  { at: [a, 0, 0], color: 'accent', r: 4, label: `(${a}, 0, 0)` },
  { at: [0, b, 0], color: 'accent', r: 4, label: `(0, ${b}, 0)` },
  { at: [0, 0, c], color: 'accent', r: 4, label: `(0, 0, ${c})` },
];
// a box [0,a]×[0,b]×[0,c] as six translucent faces
const boxFaces = (a, b, c, color = 'accent', alpha = 0.12) => [
  { at: [0, 0, 0], u: [a, 0, 0], v: [0, b, 0] }, { at: [0, 0, c], u: [a, 0, 0], v: [0, b, 0] },
  { at: [0, 0, 0], u: [a, 0, 0], v: [0, 0, c] }, { at: [0, b, 0], u: [a, 0, 0], v: [0, 0, c] },
  { at: [0, 0, 0], u: [0, b, 0], v: [0, 0, c] }, { at: [a, 0, 0], u: [0, b, 0], v: [0, 0, c] },
].map((f) => ({ ...f, color, alpha }));
const scene = (params, caption) => ({ type: 'calc-vectors3d', params: { grid: false, ...params }, caption });

export default lesson({
  id: 'math2210.C3-4.4',
  title: 'Triple integrals',
  minutes: 12, difficulty: 3,
  intro: t`A triple integral adds up a quantity spread through a solid $E$: cut it into small boxes of volume $\Delta V$, multiply each by $f$ at a point inside, add, and let the boxes shrink. To compute one, picture the solid's **shadow** $D$ on the floor. Above each point $(x, y)$ of the shadow a vertical **column** runs from the solid's bottom surface $z = u_1(x, y)$ to its top $z = u_2(x, y)$. Integrate up each column, then over the shadow:

$$\iiint_E f\,dV = \iint_D \left[\int_{u_1(x,y)}^{u_2(x,y)} f(x, y, z)\,dz\right] dA$$

The double integral over $D$ is done with strips, as before, so the limits nest: **the innermost may depend on both outer variables, the middle one on the outermost only, and the outermost are constants.** With $f = 1$ this is volume; with $f = \rho$, a density, it is mass; with $f = \rho\,x$, the moment that locates the centre of mass.`,
  symbols: [
    { tex: 'E', text: 'the solid region in space you integrate over' },
    { tex: 'f(x, y, z)', text: 'the integrand: a density (kg/m³), a charge density (C/m³), an energy density (J/m³) — anything per unit volume' },
    { tex: 'dV', text: t`the **volume element**; in Cartesian coordinates $dV = dx\,dy\,dz$, in any of the six orders` },
    { tex: 'D', text: t`the **shadow** of $E$: its projection onto the $xy$-plane` },
    { tex: 'u_1(x, y),\\ u_2(x, y)', text: t`the bottom and top surfaces of $E$: where the vertical column above $(x, y)$ enters and leaves the solid` },
  ],
  why: t`Mass, charge, energy and every moment of a solid body are triple integrals, and the nested limits you set up here are the template for the cylindrical and spherical ones in the next lesson.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'Columns, strips and slabs',
    lead: t`The solid tetrahedron $E$ under the plane $\tfrac{x}{2} + \tfrac{y}{3} + \tfrac{z}{2} = 1$ in the first octant. The violet **column** stands at $(x_0, y_0)$ and runs from the floor up to the roof $z = 2 - x - \tfrac23 y$: the innermost integral, $dz$. It stands on the gold **strip** of the shadow at $x = x_0$: the middle integral, $dy$. Sweeping the strip across the shadow is the outer integral, $dx$.`,
    tasks: [
      t`Slide the column along the strip: its top follows the slanted roof, so the $z$-limits depend on **both** $x$ and $y$.`,
      t`Move $x_0$ towards $2$: the strip shrinks, because the shadow's edge is the line $y = 3 - \tfrac32 x$. The $y$-limits depend on $x$ only; the $x$-limits, $0$ to $2$, on nothing.`,
      t`Show the slab: the columns along one strip fill a triangle of area $A(x_0) = \tfrac34(2 - x_0)^2$. Adding slabs, $\int_0^2 A(x)\,dx = 2$ — the tetrahedron's volume, $\tfrac16\cdot2\cdot3\cdot2$.`,
    ],
    params: {
      range: 3.2, grid: false, scale: 1.6,
      sliders: [
        { key: 'x0', label: 'Strip at $x_0$', min: 0, max: 1.9, step: 0.05, value: 0.6, explain: 'The outer variable: which strip of the shadow, and which slab of the solid.' },
        { key: 's', label: 'Column along the strip, $s$', min: 0, max: 0.95, step: 0.05, value: 0.4, explain: 'Where the column stands, as a fraction of the strip’s length: $y_0 = s \\cdot \\tfrac32(2 - x_0)$.' },
      ],
      toggles: [{ key: 'slab', label: 'Show the slab at $x_0$', value: false }],
      triangles: [...tetraFaces(2, 3, 2), { pts: [['x0', 0, 0], ['x0', '1.5*(2 - x0)', 0], ['x0', 0, '2 - x0']], color: 'gold', alpha: 0.4, when: 'slab' }],
      segments: [
        { from: ['x0', 0, 0], to: ['x0', '1.5*(2 - x0)', 0], color: 'gold', width: 3.5 },
        { from: ['x0', '1.5*s*(2 - x0)', 0], to: ['x0', '1.5*s*(2 - x0)', '(2 - x0)*(1 - s)'], color: 'violet', width: 4.5 },
      ],
      points: [
        ...corners(2, 3, 2),
        { at: ['x0', '1.5*s*(2 - x0)', '(2 - x0)*(1 - s)'], color: 'violet', r: 4.5 },
        { at: [0.25, 0.6, 1.35], color: 'accent2', r: 0.01, label: 'z = 2 - x - \\tfrac23 y' },
        { at: [0.3, 1.6, 0], color: 'accent', r: 0.01, label: 'D' },
      ],
      readouts: [
        { label: 'column: $0 \\le z \\le$', expr: '(2 - x0)*(1 - s)', digits: 3 },
        { label: 'strip: $0 \\le y \\le$', expr: '1.5*(2 - x0)', digits: 3 },
        { label: 'slab area $A(x_0)$', expr: '0.75*(2 - x0)^2', digits: 3 },
      ],
    },
    caption: 'Drag to rotate. The blue floor triangle is the shadow D; the pale slanted face is the roof. Lengths are to scale.',
  },
  example: {
    prompt: t`$E$ is the solid tetrahedron of the Explore: bounded by the coordinate planes and the plane $\tfrac{x}{2} + \tfrac{y}{3} + \tfrac{z}{2} = 1$. Find its volume, then $\iiint_E z\,dV$, and from them the height $\bar z$ of its centroid.`,
    visual: scene({ range: 3.3, triangles: [...tetraFaces(2, 3, 2), { pts: [[0.6, 0, 0], [0.6, 2.1, 0], [0.6, 0, 1.4]], color: 'gold', alpha: 0.4 }], segments: [{ from: [0.6, 0, 0], to: [0.6, 2.1, 0], color: 'gold', width: 3.5 }, { from: [0.6, 0.84, 0], to: [0.6, 0.84, 0.84], color: 'violet', width: 4.5 }], points: corners(2, 3, 2) }, 'The tetrahedron, one slab (gold) and one column (violet). Drag to rotate.'),
    steps: [
      { label: 'The shadow', text: t`Set $z = 0$ in the plane: the shadow $D$ is the triangle $\tfrac{x}{2} + \tfrac{y}{3} \le 1$, that is $0 \le x \le 2$ and $0 \le y \le 3 - \tfrac32 x$.` },
      { label: 'The columns', text: t`Solve the plane for $z$: each column runs from $z = 0$ up to $z = 2 - x - \tfrac23 y$. So
$$\iiint_E f\,dV = \int_0^2\!\!\int_0^{3 - \frac32 x}\!\!\int_0^{2 - x - \frac23 y} f\,dz\,dy\,dx.$$` },
      { label: 'Volume', text: t`With $f = 1$ the inner integral is the column's height. Writing $w = 2 - x$, the strip runs to $y = \tfrac32 w$ and $\displaystyle\int_0^{3w/2}\left(w - \tfrac23 y\right)dy = \tfrac34 w^2$ — the slab's area. Then $\displaystyle\int_0^2 \tfrac34 (2 - x)^2\,dx = \tfrac34\cdot\tfrac83 = 2$.` },
      { label: 'The z-moment', text: t`Inner: $\displaystyle\int_0^{w - \frac23 y} z\,dz = \tfrac12\left(w - \tfrac23 y\right)^2$. Middle: $\displaystyle\int_0^{3w/2} \tfrac12\left(w - \tfrac23 y\right)^2 dy = \tfrac{w^3}{4}$. Outer: $\displaystyle\int_0^2 \tfrac{(2 - x)^3}{4}\,dx = \tfrac{2^4}{16} = 1$.` },
      { label: 'Centroid', text: t`$\bar z = \dfrac{\iiint_E z\,dV}{V} = \dfrac{1}{2} = 0.5$.` },
      { label: 'Sense check', text: t`The volume matches the pyramid formula $\tfrac13\times\text{base}\times\text{height} = \tfrac13\cdot3\cdot2 = 2$. And the centroid of a tetrahedron is the average of its four corners: $\bar z = \tfrac{0 + 0 + 0 + 2}{4} = 0.5$.` },
    ],
    answer: t`$V = 2$, $\ \iiint_E z\,dV = 1$, $\ \bar z = 0.5$.`,
  },
  practice: [
    num({
      id: 'box', difficulty: 1,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 3]), c = r.pick([1, 2, 3]);
        const I = ((a * a) / 2) * ((b * b) / 2) * ((c ** 3) / 3);
        return {
          prompt: t`Evaluate $\displaystyle\iiint_B x\,y\,z^2\,dV$ over the box $B = [0, ${a}]\times[0, ${b}]\times[0, ${c}]$.`,
          answer: I, tol: { rel: 1e-4 },
          vars: ['z'], integrand: `${(a * a * b * b) / 4}*z^2`, limits: [0, c],
          errors: [{ value: ((a * a) / 2) * ((b * b) / 2) * ((c * c) / 2), feedback: t`$\int_0^{${c}} z^2\,dz = \tfrac{${c}^3}{3}$: the power goes up by one.` }].filter((e) => Math.abs(e.value - I) > 1e-9),
          hints: [t`Over a box, a product $g(x)\,h(y)\,k(z)$ splits into three single integrals.`],
          teach: 'Over a box, a product of one-variable factors integrates to the product of three single integrals.',
          explain: t`$\left(\int_0^{${a}} x\,dx\right)\left(\int_0^{${b}} y\,dy\right)\left(\int_0^{${c}} z^2\,dz\right) = \tfrac{${a * a}}{2}\cdot\tfrac{${b * b}}{2}\cdot\tfrac{${c ** 3}}{3} = ${nice(r6(I))}$.`,
          visual: scene({ range: 3.4, parallelograms: boxFaces(a, b, c), points: [{ at: [a, b, c], color: 'accent', r: 4, label: `(${a}, ${b}, ${c})` }] }, t`The box $B$. Drag to rotate.`),
        };
      },
    }),
    mcq({
      id: 'tetra-limits', difficulty: 2,
      prompt: t`Which iterated integral gives the volume of the tetrahedron $x, y, z \ge 0$, $x + y + z \le 1$?`,
      choices: [
        t`$\displaystyle\int_0^1\!\!\int_0^{1-x}\!\!\int_0^{1-x-y} dz\,dy\,dx$`,
        t`$\displaystyle\int_0^1\!\!\int_0^{1}\!\!\int_0^{1-x-y} dz\,dy\,dx$`,
        t`$\displaystyle\int_0^1\!\!\int_0^{1-x}\!\!\int_0^{1} dz\,dy\,dx$`,
        t`$\displaystyle\int_0^{1-x-y}\!\!\int_0^{1-x}\!\!\int_0^{1} dx\,dy\,dz$`,
      ],
      answer: 0,
      why: {
        1: t`$y$ must stop at the shadow's edge, $y = 1 - x$. Beyond it the "columns" have negative height, $1 - x - y < 0$, and subtract.`,
        2: t`That is the prism under the flat roof $z = 1$, over the triangular shadow — not the tetrahedron, whose roof slopes.`,
        3: t`The outermost limits contain $x$ and $y$, which are gone by then. Outer limits must be constants; each inner limit may use only the variables outside it.`,
      },
      hints: ['Find the shadow first: set z = 0 in x + y + z = 1.', t`Columns run from $z = 0$ to the plane, $z = 1 - x - y$; the shadow is the triangle $0 \le y \le 1 - x$, $0 \le x \le 1$.`],
      teach: 'Triple limits nest: z between surfaces over (x, y), then y between curves over x, then x between constants.',
      explain: t`The roof is $z = 1 - x - y$ and the shadow is the triangle $0 \le x \le 1$, $0 \le y \le 1 - x$, so the volume is $\int_0^1\int_0^{1-x}\int_0^{1-x-y} dz\,dy\,dx = \tfrac16$ — one sixth of the unit cube.`,
      visual: scene({ range: 1.5, triangles: tetraFaces(1, 1, 1), points: corners(1, 1, 1) }, 'The tetrahedron x, y, z ≥ 0, x + y + z ≤ 1. Drag to rotate.'),
    }),
    num({
      id: 'tetra-volume', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 3, 4]), b = r.pick([2, 3, 4, 6]), c = r.pick([2, 3, 6]);
        const V = (a * b * c) / 6;
        return {
          prompt: t`Find the volume of the solid in the first octant under the plane $\dfrac{x}{${a}} + \dfrac{y}{${b}} + \dfrac{z}{${c}} = 1$.`,
          answer: V, tol: { rel: 1e-4 },
          integrand: `${(b * c) / 2}*(1 - x/${a})^2`, limits: [0, a],
          errors: [
            { value: a * b * c, feedback: 'That is the whole box that encloses the solid. The roof slopes down to the floor.' },
            { value: (a * b * c) / 2, feedback: t`That is a prism: half the box. The solid also narrows in the third direction, so it is a third of that.` },
          ],
          hints: [t`Columns run from $z = 0$ to $z = ${c}\left(1 - \frac{x}{${a}} - \frac{y}{${b}}\right)$, over the shadow $0 \le x \le ${a}$, $0 \le y \le ${b}\left(1 - \frac{x}{${a}}\right)$.`, t`The slab at $x$ is a right triangle with legs $${b}(1 - x/${a})$ and $${c}(1 - x/${a})$; integrate its area from $0$ to $${a}$.`],
          teach: 'The volume of a solid is the triple integral of 1, and integrating the inner two variables first gives the area of each slab.',
          explain: t`Each slab is a right triangle of area $A(x) = \tfrac12\cdot${b}\left(1 - \tfrac{x}{${a}}\right)\cdot${c}\left(1 - \tfrac{x}{${a}}\right)$, and $\displaystyle\int_0^{${a}} A(x)\,dx = \frac{${b * c}}{2}\cdot\frac{${a}}{3} = ${nice(V)}$ — the formula $\tfrac{abc}{6}$ for a tetrahedron with intercepts $a$, $b$, $c$.`,
          visual: scene({ range: Math.max(a, b, c) + 0.5, triangles: tetraFaces(a, b, c), points: corners(a, b, c) }, 'The solid under the plane, in the first octant. Drag to rotate.'),
        };
      },
    }),
    num({
      id: 'graded', difficulty: 2,
      gen(r) {
        const L = r.pick([0.1, 0.2, 0.3]), rho0 = r.pick([300, 500, 800]), k = r.pick([1, 2, 3]);
        const M = rho0 * L ** 3 * (1 + k / 2);
        const layers = [0.1, 0.3, 0.5, 0.7, 0.9].map((f) => ({ at: [0, 0, r6(f * 2)], u: [2, 0, 0], v: [0, 2, 0], color: 'gold', alpha: r6(0.06 + 0.5 * f) }));
        return {
          prompt: t`A 3D-printed lattice cube of side $L = ${L}$ m is **graded**: its density rises from bottom to top as $\rho = ${rho0}\left(1 + ${k === 1 ? '' : k}\dfrac{z}{L}\right)$ kg/m³, with $z$ the height above its base. What is its mass?`,
          answer: M, units: 'kg', tol: { rel: 0.005 },
          errors: [
            { value: rho0 * L ** 3, feedback: 'That uses the density at the bottom everywhere. It increases with height: integrate it.' },
            { value: rho0 * L ** 3 * (1 + k), feedback: 'That uses the density at the top everywhere.' },
          ],
          hints: [t`Mass $= \iiint \rho\,dV$; the density depends on $z$ only, so the $x$ and $y$ integrals just give the base area $L^2$.`, t`$M = L^2\displaystyle\int_0^L ${rho0}\left(1 + ${k}\frac{z}{L}\right)dz$.`],
          teach: 'Mass is the triple integral of density; when the density depends on one variable, the other two integrals just give an area.',
          explain: t`$M = L^2\cdot ${rho0}\left[z + \tfrac{${k}z^2}{2L}\right]_0^L = ${rho0}\,L^3\left(1 + \tfrac{${k}}{2}\right) = ${fmt(M, 3)}$ kg. A density that is linear in $z$ averages its value at mid-height, so this is the mid-height density times the volume.`,
          visual: scene({ range: 2.6, parallelograms: [...boxFaces(2, 2, 2, 'accent', 0.06), ...layers], points: [{ at: [2, 2, 2], color: 'accent', r: 0.01, label: 'L' }] }, t`The cube (drawn with side 2 units, not to scale), with layers shaded darker where it is denser. Drag to rotate.`),
        };
      },
    }),
    num({
      id: 'average', difficulty: 2,
      gen(r) {
        const L = r.pick([1, 2, 3, 4]);
        const avg = L * L;
        return {
          prompt: t`What is the average value of $f(x, y, z) = x^2 + y^2 + z^2$ — the squared distance from the origin — over the cube $[0, ${L}]^3$? The average is $\bar f = \dfrac{1}{V}\iiint f\,dV$.`,
          answer: avg, tol: { rel: 1e-4 },
          errors: [
            { value: avg * L ** 3, feedback: t`That is $\iiint f\,dV$. Divide by the cube's volume, $${L ** 3}$.` },
            { value: (3 * L * L) / 2, feedback: t`The average of $x^2$ over $[0, ${L}]$ is $\tfrac{1}{${L}}\int_0^{${L}} x^2\,dx = \tfrac{${L * L}}{3}$, not $\tfrac{${L * L}}{2}$.` },
          ].filter((e) => Math.abs(e.value - avg) > 1e-9),
          hints: [t`The three terms average separately, and by symmetry they all average the same.`, t`The average of $x^2$ over $0 \le x \le ${L}$ is $\tfrac{${L}^2}{3}$.`],
          teach: 'The average of f over a solid is ∭ f dV divided by the volume; a sum of terms averages term by term.',
          explain: t`$\bar f = 3\times\tfrac{${L}^2}{3} = ${avg}$. Compare the farthest corner, where $f = 3\cdot${L * L} = ${3 * L * L}$: the average is a third of the maximum.`,
          visual: scene({ range: L + 0.6, parallelograms: boxFaces(L, L, L), vectors: [{ to: [r6(0.75 * L), r6(0.4 * L), r6(0.6 * L)], color: 'gold', label: '\\vec r' }] }, t`The cube $[0, ${L}]^3$ and one position vector $\vec r$; $f = |\vec r|^2$. Drag to rotate.`),
        };
      },
    }),
    mcq({
      id: 'reorder', difficulty: 3,
      prompt: t`Rewrite $\displaystyle\int_0^1\!\!\int_0^{x}\!\!\int_0^{y} f\,dz\,dy\,dx$ in the order $dx\,dy\,dz$.`,
      choices: [
        t`$\displaystyle\int_0^1\!\!\int_z^{1}\!\!\int_y^{1} f\,dx\,dy\,dz$`,
        t`$\displaystyle\int_0^1\!\!\int_0^{z}\!\!\int_0^{y} f\,dx\,dy\,dz$`,
        t`$\displaystyle\int_0^1\!\!\int_0^{1}\!\!\int_y^{1} f\,dx\,dy\,dz$`,
        t`$\displaystyle\int_0^1\!\!\int_z^{1}\!\!\int_0^{y} f\,dx\,dy\,dz$`,
      ],
      answer: 0,
      why: {
        1: t`That describes $0 \le x \le y \le z \le 1$: every inequality turned round.`,
        2: t`$y$ cannot range over all of $[0, 1]$: the solid has $y \ge z$.`,
        3: t`Here $x$ runs from $0$ to $y$, but the solid has $x \ge y$: $x$ runs from $y$ up to $1$.`,
      },
      hints: [t`Read the region off the limits as one chain of inequalities: $0 \le z \le y \le x \le 1$.`, t`Now read the same chain from the other end: $z$ from $0$ to $1$; then $y$ from $z$ to $1$; then $x$ from $y$ to $1$.`],
      teach: 'When the limits form a chain of inequalities, any order of integration can be read straight off the chain.',
      explain: t`The limits say $0 \le z \le y \le x \le 1$, the tetrahedron with corners $(0,0,0)$, $(1,0,0)$, $(1,1,0)$, $(1,1,1)$. For $dx\,dy\,dz$: $z \in [0, 1]$, then $y \in [z, 1]$, then $x \in [y, 1]$. Its volume is $\tfrac16$: the six orderings of three numbers cut the unit cube into six such pieces.`,
      visual: scene({ range: 1.5, triangles: [{ pts: [[0, 0, 0], [1, 0, 0], [1, 1, 0]], color: 'accent', alpha: 0.24 }, { pts: [[0, 0, 0], [1, 1, 0], [1, 1, 1]], color: 'accent2', alpha: 0.16 }, { pts: [[0, 0, 0], [1, 0, 0], [1, 1, 1]], color: 'accent2', alpha: 0.12 }, { pts: [[1, 0, 0], [1, 1, 0], [1, 1, 1]], color: 'accent2', alpha: 0.12 }], points: [{ at: [1, 0, 0], color: 'accent', r: 4, label: '(1, 0, 0)' }, { at: [1, 1, 0], color: 'accent', r: 4, label: '(1, 1, 0)' }, { at: [1, 1, 1], color: 'accent', r: 4, label: '(1, 1, 1)' }] }, 'The solid 0 ≤ z ≤ y ≤ x ≤ 1. Drag to rotate.'),
    }),
    mcq({
      id: 'zero-volume', difficulty: 3, kind: 'error',
      prompt: t`A student wants the volume under the plane $z = 2 - x - y$ in the first octant and writes
$$\int_0^2\!\!\int_0^2\!\!\int_0^{2-x-y} dz\,dy\,dx = \int_0^2\!\!\int_0^2 (2 - x - y)\,dy\,dx = 0.$$
A solid with zero volume? What went wrong?`,
      choices: [
        t`The $y$-limits overshoot the shadow: $y$ must stop at $2 - x$. Beyond that line the "columns" have negative height and cancel the true volume, $\tfrac43$`,
        t`The order should be $dx\,dy\,dz$, not $dz\,dy\,dx$`,
        t`The volume really is $0$: the plane cuts through the origin`,
        t`The $z$-limits should run from $2 - x - y$ to $0$`,
      ],
      answer: 0,
      why: {
        1: 'Any order works if the limits describe the solid; this order is a fine choice. The trouble is the square shadow.',
        2: t`The plane meets the axes at $2$; it does not pass through the origin, and the solid under it is a genuine tetrahedron.`,
        3: t`That only flips the sign of every column, and the total would still be $0$.`,
      },
      hints: ['What is the shadow of the solid on the xy-plane?', t`Where $x + y > 2$, the "column" from $z = 0$ to $z = 2 - x - y$ has negative height. Over the square $[0, 2]^2$, those cancel the positive ones exactly.`],
      teach: 'Every limit must describe the solid itself: a shadow taken too big lets negative "columns" cancel real volume.',
      explain: t`The shadow is the triangle $x + y \le 2$, so the correct integral is $\int_0^2\int_0^{2-x}\int_0^{2-x-y} dz\,dy\,dx = \tfrac{2^3}{6} = \tfrac43$. Over the square, the half beyond $y = 2 - x$ contributes exactly $-\tfrac43$.`,
      visual: scene({ range: 2.6, triangles: [...tetraFaces(2, 2, 2), { pts: [[2, 0, 0], [0, 2, 0], [2, 2, 0]], color: 'bad', alpha: 0.18 }], parallelograms: [], points: corners(2, 2, 2) }, t`The tetrahedron under $z = 2 - x - y$. In red: the half of the student's square floor that lies outside its shadow. Drag to rotate.`),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-box', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2]), b = r.pick([1, 2, 3]), c = r.pick([2, 3]);
        const I = (a * b * c * (a + b + c)) / 2;
        return {
          prompt: t`Evaluate $\displaystyle\iiint_B (x + y + z)\,dV$ over the box $B = [0, ${a}]\times[0, ${b}]\times[0, ${c}]$.`,
          answer: I, tol: { rel: 1e-4 },
          vars: ['x'], integrand: `${b * c}*x + ${(c * b * b) / 2 + (b * c * c) / 2}`, limits: [0, a],
          hints: [t`Each term separately: $\iiint_B x\,dV = \tfrac{${a}^2}{2}\cdot${b}\cdot${c}$, and so on.`],
          teach: 'A sum integrates term by term; over a box, each term is a product of single integrals.',
          explain: t`$\tfrac{${a * a}}{2}(${b})(${c}) + (${a})\tfrac{${b * b}}{2}(${c}) + (${a})(${b})\tfrac{${c * c}}{2} = \tfrac{${a * b * c}(${a} + ${b} + ${c})}{2} = ${nice(I)}$: the volume times the value at the centre, as it must be for a linear integrand.`,
          visual: scene({ range: 3.4, parallelograms: boxFaces(a, b, c), points: [{ at: [a, b, c], color: 'accent', r: 4, label: `(${a}, ${b}, ${c})` }] }, t`The box $B$. Drag to rotate.`),
        };
      },
    }),
    mcq({
      id: 'cp-limits', difficulty: 2,
      prompt: t`$E$ is the solid in the first octant under the plane $z = 4 - 2x - y$. Which iterated integral equals $\iiint_E f\,dV$?`,
      choices: [
        t`$\displaystyle\int_0^2\!\!\int_0^{4-2x}\!\!\int_0^{4-2x-y} f\,dz\,dy\,dx$`,
        t`$\displaystyle\int_0^4\!\!\int_0^{4-2x}\!\!\int_0^{4-2x-y} f\,dz\,dy\,dx$`,
        t`$\displaystyle\int_0^2\!\!\int_0^{4}\!\!\int_0^{4-2x-y} f\,dz\,dy\,dx$`,
        t`$\displaystyle\int_0^2\!\!\int_0^{4-2x}\!\!\int_0^{4} f\,dz\,dy\,dx$`,
      ],
      answer: 0,
      why: {
        1: t`The roof meets the $x$-axis where $4 - 2x = 0$, at $x = 2$; the $4$ is where it meets the $y$- and $z$-axes.`,
        2: t`$y$ must stop at the shadow's edge, $y = 4 - 2x$; beyond it the columns would have negative height.`,
        3: t`The roof slopes: the column's top is the plane $z = 4 - 2x - y$, not the flat level $z = 4$.`,
      },
      hints: ['The shadow: set z = 0 to get 2x + y = 4.'],
      teach: 'Set up a triple integral from the inside out: top and bottom surfaces, then the shadow’s strips, then constants.',
      explain: t`Columns from $z = 0$ to $4 - 2x - y$; the shadow is $0 \le y \le 4 - 2x$ for $0 \le x \le 2$. (With $f = 1$ the volume is $\tfrac{2\cdot4\cdot4}{6} = \tfrac{16}{3}$.)`,
      visual: scene({ range: 4.4, triangles: tetraFaces(2, 4, 4), points: corners(2, 4, 4) }, 'The solid under the plane z = 4 − 2x − y in the first octant. Drag to rotate.'),
    }),
    num({
      id: 'cp-atmosphere', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([10, 20, 50, 100]);   // km
        const rho0 = 1.225, H = 8.43;           // kg/m³, km
        const M = rho0 * H * 1e3 * (L * 1e3) ** 2;
        const layers = [0.15, 0.6, 1.2, 1.9, 2.7].map((z) => ({ at: [0, 0, z], u: [2, 0, 0], v: [0, 2, 0], color: 'teal', alpha: r6(0.05 + 0.3 * Math.exp(-z / 1.1)) }));
        return {
          prompt: t`Model the air's density as $\rho(z) = \rho_0\,e^{-z/H}$, with $\rho_0 = 1.225$ kg/m³ at sea level and $H = 8.43$ km — an isothermal atmosphere at 288 K. Find the mass of the air above a ${L} km × ${L} km square of sea, all the way up.`,
          answer: M, units: 'kg', tol: { rel: 0.005 },
          errors: [{ value: rho0 * (L * 1e3) ** 2, feedback: t`$\int_0^\infty e^{-z/H}\,dz = H$, not $1$: the column is effectively $H$ deep at sea-level density.` }],
          hints: [
            t`$M = \displaystyle\int_0^{L}\!\!\int_0^{L}\!\!\int_0^{\infty} \rho_0 e^{-z/H}\,dz\,dy\,dx$: the density depends on $z$ alone.`,
            t`$\int_0^\infty e^{-z/H}\,dz = H$, so $M = \rho_0 H L^2$. Work in metres.`,
          ],
          teach: 'Over a box-shaped column, a density that depends only on height integrates to (column mass per area) × base area.',
          explain: t`$M = \rho_0 H L^2 = 1.225 \times 8430\ \text{m} \times (${L}\,000\ \text{m})^2 \approx ${tex(M, 3)}$ kg. Sense check: the weight of the air on each square metre is the surface pressure, so $M = p_0 L^2/g = \dfrac{101\,325}{9.807}\,(${L}\,000)^2 \approx ${tex((101325 / 9.80665) * (L * 1e3) ** 2, 3)}$ kg. The real atmosphere is not isothermal, but the hydrostatic check holds for any temperature profile.`,
          visual: scene({ range: 3, parallelograms: [{ at: [0, 0, 0], u: [2, 0, 0], v: [0, 2, 0], color: 'accent', alpha: 0.3 }, ...layers], segments: [[0, 0], [2, 0], [2, 2], [0, 2]].map(([x, y]) => ({ from: [x, y, 0], to: [x, y, 3], color: 'ink3', dash: true })), points: [{ at: [2, 2, 3], color: 'teal', r: 0.01, label: '\\rho = \\rho_0 e^{-z/H}' }] }, t`The column of air above the square, its shading thinning with height as $e^{-z/H}$. Not to scale.`),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §5.4 Triple integrals', url: 'https://openstax.org/books/calculus-volume-3/pages/5-4-triple-integrals' },
    { label: 'U.S. Standard Atmosphere, 1976 (NASA-TM-X-74335)', url: 'https://ntrs.nasa.gov/citations/19770009539' },
  ],
});
