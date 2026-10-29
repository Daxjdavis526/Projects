// Pushforwards and pullbacks: a smooth map F carries vectors forward
// (F_*V)(g) = V(g∘F) — the Jacobian on components — and covectors back,
// (F^*ω)(V) = ω(F_*V). Line integrals done right: ∫_γ ω = ∫ γ^*ω, which is
// reparameterization-invariant and flips under reversal; induced metrics as
// pullbacks; why vectors cannot be pulled back; a Rogowski coil.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6, mesh } from './_dg.js';

const t = String.raw;
const PI = r6(Math.PI);
const SAD = (u, v) => [`${u}`, `${v}`, `${u}*${v}`];

export default lesson({
  id: 'st-c.C9.3',
  title: 'Pushforwards and pullbacks',
  minutes: 14, difficulty: 3,
  equation: t`(F^*\omega)(V) = \omega(F_*V), \qquad \int_\gamma\omega = \int_a^b \gamma^*\omega`,
  intro: t`A smooth map $F: M \to N$ moves things between manifolds, but not everything moves the same way. A **vector** at $p$ is **pushed forward**: $F_*V$ is the vector at $F(p)$ that differentiates a function $g$ on $N$ by $(F_*V)(g) = V(g\circ F)$. In coordinates it is the Jacobian matrix acting on the components — a velocity carried along by the map.

A **covector** at $F(p)$ is **pulled back** to $p$: $F^*\omega$ eats a vector at $p$ by pushing it forward and feeding it to $\omega$. Pullbacks always work, even when $F$ squashes many points together, and they are how forms are integrated. For a curve $\gamma: [a, b] \to M$, the **pullback** $\gamma^*\omega$ is a 1-form on the interval, $\omega_\mu(\gamma(t))\,\dfrac{d\gamma^\mu}{dt}\,dt$, and the **line integral** is simply its ordinary integral — the formula $\int\mathbf F\cdot d\mathbf r$, with no metric and no arrows needed.`,
  symbols: [
    { tex: 'F: M \\to N', text: 'a smooth map between manifolds (a curve, a chart, an embedding, a projection…)' },
    { tex: 'F_*V', text: t`the pushforward of a vector $V$ at $p$: a vector at $F(p)$, with components $\dfrac{\partial F^\alpha}{\partial x^\mu}V^\mu$` },
    { tex: t`F^*\omega`, text: t`the pullback of a covector $\omega$ at $F(p)$: a covector at $p$, with components $\omega_\alpha\dfrac{\partial F^\alpha}{\partial x^\mu}$` },
    { tex: t`\gamma`, text: t`a curve, $t \mapsto \gamma(t)$ for $a \le t \le b$` },
    { tex: t`\gamma^*\omega`, text: t`the 1-form on $[a, b]$ that $\omega$ becomes along the curve: $\omega_\mu\,\dot\gamma^\mu\,dt$` },
  ],
  why: t`Pullbacks are everywhere in GR: the metric a surface inherits from the space around it is a pullback (that was C4’s first fundamental form), the proper time along a worldline is the integral of a pulled-back form, and the flux through a hypersurface is a 3-form pulled back to it.`,
  visual: {
    type: 'c3-lineint',
    title: 'A 1-form pulled back along a path',
    lead: t`The 1-form $\omega = -y\,dx + x\,dy$ (drawn as arrows $(-y, x)$) and a path through it. The lower graph is the pullback $\gamma^*\omega$ — the coefficient of $dt$ — against the parameter; its area so far is the integral so far.`,
    tasks: [
      t`Ride the half-ellipse $(2\cos t, \sin t)$: the pullback is the constant $2\,dt$, and the total is $2\pi \approx 6.28$.`,
      t`Change the pace (reparameterize): the lower graph changes shape completely, but its area — the integral — does not. Reverse the path and every contribution flips sign.`,
      t`Compare with the straight path along the axis between the same ends: along it $y = 0$ and $dy = 0$, so $\gamma^*\omega = 0$. Different paths, different answers — $\omega$ is not the differential of any function.`,
    ],
    params: {
      P: '-y', Q: 'x', x: [-3, 3], y: [-1.5, 1.8],
      paths: [{ x: '2*cos(t)', y: 'sin(t)', t: [0, 'pi'], label: 'C₁', color: 'gold', labelAt: 0.35 }, { x: '2 - 4*t', y: '0', t: [0, 1], label: 'C₂', color: 'violet', labelAt: 0.6 }],
      reparam: true, reverseToggle: true, compare: true, at: 0.35,
    },
    caption: t`Drawing a 1-form as arrows uses the Euclidean metric to raise it; the pullback and the integral do not. Arrow lengths are compressed; the integrals are computed numerically.`,
  },
  example: {
    prompt: t`Pull back $\omega = -y\,dx + x\,dy$ along $\gamma(t) = (2\cos t, \sin t)$, $0 \le t \le \pi$, and integrate. Then use the new parameter $t = s^2$, $0 \le s \le \sqrt\pi$, and show the answer is unchanged.`,
    visual: { type: 'c3-lineint', params: { P: '-y', Q: 'x', x: [-3, 3], y: [-1.5, 1.8], paths: [{ x: '2*cos(t)', y: 'sin(t)', t: [0, 'pi'], label: 'γ', color: 'gold', labelAt: 0.35 }], at: 0.6, readout: false }, caption: 'The half-ellipse through the field of ω, and its pullback (lower graph): a constant.' },
    steps: [
      { label: 'Pull back the coordinates', text: t`Along the curve $x = 2\cos t$ and $y = \sin t$, so $\gamma^*dx = -2\sin t\,dt$ and $\gamma^*dy = \cos t\,dt$.` },
      { label: 'Substitute', text: t`$\gamma^*\omega = -\sin t\,(-2\sin t\,dt) + 2\cos t\,(\cos t\,dt) = 2(\sin^2 t + \cos^2 t)\,dt = 2\,dt$.` },
      { label: 'Integrate', text: t`$\int_\gamma\omega = \int_0^\pi 2\,dt = 2\pi \approx 6.283$. Closed up along the axis, where $\omega$ pulls back to 0, the half-ellipse bounds a region of area $\pi$, and $\omega$ measures twice the enclosed area — a fact C10.3 explains.` },
      { label: 'New pace', text: t`With $t = s^2$: $\tilde\gamma(s) = \gamma(s^2)$, and the chain rule gives $\tilde\gamma^*\omega = 2\,d(s^2) = 4s\,ds$.` },
      { label: 'Same total', text: t`$\int_0^{\sqrt\pi}4s\,ds = 2s^2\big|_0^{\sqrt\pi} = 2\pi$ ✓. Pullback and change of variables are the same operation, so the integral belongs to the *oriented curve*, not the parameter.` },
    ],
    answer: t`$\gamma^*\omega = 2\,dt$ and $\int_\gamma\omega = 2\pi$; with $t = s^2$ the pullback is $4s\,ds$ and the integral is again $2\pi$.`,
  },
  practice: [
    num({
      id: 'pushforward', difficulty: 2,
      gen(r) {
        const [x, y] = r.pick([[1, 0.5], [0.8, 0.6], [1.2, 0.3], [0.5, 1]]);
        const [a, b] = r.pick([[1, 0], [0, 1], [1, 1], [1, -1]]);
        const comp = r.pick([0, 1]);
        const J = [[2 * x, -2 * y], [2 * y, 2 * x]];
        const W = [J[0][0] * a + J[0][1] * b, J[1][0] * a + J[1][1] * b];
        const Fp = [x * x - y * y, 2 * x * y];
        return {
          prompt: t`The map $F(x, y) = (x^2 - y^2,\ 2xy)$ (squaring, as a complex number) sends $p = (${x}, ${y})$ to $F(p)$. Push the vector $V = (${a}, ${b})$ at $p$ forward. What is the ${comp ? 'second' : 'first'} component of $F_*V$?`,
          visual: { type: 'graph', params: { x: [-1.2, 2.6], y: [-0.5, 2.2], equal: true, aspect: 'wide', xticks: 5, yticks: 4, points: [{ x, y, color: 'gold', label: 'p' }, { x: r6(Fp[0]), y: r6(Fp[1]), color: 'violet', label: 'F(p)' }], arrows: [{ from: [x, y], to: [r6(x + 0.4 * a), r6(y + 0.4 * b)], color: 'gold', width: 2.4, label: 'V' }], curves: [{ param: [`${x} + 0.6*t`, `${y}`], t: [-1, 1], color: 'ink4', dash: [4, 4] }, { param: [`(${x} + 0.6*t)^2 - ${y * y}`, `2*(${x} + 0.6*t)*${y}`], t: [-1, 1], color: 'ink3', dash: [4, 4] }] }, caption: t`The point $p$ and $V$ (gold, at 0.4 of its length), and the image point $F(p)$. Dashed: a horizontal line through $p$ (faint) and its image under $F$, a parabola.` },
          answer: W[comp], tol: { rel: 0, abs: 0.01 },
          errors: [{ value: comp ? b : a, feedback: 'A map stretches and turns vectors: multiply by the Jacobian matrix of F at p.' }, { value: comp ? J[0][1] * a + J[1][1] * b : J[0][0] * a + J[1][0] * b, feedback: 'You used the transposed Jacobian. Row α of the Jacobian is the gradient of the α-th output.' }].filter((e) => Math.abs(e.value - W[comp]) > 0.02),
          hints: [t`$F_*V = J\,V$ with $J = \begin{pmatrix} \partial_x(x^2 - y^2) & \partial_y(x^2 - y^2) \\ \partial_x(2xy) & \partial_y(2xy)\end{pmatrix} = \begin{pmatrix} 2x & -2y \\ 2y & 2x\end{pmatrix}$.`, t`At $p$, $J = \begin{pmatrix} ${nice(J[0][0])} & ${nice(J[0][1])} \\ ${nice(J[1][0])} & ${nice(J[1][1])}\end{pmatrix}$.`],
          teach: 'The pushforward of a vector is the Jacobian matrix of the map acting on its components.',
          explain: t`$F_*V = (${nice(W[0])},\ ${nice(W[1])})$ at $F(p) = (${nice(Fp[0])}, ${nice(Fp[1])})$. Equivalently, $F_*V$ is the velocity of the image of the curve $p + tV$. This map multiplies every vector’s length by $2|p|$ and turns it by the angle of $p$ — it is conformal.`,
        };
      },
    }),
    num({
      id: 'line-integral', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, -1]), n = r.pick([2, 3]);
        const ans = (a + b * n) / (n + 1);
        return {
          prompt: t`Integrate the 1-form $\omega = ${a === 1 ? '' : a}y\,dx ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x\,dy$ along the curve $\gamma(t) = (t,\ t^${n})$, $0 \le t \le 1$, by pulling it back.`,
          visual: { type: 'c3-lineint', params: { P: `${a}*y`, Q: `${b}*x`, x: [-0.6, 1.6], y: [-0.4, 1.3], paths: [{ x: 't', y: `t^${n}`, t: [0, 1], label: 'γ', color: 'gold', labelAt: 0.5 }], readout: false, integrand: false, bead: false }, caption: t`The curve $y = x^${n}$ from $(0, 0)$ to $(1, 1)$ through the field of $\omega$ (as arrows).` },
          answer: ans, tol: { rel: 0.002 }, integrand: `(${a} + ${b * n})*t^${n}`, limits: [0, 1], vars: { t: [0, 1] },
          errors: [{ value: (a + b) / (n + 1), feedback: t`Pull back $dy$ properly: $\gamma^*dy = d(t^${n}) = ${n}t^${n - 1}\,dt$, not $dt$.` }, { value: a / (n + 1) + b / 2, feedback: t`Along the curve $x = t$ and $y = t^${n}$; substitute both before integrating.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\gamma^*x = t$, $\gamma^*y = t^${n}$, $\gamma^*dx = dt$, $\gamma^*dy = ${n}t^${n - 1}\,dt$.`, t`$\gamma^*\omega = (${a}t^${n} + ${b}\cdot ${n}t^${n})\,dt$.`],
          teach: 'To integrate a 1-form along a curve, pull it back: substitute the curve into the coefficients and the differentials, then integrate in t.',
          explain: t`$\gamma^*\omega = ${a + b * n}\,t^${n}\,dt$, so $\int_\gamma\omega = ${a + b * n}/${n + 1} = ${nice(ans, 4)}$.`,
        };
      },
    }),
    expr({
      id: 'pullback-expr', difficulty: 2,
      gen(r) {
        const p = r.pick([1, 2]), q = r.pick([2, 3]);
        const k = p + q;
        return {
          prompt: t`Pull back $\omega = y\,dx + x\,dy$ along $\gamma(t) = (t^{${p}},\ t^{${q}})$: write $\gamma^*\omega = h(t)\,dt$ and give $h(t)$.`,
          visual: { type: 'graph', params: { x: [-0.3, 1.6], y: [-0.2, 1.6], equal: true, aspect: 'wide', xticks: 5, yticks: 4, curves: [{ param: [`t^${p}`, `t^${q}`], t: [0, 1.2], color: 'gold', width: 2.4, label: 'γ', labelAt: 0.9 }, ...[0.25, 0.5, 1, 1.5].map((c) => ({ fn: `${c}/x`, domain: [r6(c / 1.6), 1.6], color: 'teal', width: 1 }))] }, caption: t`The curve (gold) over the level curves of $xy$ (teal) — a hint about what $\omega$ is.` },
          answer: `${k}t^${k - 1}`, answerTeX: t`${k}t^{${k - 1}}`, vars: { t: [0.2, 2] },
          errors: [{ answer: `t^${q} + t^${p}`, feedback: t`Pull back the differentials too: $\gamma^*dx = ${p === 1 ? 'dt' : t`${p}t^{${p - 1}}\,dt`}$ and $\gamma^*dy = ${q}t^{${q - 1}}\,dt$.` }],
          hints: [t`$\gamma^*(y\,dx) = t^{${q}}\cdot ${p === 1 ? '1' : t`${p}t^{${p - 1}}`}\,dt$ and $\gamma^*(x\,dy) = t^{${p}}\cdot ${q}t^{${q - 1}}\,dt$.`, t`Or notice $\omega = d(xy)$, and pullback commutes with $d$: $\gamma^*\omega = d(t^{${k}})$.`],
          teach: t`Pullback commutes with $d$: $\gamma^*(df) = d(f\circ\gamma)$.`,
          explain: t`$\gamma^*\omega = (${p} + ${q})\,t^{${k - 1}}\,dt = ${k}t^{${k - 1}}\,dt$, which is $d(t^{${k}})$ — the pullback of $d(xy)$ is $d$ of the pullback of $xy$.`,
        };
      },
    }),
    mcq({
      id: 'reverse', difficulty: 2,
      prompt: t`$\int_\gamma\omega = 5$ for a curve $\gamma$ from $P$ to $Q$. What is the integral along (i) the same curve traced at a different, steadily increasing pace, and (ii) the same curve traced from $Q$ back to $P$?`,
      visual: { type: 'c3-lineint', params: { P: '-y', Q: 'x', x: [-3, 3], y: [-1.5, 1.8], paths: [{ x: '2*cos(t)', y: 'sin(t)', t: [0, 'pi'], label: 'γ', color: 'gold', labelAt: 0.35 }], at: 0.5, readout: false, points: [{ x: 2, y: 0, label: 'P' }, { x: -2, y: 0, label: 'Q' }] }, caption: 'A path from P to Q and the pullback of a 1-form along it.' },
      choices: ['(i) 5, (ii) −5', '(i) depends on the pace, (ii) −5', '(i) 5, (ii) 5', '(i) 5, (ii) 0'],
      answer: 0,
      why: {
        1: 'An increasing change of parameter is a substitution: the pullback changes but its integral does not.',
        2: t`Reversing swaps the limits of the $t$-integral, which flips the sign.`,
        3: 'The return trip is not a closed loop on its own; only the round trip P → Q → P totals 0.',
      },
      hints: ['A reparameterization t = φ(s) turns the pullback into a substitution.', 'Swapping the limits of an integral changes its sign.'],
      teach: 'Integrals of 1-forms depend on the oriented curve: independent of pace, odd under reversal.',
      explain: t`(i) $\int\omega_\mu(\gamma(\phi(s)))\,\dfrac{d\gamma^\mu}{dt}\phi'(s)\,ds$ is the same integral by substitution. (ii) A decreasing $\phi$ swaps the limits: $-5$. Integrating forms needs an **orientation**, not a metric — the theme of C10.3.`,
    }),
    num({
      id: 'induced', difficulty: 2,
      gen(r) {
        const u = r.pick([1, 0.5, -1, 1.5]), v = r.pick([1, 2, -0.5]);
        const comp = r.pick(['uu', 'uv', 'vv']);
        const val = comp === 'uu' ? 1 + v * v : comp === 'uv' ? u * v : 1 + u * u;
        return {
          prompt: t`The saddle is the map $X(u, v) = (u, v, uv)$ into $\mathbb R^3$. Pull back the Euclidean metric $dx^2 + dy^2 + dz^2$ along it, and give the component $g_{${comp}}$ at $(u, v) = (${u}, ${v})$.`,
          visual: { type: 'calc-vectors3d', params: { range: 2, grid: false, curves: mesh(SAD, [-1.5, 1.5], [-1.5, 1.5], { nu: 8, nv: 8, color: 'ink3', width: 1 }), points: [{ at: [u, v, r6(u * v)], color: 'gold', label: 'p' }] }, caption: t`The saddle $z = uv$ drawn by its coordinate curves, and the point.` },
          answer: val, tol: { rel: 0, abs: 0.005 },
          errors: [{ value: comp === 'uu' ? 1 : comp === 'uv' ? 0 : 1, feedback: t`Pull back $dz$ too: $X^*dz = d(uv) = v\,du + u\,dv$, which contributes to every component.` }, { value: comp === 'uu' ? 1 + u * u : comp === 'uv' ? 2 * u * v : 1 + v * v, feedback: comp === 'uv' ? t`$(v\,du + u\,dv)^2$ has the cross term $2uv\,du\,dv$, which the symmetric metric splits as $g_{uv} = g_{vu} = uv$.` : t`$dz^2 = (v\,du + u\,dv)^2$: the $du^2$ term has coefficient $v^2$.` }].filter((e) => Math.abs(e.value - val) > 0.01),
          hints: [t`$X^*dx = du$, $X^*dy = dv$, $X^*dz = v\,du + u\,dv$.`, t`$X^*g = du^2 + dv^2 + (v\,du + u\,dv)^2 = (1 + v^2)\,du^2 + 2uv\,du\,dv + (1 + u^2)\,dv^2$.`],
          teach: 'The metric a surface inherits is the pullback of the ambient metric — the first fundamental form of C4.',
          explain: t`$g_{${comp}} = ${nice(val)}$. These are $E = 1 + v^2$, $F = uv$, $G = 1 + u^2$ from [C4.1](#/lesson/st-c.C4.1), now seen as a pullback: no normal vectors, only the map and the metric of the space it lands in.`,
        };
      },
    }),
    mcq({
      id: 'no-pullback-vectors', difficulty: 2,
      prompt: t`The projection $\pi(x, y) = x$ maps the plane onto the line. Covectors pull back without trouble: $\pi^*(dx) = dx$. Why is there no general way to pull a **vector** on the line back to the plane?`,
      visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.5, 1.5], equal: true, aspect: 'wide', xticks: 5, yticks: 3, curves: [{ fn: '-1.2', color: 'accent', width: 2.4 }], arrows: [{ from: [0.8, 0.9], to: [0.8, -1.1], color: 'ink3', width: 1.2, dash: [4, 4] }, { from: [0.8, 0.2], to: [1.6, 0.6], color: 'gold', width: 2.2, label: 'W₁' }, { from: [0.8, 0.2], to: [1.6, -0.3], color: 'violet', width: 2.2, label: 'W₂' }, { from: [0.8, -1.2], to: [1.6, -1.2], color: 'teal', width: 2.6, label: 'V' }], points: [{ x: 0.8, y: 0.2, color: 'ink', label: 'p' }] }, caption: t`The projection drops each point straight down onto the line (blue). Both $W_1$ and $W_2$ at $p$ project to the same $V$.` },
      choices: [
        t`$\pi_*$ is not one-to-one: many vectors at $p$ (and many points $p$) map to the same $V$, so “the” vector that pushes forward to $V$ is not defined`,
        'Vectors cannot be moved by maps at all',
        t`The line has dimension 1 and the plane 2, so no linear map between them exists`,
        'Pulling back needs a metric on the line',
      ],
      answer: 0,
      why: {
        1: t`They can be pushed forward — $\pi_*$ takes $(a, b)$ to $a$.`,
        2: t`Linear maps between spaces of different dimensions exist in both directions; the issue is that there is no *natural* one here.`,
        3: t`Pulling back a covector needs no metric: $(\pi^*\omega)(W) = \omega(\pi_*W)$ uses only the pushforward.`,
      },
      hints: [t`To pull back $V$ you would need a $W$ with $\pi_*W = V$. How many are there?`],
      teach: 'Vectors push forward and covectors pull back; a vector can be pulled back only along a map that can be inverted (a diffeomorphism).',
      explain: t`Pullback of forms is defined by $(\pi^*\omega)(W) = \omega(\pi_*W)$ — composition, always available. Pulling back a vector would need $\pi_*^{-1}$, which does not exist. This asymmetry is why integration is done with forms: they can always be dragged back to a parameter domain.`,
    }),
    order({
      id: 'reparam-proof', difficulty: 3,
      prompt: t`Prove that $\int_{\gamma\circ\phi}\omega = \int_\gamma\omega$ when $\phi: [c, d] \to [a, b]$ is increasing and smooth with $\phi(c) = a$, $\phi(d) = b$. Order the steps.`,
      visual: { type: 'graph', params: { x: [0, 1.9], y: [0, 3.4], aspect: 'wide', xticks: 5, yticks: 5, xlabel: 's', ylabel: 't = φ(s)', curves: [{ fn: 'x^2', domain: [0, r6(Math.sqrt(Math.PI))], color: 'accent', width: 2.4 }], hlines: [{ y: PI, color: 'ink3', label: 'b = π' }] }, caption: t`An increasing reparameterization, $t = s^2$ from the worked example.` },
      items: [
        t`$(\gamma\circ\phi)^*\omega = \phi^*(\gamma^*\omega)$, because pulling back along a composite is pulling back twice.`,
        t`Write $\gamma^*\omega = h(t)\,dt$; then $\phi^*(h(t)\,dt) = h(\phi(s))\,\phi'(s)\,ds$.`,
        t`So $\int_{\gamma\circ\phi}\omega = \int_c^d h(\phi(s))\,\phi'(s)\,ds$.`,
        t`By substitution $t = \phi(s)$ this equals $\int_a^b h(t)\,dt = \int_\gamma\omega$.`,
      ],
      hints: ['Write the new pullback in terms of the old one.', 'Then recognise the integral as a substitution.'],
      teach: 'The pullback of dt under t = φ(s) is φ′(s) ds: the change-of-variables formula is a pullback.',
      explain: t`If $\phi$ were decreasing, $\phi(c) = b$ and $\phi(d) = a$, and the same steps give $-\int_\gamma\omega$. Pullback, substitution and the Jacobian factor of multiple integrals (C10.3) are all one idea.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rogowski', difficulty: 3, transfer: true,
      gen(r) {
        const I = r.pick([200, 500, 1200]), deg = r.pick([90, 120, 180, 270]);
        const mu0 = 4 * Math.PI * 1e-7, ans = (mu0 * I * deg) / 360;
        return {
          prompt: t`Around a long straight wire carrying current $I$, the magnetic field is the 1-form $B = \dfrac{\mu_0 I}{2\pi}\,d\theta$ (with $\theta$ the angle round the wire), so its pullback along any path depends only on how far round the wire the path goes. A curved current sensor spans $${deg}^\circ$ around a wire carrying $I = ${I}$ A. What is $\int B$ along it, in $\text{T m}$? ($\mu_0 = 4\pi\times10^{-7}\ \text{T m/A}$.)`,
          visual: { type: 'graph', params: { x: [-2, 2], y: [-1.4, 1.4], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, curves: [{ param: [`(1 + 0.25*sin(3*t))*cos(t)`, `(1 + 0.25*sin(3*t))*sin(t)`], t: [0, r6((deg * Math.PI) / 180)], color: 'gold', width: 3 }, ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({ param: [`t*${r6(Math.cos((k * Math.PI) / 4))}`, `t*${r6(Math.sin((k * Math.PI) / 4))}`], t: [0.15, 1.9], color: 'teal', width: 1 }))], points: [{ x: 0, y: 0, color: 'ink', label: 'wire', r: 5 }] }, caption: t`The wire seen end-on, the stack of $d\theta$ (rays) and the sensor’s wiggly path (gold). Only the rays crossed count.` },
          answer: ans, units: 'T m', tol: { rel: 0.005 },
          errors: [{ value: mu0 * I, feedback: t`That is a full circuit, $2\pi$ of $\theta$. The sensor covers $${deg}^\circ$ only.` }, { value: (mu0 * I * deg) / (2 * Math.PI), feedback: 'Convert the angle to radians (or use the fraction of a full turn).' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\gamma^*B = \dfrac{\mu_0 I}{2\pi}\,\gamma^*d\theta$, and $\int\gamma^*d\theta$ is the total change in $\theta$ along the path.`, t`$\Delta\theta = ${deg}^\circ = ${nice((deg * Math.PI) / 180, 4)}$ rad.`],
          teach: 'A 1-form that is a multiple of dθ integrates to that multiple times the angle swept, whatever the path’s shape.',
          explain: t`$\int B = \dfrac{\mu_0 I}{2\pi}\Delta\theta = ${tex(ans, 3)}\ \text{T m}$. A Rogowski coil closes the loop ($\Delta\theta = 2\pi$) and reads $\mu_0 I$ whatever its shape — which is how it measures current without touching the wire. ($d\theta$ is closed but not exact: C10.2.)`,
        };
      },
    }),
    num({
      id: 'cp-stretch', difficulty: 2,
      gen(r) {
        const [x, y] = r.pick([[1, 1], [0.6, 0.8], [2, 0], [1.5, -2], [0.3, 0.4]]);
        const ans = 2 * Math.hypot(x, y);
        return {
          prompt: t`For $F(x, y) = (x^2 - y^2,\ 2xy)$, how long is $F_*V$ when $V$ is a unit vector (in the usual metric) at $p = (${x}, ${y})$? Try $V = \partial_x$.`,
          visual: { type: 'graph', params: { x: [-2.6, 2.6], y: [-2.6, 2.6], equal: true, aspect: 'wide', xticks: 5, yticks: 5, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, r6(2 * Math.PI)], color: 'ink4' }], points: [{ x, y, color: 'gold', label: 'p' }], arrows: [{ from: [x, y], to: [x + 0.5, y], color: 'gold', width: 2.2, label: '½∂x' }] }, caption: 'The point p and half of the unit vector ∂x there; the faint circle has radius 1.' },
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: Math.hypot(x, y), feedback: t`The Jacobian has entries $2x$ and $2y$: the factor is $2|p|$.` }, { value: x * x + y * y, feedback: t`That is $|F(p)| = |p|^2$; the stretch of vectors is the derivative, $2|p|$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$F_*\partial_x = (2x,\ 2y)$, the first column of the Jacobian.`],
          teach: 'The pushforward stretches vectors by the Jacobian; for the squaring map every vector at p is stretched by 2|p|.',
          explain: t`$F_*\partial_x = (${nice(2 * x)}, ${nice(2 * y)})$, of length $2\sqrt{${nice(x * x + y * y)}} = ${nice(ans, 4)}$. Every unit vector at $p$ is stretched by the same factor (and turned by the same angle): the squaring map is conformal, like the stereographic charts of C8.1.`,
        };
      },
    }),
    mcq({
      id: 'cp-commute', difficulty: 2,
      prompt: t`For a smooth map $F: M \to N$ and a function $g$ on $N$, which is $F^*(dg)$?`,
      visual: { type: 'graph', params: { x: [-1.2, 2.6], y: [-0.5, 2.2], equal: true, aspect: 'wide', xticks: 5, yticks: 4, curves: [{ param: ['1 + 0.6*t', '0.5'], t: [-1, 1], color: 'ink4', dash: [4, 4] }, { param: ['(1 + 0.6*t)^2 - 0.25', '2*(1 + 0.6*t)*0.5'], t: [-1, 1], color: 'ink3', dash: [4, 4] }], points: [{ x: 1, y: 0.5, color: 'gold', label: 'p' }, { x: 0.75, y: 1, color: 'violet', label: 'F(p)' }] }, caption: 'A map carries p to F(p); a function on the target can be read at p by composing.' },
      choices: [t`$d(g\circ F)$`, t`$dg\circ F$, the covector $dg$ at $p$`, t`$F_*(dg)$`, t`$d(F\circ g)$`],
      answer: 0,
      why: {
        1: t`$dg$ lives at $F(p)$, not at $p$; it must be pulled back, and the pulled-back covector is $d(g\circ F)$.`,
        2: t`Pushforward acts on vectors, not covectors.`,
        3: t`$F\circ g$ makes no sense: $g$ outputs numbers, which $F$ does not accept.`,
      },
      hints: [t`Evaluate $F^*(dg)$ on a vector $V$: $dg(F_*V) = (F_*V)(g) = V(g\circ F)$.`],
      teach: t`Pullback commutes with the differential: $F^*(dg) = d(F^*g) = d(g\circ F)$.`,
      explain: t`$(F^*dg)(V) = dg(F_*V) = (F_*V)(g) = V(g\circ F) = d(g\circ F)(V)$. This is the chain rule, and it extends to all forms in C10.2: $F^*d = dF^*$.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §A (maps between manifolds) and §2.9', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Lee, Introduction to Smooth Manifolds (2nd ed.), ch. 3 and 11', url: 'https://link.springer.com/book/10.1007/978-1-4419-9982-5' },
  ],
});
