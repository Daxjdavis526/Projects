// The inverse metric g^{μν}: defined by g^{μλ}g_λν = δ^μ_ν, it is the matrix
// inverse (which exists because g is non-degenerate), a (2,0) tensor — the
// dot product of covectors — and it raises indices. Reciprocals only for a
// diagonal metric; g^{μν}g_μν = n.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { form, matTeX, vecTeX, inv2, mv, fr, r6, AXES_NOTE } from './_metric.js';

const t = String.raw;
const DEG = Math.PI / 180;
const NONDIAG = [[[2, 1], [1, 1]], [[1, 1], [1, 2]], [[3, 1], [1, 1]], [[2, 1], [1, 3]], [[1, -1], [-1, 2]], [[4, 2], [2, 3]], [[1, 2], [2, 5]]];
const raisePic = (g, w, caption, extra = {}) => form({ T: g, covector: w, covSliders: false, tname: 'g', levelLabels: true, view: 2, ...extra }, caption);

export default lesson({
  id: 'st-a.A6.5',
  title: 'The inverse metric',
  minutes: 11, difficulty: 3,
  intro: t`Lowering is “multiply by $g_{\mu\nu}$”, so raising must undo it. The **inverse metric** $g^{\mu\nu}$ is defined by

$$g^{\mu\lambda}\,g_{\lambda\nu} = \delta^\mu_\nu$$

— as matrices, $g^{-1}$, which exists because a metric is non-degenerate ($\det g \ne 0$). It is a symmetric **(2,0) tensor**: a metric for covectors. It raises indices, $\omega^\mu = g^{\mu\nu}\omega_\nu$, and it measures covectors directly: $|df|^2 = g^{\mu\nu}\,\partial_\mu f\,\partial_\nu f$ is the squared size of a gradient. Two traps. **Only a diagonal metric inverts entry by entry**: polar $g^{\mu\nu} = \operatorname{diag}(1, 1/r^2)$, spherical $\operatorname{diag}(1, 1/r^2, 1/(r^2\sin^2\theta))$, and Minkowski $\eta^{\mu\nu} = \eta_{\mu\nu}$; for anything else, $g^{12} \ne 1/g_{12}$. And contracting the two fully gives the dimension, $g^{\mu\nu}g_{\mu\nu} = \delta^\mu_\mu = n$ — 2 on a surface, 4 in spacetime — not 1.`,
  symbols: [
    { tex: t`g^{\mu\nu}`, text: 'the inverse metric: the inverse matrix of the metric’s components' },
    { tex: t`g_{\lambda\nu}`, text: 'the metric' },
    { tex: t`\delta^\mu_\nu`, text: 'the Kronecker delta: 1 when μ = ν, 0 otherwise' },
    { tex: t`\lambda`, text: 'the summed (dummy) index joining the two' },
  ],
  why: t`Every field equation uses both: the Christoffel symbols, the Laplacian $g^{\mu\nu}\nabla_\mu\nabla_\nu$ and the scalar curvature $R = g^{\mu\nu}R_{\mu\nu}$ all contract with the inverse metric.`,
  visual: {
    type: 'ten-metric',
    title: 'From a stack back to an arrow',
    lead: t`The sliders set a covector $\omega$ (teal stack). The gold arrow is $\omega^\mu = g^{\mu\nu}\omega_\nu$, the vector the inverse metric makes from it; the readout gives $g_{\mu\nu}$, $g^{\mu\nu}$ and both sets of components. Change the metric with the buttons.`,
    tasks: [
      t`Euclidean: the raised arrow is perpendicular to the stack, and it crosses $\omega_\mu\omega^\mu = |\omega|^2$ lines.`,
      t`Stretched, $g = \operatorname{diag}(1, 4)$: $g^{22} = \tfrac14$, so the arrow’s second component shrinks fourfold.`,
      t`Skewed: $g_{12} = +\tfrac12$ but $g^{12} = -\tfrac23$ — not $1/g_{12} = 2$, and not even the same sign.`,
    ],
    params: { mode: 'form', tname: 'g', T: [[1, 0], [0, 1]], presets: [{ label: 'Euclidean', T: [[1, 0], [0, 1]] }, { label: 'Stretched diag(1, 4)', T: [[1, 0], [0, 4]] }, { label: 'Skewed (60° basis)', T: [[1, 0.5], [0.5, 1]] }, { label: 'Minkowski diag(1, −1)', T: [[1, 0], [0, -1]] }], presetLabel: 'Metric', covector: [1, 0.8], readout: ['T', 'inv', 'w', 'raised', 'len'] },
    caption: t`Teal: the covector $\omega$ at whole-number values; gold: $\omega^\mu = g^{\mu\nu}\omega_\nu$, with the lines it crosses in bold. ${AXES_NOTE}`,
  },
  example: {
    prompt: t`In spherical coordinates, find $g^{\mu\nu}$ and check $g^{\mu\lambda}g_{\lambda\nu} = \delta^\mu_\nu$. Then raise the gradient of $f = z = r\cos\theta$ and find $|df|^2 = g^{\mu\nu}\partial_\mu f\,\partial_\nu f$.`,
    visual: { type: 'c3-coords', params: { system: 'spherical', point: [2, 55, 40], sliders: false, element: false, readouts: [], range: 3 }, caption: t`Spherical coordinates at a point, with the local directions of increasing $r$, $\theta$ and $\phi$. The gradient of the height $z$ points straight up.` },
    steps: [
      { label: 'Invert', text: t`$g_{\mu\nu} = \operatorname{diag}(1, r^2, r^2\sin^2\theta)$ is diagonal, so $g^{\mu\nu} = \operatorname{diag}\!\left(1, \dfrac{1}{r^2}, \dfrac{1}{r^2\sin^2\theta}\right)$. Each diagonal product is 1 and every off-diagonal one 0: $g^{\mu\lambda}g_{\lambda\nu} = \delta^\mu_\nu$. ✓` },
      { label: 'The gradient', text: t`$\partial_\mu f = (\partial_r, \partial_\theta, \partial_\phi)(r\cos\theta) = (\cos\theta,\ -r\sin\theta,\ 0)$.` },
      { label: 'Raise', text: t`$(\nabla f)^\mu = g^{\mu\nu}\partial_\nu f = (\cos\theta,\ -\sin\theta/r,\ 0)$ — exactly the components of $\partial_z$ found in lesson A4.4. The gradient vector of the height is the unit vector up. ✓` },
      { label: 'Its size', text: t`$|df|^2 = 1\cdot\cos^2\theta + \dfrac{1}{r^2}\,r^2\sin^2\theta + 0 = 1$. ✓ The height grows at 1 metre per metre straight up.` },
      { label: 'Trace', text: t`$g^{\mu\nu}g_{\mu\nu} = 1 + 1 + 1 = 3$: the dimension of space.` },
    ],
    answer: t`$g^{\mu\nu} = \operatorname{diag}(1, r^{-2}, (r\sin\theta)^{-2})$; $\nabla z = \cos\theta\,\partial_r - (\sin\theta/r)\,\partial_\theta = \partial_z$; $|dz|^2 = 1$.`,
  },
  practice: [
    num({
      id: 'invert', difficulty: 2,
      gen(r) {
        const g = r.pick(NONDIAG), G = inv2(g);
        const [i, j] = r.pick([[1, 2], [1, 1], [2, 2]]);
        const ans = G[i - 1][j - 1];
        return {
          prompt: t`Find the inverse-metric component $g^{${i}${j}}$ for $g_{\mu\nu} = ${matTeX(g)}$.`,
          visual: raisePic(g, [1, 0.5], t`A covector $\omega = (1, 0.5)$ and the vector $g^{\mu\nu}\omega_\nu$ this metric raises it to. ${AXES_NOTE}`),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: 1 / g[i - 1][j - 1], feedback: t`Inverting entry by entry works only for a diagonal metric. Use the $2\times2$ inverse: swap the diagonal, negate the off-diagonal, divide by $\det g$.` }, { value: i === j ? g[2 - i][2 - j] : -g[0][1], feedback: t`Divide by $\det g = ${g[0][0] * g[1][1] - g[0][1] ** 2}$.` }].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - ans) > 0.005),
          hints: [t`$\begin{pmatrix} a & b \\ b & d \end{pmatrix}^{-1} = \dfrac{1}{ad - b^2}\begin{pmatrix} d & -b \\ -b & a \end{pmatrix}$.`, t`Here $\det g = ${g[0][0] * g[1][1] - g[0][1] ** 2}$.`],
          teach: t`$g^{\mu\nu}$ is the matrix inverse of $g_{\mu\nu}$; only when $g$ is diagonal is $g^{11} = 1/g_{11}$.`,
          explain: t`$g^{\mu\nu} = ${matTeX(G)}$, so $g^{${i}${j}} = ${fr(ans)}$. Check: $g^{\mu\lambda}g_{\lambda\nu} = \delta^\mu_\nu$.`,
        };
      },
    }),
    num({
      id: 'sph-inverse', difficulty: 1,
      gen(r) {
        const R = r.pick([2, 3, 4]), th = r.pick([30, 45, 60, 90]);
        const which = r.pick(['tt', 'pp']);
        const ans = which === 'tt' ? 1 / (R * R) : 1 / (R * Math.sin(th * DEG)) ** 2;
        return {
          prompt: t`In spherical coordinates at $r = ${R}$, $\theta = ${th}^\circ$, what is ${which === 'tt' ? t`$g^{\theta\theta}$` : t`$g^{\phi\phi}$`}?`,
          visual: { type: 'c3-coords', params: { system: 'spherical', point: [2, th, 40], sliders: false, element: true, edgeLabels: false, readouts: [], range: 3 }, caption: t`The coordinate box at $\theta = ${th}^\circ$ (drawn at $r = 2$): an orthogonal grid, so the metric is diagonal.` },
          answer: r6(ans), tol: { rel: 0.005 },
          errors: [{ value: which === 'tt' ? R * R : (R * Math.sin(th * DEG)) ** 2, feedback: t`That is the metric component $g_{${which === 'tt' ? '\\theta\\theta' : '\\phi\\phi'}}$; the inverse of a diagonal metric has the reciprocals.` }, { value: which === 'tt' ? 1 / R : 1 / (R * Math.sin(th * DEG)), feedback: t`That is the reciprocal of a length; $g^{\mu\mu} = 1/g_{\mu\mu}$ is the reciprocal of a squared length.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$g_{\mu\nu}$ is diagonal, so each $g^{\mu\mu} = 1/g_{\mu\mu}$.`],
          teach: t`A diagonal metric inverts entry by entry: spherical $g^{\mu\nu} = \operatorname{diag}(1, r^{-2}, (r\sin\theta)^{-2})$.`,
          explain: t`${which === 'tt' ? t`$g^{\theta\theta} = 1/${R}^2$` : t`$g^{\phi\phi} = 1/(${R}\sin${th}^\circ)^2$`} $= ${nice(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'trace', difficulty: 2,
      gen(r) {
        const g = r.pick(NONDIAG), G = inv2(g);
        const naive = g[0][0] * G[0][0] + g[1][1] * G[1][1];
        return {
          prompt: t`For $g_{\mu\nu} = ${matTeX(g)}$, compute the full contraction $g^{\mu\nu}g_{\mu\nu}$ (all four terms).`,
          visual: raisePic(g, [0.8, -0.6], t`This metric raising a covector. ${AXES_NOTE}`),
          answer: 2, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: 1, feedback: t`$g^{\mu\lambda}g_{\lambda\nu} = \delta^\mu_\nu$ is a matrix; its trace $\delta^\mu_\mu$ counts dimensions.` }, ...(Math.abs(naive - 2) > 0.01 ? [{ value: naive, feedback: t`The off-diagonal terms count too: $g^{12}g_{12} + g^{21}g_{21}$.` }] : [])],
          hints: [t`$g^{\mu\nu} = ${matTeX(G)}$. Multiply entry by entry and add all four products.`, t`Or reason: $g^{\mu\nu}g_{\nu\mu} = \delta^\mu_\mu$.`],
          teach: t`$g^{\mu\nu}g_{\mu\nu} = \delta^\mu_\mu = n$, whatever the metric.`,
          explain: t`$${fr(G[0][0])}\cdot${g[0][0]} + 2\cdot(${fr(G[0][1])})(${g[0][1]}) + ${fr(G[1][1])}\cdot${g[1][1]} = 2$ — the dimension. In spacetime it is 4.`,
        };
      },
    }),
    num({
      id: 'grad-size', difficulty: 3,
      gen(r) {
        const [f, ft, factor] = r.pick([['xy', t`xy = \tfrac12r^2\sin2\theta`, 1], ['x2y2', t`x^2 - y^2 = r^2\cos2\theta`, 2]]);
        const R = r.pick([1.5, 2, 3]), th = r.pick([20, 35, 50]);
        const s2 = Math.sin(2 * th * DEG), c2 = Math.cos(2 * th * DEG);
        const d = f === 'xy' ? [R * s2, R * R * c2] : [2 * R * c2, -2 * R * R * s2];
        const ans = factor * R;
        return {
          prompt: t`The function $f = ${ft}$ has polar gradient components $\partial_r f = ${f === 'xy' ? t`r\sin2\theta` : t`2r\cos2\theta`}$ and $\partial_\theta f = ${f === 'xy' ? t`r^2\cos2\theta` : t`-2r^2\sin2\theta`}$. Using $g^{\mu\nu} = \operatorname{diag}(1, 1/r^2)$, find $|df| = \sqrt{g^{\mu\nu}\partial_\mu f\,\partial_\nu f}$ at $(r, \theta) = (${R}, ${th}^\circ)$.`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-2, 2], equal: true, xlabel: 'x', ylabel: 'y', curves: [...[-2, -1, 1, 2].map((k) => (f === 'xy' ? { fn: `${k}/x`, color: 'teal', width: 1.3 } : { param: [k > 0 ? `${r6(Math.sqrt(Math.abs(k)))}*cosh(t)` : `${r6(Math.sqrt(Math.abs(k)))}*sinh(t)`, k > 0 ? `${r6(Math.sqrt(Math.abs(k)))}*sinh(t)` : `${r6(Math.sqrt(Math.abs(k)))}*cosh(t)`], t: [-2, 2], color: 'teal', width: 1.3 })), ...(f === 'xy' ? [] : [-2, -1, 1, 2].map((k) => ({ param: [k > 0 ? `-${r6(Math.sqrt(Math.abs(k)))}*cosh(t)` : `${r6(Math.sqrt(Math.abs(k)))}*sinh(t)`, k > 0 ? `${r6(Math.sqrt(Math.abs(k)))}*sinh(t)` : `-${r6(Math.sqrt(Math.abs(k)))}*cosh(t)`], t: [-2, 2], color: 'teal', width: 1.3 })))], points: [{ x: r6(R * Math.cos(th * DEG)), y: r6(R * Math.sin(th * DEG)), color: 'gold', label: 'P' }] }, caption: t`Level curves $f = \pm1, \pm2$ (hyperbolae) and the point P. The gradient’s size is how tightly they crowd there.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.hypot(d[0], d[1]), feedback: t`The $\theta$ component must be weighted by $g^{\theta\theta} = 1/r^2$: an angle is not a length.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$|df|^2 = (\partial_r f)^2 + \dfrac{1}{r^2}(\partial_\theta f)^2$.`, t`Simplify before substituting: ${f === 'xy' ? t`$r^2\sin^22\theta + r^2\cos^22\theta$` : t`$4r^2\cos^22\theta + 4r^2\sin^22\theta$`}.`],
          teach: t`The inverse metric measures covectors: $|df|^2 = g^{\mu\nu}\partial_\mu f\,\partial_\nu f$, and the result is the same in every coordinate system.`,
          explain: t`$|df|^2 = ${f === 'xy' ? 'r^2' : '4r^2'}$, so $|df| = ${factor === 1 ? '' : factor}r = ${nice(ans, 4)}$, independent of $\theta$. Check in Cartesian: $\nabla(${f === 'xy' ? 'xy' : 'x^2 - y^2'}) = ${f === 'xy' ? '(y, x)' : '(2x, -2y)'}$, of length $${factor === 1 ? '' : factor}r$. ✓`,
        };
      },
    }),
    mcq({
      id: 'reciprocal-trap', difficulty: 2,
      prompt: t`A student says: “$g^{\theta\theta} = 1/g_{\theta\theta}$, always.” When is that right?`,
      visual: raisePic([[1, 0.5], [0.5, 1]], [1, 0], t`A skewed metric ($g_{12} = \tfrac12$): here $g^{11} = \tfrac43$, not $1/g_{11} = 1$. ${AXES_NOTE}`),
      choices: [t`Only when the row and column of $\theta$ hold no other nonzero entries — in particular, for any diagonal metric`, 'Always: that is the definition of the inverse metric', 'Never', 'Only in Euclidean space'],
      answer: 0,
      why: {
        1: t`The definition is $g^{\mu\lambda}g_{\lambda\nu} = \delta^\mu_\nu$, a matrix inverse; off-diagonal entries feed into every component.`,
        2: 'For polar and spherical coordinates it is right, since their metrics are diagonal.',
        3: t`Minkowski space is not Euclidean, yet $\eta^{00} = 1/\eta_{00} = -1$ because $\eta$ is diagonal.`,
      },
      hints: [t`Invert $\begin{pmatrix} 1 & \tfrac12 \\ \tfrac12 & 1\end{pmatrix}$ and compare $g^{11}$ with $1/g_{11}$.`],
      teach: 'The inverse metric is a matrix inverse; reciprocals of entries work only for a diagonal (block of a) metric.',
      explain: t`For $\begin{pmatrix} 1 & \tfrac12 \\ \tfrac12 & 1\end{pmatrix}$, $g^{11} = 1/(1 - \tfrac14) = \tfrac43$. A component inverts as a reciprocal only when its row and column are otherwise zero.`,
    }),
    num({
      id: 'raise', difficulty: 2,
      gen(r) {
        let g, w, up, k;
        do { g = r.pick(NONDIAG); w = [r.intExcept(-3, 3, [0]), r.int(-3, 3)]; up = mv(inv2(g), w); k = r.pick([1, 2]); } while (Math.abs(up[k - 1]) < 1e-9);
        return {
          prompt: t`With $g_{\mu\nu} = ${matTeX(g)}$, raise the covector $\omega_\nu = ${vecTeX(w)}$: find $\omega^${k} = g^{${k}\nu}\omega_\nu$.`,
          visual: raisePic(g, w.map((x) => x * 0.5), t`The covector at half scale (teal) and the vector it raises to (gold). ${AXES_NOTE}`),
          answer: up[k - 1], tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: mv(g, w)[k - 1], feedback: t`That multiplies by $g_{\mu\nu}$ (lowering). Raising uses the inverse.` }, { value: w[k - 1] / g[k - 1][k - 1], feedback: t`Dividing by $g_{${k}${k}}$ ignores the off-diagonal entries: invert the whole matrix.` }].filter((e) => Math.abs(e.value - up[k - 1]) > 0.005),
          hints: [t`First find $g^{\mu\nu} = ${matTeX(inv2(g))}$.`, t`Then row ${k} of $g^{\mu\nu}$ against $\omega_\nu$.`],
          teach: t`Raise with the inverse metric: $\omega^\mu = g^{\mu\nu}\omega_\nu$. Lowering the result gives $\omega_\nu$ back.`,
          explain: t`$\omega^\mu = ${vecTeX(up)}$, so $\omega^${k} = ${fr(up[k - 1])}$. Check: $g_{\mu\nu}\omega^\nu = ${vecTeX(mv(g, up).map((x) => +x.toFixed(9)))}$. ✓`,
        };
      },
    }),
    code({
      id: 'sympy-inverse', difficulty: 3,
      prompt: t`With SymPy, take the spherical metric \`g\` and the stretched-polar metric \`h\` of $x = u\cos v$, $y = 2u\sin v$ (lesson A6.3), invert both (\`g_inv\`, \`h_inv\`), and check $g^{\mu\lambda}g_{\lambda\nu} = \delta^\mu_\nu$ and $g^{\mu\nu}g_{\mu\nu} = n$.`,
      starter: t`import sympy as sp
r, th, ph, u, v = sp.symbols('r theta phi u v', positive=True)

g = sp.diag(1, r**2, r**2*sp.sin(th)**2)
J = sp.Matrix([u*sp.cos(v), 2*u*sp.sin(v)]).jacobian([u, v])
h = sp.simplify(J.T * J)            # not diagonal

g_inv = None
h_inv = None
full_trace = None   # g^{mu nu} g_{mu nu}: sum over both indices of g_inv[i, j] * g[i, j]
print(g_inv, h_inv, full_trace)
`,
      answer: t`import sympy as sp
r, th, ph, u, v = sp.symbols('r theta phi u v', positive=True)

g = sp.diag(1, r**2, r**2*sp.sin(th)**2)
J = sp.Matrix([u*sp.cos(v), 2*u*sp.sin(v)]).jacobian([u, v])
h = sp.simplify(J.T * J)

g_inv = sp.simplify(g.inv())
h_inv = sp.simplify(h.inv())
full_trace = sp.simplify(sum(g_inv[i, j] * g[i, j] for i in range(3) for j in range(3)))
print(g_inv, h_inv, full_trace)`,
      tests: [
        { name: t`\`g_inv\` is $\operatorname{diag}(1, r^{-2}, (r\sin\theta)^{-2})$`, code: 'g_inv is not None and sp.simplify(g_inv - sp.diag(1, 1/r**2, 1/(r**2*sp.sin(th)**2))) == sp.zeros(3, 3)' },
        { name: t`$g^{\mu\lambda}g_{\lambda\nu} = \delta^\mu_\nu$ for both metrics`, code: 'g_inv is not None and h_inv is not None and sp.simplify(g_inv*g) == sp.eye(3) and sp.simplify(h_inv*h) == sp.eye(2)' },
        { name: t`$h^{uu} \ne 1/h_{uu}$: the stretched-polar metric does not invert entry by entry`, code: 'h_inv is not None and sp.simplify(h_inv[0, 0] - 1/h[0, 0]) != 0' },
        { name: t`$g^{\mu\nu}g_{\mu\nu} = 3$`, code: 'full_trace is not None and sp.simplify(full_trace - 3) == 0' },
      ],
      hints: [t`\`M.inv()\` inverts a SymPy matrix; wrap it in \`sp.simplify\`.`, t`The full contraction multiplies matching entries and adds them all: \`sum(g_inv[i, j] * g[i, j] for i in range(3) for j in range(3))\`.`],
      teach: 'A computer algebra system inverts any metric exactly; the checks δ and n catch mistakes by hand.',
      explain: t`The spherical inverse is the reciprocal diagonal; the stretched-polar one is not — its off-diagonal entry $h_{uv} = 3u\sin v\cos v$ feeds every component of $h^{-1}$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-invert', difficulty: 2,
      gen(r) {
        const g = r.pick(NONDIAG), G = inv2(g);
        const [i, j] = r.pick([[1, 2], [1, 1], [2, 2]]);
        return {
          prompt: t`$g_{\mu\nu} = ${matTeX(g)}$. Find $g^{${i}${j}}$.`,
          visual: raisePic(g, [0.6, 0.9], t`This metric raising a covector. ${AXES_NOTE}`),
          answer: G[i - 1][j - 1], tol: { rel: 0.005, abs: 0.002 },
          hints: [t`Swap the diagonal, negate the off-diagonal, divide by the determinant.`],
          teach: t`$g^{\mu\nu}$ is the inverse matrix.`,
          explain: t`$g^{\mu\nu} = ${matTeX(G)}$.`,
        };
      },
    }),
    num({
      id: 'cp-horizon', difficulty: 3, transfer: true,
      gen(r) {
        const [M, rsKm] = r.pick([[10, 29.53], [5, 14.77], [30, 88.6]]);
        const k = r.pick([1.2, 1.5, 3]);
        const R = +(k * rsKm).toFixed(1);
        const ans = 1 - rsKm / R;
        return {
          prompt: t`Outside a black hole of ${M} solar masses ($r_s = ${rsKm}$ km) the Schwarzschild metric has $g_{rr} = \left(1 - \dfrac{r_s}{r}\right)^{-1}$, and it is diagonal. The covector $dr$ — the gradient of the coordinate $r$ — has squared size $g^{\mu\nu}(dr)_\mu(dr)_\nu = g^{rr}$. What is it at $r = ${R}$ km?`,
          visual: { type: 'graph', params: { x: [0, 5], y: [-0.2, 1.3], xlabel: 'r / rₛ', ylabel: 'gʳʳ', curves: [{ fn: '1 - 1/x', domain: [1, 5], color: 'gold', width: 2.4, label: 'gʳʳ = 1 − rₛ/r', labelAt: 3.6, labelDy: -14 }], vlines: [{ x: 1, label: 'horizon', color: 'bad' }], hlines: [{ y: 1, color: 'ink3' }] }, caption: t`$g^{rr} = 1 - r_s/r$ outside the horizon: it falls to zero at $r = r_s$. The point asked about is not marked.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1 / ans, feedback: t`That is $g_{rr}$. The size of a covector uses the inverse metric, $g^{rr} = 1/g_{rr}$.` }, { value: Math.sqrt(ans), feedback: t`That is the size itself; the question asks for the squared size $g^{rr}$.` }],
          hints: [t`A covector’s size uses the inverse metric, and this metric is diagonal: $g^{rr} = 1/g_{rr}$.`, t`$g^{rr} = 1 - r_s/r$ with $r_s$ and $r$ in the same units.`],
          teach: t`Covectors are measured with the inverse metric: $|dr|^2 = g^{rr}$, which in Schwarzschild is $1 - r_s/r$.`,
          explain: t`$g^{rr} = 1 - ${rsKm}/${R} = ${nice(ans, 4)}$. At the horizon it reaches 0: $dr$ becomes a null covector — the first hint that $r$ stops being a spatial direction there (lesson A6.6).`,
        };
      },
    }),
    mcq({
      id: 'cp-eta', difficulty: 1,
      prompt: t`Why are the components of the inverse Minkowski metric, $\eta^{\mu\nu}$, the same numbers as those of $\eta_{\mu\nu} = \operatorname{diag}(-1, 1, 1, 1)$?`,
      visual: raisePic([[1, 0], [0, -1]], [1, 0.6], t`The $(x, t)$ plane with $\eta = \operatorname{diag}(1, -1)$: raising flips the time component, just as lowering does. ${AXES_NOTE}`, { tname: '\\eta', axes: ['x', 't'] }),
      choices: [t`It is diagonal with entries $\pm1$, and $1/(\pm1) = \pm1$: the matrix is its own inverse`, 'Every metric equals its inverse', 'Upper and lower indices are the same thing in relativity', t`Because $\det\eta = 1$`],
      answer: 0,
      why: {
        1: t`Polar coordinates: $g_{\theta\theta} = r^2$ but $g^{\theta\theta} = 1/r^2$.`,
        2: t`They are different objects; here only the numbers coincide, and only in inertial Cartesian coordinates.`,
        3: t`$\det\eta = -1$ in four dimensions; and a determinant of 1 would not make a matrix its own inverse anyway.`,
      },
      hints: [t`What is the reciprocal of $-1$?`],
      teach: t`$\eta^{-1} = \eta$ because each diagonal entry is $\pm1$ — so raising and lowering both just flip the time component.`,
      explain: t`$\eta\,\eta = \operatorname{diag}(1, 1, 1, 1)$. In other coordinates on the same spacetime (polar, accelerated, light-cone) the two arrays differ.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1–2 (the inverse metric)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Metric tensor: inverse metric', url: 'https://en.wikipedia.org/wiki/Metric_tensor#Inverse_metric' },
    { label: 'Schwarzschild radius of the Sun, 2.953 km', url: 'https://en.wikipedia.org/wiki/Schwarzschild_radius' },
  ],
});
