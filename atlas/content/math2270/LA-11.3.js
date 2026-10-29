// Sylvester's law of inertia: a change of basis changes the matrix of a
// quadratic form by congruence, A ↦ PᵀAP, which changes its eigenvalues but
// never how many are positive, negative and zero — the signature. Completing
// the square; the Minkowski metric's (−, +, +, +) cannot be changed by any
// choice of coordinates.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { matmul, transpose, matTeX, tupleTeX } from './_la.js';
import { symInt2, eigSym2, formPic } from './_ortho.js';

const t = String.raw;
const T = t`^{\mathsf T}`;
// the Explore: G = diag(g1, g2) chosen by a choice, P = [[1, s], [0, k]]; G' = PᵀGP = [[g1, g1 s], [g1 s, g1 s² + g2 k²]]
const G1 = '(1 - 2*step(0.5 - g))', G2 = '(1 - step(g - 1.5))';
const A_ = G1, B_ = `${G1}*s`, C_ = `(${G1}*s^2 + ${G2}*k^2)`;
const EIG = (sgn) => `(${A_} + ${C_})/2 ${sgn} sqrt(((${A_} - ${C_})/2)^2 + (${B_})^2)`;
const numberLine = (vals, caption) => ({
  type: 'graph',
  params: {
    x: [-9, 9], y: [-1, 1.2], aspect: 'wide', yticks: 0, xlabel: 'eigenvalue', ylabel: '', grid: false,
    points: vals.map((v) => ({ x: v, y: 0, color: v > 0 ? 'good' : v < 0 ? 'bad' : 'ink3', r: 6 })),
    vlines: [{ x: 0, color: 'ink3' }],
  },
  caption,
});

export default lesson({
  id: 'math2270.LA-11.3',
  title: 'Sylvester’s law of inertia and signature',
  minutes: 12, difficulty: 3,
  intro: t`A matrix can stand for two different things. As a **linear map**, changing basis by $P$ turns $A$ into $P^{-1}AP$ (LA-7.3), which keeps the eigenvalues. As a **quadratic form** $\mathbf x${T}A\mathbf x$ — a rule that turns one vector into a number, like a length squared — substituting $\mathbf x = P\mathbf x'$ gives $\mathbf x'^{\mathsf T}(P${T}AP)\mathbf x'$: the matrix changes by **congruence**,

$$A' = P${T}A\,P$$

Congruence changes the eigenvalues: stretch the axes and the numbers move. **Sylvester's law of inertia** says what survives. For every invertible $P$, $A'$ has exactly as many positive, negative and zero eigenvalues as $A$. That count is the **signature**. Completing the square brings any form to $\pm y_1^2 \pm y_2^2 \pm \dots$, and Sylvester says the signs you end with do not depend on how you did it. For spacetime this is decisive: the metric $\eta = \operatorname{diag}(-1, 1, 1, 1)$ (with $c = 1$) has signature $(-, +, +, +)$, and **no change of coordinates can alter it** — one direction is always time.`,
  symbols: [
    { tex: 'A', text: t`the symmetric matrix of a quadratic form (or of a symmetric bilinear form $\langle\mathbf u, \mathbf v\rangle = \mathbf u${T}A\mathbf v$, such as a metric)` },
    { tex: 'P', text: t`an invertible change-of-basis matrix: its columns are the new basis vectors, $\mathbf x = P\mathbf x'$` },
    { tex: t`A' = P${T}AP`, text: t`the form's matrix in the new basis — congruent to $A$. Its entries are $\mathbf p_i${T}A\,\mathbf p_j$ for the new basis vectors $\mathbf p_i$` },
    { tex: t`(n_+, n_-, n_0)`, text: t`the numbers of positive, negative and zero eigenvalues: the signature (the inertia), the same for $A$ and every $P${T}AP$` },
    { tex: t`\eta`, text: t`the Minkowski metric $\operatorname{diag}(-1, 1, 1, 1)$, in units with $c = 1$: $\mathbf v${T}\eta\mathbf v = -t^2 + x^2 + y^2 + z^2$` },
  ],
  why: 'The metric tensor of general relativity is a symmetric bilinear form, transformed by congruence, and Sylvester’s law is why every observer, in any coordinates, finds exactly one time direction and three of space.',
  visual: {
    type: 'c3-contour',
    title: 'Squeeze and shear the basis: the shape family never changes',
    lead: t`Pick a form $G$, then change basis with $P = \begin{bmatrix} 1 & s \\ 0 & k \end{bmatrix}$. The map shows the level curves of the same form in the new coordinates, $\mathbf x'^{\mathsf T}(P${T}GP)\mathbf x'$; gold is the level $+1$. The readouts are the eigenvalues of $P${T}GP$.`,
    tasks: [
      'Minkowski form: shear and squeeze as you like. The hyperbolas tilt and stretch, the eigenvalues move — but one is always negative and one positive.',
      'Euclidean form: the circle becomes every possible ellipse, never a hyperbola. Both eigenvalues stay positive.',
      'Degenerate form: one eigenvalue stays exactly 0 — parallel lines remain parallel lines.',
    ],
    params: {
      f: `${A_}*x^2 + 2*${B_}*x*y + ${C_}*y^2`, x: [-4, 4], y: [-2, 2], levels: [-4, -2, -1, 1, 2, 4], highlight: '1', aspect: 'wide', xlabel: 'x′', ylabel: 'y′',
      choices: [{ key: 'g', label: 'Form G', options: [[0, t`Minkowski $-t^2 + x^2$`], [1, t`Euclidean $x^2 + y^2$`], [2, t`degenerate $x^2$`]], value: 0, explain: 'Three forms with signatures (−, +), (+, +) and (+, 0).' }],
      sliders: [
        { key: 's', label: t`Shear $s$`, min: -2, max: 2, step: 0.1, value: 0.6, explain: t`The second new basis vector is $(s, k)$: shearing it sideways.` },
        { key: 'k', label: t`Stretch $k$`, min: 0.3, max: 2.5, step: 0.1, value: 1.4, explain: t`How long the second new basis vector is upward; $\det P = k \ne 0$.` },
      ],
      readouts: [
        { label: t`$\lambda_1$ of $P${T}GP$`, expr: EIG('+'), digits: 3 },
        { label: t`$\lambda_2$ of $P${T}GP$`, expr: EIG('-'), digits: 3 },
        { label: t`$\det(P${T}GP) = k^2\det G$`, expr: `${G1}*${G2}*k^2`, digits: 3 },
      ],
    },
    caption: 'Level curves of one fixed form written in a changed basis; gold: the level +1. In the first coordinate of the Minkowski form, read t for x′.',
  },
  example: {
    prompt: t`Find the signature of $q = x^2 + 4xy + y^2$ by completing the square, and compare it with the eigenvalues of its matrix.`,
    visual: formPic([[1, 2], [2, 1]], { levels: [-3, -1, 1, 3], highlight: '1', caption: 'Level curves of x² + 4xy + y² (gold: q = 1): hyperbolas, so one sign of each. Arrows: the principal axes.' }),
    steps: [
      { label: 'Complete the square', text: t`$x^2 + 4xy + y^2 = (x + 2y)^2 - 4y^2 + y^2 = (x + 2y)^2 - 3y^2$.` },
      { label: 'New coordinates', text: t`Let $u = x + 2y$ and $v = \sqrt3\,y$. Then $q = u^2 - v^2$: one plus, one minus. Signature $(+, -)$.` },
      { label: 'As a congruence', text: t`$(u, v) = M(x, y)$ with $M = \begin{bmatrix} 1 & 2 \\ 0 & \sqrt3 \end{bmatrix}$, so $(x, y) = P(u, v)$ with $P = M^{-1}$, and $P${T}\begin{bmatrix} 1 & 2 \\ 2 & 1 \end{bmatrix}P = \begin{bmatrix} 1 & 0 \\ 0 & -1 \end{bmatrix}$. $P$ is not orthogonal — it squeezes — so this is not the spectral theorem's diagonalization.` },
      { label: 'Eigenvalues', text: t`The matrix $\begin{bmatrix} 1 & 2 \\ 2 & 1 \end{bmatrix}$ has eigenvalues $3$ and $-1$. Different numbers from $1$ and $-1$ — but the same signs, as Sylvester promises.` },
      { label: 'Sense check', text: t`$\det = 1 - 4 = -3 < 0$. A congruence multiplies the determinant by $(\det P)^2 > 0$, so its sign — here, “one of each” — can never change. In more dimensions the full count needs Sylvester's law, not just the determinant.` },
    ],
    answer: t`$q = (x + 2y)^2 - 3y^2 = u^2 - v^2$: signature $(+, -)$, matching the eigenvalues $3$ and $-1$ in sign but not in size.`,
  },
  practice: [
    num({
      id: 'congruence-entry', difficulty: 2,
      gen(r) {
        const { A } = symInt2(r, { range: 4 }), P = [[1, r.intExcept(-2, 2, [0])], [r.int(-1, 1), r.pick([1, 2])]];
        const Ap = matmul(matmul(transpose(P), A), P), [i, j] = r.pick([[0, 0], [0, 1], [1, 1]]);
        const wrong = matmul(matmul(P, A), transpose(P))[i][j];
        return {
          prompt: t`The quadratic form with matrix $A = ${matTeX(A)}$ is rewritten in the basis given by the columns of $P = ${matTeX(P)}$. Find the entry in row ${i + 1}, column ${j + 1} of its new matrix $P${T}AP$.`,
          answer: Ap[i][j], tol: { rel: 0, abs: 0.01 },
          errors: [{ value: wrong, feedback: t`That is $PAP${T}$: the transpose goes on the left. Entry $(i, j)$ of $P${T}AP$ is $\mathbf p_i${T}A\,\mathbf p_j$ for the columns $\mathbf p_i$ of $P$.` }].filter((e) => e.value !== Ap[i][j]),
          hints: [t`Entry $(${i + 1}, ${j + 1})$ of $P${T}AP$ is $\mathbf p_${i + 1}${T}A\,\mathbf p_${j + 1}$, with $\mathbf p_1 = ${tupleTeX([P[0][0], P[1][0]])}$ and $\mathbf p_2 = ${tupleTeX([P[0][1], P[1][1]])}$.`, t`First $A\mathbf p_${j + 1} = ${tupleTeX([A[0][0] * P[0][j] + A[0][1] * P[1][j], A[1][0] * P[0][j] + A[1][1] * P[1][j]])}$, then dot with $\mathbf p_${i + 1}$.`],
          teach: 'A form’s matrix in a new basis has entries pᵢᵀ A pⱼ: the form evaluated on pairs of new basis vectors.',
          explain: t`$P${T}AP = ${matTeX(Ap)}$, entry $${Ap[i][j]}$. It is symmetric again, as a form's matrix must be — but it is not similar to $A$: its eigenvalues differ.`,
          visual: formPic(A, { axes: false, levels: 7, caption: 'Level curves of the form in the old coordinates.' }),
        };
      },
    }),
    mcq({
      id: 'which-rule', difficulty: 2,
      prompt: t`A metric $g$ (a symmetric bilinear form) has matrix $G$ in one basis. The new basis vectors are the columns of an invertible $P$. What is its matrix in the new basis?`,
      choices: [t`$P${T}GP$`, t`$P^{-1}GP$`, t`$G$ — a metric does not depend on the basis`, t`$PGP^{-1}$`],
      answer: 0,
      why: {
        1: t`$P^{-1}GP$ is the rule for a linear **map**, which takes a vector to a vector. A metric takes two vectors to a number, $g(\mathbf u, \mathbf v) = \mathbf u${T}G\mathbf v$; substituting $\mathbf u = P\mathbf u'$, $\mathbf v = P\mathbf v'$ gives $P${T}GP$.`,
        2: 'The metric — the geometric object — does not change, but its matrix of components does: in polar coordinates the plane’s metric is diag(1, r²), not the identity.',
        3: t`That is the map rule run the other way (new to old). Neither is right for a form.`,
      },
      hints: [t`Write $g(\mathbf u, \mathbf v) = \mathbf u${T}G\mathbf v$ and substitute $\mathbf u = P\mathbf u'$, $\mathbf v = P\mathbf v'$.`],
      teach: 'Maps transform by similarity, P⁻¹AP; bilinear forms such as a metric transform by congruence, PᵀGP.',
      explain: t`$(P\mathbf u')${T}G(P\mathbf v') = \mathbf u'^{\mathsf T}(P${T}GP)\mathbf v'$. The two rules agree only when $P^{-1} = P${T}$ — an orthogonal change of basis — which is why the difference hides in ordinary Euclidean work and matters in relativity, where boosts are not rotations.`,
      visual: { type: 'ten-basis', params: { mode: 'vector', basis: [[1, 0.5], [0.4, 1.2]], vector: [2, 1.5], names: ['p₁', 'p₂'], vname: 'v', vtex: '\\mathbf v', readout: false, construction: false, grid: 'basis', dragVector: false, dragBasis: false }, caption: 'A new basis p₁, p₂ (its grid drawn) and a vector v. The vector does not change; its components do — and so do the metric’s.' },
    }),
    num({
      id: 'count-negative', difficulty: 2,
      gen(r) {
        let vals;
        for (let k = 0; k < 100; k++) { vals = [r.int(-8, 8), r.int(-8, 8), r.int(-8, 8), r.int(-8, 8)]; if (vals.every((v) => v !== 0) && vals.some((v) => v < 0)) break; }
        const neg = vals.filter((v) => v < 0).length, wantNeg = r.bool(0.5);
        const ans = wantNeg ? neg : 4 - neg;
        return {
          prompt: t`A symmetric $4\times4$ matrix $A$ has eigenvalues $${vals.join(',\\ ')}$. $P$ is an invertible matrix with $\det P = ${r.pick([-3, 2, 5, 0.5])}$. How many ${wantNeg ? 'negative' : 'positive'} eigenvalues does $P${T}AP$ have?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          hints: ['The eigenvalues of PᵀAP are generally different numbers from those of A. What does Sylvester’s law keep?', 'Count signs.'],
          teach: 'Congruence by any invertible P preserves the number of positive, negative and zero eigenvalues.',
          explain: t`$A$ has ${neg} negative and ${4 - neg} positive eigenvalues, so $P${T}AP$ does too, whatever $P$ is (as long as it is invertible). The sign of $\det P$ is irrelevant: $\det(P${T}AP) = (\det P)^2\det A$.`,
          visual: numberLine(vals, 'The eigenvalues of A on a number line: green positive, red negative. Congruence slides them around but never across 0.'),
        };
      },
    }),
    num({
      id: 'complete-square', difficulty: 3,
      gen(r) {
        const b = r.intExcept(-3, 3, [0]), c = r.intExcept(-6, 10, [0, b * b]), coef = c - b * b;
        const nNeg = coef < 0 ? 1 : 0;
        return {
          prompt: t`Complete the square: $x^2 ${b > 0 ? '+' : '-'} ${2 * Math.abs(b)}xy ${c > 0 ? '+' : '-'} ${Math.abs(c)}y^2 = (x ${b > 0 ? '+' : '-'} ${Math.abs(b)}y)^2 + m\,y^2$. Find $m$. (Its sign then gives the signature.)`,
          answer: coef, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: c + b * b, feedback: t`$(x ${b > 0 ? '+' : '-'} ${Math.abs(b)}y)^2$ already contains $${b * b}y^2$; subtract it, do not add.` }],
          hints: [t`$(x ${b > 0 ? '+' : '-'} ${Math.abs(b)}y)^2 = x^2 ${b > 0 ? '+' : '-'} ${2 * Math.abs(b)}xy + ${b * b}y^2$.`, t`So $m = ${c} - ${b * b}$.`],
          teach: 'Completing the square is a congruence that diagonalizes a form; the signs of the resulting coefficients are its signature.',
          explain: t`$m = ${c} - ${b * b} = ${coef}$, so with $u = x ${b > 0 ? '+' : '-'} ${Math.abs(b)}y$ the form is $u^2 ${coef < 0 ? '-' : '+'} ${Math.abs(coef)}y^2$: signature $(+, ${coef < 0 ? '-' : '+'})$ — ${nNeg ? 'indefinite: hyperbolas, a saddle' : 'positive definite: ellipses, a bowl'}. The determinant of the form's matrix $\begin{bmatrix} 1 & ${b} \\ ${b} & ${c} \end{bmatrix}$ is $${coef}$ too.`,
          visual: formPic([[1, b], [b, c]], { axes: false, levels: [-4, -1, 1, 4], highlight: '1', caption: 'Level curves of the form; gold: the level 1.' }),
        };
      },
    }),
    num({
      id: 'interval', difficulty: 3,
      gen(r) {
        const [beta, gam] = r.pick([[0.6, 1.25], [0.8, 5 / 3], [0.28, 1 / 0.96]]), tt = r.int(2, 6), xx = r.intExcept(-4, 4, [0]);
        const t2 = gam * (tt - beta * xx), x2 = gam * (xx - beta * tt), s2 = -tt * tt + xx * xx, ask = r.pick(['s2', 't']);
        const ans = ask === 's2' ? s2 : t2;
        return {
          prompt: t`With $c = 1$, an event has coordinates $(t, x) = (${tt}, ${xx})$ in one frame. A boost with $v = ${beta}$ ($\gamma = ${nice(gam)}$) gives $t' = \gamma(t - vx)$, $x' = \gamma(x - vt)$. ${ask === 's2' ? t`Compute $-t'^2 + x'^2$.` : t`Find $t'$.`}`,
          answer: ans, tol: { rel: 1e-3, abs: 1e-3 },
          errors: ask === 's2' ? [{ value: tt * tt + xx * xx, feedback: t`The Minkowski form has a minus sign on time: $-t^2 + x^2$, not $t^2 + x^2$.` }].filter((e) => Math.abs(e.value - ans) > 1e-3) : [],
          hints: [t`$t' = ${nice(gam)}(${tt} - ${beta}\cdot${xx < 0 ? `(${xx})` : xx}) = ${nice(t2)}$ and $x' = ${nice(gam)}(${xx} - ${beta}\cdot${tt}) = ${nice(x2)}$.`, ask === 's2' ? t`Or skip the arithmetic: the boost preserves the form, $\Lambda${T}\eta\Lambda = \eta$.` : t`Substitute directly.`],
          teach: 'A Lorentz boost Λ satisfies ΛᵀηΛ = η: it is a change of basis that leaves the Minkowski form’s matrix itself unchanged, so the interval is invariant.',
          explain: t`$t' = ${nice(t2)}$, $x' = ${nice(x2)}$, and $-t'^2 + x'^2 = ${nice(-t2 * t2 + x2 * x2)} = -${tt}^2 + ${xx < 0 ? `(${xx})` : xx}^2 = ${s2}$. Boosts are the special congruences that keep $\eta$ exactly; a general change of coordinates changes the metric's components but, by Sylvester, never its signature.`,
          visual: { type: 'graph', params: { x: [-6, 6], y: [0, 7], aspect: 'wide', equal: true, xlabel: 'x', ylabel: 't', curves: [{ fn: 'abs(x)', color: 'warn', dash: [5, 5], width: 1.2, label: 'light cone', labelAt: 4.6, labelDy: 14 }, { param: [`${beta}*t`, 't'], t: [0, 7], color: 'gold', width: 1.6, label: 'moving observer', labelAt: 5.5 }], points: [{ x: xx, y: tt, color: 'accent', r: 6, label: 'event' }] }, caption: 'The event on a spacetime diagram (c = 1), with the light cone (dashed) and the moving observer’s worldline x = vt (gold).' },
        };
      },
    }),
    mcq({
      id: 'all-plus', difficulty: 2,
      prompt: t`Someone proposes clever coordinates for flat spacetime in which the metric at a point becomes $\operatorname{diag}(1, 1, 1, 1)$, so that time is “just another space direction”. Is that possible?`,
      choices: [
        t`No: any change of coordinates acts on the metric's matrix by congruence, and Sylvester's law keeps exactly one negative eigenvalue`,
        'Yes, with a large enough boost',
        t`Yes, by rescaling $t$ to $it$`,
        'Only inside a black hole, where t and r swap roles',
      ],
      answer: 0,
      why: {
        1: t`A boost keeps $\eta$ exactly — $\Lambda${T}\eta\Lambda = \eta$ — so it cannot even change the components, let alone the signature.`,
        2: t`An imaginary coordinate is not a change of real basis; it was an old bookkeeping trick (“$ict$”) that hid, not removed, the minus sign.`,
        3: t`Inside the horizon the Schwarzschild coordinates $t$ and $r$ swap which is timelike, but the signature is still one minus and three plus.`,
      },
      hints: ['The new matrix is PᵀηP for some invertible P.', 'How many negative eigenvalues does η have?'],
      teach: 'Signature is invariant under any change of basis, so spacetime’s one time direction is a fact, not a choice of coordinates.',
      explain: t`$\eta$ has one negative and three positive eigenvalues; every $P${T}\eta P$ does too. The time direction can be tilted (a boost) but never removed. In curved spacetime the metric varies from point to point, yet at each point it can be brought to $\eta$ — a local inertial frame — and never to anything of another signature.`,
      visual: { type: 'spacetime', params: { beta: 0.5, events: [[2, 1], [3, -1.5]], names: ['P', 'Q'], range: 5 }, caption: 'A Minkowski diagram (c = 1). Boost the gold frame as far as you like: its time axis stays inside the light cone.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-neg', difficulty: 2,
      gen(r) {
        const b = r.intExcept(-3, 3, [0]), c = r.intExcept(-5, 10, [0, b * b]);
        return {
          prompt: t`How many negative eigenvalues does $P${T}AP$ have, for $A = \begin{bmatrix} 1 & ${b} \\ ${b} & ${c} \end{bmatrix}$ and any invertible $P$?`,
          answer: c - b * b < 0 ? 1 : 0, tol: { rel: 0, abs: 0.01 },
          hints: [t`Complete the square, or use $\det A$: with $a_{11} = 1 > 0$, a negative determinant means one negative eigenvalue.`],
          teach: 'The signature survives every congruence.',
          explain: t`$\det A = ${c - b * b}$, so $A$ has ${c - b * b < 0 ? 'one negative eigenvalue (and one positive)' : 'two positive eigenvalues'}; so does every $P${T}AP$.`,
          visual: formPic([[1, b], [b, c]], { axes: false, levels: [-4, -1, 1, 4], caption: 'Level curves of the form.' }),
        };
      },
    }),
    num({
      id: 'cp-schwarzschild', difficulty: 3, transfer: true,
      gen(r) {
        const x = r.pick([3, 2, 1.5, 0.75, 0.5, 0.25]), gtt = -(1 - 1 / x), grr = 1 / (1 - 1 / x);
        return {
          prompt: t`In Schwarzschild coordinates $(t, r, \theta, \phi)$ with $c = 1$, the metric of a black hole is diagonal: $g = \operatorname{diag}\!\big(-(1 - r_s/r),\ (1 - r_s/r)^{-1},\ r^2,\ r^2\sin^2\theta\big)$. At $r = ${x}\,r_s$ (${x > 1 ? 'outside' : 'inside'} the horizon) and $\theta = 90^\circ$, $g_{tt} = ${nice(gtt)}$ and $g_{rr} = ${nice(grr)}$. How many negative eigenvalues does the metric have there?`,
          answer: 1, tol: { rel: 0, abs: 0.01 },
          hints: ['A diagonal matrix’s eigenvalues are its diagonal entries; r² and r² sin²θ are positive.', t`Look at the signs of $g_{tt}$ and $g_{rr}$ at $r = ${x}\,r_s$.`],
          teach: 'The metric’s signature is (−, +, +, +) at every point of spacetime; inside a horizon only the labels of the time direction change.',
          explain: t`${x > 1 ? t`Outside, $g_{tt} < 0$ and $g_{rr} > 0$: the minus sign belongs to $t$.` : t`Inside, $g_{tt} > 0$ and $g_{rr} < 0$: the minus sign has moved to $r$ — the radial direction is now timelike, which is why everything inside moves inward as inexorably as forward in time.`} Either way exactly one eigenvalue is negative: signature $(-, +, +, +)$, as Sylvester's law requires: at every point the metric is congruent to $\eta$, and a change of coordinates cannot change that count. (At $r = r_s$ these coordinates fail — $g_{rr}$ blows up — but that is a defect of the coordinates, not of spacetime.) This is the idea behind [the signature and the Minkowski metric](#/lesson/st-a.A6.6) on the [Road to Einstein](#/gr).`,
          visual: { type: 'graph', params: { x: [0.1, 3.2], y: [-4, 4], aspect: 'wide', xlabel: 'r / rₛ', ylabel: 'metric component', curves: [{ fn: '-(1 - 1/x)', color: 'accent', domain: [0.2, 3.2], label: 'gₜₜ', labelAt: 2.8, labelDy: -12 }, { fn: '1/(1 - 1/x)', color: 'warn', domain: [1.25, 3.2], label: 'g (rr)', labelAt: 2.6, labelDy: -12 }, { fn: '1/(1 - 1/x)', color: 'warn', domain: [0.2, 0.8] }], vlines: [{ x: 1, label: 'horizon', color: 'ink3' }], points: [{ x, y: 0, color: 'gold', r: 6, label: `r = ${x} rₛ` }] }, caption: 'The two components that change sign at the horizon, against r (c = 1). The coordinates break down at r = rₛ itself.' },
        };
      },
    }),
    mcq({
      id: 'cp-what-changes', difficulty: 2,
      prompt: t`Congruence $A \mapsto P${T}AP$ with invertible $P$ — which of these is **guaranteed** to stay the same?`,
      choices: ['The number of positive, negative and zero eigenvalues', 'The eigenvalues themselves', 'The determinant', 'The trace'],
      answer: 0,
      why: {
        1: t`Take $A = I$ and $P = 2I$: $P${T}AP = 4I$, eigenvalues 4 instead of 1. Eigenvalues are kept by similarity, $P^{-1}AP$.`,
        2: t`$\det(P${T}AP) = (\det P)^2\det A$: only its sign is kept.`,
        3: t`$A = I$, $P = 2I$ again: the trace goes from $n$ to $4n$.`,
      },
      hints: ['Try P = 2I.'],
      teach: 'Congruence keeps the signature; similarity keeps the eigenvalues.',
      explain: t`Only the signs are invariant (Sylvester). Scaling the basis rescales a form's eigenvalues, but it cannot make a positive one negative.`,
      visual: numberLine([3, 1, -2], 'Eigenvalues of some A (green positive, red negative). Under PᵀAP they may move anywhere on their own side of 0.'),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §6.4 (the law of inertia)', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Axler, Linear Algebra Done Right (4th ed.), ch. 9: bilinear and quadratic forms', url: 'https://linear.axler.net/' },
    { label: 'Carroll, Spacetime and Geometry, §1.4 and §2.5 (the metric and its signature)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
  ],
});
