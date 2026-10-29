// Population models past the logistic: harvesting and the saddle-node
// bifurcation, a survival threshold (Allee effect), effort-based harvesting
// and its maximum sustainable yield, and the Gompertz law.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

export default lesson({
  id: 'math2280.DE-2.5',
  title: 'Population models: exponential and logistic',
  minutes: 12, difficulty: 3,
  intro: t`Exponential growth $P' = rP$ never stops; the logistic law $P' = rP(1 - P/K)$ adds a ceiling, the carrying capacity $K$. Real models then add whatever else acts on the population — and as long as the equation stays **autonomous**, its phase line tells the whole story. Take a fishery harvested at a constant rate $H$:

$$\frac{dP}{dt} = rP\left(1 - \frac{P}{K}\right) - H$$

For a small harvest there are two equilibria: a stable level the stock settles to, and an unstable **threshold** below which it collapses. As $H$ grows the two approach each other; at $H = rK/4$ they merge and vanish — a **saddle-node bifurcation** — and beyond it every stock is fished out in a finite time.`,
  symbols: [
    { tex: t`P(t)`, text: 'the size of the population (here, a fish stock in thousands of tonnes)' },
    { tex: t`r`, text: t`the per-capita growth rate while the population is small, in $\text{yr}^{-1}$` },
    { tex: t`K`, text: 'the carrying capacity: the level the unharvested population settles to' },
    { tex: t`H`, text: t`the harvest, removed at a constant rate, in thousands of tonnes per year` },
    { tex: t`rK/4`, text: 'the largest harvest the stock can sustain — the peak of the logistic growth rate, reached at P = K/2' },
  ],
  why: t`Phase lines and bifurcations predict sudden collapses — of a fishery, an ecosystem, or the debris population in low Earth orbit — that no smooth extrapolation of past data would ever show.`,
  visual: {
    type: 'de-slopefield',
    title: 'Fishing a stock down to a tipping point',
    lead: t`The slope field of the harvested logistic equation, with its phase line beside it: green, the stable level the stock settles to; red, the threshold below which it collapses. The growth rate here is $r = 0.5\ \text{yr}^{-1}$ and the carrying capacity $K = 100$ thousand tonnes, so $rK/4 = 12.5$.`,
    tasks: [
      'Raise the harvest H: the stable level (green) sinks and the threshold (red) rises towards it.',
      'At H = 12.5 the two merge into one half-filled, semi-stable point: the maximum sustainable yield.',
      'Push H past 12.5: no equilibrium is left, and every stock, however large, is fished to zero.',
    ],
    params: {
      f: 'r*y*(1 - y/K) - H', x: [0, 40], y: [0, 125], xlabel: 't (years)', ylabel: 'P (kt)', phaseLine: true, grid: [19, 15],
      seeds: [[0, 15], [0, 35], [0, 115]], seedColor: 'accent2',
      sliders: [
        { key: 'H', label: 'Harvest $H$', min: 0, max: 16, step: 0.25, value: 6, unit: t`\text{kt/yr}`, explain: 'Thousands of tonnes removed each year, whatever the size of the stock.' },
        { key: 'r', label: 'Growth rate $r$', min: 0.2, max: 1, step: 0.05, value: 0.5, unit: t`\text{yr}^{-1}`, explain: 'How fast a small stock grows; the safe harvest rK/4 grows with it.' },
      ],
      constants: { K: 100 },
    },
    caption: t`A teaching model: real stocks have age structure, random good and bad years, and harvests that change with the stock. The collapse of the north-west Atlantic cod in the early 1990s is the classic case of fishing past what a stock can replace. Curves are traced numerically (RK4).`,
  },
  example: {
    prompt: t`A stock obeys $P' = 0.5P\left(1 - \dfrac{P}{100}\right) - 8$ ($P$ in thousands of tonnes, $t$ in years). Find the equilibria and their stability, and the largest harvest the stock could sustain.`,
    visual: {
      type: 'graph',
      params: {
        x: [-5, 110], y: [-12, 6], xlabel: 'P (kt)', ylabel: 'dP/dt',
        curves: [{ fn: '0.5*x*(1 - x/100) - 8', color: 'accent', label: 'rate with H = 8', labelAt: 60, labelDy: -12 }, { fn: '0.5*x*(1 - x/100)', color: 'ink3', dash: true, width: 1.6, label: 'no harvest', labelAt: 85, labelDy: -12 }],
        points: [{ x: 20, y: 0, color: 'bad', label: 'threshold 20', labelDx: -30, labelDy: 16 }, { x: 80, y: 0, color: 'good', label: 'stable 80', labelDx: -20, labelDy: 16 }],
      },
      caption: t`The growth rate against the stock size: the harvest shifts the logistic parabola down by 8. Its zeros are the equilibria.`,
    },
    steps: [
      { label: 'Equilibria', text: t`Set the rate to zero: $0.5P - 0.005P^2 - 8 = 0$, that is $P^2 - 100P + 1600 = 0$, so $P = 50 \pm \sqrt{2500 - 1600} = 50 \pm 30$: $\;P = 20$ and $P = 80$.` },
      { label: 'Stability', text: t`With $f(P) = 0.5P(1 - P/100) - 8$, $\;f'(P) = 0.5 - 0.01P$. At 80, $f' = -0.3 < 0$: **stable**. At 20, $f' = +0.3 > 0$: **unstable**.` },
      { label: 'What it means', text: t`A stock above 20 settles at 80. A stock pushed below 20 — by a bad year, or overfishing — declines to zero even though the harvest has not changed: 20 is a tipping point.` },
      { label: 'The largest harvest', text: t`The equilibria are $P = 50 \pm \sqrt{2500 - 200H}$. They exist while $2500 \ge 200H$, that is $H \le 12.5$ — which is $rK/4$, the peak of the logistic growth rate, reached at $P = K/2$.` },
      { label: 'Sense check', text: t`With $H = 0$ the equilibria are 0 and 100 = $K$. Harvesting lowers the stable level and raises the threshold, until at $H = 12.5$ both sit at 50, and a fishery run there has no margin at all.` },
    ],
    answer: t`Equilibria at 20 kt (unstable threshold) and 80 kt (stable); the maximum sustainable harvest is 12.5 kt per year, at a stock of 50 kt.`,
  },
  practice: [
    num({
      id: 'stable-level', difficulty: 2,
      gen(r) {
        const K = r.pick([100, 200, 400]), rr = r.pick([0.4, 0.5, 0.8]), d = K * r.pick([0.2, 0.3, 0.35]);
        const lo = K / 2 - d, hi = K / 2 + d, H = (rr * lo * hi) / K;
        return {
          prompt: t`A harvested stock obeys $P' = ${rr}P\left(1 - \dfrac{P}{${K}}\right) - ${nice(H)}$. What level does a healthy (large) stock settle to?`,
          answer: hi, tol: { rel: 0.005 },
          errors: [{ value: lo, feedback: 'That is the unstable threshold: stocks just above it grow away from it, towards the larger root.' }, { value: K, feedback: 'That is the carrying capacity without harvesting; the harvest lowers the stable level.' }],
          hints: [t`Set the rate to zero: $${rr}P - ${nice(rr / K)}P^2 - ${nice(H)} = 0$.`, t`Multiply by $-${nice(K / rr)}$: $P^2 - ${K}P + ${nice((H * K) / rr)} = 0$. Take the larger root.`],
          teach: 'A harvested logistic stock settles at the larger root of rP(1 − P/K) = H, the stable equilibrium.',
          explain: t`$P = ${K / 2} \pm \sqrt{${(K / 2) ** 2} - ${nice((H * K) / rr)}} = ${K / 2} \pm ${nice(d)}$. The larger root, ${nice(hi)}, has $f'(P) = ${rr}(1 - 2P/${K}) < 0$: stable. The smaller, ${nice(lo)}, is the threshold.`,
          visual: { type: 'graph', params: { x: [0, 1.1 * K], y: [-1.3 * H, 0.4 * rr * K / 4 + 1], xlabel: 'P', ylabel: 'dP/dt', curves: [{ fn: `${rr}*x*(1 - x/${K}) - ${H}`, color: 'accent' }] }, caption: 'The growth rate against the stock size, harvest included. Equilibria sit where it crosses zero.' },
        };
      },
    }),
    num({
      id: 'effort-yield', difficulty: 2,
      gen(r) {
        const rr = r.pick([0.4, 0.5, 0.6]), K = r.pick([100, 200]), E = rr * r.pick([0.25, 0.4, 0.6, 0.75]);
        const Pst = K * (1 - E / rr), Y = E * Pst;
        return {
          prompt: t`Instead of a fixed tonnage, a fleet catches a fixed **fraction** $E = ${nice(E)}$ of the stock per year: $P' = ${rr}P\left(1 - \dfrac{P}{${K}}\right) - ${nice(E)}P$. Once the stock has settled, what is the yearly catch $EP$?`,
          answer: Y, tol: { rel: 0.005 },
          errors: [{ value: E * K, feedback: 'The stock does not stay at K: fishing lowers its equilibrium to K(1 − E/r).' }, { value: (rr * K) / 4, feedback: t`$rK/4$ is the best possible yield, reached only at $E = r/2$.` }].filter((e) => Math.abs(e.value - Y) > 0.02 * Y),
          hints: [t`Factor out $P$: the nonzero equilibrium solves $${rr}\left(1 - \dfrac{P}{${K}}\right) = ${nice(E)}$.`, t`$P^* = ${K}\left(1 - \dfrac{${nice(E)}}{${rr}}\right)$; the catch is $E\,P^*$.`],
          teach: 'With proportional harvesting the stock settles at K(1 − E/r), and the sustained catch E·K(1 − E/r) is largest at E = r/2.',
          explain: t`$P^* = ${K}(1 - ${nice(E)}/${rr}) = ${nice(Pst)}$, so the catch is $${nice(E)} \times ${nice(Pst)} = ${nice(Y)}$ per year. The best effort is $E = r/2 = ${nice(rr / 2)}$, giving $rK/4 = ${nice((rr * K) / 4)}$ — and unlike a fixed quota, this rule never drives the stock to zero, since $P = K(1 - E/r)$ stays stable for every $E < r$.`,
          visual: { type: 'graph', params: { x: [0, rr * 1.05], y: [0, (rr * K) / 4 * 1.3], xlabel: 'effort E (per year)', ylabel: 'sustained catch', curves: [{ fn: `x*${K}*(1 - x/${rr})`, domain: [0, rr], color: 'accent' }] }, caption: 'The sustained catch against the fishing effort: none at zero effort, none when the effort reaches r and wipes out the stock.' },
        };
      },
    }),
    mcq({
      id: 'allee', difficulty: 2,
      prompt: t`Some species need company to breed, which gives a threshold $T$ below which they decline (an **Allee effect**): $P' = rP\left(\dfrac{P}{T} - 1\right)\left(1 - \dfrac{P}{K}\right)$ with $0 < T < K$. Which starting populations die out?`,
      choices: [t`Those below $T$`, t`Those below $K$`, t`Those above $K$`, 'None: every positive population approaches K'],
      answer: 0,
      why: {
        1: t`Between $T$ and $K$ all three factors are positive, so the rate is positive and the population grows to $K$.`,
        2: t`Above $K$ the population shrinks — but only back to $K$, which is stable.`,
        3: t`Below $T$ the factor $(P/T - 1)$ is negative, so the rate is negative and the population falls to 0.`,
      },
      hints: ['Find the sign of each factor in the three ranges 0 < P < T, T < P < K and P > K.'],
      teach: 'A threshold equilibrium between two stable ones splits the starting values into two fates.',
      explain: t`The equilibria are $0$ (stable), $T$ (unstable) and $K$ (stable). Below $T$ the rate is negative: extinction. Conservationists worry about exactly this — a population can fall below its threshold and keep falling with no further harm done to it.`,
      visual: { type: 'graph', params: { x: [0, 110], y: [-2.5, 8], xlabel: 'P', ylabel: 'dP/dt', curves: [{ fn: '0.2*x*(x/25 - 1)*(1 - x/100)', color: 'accent' }], points: [{ x: 25, y: 0, color: 'ink', label: 'T', labelDx: -12, labelDy: -12 }, { x: 100, y: 0, color: 'ink', label: 'K', labelDx: 6, labelDy: -12 }] }, caption: t`The growth rate against $P$ for $T = 25$, $K = 100$: read off its sign between the equilibria.` },
    }),
    mcq({
      id: 'saddle-node', difficulty: 2,
      prompt: t`The picture shows the growth rate $rP(1 - P/K) - H$ for three harvests. As $H$ rises past $rK/4$, what happens to the equilibria?`,
      choices: [
        'The stable level and the threshold move together, merge, and vanish: no equilibrium is left',
        'The stable level becomes unstable while the threshold becomes stable',
        'The two equilibria move apart',
        'A new stable equilibrium appears at zero',
      ],
      answer: 0,
      why: {
        1: t`Raising $H$ only lowers the parabola; it never flips the sign of its slope at a crossing. The crossings slide together until they meet.`,
        2: t`Lowering the parabola brings its two zeros together, not apart.`,
        3: t`At $P = 0$ the rate is $-H < 0$: the stock keeps falling, so zero is not an equilibrium at all when $H > 0$.`,
      },
      hints: ['Equilibria are where each curve crosses the horizontal axis.', 'What happens to those crossings as the parabola slides down?'],
      teach: 'In a saddle-node bifurcation a stable and an unstable equilibrium collide and annihilate as a parameter passes a critical value.',
      explain: t`Raising $H$ shifts the parabola down. Its two zeros — stable level and threshold — slide together, touch at $P = K/2$ when $H = rK/4$, and then disappear. With no equilibrium left, $P' < 0$ everywhere: collapse.`,
      visual: { type: 'graph', params: { x: [0, 110], y: [-20, 15], xlabel: 'P (kt)', ylabel: 'dP/dt', curves: [[4, 'good'], [12.5, 'warn'], [16, 'bad']].map(([H, color], i) => ({ fn: `0.5*x*(1 - x/100) - ${H}`, color, label: `H = ${H}`, labelAt: 50, labelDx: -24, labelDy: i === 2 ? 14 : -12 })) }, caption: t`The rate $0.5P(1 - P/100) - H$ for three harvests.` },
    }),
    expr({
      id: 'gompertz', difficulty: 3,
      gen(r) {
        const rr = r.pick([0.2, 0.3, 0.5]), K = r.pick([1000, 500]), f0 = r.pick([0.1, 0.2, 0.05]);
        const P0 = K * f0, L0 = Math.log(f0);
        const ans = `${K}*exp(${L0}*exp(-${rr}t))`;
        return {
          prompt: t`Tumours, and some animal populations, follow the **Gompertz** law $P' = ${rr}\,P\ln\dfrac{${K}}{P}$. Solve it with $P(0) = ${P0}$ using the substitution $u = \ln(P/${K})$.`,
          answer: ans, answerTeX: t`P = ${K}\exp\!\left(e^{-${rr}t}\ln ${nice(f0)}\right)`, lhs: 'P',
          vars: { t: [0, 10] },
          integrand: `${rr}*(${ans})*ln(${K}/(${ans}))`,
          errors: [{ answer: `${K}*exp(${L0}*exp(${rr}t))`, feedback: t`$u' = P'/P = -${rr}\,u$, so $u$ decays: the exponent is $-${rr}t$.` }, { answer: `${P0}*exp(${rr}t)`, feedback: t`That is exponential growth. The factor $\ln(K/P)$ shrinks as $P$ grows, so the growth slows to a stop at $P = ${K}$.` }],
          hints: [t`$u = \ln P - \ln ${K}$, so $u' = P'/P = ${rr}\ln(${K}/P) = -${rr}\,u$.`, t`$u = u_0e^{-${rr}t}$ with $u_0 = \ln(${P0}/${K}) = \ln ${nice(f0)}$; then $P = ${K}e^{u}$.`],
          teach: 'A substitution that turns the equation into u′ = −ru turns the Gompertz law into exponential decay of ln(P/K).',
          explain: t`$u = \ln ${nice(f0)}\,e^{-${rr}t}$, so $P = ${K}\exp\!\left(e^{-${rr}t}\ln ${nice(f0)}\right)$. It is S-shaped like the logistic curve, but its fastest growth comes at $P = K/e \approx ${Math.round(K / Math.E)}$ rather than $K/2$.`,
          visual: { type: 'de-slopefield', params: { f: `${rr}*y*ln(${K}/max(y, 0.001))`, x: [0, 20], y: [0, 1.15 * K], xlabel: 't', ylabel: 'P', grid: [19, 13], points: [{ x: 0, y: P0, color: 'gold', label: 'start' }] }, caption: t`The slope field of the Gompertz equation with the starting point; $P = ${K}$ is a stable equilibrium.` },
        };
      },
    }),
    num({
      id: 'collapse-time', difficulty: 3,
      gen(r) {
        const H = r.pick([15, 20, 25]), rr = 0.5, K = 100, P0 = 100;
        // P' = −0.005[(P − 50)² + q²] with q² = 200H − 2500
        const q = Math.sqrt(200 * H - 2500);
        const T = (200 / q) * (Math.atan((P0 - 50) / q) - Math.atan(-50 / q));
        return {
          prompt: t`The stock $P' = 0.5P\left(1 - \dfrac{P}{100}\right) - ${H}$ starts at its carrying capacity, $P(0) = 100$ kt. The harvest exceeds $rK/4 = 12.5$, so the stock is doomed. Completing the square, $P' = -0.005\left[(P - 50)^2 + ${200 * H - 2500}\right]$. How many years until it reaches zero?`,
          answer: T, units: 'yr', tol: { rel: 0.01 },
          errors: [{ value: P0 / H, feedback: 'That ignores the stock’s own growth, which slows the decline while P is near 50.' }].filter((e) => Math.abs(e.value - T) > 0.02 * T),
          hints: [t`Separate: $\displaystyle\int_{100}^{0}\frac{dP}{(P - 50)^2 + ${200 * H - 2500}} = -0.005\,T$.`, t`$\displaystyle\int\frac{dP}{(P - 50)^2 + q^2} = \frac1q\arctan\frac{P - 50}{q}$ with $q = \sqrt{${200 * H - 2500}} = ${fmt(q, 4)}$.`, t`$T = \dfrac{1}{0.005\,q}\left[\arctan\dfrac{50}{q} - \arctan\dfrac{-50}{q}\right]$.`],
          teach: 'Beyond the bifurcation the phase line has no stop, and separation gives the finite time to collapse.',
          explain: t`$q = ${fmt(q, 4)}$ and $T = \dfrac{200}{q}\cdot 2\arctan\dfrac{50}{q} = ${fmt(T, 3)}$ years. The decline is slowest near $P = 50$, where the stock’s own growth is fastest — which is why a collapse can look like a slow drift before the end.`,
          visual: { type: 'de-slopefield', params: { f: `0.5*y*(1 - y/100) - ${H}`, x: [0, 15], y: [0, 110], xlabel: 't (years)', ylabel: 'P (kt)', grid: [17, 13], points: [{ x: 0, y: 100, color: 'gold', label: 'start' }] }, caption: t`The slope field with $H = ${H}$: every segment points down.` },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-debris', difficulty: 3, transfer: true,
      gen(r) {
        const tau = r.pick([20, 25, 40]), k = r.pick([1e-6, 2e-6]);
        const Sc = 1 / (4 * k * tau * tau);
        return {
          prompt: t`A **toy model** of orbital debris: the number $N$ of large objects in a shell of low Earth orbit changes as
$$\frac{dN}{dt} = S - \frac{N}{\tau} + kN^2,$$
where $S$ is the number launched or shed per year, $\tau = ${tau}$ years is the time air drag takes to remove an object, and $kN^2$ with $k = ${k === 1e-6 ? t`1\times10^{-6}` : t`2\times10^{-6}`}\ \text{yr}^{-1}$ counts new fragments from collisions. Above what launch rate $S$ does the model have no equilibrium at all — a runaway collisional cascade?`,
          answer: Sc, tol: { rel: 0.01 },
          errors: [{ value: 1 / (k * tau * tau), feedback: t`The quadratic $kN^2 - N/\tau + S = 0$ has real roots while $1/\tau^2 - 4kS \ge 0$: keep the 4.` }],
          hints: [t`Equilibria solve $kN^2 - \dfrac{N}{\tau} + S = 0$.`, t`They exist while the discriminant $\dfrac{1}{\tau^2} - 4kS \ge 0$, so the critical rate is $S_c = \dfrac{1}{4k\tau^2}$.`],
          teach: 'The same saddle-node bifurcation as a harvested fishery: a source term pushed past a critical value removes every equilibrium.',
          explain: t`$S_c = \dfrac{1}{4k\tau^2} = \dfrac{1}{4 \times ${k === 1e-6 ? t`10^{-6}` : t`2\times10^{-6}`} \times ${tau * tau}} \approx ${Math.round(Sc)}$ objects per year. Below it the smaller equilibrium is stable and the larger is a threshold, as for the fishery. This is the logic of the Kessler syndrome; the numbers here are illustrative, not a forecast — real debris models track sizes, altitudes and solar activity.`,
          visual: { type: 'graph', params: { x: [0, 1 / (k * tau) * 1.2], y: [-0.6 * Sc, 1.2 * Sc], xlabel: 'number of objects N', ylabel: 'dN/dt (per year)', curves: [0.4, 0.7, 1.5].map((m, i) => ({ fn: `${m * Sc} - x/${tau} + ${k}*x^2`, color: ['good', 'warn', 'bad'][i] })) }, caption: 'The rate of change against N for three launch rates; each curve starts at its launch rate S at N = 0. Equilibria are where a curve meets the horizontal axis.' },
        };
      },
    }),
    num({
      id: 'cp-threshold', difficulty: 2,
      gen(r) {
        const K = r.pick([100, 200]), rr = r.pick([0.4, 0.5]), d = K * r.pick([0.25, 0.3]);
        const lo = K / 2 - d, hi = K / 2 + d, H = (rr * lo * hi) / K;
        return {
          prompt: t`For $P' = ${rr}P\left(1 - \dfrac{P}{${K}}\right) - ${nice(H)}$, below what stock size does the population collapse?`,
          answer: lo, tol: { rel: 0.005 },
          errors: [{ value: hi, feedback: 'That is the stable level. Collapse happens below the other root, the unstable one.' }],
          hints: [t`Find both roots of $${rr}P(1 - P/${K}) = ${nice(H)}$; the threshold is the unstable one.`],
          teach: 'The collapse threshold of a harvested stock is the smaller, unstable equilibrium.',
          explain: t`The roots are $${K / 2} \pm ${nice(d)}$: ${nice(lo)} and ${nice(hi)}. Below ${nice(lo)} the rate is negative and stays negative all the way to zero.`,
          visual: { type: 'de-slopefield', params: { f: `${rr}*y*(1 - y/${K}) - ${H}`, x: [0, 40], y: [0, 1.1 * K], xlabel: 't (years)', ylabel: 'P', grid: [17, 13] }, caption: 'The slope field of the harvested stock, without its phase line.' },
        };
      },
    }),
    mcq({
      id: 'cp-semistable', difficulty: 2,
      prompt: t`A fishery is run exactly at $H = rK/4$, the maximum sustainable yield, and the stock sits at $P = K/2$. What happens if one bad year knocks the stock slightly below $K/2$?`,
      choices: ['It declines all the way to zero, even if the harvest is unchanged', 'It recovers to K/2, because K/2 is stable', 'It recovers to K', 'It stays at its new, lower level'],
      answer: 0,
      why: {
        1: t`At $H = rK/4$ the equilibrium $K/2$ is semi-stable: it attracts from above only.`,
        2: t`With the harvest on, the stock cannot climb back to $K$: below $K/2$ the rate is negative.`,
        3: t`Only equilibria are levels a population can stay at, and below $K/2$ there is none.`,
      },
      hints: [t`At $H = rK/4$ the rate is $-\dfrac{r}{K}\left(P - \dfrac K2\right)^2$. What is its sign on each side of $K/2$?`],
      teach: 'A semi-stable equilibrium has no margin on one side: a small push the wrong way leads to collapse.',
      explain: t`At $H = rK/4$ the rate is $-\dfrac rK\left(P - \dfrac K2\right)^2 \le 0$: zero at $K/2$ and negative on both sides. A stock above $K/2$ sinks back to it; a stock below it sinks to zero. Managing a fishery right at its maximum yield leaves no room for a bad year.`,
      visual: { type: 'graph', params: { x: [0, 110], y: [-14, 4], xlabel: 'P (kt)', ylabel: 'dP/dt', curves: [{ fn: '0.5*x*(1 - x/100) - 12.5', color: 'warn' }], points: [{ x: 50, y: 0, color: 'warn', label: 'K/2', labelDx: -12, labelDy: -14 }] }, caption: t`The rate at the maximum sustainable harvest ($r = 0.5\ \text{yr}^{-1}$, $K = 100$ kt): it just touches zero at $K/2$.` },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §1.6 Autonomous equations (logistic with harvesting)', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'S. H. Strogatz, Nonlinear Dynamics and Chaos, §3.1 Saddle-node bifurcation', url: 'https://www.routledge.com/Nonlinear-Dynamics-and-Chaos/Strogatz/p/book/9780367026509' },
    { label: 'D. J. Kessler and B. G. Cour-Palais, “Collision frequency of artificial satellites”, J. Geophys. Res. 83 (1978)', url: 'https://doi.org/10.1029/JA083iA06p02637' },
  ],
});
