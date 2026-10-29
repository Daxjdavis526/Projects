// Covariant derivatives of 1-forms and mixed tensors: one +Γ per upper
// index, one −Γ per lower, the minus forced by the Leibniz rule on ω(V).
// The covariant Hessian ∇_μ∇_νf = ∂_μ∂_νf − Γ^λ_μν∂_λf (symmetric because
// torsion-free): checked against Cartesian on the plane, ∇∇z = −z g on the
// sphere; the radial projector ∂_r ⊗ dr; Killing's equation for ∂_φ; tidal
// tensors in spherical coordinates.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const DEG = Math.PI / 180;
const GM_E = 3.986004418e14, R_E = 6371e3;

// level curves of f = x² + 3y², a point P at polar (r, θ), and its unit polar vectors
const bowl = (r0, thd, { sliders = false, readouts = [] } = {}) => {
  const TH = sliders ? 'th*pi/180' : String(r6(thd * DEG)), R = sliders ? 'r0' : String(r0);
  return {
    x: [-3, 3], y: [-2, 2], equal: true, xticks: 6, yticks: 4,
    ...(sliders ? { sliders: [
      { key: 'r0', label: t`$r$ at P`, min: 0.4, max: 2.4, step: 0.05, value: r0, explain: 'Distance of P from the origin.' },
      { key: 'th', label: t`$\theta$ at P`, min: 0, max: 180, step: 1, value: thd, unit: t`^\circ`, explain: 'Angle of P from the x-axis.' },
    ] } : {}),
    curves: [1, 2, 4, 6, 9].map((c) => ({ param: [`${r6(Math.sqrt(c))}*cos(t)`, `${r6(Math.sqrt(c / 3))}*sin(t)`], t: [0, r6(2 * Math.PI)], color: 'teal', width: 1.2 })),
    points: [{ x: `${R}*cos(${TH})`, y: `${R}*sin(${TH})`, color: 'ink', label: 'P', labelDx: -16, labelDy: 14 }],
    arrows: [
      { from: [`${R}*cos(${TH})`, `${R}*sin(${TH})`], to: [`(${R} + 0.7)*cos(${TH})`, `(${R} + 0.7)*sin(${TH})`], color: 'accent', width: 2.4, label: 'r̂' },
      { from: [`${R}*cos(${TH})`, `${R}*sin(${TH})`], to: [`${R}*cos(${TH}) - 0.7*sin(${TH})`, `${R}*sin(${TH}) + 0.7*cos(${TH})`], color: 'violet', width: 2.4, label: 'θ̂' },
    ],
    readouts,
  };
};

export default lesson({
  id: 'st-c.C13.2',
  title: 'Covariant derivatives of tensors',
  minutes: 15, difficulty: 3,
  equation: t`\nabla_\mu T^\alpha{}_\beta = \partial_\mu T^\alpha{}_\beta + \Gamma^\alpha{}_{\mu\lambda}T^\lambda{}_\beta - \Gamma^\lambda{}_{\mu\beta}T^\alpha{}_\lambda`,
  intro: t`A connection that differentiates vectors differentiates every tensor, once you insist on two things: on a scalar $\nabla$ is the ordinary derivative, and $\nabla$ obeys the Leibniz rule and commutes with contraction. Then for a 1-form, $\nabla_\mu\omega_\nu = \partial_\mu\omega_\nu - \Gamma^\lambda{}_{\mu\nu}\omega_\lambda$ — **minus**, because $\omega_\nu V^\nu$ is a scalar and the $+\Gamma$ of $V$ must be cancelled. For any tensor: **one $+\Gamma$ for each upper index, one $-\Gamma$ for each lower**, each correcting its own index as above.

The most useful case is the **covariant Hessian**, $\nabla_\mu\nabla_\nu f = \partial_\mu\partial_\nu f - \Gamma^\lambda{}_{\mu\nu}\partial_\lambda f$: the honest second derivative of a function on a curved space, symmetric because Levi-Civita has no torsion. ([st-a A8.3](#/lesson/st-a.A8.3) did vectors; here: covectors, mixed tensors and Hessians.)`,
  symbols: [
    { tex: t`T^\alpha{}_\beta`, text: t`a $(1, 1)$ tensor — a linear map of vectors to vectors — with one upper and one lower index` },
    { tex: t`\nabla_\mu T^\alpha{}_\beta`, text: t`its covariant derivative: a $(1, 2)$ tensor` },
    { tex: t`\Gamma^\alpha{}_{\mu\lambda}T^\lambda{}_\beta`, text: 'the correction for the upper index (the same as for a vector)' },
    { tex: t`-\Gamma^\lambda{}_{\mu\beta}T^\alpha{}_\lambda`, text: 'the correction for the lower index (the same as for a 1-form), with a minus sign' },
  ],
  why: t`Einstein’s equations, $\nabla_\mu T^{\mu\nu} = 0$, Killing’s equation for symmetries and the tidal tensor $\nabla_i\nabla_j\Phi$ are all covariant derivatives of tensors. Get the signs wrong and conservation laws fail.`,
  visual: {
    type: 'graph',
    title: 'A second derivative that does not depend on the chart',
    lead: t`Level curves of $f = x^2 + 3y^2$ on the flat plane, and a point P with its polar unit vectors. The readouts compare second derivatives in polar coordinates — naive and covariant — with the true one, $\hat e_a\cdot H\cdot\hat e_b$ from the Cartesian Hessian $H = \mathrm{diag}(2, 6)$, scaled by $r$ for each $\theta$ index.`,
    tasks: [
      t`The covariant $\nabla_\theta\nabla_\theta f$ equals the true value at every P; the naive $\partial_\theta^2f$ does not, and even changes sign.`,
      t`Put P on an axis ($\theta = 0$ or $90^\circ$): there $\partial_\theta f = 0$, yet the naive and covariant values still differ — the $\Gamma^r{}_{\theta\theta}\partial_rf$ term is the curving of the coordinate circle, not of $f$.`,
      t`The mixed component: $\nabla_r\nabla_\theta f$ matches the true value, $\partial_r\partial_\theta f$ is twice too big. Both vanish on the axes, where $\hat e_r$ and $\hat e_\theta$ are the bowl’s principal directions.`,
    ],
    params: bowl(1.6, 35, { sliders: true, readouts: [
      { label: t`naive $\partial_\theta^2 f$`, expr: '4*r0^2*cos(2*th*pi/180)', digits: 4 },
      { label: t`covariant $\nabla_\theta\nabla_\theta f$`, expr: '4*r0^2*cos(2*th*pi/180) + 2*r0^2*(1 + 2*sin(th*pi/180)^2)', digits: 4 },
      { label: t`true $r^2\,\hat e_\theta\cdot H\cdot\hat e_\theta$`, expr: 'r0^2*(2*sin(th*pi/180)^2 + 6*cos(th*pi/180)^2)', digits: 4 },
      { label: t`naive $\partial_r\partial_\theta f$`, expr: '4*r0*sin(2*th*pi/180)', digits: 4 },
      { label: t`covariant $\nabla_r\nabla_\theta f$`, expr: '2*r0*sin(2*th*pi/180)', digits: 4 },
    ] }),
    caption: t`Exact level curves of $f$ (values 1, 2, 4, 6, 9). In polar form $f = r^2(1 + 2\sin^2\theta)$; $\Gamma^r{}_{\theta\theta} = -r$ and $\Gamma^\theta{}_{r\theta} = 1/r$.`,
  },
  example: {
    prompt: t`On the unit sphere ($\Gamma^\theta{}_{\varphi\varphi} = -\sin\theta\cos\theta$, $\Gamma^\varphi{}_{\theta\varphi} = \cot\theta$), take the height function $z = \cos\theta$. Compute its covariant Hessian and show that $\nabla_\mu\nabla_\nu z = -z\,g_{\mu\nu}$. What does that say along a great circle?`,
    visual: { type: 'gr-surface', params: { mode: 'geodesic', surface: 'sphere', v: 1.0, heading: 40, length: 6, controls: false, readout: false }, caption: 'A great circle on the unit sphere: along it the height z rises and falls as a cosine of the distance travelled.' },
    steps: [
      { label: 'First derivatives', text: t`$\partial_\theta z = -\sin\theta$, $\partial_\varphi z = 0$. So in $\nabla_\mu\nabla_\nu z = \partial_\mu\partial_\nu z - \Gamma^\lambda{}_{\mu\nu}\partial_\lambda z$ only $\lambda = \theta$ contributes.` },
      { label: 'theta theta', text: t`$\nabla_\theta\nabla_\theta z = -\cos\theta - \Gamma^\theta{}_{\theta\theta}(-\sin\theta) = -\cos\theta$, and $\Gamma^\theta{}_{\theta\theta} = 0$.` },
      { label: 'phi phi', text: t`$\nabla_\varphi\nabla_\varphi z = 0 - (-\sin\theta\cos\theta)(-\sin\theta) = -\sin^2\theta\cos\theta$. The naive $\partial_\varphi^2z$ is 0: the whole answer is the connection term.` },
      { label: 'mixed', text: t`$\nabla_\theta\nabla_\varphi z = 0 - \Gamma^\theta{}_{\theta\varphi}(-\sin\theta) = 0$, since $\Gamma^\theta{}_{\theta\varphi} = 0$.` },
      { label: 'Pattern', text: t`$\big(-\cos\theta,\ 0,\ -\sin^2\theta\cos\theta\big) = -\cos\theta\,\big(1,\ 0,\ \sin^2\theta\big) = -z\,g_{\mu\nu}$.` },
      { label: 'Meaning', text: t`Along a unit-speed geodesic $\gamma(s)$, $\dfrac{d^2}{ds^2}z(\gamma) = \nabla_\mu\nabla_\nu z\,\dot x^\mu\dot x^\nu = -z\,g(\dot x, \dot x) = -z$. So $z = A\cos(s - s_0)$ along every great circle, a check you can do without coordinates.` },
    ],
    answer: t`$\nabla\nabla z = -\cos\theta\,(d\theta^2 + \sin^2\theta\,d\varphi^2) = -z\,g$; along any great circle, $z'' = -z$.`,
  },
  practice: [
    mcq({
      id: 'sign-rule', difficulty: 1,
      prompt: t`Which is the covariant derivative of a 1-form $\omega_\nu$?`,
      visual: { type: 'graph', params: bowl(1.6, 35), caption: t`Level curves of $f = x^2 + 3y^2$; its gradient $df$ is a 1-form.` },
      choices: [t`$\partial_\mu\omega_\nu - \Gamma^\lambda{}_{\mu\nu}\omega_\lambda$`, t`$\partial_\mu\omega_\nu + \Gamma^\lambda{}_{\mu\nu}\omega_\lambda$`, t`$\partial_\mu\omega_\nu - \Gamma^\nu{}_{\mu\lambda}\omega_\lambda$`, t`$\partial_\mu\omega_\nu$, since 1-forms need no connection`],
      answer: 0,
      why: {
        1: t`$+\Gamma$ belongs to upper indices; with it, $\nabla_\mu(\omega_\nu V^\nu)$ would pick up $2\Gamma\omega V$ instead of being $\partial_\mu$ of a scalar.`,
        2: t`The free index $\nu$ cannot sit upstairs on $\Gamma$ while downstairs on the left: the indices do not balance.`,
        3: t`$\partial_\mu\omega_\nu$ is not a tensor (it changes with the chart like $\partial_\mu V^\nu$ does).`,
      },
      hints: ['One sign per index: what is the rule for a lower index?'],
      teach: 'Covariant derivative: +Γ for each upper index, −Γ for each lower index.',
      explain: t`$\nabla_\mu\omega_\nu = \partial_\mu\omega_\nu - \Gamma^\lambda{}_{\mu\nu}\omega_\lambda$. The picture’s gradient $df$ is such a 1-form; its covariant derivative is the Hessian.`,
    }),
    num({
      id: 'killing-comp', difficulty: 2,
      gen(r) {
        const th = r.pick([30, 45, 60, 75]);
        const ans = Math.sin(th * DEG) * Math.cos(th * DEG);
        return {
          prompt: t`On the unit sphere the rotation field $\xi = \partial_\varphi$ has lowered components $\xi_\theta = 0$, $\xi_\varphi = g_{\varphi\varphi} = \sin^2\theta$. Find $\nabla_\theta\xi_\varphi = \partial_\theta\xi_\varphi - \Gamma^\lambda{}_{\theta\varphi}\xi_\lambda$ at $\theta = ${th}^\circ$.`,
          visual: { type: 'dg4-chart', params: { metric: 'sphere', mode: 'chart', P: [3.14, r6(th * DEG)], drag: false, readout: false, cells: 8 }, caption: t`The sphere’s chart, P at $\theta = ${th}^\circ$; the rotation field $\partial_\varphi$ points across, its length $\sin\theta$.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 2 * ans, feedback: t`That is $\partial_\theta\xi_\varphi$ alone; subtract $\Gamma^\varphi{}_{\theta\varphi}\xi_\varphi = \cot\theta\sin^2\theta$.` }, { value: 3 * ans, feedback: 'A lower index gets −Γ, not +Γ.' }],
          hints: [t`Only $\lambda = \varphi$ contributes: $\Gamma^\varphi{}_{\theta\varphi} = \cot\theta$.`, t`$\partial_\theta\sin^2\theta = 2\sin\theta\cos\theta$, and $\cot\theta\sin^2\theta = \sin\theta\cos\theta$.`],
          teach: t`A lower index takes $-\Gamma$: $\nabla_\mu\omega_\nu = \partial_\mu\omega_\nu - \Gamma^\lambda{}_{\mu\nu}\omega_\lambda$.`,
          explain: t`$2\sin\theta\cos\theta - \sin\theta\cos\theta = \sin\theta\cos\theta = ${nice(ans, 4)}$. The other order, $\nabla_\varphi\xi_\theta = 0 - \Gamma^\varphi{}_{\varphi\theta}\xi_\varphi = -\sin\theta\cos\theta$, is its negative: $\nabla_\theta\xi_\varphi + \nabla_\varphi\xi_\theta = 0$, Killing’s equation (C18) — rotations are symmetries of the sphere.`,
        };
      },
    }),
    num({
      id: 'polar-hessian', difficulty: 2,
      gen(r) {
        const r0 = r.pick([1, 1.5, 2]), thd = r.pick([0, 30, 45, 60, 90]);
        const s = Math.sin(thd * DEG), ans = r0 * r0 * (6 - 4 * s * s), naive = 4 * r0 * r0 * Math.cos(2 * thd * DEG);
        return {
          prompt: t`On the flat plane, $f = x^2 + 3y^2 = r^2(1 + 2\sin^2\theta)$ in polar coordinates, where $\Gamma^r{}_{\theta\theta} = -r$. Compute $\nabla_\theta\nabla_\theta f$ at $r = ${r0}$, $\theta = ${thd}^\circ$.`,
          visual: { type: 'graph', params: bowl(r0, thd) , caption: 'Level curves of f and the point, with its polar unit vectors.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: naive, feedback: t`That is $\partial_\theta^2f$ alone. Subtract $\Gamma^\lambda{}_{\theta\theta}\partial_\lambda f = -r\,\partial_rf$, i.e. add $r\,\partial_rf$.` }, { value: naive - 2 * r0 * r0 * (1 + 2 * s * s), feedback: t`$-\Gamma^r{}_{\theta\theta}\partial_rf = +r\,\partial_rf$: mind the double minus.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\partial_\theta^2f = 4r^2\cos2\theta$ and $\partial_rf = 2r(1 + 2\sin^2\theta)$.`, t`$\nabla_\theta\nabla_\theta f = \partial_\theta^2f - \Gamma^r{}_{\theta\theta}\partial_rf = \partial_\theta^2f + r\,\partial_rf$.`],
          teach: t`The covariant Hessian $\nabla_\mu\nabla_\nu f = \partial_\mu\partial_\nu f - \Gamma^\lambda{}_{\mu\nu}\partial_\lambda f$ is the chart-independent second derivative.`,
          explain: t`$${nice(naive, 4)} + ${nice(2 * r0 * r0 * (1 + 2 * s * s), 4)} = ${nice(ans, 4)}$, which is $r^2\,\hat e_\theta\cdot H\cdot\hat e_\theta = r^2(2\sin^2\theta + 6\cos^2\theta)$ with the Cartesian Hessian $H = \mathrm{diag}(2, 6)$. The naive $\partial_\theta^2f$ misses the bending of the circle $r = $ const.`,
        };
      },
    }),
    num({
      id: 'projector', difficulty: 3,
      gen(r) {
        const r0 = r.pick([0.5, 2, 3, 4]), which = r.pick(['rt', 'tr']);
        const ans = which === 'rt' ? r0 : 1 / r0;
        const comp = which === 'rt' ? t`\nabla_\theta T^r{}_\theta` : t`\nabla_\theta T^\theta{}_r`;
        return {
          prompt: t`On the polar plane, $T = \partial_r\otimes dr$ projects every vector onto its radial part: $T^r{}_r = 1$, all other components 0. Find $${comp}$ at $r = ${r0}$. ($\Gamma^r{}_{\theta\theta} = -r$, $\Gamma^\theta{}_{r\theta} = \Gamma^\theta{}_{\theta r} = 1/r$.)`,
          visual: { type: 'graph', params: { ...bowl(r0 > 2.4 ? 2.4 : r0, 50), curves: [] }, caption: 'The radial and angular unit vectors at a point: the projector keeps the r̂ part of any vector, and r̂ turns as θ changes.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`The components are constant, but the tensor is not: $\partial_r$ and $dr$ turn as $\theta$ changes, and the $\Gamma$ terms record it.` }, { value: -ans, feedback: t`For ${which === 'rt' ? t`the lower index, $-\Gamma^\lambda{}_{\theta\theta}T^r{}_\lambda = -(-r)(1)$` : t`the upper index, $+\Gamma^\theta{}_{\theta\lambda}T^\lambda{}_r = +\tfrac1r(1)$`}.` }],
          hints: [t`$\nabla_\theta T^\alpha{}_\beta = \partial_\theta T^\alpha{}_\beta + \Gamma^\alpha{}_{\theta\lambda}T^\lambda{}_\beta - \Gamma^\lambda{}_{\theta\beta}T^\alpha{}_\lambda$; only $T^r{}_r$ is nonzero, so keep terms with $T^r{}_r$.`, which === 'rt' ? t`Upper term: $\Gamma^r{}_{\theta r}T^r{}_\theta = 0$. Lower term: $-\Gamma^r{}_{\theta\theta}T^r{}_r$.` : t`Upper term: $\Gamma^\theta{}_{\theta r}T^r{}_r$. Lower term: $-\Gamma^\lambda{}_{\theta r}T^\theta{}_\lambda = 0$.`],
          teach: 'A tensor with constant components can still have a nonzero covariant derivative: the basis it is built from changes.',
          explain: t`$${comp} = ${nice(ans, 4)}$. Going round, the projector onto $\hat r$ rotates with $\hat r$; in Cartesian components $T = \begin{pmatrix}\cos^2\theta & \sin\theta\cos\theta\\ \sin\theta\cos\theta & \sin^2\theta\end{pmatrix}$ visibly depends on $\theta$.`,
        };
      },
    }),
    order({
      id: 'minus-sign', difficulty: 2,
      prompt: t`Show that a 1-form must take a minus sign: $\nabla_\mu\omega_\nu = \partial_\mu\omega_\nu - \Gamma^\lambda{}_{\mu\nu}\omega_\lambda$. Order the steps.`,
      visual: { type: 'graph', params: bowl(1.6, 35), caption: 'The gradient of f is a 1-form; paired with any vector it gives a number, a scalar.' },
      items: [
        t`$\omega_\nu V^\nu$ is a scalar, so $\nabla_\mu(\omega_\nu V^\nu) = \partial_\mu(\omega_\nu V^\nu) = (\partial_\mu\omega_\nu)V^\nu + \omega_\nu\partial_\mu V^\nu$.`,
        t`Leibniz with contraction: $\nabla_\mu(\omega_\nu V^\nu) = (\nabla_\mu\omega_\nu)V^\nu + \omega_\nu\nabla_\mu V^\nu$.`,
        t`Insert $\nabla_\mu V^\nu = \partial_\mu V^\nu + \Gamma^\nu{}_{\mu\lambda}V^\lambda$ and compare: $(\nabla_\mu\omega_\nu)V^\nu = (\partial_\mu\omega_\nu)V^\nu - \omega_\nu\Gamma^\nu{}_{\mu\lambda}V^\lambda$.`,
        t`Rename dummies ($\nu \leftrightarrow \lambda$ in the last term) and drop $V^\nu$, which was arbitrary.`,
      ],
      hints: ['Differentiate the scalar ω(V) in two ways and compare.', 'The connection term of V has to be cancelled by one from ω.'],
      teach: t`The $-\Gamma$ for lower indices is forced: the Leibniz rule on the scalar $\omega_\nu V^\nu$ leaves no other choice.`,
      explain: t`The same argument, index by index, gives the rule for any tensor: each lower index cancels the $+\Gamma$ of the vector it would eat.`,
    }),
    mcq({
      id: 'delta', difficulty: 2,
      prompt: t`The identity tensor $\delta^\alpha{}_\beta$ has the same components in every chart. What is $\nabla_\mu\delta^\alpha{}_\beta$?`,
      visual: { type: 'dg4-chart', params: { metric: 'sphere', mode: 'chart', P: [1.2, 1.0], drag: false, readout: ['gamma'], cells: 8 }, caption: 'The sphere’s Christoffel symbols at P — nonzero, yet they cancel for the identity tensor.' },
      choices: [t`0: the $+\Gamma$ and $-\Gamma$ terms cancel`, t`$2\Gamma^\alpha{}_{\mu\beta}$`, t`$\partial_\mu\delta^\alpha{}_\beta = 0$, but only in Cartesian coordinates`, t`It depends on the curvature`],
      answer: 0,
      why: {
        1: t`The two corrections have opposite signs: $+\Gamma^\alpha{}_{\mu\lambda}\delta^\lambda{}_\beta - \Gamma^\lambda{}_{\mu\beta}\delta^\alpha{}_\lambda = \Gamma^\alpha{}_{\mu\beta} - \Gamma^\alpha{}_{\mu\beta}$.`,
        2: 'It is zero in every chart, on every manifold, for every connection.',
        3: 'Curvature never enters a first covariant derivative; it appears when two of them are commuted (C15).',
      },
      hints: [t`Apply the rule: $\partial_\mu\delta^\alpha{}_\beta + \Gamma^\alpha{}_{\mu\lambda}\delta^\lambda{}_\beta - \Gamma^\lambda{}_{\mu\beta}\delta^\alpha{}_\lambda$.`],
      teach: 'The identity tensor is covariantly constant for any connection; the metric is too, for Levi-Civita.',
      explain: t`$\Gamma^\alpha{}_{\mu\beta} - \Gamma^\alpha{}_{\mu\beta} = 0$. That is what lets $\nabla$ commute with contraction (a contraction is a product with $\delta$), the property used to derive the minus sign.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tidal', difficulty: 3, transfer: true,
      gen(r) {
        const [where, h] = r.pick([['the ISS (altitude 420 km)', 420e3], ['a GPS satellite (altitude 20 200 km)', 20200e3], ['the Earth’s surface', 0]]);
        const rr = R_E + h, ans = GM_E / rr ** 3;
        return {
          prompt: t`The tidal tensor is the covariant Hessian of the Newtonian potential $\Phi = -GM/r$, here in spherical coordinates ($\Gamma^r{}_{\theta\theta} = -r$). Compute $\nabla_\theta\nabla_\theta\Phi$, divide by $g_{\theta\theta} = r^2$ to get the sideways component, and evaluate it at ${where} ($GM_\oplus = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, Earth radius 6371 km), in $\text{s}^{-2}$.`,
          visual: { type: 'gr-dustball', params: { mode: 'tides', body: 'earth', t: 0.6, readout: false, play: false, rSlider: false }, caption: 'A ball of free-falling dust near a mass: stretched along the radius, squeezed sideways — the eigenvalues of the tidal tensor.' },
          answer: ans, units: 's^-2', tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`$\partial_\theta^2\Phi = 0$, but the connection term $-\Gamma^r{}_{\theta\theta}\partial_r\Phi = r\,GM/r^2$ is not.` }, { value: 2 * ans, feedback: t`$2GM/r^3$ is the radial component, $\partial_r^2\Phi$ in magnitude. The sideways one is half of it.` }, { value: -ans, feedback: t`$\partial_r\Phi = +GM/r^2$ (the potential rises outward), so the term is positive.` }],
          hints: [t`$\nabla_\theta\nabla_\theta\Phi = \partial_\theta^2\Phi - \Gamma^r{}_{\theta\theta}\partial_r\Phi = 0 + r\cdot\dfrac{GM}{r^2}$.`, t`Divided by $r^2$: $GM/r^3$.`],
          teach: 'The tidal tensor is a covariant Hessian; in spherical coordinates its sideways parts come entirely from Γ.',
          explain: t`$GM/r^3 = ${tex(ans, 3)}\ \text{s}^{-2}$. With $\partial_r^2\Phi = -2GM/r^3$ the tidal tensor is $\mathrm{diag}(-2, 1, 1)\,GM/r^3$: trace zero (Laplace’s equation in vacuum), stretching along $r$, squeezing sideways — what an orbiting lab’s accelerometers feel across a metre.`,
        };
      },
    }),
    num({
      id: 'cp-sphere-hessian', difficulty: 3,
      gen(r) {
        const th = r.pick([30, 45, 60, 120]);
        const s = Math.sin(th * DEG), c = Math.cos(th * DEG), ans = -s * s * c;
        return {
          prompt: t`On the unit sphere, find $\nabla_\varphi\nabla_\varphi z$ for the height $z = \cos\theta$ at $\theta = ${th}^\circ$ ($\Gamma^\theta{}_{\varphi\varphi} = -\sin\theta\cos\theta$).`,
          visual: { type: 'dg4-chart', params: { metric: 'sphere', mode: 'chart', P: [3.14, r6(th * DEG)], drag: false, readout: false, cells: 8 }, caption: t`The sphere’s chart, P at $\theta = ${th}^\circ$.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`$\partial_\varphi^2z = 0$, but $-\Gamma^\theta{}_{\varphi\varphi}\partial_\theta z$ is not.` }, { value: -ans, feedback: t`$\partial_\theta z = -\sin\theta$: two minus signs from the formula and one from here.` }],
          hints: [t`Only the connection term survives: $\partial_\varphi^2z = 0$ and $\partial_\varphi z = 0$.`, t`$\nabla_\varphi\nabla_\varphi z = -\Gamma^\theta{}_{\varphi\varphi}\,\partial_\theta z = -(-\sin\theta\cos\theta)(-\sin\theta)$.`],
          teach: t`On the unit sphere the height function obeys $\nabla_\mu\nabla_\nu z = -z\,g_{\mu\nu}$.`,
          explain: t`$-\sin^2\theta\cos\theta = ${nice(ans, 4)} = -z\,g_{\varphi\varphi}$, as in the worked example.`,
        };
      },
    }),
    mcq({
      id: 'cp-symmetric', difficulty: 2,
      prompt: t`Why is the covariant Hessian $\nabla_\mu\nabla_\nu f$ symmetric in $\mu\nu$ for the Levi-Civita connection?`,
      visual: { type: 'graph', params: bowl(1.6, 35), caption: 'Level curves of a function and the polar frame at P.' },
      choices: [t`$\partial_\mu\partial_\nu f$ is symmetric and so is $\Gamma^\lambda{}_{\mu\nu}$ (no torsion)`, 'Because the metric is symmetric', 'Because f is a scalar, so all its derivatives commute on any manifold with any connection', 'It is not symmetric on curved spaces'],
      answer: 0,
      why: { 1: t`The metric’s symmetry alone does not do it: a metric-compatible connection with torsion (the compass connection) gives a non-symmetric $\nabla\nabla f$.`, 2: t`With torsion, $\nabla_\mu\nabla_\nu f - \nabla_\nu\nabla_\mu f = -T^\lambda{}_{\mu\nu}\partial_\lambda f$.`, 3: 'On a scalar, two covariant derivatives commute whenever there is no torsion, curved or not; curvature shows up only on vectors and beyond.' },
      hints: [t`Write $\nabla_\mu\nabla_\nu f = \partial_\mu\partial_\nu f - \Gamma^\lambda{}_{\mu\nu}\partial_\lambda f$ and swap $\mu$, $\nu$.`],
      teach: 'On functions, covariant derivatives commute exactly when the connection is torsion-free.',
      explain: t`Swapping indices changes the Hessian by $-T^\lambda{}_{\mu\nu}\partial_\lambda f$, zero for Levi-Civita. Curvature appears only when commuting derivatives of vectors: $[\nabla_\mu, \nabla_\nu]V^\rho = R^\rho{}_{\sigma\mu\nu}V^\sigma$ (C15).`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.2 (covariant derivatives of tensors)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Wald, General Relativity, §3.1', url: 'https://press.uchicago.edu/ucp/books/book/chicago/G/bo5952261.html' },
    { label: 'Misner, Thorne & Wheeler, Gravitation, §1.6 and §11 (tidal tensor)', url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation' },
  ],
});
