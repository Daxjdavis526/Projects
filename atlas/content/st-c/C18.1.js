// The Lie derivative: how a tensor changes when dragged along the flow of a
// vector field. On functions it is X(f); on vector fields the bracket [X, Y],
// seen as the gap ε²[X, Y] between "flow along X then Y" and "Y then X";
// on 1-forms and the metric by the formula (or Cartan's identity). No
// connection is needed — the opposite trade from ∇. Explore: the gap
// quadrilateral for a rotation against a translation, a dilation (which
// commutes), a shear and another translation. Practice: brackets of linear
// fields, the polar orthonormal frame, L_X g on the sphere, coordinate
// fields commute, spacecraft attitude manoeuvres.
import { lesson, mcq, multi, num, expr, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { quiver, r4 } from './_curv.js';

const t = String.raw;
const DEG = Math.PI / 180;

// flows in closed form, as expression strings: X is the rotation (−y, x); Y is chosen by k
const rot = (x, y, s) => [`(${x})*cos(${s}) - (${y})*sin(${s})`, `(${x})*sin(${s}) + (${y})*cos(${s})`];
const flowY = (k, x, y, s) => [
  null,
  [`(${x}) + (${s})`, `(${y})`],
  [`(${x})*exp(${s})`, `(${y})*exp(${s})`],
  [`(${x}) + (${s})*(${y})`, `(${y})`],
  [`(${x})`, `(${y}) + (${s})`],
][k];
const Y_NAMES = [null, 'translation ∂ₓ', 'dilation x∂ₓ + y∂ᵧ', 'shear y∂ₓ', 'translation ∂ᵧ'];
const BRACKET = [null, ['0', '-1'], ['0', '0'], ['px', '-py'], ['1', '0']];    // [X, Y] at p
const Yfield = [null, [() => 1, () => 0], [(x) => x, (x, y) => y], [(x, y) => y, () => 0], [() => 0, () => 1]];

function gapScene() {
  const W = (k) => ({ when: `step(0.5 - abs(n - ${k}))` });
  const curves = [{ param: rot('px', 'py', 'h*t'), t: [0, 1], color: 'accent', width: 2.4 }];
  const pts = [];
  const arrows = quiver((x, y) => -y, (x) => x, [-2, -1, 0, 1, 2], [-1, 0, 1], 0.22, 'ink4', 1);
  const readX = [], readY = [];
  for (let k = 1; k <= 4; k++) {
    const p1 = rot('px', 'py', 'h'), q1 = flowY(k, 'px', 'py', 'h');
    const p2 = flowY(k, p1[0], p1[1], 'h'), q2 = rot(q1[0], q1[1], 'h');
    curves.push({ param: flowY(k, p1[0], p1[1], 'h*t'), t: [0, 1], color: 'accent', width: 2.4, ...W(k) });
    curves.push({ param: flowY(k, 'px', 'py', 'h*t'), t: [0, 1], color: 'violet', width: 2.4, ...W(k) });
    curves.push({ param: rot(q1[0], q1[1], 'h*t'), t: [0, 1], color: 'violet', width: 2.4, ...W(k) });
    pts.push({ x: p2[0], y: p2[1], r: 4, color: 'accent', label: 'X then Y', labelDx: 8, labelDy: -10, ...W(k) });
    pts.push({ x: q2[0], y: q2[1], r: 4, color: 'violet', label: 'Y then X', labelDx: 8, labelDy: 14, ...W(k) });
    arrows.push({ from: q2, to: p2, color: 'warn', width: 2.2, ...W(k) });
    arrows.push(...quiver(Yfield[k][0], Yfield[k][1], [-2, -1, 0, 1, 2], [-1, 0, 1], 0.22, 'violet', 1).map((a) => ({ ...a, ...W(k) })));
    readX.push(`step(0.5 - abs(n - ${k}))*((${p2[0]}) - (${q2[0]}))`);
    readY.push(`step(0.5 - abs(n - ${k}))*((${p2[1]}) - (${q2[1]}))`);
  }
  const brX = [1, 2, 3, 4].map((k) => `step(0.5 - abs(n - ${k}))*(${BRACKET[k][0]})`).join(' + ');
  const brY = [1, 2, 3, 4].map((k) => `step(0.5 - abs(n - ${k}))*(${BRACKET[k][1]})`).join(' + ');
  return {
    x: [-2.6, 2.6], y: [-1.7, 1.7], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y',
    sliders: [{ key: 'h', label: 'flow time $\\varepsilon$', min: 0.05, max: 0.8, step: 0.01, value: 0.5, explain: 'How long to follow each flow. The gap shrinks as ε².' }],
    choices: [{ key: 'n', label: 'Second field $Y$', options: [1, 2, 3, 4].map((k) => [k, Y_NAMES[k]]), value: 1, explain: 'X is always the rotation −y∂ₓ + x∂ᵧ.' }],
    drag: [{ key: 'p', x: 0.9, y: -0.6 }],
    curves, points: pts, arrows,
    readouts: [
      { label: t`gap$/\varepsilon^2$, $x$ part`, expr: `(${readX.join(' + ')})/h^2`, digits: 3, zero: 1e-9 },
      { label: t`gap$/\varepsilon^2$, $y$ part`, expr: `(${readY.join(' + ')})/h^2`, digits: 3, zero: 1e-9 },
      { label: t`$[X, Y]$ at $p$, $x$ part`, expr: `(${brX})`, digits: 3, zero: 1e-9 },
      { label: t`$[X, Y]$ at $p$, $y$ part`, expr: `(${brY})`, digits: 3, zero: 1e-9 },
    ],
  };
}

export default lesson({
  id: 'st-c.C18.1',
  title: 'The Lie derivative',
  minutes: 15, difficulty: 3,
  equation: t`\mathcal L_XY = [X, Y],\qquad [X, Y]^\mu = X^\nu\partial_\nu Y^\mu - Y^\nu\partial_\nu X^\mu`,
  intro: t`A vector field $X$ defines a **flow**: slide every point along $X$’s integral curves for a time $\varepsilon$. Drag any tensor along with the flow and compare it with the tensor already sitting where it lands; the rate of change is the **Lie derivative** $\mathcal L_X$. On a function it is just $X(f) = X^\mu\partial_\mu f$. On a vector field it is the **bracket** above, which has a picture: follow $X$ for $\varepsilon$, then $Y$ for $\varepsilon$, and compare with $Y$ first, then $X$ — the two ends miss by $\varepsilon^2[X, Y]$. On a 1-form and on the metric,
$$(\mathcal L_X\omega)_\mu = X^\nu\partial_\nu\omega_\mu + \omega_\nu\partial_\mu X^\nu,\qquad (\mathcal L_Xg)_{\mu\nu} = X^\lambda\partial_\lambda g_{\mu\nu} + g_{\lambda\nu}\partial_\mu X^\lambda + g_{\mu\lambda}\partial_\nu X^\lambda.$$
No Christoffel symbols appear: the flow itself says how to carry things, so the Lie derivative needs **no connection** — but it needs $X$ near the point, not just at it, the opposite trade from $\nabla_X$.`,
  symbols: [
    { tex: t`\mathcal L_X`, text: t`the Lie derivative along the vector field $X$: the rate of change of a tensor dragged along $X$’s flow` },
    { tex: t`[X, Y]`, text: t`the Lie bracket (commutator) of two vector fields, itself a vector field: $[X, Y]f = X(Yf) - Y(Xf)$` },
    { tex: t`X^\nu\partial_\nu Y^\mu`, text: t`how $Y$’s components change along $X$ (an ordinary directional derivative)` },
    { tex: t`\omega_\mu`, text: 'the components of a 1-form (covector)' },
    { tex: t`\varepsilon`, text: 'the flow time (parameter distance) along each field' },
  ],
  why: t`Symmetry in general relativity is a statement about Lie derivatives: a spacetime is symmetric under the flow of $\xi$ when $\mathcal L_\xi g = 0$ (Killing vectors, C18.2), and the gauge freedom of linearized gravity is $h_{\mu\nu} \to h_{\mu\nu} + \mathcal L_\xi\eta_{\mu\nu}$ (gr.S28.d).`,
  visual: {
    type: 'graph',
    title: 'Two flows, two orders',
    lead: t`$X$ is the rotation $-y\,\partial_x + x\,\partial_y$ (grey arrows); $Y$ is chosen below (violet arrows). From the point $p$, the blue path flows along $X$ for $\varepsilon$ and then along $Y$; the violet path does it in the other order. The orange arrow is the gap. Drag $p$ and shrink $\varepsilon$.`,
    tasks: [
      t`Rotation then translation $\partial_x$: the gap points straight down, and gap$/\varepsilon^2 \to (0, -1)$ as $\varepsilon \to 0$: $[X, \partial_x] = -\partial_y$, the same at every point.`,
      t`Choose the dilation: the two paths meet exactly. Rotations and scalings commute, $[X, Y] = 0$.`,
      t`Choose the shear $y\,\partial_x$ and drag $p$ around: the gap changes with position, $[X, Y] = x\,\partial_x - y\,\partial_y$.`,
    ],
    params: gapScene(),
    caption: t`Flows drawn exactly (rotations, translations, the dilation $e^{\varepsilon}$ and the shear in closed form). The gap is computed from the two end points; it matches $\varepsilon^2[X, Y]$ up to terms of order $\varepsilon^3$.`,
  },
  example: {
    prompt: t`Compute $[X, Y]$ for the rotation $X = -y\,\partial_x + x\,\partial_y$ and the shear $Y = y\,\partial_x$, and check it against the gap picture.`,
    visual: { type: 'graph', params: { ...gapScene(), choices: [{ key: 'n', label: 'Second field $Y$', options: [[3, Y_NAMES[3]]], value: 3, explain: 'The shear y∂ₓ.' }], sliders: [{ key: 'h', label: 'flow time $\\varepsilon$', min: 0.05, max: 0.8, step: 0.01, value: 0.4, explain: 'How long to follow each flow.' }] }, caption: 'The rotation and the shear: the gap after ε = 0.4 along each, in both orders.' },
    steps: [
      { label: 'Components', text: t`$X^x = -y$, $X^y = x$; $Y^x = y$, $Y^y = 0$.` },
      { label: 'X acting on Y', text: t`$X^\nu\partial_\nu Y^x = X^y\,\partial_yY^x = x\cdot1 = x$; $X^\nu\partial_\nu Y^y = 0$.` },
      { label: 'Y acting on X', text: t`$Y^\nu\partial_\nu X^x = Y^x\,\partial_xX^x = y\cdot0 = 0$; $Y^\nu\partial_\nu X^y = Y^x\,\partial_xX^y = y\cdot1 = y$.` },
      { label: 'Subtract', text: t`$[X, Y] = (x - 0)\,\partial_x + (0 - y)\,\partial_y = x\,\partial_x - y\,\partial_y$.` },
      { label: 'Picture check', text: t`At $p = (0.9, -0.6)$, $[X, Y] = (0.9, 0.6)$: for $\varepsilon = 0.4$ the gap should be about $0.16\times(0.9, 0.6) = (0.14, 0.10)$ — up and to the right, as the orange arrow shows (the readout gives the exact gap over $\varepsilon^2$).` },
    ],
    answer: t`$[X, Y] = x\,\partial_x - y\,\partial_y$.`,
  },
  practice: [
    expr({
      id: 'bracket', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-3, 3, [0]), b = r.intExcept(-3, 3, [0, a]);
        const ab = a * b;
        return {
          prompt: t`Let $X = ${a === 1 ? '' : a === -1 ? '-' : a}x\,\partial_y$ and $Y = ${b === 1 ? '' : b === -1 ? '-' : b}y\,\partial_x$. Find the $x$-component of $[X, Y]$.`,
          visual: { type: 'graph', params: { x: [-2.5, 2.5], y: [-1.6, 1.6], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y', arrows: [...quiver(() => 0, (x) => a * x, [-2, -1, 0, 1, 2], [-1, 0, 1], 0.12, 'accent', 1.4), ...quiver((x, y) => b * y, () => 0, [-1.5, -0.5, 0.5, 1.5], [-1.2, -0.4, 0.4, 1.2], 0.12, 'violet', 1.4)] }, caption: 'X (blue) and Y (violet), lengths scaled down.' },
          answer: `${ab}*x`, answerTeX: t`${ab}x`,
          vars: { x: [-2, 2], y: [-2, 2] },
          errors: [{ answer: `${-ab}*x`, feedback: t`Order matters: $[X, Y]^\mu = X^\nu\partial_\nu Y^\mu - Y^\nu\partial_\nu X^\mu$, $X$ first.` }, { answer: `${-ab}*y`, feedback: t`That is the $y$-component. The $x$-component is $X^\nu\partial_\nu Y^x - Y^\nu\partial_\nu X^x$.` }],
          hints: [t`$[X, Y]^x = X^\nu\partial_\nu Y^x - Y^\nu\partial_\nu X^x$, and $X^x = 0$.`],
          teach: 'The bracket is X differentiating Y’s components minus Y differentiating X’s.',
          explain: t`$X^y\,\partial_y(${b}y) = ${a}x\cdot${b} = ${ab}x$, and $X^x = 0$, so $[X, Y]^x = ${ab}x$. The full bracket is $${ab}(x\,\partial_x - y\,\partial_y)$: a squeeze-and-stretch field, though neither $X$ nor $Y$ is one.`,
        };
      },
    }),
    num({
      id: 'polar-frame', difficulty: 3,
      gen(r) {
        const r0 = r.pick([0.5, 1.5, 2, 2.5, 4]);
        const key = -1 / (r0 * r0);
        return {
          prompt: t`On the plane in polar coordinates, the coordinate fields commute, $[\partial_r, \partial_\theta] = 0$. The *unit* vectors are $\hat e_r = \partial_r$ and $\hat e_\theta = \tfrac1r\partial_\theta$. Their bracket is $[\hat e_r, \hat e_\theta] = c\,\partial_\theta$. Find $c$ at $r = ${r0}$.`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-2, 2], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y', curves: [1, 2].map((k) => ({ param: [`${k}*cos(t)`, `${k}*sin(t)`], t: [0, 2 * Math.PI], color: 'ink4', width: 1 })), arrows: [0.5, 1.6, 2.7].flatMap((th) => [1, 2].flatMap((rr) => [{ from: [r4(rr * Math.cos(th)), r4(rr * Math.sin(th))], to: [r4((rr + 0.4) * Math.cos(th)), r4((rr + 0.4) * Math.sin(th))], color: 'accent', width: 1.8 }, { from: [r4(rr * Math.cos(th)), r4(rr * Math.sin(th))], to: [r4(rr * Math.cos(th) - 0.4 * Math.sin(th)), r4(rr * Math.sin(th) + 0.4 * Math.cos(th))], color: 'violet', width: 1.8 }])) }, caption: 'The unit vectors ê_r (blue) and ê_θ (violet) at a few points: the same length everywhere, while the coordinate field ∂_θ grows with r.' },
          answer: key, tol: { rel: 0.005 },
          errors: [
            { value: 1 / (r0 * r0), feedback: t`Sign: $\hat e_r$ differentiating $\tfrac1r$ gives $-\tfrac1{r^2}$.` },
            { value: 0, feedback: t`Only coordinate fields always commute. $\hat e_\theta$ has a component, $1/r$, that changes along $\hat e_r$.` },
            { value: -1 / r0, feedback: t`$\partial_r(1/r) = -1/r^2$, not $-1/r$.` },
          ].filter((e) => Math.abs(e.value - key) > 0.02 * Math.abs(key)),
          hints: [t`In $(r, \theta)$ components, $\hat e_r = (1, 0)$ and $\hat e_\theta = (0, 1/r)$.`, t`$[\hat e_r, \hat e_\theta]^\theta = \hat e_r^{\,r}\,\partial_r(1/r) - \hat e_\theta^{\,\theta}\,\partial_\theta(0)$.`],
          teach: 'Coordinate basis fields always commute; an orthonormal frame generally does not, so it cannot be the coordinate basis of any chart.',
          explain: t`$c = \partial_r(1/r) = -1/r^2 = ${nice(key, 4)}$ at $r = ${r0}$. A non-zero bracket is the test: no chart has $\hat e_r$ and $\hat e_\theta$ as its coordinate fields, because walking $\varepsilon$ along $\hat e_r$ then $\hat e_\theta$ does not land where the other order does.`,
        };
      },
    }),
    mcq({
      id: 'lie-vs-cov', difficulty: 2,
      prompt: t`You know a vector field $Y$ near a point $p$, but the vector $X$ only **at** $p$. Which derivative of $Y$ along $X$ can you compute there?`,
      visual: { type: 'graph', params: { x: [-2.5, 2.5], y: [-1.6, 1.6], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', arrows: [...quiver((x, y) => y, () => 0.4, [-2, -1, 0, 1, 2], [-1, 0, 1], 0.3, 'violet', 1.4), { from: [0, 0], to: [0.8, 0.5], color: 'warn', width: 2.6, label: 'X at p' }], points: [{ x: 0, y: 0, label: 'p', r: 5, color: 'ink', labelDx: -14 }] }, caption: 'A field Y (violet) known everywhere, and a single vector X at p.' },
      choices: [t`$\nabla_XY$, given a connection`, t`$\mathcal L_XY$, with no connection needed`, 'Both', 'Neither'],
      answer: 0,
      why: {
        1: t`$\mathcal L_XY = [X, Y]$ contains $Y^\nu\partial_\nu X^\mu$: it needs how $X$ changes, so $X$ must be known near $p$.`,
        2: t`Only $\nabla$ works with $X$ at one point; it pays for that with a connection.`,
        3: t`$\nabla_XY = X^\mu\nabla_\mu Y$ needs only $X$ at $p$, once a connection is chosen.`,
      },
      hints: [t`Look for derivatives of $X$ in each formula.`],
      teach: 'The covariant derivative needs a connection but only X at the point; the Lie derivative needs no connection but X in a neighbourhood.',
      explain: t`$\nabla_XY = X^\mu(\partial_\mu Y^\nu + \Gamma^\nu{}_{\mu\lambda}Y^\lambda)\partial_\nu$ is linear in $X$ at $p$. $\mathcal L_XY$ drags $Y$ along $X$’s flow, which depends on $X$ around $p$. With the Levi-Civita (torsion-free) connection the two are related by $[X, Y] = \nabla_XY - \nabla_YX$.`,
    }),
    order({
      id: 'gap', difficulty: 3,
      prompt: t`Show that flowing along $X$ then $Y$ (each for $\varepsilon$) lands $\varepsilon^2[X, Y]$ away from $Y$ then $X$. Order the Taylor-expansion argument.`,
      visual: { type: 'graph', params: { ...gapScene(), drag: [{ key: 'p', x: 0.9, y: -0.6 }] }, caption: 'The two orders of flowing, for the rotation and a second field you can choose.' },
      items: [
        t`Along $X$ for $\varepsilon$: $x^\mu \to x^\mu + \varepsilon X^\mu + \tfrac12\varepsilon^2X^\nu\partial_\nu X^\mu + O(\varepsilon^3)$.`,
        t`Then along $Y$, evaluated at the new point: add $\varepsilon Y^\mu + \varepsilon^2X^\nu\partial_\nu Y^\mu + \tfrac12\varepsilon^2Y^\nu\partial_\nu Y^\mu$.`,
        t`The other order gives the same terms with $X$ and $Y$ exchanged, so only the cross terms differ: $\varepsilon^2X^\nu\partial_\nu Y^\mu$ against $\varepsilon^2Y^\nu\partial_\nu X^\mu$.`,
        t`The difference of the end points is $\varepsilon^2\big(X^\nu\partial_\nu Y^\mu - Y^\nu\partial_\nu X^\mu\big) = \varepsilon^2[X, Y]^\mu$.`,
      ],
      hints: ['Expand each flow to second order in ε.', 'Which terms survive when you subtract the two orders?'],
      teach: 'The bracket is the second-order mismatch between flowing along two fields in the two orders.',
      explain: t`This is why $[X, Y] = 0$ is the condition for $X$ and $Y$ to be coordinate fields of some chart: the quadrilateral closes, so "go $a$ along $X$ and $b$ along $Y$" names one point whatever the order.`,
    }),
    num({
      id: 'lie-metric', difficulty: 3,
      gen(r) {
        const th = r.pick([20, 35, 60, 70, 110]);
        const key = Math.sin(2 * th * DEG);
        return {
          prompt: t`On the unit sphere, $g = d\theta^2 + \sin^2\theta\,d\varphi^2$. Take the field $X = \partial_\theta$, whose flow slides points down the meridians. Using $(\mathcal L_Xg)_{\mu\nu} = X^\lambda\partial_\lambda g_{\mu\nu} + g_{\lambda\nu}\partial_\mu X^\lambda + g_{\mu\lambda}\partial_\nu X^\lambda$, find $(\mathcal L_Xg)_{\varphi\varphi}$ at $\theta = ${th}^\circ$.`,
          visual: { type: 'calc-vectors3d', params: { range: 1.4, spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink4' }], curves: [0, 1, 2, 3, 4, 5].map((k) => ({ param: [`sin(t)*${Math.cos((k * Math.PI) / 3).toFixed(4)}`, `sin(t)*${Math.sin((k * Math.PI) / 3).toFixed(4)}`, 'cos(t)'], t: [0, Math.PI], color: 'accent' })).concat([{ param: [`${Math.sin(th * DEG).toFixed(4)}*cos(t)`, `${Math.sin(th * DEG).toFixed(4)}*sin(t)`, `${Math.cos(th * DEG).toFixed(4)}`], t: [0, 2 * Math.PI], color: 'gold' }]) }, caption: t`The flow lines of $\partial_\theta$ (meridians, blue) and the circle at colatitude ${th}° (gold).` },
          answer: key, tol: { rel: 0, abs: 0.005 },
          errors: [
            { value: 0, feedback: t`The last two terms vanish ($X$ has constant components), but the first does not: $g_{\varphi\varphi} = \sin^2\theta$ changes along $\partial_\theta$.` },
            { value: Math.sin(th * DEG) * Math.cos(th * DEG), feedback: t`$\partial_\theta(\sin^2\theta) = 2\sin\theta\cos\theta$: keep the 2.` },
          ].filter((e) => Math.abs(e.value - key) > 0.02),
          hints: [t`$X^\lambda = (1, 0)$ is constant, so $\partial_\mu X^\lambda = 0$.`, t`$(\mathcal L_Xg)_{\varphi\varphi} = \partial_\theta\sin^2\theta$.`],
          teach: t`If $\mathcal L_Xg \ne 0$ the flow of $X$ changes distances: here sliding along meridians stretches or shrinks the circles of latitude.`,
          explain: t`$(\mathcal L_Xg)_{\varphi\varphi} = \partial_\theta(\sin^2\theta) = \sin 2\theta = ${nice(key, 4)}$ at $${th}^\circ$. ${th < 90 ? 'Positive: sliding south, the circles of latitude grow.' : 'Negative: past the equator, sliding south shrinks the circles.'} So $\partial_\theta$ is not a symmetry of the sphere — unlike $\partial_\varphi$, for which every term vanishes (C18.2).`,
        };
      },
    }),
    mcq({
      id: 'coordinates', difficulty: 2,
      prompt: t`Two vector fields $X$ and $Y$ on a surface are linearly independent everywhere. When can they be the coordinate fields $\partial_u$, $\partial_v$ of some chart, at least near each point?`,
      visual: { type: 'graph', params: { ...gapScene(), drag: [{ key: 'p', x: -1.0, y: 0.5 }] }, caption: 'Flowing along two fields in two orders: the quadrilateral closes only when their bracket vanishes.' },
      choices: [t`Exactly when $[X, Y] = 0$`, 'Whenever they are orthonormal', 'Always: any two independent fields will do', t`When $\nabla_XY = 0$`],
      answer: 0,
      why: {
        1: t`The polar unit vectors are orthonormal, yet $[\hat e_r, \hat e_\theta] = -\tfrac1{r^2}\partial_\theta \ne 0$: no chart has them as coordinate fields.`,
        2: 'Coordinate fields always commute, so a pair with a non-zero bracket cannot be one.',
        3: 'Being parallel along X is about the connection; being a coordinate pair is about the flows closing up, with no connection involved.',
      },
      hints: [t`Coordinate fields satisfy $[\partial_u, \partial_v] = \partial_u\partial_v - \partial_v\partial_u = 0$. Is the converse plausible?`],
      teach: 'Independent commuting fields are always the coordinate fields of some local chart, and only they are.',
      explain: t`If $[X, Y] = 0$, flowing $u$ along $X$ and $v$ along $Y$ reaches the same point in either order, so $(u, v)$ is a chart with $X = \partial_u$, $Y = \partial_v$. A non-zero bracket rules it out.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-attitude', difficulty: 3, transfer: true,
      gen(r) {
        const e = r.pick([3, 5, 8, 10]) * DEG;
        const Rx = (a) => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]];
        const Ry = (a) => [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]];
        const mm = (A, B) => A.map((row) => [0, 1, 2].map((j) => row.reduce((s, v, k) => s + v * B[k][j], 0)));
        const M = mm(mm(mm(Ry(-e), Rx(-e)), Ry(e)), Rx(e));   // x first, then y, then −x, then −y
        const ang = Math.acos(Math.min(1, (M[0][0] + M[1][1] + M[2][2] - 1) / 2)) / DEG;
        const approx = (e * e) / DEG;
        return {
          prompt: t`A spacecraft turns ${nice(e / DEG)}° about its x axis, then ${nice(e / DEG)}° about its y axis, then ${nice(e / DEG)}° back about x, then ${nice(e / DEG)}° back about y (all axes fixed in space). It does not return to its starting attitude. By what angle, in degrees, is it left turned? (The rotation generators’ bracket predicts about $\varepsilon^2$ radians about the z axis.)`,
          visual: { type: 'calc-vectors3d', params: { range: 1.6, vectors: [{ to: [1.3, 0, 0], color: 'accent', label: 'x' }, { to: [0, 1.3, 0], color: 'teal', label: 'y' }, { to: [0, 0, 1.3], color: 'gold', label: 'z' }], curves: [{ param: ['0.9', '0.5*cos(t)', '0.5*sin(t)'], t: [0, 1.4], color: 'accent' }, { param: ['0.5*sin(t)', '0.9', '0.5*cos(t)'], t: [0, 1.4], color: 'teal' }, { param: ['0.5*cos(t)', '0.5*sin(t)', '0.9'], t: [0, 1.2], color: 'gold' }] }, caption: 'Rotations about x (blue) and y (teal) applied in turn and undone leave a small net turn about z (gold). Arcs are schematic.' },
          answer: ang, units: 'deg', tol: { rel: 0.03 },
          errors: [
            { value: 0, feedback: 'Rotations about different axes do not commute: undoing them in the same order as you did them does not cancel them.' },
            { value: 2 * approx, feedback: t`The commutator of the generators gives $\varepsilon^2$, not $2\varepsilon^2$.` },
          ],
          hints: [t`Infinitesimal rotations obey $[J_x, J_y] = J_z$: the four-step sequence leaves a rotation of about $\varepsilon^2$ radians about $z$.`, t`$\varepsilon = ${nice(e / DEG)}^\circ = ${nice(e, 4)}$ rad; square it and convert back to degrees.`],
          teach: 'Turning about x, then y, then undoing both leaves a net turn of about ε² about z: the Lie bracket of rotations, made physical.',
          explain: t`$\varepsilon^2 = ${nice(e, 4)}^2 = ${nice(e * e, 4)}$ rad $= ${nice(approx, 3)}^\circ$; multiplying out the four rotation matrices gives exactly $${nice(ang, 4)}^\circ$. Attitude-control engineers use this: a spacecraft with reaction wheels about two axes only can still turn about the third, by cycling small turns about the two it can drive.`,
        };
      },
    }),
    num({
      id: 'cp-oneform', difficulty: 3,
      gen(r) {
        const c = r.intExcept(-3, 3, [0]), x0 = r.pick([0.5, 1, 1.5, -1]), y0 = r.pick([0.8, -0.6, 1.2, 2]);
        const key = -c * y0;
        return {
          prompt: t`For the rotation $X = -y\,\partial_x + x\,\partial_y$ and the 1-form $\omega = ${c === 1 ? '' : c === -1 ? '-' : c}x\,dy$, find the $dy$ component of $\mathcal L_X\omega$ at $(x, y) = (${x0}, ${y0})$, using $(\mathcal L_X\omega)_\mu = X^\nu\partial_\nu\omega_\mu + \omega_\nu\partial_\mu X^\nu$.`,
          visual: { type: 'graph', params: { x: [-2.5, 2.5], y: [-1.6, 2.4], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y', arrows: quiver((x, y) => -y, (x) => x, [-2, -1, 0, 1, 2], [-1, 0, 1, 2], 0.22, 'accent', 1.2), points: [{ x: x0, y: y0, r: 5, color: 'warn', label: 'p' }] }, caption: 'The rotation field X and the point p.' },
          answer: key, tol: { rel: 0, abs: 0.005 },
          errors: [
            { value: c * x0, feedback: t`That is the $dx$ component, $\omega_y\,\partial_xX^y = ${c}x$.` },
            { value: c * y0, feedback: t`Sign: $X^x\,\partial_x\omega_y = (-y)(${c})$.` },
          ].filter((e) => Math.abs(e.value - key) > 0.01),
          hints: [t`$\omega_x = 0$, $\omega_y = ${c}x$. For $\mu = y$: $X^\nu\partial_\nu\omega_y = X^x\,\partial_x(${c}x)$.`, t`The second term, $\omega_\nu\,\partial_yX^\nu = \omega_y\,\partial_yX^y = 0$, since $X^y = x$.`],
          teach: 'The Lie derivative of a 1-form adds to the transport term a term with the derivative of X, with a plus sign (the opposite of the vector case).',
          explain: t`$(\mathcal L_X\omega)_y = (-y)(${c}) + 0 = ${nice(key, 3)}$ at $p$. In full, $\mathcal L_X\omega = ${c}(x\,dx - y\,dy)$ — which Cartan’s formula $\mathcal L_X = i_X d + d\,i_X$ (C10) confirms.`,
        };
      },
    }),
    multi({
      id: 'cp-symmetry', difficulty: 2,
      prompt: t`For the flat plane, $g = dx^2 + dy^2$. For which of these fields is $\mathcal L_Xg = 0$ — flows that preserve every distance? Select all.`,
      visual: { type: 'graph', params: { x: [-2.5, 2.5], y: [-1.6, 1.6], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y', arrows: quiver((x, y) => x, (x, y) => y, [-2, -1, 0, 1, 2], [-1, 0, 1], 0.25, 'violet', 1.2) }, caption: 'One of the four fields: the dilation x∂ₓ + y∂ᵧ.' },
      choices: [t`$\partial_x$`, t`$-y\,\partial_x + x\,\partial_y$`, t`$x\,\partial_x + y\,\partial_y$`, t`$y\,\partial_x$`],
      answer: [0, 1],
      why: {
        2: t`$\mathcal L_Xg = 2g$: the dilation stretches every length.`,
        3: t`$(\mathcal L_Xg)_{xy} = g_{xx}\partial_yX^x = 1$: the shear changes angles.`,
      },
      hints: [t`With $g = \delta$, $(\mathcal L_Xg)_{\mu\nu} = \partial_\mu X_\nu + \partial_\nu X_\mu$.`],
      teach: 'The flows that keep a metric unchanged are its symmetries: for the plane, translations and rotations.',
      explain: t`Translations and the rotation give $\partial_\mu X_\nu + \partial_\nu X_\mu = 0$; the dilation gives $2\delta_{\mu\nu}$ and the shear an off-diagonal 1. Fields with $\mathcal L_Xg = 0$ are **Killing vectors**, the subject of C18.2.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §B.4–B.5 (Lie derivatives, Killing vectors)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Schutz, Geometrical Methods of Mathematical Physics, ch. 3 (Lie derivatives and brackets)', url: 'https://www.cambridge.org/9780521298872' },
  ],
});
