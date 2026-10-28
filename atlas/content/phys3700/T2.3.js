// Interacting systems and the approach to equilibrium: two Einstein solids
// sharing quanta, the total multiplicity, the most probable macrostate, the
// second law as overwhelming probability — and the √N sharpness of the peak.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { omega, lnOmega, pairDist, einPic, r4, texNum, thouTeX, thou, apart } from './_count.js';

const t = String.raw;
const W = (N, q) => Number(omega(N, q));
const TIE = [10, 100, 1000, 10000, 100000];

// the √N picture: identical solids, q = 2N, each curve scaled to its peak
const sharpPic = (N, caption) => einPic({ mode: 'pair', tie: TIE, NA: N, NB: N, q: 2 * N, x: 'fraction', panels: 'bars', hide: ['width'] }, caption);
// two blocks drawn to scale by oscillator count
const blocksPic = (NA, NB, q, caption) => ({
  type: 'graph',
  params: {
    x: [0, 10], y: [0, 4], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: '3', lower: '1', from: 0.5, to: r4(0.5 + (8.4 * NA) / (NA + NB)), color: 'accent', alpha: 0.35 }, { fn: '3', lower: '1', from: r4(1.1 + (8.4 * NA) / (NA + NB)), to: 9.5, color: 'warn', alpha: 0.35 }],
    points: [{ x: r4(0.5 + (4.2 * NA) / (NA + NB)), y: 2, r: 0.01, color: 'accent', label: `A: ${NA} oscillators`, labelDx: -50 }, { x: r4(1.1 + (8.4 * NA) / (NA + NB) + (4.2 * NB) / (NA + NB)), y: 2, r: 0.01, color: 'warn', label: `B: ${NB} oscillators`, labelDx: -50 }, { x: 5, y: 3.5, r: 0.01, color: 'ink', label: `sharing ${q} quanta`, labelDx: -40 }],
  },
  caption: caption ?? 'Two Einstein solids in thermal contact, drawn with widths in proportion to their numbers of oscillators. Schematic.',
});

const EX = { N: [3, 3], q: 6 };
const D532 = pairDist(300, 200, 100), WAIT = 1 / (1e9 * D532.p[100]) / 3.156e7;     // years at 10⁹ independent tries per second
EX.d = pairDist(3, 3, 6); EX.vals = [...EX.d.lnW].map((x) => Math.round(Math.exp(x))); EX.tot = Math.round(Math.exp(EX.d.lnTotal));

export default lesson({
  id: 'phys3700.T2.3',
  title: 'Interacting systems and the approach to equilibrium',
  minutes: 14, difficulty: 3,
  intro: t`Put two Einstein solids, A and B, in thermal contact so they can trade quanta but the total $q = q_A + q_B$ is fixed. A macrostate is now the split $q_A$, and its multiplicity is the product of the two solids’ counts:

$$\Omega_\text{total}(q_A) = \Omega_A(q_A)\,\Omega_B(q - q_A).$$

Every microstate of the combined system is equally likely, so the energy drifts toward the split with the most microstates and stays near it. For small solids the system wanders widely. For large ones the peak is so sharp — its width shrinks like $1/\sqrt N$ — that the most probable split is, in practice, the only one ever seen. **That is the second law**: not a force pushing energy around, but overwhelming odds.`,
  symbols: [
    { tex: 'N_A,\\ N_B', text: 'the numbers of oscillators in solids A and B' },
    { tex: 'q,\\ q_A,\\ q_B', text: 'the total number of quanta (fixed) and the numbers in A and B, $q_A + q_B = q$' },
    { tex: '\\Omega_A\\Omega_B', text: 'the multiplicity of the macrostate $q_A$: every microstate of A can pair with every microstate of B' },
    { tex: '\\sigma_{q_A}', text: 'the spread of $q_A$ about its most probable value; for two identical solids with $q = 2N$ it is $\\sqrt N$, so $\\sigma/q = 1/(2\\sqrt N)$' },
  ],
  why: 'This is where irreversibility comes from: heat flows from hot to cold because that direction leads to vastly more microstates — the foundation for temperature (T3.1) and every engine limit (T4).',
  visual: {
    type: 'th-einstein',
    title: 'Two Einstein solids trading quanta',
    lead: t`All the quanta start in A. Press **Play**: oscillators hand quanta to one another at random, every move as likely as its reverse. Watch where $q_A$ goes, and compare the time spent at each split (gold dots) with the exact multiplicities (bars).`,
    tasks: [
      t`With $N_A = N_B = 3$ and $q = 6$, play for a while: $q_A$ wanders everywhere, even back to 6 — small systems fluctuate.`,
      t`Set $N_A = 300$, $N_B = 200$, $q = 100$ and press All in A, then Play: $q_A$ falls to about 60 and never comes back. Switch to the log scale to see why: all-in-A has $10^{34}$ times fewer microstates.`,
      'Watch the gold dots settle onto the bar tops: the random exchange really does visit microstates evenly.',
    ],
    params: { mode: 'pair', NA: 3, NB: 3, q: 6, controls: ['NA', 'NB', 'q', 'scale', 'play'], ranges: { NA: [1, 300], NB: [1, 300], q: [0, 300] } },
    caption: 'Exact multiplicities, and a random-exchange dynamics as a teaching model of how real atoms jostle energy around. Identical oscillators; energy is exchanged only in whole quanta.',
  },
  example: {
    prompt: t`(a) Two solids with $N_A = N_B = 3$ share $q = 6$ quanta. Find $\Omega_\text{total}$, the most probable macrostate and its probability, and the probability that all the energy is in A. (b) For two identical solids with $q = 2N$, how wide is the peak when $N = 10^{23}$?`,
    visual: sharpPic(100, 'The multiplicity against the share of the quanta in A, for identical solids with q = 2N, each curve scaled to its own peak. Choose N: the peak narrows like 1/√N.'),
    steps: [
      { label: 'Tabulate', text: t`$\Omega_A(q_A)\Omega_B(6 - q_A)$ for $q_A = 0 \ldots 6$: $${EX.vals.join(',\\ ')}$. For example $q_A = 3$: $\binom{5}{3}\binom{5}{3} = 10\times10 = 100$.` },
      { label: 'Total', text: t`$\Omega_\text{total} = ${EX.tot}$, which equals $\Omega(6, 6) = \binom{11}{6}$: the pair is just one solid of 6 oscillators.` },
      { label: 'Probabilities', text: t`The most probable split is $q_A = 3$, with $100/${EX.tot} = ${fmt(100 / EX.tot, 3)}$. All in A: $28/${EX.tot} = ${fmt(28 / EX.tot, 3)}$ — tiny solids often find themselves far from even.` },
      { label: 'Large solids', text: t`For identical solids with $q = 2N$ the distribution of $q_A$ is close to a Gaussian with $\sigma = \sqrt N$ (check: the exact $\sigma$ is $${fmt(pairDist(100, 100, 200).sd, 4)}$ for $N = 100$). So $\sigma/q = 1/(2\sqrt N)$.` },
      { label: 'A mole', text: t`$N = 10^{23}$: $\sigma/q = ${texNum(1 / (2 * Math.sqrt(1e23)), 2)}$. The energy split is fixed to about 12 significant figures — a fluctuation no thermometer could see.` },
    ],
    answer: t`(a) $\Omega_\text{total} = ${EX.tot}$; $q_A = 3$ with probability $${fmt(100 / EX.tot, 3)}$; all in A with $${fmt(28 / EX.tot, 3)}$. (b) $\sigma/q \approx ${texNum(1 / (2 * Math.sqrt(1e23)), 2)}$.`,
  },
  practice: [
    num({
      id: 'total', difficulty: 2,
      gen(r) {
        const NA = r.int(2, 4), NB = r.int(2, 4), q = r.int(3, 6), v = W(NA + NB, q);
        return {
          prompt: t`Solids with $N_A = ${NA}$ and $N_B = ${NB}$ oscillators share $q = ${q}$ quanta. What is the total number of microstates of the combined system?`,
          answer: v, tol: { rel: 0, abs: 0.5 },
          errors: apart([{ value: W(NA, q) * W(NB, q), feedback: t`Each solid cannot hold all $q$ quanta at once: the quanta are shared, so sum $\Omega_A\Omega_B$ over the splits.` }, { value: q + 1, feedback: 'That is the number of macrostates.' }], v),
          hints: [t`Add $\Omega_A(q_A)\Omega_B(q - q_A)$ over $q_A = 0 \ldots ${q}$ — or notice the pair is one solid of $${NA + NB}$ oscillators.`, t`$\Omega(N_A + N_B, q) = \binom{q + N_A + N_B - 1}{q}$.`],
          teach: 'Summed over all splits, the two solids together are just one bigger solid.',
          explain: t`$\Omega_\text{total} = \Omega(${NA + NB}, ${q}) = \binom{${q + NA + NB - 1}}{${q}} = ${v}$.`,
          visual: einPic({ mode: 'pair', NA, NB, q, start: 'even', numbers: false, panels: 'bars', hide: ['peak'] }, t`The multiplicity of each split for $N_A = ${NA}$, $N_B = ${NB}$, $q = ${q}$ (heights to scale, values not shown). The total is the sum of all the bars.`),
        };
      },
    }),
    num({
      id: 'prob-macro', difficulty: 2,
      gen(r) {
        const N = r.int(3, 4), q = r.int(4, 6), a = r.int(0, q), d = pairDist(N, N, q), P = d.p[a];
        return {
          prompt: t`Two identical solids, $N_A = N_B = ${N}$, share $q = ${q}$ quanta. What is the probability of finding $q_A = ${a}$?`,
          answer: P, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / (q + 1), feedback: 'Macrostates are not equally likely; microstates are.' }, { value: W(N, a) * W(N, q - a), feedback: t`That is $\Omega_A\Omega_B$; divide by $\Omega_\text{total}$.` }], P),
          hints: [t`$P(q_A) = \Omega_A(q_A)\Omega_B(q - q_A)/\Omega_\text{total}$.`, t`$\Omega_\text{total} = \binom{q + 2N - 1}{q} = ${W(2 * N, q)}$.`],
          teach: 'A macrostate’s probability is its multiplicity over the total.',
          explain: t`$\Omega_A\Omega_B = ${W(N, a)}\times${W(N, q - a)} = ${W(N, a) * W(N, q - a)}$, over $\Omega_\text{total} = ${W(2 * N, q)}$: $P = ${fmt(P, 3)}$.`,
          visual: einPic({ mode: 'pair', NA: N, NB: N, q, start: a, numbers: false, panels: 'bars', hide: ['peak'] }, t`The multiplicities of the splits; $q_A = ${a}$ in gold.`),
        };
      },
    }),
    mcq({
      id: 'most-probable', difficulty: 2,
      prompt: t`Solid A has 300 oscillators and solid B has 200; they share 100 quanta. Which split is most probable?`,
      choices: [t`$q_A = 60$, $q_B = 40$`, t`$q_A = 50$, $q_B = 50$`, t`$q_A = 100$, $q_B = 0$`, t`$q_A = 40$, $q_B = 60$`],
      answer: 0,
      why: { 1: 'An even split of quanta ignores that A has more oscillators to share them among.', 2: 'All in A has 10³⁴ times fewer microstates than the peak.', 3: 'That gives the smaller solid more energy per oscillator — the reverse of the peak.' },
      hints: ['At the peak, the quanta per oscillator come out about equal.', t`$q_A/N_A \approx q_B/N_B$.`],
      teach: 'The most probable split shares energy in proportion to size: equal energy per oscillator.',
      explain: t`Equal quanta per oscillator: $q_A = 100\times\tfrac{300}{500} = 60$. The exact distribution peaks at $q_A = 60$ (Schroeder’s Figure 2.4).`,
      visual: blocksPic(300, 200, 100),
    }),
    num({
      id: 'width', difficulty: 3,
      gen(r) {
        const k = r.int(4, 24), N = 10 ** k, v = 1 / (2 * Math.sqrt(N));
        return {
          prompt: t`Two identical Einstein solids, each of $N = 10^{${k}}$ oscillators, share $q = 2N$ quanta. Then $q_A$ has a nearly Gaussian distribution with $\sigma = \sqrt N$. What is the relative width $\sigma/q$?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / Math.sqrt(N), feedback: t`$q = 2N$, so $\sigma/q = \sqrt N/(2N)$.` }, { value: Math.sqrt(N), feedback: t`That is $\sigma$ itself. Divide by $q = 2N$.` }], v),
          hints: [t`Divide the spread by the total: $\sigma/q$ with $q = 2N$.`, t`$\sigma/q = \sqrt N/(2N) = 1/(2\sqrt N)$.`],
          teach: 'Relative fluctuations of shared energy fall like 1/√N.',
          explain: t`$\sigma/q = 1/(2\sqrt{10^{${k}}}) = ${texNum(v, 3)}$.`,
          visual: sharpPic(k <= 5 ? 10 ** k : 100000, `Identical solids with q = 2N: the multiplicity against the share in A, each curve scaled to its own peak. Choose N to watch the peak narrow (computed exactly up to 10⁵ oscillators each).`),
        };
      },
    }),
    mcq({
      id: 'second-law', difficulty: 2,
      prompt: 'A hot solid touches a cold one, and heat flows from hot to cold. In the counting picture, why?',
      choices: [
        'Moving energy toward the even split increases the total number of microstates enormously, and every microstate is equally likely',
        'Energy feels a force pushing it from high temperature to low',
        'The hot solid’s oscillators are stronger and push quanta out',
        'Energy always spreads evenly between any two objects',
      ],
      answer: 0,
      why: { 1: 'No force acts on energy; the exchanges are random in both directions.', 2: 'Every oscillator is identical in the model; the exchange rule is symmetric.', 3: 'It spreads to equal energy *per oscillator* (when the oscillators match), not equal energy per object — a big solid takes more.' },
      hints: ['In the random exchange, is any single move more likely than its reverse?', 'Compare the number of microstates near the peak with the number far from it.'],
      teach: 'The second law is statistics: systems move toward the macrostates with the most microstates.',
      explain: 'Individual exchanges are random and reversible, but there are overwhelmingly more microstates near the most probable split. Starting far from it, the system almost certainly moves toward it — which looks like heat flowing from hot to cold.',
      visual: einPic({ mode: 'pair', NA: 300, NB: 200, q: 100, start: 'A', panels: 'bars', scale: 'log' }, 'Solids of 300 and 200 oscillators sharing 100 quanta, with all of them in A (gold) — at the far right, on a log scale. Most microstates lie near the peak.'),
    }),
    num({
      id: 'deviation', difficulty: 3,
      gen(r) {
        const d = r.pick([100, 200, 250, 300]), N = 1e4, q = 2e4;
        const ratio = Math.exp(lnOmega(N, q / 2 + d) + lnOmega(N, q / 2 - d) - 2 * lnOmega(N, q / 2));
        return {
          prompt: t`Two solids of $N = 10^{4}$ oscillators each share $q = 2\times10^{4}$ quanta, so $\sigma = \sqrt N = 100$. How many times less likely is $q_A = ${10000 + d}$ than the peak, $q_A = 10\,000$? Give the ratio $P(${10000 + d})/P(10\,000)$.`,
          answer: ratio, tol: { rel: 0.02 },
          errors: apart([{ value: Math.exp(-d / 100), feedback: t`The Gaussian falls as $e^{-x^2/2\sigma^2}$, with the deviation squared.` }, { value: Math.exp(-(d * d) / (100 * 100)), feedback: t`Keep the 2: $e^{-x^2/(2\sigma^2)}$.` }], ratio),
          hints: [t`Near the peak, $P \propto e^{-x^2/(2\sigma^2)}$ with $x = ${d}$ the deviation.`, t`$x/\sigma = ${d / 100}$.`],
          teach: 'A few standard deviations from the peak, a Gaussian has already collapsed.',
          explain: t`$e^{-(${d})^2/(2\times100^2)} = e^{-${fmt((d * d) / 20000, 3)}} = ${texNum(ratio, 3)}$ (the exact multiplicities agree to 0.1%). And this is only $${fmt((100 * d) / q, 2)}\%$ of $q$.`,
          visual: einPic({ mode: 'pair', NA: 10000, NB: 10000, q: 20000, start: 10000 + d, panels: 'bars', hide: ['width', 'peak'], xr: [9500, 10500] }, t`The multiplicity of each split for two solids of $10^{4}$ oscillators, near the peak only ($q_A$ from 9500 to 10 500); the gold line marks $q_A = ${10000 + d}$.`),
        };
      },
    }),
    mcq({
      id: 'recurrence', difficulty: 2,
      prompt: 'Solids of 300 and 200 oscillators share 100 quanta and have reached equilibrium. Will all 100 quanta ever return to solid A on their own?',
      choices: [
        'It is allowed, but its probability is about 10⁻³⁴ of the peak’s: you would wait far longer than the age of the universe',
        'Never: the second law forbids it absolutely',
        'Yes, about half the time, since every split is possible',
        'Only if the solids are cooled',
      ],
      answer: 0,
      why: { 1: 'The second law is statistical: forbidden in practice, not in principle.', 2: 'Possible is not likely: splits differ enormously in multiplicity.', 3: 'Cooling removes energy; it does not make the improbable split likely.' },
      hints: [t`Compare $\Omega$ at $q_A = 100$ with $\Omega$ at the peak.`],
      teach: 'Large deviations are possible in principle and absent in practice.',
      explain: t`$\Omega_A\Omega_B$ at $q_A = 100$ is $${texNum(Math.exp(D532.lnW[100] - D532.lnPeak), 2)}$ times the peak value; its probability is $${texNum(D532.p[100], 2)}$. Even sampling a fresh microstate a billion times a second, you would expect to wait about $10^{${Math.round(Math.log10(WAIT))}}$ years — the universe is $1.4\times10^{10}$ years old.`,
      visual: einPic({ mode: 'pair', NA: 300, NB: 200, q: 100, start: 100, panels: 'bars', scale: 'log', hide: ['peak'] }, 'The multiplicities of all 101 splits on a log scale; all-in-A (gold) at the far right.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-nanoparticle', difficulty: 3, transfer: true,
      gen(r) {
        const atoms = r.pick([100, 1000, 10000]), N = 3 * atoms, v = 100 / (2 * Math.sqrt(N));
        return {
          prompt: t`Two identical nanoparticles of ${thou(atoms)} atoms each touch and share thermal energy. Model each as an Einstein solid ($N = 3\times${thouTeX(atoms)}$ oscillators) with $q = 2N$ quanta in total. By what percentage of the total energy does the split typically fluctuate ($\sigma/q$)?`,
          answer: v, units: '%', tol: { rel: 0.01 },
          errors: apart([{ value: 100 / (2 * Math.sqrt(atoms)), feedback: 'Count oscillators, not atoms: 3 per atom.' }, { value: 100 / Math.sqrt(N), feedback: t`$q = 2N$: divide $\sigma = \sqrt N$ by $2N$.` }], v),
          hints: [t`$N = ${thouTeX(N)}$ oscillators per particle.`, t`$\sigma/q = 1/(2\sqrt N)$.`],
          teach: 'Small systems fluctuate visibly: thermodynamics becomes sharp only for large N.',
          explain: t`$\sigma/q = 1/(2\sqrt{${N}}) = ${fmt(v, 3)}\%$. For a gram of material it would be about $10^{-10}\%$: nanoscale devices feel thermal fluctuations that bulk matter averages away.`,
          visual: sharpPic(atoms === 100 ? 100 : atoms === 1000 ? 1000 : 10000, 'The peak for identical solids of 10 to 10⁵ oscillators (each curve scaled to its own peak). Choose N near your particles’ size.'),
        };
      },
    }),
    num({
      id: 'cp-prob', difficulty: 2,
      gen(r) {
        const NA = r.pick([2, 3]), NB = r.pick([3, 4]), q = r.int(3, 5), d = pairDist(NA, NB, q);
        return {
          prompt: t`Solids with $N_A = ${NA}$ and $N_B = ${NB}$ share $q = ${q}$ quanta. What is the probability that solid B holds every quantum ($q_A = 0$)?`,
          answer: d.p[0], tol: { rel: 0.01 },
          errors: apart([{ value: 1 / (q + 1), feedback: 'Macrostates are not equally likely.' }], d.p[0]),
          hints: [t`$\Omega_A(0) = 1$, $\Omega_B(${q}) = \binom{${q + NB - 1}}{${q}}$, and $\Omega_\text{total} = \binom{${q + NA + NB - 1}}{${q}}$.`],
          teach: t`$P(q_A) = \Omega_A\Omega_B/\Omega_\text{total}$.`,
          explain: t`$P = \dfrac{1\times${W(NB, q)}}{${W(NA + NB, q)}} = ${fmt(d.p[0], 3)}$.`,
          visual: einPic({ mode: 'pair', NA, NB, q, start: 0, numbers: false, panels: 'bars', hide: ['peak'] }, t`The multiplicities of each split; $q_A = 0$ in gold.`),
        };
      },
    }),
    mcq({
      id: 'cp-statement', difficulty: 2,
      prompt: 'Which is the best statement of the second law, as this lesson derives it?',
      choices: [
        'A large system in thermal contact moves to, and stays near, the macrostate with the most microstates',
        'Energy can never move from a cold body to a hot one, not even for an instant',
        'Every microstate eventually reaches the most probable microstate',
        'Energy is always shared equally between interacting systems',
      ],
      answer: 0,
      why: { 1: 'Single exchanges go both ways all the time; it is the net flow that is one-way.', 2: 'All microstates are equally probable; no microstate is special.', 3: 'Shared equally per oscillator (for identical oscillators), not per system.' },
      hints: ['The law comes from counting, not from a rule about individual exchanges.'],
      teach: 'Second law: systems evolve to the macrostate of maximum multiplicity, overwhelmingly and irreversibly for large N.',
      explain: 'For large systems the most probable macrostate and its immediate neighbours hold essentially all the microstates; once there, the system stays. Small fluctuations — even brief cold-to-hot flows — happen all the time and are tiny.',
      visual: sharpPic(10000, 'The multiplicity peak for identical solids, scaled to its height. For a mole it would be a hairline.'),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §2.3–2.4', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Moore & Schroeder, A different approach to introducing statistical mechanics, Am. J. Phys. 65, 26 (1997)', url: 'https://doi.org/10.1119/1.18490' },
  ],
});
