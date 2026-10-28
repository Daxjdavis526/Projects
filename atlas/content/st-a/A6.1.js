// The metric as a dot-product machine: a symmetric, non-degenerate (0,2)
// tensor g with g(U, V) = g_μν U^μ V^ν; its components are the basis arrows'
// dot products, g_μν = e_μ · e_ν; lengths and angles come from it alone.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { still } from './_ten.js';
import { form, matTeX, vecTeX, bil, fr, AXES_NOTE } from './_metric.js';

const t = String.raw;
const DEG = Math.PI / 180;
const S3 = Math.sqrt(3) / 2;
const METRICS = [[[1, 0], [0, 4]], [[2, 1], [1, 2]], [[1, 1], [1, 2]], [[3, 1], [1, 1]], [[4, 2], [2, 2]], [[1, -1], [-1, 3]], [[2, 0], [0, 1]]];
const ind = (g, U, V, caption, extra = {}) => form({ T: g, U, V, tname: 'g', indicatrix: true, feed: false, view: 2, ...extra }, caption);

export default lesson({
  id: 'st-a.A6.1',
  title: 'The metric as a dot-product machine',
  minutes: 10, difficulty: 2,
  intro: t`Covectors pair with vectors without help (lesson A3.3), but two *arrows* cannot be multiplied — given lengths and angles — until you add a machine that knows them. That machine is the **metric** $g$: a (0,2) tensor that takes two vectors and returns their dot product. It is **symmetric**, $g(\mathbf U, \mathbf V) = g(\mathbf V, \mathbf U)$, and **non-degenerate**: the only vector whose dot product with every vector is zero is the zero vector ($\det g_{\mu\nu} \ne 0$). Its components are the dot products of the basis arrows, and multilinearity does the rest:

$$\mathbf U\cdot\mathbf V = g(\mathbf U, \mathbf V) = g_{\mu\nu}\,U^\mu V^\nu, \qquad g_{\mu\nu} = \mathbf e_\mu\cdot\mathbf e_\nu$$

For perpendicular unit arrows $g_{\mu\nu} = \delta_{\mu\nu}$ and this is the school formula; for any other basis the extra components carry the lengths and angles of the arrows. Then a length is $|\mathbf V| = \sqrt{g(\mathbf V, \mathbf V)}$ and an angle comes from $\cos\alpha = g(\mathbf U, \mathbf V)/(|\mathbf U|\,|\mathbf V|)$ — **everything metrical about a space is in $g$**. The Road met the metric as a rule for distances (step 8); here it is the machine underneath.`,
  symbols: [
    { tex: t`g`, text: 'the metric: a symmetric, non-degenerate (0,2) tensor' },
    { tex: t`g(\mathbf U, \mathbf V)`, text: t`the dot product $\mathbf U\cdot\mathbf V$ of two vectors` },
    { tex: t`g_{\mu\nu}`, text: t`its components, $\mathbf e_\mu\cdot\mathbf e_\nu$: squared lengths of the basis arrows on the diagonal, their mutual dot products off it` },
    { tex: t`U^\mu,\ V^\nu`, text: 'the components of the two vectors in that basis' },
    { tex: t`\mathbf e_\mu`, text: 'the basis arrows' },
  ],
  why: t`In general relativity the metric is the gravitational field: it decides what clocks and rulers read, so every measurable length, time and angle is a value of $g$.`,
  visual: {
    type: 'ten-metric',
    title: 'Lengths and angles from one machine',
    lead: t`The axes are components. The sliders set the metric’s components; the gold curve is the metric’s unit circle, every vector with $g(\mathbf X, \mathbf X) = 1$. The teal lines are $g(\mathbf U, \cdot\,)$. Drag $\mathbf U$ and $\mathbf V$ and read their lengths and the angle between them.`,
    tasks: [
      t`With $g = \delta$ the unit circle is round and the angle in the readout matches the picture.`,
      t`Set $g_{12} = 0.5$ — basis arrows at 60°. Drag $\mathbf V$ onto the teal line marked 0: the readout says 90°, though on the component axes they do not look perpendicular.`,
      t`Set $g_{11} = 4$: the first basis arrow is now 2 long, so the unit circle reaches only $\tfrac12$ along the $x^1$ axis.`,
    ],
    params: { mode: 'form', tname: 'g', T: [[1, 0], [0, 1]], sliders: 'sym', U: [1.2, 0.3], V: [0.4, 1.3], indicatrix: true, readout: ['T', 'TUV', 'len', 'angle'] },
    caption: t`Gold: the vectors of $g$-length 1. Teal: $g(\mathbf U, \cdot\,)$ at whole-number values. ${AXES_NOTE} The sliders allow non-positive metrics too — lesson A6.6.`,
  },
  example: {
    prompt: t`Graphene’s lattice is built from two arrows $\mathbf a_1$, $\mathbf a_2$ of length $a = 2.46$ Å at $60^\circ$ to each other. Find the metric in this basis, the distance between two lattice points separated by $\mathbf V = 2\mathbf a_1 + \mathbf a_2$, and the angle between $\mathbf V$ and $\mathbf a_1$.`,
    visual: still({ basis: [[1, 0], [0.5, S3]], vector: [2.5, S3], names: ['a₁', 'a₂'], vname: 'V', grid: 'basis' }, t`The lattice basis at $60^\circ$ and $\mathbf V = 2\mathbf a_1 + \mathbf a_2$, drawn true to shape (one unit = $a$).`),
    steps: [
      { label: 'Components', text: t`$g_{11} = g_{22} = a^2$ and $g_{12} = g_{21} = a^2\cos60^\circ = \tfrac12a^2$: $\;g_{\mu\nu} = a^2${matTeX([[1, 0.5], [0.5, 1]])}$.` },
      { label: 'Length', text: t`$g(\mathbf V, \mathbf V) = a^2\big(2^2 + 2\cdot\tfrac12\cdot2\cdot1 + 1^2\big) = 7a^2$, so $|\mathbf V| = \sqrt7\times2.46 = 6.51$ Å. Pythagoras on the components, $\sqrt{2^2 + 1^2}\,a = 5.50$ Å, is wrong: the basis is not perpendicular.` },
      { label: 'Angle', text: t`$g(\mathbf V, \mathbf a_1) = a^2(2 + \tfrac12) = 2.5a^2$; $\cos\alpha = 2.5a^2/(\sqrt7 a\cdot a) = 0.945$, so $\alpha = 19.1^\circ$.` },
      { label: 'Sense check', text: t`In Cartesian components $\mathbf V = a(2.5, 0.866)$: length $a\sqrt{6.25 + 0.75} = \sqrt7\,a$ ✓, angle $\arctan(0.866/2.5) = 19.1^\circ$ ✓.` },
    ],
    answer: t`$g_{\mu\nu} = a^2\begin{pmatrix} 1 & \tfrac12 \\ \tfrac12 & 1\end{pmatrix}$; $|\mathbf V| = \sqrt7\,a = 6.51$ Å; the angle to $\mathbf a_1$ is $19.1^\circ$.`,
  },
  practice: [
    num({
      id: 'dot', difficulty: 1,
      gen(r) {
        let g, U, V, ans;
        do { g = r.pick(METRICS); U = [r.intExcept(-2, 2, [0]), r.int(-2, 2)]; V = [r.int(-2, 2), r.intExcept(-2, 2, [0])]; ans = bil(g, U, V); } while (ans === 0 || ans === U[0] * V[0] + U[1] * V[1]);
        return {
          prompt: t`In a basis where $g_{\mu\nu} = ${matTeX(g)}$, find $\mathbf U\cdot\mathbf V$ for $U^\mu = ${vecTeX(U)}$ and $V^\nu = ${vecTeX(V)}$.`,
          visual: ind(g, U.map((x) => x * 0.7), V.map((x) => x * 0.7), t`The metric’s unit circle (gold) with $\mathbf U$ and $\mathbf V$ at 0.7 scale. ${AXES_NOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: U[0] * V[0] + U[1] * V[1], feedback: t`That is $U^1V^1 + U^2V^2$, the dot product only for a perpendicular unit basis. Use all of $g_{\mu\nu}U^\mu V^\nu$.` }],
          hints: [t`$g_{\mu\nu}U^\mu V^\nu = g_{11}U^1V^1 + g_{12}(U^1V^2 + U^2V^1) + g_{22}U^2V^2$ for a symmetric $g$.`],
          teach: t`The dot product in any basis is $g_{\mu\nu}U^\mu V^\nu$; $U^1V^1 + U^2V^2$ is the special case $g = \delta$.`,
          explain: t`$${g[0][0]}(${U[0]})(${V[0]}) + ${g[0][1]}\big((${U[0]})(${V[1]}) + (${U[1]})(${V[0]})\big) + ${g[1][1]}(${U[1]})(${V[1]}) = ${ans}$.`,
        };
      },
    }),
    num({
      id: 'length', difficulty: 2,
      gen(r) {
        let g, V, L2;
        do { g = r.pick(METRICS); V = [r.intExcept(-2, 2, [0]), r.intExcept(-2, 2, [0])]; L2 = bil(g, V, V); } while (L2 === V[0] ** 2 + V[1] ** 2);
        return {
          prompt: t`With $g_{\mu\nu} = ${matTeX(g)}$, how long is the vector $V^\mu = ${vecTeX(V)}$? Give 3 significant figures.`,
          visual: ind(g, V.map((x) => x * 0.6), V, t`$\mathbf V$ at 0.6 scale and the metric’s unit circle: $|\mathbf V|$ is how many times longer than the gold radius in its direction the arrow is. ${AXES_NOTE}`, { showV: false, uname: 'V' }),
          answer: Math.sqrt(L2), tol: { rel: 0.005 },
          errors: [{ value: Math.hypot(V[0], V[1]), feedback: 'Pythagoras on the components assumes a perpendicular unit basis. Use g(V, V).' }, { value: L2, feedback: t`That is $|\mathbf V|^2$; take the square root.` }].filter((e) => Math.abs(e.value - Math.sqrt(L2)) > 0.01),
          hints: [t`$|\mathbf V|^2 = g_{\mu\nu}V^\mu V^\nu$.`],
          teach: t`$|\mathbf V| = \sqrt{g_{\mu\nu}V^\mu V^\nu}$ — the metric, not the components alone, decides the length.`,
          explain: t`$|\mathbf V|^2 = ${L2}$, so $|\mathbf V| = ${nice(Math.sqrt(L2), 3)}$.`,
        };
      },
    }),
    num({
      id: 'from-basis', difficulty: 1,
      gen(r) {
        let e1, e2;
        do { e1 = [r.intExcept(-2, 3, [0]), r.int(-2, 2)]; e2 = [r.int(-2, 2), r.intExcept(-2, 3, [0])]; } while (e1[0] * e2[1] - e1[1] * e2[0] === 0 || e1[0] * e2[0] + e1[1] * e2[1] === 0);
        const which = r.pick(['12', '11', '22']);
        const ans = which === '12' ? e1[0] * e2[0] + e1[1] * e2[1] : which === '11' ? e1[0] ** 2 + e1[1] ** 2 : e2[0] ** 2 + e2[1] ** 2;
        return {
          prompt: t`A basis has Cartesian components $\mathbf e_1 = ${vecTeX(e1)}$ and $\mathbf e_2 = ${vecTeX(e2)}$. What is the metric component $g_{${which}}$ in this basis?`,
          visual: still({ basis: [e1, e2].map((e) => e.map((x) => x * 0.6)), showVector: false, construction: false, grid: 'paper' }, t`The two basis arrows at 0.6 scale on Cartesian graph paper.`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: which === '12' ? [{ value: e1[0] * e2[1] - e1[1] * e2[0], feedback: 'That is the determinant (an area), not the dot product.' }].filter((e) => e.value !== ans) : [{ value: Math.sqrt(ans), feedback: t`That is the length; $g_{${which}}$ is the squared length, $\mathbf e\cdot\mathbf e$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$g_{${which}} = \mathbf e_${which[0]}\cdot\mathbf e_${which[1]}$, computed with the Cartesian components.`],
          teach: t`The metric’s components are the basis arrows’ dot products: $g_{\mu\nu} = \mathbf e_\mu\cdot\mathbf e_\nu$.`,
          explain: t`$g_{${which}} = \mathbf e_${which[0]}\cdot\mathbf e_${which[1]} = ${ans}$.`,
        };
      },
    }),
    num({
      id: 'basis-angle', difficulty: 2,
      gen(r) {
        const ang = r.pick([30, 45, 60, 120, 135]), L1 = r.pick([1, 2, 3]), L2 = r.pick([1, 2]);
        const g12 = L1 * L2 * Math.cos(ang * DEG);
        const g = [[L1 * L1, +g12.toFixed(4)], [+g12.toFixed(4), L2 * L2]];
        return {
          prompt: t`A metric has components $g_{11} = ${L1 * L1}$, $g_{22} = ${L2 * L2}$ and $g_{12} = g_{21} = ${nice(g12, 4)}$. What angle, in degrees, do the basis arrows make with each other?`,
          visual: ind(g, [1 / L1, 0], [0, 1 / L2], t`The unit circle of $g$ on component axes; the arrows are the unit vectors along $\mathbf e_1$ and $\mathbf e_2$ (lengths $1/${L1}$ and $1/${L2}$ in components). ${AXES_NOTE}`, { uname: 'ê₁', vname: 'ê₂' }),
          answer: ang, units: 'deg', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 90 - ang, feedback: 'That is the complement. cos α = g₁₂/(|e₁||e₂|) gives the angle itself.' }, { value: (Math.acos(Math.max(-1, Math.min(1, g12))) / DEG), feedback: t`Divide by the lengths $|\mathbf e_1| = \sqrt{g_{11}}$ and $|\mathbf e_2| = \sqrt{g_{22}}$ first.` }].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - ang) > 0.5),
          hints: [t`$\cos\alpha = \dfrac{g_{12}}{\sqrt{g_{11}g_{22}}}$.`],
          teach: t`The off-diagonal metric component records the angle between basis arrows: $g_{12} = |\mathbf e_1||\mathbf e_2|\cos\alpha$.`,
          explain: t`$\cos\alpha = ${nice(g12, 4)}/(${L1}\cdot${L2}) = ${nice(Math.cos(ang * DEG), 4)}$, so $\alpha = ${ang}^\circ$.`,
        };
      },
    }),
    mcq({
      id: 'properties', difficulty: 2,
      prompt: 'Which of these is NOT part of the definition of a metric?',
      visual: ind([[1, 0.5], [0.5, 1]], [1.2, 0.2], [0.2, 1.2], t`A metric’s unit circle and two vectors. ${AXES_NOTE}`),
      choices: [t`$g(\mathbf V, \mathbf V) > 0$ for every nonzero $\mathbf V$`, t`$g$ is linear in each slot`, t`$g(\mathbf U, \mathbf V) = g(\mathbf V, \mathbf U)$`, t`$g(\mathbf U, \mathbf V) = 0$ for all $\mathbf V$ only if $\mathbf U = \mathbf 0$`],
      answer: 0,
      why: {
        1: 'Without linearity in each slot g would not be a tensor at all.',
        2: 'Symmetry is required: the dot product does not care about order.',
        3: 'That is non-degeneracy, which is required — it is what makes raising indices possible (lesson A6.5).',
      },
      hints: ['Think of spacetime: can a nonzero four-vector have zero “length squared”?'],
      teach: 'A metric is a symmetric, non-degenerate (0,2) tensor; positivity is extra and fails in spacetime.',
      explain: t`Positivity defines a *Riemannian* metric. The spacetime metric is not positive: light-like vectors have $g(\mathbf V, \mathbf V) = 0$ and time-like ones a negative value (lesson A6.6).`,
    }),
    {
      type: 'point', id: 'perpendicular', difficulty: 2,
      prompt: t`The metric is $g_{\mu\nu} = ${matTeX([[1, 0.5], [0.5, 1]])}$ and $\mathbf U = \mathbf e_1$. Drag $\mathbf V$ to the vector with $V^1 = 1$ that is perpendicular to $\mathbf U$ — that is, $g(\mathbf U, \mathbf V) = 0$.`,
      visual: { type: 'ten-metric', params: { mode: 'form', tname: 'g', T: [[1, 0.5], [0.5, 1]], U: [1, 0], V: [1, 1], dragU: false, indicatrix: true, readout: false, crossings: false, view: 2.3 }, caption: t`Teal: the covector $g(\mathbf U, \cdot\,)$ at whole-number values. ${AXES_NOTE}` },
      answer: { x: 1, y: -2 }, tol: { x: 0.15, y: 0.15 },
      instruction: 'Drag the tip of V. Its components snap to 0.1.',
      hints: [t`$g(\mathbf U, \mathbf V) = V^1 + \tfrac12V^2$ for $\mathbf U = \mathbf e_1$.`, t`Set $1 + \tfrac12V^2 = 0$, or put the tip on the teal line marked 0.`],
      teach: t`$\mathbf V$ is perpendicular to $\mathbf U$ when it lies on the zero line of $g(\mathbf U, \cdot\,)$ — which need not look perpendicular on component axes.`,
      explain: t`$g(\mathbf U, \mathbf V) = V^1 + \tfrac12V^2 = 0$ with $V^1 = 1$ gives $V^2 = -2$: $\mathbf V = \mathbf e_1 - 2\mathbf e_2$. With $\mathbf e_2$ at $60^\circ$ to $\mathbf e_1$ that arrow is $(0, -\sqrt3)$ in Cartesian terms — straight down, perpendicular to $\mathbf e_1$. ✓`,
    },
    mcq({
      id: 'pythagoras-error', difficulty: 2, kind: 'error',
      prompt: t`In a basis with $g_{\mu\nu} = ${matTeX([[1, 0.5], [0.5, 1]])}$, a student finds the length of $V^\mu = (1, 1)$ as $\sqrt{1^2 + 1^2} = 1.41$. What is wrong?`,
      visual: still({ basis: [[1, 0], [0.5, S3]], vector: [1.5, S3], grid: 'basis' }, t`The basis this metric describes (unit arrows at $60^\circ$) and $\mathbf V = \mathbf e_1 + \mathbf e_2$, drawn true to shape.`),
      choices: [t`The cross term is missing: $|\mathbf V|^2 = 1 + 2\cdot\tfrac12 + 1 = 3$, so $|\mathbf V| = 1.73$`, t`The components should be squared and doubled: $|\mathbf V| = 2$`, 'Nothing: lengths do not depend on the basis, so Pythagoras always works', t`$|\mathbf V|^2 = g_{12}$, so $|\mathbf V| = 0.71$`],
      answer: 0,
      why: {
        1: t`Doubling is the cross term’s job only: $2g_{12}V^1V^2 = 1$, not $2(V^1)^2$.`,
        2: 'The length does not depend on the basis — but the formula in terms of components does.',
        3: t`$g_{12}$ is one component; the length needs all of $g_{\mu\nu}V^\mu V^\nu$.`,
      },
      hints: [t`Write out $g_{\mu\nu}V^\mu V^\nu$: four terms, two of them the same.`],
      teach: t`Pythagoras on components holds only in a perpendicular unit basis; in general $|\mathbf V|^2 = g_{\mu\nu}V^\mu V^\nu$.`,
      explain: t`$|\mathbf V|^2 = 1 + 1 + 2(\tfrac12) = 3$, $|\mathbf V| = \sqrt3 = 1.73$ — the long diagonal of a rhombus with $60^\circ$ angles.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-dot', difficulty: 2,
      gen(r) {
        let g, U, V, ans;
        do { g = r.pick(METRICS); U = [r.intExcept(-3, 3, [0]), r.intExcept(-2, 2, [0])]; V = [r.intExcept(-2, 2, [0]), r.int(-3, 3)]; ans = bil(g, U, V); } while (ans === 0 || ans === U[0] * V[0] + U[1] * V[1]);
        return {
          prompt: t`$g_{\mu\nu} = ${matTeX(g)}$, $U^\mu = ${vecTeX(U)}$, $V^\nu = ${vecTeX(V)}$. Find $g(\mathbf U, \mathbf V)$.`,
          visual: ind(g, U.map((x) => x * 0.6), V.map((x) => x * 0.6), t`The unit circle of $g$ and the two arrows at 0.6 scale. ${AXES_NOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          hints: [t`$g_{\mu\nu}U^\mu V^\nu$, four terms.`],
          teach: t`$g(\mathbf U, \mathbf V) = g_{\mu\nu}U^\mu V^\nu$.`,
          explain: t`$g(\mathbf U, \mathbf V) = ${ans}$.`,
        };
      },
    }),
    num({
      id: 'cp-lisa', difficulty: 3, transfer: true,
      gen(r) {
        const [a, b, what] = r.pick([[0.5, 0.5, 'from spacecraft 1 to the midpoint of the far arm'], [1, -1, 'from spacecraft 3 to spacecraft 2'], [1, 1, 'from spacecraft 1 to the far corner of the parallelogram on the two arms']]);
        const L = 2.5e6, d = L * Math.sqrt(a * a + b * b + a * b);
        return {
          prompt: t`The space gravitational-wave observatory LISA is planned as three spacecraft in a triangle with arms $L = 2.5$ million km at $60^\circ$. Use the two arms from spacecraft 1 as a basis, $\mathbf e_1$ (to spacecraft 2) and $\mathbf e_2$ (to spacecraft 3), so $g_{\mu\nu} = L^2${matTeX([[1, 0.5], [0.5, 1]])}$. How long, in km, is the vector $V^\mu = (${a}, ${b})$, ${what}?`,
          visual: still({ basis: [[1.6, 0], [0.8, 1.6 * S3]], vector: [1.6 * a + 0.8 * b, 1.6 * S3 * b], names: ['arm 1', 'arm 2'], vname: 'V', grid: 'none' }, t`LISA’s triangle (schematic): the two arms from spacecraft 1 as a basis, and $\mathbf V$.`),
          answer: d, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: L * Math.hypot(a, b), feedback: 'The arms are at 60°, not 90°: include the cross term 2g₁₂V¹V².' }].filter((e) => Math.abs(e.value - d) > 0.005 * d),
          hints: [t`$|\mathbf V|^2 = L^2\big((V^1)^2 + V^1V^2 + (V^2)^2\big)$.`, 'Keep L in km and take the square root at the end.'],
          teach: 'A non-perpendicular basis is fine once its metric is known: lengths come from g.',
          explain: t`$|\mathbf V| = L\sqrt{${a * a} + (${a * b}) + ${b * b}} = ${tex(d, 4)}$ km.${a === 1 && b === -1 ? ' That is one arm length: the triangle is equilateral. ✓' : ''}`,
        };
      },
    }),
    mcq({
      id: 'cp-degenerate', difficulty: 2,
      prompt: t`Why can $g_{\mu\nu} = ${matTeX([[1, 2], [2, 4]])}$ not be a metric?`,
      visual: form({ T: [[1, 2], [2, 4]], U: [2, -1], V: [1, 1], tname: 'g', view: 2, levelLabels: true }, t`The arrow $\mathbf U = (2, -1)$ fed to this tensor: no teal lines appear — $g(\mathbf U, \cdot\,)$ is the zero covector. ${AXES_NOTE}`),
      choices: [t`It is degenerate: $\det = 0$, so the nonzero vector $(2, -1)$ has zero dot product with every vector`, 'It is not symmetric', 'Its entries are not all equal to 1', 'Its off-diagonal entries are larger than 1'],
      answer: 0,
      why: {
        1: t`It is symmetric: $g_{12} = g_{21} = 2$.`,
        2: 'Metric components can be any numbers that make a symmetric, non-degenerate matrix.',
        3: t`Large off-diagonal entries are allowed if the diagonal is large enough: $\det$ is what matters.`,
      },
      hints: [t`Find a nonzero $\mathbf U$ with $g_{\mu\nu}U^\mu = 0$ for both $\nu$.`],
      teach: 'A metric must be non-degenerate: no nonzero vector may be perpendicular to everything (det g ≠ 0).',
      explain: t`$g_{\mu\nu}U^\mu$ for $\mathbf U = (2, -1)$ is $(2 - 2, 4 - 4) = (0, 0)$. Such a $g$ cannot be inverted, so it could not raise indices (lesson A6.5).`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1–2 (the metric)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §3.5', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'ESA: LISA mission (2.5 million km arms)', url: 'https://www.esa.int/Science_Exploration/Space_Science/LISA' },
    { label: 'Graphene lattice constant a = 2.46 Å (Castro Neto et al., Rev. Mod. Phys. 81, 109)', url: 'https://doi.org/10.1103/RevModPhys.81.109' },
  ],
});
