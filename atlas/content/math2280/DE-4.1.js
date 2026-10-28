// Systems of first-order equations: a state vector and its velocity x′ = Ax,
// any higher-order equation rewritten as a first-order system, trajectories in
// the phase plane (which never cross for an autonomous system), superposition,
// and a two-tank cascade solved one equation at a time.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { M, V, n, r6, sg, lead, portrait } from './_systems.js';

const t = String.raw;

export default lesson({
  id: 'math2280.DE-4.1',
  title: 'Systems of first-order equations',
  minutes: 12, difficulty: 2,
  intro: t`A **system** of differential equations tracks several quantities that change together — two tanks of brine, a position and a velocity, the populations of two species. Collect them in a **state vector** $\mathbf x(t) = (x_1, x_2, \dots)$. Then the whole system is one equation, $\mathbf x' = \mathbf F(\mathbf x, t)$, and when it is linear with constant coefficients it is

$$\mathbf x' = A\mathbf x.$$

Every higher-order equation becomes a system: for $y'' + p\,y' + q\,y = 0$ take $x_1 = y$ and $x_2 = y'$. And every system has a picture: at each point of the **phase plane** the vector $A\mathbf x$ is the velocity of the state there, and each solution is a curve — a **trajectory** — that follows those arrows.`,
  symbols: [
    { tex: '\\mathbf x(t)', text: 'the **state vector**: every quantity needed to predict the future, such as $(x_1, x_2) = (\\text{position}, \\text{velocity})$ in m and m/s' },
    { tex: "\\mathbf x'", text: 'its rate of change, component by component: $(x_1\', x_2\')$ — the velocity of the state in the phase plane' },
    { tex: 'A', text: 'a constant square matrix of coefficients; entry $a_{ij}$ says how strongly $x_j$ drives the rate of $x_i$, in units of 1/time when the components share a unit' },
    { tex: 't', text: 'time, in s (or min in the tank problems)' },
  ],
  why: t`Every numerical solver — RK4, and SciPy’s \`solve_ivp\` — accepts only first-order systems, so this rewriting is the first step of every orbit, trajectory or circuit simulation. The rest of this module solves $\mathbf x' = A\mathbf x$ exactly with eigenvalues.`,
  visual: {
    type: 'de-plane',
    title: 'A spring and damper as a system',
    lead: t`A 1 kg mass on a spring, $x'' + c\,x' + k\,x = 0$, written as the system $x_1' = x_2$, $x_2' = -k\,x_1 - c\,x_2$ with $x_1 = x$ (position) and $x_2 = v$ (velocity). The bold trajectory starts from rest at $x = 2$ m; the lower panel shows the same solution as two functions of time. Press Play.`,
    tasks: [
      t`With $c = 0$ the trajectory is a closed ellipse: the motion repeats forever, and the dot goes round **clockwise** (moving right means $v > 0$, so the top half runs left to right).`,
      t`Raise the damping $c$: the trajectory spirals into the origin — the state “at rest at equilibrium”. Past $c = 2\sqrt{k}$ it stops spiralling and creeps in.`,
      'Click anywhere to add trajectories: however many you add, no two ever cross.',
    ],
    params: {
      fx: 'y', fy: '-k*x - c*y', x: [-3, 3], y: [-4.5, 4.5], xlabel: 'x (m)', ylabel: 'v (m/s)', aspect: 'square',
      sliders: [
        { key: 'k', label: 'Spring constant $k$', min: 0.5, max: 6, step: 0.1, value: 2, unit: '\\mathrm{N/m}', explain: 'With $m = 1$ kg the natural angular frequency is $\\sqrt{k}$ rad/s.' },
        { key: 'c', label: 'Damping $c$', min: 0, max: 4, step: 0.05, value: 0.3, unit: '\\mathrm{kg/s}', explain: 'A drag force $-c\\,v$. It tilts every arrow toward the origin.' },
      ],
      start: [2, 0], play: true, series: true, tmax: 20, seriesNames: ['x(t)', 'v(t)'], seeds: [[0, 3.5], [-2.5, -2]], T: 25,
    },
    caption: 'Linear spring and linear damping, m = 1 kg. Arrows show direction only. Trajectories are traced numerically (RK4), arrowheads forward in time.',
  },
  example: {
    prompt: t`Two tanks hang in a cascade. Tank 1 holds 50 L of brine with 20 kg of salt; tank 2 holds 100 L of pure water. Pure water flows into tank 1 at 10 L/min, the well-mixed brine flows from tank 1 into tank 2 at 10 L/min, and tank 2 drains at 10 L/min, so both volumes stay fixed. Write the system for the salt $x_1(t)$, $x_2(t)$ (in kg), solve it, and find when tank 2 holds the most salt.`,
    visual: {
      type: 'de-plane',
      params: { matrix: [[-0.2, 0], [0.2, -0.1]], x: [-1, 22], y: [-1, 12], equal: false, aspect: 'wide', xlabel: 'x₁ (kg)', ylabel: 'x₂ (kg)', start: [20, 0], series: true, tmax: 40, seriesNames: ['x₁(t)', 'x₂(t)'], readout: false, click: false, grid: 20, points: [{ x: 5, y: 10, label: 'peak of x₂', color: 'gold', labelDx: 8, labelDy: -10 }] },
      caption: 'Top: the state (x₁, x₂) moves from (20, 0) up to the peak and down into the origin. Bottom: the same solution against time, in minutes.',
    },
    steps: [
      { label: 'Rate in minus rate out', text: t`Salt leaves tank 1 at (concentration) × (flow) $= \dfrac{x_1}{50}\cdot10$ kg/min, and enters tank 2 at that same rate. Tank 2 loses $\dfrac{x_2}{100}\cdot10$. So $x_1' = -0.2\,x_1$ and $x_2' = 0.2\,x_1 - 0.1\,x_2$.` },
      { label: 'Matrix form', text: t`$\mathbf x' = A\mathbf x$ with $A = ${M([[-0.2, 0], [0.2, -0.1]])}$ per minute and $\mathbf x(0) = ${V([20, 0])}$. The zero in the top right says tank 1 never feels tank 2 — so the equations can be solved in order.` },
      { label: 'Tank 1', text: t`$x_1' = -0.2\,x_1$ is separable: $x_1 = 20\,e^{-0.2t}$.` },
      { label: 'Tank 2', text: t`Now $x_2' + 0.1\,x_2 = 4\,e^{-0.2t}$, a linear equation (DE-2.2). With the integrating factor $e^{0.1t}$: $(x_2e^{0.1t})' = 4e^{-0.1t}$, so $x_2e^{0.1t} = -40e^{-0.1t} + C$, and $x_2(0) = 0$ gives $C = 40$: $x_2 = 40\,(e^{-0.1t} - e^{-0.2t})$.` },
      { label: 'The peak', text: t`$x_2' = 0$ where $-4e^{-0.1t} + 8e^{-0.2t} = 0$, that is $e^{-0.1t} = \tfrac12$: $t = 10\ln 2 = 6.93$ min. Then $x_2 = 40(\tfrac12 - \tfrac14) = 10$ kg.` },
      { label: 'Sense check', text: t`At the peak $x_1 = 20e^{-\ln 4} = 5$ kg, so salt enters tank 2 at $0.2\times5 = 1$ kg/min and leaves at $0.1\times10 = 1$ kg/min: in balance, as a maximum must be. And $x_1 + x_2$ only ever falls, because the only exit is the drain.` },
    ],
    answer: t`$x_1 = 20e^{-0.2t}$, $x_2 = 40(e^{-0.1t} - e^{-0.2t})$ kg; tank 2 peaks at $t = 10\ln2 \approx 6.93$ min with 10 kg of salt.`,
  },
  practice: [
    mcq({
      id: 'companion', difficulty: 1,
      gen(r) {
        const m = r.pick([2, 4, 5]), kk = r.pick([2, 3, 5, 6]), cc = r.pick([1, 4]);
        const k = kk * m, c = cc * m;
        const A = (a, b) => t`$${M([[0, 1], [a, b]])}$`;
        return {
          prompt: t`A ${m} kg mass on a spring with $k = ${k}$ N/m and a damper with $c = ${c}$ kg/s obeys $${m}\,y'' + ${c}\,y' + ${k}\,y = 0$. With $x_1 = y$ and $x_2 = y'$, the system is $\mathbf x' = A\mathbf x$ with $A =$`,
          choices: [A(-kk, -cc), A(-k, -c), A(kk, cc), A(-cc, -kk)],
          answer: 0,
          why: {
            1: t`Divide by the mass first: $y'' = -\tfrac{k}{m}y - \tfrac{c}{m}y'$. Without that, the matrix describes a 1 kg mass.`,
            2: t`Solving for $y''$ moves both terms across the equals sign, so both change sign: $y'' = -${kk}\,y - ${cc}\,y'$.`,
            3: t`The second row multiplies $(x_1, x_2) = (y, y')$, so the coefficient of $y$ comes first: $x_2' = -${kk}\,x_1 - ${cc}\,x_2$.`,
          },
          hints: [t`The first row is always $x_1' = x_2$, because $x_1' = y' = x_2$.`, t`For the second row solve for $y''$: $y'' = -\tfrac{${k}}{${m}}y - \tfrac{${c}}{${m}}y'$, and write it in terms of $x_1$ and $x_2$.`],
          teach: t`To turn $m y'' + c y' + k y = 0$ into a system, set $x_1 = y$, $x_2 = y'$ and solve for $y''$: the matrix is $\begin{bmatrix} 0 & 1 \\ -k/m & -c/m \end{bmatrix}$.`,
          explain: t`$x_1' = x_2$ and $x_2' = y'' = -${kk}\,x_1 - ${cc}\,x_2$, so $A = ${M([[0, 1], [-kk, -cc]])}$ (in $\text{s}^{-1}$ and $\text{s}^{-2}$).`,
          visual: portrait([[0, 1], [-kk, -cc]], { x: [-2.5, 2.5], y: [-5, 5], equal: false, seeds: [[2, 0], [-2, 0], [0, 4.5]], xlabel: 'x₁ = y', ylabel: 'x₂ = y′', caption: 'The phase portrait of the correct system: every trajectory spirals or creeps into the origin, the mass coming to rest. Arrows show direction only.' }),
        };
      },
    }),
    num({
      id: 'velocity', difficulty: 1,
      gen(r) {
        const A = r.pick([[[1, 2], [3, -1]], [[0, 1], [-4, -1]], [[-2, 1], [1, -2]], [[2, -1], [3, 1]]]);
        const p = r.pick([1, 2, -1]), q = r.pick([1, -2, 2]);
        const v2 = A[1][0] * p + A[1][1] * q, tr2 = A[0][1] * p + A[1][1] * q;
        const errors = [{ value: A[0][0] * p + A[0][1] * q, feedback: t`That is $x_1'$, the first component — the top row of $A$ times $\mathbf x$. The question asks for $x_2'$, the bottom row.` }, { value: tr2, feedback: t`You multiplied by a column of $A$. Each component of $A\mathbf x$ is a **row** of $A$ dotted with $\mathbf x$.` }]
          .filter((e) => e.value !== v2 && e.value !== -v2);
        return {
          prompt: t`For $\mathbf x' = ${M(A)}\,\mathbf x$, the state passes through the point $P = (${p}, ${q})$. What is $x_2'$ there — the vertical component of the state’s velocity?`,
          answer: v2, tol: { rel: 0, abs: 1e-9 },
          errors,
          hints: [t`$\mathbf x' = A\mathbf x$: put $\mathbf x = (${p}, ${q})$ and multiply.`, t`$x_2' = (${A[1][0]})(${p}) + (${A[1][1]})(${q})$.`],
          teach: 'The system’s right-hand side is the velocity of the state: at each point of the phase plane, Ax is the arrow the trajectory follows.',
          explain: t`$A\mathbf x = ${V([A[0][0] * p + A[0][1] * q, v2])}$, so $x_2' = ${v2}$: the trajectory through $P$ is heading ${v2 > 0 ? 'up' : 'down'} the page there, as the arrows near $P$ show.`,
          visual: portrait(A, { x: [-3, 3], y: [-3, 3], seeds: [], points: [{ x: p, y: q, label: 'P', color: 'gold' }], aspect: 'wide', caption: 'Direction arrows of the system (length means nothing). The gold point is P.' }),
        };
      },
    }),
    multi({
      id: 'which-solve', difficulty: 2,
      prompt: t`The equation $y'' + 3y' + 2y = 0$ becomes $\mathbf x' = ${M([[0, 1], [-2, -3]])}\,\mathbf x$ with $\mathbf x = (y, y')$. Which of these vectors are solutions? Select all that are.`,
      choices: [t`$${V(['e^{-t}', '-e^{-t}'])}$`, t`$${V(['e^{-2t}', '-2e^{-2t}'])}$`, t`$${V(['2e^{-t} + e^{-2t}', '-2e^{-t} - 2e^{-2t}'])}$`, t`$${V(['e^{-t}', 'e^{-t}'])}$`, t`$${V(['e^{-t}', '-e^{-2t}'])}$`],
      answer: [0, 1, 2],
      why: {
        3: t`The first row says $x_1' = x_2$: here $x_1' = -e^{-t}$ but $x_2 = e^{-t}$. The second component must be the derivative of the first.`,
        4: t`Again the first row fails: $x_1' = -e^{-t}$, while $x_2 = -e^{-2t}$.`,
      },
      hints: [t`Check both rows: $x_1' = x_2$ and $x_2' = -2x_1 - 3x_2$.`, t`A sum of two solutions of a linear system is a solution, so once the first two pass, check whether the third is $2\times$(first) + (second).`],
      teach: 'A vector function solves x′ = Ax when both rows hold; for a linear homogeneous system, sums and multiples of solutions are solutions again (superposition).',
      explain: t`$(e^{-t}, -e^{-t})$: $x_1' = -e^{-t} = x_2$ ✓ and $x_2' = e^{-t} = -2e^{-t} + 3e^{-t}$ ✓. The second works the same way with $e^{-2t}$, and the third is $2\times$ the first plus the second. These two special solutions move along straight lines through the origin — the eigenvector solutions of the next lesson.`,
      visual: portrait([[0, 1], [-2, -3]], { x: [-3, 3], y: [-4, 4], equal: false, seeds: [[2, -2], [-2, 2], [1.5, -3], [-1.5, 3], [3, -4]], caption: 'Trajectories of the system. Two of them run straight into the origin along lines; every other one curves.' }),
    }),
    num({
      id: 'euler-step', difficulty: 2,
      gen(r) {
        const A = r.pick([[[0, 1], [-4, 0]], [[-1, 2], [-2, -1]], [[1, 1], [4, 1]], [[0, 1], [-2, -3]]]);
        const p = r.pick([1, 2]), q = r.pick([0, 1, -1]), h = 0.1;
        const v = [A[0][0] * p + A[0][1] * q, A[1][0] * p + A[1][1] * q];
        const ans = r6(q + h * v[1]);
        const errors = [{ value: r6(q + v[1]), feedback: t`Multiply the velocity by the step: $\mathbf x_1 = \mathbf x_0 + h\,A\mathbf x_0$ with $h = 0.1$.` }, { value: r6(p + h * v[0]), feedback: t`That is the new $x_1$. The question asks for $x_2$.` }]
          .filter((e) => Math.abs(e.value - ans) > 1e-9 && Math.abs(e.value + ans) > 1e-9);
        return {
          prompt: t`Euler’s method works for systems exactly as for one equation: $\mathbf x_{\text{new}} = \mathbf x + h\,A\mathbf x$. For $\mathbf x' = ${M(A)}\,\mathbf x$ with $\mathbf x(0) = (${p}, ${q})$, take one step of $h = 0.1$. What is the new $x_2$?`,
          answer: ans, tol: { rel: 1e-6, abs: 1e-9 },
          errors,
          hints: [t`First the velocity: $A\mathbf x(0) = ${V(['?', '?'])}$ — multiply each row of $A$ by $(${p}, ${q})$.`, t`$A\mathbf x(0) = ${V(v)}$, so the new state is $(${p}, ${q}) + 0.1\,(${v[0]}, ${v[1]})$.`],
          teach: 'One Euler step moves the state a time h along its current velocity Ax — the arrow at that point.',
          explain: t`$A\mathbf x(0) = (${v[0]}, ${v[1]})$, so $\mathbf x(0.1) \approx (${n(p + h * v[0])}, ${n(ans)})$. The true trajectory curves away from that straight step, which is why Euler needs small steps.`,
          visual: portrait(A, { x: [-3, 3], y: [-3, 3], seeds: [{ x: p, y: q, dir: 'forward', color: 'accent2', T: 2 }], points: [{ x: p, y: q, label: 'x(0)', color: 'gold' }], caption: 'The true trajectory from x(0), traced forward for 2 time units. One Euler step follows the arrow at x(0) in a straight line.' }),
        };
      },
    }),
    mcq({
      id: 'no-crossing', difficulty: 3,
      prompt: t`For a system $\mathbf x' = A\mathbf x$ with constant $A$, one trajectory passes through $P = (1, 1)$ at $t = 0$, and a second solution passes through the same point $P$ at $t = 5$. Must the two trace the same curve in the phase plane?`,
      choices: [
        t`Yes: shifting the second solution back by 5 time units gives a solution through $P$ at $t = 0$, which by uniqueness is the first`,
        'No: they reach P at different times, so they can be different curves that cross there',
        'No: they can cross if A has a negative eigenvalue',
        'Yes, because a solution of a linear system never passes through the same point twice',
      ],
      answer: 0,
      why: {
        1: t`That would be true if $A$ changed with time. For constant $A$, $\mathbf x(t + 5)$ solves the same system, so the time of arrival does not matter.`,
        2: 'Uniqueness has nothing to do with the sign of an eigenvalue: it holds for every constant matrix.',
        3: 'A periodic solution (a centre) passes through the same point again and again; what cannot happen is two different trajectories meeting.',
      },
      hints: [t`If $\mathbf y(t)$ solves $\mathbf x' = A\mathbf x$, does $\mathbf y(t + 5)$?`, t`$\mathbf z(t) = \mathbf y(t + 5)$ has $\mathbf z' = \mathbf y'(t + 5) = A\,\mathbf y(t + 5) = A\mathbf z$, and $\mathbf z(0) = P$.`],
      teach: 'For an autonomous system (no t on the right-hand side) a time-shifted solution is still a solution, so trajectories in the phase plane can never cross or merge.',
      explain: t`$\mathbf z(t) = \mathbf y(t + 5)$ solves the system and starts at $P$, like the first solution; by uniqueness they are the same function, so the second solution is the first one running five units behind. That is why a phase portrait is a tidy family of non-crossing curves. (The graphs of $x_1(t)$ for two solutions can cross — that is a different picture.)`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.5, 2.5], y: [-0.2, 2.2], aspect: 'wide', equal: true, xlabel: 'x₁', ylabel: 'x₂',
          curves: [
            { param: ['1 + 1.2*t', '1 + 0.9*t - 0.5*t^2'], t: [-0.9, 1.1], color: 'accent2', width: 2.4 },
            { param: ['1 + 0.7*t', '1 - 0.8*t + 0.3*t^2'], t: [-1.2, 1.4], color: 'violet', width: 2.4 },
          ],
          points: [{ x: 1, y: 1, label: 'P', color: 'gold', labelDx: -18, labelDy: -10 }],
        },
        caption: 'A sketch of two curves crossing at P. Can two trajectories of one constant-coefficient system look like this?',
      },
    }),
    expr({
      id: 'third-order', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 3, -1]), b = r.pick([-1, 4, 5]), c = r.pick([3, -2, 6]);
        const rhs = t`${lead(-c, 'x_1')}${sg(-b, 'x_2')}${sg(-a, 'x_3')}`;
        return {
          prompt: t`The equation $y'''${sg(a, "y''")}${sg(b, "y'")}${sg(c, 'y')} = 0$ needs three numbers to start: $y$, $y'$ and $y''$. With $x_1 = y$, $x_2 = y'$, $x_3 = y''$, the first two rows of the system are $x_1' = x_2$ and $x_2' = x_3$. Write the third, $x_3'$, in terms of $x_1$, $x_2$, $x_3$.`,
          answer: `(${-c})*x_1 + (${-b})*x_2 + (${-a})*x_3`, answerTeX: rhs, lhs: "x_3'",
          vars: { x_1: [-2, 2], x_2: [-2, 2], x_3: [-2, 2] },
          errors: [{ answer: `(${c})*x_1 + (${b})*x_2 + (${a})*x_3`, feedback: t`Solve for $y'''$: every other term moves across the equals sign and changes sign.` }],
          hints: [t`$x_3' = y'''$. Solve the equation for $y'''$.`, t`$y''' = ${lead(-a, "y''")}${sg(-b, "y'")}${sg(-c, 'y')}$; now replace $y, y', y''$ by $x_1, x_2, x_3$.`],
          teach: 'An nth-order equation becomes n first-order equations: the first n − 1 just say each derivative is the next state variable, and the last is the equation solved for the top derivative.',
          explain: t`$x_3' = y''' = ${rhs}$, so the matrix is $${M([[0, 1, 0], [0, 0, 1], [-c, -b, -a]])}$ — the **companion matrix** of the equation.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 4], y: [-1.2, 1.6], aspect: 'wide', xlabel: 't', ylabel: 'y',
              curves: [{ fn: 'exp(-0.3x)*cos(2x) + 0.3*x*exp(-0.5*x)', color: 'accent', width: 2.4 }],
              tangent: { fn: 'exp(-0.3x)*cos(2x) + 0.3*x*exp(-0.5*x)', at: 1.2 },
            },
            caption: 'A sample solution. At one instant, three numbers fix it: its value y, its slope y′ (the tangent) and its bending y″. Together they are the state (x₁, x₂, x₃).',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cascade', difficulty: 3,
      gen(r) {
        const V1 = r.pick([40, 50, 80]), V2 = r.pick([100, 120, 200]), q = r.pick([5, 8, 10]), x0 = r.pick([10, 15, 20]);
        const r1 = q / V1, r2 = q / V2;
        const ts = Math.log(r1 / r2) / (r1 - r2);
        const K = (r1 * x0) / (r2 - r1), peak = K * (Math.exp(-r1 * ts) - Math.exp(-r2 * ts));
        return {
          prompt: t`A cascade as in the worked example: tank 1 holds ${V1} L of brine with ${x0} kg of salt, tank 2 holds ${V2} L of pure water, and water runs through both at ${q} L/min (pure water into tank 1, tank 1 into tank 2, tank 2 to the drain). At what time does tank 2 hold the most salt?`,
          answer: ts, units: 'min', tol: { rel: 0.005 },
          errors: [{ value: V1 / q, feedback: t`That is tank 1’s time constant $V_1/q$. The peak comes where salt flows into tank 2 as fast as it leaves: $\tfrac{q}{V_1}x_1 = \tfrac{q}{V_2}x_2$.` }, { value: V2 / q, feedback: t`That is tank 2’s time constant. Solve for $x_2(t)$ and set $x_2' = 0$.` }],
          hints: [t`$x_1' = -r_1x_1$ and $x_2' = r_1x_1 - r_2x_2$ with $r_1 = ${q}/${V1}$ and $r_2 = ${q}/${V2}$ per minute.`, t`$x_2 = \dfrac{r_1x_0}{r_2 - r_1}\left(e^{-r_1t} - e^{-r_2t}\right)$; setting $x_2' = 0$ gives $r_1e^{-r_1t} = r_2e^{-r_2t}$, so $t = \dfrac{\ln(r_1/r_2)}{r_1 - r_2}$.`],
          teach: 'A triangular system can be solved one equation at a time: the upstream tank first, then the downstream one as a forced linear equation.',
          explain: t`$r_1 = ${nice(r1)}$, $r_2 = ${nice(r2)}$ per min, so $t = \ln(${nice(r1)}/${nice(r2)})/(${nice(r1)} - ${nice(r2)}) = ${fmt(ts, 3)}$ min, when tank 2 holds ${fmt(peak, 3)} kg.`,
          visual: {
            type: 'de-plane',
            params: { matrix: [[-r6(r1), 0], [r6(r1), -r6(r2)]], x: [-0.05 * x0, 1.08 * x0], y: [-0.05 * x0, r6(1.35 * peak)], equal: false, aspect: 'wide', xlabel: 'x₁ (kg)', ylabel: 'x₂ (kg)', seeds: [{ x: x0, y: 0, dir: 'forward', color: 'accent2', T: 400 }], readout: false, click: false, grid: 20 },
            caption: 'The state (x₁, x₂) from the start: it rises to the peak of x₂, then falls into the origin. The phase plane does not show time — you have to compute it.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-orbit', difficulty: 2, transfer: true,
      prompt: t`A satellite moves under Earth’s gravity, $\mathbf r'' = -GM\,\mathbf r/|\mathbf r|^3$, with $\mathbf r = (x, y, z)$. To hand this to RK4 or \`solve_ivp\` you rewrite it as a first-order system $\mathbf u' = \mathbf F(\mathbf u)$. What is the smallest state vector $\mathbf u$ that works?`,
      choices: [
        t`$(x, y, z, v_x, v_y, v_z)$ — six numbers`,
        t`$(x, y, z)$ — three numbers`,
        t`$(x, y, z, v_x, v_y, v_z, a_x, a_y, a_z)$ — nine numbers`,
        t`$(|\mathbf r|, |\mathbf v|)$ — two numbers`,
      ],
      answer: 0,
      why: {
        1: 'A position alone does not fix the future: a satellite at the same place but moving differently follows a different orbit. A second-order equation needs the velocity in the state too.',
        2: 'The acceleration is not extra information: Newton’s law computes it from the position. Putting it in the state would double-count.',
        3: 'Distance and speed do not say which way the satellite is moving, so they cannot predict where it goes next.',
      },
      hints: ['A second-order equation needs the value and the first derivative of each unknown.', t`Each of $x$, $y$, $z$ obeys a second-order equation, so each brings itself and its velocity.`],
      teach: 'Each second-order equation contributes two first-order ones; the state is every position and every velocity.',
      explain: t`$\mathbf u = (\mathbf r, \mathbf v)$ with $\mathbf r' = \mathbf v$ and $\mathbf v' = -GM\,\mathbf r/|\mathbf r|^3$: six first-order equations. Navigation software calls this the **state vector** of the spacecraft, and it is exactly what tracking stations estimate.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2.6, 3.6], y: [-1.9, 1.9], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ param: ['0.6 + 2.4*cos(t)', '1.6*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.5, dash: true }],
          points: [{ x: 0, y: 0, r: 11, color: 'accent', label: 'Earth', labelDx: -18, labelDy: 22 }, { x: 2.3, y: 1.13, r: 5, color: 'gold' }],
          arrows: [{ from: [0, 0], to: [2.3, 1.13], color: 'gold', width: 2, label: 'r', labelDx: -24, labelDy: 6 }, { from: [2.3, 1.13], to: [1.6, 1.9], color: 'good', width: 2.4, label: 'v', labelDx: 6, labelDy: -2 }],
        },
        caption: 'An orbit (not to scale), with the position r and velocity v of the satellite at one moment.',
      },
    }),
    mcq({
      id: 'cp-direction', difficulty: 2,
      gen(r) {
        const k = r.pick([4, 9]), w = Math.sqrt(k);
        return {
          prompt: t`An undamped spring, $y'' + ${k}y = 0$, as the system $x_1' = x_2$, $x_2' = -${k}x_1$ (with $x_1 = y$ across and $x_2 = y'$ up). Its trajectories are the ellipses shown. Which way does the state go round them?`,
          choices: ['Clockwise', 'Counterclockwise', 'Either way, depending on where it starts', 'It does not go round: it slides along the ellipse to the origin'],
          answer: 0,
          why: {
            1: t`Check one point: at $(1, 0)$ the velocity is $(x_2, -${k}x_1) = (0, -${k})$, straight **down** — and going down from the right-hand end of an ellipse is clockwise.`,
            2: t`Every trajectory of one system turns the same way: the arrows are fixed by $A$, not by the start.`,
            3: t`There is no damping, so no energy is lost: $\tfrac12x_2^2 + \tfrac{${k}}2x_1^2$ stays constant and the state goes round the same ellipse forever.`,
          },
          hints: ['Pick an easy point, such as (1, 0), and compute the velocity there.', t`In the top half $x_2 = y' > 0$, so $x_1 = y$ is increasing: the state moves to the right along the top.`],
          teach: 'With position across and velocity up, motion is always clockwise: above the axis the velocity is positive, so the state moves right.',
          explain: t`At $(1, 0)$ the velocity is $(0, -${k})$: down. Along the top, $x_2 > 0$ pushes $x_1$ to the right. So the state circulates clockwise, with period $2\pi/\sqrt{${k}} \approx ${fmt(2 * Math.PI / w, 3)}$ time units. (Put velocity across and position up and the same motion turns counterclockwise — always check which axis is which.)`,
          visual: {
            type: 'graph',
            params: {
              x: [-2.4, 2.4], y: [-2.4 * w / 1.3, 2.4 * w / 1.3].map(r6), aspect: 'wide', xlabel: 'x₁', ylabel: 'x₂',
              curves: [0.5, 1, 1.5].map((a) => ({ param: [`${a}*cos(t)`, `${r6(a * w)}*sin(t)`], t: [0, 6.2832], color: 'accent2', width: 2 })),
              points: [{ x: 1, y: 0, label: '(1, 0)', color: 'gold', labelDx: 6, labelDy: -10 }],
            },
            caption: 'Trajectories of the undamped spring, drawn without their direction.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §3.1 Introduction to systems of ODEs', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'P. Dawkins, Paul’s Online Notes: Systems of differential equations', url: 'https://tutorial.math.lamar.edu/Classes/DE/SystemsIntro.aspx' },
  ],
});
