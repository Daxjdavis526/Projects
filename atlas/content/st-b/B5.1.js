// Harmonic functions and the mean-value property: ∇²u = 0 means the value at
// any point is the average over every circle (sphere) around it. From that:
// the maximum principle (no interior extremes), smoothness, the five-point
// stencil and relaxation, and the symmetry trick for the square's centre.
import { lesson, mcq, multi, num, order, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';

const t = String.raw;

// the Explore picture: a choice of functions, a movable circle, its centre value and its average
const FUNS = [
  { label: t`$x^2 - y^2$`, f: (x, y) => `((${x})^2 - (${y})^2)` },
  { label: t`$e^{0.6x}\cos 0.6y$`, f: (x, y) => `(e^(0.6*(${x}))*cos(0.6*(${y})))` },
  { label: t`$\ln\big((x - 4.5)^2 + (y - 1)^2\big)$`, f: (x, y) => `(ln(((${x}) - 4.5)^2 + ((${y}) - 1)^2))` },
  { label: t`$x^2 + y^2$ (not harmonic)`, f: (x, y) => `((${x})^2 + (${y})^2)` },
];
const pickF = (x, y) => FUNS.map((F, i) => `step(0.5 - abs(k - ${i}))*${F.f(x, y)}`).join(' + ');
const NAV = 24;
const circleAvg = `(${Array.from({ length: NAV }, (_, j) => pickF(`cx + R*cos(${((2 * Math.PI * j) / NAV).toFixed(12)})`, `cy + R*sin(${((2 * Math.PI * j) / NAV).toFixed(12)})`)).join(' + ')})/${NAV}`;

// a harmonic polynomial a(x² − y²) + bxy + cx + d as an expression
const harmPoly = (a, b, c, d) => `(${a})*(x^2 - y^2) + (${b})*x*y + (${c})*x + ${d}`;
const circle = (cx, cy, R, color = 'gold') => ({ param: [`${cx} + ${R}*cos(t)`, `${cy} + ${R}*sin(t)`], t: [0, 6.2832], color, width: 2.4 });
// Jacobi on the 21 × 21 square with the top edge at 1: log₁₀ of the largest change per sweep, every 16 sweeps
const JAC = (() => {
  const n = 21; let u = Array.from({ length: n }, (_, i) => new Float64Array(n).fill(i === 0 ? 1 : 0));
  const out = [];
  for (let s = 1; s <= 2000; s++) {
    const v = u.map((row) => Float64Array.from(row)); let ch = 0;
    for (let i = 1; i < n - 1; i++) for (let j = 1; j < n - 1; j++) { v[i][j] = 0.25 * (u[i + 1][j] + u[i - 1][j] + u[i][j + 1] + u[i][j - 1]); ch = Math.max(ch, Math.abs(v[i][j] - u[i][j])); }
    u = v;
    if (s % 16 === 1 || ch < 1e-6) out.push({ x: s, y: Math.log10(ch), color: 'accent', r: 2.5 });
    if (ch < 1e-6) return { sweeps: s, pts: out };
  }
  return { sweeps: NaN, pts: out };
})();
const MOON = { GM: 4.9028e12, d: 3.844e8 };     // m³/s² (JPL DE440: 4902.800 km³/s²); mean distance (m)

export default lesson({
  id: 'st-b.B5.1',
  title: 'Harmonic functions and the mean-value property',
  minutes: 14, difficulty: 3,
  intro: t`Run the heat equation until nothing changes any more and $u_t = 0$ leaves **Laplace’s equation**, $\nabla^2u = u_{xx} + u_{yy} = 0$ (add $u_{zz}$ in three dimensions). Its solutions are called **harmonic functions**: steady temperatures, the gravitational or electric potential in empty space, the velocity potential of smooth airflow. They have one property from which almost everything else follows:

$$u(\mathbf{x}_0) = \frac{1}{2\pi r}\oint_{|\mathbf{x} - \mathbf{x}_0| = r} u\,ds$$

— **the value at any point is the average of the values on any circle around it** (on any sphere, in 3D), as long as the circle stays inside the region where $\nabla^2u = 0$. So a harmonic function can have no hilltop or valley floor inside its region: the **maximum principle**.`,
  symbols: [
    { tex: t`\nabla^2u`, text: 'the Laplacian $u_{xx} + u_{yy}$ (units of $u$ per m²): how far $u$ at a point sits below the average of its surroundings' },
    { tex: t`\mathbf{x}_0`, text: 'the point at the centre of the circle (m)' },
    { tex: 'r', text: 'the circle’s radius (m); any radius works, provided the whole disk lies where $\\nabla^2u = 0$' },
    { tex: t`\oint u\,ds`, text: 'the integral of $u$ around the circle, $ds$ an element of its length (m); divided by the length $2\\pi r$ it is the average' },
  ],
  why: t`In general relativity, the initial data for a simulation must satisfy constraint equations that are elliptic — Laplace- and Poisson-like — and they are solved by exactly the relaxation you build here (module B14). The mean-value property is also why an iterative “replace each value by the average of its neighbours” converges to the answer.`,
  visual: {
    type: 'c3-contour',
    title: 'The average round a circle',
    lead: t`A function’s contour map with a gold circle. The readouts compare the value at the circle’s centre with the average of the values around it. Move the circle and change its size: for a harmonic function the two never differ.`,
    tasks: [
      'With x² − y², drag the centre and radius anywhere: centre value and circle average agree to the last digit.',
      'Switch to x² + y²: now the average is larger than the centre value — by exactly R². That function is not harmonic (its Laplacian is 4).',
      'Turn on the surface view for x² − y²: a saddle, never a summit. Every high point of the window lies on its edge.',
    ],
    params: {
      f: pickF('x', 'y'), x: [-3.2, 3.2], y: [-2, 2], levels: 11, toggle3d: true, zscale: 0.25,
      choices: [{ key: 'k', label: 'Function', options: FUNS.map((F, i) => [i, F.label]), value: 0, explain: 'Three harmonic functions (the third is the 2D potential of a line source at $(4.5, 1)$) and one that is not.' }],
      sliders: [
        { key: 'cx', label: 'Centre $x_0$', min: -1.6, max: 1.6, step: 0.05, value: 0.6, explain: 'Where the circle is centred, horizontally.' },
        { key: 'cy', label: 'Centre $y_0$', min: -0.8, max: 0.8, step: 0.05, value: 0.3, explain: 'Where the circle is centred, vertically.' },
        { key: 'R', label: 'Radius $r$', min: 0.1, max: 1.2, step: 0.05, value: 0.9, explain: 'Any radius gives the same average, for a harmonic function.' },
      ],
      curves: [{ param: ['cx + R*cos(t)', 'cy + R*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2.6 }],
      points: [{ x: 'cx', y: 'cy', color: 'gold' }],
      readouts: [
        { label: 'value at centre', expr: pickF('cx', 'cy'), digits: 6 },
        { label: 'average on circle', expr: circleAvg, digits: 6 },
        { label: 'average − centre', expr: `round(1e6*(${circleAvg} - (${pickF('cx', 'cy')})))/1e6`, digits: 3 },
      ],
    },
    caption: t`The average is computed from 24 equally spaced points on the circle — exact to every digit shown for these functions. The ln function is the 2D potential of a line source at $(4.5, 1)$, outside the window: harmonic everywhere you can put the circle.`,
  },
  example: {
    prompt: t`A thin disk of unit radius has its rim held at the temperature $u(1, \theta) = \cos^2\theta$ (in units of some reference temperature). Find the steady temperature inside, check the mean-value property at the centre, and find where the hottest point is.`,
    visual: {
      type: 'c3-contour',
      params: { f: '(0.5 + 0.5*(x^2 - y^2))*(1 + 0*sqrt(1 - x^2 - y^2))', x: [-1.6, 1.6], y: [-1, 1], levels: 9, labels: true, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink', width: 2 }], points: [{ x: 0, y: 0, label: 'centre: ½', color: 'gold' }] },
      caption: t`The steady temperature $\tfrac12 + \tfrac12(x^2 - y^2)$ inside the unit disk: hottest (1) at the two ends of the horizontal diameter on the rim, coldest (0) at the top and bottom of the rim, ½ at the centre.`,
    },
    steps: [
      { label: 'Rewrite the data', text: t`$\cos^2\theta = \tfrac12 + \tfrac12\cos 2\theta$: a constant plus a pure second harmonic.` },
      { label: 'Harmonic pieces', text: t`A constant is harmonic, and so is $r^2\cos 2\theta = x^2 - y^2$ (its Laplacian is $2 - 2 = 0$). On the rim $r = 1$ it equals $\cos 2\theta$. So $u = \tfrac12 + \tfrac12 r^2\cos 2\theta = \tfrac12 + \tfrac12(x^2 - y^2)$ matches the data and solves $\nabla^2u = 0$.` },
      { label: 'Why it is the answer', text: t`Lesson B6.2 proves a Dirichlet problem has only one solution, so the solution you guessed is *the* solution.` },
      { label: 'Mean value', text: t`At the centre $u = \tfrac12$. The average of the rim values is $\frac{1}{2\pi}\int_0^{2\pi}\cos^2\theta\,d\theta = \tfrac12$. ✓` },
      { label: 'Maximum principle', text: t`Inside, $u = \tfrac12 + \tfrac12 r^2\cos 2\theta$ is strictly between 0 and 1 for $r < 1$: the extremes 1 and 0 are reached only on the rim, at $\theta = 0, \pi$ and $\theta = \pm\pi/2$.` },
      { label: 'Sense check', text: t`Halfway out along the hot diameter, $u(\tfrac12, 0) = \tfrac12 + \tfrac18 = 0.625$: warmer than the centre, cooler than the rim beside it. The $r^2$ factor is how a boundary pattern fades toward the middle.` },
    ],
    answer: t`$u = \tfrac12 + \tfrac12(x^2 - y^2)$. Centre value $\tfrac12$, equal to the rim’s average. The hottest points (1) are on the rim at $(\pm1, 0)$; no interior point is as hot.`,
  },
  practice: [
    multi({
      id: 'which-harmonic', difficulty: 2,
      prompt: t`Which of these functions are harmonic, $u_{xx} + u_{yy} = 0$, wherever they are defined? (Select all that apply.)`,
      visual: { type: 'surface3d', params: { z: '(x^3 - 3*x*y^2)/3', domain: [[-1.6, 1.6], [-1.6, 1.6]], levels: 9, zscale: 0.9 }, caption: t`The surface $z = (x^3 - 3xy^2)/3$, drawn to scale over $|x|, |y| \le 1.6$ — a “monkey saddle”: three valleys and three ridges, and no summit.` },
      choices: [t`$x^3 - 3xy^2$`, t`$e^x\sin y$`, t`$x^2 + y^2$`, t`$\ln(x^2 + y^2)$`, t`$\sin x\,\sin y$`],
      answer: [0, 1, 3],
      why: {
        2: t`$u_{xx} + u_{yy} = 2 + 2 = 4$. A bowl has its lowest point inside, which a harmonic function cannot.`,
        4: t`$u_{xx} = u_{yy} = -\sin x\sin y$, so the Laplacian is $-2\sin x\sin y$ — an eigenfunction of the Laplacian (lesson B7.2), not a harmonic function.`,
      },
      hints: [t`Compute $u_{xx}$ and $u_{yy}$ for each and add.`, t`For $\ln(x^2 + y^2)$: $u_x = 2x/(x^2 + y^2)$, and $u_{xx} = 2(y^2 - x^2)/(x^2 + y^2)^2$; $u_{yy}$ is the same with $x$ and $y$ swapped.`],
      teach: 'A function is harmonic when its two second derivatives cancel: curving up one way exactly as much as it curves down the other.',
      explain: t`$x^3 - 3xy^2$: $6x - 6x = 0$. $e^x\sin y$: $e^x\sin y - e^x\sin y = 0$. $\ln(x^2 + y^2)$: $\dfrac{2(y^2 - x^2) + 2(x^2 - y^2)}{(x^2 + y^2)^2} = 0$ away from the origin, where it is not defined (it is the 2D potential of a point source there). The other two are not harmonic.`,
    }),
    num({
      id: 'circle-average', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, -1]), b = r.pick([1, -2, 3]), c = r.int(-3, 3), d = r.int(1, 9);
        const x0 = r.pick([0.5, 1, -0.5]), y0 = r.pick([0.5, -1, 1]), R = r.pick([0.5, 1, 1.5]);
        const U = a * (x0 * x0 - y0 * y0) + b * x0 * y0 + c * x0 + d;
        const T = t`${a === 1 ? '' : a === -1 ? '-' : a}(x^2 - y^2) ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}xy${c ? ` ${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}x` : ''} + ${d}`;
        return {
          prompt: t`What is the average value of $u = ${T}$ over the circle of radius ${R} centred at $(${x0}, ${y0})$?`,
          visual: { type: 'c3-contour', params: { f: harmPoly(a, b, c, d), x: [-3.2, 3.2], y: [-2, 2], levels: 9, labels: false, curves: [circle(x0, y0, R)], points: [{ x: x0, y: y0, color: 'gold' }] }, caption: 'The function’s contour map with the circle (gold).' },
          answer: U, tol: { rel: 1e-6, abs: 1e-6 },
          errors: a * R * R / 2 !== 0 ? [{ value: U + (a * R * R) / 2, feedback: t`You averaged $x^2$ to $x_0^2 + r^2/2$ but forgot that $-y^2$ averages to $-y_0^2 - r^2/2$: the two extra terms cancel, as they must for a harmonic function.` }] : [],
          hints: ['Is u harmonic? Then no integration is needed.', t`For a harmonic function the circle average is the value at the centre: evaluate $u(${x0}, ${y0})$.`],
          teach: 'For a harmonic function, the average over any circle is the value at its centre.',
          explain: t`$u$ is harmonic ($2a - 2a = 0$, and $xy$, $x$, constants are harmonic), so the average equals $u(${x0}, ${y0}) = ${tex(U)}$, whatever the radius.`,
        };
      },
    }),
    mcq({
      id: 'interior-hot', difficulty: 2,
      prompt: t`A square aluminium plate on a spacecraft has reached a steady temperature. Its edges range between 15 °C and 80 °C, and nothing heats or cools it except through the edges. A sensor in the middle reads 85 °C. What can you conclude?`,
      visual: { type: 'c3-contour', params: { f: '47 + 10*(x^2 - y^2) + 6*x', x: [-1.6, 1.6], y: [-1, 1], levels: 9, curves: [{ param: ['-1 + 2*t', '-1'], t: [0, 1], color: 'ink', width: 2 }, { param: ['-1 + 2*t', '1'], t: [0, 1], color: 'ink', width: 2 }, { param: ['-1', '-1 + 2*t'], t: [0, 1], color: 'ink', width: 2 }, { param: ['1', '-1 + 2*t'], t: [0, 1], color: 'ink', width: 2 }], points: [{ x: 0, y: 0, label: 'sensor', color: 'warn' }] }, caption: 'A possible steady temperature in the plate (°C, illustrative): every contour runs out to the edge, and the extremes lie on it.' },
      choices: ['The reading is wrong, or there is a heat source inside the plate', 'Nothing: heat collects at the centre of a plate', 'It is possible if the plate is large enough', 'It is possible only for an irregularly shaped plate'],
      answer: 0,
      why: {
        1: 'Heat flows from hot to cold; with no source, nothing can pile up into a hot spot hotter than everything around it.',
        2: 'The maximum principle holds for any size of plate: size changes how long it takes to reach the steady state, not the bound.',
        3: 'The mean-value argument works for any shape: the bound comes from the circles around the hottest point, not from the outline.',
      },
      hints: ['Steady, no sources: the temperature is harmonic.', 'Where can a harmonic function reach its maximum?'],
      teach: 'Maximum principle: a harmonic function on a bounded region takes its largest and smallest values on the boundary.',
      explain: t`Without sources the steady temperature obeys $\nabla^2T = 0$, so every interior value lies between the smallest and largest edge values: here between 15 °C and 80 °C. An 85 °C reading means a faulty sensor — or an electronics box, a heater or sunlight depositing heat inside, which turns Laplace’s equation into Poisson’s (lesson B5.2).`,
    }),
    num({
      id: 'five-point', difficulty: 1,
      gen(r) {
        const T = [r.int(10, 60), r.int(10, 60), r.int(10, 60), r.int(10, 60)];
        const avg = T.reduce((s, v) => s + v, 0) / 4;
        return {
          prompt: t`A steady temperature is computed on a square grid by the five-point rule $\nabla^2u \approx \big(u_E + u_W + u_N + u_S - 4u_C\big)/h^2 = 0$. The four neighbours of a grid point read ${T[0]}, ${T[1]}, ${T[2]} and ${T[3]} °C. What must the point itself read, in °C?`,
          visual: { type: 'graph', params: { x: [-2, 2], y: [-1.25, 1.25], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', points: [{ x: 1, y: 0, label: `E ${T[0]} °C`, color: 'accent' }, { x: -1, y: 0, label: `W ${T[1]} °C`, color: 'accent', labelDx: -62 }, { x: 0, y: 1, label: `N ${T[2]} °C`, color: 'accent' }, { x: 0, y: -1, label: `S ${T[3]} °C`, color: 'accent' }, { x: 0, y: 0, label: '?', color: 'gold' }], arrows: [] , curves: [{ fn: '0', domain: [-1, 1], color: 'ink4', width: 1 }, { param: ['0', 't'], t: [-1, 1], color: 'ink4', width: 1 }] }, caption: t`One grid point (gold) and its four neighbours, a distance $h$ away.` },
          answer: avg, units: '°C', tol: { rel: 0, abs: 0.01 },
          hints: [t`Set the five-point Laplacian to zero and solve for $u_C$.`],
          teach: 'On a grid, ∇²u = 0 says each value is the average of its four neighbours — the mean-value property in miniature.',
          explain: t`$u_C = \tfrac14(u_E + u_W + u_N + u_S) = ${tex(avg)}$ °C. Iterating “replace every value by its neighbours’ average” is **Jacobi relaxation**; when nothing changes any more, the grid solves Laplace’s equation.`,
        };
      },
    }),
    order({
      id: 'max-proof', difficulty: 3,
      prompt: t`Put the steps of the proof of the (strong) maximum principle in order. $u$ is harmonic on a connected region and reaches its largest value $M$ at an interior point $p$.`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-1.2, 1.2], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['0.9*cos(t)', '0.9*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2 }, { param: ['0.5*cos(t)', '0.5*sin(t)'], t: [0, 6.2832], color: 'gold', width: 1.4, dash: [4, 4] }, { param: ['0.9 + 0.4*cos(t)', '0.4*sin(t)'], t: [0, 6.2832], color: 'violet', width: 1.6 }], points: [{ x: 0, y: 0, label: 'p', color: 'gold' }, { x: 0.9, y: 0, label: 'q', color: 'violet' }] }, caption: t`Circles around the maximum point $p$ (gold) on which $u = M$; then a circle around a point $q$ of that disk (violet), which spreads $u = M$ further.` },
      items: [
        t`The mean-value property: the average of $u$ on a circle around $p$ equals $u(p) = M$.`,
        t`No value on that circle exceeds $M$, so an average equal to $M$ forces $u = M$ at every point of the circle.`,
        t`The same holds for every smaller circle around $p$, so $u = M$ on a whole disk around $p$.`,
        t`Each point $q$ of that disk is again an interior maximum, so the argument repeats around $q$.`,
        t`The region is connected, so the disks chain across it: $u = M$ everywhere — $u$ is constant.`,
      ],
      hints: ['Start from the mean-value property at p, and end with the conclusion that u is constant.', 'An average can only equal the largest possible value if nothing is smaller — that is the second step.'],
      teach: 'A non-constant harmonic function has no interior maximum: the mean value at the top would have to be dragged down by lower neighbours.',
      explain: t`If anything on the circle were below $M$, the average would be below $M$ too. So a harmonic function with an interior maximum is constant, and a non-constant one takes its maximum (and minimum, applying the argument to $-u$) on the boundary.`,
    }),
    code({
      id: 'jacobi', difficulty: 3,
      prompt: t`Solve Laplace’s equation on a square by **Jacobi relaxation**. The grid is $21 \times 21$ points; the top edge (row 0) is held at 1, the other three edges at 0. Repeatedly replace every interior value by the average of its four neighbours (all computed from the *old* grid) until the largest change in one sweep is below $10^{-6}$. Store the number of sweeps in \`sweeps\` and the centre value \`u[10, 10]\` in \`centre\`.`,
      starter: t`import numpy as np

n = 21
u = np.zeros((n, n))
u[0, :] = 1.0            # the top edge

sweeps = 0
# loop: new interior = average of the four neighbours of the old grid;
# stop when the largest change is below 1e-6

centre = None
print(sweeps, centre)
`,
      answer: t`import numpy as np

n = 21
u = np.zeros((n, n))
u[0, :] = 1.0            # the top edge

sweeps = 0
while True:
    new = u.copy()
    new[1:-1, 1:-1] = 0.25 * (u[2:, 1:-1] + u[:-2, 1:-1] + u[1:-1, 2:] + u[1:-1, :-2])
    change = np.max(np.abs(new - u))
    u = new
    sweeps += 1
    if change < 1e-6:
        break

centre = u[10, 10]
print(sweeps, centre)`,
      tests: [
        { name: 'the centre value is within 0.001 of 1/4', code: 'centre is not None and abs(centre - 0.25) < 1e-3' },
        { name: 'every interior value lies between the edge extremes 0 and 1 (maximum principle)', code: 'u[1:-1, 1:-1].min() > 0 and u[1:-1, 1:-1].max() < 1' },
        { name: 'each interior value is the average of its neighbours, to 0.0001', code: 'np.max(np.abs(u[1:-1, 1:-1] - 0.25 * (u[2:, 1:-1] + u[:-2, 1:-1] + u[1:-1, 2:] + u[1:-1, :-2]))) < 1e-4' },
        { name: 'it took several hundred sweeps', code: '300 < sweeps < 2000' },
      ],
      hints: ['Use `while True:` with a sweep counter; inside, build `new` from `u` with array slices.', '`new[1:-1, 1:-1] = 0.25 * (u[2:, 1:-1] + u[:-2, 1:-1] + u[1:-1, 2:] + u[1:-1, :-2])` — the four shifted copies are the neighbours below, above, right and left.', 'Then `change = np.max(np.abs(new - u))`, `u = new`, count the sweep, and `break` when `change < 1e-6`.'],
      teach: 'Relaxation is the mean-value property used as an algorithm: average until the averages stop changing.',
      explain: t`It takes 688 sweeps and leaves the centre at about 0.24992. Why should the answer be exactly $\tfrac14$? Rotate the problem: four copies, each with a different edge at 1, add up to a square with every edge at 1, whose solution is 1 everywhere — and by symmetry each copy contributes the same at the centre. The leftover $8\times10^{-5}$ is the lesson of the stopping rule: a small change per sweep is **not** a small error. Jacobi creeps; Gauss–Seidel and over-relaxation (module B13) converge far faster.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-square-centre', difficulty: 2,
      gen(r) {
        const T = [r.int(0, 20) * 5, r.int(0, 20) * 5, r.int(0, 20) * 5, r.int(0, 20) * 5];
        if (new Set(T).size < 3) T[1] = (T[1] + 35) % 105;
        const avg = T.reduce((s, v) => s + v, 0) / 4;
        const sorted = [...T].sort((p, q) => p - q), mid = (sorted[0] + sorted[3]) / 2;
        return {
          prompt: t`A square plate is held at ${T[0]} °C along its top edge, ${T[1]} °C on the right, ${T[2]} °C along the bottom and ${T[3]} °C on the left. With no heat sources inside, what is the steady temperature at its centre?`,
          visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-1.15, 1.15], aspect: '', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['-1 + 2*t', '1'], t: [0, 1], color: 'warn', width: 3 }, { param: ['1', '1 - 2*t'], t: [0, 1], color: 'accent', width: 3 }, { param: ['1 - 2*t', '-1'], t: [0, 1], color: 'teal', width: 3 }, { param: ['-1', '-1 + 2*t'], t: [0, 1], color: 'violet', width: 3 }], points: [{ x: 0, y: 1, label: `${T[0]} °C`, r: 0, labelDx: -18, labelDy: -12 }, { x: 1, y: 0, label: `${T[1]} °C`, r: 0, labelDx: 6 }, { x: 0, y: -1, label: `${T[2]} °C`, r: 0, labelDx: -18, labelDy: 14 }, { x: -1, y: 0, label: `${T[3]} °C`, r: 0, labelDx: -58 }, { x: 0, y: 0, label: '?', color: 'gold' }] }, caption: 'The plate and its four edge temperatures; the corners are single points and do not matter.' },
          answer: avg, units: '°C', tol: { rel: 0, abs: 0.05 },
          errors: mid !== avg ? [{ value: mid, feedback: 'The centre is not halfway between the hottest and coldest edges: every edge counts equally. Use superposition and symmetry.' }] : [],
          hints: ['Split the problem into four, each with one edge hot and the others at 0 — the solutions add.', 'By symmetry each of the four pieces gives the centre a quarter of its edge temperature (four copies with 1 on a different edge sum to the all-1 problem).'],
          teach: 'Superposition plus symmetry: one edge at T and three at 0 puts the centre of a square at T/4.',
          explain: t`Each edge alone contributes a quarter of its temperature at the centre, so $T_{\text{centre}} = \tfrac14(${T.join(' + ')}) = ${tex(avg)}$ °C — the average of the four edge temperatures, as a mean-value picture suggests.`,
        };
      },
    }),
    num({
      id: 'cp-moon', difficulty: 3, transfer: true,
      gen(r) {
        const orb = r.pick([['the GPS constellation', 26560], ['geostationary orbit', 42164], ['low Earth orbit', 6778]]);
        const Phi = -MOON.GM / MOON.d;
        const rr = orb[1] * 1e3;
        return {
          prompt: t`The Moon’s gravitational potential is $\Phi_M = -GM_M/|\mathbf{x} - \mathbf{x}_M|$ with $GM_M = ${tex(MOON.GM)}\ \text{m}^3/\text{s}^2$, and the Moon is $d = ${tex(MOON.d)}$ m from Earth’s centre. Average $\Phi_M$ over the sphere of radius ${orb[1].toLocaleString('en-GB').replace(/,/g, ' ')} km (${orb[0]}) centred on Earth’s centre. What is the average, in J/kg?`,
          visual: { type: 'graph', params: { x: [-1.6, 13], y: [-3.4, 3.4], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['1.1*cos(t)', '1.1*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2.2 }, { param: ['0.3*cos(t)', '0.3*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, { param: ['12 + 0.12*cos(t)', '0.12*sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2 }], points: [{ x: 0, y: 0, label: 'Earth', r: 0, labelDx: -14, labelDy: -18 }, { x: 12, y: 0, label: 'Moon', r: 3, color: 'ink2', labelDx: -16, labelDy: -16 }, { x: 0.78, y: 0.78, label: 'sphere', r: 0, color: 'gold', labelDx: 4, labelDy: -6 }] }, caption: 'Not to scale: the sphere (gold) around Earth, and the Moon far outside it.' },
          answer: Phi, units: 'J/kg', tol: { rel: 0.005 },
          errors: [{ value: -MOON.GM / (MOON.d - rr), feedback: 'That is the potential at the sphere’s nearest point to the Moon, not its average.' }],
          hints: [t`$\Phi_M$ is harmonic everywhere except at the Moon itself, which lies outside the sphere.`, t`So its average over the sphere is its value at the sphere’s centre: $-GM_M/d$.`],
          teach: 'In 3D the mean-value property holds on spheres: the average of a harmonic function over a sphere is its value at the centre.',
          explain: t`$\langle\Phi_M\rangle = \Phi_M(\text{Earth’s centre}) = -${tex(MOON.GM)}/${tex(MOON.d)} = ${tex(Phi)}$ J/kg, for a sphere of any radius smaller than $d$. That is why the Moon’s pull averages out to a uniform acceleration plus tides: the near side and far side differ from the average by equal and opposite amounts to first order.`,
        };
      },
    }),
    mcq({
      id: 'cp-relax-meaning', difficulty: 2,
      prompt: t`Jacobi relaxation updates a grid sweep after sweep, which looks like stepping forward in time. What does the converged grid represent?`,
      visual: { type: 'graph', params: { x: [0, 720], y: [-6.5, 0.3], aspect: 'wide', xlabel: 'sweeps', ylabel: 'log₁₀ of largest change', axesAt: 'edge', points: JAC.pts, hlines: [{ y: -6, color: 'ink3' }] }, caption: `The largest change per sweep as Jacobi relaxation runs on a 21 × 21 grid (computed): it falls steadily and the run stops at the dashed threshold, a change of 10⁻⁶, after ${JAC.sweeps} sweeps.` },
      choices: ['The steady state, the solution of Laplace’s equation — the sweeps are only an algorithm for finding it', 'The temperature after 688 seconds', 'The temperature at one definite moment, taking each sweep as one time step of the heat equation', 'An average over all the intermediate grids'],
      answer: 0,
      why: {
        1: 'A sweep has no time attached to it. Laplace’s equation has no time in it at all: it describes the end state.',
        2: 'Jacobi is indeed the explicit heat scheme with the largest stable step, but the intermediate grids depend on that choice; only the converged grid has meaning — and it is the state where nothing changes.',
        3: 'The final grid is the fixed point of the averaging map, not an average of the iterates.',
      },
      hints: ['Does Laplace’s equation contain a time derivative?'],
      teach: 'Laplace’s equation is not an evolution law: it describes a state, and iteration is just one way to find it.',
      explain: t`Relaxation stops when every value is the average of its neighbours — the discrete $\nabla^2u = 0$. How it gets there (Jacobi, Gauss–Seidel, multigrid) is irrelevant to the answer, which is the steady state the heat equation would eventually reach.`,
    }),
  ],
  sources: [SRC.strauss, SRC.evans, { label: 'JPL planetary and lunar ephemerides DE440: lunar GM', url: 'https://ssd.jpl.nasa.gov/doc/de440_de441.html' }],
});
