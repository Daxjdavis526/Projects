// Picard's theorem — when an initial-value problem has exactly one solution —
// and the ways it fails: many solutions through one point, no solution,
// and solutions that exist only for a while.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

export default lesson({
  id: 'math2280.DE-1.3',
  title: 'Existence and uniqueness (and when they fail)',
  minutes: 11, difficulty: 3,
  intro: t`Before solving an initial-value problem it is worth knowing that it has a solution — and only one. **Picard’s theorem** guarantees both, near the starting point, when the slope rule and its rate of change with $y$ are continuous there:

$$y' = f(t, y),\;\; y(t_0) = y_0, \quad f \text{ and } \frac{\partial f}{\partial y} \text{ continuous near } (t_0, y_0) \;\Longrightarrow\; \text{exactly one solution for } |t - t_0| < h.$$

Uniqueness is why the solution curves of a well-behaved equation never cross or touch, and why a law of physics can predict the future from the present. But the guarantee is **local** — a solution of a perfectly smooth equation can blow up after a finite time — and where $\partial f/\partial y$ is infinite, as at $y = 0$ for $y' = 3y^{2/3}$, determinism genuinely breaks down.`,
  symbols: [
    { tex: t`f(t, y)`, text: 'the slope rule of the equation' },
    { tex: t`\frac{\partial f}{\partial y}`, text: t`how fast the slope changes as $y$ changes at fixed $t$; while it stays bounded, two solutions cannot pull together and merge` },
    { tex: t`(t_0, y_0)`, text: 'the initial point: the solution’s value $y_0$ at the starting time $t_0$' },
    { tex: t`h`, text: 'the half-width of the interval on which the theorem promises a solution — possibly very small; it says nothing beyond it' },
  ],
  why: t`Uniqueness is the mathematical form of determinism — the present state fixes the future — so its failures mark exactly where a model stops describing physics.`,
  visual: {
    type: 'de-slopefield',
    title: 'Infinitely many solutions through one point',
    lead: t`The slope field of $y' = 3y^{2/3}$. The axis $y = 0$ is a solution, and so is $y = t^3$ — and so is every curve that rests on the axis for a while and then leaves it. The gold curve arrives at the axis at time $a$, rests, and leaves at time $c$; all of them pass through $(0, 0)$.`,
    tasks: [
      'Move c: each value gives a different solution through (0, 0). It rests on the axis until t = c, then climbs like (t − c)³.',
      'Move a: solutions can also reach the axis at any earlier time. Infinitely many solutions share the one starting point.',
      'Click above or below the axis: a solution through a point with y ≠ 0 is unique there — the trouble lives only on y = 0.',
    ],
    params: {
      f: '3*cbrt(y)^2', x: [-2, 3], y: [-2.2, 4.2], grid: [21, 16],
      sliders: [
        { key: 'a', label: 'Arrival time $a$', min: -2, max: 0, step: 0.05, value: -1, unit: '', explain: 'Before $a$ the curve is the cubic $(t - a)^3$, which is negative; it reaches the axis at $t = a$.' },
        { key: 'c', label: 'Departure time $c$', min: 0, max: 2.5, step: 0.05, value: 1, unit: '', explain: 'After $c$ the curve is $(t - c)^3$, climbing away from the axis.' },
      ],
      curves: [{ fn: '(t - a)^3*step(a - t) + (t - c)^3*step(t - c)', color: 'gold', width: 2.8 }],
      points: [{ x: 0, y: 0, color: 'ink', label: '(0, 0)', labelDx: 8, labelDy: -12 }],
    },
    caption: t`Segments show the slope only; along $y = 0$ they are flat. Gold: one solution of the family, for the chosen $a$ and $c$. Here $\partial f/\partial y = 2y^{-1/3}$ is infinite at $y = 0$ — the one hypothesis of Picard’s theorem that fails. Curves from your clicks are traced numerically (RK4), which follows a single branch.`,
  },
  example: {
    prompt: t`A bucket draining through a hole in its base obeys Torricelli’s law, $\dfrac{dh}{dt} = -0.3\sqrt{h}$, with the depth $h$ in metres and $t$ in minutes. You find it empty at $t = 0$. Show that for **every** constant $c \le 0$,
$$h(t) = \begin{cases} 0.0225\,(c - t)^2, & t \le c \\ 0, & t \ge c \end{cases}$$
solves the equation with $h(0) = 0$. When did the bucket empty?`,
    visual: {
      type: 'graph',
      params: {
        x: [-8, 1.5], y: [0, 0.6], xlabel: 't (min)', ylabel: 'h (m)',
        curves: [-4, -3, -2, -1].map((c) => ({ fn: `0.0225*(${c} - x)^2*step(${c} - x)`, color: c === -2 ? 'gold' : 'accent2', width: c === -2 ? 2.6 : 1.8, label: `c = ${c === -1 ? '−1' : '−' + -c}`, labelAt: c - 2.9, labelDx: -12, labelDy: -12 })),
        hlines: [{ y: 0.25, label: 'full: 0.25 m', color: 'ink3' }],
        points: [{ x: 0, y: 0, color: 'ink', label: 'found empty', labelDx: -40, labelDy: -16 }],
      },
      caption: t`Four of the infinitely many pasts that end with an empty bucket at $t = 0$. Each drains in the same 3.3 minutes from full; they differ only in when. Torricelli’s law ignores viscosity and the narrowing of the jet.`,
    },
    steps: [
      { label: 'Check the draining piece', text: t`For $t < c$: $\sqrt h = 0.15\,(c - t)$ (positive, since $c > t$), and $h' = -2 \times 0.0225\,(c - t) = -0.045\,(c - t) = -0.3 \times 0.15\,(c - t) = -0.3\sqrt h$ ✓.` },
      { label: 'Check the empty piece', text: t`For $t > c$: $h = 0$, so $h' = 0 = -0.3\sqrt 0$ ✓. At $t = c$ both pieces have value 0 and slope 0, so they join smoothly.` },
      { label: 'Every c fits', text: t`Each $c \le 0$ gives $h(0) = 0$. The observation “empty at $t = 0$” is satisfied by infinitely many histories: the bucket may have emptied at any moment before you looked.` },
      { label: 'Which hypothesis fails', text: t`$f(h) = -0.3\sqrt h$ is continuous at $h = 0$, but $\dfrac{\partial f}{\partial h} = -\dfrac{0.15}{\sqrt h} \to -\infty$ as $h \to 0^+$. Picard’s theorem says nothing at $h = 0$ — and uniqueness really does fail there.` },
      { label: 'Forward is fine', text: t`Forward in time an empty bucket stays empty: $h' = -0.3\sqrt h \le 0$ and the depth cannot go negative, so $h = 0$ is the only solution after $t = 0$. The equation predicts the future but cannot reconstruct the past.` },
      { label: 'Sense check', text: t`Compare exponential decay, $h' = -kh$: it never reaches zero in finite time, so its past is always recoverable. The square root makes the drain finish in finite time — and that is what erases the memory of when it happened.` },
    ],
    answer: t`It cannot be told: every $c \le 0$ gives a valid history, each one emptying at $t = c$. Uniqueness fails backward in time because $\partial f/\partial h$ is unbounded at $h = 0$.`,
  },
  practice: [
    mcq({
      id: 'which-guaranteed', difficulty: 2,
      prompt: t`For which initial-value problem does Picard’s theorem guarantee exactly one solution near the starting point?`,
      choices: [t`$y' = t\sqrt{y}$, $\;y(1) = 4$`, t`$y' = t\sqrt{y}$, $\;y(1) = 0$`, t`$y' = \dfrac{y}{t}$, $\;y(0) = 1$`, t`$y' = y^{1/3}$, $\;y(2) = 0$`],
      answer: 0,
      why: {
        1: t`Here $\partial f/\partial y = \dfrac{t}{2\sqrt y}$ is infinite at $y = 0$: the theorem gives no guarantee at the starting point.`,
        2: t`$f = y/t$ is not even defined at $t = 0$, the starting time.`,
        3: t`$\partial f/\partial y = \tfrac13 y^{-2/3}$ blows up at $y = 0$. (In fact $y = 0$ and $y = \left(\tfrac23(t - 2)\right)^{3/2}$ both work.)`,
      },
      hints: [t`Check two things at the starting point: is $f$ continuous there, and is $\partial f/\partial y$?`, t`For $f = t\sqrt y$: $\dfrac{\partial f}{\partial y} = \dfrac{t}{2\sqrt y}$. Where is that finite?`],
      teach: 'Picard’s theorem needs f and ∂f/∂y continuous in a neighbourhood of the initial point; check both there, not elsewhere.',
      explain: t`At $(1, 4)$: $f = t\sqrt y$ is continuous and $\dfrac{\partial f}{\partial y} = \dfrac{t}{2\sqrt y} = \tfrac14$ is finite and continuous nearby, so exactly one solution exists near $t = 1$ (it is $y = \left(\tfrac{t^2 + 7}{4}\right)^2$). The other three fail a hypothesis at their starting point.`,
      visual: {
        type: 'de-slopefield',
        params: { f: 't*sqrt(max(y, 0))', x: [0, 3], y: [-0.5, 6], grid: [17, 14], points: [{ x: 1, y: 4, color: 'gold', label: '(1, 4)' }, { x: 1, y: 0, color: 'bad', label: '(1, 0)' }] },
        caption: t`The slope field of $y' = t\sqrt y$ (drawn only for $y \ge 0$) with two of the starting points from the choices.`,
      },
    }),
    num({
      id: 'blowup-time', difficulty: 2,
      gen(r) {
        const y0 = r.pick([0.5, 1, 2, 4.5, 8]);
        const T = Math.sqrt(2 / y0);
        return {
          prompt: t`Solve $y' = t\,y^2$ with $y(0) = ${y0}$ and find the time $t > 0$ at which the solution blows up.`,
          answer: T, tol: { rel: 0.005 },
          errors: [{ value: 1 / y0, feedback: t`That is the blow-up time of $y' = y^2$. Here the right side carries a factor $t$: integrate $t\,dt$ to get $t^2/2$.` }, { value: 2 / y0, feedback: t`You found $t^2$, not $t$: take the square root.` }].filter((e) => Math.abs(e.value - T) > 0.02 * T),
          hints: [t`Separate: $y^{-2}\,dy = t\,dt$, so $-\dfrac1y = \dfrac{t^2}{2} + C$.`, t`With $y(0) = ${y0}$, $C = -\dfrac{1}{${y0}}$, so $y = \dfrac{1}{1/${y0} - t^2/2}$. It blows up where the denominator is zero.`],
          teach: 'Picard’s theorem is local: even a smooth equation can have a solution that escapes to infinity in finite time.',
          explain: t`$y = \dfrac{1}{${nice(1 / y0)} - t^2/2}$ blows up when $t^2 = ${nice(2 / y0)}$, at $t = ${fmt(T, 4)}$. The right side $t y^2$ is a polynomial — Picard holds everywhere — yet this solution lives only on $|t| < ${fmt(T, 4)}$.`,
          visual: { type: 'de-slopefield', params: { f: 't*y^2', x: [-0.5, 2.5], y: [-1, Math.max(6, 2 * y0)], grid: [17, 14], points: [{ x: 0, y: y0, color: 'gold', label: `start (0, ${y0})` }] }, caption: t`The slope field of $y' = t y^2$: the slopes grow like $y^2$, so a rising solution steepens faster and faster.` },
        };
      },
    }),
    mcq({
      id: 'crossing', difficulty: 2, kind: 'error',
      prompt: t`A student sketches two solution curves of $y' = f(t, y)$, where $f$ and $\partial f/\partial y$ are continuous everywhere, crossing at a point $P$, as in the picture. What is wrong?`,
      choices: [
        t`They cannot both be solutions: through $P$ the initial-value problem would have two solutions, which Picard’s theorem rules out`,
        'Nothing: solution curves of one equation often cross',
        'They may meet, provided they touch with the same slope instead of crossing',
        'They may cross, provided one of them is an equilibrium',
      ],
      answer: 0,
      why: {
        1: t`Every curve through $P$ must have slope $f(P)$ there, and with $\partial f/\partial y$ continuous only one curve can.`,
        2: t`Touching is still two solutions through one point — exactly what uniqueness forbids. (The touching solutions of $y' = 3y^{2/3}$ exist only because $\partial f/\partial y$ is infinite on the axis.)`,
        3: t`An equilibrium is a solution like any other; nothing can cross or touch it either. That is why equilibria act as barriers.`,
      },
      hints: [t`Treat $P$ as an initial point. How many solutions may pass through it?`],
      teach: 'Uniqueness means solution curves of a well-behaved equation can neither cross nor touch.',
      explain: t`Taking $P$ as the initial point, both curves would solve the same initial-value problem — two solutions where the theorem allows one. The sketch is impossible: for such an equation the solution curves fill the plane without ever meeting.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 4], y: [0, 4], xlabel: 't', ylabel: 'y',
          curves: [{ fn: '0.6 + 0.5*x + 0.15*x^2', color: 'accent', label: 'curve 1', labelAt: 3.3, labelDx: -60 }, { fn: '3.2 - 0.6*x', color: 'warn', label: 'curve 2', labelAt: 0.4 }],
          points: [{ x: (-1.1 + Math.sqrt(1.21 + 1.56)) / 0.3, y: 3.2 - 0.6 * ((-1.1 + Math.sqrt(1.21 + 1.56)) / 0.3), color: 'gold', label: 'P' }],
        },
        caption: 'The student’s sketch: two curves claimed to solve the same equation, crossing at P.',
      },
    }),
    mcq({
      id: 'none-or-many', difficulty: 3,
      prompt: t`Consider $t\,y' = 2y$. How many solutions are there with $y(0) = 1$, and how many with $y(0) = 0$?`,
      choices: ['None with y(0) = 1; infinitely many with y(0) = 0', 'Exactly one in each case', 'One with y(0) = 1; none with y(0) = 0', 'Infinitely many in each case'],
      answer: 0,
      why: {
        1: t`In standard form $y' = 2y/t$, which is undefined at $t = 0$: the theorem promises nothing at the starting time, and here both kinds of failure happen.`,
        2: t`Every solution is $y = Ct^2$, and all of them are 0 at $t = 0$: none can start at 1, and every $C$ starts at 0.`,
        3: t`At $t = 0$ the equation reads $0 \cdot y' = 2y$, which forces $y(0) = 0$: no solution starts at 1.`,
      },
      hints: [t`Solve it for $t \ne 0$: separate $\dfrac{dy}{y} = \dfrac{2\,dt}{t}$.`, t`You get $y = Ct^2$ (and the pieces may use different $C$ on each side of 0). What is every one of these at $t = 0$?`],
      teach: 'When f is not continuous at the initial point, an initial-value problem may have no solution or infinitely many.',
      explain: t`The solutions are $y = Ct^2$ — in fact $y = C_1t^2$ for $t < 0$ and $C_2t^2$ for $t > 0$, any two constants. All of them pass through $(0, 0)$: infinitely many solutions with $y(0) = 0$, and none with $y(0) = 1$. In standard form, $f = 2y/t$ blows up at $t = 0$.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2, 2], y: [-3, 3.5], xlabel: 't', ylabel: 'y',
          curves: [-0.75, -0.25, 0.25, 0.5, 1].map((C) => ({ fn: `${C}*x^2`, color: 'accent2', width: 1.8 })),
          points: [{ x: 0, y: 1, color: 'gold', label: 'y(0) = 1?' }, { x: 0, y: 0, color: 'ink' }],
        },
        caption: t`Solutions $y = Ct^2$ of $t y' = 2y$ for five values of $C$: every one passes through the origin, and none through $(0, 1)$.`,
      },
    }),
    mcq({
      id: 'linear-interval', difficulty: 2,
      prompt: t`For a **linear** equation $y' + p(t)\,y = q(t)$, a solution exists and is unique on the whole interval around $t_0$ on which $p$ and $q$ are continuous. On what interval is the solution of
$$y' + \frac{y}{t - 4} = \ln(t + 2), \qquad y(1) = 2$$
guaranteed to exist?`,
      choices: [t`$-2 < t < 4$`, t`$t < 4$`, t`$t > 4$`, t`$t > -2$`],
      answer: 0,
      why: {
        1: t`$q(t) = \ln(t + 2)$ is defined only for $t > -2$.`,
        2: t`That interval does not contain the starting time $t_0 = 1$.`,
        3: t`$p(t) = \dfrac{1}{t - 4}$ blows up at $t = 4$, which cuts this interval.`,
      },
      hints: [t`Find where $p(t) = \dfrac{1}{t - 4}$ and $q(t) = \ln(t + 2)$ are both continuous.`, t`Of the pieces you get, keep the one that contains $t_0 = 1$.`],
      teach: 'A linear equation has a unique solution on the largest interval around t₀ on which its coefficients are continuous — no surprise blow-ups inside it.',
      explain: t`$p$ is continuous except at $t = 4$ and $q$ only for $t > -2$; the interval containing $t_0 = 1$ is $(-2, 4)$. For a linear equation that is a promise on the whole interval, not just near $t_0$ — unlike $y' = ty^2$, whose blow-up time depends on the starting value.`,
      visual: {
        type: 'graph',
        params: {
          x: [-3, 6], y: [-4, 4], xlabel: 't', ylabel: '',
          curves: [{ fn: '1/(x - 4)', color: 'accent', label: 'p(t) = 1/(t − 4)', labelAt: 4.4, labelDx: 8, labelDy: -6 }, { fn: 'ln(x + 2)', domain: [-1.98, 6], color: 'warn', label: 'q(t) = ln(t + 2)', labelAt: 1.2, labelDy: -14 }],
          points: [{ x: 1, y: 0, color: 'gold', label: 't₀ = 1' }],
        },
        caption: 'The coefficient p and the source q, plotted against t. The starting time is marked on the axis.',
      },
    }),
    mcq({
      id: 'past-future', difficulty: 2,
      prompt: t`A tank draining by Torricelli’s law, $h' = -k\sqrt h$, reads $h = 0$ at noon. Which statement is right?`,
      choices: [
        'Its future is determined — it stays empty — but its past is not: it may have emptied at any time before noon',
        'Its past is determined: run the equation backwards from h = 0',
        'Its future is undetermined: it might start filling up again',
        t`Both are determined, because $-k\sqrt h$ is continuous`,
      ],
      answer: 0,
      why: {
        1: t`Backwards from $h = 0$ every curve $h = \tfrac{k^2}{4}(c - t)^2$ with $c$ before noon arrives at zero by noon: the equation cannot tell them apart.`,
        2: t`$h' = -k\sqrt h \le 0$: the depth can never increase, and at $h = 0$ it cannot go negative.`,
        3: t`Continuity of $f$ guarantees that a solution exists, not that it is unique; uniqueness needs $\partial f/\partial h$ bounded, and $-\dfrac{k}{2\sqrt h}$ is not.`,
      },
      hints: ['Draw several draining curves that each reach h = 0 at different times before noon.', t`Which hypothesis of Picard’s theorem fails at $h = 0$?`],
      teach: 'A non-Lipschitz point can make an equation deterministic in one direction of time and not in the other.',
      explain: t`Forwards, $h = 0$ is the only solution (the depth cannot rise or go negative). Backwards, the curves $h = \tfrac{k^2}{4}(c - t)^2$ for every $c$ before noon all merge into $h = 0$ — merging is allowed because $\partial f/\partial h$ is infinite at 0.`,
      visual: { type: 'de-slopefield', params: { f: '-sqrt(max(y, 0))', x: [0, 6], y: [-0.2, 2.5], grid: [19, 14], xlabel: 't', ylabel: 'h', seeds: [[0, 0.5], [0, 1], [0, 1.6], [0, 2.25]], seedColor: 'accent2' }, caption: t`Draining curves of $h' = -\sqrt h$ started at four depths: each reaches zero in finite time and then runs along the axis, so curves merge there. Units chosen so that $k = 1$.` },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-dome', difficulty: 3, transfer: true,
      prompt: t`**Norton’s dome.** A ball sits at rest on the apex of a frictionless dome shaped so that, measuring the distance $r$ from the apex along the surface (in suitable units), Newton’s second law becomes $r'' = \sqrt r$ with $r(0) = 0$, $r'(0) = 0$. Which statement is right?`,
      choices: [
        t`Infinitely many motions fit: the ball may stay put for ever, or start sliding at any moment $T$ along $r = (t - T)^4/144$, because $\partial\sqrt r/\partial r$ is unbounded at $r = 0$`,
        'The ball stays at the apex for ever, because there is no force on it there',
        'The ball must start sliding at once, because the apex is an unstable equilibrium',
        t`No motion fits at all, because $\sqrt r$ is not differentiable at $r = 0$`,
      ],
      answer: 0,
      why: {
        1: t`$r = 0$ is one solution, but not the only one: check $r = (t - T)^4/144$, which has zero speed and zero force at $t = T$.`,
        2: t`An unstable equilibrium is still an equilibrium: $r = 0$ for all time does solve the equation.`,
        3: t`Existence needs only continuity of $\sqrt r$; it is uniqueness that fails.`,
      },
      hints: ['Write it as a first-order system for the position r and the speed v = r′, and check Picard’s hypotheses at (0, 0).', t`Test the candidate $r = (t - T)^4/144$: compute $r''$ and $\sqrt r$.`],
      teach: 'Where ∂f/∂y is unbounded, even Newton’s second law can fail to fix the motion — a sign that the idealized model has broken down.',
      explain: t`For $r = (t - T)^4/144$: $r'' = \dfrac{12(t - T)^2}{144} = \dfrac{(t - T)^2}{12}$ and $\sqrt r = \dfrac{(t - T)^2}{12}$ ✓, with $r = r' = 0$ at $t = T$. As a system $r' = v$, $v' = \sqrt r$, and $\partial(\sqrt r)/\partial r = \tfrac{1}{2\sqrt r}$ is infinite at $r = 0$. Norton’s dome is a thought experiment, not an observation: its apex has infinite curvature, and most physicists read the result as a breakdown of the idealization rather than of determinism in practice.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2.6, 2.6], y: [-1.6, 0.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ fn: '-(2/3)*abs(x)^1.5', domain: [-2.2, 2.2], color: 'ink2', width: 3 }],
          points: [{ x: 0, y: 0.1, r: 9, color: 'accent', label: 'ball at rest', labelDx: 14, labelDy: -10 }],
        },
        caption: t`A cross-section of the dome: height $-\tfrac23 r^{3/2}$ below the apex (in the dome’s own units). Shape exaggerated; the surface is frictionless.`,
      },
    }),
    num({
      id: 'cp-cube', difficulty: 3,
      gen(r) {
        const a = r.pick([0.25, 0.5, 1, 2]);
        const T = 1 / (2 * a * a);
        return {
          prompt: t`The solution of $y' = y^3$ with $y(0) = ${a}$ exists only on a finite interval to the right of $t = 0$. At what time does it blow up?`,
          answer: T, tol: { rel: 0.005 },
          errors: [{ value: 1 / (a * a), feedback: t`$\int y^{-3}\,dy = -\dfrac{1}{2y^2}$: keep the factor $\tfrac12$.` }, { value: 1 / a, feedback: t`That is the blow-up time of $y' = y^2$. Here the power is 3.` }].filter((e) => Math.abs(e.value - T) > 0.02 * T),
          hints: [t`Separate: $y^{-3}\,dy = dt$, so $-\dfrac{1}{2y^2} = t + C$.`, t`With $y(0) = ${a}$: $\dfrac{1}{2y^2} = \dfrac{1}{2(${a})^2} - t$. The solution blows up when the right side reaches zero.`],
          teach: 'A rate that grows faster than linearly in y can drive a solution to infinity in finite time; find the time by separating.',
          explain: t`$\dfrac{1}{2y^2} = ${nice(1 / (2 * a * a))} - t$, so $y = \dfrac{1}{\sqrt{${nice(1 / (a * a))} - 2t}}$, which blows up at $t = ${nice(T)}$. The bigger the start, the sooner the blow-up.`,
          visual: { type: 'de-slopefield', params: { f: 'y^3', x: [-0.5, Math.max(1.5, 1.6 * T)], y: [-0.2, 3], grid: [17, 14], points: [{ x: 0, y: a, color: 'gold', label: 'start' }] }, caption: t`The slope field of $y' = y^3$; the gold dot is the starting point.` },
        };
      },
    }),
    mcq({
      id: 'cp-interval', difficulty: 2,
      prompt: t`On what interval does the solution of $y' = y^2$ with $y(0) = -2$ exist?`,
      choices: [t`$t > -\tfrac12$`, t`All $t$`, t`$t < \tfrac12$`, t`$t > \tfrac12$`],
      answer: 0,
      why: {
        1: t`The solution $y = \dfrac{-2}{1 + 2t}$ blows up at $t = -\tfrac12$ — in the past.`,
        2: t`Sign slip: $y = \dfrac{1}{1/y_0 - t}$ with $y_0 = -2$ has its pole at $t = -\tfrac12$, not $+\tfrac12$.`,
        3: t`The interval must contain the starting time $t = 0$.`,
      },
      hints: [t`Separate: $-\dfrac1y = t + C$, and $y(0) = -2$ gives $C = \tfrac12$.`, t`So $y = -\dfrac{1}{t + 1/2}$. Where is it undefined, and which side of that point contains $t = 0$?`],
      teach: 'The interval of existence is the largest interval containing t₀ on which the solution stays finite; a blow-up can lie in the past.',
      explain: t`$y = -\dfrac{1}{t + 1/2} = \dfrac{-2}{1 + 2t}$. It is finite for $t > -\tfrac12$ and tends to $0^-$ as $t \to \infty$; backwards in time it plunges to $-\infty$ as $t \to -\tfrac12^+$.`,
      visual: { type: 'de-slopefield', params: { f: 'y^2', x: [-2, 2], y: [-4, 1], grid: [17, 14], points: [{ x: 0, y: -2, color: 'gold', label: '(0, −2)' }] }, caption: t`The slope field of $y' = y^2$. Every slope is positive or zero.` },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §1.2 (existence and uniqueness)', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'W. E. Boyce, R. C. DiPrima and D. B. Meade, Elementary Differential Equations, §2.4 and §2.8', url: 'https://www.wiley.com/en-us/Elementary+Differential+Equations+and+Boundary+Value+Problems%2C+12th+Edition-p-9781119777694' },
    { label: 'J. D. Norton, “The Dome: An Unexpectedly Simple Failure of Determinism”, Philosophy of Science 75 (2008)', url: 'https://sites.pitt.edu/~jdnorton/papers/DomePSA2006.pdf' },
  ],
});
