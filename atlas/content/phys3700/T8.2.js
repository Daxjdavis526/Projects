// Monte Carlo simulation: why the partition function of even a small lattice
// cannot be summed term by term; importance sampling with a Markov chain;
// the Metropolis rule min(1, e^(−ΔE/kT)) and detailed balance; equilibration,
// correlated samples and the 1/√N error; critical slowing down; a vectorized
// (checkerboard) Metropolis code for the 2D Ising model in NumPy; and Monte
// Carlo in engineering, where shielding and rarefied-gas codes count histories.
import { lesson, mcq, num, order, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, MEV, TC_SQUARE, isingPic, r4, texNum, apart } from './_th4.js';

const t = String.raw;

/** The Metropolis acceptance probability against ΔE/J at temperature kT/J = tt, with an optional marked ΔE. */
function acceptPic(tt, { mark = null, caption } = {}) {
  return {
    type: 'graph',
    params: {
      x: [-8.5, 8.5], y: [0, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'ΔE / J', ylabel: 'P(accept)',
      curves: [{ fn: '1', domain: [-8.5, 0], color: 'accent', width: 2.4 }, { fn: `e^(-x/${tt})`, domain: [0, 8.5], color: 'accent', width: 2.4, label: `kT/J = ${tt}`, labelAt: 1.5, labelDy: -6, labelDx: 8 }],
      vlines: mark === null ? [] : [{ x: mark, color: 'gold', label: `ΔE = ${mark}J` }],
      points: [-8, -4, 0, 4, 8].map((d) => ({ x: d, y: 0, r: 3, color: 'ink3' })),
    },
    caption: caption || 'The Metropolis rule: a flip that lowers the energy is always made; one that raises it is made with probability e^(−ΔE/kT). Grey dots: the only ΔE a single flip can produce on a square lattice with no field.',
  };
}

const CODE = t`import numpy as np

def energy(s, J=1.0):
    """Total energy of the lattice s (entries +1 or -1), periodic edges, each bond once."""
    return -J * np.sum(s * np.roll(s, 1, axis=0) + s * np.roll(s, 1, axis=1))

def sweep(s, T, rng):
    """One checkerboard Metropolis sweep at temperature T (in units of J/k), in place."""
    L = s.shape[0]
    ii, jj = np.indices((L, L))
    for parity in (0, 1):
        mask = (ii + jj) % 2 == parity
        nb = np.roll(s, 1, 0) + np.roll(s, -1, 0) + np.roll(s, 1, 1) + np.roll(s, -1, 1)
        dE = 2 * s * nb
        flip = mask & (rng.random((L, L)) < np.exp(-dE / T))
        s[flip] *= -1
    return s

def run(L, T, sweeps, seed=1):
    rng = np.random.default_rng(seed)
    s = np.ones((L, L), dtype=int)
    for _ in range(sweeps):
        sweep(s, T, rng)
    return s

for T in (1.5, 2.27, 4.0):
    print(T, abs(run(16, T, 300).mean()))
`;

export default lesson({
  id: 'phys3700.T8.2',
  title: 'Monte Carlo simulation',
  minutes: 20, difficulty: 3,
  intro: t`A $20\times20$ Ising lattice has $2^{400} \approx 10^{120}$ states. No computer will ever sum its partition function term by term — and almost every term is negligible anyway. **Monte Carlo** instead *samples* states, choosing them with probability proportional to their Boltzmann factor, and averages over the sample. The trick that makes this possible is the Metropolis algorithm (1953): propose a small change, such as flipping one spin, and accept it with probability

$$P_\text{accept} = \min\!\left(1,\; e^{-\Delta E/kT}\right).$$

Repeat, and the sequence of states settles into the Boltzmann distribution without anyone ever computing $Z$. It is how the Ising curves in [T8.1](#/lesson/phys3700.T8.1) were drawn, and how physicists simulate everything from lattice QCD to rarefied gas around a re-entry capsule.`,
  symbols: [
    { tex: 'P_\\text{accept}', text: 'the probability of making the proposed change' },
    { tex: '\\Delta E', text: 'the energy after the proposed change minus the energy before, in J (for one Ising spin, $2Js_i\\sum_\\text{nb}s_j$)' },
    { tex: 'kT', text: 'the thermal energy of the heat bath the system is imagined to sit in, in J' },
    { tex: '\\min(1, x)', text: 'the smaller of 1 and $x$: changes that lower the energy ($\\Delta E \\le 0$) are always accepted' },
  ],
  why: 'Monte Carlo is the workhorse of statistical physics, nuclear engineering and radiation shielding, rarefied-gas aerodynamics and finance: whenever a sum over states is too big to do, you sample it.',
  visual: {
    type: 'th4-ising',
    title: 'Watching a chain equilibrate',
    lead: t`The lattice starts from random spins. Below, the magnetization per spin after each **sweep** (one attempted flip per spin, on average); the gold dashed lines are the exact equilibrium values $\pm|m|$ for an infinite lattice. Watch how long the chain takes to forget where it started, and how much it wanders once it has.`,
    tasks: [
      'At kT/J = 2.0 from a random start: domains grow and m climbs towards ±0.91 — the first stretch of the trace is equilibration, not equilibrium. (Sometimes it freezes into two stripes instead: a long-lived trap; press Restart.)',
      'Raise the temperature to 2.3, near Tc: the trace wanders slowly over a wide range — successive sweeps are strongly correlated (critical slowing down).',
      'At kT/J = 3.5 the trace jitters quickly about zero: samples a few sweeps apart are nearly independent.',
    ],
    params: { T: 2.0, L: 48, start: 'hot', panels: ['lattice', 'trace'], controls: ['T', 'L', 'start', 'play'], rate: 15 },
  },
  example: {
    prompt: t`Show that the Metropolis rule makes the chain visit any two states $a$ and $b$ with $E_b - E_a = \Delta E > 0$ in the Boltzmann ratio $e^{-\Delta E/kT}$. Then find how often a flip costing $\Delta E = 4J$ is accepted at $kT = 2J$, and at $kT = 0.5J$.`,
    visual: acceptPic(2, { mark: 4, caption: 'Acceptance probability at kT = 2J. A flip costing 4J (gold) is accepted with probability e⁻² = 0.135.' }),
    steps: [
      { label: 'Detailed balance', text: t`In equilibrium the flow of probability from $a$ to $b$ must equal the flow back: $P(a)\,W(a\to b) = P(b)\,W(b\to a)$, where $W$ is the chance per step of making that move. If this holds for every pair, the distribution $P$ never changes — it is the stationary distribution of the chain.` },
      { label: 'Metropolis moves', text: t`Both moves are proposed equally often (pick the same spin). Going uphill, $a \to b$, is accepted with probability $e^{-\Delta E/kT}$; going downhill, $b \to a$, always. So $\dfrac{W(a\to b)}{W(b\to a)} = e^{-\Delta E/kT}$.` },
      { label: 'Boltzmann', text: t`Detailed balance then requires $\dfrac{P(b)}{P(a)} = e^{-\Delta E/kT} = \dfrac{e^{-E_b/kT}}{e^{-E_a/kT}}$ — exactly the Boltzmann ratio. $Z$ cancels: the algorithm only ever needs energy **differences**.` },
      { label: 'The numbers', text: t`At $kT = 2J$: $e^{-4/2} = ${fmt(Math.exp(-2), 3)}$. At $kT = 0.5J$: $e^{-8} = ${texNum(Math.exp(-8), 3)}$ — about one try in $${fmt(Math.exp(8), 4)}$. At low temperature almost every uphill proposal is rejected, which is correct but slow.` },
      { label: 'Sense check', text: t`If every proposal were accepted, the chain would wander uniformly over all states (infinite temperature); if no uphill move were accepted, it would slide into a local minimum (zero temperature). The rule interpolates between the two with the temperature.` },
    ],
    answer: t`Detailed balance with $W(a\to b)/W(b\to a) = e^{-\Delta E/kT}$ forces $P(b)/P(a) = e^{-\Delta E/kT}$. A $4J$ flip is accepted with probability $${fmt(Math.exp(-2), 3)}$ at $kT = 2J$ and $${texNum(Math.exp(-8), 3)}$ at $kT = 0.5J$.`,
  },
  practice: [
    num({
      id: 'accept', difficulty: 1,
      gen(r) {
        const dE = r.pick([4, 8]), tt = r.pick([1.5, 2, 2.5, 3, 4]), p = Math.exp(-dE / tt);
        return {
          prompt: t`In a Metropolis simulation of the Ising model at $kT = ${tt}J$, a proposed flip would raise the energy by $\Delta E = ${dE}J$. With what probability is it accepted?`,
          answer: p, tol: { rel: 0.005 },
          errors: apart([{ value: Math.exp(-tt / dE), feedback: 'The exponent is −ΔE/kT: energy over thermal energy.' }, { value: 1 - p, feedback: 'That is the probability it is rejected.' }], p),
          hints: [t`$P = e^{-\Delta E/kT}$ for an uphill move.`, t`$\Delta E/kT = ${dE}/${tt} = ${fmt(dE / tt, 4)}$.`],
          teach: 'Uphill moves are accepted with probability $e^{-\\Delta E/kT}$; downhill moves always.',
          explain: t`$e^{-${fmt(dE / tt, 4)}} = ${fmt(p, 4)}$.`,
          visual: acceptPic(tt, { mark: dE, caption: `The Metropolis acceptance probability at kT = ${tt}J, with this flip’s ΔE marked.` }),
        };
      },
    }),
    num({
      id: 'too-many', difficulty: 2,
      gen(r) {
        const L = r.pick([6, 8, 10, 16, 32]), v = L * L * Math.log10(2);
        return {
          prompt: t`How many states does an $${L}\times${L}$ Ising lattice have? Give $\log_{10}$ of the number. (For scale: the universe is about $4\times10^{26}$ nanoseconds old.)`,
          answer: v, tol: { rel: 0.002 },
          errors: apart([{ value: Math.log10(L * L * 2), feedback: 'Each of the L² spins has 2 choices independently: the count is 2 to the power L², not 2L².' }, { value: Math.log10(2 ** L), feedback: `There are ${L}² = ${L * L} spins, not ${L}.` }, { value: L * L * Math.log(2), feedback: 'That is the natural logarithm. Use log₁₀ 2 = 0.30103.' }], v),
          hints: [t`Each of the $${L * L}$ spins is independently up or down: $2^{${L * L}}$ states.`, t`$\log_{10}2^{${L * L}} = ${L * L}\log_{10}2$.`],
          teach: 'The number of states grows as 2^N: exponentially in the size of the system.',
          explain: t`$\log_{10}2^{${L * L}} = ${L * L}\times0.30103 = ${fmt(v, 4)}$. ${v > 27 ? 'Even checking one state per nanosecond since the Big Bang would not dent it.' : 'This one is small enough to enumerate exactly — a good test of a Monte Carlo code.'}`,
          visual: { type: 'graph', params: { x: [0, 34], y: [0, 320], aspect: 'wide', axesAt: 'edge', xlabel: 'lattice side L', ylabel: 'log₁₀(number of states)', curves: [{ fn: 'x^2*0.30103', domain: [0, 34], color: 'accent' }], hlines: [{ y: 26.6, color: 'warn', label: 'age of universe in ns' }], vlines: [{ x: L, color: 'gold' }] }, caption: 'The number of Ising states grows as 2 to the power L²: on a log scale, a parabola in L.' },
        };
      },
    }),
    mcq({
      id: 'why-uphill', difficulty: 2,
      prompt: 'A student’s Ising code accepts every flip that lowers the energy and rejects every flip that raises it. What does it compute?',
      choices: [
        'A route to a nearby low-energy state — the behaviour at T = 0, frozen into local minima — not thermal averages at any T > 0',
        'The correct Boltzmann averages, just faster',
        'The behaviour at infinite temperature',
        'The correct averages, provided it runs long enough',
      ],
      answer: 0,
      why: { 1: 'Without uphill moves the chain never visits higher-energy states, which have real Boltzmann weight at any T > 0.', 2: 'Infinite temperature would accept every proposal, uphill or down.', 3: 'Running longer cannot help: detailed balance fails, so the chain has the wrong stationary distribution (and gets stuck).' },
      hints: ['Which states can this chain ever reach once it has gone downhill?', 'Compare with the Metropolis rule at T → 0: $e^{-\\Delta E/kT} \\to 0$ for every uphill move.'],
      teach: 'Uphill moves with the right probability are what makes the samples thermal.',
      explain: 'It is a zero-temperature quench (steepest descent): it slides into the nearest local minimum, often a frozen pattern of domains, and stays. Thermal averages need uphill moves accepted with probability $e^{-\\Delta E/kT}$ — that is what detailed balance demands.',
      visual: acceptPic(2, { caption: 'The Metropolis rule at kT = 2J (blue). The student’s rule is the blue curve on the left and zero on the right — the T → 0 limit.' }),
    }),
    order({
      id: 'algorithm', difficulty: 2,
      prompt: 'Put the steps of a Metropolis Monte Carlo measurement in order.',
      items: [
        'Start from some configuration (all up, or random).',
        t`Pick a spin at random and compute $\Delta E$ for flipping it.`,
        t`If $\Delta E \le 0$, flip it; otherwise flip it only if a random number in $[0, 1)$ is below $e^{-\Delta E/kT}$.`,
        'Repeat until every spin has been tried once on average: one sweep.',
        'Discard the first sweeps, while the chain is still forgetting its start.',
        'Average the quantities you want over the remaining sweeps.',
      ],
      hints: ['The averaging must come after the chain has reached equilibrium.', 'A sweep is made of many single-spin steps, so the single-spin decision comes before “repeat”.'],
      teach: 'Propose, accept or reject, repeat; throw away equilibration; then average.',
      explain: 'Throwing away the early sweeps matters: they remember the starting configuration, not the temperature. And the decision rule is the whole of the physics — the rest is bookkeeping.',
      visual: isingPic({ T: 2.0, L: 32, start: 'hot', sweeps: 0, panels: ['lattice'], hide: ['m'] }, 'A random starting configuration on a 32 × 32 lattice, before any sweeps.'),
    }),
    num({
      id: 'error-bar', difficulty: 3,
      gen(r) {
        const sd = r.pick([0.03, 0.05, 0.08]), N = r.pick([5000, 10000, 20000]), tau = r.pick([5, 20, 50]);
        const v = sd * Math.sqrt((2 * tau) / N);
        return {
          prompt: t`A run of $N = ${N}$ sweeps near $T_c$ records the magnetization each sweep. Its spread from sweep to sweep is $\sigma = ${sd}$, and successive values stay correlated for about $\tau = ${tau}$ sweeps, so the run holds only about $N/2\tau$ independent samples. What is the statistical uncertainty (standard error) of the average magnetization?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: sd / Math.sqrt(N), feedback: 'That treats every sweep as independent. With correlation time τ there are only N/2τ independent samples.' }, { value: sd * Math.sqrt(tau / N), feedback: 'The number of independent samples is N/(2τ): keep the factor 2.' }], v),
          hints: [t`The standard error of a mean of $n$ independent samples is $\sigma/\sqrt n$.`, t`Here $n = N/2\tau = ${N / (2 * tau)}$.`],
          teach: 'Correlated samples count for less: the error is σ√(2τ/N), not σ/√N.',
          explain: t`$n = ${N}/(2\times${tau}) = ${N / (2 * tau)}$ independent samples, so the error is $${sd}/\sqrt{${N / (2 * tau)}} = ${texNum(v, 3)}$. Near $T_c$ the correlation time grows (critical slowing down), so the same run buys far less precision there.`,
          visual: isingPic({ T: 2.3, L: 32, start: 'cold', sweeps: 200, panels: ['trace'], onsager: false }, 'Magnetization sweep by sweep on a 32 × 32 lattice near Tc: neighbouring values are far from independent.'),
        };
      },
    }),
    code({
      id: 'metropolis', difficulty: 3,
      prompt: t`Write a Metropolis Monte Carlo code for the square-lattice Ising model with periodic edges, in units where $J = k = 1$. \`energy(s)\` returns the total energy $-\sum_{\langle ij\rangle} s_is_j$ (each bond once). \`sweep(s, T, rng)\` updates the lattice **in place**: to use NumPy’s speed, it updates all spins of one colour of a checkerboard at once (no two of them are neighbours, so their moves are independent), then all of the other colour. The \`run\` function is written for you.`,
      starter: t`import numpy as np

def energy(s, J=1.0):
    # each bond once: pair every spin with its neighbour below and to the right
    # (np.roll(s, 1, axis=0) shifts the lattice by one row, wrapping round)
    pass

def sweep(s, T, rng):
    L = s.shape[0]
    ii, jj = np.indices((L, L))
    for parity in (0, 1):
        mask = (ii + jj) % 2 == parity
        # 1. nb = sum of the four neighbours of every site (four np.roll calls)
        # 2. dE = 2 * s * nb
        # 3. flip where mask is True and a random number is below exp(-dE / T)
        pass
    return s

def run(L, T, sweeps, seed=1):
    rng = np.random.default_rng(seed)
    s = np.ones((L, L), dtype=int)
    for _ in range(sweeps):
        sweep(s, T, rng)
    return s

for T in (1.5, 2.27, 4.0):
    print(T, abs(run(16, T, 300).mean()))
`,
      answer: CODE,
      tests: [
        { name: 'an all-up 8 × 8 lattice has energy −128 (two bonds per spin)', code: 'energy(np.ones((8, 8), dtype=int)) == -128' },
        { name: 'a checkerboard of 8 × 8 has energy +128', code: 'energy(2 * (np.indices((8, 8)).sum(0) % 2) - 1) == 128' },
        { name: t`at $kT/J = 1.5$ a $16\times16$ lattice stays magnetized ($|m| > 0.9$)`, code: 'abs(run(16, 1.5, 200).mean()) > 0.9' },
        { name: t`at $kT/J = 4$ it melts: averaged over five runs, $|m| < 0.2$`, code: 'np.mean([abs(run(16, 4.0, 300, seed=k).mean()) for k in range(1, 6)]) < 0.2' },
        { name: 'sweep changes the lattice in place', code: '(lambda s: (sweep(s, 4.0, np.random.default_rng(2)) is s) and s.sum() < 64)(np.ones((8, 8), dtype=int))' },
      ],
      hints: [t`\`energy\`: \`-J * np.sum(s * np.roll(s, 1, axis=0) + s * np.roll(s, 1, axis=1))\` counts every bond once.`, t`In \`sweep\`: \`nb = np.roll(s, 1, 0) + np.roll(s, -1, 0) + np.roll(s, 1, 1) + np.roll(s, -1, 1)\`; then \`flip = mask & (rng.random((L, L)) < np.exp(-dE / T))\` and \`s[flip] *= -1\`.`, t`When $\Delta E \le 0$, $e^{-\Delta E/T} \ge 1$, so the comparison accepts it automatically — no separate branch needed.`],
      teach: 'Metropolis needs only ΔE for each move; NumPy can make all non-neighbouring moves at once.',
      explain: t`The printed snapshots (one run each, $L = 16$) are about $0.98$ at $kT/J = 1.5$, still large at $2.27$ (a lattice this small orders a little above the infinite lattice’s $T_c$, and fluctuates wildly there), and around $0.1$–$0.2$ at $4$ — not zero, because 256 spins fluctuate; it falls as $1/L$ for bigger lattices. Updating one checkerboard colour at a time is still a valid Metropolis chain: each spin’s move depends only on neighbours of the other colour, which are held fixed while it is decided.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-shield', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([0.002, 0.005, 0.01, 0.02]), e = r.pick([0.05, 0.02, 0.1]), N = (1 - p) / (p * e * e);
        return {
          prompt: t`A Monte Carlo radiation-transport code designs a spacecraft’s shielding by following particle **histories** one at a time. Each proton either gets through the shield (probability $p$) or not, so after $N$ histories the estimate of $p$ has relative standard error $\sqrt{(1 - p)/(Np)}$. If about $${p * 100}\,\%$ get through, how many histories are needed for a relative error of $${e * 100}\,\%$?`,
          answer: N, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / (p * e * e), feedback: 'Close — keep the (1 − p) factor.' }, { value: (1 - p) / (p * e), feedback: 'Square the relative error: N = (1 − p)/(p ε²).' }, { value: 1 / (e * e), feedback: 'Rare events need many more histories: divide by p as well.' }], N),
          hints: [t`Set $\sqrt{(1 - p)/(Np)} = \varepsilon$ and solve for $N$.`, t`$N = \dfrac{1 - p}{p\,\varepsilon^2}$ with $p = ${p}$ and $\varepsilon = ${e}$.`],
          teach: 'Monte Carlo error falls as 1/√N, and rare events need of order 1/(pε²) samples.',
          explain: t`$N = (1 - ${p})/(${p}\times${e}^2) = ${texNum(N, 3)}$ histories. Halving the error costs four times as many — which is why production codes (Geant4, MCNP) use variance-reduction tricks to make rare penetrating particles more likely and weight them down to compensate, the same idea as Metropolis importance sampling.`,
          visual: { type: 'graph', params: { x: [2, 7], y: [-3, 0], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'histories N', ylabel: 'relative error', curves: [{ fn: `0.5*log10(${1 - p}/(${p}*10^x))`, domain: [2, 7], color: 'accent', label: `p = ${p}`, labelAt: 2.5, labelDx: 8 }], hlines: [{ y: r4(Math.log10(e)), color: 'gold', label: 'target' }] }, caption: 'Relative error of a counted probability against the number of histories, on log axes: a line of slope −½.' },
        };
      },
    }),
    num({
      id: 'cp-ratio', difficulty: 2,
      gen(r) {
        const dE = r.pick([2, 5, 10, 20]), T = r.pick([77, 150, 300]), v = Math.exp(-(dE * MEV) / (KB * T));
        return {
          prompt: t`A Metropolis simulation of a molecule’s two shapes at $T = ${T}$ K has shape B lying $${dE}\ \text{meV}$ above shape A. Once equilibrated, how many times as often does the chain visit B as A? (Each shape is one state.)`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / v, feedback: 'B is higher in energy, so it is visited less: the ratio is below 1.' }, { value: Math.exp(-(dE * 1e-3) / (KB * T)), feedback: 'Convert meV to joules before dividing by kT (1 meV = 1.602 × 10⁻²² J).' }], v),
          hints: [t`Metropolis samples the Boltzmann distribution: $P_B/P_A = e^{-\Delta E/kT}$.`, t`$kT = ${fmt((KB * T) / MEV, 4)}$ meV at $${T}$ K.`],
          teach: 'An equilibrated Metropolis chain visits states in the Boltzmann ratio — that is its whole purpose.',
          explain: t`$e^{-${dE}/${fmt((KB * T) / MEV, 4)}} = ${texNum(v, 3)}$. The acceptance rule never mentions this ratio, but detailed balance guarantees it.`,
          visual: { type: 'graph', params: { x: [0, 2], y: [-1, Math.max(25, dE + 5)], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ fn: '0', domain: [0.2, 0.9], color: 'accent', width: 5 }, { fn: String(dE), domain: [1.1, 1.8], color: 'warn', width: 5 }], arrows: [{ from: [1, 0], to: [1, dE], color: 'ink3', label: `${dE} meV`, labelDx: 8 }], points: [{ x: 0.55, y: 0, r: 0.01, label: 'A', labelDy: 14, labelDx: -4, color: 'accent' }, { x: 1.45, y: dE, r: 0.01, label: 'B', labelDy: 14, labelDx: -4, color: 'warn' }] }, caption: 'Two states and the energy between them (heights to scale).' },
        };
      },
    }),
    mcq({
      id: 'cp-slowing', difficulty: 3,
      prompt: t`Near $T_c$ a single-spin Metropolis run needs far more sweeps to give a precise answer than it does at $T = 1.5\,J/k$ or $3.5\,J/k$. Why?`,
      choices: [
        'Correlated clusters grow to the size of the lattice, and flipping them one spin at a time takes a very long time: successive sweeps are nearly identical',
        'The acceptance probability is close to zero at T(c)',
        'The energy cannot be computed accurately near T(c)',
        'The random-number generator repeats itself near T(c)',
      ],
      answer: 0,
      why: { 1: 'At T(c) ≈ 2.27 J/k, a 4J flip is accepted with probability $e^{-4/2.27} \\approx 0.17$ — far from zero. Acceptance is lowest at low temperature, where the run is fast to converge.', 2: 'The energy is an exact sum over bonds at every step; the problem is how slowly the configuration itself changes.', 3: 'The generator does not know the temperature.' },
      hints: ['Look at the size of the domains near Tc, and think about how many single flips it takes to turn one over.', 'A cluster of thousands of aligned spins changes only when its edge spins flip, one accepted move at a time — so the lattice barely changes from one sweep to the next.'],
      teach: 'Critical slowing down: near T(c) the correlation time of single-spin Monte Carlo diverges with the cluster size.',
      explain: 'This is critical slowing down. Cluster algorithms (Swendsen–Wang 1987, Wolff 1989) cure it by flipping a whole correlated cluster in one accepted move, still obeying detailed balance.',
      visual: isingPic({ T: 2.27, L: 64, start: 'hot', sweeps: 800, panels: ['lattice'], hide: ['m'] }, 'A 64 × 64 lattice at kT/J = 2.27, near Tc, after 800 sweeps from a random start: clusters of every size, up to the lattice itself.'),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §8.2 (Monte Carlo simulation)', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Metropolis, Rosenbluth, Rosenbluth, Teller & Teller, Equation of State Calculations by Fast Computing Machines, J. Chem. Phys. 21, 1087 (1953)', url: 'https://doi.org/10.1063/1.1699114' },
    { label: 'Wolff, Collective Monte Carlo Updating for Spin Systems, Phys. Rev. Lett. 62, 361 (1989)', url: 'https://doi.org/10.1103/PhysRevLett.62.361' },
    { label: 'Newman & Barkema, Monte Carlo Methods in Statistical Physics (Oxford, 1999)', url: 'https://global.oup.com/academic/product/monte-carlo-methods-in-statistical-physics-9780198517979' },
  ],
});
