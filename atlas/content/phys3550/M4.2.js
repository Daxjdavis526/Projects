// Hamilton's principle (Taylor §7.1, §7.4): of all paths q(t) between two
// configurations at two fixed times, the one a system follows makes the
// action S = ∫(T − U) dt stationary. The Euler–Lagrange equations of S are
// Lagrange's equations, d/dt ∂L/∂q̇ = ∂L/∂q, which for L = ½mẋ² − U(x)
// are Newton's mẍ = −U′. A thrown ball's action, exactly: S₀ = −mg²T³/24 and
// ΔS = mα²n²π²/4T for every wiggle. "Least" is a misnomer: a spring watched
// for more than half a period has a variation that lowers S (cm2-vary, the
// slider item). Bridge: S = −mc²∫dτ, whose small-speed limit is ∫(½mv² −
// mc²) dt — so Hamilton's principle is the low-speed face of maximal aging.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import * as V from '../../src/viz/model/cm2-var.js';
import { sci, r6, gpic, seg, lab, distinct, G } from './_cm.js';

const t = String.raw;
const DEG = Math.PI / 180;

const EX = (() => {
  const m = V.PRESETS.ball.m, T = V.PRESETS.ball.X;
  return { m, T, S0: V.ballS0(m, T), d1: V.ballDS(1, 1, m, T), d2: V.ballDS(2, 1, m, T), Sn: V.F('ball', 1, 0, 0, { N: 4000 }), Sv: V.F('ball', 1, 1, 0, { N: 4000 }) };
})();

const vary = (params, caption) => ({ type: 'cm2-vary', params: { sliders: [], modes: false, readouts: [], ...params }, caption });

export default lesson({
  id: 'phys3550.M4.2',
  title: 'Hamilton’s principle of least action',
  minutes: 18, difficulty: 3,
  intro: t`Newton tells a body what to do at each instant. **Hamilton's principle** looks at a whole motion at once. Fix where a system starts at $t_1$ and where it ends at $t_2$; among every path $q(t)$ joining them, the one it actually takes makes the **action** $S$ stationary — where the **Lagrangian** $L = T - U$ is kinetic minus potential energy. That is a variational problem exactly like [M3.2](#/lesson/phys3550.M3.2)'s, with $x$ renamed $t$ and $y$ renamed $q$, so its Euler–Lagrange equations are the equations of motion: **Lagrange's equations**. They hold in any generalized coordinates ([M4.1](#/lesson/phys3550.M4.1)), with no forces of constraint to find. Despite the name, the action need not be *least*: stationary is what nature asks.`,
  equation: t`S[q] = \int_{t_1}^{t_2} L(q, \dot q, t)\,dt,\quad L = T - U \quad\Longrightarrow\quad \frac{d}{dt}\frac{\partial L}{\partial\dot q} = \frac{\partial L}{\partial q}`,
  symbols: [
    { tex: 'S[q]', text: 'the action of the path $q(t)$, in J·s (energy × time)' },
    { tex: 'L', text: 'the Lagrangian, in J: kinetic minus potential energy, written in terms of the generalized coordinates and their rates' },
    { tex: 'T,\\ U', text: 'the kinetic and potential energies, in J' },
    { tex: 'q,\\ \\dot q', text: 'a generalized coordinate (m or rad) and its rate of change; one equation for each coordinate' },
    { tex: 't_1,\\ t_2', text: 'the fixed start and end times, at which the path’s ends are fixed too' },
    { tex: '\\partial L/\\partial\\dot q', text: 'the **generalized momentum** ($m\\dot x$ for $L = \\tfrac12m\\dot x^2 - U$)' },
    { tex: '\\partial L/\\partial q', text: 'the **generalized force** ($-U\'(x)$ for the same $L$)' },
  ],
  why: t`One principle, $\delta S = 0$, gives Newton's laws, the orbits of M5, quantum mechanics' path integral, the field equations of electromagnetism and — with $S = -mc^2\int d\tau$ — the free fall of general relativity.`,
  visual: {
    type: 'cm2-vary',
    title: 'The action of a thrown ball',
    lead: t`A 0.5 kg ball is thrown up and caught 2 s later. Top: its height against time (blue, the true motion) and wiggled motions with the same start and end (grey, orange). Bottom: the action $S = \int(T - U)\,dt$ of each. The true motion sits where the curve is flat.`,
    tasks: [
      t`Slide $\alpha$: every wiggled motion has **more** action than the true one, by exactly $m\alpha^2n^2\pi^2/4T$ — a parabola.`,
      t`Try $n = 2$ and $n = 3$: faster wiggles cost more action (more kinetic energy), but the curve is still flat at $\alpha = 0$.`,
      t`Set the base offset $\beta = 1$ m: start from a motion that rises too high. Now the curve has a slope at $\alpha = 0$ — that motion breaks $\delta S = 0$, and Newton's law with it.`,
    ],
    params: { preset: 'ball', sliders: ['alpha', 'beta'], readouts: ['F', 'dF', 'slope'] },
    caption: t`$m = 0.5$ kg, $g = 9.8$ m/s², no air resistance. Height against time — a graph of the motion, not its path in space. Actions computed numerically from 300 steps.`,
  },
  example: {
    prompt: t`A ${EX.m} kg ball is thrown straight up and caught at the same height ${EX.T} s later. Find the Lagrangian and its equation of motion, the action of the true motion, and the extra action of the wiggled motion $y + \alpha\sin(\pi t/T)$ with $\alpha = 1$ m.`,
    visual: vary({ preset: 'ball', alpha: 1, ghosts: false, panels: ['path'] }, t`The true motion (blue) and the wiggled one (orange): same start, same end, same times.`),
    steps: [
      { label: 'Lagrangian', text: t`$T = \tfrac12m\dot y^2$ and $U = mgy$, so $L = \tfrac12m\dot y^2 - mgy$.` },
      { label: 'Lagrange', text: t`$\partial L/\partial\dot y = m\dot y$ and $\partial L/\partial y = -mg$, so $\frac{d}{dt}(m\dot y) = -mg$: $\ddot y = -g$. Newton's second law, from a variational principle.` },
      { label: 'True motion', text: t`With $y(0) = y(T) = 0$: $y = \tfrac12gt(T - t)$, $\dot y = \tfrac12g(T - 2t)$.` },
      { label: 'Its action', text: t`$S_0 = \displaystyle\int_0^T\Big[\tfrac18mg^2(T - 2t)^2 - \tfrac12mg^2t(T - t)\Big]dt = mg^2T^3\Big(\tfrac1{24} - \tfrac1{12}\Big) = -\frac{mg^2T^3}{24} = ${sci(EX.S0, 4)}$ J·s. (Negative: $U$ outweighs $T$ on average. Only differences of $S$ matter.)` },
      { label: 'Wiggle', text: t`For $y + \alpha\eta$, the cross terms integrate to zero because $y$ obeys Lagrange's equation; what is left is $\Delta S = \tfrac12m\alpha^2\int\dot\eta^2\,dt = \dfrac{m\alpha^2\pi^2}{4T} = ${sci(EX.d1, 3)}$ J·s for $\alpha = 1$ m.` },
      { label: 'Sense check', text: t`Numerically, from 4000 steps: $S(1) - S(0) = ${sci(EX.Sv - EX.Sn, 4)}$ J·s. ✓ The change is second order in $\alpha$, as stationarity requires; here it is also positive — this action really is least. (Not always: see the spring below.)` },
    ],
    answer: t`$L = \tfrac12m\dot y^2 - mgy$ gives $\ddot y = -g$; $S_0 = -mg^2T^3/24 = ${sci(EX.S0, 3)}$ J·s, and the wiggle adds $m\alpha^2\pi^2/4T = ${sci(EX.d1, 3)}$ J·s.`,
  },
  practice: [
    mcq({
      id: 'which-L', difficulty: 1,
      prompt: t`A mass $m$ moves on a line in a potential $U(x)$. Which Lagrangian gives Newton's law $m\ddot x = -U'(x)$?`,
      visual: { type: 'mech-energy', params: { U: '0.5*x^2 - 0.05*x^4', x: [-3, 3], E: 1, x0: -1, play: false, dragE: false, dragX: false, bars: false, readouts: [] }, caption: t`A potential-energy curve $U(x)$ and a particle in it.` },
      choices: [t`$L = \tfrac12m\dot x^2 - U(x)$`, t`$L = \tfrac12m\dot x^2 + U(x)$`, t`$L = m\dot x^2 - U(x)$`, t`$L = \tfrac12m\dot x^2$`],
      answer: 0,
      why: {
        1: t`$T + U$ is the energy, not the Lagrangian. It gives $m\ddot x = +U'$: balls would roll uphill.`,
        2: t`Without the $\tfrac12$, $\partial L/\partial\dot x = 2m\dot x$ and the equation becomes $2m\ddot x = -U'$: everything accelerates half as fast. $T$ is $\tfrac12m\dot x^2$.`,
        3: t`With no $U$ the particle feels no force: $\ddot x = 0$.`,
      },
      hints: [t`Apply $\frac{d}{dt}\frac{\partial L}{\partial\dot x} = \frac{\partial L}{\partial x}$ to each and compare with $m\ddot x = -U'$.`],
      teach: t`The Lagrangian is kinetic **minus** potential energy.`,
      explain: t`$\partial L/\partial\dot x = m\dot x$ and $\partial L/\partial x = -U'(x)$, so Lagrange's equation is $m\ddot x = -U'(x)$. The minus sign in $T - U$ is what makes forces point downhill.`,
    }),
    expr({
      id: 'spring-L', difficulty: 2,
      prompt: t`A mass $m$ hangs on a vertical spring of stiffness $k$. Measure $x$ **downward** from the spring's natural length. Write the Lagrangian. Type $\dot x$ as $v$.`,
      answer: '(1/2)*m*v^2 - (1/2)*k*x^2 + m*g*x', answerTeX: t`\tfrac12m\dot x^2 - \tfrac12kx^2 + mgx`,
      lhs: 'L', vars: { m: [0.5, 2], k: [5, 50], g: [9, 10], x: [-1, 1], v: [-2, 2] },
      errors: [{ answer: '(1/2)*m*v^2 - (1/2)*k*x^2 - m*g*x', feedback: t`With $x$ measured **down**, falling lowers the gravitational energy: $U_g = -mgx$, so $-U_g = +mgx$.` }, { answer: '(1/2)*m*v^2 + (1/2)*k*x^2 - m*g*x', feedback: t`That is $T + U$, the energy. The Lagrangian is $T - U$.` }],
      hints: [t`$U = \tfrac12kx^2 + U_g$. With $x$ pointing down, what is $U_g$?`, t`$U_g = -mgx$, so $L = T - U = \tfrac12m\dot x^2 - \tfrac12kx^2 + mgx$.`],
      teach: t`Choose the sign of gravitational energy from the coordinate's direction: with $x$ down, $U_g = -mgx$.`,
      explain: t`$L = \tfrac12m\dot x^2 - \tfrac12kx^2 + mgx$. Lagrange's equation: $m\ddot x = -kx + mg$ — the spring pulls up, gravity down, balanced at $x = mg/k$.`,
      visual: gpic({ x: [-1.2, 1.2], y: [-1.6, 0.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg([-0.5, 0.2], [0.5, 0.2], 'ink2', 3), { param: ['0.12*sin(10*pi*t)', '0.2 - 1.05*t'], t: [0, 1], color: 'ink2', width: 1.6 }, seg([0.55, -0.55], [0.55, -1.25], 'ink4', 1, true)], points: [{ x: 0, y: -0.98, color: 'warn', r: 13 }, lab(0.62, -0.5, 'natural length', 'ink3'), lab(0.62, -1.2, 'x ↓', 'ink2')], arrows: [{ from: [0.55, -0.55], to: [0.55, -0.98], color: 'ink2' }] }, t`A mass on a vertical spring; $x$ is measured downward from the spring's natural length.`, 'A mass hanging on a vertical spring'),
    }),
    num({
      id: 'ball-action', difficulty: 2,
      gen(r) {
        const m = r.pick([0.2, 0.5, 1]), T = r.pick([1, 2, 3]);
        const S0 = V.ballS0(m, T);
        return {
          prompt: t`A ${m} kg ball is thrown up and caught at the same height ${T} s later. Using $y = \tfrac12gt(T - t)$ and $g = 9.8$ m/s², evaluate the action $S = \int_0^T\big(\tfrac12m\dot y^2 - mgy\big)\,dt$ of the true motion.`,
          answer: S0, units: 'J s', tol: { rel: 0.005 },
          integrand: `0.5*${m}*(4.9*(${T} - 2x))^2 - ${m}*9.8*4.9*x*(${T} - x)`, limits: [0, T],
          errors: [{ value: (m * G * G * T ** 3) / 24, feedback: t`Sign: the potential-energy integral, $\tfrac1{12}mg^2T^3$, is twice the kinetic one, $\tfrac1{24}mg^2T^3$, and it is subtracted.` }, { value: (m * G * G * T ** 3) / 8, feedback: t`That is $\int(T + U)\,dt$ — the energy, integrated. The action subtracts $U$.` }],
          hints: [t`$\dot y = \tfrac12g(T - 2t)$, so $\int_0^T\tfrac12m\dot y^2\,dt = \tfrac1{24}mg^2T^3$.`, t`$\int_0^T mgy\,dt = \tfrac12mg^2\int_0^T t(T - t)\,dt = \tfrac1{12}mg^2T^3$. Subtract.`],
          teach: t`Evaluate an action like any functional: put the path into $L$ and integrate over time.`,
          explain: t`$S_0 = \tfrac1{24}mg^2T^3 - \tfrac1{12}mg^2T^3 = -\tfrac1{24}mg^2T^3 = ${sci(S0, 4)}$ J·s. Its sign has no meaning on its own (shift $U$ by a constant and $S$ shifts); its stationarity does.`,
          visual: vary({ preset: 'ball', ghosts: false, panels: ['path'] }, t`The shape of the true motion: height against time (drawn for 0.5 kg and 2 s).`),
        };
      },
    }),
    num({
      id: 'wiggle-cost', difficulty: 3,
      gen(r) {
        const n = r.pick([1, 2, 3]), al = r.pick([0.5, 1, 2]), m = 0.5, T = 2;
        const dS = V.ballDS(n, al, m, T);
        return {
          prompt: t`The 0.5 kg ball, thrown up and caught 2 s later, is given the wiggled motion $y(t) + ${al}\sin(${n}\pi t/2)$ (in m). Using $\Delta S = \tfrac12m\alpha^2\int_0^T\dot\eta^2\,dt$, by how much does its action exceed the true one?`,
          answer: dS, units: 'J s', tol: { rel: 0.005 },
          errors: distinct([{ value: dS * 2, feedback: t`$\int_0^T\cos^2(n\pi t/T)\,dt = T/2$, and there is a $\tfrac12$ in front: $\Delta S = m\alpha^2n^2\pi^2/4T$.` }, { value: dS / (n * n), feedback: t`$\dot\eta = (n\pi/T)\cos(n\pi t/T)$: the $n$ is squared in $\dot\eta^2$.` }], dS),
          hints: [t`$\eta = \sin(${n}\pi t/2)$, so $\dot\eta = \tfrac{${n}\pi}{2}\cos(${n}\pi t/2)$.`, t`$\int_0^2\dot\eta^2\,dt = \tfrac{${n * n}\pi^2}{4}\cdot1$; multiply by $\tfrac12m\alpha^2$.`],
          teach: t`Around the true motion of a ball, $\Delta S = \tfrac12m\alpha^2\int\dot\eta^2\,dt$: always positive, and second order in $\alpha$.`,
          explain: t`$\Delta S = \tfrac12(0.5)(${al})^2\cdot\tfrac{${n * n}\pi^2}{4} = ${sci(dS, 3)}$ J·s. Where did the first-order terms go? They are $\int(m\dot y\dot\eta - mg\eta)\,dt$, which vanishes after integrating by parts because $\ddot y = -g$: the true path's defining property.`,
          visual: vary({ preset: 'ball', n, alpha: Math.min(3, al), ghosts: false, panels: ['path'] }, t`The true motion (blue) and the wiggled one (orange), sharing their ends.`),
        };
      },
    }),
    {
      type: 'slider', id: 'not-least', difficulty: 3,
      prompt: t`A 1 kg mass on a spring with a period of 1 s sits at $x = 0$ at $t = 0$ and again at $t = T$; its true motion is to stay put. The bottom panel shows the action of the family $\alpha\sin(\pi t/T)$. Find the duration $T$ at which this variation **stops raising** the action — beyond it, the "least" action principle fails.`,
      visual: { type: 'cm2-vary', params: { preset: 'spring', T: 0.3, alpha: 0.15, n: 1, sliders: ['T'], modes: false, readouts: ['dF'] }, caption: t`Top: position against time for the true motion (blue, at rest) and the family (grey, orange). Bottom: the action against $\alpha$.` },
      param: 'T', answer: [0.48, 0.52],
      instruction: 'Set the duration with the slider, then check.',
      hints: [t`$S(\alpha) = \tfrac14\alpha^2T\big(m(\pi/T)^2 - k\big)$ with $k = 4\pi^2m$. When is the bracket zero?`, t`$(\pi/T)^2 = 4\pi^2$ at $T = 0.5$ s: half a period.`],
      teach: t`The action is a minimum only for short enough times; past half a period of oscillation, some variation lowers it — stationary, not least.`,
      explain: t`$S = \tfrac14\alpha^2T(m\pi^2/T^2 - k)$ changes sign at $T = \pi\sqrt{m/k} = 0.5$ s, half the period. For longer times the true path is a saddle of $S$; at exactly half a period the whole family $\alpha\sin(2\pi t)$ are true motions — the mass can swing out and be back at $x = 0$ — and the action does not change at all along it.`,
    },
    order({
      id: 'to-newton', difficulty: 2,
      prompt: t`Put the steps from Hamilton's principle to Newton's second law in order, for a particle in a potential $U(x)$.`,
      visual: vary({ preset: 'ball', alpha: 1.5, n: 2 }, t`A family of motions with fixed ends (top) and their action (bottom).`),
      items: [
        t`Write $L = \tfrac12m\dot x^2 - U(x)$ and $S = \int L\,dt$.`,
        t`Vary the motion: $x(t) + \alpha\eta(t)$, with $\eta(t_1) = \eta(t_2) = 0$.`,
        t`Integrate the $\dot\eta$ term by parts; the end terms vanish.`,
        t`Demand $dS/d\alpha = 0$ for every $\eta$: $\frac{d}{dt}\frac{\partial L}{\partial\dot x} = \frac{\partial L}{\partial x}$.`,
        t`Evaluate the partial derivatives: $m\ddot x = -U'(x)$.`,
      ],
      hints: [t`It is M3.2's derivation with $x$ renamed $t$.`, t`The Euler–Lagrange equation comes before the specific derivatives.`],
      teach: t`Hamilton's principle plus the Euler–Lagrange machinery gives Lagrange's equations; for one particle they are Newton's law.`,
      explain: t`Variation, integration by parts, fundamental lemma — then $\partial L/\partial\dot x = m\dot x$ and $\partial L/\partial x = -U'$. Nothing new is assumed beyond $\delta S = 0$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pendulum', difficulty: 2,
      gen(r) {
        const L = r.pick([0.5, 1, 2]), th = r.pick([20, 45, 70]);
        const acc = -(G / L) * Math.sin(th * DEG);
        return {
          prompt: t`A pendulum of length ${L} m has $L = \tfrac12m\ell^2\dot\theta^2 + mg\ell\cos\theta$ (with $\ell$ the length, $\theta$ from straight down). From Lagrange's equation, find $\ddot\theta$ at the instant $\theta = ${th}^\circ$.`,
          answer: acc, units: 'rad/s^2', tol: { rel: 0.005 },
          errors: distinct([{ value: -(G / L) * th * DEG, feedback: t`That is the small-angle approximation $\sin\theta \approx \theta$. Lagrange's equation is exact: use $\sin\theta$.` }, { value: -acc, feedback: t`Sign: $\partial L/\partial\theta = -mg\ell\sin\theta$, a restoring torque.` }, { value: -G * L * Math.sin(th * DEG), feedback: t`$\frac{d}{dt}(m\ell^2\dot\theta) = -mg\ell\sin\theta$ gives $\ddot\theta = -(g/\ell)\sin\theta$: divide by $\ell^2$.` }], acc),
          hints: [t`$\partial L/\partial\dot\theta = m\ell^2\dot\theta$ and $\partial L/\partial\theta = -mg\ell\sin\theta$.`, t`$\ddot\theta = -(g/\ell)\sin\theta$.`],
          teach: t`Lagrange's equation in an angle gives the pendulum's exact equation of motion with no tension in sight.`,
          explain: t`$m\ell^2\ddot\theta = -mg\ell\sin\theta$, so $\ddot\theta = -(9.8/${L})\sin${th}^\circ = ${sci(acc, 3)}$ rad/s². The string's tension never appeared: the coordinate $\theta$ obeys the constraint by construction.`,
          visual: gpic({ x: [-1.6, 1.6], y: [-1.5, 0.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg([-0.4, 0], [0.4, 0], 'ink2', 3), seg([0, 0], [r6(Math.sin(th * DEG)), r6(-Math.cos(th * DEG))], 'ink2', 1.6), seg([0, 0], [0, -1.2], 'ink4', 1, true), { param: ['0.4*sin(t)', '-0.4*cos(t)'], t: [0, r6(th * DEG)], color: 'ink3', width: 1.2 }], points: [{ x: r6(Math.sin(th * DEG)), y: r6(-Math.cos(th * DEG)), color: 'warn', r: 8 }, lab(0.48 * Math.sin((th * DEG) / 2) + 0.05, -0.55 * Math.cos((th * DEG) / 2), 'θ', 'ink2')] }, t`The pendulum at $\theta = ${th}^\circ$. Not to scale.`, 'A pendulum displaced by an angle'),
        };
      },
    }),
    mcq({
      id: 'cp-relativistic', difficulty: 3, transfer: true,
      prompt: t`In relativity the action of a free particle is $S = -mc^2\int d\tau = \int\Big(-mc^2\sqrt{1 - v^2/c^2}\Big)\,dt$. Expand the Lagrangian for $v \ll c$. What does Hamilton's principle then say?`,
      visual: { type: 'worldlines', params: { T: 10, tx: 2, tt: 5 }, caption: t`Two worldlines between the same events ($c = 1$); ticks mark each clock's proper time.` },
      choices: [
        t`$L \approx -mc^2 + \tfrac12mv^2$: the constant drops out of the equations, leaving Newton's free particle — and since $S = -mc^2\tau$, stationary action means stationary (in fact maximal) proper time`,
        t`$L \approx mc^2 - \tfrac12mv^2$: the free particle accelerates`,
        t`$L \approx \tfrac12mv^2$ exactly, so relativity changes nothing`,
        t`The minus sign means the action is maximal, so the particle takes the path of least proper time`,
      ],
      answer: 0,
      why: {
        1: t`$\sqrt{1 - v^2/c^2} \approx 1 - \tfrac12v^2/c^2$, and with the $-mc^2$ in front the kinetic term comes out **positive**.`,
        2: t`The expansion has a constant $-mc^2$ (harmless) and corrections of order $v^4/c^2$ that matter at high speed.`,
        3: t`$S = -mc^2\tau$: making $\tau$ as large as possible makes $S$ as small as possible. The free worldline maximizes proper time — the twin who stays home ages most.`,
      },
      hints: [t`$\sqrt{1 - x} \approx 1 - x/2$ for small $x$.`, t`An additive constant in $L$ changes $S$ by a constant and leaves Lagrange's equations untouched.`],
      teach: t`Newton's action is the low-speed limit of $-mc^2\int d\tau$: least action becomes maximal proper time.`,
      explain: t`$L = -mc^2\sqrt{1 - v^2/c^2} \approx -mc^2 + \tfrac12mv^2 + \ldots$, so for slow motion Hamilton's principle with $L = T$ is recovered. Exactly, $\delta S = 0$ is $\delta\tau = 0$: free particles follow worldlines of stationary proper time. With gravity included this is general relativity's geodesic principle — see [maximal aging](#/lesson/gr.S12.i), [the geodesic equation from the action](#/lesson/gr.S12.d), [the twin paradox](#/lesson/phys3710.R1.3), and in this course [M12.1](#/lesson/phys3550.M12.1).`,
    }),
    mcq({
      id: 'cp-saddle', difficulty: 3,
      prompt: t`The spring of the slider problem is watched for $T = 0.8$ s, longer than half its 1 s period. The picture shows the action of the true motion's family along the first mode $\eta_1 = \sin(\pi t/T)$. What does it show?`,
      visual: vary({ preset: 'spring', T: 0.8, n: 1, alpha: 0.15 }, t`Top: motions with fixed ends over 0.8 s. Bottom: their action against $\alpha$, for $\eta_1$.`),
      choices: [
        t`The true motion is still stationary, but along $\eta_1$ it is a **maximum**; along faster wiggles it is a minimum — a saddle. Nature follows it anyway`,
        t`The true motion is no longer the motion the spring follows, because a path with less action exists`,
        t`The true motion is a maximum of the action in every direction`,
        t`The calculation must be wrong: Hamilton's principle says the action is least`,
      ],
      answer: 0,
      why: {
        1: t`Lagrange's equations need only $\delta S = 0$; the second variation's sign plays no part. The spring really does stay at rest.`,
        2: t`Wiggles with $n\pi/T > 2\pi$ (here $n \ge 2$) still raise the action. Only the slowest one lowers it.`,
        3: t`"Least action" is a historical name. The principle that is true — and that gives the equations of motion — is stationary action.`,
      },
      hints: [t`The curve is flat at $\alpha = 0$: what does a flat point that curves downward mean? Would $n = 2$ curve the same way?`, t`$S(\alpha) = \tfrac14\alpha^2T(m(n\pi/T)^2 - k)$: negative for $n = 1$, positive for $n = 2$ when $T = 0.8$ s.`],
      teach: t`The action is stationary on the true path; whether it is a minimum, maximum or saddle depends on how long you watch.`,
      explain: t`For $T = 0.8$ s, $m(\pi/T)^2 - k < 0$ but $m(2\pi/T)^2 - k > 0$: a saddle. Stationarity is all that Lagrange's equations use. (In general relativity the analogous statement for proper time is cleaner: a timelike geodesic is a local **maximum** of $\tau$ until it meets a conjugate point.)`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §7.1 and §7.4: Hamilton’s principle', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'Feynman Lectures on Physics, Vol. II, ch. 19: The principle of least action', url: 'https://www.feynmanlectures.caltech.edu/II_19.html' },
    { label: 'C. G. Gray and E. F. Taylor, When action is not least, Am. J. Phys. 75, 434 (2007)', url: 'https://doi.org/10.1119/1.2710480' },
  ],
});
