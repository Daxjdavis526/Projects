// Characteristics for variable speed: u_t + c(x, t) u_x = 0 is carried along
// the curves dx/dt = c(x, t). Stretching flows, accelerating flows and a river
// with a slow reach; linear characteristics never cross — nonlinear ones can.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { player, xtPlane, SRC } from './_pde.js';

const t = String.raw;
const profile = (fn, x, y, caption) => ({ type: 'graph', params: { x, y, aspect: 'wide', xlabel: 'x (m)', ylabel: 'u', curves: [{ fn, color: 'accent', width: 2.4 }] }, caption });

export default lesson({
  id: 'st-b.B2.3',
  title: 'Characteristics for variable speed',
  minutes: 12, difficulty: 3,
  intro: t`When the carrying speed changes from place to place — a river slowing where it widens, a gas accelerating down a duct — the transport equation becomes $u_t + c(x, t)\,u_x = 0$. The observer’s argument of lesson B2.1 still works, but the observer must now **change speed** to keep pace with the flow. The characteristics are the solutions of an ODE:

$$\frac{dx}{dt} = c(x, t)$$

and $u$ is constant along each of them. They are curves, not lines; solve the ODE from each foot $x_0$, carry $f(x_0)$ along, and invert to find which foot a point $(x, t)$ came from. Because the ODE has exactly one solution through each point, **two characteristics of a linear equation can never cross**: the solution can stretch and squeeze, but it never breaks.`,
  symbols: [
    { tex: 'c(x, t)', text: 'the local carrying speed (m/s), now a known function of place and time' },
    { tex: t`x(t;\,x_0)`, text: 'the characteristic that starts at $x_0$: the path of a parcel of the flow' },
    { tex: t`x_0`, text: 'the foot: where the characteristic through $(x, t)$ began at $t = 0$' },
    { tex: 'f', text: 'the initial profile $u(x, 0)$; then $u(x, t) = f(x_0)$' },
  ],
  why: t`In curved spacetime light rays bend and focus, and the characteristics of Einstein’s equations are curved null surfaces; tracking where they cross (caustics) is how horizons and gauge pathologies show up in numerical relativity.`,
  visual: {
    type: 'pde-player',
    title: 'A river with a slow reach',
    lead: t`The river flows at speed $c$ except in a wide reach (shaded) where it slows. The characteristics bend as they cross it. Watch a slug of dye: it **shortens** in the slow reach and lengthens again after it — while its peak concentration stays the same.`,
    tasks: [
      'Play: inside the reach the characteristics crowd together and the slug is squeezed.',
      'Lower the speed in the reach: the characteristics stand up steeper there — parcels linger.',
      'Drag the probe past the reach: its characteristic, traced back, kinks where it crossed the slow water.',
    ],
    params: { mode: 'variable', speed: 'river', c: 1.5, slow: 0.35, profile: 'gauss', x0: -6, w: 0.8, x: [-10, 10], tmax: 14, probe: [6, 12], controls: ['c', 'slow', 't'] },
    caption: t`Exact solution: $u$ constant along each characteristic $dx/dt = c(x)$, computed from the travel time $\int dx/c$. For a river of constant discharge $Q$ and cross-section $A(x)$, the concentration obeys exactly this equation with $c = Q/A$. Mixing is left out.`,
  },
  example: {
    prompt: t`Solve $u_t + x\,u_x = 0$ with $u(x, 0) = e^{-x^2}$. What happens to the bump?`,
    visual: xtPlane({ x: [-6, 6], y: [0, 1.6], xticks: 12, curves: [-1.2, -0.8, -0.5, -0.25, 0.25, 0.5, 0.8, 1.2].map((k) => ({ fn: `ln(x/(${k}))`, color: 'accent', width: 1.3, domain: k > 0 ? [k, 6] : [-6, k] })), vlines: [{ x: 0, color: 'accent' }] },
      t`Characteristics $x = x_0e^{t}$ of $u_t + x\,u_x = 0$: the flow stands still at $x = 0$ and speeds up in proportion to distance from it.`),
    steps: [
      { label: 'Characteristics', text: t`$\dfrac{dx}{dt} = x$, so $x = x_0\,e^{t}$: each parcel moves away from the origin exponentially fast.` },
      { label: 'Constant along them', text: t`$u$ keeps its initial value: $u = f(x_0) = e^{-x_0^2}$.` },
      { label: 'Invert', text: t`The foot of the characteristic through $(x, t)$ is $x_0 = x\,e^{-t}$, so $u(x, t) = e^{-x^2e^{-2t}}$.` },
      { label: 'Check', text: t`$u_x = -2xe^{-2t}u$ and $u_t = 2x^2e^{-2t}u$, so $u_t + x\,u_x = 2x^2e^{-2t}u - 2x^2e^{-2t}u = 0$. ✓` },
      { label: 'Interpret', text: t`$u = f(xe^{-t})$ is the initial bump **stretched** by a factor $e^t$: wider and wider, but its peak stays at 1. Nothing is lost or gained along a characteristic — the amount $\int u\,dx$ even grows, because this equation transports the value, not a conserved density.` },
    ],
    answer: t`$u(x, t) = e^{-x^2e^{-2t}}$: the bump stretches by $e^t$ with its height unchanged.`,
  },
  practice: [
    expr({
      id: 'stretch', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 2, 3]);
        return {
          prompt: t`Solve $u_t + ${a}x\,u_x = 0$ with $u(x, 0) = \dfrac{1}{1 + x^2}$.`,
          visual: profile('1/(1 + x^2)', [-6, 6], [-0.05, 1.1], t`The initial profile $1/(1 + x^2)$.`),
          answer: `1/(1 + x^2 e^(-${2 * a}t))`, answerTeX: t`\frac{1}{1 + x^2e^{-${2 * a}t}}`, lhs: 'u(x, t)',
          vars: { x: [-2, 2], t: [0, 1] },
          errors: [{ answer: `1/(1 + x^2 e^(${2 * a}t))`, feedback: t`The foot is $x_0 = xe^{-${a}t}$: characteristics run outward, so you look back toward the origin.` }, { answer: `1/(1 + (x - ${a}t)^2)`, feedback: t`The speed $${a}x$ depends on $x$: the characteristics solve $dx/dt = ${a}x$, not $dx/dt = ${a}$.` }],
          hints: [t`Solve $dx/dt = ${a}x$: $x = x_0e^{${a}t}$.`, t`So $x_0 = xe^{-${a}t}$, and $u = f(xe^{-${a}t})$.`],
          teach: 'Solve the characteristic ODE, invert for the foot, and substitute it into f.',
          explain: t`$x_0 = xe^{-${a}t}$, so $u = \dfrac{1}{1 + x^2e^{-${2 * a}t}}$: the profile stretched by $e^{${a}t}$.`,
        };
      },
    }),
    expr({
      id: 'accelerating', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 4, 6]);
        return {
          prompt: t`A valve opens and the flow in a long pipe speeds up steadily, so a dye obeys $u_t + ${k}t\,u_x = 0$ (with $x$ in m and $t$ in s). Find $u(x, t)$ if $u(x, 0) = e^{-x^2}$.`,
          visual: xtPlane({ x: [-2, 8], y: [0, 2], xticks: 10, curves: [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((x0) => ({ param: [`${x0} + ${k / 2}*t^2`, 't'], t: [0, 2], color: 'accent', width: 1.3 })) }, t`The characteristics bend over as the flow speeds up: each is a parabola, all the same shape.`),
          answer: `e^(-(x - ${k / 2}t^2)^2)`, answerTeX: t`e^{-(x - ${k === 2 ? '' : k / 2}t^2)^2}`, lhs: 'u(x, t)',
          vars: { x: [-1, 3], t: [0, 1] },
          errors: [{ answer: `e^(-(x - ${k}t^2)^2)`, feedback: t`Integrate the speed: $\int_0^t ${k}s\,ds = ${k / 2}t^2$, not $${k}t^2$.` }, { answer: `e^(-(x - ${k}t)^2)`, feedback: t`The speed is $${k}t$, which itself changes with time: integrate it to get the distance travelled.` }],
          hints: [t`$dx/dt = ${k}t$, so $x = x_0 + ${k / 2}t^2$.`, t`$x_0 = x - ${k / 2}t^2$; substitute into $f(x_0) = e^{-x_0^2}$.`],
          teach: 'For a speed that depends only on time, the distance travelled is its integral.',
          explain: t`$x = x_0 + \int_0^t ${k}s\,ds = x_0 + ${k / 2}t^2$, so $u = e^{-(x - ${k / 2}t^2)^2}$. Check: $u_t = ${k}t\cdot 2(x - ${k / 2}t^2)\,e^{\cdots}$ and $u_x = -2(x - ${k / 2}t^2)\,e^{\cdots}$, so $u_t + ${k}t\,u_x = 0$. ✓`,
        };
      },
    }),
    num({
      id: 'travel-reaches', difficulty: 2,
      gen(r) {
        const L1 = r.pick([2, 3, 4]), v1 = r.pick([0.8, 1.0, 1.2]), L2 = r.pick([1, 1.5, 2]), v2 = r.pick([0.2, 0.25, 0.3]);
        const T = (L1 * 1000) / v1 + (L2 * 1000) / v2;
        return {
          prompt: t`Downstream of a spill, a river runs ${L1} km at ${v1} m/s, then widens into a ${L2} km reach where it flows at only ${v2} m/s. How long does the peak of the spill take to reach the end of the slow reach, in hours?`,
          visual: { type: 'graph', params: { x: [0, L1 + L2 + 0.5], y: [0, 1.4], aspect: 'wide', xlabel: 'distance downstream (km)', ylabel: 'speed (m/s)', curves: [{ fn: `${v1} - (${v1} - ${v2})*step(x - ${L1})*step(${L1 + L2} - x)`, color: 'teal', width: 2.4 }] }, caption: 'The river’s speed along its course (idealized as two uniform reaches).' },
          answer: T / 3600, units: 'h', tol: { rel: 0.01 },
          errors: [{ value: ((L1 + L2) * 1000) / ((v1 + v2) / 2) / 3600, feedback: t`Averaging the speeds is wrong: the time is $\int dx/c$, and the slow reach dominates it.` }, { value: (L1 * 1000) / v1 / 3600, feedback: 'Add the time spent crossing the slow reach too.' }].filter((e) => Math.abs(e.value - T / 3600) > 0.03 * T / 3600),
          hints: [t`Along a characteristic $dt = dx/c(x)$: add up the time in each reach.`, t`$t = L_1/v_1 + L_2/v_2$, with lengths in metres.`],
          teach: t`Travel time along a characteristic is $\int dx/c(x)$ — slow stretches dominate.`,
          explain: t`$t = \dfrac{${L1 * 1000}}{${v1}} + \dfrac{${L2 * 1000}}{${v2}} = ${tex(T)}$ s $\approx ${tex(T / 3600)}$ h.`,
        };
      },
    }),
    num({
      id: 'squeeze', difficulty: 3,
      gen(r) {
        const Lf = r.pick([300, 400, 600]), vf = r.pick([0.9, 1.2]), vs = r.pick([0.3, 0.4]);
        const Ls = (Lf * vs) / vf;
        return {
          prompt: t`A dye slug ${Lf} m long travels at ${vf} m/s, then enters a long wide reach where the flow is ${vs} m/s (constant discharge, so the dye obeys $u_t + c(x)\,u_x = 0$). Once wholly inside the slow reach, how long is the slug, in metres?`,
          visual: player({ mode: 'variable', speed: 'river', c: 1.5, slow: 0.3, profile: 'box', x0: -6.5, w: 1.2, t: 4.6, tmax: 12, x: [-10, 10] }, t`A square slug (illustrative numbers) now wholly inside the slow reach (shaded): it has been squeezed to about a third of its length, and the characteristics below crowd together there. Its height is unchanged.`),
          answer: Ls, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (Lf * vf) / vs, feedback: 'The slug gets shorter, not longer: its front slows down first while its back is still moving fast.' }],
          hints: ['The front and the back of the slug follow the same path, one behind the other by a fixed time.', t`That time lag is $${Lf}/${vf}$ s in the fast reach; in the slow reach the same lag spans $c_{\text{slow}}\times$ lag.`],
          teach: 'Two characteristics keep their time separation, so lengths scale with the local speed.',
          explain: t`The back passes any point $\tau = ${Lf}/${vf} = ${tex(Lf / vf)}$ s after the front. In the slow reach that lag spans $${vs} \times ${tex(Lf / vf)} = ${tex(Ls)}$ m. The concentration stays the same — the river is wider there, so the same amount of dye fits in a shorter length.`,
        };
      },
    }),
    mcq({
      id: 'no-crossing', difficulty: 2,
      prompt: t`Why can two characteristics of $u_t + c(x, t)\,u_x = 0$ (with $c$ smooth) never cross?`,
      visual: player({ mode: 'variable', speed: 'stretch', c: 0.5, profile: 'gauss', x0: 2, w: 0.6, t: 2, tmax: 3, x: [-1, 10] }, t`Characteristics of $u_t + 0.5x\,u_x = 0$: however they spread, no two meet.`),
      choices: [t`Through each point $(x, t)$ the ODE $dx/dt = c(x, t)$ has exactly one solution`, 'Because they are all straight lines with the same slope', t`Because $u$ is constant along each of them`, t`They can cross; the solution then takes the larger value`],
      answer: 0,
      why: {
        1: 'Variable-speed characteristics are curves of different shapes; parallelism is not the reason.',
        2: t`$u$ is constant along each one, which is exactly why a crossing would be a contradiction — but it is not why they cannot cross.`,
        3: t`For a linear equation a crossing is impossible. For nonlinear ones (where $c$ depends on $u$) characteristics do cross, and the solution develops a shock (B11).`,
      },
      hints: ['A crossing point would lie on two different solutions of the same ODE.', 'What does the existence–uniqueness theorem for ODEs say?'],
      teach: 'Uniqueness for the characteristic ODE keeps the characteristics of a linear equation from crossing.',
      explain: t`If two characteristics met at $(x_1, t_1)$, two different solutions of $dx/dt = c(x, t)$ would pass through one point, which the uniqueness theorem forbids for smooth $c$. So every point has a unique foot, and $u = f(x_0)$ is well defined for all time.`,
    }),
    mcq({
      id: 'stretch-picture', difficulty: 2,
      prompt: t`A bump centred at $x = 2$ evolves under $u_t + 0.5x\,u_x = 0$. Compared with the start, at $t = 2$ s the bump is:`,
      visual: player({ mode: 'variable', speed: 'stretch', c: 0.5, profile: 'gauss', x0: 2, w: 0.6, t: 0, tmax: 3, x: [-1, 10] }, t`The bump at $t = 0$ and the characteristics $x = x_0e^{0.5t}$ of the stretching flow.`),
      choices: [t`centred at $2e \approx 5.4$, wider by a factor $e$, same height`, t`centred at $3$, same width and height`, t`centred at $2e \approx 5.4$, wider by $e$ and lower by $e$`, 'still centred at 2, but wider'],
      answer: 0,
      why: {
        1: t`That would be constant speed 0.5 m/s. The speed is $0.5x$: 1 m/s at the start and rising as the bump moves out.`,
        2: t`Lowering would conserve the area (a conservative law, $u_t + (cu)_x = 0$). This equation keeps each value along its characteristic, so the peak height is unchanged.`,
        3: t`The flow speed at $x = 2$ is 1 m/s, not zero: the bump moves.`,
      },
      hints: [t`Characteristics: $x = x_0e^{0.5t}$. Where does $x_0 = 2$ go at $t = 2$?`, 'Two points 1 m apart end up e times farther apart; values ride unchanged.'],
      teach: 'Under c = a x every distance from the origin grows by $e^{at}$, and values are carried unchanged.',
      explain: t`$x = 2e^{0.5\cdot2} = 2e \approx 5.44$. All distances from the origin scale by $e$, so the bump is $e$ times wider; $u$ is constant along characteristics, so the peak is still the initial peak.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-channel', difficulty: 3, transfer: true,
      gen(r) {
        const c0 = r.pick([8, 10, 12]), L = r.pick([0.4, 0.5, 0.8]), X = r.pick([0.5, 1]);
        const T = (L / c0) * Math.log(1 + X / L);
        return {
          prompt: t`In a heated cooling channel the coolant expands and speeds up along its length; model the speed as $c(x) = ${c0}(1 + x/${L})$ m/s. A temperature disturbance is carried with the flow. How long does it take to travel from $x = 0$ to $x = ${X}$ m, in milliseconds?`,
          visual: { type: 'graph', params: { x: [0, 1.1], y: [0, 3 * c0 + 2], aspect: 'wide', xlabel: 'x (m)', ylabel: 'c (m/s)', curves: [{ fn: `${c0}*(1 + x/${L})`, color: 'teal', width: 2.4 }] }, caption: 'The model speed along the channel: a linear rise. Real channel flows are compressible and the rise is not exactly linear.' },
          answer: T * 1000, units: 'ms', tol: { rel: 0.01 },
          errors: [{ value: (X / c0) * 1000, feedback: 'That uses the inlet speed throughout; the flow speeds up, so the trip is quicker.' }, { value: (X / (c0 * (1 + X / (2 * L)))) * 1000, feedback: t`The average speed over distance is not the right average: integrate $dt = dx/c(x)$.` }],
          hints: [t`$t = \int_0^{${X}} \dfrac{dx}{c(x)}$.`, t`$\int \dfrac{dx}{${c0}(1 + x/${L})} = \dfrac{${L}}{${c0}}\ln(1 + x/${L})$.`],
          teach: 'Travel time along a characteristic: integrate dx/c(x).',
          explain: t`$t = \dfrac{${L}}{${c0}}\ln\!\left(1 + \dfrac{${X}}{${L}}\right) = ${tex(T)}$ s $= ${tex(T * 1000)}$ ms.`,
        };
      },
    }),
    expr({
      id: 'cp-xy', difficulty: 3,
      prompt: t`Solve $u_x + y\,u_y = 0$ with $u(0, y) = \sin y$. (Here $x$ plays the role of time.)`,
      visual: { type: 'graph', params: { x: [0, 2], y: [-4, 4], aspect: 'wide', xlabel: 'x', ylabel: 'y', curves: [-1.5, -1, -0.5, 0.5, 1, 1.5].map((y0) => ({ fn: `${y0}*e^x`, color: 'accent', width: 1.3 })).concat([{ fn: '0*x', color: 'accent', width: 1.3 }]) }, caption: t`The characteristic curves $dy/dx = y$ in the $x$–$y$ plane, starting on the line $x = 0$ where the data are given.` },
      answer: 'sin(y e^(-x))', answerTeX: t`\sin\!\left(ye^{-x}\right)`, lhs: 'u(x, y)',
      vars: { x: [0, 1.5], y: [-2, 2] },
      errors: [{ answer: 'sin(y e^x)', feedback: t`The curves are $y = y_0e^{x}$, so the foot is $y_0 = ye^{-x}$.` }],
      hints: [t`Characteristics: $dy/dx = y$, so $y = y_0e^{x}$.`, t`$u$ is constant along them: $u = \sin y_0$ with $y_0 = ye^{-x}$.`],
      teach: 'Any first-order linear PDE: find the curves along which it is an ODE, then use the data where they start.',
      explain: t`Along $y = y_0e^x$, $\frac{d}{dx}u(x, y(x)) = u_x + y\,u_y = 0$, so $u = \sin y_0 = \sin(ye^{-x})$. Check: $u_x = -ye^{-x}\cos(\cdot)$, $u_y = e^{-x}\cos(\cdot)$; $u_x + yu_y = 0$. ✓`,
    }),
    mcq({
      id: 'cp-crossing', difficulty: 2,
      prompt: t`For which of these equations can characteristics cross, even with smooth initial data?`,
      visual: xtPlane({ x: [-3, 4], y: [0, 2.5], xticks: 7, curves: [-2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2].map((x0) => ({ fn: `(x - ${x0})/(1 + 0.8*sin(${x0}))`, color: 'accent', width: 1.3, domain: [x0, 4] })) }, t`Characteristics whose speed is set by the value they carry, $1 + 0.8\sin x_0$: faster ones catch up with slower ones ahead.`),
      choices: [t`$u_t + u\,u_x = 0$`, t`$u_t + x\,u_x = 0$`, t`$u_t + e^{t}u_x = 0$`, t`$u_t + 3u_x = -u$`],
      answer: 0,
      why: {
        1: t`The speed $x$ is a known function: one characteristic through each point, so no crossings — they only spread.`,
        2: t`The speed $e^t$ is the same for every characteristic at a given time: they stay parallel.`,
        3: 'Decay changes the value along the way, but the characteristics are parallel straight lines.',
      },
      hints: ['Crossing needs characteristics whose speeds depend on something other than position and time.'],
      teach: 'Linear characteristics never cross; when the speed depends on u itself, they can — and a shock forms.',
      explain: t`In $u_t + u\,u_x = 0$ each characteristic moves at the speed $u = f(x_0)$ it carries; where a faster one starts behind a slower one, they meet in finite time — the shock of Burgers’ equation, module B11.`,
    }),
  ],
  sources: [SRC.strauss, SRC.evans],
});
