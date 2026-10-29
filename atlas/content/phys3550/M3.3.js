// The brachistochrone (Taylor §6.2, Example 6.2): the wire down which a bead
// slides from A to B fastest. T[y] = ∫√(1 + y′²)/√(2gy) dx has no x in it,
// so Beltrami's first integral gives y(1 + y′²) = 2a — a cycloid, with time
// θ_B√(a/g). Explore: the cm2-race sim, beads on a line, a circular arc, the
// cycloid, a steep power curve and a drop, all timed by numerical
// integration. Practice: line time (checked by the integrand), the cycloid
// to the bottom (π√(a/g)), why the cycloid wins (speed early, length
// later), Bernoulli's optical analogy sin α / v = const, the tautochrone.
// Transfer: a launch-pad escape slide.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import * as V from '../../src/viz/model/cm2-var.js';
import { sci, r6, gpic, seg, lab, distinct, G } from './_cm.js';

const t = String.raw;

// the worked example: B 1.5 m across, 1 m down
const EX = (() => {
  const x1 = 1.5, y1 = 1;
  const { a, th1 } = V.cycloidThrough(x1, y1);
  return { x1, y1, a, th1, Tc: V.cycloidTime(x1, y1), Tl: V.lineTime(x1, y1), Ta: V.timeOf('arc', x1, y1), Td: V.dropTime(x1, y1) };
})();

// a cycloid from A = (0, 0) to B = (x1, −y1) as a graph curve (height up), with optional line
function cycloidPic({ x1, y1, line = true, cycloid = true, caption, labels = ['A', 'B'], unit = 'm', extra = {} }) {
  const { a, th1 } = V.cycloidThrough(x1, y1);
  const deep = cycloid ? Math.max(y1, a * (1 - Math.cos(Math.min(th1, Math.PI)))) : y1;
  return gpic({
    x: [-0.08 * x1, 1.12 * x1], y: [-1.15 * deep, 0.2 * deep], equal: true, xlabel: `x (${unit})`, ylabel: `height (${unit})`,
    curves: [
      ...(line ? [seg([0, 0], [x1, -y1], 'ink3', 1.6)] : []),
      ...(cycloid ? [{ param: [`${r6(a)}*(t - sin(t))`, `-${r6(a)}*(1 - cos(t))`], t: [0, r6(th1)], color: 'accent', width: 2.6 }] : []),
    ],
    points: [{ x: 0, y: 0, color: 'ink', label: labels[0], labelDx: -14, labelDy: -8 }, { x: x1, y: -y1, color: 'ink', label: labels[1], labelDx: 8, labelDy: 10 }],
    ...extra,
  }, caption, 'A start point A and an end point B lower down, with candidate paths');
}

const race = (params, caption) => ({ type: 'cm2-race', params: { play: false, times: false, ...params }, caption });

export default lesson({
  id: 'phys3550.M3.3',
  title: 'The brachistochrone',
  minutes: 18, difficulty: 3,
  intro: t`In 1696 Johann Bernoulli challenged Europe's mathematicians: along which wire does a bead, starting from rest at A, slide to a lower point B in the **least time**? Not the straight line — the shortest path is not the fastest. Measuring $y$ **downward** from A, energy conservation gives the speed $v = \sqrt{2gy}$, and the time is the functional below. Its integrand has no $x$, so Beltrami's identity from [M3.2](#/lesson/phys3550.M3.2) gives a first integral at once, $y\,(1 + y'^2) = 2a$, whose solution is a **cycloid** — the curve traced by a point on the rim of a rolling wheel.`,
  equation: t`T[y] = \int_0^{x_B}\frac{\sqrt{1 + y'^2}}{\sqrt{2gy}}\,dx \quad\Longrightarrow\quad x = a(\theta - \sin\theta),\ \ y = a(1 - \cos\theta)`,
  symbols: [
    { tex: 'T[y]', text: 'the travel time along the wire $y(x)$, in s' },
    { tex: 'y', text: 'the depth below the start A, in m (measured downward, so $y \\ge 0$)' },
    { tex: 'g', text: 'the gravitational acceleration, 9.8 m/s²' },
    { tex: '\\sqrt{2gy}', text: 'the bead’s speed at depth $y$, from $\\tfrac12mv^2 = mgy$ (frictionless, from rest)' },
    { tex: "\\sqrt{1 + y'^2}\\,dx", text: 'the length $ds$ of a short piece of wire' },
    { tex: 'a', text: 'the radius of the rolling circle that generates the cycloid, in m; the cycloid’s greatest depth is $2a$' },
    { tex: '\\theta', text: 'the angle the circle has rolled through (rad); A is $\\theta = 0$' },
  ],
  why: t`The brachistochrone launched the calculus of variations; its method — write the quantity as a functional, find the first integral — is how every conserved quantity in Lagrangian mechanics, and in a black hole's orbit equations, is found.`,
  visual: {
    type: 'cm2-race',
    title: 'The race',
    lead: t`Five frictionless beads leave A together from rest. Press **Play**. Finishing times appear as each bead arrives; the readouts give all of them.`,
    tasks: [
      t`The cycloid (blue) wins every time. Move B and run it again — it still wins.`,
      t`The drop (gold) plunges straight down and is fast at the bottom, yet loses: its path is long. The straight line is the shortest path, yet loses: it builds speed slowly.`,
      t`Make B wide and shallow ($x_B = 3$ m, $y_B = 0.5$ m): the cycloid dips **below** B and climbs back up, and still wins.`,
    ],
    params: { curves: ['line', 'arc', 'cycloid', 'power', 'drop'], sliders: ['x1', 'y1', 'p'], x1: 1.5, y1: 1 },
    caption: t`Frictionless point beads from rest, $g = 9.8$ m/s². Times from $\int ds/\sqrt{2gy}$, computed numerically. The drop turns its corner without losing speed — an idealization no real wire achieves. Motion slowed four times for viewing.`,
  },
  example: {
    prompt: t`B lies $${EX.x1}$ m across and $${EX.y1}$ m below A. Find the brachistochrone and the time along it, and compare with the straight wire.`,
    visual: cycloidPic({ x1: EX.x1, y1: EX.y1, caption: t`The cycloid from A to B (blue) and the straight wire (grey), to scale.` }),
    steps: [
      { label: 'First integral', text: t`$f = \sqrt{1 + y'^2}/\sqrt{2gy}$ has no $x$, so $f - y'\,\partial f/\partial y'$ is constant. Simplified (as in M3.2) it is $\dfrac{1}{\sqrt{2gy}\,\sqrt{1 + y'^2}}$, so $y\,(1 + y'^2) = \text{const} \equiv 2a$.` },
      { label: 'Cycloid', text: t`Try $y = a(1 - \cos\theta)$, $x = a(\theta - \sin\theta)$. Then $y' = \dfrac{dy/d\theta}{dx/d\theta} = \dfrac{\sin\theta}{1 - \cos\theta}$, so $1 + y'^2 = \dfrac{2}{1 - \cos\theta}$ and $y(1 + y'^2) = 2a$. ✓` },
      { label: 'Fit B', text: t`Divide $x_B$ by $y_B$: $\dfrac{\theta_B - \sin\theta_B}{1 - \cos\theta_B} = ${EX.x1 / EX.y1}$. Solve numerically (bisection): $\theta_B = ${sci(EX.th1, 4)}$ rad, then $a = y_B/(1 - \cos\theta_B) = ${sci(EX.a, 4)}$ m.` },
      { label: 'Time', text: t`Along the cycloid $ds = 2a\sin\tfrac\theta2\,d\theta$ and $v = \sqrt{2ga(1 - \cos\theta)} = 2\sqrt{ga}\,\sin\tfrac\theta2$, so $dt = \sqrt{a/g}\,d\theta$ — uniform in $\theta$! Hence $T = \theta_B\sqrt{a/g} = ${sci(EX.th1, 4)}\sqrt{${sci(EX.a, 4)}/9.8} = ${sci(EX.Tc, 3)}$ s.` },
      { label: 'Straight wire', text: t`Constant acceleration $g\,y_B/L$ along length $L = \sqrt{x_B^2 + y_B^2}$: $T = \sqrt{2L^2/(g\,y_B)} = ${sci(EX.Tl, 3)}$ s.` },
      { label: 'Sense check', text: t`The cycloid is $${sci((1 - EX.Tc / EX.Tl) * 100, 2)}\%$ faster. The circular arc (${sci(EX.Ta, 3)} s) and the drop (${sci(EX.Td, 3)} s) lie in between — the race above agrees. Since $\theta_B < \pi$, the path never dips below B.` },
    ],
    answer: t`A cycloid with $a = ${sci(EX.a, 3)}$ m and $\theta_B = ${sci(EX.th1, 3)}$ rad, taking $${sci(EX.Tc, 3)}$ s against $${sci(EX.Tl, 3)}$ s for the straight wire.`,
  },
  practice: [
    num({
      id: 'line-time', difficulty: 2,
      gen(r) {
        const x1 = r.pick([1, 1.5, 2, 3]), y1 = r.pick([0.5, 1, 1.5]);
        const T = V.lineTime(x1, y1), m = y1 / x1;
        return {
          prompt: t`A straight frictionless wire runs from A to B, $${x1}$ m across and $${y1}$ m below. A bead starts from rest at A. How long does it take to reach B?`,
          answer: T, units: 's', tol: { rel: 0.005 }, integrand: `sqrt(1 + ${r6(m * m)})/sqrt(2*${G}*${r6(m)}*x)`, limits: [0, x1],
          errors: [{ value: Math.sqrt((2 * y1) / G), feedback: t`That is free fall through ${y1} m. Along a slope the acceleration is only $g\sin\phi$ and the path is longer.` }, { value: Math.hypot(x1, y1) / Math.sqrt(2 * G * y1), feedback: t`That uses the final speed for the whole trip. The bead starts from rest: its average speed is half the final speed.` }],
          hints: [t`Along the slope the acceleration is $g\,y_B/L$, with $L = \sqrt{x_B^2 + y_B^2}$; the bead starts from rest.`, t`$L = \tfrac12(gy_B/L)T^2$, so $T = \sqrt{2L^2/(gy_B)}$.`],
          teach: t`A straight wire gives constant acceleration $g\,y_B/L$ — or put $y = mx$ into $T[y]$ and integrate.`,
          explain: t`$L = ${sci(Math.hypot(x1, y1), 4)}$ m and $T = \sqrt{2L^2/(gy_B)} = ${sci(T, 3)}$ s. The functional gives the same: $\int_0^{${x1}}\frac{\sqrt{1 + m^2}}{\sqrt{2gmx}}\,dx$ with $m = ${sci(m, 3)}$.`,
          visual: race({ curves: ['line'], x1, y1 }, t`The straight wire from A to B, to scale.`),
        };
      },
    }),
    num({
      id: 'to-bottom', difficulty: 2,
      gen(r) {
        const y1 = r.pick([0.4, 0.8, 1.2, 1.6]);
        const a = y1 / 2, T = Math.PI * Math.sqrt(a / G);
        return {
          prompt: t`B is the lowest point of a cycloid from A: $${y1}$ m below A and $\pi\times${sci(a, 2)}$ m $= ${sci(Math.PI * a, 3)}$ m across, so that $\theta_B = \pi$. How long does a bead take from rest at A to B along the cycloid?`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: [{ value: Math.PI * Math.sqrt(y1 / G), feedback: t`The rolling circle's radius is $a = y_B/2$ — the cycloid's greatest depth is $2a$.` }, { value: V.lineTime(Math.PI * a, y1), feedback: t`That is the straight wire's time. Along the cycloid, $dt = \sqrt{a/g}\,d\theta$.` }, { value: Math.sqrt((2 * y1) / G), feedback: t`That is free fall straight down; the bead must also travel ${sci(Math.PI * a, 3)} m sideways.` }],
          hints: [t`At the bottom $\theta = \pi$ and $y = 2a$, so $a = ${sci(a, 3)}$ m.`, t`$T = \theta_B\sqrt{a/g} = \pi\sqrt{a/g}$.`],
          teach: t`On a cycloid time ticks uniformly with the rolling angle: $T = \theta_B\sqrt{a/g}$.`,
          explain: t`$a = ${sci(a, 3)}$ m and $T = \pi\sqrt{${sci(a, 3)}/9.8} = ${sci(T, 3)}$ s, against $${sci(V.lineTime(Math.PI * a, y1), 3)}$ s on the straight wire.`,
          visual: cycloidPic({ x1: r6(Math.PI * a), y1, caption: t`The cycloid to its lowest point (blue) and the straight wire (grey), to scale.` }),
        };
      },
    }),
    mcq({
      id: 'why-wins', difficulty: 2,
      prompt: t`Why does the cycloid beat both the straight line (the shortest path) and the drop (the steepest start)?`,
      visual: race({ curves: ['line', 'cycloid', 'drop'], at: 0.35, x1: 1.5, y1: 1 }, t`The beads 0.35 s after release. Frictionless, to scale.`),
      choices: [
        t`It trades: steep enough at the start to build speed early, but not so long that the extra distance eats the gain`,
        t`It is the shortest path that starts vertically`,
        t`Its bead never slows down, while the others do`,
        t`It keeps the bead's acceleration constant all the way`,
      ],
      answer: 0,
      why: {
        1: t`The cycloid is not short — the straight line is shorter, and loses. Length is only half of what the time integral counts.`,
        2: t`On none of these wires does the bead slow down before B (unless the cycloid dips below B, when it does slow while climbing back up — and still wins).`,
        3: t`The cycloid's tangential acceleration $g\cos\alpha$ falls from $g$ to zero as the wire levels out. Constant acceleration is the straight line, which loses.`,
      },
      hints: [t`Time is $\int ds/v$. Which factor does the line neglect, and which does the drop neglect?`],
      teach: t`Least time balances two costs: path length and slow speed near the start, where $v = \sqrt{2gy}$ is small.`,
      explain: t`The integrand $ds/v$ punishes slow travel, and the bead is slow only near A. The cycloid spends its steepness there, buying speed early, then flattens to save length. The line wastes time creeping at the start; the drop wastes it on extra distance.`,
    }),
    mcq({
      id: 'snell-bead', difficulty: 3,
      prompt: t`Bernoulli's own solution treated the bead like light. Let $\alpha$ be the angle between the wire and the **vertical**. What does the first integral $\dfrac{1}{\sqrt{2gy}\,\sqrt{1 + y'^2}} = \text{const}$ say?`,
      visual: cycloidPic({ x1: 1.5, y1: 1, line: false, caption: t`The cycloid: it starts vertical ($\alpha = 0$) and levels out ($\alpha = 90^\circ$) where the bead is fastest.`, extra: { arrows: [{ from: [0.62, -0.62], to: [0.62, -0.95], color: 'ink3', width: 1.4, label: 'vertical', labelDx: 6, labelDy: 6 }] } }),
      choices: [
        t`$\sin\alpha / v$ is the same at every point — Snell's law, with the bead's speed playing the speed of light`,
        t`$\cos\alpha / v$ is the same at every point`,
        t`$v\sin\alpha$ is the same at every point — the horizontal velocity is conserved`,
        t`$\alpha$ is the same at every point — the wire is straight`,
      ],
      answer: 0,
      why: {
        1: t`$1/\sqrt{1 + y'^2} = dx/ds$ is the sine of the angle from the **vertical** (the cosine of the angle from the horizontal).`,
        2: t`The horizontal velocity $v\sin\alpha$ would be conserved only with no horizontal force; the wire pushes sideways.`,
        3: t`A constant angle would be a straight line; the first integral says the angle must change as $v$ does.`,
      },
      hints: [t`$\sqrt{1 + y'^2}\,dx = ds$, so $1/\sqrt{1 + y'^2} = dx/ds$. Which trigonometric function of the angle from the vertical is that?`, t`And $\sqrt{2gy}$ is the speed $v$.`],
      teach: t`Least-time paths obey Snell's law: $\sin\alpha/v$ stays constant, whether the traveller is a light ray or a bead.`,
      explain: t`$dx/ds = \sin\alpha$ and $\sqrt{2gy} = v$, so $\sin\alpha/v = \text{const}$: exactly Snell's law for a medium whose "speed of light" grows with depth like $\sqrt{y}$. Bernoulli sliced the fall into thin layers and refracted through them — [M3.4](#/lesson/phys3550.M3.4) derives Snell's law the same way.`,
    }),
    expr({
      id: 'cycloid-slope', difficulty: 2,
      prompt: t`A point on the rim of a circle of radius $a$, rolling along the underside of a ceiling, traces $x = a(\theta - \sin\theta)$, $y = a(1 - \cos\theta)$, with $y$ measured downward. Find the slope $dy/dx$ as a function of $\theta$.`,
      answer: 'sin(theta)/(1 - cos(theta))', answerTeX: t`\frac{\sin\theta}{1 - \cos\theta}`, lhs: 'dy/dx', vars: { theta: [0.3, 3] }, keys: [['θ', 'theta']],
      errors: [{ answer: '(1 - cos(theta))/sin(theta)', feedback: t`Upside down: $dy/dx = (dy/d\theta)/(dx/d\theta)$.` }, { answer: 'sin(theta)', feedback: t`That is $dy/d\theta$ divided by $a$. Divide by $dx/d\theta = a(1 - \cos\theta)$ as well.` }],
      hints: [t`$dy/d\theta = a\sin\theta$ and $dx/d\theta = a(1 - \cos\theta)$.`, t`$dy/dx = \dfrac{dy/d\theta}{dx/d\theta}$; the $a$ cancels.`],
      teach: t`For a parametric curve, $dy/dx = (dy/d\theta)/(dx/d\theta)$.`,
      explain: t`$dy/dx = \dfrac{\sin\theta}{1 - \cos\theta} = \cot\tfrac\theta2$: infinite at $\theta = 0$ (the wire starts vertical) and zero at $\theta = \pi$ (level at the bottom). Then $1 + y'^2 = 2/(1 - \cos\theta)$ and $y(1 + y'^2) = 2a$, the brachistochrone's first integral.`,
      visual: gpic({
        x: [-0.3, 7], y: [-2.6, 0.5], equal: true, xlabel: 'x / a', ylabel: 'height / a',
        curves: [{ param: ['t - sin(t)', '-(1 - cos(t))'], t: [0, 6.2832], color: 'accent', width: 2.4 }, { param: ['2 + cos(t)', '-1 + sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.4 }, seg([-0.3, 0], [7, 0], 'ink2', 2.4), seg([2, -1], [r6(2 - Math.sin(2)), r6(-(1 - Math.cos(2)))], 'ink3', 1.2)],
        points: [{ x: r6(2 - Math.sin(2)), y: r6(-(1 - Math.cos(2))), color: 'warn', r: 5.5 }, { x: 2, y: -1, color: 'ink3', r: 2.5 }, lab(4.6, 0.25, 'ceiling', 'ink3')],
      }, t`The rolling circle (grey) at $\theta = 2$ rad and the point on its rim (orange) tracing the cycloid (blue). Heights in units of $a$, downward.`, 'A circle rolling under a ceiling, a point on its rim tracing a cycloid'),
    }),
    num({
      id: 'tautochrone', difficulty: 3,
      gen(r) {
        const a = r.pick([0.25, 0.5, 1, 2]), d = r.pick([20, 60, 120, 170]);
        const T = V.tautoTime(a);
        return {
          prompt: t`Turn the cycloid upside down to make a bowl: $x = a(\theta + \sin\theta)$, $y = a(1 - \cos\theta)$ with $y$ up and $a = ${a}$ m. A bead is released from rest at $\theta_0 = ${d}^\circ$ up the side. How long does it take to reach the bottom?`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: [{ value: 2 * Math.PI * Math.sqrt(a / G), feedback: t`That is half a period of oscillation. Reaching the bottom is a quarter period.` }, { value: (Math.PI / 2) * Math.sqrt(a / G), feedback: t`Arc length from the bottom is $s = 4a\sin(\theta/2)$, and $\ddot s = -(g/4a)s$: the angular frequency is $\sqrt{g/4a}$, not $\sqrt{g/a}$.` }],
          hints: [t`Along the bowl, the arc length from the bottom is $s = 4a\sin(\theta/2)$ and the height is $y = s^2/8a$.`, t`So the energy is $\tfrac12m\dot s^2 + mg\,s^2/8a$: simple harmonic in $s$ with $\omega = \sqrt{g/4a}$, **whatever the amplitude**. The bottom is a quarter period away.`],
          teach: t`On a cycloid the restoring force is exactly proportional to arc length, so every release reaches the bottom in the same time: the tautochrone.`,
          explain: t`$\omega = \sqrt{g/4a}$ and the quarter period is $\dfrac{\pi}{2\omega} = \pi\sqrt{a/g} = ${sci(T, 3)}$ s — the same from ${d}° as from any other start. Huygens built pendulum clocks with cycloidal cheeks to exploit this; an ordinary pendulum's period grows with amplitude.`,
          visual: race({ mode: 'tauto', a, starts: [d] }, t`The cycloid bowl and the release point (ring). Frictionless.`),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-escape', difficulty: 3, transfer: true,
      gen(r) {
        const [X, Y] = r.pick([[45, 30], [60, 20], [40, 40], [80, 25]]);
        const Tc = V.cycloidTime(X, Y), Tl = V.lineTime(X, Y);
        return {
          prompt: t`A launch-pad crew-escape chute runs from a service level to a blast bunker $${X}$ m away horizontally and $${Y}$ m lower. Treat the escape car as a frictionless bead starting from rest. How many seconds would a cycloidal chute save over a straight one?`,
          answer: Tl - Tc, units: 's', tol: { rel: 0.01 },
          errors: [{ value: Tc, feedback: t`That is the cycloid's whole travel time; the question asks for the difference from the straight chute.` }, { value: Tl, feedback: t`That is the straight chute's time; subtract the cycloid's.` }],
          hints: [t`Straight: $T = \sqrt{2L^2/(gy_B)}$ with $L = \sqrt{${X}^2 + ${Y}^2}$ m. Cycloid: solve $(\theta - \sin\theta)/(1 - \cos\theta) = ${sci(X / Y, 3)}$ for $\theta_B$.`, t`Then $a = ${Y}/(1 - \cos\theta_B)$ and $T = \theta_B\sqrt{a/g}$. With $\theta_B = ${sci(V.cycloidThrough(X, Y).th1, 4)}$ rad, $a = ${sci(V.cycloidThrough(X, Y).a, 4)}$ m.`],
          teach: t`Fit the cycloid to the end point numerically; then its time is $\theta_B\sqrt{a/g}$.`,
          explain: t`Straight: $${sci(Tl, 3)}$ s. Cycloid ($\theta_B = ${sci(V.cycloidThrough(X, Y).th1, 3)}$ rad, $a = ${sci(V.cycloidThrough(X, Y).a, 3)}$ m): $${sci(Tc, 3)}$ s. Saving: $${sci(Tl - Tc, 3)}$ s. Real chutes have friction and passengers who must not be thrown about, so neither shape is used as is.`,
          visual: cycloidPic({ x1: X, y1: Y, cycloid: false, labels: ['service level', 'bunker'], caption: t`The two ends and the straight chute, to scale.` }),
        };
      },
    }),
    num({
      id: 'cp-dip', difficulty: 3,
      gen(r) {
        const [X, Y] = r.pick([[2, 0.5], [3, 0.8], [2.5, 0.6], [3, 1]]);
        const { a, th1 } = V.cycloidThrough(X, Y);
        return {
          prompt: t`B is $${X}$ m across and only $${Y}$ m below A. The brachistochrone has $\theta_B = ${sci(th1, 4)}$ rad here — more than $\pi$. How deep below A does the bead go before climbing back up to B?`,
          answer: 2 * a, units: 'm', tol: { rel: 0.005 },
          errors: distinct([{ value: Y, feedback: t`Since $\theta_B > \pi$ the path passes its lowest point ($\theta = \pi$) before B: it dips below B.` }, { value: a, feedback: t`The deepest point, $\theta = \pi$, is at $y = a(1 - \cos\pi) = 2a$.` }], 2 * a),
          hints: [t`First find $a$ from $y_B = a(1 - \cos\theta_B)$.`, t`The lowest point is $\theta = \pi$, at depth $2a$.`],
          teach: t`When B is wide and shallow, the fastest path overshoots downward: falling deeper buys speed worth the climb back.`,
          explain: t`$a = ${Y}/(1 - \cos ${sci(th1, 4)}) = ${sci(a, 4)}$ m, so the bead reaches $2a = ${sci(2 * a, 3)}$ m below A — $${sci(2 * a - Y, 2)}$ m below B — before rising to B. The race's third task shows it.`,
          visual: cycloidPic({ x1: X, y1: Y, cycloid: false, caption: t`A and B, with the straight wire for reference. The brachistochrone is not drawn.` }),
        };
      },
    }),
    mcq({
      id: 'cp-moon', difficulty: 2,
      prompt: t`The same race is run on the Moon ($g = 1.62$ m/s²) with beads twice as heavy. What changes?`,
      visual: race({ curves: ['line', 'arc', 'cycloid'], x1: 1.5, y1: 1, at: 0.4 }, t`The race on Earth, 0.4 s after release.`),
      choices: [
        t`Every time grows by $\sqrt{9.8/1.62} \approx 2.5$, but the fastest wire is the same cycloid`,
        t`The fastest wire becomes the straight line, because gravity is too weak to pay for the dip`,
        t`Nothing: neither $g$ nor the mass enters the travel time`,
        t`Heavier beads arrive sooner, so the times shrink`,
      ],
      answer: 0,
      why: {
        1: t`$g$ multiplies the whole functional by $1/\sqrt g$; scaling a functional does not move its minimum. The shape depends only on where B is.`,
        2: t`$g$ sets the speed $\sqrt{2gy}$, so it sets every time — it just does not change which wire wins.`,
        3: t`Mass cancels from $\tfrac12mv^2 = mgy$: Galileo's result. No bead is faster for being heavier.`,
      },
      hints: [t`Where does $g$ appear in $T[y]$, and does it depend on $y(x)$?`],
      teach: t`A constant factor in a functional changes its value, not its extremal.`,
      explain: t`$T[y] = \frac{1}{\sqrt{2g}}\int\frac{\sqrt{1 + y'^2}}{\sqrt y}\,dx$: the shape that minimizes the integral is independent of $g$ and $m$, and every time scales as $1/\sqrt g$.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §6.2: the brachistochrone', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'MacTutor: the brachistochrone problem (Johann Bernoulli, Acta Eruditorum 1696–97)', url: 'https://mathshistory.st-andrews.ac.uk/HistTopics/Brachistochrone/' },
  ],
});
