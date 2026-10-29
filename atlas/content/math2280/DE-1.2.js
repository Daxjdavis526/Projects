// Reading a first-order equation without solving it: slope fields,
// isoclines and nullclines, funnels and separatrices, and the phase line of
// an autonomous equation with the stability of its equilibria.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt, frac } from '../../src/core/format.js';

const t = String.raw;
const SIGMA = 5.670374419e-8;     // Stefan–Boltzmann constant, W/(m² K⁴) (CODATA 2018)
const SUN = 1361;                 // total solar irradiance at 1 au, W/m²
const co = (k) => (k === 1 ? '' : k === -1 ? '-' : String(k));

export default lesson({
  id: 'math2280.DE-1.2',
  title: 'Slope fields and qualitative behaviour',
  minutes: 11, difficulty: 2,
  intro: t`Most differential equations have no solution formula — but every first-order equation still tells you the **slope** of its solutions at every point, and drawing those slopes as short segments gives a **slope field** whose curves you can follow by eye. Two tools organise the picture. An **isocline** is a curve along which every segment has the same slope $c$; the isocline $c = 0$, the **nullcline**, is where solutions are momentarily level, at their peaks, troughs and resting values:

$$\frac{dy}{dt} = f(t, y), \qquad \text{isocline of slope } c:\; f(t, y) = c$$

When $f$ does not depend on $t$ — an **autonomous** equation $y' = f(y)$ — the field repeats along every horizontal line, and the sign of $f$ between its zeros, drawn as a **phase line**, decides the fate of every solution.`,
  symbols: [
    { tex: t`f(t, y)`, text: t`the rule for the slope: at the point $(t, y)$, every solution passing through has slope $f(t, y)$` },
    { tex: t`c`, text: t`a chosen slope; the isocline $f(t, y) = c$ joins all the points where segments have slope $c$` },
    { tex: t`y^*`, text: t`an **equilibrium** of $y' = f(y)$: a value with $f(y^*) = 0$, so the constant function $y = y^*$ is a solution` },
    { tex: t`f'(y^*)`, text: t`the slope of $f$ at an equilibrium: negative means **stable** (nearby solutions are pulled in), positive **unstable** (they are pushed away)` },
  ],
  why: t`The pendulum, the logistic equation and drag at any speed are nonlinear, and qualitative reading is how you know what a numerical solution should look like before you trust it.`,
  visual: {
    type: 'de-slopefield',
    title: 'A field with two fates',
    lead: t`The slope field of $y' = y^2 - t$. No formula in elementary functions solves this equation, yet the picture shows what every solution does. Drag the ringed point; click anywhere to add more solutions.`,
    tasks: [
      'Turn on the isoclines: on the gold parabola t = y² every segment is flat, so solutions peak or bottom out as they cross it.',
      'Drag the start point: solutions below the parabola’s upper arm are funnelled onto its lower arm, y ≈ −√t.',
      'Start just above that upper arm: the solution turns upward and escapes to infinity in a finite time.',
    ],
    params: { f: 'y^2 - t', x: [-2, 6], y: [-2.6, 2.6], start: [-1, -0.4], isoclines: [-2, -1, 0, 1, 2], isoToggle: true },
    caption: t`Segments show the slope only; their length means nothing. Blue: the solution through the ringed point, traced numerically (RK4). Dashed: isoclines, labelled with their slope. One exceptional solution separates the two fates: it stays near the upper arm, $y \approx \sqrt t$, for ever.`,
  },
  example: {
    prompt: t`Use isoclines to sketch the solutions of $y' = 2t - y$. Find the one solution that is a straight line, and say what every other solution does as $t \to \infty$.`,
    visual: {
      type: 'de-slopefield',
      params: {
        f: '2*t - y', x: [-1, 4], y: [-3, 7], isoclines: [-2, 0, 2, 4], grid: [17, 13],
        seeds: [[0, 4], [0, -2.5], [-1, 6]], seedColor: 'accent2',
        curves: [{ fn: '2t - 2', color: 'good', width: 2.8, label: 'y = 2t − 2', labelAt: 2.7, labelDx: 12, labelDy: 10 }],
      },
      caption: t`Dashed: isoclines $y = 2t - c$, each labelled with its slope $c$ (gold: the nullcline, $c = 0$). Green: the isocline of slope 2, which is itself a solution. Light blue: three other solutions, all closing in on it.`,
    },
    steps: [
      { label: 'Isoclines', text: t`Set $f = c$: $\;2t - y = c$, so $y = 2t - c$. Every isocline is a straight line of slope 2, and the segments on it all have slope $c$.` },
      { label: 'An isocline that is a solution', text: t`A curve is a solution when its own slope matches the field’s slope all along it. The line $y = 2t - c$ has slope 2, and the field there has slope $c$; they agree when $c = 2$. So $y = 2t - 2$ is a solution.` },
      { label: 'Check by substituting', text: t`$y = 2t - 2$ gives $y' = 2$, and $2t - y = 2t - (2t - 2) = 2$ ✓.` },
      { label: 'The others', text: t`Above the line, $y > 2t - 2$, so the slope $2t - y$ is **less** than 2: those solutions climb more slowly than the line and the gap closes. Below it the slopes exceed 2 and the gap closes from underneath. In fact the gap $d = y - (2t - 2)$ obeys $d' = y' - 2 = -d$, so it decays like $e^{-t}$.` },
      { label: 'Concavity for free', text: t`Differentiate the equation: $y'' = 2 - y' = y - 2t + 2 = d$. Solutions above the line are concave up and those below concave down — exactly the bending in the picture.` },
      { label: 'Sense check', text: t`Far ahead every solution looks like $2t - 2$: the forcing $2t$ wins and the starting value is forgotten, a pattern you will meet again in every linear equation with a decaying transient.` },
    ],
    answer: t`The straight-line solution is $y = 2t - 2$; every other solution approaches it, the gap shrinking like $e^{-t}$.`,
  },
  practice: [
    mcq({
      id: 'autonomous-field', difficulty: 1,
      prompt: t`In this slope field the segments are identical all along every horizontal line. What does that tell you about the equation $y' = f(t, y)$?`,
      choices: [
        t`$f$ depends on $y$ alone: the equation is autonomous, and sliding any solution sideways in $t$ gives another solution`,
        t`$f$ depends on $t$ alone, so every solution is the same curve shifted up or down`,
        'Every solution is a straight line',
        'The equation has no equilibrium solutions',
      ],
      answer: 0,
      why: {
        1: t`That is the other symmetry: when $f$ depends on $t$ alone the segments are identical along every **vertical** line.`,
        2: t`The slopes change from one row to the next, so solutions bend as they cross rows.`,
        3: t`Wherever a whole row of segments is flat, the horizontal line through it is a constant solution — an equilibrium.`,
      },
      hints: [t`Moving along a horizontal line changes $t$ but not $y$. If the slope never changes, what can $f$ not depend on?`],
      teach: 'An autonomous equation y′ = f(y) has the same slope all along each horizontal line, so its solutions are horizontal translates of one another.',
      explain: t`Constant slopes along horizontal lines mean $f$ ignores $t$: $y' = f(y)$. If $y(t)$ is a solution then so is $y(t - a)$ for any shift $a$. This field is $y' = \sin y$; its flat rows at $y = 0, \pm\pi$ are equilibria.`,
      visual: { type: 'de-slopefield', params: { f: 'sin(y)', x: [0, 6], y: [-4, 4], grid: [19, 15] }, caption: 'A slope field with no solutions drawn. Look along the rows, then down the columns.' },
    }),
    expr({
      id: 'line-solution', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 3, -1, -2, 4]);
        const ans = `${a}t - (${a})`;
        return {
          prompt: t`The isoclines of $y' = ${co(a)}t - y$ are straight lines. One of them is itself a solution. Find it.`,
          answer: ans, answerTeX: t`y = ${co(a)}t ${a > 0 ? '-' : '+'} ${Math.abs(a)}`, lhs: 'y',
          vars: { t: [-2, 2] },
          integrand: `${a}t - (${ans})`,      // the content test checks y′ = f(t, y) along the answer
          errors: [
            { answer: `${a}t`, feedback: t`On the line $y = ${co(a)}t$ the field’s slope is $${co(a)}t - ${co(a)}t = 0$, but the line itself has slope $${a}$: not a solution. That is the nullcline.` },
            { answer: `${a}t + (${a})`, feedback: t`Check the sign: on that line the field’s slope is $${co(a)}t - y = ${-a}$, not the line’s own slope, $${a}$.` },
          ],
          hints: [t`The isocline of slope $c$ is $${co(a)}t - y = c$, that is $y = ${co(a)}t - c$: a line of slope $${a}$.`, t`It is a solution when the field’s slope on it, $c$, equals the line’s own slope, $${a}$.`],
          teach: 'An isocline is a solution exactly when the slope written on it equals its own slope.',
          explain: t`Take $c = ${a}$: the line $y = ${co(a)}t ${a > 0 ? '-' : '+'} ${Math.abs(a)}$ has slope $${a}$, and the field on it has slope $${co(a)}t - (${co(a)}t ${a > 0 ? '-' : '+'} ${Math.abs(a)}) = ${a}$ ✓. Every other solution approaches it like $e^{-t}$.`,
          visual: {
            type: 'de-slopefield',
            params: { f: `${a}*t - y`, x: [-2, 3], y: [Math.min(-2 * Math.abs(a), -4) - 1, Math.max(3 * Math.abs(a), 4) + 1], isoclines: [-2 * Math.abs(a), -Math.abs(a), 0, Math.abs(a), 2 * Math.abs(a)].filter((c, i, A) => A.indexOf(c) === i), grid: [17, 13] },
            caption: t`The slope field of $y' = ${co(a)}t - y$ with five isoclines, each labelled with the slope of its segments.`,
          },
        };
      },
    }),
    mcq({
      id: 'which-stable', difficulty: 2,
      gen(r) {
        const a = r.int(-3, -1), b = a + r.int(2, 3), c = b + r.int(2, 3);
        const ys = [a, b, c].map(String);
        const fy = (y) => -0.12 * (y - a) * (y - b) * (y - c);
        let top = 0;
        for (let k = 0; k <= 200; k++) top = Math.max(top, Math.abs(fy(a + ((c - a) * k) / 200)));
        return {
          prompt: t`The equation $y' = f(y)$ has the graph of $f$ shown, with zeros at $y = ${a}$, $${b}$ and $${c}$. Which equilibria are **stable**?`,
          choices: [t`$y = ${a}$ and $y = ${c}$`, t`$y = ${b}$ only`, t`All three`, t`$y = ${a}$ only`],
          answer: 0,
          why: {
            1: t`At $y = ${b}$ the graph of $f$ climbs through zero: $f < 0$ below and $f > 0$ above push solutions **away**. That is unstable.`,
            2: t`An equilibrium is stable only where $f$ crosses zero going **down**, $f'(y^*) < 0$; here that happens twice, not three times.`,
            3: t`Check $y = ${c}$ too: $f$ falls through zero there, so solutions on both sides move towards it.`,
          },
          hints: ['Where f > 0, y increases; where f < 0, y decreases. Draw those arrows on the y-axis.', t`An equilibrium attracts when the arrows on both sides point at it: $f > 0$ just below and $f < 0$ just above, that is $f'(y^*) < 0$.`],
          teach: 'An equilibrium of y′ = f(y) is stable where f crosses zero going down (f′(y*) < 0) and unstable where it crosses going up.',
          explain: t`$f$ falls through zero at $y = ${a}$ and $y = ${c}$ (stable) and rises through zero at $y = ${b}$ (unstable). Solutions starting between $${a}$ and $${c}$ are split by $y = ${b}$: below it they settle at $${a}$, above it at $${c}$.`,
          visual: {
            type: 'graph',
            params: {
              x: [a - 1.2, c + 1.2], y: [-1.7 * top, 1.7 * top], xlabel: 'y', ylabel: 'f(y)',
              curves: [{ fn: `-0.12*(x - (${a}))*(x - (${b}))*(x - (${c}))`, color: 'accent' }],
              points: ys.map((v) => ({ x: +v, y: 0, color: 'ink', r: 3.5 })),
            },
            caption: t`The rate $f(y)$ plotted against $y$ — not against $t$. The dots mark its zeros, the equilibria.`,
          },
        };
      },
    }),
    mcq({
      id: 'semi-stable', difficulty: 2,
      prompt: t`For $y' = (y - 2)^2$, what do solutions starting at $y(0) = 1.9$ and at $y(0) = 2.1$ do?`,
      choices: [
        t`From 1.9 it rises and levels off towards 2; from 2.1 it rises away from 2 and keeps going`,
        t`Both approach 2: an equilibrium attracts from both sides`,
        t`From 1.9 it falls away from 2; from 2.1 it falls back towards 2`,
        t`Both stay where they start, because $f$ is tiny near $y = 2$`,
      ],
      answer: 0,
      why: {
        1: t`$(y - 2)^2 \ge 0$: the slope is never negative, so nothing above 2 can come back down to it.`,
        2: t`A square is never negative, so no solution of this equation ever decreases.`,
        3: t`Small is not zero: at $y = 1.9$ the slope is $0.01$, so the solution keeps creeping upward. Only $y = 2$ exactly stays put.`,
      },
      hints: [t`What is the sign of $(y - 2)^2$ above 2 and below 2?`, t`Both signs are positive: solutions on both sides move up. Which side moves **towards** 2?`],
      teach: 'When f touches zero without changing sign the equilibrium is semi-stable: it attracts from one side and repels on the other.',
      explain: t`$f = (y - 2)^2 > 0$ on both sides, so every non-constant solution increases. Starting at 1.9 it climbs towards 2 but never reaches it; starting at 2.1 it climbs away — in fact to infinity in finite time, since $y' = (y - 2)^2$ grows like a square. Such a one-sided equilibrium is **semi-stable**.`,
      visual: { type: 'de-slopefield', params: { f: '(y - 2)^2', x: [0, 3], y: [0, 4], grid: [17, 15] }, caption: t`The slope field of $y' = (y - 2)^2$, with no solutions drawn. Look at the segments just above and just below the row at $y = 2$.` },
    }),
    {
      type: 'point', id: 'separatrix', difficulty: 3,
      prompt: t`For $y' = y^2 - t$, solutions starting at $t = 0$ either get funnelled onto the lower arm of the parabola $t = y^2$ or blow up. Drag the ringed start point up and down the line $t = 0$ to find, to within about 0.04, the starting value $y(0)$ that separates the two fates.`,
      visual: { type: 'de-slopefield', params: { f: 'y^2 - t', x: [-1, 5], y: [-3, 3], start: [0, 0.2], isoclines: [0], click: false }, caption: 'The gold dashed curve is the nullcline t = y². The blue curve is the solution from the ringed point (RK4).' },
      answer: { x: 0, y: 0.729 }, tol: { x: 0.12, y: 0.04 },
      instruction: 'Keep the point on t = 0 and move it up and down until the curve is about to switch fates; then check.',
      hints: ['Start low, where the curve turns down, and raise the point a little at a time until the curve shoots up instead.', 'Halve the gap each time: the boundary lies between 0.6 and 0.8.'],
      teach: 'A separatrix is the one solution between two different long-term behaviours; nearby starting values diverge from it, so you can trap it by bisection.',
      explain: t`The boundary is $y(0) \approx 0.729$. That separating solution creeps along the upper arm of the parabola, $y \approx \sqrt t$, for ever; start a hair below and you are funnelled down, a hair above and you blow up. (Its exact value is $-\mathrm{Ai}'(0)/\mathrm{Ai}(0)$, from the Airy function — the substitution $y = -u'/u$ turns this equation into Airy’s.)`,
    },
    mcq({
      id: 'field-not-graph', difficulty: 2, kind: 'error',
      prompt: t`Looking at the slope field of $y' = t^2 - y$, a student says: “Near $t = 2$, $y = 0$ the segments are very steep, so the solution is very large there.” What is the mistake?`,
      choices: [
        t`The segments show the slope $y'$, not the value of $y$: the solution there is near 0 and rising steeply`,
        'Nothing: steep segments always mean large values',
        t`The segments near $t = 2$ are flat, not steep`,
        'Segment length, not steepness, shows the size of the solution',
      ],
      answer: 0,
      why: {
        1: t`A solution passing $(2, 0)$ has value 0 there and slope $2^2 - 0 = 4$: large slope, small value.`,
        2: t`Compute it: $f(2, 0) = 4 - 0 = 4$ — steep.`,
        3: 'Segment length means nothing in a slope field; every segment is drawn the same length.',
      },
      hints: [t`What does a segment drawn at the point $(t, y)$ represent: $y$, or $y'$?`, t`Evaluate $f(2, 0) = 2^2 - 0$.`],
      teach: 'A slope field shows the slope at each point; the value of the solution is the height of the point itself.',
      explain: t`At $(2, 0)$ the field has slope $f(2, 0) = 4$: any solution passing through has $y = 0$ (its height in the picture) and is climbing at 4 units per unit of $t$. Reading steepness as height is the classic slope-field misreading.`,
      visual: { type: 'de-slopefield', params: { f: 't^2 - y', x: [0, 3], y: [-1, 5], grid: [17, 15], points: [{ x: 2, y: 0, color: 'gold', label: '(2, 0)' }] }, caption: t`The slope field of $y' = t^2 - y$; the gold dot marks $(2, 0)$.` },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-radiative', difficulty: 2, transfer: true,
      gen(r) {
        const [where, d, coat, alpha, eps] = r.pick([
          ['at Earth’s distance from the Sun, 1.00 au', 1, 'black paint', 0.95, 0.95],
          ['at Mars’s distance, 1.52 au', 1.524, 'black paint', 0.95, 0.95],
          ['at Venus’s distance, 0.723 au', 0.723, 'black paint', 0.95, 0.95],
          ['at Earth’s distance, 1.00 au', 1, 'white paint', 0.2, 0.9],
        ]);
        const S = SUN / (d * d), T = ((alpha * S) / (4 * eps * SIGMA)) ** 0.25;
        const flat = ((alpha * S) / (eps * SIGMA)) ** 0.25;
        return {
          prompt: t`A small sphere coated in ${coat} (absorptivity $\alpha = ${alpha}$, emissivity $\varepsilon = ${eps}$) drifts in sunlight ${where}, where the sunlight carries $S = ${nice(S, 4)}\ \text{W/m}^2$. Its temperature obeys
$$C\,\frac{dT}{dt} = \alpha S\,\pi r^2 - \varepsilon\sigma T^4\cdot 4\pi r^2,$$
absorbed sunlight minus radiated heat, with $\sigma = 5.670\times10^{-8}\ \text{W/(m}^2\,\text{K}^4)$. Find its equilibrium temperature, which every starting temperature approaches.`,
          answer: T, units: 'K', tol: { rel: 0.01 },
          errors: [{ value: flat, feedback: t`The sphere absorbs over its cross-section $\pi r^2$ but radiates from its whole surface $4\pi r^2$: keep the factor 4.` }],
          hints: [t`At equilibrium $dT/dt = 0$: absorbed power equals radiated power.`, t`$\alpha S\pi r^2 = 4\pi r^2\varepsilon\sigma T^4$, so $T^4 = \dfrac{\alpha S}{4\varepsilon\sigma}$ — the radius cancels.`],
          teach: 'An equilibrium of an autonomous equation is where the rate vanishes; here it is the balance between absorbed and radiated power.',
          explain: t`$T^* = \left(\dfrac{\alpha S}{4\varepsilon\sigma}\right)^{1/4} = \left(\dfrac{${alpha}\times${nice(S, 4)}}{4\times${eps}\times5.670\times10^{-8}}\right)^{1/4} \approx ${fmt(T, 3)}$ K. It is stable: the right side, $\alpha S\pi r^2 - 4\pi r^2\varepsilon\sigma T^4$, falls as $T$ rises, so a sphere that is too hot radiates more than it absorbs and cools, and one that is too cold warms. Spacecraft engineers set $\alpha/\varepsilon$ with coatings for exactly this reason.`,
          visual: {
            type: 'graph',
            params: {
              x: [-3.2, 3.2], y: [-1.6, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
              points: [{ x: 0.6, y: 0, r: 30, color: coat === 'white paint' ? 'ink2' : 'ink4' }],
              arrows: [
                ...[-0.6, 0, 0.6].map((y, i) => ({ from: [-3, y], to: [0.05, y], color: 'gold', width: 2.2, label: i === 2 ? 'sunlight' : '', labelDx: -150, labelDy: -12 })),
                ...[-80, -35, 10, 55, 100].map((deg, i) => { const c = Math.cos((deg * Math.PI) / 180), s = Math.sin((deg * Math.PI) / 180); return { from: [0.6 + 0.48 * c, 0.48 * s], to: [0.6 + 1.25 * c, 1.25 * s], color: 'warn', width: 1.8, label: i === 2 ? 'heat radiated' : '', labelDx: 6, labelDy: 0 }; }),
              ],
            },
            caption: 'The sphere absorbs sunlight over its cross-section and radiates heat from its whole surface. Not to scale.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-fate', difficulty: 2,
      prompt: t`A solution of $y' = y\,(y - 1)(3 - y)$ starts at $y(0) = 0.8$. What does it do as $t \to \infty$?`,
      choices: [t`It decreases towards $y = 0$`, t`It increases towards $y = 1$`, t`It increases towards $y = 3$`, t`It decreases without bound`],
      answer: 0,
      why: {
        1: t`$y = 1$ is an equilibrium, but between 0 and 1 the rate $y(y - 1)(3 - y)$ is negative, so the solution moves **away** from 1 and down.`,
        2: t`To reach 3 it would have to cross the equilibrium $y = 1$, and solutions cannot cross one another.`,
        3: t`$y = 0$ is an equilibrium below it, and a solution cannot pass through an equilibrium.`,
      },
      hints: ['Find the equilibria, then the sign of the right side between 0 and 1.', t`At $y = 0.8$: $0.8 \times (-0.2) \times 2.2 < 0$.`],
      teach: 'In an autonomous equation a solution moves monotonically towards the next equilibrium in the direction of its slope, and never crosses one.',
      explain: t`The equilibria are 0, 1 and 3. Between 0 and 1 the rate is negative, so the solution falls; it cannot cross $y = 0$, so it approaches it. ($y = 0$ and $y = 3$ are stable; $y = 1$ is unstable.)`,
      visual: { type: 'graph', params: { x: [-0.8, 3.6], y: [-3, 3], xlabel: 'y', ylabel: 'f(y)', curves: [{ fn: 'x*(x - 1)*(3 - x)', color: 'accent' }], points: [{ x: 0.8, y: 0, color: 'gold', label: 'start', labelDx: -10, labelDy: 14 }] }, caption: t`The rate $f(y) = y(y - 1)(3 - y)$ against $y$. The gold dot marks the starting value on the $y$-axis.` },
    }),
    expr({
      id: 'cp-line', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [2, 4], [1, -3], [-1, 2], [2, -2], [-2, 4]]);
        const m = -b / a, c = -b / (a * a);
        const ans = `${m}t + (${c})`;
        const mT = m === 1 ? '' : m === -1 ? '-' : frac(m);
        return {
          prompt: t`The equation $y' = ${co(a)}y ${b < 0 ? '-' : '+'} ${Math.abs(b)}t$ has exactly one solution that is a straight line, $y = mt + k$. Find it.`,
          answer: ans, answerTeX: t`y = ${mT}t ${c < 0 ? '-' : '+'} ${frac(Math.abs(c))}`, lhs: 'y',
          vars: { t: [-2, 2] },
          integrand: `${a}*(${ans}) + (${b})*t`,
          errors: [{ answer: `${m}t`, feedback: t`Check the constant terms too: on $y = ${nice(m)}t$ the slope $${nice(m)}$ must equal $${co(a)}y ${b < 0 ? '-' : '+'} ${Math.abs(b)}t$ for every $t$, which leaves a constant over.` }],
          hints: [t`Substitute $y = mt + k$: the left side is $m$, the right side is $${co(a)}(mt + k) ${b < 0 ? '-' : '+'} ${Math.abs(b)}t$.`, t`For this to hold at every $t$, the coefficients of $t$ must match (giving $m$) and the constants must match (giving $k$).`],
          teach: 'To find a solution of a given shape, substitute the shape and match coefficients, so the equation holds for every t.',
          explain: t`$m = ${a}(mt + k) + ${b}t$ for all $t$: the $t$ terms give $${a}m + ${b} = 0$, so $m = ${nice(m)}$; the constants give $m = ${a}k$, so $k = ${nice(c)}$.`,
          visual: { type: 'de-slopefield', params: { f: `${a}*y + ${b}*t`, x: [-2, 2], y: [-4, 4], grid: [17, 15] }, caption: t`The slope field of $y' = ${co(a)}y ${b < 0 ? '-' : '+'} ${Math.abs(b)}t$. The line you want threads straight through it.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §1.2 Slope fields and §1.6 Autonomous equations', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'J. H. Hubbard and B. H. West, Differential Equations: A Dynamical Systems Approach (funnels and antifunnels; y′ = y² − t)', url: 'https://link.springer.com/book/10.1007/978-1-4612-4192-8' },
    { label: 'NASA Sun fact sheet (solar irradiance at 1 au)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html' },
  ],
});
