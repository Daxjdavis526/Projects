// Raising and lowering indices: the metric turns a vector into a covector,
// V_μ = g_μν V^ν (its stack is g(V, ·)), and the inverse metric turns a
// covector back into a vector, ω^μ = g^{μν} ω_ν. Lowering ∂x in polar
// coordinates gives dx; in Minkowski space lowering flips the time component.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { legs } from './_ten.js';
import { form, matTeX, vecTeX, mv, dot, bil, fr, r6, AXES_NOTE } from './_metric.js';

const t = String.raw;
const DEG = Math.PI / 180;
const METRICS = [[[1, 0], [0, 4]], [[2, 1], [1, 2]], [[1, 1], [1, 2]], [[3, 1], [1, 1]], [[1, -1], [-1, 3]], [[2, 0], [0, 3]]];
const ETA2 = [[-1, 0], [0, 1]];

export default lesson({
  id: 'st-a.A6.4',
  title: 'Raising and lowering indices',
  minutes: 12, difficulty: 3,
  intro: t`Feed the metric one vector and leave the other slot empty: $g(\mathbf V, \cdot\,)$ is a covector. That is **lowering an index** — the vector’s covector partner, with components

$$V_\mu = g_{\mu\nu}V^\nu, \qquad \omega^\mu = g^{\mu\nu}\,\omega_\nu$$

The second formula goes back the other way with the **inverse metric** $g^{\mu\nu}$, the inverse matrix (lesson A6.5): **raising an index**. The two cancel, so a vector and its lowered partner carry the same information, and the metric is what links them. Pictures make it concrete: the stack of $V_\mu$ is $g(\mathbf V, \cdot\,)$, whose lines are the directions perpendicular to $\mathbf V$ and which $\mathbf V$ crosses $g(\mathbf V, \mathbf V)$ times. In Cartesian coordinates on flat space $g = \delta$, so $V_i = V^i$ — the reason ordinary vector calculus never needed index heights (lesson A1.3). Everywhere else the numbers differ: in polar coordinates the lowered $\partial_x$ is exactly $dx$; in Minkowski space lowering flips the sign of the time component, $p_\mu = (-E, \vec p)$ for $p^\mu = (E, \vec p)$. Lowering one index of a mixed tensor needs care with order: $T^\mu{}_\nu = g^{\mu\lambda}T_{\lambda\nu}$ and $T_\nu{}^\mu = g^{\mu\lambda}T_{\nu\lambda}$ differ unless $T$ is symmetric.`,
  symbols: [
    { tex: t`V_\mu`, text: t`the lowered components: those of the covector $g(\mathbf V, \cdot\,)$` },
    { tex: t`g_{\mu\nu}`, text: 'the metric, which lowers' },
    { tex: t`g^{\mu\nu}`, text: t`the inverse metric, which raises: $g^{\mu\lambda}g_{\lambda\nu} = \delta^\mu_\nu$` },
    { tex: t`\omega_\nu,\ \omega^\mu`, text: 'a covector’s components and those of the vector it raises to' },
  ],
  why: t`Physics written with the metric moves freely between the two kinds: the four-momentum $p^\mu$ and the covector $p_\mu$ whose components are conserved by symmetries, the gradient covector $\partial_\mu f$ and the gradient vector that points uphill.`,
  visual: {
    type: 'ten-metric',
    title: 'A vector and its lowered partner',
    lead: t`Drag the blue arrow $\mathbf V$; the teal stack is $g(\mathbf V, \cdot\,)$, the covector with components $V_\mu = g_{\mu\nu}V^\nu$. Change the metric with the buttons and watch the same $V^\mu$ lower to different $V_\mu$.`,
    tasks: [
      t`Euclidean: the stack is perpendicular to $\mathbf V$, $V_\mu = V^\mu$, and $\mathbf V$ crosses $|\mathbf V|^2$ of its lines.`,
      t`Stretched, $g = \operatorname{diag}(1, 4)$: $V_2 = 4V^2$. The stack is no longer perpendicular on the paper — but it is $g$-perpendicular, which is all that counts.`,
      t`Minkowski, $g = \operatorname{diag}(1, -1)$ with $x^2$ as time: the time component of $V_\mu$ flips sign, the stack tilts the other way, and a light-like $\mathbf V$ (along a diagonal) lies along its own zero line.`,
    ],
    params: { mode: 'form', tname: 'g', T: [[1, 0], [0, 1]], presets: [{ label: 'Euclidean', T: [[1, 0], [0, 1]] }, { label: 'Stretched diag(1, 4)', T: [[1, 0], [0, 4]] }, { label: 'Skewed (60° basis)', T: [[1, 0.5], [0.5, 1]] }, { label: 'Minkowski diag(1, −1)', T: [[1, 0], [0, -1]] }], presetLabel: 'Metric', U: [1.3, 0.7], uname: 'V', showV: false, indicatrix: true, readout: ['T', 'U', 'low', 'UU'] },
    caption: t`Gold curve: the metric’s unit circle (hyperbolae for Minkowski). Teal: $g(\mathbf V, \cdot\,)$ at whole-number values. ${AXES_NOTE}`,
  },
  example: {
    prompt: t`At the point $(r, \theta) = (2, 30^\circ)$ of the plane, the constant vector $\partial_x$ has polar components $V^r = \cos\theta$, $V^\theta = -\sin\theta/r$ (lesson A4.3). Lower its index with the polar metric, compare with the covector $dx$, and raise it back.`,
    visual: form({ T: [[1, 0], [0, 4]], U: [r6(Math.cos(30 * DEG)), -0.25], uname: '∂x', showV: false, tname: 'g', axes: ['r', 'θ'], view: 1.3, levelLabels: true }, t`$\partial_x$ at $(2, 30^\circ)$ on $(r, \theta)$ component axes, and its lowered partner $g(\partial_x, \cdot\,)$ — the stack of $dx$. ${AXES_NOTE}`),
    steps: [
      { label: 'The components', text: t`$V^r = \cos30^\circ = 0.866$, $V^\theta = -\sin30^\circ/2 = -0.25$; $g = \operatorname{diag}(1, r^2) = \operatorname{diag}(1, 4)$.` },
      { label: 'Lower', text: t`$V_r = g_{rr}V^r = 0.866$, $V_\theta = g_{\theta\theta}V^\theta = 4(-0.25) = -1$.` },
      { label: 'Compare with dx', text: t`$dx = \cos\theta\,dr - r\sin\theta\,d\theta$ has components $(0.866, -2\times0.5) = (0.866, -1)$. ✓ In general $V_\mu = (\cos\theta, -r\sin\theta)$: **lowering $\partial_x$ gives $dx$** at every point, as it must — in Cartesian coordinates both are $(1, 0, \dots)$, and lowering does not care which basis you compute in.` },
      { label: 'Raise back', text: t`$g^{\mu\nu} = \operatorname{diag}(1, 1/r^2)$: $V^r = 0.866$, $V^\theta = -1/4 = -0.25$. ✓` },
      { label: 'Check a scalar', text: t`$V_\mu V^\mu = 0.866^2 + (-1)(-0.25) = 0.75 + 0.25 = 1 = |\partial_x|^2$. ✓` },
    ],
    answer: t`$V_\mu = (0.866, -1)$ — exactly the components of $dx$; raising returns $(0.866, -0.25)$, and $V_\mu V^\mu = 1$.`,
  },
  practice: [
    num({
      id: 'lower', difficulty: 1,
      gen(r) {
        let g, V, low, k;
        do { g = r.pick(METRICS); V = [r.intExcept(-2, 2, [0]), r.intExcept(-2, 2, [0])]; low = mv(g, V); k = r.pick([1, 2]); } while (low[k - 1] === 0 || low[k - 1] === V[k - 1]);
        return {
          prompt: t`With $g_{\mu\nu} = ${matTeX(g)}$ and $V^\nu = ${vecTeX(V)}$, find $V_${k} = g_{${k}\nu}V^\nu$.`,
          visual: form({ T: g, U: V.map((x) => x * 0.7), uname: 'V', showV: false, tname: 'g', indicatrix: true, view: 2 }, t`$\mathbf V$ (0.7 scale), the metric’s unit circle and the stack $g(\mathbf V, \cdot\,)$. ${AXES_NOTE}`),
          answer: low[k - 1], tol: { rel: 0, abs: 0.01 },
          errors: [{ value: V[k - 1], feedback: t`Upper and lower components agree only when $g = \delta$.` }, { value: g[k - 1][k - 1] * V[k - 1], feedback: t`Row ${k} of $g$ has two entries: the off-diagonal one multiplies the other component.` }].filter((e) => e.value !== low[k - 1]),
          hints: [t`$V_${k} = g_{${k}1}V^1 + g_{${k}2}V^2$: row ${k} of $g$ against $V$.`],
          teach: t`Lowering is a matrix times a column: $V_\mu = g_{\mu\nu}V^\nu$.`,
          explain: t`$V_${k} = (${g[k - 1][0]})(${V[0]}) + (${g[k - 1][1]})(${V[1]}) = ${low[k - 1]}$; in full $V_\mu = ${vecTeX(low)}$.`,
        };
      },
    }),
    num({
      id: 'minkowski', difficulty: 1,
      gen(r) {
        const E = r.pick([5, 10, 13, 25]), p = [r.int(-4, 4), r.int(-4, 4), r.intExcept(-4, 4, [0])];
        const k = r.pick([0, 1, 3]);
        const up = [E, ...p], low = [-E, ...p];
        return {
          prompt: t`With $c = 1$ and $\eta_{\mu\nu} = \operatorname{diag}(-1, 1, 1, 1)$, a particle has four-momentum $p^\mu = ${vecTeX(up)}$ (in GeV). What is $p_${k} = \eta_{${k}\nu}p^\nu$?`,
          visual: form({ T: ETA2, U: [0.9, 0.5], uname: 'p', showV: false, tname: '\\eta', axes: ['t', 'x'], indicatrix: true, view: 1.4 }, t`A four-momentum in the $(t, x)$ plane (schematic) and the stack of its lowered partner, tilted the other way by the minus sign. Hyperbolae: $\eta(X, X) = \pm1$. ${AXES_NOTE}`),
          answer: low[k], tol: { rel: 0, abs: 0.01 },
          errors: k === 0 ? [{ value: E, feedback: t`$\eta_{00} = -1$: lowering flips the sign of the time component.` }] : [{ value: -up[k], feedback: t`Only the time component changes sign; $\eta_{${k}${k}} = +1$.` }].filter((e) => e.value !== low[k]),
          hints: [t`$\eta$ is diagonal, so $p_${k} = \eta_{${k}${k}}\,p^${k}$.`],
          teach: t`In $(-, +, +, +)$, lowering flips the time component: $p_\mu = (-E, \vec p)$.`,
          explain: t`$p_${k} = ${k === 0 ? '-1' : '+1'}\times${up[k]} = ${low[k]}$ GeV; $p_\mu = ${vecTeX(low)}$.`,
        };
      },
    }),
    num({
      id: 'raise-gradient', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 3, 4]), th = r.pick([30, 60, 120]);
        const s = Math.sin(th * DEG), c = Math.cos(th * DEG);
        const w = [s, R * c], up = [s, c / R];
        const which = r.pick(['r', 'theta']);
        const ans = which === 'r' ? up[0] : up[1];
        return {
          prompt: t`On the plane, the function $f = y = r\sin\theta$ has gradient covector $\partial_\mu f = (\sin\theta,\ r\cos\theta)$ in polar coordinates. Raise it with $g^{\mu\nu} = \operatorname{diag}(1, 1/r^2)$: at $(r, \theta) = (${R}, ${th}^\circ)$, what is ${which === 'r' ? t`$(\nabla f)^r$` : t`$(\nabla f)^\theta$`}?`,
          visual: form({ T: [[1, 0], [0, R * R]], covector: w.map(r6), covSliders: false, tname: 'g', axes: ['r', 'θ'], view: 1.4, levelLabels: true, crossings: false, wname: 'df' }, t`On $(r, \theta)$ component axes: the stack of $df$ and the vector it raises to (gold). ${AXES_NOTE}`),
          answer: r6(ans), tol: { rel: 0.005, abs: 0.002 },
          errors: which === 'theta' ? [{ value: r6(w[1]), feedback: t`That is the covector component $\partial_\theta f$. Raising divides by $g_{\theta\theta} = r^2$.` }, { value: r6(c), feedback: t`That divides by $r$ once. Raising divides by $g_{\theta\theta} = r^2$: $r\cos\theta/r^2 = \cos\theta/r$.` }].filter((e) => Math.abs(e.value - ans) > 0.005) : [],
          hints: [t`$(\nabla f)^\mu = g^{\mu\nu}\partial_\nu f$; with a diagonal metric each component is divided by its $g_{\mu\mu}$.`],
          teach: t`Raising a gradient in polar coordinates divides the $\theta$ component by $r^2$: $(\nabla f)^\theta = \partial_\theta f/r^2$.`,
          explain: t`$(\nabla f)^r = \sin\theta = ${nice(up[0], 4)}$ and $(\nabla f)^\theta = \cos\theta/r = ${nice(up[1], 4)}$. That vector is $\sin\theta\,\partial_r + (\cos\theta/r)\,\partial_\theta = \partial_y$ — the uphill direction of $y$. ✓`,
        };
      },
    }),
    mcq({
      id: 'index-order', difficulty: 3,
      prompt: t`With $g_{\mu\nu} = \operatorname{diag}(1, 2)$ and $T_{\mu\nu} = ${matTeX([[1, 2], [3, 4]])}$, compare $T^1{}_2 = g^{1\lambda}T_{\lambda2}$ with $T_2{}^1 = g^{1\lambda}T_{2\lambda}$.`,
      visual: legs([{ name: 'T', up: ['μ'], down: ['ν'] }, { name: 'T', down: ['ν'], up: ['μ'] }], { gap: 2.4, caption: t`$T^\mu{}_\nu$ (first slot raised) and $T_\nu{}^\mu$ (second slot raised): the horizontal order of the indices records which slot was raised.` }),
      choices: [t`$T^1{}_2 = 2$ and $T_2{}^1 = 3$: they differ because $T$ is not symmetric`, t`Both are 2: raising does not care which slot`, t`Both are 3`, t`They are always equal for a diagonal metric`],
      answer: 0,
      why: {
        1: t`$T_2{}^1$ raises the *second* slot: it uses $T_{21} = 3$, not $T_{12} = 2$.`,
        2: t`$T^1{}_2$ uses $T_{12} = 2$.`,
        3: 'A diagonal metric does not make T symmetric; the order of the slots still matters.',
      },
      hints: [t`$g^{11} = 1$. Which entry of $T$ does each expression pick?`, t`$T^1{}_2 = g^{11}T_{12}$; $T_2{}^1 = g^{11}T_{21}$.`],
      teach: t`Keep the horizontal order of indices: $T^\mu{}_\nu$ and $T_\nu{}^\mu$ are different arrays unless $T$ is symmetric.`,
      explain: t`$T^1{}_2 = 1\cdot T_{12} = 2$, $T_2{}^1 = 1\cdot T_{21} = 3$. Writing both as “$T^1_2$” would lose the difference.`,
    }),
    num({
      id: 'already-lowered', difficulty: 2,
      gen(r) {
        let g, U, Vl, ans;
        do { g = r.pick(METRICS); U = [r.intExcept(-2, 2, [0]), r.int(-2, 2)]; Vl = [r.int(-3, 3), r.intExcept(-3, 3, [0])]; ans = dot(U, Vl); } while (ans === 0 || ans === bil(g, U, Vl));
        return {
          prompt: t`The metric is $g_{\mu\nu} = ${matTeX(g)}$. A vector $\mathbf V$ is given by its lowered components $V_\mu = ${vecTeX(Vl)}$, and $U^\mu = ${vecTeX(U)}$. Find $g(\mathbf U, \mathbf V)$.`,
          visual: legs([{ name: 'U', up: [] }, { name: 'V', down: [] }], { links: [{ a: 0, b: 1, index: 'μ' }], caption: t`$U^\mu V_\mu$: one upper index against one lower — a pairing, no metric needed any more.` }),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: bil(g, U, Vl), feedback: t`That applies the metric a second time. $V_\mu$ already is $g_{\mu\nu}V^\nu$: just pair it with $U^\mu$.` }],
          hints: [t`$g(\mathbf U, \mathbf V) = g_{\mu\nu}U^\mu V^\nu = U^\mu V_\mu$.`],
          teach: t`Once one index is lowered, the dot product is a plain pairing: $g(\mathbf U, \mathbf V) = U^\mu V_\mu$.`,
          explain: t`$U^\mu V_\mu = (${U[0]})(${Vl[0]}) + (${U[1]})(${Vl[1]}) = ${ans}$.`,
        };
      },
    }),
    mcq({
      id: 'norm-error', difficulty: 2, kind: 'error',
      prompt: t`A student computes the squared length of a four-velocity $u^\mu = (1.25, 0.75, 0, 0)$ (with $c = 1$) as $u^\mu u^\mu = 1.25^2 + 0.75^2 = 2.125$. What is wrong?`,
      visual: form({ T: ETA2, U: [1.25, 0.75], uname: 'u', showV: false, tname: '\\eta', axes: ['t', 'x'], indicatrix: true, view: 1.5 }, t`$u$ on $(t, x)$ component axes: its tip lies on the hyperbola $\eta(X, X) = -1$. ${AXES_NOTE}`),
      choices: [t`Two upper indices cannot be summed; lower one first: $u_\mu u^\mu = -1.25^2 + 0.75^2 = -1$`, t`Nothing: the length of a vector is always the sum of squares`, t`The square root is missing: $|u| = 1.46$`, t`The time component should be multiplied by $c^2$`],
      answer: 0,
      why: {
        1: 'Only with g = δ. In spacetime η has a minus sign.',
        2: 'The whole sum is wrong, not just the square root.',
        3: 'With c = 1 there is no factor to restore; the sign is the problem.',
      },
      hints: [t`$u^\mu u^\mu$ has the same index twice upstairs. What does the summation rule require?`],
      teach: t`Lengths need the metric: $u\cdot u = \eta_{\mu\nu}u^\mu u^\nu = u_\mu u^\mu$, and in spacetime that is $-1$ for every four-velocity.`,
      explain: t`$u_\mu = (-1.25, 0.75, 0, 0)$, so $u_\mu u^\mu = -1.5625 + 0.5625 = -1$. ✓ Every four-velocity has $u_\mu u^\mu = -1$ in the $(-, +, +, +)$ convention.`,
    }),
    code({
      id: 'einsum-F', difficulty: 3,
      prompt: t`With NumPy, build the field tensor $F_{\mu\nu}$ ($F_{0i} = -E_i$, $F_{12} = B_z$, $F_{13} = -B_y$, $F_{23} = B_x$, $c = 1$; lesson A5.5) for $\mathbf E = (1, 2, 0)$ and $\mathbf B = (0, 1, 3)$. Raise both indices with \`einsum\`, $F^{\mu\nu} = \eta^{\mu\alpha}\eta^{\nu\beta}F_{\alpha\beta}$, and compute the invariant $F_{\mu\nu}F^{\mu\nu}$, which should equal $2(B^2 - E^2)$.`,
      starter: t`import numpy as np
eta = np.diag([-1.0, 1.0, 1.0, 1.0])   # its own inverse
Ex, Ey, Ez = 1.0, 2.0, 0.0
Bx, By, Bz = 0.0, 1.0, 3.0

F_low = np.array([[0, -Ex, -Ey, -Ez],
                  [Ex, 0, Bz, -By],
                  [Ey, -Bz, 0, Bx],
                  [Ez, By, -Bx, 0]])

F_up = None        # eta^{mu a} eta^{nu b} F_{ab}
invariant = None   # F_{mu nu} F^{mu nu}: a full contraction
print(F_up, invariant)
`,
      answer: t`import numpy as np
eta = np.diag([-1.0, 1.0, 1.0, 1.0])
Ex, Ey, Ez = 1.0, 2.0, 0.0
Bx, By, Bz = 0.0, 1.0, 3.0

F_low = np.array([[0, -Ex, -Ey, -Ez],
                  [Ex, 0, Bz, -By],
                  [Ey, -Bz, 0, Bx],
                  [Ez, By, -Bx, 0]])

F_up = np.einsum('ma,nb,ab->mn', eta, eta, F_low)
invariant = np.einsum('mn,mn->', F_low, F_up)
print(F_up, invariant)`,
      tests: [
        { name: t`raising flips the sign of the time row and column: $F^{0i} = +E_i$`, code: 'F_up is not None and np.allclose(F_up[0, 1:], [1, 2, 0]) and np.allclose(F_up[1:, 0], [-1, -2, 0])' },
        { name: t`the space block is unchanged: $F^{12} = F_{12} = B_z$`, code: 'F_up is not None and np.allclose(F_up[1:, 1:], F_low[1:, 1:])' },
        { name: t`$F_{\mu\nu}F^{\mu\nu} = 2(B^2 - E^2) = 10$`, code: 'invariant is not None and abs(invariant - 10) < 1e-9' },
      ],
      hints: [t`Two indices to raise, two factors of $\eta$: \`np.einsum('ma,nb,ab->mn', eta, eta, F_low)\`.`, t`A full contraction sums over both indices and leaves nothing: \`np.einsum('mn,mn->', F_low, F_up)\`.`],
      teach: t`Each raised index takes one factor of the inverse metric; a full contraction of a tensor with its raised self is a scalar.`,
      explain: t`$B^2 - E^2 = 10 - 5 = 5$, so $F_{\mu\nu}F^{\mu\nu} = 10$. Every inertial observer computes the same number, though each sees different $\mathbf E$ and $\mathbf B$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lower', difficulty: 2,
      gen(r) {
        let g, V, low, k;
        do { g = r.pick(METRICS.filter((m) => m[0][1] !== 0)); V = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])]; low = mv(g, V); k = r.pick([1, 2]); } while (low[k - 1] === 0 || low[k - 1] === V[k - 1]);
        return {
          prompt: t`$g_{\mu\nu} = ${matTeX(g)}$ and $V^\mu = ${vecTeX(V)}$. Find $V_${k}$.`,
          visual: form({ T: g, U: V.map((x) => x * 0.6), uname: 'V', showV: false, tname: 'g', indicatrix: true, view: 2 }, t`$\mathbf V$ (0.6 scale) and its lowered partner’s stack. ${AXES_NOTE}`),
          answer: low[k - 1], tol: { rel: 0, abs: 0.01 },
          hints: [t`$V_${k} = g_{${k}\nu}V^\nu$.`],
          teach: t`$V_\mu = g_{\mu\nu}V^\nu$.`,
          explain: t`$V_\mu = ${vecTeX(low)}$.`,
        };
      },
    }),
    num({
      id: 'cp-angular-momentum', difficulty: 3, transfer: true,
      gen(r) {
        const [name, Rkm, Tmin] = r.pick([['the International Space Station', 6771, 92.9], ['a GPS satellite', 26560, 717.97], ['a geostationary satellite', 42164, 1436.07]]);
        const R = Rkm * 1e3, phidot = (2 * Math.PI) / (Tmin * 60);
        const h = R * R * phidot;
        return {
          prompt: t`${name[0].toUpperCase() + name.slice(1)} moves on a circular equatorial orbit ($\theta = 90^\circ$) of radius $${Rkm}$ km with period $${Tmin}$ min, so its velocity per unit mass is $u^\mu = (\dot r, \dot\theta, \dot\phi) = (0, 0, 2\pi/T)$. Its **specific angular momentum** — conserved because the metric does not depend on $\phi$ — is the *lowered* component $u_\phi = g_{\phi\phi}\,u^\phi$, with $g_{\phi\phi} = r^2\sin^2\theta$. Find $u_\phi$ in m²/s.`,
          visual: { type: 'c3-coords', params: { system: 'spherical', point: [2, 90, 30], sliders: false, element: false, readouts: [], range: 3 }, caption: t`A point on the equator ($\theta = 90^\circ$): the satellite moves along $\partial_\phi$, around the circle of radius $r$. Schematic.` },
          answer: h, units: 'm^2/s', tol: { rel: 0.005 },
          errors: [{ value: phidot, feedback: t`That is $u^\phi$, the upper component (rad/s). Lower it with $g_{\phi\phi} = r^2$.` }, { value: R * phidot, feedback: t`That is the speed $r\dot\phi$; the lowered component has one more factor of $r$.` }],
          hints: [t`$u^\phi = 2\pi/T$ with $T$ in seconds; $g_{\phi\phi} = r^2$ at the equator.`, t`$u_\phi = r^2\dot\phi$ with $r$ in metres.`],
          teach: t`The conserved angular momentum of an orbit is a lowered component, $u_\phi = g_{\phi\phi}u^\phi = r^2\sin^2\theta\,\dot\phi$ — a covector component.`,
          explain: t`$u^\phi = ${tex(phidot, 4)}$ rad/s, so $u_\phi = (${tex(R, 4)})^2\times${tex(phidot, 4)} = ${tex(h, 4)}$ m²/s. Check: Newton’s circular orbit has $u_\phi = \sqrt{GMr} = ${tex(Math.sqrt(3.986004e14 * R), 4)}$ m²/s — agreeing to within the rounding of the orbit figures.`,
        };
      },
    }),
    mcq({
      id: 'cp-cartesian', difficulty: 2,
      prompt: t`In school vector algebra nobody distinguished $V^i$ from $V_i$. Why did that work?`,
      visual: form({ T: [[1, 0], [0, 1]], U: [1.3, 0.8], uname: 'V', showV: false, tname: 'g', indicatrix: true, view: 1.6, levelLabels: true }, t`Euclidean metric in a Cartesian basis: the stack of $V_\mu$ is perpendicular to $\mathbf V$ and has the same components. ${AXES_NOTE}`),
      choices: [t`With Cartesian axes in flat space $g_{ij} = \delta_{ij}$, so $V_i = \delta_{ij}V^j = V^i$: the numbers coincide (the objects still differ)`, 'Vectors and covectors are the same thing in three dimensions', 'Lower indices only exist in relativity', 'The metric is always the identity'],
      answer: 0,
      why: {
        1: 'They are different objects in any dimension — an arrow and a stack; only their numbers can coincide.',
        2: 'Covectors are everyday objects: a gradient is one.',
        3: t`Only in a perpendicular unit basis on flat space; polar or skewed coordinates already have $g \ne \delta$.`,
      },
      hints: [t`What is $g_{ij}$ for perpendicular unit basis arrows?`],
      teach: t`Upper and lower components coincide exactly when $g_{\mu\nu} = \delta_{\mu\nu}$ — Cartesian axes on flat space.`,
      explain: t`$g = \delta$ makes lowering the identity map on numbers. Change to polar coordinates, skewed axes or spacetime and the two sets of components part ways.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1 (raising and lowering indices)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Raising and lowering indices', url: 'https://en.wikipedia.org/wiki/Raising_and_lowering_indices' },
    { label: 'NASA: ISS orbit (about 400 km altitude, 92.9 min period)', url: 'https://www.nasa.gov/international-space-station/' },
  ],
});
