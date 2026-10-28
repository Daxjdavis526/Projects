// Divergence, curl and the Laplacian, physically: divergence as outflow per
// volume (sources), curl as circulation per area (a paddle wheel), the
// Laplacian as how far a value falls short of its neighbours' average. The
// divergence and Stokes theorems as these definitions added up, and the
// identity ∇×(∇×F) = ∇(∇·F) − ∇²F that turns Maxwell's equations into wave
// equations in W12. The computational drill lives in PHYS 3600 M0; here the
// pictures: a Rankine vortex (a hurricane), a rotating space station's air,
// a grid of temperatures, the field inside a wire, gravity in the crust.
import { lesson, mcq, num, multi, expr } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;
const MU0 = 1.25663706127e-6, G = 6.6743e-11;

// the worked example: a hurricane modelled as a Rankine vortex
const EX = (() => {
  const R = 20e3, v = 60, r2 = 100e3;
  const Om = v / R, zeta = 2 * Om, Gam = 2 * Math.PI * R * v;
  return { R, v, r2, Om, zeta, Gam, v2: Gam / (2 * Math.PI * r2) };
})();

// four plane fields, chosen by f: a source, rigid rotation, a shear flow, a Rankine vortex (core radius 0.5)
const pick = (k) => `step(0.5 - abs(f - ${k}))`;
const FOUR = {
  P: `${pick(0)}*x + ${pick(1)}*(-y) + ${pick(2)}*y + ${pick(3)}*(-y/max(x^2 + y^2, 0.25))`,
  Q: `${pick(0)}*y + ${pick(1)}*x + ${pick(3)}*(x/max(x^2 + y^2, 0.25))`,
};
const FIELDS = [
  { P: 'x', Q: 'y', name: 'a source', div: '> 0', curl: '0' },
  { P: '-y', Q: 'x', name: 'rigid rotation', div: '0', curl: '> 0' },
  { P: 'y', Q: '0', name: 'a shear flow', div: '0', curl: '< 0' },
  { P: '-y/max(x^2 + y^2, 0.25)', Q: 'x/max(x^2 + y^2, 0.25)', name: 'a vortex outside its core', div: '0', curl: '0' },
];
const fieldPic = (F, caption, more = {}) => ({ type: 'field2d', params: { P: F.P, Q: F.Q, x: [-2.5, 2.5], y: [-2.5, 2.5], readout: false, particles: true, probe: false, ...more }, caption });

export default lesson({
  id: 'phys3750.W11.1',
  title: 'Divergence, curl and the Laplacian, physically',
  minutes: 16, difficulty: 3,
  intro: t`Maxwell’s equations are written in three derivatives of fields, and each has a picture. The **divergence** is the net outflow per unit volume, the **curl** the circulation per unit area — what turns a tiny paddle wheel:

$$\begin{gathered}\nabla\cdot\vec F = \lim_{V\to0}\frac1V\oint_{\partial V}\vec F\cdot d\vec A \\ \hat n\cdot(\nabla\times\vec F) = \lim_{A\to0}\frac1A\oint_{\partial A}\vec F\cdot d\vec l\end{gathered}$$

Add these up over a region and you get the divergence theorem and Stokes’s theorem. The **Laplacian** $\nabla^2f = \nabla\cdot\nabla f$ measures how much $f$ at a point differs from its average nearby: over a small sphere of radius $r$, $\bar f - f = \tfrac{r^2}{6}\nabla^2f$. One identity ties them together and is the key to light in [the next module](#/lesson/phys3750.W12.1). For the drill — components, coordinates, proofs — see [gradient, divergence and curl revisited](#/lesson/phys3600.M0.1).`,
  equation: t`\nabla\times(\nabla\times\vec F) = \nabla(\nabla\cdot\vec F) - \nabla^2\vec F`,
  symbols: [
    { tex: '\\vec F', text: 'any smooth vector field — a velocity, an electric or a magnetic field' },
    { tex: '\\nabla\\cdot\\vec F', text: 'divergence: net outflow per unit volume; positive at a source, negative at a sink (units of $F$ per metre)' },
    { tex: '\\nabla\\times\\vec F', text: 'curl: a vector whose component along $\\hat n$ is the circulation per unit area around a small loop facing $\\hat n$' },
    { tex: '\\nabla^2', text: 'the Laplacian, $\\partial_x^2 + \\partial_y^2 + \\partial_z^2$, applied to each Cartesian component; units of $F$ per m²' },
    { tex: '\\nabla(\\nabla\\cdot\\vec F)', text: 'the gradient of the divergence: zero for a field with no sources, such as $\\vec E$ or $\\vec B$ in empty space' },
    { tex: 'V,\\ A,\\ d\\vec A,\\ d\\vec l', text: 'a small volume and area; an outward surface element and a step along a loop, taken counterclockwise about $\\hat n$' },
  ],
  why: t`In empty space $\nabla\cdot\vec E = 0$, so taking the curl of Faraday’s law and using this identity leaves $-\nabla^2\vec E$ — the step that turns Maxwell’s equations into the wave equation.`,
  visual: {
    type: 'field2d',
    title: 'Sources, swirls and paddle wheels',
    lead: t`Four flows in the plane. Drag the probe: it reads the field, its divergence and its curl. The gold circle compares the circulation round it with the flux of the curl through it.`,
    tasks: [
      t`Source: tracers spread apart, the divergence is $2$ everywhere and the curl is $0$.`,
      t`Shear flow, $\vec F = (y, 0)$: every tracer moves in a straight line, yet the curl is $-1$ — a paddle wheel would spin, because the top of it is pushed harder than the bottom.`,
      t`Vortex: everything circulates, but outside the core the curl reads $0$. All of the circulation round the circle comes from the core inside it.`,
    ],
    params: { P: FOUR.P, Q: FOUR.Q, x: [-2.5, 2.5], y: [-2.5, 2.5], probe: [1.2, 0.8], loop: { r: 1.2 }, choices: [{ key: 'f', label: 'Flow', options: [[0, 'source (x, y)'], [1, 'rigid rotation (−y, x)'], [2, 'shear (y, 0)'], [3, 'vortex with a core']], value: 0, explain: 'Each flow is drawn as arrows, coloured by speed, with tracers carried along it.' }] },
    caption: t`Plane fields (no $z$-dependence), so the 2D divergence and the $z$-curl are the whole story. The vortex is a Rankine vortex: rigid rotation inside radius 0.5, speed falling as $1/r$ outside. Units arbitrary.`,
  },
  example: {
    prompt: t`Model a hurricane as a **Rankine vortex**: inside the eyewall radius $R = ${EX.R / 1000}$ km the air turns like a rigid body, and outside its speed falls as $1/r$. The peak wind, at $R$, is ${EX.v} m/s. Find the vorticity (the curl of the velocity) in the core and outside, the circulation round the storm, and the wind ${EX.r2 / 1000} km from the centre.`,
    steps: [
      { label: 'Core', text: t`Rigid rotation, $\vec v = \Omega\,\hat z\times\vec r$ with $\Omega = v/R = ${tn(EX.Om)}\ \text{s}^{-1}$. In components $\vec v = \Omega(-y, x, 0)$, so $(\nabla\times\vec v)_z = \partial_xv_y - \partial_yv_x = 2\Omega = ${tn(EX.zeta)}\ \text{s}^{-1}$: twice the rotation rate.` },
      { label: 'Why twice', text: t`Circulation round a circle of radius $r < R$: $\oint\vec v\cdot d\vec l = (\Omega r)(2\pi r) = 2\Omega\cdot\pi r^2$. Circulation per area is $2\Omega$, the definition of the curl.` },
      { label: 'Outside', text: t`$v = \Gamma/2\pi r$ makes the circulation the same, $\Gamma$, round every circle enclosing the core. With no extra circulation between two circles, the curl there is zero: the air circles, but a paddle wheel riding with it would not spin.` },
      { label: 'Stokes', text: t`$\Gamma = \oint\vec v\cdot d\vec l = \int(\nabla\times\vec v)\cdot d\vec A = 2\Omega\,\pi R^2$ $= 2\pi Rv = ${tn(EX.Gam)}\ \text{m}^2/\text{s}$ — all of it from the core.` },
      { label: 'Far wind', text: t`At $r = ${EX.r2 / 1000}$ km: $v = \Gamma/2\pi r = vR/r = ${tn(EX.v2)}$ m/s.` },
      { label: 'Honest check', text: t`Real hurricanes are not Rankine vortices: friction with the sea and the inflow make the outer winds fall more slowly than $1/r$ near the eyewall and faster far out. The model gets the core’s rotation and the circulation’s bookkeeping right.` },
    ],
    answer: t`Core vorticity $2\Omega = ${tn(EX.zeta)}\ \text{s}^{-1}$, zero outside; circulation $${tn(EX.Gam)}\ \text{m}^2/\text{s}$; wind at ${EX.r2 / 1000} km about ${tn(EX.v2)} m/s.`,
    visual: curvesPic([{ fn: `min(x/20, 20/x)*60`, color: 'accent', width: 2.4, domain: [0.1, 120] }], [0, 120], [0, 70], t`Wind speed against distance from the centre in the Rankine model: rising linearly to the eyewall, then falling as $1/r$. A model, not a measured profile.`, { xlabel: 'r (km)', ylabel: 'v (m/s)', vlines: [{ x: 20, label: 'R', color: 'gold' }] }),
  },
  practice: [
    num({
      id: 'station-air', difficulty: 2, transfer: true,
      gen(r) {
        const rpm = r.pick([1, 2, 3, 4]);
        const Om = (2 * Math.PI * rpm) / 60, z = 2 * Om;
        return {
          prompt: t`A ring-shaped space station spins at ${rpm} rpm for artificial gravity, and the air inside turns with it like a rigid body. What is the curl of the air’s velocity, $|\nabla\times\vec v|$, in s⁻¹?`,
          visual: fieldPic(FIELDS[1], t`Rigid rotation, $\vec v = \Omega(-y, x)$, seen from the axis. Arrow length shows speed; units arbitrary.`),
          answer: z, units: 's^-1', tol: { rel: 0.01 },
          errors: [{ value: Om, feedback: t`That is the rotation rate $\Omega$. The curl of a rigid rotation is $2\Omega$: circulation $2\pi r\cdot\Omega r$ over area $\pi r^2$.` }, { value: 2 * rpm / 60, feedback: t`Convert revolutions to radians: $\Omega = 2\pi\times(\text{rpm})/60$.` }],
          hints: [t`$\Omega = 2\pi\times${rpm}/60$ rad/s.`, t`For $\vec v = \Omega(-y, x, 0)$, $(\nabla\times\vec v)_z = \partial_xv_y - \partial_yv_x = 2\Omega$.`],
          teach: t`Rigid rotation has curl $2\Omega$ everywhere: the vorticity is twice the angular velocity.`,
          explain: t`$\Omega = ${tn(Om)}$ rad/s, so $\nabla\times\vec v = 2\Omega = ${tn(z)}\ \text{s}^{-1}$, the same at every point — including the axis, where the air is not moving at all.`,
        };
      },
    }),
    mcq({
      id: 'read-field', difficulty: 2,
      gen(r) {
        const k = r.int(0, 3), F = FIELDS[k];
        const opts = [t`$\nabla\cdot\vec F > 0$ and $(\nabla\times\vec F)_z = 0$`, t`$\nabla\cdot\vec F = 0$ and $(\nabla\times\vec F)_z > 0$`, t`$\nabla\cdot\vec F = 0$ and $(\nabla\times\vec F)_z < 0$`, t`$\nabla\cdot\vec F = 0$ and $(\nabla\times\vec F)_z = 0$`];
        const WHY = [
          'Tracers here move apart: more flows out of a small box than in. That is divergence, not curl.',
          'A paddle wheel at the probe would turn counterclockwise; the field circulates round every point, not only round the centre.',
          'A paddle wheel at the probe would turn clockwise: its top is pushed to the right harder than its bottom.',
          'Following a flow round a centre is not the same as rotating locally: outside the core, the faster inner side and the curving path cancel exactly.',
        ];
        const why = {};
        for (let i = 0; i < 4; i++) if (i !== k) why[i] = t`${WHY[i]} Here the field is ${F.name}.`;
        return {
          prompt: t`The picture shows a plane flow and a probe point. Which describes the flow at the probe?`,
          visual: { type: 'field2d', params: { P: F.P, Q: F.Q, x: [-2.5, 2.5], y: [-2.5, 2.5], readout: false, particles: true, probe: [1.4, 0.9] }, caption: 'A plane field, arrows coloured by speed, with tracers. The numbers are hidden.' },
          choices: opts, answer: k, fixedOrder: true, why,
          hints: ['Divergence: do tracers near the probe move apart? Curl: would a tiny paddle wheel at the probe spin?', 'For a paddle wheel, compare the push on its opposite sides, not the direction the whole flow goes round.'],
          teach: 'Divergence asks “spreading?”, curl asks “would a paddle wheel spin here?” — both are local questions.',
          explain: t`This is ${F.name}: $\nabla\cdot\vec F ${F.div === '0' ? '= 0' : F.div}$ and $(\nabla\times\vec F)_z ${F.curl === '0' ? '= 0' : F.curl}$ at the probe.`,
        };
      },
    }),
    num({
      id: 'laplacian-grid', difficulty: 3,
      gen(r) {
        const T0 = r.pick([310, 325, 340]), d = [r.int(-6, 4), r.int(-6, 4), r.int(-5, 3), r.int(-7, 2)];
        if (d.reduce((a, b) => a + b, 0) === 0) d[0] -= 2;
        const h = r.pick([0.5, 1, 2]), Ts = d.map((x) => T0 + x), lap = (Ts.reduce((a, b) => a + b, 0) - 4 * T0) / (h / 100) ** 2;
        return {
          prompt: t`A thermal camera images a circuit board on a grid of spacing $h = ${h}$ cm. At one pixel the temperature is ${T0} K; its four neighbours read ${Ts.join(', ')} K. Estimate $\nabla^2T$ there, in K/m², with $\nabla^2T \approx (T_E + T_W + T_N + T_S - 4T_0)/h^2$.`,
          visual: { type: 'graph', params: { x: [-2, 2], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ fn: '0', domain: [-1, 1], color: 'ink4', width: 1 }, { param: ['0', 't'], t: [-1, 1], color: 'ink4', width: 1 }], points: [{ x: 0, y: 0, color: 'gold', r: 6, label: `${T0} K`, labelDx: 8, labelDy: -12 }, { x: 1, y: 0, color: 'accent', r: 5, label: `${Ts[0]}`, labelDx: 8 }, { x: -1, y: 0, color: 'accent', r: 5, label: `${Ts[1]}`, labelAlign: 'right', labelDx: -8 }, { x: 0, y: 1, color: 'accent', r: 5, label: `${Ts[2]}`, labelDx: 8 }, { x: 0, y: -1, color: 'accent', r: 5, label: `${Ts[3]}`, labelDx: 8 }] }, caption: t`The pixel (gold) and its four neighbours, $h$ apart, in K.` },
          answer: lap, units: 'K/m^2', tol: { rel: 0.01 },
          errors: [{ value: lap * (h / 100), feedback: t`Divide by $h^2$, not $h$: the Laplacian is a second derivative.` }, { value: lap / 4, feedback: t`That is (average − centre)$/h^2$. The 2D stencil is $4(\bar T - T_0)/h^2$.` }],
          hints: [t`Convert $h$ to metres: $${h / 100}$ m.`, t`Sum of neighbours minus $4T_0$: $${Ts.reduce((a, b) => a + b, 0)} - ${4 * T0}$ K, then divide by $h^2$.`],
          teach: t`$\nabla^2T \approx 4(\bar T_{\text{neighbours}} - T_0)/h^2$ in 2D: positive where a point is colder than its surroundings.`,
          explain: t`$(${Ts.reduce((a, b) => a + b, 0)} - ${4 * T0})/(${h / 100})^2 = ${tn(lap)}$ K/m². ${lap < 0 ? 'Negative: the pixel is a local hot spot, so by the heat equation $\\partial_tT = D\\nabla^2T$ it is cooling.' : 'Positive: the pixel is colder than its neighbours, so by the heat equation it is warming.'}`,
        };
      },
    }),
    num({
      id: 'wire-inside', difficulty: 3,
      gen(r) {
        const I = r.pick([20, 50, 120]), a = r.pick([2, 4, 5]), rr = r.pick([0.5, 1, 1.5]);
        const B = (MU0 * I * (rr / 1000)) / (2 * Math.PI * (a / 1000) ** 2);
        return {
          prompt: t`A straight copper bar of radius ${a} mm carries ${I} A spread uniformly over its cross-section, so inside it $\nabla\times\vec B = \mu_0\vec J$ with $J$ constant. Using Stokes’s theorem on a circle of radius ${rr} mm around the axis, find $B$ there, in mT. ($\mu_0 = 1.2566\times10^{-6}$ T m/A.)`,
          visual: curvesPic([{ fn: 'min(x, 1/x)', color: 'accent', width: 2.4, domain: [0.02, 3] }], [0, 3], [0, 1.15], t`The shape of $B(r)$ for a uniform current: rising inside the bar (radius $a$), falling as $1/r$ outside. Relative units.`, { xlabel: 'r / a', ylabel: 'B', yticks: 0, vlines: [{ x: 1, label: 'a', color: 'gold' }] }),
          answer: B * 1000, units: 'mT', tol: { rel: 0.01 },
          errors: [{ value: ((MU0 * I) / (2 * Math.PI * (rr / 1000))) * 1000, feedback: t`That encloses the whole current. A circle inside the bar only encloses $I\,r^2/a^2$ — the curl through it is $\mu_0J\cdot\pi r^2$.` }],
          hints: [t`$\oint\vec B\cdot d\vec l = B\cdot2\pi r$ and $\int(\nabla\times\vec B)\cdot d\vec A = \mu_0J\pi r^2$ with $J = I/\pi a^2$.`, t`$B = \mu_0Ir/2\pi a^2$.`],
          teach: 'Stokes’s theorem: circulation round a loop equals the curl added up over any surface it bounds.',
          explain: t`$B\cdot2\pi r = \mu_0(I/\pi a^2)\pi r^2$, so $B = \dfrac{\mu_0Ir}{2\pi a^2} = ${tn(B * 1000)}$ mT. Outside the bar the curl is zero and $B$ falls as $1/r$ — the same pattern as the Rankine vortex.`,
        };
      },
    }),
    multi({
      id: 'curl-free', difficulty: 3,
      prompt: t`Which of these fields have **zero curl** in the region described? (Select all that apply.)`,
      visual: fieldPic(FIELDS[3], t`A vortex: rigid rotation inside a small core, speed $\propto 1/r$ outside. Units arbitrary.`),
      choices: [
        'Gravity near Earth’s surface, taken as uniform',
        'The electric field of a point charge, away from the charge',
        'Air swirling round a bathtub drain with speed ∝ 1/r, away from the central core',
        'The magnetic field outside a long straight wire',
        'Air turning rigidly with a rotating space station',
      ],
      answer: [0, 1, 2, 3],
      why: { 4: t`Rigid rotation has curl $2\Omega$ everywhere — even on the axis.` },
      hints: ['A field that goes round in circles can still have zero curl, if the circulation round every small loop cancels.', t`For $v = \Gamma/2\pi r$ the circulation round any loop that misses the centre is zero.`],
      teach: 'Zero curl means no circulation round any small loop — not that the field never goes round.',
      explain: t`Uniform and Coulomb fields are gradients, so their curl vanishes. The $1/r$ swirl and the wire’s $\vec B$ circle a centre, but all their circulation is concentrated in the core or the wire: elsewhere $\nabla\times = 0$. Only the rigidly turning air has curl, $2\Omega$, everywhere.`,
    }),
    mcq({
      id: 'open-surface', kind: 'error', difficulty: 3,
      prompt: t`Find the error. For $\vec F = (x, y, 2)$ and the curved dome of a hemisphere of radius $R$ (the bowl only, no base), a student writes: “By the divergence theorem, the flux through the dome is $\int\nabla\cdot\vec F\,dV = 2\times\tfrac23\pi R^3 = \tfrac43\pi R^3$.”`,
      visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-0.5, 1.4], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, Math.PI], color: 'accent', width: 2.4 }, { fn: '0', domain: [-1, 1], color: 'ink3', dash: [5, 4], width: 1.5 }], arrows: [{ from: [0.71, 0.71], to: [1.0, 1.0], color: 'gold' }, { from: [0, 1], to: [0, 1.32], color: 'gold' }, { from: [-0.4, 0], to: [-0.4, -0.35], color: 'violet', label: 'base?', labelDx: 6 }] }, caption: 'A side view of the dome (blue) and the flat disc that would close it (dashed). Arrows: outward normals.' },
      choices: [
        t`The dome is not a closed surface: the divergence theorem gives dome + base, and the base carries flux $-2\pi R^2$, so the dome’s flux is $\tfrac43\pi R^3 + 2\pi R^2$`,
        t`The divergence of $(x, y, 2)$ is 4, not 2, because the constant component also counts`,
        t`The volume of a hemisphere is $\tfrac43\pi R^3$, so the flux is $\tfrac83\pi R^3$`,
        t`The divergence theorem applies only to fields with zero divergence`,
      ],
      answer: 0,
      why: {
        1: t`$\partial(2)/\partial z = 0$: a constant contributes nothing. $\nabla\cdot\vec F = 1 + 1 + 0 = 2$.`,
        2: t`$\tfrac43\pi R^3$ is a whole ball; the hemisphere has half of it, and the student had that part right.`,
        3: t`It applies to any smooth field; it is Gauss’s law with nonzero divergence that makes it useful.`,
      },
      hints: ['The divergence theorem needs a closed surface. What would close this one?', t`On the base ($z = 0$) the outward normal is $-\hat z$, and $\vec F\cdot(-\hat z) = -2$.`],
      teach: 'The divergence theorem counts the flux out of a closed surface; for an open one, close it and subtract the lid.',
      explain: t`Closing the bowl with its base: $\Phi_{\text{dome}} + \Phi_{\text{base}} = \tfrac43\pi R^3$, and $\Phi_{\text{base}} = (-2)(\pi R^2)$. So $\Phi_{\text{dome}} = \tfrac43\pi R^3 + 2\pi R^2$.`,
    }),
    expr({
      id: 'curl-curl', difficulty: 3,
      prompt: t`Take $\vec F = \big(0,\ A\sin kx,\ 0\big)$, a snapshot of a wave’s field. Use $\nabla\times(\nabla\times\vec F) = \nabla(\nabla\cdot\vec F) - \nabla^2\vec F$ to find the $y$-component of $\nabla\times(\nabla\times\vec F)$.`,
      visual: curvesPic([{ fn: 'sin(2*x)', color: 'accent', width: 2.2 }], [0, 6.3], [-1.5, 1.5], t`$F_y$ along $x$ at one instant, with arrows showing the field’s direction (relative units).`, { xlabel: 'x', ylabel: 'F (y)', arrows: [0.4, 0.8, 1.2, 2.0, 2.4, 2.8, 3.6, 4.0, 4.4, 5.2, 5.6, 6.0].map((x) => ({ from: [x, 0], to: [x, +(0.9 * Math.sin(2 * x)).toFixed(3)], color: 'gold', width: 1.2 })) }),
      answer: 'A k^2 sin(k x)', answerTeX: t`Ak^2\sin kx`,
      vars: { A: [0.5, 2], k: [0.5, 3], x: [-2, 2] },
      errors: [{ answer: '-A k^2 sin(k x)', feedback: t`$\nabla^2F_y = -k^2A\sin kx$, and the identity subtracts it: $-\nabla^2\vec F$ is $+k^2\vec F$.` }, { answer: 'A k sin(k x)', feedback: 'Two derivatives, so two factors of k.' }],
      hints: [t`$\nabla\cdot\vec F = \partial_y(A\sin kx) = 0$.`, t`$\nabla^2(A\sin kx) = -k^2A\sin kx$.`],
      teach: t`For a transverse field ($\nabla\cdot\vec F = 0$), $\nabla\times\nabla\times\vec F = -\nabla^2\vec F$: for a sine, $+k^2\vec F$.`,
      explain: t`$\nabla\cdot\vec F = 0$, so $\nabla\times(\nabla\times\vec F) = -\nabla^2\vec F$, whose $y$-component is $Ak^2\sin kx$. In W12 this turns Faraday’s and Ampère’s laws into $\nabla^2\vec E = \mu_0\varepsilon_0\partial_t^2\vec E$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-scatterometer', difficulty: 3, transfer: true,
      gen(r) {
        const v = r.pick([45, 55, 70]), R = r.pick([15, 25, 30]), rr = r.pick([80, 120, 200]);
        const v2 = (v * R) / rr;
        return {
          prompt: t`A satellite scatterometer, which infers wind from radar echoes off the ruffled sea, measures a hurricane’s strongest winds, ${v} m/s, at its eyewall ${R} km from the centre. Modelling the storm as a Rankine vortex (rigid rotation inside, zero curl outside), what wind do you predict ${rr} km from the centre, in m/s?`,
          visual: fieldPic(FIELDS[3], t`A vortex with a rigidly turning core (schematic, not to scale).`),
          answer: v2, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: (v * R * R) / (rr * rr), feedback: t`Zero curl outside means the circulation $2\pi rv$ is the same round every circle: $v \propto 1/r$, not $1/r^2$.` }, { value: (v * rr) / R, feedback: t`$v \propto r$ holds only inside the core. Outside, the circulation is fixed.` }],
          hints: [t`Outside the core, $\nabla\times\vec v = 0$, so by Stokes the circulation round any circle enclosing the core is the same.`, t`$2\pi R\,v_{\max} = 2\pi r\,v(r)$.`],
          teach: 'Outside a vortex core the circulation is the same for every enclosing circle, so the speed falls as 1/r.',
          explain: t`$v = ${v}\times${R}/${rr} = ${tn(v2)}$ m/s. Real storms deviate — friction and inflow matter — but this is the first estimate, and it shows why the strongest winds are at the eyewall.`,
        };
      },
    }),
    num({
      id: 'cp-crust', difficulty: 3, transfer: true,
      gen(r) {
        const rho = r.pick([2700, 3300, 5500]), R = r.pick([50, 100, 200]);
        const lap = 4 * Math.PI * G * rho, dPhi = (R * R / 6) * lap;
        return {
          prompt: t`Inside rock of density $\rho = ${rho}$ kg/m³, the gravitational potential obeys Poisson’s equation $\nabla^2\Phi = 4\pi G\rho$. By how much does the average of $\Phi$ over a sphere of radius ${R} m exceed its value at the sphere’s centre, in J/kg? Use $\bar\Phi - \Phi_0 = \tfrac{r^2}{6}\nabla^2\Phi$ and $G = 6.674\times10^{-11}$ N m²/kg².`,
          visual: curvesPic([{ fn: 'x^2', color: 'accent', width: 2.4, domain: [-1.2, 1.2] }, { fn: '1/3', color: 'gold', dash: [5, 4], width: 1.4, domain: [-1, 1], label: 'average', labelAt: 0.7, labelDy: -10 }], [-1.3, 1.3], [-0.2, 1.4], t`A potential curving upward (a cut through it, relative units): its average over a region lies above its value at the centre by an amount set by the Laplacian.`, { xlabel: 'x', ylabel: 'Φ', yticks: 0, points: [{ x: 0, y: 0, color: 'ink', r: 4.5 }] }),
          answer: dPhi, units: 'J/kg', tol: { rel: 0.01 },
          errors: [{ value: (R * R / 4) * lap, feedback: t`$r^2/4$ is the formula for a circle in 2D. Over a sphere in 3D it is $r^2/6$.` }, { value: R * R * lap, feedback: t`Keep the factor $\tfrac16$: $\bar\Phi - \Phi_0 = \tfrac{r^2}{6}\nabla^2\Phi$.` }],
          hints: [t`$\nabla^2\Phi = 4\pi G\rho = ${tn(lap)}\ \text{s}^{-2}$.`, t`Multiply by $r^2/6$ with $r = ${R}$ m.`],
          teach: 'The Laplacian measures how much a quantity’s average around a point exceeds its value there.',
          explain: t`$\nabla^2\Phi = ${tn(lap)}\ \text{s}^{-2}$, so $\bar\Phi - \Phi_0 = \tfrac{${R}^2}{6}\times${tn(lap)} = ${tn(dPhi)}$ J/kg. In empty space $\nabla^2\Phi = 0$ and the average equals the centre value — which is why a potential in empty space has no local minimum, and no arrangement of masses can hold a test mass in stable static equilibrium there (Earnshaw’s theorem, for gravity).`,
        };
      },
    }),
    mcq({
      id: 'cp-hot-spot', difficulty: 2,
      prompt: t`At one point inside a block of metal, the temperature field has $\nabla^2T < 0$. What does that say about the point, and what happens next? (Heat flows by $\partial_tT = D\nabla^2T$.)`,
      visual: curvesPic([{ fn: '1 - x^2', color: 'accent', width: 2.4, domain: [-1.2, 1.2] }], [-1.4, 1.4], [-0.6, 1.3], t`A cut through a temperature field that curves downward at the centre (relative units).`, { xlabel: 'x', ylabel: 'T', yticks: 0, points: [{ x: 0, y: 1, color: 'gold', r: 5 }] }),
      choices: [
        'It is hotter than the average of its surroundings, so it cools',
        'It is colder than the average of its surroundings, so it warms',
        'It is a point of zero temperature gradient, so nothing changes there',
        'Its temperature is falling linearly with position, so heat flows steadily through it',
      ],
      answer: 0,
      why: {
        1: t`That is $\nabla^2T > 0$: the average around exceeds the centre value.`,
        2: t`A zero gradient with $\nabla^2T < 0$ is a maximum, and a maximum cools. The Laplacian, not the gradient, sets $\partial_tT$.`,
        3: t`A linear profile has $\nabla^2T = 0$: as much heat arrives as leaves.`,
      },
      hints: [t`$\bar T - T_0 = \tfrac{r^2}{6}\nabla^2T$.`, t`The heat equation makes $\partial_tT$ the same sign as $\nabla^2T$.`],
      teach: 'A negative Laplacian marks a local excess over the surroundings — a hot spot that diffusion flattens.',
      explain: t`$\nabla^2T < 0$ means $\bar T < T_0$: the point stands above its neighbours, and $\partial_tT = D\nabla^2T < 0$. Diffusion pulls every value toward its local average.`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 16: The curl (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1016&context=foundation_wave' },
    { label: 'Schey, Div, Grad, Curl, and All That, 4th ed. (Norton, 2005)', url: 'https://wwnorton.com/books/9780393925166' },
    { label: 'Holton & Hakim, An Introduction to Dynamic Meteorology, 5th ed., §4.2: vorticity and circulation', url: 'https://doi.org/10.1016/C2009-0-63394-8' },
  ],
});
