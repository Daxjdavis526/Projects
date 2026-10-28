// The determinant as signed area and volume: the factor by which a linear map
// scales every area, with a sign for orientation; in 3D the volume of a box,
// the cross product as a determinant, and the Jacobian of a curved map.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { det2, det3, norm, matTeX, tupleTeX, map2d } from './_la.js';
import { detPic, box3 } from './_eig.js';

const t = String.raw;
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const ORD = ['x', 'y', 'z'];

// a 2×2 integer matrix with every entry nonzero-ish and a modest determinant
function mat2(r, { lo = -3, hi = 4, maxDet = 12, sign = 0 } = {}) {
  for (let k = 0; k < 500; k++) {
    const A = [[r.int(lo, hi), r.int(lo, hi)], [r.int(lo, hi), r.int(lo, hi)]], d = det2(A);
    if (d === 0 || Math.abs(d) > maxDet || A.flat().filter((v) => v !== 0).length < 3) continue;
    if (sign && Math.sign(d) !== sign) continue;
    return A;
  }
  return [[3, 1], [1, 2]];
}
const colsOf = (A) => [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];

export default lesson({
  id: 'math2270.LA-8.1',
  title: 'The determinant as signed volume',
  minutes: 11, difficulty: 2,
  intro: t`A $2\times2$ matrix sends the unit square to the parallelogram spanned by its columns — and, because the map is linear, it stretches **every** region's area by that same factor. That factor, with a sign, is the **determinant**:
$$\det\begin{bmatrix} a & b \\ c & d \end{bmatrix} = ad - bc, \qquad \text{area}\big(A(S)\big) = |\det A|\;\text{area}(S)$$
The **sign** records orientation: positive if the map keeps the turn from the first column to the second counterclockwise, negative if it flips the plane over like a mirror; zero if it squashes the plane flat (no inverse). In three dimensions $\det[\mathbf u\ \mathbf v\ \mathbf w] = \mathbf u\cdot(\mathbf v\times\mathbf w)$ is the signed **volume** of the box on the three columns, and the cross product is itself a determinant. A curved map stretches each tiny cell by the determinant of its derivative matrix — the **Jacobian** of [change of variables](#/lesson/math2210.C3-4.6) — and $\det(AB) = \det A\,\det B$ because scale factors of maps done in turn multiply.`,
  symbols: [
    { tex: 'A', text: t`a square matrix, here $2\times2$ with entries $a, b$ (top row) and $c, d$ (bottom row)` },
    { tex: t`(a, c),\ (b, d)`, text: t`the columns of $A$: where the map sends $\mathbf e_1$ and $\mathbf e_2$, and the sides of the parallelogram` },
    { tex: t`\det A`, text: t`the determinant: a single number, the signed area of that parallelogram (signed volume in 3D)` },
    { tex: 'S', text: t`any region of the plane, with its area — a square, a disc, a wing planform` },
    { tex: t`A(S)`, text: t`the image of $S$: every point $\mathbf x$ of $S$ moved to $A\mathbf x$` },
    { tex: t`|\det A|`, text: t`the area-scaling factor (dimensionless): the same for every region` },
  ],
  why: 'Jacobians in multiple integrals, the volume element √|g| d⁴x of general relativity, the test for whether a system can be solved, and the eigenvalue equation det(A − λI) = 0 are all this one number.',
  visual: {
    type: 'la-det',
    title: 'Area with a sign',
    lead: t`Drag the tips of the columns $\mathbf a_1$ (green) and $\mathbf a_2$ (orange). The parallelogram they span has area $|\det A|$; it is blue when $\det A > 0$ and red when $\det A < 0$. The gold arrow turns from $\mathbf a_1$ to $\mathbf a_2$ the short way round: counterclockwise is positive.`,
    tasks: [
      'Drag a₂ across the line of a₁: the parallelogram flattens (det = 0), then comes back red, with the turning arrow reversed.',
      'Make the columns (2, 0) and (0, 3): a 2 × 3 rectangle, det = 6 — count the grid squares.',
      'Slide the tip of a₂ parallel to a₁, from (1, 2) to (4, 3): a shear, and the area stays 5.',
    ],
    params: { cols: [[3, 1], [1, 2]], drag: true, snap: 0.5, label: true, view: 3.4, center: [1.5, 1.4], readout: true },
    caption: 'The columns span the parallelogram; its signed area is det A. Tips snap to half-units. The grid squares have area 1.',
  },
  example: {
    prompt: t`Let $A = ${matTeX([[3, 1], [1, 2]])}$. Find $\det A$, the area of the image of the unit square and of a disc of radius 2, and what happens if the columns are swapped.`,
    visual: detPic([[3, 1], [1, 2]], { proof: true, label: true, view: 2.2, center: [2, 1.5], caption: 'The parallelogram (blue) inside the 4 × 3 box. The six tinted pieces — two triangles of area 3/2, two of area 1, two unit rectangles — fill the rest, so the parallelogram has area 12 − 7 = 5.' }),
    steps: [
      { label: 'Determinant', text: t`$\det A = ad - bc = 3\cdot2 - 1\cdot1 = 5$.` },
      { label: 'Why ad − bc', text: t`The columns $(3, 1)$ and $(1, 2)$ sit in a $4\times3$ box of area 12. Cutting away two triangles of area $\tfrac{ac}{2} = \tfrac32$, two of area $\tfrac{bd}{2} = 1$ and two rectangles of area $bc = 1$ leaves $12 - 3 - 2 - 2 = 5$. In letters: $(a + b)(c + d) - ac - bd - 2bc = ad - bc$.` },
      { label: 'Any region', text: t`The unit square goes to the parallelogram, area 5. A disc of radius 2 (area $4\pi$) goes to an ellipse of area $5\times4\pi = 20\pi \approx 62.8$: the map scales every area by the same factor.` },
      { label: 'Orientation', text: t`$\det A > 0$: turning from $\mathbf a_1 = (3, 1)$ to $\mathbf a_2 = (1, 2)$ is counterclockwise, as from $\mathbf e_1$ to $\mathbf e_2$. Swapping the columns gives $1\cdot1 - 3\cdot2 = -5$: the same area, but the map now includes a reflection.` },
      { label: 'Sense check', text: t`$\det I = 1$ (nothing changes), and a column of zeros, or two parallel columns, gives 0 — a flat parallelogram. ✓` },
    ],
    answer: t`$\det A = 5$: the unit square maps to area 5, the disc to area $20\pi$; swapping the columns gives $-5$.`,
  },
  practice: [
    num({
      id: 'det2', difficulty: 1,
      gen(r) {
        const A = mat2(r), [[a, b], [c, d]] = A, D = det2(A);
        const errors = [];
        if (a * d + b * c !== D && a * d + b * c !== -D) errors.push({ value: a * d + b * c, feedback: t`The two products are *subtracted*: $ad - bc$.` });
        if (a * c - b * d !== D && a * c - b * d !== -D && !errors.some((e) => e.value === a * c - b * d)) errors.push({ value: a * c - b * d, feedback: t`Multiply along the diagonals, $a\cdot d$ and $b\cdot c$, not down the columns.` });
        return {
          prompt: t`Find $\det${matTeX(A)}$.`,
          answer: D, tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`$\det\begin{bmatrix} a & b \\ c & d \end{bmatrix} = ad - bc$: main diagonal minus the other diagonal.`],
          teach: t`A $2\times2$ determinant is the main-diagonal product minus the off-diagonal product.`,
          explain: t`$(${a})(${d}) - (${b})(${c}) = ${D}$. The parallelogram on the columns $(${a}, ${c})$ and $(${b}, ${d})$ has area $${Math.abs(D)}$, and the sign says the turn from the first column to the second is ${D > 0 ? 'counterclockwise' : 'clockwise'}.`,
          visual: detPic(colsOf(A), { tint: false, caption: 'The parallelogram spanned by the two columns of the matrix (colour not tied to the sign here). Grid squares have area 1.' }),
        };
      },
    }),
    mcq({
      id: 'read-map', difficulty: 2,
      gen(r) {
        let A = [[2, 1], [1, -1]], D = -3, wrong = 1;
        for (let k = 0; k < 500; k++) {
          A = mat2(r, { lo: -2, hi: 2, maxDet: 4 });
          D = det2(A); wrong = Math.abs(A[0][0] * A[1][1] + A[0][1] * A[1][0]);
          if (Math.abs(D) >= 2 && wrong !== Math.abs(D) && wrong !== 0) break;
        }
        const keep = D > 0 ? 'keeps orientation' : 'flips orientation', flip = D > 0 ? 'flips orientation' : 'keeps orientation';
        return {
          prompt: t`The picture shows what $A = ${matTeX(A)}$ does to the plane. By what factor does it scale areas, and does it keep or flip orientation?`,
          choices: [t`Areas $\times ${Math.abs(D)}$; it ${keep}`, t`Areas $\times ${Math.abs(D)}$; it ${flip}`, t`Areas $\times ${wrong}$; it ${keep}`, t`Areas $\times ${wrong}$; it ${flip}`],
          answer: 0,
          why: {
            1: t`Look at the F: ${D > 0 ? 'it can be turned back into the original without lifting it off the page' : 'it reads backwards, like a mirror image'}. The sign of $\det A = ${D}$ says the same.`,
            2: t`$${wrong}$ is $|ad + bc|$ — the products must be subtracted: $|ad - bc| = ${Math.abs(D)}$.`,
            3: t`Both parts are off: the factor is $|ad - bc| = ${Math.abs(D)}$, and the sign of $${D}$ ${D > 0 ? 'means no flip' : 'means a flip'}.`,
          },
          hints: ['The gold parallelogram is the image of the unit square: its area is the scale factor.', t`Compute $ad - bc$; a negative value means the F comes out mirrored.`],
          teach: 'The size of det A is the area factor and its sign says whether the map includes a reflection.',
          explain: t`$\det A = ${D}$: areas scale by $${Math.abs(D)}$ and the map ${D > 0 ? 'keeps orientation (no reflection)' : 'reverses orientation — the F is mirrored'}.`,
          visual: map2d(A, { view: 2.6, shape: 'F', colNames: ['Ae₁', 'Ae₂'], caption: 'Faint: the unit square and the F before the map. Bold: after it. The gold outline is the image of the unit square.' }),
        };
      },
    }),
    num({
      id: 'area-scale', difficulty: 2,
      gen(r) {
        const A = mat2(r, { lo: -2, hi: 3, maxDet: 8 }), D = det2(A), R = r.pick([1, 2, 3]);
        const ans = Math.PI * R * R * Math.abs(D);
        return {
          prompt: t`The map $A = ${matTeX(A)}$ is applied to a disc of radius $${R}$ centred at the origin. The image is an ellipse. What is its area?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.PI * R * R / Math.abs(D), feedback: t`The map multiplies areas by $|\det A|$; you divided.` }, { value: Math.PI * R * Math.abs(D), feedback: t`The disc's area is $\pi R^2$, not $\pi R$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`area of image $= |\det A|\times$ area of disc.`, t`$\det A = ${D}$ and the disc has area $\pi\cdot${R}^2$.`],
          teach: 'A linear map scales the area of every region, curved or not, by |det A|.',
          explain: t`$|\det A|\,\pi R^2 = ${Math.abs(D)}\times${R * R}\pi = ${Math.abs(D) * R * R}\pi \approx ${nice(ans)}$. No integral is needed: the factor is the same for every little piece of the disc.`,
          visual: map2d(A, { shape: 'circle', view: Math.max(2.4, R * 1.1 * Math.max(Math.hypot(A[0][0], A[1][0]), Math.hypot(A[0][1], A[1][1]))), columns: false, caption: 'The unit circle (faint) and its image under A (bold) — an ellipse. A circle of radius R scales the same way, R times larger.' }),
        };
      },
    }),
    num({
      id: 'volume', difficulty: 2,
      gen(r) {
        let u = [2, 0, 0], v = [1, 2, 0], w = [0, 1, 2], D = 8;
        for (let k = 0; k < 500; k++) {
          u = [r.int(1, 3), r.int(-1, 1), 0]; v = [r.int(-1, 1), r.int(1, 3), r.int(-1, 1)]; w = [r.int(-1, 1), r.int(-1, 1), r.int(1, 3)];
          D = det3([u, v, w]);
          const prod = norm(u) * norm(v) * norm(w);
          if (D !== 0 && Math.abs(prod - Math.abs(D)) > 0.05) break;
        }
        const prod = norm(u) * norm(v) * norm(w);
        return {
          prompt: t`A parallelepiped has edges $\mathbf u = ${tupleTeX(u)}$, $\mathbf v = ${tupleTeX(v)}$ and $\mathbf w = ${tupleTeX(w)}$ (in metres) from one corner. What is its volume?`,
          answer: Math.abs(D), units: 'm^3', tol: { rel: 0.001, abs: 0.01 },
          errors: [{ value: prod, feedback: t`$|\mathbf u||\mathbf v||\mathbf w|$ is the volume of a *rectangular* box. These edges are not perpendicular, so use the determinant.` }],
          hints: [t`Volume $= |\det[\mathbf u\ \mathbf v\ \mathbf w]| = |\mathbf u\cdot(\mathbf v\times\mathbf w)|$.`, t`$\mathbf v\times\mathbf w = ${tupleTeX(cross(v, w))}$; now dot it with $\mathbf u$.`],
          teach: 'The volume of the box on three edge vectors is the absolute value of their 3×3 determinant.',
          explain: t`$\mathbf v\times\mathbf w = ${tupleTeX(cross(v, w))}$ and $\mathbf u\cdot(\mathbf v\times\mathbf w) = ${D}$, so the volume is $${Math.abs(D)}\ \text{m}^3$. ${D < 0 ? 'The negative sign says the three edges form a left-handed set.' : 'The positive sign says the edges are right-handed, like x, y, z.'}`,
          visual: box3(u, v, w),
        };
      },
    }),
    num({
      id: 'cross-comp', difficulty: 2,
      gen(r) {
        const a = [r.intExcept(-3, 3, [0]), r.int(-3, 3), r.int(-3, 3)], b = [r.int(-3, 3), r.intExcept(-3, 3, [0]), r.int(-3, 3)];
        let k = r.int(0, 2), c = cross(a, b);
        if (c[k] === 0) k = c.findIndex((x) => x !== 0);
        if (k < 0) { a[2] = 1; b[0] = 2; c = cross(a, b); k = c.findIndex((x) => x !== 0); }
        const [i, j] = [[1, 2], [2, 0], [0, 1]][k];
        const plus = a[i] * b[j] + a[j] * b[i];
        return {
          prompt: t`Write $\mathbf a\times\mathbf b$ as the determinant $\det\begin{bmatrix} \mathbf i & \mathbf j & \mathbf k \\ a_x & a_y & a_z \\ b_x & b_y & b_z \end{bmatrix}$ with $\mathbf a = ${tupleTeX(a)}$, $\mathbf b = ${tupleTeX(b)}$. Find its ${ORD[k]}-component.`,
          answer: c[k], tol: { rel: 0, abs: 0.01 },
          errors: plus !== c[k] && plus !== -c[k] ? [{ value: plus, feedback: t`Each component is a $2\times2$ determinant: a difference of two products, not a sum.` }] : [],
          hints: [t`Expanding along the top row, the coefficient of $${['\\mathbf i', '\\mathbf j', '\\mathbf k'][k]}$ is the $2\times2$ determinant left when you delete its row and column${k === 1 ? ' — with a minus sign in front' : ''}.`, t`It works out to $a_${ORD[i]}b_${ORD[j]} - a_${ORD[j]}b_${ORD[i]}$.`],
          teach: 'Each component of a cross product is a 2×2 determinant — the signed area of the parallelogram projected onto a coordinate plane.',
          explain: t`$(\mathbf a\times\mathbf b)_${ORD[k]} = a_${ORD[i]}b_${ORD[j]} - a_${ORD[j]}b_${ORD[i]} = (${a[i]})(${b[j]}) - (${a[j]})(${b[i]}) = ${c[k]}$. In full, $\mathbf a\times\mathbf b = ${tupleTeX(c)}$: its length is the area of the parallelogram on $\mathbf a$ and $\mathbf b$, and each component is the signed area of that parallelogram's shadow on one coordinate plane.`,
          visual: { type: 'calc-vectors3d', params: { range: 4, vectors: [{ to: a, color: 'good', label: t`\mathbf a` }, { to: b, color: 'warn', label: t`\mathbf b` }], parallelograms: [{ at: [0, 0, 0], u: a, v: b, color: 'accent', alpha: 0.25 }] }, caption: 'The vectors a and b and the parallelogram they span. Drag to rotate.' },
        };
      },
    }),
    num({
      id: 'det-product', difficulty: 3,
      gen(r) {
        const n = r.pick([2, 3]), c = r.pick([2, 3, -2]), dA = r.intExcept(-5, 6, [0, 1]), dB = r.pick([-2, 2, 4, -1]);
        const ans = c ** n * dA / dB;
        const errors = [{ value: c * dA / dB, feedback: t`$\det(cA) = c^n\det A$, not $c\det A$: every one of the $n$ columns is multiplied by $c$.` }, { value: c ** n * dA * dB, feedback: t`$\det(B^{-1}) = 1/\det B$: undoing a map divides areas by its factor.` }];
        return {
          prompt: t`$A$ and $B$ are $${n}\times${n}$ matrices with $\det A = ${dA}$ and $\det B = ${dB}$. Find $\det\!\big(${c}\,A\,B^{-1}\big)$.`,
          answer: ans, tol: { rel: 1e-6, abs: 1e-6 }, errors: errors.filter((e) => Math.abs(e.value - ans) > 1e-9),
          hints: [t`Use $\det(XY) = \det X\,\det Y$ and $\det(B^{-1}) = 1/\det B$.`, t`$${c}A$ multiplies each of the $${n}$ columns of $A$ by $${c}$, so $\det(${c}A) = (${c})^{${n}}\det A$.`],
          teach: 'Scale factors of maps multiply, an inverse divides, and multiplying an n×n matrix by c multiplies its determinant by cⁿ.',
          explain: t`$\det(${c}AB^{-1}) = (${c})^{${n}}\cdot\det A\cdot\dfrac{1}{\det B} = ${c ** n}\cdot${dA}\cdot\dfrac{1}{${dB}} = ${nice(ans)}$. Geometrically, scaling by $${c}$ in ${n} dimensions multiplies ${n === 2 ? 'areas' : 'volumes'} by $|${c}|^{${n}}$ — doubling a cube's sides gives 8 times the volume.`,
          visual: detPic([[2, 0], [0, 2]], { ghost: [[1, 0], [0, 1]], ghostNames: ['e₁', 'e₂'], names: ['2e₁', '2e₂'], label: true, readout: false, view: 1.6, center: [1, 1], caption: 'In the plane, 2I doubles both columns: the unit square (dashed) becomes a 2 × 2 square, area 4 = 2².' }),
        };
      },
    }),
    num({
      id: 'jacobian', difficulty: 2,
      gen(r) {
        const [u0, v0] = r.pick([[1, 0.5], [0.5, 1], [1, 1], [1.5, 0.5], [0.5, 1.5], [1.2, 0.4]]);
        const J = 4 * (u0 * u0 + v0 * v0);
        return {
          prompt: t`The map $x = u^2 - v^2$, $y = 2uv$ bends the $(u, v)$ plane. Near $(u, v) = (${u0}, ${v0})$ it acts like the linear map given by its derivative matrix $\begin{bmatrix} x_u & x_v \\ y_u & y_v \end{bmatrix}$. By what factor does it scale the area of a tiny square there?`,
          answer: J, tol: { rel: 0.002 },
          errors: [{ value: J / 2, feedback: t`Check each partial derivative: $x_u = 2u$, $x_v = -2v$, $y_u = 2v$, $y_v = 2u$ — every entry carries a factor 2.` }, { value: 4 * (u0 * u0 - v0 * v0), feedback: t`$x_v y_u = (-2v)(2v) = -4v^2$, and it is *subtracted*: $4u^2 - (-4v^2) = 4u^2 + 4v^2$.` }],
          hints: [t`The derivative matrix is $\begin{bmatrix} 2u & -2v \\ 2v & 2u \end{bmatrix}$.`, t`Its determinant, the Jacobian $J = x_uy_v - x_vy_u$, is the local area factor.`],
          teach: 'A curved map scales tiny areas by the determinant of its derivative matrix — the Jacobian.',
          explain: t`$J = (2u)(2u) - (-2v)(2v) = 4(u^2 + v^2) = 4(${u0 * u0} + ${v0 * v0}) = ${nice(J)}$. Unlike a linear map's, this factor changes from point to point; that is why a change of variables puts $|J|$ inside the integral ([C3-4.6](#/lesson/math2210.C3-4.6)).`,
          visual: { type: 'c3-jacobian', params: { maps: [{ label: 'Squaring', x: 'u^2 - v^2', y: '2*u*v', u: [0.2, 1.6], v: [0.2, 1.6], uName: 'u', vName: 'v', uTeX: 'u', vTeX: 'v', Jtex: '4(u^2 + v^2)', view: { x: [-2.6, 2.6], y: [-0.2, 5.2] }, cell: [u0 - 0.06, v0 - 0.06] }], size: 0.1, sizeSlider: false, sliders: false, readout: false }, caption: 'The (u, v) grid (top) and its image (bottom): cells are stretched by different amounts in different places. The gold cell sits near the point in the question.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-det', difficulty: 2,
      gen(r) {
        const A = mat2(r, { lo: -4, hi: 5, maxDet: 20 }), D = det2(A);
        return {
          prompt: t`Find $\det${matTeX(A)}$.`,
          answer: D, tol: { rel: 0, abs: 0.01 },
          hints: ['ad − bc.'],
          teach: 'det = ad − bc.',
          explain: t`$(${A[0][0]})(${A[1][1]}) - (${A[0][1]})(${A[1][0]}) = ${D}$.`,
          visual: detPic(colsOf(A), { tint: false, caption: 'The parallelogram on the two columns. Grid squares have area 1.' }),
        };
      },
    }),
    num({
      id: 'cp-kepler', difficulty: 3, transfer: true,
      gen(r) {
        const rr = r.pick([[6000, 3000], [5000, 4500], [4000, 5500], [6500, 1500], [3000, 6000]]), v = r.pick([[-3.5, 6.5], [-5.2, 5.8], [-6.4, 4.1], [-2.0, 7.4], [-6.8, 3.0]]);
        const D = rr[0] * v[1] - rr[1] * v[0], ans = D / 2;
        return {
          prompt: t`A satellite is at $\mathbf r = (${rr[0]}, ${rr[1]})$ km from Earth's centre, moving at $\mathbf v = (${v[0]}, ${v[1]})$ km/s in the orbital plane. In a short time $dt$ the line from Earth to the satellite sweeps the thin triangle with sides $\mathbf r$ and $\mathbf v\,dt$. At what rate does it sweep area, $dA/dt$?`,
          answer: ans, units: 'km^2/s', tol: { rel: 0.002 },
          errors: [{ value: D, feedback: t`The determinant is the area of the *parallelogram* on $\mathbf r$ and $\mathbf v\,dt$; the swept region is the triangle, half of it.` }, { value: (rr[0] * v[0] + rr[1] * v[1]) / 2, feedback: 'That uses the dot product, which measures how much v points along r. Area needs the determinant (the cross product).' }],
          hints: [t`A triangle with sides $\mathbf r$ and $\mathbf v\,dt$ has area $\tfrac12|\det[\mathbf r\ \ \mathbf v\,dt]|$.`, t`So $\dfrac{dA}{dt} = \tfrac12(x v_y - y v_x)$.`],
          teach: 'The area swept per unit time is half the determinant of position and velocity — half the cross product r × v.',
          explain: t`$\tfrac12(x v_y - y v_x) = \tfrac12\big((${rr[0]})(${v[1]}) - (${rr[1]})(${v[0]})\big) = ${nice(ans)}$ km²/s. Kepler's second law says this rate is constant along the orbit: it is $L/2m$, half the angular momentum per unit mass, which gravity (a central force) cannot change. The positive sign means the satellite moves counterclockwise (prograde, seen from above).`,
          visual: detPic([rr.map((z) => z / 2000), v.map((z) => z / 2.5)], { names: ['r', 'v'], tint: false, arc: false, caption: 'Position r and velocity v (drawn to different scales) and the parallelogram they span; the swept triangle is half of it, per unit time.' }),
        };
      },
    }),
    mcq({
      id: 'cp-orient', difficulty: 2,
      prompt: t`A $2\times2$ matrix has $\det A = -1$. What does the map do?`,
      choices: [
        'It keeps every area the same but flips the plane over, like a mirror',
        'It shrinks every area by a factor of 1',
        'It has no inverse',
        'It rotates the plane by 180°',
      ],
      answer: 0,
      why: {
        1: t`A factor of $|{-1}| = 1$ means areas are unchanged; the sign carries the extra information.`,
        2: t`Only $\det A = 0$ means no inverse. Here $A^{-1}$ exists, with $\det A^{-1} = -1$.`,
        3: t`A half-turn is $-I$, whose determinant is $(-1)(-1) = +1$. Rotations never flip orientation.`,
      },
      hints: ['The size of det A is the area factor; the sign says whether the map includes a reflection.'],
      teach: 'A negative determinant means the map reverses orientation; its absolute value is still the area factor.',
      explain: t`$|\det A| = 1$: areas are kept. The minus sign: a counterclockwise turn becomes clockwise — a left hand becomes a right hand. A reflection such as $${matTeX([[1, 0], [0, -1]])}$ is the simplest example.`,
      visual: map2d([[1, 0], [0, -1]], { view: 1.8, caption: 'The reflection in the x-axis (det = −1): the F has the same area but reads backwards.' }),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §5.1 and §5.3', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC, Lecture 18: Properties of determinants', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
  ],
});
