// The method of characteristics for linear first-order equations with
// constant speed: decay and sources become ODEs along the characteristics,
// data enter on the inflow boundary only, and the upwind scheme is the same
// idea on a grid — trace back one step and interpolate.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { player, xtPlane, SRC } from './_pde.js';

const t = String.raw;
const profile = (fn, x, y, caption) => ({ type: 'graph', params: { x, y, aspect: 'wide', xlabel: 'x (m)', ylabel: 'u', curves: [{ fn, color: 'accent', width: 2.4 }] }, caption });

export default lesson({
  id: 'st-b.B2.2',
  title: 'The method of characteristics',
  minutes: 14, difficulty: 3,
  intro: t`Lesson B2.1 solved $u_t + c\,u_x = 0$ by noticing that $u$ does not change along the lines $dx/dt = c$. The same trick works when something **does** happen along the way — a tracer decays, a coolant is heated. For $u_t + c\,u_x = -\lambda u + s$, an observer riding a characteristic sees an ordinary differential equation:

$$\frac{dx}{dt} = c, \qquad \frac{du}{dt} = -\lambda u + s$$

The **method of characteristics**: (1) find the characteristic curves; (2) solve the ODE for $u$ along each one, starting from the data at its foot; (3) write the answer back in terms of $x$ and $t$. A PDE becomes a family of ODEs, one per characteristic — and the data must be given where characteristics **enter** the region: on the initial line, and on an **inflow** boundary, never on an outflow one.`,
  symbols: [
    { tex: 'c', text: 'the carrying speed (m/s): the slope $dx/dt$ of every characteristic' },
    { tex: t`\lambda`, text: 'a decay rate (s⁻¹): radioactive decay, a chemical reaction, settling' },
    { tex: 's', text: 'a source: how fast $u$ is added per second at each point (e.g. K/s for heating)' },
    { tex: t`\frac{du}{dt}`, text: 'the rate of change seen riding the characteristic, $u_t + c\,u_x$' },
    { tex: t`x_0 = x - ct`, text: 'the foot of the characteristic through $(x, t)$, where its data are read' },
  ],
  why: t`Every hyperbolic problem in this course — waves, shocks, and Einstein’s equations in harmonic gauge — is solved, simulated or understood by following its characteristics, and the upwind idea below is the ancestor of the schemes numerical relativists use.`,
  visual: {
    type: 'pde-player',
    title: 'Riding a decaying characteristic',
    lead: t`The tracer is carried at speed $c$ and decays at rate $\lambda$. The gold probe’s characteristic is traced back to its foot; along it, $u$ obeys $du/dt = -\lambda u$, so the value at the probe is $e^{-\lambda t}$ times the value at the foot.`,
    tasks: [
      'Set λ = 0: plain transport, the bump keeps its height.',
      'Raise λ: the shading fades as it climbs — each characteristic carries a decaying value.',
      'Drag the probe up its characteristic: the foot stays put while u(probe) falls as e^(−λt).',
    ],
    params: { mode: 'transport', profile: 'gauss', c: 1.5, lambda: 0.3, x: [-10, 10], x0: -5, w: 1, tmax: 6, probe: [1, 4], controls: ['profile', 'c', 'lambda', 't'] },
    caption: t`Exact solution $u = e^{-\lambda t} f(x - ct)$ on an infinite line; the window is a piece of it.`,
  },
  example: {
    prompt: t`Solve $u_t + 2u_x = -0.5\,u$ with $u(x, 0) = e^{-x^2}$, and find $u(4, 2)$.`,
    visual: player({ mode: 'transport', profile: 'gauss', c: 2, lambda: 0.5, x: [-4, 10], t: 2, tmax: 3, probe: [4, 2], readout: true, hide: ['u'] }, t`The solution at $t = 2$ (solid) and $t = 0$ (dashed); below, the probe at $(4, 2)$ with its characteristic traced back to the foot $x_0 = 0$.`),
    steps: [
      { label: 'Characteristics', text: t`$dx/dt = 2$, so $x = x_0 + 2t$: straight lines labelled by their foot $x_0 = x - 2t$.` },
      { label: 'Ode along them', text: t`$\dfrac{du}{dt} = u_t + 2u_x = -0.5\,u$, so $u = u(x_0, 0)\,e^{-0.5t} = e^{-x_0^2}\,e^{-0.5t}$.` },
      { label: 'Back to x and t', text: t`Substitute $x_0 = x - 2t$: $u(x, t) = e^{-0.5t}\,e^{-(x - 2t)^2}$.` },
      { label: 'Check', text: t`$u_t = \big(-0.5 + 4(x - 2t)\big)u$ and $u_x = -2(x - 2t)\,u$, so $u_t + 2u_x = -0.5\,u$. ✓ At $t = 0$ it is $e^{-x^2}$. ✓` },
      { label: 'Evaluate', text: t`At $(4, 2)$ the foot is $x_0 = 4 - 4 = 0$, the top of the bump, and $u = e^{-0.5\cdot 2}e^{0} = e^{-1} \approx 0.368$.` },
    ],
    answer: t`$u(x, t) = e^{-0.5t}e^{-(x - 2t)^2}$, and $u(4, 2) = e^{-1} \approx 0.368$.`,
  },
  practice: [
    expr({
      id: 'decay-solve', difficulty: 2,
      gen(r) {
        const c = r.pick([1, 3, 4]), lam = r.pick([0.2, 0.5, 2]), a = r.pick([1, 2]);
        return {
          prompt: t`Solve $u_t + ${c}\,u_x = -${lam}\,u$ with $u(x, 0) = \dfrac{1}{${a} + x^2}$.`,
          visual: profile(`1/(${a} + x^2)`, [-6, 6], [-0.05, 1.1 / a], t`The initial profile $1/(${a} + x^2)$.`),
          answer: `e^(-${lam}t)/(${a} + (x - ${c}t)^2)`, answerTeX: t`\frac{e^{-${lam}t}}{${a} + (x - ${c}t)^2}`, lhs: 'u(x, t)',
          vars: { x: [-3, 3], t: [0, 1.5] },
          errors: [{ answer: `1/(${a} + (x - ${c}t)^2)`, feedback: t`That solves the equation without the decay. Along each characteristic $du/dt = -${lam}u$: multiply by $e^{-${lam}t}$.` }, { answer: `e^(${lam}t)/(${a} + (x - ${c}t)^2)`, feedback: t`$du/dt = -${lam}u$ gives decay, $e^{-${lam}t}$.` }],
          hints: [t`Characteristics: $x = x_0 + ${c}t$. Along them, $du/dt = -${lam}u$.`, t`So $u = f(x_0)\,e^{-${lam}t}$ with $x_0 = x - ${c}t$.`],
          teach: 'Along a characteristic a decay term is an ODE: u = f(foot) × e^(−λt).',
          explain: t`$u = f(x - ${c}t)\,e^{-${lam}t} = \dfrac{e^{-${lam}t}}{${a} + (x - ${c}t)^2}$.`,
        };
      },
    }),
    num({
      id: 'tracer', difficulty: 2,
      gen(r) {
        const v = r.pick([0.4, 0.5, 0.8, 1.2]), km = r.pick([10, 20, 30, 50]);
        const T12 = 35.3, tt = (km * 1000) / v / 3600, ratio = 2 ** (-tt / T12);
        return {
          prompt: t`Hydrologists track a river with the radioactive tracer bromine-82 (half-life 35.3 h). Ignoring mixing, the tracer obeys $u_t + v\,u_x = -\lambda u$ with $\lambda = \ln 2/T_{1/2}$. The river flows at $v = ${v}$ m/s. What fraction of the injected peak concentration arrives ${km} km downstream?`,
          visual: player({ mode: 'transport', profile: 'gauss', c: 1, lambda: 0.15, x: [-2, 14], x0: 0, w: 1, t: 8, tmax: 10, chars: true }, t`A decaying tracer carried downstream (illustrative speed and decay rate): the peak follows its characteristic and shrinks as $e^{-\lambda t}$ on the way.`),
          answer: ratio, tol: { rel: 0.005 },
          errors: [{ value: Math.exp(-tt / T12), feedback: t`$\lambda = \ln 2 / T_{1/2}$, not $1/T_{1/2}$: in one half-life the tracer halves, it does not fall to $1/e$.` }, { value: 1 - ratio, feedback: 'That is the fraction that has decayed; the question asks what remains.' }],
          hints: [t`The peak rides its characteristic for a time $t = L/v$.`, t`Along it, $u = u_0 e^{-\lambda t} = u_0\,2^{-t/T_{1/2}}$.`],
          teach: 'Travel time along the characteristic, then decay for that long.',
          explain: t`Travel time $t = ${km * 1000}/${v} = ${tex(tt * 3600)}$ s $= ${tex(tt)}$ h, so the fraction left is $2^{-${tex(tt)}/35.3} = ${tex(ratio)}$.`,
        };
      },
    }),
    mcq({
      id: 'which-odes', difficulty: 2,
      prompt: t`Which pair of ODEs does the method of characteristics give for $u_t + 3u_x = 2u$?`,
      visual: xtPlane({ x: [0, 6], y: [0, 1.5], xticks: 6, curves: [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((k) => ({ fn: `(x - ${k})/3`, color: 'accent', width: 1.3 })) }, t`The characteristics of the left-hand side, $u_t + 3u_x$, in the $x$–$t$ plane.`),
      choices: [t`$\dfrac{dx}{dt} = 3,\ \dfrac{du}{dt} = 2u$`, t`$\dfrac{dx}{dt} = 2,\ \dfrac{du}{dt} = 3u$`, t`$\dfrac{dx}{dt} = \tfrac13,\ \dfrac{du}{dt} = 2u$`, t`$\dfrac{dx}{dt} = 3,\ \dfrac{du}{dt} = 0$`],
      answer: 0,
      why: {
        1: t`The speed is the coefficient of $u_x$ (relative to $u_t$); the right-hand side is what $u$ does along the way.`,
        2: t`$\tfrac13$ is the slope $dt/dx$ of the drawn lines, not the speed $dx/dt$.`,
        3: t`$du/dt = 0$ only when the right-hand side is zero; here it is $2u$, so $u$ grows as $e^{2t}$ along each line.`,
      },
      hints: [t`Match $u_t + 3u_x$ with $\frac{d}{dt}u(x(t), t) = u_t + \dot x\,u_x$.`],
      teach: 'The left-hand side fixes the curves; the right-hand side is the ODE along them.',
      explain: t`With $\dot x = 3$ the left side is $du/dt$, so $du/dt = 2u$: $u = f(x - 3t)\,e^{2t}$ — carried at 3 m/s and growing.`,
    }),
    mcq({
      id: 'inflow', difficulty: 2,
      prompt: t`A pipe runs from $x = 0$ to $x = L$, and a dye concentration in it obeys $u_t + c\,u_x = 0$ with $c > 0$. Besides $u(x, 0)$, what must be prescribed to determine $u$ for all later times?`,
      visual: xtPlane({ x: [-0.5, 5.5], y: [0, 3], xticks: 6, yticks: 3, xlabel: 'x (m)', ylabel: 't (s)',
        vlines: [{ x: 0, label: 'x = 0', color: 'gold' }, { x: 5, label: 'x = L', color: 'gold' }],
        curves: [...[0, 1, 2, 3, 4].map((k) => ({ fn: `(x - ${k})/1.5`, color: 'accent', width: 1.3, domain: [k, 5] })), ...[0.6, 1.2, 1.8, 2.4].map((k) => ({ fn: `x/1.5 + ${k}`, color: 'teal', width: 1.3, domain: [0, 5] }))] },
        t`Characteristics with $c = 1.5$ m/s inside the pipe: blue ones start on the initial line, teal ones enter through $x = 0$. Every characteristic leaves through $x = L$.`),
      choices: [t`$u(0, t)$ at the inflow end only`, t`$u(L, t)$ at the outflow end only`, t`both $u(0, t)$ and $u(L, t)$`, 'nothing: the initial profile determines everything'],
      answer: 0,
      why: {
        1: t`Characteristics leave through $x = L$: the value there is already decided by what was carried in. Prescribing it too would usually contradict the solution.`,
        2: 'Two conditions over-determine a first-order problem: the outflow value is an output, not an input.',
        3: t`The initial profile is swept out of the pipe after $L/c$; what fills the pipe afterwards comes in through $x = 0$.`,
      },
      hints: ['Every point inside must be reached by tracing its characteristic back to some data.', 'Characteristics through late points start on the left wall, not on the initial line.'],
      teach: 'Data go where characteristics enter: the initial line and the inflow boundary.',
      explain: t`For $t > x/c$ the characteristic through $(x, t)$ starts on the inflow wall at time $t - x/c$, so $u(x, t) = u(0, t - x/c)$. Nothing may be imposed at the outflow end.`,
    }),
    expr({
      id: 'source-x', difficulty: 3,
      gen(r) {
        const c = r.pick([2, 3, 4]);
        return {
          prompt: t`Solve $u_t + ${c}\,u_x = x$ with $u(x, 0) = 0$. (The source is stronger farther downstream.)`,
          visual: xtPlane({ x: [0, 6], y: [0, 1.5], xticks: 6, curves: [-4, -2, 0, 2, 4].map((k) => ({ fn: `(x - ${k})/${c}`, color: 'accent', width: 1.3 })) }, t`Characteristics $x = x_0 + ${c}t$. Along each, the source the observer meets grows as $x$ grows.`),
          answer: `x t - ${c / 2} t^2`, answerTeX: t`xt - ${c === 2 ? '' : `\\tfrac{${c}}{2}`}t^2`, lhs: 'u(x, t)',
          vars: { x: [-2, 4], t: [0, 2] },
          errors: [{ answer: 'x t', feedback: t`Along a characteristic $x$ is not constant: it is $x_0 + ${c}t$. Integrate $du/dt = x_0 + ${c}t$.` }, { answer: `x t + ${c / 2} t^2`, feedback: t`Substitute back carefully: $x_0 = x - ${c}t$, so $x_0 t + \tfrac{${c}}{2}t^2 = xt - ${c}t^2 + \tfrac{${c}}{2}t^2$.` }],
          hints: [t`Along $x = x_0 + ${c}t$: $\dfrac{du}{dt} = x_0 + ${c}t$, with $u = 0$ at $t = 0$.`, t`Integrate: $u = x_0 t + \tfrac{${c}}{2}t^2$. Then put $x_0 = x - ${c}t$.`],
          teach: 'Write the source in terms of the foot and t before integrating along the characteristic.',
          explain: t`$u = x_0 t + \tfrac{${c}}{2}t^2 = (x - ${c}t)t + \tfrac{${c}}{2}t^2 = xt - \tfrac{${c}}{2}t^2$. Check: $u_t = x - ${c}t$, $u_x = t$, so $u_t + ${c}u_x = x$. ✓`,
        };
      },
    }),
    code({
      id: 'upwind', difficulty: 3,
      prompt: t`Solve $u_t + c\,u_x = 0$ on a grid. The **upwind** scheme traces each characteristic back one time step and interpolates between the two grid points it lands between:

$$u_j^{n+1} = u_j^n - \nu\,(u_j^n - u_{j-1}^n), \qquad \nu = \frac{c\,\Delta t}{\Delta x}$$

Write \`upwind(u0, nu, steps)\` returning the profile after \`steps\` steps, holding the inflow value \`u[0]\` at 0. Then carry $f(x) = e^{-x^2}$ with $c = 1$, $\Delta x = 0.05$, $\nu = 0.8$ to $t = 4$, and set \`err\` to the largest difference from the exact $f(x - ct)$.`,
      starter: t`import numpy as np

def upwind(u0, nu, steps):
    u = np.array(u0, dtype=float)
    # one step: u[1:] = u[1:] - nu*(u[1:] - u[:-1]); then u[0] = 0
    pass

dx = 0.05
x = np.arange(-5, 15 + dx / 2, dx)
f = lambda s: np.exp(-s**2)
c, nu = 1.0, 0.8
dt = nu * dx / c
steps = round(4.0 / dt)

u = None      # upwind(f(x), nu, steps)
err = None    # largest |u - f(x - c*steps*dt)|
print(steps, err)
`,
      answer: t`import numpy as np

def upwind(u0, nu, steps):
    u = np.array(u0, dtype=float)
    for n in range(steps):
        u[1:] = u[1:] - nu * (u[1:] - u[:-1])
        u[0] = 0.0
    return u

dx = 0.05
x = np.arange(-5, 15 + dx / 2, dx)
f = lambda s: np.exp(-s**2)
c, nu = 1.0, 0.8
dt = nu * dx / c
steps = round(4.0 / dt)

u = upwind(f(x), nu, steps)
err = np.max(np.abs(u - f(x - c * steps * dt)))
print(steps, err)`,
      tests: [
        { name: t`with $\nu = 1$ the scheme shifts the profile exactly one cell per step`, code: 'np.max(np.abs(upwind(f(x), 1.0, 10) - f(x - 10 * dx))) < 1e-10' },
        { name: t`at $\nu = 0.8$ the error at $t = 4$ is small but not zero (about 0.04)`, code: 'err is not None and 0.03 < err < 0.05' },
        { name: 'the peak arrives at x = 4 but is lowered by numerical smoothing', code: 'abs(x[np.argmax(u)] - 4) < 0.06 and 0.95 < u.max() < 0.97' },
        { name: t`with $\nu = 1.5$ the scheme blows up within 200 steps`, code: 'np.max(np.abs(upwind(f(x), 1.5, 200))) > 1e6' },
      ],
      hints: ['Loop over the steps; inside, update every point but the first from itself and its left neighbour.', 'NumPy slices make one step a single line: `u[1:] = u[1:] - nu * (u[1:] - u[:-1])` (the right side is computed before anything is overwritten). Then `u[0] = 0.0`.', 'After the loop, `err = np.max(np.abs(u - f(x - c * steps * dt)))`.'],
      teach: t`Upwind is the characteristic traced back one step and linearly interpolated — honest only while the foot lies between the two grid points, $\nu \le 1$.`,
      explain: t`For $0 \le \nu \le 1$ the new value is a weighted average $(1 - \nu)u_j + \nu u_{j-1}$ of the two points the characteristic’s foot lies between, so nothing can grow — but averaging smooths, lowering the peak to about 0.962 (numerical diffusion). At $\nu = 1$ the foot lands exactly on a grid point and the scheme is exact. At $\nu > 1$ the foot lies outside the stencil, the weights turn negative and errors grow without bound: the CFL condition of module B13.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-coolant-heat', difficulty: 2, transfer: true,
      gen(r) {
        const v = r.pick([10, 15, 20]), L = r.pick([0.3, 0.4, 0.6]), q = r.pick([500, 800, 1200]);
        const dT = (q * L) / v;
        return {
          prompt: t`Coolant enters a heated nozzle channel at a steady temperature $T_{\text{in}}$ and flows at ${v} m/s along the ${L} m channel. The wall heat raises the temperature of each parcel at $q = ${q}$ K/s, so $T_t + ${v}\,T_x = ${q}$. In the steady state, how much hotter is the coolant at the outlet than at the inlet, in K?`,
          visual: xtPlane({ x: [0, 1], y: [0, 0.1], xticks: 5, yticks: 4, xlabel: 'x along the channel (m)', ylabel: 't (s)', curves: [0, 0.02, 0.04, 0.06, 0.08, 0.1].map((k) => ({ fn: `x/12 + ${k}`, color: 'teal', width: 1.3 })) },
            t`Characteristics entering through the inlet (illustrative speed, 12 m/s): each parcel is heated for as long as it stays in the channel. A real channel’s heating varies along its length; here $q$ is taken constant.`),
          answer: dT, units: 'K', difference: true, tol: { rel: 0.01 },
          errors: [{ value: q * v * L, feedback: 'The parcel spends L/v in the channel, not L·v.' }, { value: q / v, feedback: 'Multiply by the channel length too: time in the channel is L/v.' }],
          hints: [t`Ride a parcel from the inlet: $dT/dt = ${q}$ K/s along its characteristic.`, t`It stays in the channel for $L/v$ seconds.`],
          teach: 'With inflow data and a source, the change along a characteristic is source × travel time.',
          explain: t`Along a characteristic $dT/dt = ${q}$ K/s, for a residence time $L/v = ${L}/${v} = ${tex(L / v)}$ s, so the outlet is $${q} \times ${tex(L / v)} = ${tex(dT)}$ K hotter. Steady state: $T = T_{\text{in}} + ${q}x/${v}$, which satisfies $${v}T_x = ${q}$. ✓`,
        };
      },
    }),
    num({
      id: 'cp-value', difficulty: 2,
      gen(r) {
        const c = r.pick([1, 2, 3]), lam = r.pick([0.1, 0.25, 0.5]), A = r.pick([2, 5]), T = r.pick([1, 2]), d = r.pick([0.5, 1]);
        const X = c * T + d, val = A * Math.exp(-lam * T) * Math.exp(-d * d);
        return {
          prompt: t`$u_t + ${c}\,u_x = -${lam}\,u$ with $u(x, 0) = ${A}\,e^{-x^2}$. Find $u(${X}, ${T})$.`,
          visual: profile(`${A}*e^(-x^2)`, [-3, 3], [-0.1, A * 1.1], t`The initial profile $${A}e^{-x^2}$.`),
          answer: val, tol: { rel: 0.005 },
          errors: [{ value: A * Math.exp(-d * d), feedback: t`You found the foot correctly; now include the decay along the way, $e^{-${lam}\cdot${T}}$.` }, { value: A * Math.exp(-lam * T) * Math.exp(-X * X), feedback: t`Read $f$ at the foot $x - ${c}t$, not at $x$.` }],
          hints: [t`Foot: $x_0 = ${X} - ${c}(${T})$.`, t`$u = f(x_0)\,e^{-${lam}t}$.`],
          teach: 'Foot of the characteristic, then the ODE along it.',
          explain: t`$x_0 = ${X} - ${c * T} = ${d}$, so $u = ${A}e^{-${d * d}}\,e^{-${tex(lam * T)}} = ${tex(val)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-left-moving', difficulty: 2,
      prompt: t`A heated pipe $0 < x < L$ carries flow toward $-x$, so $u_t + c\,u_x = s$ with $c < 0$. Where must boundary data be given?`,
      visual: xtPlane({ x: [-0.5, 5.5], y: [0, 3], xticks: 6, yticks: 3, xlabel: 'x (m)', ylabel: 't (s)', vlines: [{ x: 0, label: 'x = 0', color: 'gold' }, { x: 5, label: 'x = L', color: 'gold' }],
        curves: [-2, -1, 0, 1, 2, 3, 4, 5].map((k) => ({ fn: `(${k} + 5 - x)/1.5`, color: 'accent', width: 1.3, domain: [0, 5] })) }, t`Characteristics for $c = -1.5$ m/s inside the pipe.`),
      choices: [t`at $x = L$ only`, t`at $x = 0$ only`, 'at both ends', 'at neither end'],
      answer: 0,
      why: {
        1: t`With $c < 0$ the flow leaves through $x = 0$: that is the outflow end.`,
        2: 'A first-order equation takes data only where characteristics enter; one end is enough.',
        3: t`Without data at the inflow end, the region near $x = L$ is undetermined once the initial profile has been swept out.`,
      },
      hints: ['Which wall do the characteristics come in through?'],
      teach: 'The sign of c decides which boundary is the inflow one.',
      explain: t`Characteristics move toward $-x$, entering at $x = L$ and leaving at $x = 0$: data at $x = L$ (with the initial profile) determine the solution.`,
    }),
  ],
  sources: [SRC.strauss, SRC.evans, { label: 'R. J. LeVeque, Finite Volume Methods for Hyperbolic Problems (Cambridge, 2002), ch. 4: the upwind method', url: 'https://doi.org/10.1017/CBO9780511791253' }],
});
