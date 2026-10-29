// Parallel transport along a curve: ∇_ẋV = 0, a linear ODE, so a linear map
// between tangent spaces; it keeps inner products exactly when ∇g = 0. Two
// routes between the same points: agree on the flat plane (polar chart),
// disagree on the sphere and the half-plane (by ∬K dA); along a horocycle the
// arrow turns at 1/y; along an accelerating observer's worldline it is boosted
// by the rapidity. A connection that is not metric-compatible shrinks rods.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const DEG = Math.PI / 180;
const C = 299792458;

const tp = (metric, P, Q, caption, extra = {}) => ({
  type: 'dg4-chart',
  params: { metric, mode: 'transport', P, Q, drag: false, readout: false, field: false, ...extra },
  caption,
});

export default lesson({
  id: 'st-c.C12.2',
  title: 'Parallel transport along a curve',
  minutes: 15, difficulty: 3,
  equation: t`\frac{dV^\mu}{d\lambda} + \Gamma^\mu{}_{\nu\rho}\,\frac{dx^\nu}{d\lambda}\,V^\rho = 0`,
  intro: t`A connection compares vectors at nearby points. Chain the comparisons along a curve $x^\mu(\lambda)$ and you can carry a vector from one end to the other "without changing it": $V$ is **parallel-transported** if $\nabla_{\dot x}V = 0$ all along the curve, which in components is the equation above. It is a linear first-order ODE, so every starting vector has exactly one transport, and the result at the far end, $V \mapsto P_\gamma V$, is a **linear map** $T_pM \to T_qM$.

Two facts carry the lesson. If the connection is **metric-compatible** ($\nabla g = 0$), transport keeps every length and angle. And in general **the answer depends on the path**: two routes from $p$ to $q$ deliver different vectors, by an amount set by the curvature between them — C6.3’s holonomy, now for any manifold and any connection.`,
  symbols: [
    { tex: t`V^\mu(\lambda)`, text: t`the components of the vector being carried, at the curve’s point $x(\lambda)$` },
    { tex: t`x^\mu(\lambda)`, text: t`the curve, with tangent $dx^\nu/d\lambda$` },
    { tex: t`\Gamma^\mu{}_{\nu\rho}`, text: 'the connection coefficients, evaluated along the curve: they say how the basis changes, so the components must change to compensate' },
    { tex: t`\lambda`, text: 'the curve’s parameter; the result does not depend on how the curve is parameterized' },
  ],
  why: t`A gyroscope in free fall is parallel-transported: Gravity Probe B measured the result. In GR the 4-velocity of a free body is parallel-transported along its own worldline — that is the geodesic equation (C14.1).`,
  visual: {
    type: 'dg4-chart',
    title: 'Two routes, one start, one end',
    lead: t`A vector at P (white) is carried to Q along the edge of the coordinate rectangle, blue going along the first coordinate first, violet along the second first. Drag P and Q and change the vector; switch spaces.`,
    tasks: [
      t`Flat plane, polar chart: the arrows’ components change along the way, yet both routes deliver the same arrow at Q. Flat means path-independent.`,
      t`Sphere and half-plane: the routes disagree, by an angle equal to $\iint K\,dA$ of the rectangle — positive on the sphere, negative on the half-plane. Shrink the rectangle: the gap shrinks with its area.`,
      t`Rindler wedge (flat, Lorentzian): carrying a 4-velocity along the edges, both routes agree; but along a single vertical edge the arrow tilts relative to the cones — a boost.`,
    ],
    params: { metric: 'sphere', metrics: ['polar', 'sphere', 'halfplane', 'rindler'], mode: 'transport', P: [1.0, 0.9], Q: [2.6, 1.6], sliders: ['angle', 'speed'], angle: 30, speed: 0, field: true, cells: 8, readout: ['turn', 'area'] },
    caption: t`Arrows drawn by their chart components; with this (Levi-Civita) connection transport keeps their metric length, so their drawn size follows the ellipses or cones. Readout: the angle (or rapidity) between the two arrivals, and $\iint K\,dA$ of the rectangle.`,
  },
  example: {
    prompt: t`In the hyperbolic half-plane, $ds^2 = (dx^2 + dy^2)/y^2$, with $\Gamma^x{}_{xy} = -1/y$, $\Gamma^y{}_{xx} = 1/y$, $\Gamma^y{}_{yy} = -1/y$, carry a vector along the horizontal line $y = y_0$ from $x = 0$ to $x = L$. Solve the transport equation and find how far it turns. Evaluate for $y_0 = 0.5$, $L = 1$.`,
    visual: tp('halfplane', [0, 0.5], [1, 0.5], t`Transport along $y = 0.5$ from P to Q (the rectangle is flat, so both routes coincide with the line): the arrow turns clockwise as it goes.`, { angle: 90, field: true, view: { a: [-0.6, 1.6], b: [0, 1.2] } }),
    steps: [
      { label: 'The curve', text: t`$x = \lambda$, $y = y_0$: $\dot x = 1$, $\dot y = 0$. Only $\Gamma$’s with a lower $x$ (the direction of motion) enter.` },
      { label: 'Equations', text: t`$\dfrac{dV^x}{d\lambda} + \Gamma^x{}_{xy}V^y = 0$ and $\dfrac{dV^y}{d\lambda} + \Gamma^y{}_{xx}V^x = 0$, i.e. $\dfrac{dV^x}{d\lambda} = \dfrac{V^y}{y_0}$, $\dfrac{dV^y}{d\lambda} = -\dfrac{V^x}{y_0}$.` },
      { label: 'Solve', text: t`A rotation at constant rate: $V^x = A\cos(\lambda/y_0 - \beta)$, $V^y = -A\sin(\lambda/y_0 - \beta)$ — the components turn **clockwise** by $\lambda/y_0$.` },
      { label: 'Lengths kept', text: t`$g(V, V) = \big((V^x)^2 + (V^y)^2\big)/y_0^2 = A^2/y_0^2$: constant, as metric compatibility promises.` },
      { label: 'Numbers', text: t`$L/y_0 = 2$ rad $= 114.6^\circ$ clockwise. The line’s own tangent $\partial_x$ does not turn, so the line is not a geodesic: the angle between it and a transported vector grows at 1 radian per unit length ($L/y_0$ is the length) — its geodesic curvature is 1.` },
    ],
    answer: t`$V$ turns clockwise by $L/y_0$ radians, keeping its length: $114.6^\circ$ for $y_0 = 0.5$, $L = 1$.`,
  },
  practice: [
    num({
      id: 'horocycle', difficulty: 2,
      gen(r) {
        const y0 = r.pick([0.25, 0.5, 1, 2]), L = r.pick([0.2, 0.5, 1]);
        const ang = L / y0 / DEG;
        return {
          prompt: t`In the half-plane, a vector is parallel-transported along $y = ${y0}$ from $x = 0$ to $x = ${L}$. By how many degrees does it turn (clockwise)?`,
          visual: tp('halfplane', [0, y0], [L, y0], t`The path along $y = ${y0}$ (both routes coincide with it).`, { angle: 90, field: true, view: { a: [-0.5, Math.max(1.5, L + 0.5)], b: [0, Math.max(1.2, y0 + 0.6)] } }),
          answer: ang, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: L * y0 / DEG, feedback: t`The rate is $1/y$, not $y$: low down, steps are long and the turning is fast.` }, { value: L / y0, feedback: 'That is in radians.' }].filter((e) => Math.abs(e.value - ang) > 0.01 * ang),
          hints: [t`Along $y = y_0$ the components rotate at rate $1/y_0$ per unit of $x$.`],
          teach: 'Along a horizontal line of the half-plane, a transported vector turns at rate 1/y per unit of x.',
          explain: t`$\Delta x/y_0 = ${nice(L / y0, 4)}$ rad $= ${nice(ang, 4)}^\circ$. That is also the line’s hyperbolic length — the vector turns one radian per unit length, the signature of geodesic curvature 1.`,
        };
      },
    }),
    num({
      id: 'polar-circle', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 2, 3]), th = r.pick([30, 60, 90, 120]);
        const ans = -Math.sin(th * DEG) / R;
        return {
          prompt: t`On the flat plane in polar coordinates ($\Gamma^r{}_{\theta\theta} = -r$, $\Gamma^\theta{}_{r\theta} = \Gamma^\theta{}_{\theta r} = 1/r$), carry $V = \partial_r$ (so $V^r = 1$, $V^\theta = 0$) round the circle $r = ${R}$ from $\theta = 0$ to $\theta = ${th}^\circ$. The solution is $V^r = \cos\theta$, $V^\theta = -\sin\theta/r$. What is $V^\theta$ at the end?`,
          visual: tp('polar', [R, 0], [R, Math.round(th * DEG * 1e4) / 1e4], 'Transport along the circle (the rectangle has zero width, so both routes run along it).', { angle: 0, field: true, view: { a: [0, 3.5], b: [-0.3, 2.3] } }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`The arrow does not change, but its components do: $\partial_r$ turns as you go round.` }, { value: -Math.sin(th * DEG), feedback: t`$V^\theta$ is per radian: divide by $r$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Check: $dV^r/d\theta = rV^\theta$ and $dV^\theta/d\theta = -V^r/r$ are satisfied by the given solution.`],
          teach: 'Parallel transport on the flat plane keeps the arrow; its polar components change because the polar basis turns.',
          explain: t`$V^\theta = -\sin ${th}^\circ/${R} = ${nice(ans, 4)}$. In Cartesian components $V = \cos\theta\,\hat r - \sin\theta\,\hat\theta = \hat x$ throughout: the same arrow, re-described.`,
        };
      },
    }),
    num({
      id: 'sphere-routes', difficulty: 3,
      gen(r) {
        const t0 = r.pick([30, 40, 50]), t1 = t0 + r.pick([20, 30]), dp = r.pick([40, 60, 90]);
        const ang = dp * (Math.cos(t0 * DEG) - Math.cos(t1 * DEG));
        return {
          prompt: t`On the unit sphere, a vector is carried from $P = (\varphi, \theta) = (0, ${t0}^\circ)$ to $Q = (${dp}^\circ, ${t1}^\circ)$ by the two routes round the coordinate rectangle. By how many degrees do the two arrivals differ?`,
          visual: tp('sphere', [0.3, r6(t0 * DEG)], [r6(0.3 + dp * DEG), r6(t1 * DEG)], 'The two routes on the sphere’s chart (north at the top).', { angle: 40 }),
          answer: ang, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: dp * (t1 - t0) * DEG, feedback: t`The area element is $\sin\theta\,d\theta\,d\varphi$, not $d\theta\,d\varphi$.` }, { value: dp * (Math.sin(t1 * DEG) - Math.sin(t0 * DEG)), feedback: t`$\int\sin\theta\,d\theta = -\cos\theta$: use cosines of the colatitudes.` }].filter((e) => Math.abs(e.value - ang) > 0.01 * ang),
          hints: [t`Going round the rectangle one way and back the other is a loop: the gap is $\iint K\,dA$, with $K = 1$.`, t`Area $= \Delta\varphi\,(\cos\theta_0 - \cos\theta_1)$, with $\Delta\varphi$ in radians — or keep it in degrees and the answer comes out in degrees.`],
          teach: 'Two routes between the same points differ by the transport round the loop they make: ∬K dA.',
          explain: t`$${dp}^\circ\times(\cos ${t0}^\circ - \cos ${t1}^\circ) = ${nice(ang, 4)}^\circ$. Path dependence is curvature: on a flat surface the gap would be zero for every pair of routes.`,
        };
      },
    }),
    order({
      id: 'preserve', difficulty: 2,
      prompt: t`Show that if $\nabla g = 0$, parallel transport keeps the inner product $g(V, W)$ of two transported vectors. Order the steps.`,
      visual: tp('halfplane', [-0.8, 0.6], [0.9, 1.6], 'Transport in the half-plane: the arrows change size in the chart but not as the metric measures them.', { angle: 60, field: true }),
      items: [
        t`Along the curve, $\dfrac{d}{d\lambda}\,g(V, W) = \nabla_{\dot x}\big(g_{\mu\nu}V^\mu W^\nu\big)$, since on a scalar $\nabla$ is the ordinary derivative.`,
        t`Leibniz: $= (\nabla_{\dot x}g)(V, W) + g(\nabla_{\dot x}V, W) + g(V, \nabla_{\dot x}W)$.`,
        t`The first term vanishes because $\nabla g = 0$.`,
        t`The other two vanish because $V$ and $W$ are transported: $\nabla_{\dot x}V = \nabla_{\dot x}W = 0$.`,
        t`So $g(V, W)$ is constant: lengths and angles survive the trip.`,
      ],
      hints: ['Differentiate the scalar g(V, W) along the curve with the Leibniz rule.', 'Each of the three resulting terms is zero for its own reason.'],
      teach: 'With a metric-compatible connection, parallel transport keeps lengths and angles.',
      explain: t`This is why "carry without changing" makes geometric sense for Levi-Civita transport. For a connection with $\nabla g \ne 0$ the first term survives and carried rulers change length (checkpoint).`,
    }),
    num({
      id: 'rindler-boost', difficulty: 3,
      gen(r) {
        const de = r.pick([0.2, 0.5, 1, 1.5]);
        const v = Math.tanh(de);
        return {
          prompt: t`In the Rindler wedge ($ds^2 = -\rho^2d\eta^2 + d\rho^2$), carry the 4-velocity of the hovering observer at $\rho = \rho_0$ along that observer’s own worldline from $\eta = 0$ to $\eta = ${de}$. The transported vector turns out to be the observer’s new 4-velocity boosted by rapidity $\Delta\eta$. What speed, relative to the observer then, does it describe?`,
          visual: tp('rindler', [1.3, 0], [1.3, de], t`Transport along a hovering worldline ($\rho = 1.3$, vertical): the arrow tilts toward the horizon relative to the cones.`, { speed: 0, field: true, view: { a: [0, 3], b: [-0.3, Math.max(1.8, de + 0.3)] } }),
          answer: v, tol: { rel: 0.003 },
          errors: [{ value: de, feedback: t`Rapidity is not speed: $v = \tanh(\text{rapidity})$.` }, { value: Math.sin(de), feedback: 'This is a boost, not a rotation: hyperbolic functions.' }].filter((e) => Math.abs(e.value - v) > 0.005),
          hints: [t`Along $\rho = \rho_0$: $\dfrac{dV^\eta}{d\eta} = -\dfrac{V^\rho}{\rho_0}$ and $\dfrac{dV^\rho}{d\eta} = -\rho_0V^\eta$, solved by $\cosh$ and $\sinh$ of $\eta$.`, t`A boost by rapidity $w$ means relative speed $\tanh w$.`],
          teach: 'An accelerating observer’s own 4-velocity is not parallel-transported: what is, falls behind at speed tanh of the rapidity gained.',
          explain: t`$v = \tanh ${de} = ${nice(v, 4)}$. The transported vector is the 4-velocity of a free particle that was at rest beside the observer at $\eta = 0$: in flat spacetime a free body’s 4-velocity is parallel-transported. The hovering observer is not free, so they see it fall away.`,
        };
      },
    }),
    mcq({
      id: 'which-independent', difficulty: 2,
      prompt: 'On which of these does transport from P to Q never depend on the route (for routes that stay in the chart)?',
      visual: tp('polar', [1, 0.2], [2.4, 1.2], 'The flat plane in polar coordinates: both routes deliver the same arrow at Q.', { angle: 40 }),
      choices: ['The flat plane in polar coordinates', 'The unit sphere', 'The hyperbolic half-plane', 'The Schwarzschild radial–time plane'],
      answer: 0,
      why: { 1: t`$K = 1$: the routes differ by the enclosed area.`, 2: t`$K = -1$: the routes differ by minus the enclosed area.`, 3: t`$K = 2M/r^3 \ne 0$ there.` },
      hints: ['Path independence for every loop is the same as zero curvature.'],
      teach: 'Transport is path-independent exactly where the connection is flat; nonzero Christoffel symbols do not spoil that.',
      explain: t`The polar chart has nonzero $\Gamma$’s, but the plane is flat, so every loop returns every vector unchanged — only the components move. Curvature, not $\Gamma$, makes transport path-dependent.`,
    }),
    mcq({
      id: 'self-transport', difficulty: 2,
      prompt: t`A curve whose own velocity $\dot x$ is parallel-transported along it, $\nabla_{\dot x}\dot x = 0$, is…`,
      visual: { type: 'dg4-chart', params: { metric: 'halfplane', mode: 'geodesic', P: [0, 1], drag: false, heading: 30, length: 2.5, readout: false, cells: 8 }, caption: 'A half-plane curve whose velocity is transported along itself: a semicircle meeting the edge at right angles.' },
      choices: ['a geodesic: the straightest curve the connection allows', 'a closed loop', 'a curve of constant coordinate speed', 'a coordinate line'],
      answer: 0,
      why: { 1: 'Nothing forces it to close.', 2: 'Its coordinate speed changes (the picture’s semicircle slows near the edge in the chart); its metric speed is what stays constant.', 3: 'Coordinate lines need not be: y = const in the half-plane is not.' },
      hints: [t`In components, $\nabla_{\dot x}\dot x = 0$ reads $\ddot x^\mu + \Gamma^\mu{}_{\nu\rho}\dot x^\nu\dot x^\rho = 0$.`],
      teach: 'A geodesic is a curve that parallel-transports its own velocity.',
      explain: t`Putting $V = \dot x$ into the transport equation gives the geodesic equation, $\ddot x^\mu + \Gamma^\mu{}_{\nu\rho}\dot x^\nu\dot x^\rho = 0$: C14.1 starts here. It never turns, by the connection’s own standard.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rocket', difficulty: 3, transfer: true,
      gen(r) {
        const [label, tau] = r.pick([['30 days', 30 * 86400], ['six months', 182.6 * 86400], ['one year', 365.25 * 86400], ['two years', 730.5 * 86400]]);
        const a = 9.81, v = Math.tanh((a * tau) / C);
        return {
          prompt: t`A rocket accelerates at a steady $1g$ ($9.81\ \text{m/s}^2$ proper acceleration). At the start a beacon is released at rest beside it and floats free, so its 4-velocity is parallel-transported — while the crew’s frame is boosted. After ${label} of crew time, at what fraction of $c$ is the beacon receding from the rocket?`,
          visual: tp('rindler', [1, 0], [1, 1.2], 'The crew hover at fixed ρ in their Rindler chart; carried along their worldline, the beacon’s 4-velocity tilts away.', { speed: 0, field: true }),
          answer: v, tol: { rel: 0.003 },
          errors: [{ value: (a * tau) / C, feedback: t`Newton’s $v = at$ overshoots: the rapidity $a\tau/c$ grows linearly, the speed is its $\tanh$.` }].filter((e) => Math.abs(e.value - v) > 0.005 * v),
          hints: [t`The rocket is a Rindler observer with $\rho = c^2/a$, and its proper time is $\tau = \rho\,\eta/c$, so $\Delta\eta = a\tau/c$.`, t`$a\tau/c = ${nice((a * tau) / C, 4)}$.`],
          teach: 'A free body’s 4-velocity is parallel-transported; an accelerating crew’s is not, and the rapidity between them grows as aτ/c.',
          explain: t`$v/c = \tanh(a\tau/c) = \tanh ${nice((a * tau) / C, 4)} = ${nice(v, 4)}$. In the beacon’s frame it is the rocket that moves, at the same speed; both see it through the metric’s flat geometry — no gravity anywhere.`,
        };
      },
    }),
    num({
      id: 'cp-colorado', difficulty: 3, transfer: true,
      gen(r) {
        const [name, s, n, dl] = r.pick([['Colorado', 37, 41, 7], ['Wyoming', 41, 45, 7], ['Utah’s northern block', 41, 42, 3]]);
        const ang = dl * DEG * (Math.sin(n * DEG) - Math.sin(s * DEG)) / DEG;
        return {
          prompt: t`${name} is (nearly) bounded by the parallels $${s}^\circ$N and $${n}^\circ$N and two meridians $${dl}^\circ$ apart. A survey drone carries a gyroscope from the south-west corner to the north-east corner, once along the southern border then up the eastern one, once up the western border then along the northern one. Treating the Earth as a sphere, by how many degrees do the gyroscopes’ final directions differ?`,
          visual: tp('sphere', [0.5, r6((90 - n) * DEG)], [r6(0.5 + dl * DEG * 4), r6((90 - s) * DEG)], 'The two routes round a rectangle of meridians and parallels (drawn four times wider than the state, so the gap shows).', { angle: 90 }),
          answer: ang, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: dl * (n - s) * DEG, feedback: t`Use the area on the unit sphere: $\Delta\varphi\,(\sin\lambda_N - \sin\lambda_S)$.` }, { value: dl * (Math.cos(s * DEG) - Math.cos(n * DEG)), feedback: t`With latitudes, the area is $\Delta\varphi(\sin\lambda_N - \sin\lambda_S)$; cosines go with colatitudes.` }].filter((e) => Math.abs(e.value - ang) > 0.01 * ang),
          hints: [t`The two routes together make a loop round the state: the gap is $\iint K\,dA$, the area divided by $R^2$.`, t`The gap equals the area of the rectangle on the unit sphere: $\Delta\varphi\,(\sin\lambda_N - \sin\lambda_S)$.`],
          teach: 'Two routes between the same points differ by the curvature they enclose; on Earth that is the area over R².',
          explain: t`$${dl}^\circ\times(\sin ${n}^\circ - \sin ${s}^\circ) = ${nice(ang, 3)}^\circ$ — small but far above a navigation gyro’s resolution, and independent of how fast the drone flew. (The Earth’s rotation adds its own drift, ignored here.)`,
        };
      },
    }),
    num({
      id: 'cp-nonmetric', difficulty: 2,
      gen(r) {
        const k = r.pick([0.1, 0.2, 0.5]), dx = r.pick([1, 2, 3]);
        const L = Math.exp(-k * dx);
        return {
          prompt: t`On the flat plane ($ds^2 = dx^2 + dy^2$) use instead the connection whose only coefficient is $\Gamma^x{}_{xx} = ${k}$ — torsion-free, but with $\nabla g \ne 0$. A unit vector $\partial_x$ is parallel-transported a distance $${dx}$ along the $x$-axis. How long is it at the end, as the metric measures it?`,
          visual: tp('stretch', [-1.5, 0], [r6(-1.5 + dx), 0.001], t`Transport with $\Gamma^x{}_{xx} = \kappa$ (drawn for $\kappa = ${k}$): the carried arrow shrinks.`, { k, angle: 0, field: false, view: { a: [-2, 2], b: [-1, 1] } }),
          answer: L, tol: { rel: 0.003 },
          errors: [{ value: 1, feedback: 'Only a metric-compatible connection keeps lengths; this one does not.' }, { value: 1 - k * dx, feedback: t`Solve $dV^x/dx = -\kappa V^x$ exactly: an exponential, not a straight line.` }].filter((e) => Math.abs(e.value - L) > 0.005),
          hints: [t`$\dfrac{dV^x}{dx} + \Gamma^x{}_{xx}\,V^x = 0$.`],
          teach: 'A connection that is not metric-compatible changes the lengths of the vectors it carries.',
          explain: t`$V^x = e^{-${k}x}$, so the length is $e^{-${nice(k * dx)}} = ${nice(L, 4)}$. Such a geometry would make a ruler carried along the $x$-axis shrink by its own rules — which is why GR insists on $\nabla g = 0$ (C12.3). Weyl’s 1918 unified theory had exactly this feature, and Einstein objected that atoms’ spectra would then depend on their history.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.4 (parallel transport)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Misner, Thorne & Wheeler, Gravitation, §6.5 and §10.2', url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation' },
    { label: 'Everitt et al., Gravity Probe B, Phys. Rev. Lett. 106 (2011) 221101', url: 'https://doi.org/10.1103/PhysRevLett.106.221101' },
  ],
});
