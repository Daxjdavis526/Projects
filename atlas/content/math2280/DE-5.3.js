// Predator–prey and competition: the Lotka–Volterra equations, their
// equilibria, a linearized centre that cannot decide, the conserved quantity
// that does (closed orbits), cycle averages and Volterra's fishing principle;
// competing species with linear nullclines — coexistence or exclusion; and
// solve_ivp checking the conserved quantity numerically.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { M, n, r6, plane } from './_systems.js';

const t = String.raw;

// the Lotka–Volterra system x′ = ax − bxy, y′ = −cy + dxy as plane() expressions
const lv = (a, b, c, d) => [`${a}*x - ${b}*x*y`, `-${c}*y + ${d}*x*y`];

export default lesson({
  id: 'math2280.DE-5.3',
  title: 'Predator–prey and competition',
  minutes: 15, difficulty: 3,
  intro: t`In 1925–26 Alfred Lotka and Vito Volterra independently wrote down the simplest model of predators eating prey. With $x$ the prey and $y$ the predators,

$$x' = ax - bxy, \qquad y' = -cy + dxy.$$

Prey multiply on their own and are eaten at a rate proportional to encounters, $xy$; predators starve without prey and grow by eating. Besides extinction, $(0, 0)$, there is one coexistence equilibrium, $(c/d,\ a/b)$ — and its linearization is a **centre**, which by itself decides nothing (DE-5.1). What decides is a **conserved quantity**: $V = dx - c\ln x + by - a\ln y$ stays constant along every solution, so the populations cycle forever round its closed level curves. **Competing** species are different again: each slows the other’s growth, and the nullclines — straight lines — decide whether both survive or one wins.`,
  symbols: [
    { tex: 'x,\\ y', text: 'the prey and predator populations (or densities), for example in thousands of animals' },
    { tex: 'a', text: 'the prey’s growth rate with no predators, per unit time' },
    { tex: 'b', text: 'how fast encounters kill prey: per predator per unit time' },
    { tex: 'c', text: 'the predators’ death rate with no prey, per unit time' },
    { tex: 'd', text: 'how fast encounters feed new predators: per prey per unit time' },
    { tex: 'V', text: 'the conserved quantity $dx - c\\ln x + by - a\\ln y$: its level curves are the trajectories' },
  ],
  why: t`Predator–prey cycles are the classic example of a nonlinear system that oscillates without any external rhythm; the same equations (with other letters) describe autocatalytic chemical reactions, the energy exchange in some lasers, and the boom and bust of competing technologies.`,
  visual: {
    type: 'de-plane',
    title: 'Cycles of hunters and hunted',
    lead: t`The Lotka–Volterra model with $b = 0.5$ and $d = 0.25$ (time in years, populations in thousands). The thin grey curves are level curves of $V$; the bold trajectory starts at 5 thousand prey and 2 thousand predators, and the lower panel shows both populations in time. Press Play.`,
    tasks: [
      'Watch the order: the prey peak first, and the predators peak about a quarter of a cycle later, after they have had plenty to eat.',
      'Every trajectory runs exactly along a level curve of V (thin grey): the cycles close and repeat forever.',
      t`Raise the predator death rate $c$: the equilibrium $(c/d, a/b)$ moves right — tougher conditions for predators mean **more** prey on average.`,
    ],
    params: {
      fx: 'a*x - 0.5*x*y', fy: '-c*y + 0.25*x*y', x: [0, 9], y: [0, 6], equal: false, aspect: 'square', xlabel: 'prey x', ylabel: 'predators y',
      sliders: [
        { key: 'a', label: 'Prey growth rate $a$', min: 0.5, max: 1.5, step: 0.05, value: 1, unit: '\\mathrm{yr^{-1}}', explain: 'How fast prey multiply when no predators are about.' },
        { key: 'c', label: 'Predator death rate $c$', min: 0.4, max: 1.2, step: 0.05, value: 0.75, unit: '\\mathrm{yr^{-1}}', explain: 'How fast predators die off with no prey.' },
      ],
      nullclines: true, equilibria: 'label',
      levels: { fn: '0.25*x - c*ln(x) + 0.5*y - a*ln(y)', values: [0.03, 0.12, 0.3, 0.6, 1].map((dv) => `c - c*ln(4*c) + a - a*ln(2*a) + ${dv}`) },
      start: [5, 2], play: true, series: true, tmax: 20, seriesNames: ['prey', 'predators'], field: true, grid: 15, rate: 2,
    },
    caption: 'A model, not a census: no limit to the prey’s food, no age structure, no other species, populations treated as continuous. Arrows show direction only. Dashed: nullclines (prey x′ = 0 violet, predators y′ = 0 teal).',
  },
  example: {
    prompt: t`Take $a = 1$, $c = 0.75$ per year, $b = 0.5$ and $d = 0.25$ per thousand per year. Find the equilibria and their linearizations, show that $V = 0.25x - 0.75\ln x + 0.5y - \ln y$ is conserved, and find the period of small cycles.`,
    visual: { type: 'de-plane', params: { fx: 'x - 0.5*x*y', fy: '-0.75*y + 0.25*x*y', x: [0, 9], y: [0, 6], equal: false, aspect: 'wide', xlabel: 'prey x', ylabel: 'predators y', equilibria: 'label', levels: { fn: '0.25*x - 0.75*ln(x) + 0.5*y - ln(y)', values: [0.25, 0.3, 0.45, 0.7, 1.05, 1.5] }, seeds: [], readout: false, click: false, grid: 20 }, caption: 'Level curves of V — the trajectories. The innermost are nearly ellipses (the linearized centre); the outer ones swing close to the axes, where one population nearly vanishes.' },
    steps: [
      { label: 'Equilibria', text: t`$x' = x(1 - 0.5y) = 0$ and $y' = y(-0.75 + 0.25x) = 0$: either $x = y = 0$, or $y = 2$ and $x = 3$. (The other mixed cases, $x = 0$ with $y = 2$ or $y = 0$ with $x = 3$, fail one of the equations.)` },
      { label: 'Extinction', text: t`$J = ${M([['1 - 0.5y', '-0.5x'], ['0.25y', '-0.75 + 0.25x']])}$ at $(0, 0)$ is $${M([[1, 0], [0, -0.75]])}$: a **saddle**. Prey alone grow; predators alone die.` },
      { label: 'Coexistence', text: t`At $(3, 2)$: $J = ${M([[0, -1.5], [0.5, 0]])}$, $\tau = 0$, $\Delta = 0.75$: $\lambda = \pm0.866i$, a linearized **centre**. Not hyperbolic — the nonlinear terms could make it spiral either way.` },
      { label: 'The conserved quantity', text: t`$\dfrac{dV}{dt} = \left(0.25 - \dfrac{0.75}{x}\right)x' + \left(0.5 - \dfrac1y\right)y' = (0.25x - 0.75)(1 - 0.5y) + (0.5y - 1)(0.25x - 0.75) = 0$. So every trajectory stays on one level curve of $V$. $V$ has its minimum at $(3, 2)$ and its level curves round it are closed: the orbits are closed, a true centre.` },
      { label: 'Period', text: t`Small cycles turn at $\beta = \sqrt{\Delta} = \sqrt{ac} = 0.866$ per year: period $2\pi/0.866 = 7.26$ years. Larger cycles are slower — the one through $(5, 2)$ takes 7.42 years.` },
      { label: 'Sense check', text: t`Averaged over a cycle, $\dfrac{y'}{y} = -0.75 + 0.25x$ integrates to $\ln y(T) - \ln y(0) = 0$, so the average of $x$ is $0.75/0.25 = 3$: the equilibrium value, whatever the size of the cycle. Likewise the average of $y$ is $2$.` },
    ],
    answer: t`A saddle at $(0, 0)$ and a centre at $(3, 2)$, confirmed by the conserved $V$: the populations cycle, with period about 7.3 years for small cycles and average populations exactly $(3, 2)$.`,
  },
  practice: [
    num({
      id: 'coexist', difficulty: 1,
      gen(r) {
        const a = r.pick([0.8, 1, 1.2]), b = r.pick([0.02, 0.04]), c = r.pick([0.3, 0.6]), d = r.pick([0.005, 0.01]);
        const which = r.pick(['prey', 'predators']), ans = which === 'prey' ? c / d : a / b;
        return {
          prompt: t`Rabbits $x$ and foxes $y$: $x' = ${a}x - ${b}xy$, $y' = -${c}y + ${d}xy$ (time in years). How many ${which === 'prey' ? 'rabbits' : 'foxes'} are there at the coexistence equilibrium?`,
          answer: ans, tol: { rel: 1e-4 },
          errors: [{ value: which === 'prey' ? a / b : c / d, feedback: t`Swapped: the **prey** level is set by the predators’ equation ($y' = 0$ needs $x = c/d$), and the predator level by the prey’s ($x' = 0$ needs $y = a/b$).` }].filter((e) => Math.abs(e.value - ans) > 1e-3 * ans),
          hints: [t`Set both right-hand sides to zero with $x, y \neq 0$.`, t`$x' = x(${a} - ${b}y) = 0$ gives $y = ${a}/${b}$; $y' = y(-${c} + ${d}x) = 0$ gives $x = ${c}/${d}$.`],
          teach: 'At the Lotka–Volterra equilibrium the prey level c/d is set by the predators’ equation and the predator level a/b by the prey’s.',
          explain: t`$(x, y) = (c/d,\ a/b) = (${n(c / d)},\ ${n(a / b)})$. It looks backwards but makes sense: the number of prey must be exactly what keeps the predators from growing or shrinking.`,
          visual: plane(...lv(a, b, c, d), { x: [0, r6(2.2 * (c / d))], y: [0, r6(2.2 * (a / b))], equal: false, seeds: [], xlabel: 'rabbits', ylabel: 'foxes', caption: 'The direction field of the model. Where the arrows turn round is the equilibrium; find it exactly.' }),
        };
      },
    }),
    mcq({
      id: 'order', difficulty: 2,
      prompt: t`In the Lotka–Volterra cycles (prey across, predators up), in which order do the populations peak?`,
      choices: ['Prey first, then predators about a quarter cycle later', 'Predators first, then prey', 'Both at the same moment', 'It depends on the starting point'],
      answer: 0,
      why: {
        1: 'Predators grow only when prey are plentiful (x > c/d), so their numbers keep rising after the prey have peaked — they peak later, not earlier.',
        2: 'At the prey’s peak x′ = 0, which needs y = a/b — the predators are then at their middle value and still rising, not at their peak.',
        3: 'All cycles turn the same way round the equilibrium, so the order is the same for every start.',
      },
      hints: ['Follow the arrowheads round one closed orbit.', 'The prey peak where the orbit is farthest right; the predators where it is highest. Which comes first going round?'],
      teach: 'The cycle runs counterclockwise in the (prey, predator) plane: prey peak, then predators, then prey bottom out, then predators.',
      explain: t`The orbits run counterclockwise: from the rightmost point (peak prey) the state moves up to the top (peak predators), a quarter turn later. Plenty of food lets predators multiply; then they eat the prey down, then starve. Real hare–lynx records show a similar lag, though their causes are more complicated than this model.`,
      visual: plane(...lv(1, 0.5, 0.75, 0.25), { x: [0, 9], y: [0, 6], equal: false, seeds: [[5, 2], [4, 2]], xlabel: 'prey x', ylabel: 'predators y', T: 8, caption: 'Two Lotka–Volterra cycles, arrowheads forward in time.' }),
    }),
    num({
      id: 'average', difficulty: 2,
      gen(r) {
        const a = r.pick([0.6, 1, 1.5]), b = r.pick([0.2, 0.3]), c = r.pick([0.5, 0.9]), d = r.pick([0.1, 0.15]);
        const x0 = r6(1.6 * (c / d)), y0 = r6(a / b);
        return {
          prompt: t`For $x' = ${a}x - ${b}xy$, $y' = -${c}y + ${d}xy$, the populations start at $(${fmt(x0, 3)}, ${fmt(y0, 3)})$ and cycle. What is the **average** predator population over one full cycle?`,
          answer: a / b, tol: { rel: 1e-3 },
          errors: [{ value: c / d, feedback: t`That is the average prey population. For the predators, average $x'/x = a - by$ over a cycle.` }].filter((e) => Math.abs(e.value - a / b) > 1e-3 * (a / b)),
          hints: [t`Divide the prey equation by $x$: $(\ln x)' = ${a} - ${b}y$.`, t`Over one period $T$, $\ln x$ returns to its start, so $0 = ${a}T - ${b}\int_0^T y\,dt$.`],
          teach: 'Over a full Lotka–Volterra cycle the average populations equal the equilibrium values, however big the cycle.',
          explain: t`$\langle y\rangle = a/b = ${n(a / b)}$ — the same as the equilibrium, even though this cycle swings far from it. The graph’s peaks and troughs are lopsided, so the average is not halfway between them.`,
          visual: { type: 'de-plane', params: { fx: `${a}*x - ${b}*x*y`, fy: `-${c}*y + ${d}*x*y`, x: [0, r6(3 * (c / d))], y: [0, r6(3 * (a / b))], equal: false, aspect: 'wide', start: [x0, y0], series: true, tmax: r6(3 * (2 * Math.PI) / Math.sqrt(a * c)), seriesNames: ['prey', 'predators'], readout: false, click: false, grid: 20, xlabel: 'prey x', ylabel: 'predators y' }, caption: 'The cycle from the start, and both populations in time: tall narrow peaks, long shallow troughs.' },
        };
      },
    }),
    mcq({
      id: 'conserved', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 3]), c = r.pick([4, 5]);
        const V = (p, q, s, u) => t`$${p}x ${s} ${q}\ln x + y ${u}$`;
        return {
          prompt: t`For $x' = x(${a} - y)$, $y' = y(x - ${c})$, which quantity stays constant along every solution?`,
          choices: [V('', c, '-', `- ${a}\\ln y`), V('', c, '+', `+ ${a}\\ln y`), V('', a, '-', `- ${c}\\ln y`), t`$${c}x - \ln x + ${a}y - \ln y$`],
          answer: 0,
          why: {
            1: t`Check: $\tfrac{d}{dt}(x + ${c}\ln x) = (1 + ${c}/x)x' = (x + ${c})(${a} - y)$, and the $y$ part gives $(y + ${a})(x - ${c})$. They do not cancel.`,
            2: t`The coefficients are swapped: the $\ln x$ term must carry the predators’ constant ${c}, so that $(1 - ${c}/x)\,x' = (x - ${c})(${a} - y)$ matches the $y$ part.`,
            3: t`Differentiate: $(${c} - 1/x)x' = (${c}x - 1)(${a} - y)$, which does not cancel against the $y$ part.`,
          },
          hints: [t`Try $V = x - p\ln x + y - q\ln y$ and compute $dV/dt = (1 - p/x)x' + (1 - q/y)y'$.`, t`$(1 - p/x)x' = (x - p)(${a} - y)$ and $(1 - q/y)y' = (y - q)(x - ${c})$. Which $p$ and $q$ make the sum zero?`],
          teach: 'For x′ = x(a − by), y′ = y(dx − c), the quantity dx − c ln x + by − a ln y is conserved: its time derivative cancels term by term.',
          explain: t`With $p = ${c}$, $q = ${a}$: $(x - ${c})(${a} - y) + (y - ${a})(x - ${c}) = 0$ ✓. So $x - ${c}\ln x + y - ${a}\ln y$ is constant, and its level curves — closed loops round $(${c}, ${a})$ — are the orbits.`,
          visual: plane(`x*(${a} - y)`, `y*(x - ${c})`, { x: [0, 2.5 * c], y: [0, 2.5 * a], equal: false, seeds: [[1.5 * c, a], [1.2 * c, a]], T: 6, xlabel: 'x', ylabel: 'y', caption: 'Two orbits of the system. The conserved quantity has each of them as a level curve.' }),
        };
      },
    }),
    num({
      id: 'fishing', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 1.2]), b = 0.5, c = r.pick([0.6, 0.75]), d = 0.25, h = r.pick([0.1, 0.2, 0.3]);
        const before = c / d, after = (c + h) / d;
        return {
          prompt: t`Food fish $x$ and the sharks that eat them $y$ follow $x' = ${a}x - ${b}xy$, $y' = -${c}y + ${d}xy$. Fishing removes both at the same rate $h = ${h}$ per year: $x' = (${a} - ${h})x - ${b}xy$, $y' = -(${c} + ${h})y + ${d}xy$. What is the new average population of food fish?`,
          answer: after, tol: { rel: 1e-3 },
          errors: [{ value: (c - h) / d, feedback: t`Fishing adds to the sharks’ death rate: it becomes $c + h$, so the fish level $(c + h)/d$ goes **up**.` }, { value: before, feedback: 'That is the average without fishing. Fishing shifts the equilibrium.' }],
          hints: ['The averages over a cycle are the equilibrium values.', t`The fish level is set by the sharks’ equation: $y' = 0$ needs $x = (${c} + ${h})/${d}$.`],
          teach: 'Volterra’s principle: harvesting both species moves the equilibrium toward more prey and fewer predators.',
          explain: t`$x = (${c} + ${h})/${d} = ${n(after)}$, up from $${n(before)}$, while the sharks drop from $${n(a / b)}$ to $${n((a - h) / b)}$. This is how Volterra explained Umberto D’Ancona’s observation that the share of predatory fish in Adriatic catches rose when fishing slowed during the First World War.`,
          visual: plane(`${r6(a - h)}*x - ${b}*x*y`, `-${r6(c + h)}*y + ${d}*x*y`, { x: [0, 9], y: [0, 6], equal: false, seeds: [[r6(after + 1), r6((a - h) / b)]], T: 10, points: [{ x: before, y: r6(a / b), label: 'equilibrium without fishing', color: 'gold' }], xlabel: 'fish x', ylabel: 'sharks y', caption: 'A cycle of the fished system, and the old equilibrium (gold) for comparison.' }),
        };
      },
    }),
    mcq({
      id: 'competition', difficulty: 3,
      gen(r) {
        const V = r.pick([
          { fx: 'x*(1 - x - 0.5*y)', fy: 'y*(1 - 0.5*x - y)', ans: 0, eq: '(⅔, ⅔)', xr: [0, 1.6], yr: [0, 1.6], tex: t`x' = x(1 - x - 0.5y),\ y' = y(1 - 0.5x - y)`, J: t`J = ${M([['-\\tfrac23', '-\\tfrac13'], ['-\\tfrac13', '-\\tfrac23']])}`, why: 'a stable node: each species limits itself more than it limits the other' },
          { fx: 'x*(3 - x - 2*y)', fy: 'y*(2 - x - y)', ans: 1, eq: '(1, 1)', xr: [0, 3.5], yr: [0, 2.5], tex: t`x' = x(3 - x - 2y),\ y' = y(2 - x - y)`, J: t`J = ${M([[-1, -2], [-1, -1]])}`, why: 'a saddle: each species limits the other more than itself' },
          { fx: 'x*(2 - x - y)', fy: 'y*(1.5 - x - y)', ans: 2, eq: 'none', xr: [0, 2.5], yr: [0, 2.5], tex: t`x' = x(2 - x - y),\ y' = y(1.5 - x - y)`, J: '', why: 'no coexistence point at all: the nullclines are parallel, with x’s farther out' },
        ]);
        const choices = ['Both survive, settling to a fixed balance', 'One dies out — which one depends on the starting populations', 'x always wins and y dies out', 'y always wins and x dies out'];
        const whyAll = {
          0: 'Coexistence needs an interior equilibrium that attracts: each species must hold itself back more than it holds back the other.',
          1: 'That happens when the interior equilibrium is a saddle, its stable trajectories splitting the plane between two winners.',
          2: 'For x to win from every start, its nullcline must lie entirely outside y’s, leaving no interior equilibrium.',
          3: 'For y to win, y’s nullcline would have to lie outside x’s.',
        };
        const why = {}; for (const k of [0, 1, 2, 3]) if (k !== V.ans) why[k] = whyAll[k];
        return {
          prompt: t`Two species compete for the same food: $${V.tex}$. What happens in the long run, starting with both present?`,
          choices, answer: V.ans, why,
          hints: ['Find the equilibrium with both species present (where the two slanted nullclines cross), if there is one.', V.ans === 2 ? 'Here the slanted nullclines x + y = 2 and x + y = 1.5 never cross.' : t`At ${V.eq}, $${V.J}$. Compute $\tau$ and $\Delta$.`],
          teach: 'For competing species, coexistence is stable when each species limits itself more than the other; otherwise one is excluded.',
          explain: t`The interior equilibrium is ${V.eq === 'none' ? 'missing' : V.eq}: ${V.why}. ${V.ans === 0 ? 'Every start with both present approaches it.' : V.ans === 1 ? 'Starts on one side of its stable trajectories end with only x, on the other side with only y — competitive exclusion.' : 'Wherever y’s nullcline lies, x can still grow, so x wins from every start.'}`,
          visual: plane(V.fx, V.fy, { x: V.xr, y: V.yr, equal: false, nullclines: true, seeds: [], xlabel: 'species x', ylabel: 'species y', caption: 'The direction field and nullclines (x′ = 0 violet, y′ = 0 teal). Trajectories are left for you to deduce.' }),
        };
      },
    }),
    code({
      id: 'lv-solve', difficulty: 3,
      prompt: t`Check the worked example numerically. Integrate $x' = x - 0.5xy$, $y' = -0.75y + 0.25xy$ from $(5, 2)$ for 30 years with \`solve_ivp\` (tight tolerances), then (1) find the largest drift of $V = 0.25x - 0.75\ln x + 0.5y - \ln y$ from its starting value, and (2) measure the period from the times at which $x$ crosses 3 going up.`,
      starter: t`import numpy as np
from scipy.integrate import solve_ivp

def f(t, z):
    x, y = z
    return [x - 0.5*x*y, -0.75*y + 0.25*x*y]

sol = solve_ivp(f, [0, 30], [5.0, 2.0], rtol=1e-10, atol=1e-12, max_step=0.01)
x, y, t = sol.y[0], sol.y[1], sol.t

V = None        # replace: V along the solution (an array)
drift = None    # replace: the largest |V - V[0]|

# times where x crosses 3 upward, by linear interpolation between samples
up = np.where((x[:-1] < 3) & (x[1:] >= 3))[0]
crossings = t[up] + (3 - x[up]) / (x[up + 1] - x[up]) * (t[up + 1] - t[up])
period = None   # replace: the mean spacing of the crossings

print("drift", drift)
print("period", period)
`,
      answer: t`import numpy as np
from scipy.integrate import solve_ivp

def f(t, z):
    x, y = z
    return [x - 0.5*x*y, -0.75*y + 0.25*x*y]

sol = solve_ivp(f, [0, 30], [5.0, 2.0], rtol=1e-10, atol=1e-12, max_step=0.01)
x, y, t = sol.y[0], sol.y[1], sol.t

V = 0.25*x - 0.75*np.log(x) + 0.5*y - np.log(y)
drift = np.max(np.abs(V - V[0]))

# times where x crosses 3 upward, by linear interpolation between samples
up = np.where((x[:-1] < 3) & (x[1:] >= 3))[0]
crossings = t[up] + (3 - x[up]) / (x[up + 1] - x[up]) * (t[up + 1] - t[up])
period = np.mean(np.diff(crossings))

print("drift", drift)
print("period", period)
`,
      tests: [
        { name: t`$V$ is conserved: the drift is below $10^{-7}$`, code: 'drift is not None and drift < 1e-7' },
        { name: 'the period of this cycle is about 7.42 years', code: 'period is not None and abs(period - 7.421) < 0.01' },
        { name: t`it is longer than the small-cycle period $2\pi/\sqrt{ac} = 7.26$ years`, code: 'period is not None and period > 2*np.pi/np.sqrt(0.75)' },
      ],
      hints: [t`\`V = 0.25*x - 0.75*np.log(x) + 0.5*y - np.log(y)\` works on whole arrays.`, t`\`np.max(np.abs(V - V[0]))\` for the drift; \`np.mean(np.diff(crossings))\` for the period.`],
      teach: 'A conserved quantity is also a free accuracy check on any numerical solution: it should stay constant to the solver’s tolerance.',
      explain: t`The drift is around $10^{-9}$ — the solver’s tolerance, not the physics — and the period is 7.42 years, a little longer than the 7.26 of the linearization, because big cycles linger near the axes where both populations change slowly.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-small-period', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 0.8, 1.2]), c = r.pick([0.3, 0.6, 0.9]), b = 0.02, d = 0.01;
        const T = (2 * Math.PI) / Math.sqrt(a * c);
        return {
          prompt: t`For $x' = ${a}x - ${b}xy$, $y' = -${c}y + ${d}xy$ (time in years), what is the period of small cycles about the coexistence equilibrium?`,
          answer: T, units: 'yr', tol: { rel: 0.005 },
          errors: [{ value: (2 * Math.PI) / (a * c), feedback: t`$\Delta = ac$, so $\beta = \sqrt{ac}$ — take the square root.` }, { value: 2 * Math.PI / Math.sqrt(b * d), feedback: t`The encounter rates cancel: at $(c/d, a/b)$, $J = ${M([[0, '-bc/d'], ['ad/b', 0]])}$, whose determinant is $ac$.` }],
          hints: [t`At $(c/d,\ a/b)$ the Jacobian is $${M([[0, '-bc/d'], ['ad/b', 0]])}$.`, t`$\tau = 0$ and $\Delta = ac$, so $\lambda = \pm i\sqrt{ac}$ and the period is $2\pi/\sqrt{ac}$.`],
          teach: 'Small Lotka–Volterra cycles have period 2π/√(ac): only the two species’ own growth and death rates matter.',
          explain: t`$T = 2\pi/\sqrt{${a}\times${c}} = ${fmt(T, 3)}$ years. Larger cycles take longer, as the code exercise showed.`,
          visual: plane(...lv(a, b, c, d), { x: [0, r6(2.5 * (c / d))], y: [0, r6(2.5 * (a / b))], equal: false, seeds: [[r6(1.15 * (c / d)), r6(a / b)]], T: 2 * T, xlabel: 'prey x', ylabel: 'predators y', caption: 'A small cycle round the coexistence equilibrium.' }),
        };
      },
    }),
    num({
      id: 'cp-lotka-reaction', difficulty: 3, transfer: true,
      gen(r) {
        const k1a = r.pick([0.4, 0.6]), k2 = r.pick([2, 5]), k3 = r.pick([0.1, 0.3]);
        return {
          prompt: t`In 1920 Lotka showed that a hypothetical chain of reactions such as $A + X \to 2X$, $X + Y \to 2Y$, $Y \to B$, with the reservoir $A$ held constant, gives undamped oscillations. The concentrations of the intermediates obey $x' = k_1a\,x - k_2\,xy$ and $y' = k_2\,xy - k_3\,y$ with $k_1a = ${k1a}$ s⁻¹, $k_2 = ${k2}$ L/(mol·s) and $k_3 = ${k3}$ s⁻¹. About what concentration of $X$, in mol/L, do the oscillations swing?`,
          answer: k3 / k2, units: 'mol/L', tol: { rel: 1e-3 },
          errors: [{ value: k1a / k2, feedback: t`That is the level of $Y$. The level of $X$ comes from $y' = 0$: $k_2x = k_3$.` }],
          hints: [t`This is the Lotka–Volterra system with $a = k_1a$, $b = d = k_2$, $c = k_3$.`, t`The cycles average to the equilibrium: $x = c/d = k_3/k_2$.`],
          teach: 'The Lotka–Volterra equations describe any “consumer eats resource” loop — chemical intermediates as well as animals.',
          explain: t`$x^* = k_3/k_2 = ${n(k3 / k2)}$ mol/L (and $y^* = k_1a/k_2 = ${n(k1a / k2)}$ mol/L). Real chemical oscillators, like the Belousov–Zhabotinsky reaction, do not have Lotka’s neutral cycles, whose size depends on the start: they settle onto one isolated cycle — a limit cycle (DE-5.5).`,
          visual: plane(`${k1a}*x - ${k2}*x*y`, `${k2}*x*y - ${k3}*y`, { x: [0, r6(3 * (k3 / k2))], y: [0, r6(3 * (k1a / k2))], equal: false, seeds: [[r6(1.6 * (k3 / k2)), r6(k1a / k2)]], T: 200, xlabel: '[X] (mol/L)', ylabel: '[Y] (mol/L)', caption: 'Lotka’s hypothetical reaction: one oscillation of the two intermediates.' }),
        };
      },
    }),
    mcq({
      id: 'cp-why-not-linear', difficulty: 3,
      prompt: t`At the Lotka–Volterra coexistence point the Jacobian has eigenvalues $\pm i\sqrt{ac}$. Why can we still be sure the cycles close?`,
      choices: [
        t`Because $V = dx - c\ln x + by - a\ln y$ is conserved and has a strict minimum there, so nearby level curves — the orbits — are closed`,
        'Because a linearized centre is always a true centre',
        'Because the eigenvalues are purely imaginary, the Hartman–Grobman theorem applies',
        'Because populations cannot be negative',
      ],
      answer: 0,
      why: {
        1: t`Not always: for $x' = y$, $y' = -x + y^3$ the linearized centre is really an unstable spiral (DE-5.1).`,
        2: 'Hartman–Grobman needs hyperbolic equilibria — no eigenvalue with zero real part. Purely imaginary ones are exactly what it excludes.',
        3: 'That keeps orbits in the positive quadrant, but a spiral in the positive quadrant would also stay positive. It does not force them to close.',
      },
      hints: ['The linearization cannot decide a centre. What extra information does this system have?', 'A trajectory must stay on one level curve of V. What do the level curves near a minimum look like?'],
      teach: 'A conserved quantity with a strict minimum at an equilibrium makes it a true centre, even when linearization alone cannot decide.',
      explain: t`Along any orbit $V$ is constant, and near its minimum the level sets of $V$ are small closed loops round $(c/d, a/b)$. A trajectory cannot spiral in or out without changing $V$, so it closes.`,
      visual: { type: 'de-plane', params: { fx: 'x - 0.5*x*y', fy: '-0.75*y + 0.25*x*y', x: [1, 5.5], y: [0.8, 3.6], equal: false, aspect: 'wide', field: false, seeds: [], readout: false, click: false, levels: { fn: '0.25*x - 0.75*ln(x) + 0.5*y - ln(y)', values: [0.24, 0.26, 0.3, 0.36, 0.45] }, xlabel: 'prey x', ylabel: 'predators y' }, caption: 'Level curves of V round the coexistence point: nested closed loops.' },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §8.3 Applications of nonlinear systems', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'A. J. Lotka, Undamped oscillations derived from the law of mass action, J. Am. Chem. Soc. 42 (1920) 1595', url: 'https://doi.org/10.1021/ja01453a010' },
    { label: 'Scholarpedia: Predator–prey model', url: 'http://www.scholarpedia.org/article/Predator-prey_model' },
  ],
});
