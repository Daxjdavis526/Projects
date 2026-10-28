// The Jacobian matrix as the transformation rule: from the chain rule,
// vector components transform with ∂x'/∂x and covector components with
// ∂x/∂x'; the two Jacobians are inverse matrices, so pairings are invariant.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_ten.js';

const t = String.raw;
const DEG = Math.PI / 180;
const PTS = [[3, 4, 5], [-3, 4, 5], [4, -3, 5], [6, 8, 10], [-5, 12, 13], [12, 5, 13], [-8, -6, 10]];

// the polar coordinate basis at a point (x, y) of the plane, with a vector V and its split into V^r ∂_r + V^θ ∂_θ
function polarVecPic([x, y], V, caption, { split = true, scale = 1, thetaScale = 0.25 } = {}) {
  const r = Math.hypot(x, y), c = x / r, s = y / r;
  const Vr = c * V[0] + s * V[1], Vt = (-s * V[0] + c * V[1]) / r;
  const P = [x, y].map(r6), er = [c, s], et = [-r * s * thetaScale, r * c * thetaScale];
  const A = [x + scale * Vr * c, y + scale * Vr * s];
  const tip = [x + scale * V[0], y + scale * V[1]];
  const span = Math.max(2.5, 1.6 * scale * Math.hypot(...V));
  return {
    type: 'graph',
    params: {
      x: [r6(x - span), r6(x + span)], y: [r6(y - 0.65 * span), r6(y + 0.65 * span)], equal: true, aspect: 'wide', xticks: 6, yticks: 4,
      curves: [{ param: [`${r6(r)}*cos(t)`, `${r6(r)}*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1 }, { param: [`t*${r6(c)}`, `t*${r6(s)}`], t: [0, r + span], color: 'ink4', width: 1 }],
      arrows: [
        { from: P, to: [r6(x + er[0]), r6(y + er[1])], color: 'accent', width: 2.4, label: '∂r' },
        { from: P, to: [r6(x + et[0]), r6(y + et[1])], color: 'violet', width: 2.4, label: `${thetaScale === 1 ? '' : thetaScale}∂θ` },
        ...(split ? [{ from: P, to: A.map(r6), color: 'accent', width: 1.4, dash: [5, 4] }, { from: A.map(r6), to: tip.map(r6), color: 'violet', width: 1.4, dash: [5, 4] }] : []),
        { from: P, to: tip.map(r6), color: 'gold', width: 3, label: 'V' },
      ],
      points: [{ x: P[0], y: P[1], color: 'ink', label: 'P', labelDx: -14, labelDy: 12 }],
    },
    caption,
  };
}

export default lesson({
  id: 'st-a.A4.2',
  title: 'The Jacobian matrix as the transformation rule',
  minutes: 12, difficulty: 3,
  intro: t`Two chain rules give the two transformation laws. A vector is the velocity of a curve, $V^\nu = dx^\nu/d\lambda$; in new coordinates $V'^\mu = dx'^\mu/d\lambda$, and the chain rule turns one into the other. A covector is (like) a gradient, $\omega_\nu = \partial f/\partial x^\nu$; in new coordinates $\omega'_\mu = \partial f/\partial x'^\mu$, and the chain rule again:

$$V'^\mu = \frac{\partial x'^\mu}{\partial x^\nu}\,V^\nu, \qquad \omega'_\mu = \frac{\partial x^\nu}{\partial x'^\mu}\,\omega_\nu$$

The two Jacobian matrices are **inverses** — $\dfrac{\partial x'^\mu}{\partial x^\nu}\dfrac{\partial x^\nu}{\partial x'^\lambda} = \delta^\mu_\lambda$, the chain rule for $x'(x(x'))$ — so in $\omega'_\mu V'^\mu$ they cancel and the pairing is unchanged. You need not memorise which is which: **the grammar decides**. The free index must sit where it sits in the answer (up for $V'^\mu$, down — in the denominator — for $\omega'_\mu$), and the summed $\nu$ must pair up with down. This is lesson A3.5’s rule with the matrix $A$ made from coordinates: the new basis vectors are $\partial'_\mu = (\partial x^\nu/\partial x'^\mu)\,\partial_\nu$, so the columns of $\partial x/\partial x'$ are the new basis vectors.`,
  symbols: [
    { tex: t`\dfrac{\partial x'^\mu}{\partial x^\nu}`, text: t`the Jacobian of the new coordinates with respect to the old: row $\mu$, column $\nu$. It carries vector components forward` },
    { tex: t`\dfrac{\partial x^\nu}{\partial x'^\mu}`, text: t`the Jacobian of the old with respect to the new — the inverse matrix. Its columns are the new basis vectors $\partial'_\mu$; it carries covector components forward` },
    { tex: t`V^\nu,\ V'^\mu`, text: 'vector components, old and new (contravariant: upper index)' },
    { tex: t`\omega_\nu,\ \omega'_\mu`, text: 'covector components, old and new (covariant: lower index)' },
  ],
  why: t`This is the working definition of a vector and a covector field in general relativity: anything whose components obey these laws under every change of coordinates. A tensor obeys one such factor per index.`,
  visual: {
    type: 'graph',
    title: 'Cartesian velocity, polar components',
    lead: t`A point P on the plane (set by its polar coordinates) and a velocity $V$ (set by its Cartesian components). The blue and violet arrows are the polar basis vectors at P, $\partial_r$ and $\partial_\theta$ (drawn at a quarter of its length, which is $r$). The dashed path builds $V = V^r\partial_r + V^\theta\partial_\theta$, with the readout’s polar components from the Jacobian.`,
    tasks: [
      t`Point $V$ straight out from the origin: $V^\theta = 0$ and $V^r = |V|$.`,
      t`Keep $V$ fixed and slide P outward: $V^\theta$ shrinks like $1/r$, because $\partial_\theta$ grows like $r$ — same arrow, smaller component.`,
      t`Turn P around the origin with $V$ fixed: both polar components change, though $V$ does not — the polar basis turns with P.`,
    ],
    params: {
      x: [-4.6, 4.6], y: [-3.4, 3.4], equal: true, aspect: 'wide', xticks: 8, yticks: 6,
      sliders: [
        { key: 'rr', label: '$r$ at P', min: 0.5, max: 3.5, step: 0.1, value: 2, explain: 'Distance of P from the origin.' },
        { key: 'th', label: t`$\theta$ at P`, min: -180, max: 180, step: 5, value: 35, unit: '^\\circ', explain: 'Polar angle of P.' },
        { key: 'vx', label: '$V^x$', min: -2, max: 2, step: 0.1, value: -0.6, explain: 'Cartesian components of the velocity.' },
        { key: 'vy', label: '$V^y$', min: -2, max: 2, step: 0.1, value: 1.2, explain: 'Its y-component.' },
      ],
      constants: { k: 0.25 },
      curves: [{ param: ['rr*cos(t)', 'rr*sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1 }, { param: ['t*cos(th*pi/180)', 't*sin(th*pi/180)'], t: [0, 6], color: 'ink4', width: 1 }],
      arrows: [
        { from: ['rr*cos(th*pi/180)', 'rr*sin(th*pi/180)'], to: ['rr*cos(th*pi/180) + cos(th*pi/180)', 'rr*sin(th*pi/180) + sin(th*pi/180)'], color: 'accent', width: 2.4, label: '∂r' },
        { from: ['rr*cos(th*pi/180)', 'rr*sin(th*pi/180)'], to: ['rr*cos(th*pi/180) - k*rr*sin(th*pi/180)', 'rr*sin(th*pi/180) + k*rr*cos(th*pi/180)'], color: 'violet', width: 2.4, label: '¼∂θ' },
        { from: ['rr*cos(th*pi/180)', 'rr*sin(th*pi/180)'], to: ['rr*cos(th*pi/180) + (cos(th*pi/180)*vx + sin(th*pi/180)*vy)*cos(th*pi/180)', 'rr*sin(th*pi/180) + (cos(th*pi/180)*vx + sin(th*pi/180)*vy)*sin(th*pi/180)'], color: 'accent', width: 1.4, dash: [5, 4] },
        { from: ['rr*cos(th*pi/180) + (cos(th*pi/180)*vx + sin(th*pi/180)*vy)*cos(th*pi/180)', 'rr*sin(th*pi/180) + (cos(th*pi/180)*vx + sin(th*pi/180)*vy)*sin(th*pi/180)'], to: ['rr*cos(th*pi/180) + vx', 'rr*sin(th*pi/180) + vy'], color: 'violet', width: 1.4, dash: [5, 4] },
        { from: ['rr*cos(th*pi/180)', 'rr*sin(th*pi/180)'], to: ['rr*cos(th*pi/180) + vx', 'rr*sin(th*pi/180) + vy'], color: 'gold', width: 3, label: 'V' },
      ],
      points: [{ x: 'rr*cos(th*pi/180)', y: 'rr*sin(th*pi/180)', color: 'ink', label: 'P', labelDx: -14, labelDy: 12 }],
      readouts: [
        { label: t`$V^r = \tfrac{\partial r}{\partial x}V^x + \tfrac{\partial r}{\partial y}V^y$`, expr: 'cos(th*pi/180)*vx + sin(th*pi/180)*vy', digits: 3 },
        { label: t`$V^\theta = \tfrac{\partial\theta}{\partial x}V^x + \tfrac{\partial\theta}{\partial y}V^y$ (rad per unit time)`, expr: '(-sin(th*pi/180)*vx + cos(th*pi/180)*vy)/rr', digits: 3 },
      ],
    },
    caption: t`The plane in Cartesian units. At P: $\partial_r$ (unit length) and $\tfrac14\partial_\theta$ — the full $\partial_\theta$ is $r$ long. Dashed: the pieces $V^r\partial_r$ and $V^\theta\partial_\theta$.`,
  },
  example: {
    prompt: t`At $(x, y) = (3, 4)$ — where $r = 5$, $\cos\theta = 0.6$, $\sin\theta = 0.8$ — a particle has velocity $V^\mu = (V^x, V^y) = (-2, 1)$ and $f = xy$ has gradient $\omega_\mu = (\partial_xf, \partial_yf) = (4, 3)$. Transform both to polar coordinates and check the pairing $\omega_\mu V^\mu$.`,
    visual: polarVecPic([3, 4], [-2, 1], t`P at $(3, 4)$, the polar basis there ($\partial_\theta$ drawn at a quarter of its length, 5) and the velocity split into $V^r\partial_r + V^\theta\partial_\theta$.`),
    steps: [
      { label: 'Vectors use ∂(new)/∂(old)', text: t`$\dfrac{\partial(r, \theta)}{\partial(x, y)} = \begin{pmatrix} \cos\theta & \sin\theta \\ -\sin\theta/r & \cos\theta/r \end{pmatrix} = \begin{pmatrix} 0.6 & 0.8 \\ -0.16 & 0.12 \end{pmatrix}$. So $V^r = 0.6(-2) + 0.8(1) = -0.4$ and $V^\theta = -0.16(-2) + 0.12(1) = 0.44$ per unit time (radians).` },
      { label: 'Covectors use ∂(old)/∂(new)', text: t`$\dfrac{\partial(x, y)}{\partial(r, \theta)} = \begin{pmatrix} \cos\theta & -r\sin\theta \\ \sin\theta & r\cos\theta \end{pmatrix} = \begin{pmatrix} 0.6 & -4 \\ 0.8 & 3 \end{pmatrix}$, and $\omega'_\mu = \dfrac{\partial x^\nu}{\partial x'^\mu}\omega_\nu$ sums down a column: $\omega_r = 0.6(4) + 0.8(3) = 4.8$ and $\omega_\theta = -4(4) + 3(3) = -7$.` },
      { label: 'Check by differentiating', text: t`$f = xy = \tfrac12r^2\sin2\theta$, so $\partial_rf = r\sin2\theta = 5(0.96) = 4.8$ ✓ and $\partial_\theta f = r^2\cos2\theta = 25(-0.28) = -7$ ✓.` },
      { label: 'Pairing', text: t`Cartesian: $4(-2) + 3(1) = -5$. Polar: $4.8(-0.4) + (-7)(0.44) = -1.92 - 3.08 = -5$. ✓ The rate of change of $f$ along the motion does not care about coordinates.` },
    ],
    answer: t`$V^\mu = (-0.4, 0.44)$ and $\omega_\mu = (4.8, -7)$ in $(r, \theta)$; $\omega_\mu V^\mu = -5$ in both.`,
  },
  practice: [
    num({
      id: 'vector-law', difficulty: 2,
      gen(r) {
        const [x, y, R] = r.pick(PTS), V = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
        const c = x / R, s = y / R;
        const Vr = c * V[0] + s * V[1], Vt = (-s * V[0] + c * V[1]) / R;
        const which = Math.abs(Vr) < 1e-9 ? 'theta' : Math.abs(Vt) < 1e-9 ? 'r' : r.pick(['r', 'theta']);
        const ans = which === 'r' ? Vr : Vt;
        const wrong = which === 'theta' ? -s * V[0] + c * V[1] : c * V[0] - s * V[1];
        return {
          prompt: t`At $(x, y) = (${x}, ${y})$, a vector has Cartesian components $(V^x, V^y) = (${V.join(', ')})$. Find its polar component ${which === 'r' ? '$V^r$' : t`$V^\theta$`}.`,
          visual: polarVecPic([x, y], V, t`The point, the polar basis ($\partial_\theta$ at a quarter of its length, $${R}$), and the vector.`, { split: false }),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: Math.abs(wrong - ans) > 0.01 ? [{ value: wrong, feedback: which === 'theta' ? t`That is the component along the unit vector $\hat\theta$. $V^\theta$ counts $\partial_\theta$’s, which are $r = ${R}$ long: divide by $r$.` : t`Check the Jacobian row: $\partial r/\partial x = \cos\theta$, $\partial r/\partial y = \sin\theta$.` }] : [],
          hints: [t`$V^{\mu'} = \dfrac{\partial x'^\mu}{\partial x^\nu}V^\nu$ with $r = \sqrt{x^2 + y^2}$, $\theta = \operatorname{atan2}(y, x)$.`, which === 'r' ? t`$\partial r/\partial x = x/r$ and $\partial r/\partial y = y/r$.` : t`$\partial\theta/\partial x = -y/r^2$ and $\partial\theta/\partial y = x/r^2$.`],
          teach: 'Vector components transform with the derivatives of the new coordinates with respect to the old.',
          explain: which === 'r' ? t`$V^r = \tfrac{${x}}{${R}}(${V[0]}) + \tfrac{${y}}{${R}}(${V[1]}) = ${nice(Vr)}$.` : t`$V^\theta = -\tfrac{${y}}{${R * R}}(${V[0]}) + \tfrac{${x}}{${R * R}}(${V[1]}) = ${nice(Vt, 4)}$ per unit time, in radians.`,
        };
      },
    }),
    num({
      id: 'covector-law', difficulty: 2,
      gen(r) {
        const [x, y, R] = r.pick(PTS), w = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
        const c = x / R, s = y / R;
        const wr = c * w[0] + s * w[1], wt = -y * w[0] + x * w[1];
        const which = Math.abs(wr) < 1e-9 ? 'theta' : Math.abs(wt) < 1e-9 ? 'r' : r.pick(['r', 'theta']);
        const ans = which === 'r' ? wr : wt;
        const wrong = which === 'theta' ? (-s * w[0] + c * w[1]) / R : c * w[0] + s * w[1] + 1;
        return {
          prompt: t`At $(x, y) = (${x}, ${y})$, a covector has Cartesian components $(\omega_x, \omega_y) = (${w.join(', ')})$. Find its polar component ${which === 'r' ? '$\\omega_r$' : t`$\omega_\theta$`}.`,
          visual: polarVecPic([x, y], [0.001, 0.001], t`The point and the polar basis there; $\omega_\theta = \omega(\partial_\theta)$ and $\partial_\theta$ is $r = ${R}$ long (drawn at a quarter).`, { split: false }),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: which === 'theta' && Math.abs(wrong - ans) > 0.01 ? [{ value: wrong, feedback: t`That used $\partial\theta/\partial x$ — the vector law. Covectors use $\partial x/\partial\theta = -r\sin\theta = -y$ and $\partial y/\partial\theta = x$.` }] : [],
          hints: [t`$\omega'_\mu = \dfrac{\partial x^\nu}{\partial x'^\mu}\,\omega_\nu$: differentiate the old coordinates $x = r\cos\theta$, $y = r\sin\theta$ with respect to the new.`, which === 'r' ? t`$\partial x/\partial r = \cos\theta = ${nice(c)}$, $\partial y/\partial r = \sin\theta = ${nice(s)}$.` : t`$\partial x/\partial\theta = -r\sin\theta = ${-y}$, $\partial y/\partial\theta = r\cos\theta = ${x}$.`],
          teach: 'Covector components transform with the derivatives of the old coordinates with respect to the new.',
          explain: which === 'r' ? t`$\omega_r = ${nice(c)}(${w[0]}) + ${nice(s)}(${w[1]}) = ${nice(wr)}$.` : t`$\omega_\theta = (${-y})(${w[0]}) + (${x})(${w[1]}) = ${wt}$ — per radian.`,
        };
      },
    }),
    mcq({
      id: 'grammar', difficulty: 2,
      prompt: t`Which of these is the correct transformation law for a covector, judged by index grammar alone?`,
      visual: polarVecPic([2, 1.5], [0.8, 0.9], t`A polar basis and a vector: the vector law uses $\partial x'/\partial x$, the covector law the inverse.`),
      choices: [
        t`$\omega'_\mu = \dfrac{\partial x^\nu}{\partial x'^\mu}\,\omega_\nu$`,
        t`$\omega'_\mu = \dfrac{\partial x'^\mu}{\partial x^\nu}\,\omega_\nu$`,
        t`$\omega'_\mu = \dfrac{\partial x'^\nu}{\partial x^\mu}\,\omega_\nu$`,
        t`$\omega'^\mu = \dfrac{\partial x'^\mu}{\partial x^\nu}\,\omega_\nu$`,
      ],
      answer: 0,
      why: {
        1: t`There $\mu$ is up on the right (upstairs in $\partial x'^\mu$) but down on the left, and $\nu$ is down twice: two grammar errors.`,
        2: t`Primes are on the wrong side: the right-hand side would carry an unprimed free index $\mu$.`,
        3: 'That is a vector-type law with the indices of a covector on the right: a covector’s new components carry a lower index.',
      },
      hints: [t`An index in the denominator of $\partial/\partial x^\mu$ counts as a lower index.`, t`The free index must be primed and down on both sides; $\nu$ must appear once up and once down.`],
      teach: 'An index in the denominator of a derivative counts as lower: grammar alone picks the right Jacobian.',
      explain: t`In $\dfrac{\partial x^\nu}{\partial x'^\mu}\omega_\nu$, $\mu$ is a primed lower index (in the denominator), matching $\omega'_\mu$, and $\nu$ is up once and down once. Every other choice breaks the grammar.`,
    }),
    num({
      id: 'not-reciprocal', difficulty: 2,
      gen(r) {
        const [x, y, R] = r.pick(PTS);
        const ans = x / R, wrong = R / x;
        return {
          prompt: t`At $(x, y) = (${x}, ${y})$, $\partial x/\partial r = \cos\theta = ${nice(x / R)}$. What is $\partial r/\partial x$ there?`,
          visual: polarVecPic([x, y], [0.001, 0.001], 'The point and its polar basis.', { split: false }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: wrong, feedback: t`Partial derivatives are not reciprocals of each other: $\partial x/\partial r$ holds $\theta$ fixed, $\partial r/\partial x$ holds $y$ fixed. It is the whole Jacobian matrices that are inverses.` }],
          hints: [t`$r = \sqrt{x^2 + y^2}$, so $\partial r/\partial x = x/r$.`],
          teach: 'The Jacobians are inverse matrices, but their individual entries are not reciprocals.',
          explain: t`$\partial r/\partial x = x/r = ${nice(ans)}$ — not $1/${nice(x / R)} = ${nice(wrong)}$. Here the two happen to share the value $\cos\theta$; in general only the matrix product $\dfrac{\partial(r, \theta)}{\partial(x, y)}\dfrac{\partial(x, y)}{\partial(r, \theta)}$ is guaranteed to be the identity.`,
        };
      },
    }),
    num({
      id: 'linear', difficulty: 2,
      gen(r) {
        const [a, b, c, d] = r.pick([[2, 1, 1, -1], [1, 2, 3, 1], [1, -1, 1, 1]]);
        const V = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])], w = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
        const det = a * d - b * c;
        const Vn = [a * V[0] + b * V[1], c * V[0] + d * V[1]];
        const wn = [(d * w[0] - c * w[1]) / det, (-b * w[0] + a * w[1]) / det];
        const kind = r.pick(['V', 'w']), which = r.pick([0, 1]);
        const ans = kind === 'V' ? Vn[which] : wn[which];
        const names = ['u', 'v'];
        return {
          prompt: t`New coordinates are $u = ${a}x + ${b}y$, $v = ${c}x ${d < 0 ? '-' : '+'} ${Math.abs(d)}y$. ${kind === 'V' ? t`A vector has $(V^x, V^y) = (${V.join(', ')})$. Find $V^${names[which]}$.` : t`A covector has $(\omega_x, \omega_y) = (${w.join(', ')})$. Find $\omega_${names[which]}$.`}`,
          visual: {
            type: 'graph',
            params: { x: [-3.5, 3.5], y: [-2.6, 2.6], equal: true, aspect: 'wide', xticks: 7, yticks: 5, curves: [...[-6, -4, -2, 0, 2, 4, 6].map((k) => ({ param: [`${r6((k * a) / (a * a + b * b))} - ${r6(b)}*t`, `${r6((k * b) / (a * a + b * b))} + ${r6(a)}*t`], t: [-8, 8], color: 'accent', width: 1 })), ...[-6, -4, -2, 0, 2, 4, 6].map((k) => ({ param: [`${r6((k * c) / (c * c + d * d))} - ${r6(d)}*t`, `${r6((k * d) / (c * c + d * d))} + ${r6(c)}*t`], t: [-8, 8], color: 'violet', width: 1 }))] },
            caption: t`Lines of constant $u$ (blue) and $v$ (violet), every 2 units: a linear change of coordinates has the same Jacobian everywhere.`,
          },
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: kind === 'w' ? [{ value: [a * w[0] + c * w[1], b * w[0] + d * w[1]][which], feedback: t`That multiplies by $\partial(u, v)/\partial(x, y)$ (transposed). Covectors need $\partial x^\nu/\partial u^\mu$: invert the matrix first.` }].filter((e) => Math.abs(e.value - ans) > 0.01) : [{ value: [(d * V[0] - b * V[1]) / det, (-c * V[0] + a * V[1]) / det][which], feedback: t`That uses the inverse. Vectors transform with $\partial u^\mu/\partial x^\nu$ itself — just like $du = ${a}\,dx + ${b}\,dy$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: kind === 'V' ? [t`$V^u = \dfrac{\partial u}{\partial x}V^x + \dfrac{\partial u}{\partial y}V^y$, and the same for $v$.`, t`$\partial(u, v)/\partial(x, y) = \begin{pmatrix} ${a} & ${b} \\ ${c} & ${d} \end{pmatrix}$.`] : [t`Covectors need $\partial(x, y)/\partial(u, v)$: the inverse of $\begin{pmatrix} ${a} & ${b} \\ ${c} & ${d} \end{pmatrix}$.`, t`$\omega_u = \dfrac{\partial x}{\partial u}\omega_x + \dfrac{\partial y}{\partial u}\omega_y$, with $\dfrac{\partial(x, y)}{\partial(u, v)} = \dfrac{1}{${det}}\begin{pmatrix} ${d} & ${-b} \\ ${-c} & ${a} \end{pmatrix}$.`],
          teach: 'For linear coordinates the Jacobians are constant matrices; vectors use one, covectors the other.',
          explain: kind === 'V' ? t`$V^${names[which]} = ${which === 0 ? `${a}(${V[0]}) + ${b}(${V[1]})` : `${c}(${V[0]}) + (${d})(${V[1]})`} = ${Vn[which]}$.` : t`$\dfrac{\partial(x, y)}{\partial(u, v)} = \dfrac{1}{${det}}\begin{pmatrix} ${d} & ${-b} \\ ${-c} & ${a} \end{pmatrix}$; summing down column ${which + 1}: $\omega_${names[which]} = ${nice(wn[which])}$.`,
        };
      },
    }),
    code({
      id: 'sympy-jacobian', difficulty: 3,
      prompt: t`With SymPy, build the Jacobian \`J\` $= \partial(x, y)/\partial(r, \theta)$ for $x = r\cos\theta$, $y = r\sin\theta$, and its inverse \`Jinv\` $= \partial(r, \theta)/\partial(x, y)$ (simplified). Then transform the Cartesian vector field $V^\mu = (-y, x)$ — a rigid rotation — to polar components \`Vpolar\`, as functions of $r$ and $\theta$.`,
      visual: polarVecPic([2, 1.5], [-1.5, 2], t`The rotation field at one point: $(-y, x)$ is perpendicular to the radius and $r$ long — exactly $\partial_\theta$.`, { split: false }),
      starter: t`import sympy as sp
r, th = sp.symbols('r theta', positive=True)
x = r * sp.cos(th)
y = r * sp.sin(th)

J = None        # d(x, y)/d(r, theta): use sp.Matrix([x, y]).jacobian([r, th])
Jinv = None     # its inverse, simplified
Vpolar = None   # Jinv times the Cartesian components (-y, x), simplified
print(J, Jinv, Vpolar)
`,
      answer: t`import sympy as sp
r, th = sp.symbols('r theta', positive=True)
x = r * sp.cos(th)
y = r * sp.sin(th)

J = sp.Matrix([x, y]).jacobian([r, th])
Jinv = sp.simplify(J.inv())
Vpolar = sp.simplify(Jinv * sp.Matrix([-y, x]))
print(J, Jinv, Vpolar)`,
      tests: [
        { name: t`\`J\` is $\begin{pmatrix} \cos\theta & -r\sin\theta \\ \sin\theta & r\cos\theta \end{pmatrix}$`, code: 'J is not None and sp.simplify(J - sp.Matrix([[sp.cos(th), -r*sp.sin(th)], [sp.sin(th), r*sp.cos(th)]])) == sp.zeros(2, 2)' },
        { name: t`\`Jinv\` is $\begin{pmatrix} \cos\theta & \sin\theta \\ -\sin\theta/r & \cos\theta/r \end{pmatrix}$`, code: 'Jinv is not None and sp.simplify(Jinv - sp.Matrix([[sp.cos(th), sp.sin(th)], [-sp.sin(th)/r, sp.cos(th)/r]])) == sp.zeros(2, 2)' },
        { name: t`\`J * Jinv\` is the identity (the two Jacobians are inverses)`, code: 'J is not None and Jinv is not None and sp.simplify(J * Jinv) == sp.eye(2)' },
        { name: t`the rotation field has polar components $(0, 1)$: it is $\partial_\theta$`, code: 'Vpolar is not None and sp.simplify(Vpolar - sp.Matrix([0, 1])) == sp.zeros(2, 1)' },
      ],
      hints: [t`\`sp.Matrix([x, y]).jacobian([r, th])\` gives $\partial(x, y)/\partial(r, \theta)$.`, t`\`Jinv = sp.simplify(J.inv())\`; vector components go with $\partial(\text{new})/\partial(\text{old})$, so \`Vpolar = sp.simplify(Jinv * sp.Matrix([-y, x]))\`.`],
      teach: 'A computer algebra system turns the transformation laws into two matrix operations: a Jacobian and its inverse.',
      explain: t`$J^{-1}(-y, x)^\mathsf{T} = (\cos\theta(-r\sin\theta) + \sin\theta(r\cos\theta),\ \tfrac{\sin^2\theta + \cos^2\theta}{1}) = (0, 1)$: the rotation field is exactly the basis vector $\partial_\theta$, with constant polar components even though its Cartesian ones vary.`,
    }),
    mcq({
      id: 'wrong-law', difficulty: 3, kind: 'error',
      prompt: t`A student transforms the gradient of $f = x$ (Cartesian components $(1, 0)$) to polar coordinates at $(x, y) = (3, 4)$ using $\partial(r, \theta)/\partial(x, y)$ — the vector law — and gets $\omega_\theta = \partial\theta/\partial x = -0.16$. Directly, $\partial(r\cos\theta)/\partial\theta = -r\sin\theta = -4$. What went wrong?`,
      visual: polarVecPic([3, 4], [0.001, 0.001], t`At $(3, 4)$: $\partial_\theta$ is 5 long, so $f = x$ changes by $-4$ per radian of $\theta$.`, { split: false }),
      choices: [
        t`A gradient is a covector: it needs $\partial x^\nu/\partial x'^\mu$, giving $\omega_\theta = \partial x/\partial\theta = -4$`,
        t`Nothing: $-0.16$ and $-4$ are the same component in different units`,
        t`They should have used the transpose of $\partial(r, \theta)/\partial(x, y)$`,
        t`The direct calculation is wrong: $\partial x/\partial\theta = 0$`,
      ],
      answer: 0,
      why: {
        1: t`Both are “per radian”; they differ by the factor $r^2 = 25$, which is the error.`,
        2: t`Transposing does not invert: you need the other Jacobian, $\partial(x, y)/\partial(r, \theta)$.`,
        3: t`$x = r\cos\theta$ does change with $\theta$ at fixed $r$.`,
      },
      hints: ['Is the gradient a vector or a covector?', t`Check the grammar: $\omega'_\mu = \dfrac{\partial x^\nu}{\partial x'^\mu}\omega_\nu$.`],
      teach: t`Gradients transform with $\partial(\text{old})/\partial(\text{new})$; using the vector Jacobian gives answers off by factors such as $r^2$.`,
      explain: t`$\omega_\theta = \dfrac{\partial x}{\partial\theta}\omega_x + \dfrac{\partial y}{\partial\theta}\omega_y = (-4)(1) + (3)(0) = -4$. The student’s $-0.16 = -y/r^2$ is a component of the vector law, off by $r^2$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-vtheta', difficulty: 2,
      gen(r) {
        const [x, y, R] = r.pick(PTS), V = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
        let Vt = (-y * V[0] + x * V[1]) / (R * R);
        if (Math.abs(Vt) < 1e-9) { V[1] += 1; Vt = (-y * V[0] + x * V[1]) / (R * R); }
        return {
          prompt: t`At $(x, y) = (${x}, ${y})$, find $V^\theta$ for $(V^x, V^y) = (${V.join(', ')})$.`,
          visual: polarVecPic([x, y], V, 'The point, its polar basis and the vector.', { split: false }),
          answer: Vt, tol: { rel: 0.005, abs: 0.002 },
          hints: [t`$V^\theta = \dfrac{\partial\theta}{\partial x}V^x + \dfrac{\partial\theta}{\partial y}V^y$ with $\partial\theta/\partial x = -y/r^2$, $\partial\theta/\partial y = x/r^2$.`],
          teach: t`Vector components transform with $\partial(\text{new})/\partial(\text{old})$.`,
          explain: t`$V^\theta = \dfrac{-(${y})(${V[0]}) + (${x})(${V[1]})}{${R * R}} = ${nice(Vt, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-mars', difficulty: 3, transfer: true,
      gen(r) {
        const [x, y] = r.pick([[-3000, 4000], [5000, -1200], [2400, 3200], [-4500, -2000]]), V = r.pick([[2.1, 3.2], [-1.4, 2.6], [3.0, -0.8]]);
        const R = Math.hypot(x, y);
        const which = r.pick(['rdot', 'thdot']);
        const rdot = (x * V[0] + y * V[1]) / R, thdot = (x * V[1] - y * V[0]) / (R * R);
        const ans = which === 'rdot' ? rdot : thdot;
        return {
          prompt: t`A Mars orbiter, in Mars-centred axes, is at $(x, y) = (${x}, ${y})$ km with velocity $(V^x, V^y) = (${V.join(', ')})$ km/s. In polar coordinates centred on Mars, find ${which === 'rdot' ? t`its radial velocity $V^r = dr/dt$, in km/s` : t`its angular rate $V^\theta = d\theta/dt$, in rad/s`}.`,
          visual: { ...polarVecPic([x / 1000, y / 1000], [V[0] * 0.6, V[1] * 0.6], t`Positions in thousands of km, the velocity drawn at 0.6 thousand km per km/s, and the polar basis at the orbiter ($\partial_\theta$ at a quarter of its length).`, { split: true }) },
          answer: ans, units: which === 'rdot' ? 'km/s' : 'rad/s', tol: { rel: 0.005 },
          errors: which === 'thdot' ? [{ value: thdot * R, feedback: t`That is the speed around Mars, $r\dot\theta$, in km/s. The coordinate component $V^\theta$ is an angular rate: divide by $r$ again.` }] : [{ value: Math.hypot(...V), feedback: 'That is the speed. Only the part of the velocity along the radius changes r.' }],
          hints: [t`$r = ${nice(R, 5)}$ km. Use $V^r = (xV^x + yV^y)/r$ and $V^\theta = (xV^y - yV^x)/r^2$ — the rows of $\partial(r, \theta)/\partial(x, y)$.`, which === 'rdot' ? t`$V^r = \dfrac{(${x})(${V[0]}) + (${y})(${V[1]})}{${nice(R, 5)}}$.` : t`$V^\theta = \dfrac{(${x})(${V[1]}) - (${y})(${V[0]})}{${nice(R, 5)}^2}$.`],
          teach: 'Converting a spacecraft’s Cartesian velocity to radial and angular rates is the vector transformation law.',
          explain: which === 'rdot' ? t`$V^r = ${nice(rdot, 4)}$ km/s (${rdot > 0 ? 'climbing away from' : 'falling toward'} Mars).` : t`$V^\theta = ${tex(thdot, 4)}$ rad/s, i.e. a speed of $r\,V^\theta = ${nice(thdot * R, 4)}$ km/s around Mars.`,
        };
      },
    }),
    mcq({
      id: 'cp-columns', difficulty: 2,
      prompt: t`What are the columns of $\dfrac{\partial(x, y)}{\partial(r, \theta)} = \begin{pmatrix} \cos\theta & -r\sin\theta \\ \sin\theta & r\cos\theta \end{pmatrix}$?`,
      visual: polarVecPic([2.4, 1.4], [0.001, 0.001], t`The polar basis vectors at a point (with $\partial_\theta$ drawn at a quarter of its length).`, { split: false }),
      choices: [
        t`The new basis vectors $\partial_r$ and $\partial_\theta$, written in Cartesian components`,
        t`The covectors $dr$ and $d\theta$`,
        t`The unit vectors $\hat r$ and $\hat\theta$`,
        'The polar coordinates of two points',
      ],
      answer: 0,
      why: {
        1: t`$dr$ and $d\theta$ are the rows of the other Jacobian, $\partial(r, \theta)/\partial(x, y)$.`,
        2: t`The second column has length $r$: it is $\partial_\theta$, not the unit vector $\hat\theta = \partial_\theta/r$.`,
        3: 'They are vectors at one point, not positions.',
      },
      hints: [t`Column 2 is $(\partial x/\partial\theta, \partial y/\partial\theta)$: how the point moves when $\theta$ alone changes.`],
      teach: t`The columns of $\partial(\text{old})/\partial(\text{new})$ are the new coordinate basis vectors in old components.`,
      explain: t`Column $\mu$ is $\partial x^\nu/\partial x'^\mu$: the velocity of the point when only $x'^\mu$ changes — the basis vector $\partial'_\mu$. So $\partial_r = (\cos\theta, \sin\theta)$ and $\partial_\theta = (-r\sin\theta, r\cos\theta)$, which the next lesson studies.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 2 (transformation of vectors and dual vectors under a change of coordinates)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §5.2', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'SymPy documentation: Matrix.jacobian', url: 'https://docs.sympy.org/latest/modules/matrices/matrices.html' },
  ],
});
