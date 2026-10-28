// From physical laws to PDEs: a field u(x, t), a law relating its rates of
// change, and the three archetypes — transport, wave, heat — that the course
// is built on. Classification (order, linearity, homogeneity) and the data a
// PDE needs before it predicts anything.
import { lesson, mcq, multi, num, match } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { player, xtPlane, MATERIALS, LI900, SRC } from './_pde.js';

const t = String.raw;

// three outcomes of one bump after 2 s, stacked in bands: P carried, Q split, R spread
const outcomes = {
  type: 'graph',
  params: {
    x: [-8, 8], y: [-0.25, 3.85], aspect: 'wide', xlabel: 'x (m)', ylabel: '', yticks: 0,
    hlines: [{ y: 0, color: 'ink4' }, { y: 1.3, color: 'ink4' }, { y: 2.6, color: 'ink4' }],
    curves: [
      { fn: '2.6 + e^(-x^2)', color: 'ink3', dash: [5, 4], width: 1.3 },
      { fn: '1.3 + e^(-x^2)', color: 'ink3', dash: [5, 4], width: 1.3 },
      { fn: 'e^(-x^2)', color: 'ink3', dash: [5, 4], width: 1.3 },
      { fn: '2.6 + e^(-(x-4)^2)', color: 'accent', width: 2.4 },
      { fn: '1.3 + 0.5e^(-(x-4)^2) + 0.5e^(-(x+4)^2)', color: 'violet', width: 2.4 },
      { fn: 'sqrt(0.2)*e^(-x^2/5)', color: 'teal', width: 2.4 },
    ],
    points: [
      { x: -7.6, y: 3.3, label: 'P', r: 0, color: 'accent' },
      { x: -7.6, y: 2.0, label: 'Q', r: 0, color: 'violet' },
      { x: -7.6, y: 0.7, label: 'R', r: 0, color: 'teal' },
    ],
  },
  caption: t`Three futures of the same bump $e^{-x^2}$ (dashed), each at $t = 2$ s, drawn in separate bands. Every curve is computed exactly.`,
};

// characteristics of u_t + u u_x = 0 from the bump e^(−x²): each piece moves at its own height
const burgersChars = xtPlane({
  x: [-2.5, 3.5], y: [0, 2.2], xticks: 7,
  curves: [-2, -1.5, -1, -0.7, -0.4, -0.1, 0.2, 0.5, 0.8, 1.1, 1.5, 2].map((x0) => ({ param: [`${x0} + e^(-(${x0})^2)*t`, 't'], t: [0, 2.2], color: 'accent', width: 1.4 })),
}, t`Characteristics of $u_t + u\,u_x = 0$ starting from the bump $u = e^{-x^2}$: each piece of the profile moves at a speed equal to its own height, so tall pieces overtake low ones and the lines cross (module B11 calls that a shock). The term $\nu u_{xx}$ would round the crossing off.`);

export default lesson({
  id: 'st-b.B0.1',
  title: 'From physical laws to PDEs',
  minutes: 11, difficulty: 2,
  intro: t`A **field** is a quantity spread over space and time: the temperature through a heat-shield tile, the concentration of a pollutant in a river, the sideways displacement of a stretched cable. Write it $u(x, t)$. A physical law that ties together its rates of change — in time and in space — is a **partial differential equation** (PDE). Three of them carry most of this course:

$$\underbrace{u_t + c\,u_x = 0}_{\text{transport}}\qquad \underbrace{u_{tt} = c^2\,u_{xx}}_{\text{wave}}\qquad \underbrace{u_t = D\,u_{xx}}_{\text{heat (diffusion)}}$$

Each one is a rule for **what happens next, given what is here now**: the first carries a profile along unchanged, the second sends disturbances out both ways at speed $c$, the third spreads and flattens. A PDE alone does not decide which solution you get; you also need **data** — the initial state, and what happens at the edges.`,
  symbols: [
    { tex: t`u(x, t)`, text: 'the field: a temperature (K), a concentration (kg/m³), a displacement (m)… at position $x$ (m) and time $t$ (s)' },
    { tex: t`u_t = \frac{\partial u}{\partial t}`, text: 'the rate of change in time at a fixed place (subscripts mean partial derivatives)' },
    { tex: t`u_x = \frac{\partial u}{\partial x}`, text: 'the slope in space at a fixed time' },
    { tex: t`u_{xx},\ u_{tt}`, text: 'second derivatives: the curvature of the profile in space, the acceleration in time' },
    { tex: 'c', text: 'a speed (m/s): how fast the profile is carried, or how fast waves run' },
    { tex: 'D', text: 'a diffusivity (m²/s): how fast a profile spreads. For heat it is the thermal diffusivity $\\alpha = k/(\\rho c_p)$' },
  ],
  why: t`Einstein’s field equations are ten PDEs for the ten functions $g_{\mu\nu}(t, x, y, z)$ of the metric; module B15 of this course reads them as exactly the kind of evolution law met here.`,
  visual: {
    type: 'pde-player',
    title: 'One bump, three laws',
    lead: t`The same initial bump (dashed) evolved by three different laws. Above: $u$ against $x$ at the time $t$ on the slider. Below: the $x$–$t$ plane, with $u$ as shading — each horizontal line through it is one snapshot — and the gold line marking the snapshot shown above.`,
    tasks: [
      'Play the transport law: the bump slides along unchanged. The grey lines below are the paths it slides along.',
      'Switch to the wave law: the bump splits into two half-height copies that run apart at speed c.',
      'Switch to the heat law: the bump never moves or splits; it sinks and spreads.',
    ],
    params: { mode: 'transport', modes: ['transport', 'wave', 'heat'], profile: 'gauss', c: 2, D: 0.5, w: 1, tmax: 4, x: [-10, 10] },
    caption: t`Exact solutions on an infinite line ($c = 2$ m/s, $D = 0.5\ \text{m}^2/\text{s}$ unless you change them); the window is a piece of it, and nothing reflects from its edges. Shading below: blue for $u > 0$, deeper for larger $u$.`,
  },
  example: {
    prompt: t`Show that $u(x, t) = x^2 + 2Dt$ solves the heat equation $u_t = D\,u_{xx}$. Classify the equation, and decide whether the equation alone fixes $u$.`,
    visual: { type: 'graph', params: { x: [-2, 2], y: [-0.3, 6.2], aspect: 'wide', xlabel: 'x', ylabel: 'u', curves: [
      { fn: 'x^2', color: 'accent', label: 't = 0', labelAt: 1.5, labelDx: 8 },
      { fn: 'x^2 + 1', color: 'violet', label: 't = 1', labelAt: 1.5, labelDx: 8 },
      { fn: 'x^2 + 2', color: 'teal', label: 't = 2', labelAt: 1.5, labelDx: 8 },
    ] }, caption: t`$u = x^2 + 2Dt$ with $D = \tfrac12$ at three times: the parabola keeps its shape and rises uniformly. Its curvature $u_{xx} = 2$ is the same everywhere, so it warms at the same rate everywhere.` },
    steps: [
      { label: 'Rate in time', text: t`Hold $x$ fixed and differentiate in $t$: $u_t = 2D$.` },
      { label: 'Curvature in space', text: t`Hold $t$ fixed and differentiate twice in $x$: $u_x = 2x$, then $u_{xx} = 2$.` },
      { label: 'Substitute', text: t`$D\,u_{xx} = 2D = u_t$. ✓ The law says **curvature drives change**: a profile that curves upward (a cold dip) warms; one that curves downward (a hot spot) cools.` },
      { label: 'Classify', text: t`The highest derivative is $u_{xx}$: **second order**. The unknown and its derivatives appear only to the first power, never multiplied together, with coefficients that do not depend on $u$: **linear**. No term is free of $u$: **homogeneous**.` },
      { label: 'Not unique', text: t`$u = 0$, $u = x^2 + 2Dt + 7$ and $u = x$ solve it too — infinitely many solutions. The PDE is a law, not an answer: an initial profile $u(x, 0)$ (and, on a finite rod, conditions at its ends) picks one out.` },
    ],
    answer: t`$u_t = 2D = D\,u_{xx}$ ✓. The heat equation is second order, linear and homogeneous, and needs data — an initial profile and edge conditions — to select one solution.`,
  },
  practice: [
    match({
      id: 'three-futures', difficulty: 1,
      prompt: t`The bump $u(x, 0) = e^{-x^2}$ is evolved for $t = 2$ s by three different laws. Match each law to its outcome in the picture.`,
      visual: outcomes,
      left: [t`$u_t + 2u_x = 0$`, t`$u_{tt} = 4u_{xx}$`, t`$u_t = \tfrac12 u_{xx}$`],
      right: ['P: carried along unchanged', 'Q: split into two half-height copies', 'R: spread and flattened, centre fixed', 'none of the three'],
      answer: [0, 1, 2],
      hints: ['First-order in time and space, with a speed: the profile is carried. Second-order in time: waves go both ways.', 'Only one law has no speed in it at all, just a diffusivity: that one spreads.'],
      teach: 'Transport carries a profile, the wave law splits it into two travelling halves, and diffusion spreads it in place.',
      explain: t`$u_t + 2u_x = 0$ carries the bump 4 m to the right in 2 s (P). $u_{tt} = 4u_{xx}$ has $c = 2$: two half-height copies at $x = \pm 4$ (Q). $u_t = \tfrac12 u_{xx}$ spreads it: the peak falls to $\sqrt{0.5/2.5} \approx 0.45$ and the bump widens (R).`,
    }),
    mcq({
      id: 'classify-burgers', difficulty: 2,
      prompt: t`Viscous Burgers’ equation, a model of a gas with sound-wave steepening and viscosity $\nu$, reads $u_t + u\,u_x = \nu\,u_{xx}$. Classify it.`,
      visual: burgersChars,
      choices: ['second order, nonlinear', 'first order, nonlinear', 'second order, linear', 'third order, nonlinear'],
      answer: 0,
      why: {
        1: t`The order is the highest derivative present, and $u_{xx}$ is a second derivative.`,
        2: t`$u\,u_x$ multiplies the unknown by its own derivative. Linear would need every term to be (a known function) × ($u$ or one of its derivatives).`,
        3: t`Orders do not add across terms: the order is the single highest derivative, $u_{xx}$.`,
      },
      hints: ['The order is the highest derivative that appears.', t`Linear means no products of $u$ with itself or its derivatives. Look at $u\,u_x$.`],
      teach: 'Order = highest derivative; linear = the unknown and its derivatives appear only to the first power, never multiplied together.',
      explain: t`Second order because of $u_{xx}$; nonlinear because of $u\,u_x$ — which is why the speed of each piece of the profile depends on the profile itself, as the crossing characteristics show.`,
    }),
    multi({
      id: 'which-linear', difficulty: 2,
      prompt: t`Which of these PDEs are **linear**? (Select all that apply.)`,
      choices: [
        t`$u_t + x\,u_x = 0$`,
        t`$u_{tt} = c^2u_{xx} - g$ (a string sagging under gravity)`,
        t`$u_t = D\,u_{xx} + u^2$`,
        t`$u_x^2 + u_y^2 = 1$`,
        t`$u_t = D\,u_{xx} + \sin(\omega t)$`,
      ],
      answer: [0, 1, 4],
      why: {
        2: t`$u^2$ is the unknown times itself: nonlinear. (Doubling a solution no longer gives a solution.)`,
        3: t`The derivatives are squared: nonlinear. This is the eikonal equation of wavefronts.`,
      },
      hints: [t`Coefficients may depend on $x$ and $t$; only products involving $u$ break linearity.`, t`A term with no $u$ in it at all, like $-g$ or $\sin\omega t$, is a source: it makes the equation inhomogeneous, not nonlinear.`],
      teach: 'Linearity is about how the unknown appears, not about the coefficients or source terms.',
      explain: t`$x\,u_x$ has a variable coefficient but is still first power in $u$: linear. $-g$ and $\sin(\omega t)$ are sources: linear but **inhomogeneous**. $u^2$ and $u_x^2 + u_y^2$ are nonlinear.`,
    }),
    num({
      id: 'dip-warms', difficulty: 2,
      gen(r) {
        const m = r.pick(MATERIALS), B = r.pick([500, 800, 1000, 1500, 2000]);
        const rate = 2 * m.alpha * B * 60;                       // K/min
        return {
          prompt: t`A long bar of ${m.name} ($\alpha = ${nice(m.alpha * 1e6)}\times10^{-6}\ \text{m}^2/\text{s}$) has a cold dip in its temperature, $T(x, 0) = T_0 + B x^2$ with $B = ${B}\ \text{K/m}^2$, near $x = 0$. Its temperature obeys $T_t = \alpha\,T_{xx}$. How fast is the centre warming, in K per minute?`,
          visual: { type: 'graph', params: { x: [-0.1, 0.1], y: [-1.5, B * 0.0115], aspect: 'wide', xlabel: 'x (m)', ylabel: 'T − T₀ (K)', curves: [{ fn: `${B}*x^2`, color: 'accent', width: 2.4 }] }, caption: t`The initial profile $T - T_0 = ${B}x^2$ over $\pm 10$ cm: a dip that curves upward.` },
          answer: rate, units: 'K/min', tol: { rel: 0.01 },
          errors: [{ value: rate / 2, feedback: t`$T_{xx}$ of $Bx^2$ is $2B$, not $B$.` }, { value: rate / 60, feedback: 'That is the rate per second; the question asks per minute.' }],
          hints: [t`The heat equation gives the rate directly: $T_t = \alpha\,T_{xx}$.`, t`$T_{xx} = 2B$ everywhere, so $T_t = 2\alpha B$ in K/s. Multiply by 60.`],
          teach: t`The heat equation turns curvature into a rate: $T_t = \alpha T_{xx}$.`,
          explain: t`$T_t = \alpha T_{xx} = 2\alpha B = 2(${tex(m.alpha)}\ \text{m}^2/\text{s})(${B}\ \text{K/m}^2) = ${tex(rate / 60)}$ K/s $= ${tex(rate)}$ K/min.`,
        };
      },
    }),
    mcq({
      id: 'data-needed', difficulty: 2,
      prompt: t`A very long stretched cable obeys $u_{tt} = c^2u_{xx}$. What must you know at $t = 0$ to predict its motion?`,
      visual: player({ mode: 'wave', init: 'strike', profile: 'gauss', w: 0.8, c: 2, t: 1.5, tmax: 3, x: [-8, 8], chars: false }, t`A cable struck while straight: at $t = 0$ it is perfectly flat, yet a moment later it has moved (above, at $t = 1.5$ s; below, the whole history). Its initial velocity was not zero.`),
      choices: [t`the displacement $u(x, 0)$ and the velocity $u_t(x, 0)$`, t`the displacement $u(x, 0)$ only`, t`the velocity $u_t(x, 0)$ only`, t`$u$, $u_t$ and $u_{tt}$ at $t = 0$`],
      answer: 0,
      why: {
        1: 'The picture is the counterexample: a flat cable with an initial velocity moves, a flat cable at rest does not. Same displacement, different futures.',
        2: 'Two cables with the same velocity but different shapes evolve differently: the shape must be known too.',
        3: t`$u_{tt}$ is not free: the equation fixes it as $c^2u_{xx}$ once the shape is known.`,
      },
      hints: ['How many time derivatives does the equation have? Think of Newton’s second law for each piece of cable.', 'A second-order ODE needs a position and a velocity; so does a second-order-in-time PDE, at every point.'],
      teach: t`An equation second order in time needs two initial conditions, $u$ and $u_t$; one first order in time needs only $u$.`,
      explain: t`The wave equation is $F = ma$ for each piece of cable, so like any second-order law it needs a starting position and velocity — here whole functions $u(x, 0)$ and $u_t(x, 0)$. The heat and transport equations, first order in time, need only $u(x, 0)$.`,
    }),
    mcq({
      id: 'river-law', difficulty: 2,
      prompt: t`A slug of a slowly decomposing chemical is spilled into a river flowing at 0.6 m/s in the $+x$ direction. Ignoring mixing, the concentration is carried with the water, and decays at a rate $\lambda$ per second. Which PDE describes the concentration $u(x, t)$?`,
      visual: player({ mode: 'transport', profile: 'gauss', c: 0.6, lambda: 0.08, w: 1, x0: 0, t: 15, tmax: 20, x: [-2, 14] }, t`The slug at $t = 15$ s (solid) and at $t = 0$ (dashed); below, its history in the $x$–$t$ plane. Mixing, which would also spread it, is left out.`),
      choices: [t`$u_t + 0.6\,u_x = -\lambda u$`, t`$u_t - 0.6\,u_x = -\lambda u$`, t`$u_t + 0.6\,u_x = \lambda u$`, t`$u_t = 0.6\,u_{xx} - \lambda u$`],
      answer: 0,
      why: {
        1: t`$u_t - 0.6u_x = 0$ is solved by $f(x + 0.6t)$: that carries the slug upstream, toward $-x$.`,
        2: t`$+\lambda u$ on the right makes the concentration grow along the way.`,
        3: t`$u_{xx}$ spreads the slug (diffusion); a carried profile needs a first derivative $u_x$ with the flow speed in front.`,
      },
      hints: [t`Try $u = f(x - 0.6t)$, a profile moving toward $+x$: what is $u_t + 0.6u_x$?`, t`Decay means $u_t$ gets an extra negative term proportional to $u$.`],
      teach: t`Transport at speed $c$ is $u_t + c\,u_x$; a decay or loss adds $-\lambda u$ on the right.`,
      explain: t`For $u = f(x - 0.6t)$, $u_t = -0.6f'$ and $u_x = f'$, so $u_t + 0.6u_x = 0$: carried downstream. Adding decay gives $u_t + 0.6u_x = -\lambda u$, solved by $e^{-\lambda t}f(x - 0.6t)$ (lesson B2.2).`,
    }),
    multi({
      id: 'superpose', difficulty: 3,
      prompt: t`Both $u_1 = x^2 + 2Dt$ and $u_2 = x$ solve $u_t = D\,u_{xx}$. Which of these are also solutions? (Select all that apply.)`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-2.2, 5.2], aspect: 'wide', xlabel: 'x', ylabel: 'u', curves: [
        { fn: 'x^2', color: 'accent', label: 'u₁ at t = 0', labelAt: -1.75, labelDx: 10 },
        { fn: 'x^2 + 1', color: 'accent', dash: [5, 4], label: 'u₁ at t = 1', labelAt: -1.3, labelDx: 12, labelDy: -6 },
        { fn: 'x', color: 'violet', label: 'u₂ (all t)', labelAt: 1.3, labelDy: 14 },
      ] }, caption: t`With $D = \tfrac12$: $u_1$ rises uniformly, while the straight line $u_2$ has no curvature, so it never changes.` },
      choices: [t`$3u_1 - 2u_2$`, t`$u_1 + 7$`, t`$u_1^2$`, t`$u_1\,u_2$`],
      answer: [0, 1],
      why: {
        2: t`$u_1^2$: $\partial_t(u_1^2) = 2u_1\cdot 2D$ but $D\,\partial_{xx}(u_1^2) = D(12x^2 + 8Dt)$. Products of solutions are not solutions.`,
        3: t`$u_1u_2 = x^3 + 2Dtx$: $u_t = 2Dx$ but $D\,u_{xx} = 6Dx$.`,
      },
      hints: ['The heat equation is linear and homogeneous. What does that allow you to do with solutions?', 'Sums and constant multiples of solutions are solutions; a constant is itself a solution. Products are not.'],
      teach: 'For a linear homogeneous PDE, any combination a u₁ + b u₂ of solutions is a solution — the superposition principle.',
      explain: t`Linearity: $(3u_1 - 2u_2)_t = 3u_{1t} - 2u_{2t} = D(3u_1 - 2u_2)_{xx}$. A constant solves the equation, so $u_1 + 7$ is $u_1$ plus a solution. Squares and products fail.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-u-uxx', difficulty: 2,
      prompt: t`Is $u_{tt} = u\,u_{xx}$ linear?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [0, 4.4], aspect: 'wide', xlabel: 'x', ylabel: 'u', curves: [
        { fn: '1 + 3e^(-x^2)', color: 'accent', width: 2.4, label: 'a profile u', labelAt: 0.9, labelDx: 10 },
        { fn: 'sqrt(1 + 3e^(-x^2))', color: 'gold', dash: [5, 4], label: '“local wave speed” √u', labelAt: 1.6, labelDy: -12 },
      ] }, caption: t`If $u$ plays the role of $c^2$, the speed at which disturbances move depends on the solution itself: faster where $u$ is large.` },
      choices: [t`No: the coefficient of $u_{xx}$ is the unknown $u$ itself`, t`Yes: it is the wave equation with $c^2 = u$`, t`Yes: no term contains $u^2$`, t`It is linear in $t$ but nonlinear in $x$`],
      answer: 0,
      why: {
        1: t`$c^2$ in the wave equation is a fixed number (or a known function); here it is the unknown, so $2u$ is not a solution when $u$ is.`,
        2: t`$u\,u_{xx}$ is a product of the unknown with its derivative — just as nonlinear as $u^2$.`,
        3: 'Linearity is a property of the whole equation in the unknown, not of one variable at a time.',
      },
      hints: [t`If $u$ solves it, does $2u$? Substitute: $2u_{tt}$ against $(2u)(2u_{xx})$.`],
      teach: 'A coefficient that depends on the unknown makes an equation nonlinear.',
      explain: t`Substituting $2u$ gives $2u_{tt}$ on the left but $4u\,u_{xx}$ on the right: scaling a solution does not give a solution, so the equation is nonlinear.`,
    }),
    mcq({
      id: 'cp-heat-shield', difficulty: 2, transfer: true,
      prompt: t`During re-entry, heat soaks into a silica heat-shield tile from its hot outer face. Treating heat flow as one-dimensional through the tile’s thickness $x$, what do you need in order to predict the temperature $T(x, t)$ inside it?`,
      visual: { type: 'graph', params: { x: [0, 8], y: [0, 1.05], aspect: 'wide', xlabel: 'depth into the tile (cm)', ylabel: 'temperature rise (fraction)', curves: [60, 300, 900].map((s, i) => ({ fn: `1 - erf(x/100/sqrt(4*${LI900.alpha}*${s}))`, color: ['accent', 'violet', 'teal'][i], label: `${s} s`, labelAt: [0.35, 1.1, 2.4][i], labelDx: 8, labelDy: -2 })) }, caption: t`Temperature rise inside a thick LI-900-like tile after its surface is suddenly held hot, from the heat equation with constant properties ($\alpha \approx 5.3\times10^{-7}\ \text{m}^2/\text{s}$). A real tile’s conductivity rises severalfold when hot, so this understates the soak.` },
      choices: [
        t`The heat equation $T_t = \alpha T_{xx}$, the initial temperature $T(x, 0)$, and a condition at each face`,
        t`The heat equation with $T(x, 0)$ and the initial rate $T_t(x, 0)$`,
        t`The wave equation, because the heat travels inward as a front`,
        t`The heat equation with $T(x, 0)$ alone; what happens at the faces does not matter`,
      ],
      answer: 0,
      why: {
        1: t`The heat equation is first order in time: once $T(x, 0)$ is known, $T_t = \alpha T_{xx}$ already fixes the initial rate. It is not extra data.`,
        2: 'The curves have no sharp front moving at a fixed speed; they spread like √t. That is diffusion, not a wave.',
        3: 'On a finite tile the heating at the outer face is the whole story — it is what drives the change inside.',
      },
      hints: ['How many time derivatives does the heat equation have?', 'Where does the heat come from? It enters through a face, so the faces must be described.'],
      teach: 'An evolution PDE on a finite region needs initial data and boundary conditions at every edge.',
      explain: t`Heat conduction obeys $T_t = \alpha T_{xx}$. First order in time: one initial condition, $T(x, 0)$. A finite slab: a condition at each face — the heating at the outer surface, and at the inner face (the bond to the structure) whatever crosses there.`,
    }),
    mcq({
      id: 'cp-einstein', difficulty: 3, transfer: true,
      prompt: t`Einstein’s field equations relate the curvature built from the metric $g_{\mu\nu}(t, x, y, z)$ — ten functions of four coordinates — to the matter present. The curvature contains second derivatives of $g_{\mu\nu}$ and products of first derivatives with each other. What kind of equations are they?`,
      choices: [
        'a system of second-order nonlinear PDEs in four variables',
        'ten ordinary differential equations in time',
        'a single linear wave equation',
        'first-order linear PDEs',
      ],
      answer: 0,
      why: {
        1: 'The unknowns depend on four coordinates and the equations contain derivatives in all of them: partial, not ordinary.',
        2: 'Only for weak fields, after linearising and choosing coordinates, do they reduce to wave equations for a small perturbation — that is how gravitational waves are described.',
        3: 'Curvature involves second derivatives of the metric, and products of first derivatives make it nonlinear.',
      },
      hints: ['Count the independent variables: is that ordinary or partial?', 'Order: the highest derivative. Linearity: are there products of the unknowns’ derivatives?'],
      teach: 'Classify by independent variables (partial or ordinary), the highest derivative (order), and products of the unknown (linearity).',
      explain: t`Ten unknowns of four variables, second derivatives, products of first derivatives: a system of second-order nonlinear PDEs. Module B15 shows that, in a good choice of coordinates, they become nonlinear wave equations — so the wave equation you meet in B3 is their linear skeleton.`,
    }),
  ],
  sources: [SRC.strauss, SRC.evans, SRC.incropera, SRC.tpsx],
});
