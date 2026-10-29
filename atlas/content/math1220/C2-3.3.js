// Exponential growth and decay, and the logistic equation that puts a ceiling on growth.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;
const LN2 = Math.log(2);

export default lesson({
  id: 'math1220.C2-3.3',
  title: 'Exponential and logistic growth',
  minutes: 11, difficulty: 2,
  intro: t`When a quantity changes at a rate proportional to itself, $\frac{dP}{dt} = rP$, it grows or decays **exponentially**: $P = P_0e^{rt}$, doubling (or halving) every $\ln 2/|r|$. Real growth runs out of room, and the **logistic equation** adds a ceiling:

$$\frac{dP}{dt} = rP\left(1 - \frac{P}{K}\right)$$

While $P$ is small compared with $K$ the bracket is close to 1 and growth is exponential; as $P$ nears $K$ the bracket shrinks to zero and growth stops. Exponential decay — radioactive nuclei, a drug leaving the blood, the air thinning with altitude — is the same equation with a negative rate.`,
  symbols: [
    { tex: t`P(t)`, text: 'the size of the population or amount at time $t$ (cells, nuclei, people, kilopascals…)' },
    { tex: t`\frac{dP}{dt}`, text: 'its rate of change, in units of $P$ per unit time' },
    { tex: t`r`, text: t`the **growth rate constant**, per unit time (for example $\text{h}^{-1}$); negative $r$ means decay` },
    { tex: t`K`, text: 'the **carrying capacity**: the largest population the surroundings can sustain, in units of $P$' },
    { tex: t`P_0`, text: 'the starting value, $P(0)$' },
  ],
  why: t`Exponentials are the solutions of the simplest rate law, so they turn up wherever a rate is proportional to an amount: decay chains, RC circuits, atmospheres and the Tsiolkovsky rocket equation.`,
  visual: {
    type: 'graph',
    title: 'Exponential growth versus logistic growth',
    lead: t`Blue is the logistic solution $P = \dfrac{K}{1 + Ae^{-rt}}$ with $A = \dfrac{K - P_0}{P_0}$; dashed orange is pure exponential growth $P_0e^{rt}$ from the same start. The gold dot marks where logistic growth is fastest.`,
    tasks: [
      'Early on the two curves agree: while P is much smaller than K, the factor (1 − P/K) is close to 1.',
      'The logistic curve is steepest exactly at P = K/2, where it bends from speeding up to slowing down.',
      'Set P₀ above K: the logistic population falls back to K, while the exponential runs away.',
    ],
    params: {
      x: [0, 20], y: [0, 160], xlabel: 't (hours)', ylabel: 'P (thousands)',
      sliders: [
        { key: 'r', label: 'Growth rate $r$', min: 0.1, max: 1, step: 0.05, value: 0.5, unit: t`\text{h}^{-1}`, explain: 'The per-capita growth rate while resources are plentiful.' },
        { key: 'K', label: 'Carrying capacity $K$', min: 40, max: 120, step: 5, value: 100, explain: 'The population the surroundings can sustain.' },
        { key: 'P0', label: 'Starting population $P_0$', min: 1, max: 150, step: 1, value: 5, explain: 'The population at $t = 0$.' },
      ],
      curves: [
        { fn: 'P0*exp(r*x)', color: 'warn', dash: true, width: 1.8, label: 'exponential', labelAt: 3 },
        { fn: 'K/(1 + ((K - P0)/P0)*exp(-r*x))', color: 'accent', label: 'logistic', labelAt: 14 },
      ],
      hlines: [{ y: 'K', label: 'K', color: 'good' }, { y: 'K/2', label: 'K/2', color: 'ink3' }],
      points: [{ x: 'ln((K - P0)/P0)/r', y: 'K/2', when: 'max(0, sgn(K/2 - P0))', color: 'gold', label: 'fastest growth' }],
      readouts: [
        { label: 'doubling time while $P \\ll K$', expr: 'ln(2)/r', unit: t`\text{h}`, digits: 3 },
        { label: 'logistic $P(10\\,\\text{h})$', expr: 'K/(1 + ((K - P0)/P0)*exp(-10r))', digits: 3 },
        { label: 'exponential $P(10\\,\\text{h})$', expr: 'P0*exp(10r)', digits: 3 },
      ],
    },
    caption: t`Population in thousands and time in hours — illustrative numbers. The logistic equation is the simplest model with a ceiling; real populations also feel time delays, randomness and changing surroundings, and none grows exponentially for long.`,
  },
  example: {
    prompt: t`A bacterial culture follows $\dfrac{dP}{dt} = 0.5P\left(1 - \dfrac{P}{100}\right)$, with $P$ in thousands of cells and $t$ in hours, and starts at $P(0) = 5$. Solve it, and find when the culture reaches half its carrying capacity.`,
    steps: [
      { label: 'Separate', text: t`$\dfrac{dP}{P\,(1 - P/100)} = 0.5\,dt$, that is $\dfrac{100\,dP}{P\,(100 - P)} = 0.5\,dt$.` },
      { label: 'Partial fractions', text: t`$\dfrac{100}{P(100 - P)} = \dfrac{1}{P} + \dfrac{1}{100 - P}$ (check: the right side is $\frac{(100 - P) + P}{P(100 - P)}$).` },
      { label: 'Integrate', text: t`$\ln P - \ln(100 - P) = 0.5t + C$, so $\ln\dfrac{P}{100 - P} = 0.5t + C$ (for $0 < P < 100$).` },
      { label: 'Use the start', text: t`At $t = 0$: $\ln\frac{5}{95} = C$, so $\dfrac{P}{100 - P} = \dfrac{1}{19}e^{0.5t}$.` },
      { label: 'Solve for P', text: t`$P = \dfrac{100}{1 + 19e^{-0.5t}}$ — the logistic curve, with $A = \frac{K - P_0}{P_0} = \frac{95}{5} = 19$.` },
      { label: 'Half capacity', text: t`$P = 50$ when $19e^{-0.5t} = 1$: $\;t = \dfrac{\ln 19}{0.5} \approx ${fmt(Math.log(19) / 0.5, 3)}$ h.` },
      { label: 'Sense check', text: t`Pure exponential growth $5e^{0.5t}$ would reach 50 at $t = \frac{\ln 10}{0.5} \approx ${fmt(Math.log(10) / 0.5, 3)}$ h. The logistic culture is a little later, because crowding is already slowing it.` },
    ],
    answer: t`$P(t) = \dfrac{100}{1 + 19e^{-0.5t}}$ thousand cells; it reaches 50 thousand after about ${fmt(Math.log(19) / 0.5, 3)} h.`,
  },
  practice: [
    num({
      id: 'half-life', difficulty: 1,
      gen(r) {
        const k = r.pick([0.05, 0.1, 0.125, 0.2, 0.25]);
        const T = LN2 / k;
        return {
          prompt: t`The concentration of a drug in the blood decays as $C = C_0e^{-${k}t}$, with $t$ in hours. What is its **half-life**?`,
          answer: T, units: 'h', tol: { rel: 0.005 },
          errors: [{ value: 1 / k, feedback: t`$1/k$ is the time to fall to $1/e \approx 37\%$. For one half, solve $e^{-kt} = \tfrac12$.` }, { value: k * LN2, feedback: 'Solve for t: divide ln 2 by k rather than multiplying.' }],
          hints: [t`Half-life: the time $T$ with $e^{-${k}T} = \tfrac12$.`, t`Take logarithms: $-${k}T = \ln\tfrac12 = -\ln 2$.`],
          teach: 'For exponential decay with rate constant k, the half-life is ln 2 / k, whatever the starting amount.',
          explain: t`$T_{1/2} = \dfrac{\ln 2}{${k}} = ${fmt(T, 3)}$ h. Every ${fmt(T, 3)} h the concentration halves again.`,
          visual: {
            type: 'graph',
            params: { x: [0, Math.ceil(3.2 * T)], y: [0, 1.1], xlabel: 't (h)', ylabel: 'C/C₀', curves: [{ fn: `exp(-${k}x)`, color: 'accent' }], hlines: [{ y: 0.5, label: 'half', color: 'gold' }, { y: 0.25, label: 'quarter', color: 'ink3' }] },
            caption: 'The fraction remaining. It takes the same time to go from 1 to ½ as from ½ to ¼.',
          },
        };
      },
    }),
    num({
      id: 'radiocarbon', difficulty: 2,
      gen(r) {
        const f = r.pick([0.2, 0.3, 0.4, 0.6, 0.75]);
        const age = (5730 / LN2) * Math.log(1 / f);
        return {
          prompt: t`Carbon-14 has a half-life of 5730 years. A piece of charcoal has ${Math.round(f * 100)}% of the carbon-14 found in living wood. Roughly how old is it?`,
          answer: age, units: 'yr', tol: { rel: 0.01 },
          errors: [{ value: 5730 * (1 - f) * 2, feedback: 'Decay is not linear: equal times remove equal *fractions*, not equal amounts. Use $N = N_0 e^{-kt}$.' }],
          hints: [t`$N = N_0e^{-kt}$ with $k = \dfrac{\ln 2}{5730}\ \text{yr}^{-1}$.`, t`Solve $e^{-kt} = ${f}$: $\;t = \dfrac{\ln(1/${f})}{k} = 5730\,\dfrac{\ln(1/${f})}{\ln 2}$.`],
          teach: 'Radiometric dating inverts exponential decay: the fraction left gives the number of half-lives elapsed.',
          explain: t`$t = 5730 \times \dfrac{\ln(1/${f})}{\ln 2} = 5730 \times ${fmt(Math.log(1 / f) / LN2, 3)} \approx ${Math.round(age)}$ years — ${fmt(Math.log(1 / f) / LN2, 3)} half-lives.`,
          visual: {
            type: 'graph',
            params: { x: [0, 20000], y: [0, 1.1], xlabel: 'age (years)', ylabel: 'N/N₀', curves: [{ fn: `2^(-x/5730)`, color: 'accent' }], hlines: [{ y: f, label: `${Math.round(f * 100)}%`, color: 'gold' }], vlines: [{ x: 5730, label: 'one half-life', color: 'ink3' }] },
            caption: 'The fraction of carbon-14 left, against age. (Real dating also corrects for past changes in atmospheric carbon-14.)',
          },
        };
      },
    }),
    mcq({
      id: 'which-model', difficulty: 1,
      visual: { type: 'graph', params: { x: [0, 50], y: [0, 600], xlabel: 't', ylabel: 'P', curves: [{ fn: '500/(1 + 99*exp(-0.2x))', color: 'accent' }], hlines: [{ y: 500, label: 'levels off at 500', color: 'good' }] }, caption: 'The behaviour described: slow, exponential-looking growth at first, then a steady approach to 500.' },
      prompt: 'A population grows exponentially at first but levels off at 500. Which equation models it?',
      choices: [t`$\dfrac{dP}{dt} = 0.2P\left(1 - \dfrac{P}{500}\right)$`, t`$\dfrac{dP}{dt} = 0.2P$`, t`$\dfrac{dP}{dt} = 0.2\,(500 - P)$`, t`$\dfrac{dP}{dt} = 0.2P\left(\dfrac{P}{500} - 1\right)$`],
      answer: 0,
      why: {
        1: 'Pure exponential growth never levels off.',
        2: t`This one does level off at 500, but like a cooling curve: its rate is largest at the very start, $0.2 \times 500$, so there is no slow exponential beginning.`,
        3: t`The sign is flipped: below 500 the rate is negative, so the population dies out, and above 500 it explodes. 500 is an *unstable* equilibrium here.`,
      },
      hints: ['Exponential at first means dP/dt ≈ rP when P is small.', 'Levelling off at 500 means dP/dt → 0 as P → 500 from below, with dP/dt > 0 on the way.'],
      teach: 'The logistic equation is exponential growth multiplied by a brake, (1 − P/K), that reaches zero at the carrying capacity.',
      explain: t`For small $P$, $0.2P(1 - P/500) \approx 0.2P$ (exponential); at $P = 500$ the rate is zero; between 0 and 500 it is positive. That is logistic growth with $r = 0.2$ and $K = 500$.`,
    }),
    num({
      id: 'logistic-value', difficulty: 2,
      gen(r) {
        const K = r.pick([200, 500, 1000]), P0 = K / r.pick([10, 20, 25, 50]), rr = r.pick([0.2, 0.3, 0.4]), t1 = r.pick([5, 10, 15]);
        const A = (K - P0) / P0, P = K / (1 + A * Math.exp(-rr * t1));
        return {
          prompt: t`A population obeys $\dfrac{dP}{dt} = ${rr}P\left(1 - \dfrac{P}{${K}}\right)$ ($t$ in years) with $P(0) = ${nice(P0)}$. Use the logistic solution $P = \dfrac{K}{1 + Ae^{-rt}}$, $A = \dfrac{K - P_0}{P_0}$, to find $P(${t1})$.`,
          answer: P, tol: { rel: 0.01 },
          errors: [{ value: P0 * Math.exp(rr * t1), feedback: 'That is pure exponential growth; the logistic brake slows the population as it nears K.' }].filter((e) => Math.abs(e.value - P) > 0.03 * P),
          hints: [t`$A = \dfrac{${K} - ${nice(P0)}}{${nice(P0)}} = ${nice(A)}$.`, t`$P(${t1}) = \dfrac{${K}}{1 + ${nice(A)}\,e^{-${nice(rr * t1)}}}$.`],
          teach: 'The logistic solution needs three numbers: K, r and A = (K − P₀)/P₀ from the starting value.',
          explain: t`$A = ${nice(A)}$, $e^{-${nice(rr * t1)}} = ${fmt(Math.exp(-rr * t1), 4)}$, so $P(${t1}) = \dfrac{${K}}{1 + ${fmt(A * Math.exp(-rr * t1), 4)}} \approx ${fmt(P, 3)}$.`,
          visual: {
            type: 'graph',
            params: { x: [0, 30], y: [0, 1.15 * K], xlabel: 't (years)', ylabel: 'P', curves: [{ fn: `${K}/(1 + ${A}*exp(-${rr}x))`, color: 'accent' }], hlines: [{ y: K, label: `K = ${K}`, color: 'good' }], vlines: [{ x: t1, label: `t = ${t1}`, color: 'gold' }] },
            caption: 'The logistic curve for these numbers; your answer is its height at the gold line.',
          },
        };
      },
    }),
    num({
      id: 'max-rate', difficulty: 2,
      gen(r) {
        const K = r.pick([400, 600, 800, 1200]), rr = r.pick([0.1, 0.2, 0.25, 0.5]);
        const M = (rr * K) / 4;
        return {
          prompt: t`For $\dfrac{dP}{dt} = ${rr}P\left(1 - \dfrac{P}{${K}}\right)$ (per year), what is the **largest** possible growth rate $\dfrac{dP}{dt}$, in individuals per year?`,
          answer: M, tol: { rel: 0.005 },
          errors: [{ value: rr * K, feedback: t`$rK$ would be the rate at $P = K$ if there were no brake — but at $P = K$ the rate is zero.` }, { value: (rr * K) / 2, feedback: t`At $P = K/2$ the brake $1 - P/K$ is $\tfrac12$ too: the rate is $r\cdot\frac{K}{2}\cdot\frac12$.` }],
          hints: [t`As a function of $P$, the rate $${rr}P(1 - P/${K})$ is a downward parabola with zeros at $P = 0$ and $P = ${K}$.`, t`Its maximum is at the midpoint, $P = ${K / 2}$. Substitute that in.`],
          teach: 'Logistic growth is fastest at half the carrying capacity, where the rate is rK/4.',
          explain: t`The rate is largest at $P = K/2 = ${K / 2}$: $\;${rr}\times${K / 2}\times\left(1 - \tfrac12\right) = ${nice(M)}$ per year, which is $rK/4$.`,
          visual: {
            type: 'graph',
            params: { x: [0, 1.1 * K], y: [0, 1.3 * M], xlabel: 'P', ylabel: 'dP/dt', curves: [{ fn: `${rr}*x*(1 - x/${K})`, color: 'accent' }] },
            caption: 'The growth rate as a function of the population: a parabola, zero at P = 0 and at P = K.',
          },
        };
      },
    }),
    num({
      id: 'time-to-90', difficulty: 3,
      gen(r) {
        const K = r.pick([100, 250, 1000]), P0 = K / r.pick([10, 20, 50]), rr = r.pick([0.2, 0.25, 0.5]);
        const A = (K - P0) / P0, T = Math.log(9 * A) / rr;
        return {
          prompt: t`A population with $r = ${rr}$ per year and carrying capacity $K = ${K}$ starts at $P_0 = ${nice(P0)}$. How many years until it reaches 90% of $K$?`,
          answer: T, units: 'yr', tol: { rel: 0.01 },
          errors: [{ value: Math.log(A) / rr, feedback: t`That is when it reaches *half* of $K$. For 90%, set $P = 0.9K$.` }, { value: Math.log(9) / rr, feedback: t`You lost the factor $A = ${nice(A)}$ from the starting value.` }],
          hints: [t`Set $\dfrac{K}{1 + Ae^{-rt}} = 0.9K$ with $A = \dfrac{K - P_0}{P_0} = ${nice(A)}$.`, t`Then $1 + Ae^{-rt} = \dfrac{1}{0.9}$, so $Ae^{-rt} = \dfrac19$.`, t`$e^{rt} = 9A$, so $t = \dfrac{\ln(9A)}{r}$.`],
          teach: 'To find when a logistic curve reaches a level, set P equal to it and solve the exponential with a logarithm.',
          explain: t`$Ae^{-rt} = \tfrac19 \Rightarrow t = \dfrac{\ln(9 \times ${nice(A)})}{${rr}} = ${fmt(T, 3)}$ years.`,
          visual: {
            type: 'graph',
            params: { x: [0, Math.ceil(1.5 * T)], y: [0, 1.15 * K], xlabel: 't (years)', ylabel: 'P', curves: [{ fn: `${K}/(1 + ${A}*exp(-${rr}x))`, color: 'accent' }], hlines: [{ y: 0.9 * K, label: '90% of K', color: 'gold' }, { y: K, label: 'K', color: 'good' }] },
            caption: 'Where the curve crosses the gold line is the time you want.',
          },
        };
      },
    }),
    mcq({
      id: 'doubling-trap', difficulty: 2, kind: 'error',
      prompt: t`A population follows $\dfrac{dP}{dt} = 0.4P\left(1 - \dfrac{P}{1000}\right)$ with $P(0) = 10$. A student says: “It doubles every $\ln 2/0.4 \approx 1.7$ hours, so after 17 hours it is $10 \times 2^{10} \approx 10\,000$.” What is wrong?`,
      choices: [
        t`The doubling time $\ln 2/r$ holds only while $P \ll K$; the population can never exceed $K = 1000$`,
        t`The doubling time should be $r/\ln 2$`,
        t`The doubling time should be $1/r = 2.5$ hours`,
        'Nothing: logistic growth is exponential at every population',
      ],
      answer: 0,
      why: {
        1: t`$r/\ln 2$ has units of 1/time — it cannot be a time.`,
        2: t`$1/r$ is the e-folding time (growth by a factor $e$), not the doubling time — and that is not the main error.`,
        3: t`Only while $P \ll K$; the brake $(1 - P/1000)$ matters more and more as $P$ grows.`,
      },
      hints: ['What is the carrying capacity?', t`Can a logistic population that starts below $K$ ever pass $K$?`],
      teach: 'Logistic growth looks exponential only while the population is far below its carrying capacity.',
      explain: t`Early on the student is right — it does double about every 1.7 h. But by the time $P$ is a sizeable fraction of 1000 the growth slows, and the population levels off at 1000: after 17 h it is $\frac{1000}{1 + 99e^{-6.8}} \approx ${fmt(1000 / (1 + 99 * Math.exp(-6.8)), 3)}$, not 10 000.`,
      visual: {
        type: 'graph',
        params: { x: [0, 20], y: [0, 1400], xlabel: 't (h)', ylabel: 'P', curves: [{ fn: '10*2^(x/1.733)', color: 'warn', dash: true, label: 'doubling forever', labelAt: 9 }, { fn: '1000/(1 + 99*exp(-0.4x))', color: 'accent', label: 'logistic', labelAt: 15 }], hlines: [{ y: 1000, label: 'K = 1000', color: 'good' }] },
        caption: 'The student’s doubling model (dashed) against the logistic solution.',
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-stability', difficulty: 2,
      prompt: t`For $\dfrac{dP}{dt} = 0.3P\left(1 - \dfrac{P}{200}\right)$, which statement is true?`,
      choices: [
        t`$P = 200$ is a stable equilibrium: populations above it shrink towards it and populations below it grow towards it`,
        t`$P = 200$ is unstable: populations near it move away`,
        'Every positive population eventually exceeds 200',
        t`$P = 100$ is an equilibrium, because growth is fastest there`,
      ],
      answer: 0,
      why: {
        1: t`Check the signs: for $P$ just above 200 the rate is negative, and just below it is positive — both push towards 200.`,
        2: t`A population below 200 approaches 200 but can never cross it, because $P = 200$ is itself a solution.`,
        3: t`At $P = 100$ the rate is $0.3 \times 100 \times \tfrac12 = 15 \neq 0$. Fastest growth is not zero growth.`,
      },
      hints: ['Find the sign of dP/dt just above and just below 200.'],
      teach: 'An equilibrium is stable when the rate pushes nearby states back towards it from both sides.',
      explain: t`For $P > 200$, $1 - P/200 < 0$ so $P$ decreases; for $0 < P < 200$ the rate is positive so $P$ increases. Both sides head for 200: a stable equilibrium. ($P = 0$ is the unstable one.)`,
      visual: { type: 'phase', params: { slope: true, f: '0.3*y*(1 - y/200)', x: [0, 30], y: [0, 300], start: [0, 280], h: 1 }, caption: 'The slope field, with time along the horizontal axis. Drag the start point above and below 200.' },
    }),
    num({
      id: 'cp-altitude', difficulty: 2, transfer: true,
      visual: { type: 'graph', params: { x: [0, 4], y: [0, 1.1], xlabel: 'altitude z / H', ylabel: 'p/p₀', curves: [{ fn: 'exp(-x)', color: 'accent' }], points: [{ x: 1, y: Math.exp(-1), label: '1/e at one scale height', color: 'gold' }, { x: 2, y: Math.exp(-2), label: '1/e² at two', color: 'gold' }] }, caption: 'The isothermal atmosphere in units of the scale height H: every climb of H divides the pressure by e. (The real atmosphere is colder aloft, so its pressure falls a little faster.)' },
      gen(r) {
        const z = r.pick([3, 5, 8, 10]), H = 8.4, p0 = 101.3;
        const p = p0 * Math.exp(-z / H);
        return {
          prompt: t`In an atmosphere at one uniform temperature, pressure falls with altitude $z$ as $\dfrac{dp}{dz} = -\dfrac{p}{H}$, with scale height $H \approx 8.4$ km near Earth’s surface. Sea-level pressure is 101.3 kPa. Estimate the pressure at $z = ${z}$ km.`,
          answer: p, units: 'kPa', tol: { rel: 0.01 },
          errors: [{ value: p0 * (1 - z / H), feedback: t`Pressure does not fall in a straight line: $\frac{dp}{dz} = -p/H$ is proportional to $p$, so $p = p_0e^{-z/H}$.` }, { value: p0 * Math.exp(-z * H), feedback: t`The exponent is $-z/H$: divide by the scale height.` }],
          hints: [t`This is exponential decay in altitude: $p = p_0e^{-z/H}$.`, t`$p = 101.3\,e^{-${z}/8.4}$ kPa.`],
          teach: 'Whenever a rate of change is proportional to the amount, the solution is an exponential — whether the variable is time or altitude.',
          explain: t`$p = 101.3\,e^{-${z}/8.4} = 101.3 \times ${fmt(Math.exp(-z / H), 3)} \approx ${fmt(p, 3)}$ kPa. The real atmosphere is colder aloft, so the isothermal model overestimates: the International Standard Atmosphere gives about ${({ 3: 70, 5: 54, 8: 36, 10: 26 })[z]} kPa at ${z} km.`,
        };
      },
    }),
    num({
      id: 'cp-drug', difficulty: 2, transfer: true,
      visual: { type: 'graph', params: { x: [0, 5], y: [0, 1.1], xlabel: 'time / half-life', ylabel: 'fraction left', curves: [{ fn: '2^(-x)', color: 'accent' }], points: [1, 2, 3, 4].map((k) => ({ x: k, y: 2 ** -k, color: 'gold' })) }, caption: 'First-order elimination in units of the half-life: each half-life halves whatever is left.' },
      gen(r) {
        const T = r.pick([4, 6, 8, 12]), frac = r.pick([0.1, 0.05, 0.2]);
        const time = T * Math.log(1 / frac) / LN2;
        return {
          prompt: t`A medicine has an elimination half-life of ${T} hours (first-order kinetics: the rate of removal is proportional to the amount left). How long after a single dose until only ${Math.round(frac * 100)}% of it remains?`,
          answer: time, units: 'h', tol: { rel: 0.01 },
          errors: [{ value: T * (1 - frac) * 2, feedback: 'Elimination is exponential, not linear: each half-life removes half of what is left.' }],
          hints: [t`The amount left after $t$ hours is $2^{-t/${T}}$ of the dose.`, t`Solve $2^{-t/${T}} = ${frac}$: $\;t = ${T}\,\log_2(1/${frac}) = ${T}\,\dfrac{\ln(1/${frac})}{\ln 2}$.`],
          teach: 'With first-order kinetics, the number of half-lives elapsed is log₂ of the factor by which the amount has fallen.',
          explain: t`$t = ${T} \times \dfrac{\ln ${nice(1 / frac)}}{\ln 2} = ${T} \times ${fmt(Math.log(1 / frac) / LN2, 3)} \approx ${fmt(time, 3)}$ h.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §4.4 The logistic equation', url: 'https://openstax.org/books/calculus-volume-2/pages/4-4-the-logistic-equation' },
    { label: 'OpenStax Calculus Vol. 2, §2.8 Exponential growth and decay', url: 'https://openstax.org/books/calculus-volume-2/pages/2-8-exponential-growth-and-decay' },
  ],
});
