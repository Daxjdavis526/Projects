// Coordinate transformations: coordinates are functions on the space; a
// change of coordinates is n functions x'(x), smooth and invertible; and near
// any point it is linear, dx'^μ = (∂x'^μ/∂x^ν) dx^ν (the chain rule).
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_ten.js';

const t = String.raw;
const DEG = Math.PI / 180;

// the polar grid as graph curves (circles and rays), for pictures of the plane
const polarGrid = (R = 4, rays = 12, color = 'ink4') => [
  ...Array.from({ length: R }, (_, k) => ({ param: [`${k + 1}*cos(t)`, `${k + 1}*sin(t)`], t: [0, 6.2832], color, width: 1 })),
  ...Array.from({ length: rays }, (_, k) => ({ param: [`t*${r6(Math.cos((2 * Math.PI * k) / rays))}`, `t*${r6(Math.sin((2 * Math.PI * k) / rays))}`], t: [0, R + 0.3], color, width: 1 })),
];
// a still picture of a polar step from (r, θ) by (dr, dθ): the true path, the true endpoint and the linear arrow
function stepPic(r, thDeg, dr, dthRad, caption, { linear = true, scale = 1 } = {}) {
  const th = thDeg * DEG, P = [r * Math.cos(th), r * Math.sin(th)];
  const L = [P[0] + scale * (Math.cos(th) * dr - r * Math.sin(th) * dthRad), P[1] + scale * (Math.sin(th) * dr + r * Math.cos(th) * dthRad)];
  const span = Math.max(1.6, r + 1);
  return {
    type: 'graph',
    params: {
      x: [r6(P[0] - span), r6(P[0] + span)], y: [r6(P[1] - span * 0.6), r6(P[1] + span * 0.6)], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
      curves: [...polarGrid(Math.ceil(r + span)), { param: [`(${r} + ${r6(scale * dr)}*t)*cos(${r6(th)} + ${r6(scale * dthRad)}*t)`, `(${r} + ${r6(scale * dr)}*t)*sin(${r6(th)} + ${r6(scale * dthRad)}*t)`], t: [0, 1], color: 'violet', width: 2.4 }],
      arrows: linear ? [{ from: P.map(r6), to: L.map(r6), color: 'gold', width: 2.6 }] : [],
      points: [{ x: r6(P[0]), y: r6(P[1]), color: 'ink', label: 'P', labelDx: -14, labelDy: 12 }, { x: 0, y: 0, color: 'ink3', r: 3 }],
    },
    caption,
  };
}

export default lesson({
  id: 'st-a.A4.1',
  title: 'Coordinate transformations',
  minutes: 10, difficulty: 2,
  intro: t`A coordinate system is a set of $n$ **functions** on the space, $x^\mu(p)$, that give every point its own list of numbers (the Road’s step 7: labels, not reality). A **coordinate transformation** is a second set, written as functions of the first, $x'^\mu = x'^\mu(x^0, \dots, x^{n-1})$ — polar from Cartesian, $r = \sqrt{x^2 + y^2}$, $\theta = \operatorname{atan2}(y, x)$, for instance. It must be smooth and, where it is used, **invertible**: each point keeps exactly one label.

The transformation can be wildly curved, but near any point it is linear. The chain rule says how a small step’s coordinate changes are related:

$$dx'^\mu = \frac{\partial x'^\mu}{\partial x^\nu}\,dx^\nu$$

That array of partial derivatives — the **Jacobian matrix** — is the local, linear stand-in for the whole transformation, and the next lesson shows it is all you need to transform vectors and covectors.`,
  symbols: [
    { tex: t`x^\mu`, text: 'the old coordinates, as functions on the space' },
    { tex: t`x'^\mu`, text: 'the new coordinates, written as functions of the old' },
    { tex: t`dx^\nu,\ dx'^\mu`, text: 'the coordinate changes along a small step, in each system' },
    { tex: t`\dfrac{\partial x'^\mu}{\partial x^\nu}`, text: t`the Jacobian matrix: row $\mu$, column $\nu$, evaluated at the point. It must be invertible ($\det \ne 0$) there` },
  ],
  why: t`General relativity is written so that it holds in every coordinate system; the chain rule $dx'^\mu = (\partial x'^\mu/\partial x^\nu)\,dx^\nu$ is the seed from which every transformation law in the theory grows.`,
  visual: {
    type: 'graph',
    title: 'A curved change of coordinates is linear up close',
    lead: t`The plane with its polar grid. From the point P at $(r, \theta)$, a step $(dr, d\theta)$ in polar coordinates follows the violet path. The gold arrow is the chain rule’s prediction, $dx = \cos\theta\,dr - r\sin\theta\,d\theta$, $dy = \sin\theta\,dr + r\cos\theta\,d\theta$. The readout compares the true change in $(x, y)$ with the linear one.`,
    tasks: [
      t`Make the step small: the gold arrow lands on the end of the violet path. Halve $d\theta$ and the error drops to about a quarter — it is second order.`,
      t`Keep $d\theta$ fixed and slide P outward: the same $d\theta$ moves you farther, because $\partial x/\partial\theta = -r\sin\theta$ grows with $r$.`,
      t`Bring P to $r = 0.2$: there a $d\theta$ barely moves you at all. At $r = 0$ the column for $\theta$ vanishes and the transformation stops being invertible.`,
    ],
    params: {
      x: [-4.3, 4.3], y: [-3.2, 3.2], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
      sliders: [
        { key: 'rr', label: '$r$ at P', min: 0.2, max: 3.5, step: 0.1, value: 2, explain: 'The distance of P from the origin.' },
        { key: 'th', label: t`$\theta$ at P`, min: -180, max: 180, step: 5, value: 60, unit: '^\\circ', explain: 'The polar angle of P.' },
        { key: 'dr', label: '$dr$', min: -1, max: 1, step: 0.05, value: 0.4, explain: t`The step in $r$.` },
        { key: 'dth', label: t`$d\theta$ (rad)`, min: -1, max: 1, step: 0.02, value: 0.4, explain: t`The step in $\theta$, in radians.` },
      ],
      curves: [...polarGrid(4), { param: ['(rr + dr*t)*cos(th*pi/180 + dth*t)', '(rr + dr*t)*sin(th*pi/180 + dth*t)'], t: [0, 1], color: 'violet', width: 2.6 }],
      arrows: [{ from: ['rr*cos(th*pi/180)', 'rr*sin(th*pi/180)'], to: ['rr*cos(th*pi/180) + cos(th*pi/180)*dr - rr*sin(th*pi/180)*dth', 'rr*sin(th*pi/180) + sin(th*pi/180)*dr + rr*cos(th*pi/180)*dth'], color: 'gold', width: 2.6 }],
      points: [{ x: 'rr*cos(th*pi/180)', y: 'rr*sin(th*pi/180)', color: 'ink', label: 'P', labelDx: -14, labelDy: 12 }, { x: '(rr + dr)*cos(th*pi/180 + dth)', y: '(rr + dr)*sin(th*pi/180 + dth)', color: 'violet' }],
      readouts: [
        { label: 'true $\\Delta x$', expr: '(rr + dr)*cos(th*pi/180 + dth) - rr*cos(th*pi/180)', digits: 3 },
        { label: 'chain rule $dx$', expr: 'cos(th*pi/180)*dr - rr*sin(th*pi/180)*dth', digits: 3 },
        { label: 'true $\\Delta y$', expr: '(rr + dr)*sin(th*pi/180 + dth) - rr*sin(th*pi/180)', digits: 3 },
        { label: 'chain rule $dy$', expr: 'sin(th*pi/180)*dr + rr*cos(th*pi/180)*dth', digits: 3 },
      ],
    },
    caption: t`The plane, unchanged; grey circles are $r = 1, 2, 3, 4$ and grey rays $\theta$ every $30^\circ$. Violet: where the step really goes, holding the coordinates’ rates steady. Gold: its first-order (Jacobian) approximation.`,
  },
  example: {
    prompt: t`At the point with polar coordinates $(r, \theta) = (2, 60^\circ)$, a step has $dr = 0.01$ and $d\theta = 0.02$ rad. Use the chain rule to find $dx$ and $dy$, and compare with the exact change.`,
    visual: stepPic(2, 60, 0.01, 0.02, t`The step from P, magnified 25 times so that it can be seen: the violet path and the gold chain-rule arrow almost coincide.`, { scale: 25 }),
    steps: [
      { label: 'Write the transformation', text: t`$x = r\cos\theta$, $y = r\sin\theta$ — the old coordinates as functions of the new.` },
      { label: 'Partial derivatives', text: t`$\dfrac{\partial x}{\partial r} = \cos\theta = 0.5$, $\dfrac{\partial x}{\partial\theta} = -r\sin\theta = -1.7321$, $\dfrac{\partial y}{\partial r} = \sin\theta = 0.8660$, $\dfrac{\partial y}{\partial\theta} = r\cos\theta = 1$.` },
      { label: 'Chain rule', text: t`$dx = 0.5(0.01) - 1.7321(0.02) = -0.029\,64$; $dy = 0.8660(0.01) + 1(0.02) = 0.028\,66$.` },
      { label: 'Exact', text: t`$\Delta x = 2.01\cos(60^\circ + 0.02\ \text{rad}) - 2\cos60^\circ = -0.030\,01$ and $\Delta y = 0.028\,41$. The differences, about $4\times10^{-4}$, are second order: halve the step and they shrink about fourfold.` },
    ],
    answer: t`$dx = -0.0296$, $dy = 0.0287$ (exact: $-0.0300$, $0.0284$).`,
  },
  practice: [
    num({
      id: 'rotated', difficulty: 1,
      gen(r) {
        const phi = r.pick([30, 45, 60, -30]), x = r.intExcept(-4, 4, [0]), y = r.intExcept(-4, 4, [0]);
        const which = r.pick(['x', 'y']);
        const xp = x * Math.cos(phi * DEG) + y * Math.sin(phi * DEG), yp = -x * Math.sin(phi * DEG) + y * Math.cos(phi * DEG);
        const ans = which === 'x' ? xp : yp;
        return {
          prompt: t`New coordinates are rotated from the old by $${phi}^\circ$: $x' = x\cos${phi}^\circ + y\sin${phi}^\circ$, $y' = -x\sin${phi}^\circ + y\cos${phi}^\circ$. What is the $${which}'$ label of the point $(x, y) = (${x}, ${y})$?`,
          visual: {
            type: 'graph',
            params: { x: [-5, 5], y: [-4.5, 4.5], equal: true, aspect: 'wide', xticks: 6, yticks: 5, curves: [{ param: [`t*${r6(Math.cos(phi * DEG))}`, `t*${r6(Math.sin(phi * DEG))}`], t: [-6, 6], color: 'accent', width: 1.6, label: 'x′ axis', labelAt: 4.5 }, { param: [`-t*${r6(Math.sin(phi * DEG))}`, `t*${r6(Math.cos(phi * DEG))}`], t: [-6, 6], color: 'violet', width: 1.6, label: 'y′ axis', labelAt: 4 }], points: [{ x, y, color: 'gold', label: 'P' }] },
            caption: t`The point P with the old axes (grid) and the new axes (blue $x'$, violet $y'$) turned by $${phi}^\circ$.`,
          },
          answer: r6(ans), tol: { rel: 0.005, abs: 0.005 },
          hints: [t`Substitute $x = ${x}$, $y = ${y}$ into the formula for $${which}'$.`],
          teach: 'A coordinate transformation gives every point a new label; the point itself does not move.',
          explain: t`$${which}' = ${which === 'x' ? `${x}\\cos${phi}^\\circ + (${y})\\sin${phi}^\\circ` : `-(${x})\\sin${phi}^\\circ + (${y})\\cos${phi}^\\circ`} = ${nice(ans)}$.`,
        };
      },
    }),
    num({
      id: 'invert', difficulty: 2,
      gen(r) {
        const [a, b, c, d] = r.pick([[1, 2, 1, -1], [2, 1, 1, 1], [1, 1, 1, -1], [3, 1, 1, 2]]);
        const x = r.intExcept(-3, 3, [0]), y = r.intExcept(-3, 3, [0]);
        const u = a * x + b * y, v = c * x + d * y;
        const which = r.pick(['x', 'y']);
        return {
          prompt: t`New coordinates are $u = ${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y$ and $v = ${c === 1 ? '' : c}x ${d < 0 ? '-' : '+'} ${Math.abs(d) === 1 ? '' : Math.abs(d)}y$. A point has $(u, v) = (${u}, ${v})$. What is its $${which}$?`,
          visual: {
            type: 'graph',
            params: { x: [-5, 5], y: [-4, 4], equal: true, aspect: 'wide', xticks: 6, yticks: 5, curves: [...[-8, -6, -4, -2, 0, 2, 4, 6, 8].map((k) => ({ param: [`${r6((k * a) / (a * a + b * b))} - ${r6(b)}*t`, `${r6((k * b) / (a * a + b * b))} + ${r6(a)}*t`], t: [-12, 12], color: 'accent', width: 1 })), ...[-8, -6, -4, -2, 0, 2, 4, 6, 8].map((k) => ({ param: [`${r6((k * c) / (c * c + d * d))} - ${r6(d)}*t`, `${r6((k * d) / (c * c + d * d))} + ${r6(c)}*t`], t: [-12, 12], color: 'violet', width: 1 }))] },
            caption: t`Lines of constant $u$ (blue) and $v$ (violet), every 2 units, over the $x$–$y$ grid. The point is where its $u$ and $v$ lines cross.`,
          },
          answer: which === 'x' ? x : y, tol: { rel: 0, abs: 0.01 },
          hints: [t`Solve the two linear equations $${a}x + ${b}y = ${u}$ and $${c}x + (${d})y = ${v}$.`, `The determinant is ${a * d - b * c}, not zero, so there is exactly one solution.`],
          teach: 'Inverting a coordinate transformation means solving for the old labels; a linear one is invertible when its determinant is not zero.',
          explain: t`Solving gives $(x, y) = (${x}, ${y})$: check $${a}(${x}) + ${b}(${y}) = ${u}$ and $${c}(${x}) + (${d})(${y}) = ${v}$.`,
        };
      },
    }),
    num({
      id: 'polar-step', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 2, 3, 5]), th = r.pick([30, 45, 120, 210, 300]), dr = r.pick([0.02, -0.01, 0.03]), dth = r.pick([0.01, -0.02, 0.015]);
        const which = r.pick(['x', 'y']);
        const dx = Math.cos(th * DEG) * dr - R * Math.sin(th * DEG) * dth, dy = Math.sin(th * DEG) * dr + R * Math.cos(th * DEG) * dth;
        const ans = which === 'x' ? dx : dy;
        const wrong = which === 'x' ? Math.cos(th * DEG) * dr - Math.sin(th * DEG) * dth : Math.sin(th * DEG) * dr + Math.cos(th * DEG) * dth;
        return {
          prompt: t`At $(r, \theta) = (${R}, ${th}^\circ)$, a small step has $dr = ${dr}$ and $d\theta = ${dth}$ rad. Use $x = r\cos\theta$, $y = r\sin\theta$ and the chain rule to find $d${which}$.`,
          visual: stepPic(R, th, dr, dth, t`The step, magnified 30 times: violet the true path, gold the chain-rule arrow.`, { scale: 30 }),
          answer: ans, tol: { rel: 0.01, abs: 0.0002 },
          errors: Math.abs(wrong - ans) > 0.01 * Math.abs(ans) + 0.0002 ? [{ value: wrong, feedback: t`Missing a factor $r$: $\partial ${which}/\partial\theta = ${which === 'x' ? '-r\\sin\\theta' : 'r\\cos\\theta'}$, because turning by $d\theta$ at radius $r$ moves you $r\,d\theta$.` }] : [],
          hints: [t`$d${which} = \dfrac{\partial ${which}}{\partial r}dr + \dfrac{\partial ${which}}{\partial\theta}d\theta$.`, t`$\partial ${which}/\partial r = ${which === 'x' ? '\\cos\\theta' : '\\sin\\theta'}$ and $\partial ${which}/\partial\theta = ${which === 'x' ? '-r\\sin\\theta' : 'r\\cos\\theta'}$.`],
          teach: 'For a small step, the change in the new coordinates is the Jacobian times the change in the old.',
          explain: t`$d${which} = ${which === 'x' ? `\\cos${th}^\\circ(${dr}) - ${R}\\sin${th}^\\circ(${dth})` : `\\sin${th}^\\circ(${dr}) + ${R}\\cos${th}^\\circ(${dth})`} = ${nice(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'not-coords', difficulty: 2,
      prompt: 'Which of these pairs of functions can NOT serve as coordinates on the whole plane?',
      visual: {
        type: 'graph',
        params: { x: [-3, 3], y: [-2.4, 2.4], equal: true, aspect: 'wide', xticks: 6, yticks: 5, curves: [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k) => ({ param: [`${r6(k / 2)} - t`, 't'], t: [-6, 6], color: 'accent', width: 1.2 })) },
        caption: t`The level lines of $u = x + y$ (also, every one of them, a level line of $v = 2x + 2y$).`,
      },
      choices: [t`$u = x + y$, $v = 2x + 2y$`, t`$u = x + y$, $v = x - y$`, t`$u = 2x$, $v = x + 3y$`, t`$u = x$, $v = y + x^3$`],
      answer: 0,
      why: {
        1: t`Determinant $-2$: every point has its own $(u, v)$, and the formulas can be inverted.`,
        2: t`Determinant $6$: invertible.`,
        3: t`Nonlinear, but invertible everywhere: $x = u$, $y = v - u^3$. Its Jacobian determinant is 1.`,
      },
      hints: ['Two coordinates must carry independent information. Is v anything new, given u?'],
      teach: 'Coordinates must be independent: if one is a function of another, they cannot tell points apart.',
      explain: t`$v = 2u$, so every point on a line $x + y = $ const gets the same pair $(u, 2u)$: whole lines share one label. The Jacobian determinant $1\cdot2 - 1\cdot2 = 0$ says the same thing.`,
    }),
    num({
      id: 'chain', difficulty: 2,
      gen(r) {
        const x = r.intExcept(-2, 2, [0]), y = r.intExcept(-2, 2, [0]), dx = r.pick([0.1, -0.2, 0.05]), dy = r.pick([0.1, 0.2, -0.1]);
        const du = y * dx + x * dy, dv = dx + 2 * y * dy;      // u = xy, v = x + y²
        const which = r.pick(['u', 'v']);
        const ans = which === 'u' ? du : dv;
        return {
          prompt: t`New coordinates (near the point) are $u = xy$ and $v = x + y^2$. At $(x, y) = (${x}, ${y})$, a step has $dx = ${dx}$, $dy = ${dy}$. Find $d${which}$.`,
          visual: {
            type: 'graph',
            params: { x: [x - 2, x + 2], y: [y - 1.5, y + 1.5], equal: true, aspect: 'wide', xticks: 5, yticks: 4, curves: [...[-4, -3, -2, -1, 1, 2, 3, 4].map((k) => ({ fn: `${k}/x`, color: 'accent', width: 1, domain: [x - 2, x + 2] })), ...[-3, -2, -1, 0, 1, 2, 3, 4, 5].map((k) => ({ param: [`${k} - t^2`, 't'], t: [-3, 3], color: 'violet', width: 1 }))], arrows: [{ from: [x, y], to: [r6(x + 4 * dx), r6(y + 4 * dy)], color: 'gold' }], points: [{ x, y, color: 'ink', label: 'P', labelDx: -14, labelDy: 12 }] },
            caption: t`Level curves of $u = xy$ (blue) and $v = x + y^2$ (violet) near P, and the step (gold, drawn 4 times longer).`,
          },
          answer: ans, tol: { rel: 0.005, abs: 0.0005 },
          hints: [t`$d${which} = \dfrac{\partial ${which}}{\partial x}dx + \dfrac{\partial ${which}}{\partial y}dy$.`, which === 'u' ? t`$\partial u/\partial x = y$, $\partial u/\partial y = x$.` : t`$\partial v/\partial x = 1$, $\partial v/\partial y = 2y$.`],
          teach: 'The chain rule turns a step in the old coordinates into a step in the new: one partial derivative per old coordinate.',
          explain: which === 'u' ? t`$du = y\,dx + x\,dy = (${y})(${dx}) + (${x})(${dy}) = ${nice(du, 4)}$.` : t`$dv = dx + 2y\,dy = ${dx} + 2(${y})(${dy}) = ${nice(dv, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'why-linear', difficulty: 2,
      prompt: 'Why can any smooth change of coordinates be treated as a linear map for small enough steps?',
      visual: stepPic(2, 60, 0.3, 0.3, t`A large step: the true path (violet) bends away from the chain-rule arrow (gold). Shrink the step and the two agree ever better.`),
      choices: [
        'Because to first order every smooth function is its tangent-line (Taylor) approximation, which is linear in the step',
        'Because coordinate transformations are always linear',
        'Because small steps are always along the coordinate axes',
        'Because the Jacobian matrix is the same at every point',
      ],
      answer: 0,
      why: {
        1: t`Polar coordinates are not linear: $r = \sqrt{x^2 + y^2}$. Only their first-order part is.`,
        2: 'A small step can point anywhere; the linear approximation handles any direction.',
        3: t`The Jacobian usually changes from point to point — in polar coordinates its entries involve $r$ and $\theta$.`,
      },
      hints: ['What does a first-order Taylor expansion of x′(x) look like?'],
      teach: 'Smooth means locally linear: the Jacobian is the linear part of the transformation at each point.',
      explain: t`$x'^\mu(x + dx) = x'^\mu(x) + \dfrac{\partial x'^\mu}{\partial x^\nu}dx^\nu + O(dx^2)$. The linear term is the Jacobian times the step; the rest shrinks faster than the step does.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-step', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 4]), th = r.pick([60, 150, 240]), dr = r.pick([0.05, -0.02]), dth = r.pick([0.01, 0.02]);
        const which = r.pick(['x', 'y']);
        const ans = which === 'x' ? Math.cos(th * DEG) * dr - R * Math.sin(th * DEG) * dth : Math.sin(th * DEG) * dr + R * Math.cos(th * DEG) * dth;
        return {
          prompt: t`At $(r, \theta) = (${R}, ${th}^\circ)$, find $d${which}$ for $dr = ${dr}$ and $d\theta = ${dth}$ rad.`,
          visual: stepPic(R, th, dr, dth, 'The step, magnified 30 times.', { scale: 30 }),
          answer: ans, tol: { rel: 0.01, abs: 0.0002 },
          hints: [t`$dx = \cos\theta\,dr - r\sin\theta\,d\theta$; $dy = \sin\theta\,dr + r\cos\theta\,d\theta$.`],
          teach: t`For a small step, $dx^\mu = (\partial x^\mu/\partial x'^\nu)\,dx'^\nu$.`,
          explain: t`$d${which} = ${nice(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-gps', difficulty: 3, transfer: true,
      gen(r) {
        const lat = r.pick([28.6, 40.0, 51.5, 64.1]), dlat = r.pick([0.0004, 0.0005, -0.0003]), dlon = r.pick([0.0008, -0.0006, 0.0010]);
        const R = 6371000;
        const dE = R * Math.cos(lat * DEG) * dlon * DEG, dN = R * dlat * DEG;
        const which = r.pick(['east', 'north']);
        const ans = which === 'east' ? dE : dN;
        return {
          prompt: t`A survey drone’s GPS position changes by $d\varphi = ${dlat}^\circ$ in latitude and $d\lambda = ${dlon}^\circ$ in longitude, at latitude $${lat}^\circ$. Local east and north distances are related by $dE = R\cos\varphi\,d\lambda$ and $dN = R\,d\varphi$ (angles in radians, $R = 6371$ km). How far ${which} did it move, in metres?`,
          visual: {
            type: 'graph',
            params: { x: [-1.6, 1.6], y: [-1.15, 1.15], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.6 }, ...[-60, -30, 0, 30, 60].map((L) => ({ param: [`${r6(Math.cos(L * DEG))}*cos(t)`, `${r6(Math.sin(L * DEG))} + ${r6(0.18 * Math.cos(L * DEG))}*sin(t)`], t: [-3.1416, 0], color: 'ink4', width: 1 })), { param: [`${r6(Math.cos(lat * DEG))}*cos(t)`, `${r6(Math.sin(lat * DEG))} + ${r6(0.18 * Math.cos(lat * DEG))}*sin(t)`], t: [-3.1416, 0], color: 'gold', width: 2 }], points: [{ x: 0, y: r6(Math.sin(lat * DEG)), color: 'gold', label: `latitude ${lat}°`, labelDx: 10, labelDy: -12 }] },
            caption: t`Earth (schematic) with parallels of latitude; the gold one is at $${lat}^\circ$. Its circumference is $\cos\varphi$ times the equator’s, which is why a degree of longitude covers less ground there.`,
          },
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: which === 'east' ? [{ value: R * dlon * DEG, feedback: t`Missing $\cos\varphi$: lines of longitude converge toward the poles, so a degree of longitude is shorter at latitude ${lat}°.` }, { value: R * Math.cos(lat * DEG) * dlon, feedback: 'Convert the angle to radians first.' }] : [{ value: R * dlat, feedback: 'Convert the angle to radians first.' }],
          hints: [t`Convert to radians: multiply degrees by $\pi/180$.`, which === 'east' ? t`$dE = 6\,371\,000\times\cos${lat}^\circ\times(${dlon}\times\pi/180)$.` : t`$dN = 6\,371\,000\times(${dlat}\times\pi/180)$.`],
          teach: 'Converting a small change of curvilinear coordinates into local distances is the chain rule, with scale factors set by the geometry.',
          explain: t`$d${which === 'east' ? 'E' : 'N'} = ${nice(ans, 4)}$ m. (Treating Earth as a sphere; the WGS-84 ellipsoid changes this by a few tenths of a per cent.)`,
        };
      },
    }),
    mcq({
      id: 'cp-origin', difficulty: 2,
      prompt: t`The polar transformation $x = r\cos\theta$, $y = r\sin\theta$ has Jacobian determinant $\partial(x, y)/\partial(r, \theta) = r$. What does that say about the origin?`,
      visual: stepPic(0.15, 60, 0, 0.6, t`At $r = 0.15$, a large $d\theta = 0.6$ rad barely moves the point (violet). At $r = 0$ it would not move at all.`, { linear: false }),
      choices: [
        t`At $r = 0$ the transformation cannot be inverted: changing $\theta$ moves nothing, so $\theta$ is not a good coordinate there`,
        'The plane is curved at the origin',
        'Polar coordinates fail everywhere on the x axis',
        'Nothing: a zero determinant is harmless',
      ],
      answer: 0,
      why: {
        1: 'The plane is flat everywhere; the labels fail, not the geometry (the Road’s step 7).',
        2: t`$\theta = 0$ is a perfectly good label (though $\theta$ jumps by $2\pi$ somewhere — a choice of cut, not a singularity).`,
        3: 'A zero determinant means the linear approximation squashes the plane flat: no inverse.',
      },
      hints: [t`Look at the column $\partial(x, y)/\partial\theta = (-r\sin\theta, r\cos\theta)$ at $r = 0$.`],
      teach: 'Where the Jacobian determinant vanishes, the coordinate transformation cannot be inverted: a coordinate singularity.',
      explain: t`At $r = 0$ the $\theta$ column is zero: no change in $\theta$ moves you, so different labels $(0, \theta)$ all name one point. That is a coordinate singularity — the geometry is fine.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 2 (manifolds, charts and coordinate transformations)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §5.1–5.2 (polar coordinates in the flat plane)', url: 'https://www.cambridge.org/9780521887052' },
  ],
});
