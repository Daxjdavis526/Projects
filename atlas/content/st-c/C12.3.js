// The Levi-Civita connection: torsion-free plus metric-compatible fixes the
// connection uniquely. Uniqueness by the difference tensor (symmetric in one
// pair of slots, antisymmetric in an overlapping pair, hence zero); the count
// n²(n + 1)/2 unknowns against n·n(n + 1)/2 equations; torsion as the failure
// of small parallelograms to close; the compass connection on the sphere
// (metric-compatible, torsion, flat) whose straightest lines are rhumb lines,
// against Levi-Civita's great circles; a non-metric connection.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;
const DEG = Math.PI / 180;
const A_EARTH = 6371.0;

const geo = (metric, heading, caption, extra = {}) => ({
  type: 'dg4-chart',
  params: { metric, mode: 'geodesic', P: [0.4, 1.0], drag: false, heading, length: 5, readout: false, field: false, ...extra },
  caption,
});

export default lesson({
  id: 'st-c.C12.3',
  title: 'Torsion-free and metric-compatible: the Levi-Civita connection',
  minutes: 15, difficulty: 4,
  equation: t`\Gamma^\lambda{}_{\mu\nu} = \tfrac12\,g^{\lambda\sigma}\big(\partial_\mu g_{\nu\sigma} + \partial_\nu g_{\mu\sigma} - \partial_\sigma g_{\mu\nu}\big)`,
  intro: t`A metric does not come with a connection, but it singles one out. Ask for two things:

- **torsion-free:** $T(X, Y) = \nabla_XY - \nabla_YX - [X, Y] = 0$; in a chart, $\Gamma^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\nu\mu}$. Geometrically, tiny parallelograms close.
- **metric-compatible:** $\nabla g = 0$. Parallel transport keeps lengths and angles (C12.2).

The **fundamental theorem of Riemannian geometry**: exactly one connection does both, the **Levi-Civita connection**, with the Christoffel symbols above. Drop either demand and others appear: the sphere carries a metric-compatible connection with torsion whose straightest lines are not great circles at all. General relativity takes both; theories that keep torsion (Einstein–Cartan) differ from it only inside matter of extreme spin density.`,
  symbols: [
    { tex: t`\Gamma^\lambda{}_{\mu\nu}`, text: t`the Christoffel symbols: the Levi-Civita connection’s coefficients, symmetric in $\mu\nu$` },
    { tex: t`g_{\mu\nu},\ g^{\lambda\sigma}`, text: t`the metric and its inverse matrix, $g^{\lambda\sigma}g_{\sigma\nu} = \delta^\lambda{}_\nu$` },
    { tex: t`\partial_\mu g_{\nu\sigma}`, text: 'how the metric’s components change from point to point: Γ is built from first derivatives of g only' },
    { tex: t`T(X, Y)`, text: t`the torsion tensor, $T^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\mu\nu} - \Gamma^\lambda{}_{\nu\mu}$` },
  ],
  why: t`This is why GR needs only the metric: the connection — and with it free fall, transport and curvature — is computed from $g_{\mu\nu}$. The Christoffel symbols in the geodesic equation are the gravitational field strengths of the Newtonian limit.`,
  visual: {
    type: 'dg4-chart',
    title: 'Two “straight lines” on one sphere',
    lead: t`The unit sphere’s chart. Gold: the straightest curve from P in the chosen direction — the curve that parallel-transports its own velocity — for two connections with the **same metric**. Change the direction, then switch connection.`,
    tasks: [
      t`Levi-Civita: the curve is a great circle, a wave in this chart crossing the equator twice per circuit. Torsion: 0.`,
      t`Compass connection, same start and direction: a **rhumb line**, holding its angle to every meridian and spiralling into the pole. The readout shows its torsion; its length to the pole is finite.`,
      t`Set the direction to 0° (due east): Levi-Civita leaves the parallel and curves toward the equator; the compass connection follows the parallel for ever. Only at the equator do they agree.`,
    ],
    params: { metric: 'sphere', metrics: ['sphere', 'compass'], mode: 'geodesic', P: [0.4, 1.0], sliders: ['heading', 'length'], heading: 45, length: 5, lengthMax: 10, field: false, readout: ['gamma', 'torsion', 'length'] },
    caption: t`The sphere’s chart ($\varphi$ across, $\theta$ down from the north pole). Both connections keep lengths ($\nabla g = 0$); only Levi-Civita is torsion-free. Curves integrated (RK4) from each connection’s coefficients.`,
  },
  example: {
    prompt: t`Show that there is at most one connection that is both torsion-free and metric-compatible. (Existence: the Christoffel formula above is one — gr.S11.d derives it.)`,
    visual: geo('sphere', 45, 'A Levi-Civita geodesic of the sphere: a great circle, here a wave on the chart.', { field: true, cells: 8 }),
    steps: [
      { label: 'Two candidates', text: t`Suppose $\nabla$ and $\tilde\nabla$ both qualify. Their difference $S^\lambda{}_{\mu\nu} = \tilde\Gamma^\lambda{}_{\mu\nu} - \Gamma^\lambda{}_{\mu\nu}$ is a tensor (C12.1). Lower its index: $S_{\lambda\mu\nu} = g_{\lambda\kappa}S^\kappa{}_{\mu\nu}$.` },
      { label: 'No torsion', text: t`Both are symmetric in the lower pair, so $S_{\lambda\mu\nu} = S_{\lambda\nu\mu}$: symmetric in its last two slots.` },
      { label: 'Metric kept', text: t`Subtract $\nabla_\mu g_{\lambda\nu} = 0$ from $\tilde\nabla_\mu g_{\lambda\nu} = 0$: $-S^\kappa{}_{\mu\lambda}g_{\kappa\nu} - S^\kappa{}_{\mu\nu}g_{\lambda\kappa} = 0$, i.e. $S_{\nu\mu\lambda} = -S_{\lambda\mu\nu}$: antisymmetric in its first and last slots.` },
      { label: 'Chase the signs', text: t`Alternate the two rules: $S_{abc} = S_{acb} = -S_{bca} = -S_{bac} = S_{cab} = S_{cba} = -S_{abc}$.` },
      { label: 'Conclude', text: t`So $S_{abc} = -S_{abc} = 0$: the two connections are the same. Counting agrees: a symmetric $\Gamma$ has $n^2(n + 1)/2$ components and $\nabla_\mu g_{\nu\lambda} = 0$ is $n\cdot n(n + 1)/2$ equations — 6 and 6 on a surface, 40 and 40 in spacetime.` },
    ],
    answer: t`The difference of two such connections is symmetric in one pair of slots and antisymmetric in an overlapping pair, which forces it to vanish: the Levi-Civita connection is unique.`,
  },
  practice: [
    mcq({
      id: 'conditions', difficulty: 1,
      prompt: 'Which two conditions single out the Levi-Civita connection of a metric?',
      visual: geo('sphere', 30, 'A Levi-Civita geodesic on the sphere’s chart.'),
      choices: [t`Torsion-free and $\nabla g = 0$`, t`$\Gamma = 0$ and $\nabla g = 0$`, t`Torsion-free and flat`, t`$\nabla g = 0$ and geodesics are great circles`],
      answer: 0,
      why: {
        1: t`$\Gamma = 0$ is a statement about a chart, not a connection; on a curved space no chart achieves it everywhere.`,
        2: 'Flatness is a property some metrics’ Levi-Civita connections have (the plane) and others lack (the sphere); it is not a condition you may impose.',
        3: 'Great circles are what you get on a sphere once the connection is fixed; they cannot define it on other manifolds.',
      },
      hints: ['One condition is about the connection alone, the other ties it to the metric.'],
      teach: 'Torsion-free plus metric-compatible: those two conditions fix the connection from the metric.',
      explain: t`Symmetric $\Gamma$’s plus $\nabla g = 0$: the theorem says exactly one connection meets both. The compass connection meets only the second.`,
    }),
    num({
      id: 'count', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4, 5]);
        const ans = (n * n * (n + 1)) / 2;
        return {
          prompt: t`In $n = ${n}$ dimensions, how many independent components does a torsion-free connection have at a point (equal, by the theorem, to the number of equations in $\nabla_\mu g_{\nu\lambda} = 0$)?`,
          visual: { type: 'dg4-chart', params: { metric: 'sphere', mode: 'chart', P: [1.2, 1.0], drag: false, field: false, readout: ['gamma'] }, caption: 'The unit sphere’s Christoffel symbols at P: in 2D, 6 independent components, of which 2 are nonzero here.' },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: n ** 3, feedback: 'That is a general connection. Symmetry in the lower pair reduces it.' }, { value: n * n * (n - 1) / 2, feedback: t`Count symmetric pairs $\mu\nu$: $n(n + 1)/2$ of them, diagonal included.` }].filter((e) => e.value !== ans),
          hints: [t`$\lambda$: $n$ choices; the symmetric pair $\mu\nu$: $n(n + 1)/2$.`],
          teach: 'A symmetric connection has n²(n + 1)/2 components — as many as there are equations in ∇g = 0.',
          explain: t`$${n}\times${(n * (n + 1)) / 2} = ${ans}$. And $\nabla_\mu g_{\nu\lambda} = 0$ has $${n}$ values of $\mu$ times $${(n * (n + 1)) / 2}$ symmetric pairs $\nu\lambda$: the same number, which is why a unique solution is no accident.`,
        };
      },
    }),
    num({
      id: 'torsion-value', difficulty: 2,
      gen(r) {
        const th = r.pick([30, 45, 60, 75]);
        const v = 1 / Math.tan(th * DEG);
        return {
          prompt: t`The compass connection on the unit sphere has $\Gamma^\varphi{}_{\theta\varphi} = \cot\theta$ and $\Gamma^\varphi{}_{\varphi\theta} = 0$. Find its torsion component $T^\varphi{}_{\theta\varphi}$ at $\theta = ${th}^\circ$.`,
          visual: { type: 'dg4-chart', params: { metric: 'compass', mode: 'chart', P: [3.14, Math.round(th * DEG * 1e4) / 1e4], drag: false, field: false, readout: false }, caption: t`The sphere’s chart, P at $\theta = ${th}^\circ$.` },
          answer: v, tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`Torsion is the antisymmetric part: $\Gamma^\varphi{}_{\theta\varphi} - \Gamma^\varphi{}_{\varphi\theta}$, and these differ.` }, { value: -v, feedback: t`$T^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\mu\nu} - \Gamma^\lambda{}_{\nu\mu}$ with $\mu = \theta$, $\nu = \varphi$.` }],
          hints: [t`$T^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\mu\nu} - \Gamma^\lambda{}_{\nu\mu}$.`],
          teach: t`Torsion is the antisymmetric part of the connection coefficients, $T^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\mu\nu} - \Gamma^\lambda{}_{\nu\mu}$, and it is a tensor.`,
          explain: t`$T^\varphi{}_{\theta\varphi} = \cot ${th}^\circ - 0 = ${nice(v, 4)}$. Large near the pole, zero on the equator: carry a small step south along the eastward direction, and an east step along the southward one, and the two ends miss by $T$ times the area — the parallelogram does not close.`,
        };
      },
    }),
    expr({
      id: 'hyperbolic-gamma', difficulty: 2,
      prompt: t`The hyperbolic plane in geodesic polar coordinates has $ds^2 = dr^2 + \sinh^2 r\,d\theta^2$. Use the Christoffel formula to find $\Gamma^r{}_{\theta\theta}$.`,
      visual: { type: 'graph', params: { x: [0, 2.2], y: [-4, 1], xlabel: 'r', ylabel: '', xticks: 5, yticks: 5, curves: [{ fn: '-sin(x)*cos(x)', color: 'ink3', dash: [5, 4], label: 'sphere: −sin r cos r', labelAt: 1.6, labelDy: -14 }, { fn: '-x', color: 'teal', width: 1.6, label: 'plane: −r', labelAt: 1.9, labelDy: 14 }] }, caption: t`$\Gamma^r{}_{\theta\theta}$ for the flat plane ($ds^2 = dr^2 + r^2d\theta^2$) and the sphere ($dr^2 + \sin^2r\,d\theta^2$) in the same kind of coordinates. The hyperbolic one is not drawn.` },
      answer: '-sinh(r)cosh(r)', answerTeX: t`-\sinh r\cosh r`, lhs: t`\Gamma^r{}_{\theta\theta}`,
      vars: { r: [0.2, 2] },
      errors: [{ answer: 'sinh(r)cosh(r)', feedback: t`$\Gamma^r{}_{\theta\theta} = -\tfrac12 g^{rr}\partial_r g_{\theta\theta}$: the minus sign comes from the third term.` }, { answer: '-2sinh(r)cosh(r)', feedback: t`Keep the $\tfrac12$.` }],
      hints: [t`Only the third term survives: $\Gamma^r{}_{\theta\theta} = \tfrac12 g^{rr}(0 + 0 - \partial_r g_{\theta\theta})$.`, t`$\partial_r(\sinh^2 r) = 2\sinh r\cosh r$ and $g^{rr} = 1$.`],
      teach: t`For $ds^2 = dr^2 + f(r)^2d\theta^2$: $\Gamma^r{}_{\theta\theta} = -ff'$ and $\Gamma^\theta{}_{r\theta} = f'/f$.`,
      explain: t`$\Gamma^r{}_{\theta\theta} = -\sinh r\cosh r$. The pattern $-ff'$ covers the plane ($f = r$: $-r$), the sphere ($f = \sin r$) and this saddle-everywhere surface ($f = \sinh r$).`,
    }),
    mcq({
      id: 'compass-not-lc', difficulty: 2,
      prompt: t`The compass connection keeps lengths ($\nabla g = 0$) on the sphere. Why is it not the sphere’s Levi-Civita connection?`,
      visual: geo('compass', 45, 'A straightest curve of the compass connection: a rhumb line, not a great circle.'),
      choices: ['It has torsion: its Γ is not symmetric in the lower indices', 'It changes the lengths of some vectors', 'It is not linear in the direction X', 'It is only defined in one chart'],
      answer: 0,
      why: { 1: 'Metric compatibility holds: the unit south and east vectors stay unit and perpendicular.', 2: 'It is a genuine connection, satisfying both axioms.', 3: 'It is defined wherever east and south are, i.e. away from the poles, in any chart.' },
      hints: [t`Compare $\Gamma^\varphi{}_{\theta\varphi}$ and $\Gamma^\varphi{}_{\varphi\theta}$.`],
      teach: 'Metric compatibility alone does not fix the connection; torsion-freedom is the other half.',
      explain: t`$\Gamma^\varphi{}_{\theta\varphi} = \cot\theta \ne \Gamma^\varphi{}_{\varphi\theta} = 0$. By the theorem, the only torsion-free metric-compatible connection is Levi-Civita, so a compatible connection with a different $\Gamma$ must have torsion.`,
    }),
    order({
      id: 'koszul-count', difficulty: 3,
      prompt: t`Order the argument that, on a surface, the six equations $\nabla_\mu g_{\nu\lambda} = 0$ determine a torsion-free connection.`,
      visual: geo('sphere', 60, 'The Levi-Civita geodesic of the sphere that the six Christoffel symbols produce.', { field: true, cells: 8 }),
      items: [
        t`Torsion-free: $\Gamma^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\nu\mu}$ leaves $2\times3 = 6$ unknowns at each point.`,
        t`Write $\nabla_\mu g_{\nu\lambda} = \partial_\mu g_{\nu\lambda} - \Gamma_{\lambda\mu\nu} - \Gamma_{\nu\mu\lambda} = 0$, with $\Gamma_{\lambda\mu\nu} = g_{\lambda\kappa}\Gamma^\kappa{}_{\mu\nu}$: 2 values of $\mu$ times 3 pairs $\nu\lambda$, six equations.`,
        t`Add the equations for $(\mu\nu\lambda)$ and $(\nu\mu\lambda)$ and subtract the one for $(\lambda\mu\nu)$: by the symmetries, everything cancels except $2\Gamma_{\lambda\mu\nu}$.`,
        t`So $\Gamma_{\lambda\mu\nu} = \tfrac12(\partial_\mu g_{\nu\lambda} + \partial_\nu g_{\mu\lambda} - \partial_\lambda g_{\mu\nu})$, uniquely.`,
        t`Raise the first index with $g^{\kappa\lambda}$ to get the Christoffel formula.`,
      ],
      hints: ['Count unknowns first, then equations.', 'The permute-add-subtract trick isolates one lowered Γ.'],
      teach: 'Six symmetric Γ’s, six equations from ∇g = 0: the system has exactly one solution.',
      explain: t`The same three-line trick works in any dimension and gives existence and uniqueness at once. In spacetime it is 40 equations for 40 unknowns.`,
    }),
    mcq({
      id: 'torsion-meaning', difficulty: 3,
      prompt: t`Start at $p$. Go a small distance $\epsilon$ along $X$, then $\epsilon$ along the vector you get by parallel-transporting $Y$ there. Separately, go $\epsilon$ along $Y$, then along transported $X$. If the connection has torsion, the two end points…`,
      visual: { type: 'graph', params: { x: [-0.3, 2.6], y: [-0.3, 1.8], equal: true, axes: false, grid: false, arrows: [{ from: [0, 0], to: [1.8, 0], color: 'accent', label: 'εX' }, { from: [1.8, 0], to: [2.15, 1.3], color: 'violet', label: 'εY′' }, { from: [0, 0], to: [0.2, 1.4], color: 'violet', label: 'εY' }, { from: [0.2, 1.4], to: [1.95, 1.55], color: 'accent', label: 'εX′' }], points: [{ x: 0, y: 0, label: 'p', color: 'ink' }] }, caption: 'A parallelogram that does not close (exaggerated): the gap between the two far corners is the torsion, T(εX, εY).' },
      choices: [t`miss each other by $\epsilon^2\,T(X, Y)$ (after allowing for $[X, Y]$)`, 'coincide exactly, torsion only affects lengths', t`miss by an amount of order $\epsilon$`, 'miss by the holonomy angle times ε'],
      answer: 0,
      why: { 1: 'Lengths are the business of ∇g; torsion is about whether steps commute.', 2: 'Both paths agree to first order; the difference is second order.', 3: 'Holonomy (curvature) rotates vectors around a loop; torsion is a gap in position, and it shows up already for a single tiny parallelogram.' },
      hints: ['Both routes take two steps of size ε, so they agree to first order. Look at the second order.', t`Expand both end points to second order in $\epsilon$. The difference involves $\nabla_XY - \nabla_YX$.`],
      teach: 'Torsion measures the failure of infinitesimal parallelograms to close.',
      explain: t`The gap is $\epsilon^2(\nabla_XY - \nabla_YX - [X, Y]) = \epsilon^2T(X, Y)$. Levi-Civita closes every small parallelogram; the compass connection does not, because "go east, then south" and "go south, then east" by constant bearings end at different points near a pole.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rhumb', difficulty: 3, transfer: true,
      gen(r) {
        const [lat, dl, route] = r.pick([[40, 70.3, 'New York to Madrid (both near 40°N, 70.3° of longitude apart)'], [50, 60, 'two cities on 50°N, 60° of longitude apart'], [30, 90, 'two points on 30°N, 90° of longitude apart'], [60, 40, 'two points on 60°N, 40° of longitude apart']]);
        const rh = A_EARTH * dl * DEG * Math.cos(lat * DEG), gc = A_EARTH * 2 * Math.asin(Math.cos(lat * DEG) * Math.sin((dl * DEG) / 2));
        return {
          prompt: t`Fly ${route} two ways: holding a constant compass heading (due east: the straightest line of the compass connection) or along the Levi-Civita geodesic (a great circle). How many km longer is the constant-heading route ($R = 6371$ km)?`,
          visual: geo('sphere', 0, 'From P heading due east: the Levi-Civita geodesic leaves the parallel and arcs toward the equator; the compass connection would follow the parallel.', { P: [0.3, Math.round((90 - lat) * DEG * 1e4) / 1e4], length: 3, lines: [{ b: Math.round((90 - lat) * DEG * 1e4) / 1e4, color: 'violet', dash: [5, 4] }] }),
          answer: rh - gc, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: rh, feedback: 'That is the whole rhumb-line length; subtract the great-circle distance.' }, { value: A_EARTH * dl * DEG - gc, feedback: t`A parallel at latitude $\lambda$ has radius $R\cos\lambda$.` }].filter((e) => Math.abs(e.value - (rh - gc)) > 0.02 * (rh - gc)),
          hints: [t`Rhumb (along the parallel): $R\,\Delta\varphi\cos\lambda$. Great circle: central angle $\sigma = 2\arcsin\big(\cos\lambda\sin(\Delta\varphi/2)\big)$, length $R\sigma$.`, t`Rhumb $= ${nice(rh, 4)}$ km.`],
          teach: 'Different connections, different straightest lines: constant heading is the compass connection’s, the great circle is Levi-Civita’s and the shortest.',
          explain: t`Rhumb $${nice(rh, 4)}$ km, great circle $${nice(gc, 4)}$ km: $${nice(rh - gc, 3)}$ km longer. Both curves are "straight" — each transports its own velocity — but only the torsion-free connection’s straight lines are also the shortest (C14.2). Airliners fly great circles; sailors long preferred rhumb lines because they are easy to steer.`,
        };
      },
    }),
    expr({
      id: 'cp-coth', difficulty: 3,
      prompt: t`For $ds^2 = dr^2 + \sinh^2 r\,d\theta^2$, find $\Gamma^\theta{}_{r\theta}$ from the Christoffel formula.`,
      visual: { type: 'dg4-chart', params: { metric: 'halfplane', mode: 'chart', P: [0, 1], drag: false, readout: ['K'], cells: 8 }, caption: t`The same geometry (the hyperbolic plane, $K = -1$) in the half-plane chart.` },
      answer: 'cosh(r)/sinh(r)', answerTeX: t`\coth r`, lhs: t`\Gamma^\theta{}_{r\theta}`,
      vars: { r: [0.2, 2] },
      errors: [{ answer: '2cosh(r)/sinh(r)', feedback: t`Keep the $\tfrac12$: $\tfrac12 g^{\theta\theta}\partial_r g_{\theta\theta}$.` }, { answer: 'sinh(r)cosh(r)', feedback: t`Multiply by the inverse metric $g^{\theta\theta} = 1/\sinh^2 r$.` }],
      hints: [t`$\Gamma^\theta{}_{r\theta} = \tfrac12 g^{\theta\theta}\partial_r g_{\theta\theta}$.`, t`$\tfrac12\cdot\dfrac{1}{\sinh^2 r}\cdot2\sinh r\cosh r$.`],
      teach: t`$\Gamma^\theta{}_{r\theta} = f'/f$ for $ds^2 = dr^2 + f^2d\theta^2$: the relative rate at which circles grow.`,
      explain: t`$\coth r$: circles of radius $r$ have circumference $2\pi\sinh r$, growing at the relative rate $\coth r \to 1$ — exponentially, the hallmark of negative curvature.`,
    }),
    num({
      id: 'cp-nabla-g', difficulty: 2,
      gen(r) {
        const k = r.pick([0.2, 0.3, 0.5]);
        return {
          prompt: t`On the flat plane ($g = \mathrm{diag}(1, 1)$), the connection with only $\Gamma^x{}_{xx} = ${k}$ is torsion-free. Compute $\nabla_xg_{xx} = \partial_xg_{xx} - 2\Gamma^\lambda{}_{xx}g_{\lambda x}$.`,
          visual: { type: 'dg4-chart', params: { metric: 'stretch', k, mode: 'transport', P: [-1.5, 0], Q: [1.5, 0.001], drag: false, readout: false, field: false, angle: 0, view: { a: [-2, 2], b: [-1, 1] } }, caption: 'A unit arrow carried along x with this connection: it shrinks.' },
          answer: -2 * k, tol: { rel: 0.003 },
          errors: [{ value: 0, feedback: 'Only the Levi-Civita connection (here Γ = 0) has ∇g = 0.' }, { value: -k, feedback: 'Two terms, one for each lower index of g: the factor is 2.' }],
          hints: [t`$\partial_xg_{xx} = 0$; only $\lambda = x$ contributes to the sum.`],
          teach: 'A torsion-free connection other than Levi-Civita must fail ∇g = 0.',
          explain: t`$0 - 2(${k})(1) = ${-2 * k}$. Torsion-free but not metric-compatible — so, by the theorem, not Levi-Civita. Both conditions are needed, and each rules out different impostors.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.2 (torsion, metric compatibility, uniqueness)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'do Carmo, Riemannian Geometry, ch. 2 (the Levi-Civita theorem)', url: 'https://link.springer.com/book/9780817634902' },
    { label: 'Hehl et al., General relativity with spin and torsion, Rev. Mod. Phys. 48 (1976) 393', url: 'https://doi.org/10.1103/RevModPhys.48.393' },
  ],
});
