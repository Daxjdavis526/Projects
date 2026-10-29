// The nonlinear pendulum in its phase plane: θ′ = ω, ω′ = −(g/L) sin θ;
// energy as a conserved quantity whose level curves are the trajectories;
// centres hanging down and saddles balanced upside down; the separatrix
// ω = ±2√(g/L) cos(θ/2) between swinging and whirling; the exact period from
// an elliptic integral (Gauss's arithmetic–geometric mean); the cylinder; the
// damped pendulum; and a gravity-gradient satellite's pitch as a pendulum.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { M, n, r6, plane } from './_systems.js';

const t = String.raw;
const G = 9.8;

// Gauss's arithmetic–geometric mean
function agm(a, b) {
  for (let i = 0; i < 40 && Math.abs(a - b) > 1e-15; i++) { const m = (a + b) / 2; b = Math.sqrt(a * b); a = m; }
  return a;
}

// the pendulum's phase plane in units where g/L = 1: energy levels, the separatrix in gold
const pendPlane = (o = {}) => plane('y', o.fy || '-sin(x)', {
  x: o.x || [-7, 7], y: o.y || [-3.2, 3.2], equal: false, xlabel: 'θ (rad)', ylabel: 'θ′ (in √(g/L))',
  levels: o.levels === false ? null : { fn: 'y^2/2 - cos(x)', values: o.values || [-0.85, -0.5, 0, 0.5, 2, 3], highlight: o.sep === false ? [] : [1] },
  seeds: o.seeds || [], field: o.field ?? true, heads: o.heads ?? true, T: o.T ?? 30, equilibria: o.equilibria ?? false, points: o.points || [], caption: o.caption,
});

export default lesson({
  id: 'math2280.DE-5.4',
  title: 'The nonlinear pendulum',
  minutes: 15, difficulty: 3,
  intro: t`Physics I solved the pendulum for small swings and quoted the large-swing correction (see [Pendulums](#/lesson/phys2210.M15.3)). Here is the whole story, in the phase plane of angle $\theta$ and angular velocity $\theta'$:

$$\theta'' + \frac{g}{L}\sin\theta = 0, \qquad E = \tfrac12\,\theta'^2 - \frac{g}{L}\cos\theta.$$

The energy $E$ (per unit $mL^2$) is conserved, so every trajectory is a level curve of $E$ — no need to solve anything to draw the portrait. Hanging straight down, $(0, 0)$ is a **centre**; balanced upside down, $(\pi, 0)$ is a **saddle**. The level $E = g/L$, through the saddles, is the **separatrix** $\theta' = \pm2\sqrt{g/L}\cos(\theta/2)$: inside it the pendulum swings back and forth (**libration**), outside it whirls over the top forever (**rotation**).`,
  symbols: [
    { tex: '\\theta', text: 'the angle from straight down, in rad; $\\theta$ and $\\theta + 2\\pi$ are the same position' },
    { tex: "\\theta'", text: 'the angular velocity, in rad/s' },
    { tex: 'g', text: 'the gravitational acceleration, 9.8 m/s² on Earth' },
    { tex: 'L', text: 'the length from pivot to bob, in m (a point bob on a light, rigid rod)' },
    { tex: 'E', text: 'the energy divided by $mL^2$, in s⁻²: kinetic $\\tfrac12\\theta\'^2$ plus potential $-\\tfrac{g}{L}\\cos\\theta$' },
  ],
  why: t`The pendulum is the template for every “particle in a periodic potential” — a gravity-gradient satellite’s pitch, a Josephson junction, a charged particle in a wave — and its separatrix is the simplest picture of how a system escapes from a well.`,
  visual: {
    type: 'de-plane',
    title: 'Swinging, whirling, and the line between',
    lead: t`The pendulum’s phase plane in units where $g/L = 1$ (time in units of $\sqrt{L/g}$). Grey: energy levels; gold: the separatrix. Drag the start point and press Play: the pendulum below follows the dot, and the graph shows $\theta(t)$ and $\theta'(t)$.`,
    tasks: [
      t`From $(2.5, 0)$ — released at 143° — the trajectory is a closed loop inside the separatrix: the pendulum swings, slowly near the top of each swing.`,
      t`Drag the start to $(0, 2.1)$, just above the separatrix’s peak at $\theta' = 2$: the pendulum whirls over the top, and the trajectory runs off to the right — on a cylinder it would close. At $(0, 1.9)$ it swings instead.`,
      'Add damping: every trajectory spirals into a hanging equilibrium. A whirling pendulum loses energy until it crosses the separatrix and starts to swing.',
    ],
    params: {
      fx: 'y', fy: '-sin(x) - b*y', x: [-7, 7], y: [-3.2, 3.2], equal: false, aspect: 'wide', xlabel: 'θ (rad)', ylabel: 'θ′',
      sliders: [{ key: 'b', label: 'Damping $b$', min: 0, max: 0.5, step: 0.01, value: 0, unit: '\\sqrt{g/L}', explain: 'A friction torque proportional to the angular velocity. With $b > 0$ energy is no longer conserved.' }],
      levels: { fn: 'y^2/2 - cos(x)', values: [-0.85, -0.5, 0, 0.5, 2, 3], highlight: [1] },
      equilibria: 'label', start: [2.5, 0], play: true, series: true, tmax: 25, pendulum: true, seriesNames: ['θ', 'θ′'], T: 20,
    },
    caption: 'Point bob on a light rigid rod, no air (unless you add damping). The energy levels are drawn for b = 0. On a string the bob could not go over the top: the string goes slack unless the speed at the top is at least √(gL).',
  },
  example: {
    prompt: t`A pendulum 1.00 m long (a light rigid rod) hangs on Earth, $g = 9.8$ m/s². (a) What angular speed at the bottom just carries it to the top? (b) Released from rest at 90°, what is its period — and how wrong is the small-angle formula?`,
    visual: { type: 'de-plane', params: { fx: 'y', fy: '-9.8*sin(x)', x: [-3.6, 3.6], y: [-7.2, 7.2], equal: false, aspect: 'wide', xlabel: 'θ (rad)', ylabel: 'θ′ (rad/s)', levels: { fn: 'y^2/2 - 9.8*cos(x)', values: [0], highlight: [9.8] }, start: [1.5708, 0], series: true, tmax: 5, pendulum: true, seriesNames: ['θ', 'θ′'], readout: false, click: false, grid: 20 }, caption: 'Gold: the separatrix, reaching θ′ = 6.26 rad/s at the bottom. Bold: the swing from 90°, the level E = 0.' },
    steps: [
      { label: 'Energy', text: t`With $g/L = 9.8\ \text{s}^{-2}$, $E = \tfrac12\theta'^2 - 9.8\cos\theta$ is constant. At the top, at rest, $E = -9.8\cos\pi = 9.8$: that is the separatrix level.` },
      { label: '(a) Over the top', text: t`At the bottom ($\theta = 0$) on the separatrix: $\tfrac12\theta'^2 - 9.8 = 9.8$, so $\theta' = 2\sqrt{g/L} = 6.26$ rad/s — a bob speed of $6.26$ m/s. Any faster and it whirls; any slower and it swings back.` },
      { label: 'Quarter swing', text: t`From rest at $\theta_0$, energy gives $\theta' = \sqrt{2\tfrac{g}{L}(\cos\theta - \cos\theta_0)}$, so a quarter period is $\displaystyle\int_0^{\theta_0}\frac{d\theta}{\sqrt{2\tfrac{g}{L}(\cos\theta - \cos\theta_0)}}$ — the time to fall from $\theta_0$ to the bottom.` },
      { label: 'Gauss’s mean', text: t`The substitution $\sin(\theta/2) = \sin(\theta_0/2)\sin\phi$ turns $4\times$ that integral into $T = 4\sqrt{L/g}\,K(\sin\tfrac{\theta_0}{2})$, a complete elliptic integral, which Gauss showed equals $T = \dfrac{2\pi\sqrt{L/g}}{\operatorname{AGM}(1, \cos\tfrac{\theta_0}{2})}$ — the **arithmetic–geometric mean**: replace $(a, b)$ by $\left(\tfrac{a + b}{2}, \sqrt{ab}\right)$ until they agree.` },
      { label: '(b) At 90°', text: t`$\cos45^\circ = 0.70711$. AGM steps: $(1, 0.70711) \to (0.85355, 0.84090) \to (0.84722, 0.84720) \to 0.84721$. So $T = 2.0071/0.84721 = 2.369$ s, against the small-angle $2\pi\sqrt{L/g} = 2.007$ s.` },
      { label: 'Sense check', text: t`The true period is 18% longer; the small-angle formula is 15% short. As $\theta_0 \to 180^\circ$, $\cos(\theta_0/2) \to 0$, the AGM goes to 0 and the period grows without bound: a pendulum started near the top lingers there, which is the separatrix taking infinite time to reach the saddle.` },
    ],
    answer: t`(a) $2\sqrt{g/L} = 6.26$ rad/s at the bottom; (b) $T = 2.37$ s from 90°, 18% longer than the small-angle 2.01 s.`,
  },
  practice: [
    mcq({
      id: 'types', difficulty: 1,
      prompt: t`What are the equilibria of $\theta' = \omega$, $\omega' = -\tfrac{g}{L}\sin\theta$ at $(0, 0)$ and $(\pi, 0)$?`,
      choices: ['A centre (hanging down) and a saddle (balanced upside down)', 'A stable spiral and an unstable spiral', 'Both centres', 'A saddle (hanging) and a centre (upside down)'],
      answer: 0,
      why: {
        1: 'Spirals need energy to be gained or lost. Without friction the energy is conserved, which allows only centres and saddles.',
        2: t`At $(\pi, 0)$ the Jacobian is $${M([[0, 1], ['g/L', 0]])}$ with $\Delta = -g/L < 0$: a saddle.`,
        3: 'Swapped: hanging down is where small swings oscillate (a centre); upside down, the smallest tilt grows (a saddle).',
      },
      hints: [t`The Jacobian is $${M([[0, 1], ['-(g/L)\\cos\\theta', 0]])}$.`, t`At $\theta = 0$, $\Delta = g/L > 0$ with $\tau = 0$; at $\theta = \pi$, $\Delta = -g/L < 0$.`],
      teach: 'A frictionless pendulum has centres where the potential is lowest and saddles where it is highest — conservative systems have no other kind.',
      explain: t`At $(0, 0)$: $\tau = 0$, $\Delta = g/L$ — a linearized centre, and energy conservation makes it a true one. At $(\pi, 0)$: $\Delta = -g/L < 0$ — a saddle, hyperbolic, so certainly a saddle.`,
      visual: pendPlane({ x: [-1.5, 4.6], y: [-2.5, 2.5], values: [-0.8, -0.4, 0.3, 2], caption: 'Energy levels near the two equilibria (grey), with the separatrix (gold). In units where g/L = 1.' }),
    }),
    num({
      id: 'over-top', difficulty: 2,
      gen(r) {
        const L = r.pick([0.25, 0.5, 2, 4]), w = 2 * Math.sqrt(G / L);
        return {
          prompt: t`A bob on a light rigid rod of length ${L} m hangs on Earth ($g = 9.8$ m/s²). What angular speed at the bottom, in rad/s, just carries it to the top?`,
          answer: w, units: 'rad/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(G / L), feedback: t`That is $\sqrt{g/L}$, the small-oscillation frequency. To climb from $E = -g/L$ … you need $\tfrac12\theta'^2 = 2g/L$: $\theta' = 2\sqrt{g/L}$.` }, { value: 2 * Math.sqrt(G * L), feedback: t`That is the bob’s **speed** in m/s, $L\theta'$. The question asks for the angular speed.` }],
          hints: [t`Energy: $\tfrac12\theta'^2 - \tfrac{g}{L}\cos0 = -\tfrac{g}{L}\cos\pi$.`, t`$\tfrac12\theta'^2 = 2\tfrac{g}{L}$.`],
          teach: 'The separatrix reaches the bottom at θ′ = 2√(g/L): exactly enough kinetic energy to raise the bob by 2L.',
          explain: t`$\theta' = 2\sqrt{9.8/${L}} = ${fmt(w, 4)}$ rad/s, a bob speed of $${fmt(w * L, 3)}$ m/s — the speed $2\sqrt{gL}$ of something falling a height $2L$.`,
          visual: pendPlane({ x: [-3.6, 3.6], values: [0], caption: 'The separatrix (gold) in units where g/L = 1; it peaks at θ′ = 2 at the bottom.' }),
        };
      },
    }),
    mcq({
      id: 'swing-or-whirl', difficulty: 2,
      gen(r) {
        const [th, w, kind] = r.pick([[0, 1.8, 0], [0, 2.3, 1], [1.5, 1.6, 1], [2, 0.5, 0], [-1, 1.9, 1], [2.8, 0.2, 0]]);
        const E = (w * w) / 2 - Math.cos(th);
        const choices = ['It swings back and forth', 'It whirls round and round', 'It rises to the top and balances there', 'It cannot be told without solving the equation'];
        const whyAll = {
          0: t`Its energy $E = ${n(r6(E))}$ is above the separatrix level $g/L = 1$, so it never turns back.`,
          1: t`Its energy $E = ${n(r6(E))}$ is below the separatrix level 1, so it cannot reach the top.`,
          2: 'Only a start with E exactly equal to g/L does that — and it then takes forever to arrive.',
          3: 'Energy decides it: compare E with the separatrix level g/L.',
        };
        const why = {}; for (const k of [0, 1, 2, 3]) if (k !== kind) why[k] = whyAll[k];
        return {
          prompt: t`In units where $g/L = 1$, a frictionless pendulum starts at $\theta = ${th}$ rad with $\theta' = ${w}$. What does it do?`,
          choices, answer: kind, why,
          hints: [t`Compute $E = \tfrac12\theta'^2 - \cos\theta$.`, 'The separatrix has E = g/L = 1. Below it: swinging; above it: whirling.'],
          teach: 'One number decides a frictionless pendulum’s fate: its energy, compared with the separatrix level g/L.',
          explain: t`$E = \tfrac12(${w})^2 - \cos(${th}) = ${n(r6(E))}$, ${E < 1 ? 'below 1: inside the separatrix, it swings' : 'above 1: outside the separatrix, it whirls over the top'}.`,
          visual: pendPlane({ x: [-3.6, 3.6], values: [-0.5, 0.5, 2], heads: false, caption: 'Energy levels and the separatrix (gold), in units where g/L = 1.' }),
        };
      },
    }),
    num({
      id: 'period', difficulty: 3,
      gen(r) {
        const d = r.pick([60, 120, 150]), L = r.pick([0.5, 1, 2]);
        const T0 = 2 * Math.PI * Math.sqrt(L / G), T = T0 / agm(1, Math.cos((d * Math.PI) / 360));
        return {
          prompt: t`A ${L} m pendulum (light rigid rod, $g = 9.8$ m/s²) is released from rest at ${d}°. Its exact period is $T = \dfrac{2\pi\sqrt{L/g}}{\operatorname{AGM}(1, \cos\tfrac{\theta_0}{2})}$, where the AGM repeatedly replaces $(a, b)$ by $\left(\tfrac{a + b}{2}, \sqrt{ab}\right)$. Find $T$.`,
          answer: T, units: 's', tol: { rel: 0.003 },
          errors: [{ value: T0, feedback: t`That is the small-angle period. At ${d}° the swing is far from small: divide by the AGM.` }, { value: T0 / agm(1, Math.cos((d * Math.PI) / 180)), feedback: t`The AGM takes $\cos(\theta_0/2)$, half the release angle.` }].filter((e) => Math.abs(e.value - T) > 0.01 * T),
          hints: [t`$\cos(${d / 2}^\circ) = ${fmt(Math.cos((d * Math.PI) / 360), 5)}$; start the AGM from $(1, ${fmt(Math.cos((d * Math.PI) / 360), 5)})$. Three or four steps are plenty.`, t`$\operatorname{AGM} = ${fmt(agm(1, Math.cos((d * Math.PI) / 360)), 5)}$ and $2\pi\sqrt{L/g} = ${fmt(T0, 4)}$ s.`],
          teach: 'The exact pendulum period is the small-angle period divided by AGM(1, cos(θ₀/2)) — Gauss’s fast route to the elliptic integral.',
          explain: t`$T = ${fmt(T0, 4)}/${fmt(agm(1, Math.cos((d * Math.PI) / 360)), 5)} = ${fmt(T, 4)}$ s, ${fmt(100 * (T / T0 - 1), 3)}% longer than the small-angle period.`,
          visual: pendPlane({ x: [-3.6, 3.6], values: [r6(-Math.cos((d * Math.PI) / 180))], sep: true, caption: 'The orbit of this swing (grey) inside the separatrix (gold), in units where g/L = 1. The closer the orbit runs to the saddles, the longer it takes.' }),
        };
      },
    }),
    {
      type: 'point', id: 'to-the-top', difficulty: 2,
      prompt: t`In units where $g/L = 1$, the pendulum starts hanging straight down ($\theta = 0$) with some angular velocity. Drag the start point up the $\theta'$ axis until its trajectory runs **exactly** to the inverted position — neither falling back nor going over.`,
      visual: { type: 'de-plane', params: { fx: 'y', fy: '-sin(x)', x: [-1, 4], y: [-0.5, 3], equal: false, aspect: 'wide', xlabel: 'θ (rad)', ylabel: 'θ′', start: [0, 1], T: 40, readout: false, click: false, grid: 20, curves: [{ param: ['0', 't'], t: [-1, 4], color: 'ink3', width: 1.2, dash: true }], points: [{ x: r6(Math.PI), y: 0, label: 'upside down', color: 'warn', labelDx: -30, labelDy: -14 }] }, caption: 'The bold curve is the trajectory from the start point (forward in time). Keep the point on the dashed θ′ axis.' },
      answer: { x: 0, y: 2 }, tol: { x: 0.1, y: 0.06 },
      instruction: 'Drag the start point along the dashed line, then check.',
      hints: ['Below the right speed the trajectory turns back; above it, it runs off past θ = π.', t`Energy: $\tfrac12\theta'^2 - 1 = -\cos\pi = 1$.`],
      teach: 'The start that just reaches the top lies on the separatrix: θ′ = 2√(g/L) at the bottom.',
      explain: t`$\tfrac12\theta'^2 = 2$ gives $\theta' = 2$. On the separatrix the pendulum approaches the inverted position ever more slowly and never quite arrives — that saddle takes infinite time to reach.`,
    },
    mcq({
      id: 'cylinder', difficulty: 2,
      prompt: t`A whirling pendulum’s trajectory runs off the right edge of the phase plane, with $\theta$ growing without bound. Is its motion periodic?`,
      choices: [
        t`Yes: $\theta$ and $\theta + 2\pi$ are the same position, so on a cylinder (the plane rolled up) its trajectory is a closed loop`,
        'No: θ grows forever, so the motion never repeats',
        'Only if it is exactly on the separatrix',
        'Only with friction',
      ],
      answer: 0,
      why: {
        1: t`The number $\theta$ grows, but the pendulum’s position does not: after $\theta$ gains $2\pi$, the state $(\theta, \theta')$ is physically what it was, and the motion repeats.`,
        2: 'On the separatrix the motion takes infinite time — the one case that never repeats.',
        3: 'Friction destroys periodicity: the whirling slows, then swinging dies away.',
      },
      hints: [t`Is a pendulum at $\theta = 2\pi$ in a different place from one at $\theta = 0$?`, 'Roll the strip −π ≤ θ ≤ π into a tube, gluing θ = −π to θ = π.'],
      teach: 'The pendulum’s true phase space is a cylinder: θ is an angle, so whirling trajectories close round the cylinder and are periodic.',
      explain: t`Each time $\theta$ gains $2\pi$ the pendulum is back where it was, at the same speed: the motion is periodic, with period equal to the time for one full turn. On the cylinder, swinging orbits are loops that do not go round it; whirling ones go round it.`,
      visual: pendPlane({ seeds: [{ x: -6.5, y: 2.3, dir: 'forward', color: 'accent2', T: 30 }], values: [], T: 30, caption: 'A whirling trajectory (blue) above the separatrices (gold), in units where g/L = 1: the same wave repeats every 2π in θ.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gravity-gradient', difficulty: 3, transfer: true,
      gen(r) {
        const [name, P] = r.pick([['a 92.7-minute low Earth orbit', 92.7], ['a 100-minute orbit', 100], ['a 12-hour GPS orbit', 720]]);
        const Tl = P / Math.sqrt(3);
        return {
          prompt: t`A long, thin satellite in a circular orbit is held pointing at Earth by the gravity gradient. Its pitch angle $\theta$ from the local vertical obeys $\theta'' + \tfrac32 n^2\sin2\theta = 0$, where $n = 2\pi/P$ is the orbital angular velocity — a pendulum equation in $2\theta$. For ${name}, what is the period of small pitch oscillations, in minutes?`,
          answer: Tl, units: 'min', tol: { rel: 0.005 },
          errors: [{ value: P, feedback: t`Linearize: $\sin 2\theta \approx 2\theta$, so $\theta'' + 3n^2\theta = 0$ and the frequency is $\sqrt3\,n$, not $n$.` }, { value: P / Math.sqrt(1.5), feedback: t`Keep the factor 2 from $\sin2\theta \approx 2\theta$: $\tfrac32n^2\cdot2 = 3n^2$.` }],
          hints: [t`For small $\theta$, $\sin2\theta \approx 2\theta$.`, t`$\theta'' + 3n^2\theta = 0$: frequency $\sqrt3\,n$, period $P/\sqrt3$.`],
          teach: 'Linearizing at a centre of a pendulum-like equation gives the small-oscillation frequency: here √3 times the orbital rate.',
          explain: t`$\omega = \sqrt3\,n$, so the libration period is $P/\sqrt3 = ${fmt(Tl, 4)}$ min. The equilibria $\theta = 0$ and $\pi$ (long axis along the vertical, either end down) are centres; $\theta = \pm\pi/2$ (lying along the orbit) are saddles — the separatrix between rocking and tumbling. (A dumbbell model in a circular orbit; real satellites add damping to stop the rocking.)`,
          visual: plane('y', '-1.5*sin(2*x)', { x: [-3.6, 3.6], y: [-2.2, 2.2], equal: false, xlabel: 'θ (rad)', ylabel: 'θ′ (in n)', levels: { fn: 'y^2/2 - 0.75*cos(2*x)', values: [-0.6, -0.3, 0.2, 1.2], highlight: [0.75] }, equilibria: true, caption: 'Pitch phase plane in units of the orbital rate n: centres at θ = 0, ±π, saddles at ±π/2, separatrix in gold.' }),
        };
      },
    }),
    num({
      id: 'cp-bottom-speed', difficulty: 2,
      gen(r) {
        const L = r.pick([0.5, 1, 1.5]), d = r.pick([30, 60, 120]);
        const w = Math.sqrt(2 * (G / L) * (1 - Math.cos((d * Math.PI) / 180)));
        const small = Math.sqrt(G / L) * ((d * Math.PI) / 180);
        return {
          prompt: t`A ${L} m pendulum (rigid light rod, $g = 9.8$ m/s²) is released from rest at ${d}°. What is its angular speed as it passes the bottom, in rad/s?`,
          answer: w, units: 'rad/s', tol: { rel: 0.005 },
          errors: [{ value: small, feedback: t`That is the small-angle answer $\sqrt{g/L}\,\theta_0$. Use energy, which is exact: $\tfrac12\theta'^2 = \tfrac{g}{L}(1 - \cos\theta_0)$.` }].filter((e) => Math.abs(e.value - w) > 0.005 * w),
          hints: [t`$E$ at release: $-\tfrac{g}{L}\cos\theta_0$. At the bottom: $\tfrac12\theta'^2 - \tfrac{g}{L}$.`, t`$\theta' = \sqrt{2\tfrac{g}{L}(1 - \cos\theta_0)}$.`],
          teach: 'The energy level of the release point fixes the speed everywhere on the orbit — no need to solve the equation.',
          explain: t`$\theta' = \sqrt{2\times${n(r6(G / L))}\times(1 - \cos${d}^\circ)} = ${fmt(w, 4)}$ rad/s.`,
          visual: pendPlane({ x: [-3.6, 3.6], values: [r6(-Math.cos((d * Math.PI) / 180))], caption: 'The orbit of this swing (grey) in units where g/L = 1; its highest point is at θ = 0.' }),
        };
      },
    }),
    mcq({
      id: 'cp-damped', difficulty: 2,
      prompt: t`A pendulum with a little friction is set whirling fast. What happens in the long run?`,
      choices: ['It whirls a few times, then swings with shrinking amplitude and ends hanging straight down', 'It ends balanced upside down, where the friction has brought it to rest', 'It whirls forever, ever more slowly', 'It ends back at its starting angle'],
      answer: 0,
      why: {
        1: 'The upside-down equilibrium is a saddle: only an exact, one-in-infinity start ends there. Generic trajectories avoid it.',
        2: 'Friction removes energy steadily; once E drops below the separatrix level g/L the pendulum can no longer get over the top.',
        3: 'It ends at a hanging position, but after some whole number of turns — not necessarily the angle it started from.',
      },
      hints: ['What does friction do to the energy E?', 'Once E < g/L, the pendulum is trapped inside one eye of the separatrix.'],
      teach: 'With friction the centres become stable spirals and every trajectory but a few ends hanging down; the saddles divide the plane into basins by number of turns.',
      explain: t`Energy drains away; the state crosses the separatrix into one of the eyes, then spirals into its centre $(2\pi k, 0)$. Which $k$ depends sensitively on the start — the basins are thin bands that wind between the saddles.`,
      visual: pendPlane({ fy: '-sin(x) - 0.15*y', levels: false, seeds: [{ x: -6.5, y: 3, dir: 'forward', color: 'accent2', T: 60 }], caption: 'A damped pendulum (b = 0.15) started whirling, in units where g/L = 1.' }),
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §8.3 Applications of nonlinear systems (the pendulum)', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'Wikipedia: Pendulum (mechanics) — the exact period and the arithmetic–geometric mean', url: 'https://en.wikipedia.org/wiki/Pendulum_(mechanics)' },
  ],
});
