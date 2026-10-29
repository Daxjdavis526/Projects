// The Levi-Civita tensor and the volume element: the symbol ε̃ (±1, 0) is the
// same array in every chart, so it is not a tensor; ε = √|g| ε̃ is. Its value
// on the coordinate steps is the volume of the coordinate cell: dV = √|g| dⁿx.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6, plane, polarGrid, DEG } from './_tcalc.js';
import { grid } from './_ten.js';

const t = String.raw;

const sph = (point, caption, o = {}) => ({ type: 'c3-coords', params: { system: 'spherical', point, sliders: false, readouts: [], element: true, edgeLabels: o.edgeLabels ?? false, ...o.extra }, caption });

// a polar cell: the wedge r..r+dr, θ..θ+dθ drawn on a polar grid
function cellPic(R, th, dr, dth, caption) {
  const a = th * DEG, b = (th + dth) * DEG;
  return plane({
    x: [-4.2, 4.2], y: [-2.6, 2.6],
    curves: [
      ...polarGrid(5),
      { param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [r6(a), r6(b)], color: 'gold', width: 2.6 },
      { param: [`${R + dr}*cos(t)`, `${R + dr}*sin(t)`], t: [r6(a), r6(b)], color: 'gold', width: 2.6 },
      { param: [`t*${r6(Math.cos(a))}`, `t*${r6(Math.sin(a))}`], t: [R, R + dr], color: 'gold', width: 2.6 },
      { param: [`t*${r6(Math.cos(b))}`, `t*${r6(Math.sin(b))}`], t: [R, R + dr], color: 'gold', width: 2.6 },
    ],
    points: [{ x: 0, y: 0, r: 3, color: 'ink3' }, { x: r6((R + dr + 0.35) * Math.cos((a + b) / 2)), y: r6((R + dr + 0.35) * Math.sin((a + b) / 2)), r: 0.01, color: 'gold', label: 'r dθ', labelDx: 0, labelDy: 0, labelAlign: 'center' }, { x: r6((R + dr / 2) * Math.cos(a) + 0.25 * Math.sin(a)), y: r6((R + dr / 2) * Math.sin(a) - 0.25 * Math.cos(a)), r: 0.01, color: 'gold', label: 'dr', labelDx: 0, labelDy: 0, labelAlign: 'center' }],
    caption,
  });
}

// a hollow cylinder (a solid-rocket grain), end-on
function grainPic(Ro, Ri, caption) {
  const s = 2 / Ro;
  return plane({
    x: [-3.6, 3.6], y: [-2.3, 2.3],
    curves: [{ param: [`${r6(Ro * s)}*cos(t)`, `${r6(Ro * s)}*sin(t)`], t: [0, 6.2832], color: 'warn', width: 2.6 }, { param: [`${r6(Ri * s)}*cos(t)`, `${r6(Ri * s)}*sin(t)`], t: [0, 6.2832], color: 'warn', width: 2.6 }, ...[0.25, 0.5, 0.75].map((f) => ({ param: [`${r6((Ri + f * (Ro - Ri)) * s)}*cos(t)`, `${r6((Ri + f * (Ro - Ri)) * s)}*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1 }))],
    arrows: [{ from: [0, 0], to: [r6(Ro * s), 0], color: 'ink2', width: 1.4, label: 'outer', labelDy: 14 }, { from: [0, 0], to: [0, r6(Ri * s)], color: 'ink2', width: 1.4, label: 'port', labelDx: 6 }],
    points: [{ x: 0, y: 0, r: 3, color: 'ink3' }],
    caption,
  });
}

export default lesson({
  id: 'st-a.A10.1',
  title: 'The Levi-Civita tensor and the volume element',
  minutes: 12, difficulty: 3,
  intro: t`The Levi-Civita **symbol** $\tilde\varepsilon_{\mu_1\cdots\mu_n}$ of lesson A1.3 is $+1$, $-1$ or $0$ in every coordinate system — the same array everywhere, which is exactly why it cannot be a tensor. Transform a totally antisymmetric $(0, n)$ tensor and every component picks up the **Jacobian determinant**; the metric’s determinant picks up its square. The cure is to multiply by $\sqrt{|g|}$:

$$\varepsilon_{\mu_1\cdots\mu_n} = \sqrt{|g|}\;\tilde\varepsilon_{\mu_1\cdots\mu_n}, \qquad dV = \sqrt{|g|}\;dx^1\cdots dx^n$$

This **Levi-Civita tensor** measures volume: fed the $n$ coordinate steps $dx^1\partial_1, \ldots, dx^n\partial_n$, it returns the volume of the little cell they span. That is the volume element of every multiple integral in curvilinear coordinates — $r\,dr\,d\theta$, $r^2\sin\theta\,dr\,d\theta\,d\phi$ — now with its reason attached. With one index raised it also makes cross products work in any coordinates.`,
  symbols: [
    { tex: t`\tilde\varepsilon_{\mu_1\cdots\mu_n}`, text: t`the Levi-Civita symbol: $+1$ for an even permutation of $1\ldots n$, $-1$ for an odd one, $0$ if an index repeats — in every chart` },
    { tex: t`\varepsilon_{\mu_1\cdots\mu_n}`, text: 'the Levi-Civita tensor, a genuine (0, n) tensor (for coordinates of the same handedness)' },
    { tex: t`|g|`, text: t`the absolute value of the determinant of the metric; the absolute value matters in spacetime, where $g < 0$` },
    { tex: t`dV`, text: t`the volume (area, in 2D) of the coordinate cell with edges $dx^1, \ldots, dx^n$` },
    { tex: t`dx^1\cdots dx^n`, text: 'the coordinate steps — in polar coordinates dr dθ, in spherical dr dθ dφ' },
  ],
  why: t`Every integral over space or spacetime in general relativity — total mass, the Einstein–Hilbert action $\int R\sqrt{-g}\,d^4x$, the volume inside a horizon — carries the factor $\sqrt{|g|}$, and the Hodge star that turns $F_{\mu\nu}$ into its dual is built from $\varepsilon$.`,
  visual: {
    type: 'c3-coords',
    title: 'The coordinate box and its volume',
    lead: t`A point P in spherical (or cylindrical) coordinates, with the small box whose edges are the coordinate steps. Its edges are $dr$, $r\,d\theta$ and $r\sin\theta\,d\phi$ — the square roots of the diagonal metric components — so its volume is $\sqrt g\,dr\,d\theta\,d\phi$ with $\sqrt g = r^2\sin\theta$.`,
    tasks: [
      t`Increase $r$: the box grows in two directions at once, like $r^2$.`,
      t`Bring $\theta$ toward 0: the box flattens into a sliver as the circle of constant $\theta$ shrinks — $\sin\theta \to 0$, and $\sqrt g$ with it. At the pole the coordinates fail.`,
      t`Switch to cylindrical coordinates: only one edge, $\rho\,d\phi$, depends on position, and $\sqrt g = \rho$.`,
    ],
    params: { system: 'spherical', choose: true, point: [2.2, 55, 40], element: true, edgeLabels: true, readouts: ['r', 'theta', 'phi'] },
    caption: t`Physics convention: $\theta$ from the $+z$ axis, $\phi$ around it. The box is drawn large so it can be seen; its edge formulas hold for small steps. Drag to turn the picture.`,
  },
  example: {
    prompt: t`Transform the Levi-Civita tensor of the plane from Cartesian components ($\varepsilon_{xy} = 1$) to polar coordinates, use it to find the area of a disk, and then find $\varepsilon_{r\theta\phi}$ in spherical coordinates and the cross product $\partial_r \times \partial_\theta$ there.`,
    visual: cellPic(2.2, 25, 0.6, 22, t`A polar cell: sides $dr$ and $r\,d\theta$, area $r\,dr\,d\theta$ (drawn large).`),
    steps: [
      { label: 'Two lower indices, two Jacobians', text: t`$\varepsilon_{r\theta} = \dfrac{\partial x^a}{\partial r}\dfrac{\partial x^b}{\partial\theta}\varepsilon_{ab} = \dfrac{\partial x}{\partial r}\dfrac{\partial y}{\partial\theta} - \dfrac{\partial y}{\partial r}\dfrac{\partial x}{\partial\theta} = \cos\theta\cdot r\cos\theta - \sin\theta\cdot(-r\sin\theta) = r$.` },
      { label: 'Compare with the metric', text: t`$g = \det\begin{pmatrix} 1 & 0 \\ 0 & r^2 \end{pmatrix} = r^2$, so $\sqrt g = r$ ✓. The symbol would have said $\tilde\varepsilon_{r\theta} = 1$; the tensor says $r$ — the Jacobian determinant.` },
      { label: 'Area', text: t`The cell spanned by $dr\,\partial_r$ and $d\theta\,\partial_\theta$ has area $\varepsilon(dr\,\partial_r, d\theta\,\partial_\theta) = r\,dr\,d\theta$. A disk: $\displaystyle\int_0^{2\pi}\!\!\int_0^R r\,dr\,d\theta = \pi R^2$ ✓.` },
      { label: 'Spherical', text: t`$g = 1\cdot r^2\cdot r^2\sin^2\theta$, so $\varepsilon_{r\theta\phi} = \sqrt g = r^2\sin\theta$ (for $0 < \theta < \pi$), and $dV = r^2\sin\theta\,dr\,d\theta\,d\phi$; the ball’s volume is $\tfrac43\pi R^3$.` },
      { label: 'A cross product', text: t`$(U\times W)^\lambda = g^{\lambda\kappa}\varepsilon_{\kappa\mu\nu}U^\mu W^\nu$. For $U = \partial_r$, $W = \partial_\theta$ only $\lambda = \phi$ survives: $(\partial_r\times\partial_\theta)^\phi = \dfrac{1}{r^2\sin^2\theta}\cdot r^2\sin\theta = \dfrac{1}{\sin\theta}$.` },
      { label: 'Check', text: t`$\partial_r = \hat r$ and $\partial_\theta = r\hat\theta$, so $\partial_r\times\partial_\theta = r\,\hat r\times\hat\theta = r\hat\phi$; and $\hat\phi = \partial_\phi/(r\sin\theta)$, giving $\tfrac{1}{\sin\theta}\partial_\phi$ ✓.` },
    ],
    answer: t`$\varepsilon_{r\theta} = r = \sqrt g$, so $dA = r\,dr\,d\theta$ and a disk has area $\pi R^2$; $\varepsilon_{r\theta\phi} = r^2\sin\theta$; $\partial_r\times\partial_\theta = \tfrac{1}{\sin\theta}\,\partial_\phi$.`,
  },
  practice: [
    num({
      id: 'sqrtg', difficulty: 1,
      gen(r) {
        const R = r.pick([2, 3, 5]), th = r.pick([30, 60, 90, 150]);
        const ans = R * R * Math.sin(th * DEG);
        return {
          prompt: t`What is $\varepsilon_{r\theta\phi} = \sqrt g$ at the point $(r, \theta, \phi) = (${R}, ${th}^\circ, 40^\circ)$ of flat space in spherical coordinates?`,
          visual: sph([Math.min(R, 2.4), th, 40], t`The coordinate box at the point ($r$ drawn at schematic size).`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: R * Math.sin(th * DEG), feedback: t`$\sqrt g$ is the product of all three edge factors: $1\cdot r\cdot r\sin\theta = r^2\sin\theta$.` }, { value: R * R, feedback: t`Include the $\sin\theta$ of the $\phi$ edge, $r\sin\theta\,d\phi$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$g = \det\text{diag}(1, r^2, r^2\sin^2\theta)$.`],
          teach: t`In spherical coordinates $\varepsilon_{r\theta\phi} = \sqrt g = r^2\sin\theta$.`,
          explain: t`$\sqrt g = r^2\sin\theta = ${R * R}\sin${th}^\circ = ${nice(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'arctic', difficulty: 2,
      gen(r) {
        const [name, colat] = r.pick([['north of the Arctic Circle (latitude 66.56°N)', 23.44], ['north of latitude 60°N', 30], ['within 10° of the North Pole', 10]]);
        const R = 6371, ans = 2 * Math.PI * R * R * (1 - Math.cos(colat * DEG));
        return {
          prompt: t`Treat Earth as a sphere of radius 6371 km. On a sphere $r = R$ the area element is $\varepsilon_{\theta\phi}\,d\theta\,d\phi = R^2\sin\theta\,d\theta\,d\phi$. Find the area of the region ${name}, in $\text{km}^2$.`,
          visual: sph([2.2, colat, 40], t`Spherical coordinates: the cap is the region with $\theta$ smaller than the point’s ($\theta$ measured from the pole).`, { extra: { surfaces: ['theta'] } }),
          answer: ans, units: 'km^2', tol: { rel: 0.01 },
          errors: [{ value: Math.PI * (R * colat * DEG) ** 2, feedback: t`That treats the cap as a flat disk. Integrate $R^2\sin\theta$ from 0 to $\theta_0$.` }, { value: 2 * Math.PI * R * R * Math.sin(colat * DEG), feedback: t`$\int_0^{\theta_0}\sin\theta\,d\theta = 1 - \cos\theta_0$, not $\sin\theta_0$.` }].filter((e) => Math.abs(e.value - ans) > 0.03 * ans),
          hints: [t`The region is $0 \le \theta \le ${colat}^\circ$, all $\phi$.`, t`$A = \displaystyle\int_0^{2\pi}\!\!\int_0^{\theta_0}R^2\sin\theta\,d\theta\,d\phi = 2\pi R^2(1 - \cos\theta_0)$.`],
          teach: t`Areas on a sphere use $\sqrt g = R^2\sin\theta$: the cells shrink toward the poles.`,
          explain: t`$A = 2\pi(6371)^2(1 - \cos${colat}^\circ) = ${tex(ans, 4)}\ \text{km}^2$ — ${nice((100 * (1 - Math.cos(colat * DEG))) / 2, 3)}% of Earth’s surface.`,
        };
      },
    }),
    num({
      id: 'linear', difficulty: 2,
      gen(r) {
        const [a, b, c, d] = r.pick([[2, 0, 0, 3], [1, 1, -1, 1], [2, 1, 1, 3], [3, 1, 0, 2]]);
        const det = a * d - b * c, ans = 1 / Math.abs(det);
        return {
          prompt: t`New coordinates on the plane are $u = ${a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}y$, $v = ${c}x ${d < 0 ? '-' : '+'} ${Math.abs(d)}y$. In them, the area element is $\sqrt g\,du\,dv$. What is $\sqrt g$?`,
          visual: plane({ x: [-3.5, 3.5], y: [-2.2, 2.2], curves: [...[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k) => ({ param: [`${r6((k * a) / (a * a + b * b))} - ${r6(b)}*t`, `${r6((k * b) / (a * a + b * b))} + ${r6(a)}*t`], t: [-6, 6], color: 'accent', width: 1 })), ...[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k) => ({ param: [`${r6((k * c) / (c * c + d * d))} - ${r6(d)}*t`, `${r6((k * d) / (c * c + d * d))} + ${r6(c)}*t`], t: [-6, 6], color: 'violet', width: 1 }))], caption: t`Lines of constant $u$ (blue) and $v$ (violet), one unit apart: each cell has the same area.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: Math.abs(det) === 1 ? [] : [{ value: Math.abs(det), feedback: t`A cell $du\,dv$ is small when the new coordinates change fast: $\sqrt g = 1/|\det\partial(u, v)/\partial(x, y)|$, not the determinant itself.` }],
          hints: [t`$\sqrt g = |\det\partial(x, y)/\partial(u, v)|$, the inverse of $|\det\partial(u, v)/\partial(x, y)|$.`, t`$\det\begin{pmatrix} ${a} & ${b} \\ ${c} & ${d} \end{pmatrix} = ${det}$.`],
          teach: t`Under a change of coordinates $\sqrt{|g|}$ picks up the Jacobian determinant $|\det\partial x/\partial x'|$.`,
          explain: t`$\sqrt g = 1/|${det}| = ${nice(ans, 4)}$: one unit square of $(u, v)$ covers ${nice(ans, 4)} of the plane’s area.`,
        };
      },
    }),
    mcq({
      id: 'symbol', difficulty: 2,
      prompt: t`Why is the Levi-Civita symbol $\tilde\varepsilon_{\mu\nu}$ (with $\tilde\varepsilon_{12} = +1$ in every chart) not a tensor?`,
      visual: cellPic(2.2, 25, 0.6, 22, t`A polar cell: its area is $r\,dr\,d\theta$, not $dr\,d\theta$.`),
      choices: [
        t`A $(0, 2)$ tensor’s components change with two Jacobian factors; from $\varepsilon_{xy} = 1$ they give $\varepsilon_{r\theta} = r$, not 1`,
        'Because it is antisymmetric, and tensors must be symmetric',
        'Because it has more than one index',
        'It is a tensor, but only in Cartesian coordinates',
      ],
      answer: 0,
      why: {
        1: t`Antisymmetric tensors are common: $F_{\mu\nu}$ is one.`,
        2: 'The metric has two indices and is a tensor.',
        3: '“A tensor only in one chart” is not a tensor: the transformation law must hold between all charts.',
      },
      hints: [t`Transform $\varepsilon_{xy} = 1$ to polar coordinates with the $(0, 2)$ law and compare with the symbol’s value 1.`],
      teach: t`The symbol ignores the Jacobian; the tensor $\sqrt{|g|}\,\tilde\varepsilon$ carries it.`,
      explain: t`$\varepsilon_{r\theta} = \det\partial(x, y)/\partial(r, \theta) = r$. A fixed array cannot track that, so the true tensor is $\sqrt g\,\tilde\varepsilon$.`,
    }),
    num({
      id: 'cross', difficulty: 3,
      gen(r) {
        const th = r.pick([30, 45, 60, 120]);
        const ans = 1 / Math.sin(th * DEG);
        return {
          prompt: t`In spherical coordinates, $(U\times W)^\lambda = g^{\lambda\kappa}\,\varepsilon_{\kappa\mu\nu}\,U^\mu W^\nu$ with $\varepsilon_{r\theta\phi} = r^2\sin\theta$ and $g^{\phi\phi} = 1/(r^2\sin^2\theta)$. Find the component $(\partial_r\times\partial_\theta)^\phi$ at $\theta = ${th}^\circ$.`,
          visual: sph([2.2, th, 40], t`The unit vectors at the point; $\partial_r = \hat r$, $\partial_\theta = r\hat\theta$, $\partial_\phi = r\sin\theta\,\hat\phi$.`, { extra: { element: false } }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.sin(th * DEG), feedback: t`Raising the index divides by $r^2\sin^2\theta$: $r^2\sin\theta/(r^2\sin^2\theta) = 1/\sin\theta$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Only $\varepsilon_{\phi r\theta} = \varepsilon_{r\theta\phi} = r^2\sin\theta$ (a cyclic shift) contributes.`, t`$(\partial_r\times\partial_\theta)^\phi = g^{\phi\phi}\varepsilon_{\phi r\theta}$.`],
          teach: t`With $\varepsilon$ and the inverse metric, the cross product works in any coordinates: $\partial_r\times\partial_\theta = \tfrac{1}{\sin\theta}\partial_\phi$.`,
          explain: t`$(\partial_r\times\partial_\theta)^\phi = \dfrac{r^2\sin\theta}{r^2\sin^2\theta} = \dfrac{1}{\sin${th}^\circ} = ${nice(ans, 4)}$. Its length is $\tfrac{1}{\sin\theta}|\partial_\phi| = r$, as $|\hat r\times r\hat\theta| = r$ demands.`,
        };
      },
    }),
    mcq({
      id: 'spacetime', difficulty: 2,
      prompt: t`In inertial coordinates of Minkowski spacetime, $g_{\mu\nu} = \text{diag}(-1, 1, 1, 1)$. What is $\varepsilon_{0123}$, and why does the definition use $|g|$?`,
      visual: grid([['−1', '0', '0', '0'], ['0', '1', '0', '0'], ['0', '0', '1', '0'], ['0', '0', '0', '1']], { rowNames: ['0', '1', '2', '3'], colNames: ['0', '1', '2', '3'], dx: 1.2, caption: t`The Minkowski metric $\eta_{\mu\nu}$, signature $(-, +, +, +)$: its determinant is $-1$.` }),
      choices: [
        t`$+1$: $g = -1$, and $\sqrt{|g|} = 1$; without the absolute value the square root of a negative determinant would be imaginary`,
        t`$-1$, because the time component of the metric is negative`,
        t`$i$, because $\sqrt{g} = \sqrt{-1}$`,
        t`$0$: spacetime has no volume`,
      ],
      answer: 0,
      why: {
        1: t`The sign of $g$ appears when an index is raised: Carroll’s $\varepsilon^{0123} = -1$. The lower-index $\varepsilon_{0123}$ is $+\sqrt{|g|}$.`,
        2: 'That is what the absolute value prevents.',
        3: t`Four-volume is perfectly well defined: $d^4V = \sqrt{-g}\,d^4x$.`,
      },
      hints: [t`$\det\eta = (-1)(1)(1)(1)$.`],
      teach: t`In spacetime $g < 0$, so volumes and $\varepsilon$ use $\sqrt{-g} = \sqrt{|g|}$.`,
      explain: t`$\varepsilon_{0123} = \sqrt{|g|} = 1$ in inertial coordinates. In general relativity the same factor appears as $\sqrt{-g}$ in every spacetime integral; for Schwarzschild in its usual coordinates, $\sqrt{-g} = r^2\sin\theta$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-grain', difficulty: 3, transfer: true,
      gen(r) {
        const Ro = r.pick([0.25, 0.3]), Ri = r.pick([0.06, 0.08, 0.1]), L = r.pick([1.5, 2, 3]);
        const V = Math.PI * (Ro * Ro - Ri * Ri) * L, m = 1770 * V;
        return {
          prompt: t`A solid-rocket motor’s propellant grain is a hollow cylinder: outer radius ${Ro * 100} cm, central port radius ${Ri * 100} cm, length ${L} m. In cylindrical coordinates $dV = \rho\,d\rho\,d\phi\,dz$. With a propellant density of $1770\ \text{kg/m}^3$, find the grain’s mass, in kg.`,
          visual: grainPic(Ro, Ri, 'The grain seen end-on (to scale): propellant between the outer case and the central port.'),
          answer: m, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: 1770 * Math.PI * (Ro - Ri) ** 2 * L, feedback: t`$\int\rho\,d\rho = \tfrac12(\rho_o^2 - \rho_i^2)$, not $(\rho_o - \rho_i)^2/2$.` }, { value: 1770 * 2 * Math.PI * (Ro - Ri) * L, feedback: t`Without the factor $\rho$ in $dV$ the cell volume is wrong: $\sqrt g = \rho$.` }],
          hints: [t`$V = \displaystyle\int_0^L\!\!\int_0^{2\pi}\!\!\int_{\rho_i}^{\rho_o}\rho\,d\rho\,d\phi\,dz$.`, t`$V = \pi(\rho_o^2 - \rho_i^2)L$.`],
          teach: t`The cylindrical volume element $\rho\,d\rho\,d\phi\,dz$ is $\sqrt g\,d^3x$ with $\sqrt g = \rho$.`,
          explain: t`$V = \pi(${Ro}^2 - ${Ri}^2)(${L}) = ${nice(V, 4)}\ \text{m}^3$, so $m = 1770\,V = ${nice(m, 4)}$ kg.`,
        };
      },
    }),
    num({
      id: 'cp-view', difficulty: 3, transfer: true,
      gen(r) {
        const [name, alt] = r.pick([['the International Space Station', 420], ['a GPS satellite', 20200], ['a geostationary satellite', 35786]]);
        const R = 6378, rr = R + alt, frac = (1 - R / rr) / 2;
        return {
          prompt: t`From ${name}, ${alt} km above the equator, Earth (radius 6378 km) is visible out to the cap where the line of sight grazes the surface: $\cos\theta_0 = R/r$, with $r$ the distance from Earth’s centre and $\theta_0$ measured at the centre. Using the area element $R^2\sin\theta\,d\theta\,d\phi$, what percentage of Earth’s surface is in view at once?`,
          visual: plane({ x: [-3.6, 3.6], y: [-2.2, 2.2], curves: [{ param: ['1.4*cos(t)', '1.4*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, { param: ['1.4*cos(t)', '1.4*sin(t)'], t: [0.709, 2.433], color: 'gold', width: 4 }, { param: ['0', '1.4 + 0.75*t'], t: [0, 1], color: 'ink4', width: 1, dash: [4, 4] }], arrows: [{ from: [0, 2.15], to: [1.063, 0.911], color: 'ink3', width: 1.2 }, { from: [0, 2.15], to: [-1.063, 0.911], color: 'ink3', width: 1.2 }], points: [{ x: 0, y: 2.15, r: 4.5, color: 'ink', label: 'satellite', labelDx: 8 }, { x: 0, y: 0, r: 3, color: 'ink3' }], caption: 'Schematic, not to scale: the visible cap (gold) ends where the line of sight grazes the surface.' }),
          answer: frac * 100, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 50, feedback: 'Half the surface is visible only from infinitely far away; closer in, the cap is smaller.' }, { value: (1 - Math.cos(Math.acos(R / rr))) * 100, feedback: t`Divide by the whole sphere’s $4\pi R^2$: the cap is $2\pi R^2(1 - \cos\theta_0)$.` }],
          hints: [t`Cap area $= 2\pi R^2(1 - \cos\theta_0)$; the whole sphere is $4\pi R^2$.`, t`Fraction $= \tfrac12(1 - R/r)$ with $r = ${rr}$ km.`],
          teach: t`Fractions of a sphere’s area come from integrating $\sin\theta$: a cap of half-angle $\theta_0$ is $\tfrac12(1 - \cos\theta_0)$ of the whole.`,
          explain: t`$\tfrac12(1 - 6378/${rr}) = ${nice(frac * 100, 4)}\%$ of the surface.`,
        };
      },
    }),
    num({
      id: 'cp-eps', difficulty: 2,
      gen(r) {
        const rho = r.pick([0.5, 2, 3]);
        return {
          prompt: t`In cylindrical coordinates $(\rho, \phi, z)$, with $ds^2 = d\rho^2 + \rho^2d\phi^2 + dz^2$, what is $\varepsilon_{\rho\phi z}$ at $\rho = ${rho}$?`,
          visual: { type: 'c3-coords', params: { system: 'cylindrical', point: [Math.min(Math.max(rho, 1.2), 2.4), 50, 1.2], sliders: false, readouts: [], element: true, edgeLabels: false }, caption: 'The cylindrical coordinate box at a point (schematic size).' },
          answer: rho, tol: { rel: 0.005 },
          errors: [{ value: rho * rho, feedback: t`$g = \rho^2$, and $\varepsilon = \sqrt g\,\tilde\varepsilon$: take the square root.` }].filter((e) => Math.abs(e.value - rho) > 0.01),
          hints: [t`$\sqrt g = \sqrt{1\cdot\rho^2\cdot1}$.`],
          teach: t`$\varepsilon_{\rho\phi z} = \sqrt g = \rho$.`,
          explain: t`$\varepsilon_{\rho\phi z} = \rho = ${rho}$: the box $d\rho\times\rho\,d\phi\times dz$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 2 (tensor densities, the Levi-Civita tensor and the volume element)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'OpenStax Calculus Vol. 3, §5.7 (change of variables in multiple integrals)', url: 'https://openstax.org/books/calculus-volume-3/pages/5-7-change-of-variables-in-multiple-integrals' },
  ],
});
