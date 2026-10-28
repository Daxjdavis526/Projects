// Affine connections: the extra structure that says which vector at q is
// "the same" as a given vector at p. Axioms (tensorial in the direction,
// Leibniz in the field) force ∇_X Y = X^μ(∂_μY^λ + Γ^λ_μν Y^ν)∂_λ; n³
// coefficients; Γ is not a tensor (it appears from nothing under a change of
// chart) while the difference of two connections is. Two connections on one
// sphere: Levi-Civita (a free gyroscope) and the compass connection (keep
// the bearing); their gap is a navigator's transport wander.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;
const DEG = Math.PI / 180;
const A_EARTH = 6371.0;   // km

const spherePic = (metric, caption, extra = {}) => ({
  type: 'dg4-chart',
  params: { metric, mode: 'transport', P: [1.0, 0.9], Q: [2.6, 1.6], drag: false, readout: false, field: false, angle: 90, sliders: [], ...extra },
  caption,
});

export default lesson({
  id: 'st-c.C12.1',
  title: 'Affine connections',
  minutes: 14, difficulty: 3,
  equation: t`\nabla_X Y = X^\mu\big(\partial_\mu Y^\lambda + \Gamma^\lambda{}_{\mu\nu}\,Y^\nu\big)\,\partial_\lambda`,
  intro: t`A vector at $p$ lives in $T_pM$ and a vector at $q$ in $T_qM$: two different spaces, with no built-in way to compare them, so no built-in way to differentiate a vector field. A **connection** $\nabla$ supplies the rule. Given a direction $X$ at a point and a vector field $Y$, it returns a vector $\nabla_XY$ there, obeying two axioms:

- **tensorial in the direction:** $\nabla_{fX + gZ}Y = f\nabla_XY + g\nabla_ZY$ for functions $f, g$;
- **a derivative of the field:** $\nabla_X(Y + Z) = \nabla_XY + \nabla_XZ$ and $\nabla_X(fY) = X(f)\,Y + f\,\nabla_XY$.

In a chart everything is then fixed by $n^3$ functions, $\nabla_{\partial_\mu}\partial_\nu = \Gamma^\lambda{}_{\mu\nu}\,\partial_\lambda$ (derivative index first, as in Carroll), and the formula above follows. **A manifold carries many connections;** nothing so far mentions a metric. C12.3 shows how a metric picks one out.`,
  symbols: [
    { tex: t`\nabla_XY`, text: t`the covariant derivative of the field $Y$ in the direction $X$: a vector at the point where $X$ sits` },
    { tex: t`X^\mu,\ Y^\lambda`, text: t`components of the direction and of the field in the chart’s basis $\partial_\mu$` },
    { tex: t`\partial_\mu Y^\lambda`, text: 'how the components change — half the story, since the basis changes too' },
    { tex: t`\Gamma^\lambda{}_{\mu\nu}`, text: t`the connection coefficients: the $\lambda$ component of the change of $\partial_\nu$ along $\partial_\mu$; $n^3$ functions, 8 in 2D, 64 in 4D` },
  ],
  why: t`A connection is what lets GR write laws as derivatives — $\nabla_\mu T^{\mu\nu} = 0$, the geodesic equation, the curvature. Gravity in GR is the Levi-Civita connection of spacetime’s metric; other choices (with torsion) are what teleparallel and Einstein–Cartan theories explore.`,
  visual: {
    type: 'dg4-chart',
    title: 'One sphere, two rules for “the same vector”',
    lead: t`The unit sphere’s chart ($\varphi$ across, $\theta$ down from the north pole). A vector at P is carried to Q along two routes — blue along the parallel first, violet along the meridian first — by a **rule for comparing vectors**. Switch the rule.`,
    tasks: [
      t`Levi-Civita (the sphere): the two routes deliver different arrows at Q. "The same vector over there" depends on the path.`,
      t`Compass connection: "keep the same angle to north" — both routes agree, at every Q. This rule is path-independent, yet it is a different rule from Levi-Civita on the same sphere with the same metric.`,
      t`Drag Q to the equator ($\theta = 90^\circ$): the routes still disagree under Levi-Civita. The gap is the curvature enclosed, as in C6.3.`,
    ],
    params: { metric: 'sphere', metrics: ['sphere', 'compass'], mode: 'transport', P: [1.0, 0.9], Q: [2.6, 1.6], sliders: ['angle'], angle: 60, field: false, readout: ['turn', 'area'] },
    caption: t`Arrows drawn by their chart components; both rules keep lengths. Readout: the turn round the loop (from the second arrival to the first), and $\iint K\,dA$ of the rectangle for the connection shown (the compass connection has none).`,
  },
  example: {
    prompt: t`On the unit sphere, $ds^2 = d\theta^2 + \sin^2\theta\,d\varphi^2$, the **compass connection** declares the unit vectors pointing south, $\hat e_\theta = \partial_\theta$, and east, $\hat e_\varphi = \partial_\varphi/\sin\theta$, to be constant: $\nabla_X\hat e_\theta = \nabla_X\hat e_\varphi = 0$ for every $X$. Find its $\Gamma$’s, and compare $\nabla_{\partial_\varphi}\partial_\varphi$ with the Levi-Civita value.`,
    visual: spherePic('compass', 'The compass connection carrying an arrow from P to Q by two routes: they agree, and the arrow keeps its angle to the meridians.'),
    steps: [
      { label: 'Basis along theta', text: t`$\partial_\theta = \hat e_\theta$ is constant, so $\nabla_\mu\partial_\theta = 0$: $\Gamma^\lambda{}_{\theta\theta} = \Gamma^\lambda{}_{\varphi\theta} = 0$.` },
      { label: 'Basis along phi', text: t`$\partial_\varphi = \sin\theta\,\hat e_\varphi$. Leibniz: $\nabla_X\partial_\varphi = X(\sin\theta)\,\hat e_\varphi + \sin\theta\,\nabla_X\hat e_\varphi = X(\sin\theta)\,\hat e_\varphi$.` },
      { label: 'Read off', text: t`$X = \partial_\theta$: $\nabla_\theta\partial_\varphi = \cos\theta\,\hat e_\varphi = \cot\theta\,\partial_\varphi$, so $\Gamma^\varphi{}_{\theta\varphi} = \cot\theta$. $X = \partial_\varphi$: $\nabla_\varphi\partial_\varphi = 0$. Every other $\Gamma$ vanishes.` },
      { label: 'Not symmetric', text: t`$\Gamma^\varphi{}_{\theta\varphi} = \cot\theta$ but $\Gamma^\varphi{}_{\varphi\theta} = 0$. Nothing in the axioms forbade that.` },
      { label: 'Compare', text: t`The sphere’s Levi-Civita connection (C13.1) has $\Gamma^\theta{}_{\varphi\varphi} = -\sin\theta\cos\theta$, so $\nabla_\varphi\partial_\varphi = -\sin\theta\cos\theta\,\partial_\theta$: going east, the east-pointing vector tips toward the north (unless $\theta = 90^\circ$). Under the compass rule it does not.` },
    ],
    answer: t`The only nonzero coefficient is $\Gamma^\varphi{}_{\theta\varphi} = \cot\theta$; then $\nabla_\varphi\partial_\varphi = 0$, while Levi-Civita gives $-\sin\theta\cos\theta\,\partial_\theta$. Same manifold, same metric, two connections.`,
  },
  practice: [
    mcq({
      id: 'axioms', difficulty: 1,
      prompt: t`Which property must every connection have, for every function $f$?`,
      visual: spherePic('sphere', 'Levi-Civita transport on the sphere: one of many connections a manifold can carry.'),
      choices: [t`$\nabla_{fX}Y = f\,\nabla_XY$`, t`$\nabla_X(fY) = f\,\nabla_XY$`, t`$\nabla_XY = \nabla_YX$`, t`$\nabla_XY = X(Y^\lambda)\,\partial_\lambda$ in every chart`],
      answer: 0,
      why: {
        1: t`That would make $\nabla$ blind to how $f$ varies — not a derivative. The rule is $\nabla_X(fY) = X(f)Y + f\nabla_XY$.`,
        2: 'Not required — and not even tensorial: the commutator [X, Y] enters. Torsion (C12.3) measures how a connection treats this.',
        3: 'That is the partial derivative of components, which depends on the chart. It works only in special charts.',
      },
      hints: ['The direction X enters only through its value at the point: no derivatives of X appear.'],
      teach: t`A connection is tensorial (function-linear) in the direction and obeys the Leibniz rule in the field.`,
      explain: t`$\nabla_XY$ at $p$ depends only on $X$ at $p$, which is what $\nabla_{fX}Y = f\nabla_XY$ says. Its dependence on $Y$ is a genuine derivative, with the Leibniz rule.`,
    }),
    num({
      id: 'count', difficulty: 1,
      gen(r) {
        const n = r.pick([2, 3, 4, 5]);
        return {
          prompt: t`How many coefficients $\Gamma^\lambda{}_{\mu\nu}$ does a general connection have at each point of an ${n}-dimensional manifold?`,
          visual: { type: 'dg4-chart', params: { metric: 'compass', mode: 'chart', P: [1.2, 1.0], drag: false, field: false, readout: ['gamma'] }, caption: 'The compass connection’s nonzero coefficients at P, read out (here in 2D, out of 8).' },
          answer: n ** 3, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: (n * n * (n + 1)) / 2, feedback: t`That counts a symmetric $\Gamma$, $\Gamma^\lambda{}_{\mu\nu} = \Gamma^\lambda{}_{\nu\mu}$. A general connection need not be.` }, { value: n * n, feedback: t`Three indices, each running over ${n} values.` }].filter((e) => e.value !== n ** 3),
          hints: [t`$\lambda$, $\mu$ and $\nu$ each take $${n}$ values, independently.`],
          teach: 'A general connection has n³ coefficients in n dimensions; symmetry in the lower pair cuts that to n²(n + 1)/2.',
          explain: t`$${n}^3 = ${n ** 3}$. In spacetime, 64 — or 40 once torsion is ruled out, which C12.3 does.`,
        };
      },
    }),
    num({
      id: 'compass-nabla', difficulty: 2,
      gen(r) {
        const m = r.pick([1, 2, 3]), th = r.pick([30, 45, 60, 120]);
        const s = Math.sin(th * DEG), c = Math.cos(th * DEG);
        const ans = m * s ** (m - 1) * c + (c / s) * s ** m;
        const pw = (k) => (k === 0 ? '' : k === 1 ? t`\sin\theta` : t`\sin^{${k}}\theta`);
        const co = (k) => (k === 1 ? '' : String(k));
        return {
          prompt: t`With the compass connection of the worked example (only $\Gamma^\varphi{}_{\theta\varphi} = \cot\theta$), take the field $Y = \sin^{${m}}\theta\;\partial_\varphi$. Find the component $(\nabla_{\partial_\theta}Y)^\varphi$ at $\theta = ${th}^\circ$.`,
          visual: { type: 'dg4-chart', params: { metric: 'compass', mode: 'chart', P: [3.14, Math.round(th * DEG * 1e4) / 1e4], drag: false, field: false, readout: false, points: [] }, caption: t`The point at $\theta = ${th}^\circ$ on the sphere’s chart (north at the top).` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: m * s ** (m - 1) * c, feedback: t`Add the connection term: $\Gamma^\varphi{}_{\theta\varphi}Y^\varphi$.` }, { value: m * s ** (m - 1) * c - (c / s) * s ** m, feedback: t`The connection term enters with a plus sign for an upper index.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.max(1, Math.abs(ans))),
          hints: [t`$(\nabla_\theta Y)^\varphi = \partial_\theta Y^\varphi + \Gamma^\varphi{}_{\theta\nu}Y^\nu$, and only $\nu = \varphi$ contributes.`, t`$\partial_\theta(${pw(m)}) = ${co(m)}${pw(m - 1)}\cos\theta$.`],
          teach: t`$(\nabla_\mu Y)^\lambda$ is the change of the components plus $\Gamma^\lambda{}_{\mu\nu}Y^\nu$, the change of the basis.`,
          explain: t`$${co(m)}${pw(m - 1)}\cos\theta + \cot\theta\,${pw(m)} = ${m + 1}${pw(m - 1)}\cos\theta = ${nice(ans, 4)}$. Note $Y = ${pw(m + 1)}\,\hat e_\varphi$: with $\hat e_\varphi$ constant, only the factor in front changes.`,
        };
      },
    }),
    order({
      id: 'coordinate-form', difficulty: 2,
      prompt: t`Derive $\nabla_XY = X^\mu(\partial_\mu Y^\lambda + \Gamma^\lambda{}_{\mu\nu}Y^\nu)\partial_\lambda$ from the axioms. Order the steps.`,
      visual: spherePic('sphere', 'A vector field’s components change, and so does the basis they are taken in.'),
      items: [
        t`Expand both: $X = X^\mu\partial_\mu$ and $Y = Y^\nu\partial_\nu$.`,
        t`Tensorial in the direction: $\nabla_XY = X^\mu\,\nabla_{\partial_\mu}(Y^\nu\partial_\nu)$.`,
        t`Leibniz in the field: $\nabla_{\partial_\mu}(Y^\nu\partial_\nu) = (\partial_\mu Y^\nu)\,\partial_\nu + Y^\nu\,\nabla_{\partial_\mu}\partial_\nu$.`,
        t`Insert the coefficients: $\nabla_{\partial_\mu}\partial_\nu = \Gamma^\lambda{}_{\mu\nu}\partial_\lambda$.`,
        t`Rename the dummy index $\nu \to \lambda$ in the first term and collect along $\partial_\lambda$.`,
      ],
      hints: ['Use the first axiom on X, then the Leibniz rule on each term of Y.', 'The connection only has to be known on the basis vectors.'],
      teach: t`The two axioms reduce any covariant derivative to the $n^3$ numbers $\Gamma^\lambda{}_{\mu\nu}$ that say how the basis changes.`,
      explain: t`Everything about $\nabla$ is in what it does to the basis. That is why choosing a connection and choosing $\Gamma$’s in a chart are the same thing.`,
    }),
    mcq({
      id: 'difference', difficulty: 2,
      prompt: t`$\nabla$ and $\tilde\nabla$ are two connections on the same manifold. What is $S(X, Y) = \tilde\nabla_XY - \nabla_XY$?`,
      visual: spherePic('compass', 'The compass connection; the sphere’s Levi-Civita connection is the other one in the Explore.'),
      choices: [t`A $(1, 2)$ tensor, with components $\tilde\Gamma^\lambda{}_{\mu\nu} - \Gamma^\lambda{}_{\mu\nu}$`, t`Another connection`, t`Zero: a manifold has only one connection`, t`Not a tensor, because neither $\Gamma$ is one`],
      answer: 0,
      why: {
        1: t`Subtracting kills the Leibniz term $X(f)Y$: $S(X, fY) = fS(X, Y)$, so $S$ is function-linear in both slots — a tensor, not a derivative.`,
        2: 'The Explore shows two on one sphere; there are infinitely many (add any tensor S to one).',
        3: t`The non-tensorial parts of the two transformation laws are identical (both are $\partial^2 x/\partial x'\partial x'$ terms), so they cancel in the difference.`,
      },
      hints: [t`Compute $S(X, fY)$ using the Leibniz rule for each connection.`],
      teach: 'Γ is not a tensor, but the difference of two connections is: a (1, 2) tensor.',
      explain: t`$S(X, fY) = X(f)Y + f\tilde\nabla_XY - X(f)Y - f\nabla_XY = fS(X, Y)$. So all connections are one connection plus a $(1, 2)$ tensor — for the compass connection minus Levi-Civita on the sphere, $S^\theta{}_{\varphi\varphi} = \sin\theta\cos\theta$ and $S^\varphi{}_{\varphi\theta} = -\cot\theta$.`,
    }),
    mcq({
      id: 'parallel-field', difficulty: 3,
      prompt: t`A vector field $Y$ is **parallel** if $\nabla_XY = 0$ for every $X$. For the compass connection on the sphere, which field is parallel (away from the poles)?`,
      visual: spherePic('compass', 'The compass rule carries the arrow keeping its angle to the meridians: north stays north.'),
      choices: [t`$\hat e_\varphi = \partial_\varphi/\sin\theta$, the unit east vector`, t`$\partial_\varphi$`, t`The velocity of a great circle through each point`, t`None: a sphere cannot carry a parallel field`],
      answer: 0,
      why: {
        1: t`$\nabla_\theta\partial_\varphi = \cot\theta\,\partial_\varphi \ne 0$: it is $\sin\theta\,\hat e_\varphi$, growing toward the equator.`,
        2: 'That is the Levi-Civita picture, and even there a great circle’s velocity is parallel only along itself, not in every direction.',
        3: 'True for Levi-Civita: curvature forbids it. The compass connection is flat, so it allows parallel fields.',
      },
      hints: [t`The compass connection was built so that $\hat e_\theta$ and $\hat e_\varphi$ are constant.`, t`Check $\partial_\varphi = \sin\theta\,\hat e_\varphi$ with the Leibniz rule.`],
      teach: 'Whether a field counts as parallel depends on the connection, not only on the manifold.',
      explain: t`By construction $\nabla\hat e_\varphi = 0$ (and $\nabla\hat e_\theta = 0$). Under Levi-Civita no field on a curved surface is parallel even locally — the holonomy of C6.3 would contradict it. The connection, not the sphere, decides.`,
    }),
    num({
      id: 'lc-phiphi', difficulty: 2,
      gen(r) {
        const th = r.pick([20, 30, 45, 60, 70]);
        const v = -Math.sin(th * DEG) * Math.cos(th * DEG);
        return {
          prompt: t`For the sphere’s Levi-Civita connection, $\Gamma^\theta{}_{\varphi\varphi} = -\sin\theta\cos\theta$. Moving east at colatitude $\theta = ${th}^\circ$, the field $\partial_\varphi$ changes by $\nabla_{\partial_\varphi}\partial_\varphi = \Gamma^\theta{}_{\varphi\varphi}\,\partial_\theta$. What is that $\partial_\theta$ component?`,
          visual: spherePic('sphere', t`Levi-Civita transport on the unit sphere’s chart.`),
          answer: v, tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: 'That is the compass connection’s answer. Levi-Civita turns the east vector as it goes east.' }, { value: -v, feedback: t`Keep the minus sign: the change points north ($-\partial_\theta$) in the northern hemisphere.` }],
          hints: [t`Evaluate $-\sin ${th}^\circ\cos ${th}^\circ$.`],
          teach: 'Two connections on one sphere disagree about how the east vector changes going east.',
          explain: t`$-\sin ${th}^\circ\cos ${th}^\circ = ${nice(v, 4)}$: negative, so toward the north. That is a parallel of latitude bending toward the pole (C6.2): the east direction itself turns.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-wander', difficulty: 3, transfer: true,
      gen(r) {
        const lat = r.pick([30, 45, 50, 60]), v = r.pick([800, 900, 250]);
        const dlon = v / (A_EARTH * Math.cos(lat * DEG));   // rad per hour
        const w = (dlon * Math.sin(lat * DEG)) / DEG;
        return {
          prompt: t`An aircraft flies due east at latitude $${lat}^\circ$N at ${v} km/h (Earth radius 6371 km). Its directional gyro holds its axis fixed — parallel transport by the Levi-Civita connection — while the compass connection keeps "north" fixed. The gap, called **transport wander**, grows by $\Delta\varphi\,\sin\lambda$ for a change of longitude $\Delta\varphi$. How many degrees per hour does the gyro drift from north? (Ignore the Earth’s rotation.)`,
          visual: spherePic('sphere', 'Levi-Civita transport on the sphere: an arrow carried east along a parallel turns relative to north.', { P: [0.6, Math.round((90 - lat) * DEG * 1e4) / 1e4], Q: [2.2, Math.round((90 - lat) * DEG * 1e4) / 1e4 + 0.5] }),
          answer: w, units: 'deg/h', tol: { rel: 0.005 },
          errors: [{ value: (dlon * Math.cos(lat * DEG)) / DEG, feedback: t`The factor is $\sin\lambda$ (latitude): no wander on the equator, which is a geodesic.` }, { value: (v / A_EARTH) / DEG * Math.sin(lat * DEG), feedback: t`A parallel of latitude has radius $R\cos\lambda$: the longitude changes by $v/(R\cos\lambda)$ per hour.` }].filter((e) => Math.abs(e.value - w) > 0.01 * w),
          hints: [t`Longitude rate: $\dot\varphi = v/(R\cos\lambda) = ${nice(dlon, 4)}$ rad/h.`, t`Wander rate $= \dot\varphi\sin\lambda = (v/R)\tan\lambda$.`],
          teach: 'Two connections on the Earth — keep-the-heading and free gyroscope — drift apart at Δφ sin λ: transport wander.',
          explain: t`$(v/R)\tan\lambda = (${v}/6371)\tan ${lat}^\circ = ${nice(w * DEG, 4)}$ rad/h $= ${nice(w, 4)}^\circ$/h. Navigators correct gyros for it (with "latitude nuts" or software); it is the same holonomy as the Foucault pendulum, seen per hour of flight rather than per turn of the Earth.`,
        };
      },
    }),
    num({
      id: 'cp-transform', difficulty: 3,
      gen(r) {
        const n = r.pick([2, 3, 4]), y = r.pick([2, 4, 8]);
        const ans = -(n - 1) / (n * y);
        return {
          prompt: t`On the line $x > 0$ take the flat connection, $\Gamma^x{}_{xx} = 0$. In the new coordinate $y = x^{${n}}$, the transformation law gives $\Gamma'^y{}_{yy} = \dfrac{\partial y}{\partial x}\dfrac{\partial^2x}{\partial y^2}$ (the first term vanishes). Find $\Gamma'^y{}_{yy}$ at $y = ${y}$.`,
          visual: { type: 'graph', params: { x: [0, 2.2], y: [0, 9], xlabel: 'x', ylabel: 'y', xticks: 5, yticks: 4, curves: [{ fn: `x^${n}`, color: 'gold', width: 2.4, label: `y = x^${n}`.replace(`^${n}`, ['', '', '²', '³', '⁴'][n]) }], hlines: [{ y, color: 'ink3' }] }, caption: t`The change of coordinate $y = x^{${n}}$; equal steps of $x$ are unequal steps of $y$, and that unevenness is the new $\Gamma$.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: 'Γ is not a tensor: zero in one chart need not be zero in another.' }, { value: -ans, feedback: t`$\partial^2x/\partial y^2 < 0$ here ($x = y^{1/${n}}$ is concave).` }],
          hints: [t`$x = y^{1/${n}}$: $\dfrac{\partial^2x}{\partial y^2} = \tfrac1{${n}}\big(\tfrac1{${n}} - 1\big)y^{1/${n} - 2}$, and $\dfrac{\partial y}{\partial x} = ${n}x^{${n - 1}} = ${n}y^{1 - 1/${n}}$.`, t`The product simplifies to $-\dfrac{${n - 1}}{${n}y}$.`],
          teach: 'Γ transforms with an extra second-derivative term, so it can appear from nothing in a new chart: it is not a tensor.',
          explain: t`$\Gamma'^y{}_{yy} = -\dfrac{${n - 1}}{${n}y} = ${nice(ans, 4)}$. The connection has not changed — only its description. A tensor zero in one chart is zero in all; $\Gamma$ is not one.`,
        };
      },
    }),
    mcq({
      id: 'cp-cartesian', difficulty: 2,
      prompt: t`On the flat plane every Levi-Civita $\Gamma$ vanishes in Cartesian coordinates, but $\Gamma^r{}_{\theta\theta} = -r$ in polar ones. What does this show?`,
      visual: { type: 'dg4-chart', params: { metric: 'polar', mode: 'transport', P: [1.0, 0.2], Q: [2.4, 1.2], drag: false, readout: false, field: false, angle: 40, sliders: [] }, caption: 'Transport on the polar chart of the flat plane: the arrows’ components change, the arrows do not, and both routes agree.' },
      choices: [t`$\Gamma$ describes the chart as well as the connection: it is not a tensor`, t`Polar coordinates make the plane curved`, t`Cartesian coordinates are wrong near the origin`, t`The plane carries two different connections`],
      answer: 0,
      why: {
        1: 'Curvature is a tensor and is zero in both charts; transport round any loop returns every arrow unchanged.',
        2: 'Nothing is wrong with either chart away from r = 0; they describe the same connection.',
        3: 'It is one connection (Levi-Civita), written in two charts.',
      },
      hints: ['If Γ were a tensor, could it vanish in one chart and not another?'],
      teach: 'Nonzero Christoffel symbols can be pure coordinate effect; only curvature is not.',
      explain: t`A tensor that vanishes in one chart vanishes in all. $\Gamma$ does not, so it is not a tensor — it mixes the connection with how the chart’s basis turns and stretches. Curvature (C15) is the tensor built from it that only the connection controls.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.2', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Lee, Introduction to Riemannian Manifolds, ch. 4 (connections)', url: 'https://link.springer.com/book/10.1007/978-3-319-91755-9' },
    { label: 'FAA, Instrument Flying Handbook (FAA-H-8083-15B), ch. 5: gyroscopic heading indicators and apparent precession', url: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/instrument_flying_handbook' },
  ],
});
