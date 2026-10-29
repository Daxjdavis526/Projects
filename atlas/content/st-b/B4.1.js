// Diffusion from random walks: a lattice walk's spread grows as √t, its
// probabilities obey a master equation whose continuum limit is the heat
// equation, and D = Δx²/(2Δt) ties the microscopic steps to the PDE.
import { lesson, mcq, num, order, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';

const t = String.raw;
const DW = 2.5e-5;            // water vapour in air near 25 °C, m²/s
// a seeded 2D random walk for the Sun cartoon, drawn as a trail of small dots
const SUNWALK = (() => {
  let a = 7, x = 0, y = 0;
  const rnd = () => { a = (a * 16807) % 2147483647; return a / 2147483647; };
  const pts = [];
  for (let i = 0; i < 1400; i++) {
    const th = 2 * Math.PI * rnd();
    x += 0.022 * Math.cos(th); y += 0.022 * Math.sin(th);
    if (Math.hypot(x, y) > 0.97) break;
    if (i % 2 === 0) pts.push({ x: +x.toFixed(4), y: +y.toFixed(4), r: 1.3, color: 'accent' });
  }
  return pts;
})();
const walk = (params, caption) => ({ type: 'pde-walk', params: { controls: false, play: false, ...params }, caption });

export default lesson({
  id: 'st-b.B4.1',
  title: 'Diffusion from random walks',
  minutes: 13, difficulty: 2,
  intro: t`Where does the heat equation come from, deep down? From molecules that move **at random**. Let a walker hop a distance $\Delta x$ left or right, with equal chances, every $\Delta t$. Hops are independent, so their variances add: after $n = t/\Delta t$ hops the spread of positions is $\langle x^2\rangle = n\,\Delta x^2$. In terms of time,

$$\langle x^2\rangle = 2Dt, \qquad D = \frac{\Delta x^2}{2\,\Delta t}$$

The cloud widens like $\sqrt t$, not like $t$: **diffusion is quick over short distances and hopelessly slow over long ones**. And the probability $p_j^n$ of being at site $j$ after $n$ hops obeys $p_j^{n+1} = \tfrac12p_{j-1}^n + \tfrac12p_{j+1}^n$; expanding in small steps turns this into $p_t = D\,p_{xx}$ — the heat equation, with a diffusivity set by the microscopic steps.`,
  symbols: [
    { tex: t`\Delta x,\ \Delta t`, text: 'the length of one hop (m) and the time between hops (s)' },
    { tex: t`\langle x^2\rangle`, text: 'the mean square distance from the start (m²); its square root is the spread (standard deviation)' },
    { tex: 'D', text: 'the diffusivity (m²/s): $\\Delta x^2/(2\\Delta t)$ for this walk' },
    { tex: t`p_j^n`, text: 'the probability of being at site $j$ (position $j\\Delta x$) after $n$ hops' },
  ],
  why: t`Every diffusion constant in physics — of heat in a heat shield, of a propellant vapour in air, of photons random-walking out of the Sun’s core over some $10^5$ years — is a random walk seen from far away.`,
  visual: {
    type: 'pde-walk',
    title: 'A crowd of random walkers',
    lead: t`Every walker starts at $x = 0$ and hops one step left or right each tick, at random. Above: the walkers. Below: the histogram of their positions and the Gaussian of the heat equation with $D = \Delta x^2/(2\Delta t)$. Press Play.`,
    tasks: [
      'Watch the measured spread track √(2Dt): four times as many hops for twice the spread.',
      'Switch to 200 walkers: the histogram gets ragged, but the spread still follows √(2Dt).',
      'Double the step length Δx: D grows fourfold and the cloud spreads twice as fast.',
    ],
    params: { N: 2000, dx: 1, steps: 0, xr: 40 },
    caption: t`A lattice random walk with $\Delta t = 1$ s — a teaching model of molecular motion. Real molecules move in 3D with a spread of free paths and speeds; the $\sqrt t$ growth survives all of that. The histogram bars are $2\Delta x$ wide because after $n$ hops a walker can only sit on every other site.`,
  },
  example: {
    prompt: t`A small leak releases water vapour into perfectly still air ($D \approx ${tex(DW)}\ \text{m}^2/\text{s}$ near 25 °C). Roughly how long until the vapour has spread a typical distance of 1 cm? Of 10 cm? Of 1 m?`,
    visual: { type: 'graph', params: { x: [0, 1.2], y: [-0.3, 6.2], aspect: 'wide', xlabel: 'spread (m)', ylabel: 'time (hours)', curves: [{ fn: `x^2/(2*${DW})/3600`, color: 'accent', width: 2.4 }], points: [{ x: 0.1, y: 0.01 / (2 * DW) / 3600, label: '10 cm: 3 min', color: 'gold', labelDy: -12 }, { x: 1, y: 1 / (2 * DW) / 3600, label: '1 m: 5.6 h', color: 'gold', labelDx: -76 }] }, caption: t`The time to diffuse a distance $\ell$ in one direction, $t = \ell^2/(2D)$: a parabola. In 3D, $\langle r^2\rangle = 6Dt$, so reaching the same radial spread is 3 times quicker — still hours for a metre.` },
    steps: [
      { label: 'Invert the law', text: t`The spread $\ell = \sqrt{2Dt}$ gives $t = \ell^2/(2D)$.` },
      { label: 'One centimetre', text: t`$t = (0.01)^2/(2\times${tex(DW)}) = 2$ s.` },
      { label: 'Ten centimetres', text: t`$100\times$ longer: 200 s, about 3 minutes.` },
      { label: 'One metre', text: t`$t = 1/(5\times10^{-5}) = 2\times10^4$ s, about 5.6 hours.` },
      { label: 'Physics', text: t`Diffusion alone takes hours to fill a room. In practice a room’s air is never still: draughts and convection carry the vapour across in a minute or so, and diffusion only does the last millimetres — which is why leak detectors are placed where the airflow goes. For propellant vapours such as hydrazine, $D$ is of the same order, somewhat smaller for the heavier molecules.` },
    ],
    answer: t`About 2 s for 1 cm, 3 minutes for 10 cm and over 5 hours for 1 m: the time grows as the square of the distance.`,
  },
  practice: [
    num({
      id: 'rms-after-n', difficulty: 1,
      gen(r) {
        const n = r.pick([100, 225, 400]), dx = r.pick([0.5, 1, 2]);
        const s = Math.sqrt(n) * dx;
        return {
          prompt: t`Walkers hop $\Delta x = ${dx}$ mm left or right at random, once a second. What is the spread (root-mean-square distance from the start) after ${n} hops, in mm?`,
          visual: walk({ N: 2000, dx: 1, steps: 64, xr: 40, hide: ['spread', 'predicted'] }, 'A walk after 64 hops (illustrative step length): the cloud and its histogram.'),
          answer: s, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: n * dx, feedback: 'Steps add like a random sum, not a straight march: the spread grows as √n, not n.' }, { value: n * dx * dx, feedback: 'That is the mean square distance (in mm²). Take its square root.' }].filter((e) => Math.abs(e.value - s) > 0.02 * s),
          hints: [t`Variances add: $\langle x^2\rangle = n\,\Delta x^2$.`, t`Spread $= \sqrt{n}\,\Delta x$.`],
          teach: 'Independent random steps add in variance: the spread after n steps is √n Δx.',
          explain: t`$\sqrt{${n}}\times${dx} = ${tex(s)}$ mm, while a walker marching straight would have gone ${n * dx} mm.`,
        };
      },
    }),
    num({
      id: 'molecule-D', difficulty: 2,
      gen(r) {
        const [lam, v, gas] = r.pick([[68e-9, 470, 'nitrogen'], [72e-9, 440, 'oxygen'], [180e-9, 1250, 'helium']]);
        const dt = lam / v, D = (lam * lam) / (2 * dt);
        return {
          prompt: t`In air at room conditions a ${gas} molecule travels about $\lambda = ${tex(lam * 1e9)}$ nm between collisions, at a typical speed of ${v} m/s. Treat its motion as a 1D random walk with $\Delta x = \lambda$ and $\Delta t = \lambda/v$. Estimate $D$ in m²/s.`,
          visual: walk({ N: 200, dx: 1, steps: 30, xr: 20 }, 'A random walk — each dot one walker after 30 hops. A molecule is the same, with hops of tens of nanometres every tenth of a nanosecond.'),
          answer: D, units: 'm^2/s', tol: { rel: 0.01 },
          errors: [{ value: lam * lam / dt, feedback: t`$D = \Delta x^2/(2\Delta t)$: keep the factor 2.` }, { value: lam / dt, feedback: 'That has units of speed; square the step.' }],
          hints: [t`$\Delta t = \lambda/v$.`, t`$D = \dfrac{\lambda^2}{2\lambda/v} = \dfrac{\lambda v}{2}$.`],
          teach: 'D = Δx²/(2Δt) turns microscopic hops into a macroscopic diffusivity.',
          explain: t`$D = \lambda v/2 = (${tex(lam)})(${v})/2 = ${tex(D)}\ \text{m}^2/\text{s}$. Kinetic theory in 3D gives $D \approx \lambda\bar v/3$, of the same order: measured self-diffusion coefficients of gases at room conditions are indeed around $10^{-5}$ m²/s${gas === 'helium' ? ', and larger for light helium' : ''}.`,
        };
      },
    }),
    order({
      id: 'master-to-pde', difficulty: 3,
      prompt: t`Put the steps that turn the random walk into the heat equation in order.`,
      items: [
        t`To be at site $j$ after $n + 1$ hops, a walker was at $j - 1$ or $j + 1$ and hopped in: $p_j^{n+1} = \tfrac12p_{j-1}^n + \tfrac12p_{j+1}^n$.`,
        t`Subtract $p_j^n$: $p_j^{n+1} - p_j^n = \tfrac12\big(p_{j+1}^n - 2p_j^n + p_{j-1}^n\big)$.`,
        t`Write $p_j^n = p(j\Delta x, n\Delta t)$ and Taylor-expand: the left side is $\Delta t\,p_t + \ldots$, the bracket is $\Delta x^2\,p_{xx} + \ldots$.`,
        t`Divide by $\Delta t$ and let $\Delta x, \Delta t \to 0$ with $D = \Delta x^2/(2\Delta t)$ fixed: $p_t = D\,p_{xx}$.`,
      ],
      hints: ['Start from the bookkeeping of one hop.', 'The second difference p(j+1) − 2p(j) + p(j−1) is Δx² times the second derivative.'],
      teach: 'The master equation of the walk becomes the heat equation when steps and ticks shrink together with Δx²/Δt fixed.',
      explain: t`Hop bookkeeping, a time difference on the left and a second space difference on the right, Taylor expansion, then the limit. The limit keeps $\Delta x^2/\Delta t$ fixed — which is why diffusion cannot be described with a finite speed: as $\Delta t \to 0$, the hop speed $\Delta x/\Delta t$ grows without bound.`,
    }),
    num({
      id: 'square-law', difficulty: 2,
      gen(r) {
        const T = r.pick([5, 8, 12]), k = r.pick([3, 4, 10]);
        return {
          prompt: t`A dye placed in still water spreads 1 mm (rms) in ${T} s. How long does it take to spread ${k} mm?`,
          visual: { type: 'graph', params: { x: [0, k * 1.1], y: [0, T * k * k * 1.15], aspect: 'wide', xlabel: 'spread (mm)', ylabel: 'time (s)', curves: [{ fn: `${T}*x^2`, color: 'accent', width: 2.4 }], points: [{ x: 1, y: T, label: `1 mm: ${T} s`, color: 'gold', labelDx: 10 }] }, caption: 'Diffusion time against spread: a parabola through the measured point.' },
          answer: T * k * k, units: 's', tol: { rel: 0.01 },
          errors: [{ value: T * k, feedback: 'Spread grows as √t, so time grows as the square of the spread.' }, { value: T * Math.sqrt(k), feedback: 'Turn it the other way: t ∝ ℓ², not ℓ ∝ t².' }],
          hints: [t`$\ell = \sqrt{2Dt}$, so $t \propto \ell^2$.`],
          teach: 'Diffusion time scales as distance squared.',
          explain: t`$t = ${T}\times${k}^2 = ${T * k * k}$ s. That is why stirring helps: it shortens the distances diffusion has to cover.`,
        };
      },
    }),
    mcq({
      id: 'mean-vs-spread', difficulty: 2,
      prompt: t`For a fair random walk ($p = \tfrac12$), what happens to the **mean** position and the **spread** of a crowd of walkers as time goes on?`,
      visual: walk({ N: 2000, dx: 1, steps: 200, xr: 40 }, 'A crowd of walkers after 200 hops.'),
      choices: ['The mean stays at the start; the spread grows like √t', 'Both grow like √t', 'The mean grows like t; the spread stays fixed', 'Both stay fixed: random steps cancel out'],
      answer: 0,
      why: {
        1: 'For a fair walk the expected displacement of every hop is zero, so the mean does not move.',
        2: 'A mean that grows like t is drift (an unfair walk, or a current); a fixed spread would mean no randomness.',
        3: 'They cancel on average, so the mean stays put — but their squares do not cancel, so the spread grows.',
      },
      hints: ['Each hop has average displacement zero but average square displacement Δx².'],
      teach: 'Random steps cancel in the mean but add in the variance.',
      explain: t`$\langle x\rangle = 0$ always, while $\langle x^2\rangle = n\Delta x^2 = 2Dt$. An unfair walk adds a drift, $\langle x\rangle = (2p - 1)n\Delta x$: advection on top of diffusion.`,
    }),
    code({
      id: 'walkers', difficulty: 2,
      prompt: t`Simulate the walk. With \`rng = np.random.default_rng(1)\`, make an array \`steps\` of shape (400, 20000) of random $\pm1$ (one row per tick, one column per walker), let \`paths\` be its cumulative sum down the rows, and \`var\` the variance of the positions at each tick (an array of 400). Then fit a straight line to \`var\` against the tick number $n = 1, 2, \dots, 400$ and set \`D\` to half its slope (with $\Delta x = \Delta t = 1$).`,
      starter: t`import numpy as np

rng = np.random.default_rng(1)
N, n = 20000, 400
steps = None      # rng.choice([-1, 1], size=(n, N))
paths = None      # cumulative sum along axis 0
var = None        # variance of each row
D = None          # half the slope of var against n
print(var[[99, 199, 399]] if var is not None else None, D)
`,
      answer: t`import numpy as np

rng = np.random.default_rng(1)
N, n = 20000, 400
steps = rng.choice([-1, 1], size=(n, N))
paths = np.cumsum(steps, axis=0)
var = paths.var(axis=1)
ticks = np.arange(1, n + 1)
D = np.polyfit(ticks, var, 1)[0] / 2
print(var[[99, 199, 399]], D)`,
      tests: [
        { name: '`paths` holds 400 positions for each of 20 000 walkers', code: 'paths is not None and paths.shape == (400, 20000)' },
        { name: 'after 400 hops the variance is close to 400', code: 'abs(var[399] - 400) < 20' },
        { name: 'four times the hops, four times the variance: var[399]/var[99] is close to 4', code: 'abs(var[399] / var[99] - 4) < 0.25' },
        { name: t`the fitted $D$ is close to $\Delta x^2/(2\Delta t) = 0.5$`, code: 'D is not None and abs(D - 0.5) < 0.025' },
        { name: 'the mean position stays near 0', code: 'abs(paths[-1].mean()) < 0.5' },
      ],
      hints: ['`rng.choice([-1, 1], size=(n, N))` draws all the hops at once.', '`np.cumsum(steps, axis=0)` turns hops into positions; `paths.var(axis=1)` gives one variance per tick.', '`np.polyfit(np.arange(1, n + 1), var, 1)[0]` is the slope; D is half of it.'],
      teach: 'The variance of a random walk grows linearly in time; its slope is 2D.',
      explain: t`The variance climbs in a straight line of slope about 1 (one $\Delta x^2$ per tick), so $D \approx 0.5$. With 20 000 walkers the statistical scatter is around 1% — the measured values wander a little about the exact law $\langle x^2\rangle = n$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-vapour', difficulty: 2, transfer: true,
      gen(r) {
        const D = r.pick([1.0e-5, 1.5e-5]), l = r.pick([0.3, 0.5, 2]);
        const T = (l * l) / (2 * D) / 3600;
        return {
          prompt: t`A propellant vapour with $D = ${tex(D)}\ \text{m}^2/\text{s}$ leaks into perfectly still air in a test cell. Using the 1D law $\langle x^2\rangle = 2Dt$, how many hours until it has spread ${l} m (rms) from the leak?`,
          visual: { type: 'graph', params: { x: [0, 2.2], y: [0, 70], aspect: 'wide', xlabel: 'spread (m)', ylabel: 'time (hours)', curves: [{ fn: `x^2/(2*${D})/3600`, color: 'accent', width: 2.4 }] }, caption: 'Diffusion time against spread for this vapour in still air. Real cells are ventilated and draughty: air currents move vapour far faster than diffusion.' },
          answer: T, units: 'h', tol: { rel: 0.01 },
          errors: [{ value: T * 3600, feedback: 'That is in seconds.' }, { value: (l / (2 * D)) / 3600, feedback: 'Square the distance: t = ℓ²/(2D).' }],
          hints: [t`$t = \ell^2/(2D)$.`],
          teach: 'Over metres, molecular diffusion takes hours; ventilation, not diffusion, clears a room.',
          explain: t`$t = \dfrac{${l}^2}{2(${tex(D)})} = ${tex(T * 3600)}$ s $\approx ${tex(T)}$ h. Leak detection and ventilation design rely on air currents; diffusion matters only close to surfaces.`,
        };
      },
    }),
    mcq({
      id: 'cp-peak', difficulty: 2,
      prompt: t`As a cloud of random walkers spreads, how does the height of its histogram’s peak change with time?`,
      visual: walk({ N: 20000, dx: 1, steps: 100, xr: 40 }, 'The histogram after 100 hops, with the heat-equation Gaussian.'),
      choices: [t`It falls like $1/\sqrt t$, keeping the area fixed`, t`It falls like $1/t$`, 'It stays the same while the cloud widens', t`It falls like $e^{-t}$`],
      answer: 0,
      why: {
        1: t`The width grows like $\sqrt t$, not $t$: a $1/t$ peak would lose walkers.`,
        2: 'The total number of walkers is fixed; a wider cloud must be lower.',
        3: 'Spreading is a power law, not exponential decay: there is no time scale in the free walk.',
      },
      hints: ['The area under the histogram is the number of walkers, which never changes.', 'Width ∝ √t, so height ∝ 1/√t.'],
      teach: 'A spreading Gaussian of fixed area has peak ∝ 1/√t.',
      explain: t`Peak $= 1/\sqrt{2\pi\cdot2Dt} = 1/\sqrt{4\pi Dt}$: the fundamental solution of the heat equation (lesson B4.2).`,
    }),
    num({
      id: 'cp-sun', difficulty: 3, transfer: true,
      prompt: t`A photon in the Sun’s interior random-walks: suppose it moves a typical 1 mm between scatterings, at the speed of light. Using $\langle r^2\rangle = N\ell^2$ for $N$ steps of length $\ell$ in 3D, about how many years does it take to random-walk out to $R = 7\times10^8$ m? (1 yr ≈ $3.16\times10^7$ s.)`,
      visual: { type: 'graph', params: { x: [-1, 1], y: [-1, 1], aspect: 'wide', equal: true, xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, grid: false,
        curves: [{ polar: '1', theta: [0, 6.29], color: 'gold', width: 2 }], points: SUNWALK },
        caption: 'A random walk from the centre of a star (cartoon: a few hundred random steps drawn as a trail of dots; the real steps are about a millimetre, against a radius of 700 000 km).' },
      answer: (7e8 / 1e-3) ** 2 * 1e-3 / 3e8 / 3.16e7, units: 'yr', tol: { rel: 0.03 },
      errors: [{ value: 7e8 / 3e8 / 3.16e7, feedback: 'That is the straight-line light travel time. A random walk needs N = (R/ℓ)² steps.' }],
      hints: [t`Steps needed: $N = (R/\ell)^2$.`, t`Time $= N\ell/c$.`],
      teach: 'Random walking out of a distance R takes (R/ℓ)² steps — enormously more than R/ℓ.',
      explain: t`$N = (7\times10^{11})^2 = 4.9\times10^{23}$ steps, each taking $\ell/c = 3.3\times10^{-12}$ s: about $1.6\times10^{12}$ s $\approx 5\times10^4$ years. Detailed solar models, with a mean free path that varies with depth, give tens to hundreds of thousands of years — the same order.`,
    }),
  ],
  sources: [SRC.strauss, { label: 'H. C. Berg, Random Walks in Biology (Princeton, 1993), ch. 1', url: 'https://openlibrary.org/isbn/9780691000640' }, SRC.incropera],
});
