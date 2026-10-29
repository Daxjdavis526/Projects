// Metric compatibility: ∇_ρ g_μν = 0. In polar coordinates ∂_r g_θθ = 2r is
// cancelled exactly by the Γ terms; read backwards, the condition determines
// Γ from the metric (with Γ symmetric): Γ^λ_μν = ½ g^λσ(∂_μ g_νσ + ∂_ν g_μσ − ∂_σ g_μν).
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6, plane, polarGrid, basisAt, DEG } from './_tcalc.js';
import { grid } from './_ten.js';

const t = String.raw;

// two fixed arrows V, W carried to several points (they do not change: flat space, parallel transport)
const V0 = [1.2, 0.4], W0 = [0.5, 1.1];
function pairPic(pts, caption, { R = 4 } = {}) {
  return plane({
    x: [-R, R], y: [r6(-0.62 * R), r6(0.62 * R)],
    curves: polarGrid(R + 1),
    arrows: pts.flatMap(([x, y], j) => [
      ...basisAt([x, y], { k: 0.25, labels: j === 0, width: 1.6 }),
      { from: [x, y], to: [r6(x + V0[0]), r6(y + V0[1])], color: 'gold', width: 2.6, ...(j === 0 ? { label: 'V' } : {}) },
      { from: [x, y], to: [r6(x + W0[0]), r6(y + W0[1])], color: 'teal', width: 2.6, ...(j === 0 ? { label: 'W' } : {}) },
    ]),
    points: [{ x: 0, y: 0, r: 3, color: 'ink3' }, ...pts.map(([x, y]) => ({ x, y, r: 3.5, color: 'ink' }))],
    caption,
  });
}

// the Explore: V and W carried along a path; components change, g(V, W) does not
const S = (k) => `step(0.5 - abs(p - ${k}))`;
const PX = `${S(1)}*2.2*cos(2*pi*s) + ${S(2)}*(0.6 + 3.2*s)*0.766 + ${S(3)}*1.6`;
const PY = `${S(1)}*2.2*sin(2*pi*s) + ${S(2)}*(0.6 + 3.2*s)*0.643 + ${S(3)}*(-2.4 + 4.8*s)`;
const RR = `((${PX})^2 + (${PY})^2)`;
const comp = ([vx, vy]) => [`((${PX})*${vx} + (${PY})*${vy})/sqrt(${RR})`, `((${PX})*${vy} - (${PY})*${vx})/${RR}`];
const [VR, VT] = comp(V0), [WR, WT] = comp(W0);
const explore = {
  type: 'graph',
  title: 'Components change; the dot product does not',
  lead: t`Two arrows $V$ (gold) and $W$ (teal) carried along a path without turning or stretching — on a flat plane that is just sliding them. Their polar components change as the polar basis changes under them. Compare two ways of taking their dot product: with the metric, $g_{\mu\nu}V^\mu W^\nu = V^rW^r + r^2V^\theta W^\theta$, and without it.`,
  tasks: [
    t`Slide along the ray: $V^\theta$ and $W^\theta$ shrink like $1/r$ while $g_{\theta\theta} = r^2$ grows — and $g_{\mu\nu}V^\mu W^\nu$ holds at 1.04. The metric’s change exactly offsets the components’ change.`,
    t`Go round the circle: now $V^r$ and $W^r$ oscillate, yet the metric dot product still never moves. The naive sum $V^rW^r + V^\theta W^\theta$ wanders.`,
    t`That steadiness, for every pair of arrows carried along every path, is what $\nabla_\rho g_{\mu\nu} = 0$ says.`,
  ],
  params: {
    x: [-4.4, 4.4], y: [-2.9, 2.9], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
    choices: [{ key: 'p', label: 'Path', options: [[1, 'A circle, r = 2.2'], [2, 'A ray at 40°'], [3, 'A straight line x = 1.6']], value: 2, explain: 'The path along which the two arrows are carried.' }],
    sliders: [{ key: 's', label: 'how far along', min: 0, max: 1, step: 0.01, value: 0.2, explain: 'The fraction of the path travelled.' }],
    curves: [
      ...polarGrid(5),
      { param: ['2.2*cos(t)', '2.2*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.6, dash: [6, 4], when: S(1) },
      { param: ['0.766*t', '0.643*t'], t: [0.6, 3.8], color: 'ink3', width: 1.6, dash: [6, 4], when: S(2) },
      { param: ['1.6', 't'], t: [-2.4, 2.4], color: 'ink3', width: 1.6, dash: [6, 4], when: S(3) },
    ],
    arrows: [
      { from: [PX, PY], to: [`${PX} + (${PX})/sqrt(${RR})`, `${PY} + (${PY})/sqrt(${RR})`], color: 'accent', width: 1.6, label: '∂r' },
      { from: [PX, PY], to: [`${PX} - 0.25*(${PY})`, `${PY} + 0.25*(${PX})`], color: 'violet', width: 1.6, label: '¼∂θ' },
      { from: [PX, PY], to: [`${PX} + ${V0[0]}`, `${PY} + ${V0[1]}`], color: 'gold', width: 3, label: 'V' },
      { from: [PX, PY], to: [`${PX} + ${W0[0]}`, `${PY} + ${W0[1]}`], color: 'teal', width: 3, label: 'W' },
    ],
    points: [{ x: PX, y: PY, r: 4, color: 'ink' }, { x: 0, y: 0, r: 3, color: 'ink3' }],
    readouts: [
      { label: '$V^r$', expr: VR, digits: 3 }, { label: t`$V^\theta$`, expr: VT, digits: 3 },
      { label: '$W^r$', expr: WR, digits: 3 }, { label: t`$W^\theta$`, expr: WT, digits: 3 },
      { label: t`$g_{\theta\theta} = r^2$`, expr: RR, digits: 3 },
      { label: t`$g_{\mu\nu}V^\mu W^\nu$`, expr: `(${VR})*(${WR}) + ${RR}*(${VT})*(${WT})`, digits: 3 },
      { label: t`$V^rW^r + V^\theta W^\theta$ (no metric)`, expr: `(${VR})*(${WR}) + (${VT})*(${WT})`, digits: 3 },
    ],
  },
  caption: t`A flat plane under a polar grid. Gold $V$ and teal $W$: two fixed arrows carried along the dashed path; blue $\partial_r$ and violet $\tfrac14\partial_\theta$: the polar basis where they are. Readouts: their polar components, the metric component $g_{\theta\theta}$, and two dot products.`,
};

export default lesson({
  id: 'st-a.A8.4',
  title: 'Metric compatibility: ∇g = 0',
  minutes: 12, difficulty: 3,
  intro: t`The metric is a $(0, 2)$ tensor field, so it has a covariant derivative — two lower indices, two $-\Gamma$ terms:

$$\nabla_\rho g_{\mu\nu} = \partial_\rho g_{\mu\nu} - \Gamma^\lambda{}_{\rho\mu}\,g_{\lambda\nu} - \Gamma^\lambda{}_{\rho\nu}\,g_{\mu\lambda} = 0$$

It is **zero**. In Cartesian coordinates that is obvious ($g = \delta$, $\Gamma = 0$), and a tensor that vanishes in one system vanishes in all. In polar coordinates $g_{\theta\theta} = r^2$ certainly changes, but the $\Gamma$ terms cancel that change exactly. Two consequences matter. First, carrying vectors without turning them keeps their lengths and dot products, and raising or lowering an index commutes with $\nabla$. Second — read backwards — the equation **determines Γ from the metric**. Together with the symmetry $\Gamma^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\nu\mu}$ (lesson A8.2), solving it gives

$$\Gamma^\lambda{}_{\mu\nu} = \tfrac12\,g^{\lambda\sigma}\left(\partial_\mu g_{\nu\sigma} + \partial_\nu g_{\mu\sigma} - \partial_\sigma g_{\mu\nu}\right).$$`,
  symbols: [
    { tex: t`\nabla_\rho g_{\mu\nu}`, text: t`the covariant derivative of the metric along $x^\rho$: a $(0, 3)$ tensor, here zero in every component` },
    { tex: t`\partial_\rho g_{\mu\nu}`, text: t`the plain rate of change of the metric’s components — not zero in curvilinear coordinates ($\partial_rg_{\theta\theta} = 2r$ in polar)` },
    { tex: t`\Gamma^\lambda{}_{\rho\mu}g_{\lambda\nu}`, text: t`the correction for the lower index $\mu$ (summed over $\lambda$); the next term is the same for $\nu$` },
    { tex: t`g^{\lambda\sigma}`, text: t`the inverse metric (lesson A6.5), with $g^{\lambda\sigma}g_{\sigma\nu} = \delta^\lambda{}_\nu$` },
  ],
  why: t`On a curved space there are no Cartesian coordinates to differentiate basis vectors in, but there is always a metric. Metric compatibility is how general relativity gets its connection from $g_{\mu\nu}$ alone — derived on the Road in step gr.S11.d and dissected in gr.EQ.3.`,
  visual: explore,
  example: {
    prompt: t`Use $\nabla_\rho g_{\mu\nu} = 0$ for the polar metric, $g_{rr} = 1$, $g_{\theta\theta} = r^2$, $g_{r\theta} = 0$, to find $\Gamma^\theta{}_{r\theta}$ and $\Gamma^r{}_{\theta\theta}$ without drawing a single basis vector. Then check $\Gamma^r{}_{\theta\theta}$ with the general formula.`,
    visual: grid([['1', '0'], ['0', 'r²']], { rowNames: ['r', 'θ'], colNames: ['r', 'θ'], dx: 1.4, caption: t`The polar metric $g_{\mu\nu}$: only $g_{\theta\theta} = r^2$ varies, and only with $r$.` }),
    steps: [
      { label: 'Take ρ = r, μ = ν = θ', text: t`$0 = \nabla_rg_{\theta\theta} = \partial_rg_{\theta\theta} - 2\,\Gamma^\lambda{}_{r\theta}\,g_{\lambda\theta}$. The metric is diagonal, so only $\lambda = \theta$ survives: $0 = 2r - 2\,\Gamma^\theta{}_{r\theta}\,r^2$.` },
      { label: 'Solve', text: t`$\Gamma^\theta{}_{r\theta} = \dfrac{2r}{2r^2} = \dfrac1r$ — the value lesson A8.2 found by differentiating basis vectors.` },
      { label: 'Take ρ = θ, μ = r, ν = θ', text: t`$0 = \nabla_\theta g_{r\theta} = \partial_\theta g_{r\theta} - \Gamma^\lambda{}_{\theta r}g_{\lambda\theta} - \Gamma^\lambda{}_{\theta\theta}g_{r\lambda} = 0 - \Gamma^\theta{}_{\theta r}\,r^2 - \Gamma^r{}_{\theta\theta}\cdot1$.` },
      { label: 'Solve', text: t`$\Gamma^r{}_{\theta\theta} = -r^2\,\Gamma^\theta{}_{\theta r} = -r^2\cdot\dfrac1r = -r$, using the symmetry $\Gamma^\theta{}_{\theta r} = \Gamma^\theta{}_{r\theta}$. ✓` },
      { label: 'The formula', text: t`$\Gamma^r{}_{\theta\theta} = \tfrac12g^{rr}\big(\partial_\theta g_{\theta r} + \partial_\theta g_{\theta r} - \partial_rg_{\theta\theta}\big) = \tfrac12(1)(0 + 0 - 2r) = -r$ ✓. The metric alone produced the connection.` },
    ],
    answer: t`$\Gamma^\theta{}_{r\theta} = 1/r$ and $\Gamma^r{}_{\theta\theta} = -r$, from $\nabla g = 0$ and the symmetry of $\Gamma$; the general formula agrees.`,
  },
  practice: [
    num({
      id: 'sph-phi-r', difficulty: 2,
      gen(r) {
        const R = r.pick([0.5, 2, 4, 10]);
        return {
          prompt: t`Flat space in spherical coordinates has $g_{rr} = 1$, $g_{\theta\theta} = r^2$, $g_{\phi\phi} = r^2\sin^2\theta$ (diagonal). Use $\nabla_rg_{\phi\phi} = \partial_rg_{\phi\phi} - 2\,\Gamma^\phi{}_{r\phi}\,g_{\phi\phi} = 0$ to find $\Gamma^\phi{}_{r\phi}$ at $r = ${R}$ m, in $\text{m}^{-1}$.`,
          visual: { type: 'c3-coords', params: { system: 'spherical', point: [2.2, 55, 40], sliders: false, readouts: [], element: true, edgeLabels: true }, caption: t`Spherical coordinates (physics convention: $\theta$ from the $+z$ axis, $\phi$ around it). The small box has edges $dr$, $r\,d\theta$ and $r\sin\theta\,d\phi$ — the square roots of the metric components.` },
          answer: 1 / R, units: 'm^-1', tol: { rel: 0.005 },
          errors: [{ value: 2 / R, feedback: t`There are two $\Gamma$ terms, one per lower index: $2r\sin^2\theta = 2\,\Gamma^\phi{}_{r\phi}\,r^2\sin^2\theta$.` }, { value: R, feedback: 'Invert: Γ comes out as 1/r.' }].filter((e) => Math.abs(e.value - 1 / R) > 0.005),
          hints: [t`$\partial_r(r^2\sin^2\theta) = 2r\sin^2\theta$.`, t`Solve $2r\sin^2\theta = 2\,\Gamma^\phi{}_{r\phi}\,r^2\sin^2\theta$.`],
          teach: t`Metric compatibility, one component at a time, hands you the Christoffel symbols.`,
          explain: t`$\Gamma^\phi{}_{r\phi} = \dfrac{2r\sin^2\theta}{2r^2\sin^2\theta} = \dfrac1r = ${nice(1 / R, 4)}\ \text{m}^{-1}$: going outward, $\partial_\phi$ grows in proportion to $r$, like $\partial_\theta$.`,
        };
      },
    }),
    num({
      id: 'sph-phi-theta', difficulty: 3,
      gen(r) {
        const th = r.pick([20, 30, 45, 60, 75]);
        const ans = 1 / Math.tan(th * DEG);
        return {
          prompt: t`In spherical coordinates, $g_{\phi\phi} = r^2\sin^2\theta$. From $\nabla_\theta g_{\phi\phi} = 0$ find $\Gamma^\phi{}_{\theta\phi}$ at $\theta = ${th}^\circ$.`,
          visual: { type: 'c3-coords', params: { system: 'spherical', point: [2.2, th, 40], sliders: false, readouts: [], basis: true, element: false }, caption: t`The point at polar angle $${th}^\circ$; the circle of constant $\theta$ through it has radius $r\sin\theta$.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.tan(th * DEG), feedback: t`Divide $\partial_\theta g_{\phi\phi}$ by $2g_{\phi\phi}$: $\dfrac{2r^2\sin\theta\cos\theta}{2r^2\sin^2\theta} = \dfrac{\cos\theta}{\sin\theta}$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$0 = \partial_\theta g_{\phi\phi} - 2\,\Gamma^\phi{}_{\theta\phi}\,g_{\phi\phi}$ (diagonal metric).`, t`$\partial_\theta(r^2\sin^2\theta) = 2r^2\sin\theta\cos\theta$.`],
          teach: t`$\Gamma^\phi{}_{\theta\phi} = \partial_\theta\ln\sqrt{g_{\phi\phi}} = \cot\theta$.`,
          explain: t`$\Gamma^\phi{}_{\theta\phi} = \cot\theta = \cot${th}^\circ = ${nice(ans, 4)}$. Moving toward the equator, the circles of constant $\theta$ widen, and $\partial_\phi$ with them.`,
        };
      },
    }),
    num({
      id: 'sph-theta-phiphi', difficulty: 3,
      gen(r) {
        const th = r.pick([30, 45, 60, 120]);
        const ans = -Math.sin(th * DEG) * Math.cos(th * DEG);
        return {
          prompt: t`In spherical coordinates (diagonal metric, $g_{\theta\theta} = r^2$, $g_{\phi\phi} = r^2\sin^2\theta$, and $\Gamma^\phi{}_{\phi\theta} = \cot\theta$), the component $\nabla_\phi g_{\theta\phi} = 0$ reads $0 = -\Gamma^\phi{}_{\phi\theta}\,g_{\phi\phi} - \Gamma^\theta{}_{\phi\phi}\,g_{\theta\theta}$. Find $\Gamma^\theta{}_{\phi\phi}$ at $\theta = ${th}^\circ$.`,
          visual: { type: 'c3-coords', params: { system: 'spherical', point: [2.2, th, 30], sliders: false, readouts: [], basis: true }, caption: t`Going round the circle of constant $\theta$, the direction of $\partial_\phi$ swings toward the axis — partly along $\partial_\theta$.` },
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: -ans, feedback: 'Both Γ terms carry minus signs; move one across and check the sign.' }, { value: -Math.cos(th * DEG) / Math.sin(th * DEG), feedback: t`That is $-\cot\theta$. Multiply by $g_{\phi\phi}/g_{\theta\theta} = \sin^2\theta$.` }],
          hints: [t`$\Gamma^\theta{}_{\phi\phi} = -\Gamma^\phi{}_{\phi\theta}\,\dfrac{g_{\phi\phi}}{g_{\theta\theta}}$.`, t`$= -\cot\theta\,\sin^2\theta$.`],
          teach: t`Off-diagonal components of $\nabla g = 0$ link pairs of Christoffel symbols.`,
          explain: t`$\Gamma^\theta{}_{\phi\phi} = -\cot\theta\sin^2\theta = -\sin\theta\cos\theta = ${nice(ans, 4)}$ — the value gr.S11.d finds on a sphere, here inherited by each sphere $r =$ const of flat space.`,
        };
      },
    }),
    expr({
      id: 'parabolic', difficulty: 3,
      gen(r) {
        const [sym, ans, wrong, tex] = r.pick([
          ['uuu', 'u/(u^2 + v^2)', '2u/(u^2 + v^2)', t`\Gamma^u{}_{uu}`],
          ['uvv', '-u/(u^2 + v^2)', 'u/(u^2 + v^2)', t`\Gamma^u{}_{vv}`],
          ['vuv', 'u/(u^2 + v^2)', 'v/(u^2 + v^2)', t`\Gamma^v{}_{uv}`],
        ]);
        return {
          prompt: t`Parabolic coordinates on the flat plane, $x = \tfrac12(u^2 - v^2)$, $y = uv$, have the metric $ds^2 = (u^2 + v^2)(du^2 + dv^2)$. Use $\Gamma^\lambda{}_{\mu\nu} = \tfrac12g^{\lambda\sigma}(\partial_\mu g_{\nu\sigma} + \partial_\nu g_{\mu\sigma} - \partial_\sigma g_{\mu\nu})$ to find $${tex}$.`,
          visual: plane({ x: [-4, 4], y: [-2.5, 2.5], curves: [...[0.6, 1.2, 1.8, 2.4].map((u) => ({ param: [`0.5*(${u * u} - t^2)`, `${u}*t`], t: [-3, 3], color: 'accent', width: 1.2 })), ...[0.6, 1.2, 1.8, 2.4].map((v) => ({ param: [`0.5*(t^2 - ${v * v})`, `t*${v}`], t: [-3, 3], color: 'violet', width: 1.2 }))], caption: t`Lines of constant $u$ (blue) and constant $v$ (violet): two families of parabolas meeting at right angles — the same flat plane under another grid.` }),
          answer: ans, vars: { u: [0.5, 2], v: [0.5, 2] }, lhs: tex,
          errors: [{ answer: wrong, feedback: t`Check the factor $\tfrac12$ and which of the three derivatives survive: with a diagonal metric $g^{\lambda\sigma}$ forces $\sigma = \lambda$.` }],
          hints: [t`$g_{uu} = g_{vv} = u^2 + v^2$, $g_{uv} = 0$, and $g^{uu} = g^{vv} = 1/(u^2 + v^2)$.`, sym === 'uuu' ? t`$\Gamma^u{}_{uu} = \tfrac12g^{uu}(\partial_ug_{uu} + \partial_ug_{uu} - \partial_ug_{uu}) = \tfrac12g^{uu}\,\partial_ug_{uu}$.` : sym === 'uvv' ? t`$\Gamma^u{}_{vv} = \tfrac12g^{uu}(0 + 0 - \partial_ug_{vv})$.` : t`$\Gamma^v{}_{uv} = \tfrac12g^{vv}(\partial_ug_{vv} + \partial_vg_{uv} - \partial_vg_{uv}) = \tfrac12g^{vv}\,\partial_ug_{vv}$.`],
          teach: 'The Christoffel formula works in any coordinates from the metric alone.',
          explain: t`With $\partial_u(u^2 + v^2) = 2u$: $${tex} = ${sym === 'uvv' ? t`-\tfrac12\cdot\dfrac{2u}{u^2 + v^2}` : t`\tfrac12\cdot\dfrac{2u}{u^2 + v^2}`} = ${sym === 'uvv' ? '-' : ''}\dfrac{u}{u^2 + v^2}$.`,
        };
      },
    }),
    mcq({
      id: 'not-changing', difficulty: 2, kind: 'error',
      prompt: t`A student says: “In polar coordinates $\partial_rg_{\theta\theta} = 2r \ne 0$, so the plane’s geometry changes as you move outward — lengths measured far out are not like lengths near the centre.” What is wrong?`,
      visual: pairPic([[1, 0.6], [2.2, 1.3], [3.2, 1.9]], t`The same two arrows at three points along a ray: polar components differ, lengths and angle do not.`),
      choices: [
        t`$\partial_rg_{\theta\theta}$ only tracks the grid: $\partial_\theta$ is $r$ long. The geometry is unchanged, because $\nabla_\rho g_{\mu\nu} = 0$`,
        'Nothing: the plane really is stretched far from the origin',
        t`The error is the number: $\partial_rg_{\theta\theta} = 0$`,
        'The metric is only defined at the origin',
      ],
      answer: 0,
      why: {
        1: 'The plane is flat and the same everywhere; Cartesian coordinates show it with a constant metric.',
        2: t`$g_{\theta\theta} = r^2$, so its derivative is $2r$.`,
        3: 'It is a field, defined at every point.',
      },
      hints: [t`Which quantity is a tensor: $\partial_\rho g_{\mu\nu}$ or $\nabla_\rho g_{\mu\nu}$?`],
      teach: t`$\partial g \ne 0$ in curvilinear coordinates says nothing about geometry; $\nabla g = 0$ always.`,
      explain: t`$g_{\theta\theta} = r^2$ because the basis vector $\partial_\theta$ is $r$ long. The covariant derivative subtracts that: $\nabla_rg_{\theta\theta} = 2r - 2\cdot\tfrac1r\cdot r^2 = 0$. Lengths and angles of arrows carried around do not change.`,
    }),
    multi({
      id: 'consequences', difficulty: 2,
      prompt: t`Which of these follow from $\nabla_\rho g_{\mu\nu} = 0$ (with $\Gamma$ symmetric)? Select every one.`,
      visual: pairPic([[2.2, 0.4], [-0.8, 2.0], [-1.8, -1.2]], 'Two arrows carried without turning: their lengths and the angle between them never change.'),
      choices: [
        t`$\nabla_\mu V_\nu = g_{\nu\lambda}\nabla_\mu V^\lambda$: lowering an index commutes with ∇`,
        'Carrying two vectors without turning them keeps their dot product',
        'The Christoffel symbols are fixed by the metric and its first derivatives',
        'Every Christoffel symbol is zero',
        t`Every partial derivative $\partial_\rho g_{\mu\nu}$ is zero`,
      ],
      answer: [0, 1, 2],
      why: { 3: t`Polar coordinates satisfy $\nabla g = 0$ with $\Gamma^r{}_{\theta\theta} = -r$.`, 4: t`$\partial_rg_{\theta\theta} = 2r$ in polar coordinates; only the covariant derivative vanishes.` },
      hints: [t`Apply the product rule to $\nabla_\mu(g_{\nu\lambda}V^\lambda)$ and to $\nabla(g_{\mu\nu}V^\mu W^\nu)$.`],
      teach: 'Metric compatibility makes ∇ respect the metric: dot products, raising and lowering, and the connection itself all follow.',
      explain: t`$\nabla_\mu(g_{\nu\lambda}V^\lambda) = (\nabla_\mu g_{\nu\lambda})V^\lambda + g_{\nu\lambda}\nabla_\mu V^\lambda$, and the first term is zero. The same rule keeps $g(V, W)$ constant when $V$ and $W$ are carried without turning. Solving $\nabla g = 0$ with symmetric $\Gamma$ gives the formula in the introduction.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-track', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([20, 30, 45]), rdot = r.pick([-150, -90, 120]), w = r.pick([0.004, 0.006, 0.008]);
        const v = Math.sqrt(rdot * rdot + (R * 1000 * w) ** 2);
        return {
          prompt: t`An air-traffic radar tracks an aircraft at range $r = ${R}$ km, ${rdot < 0 ? 'closing' : 'opening'} at $\dot r = ${rdot}$ m/s, while its bearing turns at $\dot\theta = ${w}$ rad/s. Its velocity has polar components $(V^r, V^\theta) = (\dot r, \dot\theta)$. Using the polar metric, find its speed, in m/s.`,
          visual: plane({ x: [-3.6, 3.6], y: [-2.2, 2.2], curves: polarGrid(4), arrows: [...basisAt([1.8, 1.0], { k: 0.3 }), { from: [1.8, 1.0], to: [1.8 + 0.9 * Math.sign(rdot) * 0.874, 1.0 + 0.9 * Math.sign(rdot) * 0.486 + 0.6], color: 'gold', width: 3, label: 'V' }], points: [{ x: 0, y: 0, r: 4, color: 'ink', label: 'radar', labelDx: 6, labelDy: 14 }, { x: 1.8, y: 1.0, r: 4, color: 'ink' }], caption: 'Schematic, not to scale: the radar at the centre of its polar grid and the aircraft’s velocity.' }),
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(rdot * rdot + w * w), feedback: t`Without the metric factor $g_{\theta\theta} = r^2$ the angular rate is not a speed: multiply $\dot\theta$ by $r$ (in metres).` }, { value: Math.abs(rdot) + R * 1000 * w, feedback: 'Add the squares, not the components: the radial and sideways parts are perpendicular.' }],
          hints: [t`$|V|^2 = g_{\mu\nu}V^\mu V^\nu = \dot r^2 + r^2\dot\theta^2$.`, t`$r\dot\theta = ${R * 1000}\times${w} = ${nice(R * 1000 * w)}$ m/s.`],
          teach: t`The speed is the scalar $\sqrt{g_{\mu\nu}V^\mu V^\nu}$, the same whatever the coordinates; in a straight unaccelerated flight it stays constant while $\dot r$ and $\dot\theta$ change.`,
          explain: t`$|V| = \sqrt{(${rdot})^2 + (${nice(R * 1000 * w)})^2} = ${nice(v, 4)}$ m/s. As the aircraft flies on in a straight line, $\dot r$ and $\dot\theta$ both change, but this number does not — metric compatibility at work.`,
        };
      },
    }),
    num({
      id: 'cp-theta-r', difficulty: 2,
      gen(r) {
        const R = r.pick([0.2, 3, 6, 12]);
        return {
          prompt: t`In spherical coordinates $g_{\theta\theta} = r^2$. From $\nabla_rg_{\theta\theta} = 0$, find $\Gamma^\theta{}_{r\theta}$ at $r = ${R}$ m, in $\text{m}^{-1}$.`,
          visual: { type: 'c3-coords', params: { system: 'spherical', point: [2, 60, 30], sliders: false, readouts: [], element: true, edgeLabels: false }, caption: 'Spherical coordinates and the coordinate box at a point.' },
          answer: 1 / R, units: 'm^-1', tol: { rel: 0.005 },
          hints: [t`$0 = \partial_rg_{\theta\theta} - 2\,\Gamma^\theta{}_{r\theta}\,g_{\theta\theta}$.`],
          teach: t`Compatibility fixes $\Gamma^\theta{}_{r\theta} = \partial_r\ln\sqrt{g_{\theta\theta}} = 1/r$.`,
          explain: t`$\Gamma^\theta{}_{r\theta} = \dfrac{2r}{2r^2} = \dfrac1r = ${nice(1 / R, 4)}\ \text{m}^{-1}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-unique', difficulty: 2,
      prompt: t`On a curved surface, nobody can differentiate basis vectors in Cartesian components, because there are none. How then are its Christoffel symbols found?`,
      visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'sphere', controls: false, readout: false }, caption: 'A sphere with the coordinate basis at a point: there is no flat background to differentiate in.' },
      choices: [
        t`From the metric alone: $\nabla g = 0$ plus symmetry of $\Gamma$ has exactly one solution, the formula $\tfrac12g^{\lambda\sigma}(\partial_\mu g_{\nu\sigma} + \partial_\nu g_{\mu\sigma} - \partial_\sigma g_{\mu\nu})$`,
        'They cannot be found; curved surfaces have no connection',
        'By choosing coordinates in which they are all zero everywhere',
        'They are measured directly by experiment at each point',
      ],
      answer: 0,
      why: {
        1: 'Every surface with a metric has its Levi-Civita connection.',
        2: 'That is possible at one point only (locally flat coordinates), never everywhere on a curved surface — that failure is curvature.',
        3: 'They follow from the metric, which is what measurements of distance determine.',
      },
      hints: ['Which ingredient does every curved space have, flat or not?'],
      teach: 'The metric determines the connection: the Christoffel formula is the unique symmetric, metric-compatible solution.',
      explain: t`Counting: $\nabla_\rho g_{\mu\nu} = 0$ is $n\cdot n(n+1)/2$ equations for the $n\cdot n(n+1)/2$ symmetric $\Gamma$’s, and they solve uniquely to the formula. That is how gr.S11.d builds the connection of curved spacetime.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 3 (metric compatibility and the Christoffel connection)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §5.4 (Christoffel symbols and the metric)', url: 'https://www.cambridge.org/9780521887052' },
  ],
});
