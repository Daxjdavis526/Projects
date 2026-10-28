// Lagrange multipliers in mechanics. Add λ f(q) to the Lagrangian and treat λ
// as one more coordinate: it has no velocity, so its Euler–Lagrange equation is
// the constraint itself, and λ ∂f/∂q is the constraint force. Worked: the
// pendulum in Cartesian coordinates, T = mg cos θ + mℓθ̇² = mg(3cos θ − 2cos θ₀)
// (3mg at the bottom from horizontal); explore: T(θ)/mg for any release angle,
// negative (a rod pushing; a string would go slack) above 90°… Practice: the
// bottom tension, why λ’s equation is the constraint (the lapse and shift will
// be such variables), an Atwood machine’s tension as λ, the sign of λ, the
// drift of a constraint in a numerical integration and Baumgarte’s fix (code:
// a Cartesian pendulum drifting 0.40 m in 20 s with semi-implicit Euler, 0.018 m
// with α = β = 10). Transfer: a spinning tethered pair, T = μω²ℓ.
// Overlaps: phys3550 M3.5 (constraint forces, the puck leaving a hemisphere,
// isoperimetric problems) and st-e E11.2 (multipliers in variational problems)
// are linked; st-b B14.2 (constraint damping) is the field-theory analogue.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;
const deg = (d) => (d * Math.PI) / 180;

export default lesson({
  id: 'st-g.G6.2',
  title: 'Lagrange multipliers in mechanics',
  minutes: 16, difficulty: 3,
  intro: t`Instead of choosing coordinates that satisfy a constraint $f(q) = 0$ automatically, keep the convenient ones and **add the constraint to the Lagrangian** with an unknown multiplier $\lambda(t)$:

$$\begin{gathered}L' = L(q, \dot q) + \lambda\,f(q) \\ \frac{d}{dt}\frac{\partial L}{\partial\dot q_i} - \frac{\partial L}{\partial q_i} = \lambda\,\frac{\partial f}{\partial q_i}\end{gathered}$$

Treat $\lambda$ as one more coordinate. $L'$ contains no $\dot\lambda$, so $\lambda$’s own Euler–Lagrange equation is simply $f(q) = 0$; and $\lambda\,\partial f/\partial q_i$ is the **force of constraint** — the tension, the normal force — computed, not guessed. The multiplier as a constraint force on a surface is in [constraints and Lagrange multipliers](#/lesson/phys3550.M3.5); this lesson is about multipliers as variables, which is what the lapse and shift of general relativity turn out to be.`,
  symbols: [
    { tex: 'L(q, \\dot q)', text: t`the unconstrained Lagrangian, kinetic minus potential energy, in coordinates that ignore the constraint` },
    { tex: 'f(q)', text: t`the holonomic constraint function; the motion must keep $f = 0$` },
    { tex: '\\lambda(t)', text: t`the Lagrange multiplier: an extra unknown function of time, with no kinetic term` },
    { tex: 'L\'', text: t`the extended Lagrangian $L + \lambda f$, varied with respect to the $q_i$ and $\lambda$ alike` },
    { tex: '\\lambda\\,\\frac{\\partial f}{\\partial q_i}', text: t`the generalized force of constraint: normal to the constraint surface, with size set by $\lambda$` },
  ],
  why: 'In the canonical form of general relativity the lapse and shift multiply the Hamiltonian and momentum constraints exactly as λ multiplies f here — they are Lagrange multipliers, not dynamical fields.',
  visual: {
    type: 'graph',
    title: 'Tension, computed',
    lead: t`A pendulum released from rest at angle $\theta_0$. The multiplier gives the rod’s tension at every angle on the swing, $T/mg = 3\cos\theta - 2\cos\theta_0$ (blue). The dashed line is the value $1$, the tension of a pendulum hanging still.`,
    tasks: [
      t`Release from $90^\circ$: the tension climbs to $3mg$ at the bottom — three times the bob’s weight — and is $0$ at the release points.`,
      t`Release from $150^\circ$: near the ends of the swing $T < 0$. A rod pushes outward there; a string cannot, and would go slack — the constraint would stop holding.`,
      t`Small releases: $T \approx mg$ throughout, which is why the small-angle pendulum ignores it.`,
    ],
    params: {
      x: [-180, 180], y: [-2.5, 5.2], aspect: 'wide', axesAt: 'edge', xlabel: 'angle θ (degrees)', ylabel: 'T / mg',
      sliders: [{ key: 'th0', label: t`Release angle $\theta_0$`, min: 5, max: 175, step: 5, value: 90, unit: '^\\circ', explain: 'The bob starts at rest at this angle from the downward vertical.' }],
      curves: [
        { fn: '3*cos(x*pi/180) - 2*cos(th0*pi/180)', domain: [-180, 180], color: 'accent', width: 2.4, samples: 600 },
      ],
      shade: [{ fn: '3*cos(x*pi/180) - 2*cos(th0*pi/180)', lower: 0, from: '-th0', to: 'th0', color: 'accent', alpha: 0.15 }],
      hlines: [{ y: 1, color: 'ink3', label: 'hanging still' }, { y: 0, color: 'bad' }],
      vlines: [{ x: 'th0', color: 'gold', label: 'θ₀' }, { x: '-th0', color: 'gold' }],
      readouts: [
        { label: t`$T/mg$ at the bottom`, expr: '3 - 2*cos(th0*pi/180)', digits: 3 },
        { label: t`$T/mg$ at the turning points`, expr: 'cos(th0*pi/180)', digits: 3 },
      ],
    },
    caption: t`Exact for a rigid massless rod and a point bob; the swing reaches only $|\theta| \le \theta_0$ (shaded). Outside that range the curve is drawn only for comparison.`,
  },
  example: {
    prompt: t`Find the tension in a pendulum of length $\ell$ and bob mass $m$ using a Lagrange multiplier, without polar coordinates. Evaluate it at the bottom for a release from horizontal.`,
    visual: { type: 'graph', params: { x: [-1.4, 1.4], y: [-1.3, 0.3], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y', curves: [{ param: ['cos(t)', 'sin(t)'], t: [3.1416, 6.2832], color: 'ink3', width: 1.2, dash: true }], arrows: [{ from: [0.643, -0.766], to: [0.643, -1.25], color: 'bad', label: 'mg' }, { from: [0.643, -0.766], to: [0.2, -0.24], color: 'accent', label: 'λ ∇f', labelDx: -40 }, { from: [0, 0], to: [0.643, -0.766], color: 'ink2', width: 1.5 }], points: [{ x: 0.643, y: -0.766, color: 'gold', r: 6, label: 'bob', labelDx: 10, labelDy: 10 }, { x: 0, y: 0, color: 'ink2', r: 3, label: 'pivot' }] }, caption: t`Forces on the bob: gravity, and the constraint force $\lambda\nabla f$ along the rod. Arrows not to scale.` },
    steps: [
      { label: 'Extend the Lagrangian', text: t`With the pivot at the origin: $L = \tfrac12m(\dot x^2 + \dot y^2) - mgy$ and $f = \tfrac12(x^2 + y^2 - \ell^2)$. So $L' = L + \lambda f$.` },
      { label: 'Equations of motion', text: t`$m\ddot x = \lambda x$, $m\ddot y = -mg + \lambda y$, and from varying $\lambda$: $x^2 + y^2 = \ell^2$. The constraint force $\lambda(x, y)$ points along the rod; it is a pull toward the pivot when $\lambda < 0$.` },
      { label: 'Solve for the multiplier', text: t`Differentiate the constraint twice: $\dot x^2 + \dot y^2 + x\ddot x + y\ddot y = 0$. Substitute: $v^2 + \lambda\ell^2/m - gy = 0$, so $\lambda = m(gy - v^2)/\ell^2$.` },
      { label: 'Tension', text: t`$T = |\lambda|\ell = m(v^2/\ell - gy/\ell)$. With $y = -\ell\cos\theta$: $T = mg\cos\theta + mv^2/\ell$ — the weight’s radial part plus the centripetal force, found without drawing a free-body diagram.` },
      { label: 'Numbers', text: t`Energy from horizontal: $v^2 = 2g\ell\cos\theta$, so $T = 3mg\cos\theta$, which at the bottom is $3mg$. A $0.5\ \text{kg}$ bob pulls with $14.7\ \text{N}$.` },
    ],
    answer: t`$\lambda = m(gy - v^2)/\ell^2$, so $T = mg\cos\theta + mv^2/\ell = mg(3\cos\theta - 2\cos\theta_0)$; from horizontal, $T = 3mg$ at the bottom.`,
  },
  practice: [
    num({
      id: 'bottom-tension', difficulty: 2,
      gen(r) {
        const th0 = r.pick([30, 45, 60, 120, 135]);
        const ans = 3 - 2 * Math.cos(deg(th0));
        return {
          prompt: t`A pendulum is released from rest at $\theta_0 = ${th0}^\circ$ from the downward vertical. Using $T = mg(3\cos\theta - 2\cos\theta_0)$, what is the tension at the bottom, in units of the bob’s weight $mg$?`,
          visual: { type: 'graph', params: { x: [-1.4, 1.4], y: [-1.3, 1.2], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [{ param: ['sin(t)', '-cos(t)'], t: [-deg(th0), deg(th0)], color: 'ink3', width: 1.4, dash: true }], arrows: [{ from: [0, 0], to: [Math.sin(deg(th0)), -Math.cos(deg(th0))], color: 'ink2', width: 1.5 }], points: [{ x: Math.sin(deg(th0)), y: -Math.cos(deg(th0)), color: 'gold', r: 6, label: `θ₀ = ${th0}°` }, { x: 0, y: -1, color: 'accent', r: 4, label: 'bottom', labelDx: 8, labelDy: 14 }] }, caption: t`The release point and the arc the bob swings through.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1, feedback: 'That is the tension of a pendulum hanging still. The bob is moving at the bottom and needs a centripetal force too.' }, { value: 3, feedback: t`$3mg$ is the case $\theta_0 = 90^\circ$ only.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`At the bottom $\theta = 0$, so $\cos\theta = 1$.`, t`$T/mg = 3 - 2\cos ${th0}^\circ$.`],
          teach: 'The multiplier gives the constraint force along the whole motion: here weight plus centripetal force, peaking at the bottom.',
          explain: t`$T/mg = 3 - 2\cos ${th0}^\circ = ${nice(ans, 4)}$. Swings past horizontal ($\theta_0 > 90^\circ$) give more than $3mg$ — and need a rod, because near the turning points the required force pushes.`,
        };
      },
    }),
    mcq({
      id: 'lambda-equation', difficulty: 2,
      prompt: t`In $L' = L(q, \dot q) + \lambda f(q)$, why does varying $\lambda$ simply give back $f(q) = 0$?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [0, 3], aspect: 'wide', axesAt: 'edge', xlabel: 'variables in L′', ylabel: 'derivatives present', xticks: 0, yticks: 0, shade: [{ fn: '2.4', lower: 0, from: 0.3, to: 1.2, color: 'accent', alpha: 0.5 }, { fn: '0.15', lower: 0, from: 1.8, to: 2.7, color: 'gold', alpha: 0.8 }], points: [{ x: 0.75, y: 2.65, r: 0, label: 'q: q̇ appears', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 2.25, y: 0.45, r: 0, label: 'λ: no λ̇', labelAlign: 'center', labelDx: 0, labelDy: 0 }] }, caption: t`A schematic: the coordinates carry velocities in $L'$; the multiplier carries none.` },
      choices: [
        t`$L'$ contains no $\dot\lambda$, so $\tfrac{d}{dt}\tfrac{\partial L'}{\partial\dot\lambda} = 0$ and the Euler–Lagrange equation reduces to $\partial L'/\partial\lambda = f = 0$: a constraint, not an evolution equation`,
        t`Because $\lambda$ is a constant`,
        t`Because the constraint is added by hand afterwards`,
        t`Because $\partial L/\partial\lambda$ is the energy, which is conserved`,
      ],
      answer: 0,
      why: {
        1: t`$\lambda$ generally varies in time (the tension changes along the swing); what matters is that its time derivative never appears.`,
        2: t`Nothing is added by hand: the variational principle produces the constraint as $\lambda$’s equation of motion.`,
        3: t`$\partial L'/\partial\lambda = f$, the constraint function, not an energy.`,
      },
      hints: [t`Write the Euler–Lagrange equation for the “coordinate” $\lambda$.`, t`What is $\partial L'/\partial\dot\lambda$?`],
      teach: 'A variable that appears in the Lagrangian without its time derivative has no dynamics: its equation is a constraint, and the variable itself is fixed by the others.',
      explain: t`$\partial L'/\partial\dot\lambda = 0$, so its momentum vanishes identically — a **primary constraint** in Dirac’s language, the subject of [the next lesson](#/lesson/st-g.G6.3). Maxwell’s $A_0$ and general relativity’s lapse and shift are variables of exactly this kind.`,
    }),
    num({
      id: 'atwood', difficulty: 2,
      gen(r) {
        const m1 = r.pick([1, 2, 3]), m2 = r.pick([4, 5, 7]), g = 9.81;
        const ans = (2 * m1 * m2 * g) / (m1 + m2);
        return {
          prompt: t`An Atwood machine: masses $m_1 = ${m1}\ \text{kg}$ and $m_2 = ${m2}\ \text{kg}$ hang over a massless pulley. Take heights $y_1, y_2$ and the constraint $f = y_1 + y_2 - \text{const} = 0$ (a rope of fixed length). With $L' = \sum\tfrac12m_i\dot y_i^2 - \sum m_igy_i + \lambda f$, the equations are $m_i\ddot y_i = -m_ig + \lambda$. What is $\lambda$, the rope tension, in newtons? ($g = 9.81\ \text{m/s}^2$)`,
          visual: { type: 'mech-fbd', params: { scene: 'atwood', m1, m2, show: 'picture', readout: false, quiet: true }, caption: t`The Atwood machine. The multiplier is the force the rope exerts on each mass.` },
          answer: ans, units: 'N', tol: { rel: 0.005 },
          errors: [{ value: m1 * g, feedback: 'That would hold only if nothing accelerated.' }, { value: ((m2 - m1) / (m1 + m2)) * g, feedback: 'That is the acceleration. Put it back into m₁ÿ₁ = −m₁g + λ.' }],
          hints: [t`The constraint gives $\ddot y_1 = -\ddot y_2$. Subtract the two equations divided by their masses.`, t`$\lambda/m_1 + \lambda/m_2 = 2g$, so $\lambda = 2m_1m_2g/(m_1 + m_2)$.`],
          teach: 'With a multiplier, a rope’s tension comes out of the algebra: one multiplier per constraint, one force per multiplier.',
          explain: t`$\lambda = \tfrac{2\times${m1}\times${m2}\times9.81}{${m1 + m2}} = ${nice(ans, 4)}\ \text{N}$, between the two weights $${nice(m1 * g, 3)}$ and $${nice(m2 * g, 3)}\ \text{N}$, as it must be.`,
        };
      },
    }),
    mcq({
      id: 'lambda-sign', difficulty: 3,
      prompt: t`For the Cartesian pendulum, $\lambda = m(gy - v^2)/\ell^2$ with $y$ measured up from the pivot. A bob whirling on a **rod** in a vertical circle passes the top ($y = +\ell$) slowly, with $v^2 < g\ell$. What does the sign of $\lambda$ say there?`,
      visual: { type: 'graph', params: { x: [-1.5, 1.5], y: [-1.3, 1.4], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.2, dash: true }], arrows: [{ from: [0, 0], to: [0, 1], color: 'ink2', width: 1.5 }, { from: [0, 1], to: [0, 1.35], color: 'accent', label: 'λ∇f?' }, { from: [0, 1], to: [0, 0.6], color: 'bad', label: 'mg', labelDx: 8 }], points: [{ x: 0, y: 1, color: 'gold', r: 6 }] }, caption: t`The bob at the top of its circle. $\lambda\nabla f = \lambda(x, y)$ points outward when $\lambda > 0$.` },
      choices: [
        t`$\lambda > 0$: the rod pushes the bob outward, because gravity alone would pull it into a tighter circle than it needs; a string would go slack here`,
        t`$\lambda < 0$: the rod pulls, as it always does`,
        t`$\lambda = 0$: at the top no constraint force acts`,
        t`The sign of a multiplier has no physical meaning`,
      ],
      answer: 0,
      why: {
        1: t`With $y = \ell$ and $v^2 < g\ell$, $gy - v^2 > 0$: positive, a push.`,
        2: t`Only at exactly $v^2 = g\ell$; slower than that, the rod must hold the bob up.`,
        3: t`Its sign is the direction of the constraint force: a pull or a push.`,
      },
      hints: [t`Evaluate $gy - v^2$ at $y = \ell$ with $v^2 < g\ell$.`, t`$\lambda\nabla f = \lambda(x, y)$: outward from the pivot when $\lambda > 0$.`],
      teach: 'The sign of a multiplier is the direction of the constraint force; a one-sided constraint (a string, a surface) holds only while it has the right sign.',
      explain: t`$\lambda = m(g\ell - v^2)/\ell^2 > 0$: compression. The same test, $\lambda$ reaching $0$, tells when a puck leaves a surface ([as in PHYS 3550](#/lesson/phys3550.M3.5)) or a string goes slack.`,
    }),
    mcq({
      id: 'drift', difficulty: 3,
      prompt: t`A simulation integrates the Cartesian pendulum using $\lambda$ from the **twice-differentiated** constraint, $\ddot f = 0$. After a few hundred steps the bob is no longer at distance $\ell$ from the pivot. Why, and what is Baumgarte’s fix?`,
      visual: { type: 'graph', params: { x: [0, 20], y: [-0.05, 0.45], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: '|r| − ℓ (m)', curves: [{ fn: '0.4*x/20 + 0.02*sin(3*x)*x/20', color: 'bad', width: 2, label: 'f̈ = 0 only', labelAt: 14, labelDy: -12 }, { fn: '0.018*(1 - e^(-x))', color: 'good', width: 2.2, label: 'with damping', labelAt: 14, labelDy: 12 }] }, caption: t`Schematic of the drift seen in this lesson’s code exercise (semi-implicit Euler, Δt = 0.01 s, a 1 m pendulum released from 69°).` },
      choices: [
        t`$\ddot f = 0$ allows $f = a + bt$; round-off and truncation seed $a$ and $b$, so $f$ drifts. Imposing $\ddot f + 2\alpha\dot f + \beta^2f = 0$ makes violations decay instead`,
        t`The multiplier was computed wrongly; the exact $\lambda$ never drifts`,
        t`The time step is too large; any small step removes the drift entirely`,
        t`Energy is not conserved, and the constraint follows the energy`,
      ],
      answer: 0,
      why: {
        1: t`The formula for $\lambda$ is exact for the differentiated system; the trouble is that the differentiated system forgets $f$ and $\dot f$ themselves.`,
        2: t`A smaller step slows the drift but does not stop it: nothing pulls a violation back.`,
        3: t`Energy errors and constraint drift are separate; the constraint drifts even with an energy-conserving integrator.`,
      },
      hints: [t`What are the solutions of $\ddot f = 0$?`, t`Replace it by a damped oscillator equation for $f$.`],
      teach: 'Differentiating a constraint to solve for its multiplier makes the constraint marginally stable: numerically it drifts, and constraint damping (Baumgarte) restores it — the mechanical twin of constraint damping in numerical relativity.',
      explain: t`With $\ddot f = -2\alpha\dot f - \beta^2f$, any violation dies away; on an exact solution ($f = \dot f = 0$) the added terms vanish and the physics is unchanged. Numerical relativity adds damping terms to Einstein’s equations for the same reason — see [constraint damping](#/lesson/st-b.B14.2).`,
    }),
    code({
      id: 'baumgarte', difficulty: 3,
      prompt: t`Simulate a $1\ \text{m}$ pendulum in Cartesian coordinates. Write \`accel(x, y, vx, vy, alpha, beta)\` returning the acceleration \`(ax, ay)\`, with $a_x = \lambda x$, $a_y = -g + \lambda y$ (per unit mass) and the multiplier from Baumgarte’s stabilized constraint, $\lambda = \dfrac{gy - v^2 - 2\alpha\dot f - \beta^2 f}{x^2 + y^2}$, where $f = \tfrac12(x^2 + y^2 - \ell^2)$ and $\dot f = x v_x + y v_y$. The program measures the largest drift $\bigl||\mathbf r| - \ell\bigr|$ over $20\ \text{s}$ without ($\alpha = \beta = 0$) and with ($\alpha = \beta = 10$) stabilization.`,
      starter: t`import numpy as np

g, ell = 9.81, 1.0

def accel(x, y, vx, vy, alpha, beta):
    # return (ax, ay)
    pass

def worst_drift(alpha, beta, dt=0.01, T=20.0):
    x, y, vx, vy = ell * np.sin(1.2), -ell * np.cos(1.2), 0.0, 0.0
    worst = 0.0
    for _ in range(int(T / dt)):
        ax, ay = accel(x, y, vx, vy, alpha, beta)
        vx += ax * dt; vy += ay * dt          # semi-implicit Euler
        x += vx * dt; y += vy * dt
        worst = max(worst, abs(np.hypot(x, y) - ell))
    return worst

print("drift without:", round(worst_drift(0, 0), 4), "m")
print("drift with:   ", round(worst_drift(10, 10), 4), "m")
`,
      answer: t`import numpy as np

g, ell = 9.81, 1.0

def accel(x, y, vx, vy, alpha, beta):
    f = 0.5 * (x * x + y * y - ell * ell)
    fdot = x * vx + y * vy
    lam = (g * y - (vx * vx + vy * vy) - 2 * alpha * fdot - beta**2 * f) / (x * x + y * y)
    return lam * x, -g + lam * y

def worst_drift(alpha, beta, dt=0.01, T=20.0):
    x, y, vx, vy = ell * np.sin(1.2), -ell * np.cos(1.2), 0.0, 0.0
    worst = 0.0
    for _ in range(int(T / dt)):
        ax, ay = accel(x, y, vx, vy, alpha, beta)
        vx += ax * dt; vy += ay * dt          # semi-implicit Euler
        x += vx * dt; y += vy * dt
        worst = max(worst, abs(np.hypot(x, y) - ell))
    return worst

print("drift without:", round(worst_drift(0, 0), 4), "m")
print("drift with:   ", round(worst_drift(10, 10), 4), "m")
`,
      tests: [
        { name: t`at the bottom, moving at $2\ \text{m/s}$, the net acceleration is $v^2/\ell = 4\ \text{m/s}^2$ upward (the rod pulls with $g + v^2/\ell$)`, code: 'abs(accel(0.0, -1.0, 2.0, 0.0, 0, 0)[1] - 4.0) < 1e-9' },
        { name: 'at rest at the side, only gravity acts (λ = 0)', code: 'abs(accel(1.0, 0.0, 0.0, 0.0, 0, 0)[0]) < 1e-12 and abs(accel(1.0, 0.0, 0.0, 0.0, 0, 0)[1] + 9.81) < 1e-12' },
        { name: 'without stabilization the bob drifts by more than 0.2 m', code: 'worst_drift(0, 0) > 0.2' },
        { name: 'stabilization cuts the drift at least tenfold', code: 'worst_drift(10, 10) < worst_drift(0, 0) / 10' },
      ],
      hints: [t`Compute \`f\`, \`fdot\` and \`lam\` from the formulas, then \`return lam * x, -g + lam * y\`.`, t`\`lam = (g*y - (vx*vx + vy*vy) - 2*alpha*fdot - beta**2*f) / (x*x + y*y)\``],
      teach: 'A multiplier found from the differentiated constraint lets the constraint drift numerically; feeding back the violation (Baumgarte) holds it.',
      explain: t`Without stabilization the bob wanders about $0.40\ \text{m}$ off its circle in $20\ \text{s}$; with $\alpha = \beta = 10$ the drift stays near $0.02\ \text{m}$, set by the step size. Choosing $\alpha, \beta$ is a trade: too large and the equations turn stiff — the same trade numerical relativists face with constraint damping.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tether', difficulty: 3, transfer: true,
      gen(r) {
        const m1 = r.pick([100, 250, 500]), m2 = r.pick([50, 100, 200]), ell = r.pick([100, 500, 1000]), P = r.pick([10, 20, 60]);
        const w = (2 * Math.PI) / (P * 60), mu = (m1 * m2) / (m1 + m2), ans = mu * w * w * ell;
        return {
          prompt: t`Two spacecraft of masses $${m1}\ \text{kg}$ and $${m2}\ \text{kg}$, joined by a taut tether of length $\ell = ${ell}\ \text{m}$, spin about their centre of mass once every $${P}$ minutes, far from any other mass. With $L' = \tfrac12m_1|\dot{\mathbf r}_1|^2 + \tfrac12m_2|\dot{\mathbf r}_2|^2 + \lambda\bigl(|\mathbf r_1 - \mathbf r_2| - \ell\bigr)$, the multiplier is the tether tension, $|\lambda| = \mu\omega^2\ell$ with $\mu = m_1m_2/(m_1 + m_2)$. What is it, in newtons?`,
          visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-1, 1], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [{ param: [`${m2 / (m1 + m2)}*1.2*cos(t)`, `${m2 / (m1 + m2)}*1.2*sin(t)`], t: [0, 6.2832], color: 'ink3', width: 1, dash: true }, { param: [`${m1 / (m1 + m2)}*1.2*cos(t)`, `${m1 / (m1 + m2)}*1.2*sin(t)`], t: [0, 6.2832], color: 'ink3', width: 1, dash: true }], arrows: [{ from: [(-m1 / (m1 + m2)) * 1.2, 0], to: [(m2 / (m1 + m2)) * 1.2, 0], color: 'ink2', width: 1.5 }], points: [{ x: (m2 / (m1 + m2)) * 1.2, y: 0, color: 'accent', r: 7, label: `${m1} kg` }, { x: (-m1 / (m1 + m2)) * 1.2, y: 0, color: 'violet', r: 5, label: `${m2} kg`, labelDx: -50 }, { x: 0, y: 0, color: 'gold', r: 3, label: 'centre of mass', labelDy: 14 }] }, caption: t`The spinning pair and the circles each traces about the centre of mass (to scale with each other; tether length not to scale).` },
          answer: ans, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: (m1 + m2) * w * w * ell, feedback: t`Use the reduced mass $\mu = m_1m_2/(m_1 + m_2)$, not the total.` }, { value: mu * w * ell, feedback: t`The centripetal force needs $\omega^2$.` }, { value: mu * (1 / (P * 60)) ** 2 * ell, feedback: t`$\omega = 2\pi/P$ in radians per second, with $P$ in seconds.` }],
          hints: [t`$\omega = 2\pi/(${P}\times60\ \text{s})$ and $\mu = ${m1}\times${m2}/${m1 + m2}$.`, t`$T = \mu\omega^2\ell$.`],
          teach: 'For two bodies joined by a constraint, the multiplier is the internal force: here the tether tension that supplies both centripetal forces.',
          explain: t`$\omega = ${nice(w, 3)}\ \text{s}^{-1}$, $\mu = ${nice(mu, 4)}\ \text{kg}$, so $T = ${nice(ans, 3)}\ \text{N}$ — the same on both ends, each mass circling the centre of mass at its own radius. Spinning tethers are one proposal for artificial gravity.`,
        };
      },
    }),
    mcq({
      id: 'cp-multiplier-role', difficulty: 2,
      prompt: t`In the Hamiltonian form of general relativity the action contains $\displaystyle\int\bigl(\pi^{ij}\dot\gamma_{ij} - N\mathcal H - N^i\mathcal H_i\bigr)\,d^3x\,dt$, where the lapse $N$ and shift $N^i$ appear with no time derivatives. By this lesson’s logic, what does varying $N$ and $N^i$ give?`,
      visual: { type: 'graph', params: { x: [0, 4], y: [0, 3], aspect: 'wide', axesAt: 'edge', xlabel: 'space', ylabel: 'time', xticks: 0, yticks: 0, curves: [0.6, 1.5, 2.4].map((h, i) => ({ fn: `${h} + 0.12*sin(1.4*x + ${i})`, color: 'accent', width: 2 })), arrows: [{ from: [2, 0.6 + 0.12 * Math.sin(2.8)], to: [2.3, 1.5 + 0.12 * Math.sin(3.8)], color: 'gold', label: 'lapse and shift', labelDx: 8 }] }, caption: t`Slices of spacetime; the lapse and shift say how far and how sideways the next slice is laid — a choice, not a dynamical field.` },
      choices: [
        t`The four constraints $\mathcal H = 0$ and $\mathcal H_i = 0$ — exactly as varying $\lambda$ gives $f = 0$`,
        t`Evolution equations for $N$ and $N^i$`,
        t`Nothing; $N$ and $N^i$ must be fixed before varying`,
        t`The values of $N$ and $N^i$ themselves, determined by the data`,
      ],
      answer: 0,
      why: {
        1: t`Without time derivatives in the action they have no evolution equations of their own; they are multipliers.`,
        2: t`They are varied like any other variable; their equations are the constraints.`,
        3: t`Like $\lambda$ for a pendulum’s equations of motion, their values are not fixed by the constraints alone — they are freely chosen (gauge), a difference Dirac’s theory explains.`,
      },
      hints: [t`Which variables in that action have no time derivative?`, t`Compare with $\partial L'/\partial\lambda = f$.`],
      teach: 'Lapse and shift are Lagrange multipliers: varying them gives the Hamiltonian and momentum constraints.',
      explain: t`$\delta S/\delta N = -\mathcal H = 0$ and $\delta S/\delta N^i = -\mathcal H_i = 0$. Unlike the pendulum’s $\lambda$, which the motion fixes, $N$ and $N^i$ stay arbitrary — because these constraints are first class, as [the next lesson](#/lesson/st-g.G6.3) explains.`,
    }),
  ],
  sources: [
    { label: 'Goldstein, Poole & Safko, Classical Mechanics, 3rd ed., §2.4 (Lagrange multipliers and constraint forces)', url: 'https://openlibrary.org/isbn/9780201657029' },
    { label: 'Baumgarte, Stabilization of constraints and integrals of motion in dynamical systems, Comput. Methods Appl. Mech. Eng. 1, 1 (1972)', url: 'https://doi.org/10.1016/0045-7825(72)90018-7' },
    { label: 'Arnowitt, Deser & Misner, The dynamics of general relativity (1962), reprinted as arXiv:gr-qc/0405109', url: 'https://arxiv.org/abs/gr-qc/0405109' },
  ],
});
