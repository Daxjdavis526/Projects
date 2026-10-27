// The covariant derivative of vectors and tensors — Derivation Mode. A vector
// field is components times basis vectors, V = V^ν e_ν; differentiating the
// product honestly gives ∇_μV^ν = ∂_μV^ν + Γ^ν_μλ V^λ, with the connection
// defined by ∂_μ e_λ = Γ^ν_μλ e_ν. Worked in polar coordinates (flat plane,
// so every number can be checked against Cartesian ones); covectors (−Γ),
// tensors (one Γ per index), ∇g = 0 and the divergence (1/√g)∂_μ(√g V^μ).
// Every result verified with SymPy (scratch v10_11.py).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sci } from './_curvature.js';
import { table4 } from './_eq.js';
import { rnd, polarGrid, fieldArrows, fieldGraph } from './_tensors.js';

const t = String.raw;

// the Explore: three fields on a polar grid, a draggable point P, and ∂ against ∇ at P
const S1 = 'step(0.5 - abs(f - 1))', S2 = 'step(0.5 - abs(f - 2))', S3 = 'step(0.5 - abs(f - 3))';
const RP = 'sqrt(px^2 + py^2)', R2 = '(px^2 + py^2)';
const explore = {
  type: 'graph',
  title: 'A partial derivative and a covariant one, side by side',
  lead: t`Three vector fields on a flat plane, described in polar coordinates $(r, \theta)$. Drag the point P. The readouts give the naive derivative $\partial_\theta V^r$, the correction $\Gamma^r{}_{\theta\theta}V^\theta$ from the turning grid and their sum $\nabla_\theta V^r$ — then the same three for the divergence.`,
  tasks: [
    t`Uniform field: drag P anywhere. $\partial_\theta V^r$ changes from place to place, the correction always cancels it, and $\nabla_\theta V^r$ stays exactly 0 — the field really is constant.`,
    t`Swirl field: every partial derivative of its components is zero, yet $\nabla_\theta V^r = -r$. Going round, the arrows really do turn toward the centre.`,
    t`Radial field: the naive divergence $\partial_\mu V^\mu$ says 1, the covariant one says 2 — and 2 is right: $\partial_x x + \partial_y y = 2$ in Cartesian coordinates.`,
  ],
  params: {
    x: [-4.4, 4.4], y: [-3.4, 3.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    choices: [{ key: 'f', label: 'Field', options: [[1, 'Uniform (eₓ)'], [2, 'Swirl (∂θ)'], [3, 'Radial (r ∂r)']], value: 1, explain: 'Uniform: V = (1, 0) everywhere. Swirl: V = (−y, x), a plate turning at 1 rad/s. Radial: V = (x, y).' }],
    curves: polarGrid(5),
    arrows: [
      ...fieldArrows('uniform', { when: S1 }), ...fieldArrows('swirl', { when: S2 }), ...fieldArrows('radial', { when: S3 }),
      { from: ['px', 'py'], to: [`px + 0.7*px/${RP}`, `py + 0.7*py/${RP}`], color: 'accent2', label: 'r̂', labelDx: 4, labelDy: -4 },
      { from: ['px', 'py'], to: [`px - 0.7*py/${RP}`, `py + 0.7*px/${RP}`], color: 'violet', label: 'θ̂', labelDx: 4, labelDy: -4 },
      { from: ['px', 'py'], to: [`px + 0.6*${S1} + 0.17*(px*${S3} - py*${S2})`, `py + 0.17*(py*${S3} + px*${S2})`], color: 'gold' },
    ],
    drag: [{ key: 'p', x: 2.2, y: 1.4 }],
    points: [{ x: 0, y: 0, r: 3, color: 'ink2' }],
    readouts: [
      { label: '$r$ at P', expr: RP, digits: 3 },
      { label: '$\\partial_\\theta V^r$', expr: `-${S1}*py/${RP}`, digits: 3 },
      { label: '$\\Gamma^r{}_{\\theta\\theta}V^\\theta$', expr: `${S1}*py/${RP} - ${S2}*${RP}`, digits: 3 },
      { label: '$\\nabla_\\theta V^r$', expr: `-${S1}*py/${RP} + ${S1}*py/${RP} - ${S2}*${RP}`, digits: 3 },
      { label: '$\\partial_\\mu V^\\mu$', expr: `-${S1}*px/${R2} + ${S3}`, digits: 3 },
      { label: '$\\Gamma^\\mu{}_{\\mu\\lambda}V^\\lambda$', expr: `${S1}*px/${R2} + ${S3}`, digits: 3 },
      { label: '$\\nabla_\\mu V^\\mu$', expr: `-${S1}*px/${R2} + ${S1}*px/${R2} + 2*${S3}`, digits: 3 },
    ],
  },
  caption: t`A flat plane under a polar grid. Grey: the chosen field (its arrows to scale with one another, not with the grid); gold: its value at P; blue $\hat r$ and violet $\hat\theta$: the grid's own unit arrows at P. The readouts are the exact formulas evaluated at P, in grid units. Drag P.`,
};

const nablaTable = table4({
  cells: [0, 1, 2, 3].map((m) => [0, 1, 2, 3].map((n) => `∇${'₀₁₂₃'[m]}V${'⁰¹²³'[n]}`)),
  colors: [0, 1, 2, 3].map((m) => [0, 1, 2, 3].map((n) => (m === n ? 'gold' : 'accent'))),
  rowName: 'μ', colName: 'ν', dx: -15,
  caption: t`The 16 components of $\nabla_\mu V^\nu$ in spacetime, one for each pair of free indices $(\mu, \nu)$. Each one is a sum over the dummy index $\lambda$.`,
});

const basisPic = (caption) => ({ type: 'gr-coordinates', params: { mode: 'basis', p: [2.4, 1.3], readout: false }, caption });

// a covector as a stack of lines x = const, pierced by the uniform field
const covectorPic = {
  type: 'graph',
  params: {
    x: [-4.4, 4.4], y: [-2.4, 2.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    vlines: [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((x) => ({ x, color: 'violet' })),
    arrows: [-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].flatMap((x0) => [-2, -1, 0, 1, 2].map((y) => ({ from: [x0 - 0.35, y], to: [x0 + 0.35, y], color: 'gold' }))),
  },
  caption: t`A covector drawn as a stack of lines: $\omega = dx$ is the family $x = $ const (violet). The uniform field $V = \mathbf e_x$ (gold) crosses one line per unit step, so $\omega_\nu V^\nu = 1$ everywhere — a scalar, with no grid of its own to turn.`,
};

// the far-field plume of a small thruster (schematic)
const plume = (r1, r2) => {
  const arrows = [];
  for (const a of [-0.5, -0.25, 0, 0.25, 0.5]) arrows.push({ from: [rnd(0.35 * Math.cos(a), 4), rnd(0.35 * Math.sin(a), 4)], to: [rnd(3.9 * Math.cos(a), 4), rnd(3.9 * Math.sin(a), 4)], color: 'warn' });
  const s1 = 3.6 * (r1 / r2);
  return {
    type: 'graph',
    params: {
      x: [-0.8, 4.6], y: [-2.3, 2.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [
        { param: [`${rnd(s1, 4)}*cos(t)`, `${rnd(s1, 4)}*sin(t)`], t: [-0.6, 0.6], color: 'accent', width: 2 },
        { param: ['3.6*cos(t)', '3.6*sin(t)'], t: [-0.6, 0.6], color: 'accent', width: 2 },
        { param: ['-0.5 + 0.5*t', '0.18'], t: [0, 1], color: 'ink2', width: 4 },
        { param: ['-0.5 + 0.5*t', '-0.18'], t: [0, 1], color: 'ink2', width: 4 },
      ],
      arrows,
      points: [{ x: rnd(s1, 4), y: -0.75, r: 0.01, color: 'accent', label: `${r1} m`, labelDx: 4 }, { x: 3.6, y: -0.75, r: 0.01, color: 'accent', label: `${r2} m`, labelDx: 4 }, { x: -0.6, y: 0.55, r: 0.01, color: 'ink2', label: 'nozzle' }],
    },
    caption: 'Schematic, not to scale: far from the nozzle the exhaust streams nearly radially at a steady speed. Real plumes are densest along the axis and thin out toward their edges; this source-flow model keeps only the radial spreading.',
  };
};

const powTeX = { 2: '3r', 3: '4r^2', '-2': '-r^{-3}', 0.5: t`\tfrac32\,r^{-1/2}` };
const lapTeX = { 1: t`\frac1r`, 3: '9r', 4: '16r^2', 5: '25r^3' };
const sphTeX = { 2: '4r', 3: '5r^2', '-1': 'r^{-2}', 4: '6r^3' };

export default lesson({
  id: 'gr.S10.d',
  title: 'The covariant derivative of vectors and tensors',
  minutes: 14, difficulty: 3, mode: 'derivation', badges: ['est-der'],
  intro: t`A vector field is components times basis vectors, $\mathbf V = V^\nu\mathbf e_\nu$ (the repeated $\nu$ is summed, as in step 3). In curvilinear coordinates — and on any curved surface or spacetime — **the basis vectors themselves change from point to point**, by an amount the **connection** records: $\partial_\mu\mathbf e_\lambda = \Gamma^\nu{}_{\mu\lambda}\,\mathbf e_\nu$. Differentiate the product honestly and both changes appear; their sum is the **covariant derivative** above.

It is a genuine tensor, so an equation written with it holds in every coordinate system at once. The plain partial derivative $\partial_\mu V^\nu$ is not: it mixes the change of the field with the turning of the grid.`,
  equation: t`\nabla_\mu V^\nu = \partial_\mu V^\nu + \Gamma^\nu{}_{\mu\lambda}\,V^\lambda`,
  symbols: [
    { tex: '\\nabla_\\mu V^\\nu', text: t`the covariant derivative: the $\nu$-component of the rate of change of the field $\mathbf V$ as you move along the coordinate $x^\mu$, counting both the components' change and the basis vectors' change. Read "del-mu V-nu"` },
    { tex: 'V^\\nu', text: t`the components of the vector field, with $\mathbf V = V^\nu\mathbf e_\nu$; an upper index marks a vector component` },
    { tex: '\\partial_\\mu', text: t`the partial derivative $\partial/\partial x^\mu$ with respect to the coordinate $x^\mu$, the other coordinates held fixed` },
    { tex: '\\mathbf e_\\nu', text: t`the coordinate basis vector along $x^\nu$ — the step you take when $x^\nu$ alone grows by one unit. Not of unit length in general: in polar coordinates $|\mathbf e_\theta| = r$` },
    { tex: '\\Gamma^\\nu{}_{\\mu\\lambda}', text: t`the connection coefficients (Christoffel symbols): the $\nu$-component of the change of $\mathbf e_\lambda$ per unit step along $x^\mu$, $\partial_\mu\mathbf e_\lambda = \Gamma^\nu{}_{\mu\lambda}\mathbf e_\nu$. In units of 1/(coordinate); step 11 builds them from the metric` },
    { tex: '\\mu,\\ \\nu,\\ \\lambda', text: t`indices running over the coordinates (two values on a surface, $0$–$3$ in spacetime). $\mu$ and $\nu$ are free — one equation for each pair; $\lambda$ appears once up and once down, so it is summed` },
  ],
  why: t`Every law of general relativity that involves a rate of change — the geodesic equation, parallel transport, curvature, and energy–momentum conservation $\nabla_\mu T^{\mu\nu} = 0$ — is written with $\nabla$, which is why those laws hold in every coordinate system and in curved spacetime.`,
  visual: explore,
  example: {
    prompt: t`Derive the covariant derivative from the basis vectors of polar coordinates on a flat plane, then use it on the uniform field $\mathbf V = \mathbf e_x$, whose polar components are $V^r = \cos\theta$ and $V^\theta = -\sin\theta/r$.`,
    visual: basisPic(t`Polar coordinates on a flat plane. Blue: $\hat r$ at P; violet: the step for a fixed small $\Delta\theta$, proportional to $\mathbf e_\theta$. Both turn and stretch from point to point — that change is what the connection records.`),
    steps: [
      { label: 'The basis vectors', text: t`With $(x, y) = (r\cos\theta,\ r\sin\theta)$, the basis vectors are the partial derivatives of position: $\mathbf e_r = (\cos\theta,\ \sin\theta)$ and $\mathbf e_\theta = (-r\sin\theta,\ r\cos\theta)$, in Cartesian components. $\mathbf e_\theta$ has length $r$: one radian of $\theta$ covers a distance $r$.` },
      { label: 'How they change', text: t`$\partial_r\mathbf e_r = 0$; $\;\partial_r\mathbf e_\theta = (-\sin\theta, \cos\theta) = \tfrac1r\mathbf e_\theta$; $\;\partial_\theta\mathbf e_r = (-\sin\theta, \cos\theta) = \tfrac1r\mathbf e_\theta$; $\;\partial_\theta\mathbf e_\theta = (-r\cos\theta, -r\sin\theta) = -r\,\mathbf e_r$. Matching $\partial_\mu\mathbf e_\lambda = \Gamma^\nu{}_{\mu\lambda}\mathbf e_\nu$: $\Gamma^\theta{}_{r\theta} = \Gamma^\theta{}_{\theta r} = 1/r$ and $\Gamma^r{}_{\theta\theta} = -r$; the other five are zero.` },
      { label: 'Differentiate the product', text: t`$\partial_\mu(V^\lambda\mathbf e_\lambda) = (\partial_\mu V^\lambda)\,\mathbf e_\lambda + V^\lambda\,\Gamma^\nu{}_{\mu\lambda}\,\mathbf e_\nu$. Rename the summed index in the first term from $\lambda$ to $\nu$ (a dummy index can be called anything) and collect: $\big(\partial_\mu V^\nu + \Gamma^\nu{}_{\mu\lambda}V^\lambda\big)\mathbf e_\nu$. The bracket is $\nabla_\mu V^\nu$.` },
      { label: 'The naive derivatives', text: t`For $V^r = \cos\theta$, $V^\theta = -\sin\theta/r$: $\partial_r V^r = 0$, $\;\partial_\theta V^r = -\sin\theta$, $\;\partial_r V^\theta = \sin\theta/r^2$, $\;\partial_\theta V^\theta = -\cos\theta/r$. Three of four are non-zero — though every arrow is the same arrow.` },
      { label: 'Add the corrections', text: t`$\nabla_\theta V^r = -\sin\theta + \Gamma^r{}_{\theta\theta}V^\theta = -\sin\theta + (-r)\left(-\tfrac{\sin\theta}{r}\right) = 0$. $\;\nabla_r V^\theta = \tfrac{\sin\theta}{r^2} + \tfrac1r\left(-\tfrac{\sin\theta}{r}\right) = 0$. $\;\nabla_\theta V^\theta = -\tfrac{\cos\theta}{r} + \tfrac1r\cos\theta = 0$. $\;\nabla_r V^r = 0$.` },
      { label: 'Sense check', text: t`A constant field has zero derivative in any coordinates: $\nabla$ says so, $\partial$ did not. In Cartesian coordinates every $\Gamma$ vanishes and $\nabla_\mu V^\nu = \partial_\mu V^\nu$, the familiar derivative — and since $\nabla_\mu V^\nu$ is a tensor, zero there means zero in every coordinate system.` },
    ],
    answer: t`$\nabla_\mu V^\nu = 0$ for all four components, while three of the four $\partial_\mu V^\nu$ are not zero: the partial derivatives were measuring the turning grid, not the field.`,
  },
  practice: [
    mcq({
      id: 'indices', difficulty: 1,
      prompt: t`$$\nabla_\mu V^\nu = \partial_\mu V^\nu + \Gamma^\nu{}_{\mu\lambda}\,V^\lambda$$ In four-dimensional spacetime, which index is summed, and how many terms does that sum contain for each choice of $\mu$ and $\nu$?`,
      choices: [
        t`$\lambda$, which appears once up and once down in the last term: four terms, $\lambda = 0, 1, 2, 3$`,
        t`$\mu$, because it appears in every term: four terms`,
        t`$\nu$ and $\lambda$, both upstairs on the right: sixteen terms`,
        t`No index is summed: the equation is a single number`,
      ],
      answer: 0,
      why: {
        1: t`$\mu$ appears once in every term, on both sides: it is free. Each of its values gives a separate equation.`,
        2: t`$\nu$ is free (it is on the left side too). Only an index repeated within one term, once up and once down, is summed.`,
        3: t`$\mu$ and $\nu$ are free, so this line stands for $4\times4 = 16$ separate equations — one per component.`,
      },
      hints: ['A free index appears once in every term, including on the left; a dummy index appears twice in one term, once up and once down.', t`Which index is missing from the left-hand side, $\nabla_\mu V^\nu$?`],
      teach: 'Free indices label separate equations; an index repeated up and down in one term is summed over all its values.',
      explain: t`$\lambda$ is the dummy index: $\Gamma^\nu{}_{\mu\lambda}V^\lambda = \Gamma^\nu{}_{\mu0}V^0 + \Gamma^\nu{}_{\mu1}V^1 + \Gamma^\nu{}_{\mu2}V^2 + \Gamma^\nu{}_{\mu3}V^3$. The free $\mu$ and $\nu$ make the left side a $4\times4$ array of 16 components.`,
      visual: nablaTable,
    }),
    expr({
      id: 'gamma-basis', difficulty: 2,
      gen(r) {
        const CASES = [
          { d: t`\partial_\theta\mathbf e_r = (-\sin\theta,\ \cos\theta)`, target: t`\mathbf e_\theta = (-r\sin\theta,\ r\cos\theta)`, sym: t`\Gamma^\theta{}_{\theta r}`, ans: '1/r', tex: t`\frac1r`, errs: [{ answer: 'r', feedback: t`Upside down: $\mathbf e_\theta$ has length $r$ while $\partial_\theta\mathbf e_r$ has length 1, so the factor is $1/r$.` }, { answer: '-1/r', feedback: t`Check the sign: $(-\sin\theta, \cos\theta)$ points the same way as $\mathbf e_\theta$, not opposite.` }] },
          { d: t`\partial_\theta\mathbf e_\theta = (-r\cos\theta,\ -r\sin\theta)`, target: t`\mathbf e_r = (\cos\theta,\ \sin\theta)`, sym: t`\Gamma^r{}_{\theta\theta}`, ans: '-r', tex: '-r', errs: [{ answer: 'r', feedback: t`Check the sign: $\partial_\theta\mathbf e_\theta$ points toward the origin, opposite to $\mathbf e_r$.` }, { answer: '-1', feedback: t`$\mathbf e_r$ has unit length but $\partial_\theta\mathbf e_\theta$ has length $r$: the factor is $-r$.` }] },
          { d: t`\partial_r\mathbf e_\theta = (-\sin\theta,\ \cos\theta)`, target: t`\mathbf e_\theta = (-r\sin\theta,\ r\cos\theta)`, sym: t`\Gamma^\theta{}_{r\theta}`, ans: '1/r', tex: t`\frac1r`, errs: [{ answer: 'r', feedback: t`Upside down: $\mathbf e_\theta$ is $r$ times longer than $\partial_r\mathbf e_\theta$, so the factor is $1/r$.` }, { answer: '1', feedback: t`Compare lengths: $|\partial_r\mathbf e_\theta| = 1$ but $|\mathbf e_\theta| = r$.` }] },
        ];
        const c = r.pick(CASES);
        return {
          prompt: t`In polar coordinates the basis vectors, in Cartesian components, are $\mathbf e_r = (\cos\theta, \sin\theta)$ and $\mathbf e_\theta = (-r\sin\theta, r\cos\theta)$. Differentiating gives $${c.d}$. Write it as a multiple of $${c.target}$: that multiple is the connection coefficient $${c.sym}$. What is it?`,
          answer: c.ans, answerTeX: c.tex, lhs: c.sym,
          vars: { r: [0.5, 4] },
          errors: c.errs,
          hints: ['Compare the two vectors component by component: what single number turns one into the other?', t`Divide a component of the derivative by the same component of the basis vector; check the other component gives the same ratio.`],
          teach: t`The connection coefficients are read off from how the basis vectors change: $\partial_\mu\mathbf e_\lambda = \Gamma^\nu{}_{\mu\lambda}\mathbf e_\nu$.`,
          explain: t`$${c.d}$ is $${c.tex}$ times $${c.target.split('=')[0]}$, so $${c.sym} = ${c.tex}$. All three non-zero polar coefficients follow this way: $\Gamma^\theta{}_{r\theta} = \Gamma^\theta{}_{\theta r} = 1/r$ and $\Gamma^r{}_{\theta\theta} = -r$.`,
          visual: basisPic(t`The polar grid's arrows at P: blue $\hat r$ and violet $\propto\mathbf e_\theta$, with fainter copies along P's ray and around P's circle. They turn as you go round and $\mathbf e_\theta$ stretches as you go out.`),
        };
      },
    }),
    num({
      id: 'swirl', difficulty: 2,
      gen(r) {
        const R = r.pick([0.5, 1.5, 2, 2.5, 3]);
        const a = 40 * Math.PI / 180;
        return {
          prompt: t`The swirl field $\mathbf V = \partial_\theta$ — in Cartesian components $(-y, x)$, the velocity of a plate turning at 1 rad/s — has polar components $V^r = 0$ and $V^\theta = 1$ everywhere, so every partial derivative of its components is zero. Using $\Gamma^r{}_{\theta\theta} = -r$, find $\nabla_\theta V^r$ at the point P, where $r = ${R}$.`,
          answer: -R, tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`That is $\partial_\theta V^r$ alone. The basis turns as you go round: add $\Gamma^r{}_{\theta\theta}V^\theta$.` }],
          hints: [t`$\nabla_\theta V^r = \partial_\theta V^r + \Gamma^r{}_{\theta\lambda}V^\lambda$, summed over $\lambda = r, \theta$.`, t`$\partial_\theta V^r = 0$ and $\Gamma^r{}_{\theta r} = 0$, so only $\Gamma^r{}_{\theta\theta}V^\theta$ survives.`],
          teach: 'Components that never change can still describe a changing field: the covariant derivative counts the turning of the basis.',
          explain: t`$\nabla_\theta V^r = 0 + \Gamma^r{}_{\theta\theta}V^\theta = (-${R})(1) = ${-R}$. The field really changes: going round, each arrow turns toward the centre. In Cartesian terms the change of $(-y, x)$ along itself is $(-x, -y)$ — the centripetal acceleration $\omega^2 r$ of a point on the plate, here with $\omega = 1$ rad/s.`,
          visual: fieldGraph('swirl', { points: [{ x: rnd(R * Math.cos(a), 4), y: rnd(R * Math.sin(a), 4), color: 'gold', label: 'P' }], caption: t`The swirl field $(-y, x)$ on a polar grid (arrows to scale with one another), and the point P at $r = ${R}$.` }),
        };
      },
    }),
    expr({
      id: 'divergence', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, -2, 0.5]);
        return {
          prompt: t`A radial field on the plane has polar components $V^r = r^{${k}}$ and $V^\theta = 0$. Find its divergence, $\nabla_\mu V^\mu = \partial_\mu V^\mu + \Gamma^\mu{}_{\mu\lambda}V^\lambda$, using $\Gamma^\theta{}_{\theta r} = 1/r$ and $\Gamma^r{}_{rr} = 0$.`,
          answer: `${k + 1}*r^(${k - 1})`, answerTeX: powTeX[k], lhs: t`\nabla_\mu V^\mu`,
          vars: { r: [0.5, 3] },
          errors: [{ answer: `${k}*r^(${k - 1})`, feedback: t`That is $\partial_r V^r$ alone. Add $\Gamma^\theta{}_{\theta r}V^r = r^{${k}}/r$: the field also spreads into the $\theta$ direction.` }, { answer: `${k + 2}*r^(${k - 1})`, feedback: 'That is the three-dimensional result, with two directions around (θ and φ). On a plane there is only θ.' }],
          hints: [t`$\mu$ is summed: $\nabla_\mu V^\mu = \nabla_r V^r + \nabla_\theta V^\theta$.`, t`$\nabla_r V^r = \partial_r V^r = ${k}r^{${k - 1}}$ and $\nabla_\theta V^\theta = 0 + \Gamma^\theta{}_{\theta r}V^r = r^{${k - 1}}$.`],
          teach: t`The covariant divergence adds $\Gamma^\mu{}_{\mu\lambda}V^\lambda$, which in polar coordinates makes it $\tfrac1r\partial_r(rV^r) + \partial_\theta V^\theta$.`,
          explain: t`$\nabla_\mu V^\mu = ${k}r^{${k - 1}} + r^{${k - 1}} = ${powTeX[k]}$. Equivalently $\tfrac1r\,\partial_r(r\cdot r^{${k}})$: the general rule is $\nabla_\mu V^\mu = \tfrac{1}{\sqrt g}\,\partial_\mu(\sqrt g\,V^\mu)$, where $\sqrt g$ is the square root of the metric's determinant ($r$ here), because $\Gamma^\mu{}_{\mu\lambda} = \partial_\lambda\ln\sqrt g$ — check: $\Gamma^\mu{}_{\mu r} = 1/r = \partial_r\ln r$.`,
          visual: fieldGraph('power', { k, caption: t`The field $r^{${k}}\,\hat r$ (arrows to scale with one another). Its divergence measures how much it spreads out from each point.` }),
        };
      },
    }),
    mcq({
      id: 'covector', difficulty: 3,
      prompt: t`For a covector (lower index) the rule has a minus sign: $\nabla_\mu\omega_\nu = \partial_\mu\omega_\nu - \Gamma^\lambda{}_{\mu\nu}\,\omega_\lambda$. Why must it be minus?`,
      choices: [
        t`So that $\nabla$ obeys the product rule and gives the contraction $\omega_\nu V^\nu$ — a scalar, with no basis to turn — its plain derivative: the $+\Gamma$ from $V$ and the $-\Gamma$ from $\omega$ cancel`,
        'Because covectors point in the opposite direction to vectors',
        t`Because the metric's signature $(-,+,+,+)$ has a minus sign in it`,
        t`It is only a convention: $+\Gamma$ would work just as well`,
      ],
      answer: 0,
      why: {
        1: 'A covector is not a reversed vector; it is a different object, a rule that turns a vector into a number (drawn as a stack of lines).',
        2: 'The same minus sign appears on an ordinary curved surface, where the metric has no minus signs at all.',
        3: t`With $+\Gamma$, the derivative of the scalar $\omega_\nu V^\nu$ would pick up $2\Gamma^\lambda{}_{\mu\nu}\omega_\lambda V^\nu$, which depends on the coordinates: not a derivative of a scalar at all.`,
      },
      hints: [t`What should $\nabla_\mu$ of a scalar be? A scalar has no components and no basis vectors.`, t`Expand $\nabla_\mu(\omega_\nu V^\nu) = (\nabla_\mu\omega_\nu)V^\nu + \omega_\nu\nabla_\mu V^\nu$ and require the $\Gamma$ terms to cancel.`],
      teach: 'Each upper index gets +Γ, each lower index −Γ, so that contractions — scalars — differentiate like ordinary functions.',
      explain: t`$\nabla_\mu(\omega_\nu V^\nu) = (\partial_\mu\omega_\nu - \Gamma^\lambda{}_{\mu\nu}\omega_\lambda)V^\nu + \omega_\nu(\partial_\mu V^\nu + \Gamma^\nu{}_{\mu\lambda}V^\lambda)$. Rename dummies and the two $\Gamma$ terms cancel, leaving $\partial_\mu(\omega_\nu V^\nu)$. For a general tensor the rule is one $+\Gamma$ per upper index and one $-\Gamma$ per lower index: $\nabla_\sigma T^\mu{}_\nu = \partial_\sigma T^\mu{}_\nu + \Gamma^\mu{}_{\sigma\lambda}T^\lambda{}_\nu - \Gamma^\lambda{}_{\sigma\nu}T^\mu{}_\lambda$.`,
      visual: covectorPic,
    }),
    expr({
      id: 'laplacian', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 3, 4, 5]);
        const zs = rnd(1.3 / 1.6 ** k, 4);
        return {
          prompt: t`The Laplacian is the divergence of the gradient: $\nabla^2 f = \nabla_\mu\nabla^\mu f = \dfrac{1}{\sqrt g}\,\partial_\mu\!\left(\sqrt g\,g^{\mu\nu}\,\partial_\nu f\right)$. In polar coordinates $\sqrt g = r$, $g^{rr} = 1$ and $g^{\theta\theta} = 1/r^2$. Find $\nabla^2 f$ for $f = r^{${k}}$.`,
          answer: `${k * k}*r^(${k - 2})`, answerTeX: lapTeX[k], lhs: t`\nabla^2 f`,
          vars: { r: [0.5, 3] },
          errors: [{ answer: `${k * (k - 1)}*r^(${k - 2})`, feedback: t`That is $\partial_r^2 f$ alone — the naive sum of second partial derivatives. The $\sqrt g = r$ inside the derivative adds $\tfrac1r\partial_r f$.` }],
          hints: [t`Only $\partial_r f = ${k}r^{${k - 1}}$ is non-zero, so $\nabla^2 f = \tfrac1r\,\partial_r\!\left(r\cdot ${k}r^{${k - 1}}\right)$.`, t`$r\cdot ${k}r^{${k - 1}} = ${k}r^{${k}}$; differentiate and divide by $r$.`],
          teach: t`In curvilinear coordinates the Laplacian is $\tfrac{1}{\sqrt g}\partial_\mu(\sqrt g\,g^{\mu\nu}\partial_\nu f)$, which is where the textbook formulas $f_{rr} + f_r/r + f_{\theta\theta}/r^2$ come from.`,
          explain: t`$\nabla^2 r^{${k}} = \tfrac1r\,\partial_r\!\left(${k}r^{${k}}\right) = ${k * k}\,r^{${k - 2}}$. Written out, $\nabla^2 f = f_{rr} + \tfrac1r f_r + \tfrac1{r^2}f_{\theta\theta}$ — the polar Laplacian of every electromagnetism textbook, here derived from the covariant derivative.`,
          visual: { type: 'surface3d', params: { surface: ['u*cos(v)', 'u*sin(v)', `${zs}*u^${k}`], domain: [[0, 1.6], [0, 6.2832]], n: 30, axes: false, yaw: -0.7, pitch: 0.45, dist: 7 }, caption: t`The function $f = r^{${k}}$ drawn as a height over the plane (height scaled to fit). Its Laplacian measures how much $f$ at a point falls short of its average around a small circle.` },
        };
      },
    }),
    mcq({
      id: 'spherical-error', difficulty: 3, kind: 'error',
      prompt: t`A student wants the divergence of $\mathbf V = (x, y, z)$. In spherical coordinates its components are $V^r = r$, $V^\theta = V^\phi = 0$, so they write $$\partial_r V^r + \partial_\theta V^\theta + \partial_\phi V^\phi = 1.$$ But in Cartesian coordinates $\partial_x x + \partial_y y + \partial_z z = 3$. Where is the mistake?`,
      choices: [
        t`Partial derivatives were used: the covariant divergence adds $\Gamma^\mu{}_{\mu\lambda}V^\lambda = (\Gamma^\theta{}_{\theta r} + \Gamma^\phi{}_{\phi r})V^r = \tfrac2r\cdot r = 2$, giving 3`,
        'There is no mistake: a divergence depends on the coordinates, so 1 and 3 are both right',
        t`$V^r$ should be 1, because the field points straight outward`,
        t`The Cartesian answer is wrong: the divergence of $(x, y, z)$ is 1`,
      ],
      answer: 0,
      why: {
        1: 'A divergence is a scalar — the outflow per unit volume — so every coordinate system must give the same number.',
        2: t`The field's length is $|\mathbf V| = r$, and $\mathbf e_r$ has unit length, so $V^r = r$ is right.`,
        3: t`$\partial_x x = 1$ in each of three directions: 3. The flux of $(x, y, z)$ out of a sphere of radius $R$ is $R\cdot4\pi R^2 = 3\times\tfrac43\pi R^3$.`,
      },
      hints: [t`Is $\partial_\mu V^\mu$ a scalar in curvilinear coordinates?`, t`In spherical coordinates $\Gamma^\theta{}_{\theta r} = \Gamma^\phi{}_{\phi r} = 1/r$.`],
      teach: t`In curvilinear coordinates the divergence needs the $\Gamma^\mu{}_{\mu\lambda}V^\lambda$ term — the field spreading into the directions around each point.`,
      explain: t`$\nabla_\mu V^\mu = \partial_\mu V^\mu + \Gamma^\mu{}_{\mu\lambda}V^\lambda = 1 + \tfrac2r\cdot r = 3$. Equivalently $\tfrac1{r^2}\partial_r(r^2\cdot r) = 3$, from $\sqrt g = r^2\sin\theta$. The missing 2 is the field spreading into the $\theta$ and $\phi$ directions as it moves out.`,
      visual: fieldGraph('radial', { caption: t`A slice through the field $(x, y, z)$: arrows to scale with one another. In three dimensions it spreads in two directions around each point, not one.` }),
    }),
    mcq({
      id: 'metric-compat', difficulty: 2,
      prompt: t`Check metric compatibility in polar coordinates: each lower index of $g$ gets its own $-\Gamma$ term, so $\nabla_r g_{\theta\theta} = \partial_r g_{\theta\theta} - 2\,\Gamma^\theta{}_{r\theta}\,g_{\theta\theta} = 2r - 2\cdot\tfrac1r\cdot r^2 = 0$. What does $\nabla_\rho g_{\mu\nu} = 0$, true in every coordinate system, mean?`,
      choices: [
        'Vectors carried along without turning keep their lengths and the angles between them — and indices can be raised and lowered freely inside ∇',
        t`The metric's components are the same everywhere`,
        'Space must be flat',
        'It holds only in Cartesian coordinates',
      ],
      answer: 0,
      why: {
        1: t`$g_{\theta\theta} = r^2$ changes from place to place; it is the covariant derivative, not the partial one, that vanishes.`,
        2: t`It holds on a sphere too (check $\nabla_\theta g_{\phi\phi} = 0$ there next step); curvature is a different matter.`,
        3: 'It is a tensor equation, so if it holds in one coordinate system it holds in all — here it was checked in polar coordinates.',
      },
      hints: ['The metric measures lengths and angles. What would a non-zero ∇g do to a vector carried along?'],
      teach: 'Metric compatibility, ∇g = 0, says that carrying vectors along preserves lengths and angles; it is one of the two conditions that fix the connection.',
      explain: t`The partial derivative $2r$ is cancelled by the connection's correction: the metric is covariantly constant. So dot products are preserved under transport, and $\nabla_\mu(g_{\nu\lambda}V^\lambda) = g_{\nu\lambda}\nabla_\mu V^\lambda$ — lowering commutes with differentiating. With "no twisting" (a symmetric $\Gamma$), this fixes $\Gamma$ completely: step 11.`,
      visual: basisPic(t`The polar grid's arrows: $\mathbf e_\theta$ (violet, scaled) grows in proportion to $r$, so $g_{\theta\theta} = r^2$ grows — the connection keeps track of exactly that stretch.`),
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-spherical', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3, -1, 4]);
        return {
          prompt: t`In spherical coordinates on flat space, $\sqrt g = r^2\sin\theta$. Find the divergence $\nabla_\mu V^\mu = \dfrac{1}{\sqrt g}\,\partial_\mu(\sqrt g\,V^\mu)$ of the radial field $V^r = r^{${k}}$, $V^\theta = V^\phi = 0$.`,
          answer: `${k + 2}*r^(${k - 1})`, answerTeX: sphTeX[k], lhs: t`\nabla_\mu V^\mu`,
          vars: { r: [0.5, 3] },
          errors: [{ answer: `${k + 1}*r^(${k - 1})`, feedback: t`That is the plane's result. Here $\sqrt g$ carries $r^2$: $\tfrac1{r^2}\partial_r(r^2\cdot r^{${k}})$.` }, { answer: `${k}*r^(${k - 1})`, feedback: t`That is $\partial_r V^r$ alone; the $\Gamma^\mu{}_{\mu\lambda}V^\lambda$ term is missing.` }],
          hints: [t`Only $\mu = r$ contributes, because $V^\theta = V^\phi = 0$: $\dfrac{1}{r^2\sin\theta}\,\partial_r\!\left(r^2\sin\theta\cdot r^{${k}}\right)$.`, t`The $\sin\theta$ cancels: $\dfrac{1}{r^2}\,\partial_r\!\left(r^{${k + 2}}\right)$.`],
          teach: t`The divergence formula $\tfrac{1}{\sqrt g}\partial_\mu(\sqrt g V^\mu)$ turns a covariant derivative into ordinary ones.`,
          explain: t`$\tfrac{1}{r^2}\,\partial_r\!\left(r^{${k + 2}}\right) = ${k + 2}\,r^{${k - 1}}$${k === -1 ? t` — and for $V^r = r^{-2}$, the inverse-square field, the divergence would be exactly zero away from the origin: Gauss's law` : ''}.`,
          visual: fieldGraph('power', { k, caption: t`A slice through the radial field $r^{${k}}\,\hat r$ (arrows to scale with one another).` }),
        };
      },
    }),
    num({
      id: 'cp-plume', difficulty: 3, transfer: true,
      gen(r) {
        const [r1, r2] = r.pick([[1, 3], [1, 5], [2, 5], [2, 8]]);
        const rho1 = r.pick([0.02, 0.012, 0.05]);
        const rho2 = rho1 * (r1 / r2) ** 2;
        return {
          prompt: t`Far from a small spacecraft thruster, its exhaust streams almost radially outward at a steady speed $v$. Steady flow conserves mass, $\nabla_\mu(\rho v^\mu) = 0$, which in spherical coordinates reads $\dfrac{1}{r^2}\dfrac{d}{dr}\!\left(r^2\rho v\right) = 0$. If the plume's density is ${rho1} kg/m³ at ${r1} m from the nozzle, what is it at ${r2} m?`,
          answer: rho2, units: 'kg/m^3', tol: { rel: 0.01 },
          errors: [{ value: rho1 * (r1 / r2), feedback: t`The conserved quantity is $r^2\rho v$, not $r\rho v$: the flow spreads over a sphere's area, $4\pi r^2$.` }, { value: rho1 * (r1 / r2) ** 3, feedback: 'Mass flows through spherical shells whose area grows as r², not as r³.' }],
          hints: [t`$r^2\rho v$ is the same at every radius, and $v$ is constant.`, t`$\rho_2 = \rho_1\,(r_1/r_2)^2$.`],
          teach: 'Conservation laws written with the covariant divergence become flux statements: a steady radial flow thins out as 1/r².',
          explain: t`$\rho_2 = ${rho1}\times(${r1}/${r2})^2 = ${sci(rho2, 3)}$ kg/m³. Plume models used to predict thruster contamination of solar panels and sensors start from exactly this $1/r^2$ fall-off, times an angular profile.`,
          visual: plume(r1, r2),
        };
      },
    }),
    mcq({
      id: 'cp-transform', difficulty: 2,
      prompt: t`Under a change of coordinates $x \to x'$, the partial derivatives of a vector's components transform as $$\partial'_\mu V'^\nu = \frac{\partial x^\alpha}{\partial x'^\mu}\frac{\partial x'^\nu}{\partial x^\beta}\,\partial_\alpha V^\beta + \frac{\partial x^\alpha}{\partial x'^\mu}\frac{\partial^2 x'^\nu}{\partial x^\alpha\,\partial x^\beta}\,V^\beta.$$ The second term is what stops $\partial_\mu V^\nu$ being a tensor. When does it vanish for every field?`,
      choices: [
        t`When $x'$ is a linear function of $x$ — rotations and Lorentz transformations between inertial frames — which is why special relativity could get away with plain $\partial$`,
        'Whenever the space is flat',
        'When the field is constant',
        t`Never: $\partial_\mu V^\nu$ is a tensor whenever $V^\nu$ is`,
      ],
      answer: 0,
      why: {
        1: 'Polar coordinates on a flat plane are a non-linear change of coordinates, and the extra term is there — that is the whole of this lesson.',
        2: t`The uniform field $\mathbf e_x$ is constant, yet its polar components have non-zero partial derivatives: the extra term is not zero for it.`,
        3: 'The second-derivative term spoils the tensor law in general; that is why the covariant derivative is needed.',
      },
      hints: ['The term contains the second derivatives of the new coordinates with respect to the old ones.'],
      teach: 'Partial derivatives of components transform as a tensor only under linear changes of coordinates; ∇ transforms as a tensor under all of them.',
      explain: t`The second derivatives $\partial^2x'^\nu/\partial x^\alpha\partial x^\beta$ vanish exactly when $x'$ is linear in $x$. Inertial frames in special relativity are related by such transformations, so $\partial$ sufficed there; curvilinear coordinates and curved spacetime need $\nabla$, whose $\Gamma$ transforms with an equal and opposite extra term.`,
      visual: { type: 'gr-coordinates', params: { mode: 'measure', grid: 'polar', shape: 'none', shapeChoice: false, readout: false }, caption: 'One flat plane with a polar grid (left) and its coordinate chart (right): a non-linear relabelling turns the grid’s curves into straight lines.' },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §3.1–3.2 (covariant derivatives)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Carroll, Spacetime and Geometry, §3.2', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
  ],
});
