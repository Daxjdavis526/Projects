// A free particle maximizes proper time (Taylor ch. 15; Goldstein §7.9;
// Landau & Lifshitz vol. 2 §8): the only action for a free particle that
// every inertial observer agrees on is a multiple of the proper time,
// S = −mc²∫dτ, so L = −mc²√(1 − v²/c²). Euler–Lagrange gives p = γmv
// conserved: a straight worldline; since √(1 − v²/c²) ≤ 1, it has the most
// proper time between its end events (the twin paradox), so least action is
// most aging. Low speed: L ≈ −mc² + ½mv² (+ mv⁴/8c²): Newton's Lagrangian.
// Legendre transform: H = γmc². With a potential, L = −mc²/γ − U gives
// dp/dt = −∇U. Weak gravity: dτ = dt(1 + Φ/c² − v²/2c²), so maximal aging
// gives L = ½mv² − mΦ: the bridge to gr.S12. Explored in dg4-chart (vary
// mode on Minkowski). Transfer: GPS clock rates. Linked from M3.1, M4.2,
// phys3710.R1.3 and the GR track.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { sci, gpic, seg, lab, distinct } from './_cm5.js';
import { GM_E, C } from './_cm3.js';

const t = String.raw;
const R_E = 6.371e6, DAY = 86400;
const MPC2 = 938.272;   // MeV, the proton's rest energy

/** A twin-paradox worldlines picture (c = 1, years and light-years). */
const twins = (beta, T = 10, caption) => {
  const xt = +((beta * T) / 2).toFixed(4);
  return gpic({
    x: [-6, 6], y: [-0.5, 10.8], equal: true, axesAt: 'edge', xlabel: 'x (light-years)', ylabel: 't (years)',
    curves: [seg([0, 0], [0, T], 'accent', 2.6), seg([0, 0], [xt, T / 2], 'gold', 2.6), seg([xt, T / 2], [0, T], 'gold', 2.6), seg([0, 0], [5.4, 5.4], 'ink4', 1, true), seg([0, 0], [-5.4, 5.4], 'ink4', 1, true), seg([0, T], [5, T - 5], 'ink4', 1, true), seg([0, T], [-5, T - 5], 'ink4', 1, true)],
    points: [{ x: 0, y: 0, color: 'ink', r: 4, label: 'depart', labelDx: 8, labelDy: 10 }, { x: 0, y: T, color: 'ink', r: 4, label: 'reunion', labelDx: 8, labelDy: -10 }, lab(-0.3, T * 0.3, 'home', 'accent', -6, 0), lab(xt + 0.3, T / 2, 'traveller', 'gold', 6, 0)],
  }, caption, 'A straight vertical worldline and a bent one meeting it at both ends, inside dashed light cones');
};

/** A still dg4-chart vary picture on flat spacetime. */
const varyPic = (extra, caption) => ({ type: 'dg4-chart', params: { metric: 'minkowski', mode: 'vary', P: [0, -1], drag: false, readout: false, field: false, speed: 0, length: 2, alpha: 0.2, alphaMax: 0.3, panel: false, ...extra }, caption });

export default lesson({
  id: 'phys3550.M12.1',
  title: 'A free particle maximizes proper time',
  minutes: 16, difficulty: 4,
  intro: t`Hamilton's principle needs an action, and relativity limits the choice. Observers moving relative to each other disagree about times, lengths and speeds, but they all agree on how much time a clock carried along a worldline records: its **proper time** $\tau$, with $d\tau = dt\sqrt{1 - v^2/c^2}$. So the free particle's action can only be a multiple of $\tau$, and the multiple is fixed by matching Newton at low speed: $S = -mc^2\int d\tau$. That gives the relativistic Lagrangian $L = -mc^2\sqrt{1 - v^2/c^2}$. Its Euler–Lagrange equation says the relativistic momentum $\gamma m\vec v$ is constant — a straight worldline — and because of the minus sign, **least action means most proper time**: of all worldlines between two events, the free one ages the most. That is the twin paradox in one line, and with gravity it becomes Einstein's law of free fall ([maximal aging](#/lesson/gr.S12.i)).`,
  equation: t`S = -mc^2\!\int d\tau = \int L\,dt, \qquad L = -mc^2\sqrt{1 - \frac{v^2}{c^2}}`,
  symbols: [
    { tex: 'S', text: 'the action, in J s' },
    { tex: '\\tau', text: 'proper time: the time a clock carried by the particle records, in s; $d\\tau = dt\\sqrt{1 - v^2/c^2}$' },
    { tex: 'm', text: 'the particle’s (rest) mass, in kg' },
    { tex: 'c', text: 'the speed of light, $299\\,792\\,458$ m/s' },
    { tex: 'v', text: 'the particle’s speed in the chosen inertial frame, in m/s' },
    { tex: 'L', text: 'the relativistic Lagrangian of a free particle, in J' },
  ],
  why: t`This Lagrangian is the seed of the geodesic equation of general relativity: replace the flat-spacetime $d\tau$ with the curved one and the same principle of maximal aging describes every orbit, every falling clock and every GPS correction.`,
  visual: {
    type: 'dg4-chart',
    title: 'Push a worldline sideways',
    lead: t`Flat spacetime with $c = 1$: space across, time up, light cones at every grid point. The gold worldline is a free particle's, from one event to another; the orange one is the same worldline pushed sideways by $\alpha$ with its end events held fixed. The panel plots the proper time along the pushed worldline against $\alpha$.`,
    tasks: [
      t`Slide $\alpha$ either way: the proper time only goes down. The free worldline sits at the top of the curve — a **maximum**, flat at $\alpha = 0$.`,
      t`Give the particle a speed: the straight worldline tilts, and it is still the top of the curve. Every free worldline, at any speed, has more proper time than its neighbours between the same two events.`,
    ],
    params: { metric: 'minkowski', mode: 'vary', P: [0, -1], panel: true, sliders: ['alpha', 'speed'], speed: 0, length: 2, alpha: 0.15, alphaMax: 0.3, field: true, readout: ['F'] },
    caption: t`Units with $c = 1$. The variation is $\alpha\sin(\pi\lambda/\Lambda)$ along the worldline's unit normal, so the ends stay put; pushes large enough to touch the light cone are not allowed. Proper time is computed by integrating $\sqrt{dt^2 - dx^2}$ along each curve.`,
  },
  example: {
    prompt: t`Take $L = -mc^2\sqrt{1 - v^2/c^2}$ for a particle moving along $x$. Find its momentum, its equation of motion and its energy, show that the free worldline has the most proper time between two events, and recover Newton's Lagrangian at low speed.`,
    visual: varyPic({ speed: 0.3, length: 2.2 }, t`A free worldline (gold, $c = 1$) and a neighbour with the same end events (orange). The neighbour records less proper time.`),
    steps: [
      { label: 'Momentum', text: t`$p = \dfrac{\partial L}{\partial v} = -mc^2\cdot\dfrac{-v/c^2}{\sqrt{1 - v^2/c^2}} = \gamma mv$, with $\gamma = 1/\sqrt{1 - v^2/c^2}$: the relativistic momentum falls out of the Lagrangian.` },
      { label: 'Motion', text: t`$L$ has no $x$, so $x$ is cyclic ([M4.4](#/lesson/phys3550.M4.4)): $\dfrac{d}{dt}(\gamma mv) = 0$. Constant momentum means constant velocity: a straight worldline.` },
      { label: 'Energy', text: t`$H = pv - L = \gamma mv^2 + mc^2/\gamma = \gamma mc^2\bigl(v^2/c^2 + 1 - v^2/c^2\bigr) = \gamma mc^2$ ([M9.1](#/lesson/phys3550.M9.1)): Einstein's energy, conserved because $L$ has no $t$.` },
      { label: 'Most aging', text: t`Use the frame in which the free particle is at rest between events $A$ and $B$, a time $T$ apart: its proper time is $T$. Any other worldline between them moves at some $v(t)$, and records $\int_0^T\sqrt{1 - v^2/c^2}\,dt \le T$, with equality only if $v = 0$ throughout. So the free worldline has the **maximum** proper time, and $S = -mc^2\tau$ its **minimum** action.` },
      { label: 'Low speed', text: t`$\sqrt{1 - x} = 1 - \tfrac{x}{2} - \tfrac{x^2}{8} - \ldots$, so $L = -mc^2 + \tfrac12mv^2 + \dfrac{mv^4}{8c^2} + \ldots$ The constant $-mc^2$ changes no equation of motion; what is left is Newton's $T = \tfrac12mv^2$ plus a tiny correction.` },
      { label: 'Sense check', text: t`The minus sign in front is what makes the kinetic term come out positive. A plus sign would give $-\tfrac12mv^2$ and an upside-down mechanics.` },
    ],
    answer: t`$p = \gamma mv$ (constant: a straight worldline), $H = \gamma mc^2$; the free worldline maximizes $\tau$, so $S = -mc^2\tau$ is least; at low speed $L \approx -mc^2 + \tfrac12mv^2$.`,
  },
  practice: [
    expr({
      id: 'momentum', difficulty: 2,
      prompt: t`Find the canonical momentum $p = \partial L/\partial v$ for $L = -mc^2\sqrt{1 - v^2/c^2}$.`,
      answer: 'm*v/sqrt(1 - v^2/c^2)', answerTeX: t`\frac{mv}{\sqrt{1 - v^2/c^2}}`,
      lhs: 'p', vars: { m: [0.5, 3], v: [0.1, 0.8], c: [1, 2] },
      errors: [{ answer: 'm*v', feedback: t`That is Newton's momentum, the low-speed limit. Differentiate the square root exactly.` }, { answer: '-m*v/sqrt(1 - v^2/c^2)', feedback: t`Check the sign: the two minus signs (in front of $L$ and from differentiating $-v^2/c^2$) cancel.` }, { answer: 'm*v*sqrt(1 - v^2/c^2)', feedback: t`The derivative of $\sqrt{u}$ is $1/(2\sqrt u)$: the root goes in the denominator.` }],
      hints: [t`$\dfrac{d}{dv}\sqrt{1 - v^2/c^2} = \dfrac{-v/c^2}{\sqrt{1 - v^2/c^2}}$.`],
      teach: t`The relativistic Lagrangian's canonical momentum is $\gamma mv$, which grows without limit as $v \to c$.`,
      explain: t`$p = -mc^2\cdot\dfrac{-v/c^2}{\sqrt{1 - v^2/c^2}} = \gamma mv$. As $v \to c$, $p \to \infty$: no finite push gets a massive particle to light speed.`,
      visual: gpic({ x: [0, 1], y: [0, 4], axesAt: 'edge', xlabel: 'v / c', ylabel: 'p / mc', curves: [{ fn: 'x', domain: [0, 1], color: 'ink3', width: 1.6, dash: true, label: 'Newton', labelAt: 0.85, labelDx: 4, labelDy: 14 }], vlines: [{ x: 1, color: 'ink4' }] }, t`Momentum against speed (in units of $mc$): Newton's straight line, dashed. Where does the relativistic one go?`, 'A straight line of momentum against speed, with a vertical line at the speed of light'),
    }),
    num({
      id: 'twin', difficulty: 2,
      gen(r) {
        const beta = r.pick([0.6, 0.8, 0.5, 0.7]), T = 10;
        const key = T * Math.sqrt(1 - beta * beta);
        return {
          prompt: t`One twin stays home; the other flies out at $${beta}c$ and back at the same speed, returning after ${T} years of the home twin's time. How many years has the travelling twin's clock recorded?`,
          answer: key, units: 'yr', tol: { rel: 0.005 },
          errors: distinct([{ value: T / Math.sqrt(1 - beta * beta), feedback: t`The moving clock records **less**: $\tau = \int\sqrt{1 - v^2/c^2}\,dt$.` }, { value: T * (1 - beta * beta), feedback: t`$d\tau = dt\sqrt{1 - v^2/c^2}$: take the square root.` }, { value: T * (1 - beta), feedback: t`The factor is $\sqrt{1 - \beta^2}$, not $1 - \beta$.` }], key),
          hints: [t`Each leg runs at constant $v$, so $\tau = T\sqrt{1 - v^2/c^2}$ for the whole trip.`],
          teach: t`Of two worldlines between the same events, the one that stays free — the home twin — records the most proper time.`,
          explain: t`$\tau = ${T}\sqrt{1 - ${beta}^2} = ${sci(key, 3)}$ yr. The home twin's worldline is the straight (free) one and records the maximum; the traveller's bent worldline less. Only the traveller felt the turnaround, so the situation is not symmetric — see [phys3710 R1.3](#/lesson/phys3710.R1.3).`,
          visual: twins(beta, T, t`The two worldlines between the same events ($c = 1$; years up, light-years across; dashed: light rays). The turnaround is drawn as a corner (instant).`),
        };
      },
    }),
    num({
      id: 'correction', difficulty: 3,
      gen(r) {
        const C0 = r.pick([{ name: 'a GPS satellite', v: 3874 }, { name: 'the Parker Solar Probe at its fastest', v: 1.92e5 }, { name: 'the ISS', v: 7660 }, { name: 'a rifle bullet', v: 900 }]);
        const key = (C0.v * C0.v) / (4 * C * C);
        return {
          prompt: t`Expanding $L = -mc^2\sqrt{1 - v^2/c^2}$ gives $-mc^2 + \tfrac12mv^2 + \dfrac{mv^4}{8c^2} + \ldots$. For ${C0.name}, moving at $${sci(C0.v, 4)}$ m/s, what is the ratio of the correction $mv^4/8c^2$ to Newton's $\tfrac12mv^2$?`,
          answer: key, tol: { rel: 0.01 },
          errors: distinct([{ value: (C0.v * C0.v) / (8 * C * C), feedback: t`Divide $mv^4/8c^2$ by $\tfrac12mv^2$: the ratio is $v^2/4c^2$.` }, { value: C0.v / (4 * C), feedback: t`The ratio is $v^2/4c^2$ — the speed is squared.` }], key),
          hints: [t`Divide the correction term by $\tfrac12mv^2$; the $m$ cancels.`, t`$\dfrac{mv^4/8c^2}{mv^2/2} = \dfrac{v^2}{4c^2}$.`],
          teach: t`Relativistic corrections to mechanics are of order $v^2/c^2$: tiny for anything we have built, but measurable with clocks.`,
          explain: t`$v^2/4c^2 = (${sci(C0.v, 4)})^2/(4\times(2.998\times10^{8})^2) = ${sci(key, 3)}$. Mechanics barely notices; atomic clocks, which count $10^{9}$–$10^{15}$ ticks a second, notice easily.`,
          visual: gpic({ x: [0, 1], y: [0, 1.6], axesAt: 'edge', xlabel: 'v / c', ylabel: 'L + mc² (units of mc²)', curves: [{ fn: '1 - sqrt(1 - x^2)', domain: [0, 0.999], color: 'accent', width: 2.4, label: 'exact', labelAt: 0.8, labelDx: -46, labelDy: -6 }, { fn: 'x^2/2', domain: [0, 1], color: 'ink3', width: 1.6, dash: true, label: '½(v/c)²', labelAt: 0.9, labelDx: 6, labelDy: 14 }] }, t`$L + mc^2$ against speed: the exact relativistic curve and Newton's $\tfrac12mv^2$ (dashed). They part only when $v$ is a sizeable fraction of $c$.`, 'Two curves of Lagrangian against speed agreeing at low speed'),
        };
      },
    }),
    mcq({
      id: 'sign', difficulty: 2,
      prompt: t`Why is the free-particle action $-mc^2\int d\tau$, with a minus sign, rather than $+mc^2\int d\tau$?`,
      visual: varyPic({ speed: 0, length: 2, panel: true, readout: false }, t`Proper time along worldlines pushed sideways from the free one ($c = 1$): the free worldline is at the top.`),
      choices: [t`So that at low speed it reduces to $\int(-mc^2 + \tfrac12mv^2)\,dt$, with the correct sign of the kinetic energy; it also makes the free worldline, which has the most proper time, the one of least action`, t`Because proper time is always negative`, t`It is a convention with no physical consequence: $+mc^2\int d\tau$ gives the same motion with the same energies`, t`So that the action has units of energy`],
      answer: 0,
      why: { 1: t`$d\tau = dt\sqrt{1 - v^2/c^2}$ is positive along any timelike worldline.`, 2: t`Flipping the sign of $L$ leaves the Euler–Lagrange equations unchanged, but it makes the energy $H = pv - L$ and the momentum come out with the wrong sign: $\partial L/\partial v$ would be $-\gamma mv$.`, 3: t`$mc^2\tau$ has units of J s, an action, either way.` },
      hints: [t`Expand $-mc^2\sqrt{1 - v^2/c^2}$ for small $v$. What is the sign of the $v^2$ term?`],
      teach: t`The sign of the relativistic action is fixed by Newton: least action must be most proper time, so that the kinetic term is $+\tfrac12mv^2$.`,
      explain: t`$-mc^2\sqrt{1 - v^2/c^2} \approx -mc^2 + \tfrac12mv^2$: Newton's Lagrangian, up to a constant. And since the free worldline maximizes $\tau$, it minimizes $-mc^2\tau$.`,
    }),
    num({
      id: 'energy', difficulty: 2,
      gen(r) {
        const beta = r.pick([0.5, 0.8, 0.9, 0.99]);
        const g = 1 / Math.sqrt(1 - beta * beta), key = (g - 1) * MPC2;
        return {
          prompt: t`The Hamiltonian of $L = -mc^2\sqrt{1 - v^2/c^2}$ is $H = pv - L = \gamma mc^2$. A proton ($mc^2 = 938.27$ MeV) moves at $${beta}c$. What is its kinetic energy $H - mc^2$, in MeV?`,
          answer: key, units: 'MeV', tol: { rel: 0.005 },
          errors: distinct([{ value: 0.5 * beta * beta * MPC2, feedback: t`That is Newton's $\tfrac12mv^2$, which badly underestimates at this speed: use $(\gamma - 1)mc^2$.` }, { value: g * MPC2, feedback: t`That is the total energy $\gamma mc^2$; subtract the rest energy.` }], key),
          hints: [t`$\gamma = 1/\sqrt{1 - \beta^2}$.`, t`Kinetic energy $= (\gamma - 1)mc^2$.`],
          teach: t`The Legendre transform of the relativistic Lagrangian gives $E = \gamma mc^2$, rest energy plus kinetic energy.`,
          explain: t`$\gamma = ${sci(g, 4)}$, so $K = (\gamma - 1)\times938.27 = ${sci(key, 4)}$ MeV; Newton's $\tfrac12mv^2$ would give $${sci(0.5 * beta * beta * MPC2, 4)}$ MeV.`,
          visual: gpic({ x: [0, 1], y: [0, 3], axesAt: 'edge', xlabel: 'v / c', ylabel: 'K / mc²', curves: [{ fn: '1/sqrt(1 - x^2) - 1', domain: [0, 0.97], color: 'accent', width: 2.4, label: 'relativity', labelAt: 0.92, labelDx: -70, labelDy: 0 }, { fn: 'x^2/2', domain: [0, 1], color: 'ink3', width: 1.6, dash: true, label: 'Newton', labelAt: 0.95, labelDx: 6, labelDy: 10 }] }, t`Kinetic energy against speed, in units of the rest energy: $(\gamma - 1)mc^2$ and Newton's $\tfrac12mv^2$ (dashed).`, 'Two curves of kinetic energy against speed'),
        };
      },
    }),
    order({
      id: 'with-force', difficulty: 3,
      prompt: t`Put the steps in order to get the relativistic equation of motion for a particle in a potential $U(x)$, starting from $L = -mc^2\sqrt{1 - \dot x^2/c^2} - U(x)$.`,
      visual: gpic({ x: [0, 4], y: [0, 2.2], axesAt: 'edge', xlabel: 'x', ylabel: 'U(x)', curves: [{ fn: '0.15*(x - 2)^2 + 0.3', domain: [0, 4], color: 'accent', width: 2.4 }], points: [{ x: 3.2, y: 0.516, color: 'warn', r: 6 }], arrows: [{ from: [3.2, 0.75], to: [2.6, 0.75], color: 'warn', label: '−dU/dx', labelDx: -20, labelDy: -12 }] }, t`A particle in a potential well; the force is $-dU/dx$ (illustrative).`, 'A particle on a potential energy curve with a force arrow'),
      items: [t`$\partial L/\partial\dot x = \gamma m\dot x$`, t`$\partial L/\partial x = -dU/dx$`, t`Euler–Lagrange: $\dfrac{d}{dt}(\gamma m\dot x) = -\dfrac{dU}{dx}$`, t`At low speed $\gamma \to 1$: $m\ddot x = -dU/dx$`],
      hints: [t`Differentiate $L$ with respect to $\dot x$ and $x$ first.`, t`Then assemble $\frac{d}{dt}\frac{\partial L}{\partial\dot x} = \frac{\partial L}{\partial x}$; take the low-speed limit last.`],
      teach: t`Adding $-U$ to the relativistic Lagrangian gives $d(\gamma m\vec v)/dt = -\nabla U$: Newton's second law with relativistic momentum.`,
      explain: t`The potential touches only $\partial L/\partial x$; the kinetic part only $\partial L/\partial\dot x$. The result, $dp/dt = F$ with $p = \gamma mv$, is how accelerators are designed. (A velocity-dependent force such as the magnetic one needs a velocity-dependent potential, $q\vec v\cdot\vec A$.)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gps', difficulty: 3, transfer: true,
      gen(r) {
        const S = r.pick([{ name: 'a GPS satellite', rr: 2.6561e7 }, { name: 'a Galileo satellite', rr: 2.9600e7 }, { name: 'a GLONASS satellite', rr: 2.5508e7 }, { name: 'the ISS', rr: 6.771e6 }]);
        const grav = (GM_E / (C * C)) * (1 / R_E - 1 / S.rr), vel = GM_E / S.rr / (2 * C * C), key = (grav - vel) * DAY * 1e6;
        return {
          prompt: t`In weak gravity a clock's proper time runs at $\dfrac{d\tau}{dt} \approx 1 + \dfrac{\Phi}{c^2} - \dfrac{v^2}{2c^2}$, with $\Phi = -GM/r$ — so maximizing $\tau$ means maximizing $\int(\tfrac12v^2 - \Phi)\,dt$, Newton's action per unit mass. Compare a clock on ${S.name} (circular orbit of radius $${sci(S.rr / 1e3, 5)}$ km, so $v^2 = GM/r$) with one on the ground ($r = 6371$ km; ignore Earth's rotation). By how many microseconds per day does the orbiting clock **gain** on the ground clock? (Negative if it loses. $GM_\oplus = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$.)`,
          answer: key, units: 'μs', tol: { rel: 0.01, abs: 0.05 },
          errors: distinct([{ value: grav * DAY * 1e6, feedback: t`That is gravity's part only. The orbital speed slows the clock by $v^2/2c^2$.` }, { value: -vel * DAY * 1e6, feedback: t`That is the speed's part only. Being higher in Earth's potential speeds the clock up.` }, { value: (grav + vel) * DAY * 1e6, feedback: t`The speed term *subtracts*: moving clocks run slow.` }], key),
          hints: [t`Gravity term: $\Delta\Phi/c^2 = \dfrac{GM}{c^2}\left(\dfrac{1}{R_\oplus} - \dfrac1r\right)$. Speed term: $\dfrac{v^2}{2c^2} = \dfrac{GM}{2rc^2}$.`, t`Gain per day $= (\Delta\Phi/c^2 - v^2/2c^2)\times86\,400$ s.`],
          teach: t`A satellite clock's rate is set by both terms of the weak-field proper time: height speeds it up, speed slows it down.`,
          explain: t`Gravity: $${sci(grav, 3)}$; speed: $${sci(vel, 3)}$. Net: $${sci(grav - vel, 3)}\times86\,400\ \text{s} = ${sci(key, 3)}\ \mu\text{s}$ per day.${S.name.includes('GPS') ? ' GPS satellite clocks are built to tick slow by this amount before launch; without it, positions would drift by about 10 km a day.' : S.name.includes('ISS') ? ' Low orbits are fast and not very high, so the speed term wins: ISS clocks lose.' : ''} This is the same principle of maximal aging as the free particle's, with gravity bending the worldlines — [free fall is the path of maximal aging](#/lesson/gr.S12.i).`,
          visual: gpic({ x: [-5, 5], y: [-4.6, 4.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'accent', alpha: 0.6 }], curves: [{ param: [`${+(S.rr / R_E).toFixed(3)}*cos(t)`, `${+(S.rr / R_E).toFixed(3)}*sin(t)`], t: [0, 6.2832], color: 'ink3', width: 1.4, dash: true }], points: [{ x: +((S.rr / R_E) * 0.707).toFixed(3), y: +((S.rr / R_E) * 0.707).toFixed(3), color: 'gold', r: 5, label: 'orbiting clock' }, { x: 0, y: 1, color: 'warn', r: 5, label: 'ground clock', labelDx: 8, labelDy: -10 }] }, t`Earth and the orbit, to scale (the orbit is clipped if it is larger than the frame).`, 'Earth with a circular orbit around it and two clocks marked'),
        };
      },
    }),
    num({
      id: 'cp-momentum', difficulty: 2,
      gen(r) {
        const beta = r.pick([0.6, 0.8, 0.95]);
        const g = 1 / Math.sqrt(1 - beta * beta), key = g * beta * MPC2;
        return {
          prompt: t`A proton ($mc^2 = 938.27$ MeV) moves at $${beta}c$. What is its momentum $p = \partial L/\partial v$, in MeV/$c$? (Enter the number of MeV/$c$.)`,
          answer: key, tol: { rel: 0.005 },
          errors: distinct([{ value: beta * MPC2, feedback: t`That is Newton's $mv$. From the relativistic Lagrangian, $p = \gamma mv$.` }, { value: g * MPC2, feedback: t`That is the energy $\gamma mc^2$; the momentum is $\gamma m v$, so $pc = \gamma\beta mc^2$.` }], key),
          hints: [t`$pc = \gamma\beta\,mc^2$.`],
          teach: t`The relativistic Lagrangian's momentum is $\gamma mv$; in particle units, $pc = \gamma\beta\,mc^2$.`,
          explain: t`$\gamma = ${sci(g, 4)}$, so $pc = ${sci(g, 4)}\times${beta}\times938.27 = ${sci(key, 4)}$ MeV.`,
          visual: varyPic({ speed: beta > 0.9 ? 0.9 : beta, length: 1.6 }, t`The proton's straight worldline at this speed ($c = 1$; the orange curve is a varied neighbour).`),
        };
      },
    }),
    mcq({
      id: 'cp-maximum', difficulty: 3,
      prompt: t`Between two events, which worldline has the **least** proper time?`,
      visual: twins(0.6, 10, t`A free worldline and a bent one between the same events ($c = 1$).`),
      choices: [t`There is none: worldlines that zigzag ever closer to the light cone have proper time as close to zero as you like`, t`The free (straight) worldline`, t`A worldline at constant speed $c/2$ out and back`, t`The one that stays at rest in some other frame`],
      answer: 0,
      why: { 1: t`The free worldline has the **most** proper time, not the least.`, 2: t`It has less than the straight one, but faster zigzags have less still.`, 3: t`A worldline at rest in some inertial frame is a straight one: it is a free worldline, with the maximum.` },
      hints: [t`What is $d\tau$ along a light ray?`, t`Can a massive particle's worldline zigzag arbitrarily close to a path made of light rays?`],
      teach: t`Free worldlines maximize proper time; there is no minimum, because light-like zigzags make it arbitrarily small.`,
      explain: t`Along a light ray $d\tau = 0$, and a massive particle's worldline can approximate a zigzag of light rays arbitrarily well, so the infimum is 0 and it is never reached. The stationary point of $\tau$ is therefore a maximum — the opposite of Euclidean geometry, where the straight line is the *shortest* path.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 15: special relativity, the relativistic Lagrangian', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'L. D. Landau and E. M. Lifshitz, The Classical Theory of Fields, 4th ed. (1975), §8: the principle of least action', url: 'https://www.sciencedirect.com/book/9780080250724/the-classical-theory-of-fields' },
    { label: 'N. Ashby, Relativity in the Global Positioning System, Living Rev. Relativ. 6, 1 (2003)', url: 'https://doi.org/10.12942/lrr-2003-1' },
  ],
});
