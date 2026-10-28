// Cramer's rule and the adjugate formula for the inverse: solutions and
// inverses as ratios of determinants — and what that says about sensitivity.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { matvec, det2, det3, matTeX, colTeX, tupleTeX, lines2, planes3 } from './_la.js';
import { detPic, board, cofactor, minorMat } from './_eig.js';

const t = String.raw;
const DEG = Math.PI / 180;
const ORD = ['x', 'y', 'z'];
const replaceCol = (A, k, b) => A.map((row, i) => row.map((v, j) => (j === k ? b[i] : v)));
const colsOf = (A) => [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];

// a 2×2 system with integer solution and a small nonzero determinant
function sys2(r) {
  for (let k = 0; k < 500; k++) {
    const A = [[r.int(-2, 4), r.int(-2, 3)], [r.int(-2, 3), r.int(-2, 4)]], D = det2(A);
    if (D === 0 || Math.abs(D) > 9 || A.flat().filter((v) => v !== 0).length < 3) continue;
    const x = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
    if (x[0] === x[1]) continue;
    const b = matvec(A, x);
    if (b.some((v) => Math.abs(v) > 9) || b.every((v) => v === 0)) continue;
    return { A, x, b, D };
  }
  return { A: [[3, 2], [1, 4]], x: [1, 2], b: [7, 9], D: 10 };
}
// a 3×3 system with integer solution and a small determinant
function sys3(r) {
  for (let k = 0; k < 500; k++) {
    const A = [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(-2, 3))), D = det3(A);
    if (D === 0 || Math.abs(D) > 12 || A.flat().filter((v) => v === 0).length > 3) continue;
    const x = [r.intExcept(-2, 3, [0]), r.intExcept(-2, 3, [0]), r.intExcept(-2, 3, [0])];
    const b = matvec(A, x);
    if (b.some((v) => Math.abs(v) > 12)) continue;
    return { A, x, b, D };
  }
  return { A: [[1, 1, 0], [0, 2, 1], [1, 0, 3]], x: [1, 2, 1], b: [3, 5, 4], D: 7 };
}

export default lesson({
  id: 'math2270.LA-8.3',
  title: 'Cramer’s rule and inverses',
  minutes: 11, difficulty: 3,
  intro: t`When $\det A \ne 0$, the system $A\mathbf x = \mathbf b$ has exactly one solution, and each unknown is a ratio of two determinants:
$$x_i = \frac{\det A_i}{\det A}, \qquad A^{-1} = \frac{1}{\det A}\,\operatorname{adj}A = \frac{1}{\det A}\,C^{\mathsf T}$$
where $A_i$ is $A$ with its column $i$ replaced by $\mathbf b$. The reason is one line of geometry: $\mathbf b = x_1\mathbf a_1 + x_2\mathbf a_2$, and sliding $\mathbf b$ along $\mathbf a_2$ — a shear, which keeps area — turns the parallelogram $(\mathbf b, \mathbf a_2)$ into $(x_1\mathbf a_1, \mathbf a_2)$, whose area is $x_1$ times that of $(\mathbf a_1, \mathbf a_2)$. Solving $A\mathbf x = \mathbf e_j$ this way for each $j$ gives the inverse: the matrix of cofactors, transposed, divided by $\det A$. **Cramer's rule is a formula, not an algorithm**: for $n > 3$ elimination is far cheaper. Its value is what it shows — the solution depends smoothly on the data, and a small $\det A$ divides into everything, so a nearly singular system amplifies every error in $\mathbf b$.`,
  symbols: [
    { tex: t`A\mathbf x = \mathbf b`, text: t`a square system: $n$ equations in $n$ unknowns $x_1, \dots, x_n$` },
    { tex: t`A_i`, text: t`the matrix $A$ with column $i$ replaced by the right-hand side $\mathbf b$` },
    { tex: t`\det A`, text: t`the determinant of $A$; the rule needs it nonzero` },
    { tex: 'C', text: t`the cofactor matrix: entry $(i, j)$ is the cofactor $C_{ij} = (-1)^{i+j}M_{ij}$ (LA-8.2)` },
    { tex: t`\operatorname{adj}A = C^{\mathsf T}`, text: t`the **adjugate**: the cofactor matrix transposed, so $(A^{-1})_{ij} = C_{ji}/\det A$` },
  ],
  why: 'Whenever a measurement or a design depends on solving a linear system — a navigation fix, a circuit, a structure — Cramer’s rule shows exactly how the answer depends on the inputs, and why a tiny determinant means a fragile answer.',
  visual: {
    type: 'la-det',
    title: 'A solution as a ratio of areas',
    lead: t`The columns $\mathbf a_1 = (3, 1)$ and $\mathbf a_2 = (1, 2)$ of $A$ span the blue parallelogram (area $\det A = 5$). The gold arrow is $\mathbf b$, set by the sliders. The orange parallelogram is $(\mathbf b, \mathbf a_2)$ — the columns of $A_1$; slide its corner $\mathbf b$ along $\mathbf a_2$ (dotted) and it becomes the dashed $(x_1\mathbf a_1, \mathbf a_2)$ without changing area. So $x_1 = \det A_1/\det A$.`,
    tasks: [
      'Start: b = (5, 5). The orange area is 5, so x₁ = 5/5 = 1 — and indeed b = 1·a₁ + 2·a₂.',
      'Move b by a₂ (b₁ up 1, b₂ up 2): the orange parallelogram shears but keeps its area; x₁ does not change.',
      'Put b on the line of a₂, at (2, 4): the orange parallelogram is flat, so x₁ = 0.',
    ],
    params: {
      cols: [[3, 1], [1, 2]], b: ['b1', 'b2'], cramer: 1, view: 3.6, center: [2.2, 2.6],
      sliders: [
        { key: 'b1', label: t`$b_1$`, min: -2, max: 7, step: 0.5, value: 5, explain: t`First component of the right-hand side $\mathbf b$.` },
        { key: 'b2', label: t`$b_2$`, min: -2, max: 7, step: 0.5, value: 5, explain: t`Second component of $\mathbf b$.` },
      ],
      readout: ['det', 'cramer'],
    },
    caption: 'Blue: the columns of A. Orange: column 1 replaced by b. Dashed: the same area after sliding b along a₂ onto x₁a₁. The ratio of the two areas is x₁.',
  },
  example: {
    prompt: t`Solve $3x + 2y = 7$, $x + 4y = 9$ by Cramer's rule.`,
    visual: detPic([[3, 1], [2, 4]], { b: [7, 9], cramer: 2, view: 5.2, center: [3.5, 4.5], names: ['a₁', 'a₂'], caption: 'Column 2 replaced by b (orange) has twice the area of A’s own parallelogram (blue): y = 2. Sliding b along a₁ onto 2a₂ (dashed) shows why.' }),
    steps: [
      { label: 'Determinant', text: t`$A = ${matTeX([[3, 2], [1, 4]])}$, $\det A = 12 - 2 = 10 \ne 0$: one solution.` },
      { label: 'First unknown', text: t`Replace column 1 by $\mathbf b = (7, 9)$: $\det A_1 = \det${matTeX([[7, 2], [9, 4]])} = 28 - 18 = 10$, so $x = 10/10 = 1$.` },
      { label: 'Second unknown', text: t`Replace column 2: $\det A_2 = \det${matTeX([[3, 7], [1, 9]])} = 27 - 7 = 20$, so $y = 20/10 = 2$.` },
      { label: 'Check', text: t`$3(1) + 2(2) = 7$ and $1 + 4(2) = 9$. ✓` },
      { label: 'Cost', text: t`Three $2\times2$ determinants. For $n$ unknowns Cramer needs $n + 1$ determinants of size $n$ — fine for 2 or 3, hopeless beside elimination for 20.` },
    ],
    answer: t`$x = 1$, $y = 2$.`,
  },
  practice: [
    num({
      id: 'cramer2', difficulty: 1,
      gen(r) {
        const { A, x, b, D } = sys2(r), k = r.int(0, 1), Dk = det2(replaceCol(A, k, b));
        const errors = Dk !== 0 && Math.abs(D / Dk - x[k]) > 1e-9 ? [{ value: D / Dk, feedback: t`The fraction is upside down: $x_${k + 1} = \det A_${k + 1}/\det A$.` }] : [];
        const other = det2(replaceCol(A, 1 - k, b)) / D;
        if (Math.abs(other - x[k]) > 1e-9) errors.push({ value: other, feedback: t`That is the other unknown: for $${ORD[k]}$, replace column ${k + 1}.` });
        return {
          prompt: t`Use Cramer's rule to find $${ORD[k]}$: $\;${A[0][0]}x + (${A[0][1]})y = ${b[0]}$, $\;${A[1][0]}x + (${A[1][1]})y = ${b[1]}$.`,
          answer: x[k], tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`$\det A = ${D}$. Replace column ${k + 1} of $A$ by $\mathbf b = ${tupleTeX(b)}$.`, t`$${ORD[k]} = \det A_${k + 1}/\det A = ${Dk}/${D < 0 ? `(${D})` : D}$.`],
          teach: t`Cramer: replace the unknown's column by $\mathbf b$, take the determinant, divide by $\det A$.`,
          explain: t`$\det A_${k + 1} = ${Dk}$, so $${ORD[k]} = ${Dk}/${D < 0 ? `(${D})` : D} = ${x[k]}$. The solution is $(x, y) = ${tupleTeX(x)}$.`,
          visual: detPic(colsOf(A), { b, cramer: k + 1, caption: `Blue: the columns of A. Orange: A with column ${k + 1} replaced by b. The ratio of their signed areas is the unknown.` }),
        };
      },
    }),
    mcq({
      id: 'det-zero', difficulty: 2,
      prompt: t`For the system $x + 2y = 3$, $2x + 4y = 8$: $\det A = 0$ and $\det A_1 = \det${matTeX([[3, 2], [8, 4]])} = -4$. What can you conclude?`,
      choices: ['There is no solution', t`Exactly one solution, with $x = -4/0$, which is infinite`, 'Infinitely many solutions', t`$x = 0$`],
      answer: 0,
      why: {
        1: t`Division by zero is not a solution: Cramer's rule needs $\det A \ne 0$. Here the rule's premise fails, and $x\det A = \det A_1$ reads $0 = -4$.`,
        2: t`That would need $\det A_1 = \det A_2 = 0$ too (the equations then describe one line). Here $\det A_1 \ne 0$.`,
        3: t`$x = 0$ would make $\det A_1$ equal $x\det A = 0$, not $-4$.`,
      },
      hints: [t`For any solution, the shear argument gives $x\det A = \det A_1$.`, 'Draw the two lines: what does det A = 0 say about their slopes?'],
      teach: t`$\det A = 0$ means no unique solution; if some $\det A_i \ne 0$ as well, there is none at all.`,
      explain: t`Any solution would satisfy $x\cdot\det A = \det A_1$, i.e. $0 = -4$ — impossible. Geometrically the lines $x + 2y = 3$ and $x + 2y = 4$ are parallel and never meet.`,
      visual: lines2([[1, 2, 3], [2, 4, 8]], { x: [-4, 6], y: [-2.5, 3.5], caption: 'The two equations as lines: parallel, so there is no common point.' }),
    }),
    num({
      id: 'cramer3', difficulty: 2,
      gen(r) {
        const { A, x, b, D } = sys3(r), k = r.int(0, 2), Dk = det3(replaceCol(A, k, b));
        return {
          prompt: t`Use Cramer's rule to find $${ORD[k]}$ for $${matTeX(A)}\begin{bmatrix} x \\ y \\ z \end{bmatrix} = ${colTeX(b)}$.`,
          answer: x[k], tol: { rel: 0, abs: 0.01 },
          errors: Dk !== 0 && Math.abs(D / Dk - x[k]) > 1e-9 ? [{ value: D / Dk, feedback: t`The fraction is upside down: $\det A_${k + 1}$ goes on top.` }] : [],
          hints: [t`$\det A = ${D}$ (expand along any row).`, t`Replace column ${k + 1} by $\mathbf b$: $\det A_${k + 1} = \det${matTeX(replaceCol(A, k, b))}$.`],
          teach: 'Cramer’s rule works the same way in three dimensions: a ratio of two 3×3 determinants, two signed volumes.',
          explain: t`$\det A_${k + 1} = ${Dk}$ and $\det A = ${D}$, so $${ORD[k]} = ${Dk}/${D < 0 ? `(${D})` : D} = ${x[k]}$. (The full solution is $${tupleTeX(x)}$.)`,
          visual: planes3(A.map((row, i) => [...row, b[i]]), { centre: x, caption: 'Each equation is a plane (a patch of each is drawn). The solution is the one point all three share. Drag to rotate.' }),
        };
      },
    }),
    num({
      id: 'adj-entry', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 400; k++) {
          const A = [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(-2, 3))), D = det3(A);
          if (!(D === 1 || D === -1 || D === 2 || D === -2)) continue;
          const [i, j] = r.pick([[0, 1], [1, 0], [0, 2], [2, 0], [1, 2], [2, 1]]);
          const ans = cofactor(A, j, i) / D, wrong = cofactor(A, i, j) / D;
          if (ans === 0 || Math.abs(ans - wrong) < 1e-9) continue;
          return {
            prompt: t`For $A = ${matTeX(A)}$ (with $\det A = ${D}$), find the entry in row ${i + 1}, column ${j + 1} of $A^{-1}$.`,
            answer: ans, tol: { rel: 1e-6, abs: 1e-6 },
            errors: [{ value: wrong, feedback: t`That is $C_{${i + 1}${j + 1}}/\det A$. The adjugate is the cofactor matrix *transposed*: $(A^{-1})_{${i + 1}${j + 1}} = C_{${j + 1}${i + 1}}/\det A$.` }],
            hints: [t`$(A^{-1})_{${i + 1}${j + 1}} = C_{${j + 1}${i + 1}}/\det A$ — note the swapped indices.`, t`$C_{${j + 1}${i + 1}}$: delete row ${j + 1} and column ${i + 1}, take the $2\times2$ determinant, and attach the sign $(-1)^{${i + j + 2}}$.`],
            teach: t`Entry $(i, j)$ of $A^{-1}$ is the cofactor $C_{ji}$ — transposed indices — over $\det A$.`,
            explain: t`$C_{${j + 1}${i + 1}} = (-1)^{${i + j + 2}}\det${matTeX(minorMat(A, j, i))} = ${cofactor(A, j, i)}$, so $(A^{-1})_{${i + 1}${j + 1}} = ${cofactor(A, j, i)}/${D < 0 ? `(${D})` : D} = ${nice(ans)}$.`,
            visual: board(A, { cross: [j, i], signs: true, caption: `Row ${j + 1} and column ${i + 1} shaded — note the swap: they give the cofactor that lands in row ${i + 1}, column ${j + 1} of the inverse.` }),
          };
        }
        return { prompt: t`For $A = ${matTeX([[1, 1, 0], [0, 1, 1], [0, 0, 1]])}$, find $(A^{-1})_{13}$.`, answer: 1, hints: [t`$(A^{-1})_{13} = C_{31}/\det A$.`, t`$C_{31} = \det${matTeX([[1, 0], [1, 1]])} = 1$.`], teach: 'Transposed cofactors over det A.', explain: t`$C_{31} = 1$ and $\det A = 1$.` };
      },
    }),
    mcq({
      id: 'why-transpose', difficulty: 3,
      prompt: t`Why is $A\,C^{\mathsf T} = (\det A)\,I$ — with the cofactor matrix **transposed**?`,
      choices: [
        t`Entry $(i, j)$ of $AC^{\mathsf T}$ is row $i$ of $A$ against the cofactors of row $j$: that is $\det A$ when $i = j$, and the determinant of a matrix with two equal rows — zero — when $i \ne j$`,
        t`Because the cofactor matrix $C$ is always symmetric`,
        t`Because $\det A^{\mathsf T} = \det A$`,
        t`It is a convention; $AC$ would work equally well`,
      ],
      answer: 0,
      why: {
        1: t`$C$ is not symmetric in general (try any non-symmetric $2\times2$: $C = \begin{bmatrix} d & -c \\ -b & a \end{bmatrix}$).`,
        2: t`True, but it is not what makes the product diagonal.`,
        3: t`$AC$ pairs row $i$ of $A$ with *column* $j$ of $C$ — cofactors from different rows mixed together, which add up to nothing useful.`,
      },
      hints: [t`Cofactor expansion along row $i$: $\sum_k a_{ik}C_{ik} = \det A$.`, t`Now use row $i$'s entries with row $j$'s cofactors: that expands the determinant of $A$ with row $j$ replaced by row $i$.`],
      teach: 'Expanding with the “wrong” row’s cofactors computes a determinant with two equal rows, which is zero — that is why the adjugate is a transpose.',
      explain: t`$(AC^{\mathsf T})_{ij} = \sum_k a_{ik}C_{jk}$. For $i = j$ this is the cofactor expansion of $\det A$ along row $i$. For $i \ne j$ it expands the matrix whose row $j$ has been overwritten by row $i$ — two equal rows, determinant 0. So $AC^{\mathsf T} = (\det A)I$ and $A^{-1} = C^{\mathsf T}/\det A$.`,
      visual: board([[1, 2, 0], [3, 1, 2], [0, 4, 1]], { signs: true, ring: [[1, 0], [1, 1], [1, 2]], caption: 'Row 2 ringed: multiplying its entries by their own cofactors gives det A; by row 1’s or row 3’s cofactors, 0.' }),
    }),
    num({
      id: 'circuit', difficulty: 2,
      gen(r) {
        const E1 = r.pick([9, 12, 24]), E2 = r.pick([3, 6, 9]), R1 = r.pick([2, 3, 4]), R2 = r.pick([2, 4, 6]), R3 = r.pick([3, 6, 8]);
        const A = [[R1 + R3, -R3], [-R3, R2 + R3]], b = [E1, -E2], D = det2(A);
        const I = [det2(replaceCol(A, 0, b)) / D, det2(replaceCol(A, 1, b)) / D], k = r.int(0, 1);
        return {
          prompt: t`In the two-loop circuit, with loop currents $I_1$ (left loop) and $I_2$ (right loop) both taken clockwise, Kirchhoff's loop rule gives
$$${R1 + R3}I_1 - ${R3}I_2 = ${E1}, \qquad -${R3}I_1 + ${R2 + R3}I_2 = -${E2}$$
(resistances in Ω, emfs in V). Use Cramer's rule to find $I_${k + 1}$.`,
          answer: I[k], units: 'A', tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: I[1 - k], feedback: t`That is $I_${2 - k}$: for $I_${k + 1}$, replace column ${k + 1}.` }].filter((e) => Math.abs(e.value - I[k]) > 0.01),
          hints: [t`$\det A = (${R1 + R3})(${R2 + R3}) - (-${R3})(-${R3}) = ${D}$.`, t`Replace column ${k + 1} by $(${E1}, -${E2})$ and take the determinant.`],
          teach: 'Mesh analysis turns a circuit into a small linear system; Cramer’s rule gives each loop current as a ratio of determinants.',
          explain: t`$\det A_${k + 1} = ${nice(det2(replaceCol(A, k, b)))}$, so $I_${k + 1} = ${nice(det2(replaceCol(A, k, b)))}/${D} = ${nice(I[k])}$ A. ${I[k] < 0 ? 'The minus sign means that loop current actually flows counterclockwise.' : ''} The current through the middle resistor is $I_1 - I_2 = ${nice(I[0] - I[1])}$ A.`,
          visual: { type: 'em-circuit', params: { circuit: 'twoloop', values: { E1, E2, R1, R2, R3 }, show: { names: true, values: true }, readout: false, flow: false }, caption: 'The two-loop circuit (no currents shown). Batteries: + at the top. The loop currents I₁ and I₂ circulate clockwise in the left and right loops.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cramer', difficulty: 2,
      gen(r) {
        const { A, x, b, D } = sys2(r), k = r.int(0, 1);
        return {
          prompt: t`Use Cramer's rule to find $${ORD[k]}$: $\;${A[0][0]}x + (${A[0][1]})y = ${b[0]}$, $\;${A[1][0]}x + (${A[1][1]})y = ${b[1]}$.`,
          answer: x[k], tol: { rel: 0, abs: 0.01 },
          hints: [t`$\det A = ${D}$.`],
          teach: t`$x_i = \det A_i/\det A$.`,
          explain: t`$${ORD[k]} = ${det2(replaceCol(A, k, b))}/${D < 0 ? `(${D})` : D} = ${x[k]}$.`,
          visual: detPic(colsOf(A), { b, cramer: k + 1 }),
        };
      },
    }),
    num({
      id: 'cp-dop', difficulty: 3, transfer: true,
      gen(r) {
        const phi = r.pick([60, 30, 20, 10, 5]), d = r.pick([2, 3, 5]);
        const s = Math.sin(phi * DEG), ans = d / s;
        return {
          prompt: t`A receiver fixes its position in a plane from ranges to two beacons. Near its true position, a small position error $\Delta\mathbf p$ changes the two ranges by $\hat{\mathbf u}_1\cdot\Delta\mathbf p$ and $\hat{\mathbf u}_2\cdot\Delta\mathbf p$, where $\hat{\mathbf u}_1 = (1, 0)$ and $\hat{\mathbf u}_2 = (\cos ${phi}^\circ, \sin ${phi}^\circ)$ are the unit directions to the beacons. Range 1 is measured perfectly, range 2 is off by $${d}$ m. Solve $\begin{bmatrix} \hat{\mathbf u}_1^{\mathsf T} \\ \hat{\mathbf u}_2^{\mathsf T} \end{bmatrix}\Delta\mathbf p = ${colTeX([0, d])}$ with Cramer's rule: how large is the position error, $|\Delta\mathbf p|$?`,
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: d * s, feedback: t`You multiplied by $\det A = \sin ${phi}^\circ$; Cramer's rule *divides* by it.` }, { value: d / Math.cos(phi * DEG), feedback: t`$\det A = \cos 0\cdot\sin ${phi}^\circ - 0\cdot\cos ${phi}^\circ = \sin ${phi}^\circ$, not the cosine.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$A = \begin{bmatrix} 1 & 0 \\ \cos ${phi}^\circ & \sin ${phi}^\circ \end{bmatrix}$, so $\det A = \sin ${phi}^\circ$.`, t`$\Delta x = \det A_1/\det A = 0$ and $\Delta y = \det A_2/\det A = ${d}/\sin ${phi}^\circ$.`],
          teach: 'A small determinant divides into every unknown: nearly parallel lines of sight turn a small range error into a large position error.',
          explain: t`$\det A = \sin ${phi}^\circ = ${nice(s)}$. $\Delta x = 0$ and $\Delta y = \det\begin{bmatrix} 1 & 0 \\ \cos ${phi}^\circ & ${d} \end{bmatrix}/\sin ${phi}^\circ = ${d}/${nice(s)} = ${nice(ans)}$ m. With beacons at right angles the error stays ${d} m; as the two directions close up, $\det A \to 0$ and the error grows without bound. Satellite navigation calls this **dilution of precision**: GPS geometry with the satellites bunched in one part of the sky gives poor fixes, which is why receivers prefer satellites spread across the sky.`,
          visual: detPic([[1, 0], [Math.cos(phi * DEG), s]], { names: ['u₁', 'u₂'], tint: false, arc: false, view: 1.2, center: [0.6, 0.45], caption: 'The two unit directions to the beacons and the parallelogram they span: its area is det A = sin φ. A thin parallelogram means a poor fix.' }),
        };
      },
    }),
    mcq({
      id: 'cp-ratios', difficulty: 2,
      prompt: t`A $2\times2$ system has $\det A = 4$, $\det A_1 = 6$ and $\det A_2 = -2$. What is its solution $(x_1, x_2)$?`,
      choices: [t`$(1.5,\ -0.5)$`, t`$(\tfrac23,\ -2)$`, t`$(6,\ -2)$`, t`$(1.5,\ 0.5)$`],
      answer: 0,
      why: {
        1: t`Those are $\det A/\det A_i$: the ratios are upside down.`,
        2: t`Those are the determinants themselves; each must be divided by $\det A = 4$.`,
        3: t`The sign of $\det A_2$ carries through: $-2/4 = -0.5$.`,
      },
      hints: [t`$x_i = \det A_i / \det A$.`],
      teach: t`Each unknown is its own determinant over $\det A$.`,
      explain: t`$x_1 = 6/4 = 1.5$ and $x_2 = -2/4 = -0.5$. For instance $A = ${matTeX([[2, 1], [0, 2]])}$, $\mathbf b = (2.5, -1)$ has exactly these determinants.`,
      visual: detPic([[2, 0], [1, 2]], { b: [2.5, -1], cramer: 1, view: 2, center: [1.6, 0.5], caption: 'One system with these determinants: blue is A (area 4), orange is A₁ (area 6).' }),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §5.3', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC, Lecture 20: Cramer’s rule, inverse matrix, and volume', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
  ],
});
