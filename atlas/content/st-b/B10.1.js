// Hyperbolic, parabolic and elliptic equations: the sign of B² − 4AC for
// A u_xx + B u_xy + C u_yy + (lower order) = 0 decides how many families of
// characteristic curves there are (two, one, none) — and with them how
// information moves. Type can change from point to point (Tricomi; transonic
// flow, where the Mach lines are the characteristics). Systems: real
// eigenvalues of A in u_t + A u_x = 0. In more variables: the signature of the
// coefficient matrix, which for the wave operator is the metric's.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const deg = (x) => (x * 180) / Math.PI;
// a family of parallel characteristic lines of slope m, as graph curves
const family = (m, color, when) => [-6, -4, -2, 0, 2, 4, 6].map((c) => ({ fn: `${c} + x*(${m})`, color, width: c === 0 ? 2.4 : 1.2, when }));
// signed coefficient as TeX: "+ 4u_{xy}"
const term = (k, v, first = false) => (k === 0 ? '' : `${k < 0 ? (first ? '-' : ' - ') : first ? '' : ' + '}${Math.abs(k) === 1 ? '' : Math.abs(k)}${v}`);
const EQS = [
  [1, 4, 3], [1, 2, 1], [1, 1, 1], [2, 1, -1], [1, -6, 9], [3, 2, 1], [0, 1, 0], [1, 0, -4], [4, 4, 1], [2, -2, 5],
].map(([A, B, C]) => {
  const D = B * B - 4 * A * C;
  const texEq = (term(A, 'u_{xx}', true) + term(B, 'u_{xy}', A === 0) + term(C, 'u_{yy}', A === 0 && B === 0)).trim();
  return { A, B, C, D, tex: texEq, type: D > 0 ? 0 : D === 0 ? 1 : 2 };
});
// the type diagram: B across, 4AC up; the parabola 4AC = B² separates elliptic (above) from hyperbolic (below)
const typeMap = (caption, points = []) => ({
  type: 'graph',
  params: { x: [-6, 6], y: [-14, 40], aspect: 'wide', xlabel: 'B', ylabel: '4AC', axesAt: 'edge', yticks: 5,
    shade: [{ fn: '40', lower: 'x^2', from: -6.4, to: 6.4, color: 'accent', alpha: 0.14 }, { fn: 'x^2', lower: '-14', from: -6.4, to: 6.4, color: 'warn', alpha: 0.12 }],
    curves: [{ fn: 'x^2', color: 'gold', width: 2.4, domain: [-6.4, 6.4] }],
    points: [{ x: 0, y: 30, label: 'elliptic: B² < 4AC', r: 0, color: 'accent', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 3.4, y: -6, label: 'hyperbolic: B² > 4AC', r: 0, color: 'warn', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: -4.6, y: 21.16, label: 'parabolic', r: 0, color: 'gold', labelDx: 10, labelDy: 0 }, ...points] },
  caption,
});
// Mach lines at angle μ from a wedge tip in a supersonic stream
const machVis = (M, caption) => {
  const m = Math.tan(Math.asin(1 / M));
  return { type: 'graph', params: { x: [-1, 7], y: [-2.5, 2.5], aspect: 'wide', equal: true, xlabel: 'x (flow direction)', ylabel: 'y', axesAt: 'edge', xticks: 0, yticks: 0, curves: [...[0, 1.5, 3, 4.5].map((x0) => ({ fn: `(x - ${x0})*${m.toFixed(5)}`, color: 'violet', width: 1.3, domain: [x0, 7] })), ...[0, 1.5, 3, 4.5].map((x0) => ({ fn: `-(x - ${x0})*${m.toFixed(5)}`, color: 'teal', width: 1.3, domain: [x0, 7] }))], arrows: [{ from: [-0.8, 2], to: [0.6, 2], color: 'ink2', label: `M = ${M}` }] }, caption };
};

export default lesson({
  id: 'st-b.B10.1',
  title: 'Hyperbolic, parabolic and elliptic equations',
  minutes: 14, difficulty: 3,
  intro: t`The wave, heat and Laplace equations are the three archetypes because every linear second-order equation in two variables behaves like one of them. Write its highest-order part as $A u_{xx} + B u_{xy} + C u_{yy}$ (lower-order terms do not matter here). The **discriminant**

$$B^2 - 4AC \;\begin{cases} > 0 & \text{hyperbolic (like the wave equation)} \\ = 0 & \text{parabolic (like the heat equation)} \\ < 0 & \text{elliptic (like Laplace’s equation)} \end{cases}$$

decides the type. What it really counts is **characteristics**: curves along which the equation can carry a jump. They solve $A\,dy^2 - B\,dx\,dy + C\,dx^2 = 0$ — two real families when the discriminant is positive, one when it is zero, none when it is negative. (The names come from the conic $A\xi^2 + B\xi\eta + C\eta^2 = 1$.)`,
  symbols: [
    { tex: 'A,\\ B,\\ C', text: 'the coefficients of $u_{xx}$, $u_{xy}$ and $u_{yy}$; they may depend on $x$ and $y$, and then so may the type' },
    { tex: 'B^2 - 4AC', text: 'the discriminant: its sign is the type, at each point' },
    { tex: t`dy/dx`, text: 'the slope of a characteristic curve: a root of $A\\,(dy/dx)^2 - B\\,(dy/dx) + C = 0$' },
    { tex: 'u_{xy}', text: 'the mixed second derivative $\\partial^2u/\\partial x\\,\\partial y$' },
  ],
  why: t`Einstein’s equations are of mixed character: four of them (the constraints) are elliptic and must hold on every slice of space, while the rest, in a good gauge, are hyperbolic and move the slice forward in time. Knowing which is which is the first step of numerical relativity (modules B14–B15).`,
  visual: {
    type: 'graph',
    title: 'Two families, one, or none',
    lead: t`Set the coefficients of $A u_{xx} + B u_{xy} + C u_{yy}$. While $B^2 - 4AC > 0$ two families of straight characteristic lines cross the plane (violet and teal); at $B^2 = 4AC$ they merge into one; below it they vanish.`,
    tasks: [
      'Start from the wave equation (A = 1, B = 0, C = −1): two families at ±45°, the light cone of c = 1.',
      t`Raise $C$ toward 0: the two families close like scissors onto the horizontal — at $C = 0$ only the lines $y = $ const are left, the single family of a heat-like equation such as $u_{xx} = u_y$.`,
      'Push C above 0 with B = 0: the lines vanish — Laplace-like. Then raise B: past B² = 4AC they reappear. The type depends on all three numbers, not on any one sign.',
    ],
    params: {
      x: [-4, 4], y: [-2.5, 2.5], aspect: 'wide', equal: true, xlabel: 'x', ylabel: 'y', axesAt: 'edge',
      sliders: [
        { key: 'A', label: 'Coefficient $A$ of $u_{xx}$', min: 0.2, max: 2, step: 0.1, value: 1, explain: 'Multiplying the whole equation by −1 never changes its type, so $A > 0$ loses nothing (unless $A = 0$).' },
        { key: 'B', label: 'Coefficient $B$ of $u_{xy}$', min: -3, max: 3, step: 0.1, value: 0, explain: 'The mixed term tilts the characteristics.' },
        { key: 'C', label: 'Coefficient $C$ of $u_{yy}$', min: -2, max: 2, step: 0.05, value: -1, explain: 'Negative $C$ (with $A > 0$) makes the equation wave-like; positive $C$ can make it Laplace-like.' },
      ],
      curves: [
        ...family('(B + sqrt(max(0, B^2 - 4*A*C)))/(2*A)', 'violet', 'step(B^2 - 4*A*C + 1e-9)'),
        ...family('(B - sqrt(max(0, B^2 - 4*A*C)))/(2*A)', 'teal', 'step(B^2 - 4*A*C - 1e-9)'),
      ],
      readouts: [
        { label: 'B² − 4AC', expr: 'B^2 - 4*A*C', digits: 3, zero: 1e-9 },
        { label: 'number of characteristic families', expr: 'step(B^2 - 4*A*C + 1e-9) + step(B^2 - 4*A*C - 1e-9)', digits: 1, zero: 1e-9 },
      ],
    },
    caption: t`Constant coefficients, so the characteristics are straight lines with slopes $dy/dx = \big(B \pm \sqrt{B^2 - 4AC}\big)/2A$; only a few of each family are drawn. With variable coefficients they curve, and the type can change from place to place.`,
  },
  example: {
    prompt: t`Small disturbances to a uniform airflow of Mach number $M$ along $x$ have a velocity potential obeying $(1 - M^2)\,\phi_{xx} + \phi_{yy} = 0$. Classify the equation at $M = 0.8$ and at $M = 2$, and find the characteristic directions at $M = 2$.`,
    visual: machVis(2, t`Characteristics of the linearized supersonic flow at $M = 2$: two families of Mach lines at $\pm30°$ to the stream, drawn from a few points on the axis. Small disturbances, inviscid flow.`),
    steps: [
      { label: 'Read off the coefficients', text: t`$A = 1 - M^2$, $B = 0$, $C = 1$, so $B^2 - 4AC = -4(1 - M^2) = 4(M^2 - 1)$.` },
      { label: 'Subsonic', text: t`At $M = 0.8$: $4(0.64 - 1) = -1.44 < 0$ — **elliptic**, like Laplace’s equation. A disturbance anywhere is felt everywhere, upstream included: air parts ahead of a subsonic wing before the wing arrives.` },
      { label: 'Supersonic', text: t`At $M = 2$: $4(4 - 1) = 12 > 0$ — **hyperbolic**, like the wave equation. Information travels only along characteristics, downstream.` },
      { label: 'The characteristics', text: t`$A\,dy^2 + C\,dx^2 = 0$ gives $(1 - M^2)\,dy^2 + dx^2 = 0$, so $\dfrac{dy}{dx} = \pm\dfrac{1}{\sqrt{M^2 - 1}} = \pm\dfrac{1}{\sqrt3}$: lines at $\pm30°$ to the flow.` },
      { label: 'Recognise them', text: t`$\tan\mu = 1/\sqrt{M^2 - 1}$ is the same as $\sin\mu = 1/M$: the **Mach angle**. The Mach lines that wind tunnels photograph are the characteristics of this PDE; at $M = 1$ the type changes, and so does the physics.` },
    ],
    answer: t`Elliptic at $M = 0.8$ (discriminant $-1.44$); hyperbolic at $M = 2$ (discriminant $12$), with characteristics at $\pm30°$ to the flow — the Mach lines, $\sin\mu = 1/M$.`,
  },
  practice: [
    num({
      id: 'discriminant', difficulty: 1,
      gen(r) {
        const E = r.pick(EQS.filter((e) => e.A !== 0));
        return {
          prompt: t`Compute the discriminant $B^2 - 4AC$ of $${E.tex} = 0$.`,
          visual: typeMap('The type diagram: every equation is a point (B, 4AC); which side of the gold parabola it lands on is its type.'),
          answer: E.D, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: E.B * E.B - 2 * E.A * E.C, feedback: t`It is $4AC$, not $2AC$.` }, { value: (E.B / 2) ** 2 - E.A * E.C, feedback: t`That is $\tfrac14(B^2 - 4AC)$ — the same sign, but the discriminant as defined here is $B^2 - 4AC$ with $B$ the whole coefficient of $u_{xy}$.` }].filter((e) => Math.abs(e.value - E.D) > 0.02),
          hints: [t`Here $A = ${E.A}$, $B = ${E.B}$, $C = ${E.C}$.`],
          teach: 'The discriminant B² − 4AC is built from the coefficients of the second derivatives only.',
          explain: t`$B^2 - 4AC = (${E.B})^2 - 4(${E.A})(${E.C}) = ${E.D}$: ${E.D > 0 ? 'hyperbolic' : E.D === 0 ? 'parabolic' : 'elliptic'}.`,
        };
      },
    }),
    mcq({
      id: 'classify', difficulty: 2,
      gen(r) {
        const E = r.pick(EQS);
        return {
          prompt: t`Classify $${E.tex} + 5u_x - u = 0$.`,
          visual: typeMap('The type diagram: every equation is a point (B, 4AC). Place this one and read its region.'),
          choices: ['hyperbolic', 'parabolic', 'elliptic', 'none of these: the lower-order terms spoil the classification'],
          answer: E.type,
          why: Object.fromEntries([0, 1, 2, 3].filter((i) => i !== E.type).map((i) => [i, i === 3 ? t`Only the second-order terms count: $5u_x - u$ changes how solutions decay or grow, not where information can travel.` : t`$B^2 - 4AC = ${E.D}$, which is ${E.D > 0 ? 'positive' : E.D === 0 ? 'zero' : 'negative'}.${E.A === 0 ? t` With $A = 0$ the test still applies: $u_{xy} = 0$ has the two families $x = $ const and $y = $ const.` : ''}`])),
          hints: [t`Compute $B^2 - 4AC$ from the coefficients of $u_{xx}$, $u_{xy}$ and $u_{yy}$; ignore $5u_x - u$.`],
          teach: 'The type comes from the second-order part alone: the sign of B² − 4AC.',
          explain: t`$A = ${E.A}$, $B = ${E.B}$, $C = ${E.C}$: $B^2 - 4AC = ${E.D}$, so the equation is **${['hyperbolic', 'parabolic', 'elliptic'][E.type]}**. The terms $5u_x - u$ do not change that.`,
        };
      },
    }),
    num({
      id: 'mach-angle', difficulty: 2,
      gen(r) {
        const M = r.pick([1.5, 2.5, 3, 4]);
        const mu = deg(Math.asin(1 / M));
        return {
          prompt: t`A thin wedge sits in a wind tunnel’s Mach ${M} stream. The small-disturbance equation is $(1 - M^2)\phi_{xx} + \phi_{yy} = 0$. At what angle to the flow do its characteristics (the Mach lines) run, in degrees?`,
          visual: { type: 'graph', params: { x: [-1, 7], y: [-2.5, 2.5], aspect: 'wide', equal: true, xlabel: 'x (flow direction)', ylabel: 'y', axesAt: 'edge', xticks: 0, yticks: 0, curves: [{ fn: '0.12*x', color: 'ink2', width: 2.4, domain: [0, 1.6] }, { fn: '-0.12*x', color: 'ink2', width: 2.4, domain: [0, 1.6] }], arrows: [{ from: [-0.8, 2], to: [0.6, 2], color: 'ink2', label: `M = ${M}` }] }, caption: 'The wedge in the stream (not to scale). The lines it sends out are for you to find.' },
          answer: mu, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: deg(Math.atan(1 / M)), feedback: t`The slope is $1/\sqrt{M^2 - 1}$, not $1/M$: that gives $\sin\mu = 1/M$.` }, { value: 90 - mu, feedback: 'That is the angle to the normal; the question asks for the angle to the flow.' }],
          hints: [t`Characteristics: $(1 - M^2)\,dy^2 + dx^2 = 0$, so $dy/dx = \pm1/\sqrt{M^2 - 1}$.`, t`$\mu = \arctan\big(1/\sqrt{M^2 - 1}\big) = \arcsin(1/M)$.`],
          teach: 'In supersonic flow the characteristics are the Mach lines, at sin μ = 1/M to the stream.',
          explain: t`$\mu = \arcsin(1/${M}) = ${r3(mu)}°$. Faster flow, narrower cone: everything the wedge does is confined downstream of these lines. Real Mach waves from a thick wedge are oblique shocks at a somewhat larger angle; the linear theory is the thin-body limit.`,
        };
      },
    }),
    mcq({
      id: 'tricomi', difficulty: 2,
      prompt: t`The **Tricomi equation** $y\,u_{xx} + u_{yy} = 0$ models flow through the speed of sound. Where is it elliptic?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-2, 2], aspect: 'wide', xlabel: 'x', ylabel: 'y', axesAt: 'edge', xticks: 0, yticks: 0, shade: [{ fn: '2', lower: '0', from: -3.2, to: 3.2, color: 'accent', alpha: 0.12 }, { fn: '0', lower: '-2', from: -3.2, to: 3.2, color: 'warn', alpha: 0.12 }], hlines: [{ y: 0, label: 'y = 0', color: 'gold' }] }, caption: 'The two half-planes, shaded differently — which is which is the question.' },
      choices: [t`for $y > 0$`, t`for $y < 0$`, 'everywhere', 'nowhere: it is hyperbolic throughout'],
      answer: 0,
      why: {
        1: t`For $y < 0$, $B^2 - 4AC = -4y > 0$: hyperbolic there.`,
        2: t`The coefficient $A = y$ changes sign, so the type changes across $y = 0$.`,
        3: t`$B^2 - 4AC = -4y$ is negative for $y > 0$.`,
      },
      hints: [t`$A = y$, $B = 0$, $C = 1$: $B^2 - 4AC = -4y$.`],
      teach: 'With variable coefficients the type is decided point by point, and it can change across a curve.',
      explain: t`$B^2 - 4AC = -4y$: elliptic for $y > 0$ (the subsonic side), hyperbolic for $y < 0$ (supersonic), parabolic on the sonic line $y = 0$. Transonic aerodynamics lives across that change of type, which is why it is hard.`,
    }),
    num({
      id: 'char-slopes', difficulty: 3,
      gen(r) {
        const pairs = [[1, 3], [-1, 2], [2, -4], [1, -2], [1, -3], [-1, 3]];
        const [m1, m2] = r.pick(pairs);
        const B = m1 + m2, Cc = m1 * m2;
        const steep = Math.abs(m1) > Math.abs(m2) ? m1 : m2, other = steep === m1 ? m2 : m1;
        const eq = `u_{xx}${term(B, 'u_{xy}')}${term(Cc, 'u_{yy}')}`;
        return {
          prompt: t`Find the slopes $dy/dx$ of the two families of characteristics of $${eq} = 0$. Enter the one with the **larger magnitude**.`,
          visual: typeMap(t`This equation on the type diagram (gold dot): inside the hyperbolic region, so two real slopes exist.`, [{ x: Math.max(-5.8, Math.min(5.8, B)), y: Math.max(-13, Math.min(39, 4 * Cc)), color: 'gold' }]),
          answer: steep, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -steep, feedback: t`Watch the sign: the characteristic equation is $A\,(dy/dx)^2 - B\,(dy/dx) + C = 0$, with a minus in front of $B$.` }, { value: other, feedback: 'That is the other family — the one with the smaller magnitude.' }].filter((e) => e.value !== steep),
          hints: [t`Solve $A\lambda^2 - B\lambda + C = 0$ for $\lambda = dy/dx$, with $A = 1$, $B = ${B}$, $C = ${Cc}$.`, t`$\lambda^2 ${term(-B, '\\lambda')} ${Cc < 0 ? '-' : '+'} ${Math.abs(Cc)} = 0$ factors with integer roots.`, t`The roots multiply to $${Cc}$ and add to $${B}$.`],
          teach: 'The characteristic slopes are the roots of Aλ² − Bλ + C = 0.',
          explain: t`$\lambda^2 ${term(-B, '\\lambda')} ${Cc < 0 ? '-' : '+'} ${Math.abs(Cc)} = (\lambda ${m1 < 0 ? '+' : '-'} ${Math.abs(m1)})(\lambda ${m2 < 0 ? '+' : '-'} ${Math.abs(m2)})$, so the slopes are $${m1}$ and $${m2}$. Equivalently, the operator factors as $(\partial_x ${term(m1, '\\partial_y')})(\partial_x ${term(m2, '\\partial_y')})$ — two transport operators, each constant along its own family $y - \lambda x = $ const, just as d’Alembert factored the wave equation.`,
        };
      },
    }),
    mcq({
      id: 'system', difficulty: 2,
      prompt: t`A first-order system $\mathbf u_t + \mathsf A\,\mathbf u_x = 0$ is hyperbolic when $\mathsf A$ has real eigenvalues — the characteristic speeds — and a full set of eigenvectors. Which matrix gives a hyperbolic system?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [0, 2], aspect: 'wide', xlabel: 'x', ylabel: 't', axesAt: 'edge', xticks: 0, yticks: 0, curves: [...[-2, -1, 0, 1, 2].map((c) => ({ fn: `x - ${c}`, color: 'violet', width: 1.2, domain: [c, c + 2] })), ...[-2, -1, 0, 1, 2].map((c) => ({ fn: `${c} - x`, color: 'teal', width: 1.2, domain: [c - 2, c] }))] }, caption: 'Two families of characteristics with speeds +1 and −1 in the x–t plane: what real eigenvalues of A look like.' },
      choices: [t`$\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$`, t`$\begin{pmatrix} 0 & 1 \\ -1 & 0 \end{pmatrix}$`, t`$\begin{pmatrix} 0 & -4 \\ 1 & 0 \end{pmatrix}$`, t`$\begin{pmatrix} 1 & 2 \\ -2 & 1 \end{pmatrix}$`],
      answer: 0,
      why: {
        1: t`Its eigenvalues are $\pm i$: no real speeds. This system is $u_t = -v_x$, $v_t = u_x$ — the Cauchy–Riemann equations in disguise, elliptic.`,
        2: t`$\lambda^2 = -4$: eigenvalues $\pm2i$, elliptic.`,
        3: t`$(1 - \lambda)^2 = -4$: eigenvalues $1 \pm 2i$, complex — not hyperbolic.`,
      },
      hints: [t`For $\begin{pmatrix} a & b \\ c & d \end{pmatrix}$ the eigenvalues solve $\lambda^2 - (a + d)\lambda + (ad - bc) = 0$.`],
      teach: 'For a first-order system the characteristic speeds are the eigenvalues of A; real eigenvalues with a full set of eigenvectors mean hyperbolic.',
      explain: t`$\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$ has eigenvalues $\pm1$ with eigenvectors $(1, \pm1)$: two waves, one moving each way. It is the wave equation $u_{tt} = u_{xx}$ written as a system ($u_t + v_x = 0$, $v_t + u_x = 0$). Complex eigenvalues mean the elliptic case. The condition on eigenvectors becomes crucial in lesson B12.2.`,
    }),
    multi({
      id: 'which-hyperbolic', difficulty: 2,
      prompt: t`Which of these equations are hyperbolic? (Select all that apply; $t$ plays the role of the second variable.)`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [0, 2], aspect: 'wide', xlabel: 'x', ylabel: 't', axesAt: 'edge', xticks: 0, yticks: 0, shade: [{ fn: '1.5 - abs(x)', lower: '0', from: -1.5, to: 1.5, color: 'gold', alpha: 0.2 }], points: [{ x: 0, y: 1.5, color: 'gold', label: 'an event' }] }, caption: 'A domain of dependence: the mark of a hyperbolic equation, bounded by its characteristics.' },
      choices: [t`the telegraph equation $u_{tt} + 2\gamma u_t = c^2u_{xx}$`, t`the Klein–Gordon equation $u_{tt} - u_{xx} + m^2u = 0$`, t`the heat equation $u_t = Du_{xx}$`, t`Poisson’s equation $u_{xx} + u_{tt} = f$`, t`the wave equation $u_{tt} = c^2u_{xx}$`],
      answer: [0, 1, 4],
      why: {
        2: t`Its only second derivative is $u_{xx}$: $A = -D$, $B = C = 0$, so $B^2 - 4AC = 0$ — parabolic.`,
        3: t`$A = C = 1$, $B = 0$: $-4 < 0$, elliptic (the source $f$ is lower order).`,
      },
      hints: [t`Lower-order terms (damping $2\gamma u_t$, mass $m^2u$, sources) never change the type: look only at the second derivatives.`],
      teach: 'Damping, mass terms and sources are lower order: the telegraph and Klein–Gordon equations are as hyperbolic as the wave equation.',
      explain: t`The wave, telegraph and Klein–Gordon equations share the principal part $u_{tt} - c^2u_{xx}$, discriminant $4c^2 > 0$: same characteristics $x \pm ct$, same finite speed. Damping and mass change what travels along the cone, not the cone.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-reentry', difficulty: 2, transfer: true,
      gen(r) {
        const M = r.pick([10, 15, 20, 25]);
        const mu = deg(Math.asin(1 / M));
        return {
          prompt: t`A capsule re-enters at Mach ${M}. Far from the capsule, where the disturbance it makes is weak, the linearized flow equation $(1 - M^2)\phi_{xx} + \phi_{yy} + \phi_{zz} = 0$ holds. At what half-angle, in degrees, does its far-field Mach cone open around the flight path?`,
          visual: machVis(M > 12 ? 4 : 3, 'Mach lines behind a body (drawn at a lower Mach number so the cone is visible). Near a blunt capsule the flow is a strong bow shock, not a weak Mach wave.'),
          answer: mu, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 90 - mu, feedback: 'That is the angle from the normal to the flight path; the half-angle is measured from the path itself.' }],
          hints: [t`The characteristics make the angle $\mu$ with $\sin\mu = 1/M$ (the extra $\phi_{zz}$ only turns the lines into a cone).`],
          teach: 'The characteristics of supersonic flow form the Mach cone, sin μ = 1/M.',
          explain: t`$\mu = \arcsin(1/${M}) = ${r3(mu)}°$ — a needle-thin cone. In three dimensions the characteristic lines become a characteristic cone, exactly as the wave equation’s light-cone triangles become cones.`,
        };
      },
    }),
    mcq({
      id: 'cp-spacetime', difficulty: 3, transfer: true,
      prompt: t`With more than two variables, write the principal part as $\sum a_{ij}\,\partial_i\partial_j u$ and look at the eigenvalues of the symmetric matrix $(a_{ij})$: all the same sign means elliptic, one of opposite sign to the rest means hyperbolic, a zero eigenvalue means parabolic. In harmonic coordinates and flat spacetime, the principal part of Einstein’s equations is $\eta^{\mu\nu}\partial_\mu\partial_\nu = -\partial_t^2 + \partial_x^2 + \partial_y^2 + \partial_z^2$ (with $c = 1$). What type is it?`,
      visual: { type: 'graph', params: { x: [-2.2, 2.2], y: [-1.4, 1.4], aspect: 'wide', equal: true, xlabel: 'x', ylabel: 't', axesAt: 'edge', xticks: 0, yticks: 0, shade: [{ fn: '1.4', lower: 'abs(x)', from: -1.4, to: 1.4, color: 'accent', alpha: 0.15 }, { fn: '-abs(x)', lower: '-1.4', from: -1.4, to: 1.4, color: 'accent', alpha: 0.15 }], curves: [{ fn: 'abs(x)', color: 'gold', width: 2, domain: [-1.4, 1.4] }, { fn: '-abs(x)', color: 'gold', width: 2, domain: [-1.4, 1.4] }] }, caption: 'A light cone in one space dimension (c = 1).' },
      choices: ['hyperbolic: eigenvalues (−1, 1, 1, 1), one sign opposite — the characteristic cone is the light cone', 'elliptic: four eigenvalues of magnitude 1', 'parabolic: time appears with a minus sign', 'it cannot be classified: there are four variables'],
      answer: 0,
      why: {
        1: 'Magnitudes do not matter, signs do: one is negative, three are positive.',
        2: 'Parabolic needs a zero eigenvalue (a variable with no second derivative, as t in the heat equation). Here every variable has one.',
        3: 'The eigenvalue rule classifies any number of variables.',
      },
      hints: [t`The matrix is $\mathrm{diag}(-1, 1, 1, 1)$.`, 'Count signs: how many are opposite to the rest?'],
      teach: 'The principal part of a field equation inherits the signature of the metric: Lorentzian signature (−, +, +, +) means hyperbolic, with the light cone as the characteristic cone.',
      explain: t`$\mathrm{diag}(-1, 1, 1, 1)$ has one eigenvalue opposite to the other three: **hyperbolic** (often called “normally hyperbolic”). Its characteristic surfaces satisfy $-dt^2 + dx^2 + dy^2 + dz^2 = 0$ — light cones. That signals in general relativity travel at most at $c$ is this classification, with the curved metric $g^{\mu\nu}$ in place of $\eta^{\mu\nu}$.`,
    }),
    mcq({
      id: 'cp-sign-a', difficulty: 2, kind: 'error',
      prompt: t`A student classifies $u_{xx} + 3u_{xy} + u_{yy} = 0$: “$A$ and $C$ are both positive, as in Laplace’s equation, so it is elliptic.” What is wrong?`,
      visual: typeMap('The type diagram, with Laplace’s equation (B = 0, 4AC = 4) marked. Where does the student’s equation go?', [{ x: 0, y: 4, color: 'accent', label: 'Laplace', labelDy: 12 }]),
      choices: [t`The mixed term matters: $B^2 - 4AC = 9 - 4 = 5 > 0$, so it is hyperbolic`, 'Nothing: equal signs of A and C always mean elliptic', t`It is parabolic, because $A = C$`, 'The classification needs the lower-order terms, which are missing'],
      answer: 0,
      why: {
        1: t`Equal signs of $A$ and $C$ mean elliptic only when $B$ is small enough: $B^2 < 4AC$.`,
        2: t`$A = C$ says nothing about the type; parabolic needs $B^2 = 4AC$, here $9 \ne 4$.`,
        3: 'Lower-order terms never change the type; there are none here, and none are needed.',
      },
      hints: ['Compute the full discriminant, including B.'],
      teach: 'The type needs all three coefficients: the sign of B² − 4AC, not the signs of A and C alone.',
      explain: t`$B^2 - 4AC = 5$: hyperbolic, with characteristic slopes $(3 \pm \sqrt5)/2 \approx ${r3((3 + Math.sqrt(5)) / 2)}$ and $${r3((3 - Math.sqrt(5)) / 2)}$. A large mixed term turns a Laplace-looking equation into a wave equation in tilted coordinates.`,
    }),
  ],
  sources: [SRC.strauss, SRC.evans, { label: 'J. D. Anderson, Modern Compressible Flow, 3rd ed. (McGraw-Hill, 2003), ch. 9 and 11 (linearized flow, method of characteristics)', url: 'https://openlibrary.org/isbn/9780072424430' }],
});
