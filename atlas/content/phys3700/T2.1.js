// Two-state systems and microstates: microstates and macrostates, the
// multiplicity Ω(N, N↑), the fundamental assumption, and the two-state
// paramagnet U = μB(N↓ − N↑) — with the large-N collapse onto half and half.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { binomBars, choose, MU_B, EV, r4, texNum, thouTeX, apart } from './_count.js';

const t = String.raw;
const C = (n, k) => Number(choose(n, k));
const LN10 = Math.LN10;
const Hs = (p) => -p * Math.log(p) - (1 - p) * Math.log(1 - p);     // ln Ω(pN)/N for large N

// a row of spins as arrows (up: accent, down: warn), with an optional field arrow
function spinsPic(spins, { field = true, title = null, caption } = {}) {
  const N = spins.length, arrows = spins.map((s, i) => ({ from: [i, r4(-0.42 * s)], to: [i, r4(0.42 * s)], color: s > 0 ? 'accent' : 'warn', width: 2.4 }));
  if (field) arrows.push({ from: [N + 0.6, -0.6], to: [N + 0.6, 0.6], color: 'ink2', width: 3, label: 'B', labelDx: 8, labelDy: 0 });
  const points = title ? [{ x: r4((N - 1) / 2), y: 0.95, r: 0.01, color: 'ink', label: title, labelDx: -3.1 * title.length }] : [];
  return {
    type: 'graph',
    params: { x: [-0.8, N + (field ? 1.6 : 0.2)], y: [-1, 1.25], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', arrows, points, alt: 'A row of magnetic dipoles pointing up or down' },
    caption: caption ?? 'One microstate of a two-state paramagnet: each dipole points up (blue, along the field B) or down (orange). Schematic.',
  };
}
// a deterministic example microstate with n of N up
const sample = (N, n) => { const s = Array(N).fill(-1); for (let i = 0; i < n; i++) s[(i * 7 + 3) % N] = 1; let c = s.filter((x) => x > 0).length; for (let i = 0; c < n && i < N; i++) if (s[i] < 0) { s[i] = 1; c++; } return s; };

const EX = { N: 100 };
EX.o50 = C(100, 50); EX.o60 = C(100, 60); EX.P50 = EX.o50 / 2 ** 100; EX.P60 = EX.o60 / 2 ** 100;
EX.big = ((Hs(0.6) - Math.LN2) * 1e23) / LN10;

export default lesson({
  id: 'phys3700.T2.1',
  title: 'Two-state systems and microstates',
  minutes: 12, difficulty: 2,
  intro: t`A **microstate** says what every particle is doing — which coins are heads, which magnetic dipoles point up. A **macrostate** says only what you can measure in bulk — how many are heads, the total energy. Many microstates share one macrostate, and the number of them is its **multiplicity**. For $N$ two-state particles with $N_\uparrow$ up,

$$\Omega(N, N_\uparrow) = \binom{N}{N_\uparrow}.$$

Statistical mechanics rests on one assumption: in an isolated system in equilibrium, **every accessible microstate is equally likely**. A macrostate’s probability is then its share of the microstates, $\Omega/\Omega_\text{total}$ — and for large $N$ almost all of them sit near the middle.`,
  symbols: [
    { tex: 'N', text: 'the number of two-state particles: coins, or magnetic dipoles in a paramagnet' },
    { tex: 'N_\\uparrow,\\ N_\\downarrow', text: 'how many point up (along the field) and down; $N_\\uparrow + N_\\downarrow = N$' },
    { tex: '\\Omega', text: 'the multiplicity: the number of microstates in a macrostate (a pure number)' },
    { tex: '\\Omega_\\text{total} = 2^N', text: 'all microstates together' },
    { tex: 'U = \\mu B(N_\\downarrow - N_\\uparrow)', text: 'a paramagnet’s energy in a field $B$ (tesla): each dipole of moment $\\mu$ (J/T) has energy $-\\mu B$ up, $+\\mu B$ down' },
  ],
  why: 'Counting microstates is the whole of the second law: in T2.4 entropy becomes the logarithm of Ω, and systems drift to the macrostates with the most microstates simply because those are overwhelmingly likely.',
  visual: {
    type: 'graph',
    title: 'A paramagnet’s macrostates and their multiplicities',
    lead: t`Each bar is a macrostate of $N$ dipoles in a field, placed at its energy $U/\mu B = N - 2N_\uparrow$; its height is $\Omega$ on a **logarithmic** scale. Slide $N_\uparrow$ to pick one (gold).`,
    tasks: [
      'With N = 100, compare all-up (left end, Ω = 1) with half-up: about 10²⁹ microstates.',
      'Find the 60-up macrostate: only about 7 times fewer microstates than 50-up at N = 100. Lesson T2.3 shows the gap explodes as N grows.',
      'Shrink N to 4 and count by hand: 1, 4, 6, 4, 1.',
    ],
    params: {
      x: [-102, 102], y: [0, 31], aspect: 'wide', xlabel: 'energy U / μB', ylabel: 'multiplicity Ω', ylog: true, axesAt: 'edge',
      sliders: [
        { key: 'N', label: 'Dipoles $N$', min: 2, max: 100, step: 2, value: 100, explain: 'How many magnetic dipoles; each points up or down.' },
        { key: 'u', label: 'Up $N_\\uparrow$', min: 0, max: 100, step: 1, value: 50, explain: 'The macrostate: how many dipoles point along the field (it stops at N).' },
      ],
      riemann: { fn: 'log10(gamma(N+1)/(gamma(floor((N-x)/2+0.5)+1)*gamma(N-floor((N-x)/2+0.5)+1)))', from: '-N-1', to: 'N+1', n: 'N+1', rule: 'mid' },
      shade: [{ fn: 'log10(gamma(N+1)/(gamma(min(u,N)+1)*gamma(N-min(u,N)+1)))', from: 'N-2*min(u,N)-0.9', to: 'N-2*min(u,N)+0.9', color: 'gold', alpha: 0.85 }],
      readouts: [
        { label: '$N_\\uparrow$', expr: 'min(u, N)', digits: 3 },
        { label: '$U/\\mu B$', expr: 'N - 2*min(u, N)', digits: 3 },
        { label: '$\\Omega$', expr: 'gamma(N+1)/(gamma(min(u,N)+1)*gamma(N-min(u,N)+1))', digits: 4 },
        { label: 'probability', expr: 'gamma(N+1)/(gamma(min(u,N)+1)*gamma(N-min(u,N)+1))/2^N', digits: 3 },
      ],
    },
    caption: 'Exact multiplicities for N independent dipoles in a field. The probabilities assume every microstate is equally likely — true at high temperature or in no field; in a strong field at low temperature the energy constraint matters (lesson T3.2).',
  },
  example: {
    prompt: t`Toss 100 fair coins. Compare the multiplicities and probabilities of exactly 50 heads and exactly 60 heads. Then estimate the same comparison for $N = 10^{23}$.`,
    visual: binomBars(100, 0.5, { hi: [50, 60], xlabel: 'number of heads', caption: 'The probability of each number of heads in 100 tosses; 50 and 60 in gold.' }),
    steps: [
      { label: 'Count', text: t`$\Omega(50) = \binom{100}{50} = ${texNum(EX.o50, 4)}$ and $\Omega(60) = \binom{100}{60} = ${texNum(EX.o60, 4)}$.` },
      { label: 'Probabilities', text: t`Every one of the $2^{100} = ${texNum(2 ** 100, 4)}$ microstates is equally likely: $P(50) = ${fmt(EX.P50, 3)}$, $P(60) = ${fmt(EX.P60, 3)}$ — a ratio of $${fmt(EX.o50 / EX.o60, 3)}$.` },
      { label: 'Large N', text: t`For large $N$, $\ln\Omega(pN) \approx N[-p\ln p - (1-p)\ln(1-p)]$ (Stirling). The 60/40 and 50/50 values differ by $N(0.6730 - 0.6931) = -0.0201N$.` },
      { label: 'A mole of coins', text: t`For $N = 10^{23}$: $\Omega(60\%)/\Omega(50\%) = e^{-2.0\times10^{21}} = 10^{${texNum(EX.big, 2)}}$. A 60/40 split is not rare: it never happens.` },
      { label: 'Sense check', text: t`At $N = 100$ a 60/40 split happens about 1% of the time — you would see it in an afternoon of tossing. The same *fraction* is impossible at $10^{23}$.` },
    ],
    answer: t`$\Omega(50) \approx ${texNum(EX.o50, 3)}$, $\Omega(60) \approx ${texNum(EX.o60, 3)}$; $P = ${fmt(EX.P50, 3)}$ against $${fmt(EX.P60, 3)}$. For $10^{23}$ coins the ratio is about $10^{${texNum(EX.big, 2)}}$.`,
  },
  practice: [
    num({
      id: 'total', difficulty: 1,
      gen(r) {
        const N = r.int(8, 20), v = 2 ** N;
        return {
          prompt: t`How many microstates does a paramagnet of $${N}$ dipoles have altogether?`,
          answer: v, tol: { rel: 0, abs: 0.5 },
          errors: apart([{ value: 2 * N, feedback: 'Each dipole doubles the count: multiply, do not add.' }, { value: N + 1, feedback: `That is the number of macrostates (0 to ${N} up). Microstates also say which dipoles are up.` }], v),
          hints: ['Each dipole has 2 choices, independently.'],
          teach: t`$N$ two-state particles have $2^N$ microstates.`,
          explain: t`$2^{${N}} = ${thouTeX(v)}$.`,
          visual: spinsPic(sample(N, Math.round(N / 2)), { caption: `One of the microstates of ${N} dipoles. Schematic.` }),
        };
      },
    }),
    num({
      id: 'omega', difficulty: 2,
      gen(r) {
        const N = r.int(8, 14), n = r.intExcept(2, N - 2, [N / 2]), v = C(N, n);
        return {
          prompt: t`A paramagnet has $N = ${N}$ dipoles. How many microstates have $N_\uparrow = ${n}$?`,
          answer: v, tol: { rel: 0, abs: 0.5 },
          errors: apart([{ value: 2 ** N, feedback: 'That counts all microstates, not just those with this many up.' }, { value: N * n, feedback: 'Choosing which dipoles are up is a combination, not a product.' }], v),
          hints: [t`$\Omega = \binom{N}{N_\uparrow}$.`],
          teach: t`$\Omega(N, N_\uparrow) = \binom{N}{N_\uparrow}$: choose which dipoles are up.`,
          explain: t`$\binom{${N}}{${n}} = ${thouTeX(v)}$.`,
          visual: spinsPic(sample(N, n), { title: `one microstate with ${n} of ${N} up` }),
        };
      },
    }),
    num({
      id: 'prob', difficulty: 2,
      gen(r) {
        const N = r.pick([10, 12, 16]), n = r.int(N / 2 - 3, N / 2 + 1), P = C(N, n) / 2 ** N;
        return {
          prompt: t`In zero field, every microstate of $${N}$ dipoles is equally likely. What is the probability that exactly $${n}$ point up?`,
          answer: P, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / (N + 1), feedback: 'Macrostates are not equally likely — microstates are.' }, { value: C(N, n), feedback: t`That is $\Omega$; divide by $2^{${N}}$.` }], P),
          hints: [t`$P = \Omega/\Omega_\text{total}$.`, t`$\binom{${N}}{${n}}/2^{${N}}$.`],
          teach: 'A macrostate’s probability is its share of the equally likely microstates.',
          explain: t`$P = ${thouTeX(C(N, n))}/${thouTeX(2 ** N)} = ${fmt(P, 3)}$.`,
          visual: binomBars(N, 0.5, { hi: n, xlabel: 'dipoles up', caption: `The probabilities of every macrostate of ${N} dipoles; the one asked about in gold.` }),
        };
      },
    }),
    num({
      id: 'energy', difficulty: 2,
      gen(r) {
        const N = r.pick([50, 100, 200]), up = r.int(Math.round(0.55 * N), Math.round(0.9 * N)), B = r.pick([1, 2, 5]);
        const U = (MU_B * B * (N - 2 * up)) / EV * 1000;
        return {
          prompt: t`A paramagnet of $${N}$ electron-spin dipoles ($\mu = \mu_B = 9.274\times10^{-24}$ J/T) sits in a $${B}$ T field with $N_\uparrow = ${up}$. What is its magnetic energy, in meV?`,
          answer: U, units: 'meV', tol: { rel: 0.01 },
          errors: apart([{ value: -U, feedback: t`Dipoles along the field have *negative* energy: $U = \mu B(N_\downarrow - N_\uparrow)$.` }, { value: (MU_B * B * up) / EV * -1000, feedback: 'The down dipoles contribute +μB each.' }], U),
          hints: [t`$N_\downarrow = ${N - up}$; $U = \mu B(N_\downarrow - N_\uparrow)$.`, t`$\mu_B B = ${fmt((MU_B * B) / EV * 1000, 4)}$ meV for $B = ${B}$ T.`],
          teach: 'Each dipole contributes −μB if aligned with the field and +μB if against it.',
          explain: t`$U = \mu B(${N - up} - ${up}) = (${fmt((MU_B * B) / EV * 1000, 4)}\ \text{meV})(${N - 2 * up}) = ${fmt(U, 4)}$ meV.`,
          visual: spinsPic(sample(16, Math.round((16 * up) / N)), { caption: `A sketch of the paramagnet with about the same fraction of dipoles up (16 of the ${N} drawn).` }),
        };
      },
    }),
    mcq({
      id: 'micro-macro', difficulty: 1,
      prompt: 'Which describes a microstate of three coins?',
      choices: ['Heads, tails, heads (coin by coin)', 'Two heads', 'Mostly heads', 'Heads more likely than tails'],
      answer: 0,
      why: { 1: 'Two heads is a macrostate: three microstates (HHT, HTH, THH) share it.', 2: 'That is a vague macrostate.', 3: 'That is a statement about probability, not a state.' },
      hints: ['A microstate specifies every individual particle.'],
      teach: 'Microstate: every particle specified. Macrostate: only bulk quantities.',
      explain: 'HTH says what each coin shows — a microstate. “Two heads” is the macrostate it belongs to, with multiplicity 3.',
      visual: binomBars(3, 0.5, { xlabel: 'number of heads', caption: 'The four macrostates of three coins and their probabilities; each bar holds 1, 3, 3 and 1 microstates.' }),
    }),
    mcq({
      id: 'fundamental', difficulty: 2,
      prompt: 'The fundamental assumption of statistical mechanics says that, for an isolated system in equilibrium:',
      choices: ['Every accessible microstate is equally probable', 'Every macrostate is equally probable', 'The system is always in its most probable microstate', 'Energy is shared equally between all particles'],
      answer: 0,
      why: { 1: 'Macrostates have very different numbers of microstates, so very different probabilities.', 2: 'All microstates are equally probable — there is no single most probable one.', 3: 'That is equipartition of the average, not a statement about microstates; any one particle’s energy fluctuates.' },
      hints: ['It is a statement about the most detailed level of description.'],
      teach: 'Equal a priori probabilities: each accessible microstate is equally likely.',
      explain: 'All microstates consistent with the fixed energy (and volume and number) are equally likely; macrostates then differ in probability only through their multiplicities.',
      visual: binomBars(20, 0.5, { xlabel: 'dipoles up', caption: 'Twenty dipoles: equally likely microstates make very unequal macrostates.' }),
    }),
    num({
      id: 'big-N', difficulty: 3,
      gen(r) {
        const k = r.int(4, 8), N = 10 ** k, v = (N * (Hs(0.6) - Math.LN2)) / LN10;
        return {
          prompt: t`For large $N$, $\ln\Omega(N_\uparrow) \approx N\left[-p\ln p - (1-p)\ln(1-p)\right]$ with $p = N_\uparrow/N$. For $N = 10^{${k}}$ coins, estimate $\log_{10}$ of $\Omega(0.6N)/\Omega(0.5N)$.`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: N * (Hs(0.6) - Math.LN2), feedback: 'That is the natural log; divide by ln 10.' }, { value: -v, feedback: 'The 60% macrostate has *fewer* microstates: the log of the ratio is negative.' }], v),
          hints: [t`$-0.6\ln0.6 - 0.4\ln0.4 = 0.6730$ and $\ln 2 = 0.6931$.`, t`$\ln(\text{ratio}) \approx N(0.6730 - 0.6931)$; then divide by $\ln 10$.`],
          teach: 'Multiplicity ratios between macrostates scale exponentially with N.',
          explain: t`$\ln(\text{ratio}) \approx 10^{${k}}\times(-0.02014) = ${texNum(N * (Hs(0.6) - Math.LN2), 3)}$, so $\log_{10} \approx ${texNum(v, 3)}$: the ratio is $10^{${texNum(v, 3)}}$.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 0.8], aspect: 'wide', xlabel: 'fraction up, p', ylabel: 'ln Ω / N', axesAt: 'edge', curves: [{ fn: '-x*ln(x) - (1-x)*ln(1-x)', domain: [0.0005, 0.9995], color: 'accent' }], points: [{ x: 0.5, y: r4(Math.LN2), r: 5, color: 'gold', label: '50%', labelDx: -12, labelDy: -12 }, { x: 0.6, y: r4(Hs(0.6)), r: 5, color: 'warn', label: '60%', labelDx: 8, labelDy: -8 }] }, caption: 'ln Ω per particle against the fraction up (Stirling’s large-N form). The small gap between the two points is multiplied by N.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-adr', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.pick([16, 20, 24]), up = r.int(Math.round(0.65 * N), Math.round(0.85 * N)), U = N - 2 * up, v = C(N, up);
        return {
          prompt: t`Space X-ray spectrometers such as the one on Hitomi were cooled to 0.05 K by adiabatic demagnetization, which works by ordering the dipoles of a paramagnetic salt. In a toy model of the salt with $N = ${N}$ dipoles, how many microstates have energy $U = ${U}\mu B$?`,
          answer: v, tol: { rel: 0, abs: 0.5 },
          errors: apart([{ value: C(N, Math.abs(U)), feedback: t`$U/\mu B = N_\downarrow - N_\uparrow$ is not $N_\uparrow$: solve for $N_\uparrow$ first.` }], v),
          hints: [t`$U/\mu B = N_\downarrow - N_\uparrow = N - 2N_\uparrow$.`, t`$N_\uparrow = (N - U/\mu B)/2 = ${up}$.`],
          teach: 'A paramagnet’s energy fixes N↑; the multiplicity is then the binomial coefficient.',
          explain: t`$N_\uparrow = (${N} - (${U}))/2 = ${up}$, so $\Omega = \binom{${N}}{${up}} = ${thouTeX(v)}$. Lower energy means more alignment and fewer microstates — the refrigerator exploits that trade.`,
          visual: spinsPic(sample(N, up), { caption: `One microstate of the ${N}-dipole toy salt at this energy. Schematic.` }),
        };
      },
    }),
    num({
      id: 'cp-prob', difficulty: 2,
      gen(r) {
        const N = r.pick([8, 10, 12]), n = r.pick([0, 1, N - 1]), P = C(N, n) / 2 ** N;
        return {
          prompt: t`$${N}$ fair coins are tossed. What is the probability of exactly $${n}$ heads?`,
          answer: P, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / (N + 1), feedback: 'Macrostates are not equally likely.' }], P),
          hints: [t`$P = \binom{N}{n}/2^N$.`],
          teach: 'Probability = multiplicity / total microstates.',
          explain: t`$P = ${C(N, n)}/${2 ** N} = ${texNum(P, 3)}$.`,
          visual: binomBars(N, 0.5, { hi: n, xlabel: 'number of heads', caption: `${N} coins: the macrostate asked about is gold.` }),
        };
      },
    }),
    mcq({
      id: 'cp-why-half', difficulty: 2,
      prompt: 'In zero field, a paramagnet of 10²² dipoles is always found with almost exactly half pointing up. Why?',
      choices: [
        'Nearly all of its microstates have close to half up, and every microstate is equally likely',
        'The dipoles repel each other into alternating directions',
        'Half up is the lowest-energy arrangement',
        'Measurement forces each dipole to choose up or down equally',
      ],
      answer: 0,
      why: { 1: 'Ideal paramagnet dipoles do not interact at all.', 2: 'In zero field every arrangement has the same energy.', 3: 'No measurement is involved: it is counting.' },
      hints: ['Compare the number of microstates near half up with all the rest.'],
      teach: 'Macroscopic regularity is a counting effect: the typical macrostate holds almost all the microstates.',
      explain: 'Ω is overwhelmingly concentrated near N/2: the fraction up deviates by only about 1/(2√N), here 5 × 10⁻¹². No force is needed — just counting.',
      visual: binomBars(400, 0.5, { xlabel: 'dipoles up (of 400)', caption: 'Even for only 400 dipoles the distribution is a narrow spike near half; for 10²² it would be far narrower than a pixel.' }),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §2.1', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Kilbourne et al., The Hitomi Soft X-ray Spectrometer (adiabatic demagnetization to 50 mK), PASJ 70, 18 (2018)', url: 'https://doi.org/10.1093/pasj/psx156' },
  ],
});
