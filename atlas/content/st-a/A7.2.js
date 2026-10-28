// Transformation laws for fields: at each point a tensor field's components
// change with the Jacobians evaluated there, and the functions are rewritten
// in the new coordinates — the same point, two descriptions. Scalars keep
// their value; vectors take ∂x′/∂x, covectors ∂x/∂x′, one factor per index.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6, plane, polarGrid, fieldArrows, basisAt, DEG } from './_tcalc.js';

const t = String.raw;
const PTS = [[3, 4, 5], [-3, 4, 5], [4, -3, 5], [-4, -3, 5], [6, 8, 10], [-6, 8, 10], [5, 12, 13], [-12, 5, 13]];

// the field of a line charge (2kλ = 1 unit) on a polar grid, with an optional marked point
function linePic(P, caption, { R = 4, arrows = [] } = {}) {
  return plane({
    x: [-R, R], y: [r6(-0.62 * R), r6(0.62 * R)],
    curves: polarGrid(R + 1),
    arrows: [...fieldArrows((x, y) => [x / (x * x + y * y), y / (x * x + y * y)], { x: [-R, R], y: [-0.62 * R, 0.62 * R], step: R > 5 ? 2 : 1, maxLen: R > 5 ? 1.2 : 0.7, cap: R > 5 ? 0.6 : 1.2, skip: (x, y) => Math.hypot(x, y) < 0.5 || (P && Math.hypot(x - P[0], y - P[1]) < 0.6) }), ...arrows],
    points: [{ x: 0, y: 0, r: 5, color: 'bad', label: '+λ', labelDx: 6, labelDy: 12 }, ...(P ? [{ x: r6(P[0]), y: r6(P[1]), r: 4, color: 'gold', label: 'P' }] : [])],
    caption,
  });
}

// a point on a polar grid with its basis, framed to the point
function pointPic([x, y], caption, { k = 0.25, extra = [], field } = {}) {
  const R = Math.max(2.5, Math.abs(x) + 1.6, (Math.abs(y) + 1.4) / 0.62);
  const step = R > 9 ? 3 : R > 5 ? 2 : 1;
  return plane({
    x: [r6(-R), r6(R)], y: [r6(-0.62 * R), r6(0.62 * R)],
    curves: polarGrid(R * 1.2, { step }),
    arrows: [...(field ? fieldArrows(field, { x: [-R, R], y: [-0.62 * R, 0.62 * R], step, maxLen: 0.6 * step, skip: (a, b) => Math.hypot(a - x, b - y) < 0.7 * step }) : []), ...basisAt([x, y], { k }), ...extra],
    points: [{ x: 0, y: 0, r: 3, color: 'ink3' }, { x, y, r: 4, color: 'gold', label: 'P', labelDx: -16, labelDy: 12 }],
    caption,
  });
}

// the Explore: three fields, a draggable point, components in both systems
const S = (k) => `step(0.5 - abs(f - ${k}))`;
const R2 = '(px^2 + py^2)', RP = 'sqrt(px^2 + py^2)';
const EX = `${S(1)}*px/${R2} + ${S(3)}*(-0.5*py)`;
const EY = `${S(1)}*py/${R2} - ${S(2)} + ${S(3)}*(0.5*px)`;
const ER = `(px*(${EX}) + py*(${EY}))/${RP}`;
const ET = `(px*(${EY}) - py*(${EX}))/${R2}`;
const CAP = `min(1, 1.3/sqrt((${EX})^2 + (${EY})^2 + 0.000001))`;
const grid = (which, f, o = {}) => fieldArrows(f, { x: [-4.2, 4.2], y: [-3, 3], maxLen: 0.75, ...o }).map((a) => ({ ...a, when: S(which) }));
const explore = {
  type: 'graph',
  title: 'One field, two sets of components',
  lead: t`A vector field on the plane and a point P you can drag. The readouts give the field’s Cartesian components at P and its polar ones, $E^r = \tfrac{\partial r}{\partial x^i}E^i$ and $E^\theta = \tfrac{\partial\theta}{\partial x^i}E^i$, computed from the Jacobian **at P**. The dashed path rebuilds the gold arrow as $E^r\partial_r + E^\theta\partial_\theta$.`,
  tasks: [
    t`Line charge: drag P anywhere. $E^\theta$ stays 0 and $E^r = 1/r$ — one simple function of one coordinate, though both Cartesian components depend on $x$ and $y$.`,
    t`Uniform field: every arrow is the same, yet $E^r$ and $E^\theta$ change as P moves. The field is constant; its polar description is not.`,
    t`In every case, compare the two lengths at the bottom: $\sqrt{(E^x)^2 + (E^y)^2}$ and $\sqrt{(E^r)^2 + r^2(E^\theta)^2}$ agree. The length is a scalar — one number per point, whatever the coordinates.`,
  ],
  params: {
    x: [-4.2, 4.2], y: [-3, 3], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
    choices: [{ key: 'f', label: 'Field', options: [[1, 'Line charge'], [2, 'Uniform (downward)'], [3, 'Turntable velocity']], value: 1, explain: 'Line charge: E = r̂/r (2kλ = 1). Uniform: E = (0, −1) everywhere. Turntable: the velocity (−y, x)/2 of a plate turning at 0.5 rad/s.' }],
    curves: polarGrid(5),
    arrows: [
      ...grid(1, (x, y) => [x / (x * x + y * y), y / (x * x + y * y)], { cap: 1.2, skip: (x, y) => Math.hypot(x, y) < 0.5 }),
      ...grid(2, () => [0, -1]),
      ...grid(3, (x, y) => [-y / 2, x / 2]),
      { from: ['px', 'py'], to: [`px*(1 + 1/${RP})`, `py*(1 + 1/${RP})`], color: 'accent', width: 2, label: '∂r' },
      { from: ['px', 'py'], to: ['px - 0.25*py', 'py + 0.25*px'], color: 'violet', width: 2, label: '¼∂θ' },
      { from: ['px', 'py'], to: [`px + ${CAP}*(${ER})*px/${RP}`, `py + ${CAP}*(${ER})*py/${RP}`], color: 'accent', width: 1.4, dash: [5, 4] },
      { from: [`px + ${CAP}*(${ER})*px/${RP}`, `py + ${CAP}*(${ER})*py/${RP}`], to: [`px + ${CAP}*(${EX})`, `py + ${CAP}*(${EY})`], color: 'violet', width: 1.4, dash: [5, 4] },
      { from: ['px', 'py'], to: [`px + ${CAP}*(${EX})`, `py + ${CAP}*(${EY})`], color: 'gold', width: 3, label: 'E' },
    ],
    drag: [{ key: 'p', x: 2.2, y: 1.2 }],
    points: [{ x: 0, y: 0, r: 3, color: 'ink2' }],
    readouts: [
      { label: '$E^x$', expr: EX, digits: 3 },
      { label: '$E^y$', expr: EY, digits: 3 },
      { label: '$E^r$', expr: ER, digits: 3 },
      { label: t`$E^\theta$`, expr: ET, digits: 3 },
      { label: t`$\sqrt{(E^x)^2 + (E^y)^2}$`, expr: `sqrt((${EX})^2 + (${EY})^2)`, digits: 3 },
      { label: t`$\sqrt{(E^r)^2 + r^2(E^\theta)^2}$`, expr: `sqrt((${ER})^2 + ${R2}*(${ET})^2)`, digits: 3 },
    ],
  },
  caption: t`Grey: the chosen field at grid points (to scale with one another; the line charge’s arrows are capped near it). Blue $\partial_r$ and violet $\tfrac14\partial_\theta$: the polar basis at P. Gold: the field at P, drawn at most 1.3 units long; dashed: its two polar pieces. Drag P.`,
};

export default lesson({
  id: 'st-a.A7.2',
  title: 'Transformation laws for fields',
  minutes: 12, difficulty: 3,
  intro: t`A tensor field is described twice when you change coordinates, and the two descriptions must agree **point by point**. At each point the components change with the Jacobians of lesson A4.2 evaluated there — one factor $\partial x'/\partial x$ for each upper index, one factor $\partial x/\partial x'$ for each lower index — and then every function is rewritten in the new coordinates:

$$T'^{\mu}{}_{\nu}(x') = \frac{\partial x'^\mu}{\partial x^\alpha}\,\frac{\partial x^\beta}{\partial x'^\nu}\;T^{\alpha}{}_{\beta}(x)$$

where $x$ and $x'$ are the **same point** in the two systems. A scalar has no indices and so no factors: $f'(x') = f(x)$ — the same number at the same point, though usually a different formula ($x^2 + y^2$ becomes $r^2$). The classic slip is to keep the formula and swap the letters.`,
  symbols: [
    { tex: t`T^{\alpha}{}_{\beta}(x)`, text: t`the field’s components in the old coordinates, at the point whose old coordinates are $x$` },
    { tex: t`T'^{\mu}{}_{\nu}(x')`, text: t`its components in the new coordinates, at the same point, whose new coordinates are $x'$` },
    { tex: t`\dfrac{\partial x'^\mu}{\partial x^\alpha}`, text: t`the Jacobian of the new coordinates with respect to the old, evaluated at the point: one factor per upper index` },
    { tex: t`\dfrac{\partial x^\beta}{\partial x'^\nu}`, text: t`the inverse Jacobian, evaluated at the same point: one factor per lower index` },
    { tex: t`\alpha,\ \beta`, text: 'summed indices (each appears once up and once down); μ and ν are free' },
  ],
  why: t`General relativity writes its laws as equations between tensor fields precisely so that this rule carries them, unchanged, into any coordinates — Schwarzschild’s, a falling observer’s, or a spacecraft’s.`,
  visual: explore,
  example: {
    prompt: t`A long straight wire carries charge $\lambda$ per metre. In the plane across it, its field is $E^i = 2k\lambda\,x^i/r^2$ in Cartesian components ($k = 1/4\pi\varepsilon_0$). Transform the vector field $E^i$, and the $(0, 2)$ field $T_{ij} = E_iE_j$ built from it (a piece of the Maxwell stress tensor), to polar coordinates.`,
    visual: linePic([2.4, 1.3], t`The field of the line charge (seen end-on at the origin) on a polar grid: arrows to scale with one another, capped near the wire. P is a typical point.`),
    steps: [
      { label: 'The Jacobian at a point', text: t`At the point $(r, \theta)$: $\partial r/\partial x = \cos\theta$, $\partial r/\partial y = \sin\theta$, $\partial\theta/\partial x = -\sin\theta/r$, $\partial\theta/\partial y = \cos\theta/r$ (lesson A4.2). These are numbers once the point is chosen.` },
      { label: 'Vector components', text: t`$E^r = \dfrac{\partial r}{\partial x}E^x + \dfrac{\partial r}{\partial y}E^y = \dfrac{2k\lambda}{r^2}(x\cos\theta + y\sin\theta) = \dfrac{2k\lambda}{r^2}\,r = \dfrac{2k\lambda}{r}$, using $x = r\cos\theta$, $y = r\sin\theta$. And $E^\theta = \dfrac{2k\lambda}{r^2}\cdot\dfrac{-x\sin\theta + y\cos\theta}{r} = 0$.` },
      { label: 'Rewrite the functions', text: t`Everything is now a function of $(r, \theta)$, and a simple one: $E^r = 2k\lambda/r$, $E^\theta = 0$. Two Cartesian functions of $x$ and $y$ became one function of $r$ — the coordinates fit the symmetry.` },
      { label: 'Two lower indices, two factors', text: t`$T'_{\mu\nu} = \dfrac{\partial x^a}{\partial x'^\mu}\dfrac{\partial x^b}{\partial x'^\nu}T_{ab}$. With $T_{ab} = \left(\dfrac{2k\lambda}{r^2}\right)^2\begin{pmatrix} x^2 & xy \\ xy & y^2 \end{pmatrix}$ and $\partial(x, y)/\partial r = (\cos\theta, \sin\theta)$: $T'_{rr} = \left(\dfrac{2k\lambda}{r^2}\right)^2(x\cos\theta + y\sin\theta)^2 = \left(\dfrac{2k\lambda}{r}\right)^2$. With $\partial(x, y)/\partial\theta = (-y, x)$ every other component holds a factor $-yx + xy = 0$.` },
      { label: 'Check', text: t`Lowering $E^r$ with $g_{rr} = 1$ gives $E_r = 2k\lambda/r$, and $T'_{rr} = E_rE_r$ ✓ — transforming the product equals the product of the transformed pieces, as it must for a tensor.` },
    ],
    answer: t`$E^r = 2k\lambda/r$, $E^\theta = 0$; $T'_{rr} = (2k\lambda/r)^2$ and $T'_{r\theta} = T'_{\theta r} = T'_{\theta\theta} = 0$.`,
  },
  practice: [
    num({
      id: 'scalar-same-point', difficulty: 1,
      gen(r) {
        const R = r.pick([2, 3, 4]), th = r.pick([30, 60, 120, 150]);
        const ans = R * R * Math.cos(2 * th * DEG), wrong = R * R - (th * DEG) ** 2;
        const x = R * Math.cos(th * DEG), y = R * Math.sin(th * DEG);
        return {
          prompt: t`A potential is $f(x, y) = x^2 - y^2$ in Cartesian coordinates. What is its value at the point with polar coordinates $(r, \theta) = (${R}, ${th}^\circ)$?`,
          visual: pointPic([x, y], t`The point on the polar grid, with its polar basis ($\partial_\theta$ at a quarter of its length).`),
          answer: ans, tol: { rel: 0.005, abs: 0.01 },
          errors: [{ value: wrong, feedback: t`That puts $r$ in place of $x$ and $\theta$ in place of $y$. A scalar keeps its value at the same **point**: find that point’s $x$ and $y$ first.` }],
          hints: [t`The point is $x = ${R}\cos${th}^\circ$, $y = ${R}\sin${th}^\circ$.`],
          teach: t`A scalar field transforms as $f'(x') = f(x)$: same point, same value, new formula.`,
          explain: t`$f = x^2 - y^2 = r^2(\cos^2\theta - \sin^2\theta) = r^2\cos2\theta$, so $f'(r, \theta) = r^2\cos2\theta = ${R * R}\cos${2 * th}^\circ = ${nice(ans, 4)}$.`,
        };
      },
    }),
    expr({
      id: 'scalar-formula', difficulty: 2,
      gen(r) {
        const [fx, ans, wrong, label] = r.pick([
          ['xy', 'r^2 sin(theta) cos(theta)', 'r theta', t`xy`],
          ['x^2 + 2y^2', 'r^2 (1 + sin(theta)^2)', 'r^2 + 2theta^2', t`x^2 + 2y^2`],
          ['y/x', 'tan(theta)', 'theta/r', t`y/x`],
        ]);
        return {
          prompt: t`Rewrite the scalar field $f(x, y) = ${label}$ in polar coordinates: find $f'(r, \theta)$.`,
          visual: pointPic([2.2, 1.4], t`Any point P: $f'$ at its polar coordinates must equal $f$ at its Cartesian ones.`),
          answer: ans, vars: { r: [0.5, 3], theta: [0.2, 1.3] }, lhs: t`f'(r, \theta)`,
          errors: [{ answer: wrong, feedback: t`That swaps letters ($x \to r$, $y \to \theta$). Substitute $x = r\cos\theta$, $y = r\sin\theta$ instead.` }],
          hints: [t`Substitute $x = r\cos\theta$ and $y = r\sin\theta$.`],
          teach: 'A scalar keeps its value at each point; its formula changes by substituting the old coordinates as functions of the new.',
          explain: t`$f'(r, \theta) = f(r\cos\theta, r\sin\theta)$: ${fx === 'xy' ? t`$r^2\sin\theta\cos\theta = \tfrac12r^2\sin2\theta$` : fx === 'y/x' ? t`$\tan\theta$` : t`$r^2\cos^2\theta + 2r^2\sin^2\theta = r^2(1 + \sin^2\theta)$`}.`,
        };
      },
    }),
    num({
      id: 'uniform-g', difficulty: 2,
      gen(r) {
        const [x, y, R] = r.pick(PTS), which = r.pick(['r', 'theta']);
        const g = 9.81, gr = (-g * y) / R, gt = (-g * x) / (R * R);
        const ans = which === 'r' ? gr : gt;
        return {
          prompt: t`Near the ground, gravity is the uniform field $g^i = (0, -9.81)$ m/s² (the $y$ axis points up). In polar coordinates centred on a point of the ground, find ${which === 'r' ? t`$g^r$, in m/s²` : t`$g^\theta$, in $\text{s}^{-2}$ (radians per second squared)`} at $(x, y) = (${x}, ${y})$ m.`,
          visual: pointPic([x, y], t`A uniform downward field on a polar grid, with the polar basis at the point ($\partial_\theta$ at a quarter of its length).`, { field: () => [0, -1] }),
          answer: ans, units: which === 'r' ? 'm/s^2' : 's^-2', tol: { rel: 0.005 },
          errors: which === 'theta' ? [{ value: gt * R, feedback: t`That is the component along the unit vector $\hat\theta$. $\partial_\theta$ is $r$ long, so divide by $r$ once more.` }] : [{ value: (-g * x) / R, feedback: t`That projects onto the wrong direction: $\partial r/\partial y = \sin\theta = y/r$.` }],
          hints: [which === 'r' ? t`$g^r = \dfrac{\partial r}{\partial x}g^x + \dfrac{\partial r}{\partial y}g^y = \dfrac{y}{r}g^y$.` : t`$g^\theta = \dfrac{\partial\theta}{\partial x}g^x + \dfrac{\partial\theta}{\partial y}g^y = \dfrac{x}{r^2}g^y$.`, t`$r = ${R}$ m.`],
          teach: 'A constant field acquires position-dependent components in polar coordinates: the Jacobian changes from point to point.',
          explain: which === 'r' ? t`$g^r = (${y}/${R})(-9.81) = ${nice(gr, 4)}$ m/s².` : t`$g^\theta = (${x}/${R * R})(-9.81) = ${nice(gt, 4)}\ \text{s}^{-2}$.`,
        };
      },
    }),
    num({
      id: 'vector-or-covector', difficulty: 3,
      gen(r) {
        const R = r.pick([2, 3, 4, 5]), kind = r.pick(['V', 'w']);
        const ans = kind === 'V' ? 1 : R * R;
        return {
          prompt: kind === 'V'
            ? t`A **vector** field has Cartesian components $(V^x, V^y) = (-y, x)$. Find its polar component $V^\theta$ at a point with $r = ${R}$.`
            : t`A **covector** field has Cartesian components $(\omega_x, \omega_y) = (-y, x)$ — it is $\omega = -y\,dx + x\,dy$. Find its polar component $\omega_\theta$ at a point with $r = ${R}$.`,
          visual: pointPic([R * 0.8, R * 0.6], t`The point at $r = ${R}$ and its polar basis; the grey arrows are the array $(-y, x)$ read as a vector field.`, { field: (x, y) => [-y, x], k: 0.2 }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: kind === 'V' ? R * R : 1, feedback: kind === 'V' ? t`That is the covector rule, $\partial x^a/\partial\theta$. A vector takes $\partial\theta/\partial x^a$: $V^\theta = (-y)(-y/r^2) + x(x/r^2)$.` : t`That is the vector rule. A covector takes $\partial x^a/\partial\theta = (-y, x)$: $\omega_\theta = (-y)(-y) + x\cdot x$.` }],
          hints: [kind === 'V' ? t`$V^\theta = \dfrac{\partial\theta}{\partial x}V^x + \dfrac{\partial\theta}{\partial y}V^y$, with $\partial\theta/\partial x = -y/r^2$ and $\partial\theta/\partial y = x/r^2$.` : t`$\omega_\theta = \dfrac{\partial x}{\partial\theta}\omega_x + \dfrac{\partial y}{\partial\theta}\omega_y$, with $\partial x/\partial\theta = -y$ and $\partial y/\partial\theta = x$.`, kind === 'V' ? t`$V^\theta = (y^2 + x^2)/r^2$.` : t`$\omega_\theta = y^2 + x^2$.`],
          teach: 'The same array of functions transforms differently as a vector field and as a covector field: the type is part of the field.',
          explain: kind === 'V' ? t`$V^\theta = (y^2 + x^2)/r^2 = 1$ everywhere: this vector field is $\partial_\theta$. Read as a covector, the same array gives $\omega_\theta = r^2 = ${R * R}$ here — it is $r^2\,d\theta$.` : t`$\omega_\theta = y^2 + x^2 = r^2 = ${R * R}$: the covector field is $r^2\,d\theta$. Read as a vector, the same array would give $V^\theta = 1$ — the field $\partial_\theta$.`,
        };
      },
    }),
    num({
      id: 'dxdx', difficulty: 3,
      gen(r) {
        const R = r.pick([2, 3, 5]), th = r.pick([30, 60, 120, 150]), comp = r.pick(['rt', 'tt']);
        const c = Math.cos(th * DEG), s = Math.sin(th * DEG);
        const ans = comp === 'rt' ? -R * s * c : R * R * s * s;
        return {
          prompt: t`The $(0, 2)$ field $T = dx\otimes dx$ has Cartesian components $T_{xx} = 1$ and every other component $0$. Find its polar component ${comp === 'rt' ? t`$T'_{r\theta}$` : t`$T'_{\theta\theta}$`} at $(r, \theta) = (${R}, ${th}^\circ)$.`,
          visual: pointPic([R * c, R * s], t`The point and its polar basis ($\partial_\theta$ at a quarter of its length, which is $r$).`),
          answer: ans, tol: { rel: 0.005, abs: 0.005 },
          errors: [{ value: comp === 'rt' ? -s * c : s * s, feedback: t`Each factor $\partial x/\partial\theta = -r\sin\theta$ carries an $r$. Did you use $-\sin\theta$?` }, ...(comp === 'tt' ? [{ value: -R * s, feedback: t`Two lower indices need two factors: $T'_{\theta\theta} = (\partial x/\partial\theta)^2\,T_{xx}$.` }] : [{ value: R * R * s * c, feedback: t`Check the sign: $\partial x/\partial r = \cos\theta$ and $\partial x/\partial\theta = -r\sin\theta$.` }])].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$T'_{\mu\nu} = \dfrac{\partial x^a}{\partial x'^\mu}\dfrac{\partial x^b}{\partial x'^\nu}T_{ab}$, and only $T_{xx}$ survives: $T'_{\mu\nu} = \dfrac{\partial x}{\partial x'^\mu}\dfrac{\partial x}{\partial x'^\nu}$.`, t`$\partial x/\partial r = \cos\theta$ and $\partial x/\partial\theta = -r\sin\theta$.`],
          teach: 'A (0, 2) field takes two inverse-Jacobian factors, one for each lower index.',
          explain: comp === 'rt' ? t`$T'_{r\theta} = (\cos\theta)(-r\sin\theta) = -${R}\sin${th}^\circ\cos${th}^\circ = ${nice(ans, 4)}$.` : t`$T'_{\theta\theta} = (-r\sin\theta)^2 = ${R * R}\sin^2${th}^\circ = ${nice(ans, 4)}$. In full, $dx\otimes dx = \cos^2\theta\,dr\otimes dr - r\sin\theta\cos\theta\,(dr\otimes d\theta + d\theta\otimes dr) + r^2\sin^2\theta\,d\theta\otimes d\theta$ — just $dx = \cos\theta\,dr - r\sin\theta\,d\theta$ multiplied by itself.`,
        };
      },
    }),
    mcq({
      id: 'factors', difficulty: 2,
      prompt: t`How does a type $(1, 2)$ tensor field $S^{\lambda}{}_{\mu\nu}$ transform?`,
      visual: pointPic([2.1, 1.3], 'Every factor is evaluated at the same point P, where both descriptions meet.'),
      choices: [
        t`$S'^{\lambda}{}_{\mu\nu} = \dfrac{\partial x'^\lambda}{\partial x^\alpha}\dfrac{\partial x^\beta}{\partial x'^\mu}\dfrac{\partial x^\gamma}{\partial x'^\nu}\,S^{\alpha}{}_{\beta\gamma}$`,
        t`$S'^{\lambda}{}_{\mu\nu} = \dfrac{\partial x^\lambda}{\partial x'^\alpha}\dfrac{\partial x'^\beta}{\partial x^\mu}\dfrac{\partial x'^\gamma}{\partial x^\nu}\,S^{\alpha}{}_{\beta\gamma}$`,
        t`$S'^{\lambda}{}_{\mu\nu} = \dfrac{\partial x'^\lambda}{\partial x^\alpha}\,S^{\alpha}{}_{\mu\nu}$`,
        t`$S'^{\lambda}{}_{\mu\nu} = \det\!\left(\dfrac{\partial x'}{\partial x}\right)S^{\lambda}{}_{\mu\nu}$`,
      ],
      answer: 0,
      why: {
        1: t`Here the primes sit on the wrong side: the free index $\lambda$ would be unprimed, and the new components would carry old-coordinate indices.`,
        2: 'Every index needs its own factor; the two lower indices were left untransformed.',
        3: 'A single determinant is how a density changes (lesson A10.1), not a tensor: each index transforms separately.',
      },
      hints: [t`One factor per index. An upper index takes $\partial x'/\partial x$; a lower index takes $\partial x/\partial x'$ — its primed index sits in the denominator.`],
      teach: 'A tensor field transforms with one Jacobian factor per index: forward for upper, inverse for lower.',
      explain: t`Upper $\lambda$: $\partial x'^\lambda/\partial x^\alpha$. Lower $\mu$, $\nu$: $\partial x^\beta/\partial x'^\mu$ and $\partial x^\gamma/\partial x'^\nu$. Every summed index ($\alpha, \beta, \gamma$) appears once up and once down, and every free index is primed and sits where it sits on the left.`,
    }),
    code({
      id: 'sympy-02', difficulty: 3,
      prompt: t`Finish \`to_polar_02(T)\`, which takes the Cartesian components $T_{ab}(x, y)$ of a $(0, 2)$ field as a 2×2 SymPy matrix and returns its polar components $T'_{\mu\nu}(r, \theta)$: substitute $x = r\cos\theta$, $y = r\sin\theta$, then apply $T' = J^\mathsf{T}\,T\,J$ with $J = \partial(x, y)/\partial(r, \theta)$, and simplify. Then transform the line-charge tensor \`EE\` (with \`k\` standing for $2k\lambda$).`,
      starter: t`import sympy as sp
r, th = sp.symbols('r theta', positive=True)
x, y = sp.symbols('x y', real=True)
k = sp.symbols('k', positive=True)            # stands for 2 k lambda
X, Y = r * sp.cos(th), r * sp.sin(th)
J = sp.Matrix([X, Y]).jacobian([r, th])       # d(x, y)/d(r, theta)

def to_polar_02(T):
    pass   # substitute x = X, y = Y into T, then return simplified J.T * T * J

E = sp.Matrix([k * x / (x**2 + y**2), k * y / (x**2 + y**2)])
EE = E * E.T                                  # T_ab = E_a E_b
EEpolar = to_polar_02(EE)
print(EEpolar)
`,
      answer: t`import sympy as sp
r, th = sp.symbols('r theta', positive=True)
x, y = sp.symbols('x y', real=True)
k = sp.symbols('k', positive=True)            # stands for 2 k lambda
X, Y = r * sp.cos(th), r * sp.sin(th)
J = sp.Matrix([X, Y]).jacobian([r, th])       # d(x, y)/d(r, theta)

def to_polar_02(T):
    Tsub = T.subs({x: X, y: Y})
    return sp.simplify(J.T * Tsub * J)

E = sp.Matrix([k * x / (x**2 + y**2), k * y / (x**2 + y**2)])
EE = E * E.T                                  # T_ab = E_a E_b
EEpolar = to_polar_02(EE)
print(EEpolar)`,
      tests: [
        { name: t`the flat metric $\delta_{ab}$ becomes $\text{diag}(1, r^2)$`, code: 'sp.simplify(to_polar_02(sp.eye(2)) - sp.diag(1, r**2)) == sp.zeros(2, 2)' },
        { name: t`$dx\otimes dx$ becomes $\begin{pmatrix} \cos^2\theta & -r\sin\theta\cos\theta \\ -r\sin\theta\cos\theta & r^2\sin^2\theta \end{pmatrix}$`, code: 'sp.simplify(to_polar_02(sp.Matrix([[1, 0], [0, 0]])) - sp.Matrix([[sp.cos(th)**2, -r*sp.sin(th)*sp.cos(th)], [-r*sp.sin(th)*sp.cos(th), r**2*sp.sin(th)**2]])) == sp.zeros(2, 2)' },
        { name: t`\`EEpolar\` has $T'_{rr} = k^2/r^2$ and nothing else`, code: 'sp.simplify(EEpolar - sp.Matrix([[k**2/r**2, 0], [0, 0]])) == sp.zeros(2, 2)' },
      ],
      hints: [t`\`T.subs({x: X, y: Y})\` rewrites the components as functions of $r$ and $\theta$.`, t`Return \`sp.simplify(J.T * T.subs({x: X, y: Y}) * J)\`: column $\mu$ of $J$ is $\partial x^a/\partial x'^\mu$, so $J^\mathsf{T}TJ$ puts one such factor on each lower index.`],
      teach: t`For a $(0, 2)$ field the two inverse-Jacobian factors are the matrix product $J^\mathsf{T}TJ$, with the components first rewritten in the new coordinates.`,
      explain: t`$(J^\mathsf{T}TJ)_{\mu\nu} = J^a{}_\mu T_{ab}J^b{}_\nu = \dfrac{\partial x^a}{\partial x'^\mu}\dfrac{\partial x^b}{\partial x'^\nu}T_{ab}$ — the transformation law, written as matrices. The metric test reproduces lesson A6’s $ds^2 = dr^2 + r^2d\theta^2$; the line-charge tensor collapses to a single radial component.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-uniform-E', difficulty: 2,
      gen(r) {
        const [x, y, R] = r.pick(PTS), E0 = r.pick([200, 500, 1200]);
        const ans = (-E0 * y) / (R * R);
        return {
          prompt: t`Between two large charged plates the field is uniform, $E^i = (${E0}, 0)$ V/m. In polar coordinates centred on a point between the plates, what is $E^\theta$ at $(x, y) = (${x}, ${y})$ cm? Give it in V/m² (volts per metre, per metre of $r$ — that is, per radian per metre).`,
          visual: pointPic([x, y], t`A uniform field and the polar basis at the point ($\partial_\theta$ at a quarter of its length). Distances in cm.`, { field: () => [1, 0] }),
          answer: ans * 100, units: 'V/m^2', tol: { rel: 0.005 },
          errors: [{ value: (-E0 * y) / R, feedback: t`That is the component along the unit vector $\hat\theta$, in V/m. $E^\theta$ counts $\partial_\theta$’s, which are $r$ long.` }, { value: ans, feedback: 'Convert the coordinates to metres: r² is in m².' }],
          hints: [t`$E^\theta = \dfrac{\partial\theta}{\partial x}E^x = -\dfrac{y}{r^2}E^x$.`],
          teach: 'Field components transform with the Jacobian evaluated at the point.',
          explain: t`$E^\theta = -\dfrac{y}{r^2}E^x = -\dfrac{${y / 100}}{(${R / 100})^2}(${E0}) = ${nice(ans * 100, 4)}$ V/m².`,
        };
      },
    }),
    num({
      id: 'cp-tank', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([0.3, 0.35, 0.4]), Rm = r.pick([1.8, 2.6]), th = r.pick([4, 5, 6]), phi = r.pick([30, 60, 120]), comp = r.pick(['xx', 'xy']);
        const sh = (p * Rm * 1000) / th;
        const s = Math.sin(phi * DEG), c = Math.cos(phi * DEG);
        const ans = comp === 'xx' ? sh * s * s : -sh * s * c;
        return {
          prompt: t`A launch vehicle’s propellant tank has radius ${Rm} m and an aluminium wall ${th} mm thick, pressurised to ${p} MPa. In the wall the stress is the hoop stress $\sigma_h = pR/t$ along the unit vector $\hat\varphi$ around the tank (the axial stress acts along the tank, out of this cross-section, and the radial stress is negligible). Using the rotation from $(\hat r, \hat\varphi)$ to the fixed axes $(x, y)$ of the cross-section, find ${comp === 'xx' ? t`$\sigma_{xx}$` : t`$\sigma_{xy}$`} at the point of the wall at angle $\varphi = ${phi}^\circ$ from the $x$ axis, in MPa.`,
          visual: plane({
            x: [-3.4, 3.4], y: [-2.1, 2.1],
            curves: [{ param: ['1.6*cos(t)', '1.6*sin(t)'], t: [0, 6.2832], color: 'ink2', width: 3 }],
            arrows: [
              { from: [r6(1.6 * c), r6(1.6 * s)], to: [r6(1.6 * c - 0.8 * s), r6(1.6 * s + 0.8 * c)], color: 'bad', width: 2.4, label: 'σ (hoop)' },
              { from: [r6(1.6 * c), r6(1.6 * s)], to: [r6(1.6 * c + 0.8 * s), r6(1.6 * s - 0.8 * c)], color: 'bad', width: 2.4 },
              { from: [-3, -1.7], to: [-2.4, -1.7], color: 'ink3', width: 1.2, label: 'x' }, { from: [-3, -1.7], to: [-3, -1.1], color: 'ink3', width: 1.2, label: 'y' },
            ],
            points: [{ x: 0, y: 0, r: 3, color: 'ink3' }, { x: r6(1.6 * c), y: r6(1.6 * s), r: 4, color: 'gold' }],
            caption: t`The tank’s cross-section (wall thickness exaggerated) and the hoop stress at the point $\varphi = ${phi}^\circ$. Thin-wall theory: the stress is uniform through the wall.`,
          }),
          answer: ans, units: 'MPa', tol: { rel: 0.01 },
          errors: [{ value: sh, feedback: t`That is the hoop stress itself, the component along $\hat\varphi$. In fixed axes it spreads over $xx$, $xy$ and $yy$.` }, ...(comp === 'xx' ? [{ value: sh * c * c, feedback: t`$\hat\varphi = (-\sin\varphi, \cos\varphi)$, so $\sigma_{xx} = \sigma_h(\hat\varphi^x)^2 = \sigma_h\sin^2\varphi$.` }] : [])].filter((e) => Math.abs(e.value - ans) > 0.5),
          hints: [t`$\sigma_h = pR/t = (${p})(${Rm * 1000})/${th} = ${nice(sh, 4)}$ MPa, and the stress tensor is $\sigma_h\,\hat\varphi\otimes\hat\varphi$.`, t`$\hat\varphi = (-\sin\varphi, \cos\varphi)$ in $(x, y)$, so $\sigma_{ab} = \sigma_h\hat\varphi_a\hat\varphi_b$.`],
          teach: 'A stress that is simple in the tank’s own directions spreads over several components in fixed axes — the (0, 2) law with the rotation as Jacobian.',
          explain: t`$\sigma_{${comp}} = \sigma_h\,\hat\varphi_x\hat\varphi_${comp[1]} = ${nice(sh, 4)}\times${comp === 'xx' ? t`\sin^2${phi}^\circ` : t`(-\sin${phi}^\circ)(\cos${phi}^\circ)`} = ${nice(ans, 4)}$ MPa. The tensor is the same everywhere around the wall in the tank’s own frame; its fixed-axis components are a field that varies with $\varphi$.`,
        };
      },
    }),
    mcq({
      id: 'cp-letters', difficulty: 2, kind: 'error',
      prompt: t`A student converts the temperature field $T(x, y) = T_0 + ax$ of a heated plate to polar coordinates and writes $T'(r, \theta) = T_0 + ar$. What went wrong?`,
      visual: pointPic([2, 1.5], t`At P, $x = r\cos\theta$, not $r$.`, { field: () => [1, 0] }),
      choices: [
        t`They renamed the letter instead of substituting: at the same point $x = r\cos\theta$, so $T'(r, \theta) = T_0 + ar\cos\theta$`,
        t`Nothing: a scalar is the same in every coordinate system, so the formula is unchanged`,
        t`They forgot a Jacobian factor: $T'(r, \theta) = (T_0 + ar)\cos\theta$`,
        t`Temperature is a vector, so it needs $\partial r/\partial x$: $T' = (T_0 + ax)\,x/r$`,
      ],
      answer: 0,
      why: {
        1: t`The *value* at each point is unchanged; the *formula* changes. At $(r, \theta) = (1, 90^\circ)$, the point $(0, 1)$, their formula gives $T_0 + a$ but the plate is at $T_0$ there.`,
        2: t`A scalar has no index, so no Jacobian factor at all — only substitution. That formula also multiplies $T_0$ by $\cos\theta$.`,
        3: 'Temperature is one number per point: a scalar field, with no Jacobian factors.',
      },
      hints: [t`Test their formula at a point you can check, such as $(r, \theta) = (1, 90^\circ)$.`],
      teach: t`$f'(x') = f(x)$: a scalar field is rewritten by substituting the old coordinates as functions of the new, never by renaming letters.`,
      explain: t`At the point $(r, \theta)$ the Cartesian $x$ is $r\cos\theta$, so $T' = T_0 + ar\cos\theta$. Renaming letters describes a different field — one that grows outward in every direction instead of along $x$.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 2 (tensors and their transformation laws)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §5.2 (tensor fields in polar coordinates)', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'OpenStax University Physics Vol. 2, §5.5 (field of a line charge)', url: 'https://openstax.org/books/university-physics-volume-2/pages/5-5-calculating-electric-fields-of-charge-distributions' },
  ],
});
