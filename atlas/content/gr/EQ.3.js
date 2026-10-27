// Christoffel symbols of the Levi-Civita connection, dissected: how the
// metric's first derivatives become the connection that steers geodesics.
// Conventions: Carroll's, signature (−,+,+,+). Verified with sympy: polar
// Γ^r_θθ = −r, Γ^θ_rθ = 1/r; sphere Γ^θ_φφ = −sin θ cos θ; Schwarzschild
// Γ^r_00 = (GM/c²r²)(1 − r_s/r); rotating frame Γ^r_tt = −ω²r (flat).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { sci, round, table4 } from './_eq.js';

const t = String.raw;
const DEG = Math.PI / 180;

const CHR = t`\Gamma^\lambda{}_{\mu\nu} = \tfrac12\,g^{\lambda\sigma}\left(\partial_\mu g_{\nu\sigma} + \partial_\nu g_{\mu\sigma} - \partial_\sigma g_{\mu\nu}\right)`;

const basis = (caption) => ({
  type: 'gr-coordinates',
  params: { mode: 'basis', p: [2.5, 1.5], readout: false },
  caption: caption ?? t`A flat plane with a polar grid. Blue: the unit arrow $\hat r$ at each point; violet: the step for a fixed small turn $\Delta\theta$, which grows in proportion to $r$. Both change from point to point, though the plane is perfectly flat.`,
});

// the lower index pair of one Γ^λ: symmetric, so 10 of 16 are independent
const lowerPairs = table4({
  cells: [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => `${i}${j}`)),
  colors: [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => (i === j ? 'gold' : i < j ? 'accent' : 'ink4'))),
  rowName: 'μ', colName: 'ν', dx: -9,
  caption: t`For one value of the upper index $\lambda$, the 16 lower pairs $(\mu, \nu)$ in four dimensions. Since $\Gamma^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\nu\mu}$, the faint ones repeat the blue ones: 4 diagonal + 6 off-diagonal = 10 independent.`,
});

// the rotating-frame metric: one off-diagonal (t, φ) pair, as in the Kerr metric
const rotMetric = table4({
  cells: [
    ['−(c²−ω²r²)', '0', 'ωr²', '0'],
    ['0', '1', '0', '0'],
    ['ωr²', '0', 'r²', '0'],
    ['0', '0', '0', '1'],
  ],
  colors: [
    ['gold', 'ink4', 'gold', 'ink4'], ['ink4', 'accent', 'ink4', 'ink4'], ['gold', 'ink4', 'gold', 'ink4'], ['ink4', 'ink4', 'ink4', 'accent'],
  ],
  rowLabels: ['t', 'r', 'φ', 'z'], colLabels: ['t', 'r', 'φ', 'z'], dx: -26,
  caption: t`The metric $g_{\mu\nu}$ of flat spacetime in coordinates turning with a space station at angular speed $\omega$. Gold: the $t$–$\phi$ block, with its off-diagonal $g_{t\phi} = \omega r^2$.`,
});

// a spinning station seen from above: the rim, and the outward artificial gravity
const stationPicture = (() => {
  const arrows = [];
  for (let k = 0; k < 8; k++) {
    const th = (k * Math.PI) / 4 + Math.PI / 8;
    arrows.push({ from: [round(0.82 * Math.cos(th), 4), round(0.82 * Math.sin(th), 4)], to: [round(1.12 * Math.cos(th), 4), round(1.12 * Math.sin(th), 4)], color: 'warn' });
  }
  return {
    type: 'graph',
    params: {
      x: [-2.3, 2.3], y: [-1.45, 1.45], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [
        { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 4 },
        { param: ['0.08cos(t)', '0.08sin(t)'], t: [0, 6.2832], color: 'ink3', width: 2 },
        { param: ['1.3cos(t)', '1.3sin(t)'], t: [0.3, 1.25], color: 'accent', width: 1.6 },
      ],
      arrows: [...arrows, { from: [round(1.3 * Math.cos(1.1), 4), round(1.3 * Math.sin(1.1), 4)], to: [round(1.3 * Math.cos(1.3), 4), round(1.3 * Math.sin(1.3), 4)], color: 'accent', label: 'spin ω', labelDx: 8, labelDy: -8 }],
      points: [{ x: 1.02, y: -0.95, r: 0.01, color: 'teal', label: 'rim, radius R', labelDx: 10, labelDy: 0 }],
    },
    caption: 'Seen from above, not to scale: a ring-shaped station spinning about its hub. Orange: the outward push anyone standing on the rim feels as artificial gravity.',
  };
})();

export default lesson({
  id: 'gr.EQ.3',
  kind: 'dissection',
  title: 'Christoffel symbols',
  minutes: 8, difficulty: 3,
  badges: ['est-der'],
  equation: t`\part{1}{\Gamma^\lambda{}_{\mu\nu}} = \part{2}{\tfrac12\,g^{\lambda\sigma}}\left(\part{3}{\partial_\mu g_{\nu\sigma} + \partial_\nu g_{\mu\sigma}}\;\part{4}{-\;\partial_\sigma g_{\mu\nu}}\right)`,
  intro: t`This formula is the bridge from the **metric** — the rule for measuring lengths and times — to **motion**. It turns the metric's rates of change into the connection: the numbers that say how the coordinate grid turns and stretches, which the geodesic equation uses to steer free fall and the covariant derivative uses to compare vectors at different places.

Read it as a recipe: take first derivatives of the metric, combine them in a fixed $+\,+\,-$ pattern, and raise one index with the inverse metric. Conventions are Carroll's, signature $(-,+,+,+)$; in spacetime every index runs over $0, 1, 2, 3$ (on a surface, over its two coordinates), and the repeated $\sigma$ is summed. Each symbol below gets its own card.`,
  parts: [
    {
      tex: t`\Gamma^\lambda{}_{\mu\nu}`, name: 'the Christoffel symbol', badge: 'est-der', units: t`$\text{m}^{-1}$ for length coordinates`,
      text: t`One number for each choice of three indices. **$\mu$** is the direction you step; **$\nu$** labels the grid arrow (or the vector component) being carried; **$\lambda$**, upstairs, is the direction of the change that results. In the covariant derivative, $\nabla_\mu V^\lambda = \partial_\mu V^\lambda + \Gamma^\lambda{}_{\mu\nu}V^\nu$.

Swapping $\mu$ and $\nu$ changes nothing, $\Gamma^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\nu\mu}$, so in four dimensions there are $4 \times 10 = 40$ independent symbols at every event. Gravity's "field strength" — Newton's $g$ — is one of them, seen from coordinates fixed to the ground.`,
      more: t`The cleanest meaning: the change of the grid's own arrows, $\partial_\mu \mathbf e_\nu = \Gamma^\lambda{}_{\mu\nu}\,\mathbf e_\lambda$. In polar coordinates, stepping around turns $\mathbf e_\theta$ inward ($\Gamma^r{}_{\theta\theta} = -r$) and stepping outward lengthens it ($\Gamma^\theta{}_{r\theta} = 1/r$). The symbols are **not a tensor**: a change of coordinates adds a term built from its second derivatives, which is why they can vanish in one coordinate system and not in another.`,
    },
    {
      tex: t`\tfrac12\,g^{\lambda\sigma}`, name: 'the inverse metric, and a half', badge: 'est-der',
      text: t`$g^{\lambda\sigma}$ is the **inverse** of the metric matrix: $g^{\lambda\sigma}g_{\sigma\nu} = \delta^\lambda{}_\nu$ (1 when $\lambda = \nu$, else 0). It raises the bracket's index $\sigma$ to the upper position $\lambda$. Because $\sigma$ appears twice in the term — up here, down in the bracket — it is a **dummy index, summed** over all its values. For a diagonal metric only $\sigma = \lambda$ survives and $g^{\lambda\lambda} = 1/g_{\lambda\lambda}$; with off-diagonal parts you must invert the whole matrix.

The $\tfrac12$ is exact: the bracket equals twice the Christoffel symbol with its upper index lowered.`,
    },
    {
      tex: t`\partial_\mu g_{\nu\sigma} + \partial_\nu g_{\mu\sigma}`, name: 'the two “plus” derivatives', badge: 'est-der', units: t`$\text{m}^{-1}$`,
      text: t`$\partial_\mu$ is the partial derivative with respect to the coordinate $x^\mu$: how fast a metric component changes as you step that way. These two terms are mirror images under $\mu \leftrightarrow \nu$, which is what makes $\Gamma^\lambda{}_{\mu\nu}$ symmetric — the connection has **no torsion**.

Where the metric's components are constant — Cartesian coordinates on a flat sheet, or inertial coordinates in flat spacetime — every derivative vanishes, and so does every Christoffel symbol.`,
    },
    {
      tex: t`-\;\partial_\sigma g_{\mu\nu}`, name: 'the “minus” derivative', badge: 'est-der', units: t`$\text{m}^{-1}$`,
      text: t`The third term differentiates $g_{\mu\nu}$ along the output direction $\sigma$. Its minus sign is not a convention: the $+\,+\,-$ pattern is the **only** combination that keeps the metric covariantly constant, $\nabla_\rho g_{\mu\nu} = 0$, so that rulers and clocks carried along keep their lengths and rates.

In polar coordinates, $ds^2 = dr^2 + r^2d\theta^2$, it is the only surviving term of $\Gamma^r{}_{\theta\theta} = -\tfrac12\,\partial_r(r^2) = -r$ — the "centrifugal" symbol of the grid.`,
      more: t`No torsion plus $\nabla g = 0$ fixes the connection completely: this is the **Levi-Civita connection**, the one general relativity uses. Solve $\nabla_\rho g_{\mu\nu} = 0$ for $\Gamma$, adding the three index orderings with signs $+\,+\,-$, and this formula drops out.`,
    },
  ],
  readAloud: t`Each Christoffel symbol is half the inverse metric times a fixed plus–plus–minus combination of the metric's first derivatives: it measures how the coordinate grid turns and stretches, and it vanishes wherever the metric's components are constant.`,
  why: t`These are the numbers that steer every geodesic and that the Riemann tensor is built from; computing them from a metric is the first step of almost every calculation in general relativity.`,
  visual: {
    type: 'gr-coordinates',
    title: 'Christoffel symbols of a flat plane',
    lead: t`Polar coordinates on a perfectly flat plane. At P, blue is $\hat r$ and violet is the step for a small turn $\Delta\theta$ — the grid arrow $\mathbf e_\theta$, scaled. Their rates of change are the Christoffel symbols: stepping outward stretches $\mathbf e_\theta$ by $1/r$ per metre ($\Gamma^\theta{}_{r\theta} = 1/r$), and stepping around turns it toward the centre ($\Gamma^r{}_{\theta\theta} = -r$).`,
    tasks: [
      t`Drag P outward and read the stretch per unit step: $1/r$, the symbol $\Gamma^\theta{}_{r\theta}$.`,
      t`Follow the faint arrows around P’s circle: each $\hat r$ is turned by the angle between the points — the turning that $\Gamma^r{}_{\theta\theta}$ and $\Gamma^\theta{}_{\theta r}$ record.`,
      'Nothing about the plane is curved. Non-zero Christoffel symbols here come from the curved grid alone.',
    ],
    params: { mode: 'basis', p: [2.5, 1.5] },
  },
  practice: [
    mcq({
      id: 'roles', difficulty: 1,
      prompt: t`$$${CHR}$$ Which index is summed over on the right-hand side?`,
      choices: [t`$\sigma$: it appears twice in each term, once up (in $g^{\lambda\sigma}$) and once down (in the bracket)`, t`$\lambda$: it labels the inverse metric`, t`$\mu$ and $\nu$: they appear in every derivative`, 'All four indices are summed'],
      answer: 0,
      why: {
        1: t`$\lambda$ appears once on each side of the equation: it is free, and each of its values gives a different symbol.`,
        2: t`$\mu$ and $\nu$ also appear on the left-hand side: they are free indices, fixed for each symbol.`,
        3: 'Only an index repeated within one term, once up and once down, is summed. The others label which symbol you are computing.',
      },
      hints: ['A free index appears on both sides of the equation; a summed (dummy) index appears twice within one term on one side only.'],
      teach: 'Free indices (λ, μ, ν) label which Christoffel symbol you compute; the repeated σ is summed.',
      explain: t`$\lambda$, $\mu$ and $\nu$ appear on both sides — they pick out one symbol. $\sigma$ appears only on the right, once up and once down, so it is summed: $\Gamma^\lambda{}_{\mu\nu} = \sum_\sigma \tfrac12 g^{\lambda\sigma}(\ldots)_{\sigma}$.`,
    }),
    expr({
      id: 'polar', difficulty: 2,
      prompt: t`Polar coordinates on a flat plane: $ds^2 = dr^2 + r^2\,d\theta^2$, so $g_{rr} = 1$, $g_{\theta\theta} = r^2$ and $g_{r\theta} = 0$. Use the formula to find $\Gamma^r{}_{\theta\theta}$.`,
      answer: '-r', answerTeX: '-r', lhs: t`\Gamma^r{}_{\theta\theta}`,
      vars: { r: [0.5, 4] },
      errors: [
        { answer: 'r', feedback: 'Check the sign: the only surviving term is the “minus” derivative, $-\\partial_r g_{\\theta\\theta}$.' },
        { answer: '-2r', feedback: 'You dropped the ½ in front.' },
        { answer: '-r^2/2', feedback: 'Differentiate $g_{\\theta\\theta} = r^2$ with respect to $r$ before multiplying by ½.' },
      ],
      hints: [t`With $\lambda = r$ and a diagonal metric, only $\sigma = r$ survives: $g^{rr} = 1$.`, t`$\Gamma^r{}_{\theta\theta} = \tfrac12\,g^{rr}\left(\partial_\theta g_{\theta r} + \partial_\theta g_{\theta r} - \partial_r g_{\theta\theta}\right)$, and $g_{\theta r} = 0$.`],
      teach: t`In polar coordinates the minus term alone gives $\Gamma^r{}_{\theta\theta} = -r$: stepping around turns the grid arrow $\mathbf e_\theta$ toward the centre.`,
      explain: t`$\Gamma^r{}_{\theta\theta} = \tfrac12(1)\left(0 + 0 - \partial_r r^2\right) = -r$. It is the grid's "centrifugal" symbol: in the geodesic equation it produces the $-r\dot\theta^2$ of polar acceleration, $\ddot r - r\dot\theta^2$.`,
      visual: basis(),
    }),
    num({
      id: 'sphere', difficulty: 2,
      gen(r) {
        const colat = r.pick([20, 30, 40, 50, 60, 70]);
        const val = -Math.sin(colat * DEG) * Math.cos(colat * DEG);
        return {
          prompt: t`On a sphere of radius $a$, $ds^2 = a^2\,d\theta^2 + a^2\sin^2\theta\,d\phi^2$ ($\theta$ measured from the north pole). The formula gives $\Gamma^\theta{}_{\phi\phi} = \tfrac12\,g^{\theta\theta}\left(-\partial_\theta g_{\phi\phi}\right)$. Evaluate it at $\theta = ${colat}^\circ$ (latitude ${90 - colat}°N).`,
          answer: val, tol: { rel: 0.01 },
          errors: [{ value: -Math.sin(2 * colat * DEG), feedback: 'You dropped the ½: −½ × 2 sin θ cos θ = −sin θ cos θ.' }, { value: -0.5 * Math.sin(colat * DEG) ** 2, feedback: 'Differentiate $g_{\\phi\\phi} = a^2 \\sin^2\\theta$ with respect to $\\theta$ (giving $2a^2 \\sin\\theta\\cos\\theta$) rather than using it as it stands.' }],
          hints: [t`$g^{\theta\theta} = 1/a^2$ and $\partial_\theta(a^2\sin^2\theta) = 2a^2\sin\theta\cos\theta$.`, t`So $\Gamma^\theta{}_{\phi\phi} = -\sin\theta\cos\theta$ — the radius $a$ cancels.`],
          teach: t`On a sphere $\Gamma^\theta{}_{\phi\phi} = -\sin\theta\cos\theta$, whatever the radius: it is why only the equator, where it vanishes, is a geodesic among the circles of latitude.`,
          explain: t`$\Gamma^\theta{}_{\phi\phi} = \tfrac12\cdot\dfrac{1}{a^2}\left(-2a^2\sin\theta\cos\theta\right) = -\sin ${colat}^\circ\cos ${colat}^\circ = ${fmt(val, 3)}$. It vanishes only at the equator and the poles.`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: 90 - colat, transport: false, readout: false }, caption: t`Not to scale: the circle at colatitude $\theta = ${colat}^\circ$. Drag the slider to see other circles of latitude.` },
        };
      },
    }),
    mcq({
      id: 'inverse', difficulty: 2,
      prompt: t`In coordinates turning with a space station — as in the Kerr metric of a spinning black hole — the metric has an off-diagonal component, $g_{t\phi} = \omega r^2$. To use the formula you need the inverse metric $g^{\lambda\sigma}$. Which statement is right?`,
      choices: [
        t`Invert the whole $t$–$\phi$ block: $g^{tt}$ and $g^{t\phi}$ both depend on all three of $g_{tt}$, $g_{t\phi}$ and $g_{\phi\phi}$, so $g^{tt} \neq 1/g_{tt}$`,
        t`Take each component's reciprocal: $g^{tt} = 1/g_{tt}$ and $g^{t\phi} = 1/g_{t\phi}$`,
        'The inverse metric is the metric itself with its indices written upstairs',
        'Off-diagonal components never enter the Christoffel symbols, so they can be ignored',
      ],
      answer: 0,
      why: {
        1: t`Component-by-component reciprocals invert a matrix only when it is diagonal. Here $g^{tt}$ works out to $-1/c^2$, not $1/g_{tt} = -1/(c^2 - \omega^2 r^2)$.`,
        2: t`Raising both indices with $g^{\mu\nu}$ gives the inverse only because $g^{\lambda\sigma}g_{\sigma\nu} = \delta^\lambda{}_\nu$ — which is the definition of the matrix inverse, not a relabelling.`,
        3: t`The sum over $\sigma$ runs over every component, so $g^{t\phi}$ and $\partial g_{t\phi}$ both feed in: they are where Coriolis forces — and frame dragging near a spinning black hole — come from.`,
      },
      hints: [t`The defining property is $g^{\lambda\sigma}g_{\sigma\nu} = \delta^\lambda{}_\nu$ — matrix inversion.`, 'For a 2 × 2 block [[A, B], [B, D]] the inverse is [[D, −B], [−B, A]] divided by AD − B².'],
      teach: 'The inverse metric is the matrix inverse; reciprocals of single components work only for diagonal metrics.',
      explain: t`For the $t$–$\phi$ block, $\det = g_{tt}g_{\phi\phi} - g_{t\phi}^2 = -c^2r^2$, so $g^{tt} = g_{\phi\phi}/\det = -1/c^2$, $g^{t\phi} = \omega/c^2$ and $g^{\phi\phi} = 1/r^2 - \omega^2/c^2$. Those mixed entries are where the Coriolis terms come from.`,
      visual: rotMetric,
    }),
    num({
      id: 'count', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 5]);
        const N = (n * n * (n + 1)) / 2;
        return {
          prompt: t`In $n$ dimensions, $\lambda$ takes $n$ values and the lower pair $(\mu, \nu)$ is symmetric. How many independent Christoffel symbols $\Gamma^\lambda{}_{\mu\nu}$ are there for $n = ${n}$? (In spacetime, $n = 4$ gives 40.)`,
          answer: N, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: n * n * n, feedback: 'That counts every $(\\mu, \\nu)$ pair separately; $\\Gamma^\\lambda{}_{\\mu\\nu} = \\Gamma^\\lambda{}_{\\nu\\mu}$, so mirror pairs are not independent.' }, { value: (n * n * (n - 1)) / 2, feedback: 'That leaves out the diagonal pairs μ = ν: a symmetric pair has n(n + 1)/2 independent values, not n(n − 1)/2.' }],
          hints: [t`A symmetric $n\times n$ array has $n(n+1)/2$ independent entries.`, t`Multiply by the $n$ values of $\lambda$: $n \cdot n(n+1)/2$.`],
          teach: 'Symmetry in the lower pair leaves n²(n + 1)/2 independent Christoffel symbols: 6 on a surface, 40 in spacetime.',
          explain: t`$${n}\times\dfrac{${n}\times${n + 1}}{2} = ${N}$. For $n = 2$ (a surface) that is 6, for $n = 4$ (spacetime) 40.`,
          visual: lowerPairs,
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-not-tensor', difficulty: 2,
      prompt: t`On the same flat plane, polar coordinates give $\Gamma^r{}_{\theta\theta} = -r$, while in Cartesian coordinates every Christoffel symbol is zero. What does that show?`,
      choices: [
        'Christoffel symbols are not tensors: they depend on the coordinates, so a non-zero value alone says nothing about curvature',
        'The plane is curved when described in polar coordinates',
        'Polar coordinates are mistaken, and only Cartesian ones give correct physics',
        'Cartesian coordinates hide the plane’s curvature',
      ],
      answer: 0,
      why: {
        1: 'Curvature belongs to the plane, not the labels: carry an arrow around any loop on it and it comes back unturned, in either coordinate system.',
        2: 'Both descriptions are correct; polar coordinates simply have curved grid lines, which the Christoffel symbols record.',
        3: 'There is nothing to hide: the plane is flat, and its Riemann tensor is zero in every coordinate system.',
      },
      hints: ['A tensor that is zero in one coordinate system is zero in all of them. Is that true here?'],
      teach: 'Christoffel symbols can be switched on and off by changing coordinates; curvature cannot.',
      explain: t`A tensor that vanishes in one coordinate system vanishes in all, but $\Gamma$ does not: it transforms with an extra term. So Christoffel symbols measure the coordinate grid as much as spacetime, and curvature must be read from the Riemann tensor instead — which is zero here in both systems.`,
      visual: { type: 'gr-coordinates', params: { mode: 'measure', grid: 'polar', shape: 'none', shapeChoice: false, readout: false }, caption: 'One flat plane, labelled two ways. Switch between polar and Cartesian coordinates: the plane does not change; only the grid does.' },
    }),
    num({
      id: 'cp-station', difficulty: 3, transfer: true,
      gen(r) {
        const [R, rpm] = r.pick([[100, 2], [56, 4], [225, 2], [150, 3], [500, 1]]);
        const w = (2 * Math.PI * rpm) / 60, g = w * w * R;
        return {
          prompt: t`Far from any planet, spacetime is flat — but in coordinates turning with a ring-shaped space station at angular speed $\omega$, the metric has $g_{tt} = -(c^2 - \omega^2 r^2)$ and $g_{rr} = 1$, and the only surviving term for $\Gamma^r{}_{tt}$ is $-\tfrac12\,g^{rr}\,\partial_r g_{tt}$. The station's rim is at $R = ${R}$ m and it turns ${rpm} time${rpm > 1 ? 's' : ''} a minute. Find the size of $\Gamma^r{}_{tt}$ at the rim, in $\text{m/s}^2$.`,
          answer: g, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: w * R, feedback: 'That is $\\omega R$, the rim speed in m/s. Square $\\omega$: $\\Gamma^r{}_{tt} = -\\omega^2 r$.' }, { value: 2 * w * w * R, feedback: 'You dropped the ½: $\\partial_r g_{tt} = 2\\omega^2 r$, and half of it is $\\omega^2 r$.' }, { value: (rpm * rpm) * R, feedback: 'Convert to radians per second first: ω = 2π × (turns per minute)/60.' }],
          hints: [t`$\partial_r g_{tt} = \partial_r(-c^2 + \omega^2r^2) = 2\omega^2r$, so $\Gamma^r{}_{tt} = -\omega^2 r$.`, t`$\omega = 2\pi\times${rpm}/60 = ${fmt(w, 4)}$ rad/s; evaluate $\omega^2 R$.`],
          teach: t`In a rotating frame the Christoffel symbol $\Gamma^r{}_{tt} = -\omega^2 r$ is the artificial gravity: a connection with no curvature, as the equivalence principle says.`,
          explain: t`$\Gamma^r{}_{tt} = -\omega^2 R = -(${fmt(w, 4)})^2\times${R} = ${sci(-g)}\ \text{m/s}^2$. For someone at rest on the rim, the geodesic equation says a released object accelerates outward at $\omega^2 R = ${sci(g)}\ \text{m/s}^2$ — the artificial gravity. The Riemann tensor here is exactly zero: this "gravity" is pure coordinates, just like gravity measured in a lab fixed to the ground.`,
          visual: stationPicture,
        };
      },
    }),
    mcq({
      id: 'cp-falling', difficulty: 3,
      prompt: 'Astronauts in a freely falling laboratory can always choose coordinates in which every Christoffel symbol is zero at the lab’s centre. What can they not make zero?',
      choices: [
        'The rates of change of the Christoffel symbols across the lab — the curvature, felt as tides between objects at different places',
        'The Christoffel symbols at the centre: gravity cannot be switched off',
        t`The metric: in free fall $g_{\mu\nu}$ must vanish`,
        'Their own proper time',
      ],
      answer: 0,
      why: {
        1: 'They can: in free fall the connection at your location vanishes. That is the equivalence principle — astronauts float.',
        2: t`At the centre the metric becomes the flat $\eta_{\mu\nu} = \operatorname{diag}(-1, 1, 1, 1)$, not zero; a zero metric would measure nothing.`,
        3: 'Proper time is what their clocks read; it is not something a coordinate choice removes.',
      },
      hints: ['Locally, free fall removes gravity. What survives across a larger lab?', 'Two objects floating a few metres apart slowly drift relative to each other. What is that drift?'],
      teach: 'Christoffel symbols can be made zero at a point; their derivatives — the curvature, felt as tides — cannot.',
      explain: t`In free fall the connection vanishes at one point (locally inertial coordinates), but its first derivatives cannot all be removed when spacetime is curved: they combine into the Riemann tensor. Across the lab that shows up as tides — objects slowly drifting apart along the line to Earth and together across it.`,
      visual: { type: 'gr-elevator', params: { mode: 'falling', tides: true }, caption: 'A box falling freely near Earth. Released balls float: no gravity at the centre. Over a larger box they drift into a stretched diamond — tides, which no choice of coordinates removes (drift exaggerated).' },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.2 (the Christoffel connection)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Carroll, Lecture Notes on GR, ch. 3', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
