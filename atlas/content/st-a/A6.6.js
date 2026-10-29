// Signature and the Minkowski metric: diagonalise a metric and count the
// signs; Sylvester's law of inertia says no change of basis can alter the
// count ("you can't change the signs"). η = diag(−1, 1, 1, 1); timelike, null
// and spacelike vectors; the (+,−,−,−) convention; light-cone coordinates.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { form, matTeX, vecTeX, cong, det2, r6, AXES_NOTE } from './_metric.js';

const t = String.raw;
const DEG = Math.PI / 180;
const ETA_XT = [[1, 0], [0, -1]];      // (x across, t up)
const LC = [[0, -0.5], [-0.5, 0]];
const mink = (U, V, caption, extra = {}) => form({ T: ETA_XT, U, V, tname: '\\eta', axes: ['x', 't'], indicatrix: true, feed: false, view: 1.8, ...extra }, caption);
const BASES = [[[1, 1], [0, 1]], [[1, 0], [1, 1]], [[2, 1], [1, 1]], [[1, -1], [1, 2]], [[1, 2], [0, 1]], [[1, 1], [-1, 2]]];
const sigOf = (g) => { const d = det2(g), tr = g[0][0] + g[1][1]; return d < 0 ? [1, 1] : tr > 0 ? [0, 2] : [2, 0]; };   // [neg, pos]

export default lesson({
  id: 'st-a.A6.6',
  title: 'Signature and the Minkowski metric',
  minutes: 12, difficulty: 3,
  intro: t`Choose basis arrows that are mutually perpendicular under $g$ and rescale each so that $|g(\mathbf e_\mu, \mathbf e_\mu)| = 1$. The metric becomes diagonal with entries $\pm1$, and the list of signs is its **signature**. For ordinary space it is $(+, +, +)$ — a *Riemannian* metric. For spacetime it is one minus and three plus, the **Minkowski metric** of special relativity (with $c = 1$):

$$\eta_{\mu\nu} = \operatorname{diag}(-1, 1, 1, 1), \qquad ds^2 = -dt^2 + dx^2 + dy^2 + dz^2$$

**Sylvester’s law of inertia** says the count is fixed: under any change of basis, $g' = A^\mathsf{T}gA$ can rescale and mix the entries, but it **cannot change the number of minus signs**. So the signature is a property of the metric, not of the basis — you cannot get rid of time by a clever choice of axes. The minus sign sorts vectors into three kinds: **timelike** ($g(\mathbf V, \mathbf V) < 0$, inside the light cone), **null** ($= 0$, on it) and **spacelike** ($> 0$). Signature is not read off the diagonal of an arbitrary basis: light-cone coordinates give $ds^2 = -du\,dv$, with zeros on the diagonal, and still signature $(-, +)$. Many books use $(+, -, -, -)$ instead; every sign of $g(\mathbf V, \mathbf V)$ flips, and the physics does not change. The Road’s step 4 used the interval; this lesson is the algebra underneath.`,
  symbols: [
    { tex: t`\eta_{\mu\nu}`, text: t`the Minkowski metric in an inertial frame, order $(t, x, y, z)$` },
    { tex: t`(-, +, +, +)`, text: 'the signature: the signs of the diagonal once the metric is diagonalised' },
    { tex: t`ds^2`, text: t`the squared interval of a small step: negative for timelike, zero for null, positive for spacelike` },
    { tex: t`t,\ x,\ y,\ z`, text: t`inertial coordinates, with time measured in metres ($c = 1$)` },
  ],
  why: t`The single minus sign is what makes time different from space: it gives light cones, causality, proper time and the possibility of horizons — and Sylvester’s law guarantees no coordinate change can remove it.`,
  visual: {
    type: 'ten-metric',
    title: 'One minus sign that will not go away',
    lead: t`The sliders set a symmetric metric on component axes ($x$ across, $t$ up). The gold and violet curves are $g(\mathbf X, \mathbf X) = +1$ and $-1$; the dashed lines are the null directions. The readout gives the signature, the determinant, and $g$ evaluated on the two arrows — which are the components of $g$ in the basis $\{\mathbf U, \mathbf V\}$.`,
    tasks: [
      t`Drag $\mathbf U$ inside the light cone (timelike) and try to put $\mathbf V$ somewhere timelike with $g(\mathbf U, \mathbf V) = 0$. You cannot: the vectors perpendicular to a timelike one are all spacelike. That is Sylvester’s law in two dimensions.`,
      t`Slide $g_{12}$ anywhere: the hyperbolae tilt and the cone opens or closes, but the signature stays $(-, +)$, because $\det g = -1 - g_{12}^2$ stays negative.`,
      t`Now slide $g_{22}$ from $-1$ up through 0: at $\det g = 0$ the metric degenerates, and beyond it becomes $(+, +)$ with an ellipse. That is a different metric, not a change of basis.`,
    ],
    params: { mode: 'form', tname: 'g', T: [[1, 0], [0, -1]], sliders: 'sym', axes: ['x', 't'], U: [0.4, 1.3], V: [1.2, 0.3], uname: 'U', vname: 'V', feed: 'first', indicatrix: true, readout: ['T', 'sig', 'det', 'UU', 'VV', 'TUV', 'kind'] },
    caption: t`Gold: $g(\mathbf X, \mathbf X) = 1$; violet: $= -1$; dashed: null directions; teal: $g(\mathbf U, \cdot\,)$, whose zero line holds the vectors perpendicular to $\mathbf U$. ${AXES_NOTE}`,
  },
  example: {
    prompt: t`Light-cone coordinates $u = t - x$, $v = t + x$ (with $c = 1$) turn $ds^2 = -dt^2 + dx^2$ into $ds^2 = -du\,dv$. Find $g_{\mu\nu}$ in $(u, v)$, its determinant and its signature, then a basis that diagonalises it.`,
    visual: form({ T: LC, U: [1, 1], V: [-1, 1], uname: 'e′₀', vname: 'e′₁', tname: 'g', axes: ['u', 'v'], indicatrix: true, feed: false, view: 1.8 }, t`On $(u, v)$ component axes the null directions are the axes themselves; $\mathbf e'_0 = \partial_u + \partial_v$ lies on the curve $g = -1$, $\mathbf e'_1 = \partial_v - \partial_u$ on $g = +1$. ${AXES_NOTE}`),
    steps: [
      { label: 'Read off', text: t`$-du\,dv$ is a cross term only: $g_{uu} = g_{vv} = 0$ and $g_{uv} = g_{vu} = -\tfrac12$.` },
      { label: 'Determinant', text: t`$\det g = 0 - \tfrac14 = -\tfrac14 < 0$. In two dimensions a negative determinant means one eigenvalue of each sign: signature $(-, +)$ — although the diagonal holds no minus sign at all.` },
      { label: 'Null basis', text: t`$g(\partial_u, \partial_u) = g_{uu} = 0$: both coordinate basis vectors are null, pointing along the light cone.` },
      { label: 'Diagonalise', text: t`$\mathbf e'_0 = \partial_u + \partial_v$: $g = 0 + 2(-\tfrac12) + 0 = -1$. $\mathbf e'_1 = \partial_v - \partial_u$: $g = 0 - 2(-\tfrac12) + 0 = +1$. And $g(\mathbf e'_0, \mathbf e'_1) = -g_{uu} + g_{vv} + g_{uv} - g_{vu} = 0$. So $g' = \operatorname{diag}(-1, 1)$. ✓` },
      { label: 'Sense check', text: t`$\mathbf e'_0 = \partial_u + \partial_v$ is $\partial_t$ (moving forward in time at fixed $x$) and $\mathbf e'_1 = \partial_x$: we are back where we started, as Sylvester’s law said we must be.` },
    ],
    answer: t`$g_{\mu\nu} = ${matTeX(LC)}$, $\det g = -\tfrac14$, signature $(-, +)$; the basis $\partial_u + \partial_v$, $\partial_v - \partial_u$ turns it into $\operatorname{diag}(-1, 1)$.`,
  },
  practice: [
    num({
      id: 'eta-norm', difficulty: 1,
      gen(r) {
        let V, s;
        do { V = [r.int(1, 5), r.int(-4, 4), r.int(-3, 3), r.int(-3, 3)]; s = -(V[0] ** 2) + V[1] ** 2 + V[2] ** 2 + V[3] ** 2; } while (s === 0);
        return {
          prompt: t`With $c = 1$ and $\eta_{\mu\nu} = \operatorname{diag}(-1, 1, 1, 1)$, a vector has components $V^\mu = ${vecTeX(V)}$. Find $\eta(\mathbf V, \mathbf V)$. Is $\mathbf V$ timelike, null or spacelike?`,
          visual: mink([0.35 * Math.hypot(V[1], V[2], V[3]), 0.35 * V[0]].map(r6), [0.01, 0.01], t`$\mathbf V$ drawn in the plane of its time part and its total space part (0.35 scale), with the curves $\eta = \pm1$ and the light cone. ${AXES_NOTE}`, { showV: false, uname: 'V' }),
          answer: s, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: V[0] ** 2 + V[1] ** 2 + V[2] ** 2 + V[3] ** 2, feedback: t`That is the Euclidean sum of squares; $\eta_{00} = -1$.` }, { value: -s, feedback: t`That is the $(+, -, -, -)$ convention’s value. This course uses $(-, +, +, +)$.` }],
          hints: [t`$\eta(\mathbf V, \mathbf V) = -(V^0)^2 + (V^1)^2 + (V^2)^2 + (V^3)^2$.`],
          teach: t`In $(-, +, +, +)$, $\eta(\mathbf V, \mathbf V) < 0$ means timelike, $0$ null, $> 0$ spacelike.`,
          explain: t`$-${V[0] ** 2} + ${V[1] ** 2} + ${V[2] ** 2} + ${V[3] ** 2} = ${s}$: ${s < 0 ? 'timelike — inside the light cone' : 'spacelike — outside the light cone'}.`,
        };
      },
    }),
    num({
      id: 'count-negative', difficulty: 2,
      gen(r) {
        const D = r.pick([[[1, 0], [0, -1]], [[-1, 0], [0, 1]], [[1, 0], [0, 2]], [[-1, 0], [0, -2]], [[3, 0], [0, -1]]]);
        const A = r.pick(BASES);
        const g = cong(D, A);
        const [neg] = sigOf(g);
        return {
          prompt: t`A symmetric metric in two dimensions has components $g_{\mu\nu} = ${matTeX(g)}$. How many minus signs does its signature have (0, 1 or 2)?`,
          visual: form({ T: g, U: [0.01, 0.01], V: [0.01, 0.01], showU: false, showV: false, tname: 'g', indicatrix: true, view: 1.8 }, t`The curves $g(\mathbf X, \mathbf X) = \pm1$ of this metric (gold $+1$, violet $-1$), and its null directions if it has any. ${AXES_NOTE}`),
          answer: neg, tol: { rel: 0, abs: 0.1 },
          errors: [{ value: [g[0][0], g[1][1]].filter((x) => x < 0).length, feedback: t`The diagonal of a non-diagonal metric does not show the signature. Use $\det g$ and the trace (or the picture).` }].filter((e) => e.value !== neg),
          hints: [t`In two dimensions: $\det g < 0$ means one sign of each; $\det g > 0$ means both the same, + if the trace is positive.`, t`$\det g = ${det2(g)}$, trace $= ${g[0][0] + g[1][1]}$.`],
          teach: t`The signature counts the signs of the eigenvalues; in 2D, $\det g < 0$ means $(-, +)$.`,
          explain: t`$\det g = ${det2(g)}$${det2(g) < 0 ? ' < 0: one minus sign, signature (−, +) — a Lorentzian metric, with hyperbolae and a light cone' : `> 0 and trace $${g[0][0] + g[1][1]}$: ${neg ? 'two minus signs, (−, −)' : 'no minus signs, (+, +) — an ellipse'}`}. This metric is $\operatorname{diag}${vecTeX([D[0][0], D[1][1]])}$ in another basis.`,
        };
      },
    }),
    mcq({
      id: 'two-du-dv', difficulty: 2,
      prompt: t`A two-dimensional metric is $ds^2 = 2\,du\,dv$. What is its signature?`,
      visual: form({ T: [[0, 1], [1, 0]], U: [0.01, 0.01], V: [0.01, 0.01], showU: false, showV: false, tname: 'g', axes: ['u', 'v'], indicatrix: true, view: 1.8 }, t`The curves $g(\mathbf X, \mathbf X) = \pm1$ of $2\,du\,dv$ on $(u, v)$ component axes; the axes themselves are null. ${AXES_NOTE}`),
      choices: ['(−, +): its determinant is −1', '(+, +): there are no minus signs in it', '(0, 0): its diagonal is zero, so it is degenerate', 'It has no signature until it is written in diagonal form'],
      answer: 0,
      why: {
        1: t`Signs are read after diagonalising: $\mathbf e_u \pm \mathbf e_v$ give $g = \pm2$.`,
        2: t`Degenerate means $\det g = 0$; here $\det g = -1$.`,
        3: 'The signature belongs to the metric; any basis can be used to compute it.',
      },
      hints: [t`$g_{\mu\nu} = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$. What is its determinant?`],
      teach: 'Zeros on the diagonal hide nothing: diagonalise (or use det g) to find the signature.',
      explain: t`$g(\mathbf e_u + \mathbf e_v, \mathbf e_u + \mathbf e_v) = 2$ and $g(\mathbf e_u - \mathbf e_v, \mathbf e_u - \mathbf e_v) = -2$, perpendicular to each other: signature $(-, +)$. It is flat 2D spacetime in light-cone coordinates.`,
    }),
    multi({
      id: 'sylvester', difficulty: 3,
      prompt: t`Which of these could be the components of the 2D Minkowski metric $\operatorname{diag}(-1, 1)$ in some other basis? Select every one.`,
      visual: mink([0.4, 1.3], [1.2, 0.3], t`The Minkowski metric’s curves $\eta = \pm1$ and light cone, with two arrows that could serve as a new basis. ${AXES_NOTE}`),
      choices: [t`$\operatorname{diag}(-4, 9)$`, t`$\begin{pmatrix} 0 & -\tfrac12 \\ -\tfrac12 & 0 \end{pmatrix}$`, t`$\begin{pmatrix} 1 & 2 \\ 2 & 1 \end{pmatrix}$`, t`$\operatorname{diag}(1, 1)$`, t`$\operatorname{diag}(-1, -1)$`, t`$\begin{pmatrix} 1 & 1 \\ 1 & 1 \end{pmatrix}$`],
      answer: [0, 1, 2],
      why: {
        3: 'Two plus signs: Sylvester’s law forbids losing the minus sign.',
        4: 'Two minus signs: a change of basis cannot create one either.',
        5: 'Its determinant is 0: degenerate. A change of basis multiplies det g by (det A)², which is never zero.',
      },
      hints: [t`A change of basis gives $g' = A^\mathsf{T}gA$, with $\det g' = (\det A)^2\det g$. What sign must $\det g'$ have?`, t`Negative determinant ⇒ one eigenvalue of each sign; check each candidate.`],
      teach: 'Sylvester’s law: a change of basis can rescale and mix a metric’s components but never change how many signs are negative.',
      explain: t`$\det$ must stay negative: $-36$, $-\tfrac14$ and $-3$ qualify (scaled axes, light-cone axes, skewed axes). $\operatorname{diag}(1, 1)$ and $\operatorname{diag}(-1, -1)$ have the wrong signature; the last is degenerate.`,
    }),
    num({
      id: 'sqrt-abs-g', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 3, 5]), th = r.pick([30, 60, 90, 120]);
        const ans = R * R * Math.sin(th * DEG);
        return {
          prompt: t`Minkowski spacetime in spherical coordinates has $ds^2 = -dt^2 + dr^2 + r^2d\theta^2 + r^2\sin^2\theta\,d\phi^2$. Find $\sqrt{|\det g|}$ at $r = ${R}$, $\theta = ${th}^\circ$.`,
          visual: { type: 'c3-coords', params: { system: 'spherical', point: [2, th, 40], sliders: false, element: true, edgeLabels: false, readouts: [], range: 3 }, caption: t`The spatial coordinate box at the point (drawn at $r = 2$); the time direction adds a factor $\sqrt{|{-1}|} = 1$.` },
          answer: r6(ans), tol: { rel: 0.005 },
          errors: [{ value: R * Math.sin(th * DEG), feedback: t`$\det g = -r^4\sin^2\theta$: the square root has $r^2$, not $r$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$\det g = (-1)\cdot1\cdot r^2\cdot r^2\sin^2\theta = -r^4\sin^2\theta < 0$.`, t`Take the absolute value first: $\sqrt{|\det g|} = r^2\sin\theta$.`],
          teach: t`A Lorentzian metric has $\det g < 0$, so the volume element is $\sqrt{|g|}\,d^4x$ — or $\sqrt{-g}$, as relativists often write.`,
          explain: t`$\sqrt{|\det g|} = ${R}^2\sin${th}^\circ = ${nice(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'other-convention', difficulty: 2,
      prompt: t`Many particle-physics books use the signature $(+, -, -, -)$: $\eta = \operatorname{diag}(1, -1, -1, -1)$. Compared with this course’s $(-, +, +, +)$, what changes?`,
      visual: mink([0.4, 1.3], [1.2, 0.3], t`The same light cone serves both conventions; only the labels $\pm1$ on the hyperbolae swap. ${AXES_NOTE}`),
      choices: [t`Every $g(\mathbf V, \mathbf V)$ flips sign — a four-velocity has $u_\mu u^\mu = +1$ instead of $-1$ — but the light cone, and all measurable physics, stay the same`, 'Time becomes a space direction and vice versa', 'Massive particles then move on spacelike worldlines', 'The speed of light changes sign'],
      answer: 0,
      why: {
        1: 'One direction is still singled out by its sign: the time direction is the same in both.',
        2: t`Timelike still means inside the light cone; only the sign used to label it flips.`,
        3: 'c is a positive speed in every convention; the convention is about the metric’s overall sign.',
      },
      hints: [t`What happens to $\eta(\mathbf V, \mathbf V)$ if every entry of $\eta$ changes sign?`],
      teach: t`Flipping the overall sign of the metric flips every squared interval but changes no physics; always check which convention a source uses.`,
      explain: t`$g \to -g$ flips $g(\mathbf V, \mathbf V)$, so $u\cdot u = -1$ becomes $+1$ and timelike means positive. Null stays null and the cone stays put. The signature in the Sylvester sense — one sign different from the rest — is the same.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-count', difficulty: 2,
      gen(r) {
        const D = r.pick([[[1, 0], [0, -2]], [[-3, 0], [0, 1]], [[2, 0], [0, 1]], [[-1, 0], [0, -1]]]);
        const A = r.pick(BASES), g = cong(D, A), [neg] = sigOf(g);
        return {
          prompt: t`How many minus signs are in the signature of $g_{\mu\nu} = ${matTeX(g)}$?`,
          visual: form({ T: g, U: [0.01, 0.01], V: [0.01, 0.01], showU: false, showV: false, tname: 'g', indicatrix: true, view: 1.8, indicatrixLabels: false }, t`The metric’s curves $g(\mathbf X, \mathbf X) = \pm1$ (gold $+$, violet $-$). ${AXES_NOTE}`),
          answer: neg, tol: { rel: 0, abs: 0.1 },
          hints: [t`$\det g = ${det2(g)}$; trace $= ${g[0][0] + g[1][1]}$.`],
          teach: t`In 2D: $\det g < 0$ ⇒ $(-, +)$; $\det g > 0$ ⇒ both signs equal to the sign of the trace.`,
          explain: t`${neg === 1 ? t`$\det g < 0$: signature $(-, +)$.` : neg === 0 ? t`$\det g > 0$ and a positive trace: $(+, +)$.` : t`$\det g > 0$ and a negative trace: $(-, -)$.`}`,
        };
      },
    }),
    mcq({
      id: 'cp-horizon', difficulty: 3, transfer: true,
      prompt: t`Inside a black hole’s horizon ($r < r_s$), the Schwarzschild metric $ds^2 = -\left(1 - \frac{r_s}{r}\right)dt^2 + \left(1 - \frac{r_s}{r}\right)^{-1}dr^2 + r^2d\Omega^2$ has $g_{tt} > 0$ and $g_{rr} < 0$. What is its signature there, and what does that mean?`,
      visual: form({ T: [[-2, 0], [0, 0.5]], U: [0.01, 0.01], V: [0.01, 0.01], showU: false, showV: false, tname: 'g', axes: ['r', 't'], indicatrix: true, view: 1.8 }, t`The $(r, t)$ part of the metric at $r = \tfrac23 r_s$, on component axes ($r$ across, $t$ up): now the violet (timelike) branches open along the $r$ axis. ${AXES_NOTE}`),
      choices: [
        t`Still $(-, +, +, +)$ — Sylvester’s law — but now $r$ is the timelike coordinate: decreasing $r$ is the future, and nothing can stay at constant $r$`,
        t`$(+, -, +, +)$: the signature changes at the horizon`,
        t`$(+, +, +, +)$: time stops inside the horizon`,
        t`The metric is degenerate everywhere inside, so it has no signature`,
      ],
      answer: 0,
      why: {
        1: 'A signature is a count of signs, and a smooth non-degenerate metric keeps its count; only which coordinate carries the minus sign has changed.',
        2: t`One coefficient is still negative: $g_{rr} < 0$.`,
        3: t`$\det g = -r^4\sin^2\theta \ne 0$ inside the horizon; the trouble at $r = r_s$ is in these coordinates only.`,
      },
      hints: ['Count the negative diagonal entries inside the horizon.', 'Which coordinate’s basis vector is timelike when its metric component is negative?'],
      teach: 'The signature of spacetime never changes; inside a horizon the coordinate r simply takes over the role of time.',
      explain: t`One negative entry ($g_{rr}$), three positive: $(-, +, +, +)$ as everywhere. Since $\partial_r$ is timelike, every future-directed worldline must move to smaller $r$ — the singularity is in the future, not a place you can steer around.`,
    }),
    num({
      id: 'cp-null', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[3, 4], [5, 12], [8, 15], [6, 8]]);
        const comp = r.pick(['x', 'y']);
        const t0 = Math.hypot(a, b);
        return {
          prompt: t`With $c = 1$, a light ray in some frame has four-momentum direction $k^\mu = (k^t, ${comp === 'x' ? `${a}, ${b}` : `${b}, ${a}`}, 0)$ with $k^t > 0$. A light ray is null: $\eta(\mathbf k, \mathbf k) = 0$. Find $k^t$.`,
          visual: mink([0.9, 0.9], [0.01, 0.01], t`A null vector lies on the light cone (dashed), between the timelike and spacelike hyperbolae. Schematic: the spatial part is drawn along one axis. ${AXES_NOTE}`, { showV: false, uname: 'k' }),
          answer: t0, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: a + b, feedback: 'The spatial part is a vector: its size is √(a² + b²), not a + b.' }],
          hints: [t`$-(k^t)^2 + ${a}^2 + ${b}^2 = 0$.`],
          teach: t`A null vector’s time component equals the size of its space part (with $c = 1$).`,
          explain: t`$k^t = \sqrt{${a * a} + ${b * b}} = ${t0}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1–2 (the Minkowski metric; signature)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Sylvester’s law of inertia', url: 'https://en.wikipedia.org/wiki/Sylvester%27s_law_of_inertia' },
    { label: 'Metric signature (sign conventions)', url: 'https://en.wikipedia.org/wiki/Metric_signature' },
  ],
});
