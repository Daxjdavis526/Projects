// The partition function: Z = Σ e^(−E/kT) as the normaliser of Boltzmann
// probabilities and as the effective number of accessible states. Z for the
// three model systems — a two-level system, a harmonic oscillator (a
// geometric series) and a rigid rotor (summed numerically; ≈ kT/ε when hot,
// halved for identical nuclei) — with HCl, N₂ on Titan and a coded sum.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, HCK, DIATOMIC, r4, texNum, apart, ladderPic, tag } from './_stat.js';

const t = String.raw;
const L10 = Math.log10;
/** Z of a rigid rotor at τ = kT/ε (ε = hcB, levels J(J+1)ε with 2J + 1 states). */
const zRot = (tau) => { let s = 0; for (let J = 0; J < 400; J++) s += (2 * J + 1) * Math.exp(-(J * (J + 1)) / tau); return s; };
/** The same as expression text of `tv`. */
const zRotExpr = (tv, Jmax = 40) => `(${Array.from({ length: Jmax + 1 }, (_, J) => `${2 * J + 1}*e^(-${J * (J + 1)}/(${tv}))`).join(' + ')})`;
const zOsc = (tau) => 1 / (1 - Math.exp(-1 / tau));
// HCl: ground-state rotational constant B₀ = 10.4398 cm⁻¹ (NIST Chemistry WebBook, H³⁵Cl)
const B_HCL = 10.4398, TH_HCL = B_HCL * HCK;
const EX = { T: 300 };
EX.tau = EX.T / TH_HCL; EX.Z = zRot(EX.tau);
EX.p = (J) => ((2 * J + 1) * Math.exp(-(J * (J + 1)) / EX.tau)) / EX.Z;
// CO (B₀ = 1.9225 cm⁻¹) and N₂ (from the course's table)
const TH_N2 = DIATOMIC.N2.B * HCK, TH_CO = 1.9225 * HCK;

// the Explore picture: populations of each level for the chosen system and kT/ε
const SYS = [
  { key: 0, P: (i) => (i > 1 ? '0' : `${i ? 'e^(-1/tau)' : '1'}/(1 + e^(-1/tau))`), Z: '1 + e^(-1/tau)' },
  { key: 1, P: (i) => `e^(-${i}/tau)*(1 - e^(-1/tau))`, Z: '1/(1 - e^(-1/tau))' },
  { key: 2, P: (i) => `${2 * i + 1}*e^(-${i * (i + 1)}/tau)/${zRotExpr('tau')}`, Z: zRotExpr('tau') },
];
const shade = [];
for (const s of SYS) for (let i = 0; i <= 10; i++) {
  if (s.key === 0 && i > 1) continue;
  shade.push({ fn: s.P(i), lower: '0', from: i - 0.38, to: i + 0.38, color: ['gold', 'accent', 'violet'][s.key], alpha: 0.6, when: `step(0.5 - abs(sys - ${s.key}))` });
}

/** Z against kT/ε for the oscillator and the rotor, with their high-temperature lines. */
function zPic({ which = ['osc', 'rot'], mark = null, caption, ymax = 12 }) {
  const curves = [];
  if (which.includes('osc')) curves.push({ fn: '1/(1 - e^(-1/x))', domain: [0.05, 10], color: 'accent', label: 'oscillator', labelAt: 7.5, labelDy: 16 }, { fn: 'x + 0.5', domain: [0, 10], color: 'accent', dash: true, width: 1 });
  if (which.includes('rot')) curves.push({ fn: zRotExpr('x'), domain: [0.05, 10], color: 'violet', label: 'rotor', labelAt: 6, labelDx: -40, labelDy: -12 }, { fn: 'x', domain: [0, 10], color: 'violet', dash: true, width: 1 });
  if (which.includes('two')) curves.push({ fn: '1 + e^(-1/x)', domain: [0.05, 10], color: 'gold', label: 'two-level', labelAt: 8, labelDy: -10 });
  return {
    type: 'graph',
    params: { x: [0, 10], y: [0, ymax], aspect: 'wide', axesAt: 'edge', xlabel: 'kT / ε (ε: the level spacing or rotational constant)', ylabel: 'Z', curves, vlines: mark === null ? [] : [{ x: r4(mark), color: 'gold' }], hlines: [{ y: 1, color: 'ink4' }] },
    caption,
  };
}

export default lesson({
  id: 'phys3700.T6.2',
  title: 'The partition function',
  minutes: 14, difficulty: 3,
  intro: t`The Boltzmann factors of all a system’s states do not add to 1, so they must be divided by their sum. That sum is the **partition function**,

$$Z = \sum_{s} e^{-E(s)/kT},$$

and $P(s) = e^{-E(s)/kT}/Z$. It is more than bookkeeping. With the ground state at zero energy, $Z$ is roughly **the number of states the system can reach**: near 1 when it is cold, growing as $kT$ climbs past the level spacings. And — as T6.3 and T6.5 show — every thermal property, from the average energy to the free energy, is a derivative of $\ln Z$. Three systems carry most of the physics: a **two-level system**, a **harmonic oscillator** and a **rigid rotor**.`,
  symbols: [
    { tex: 'Z', text: 'the partition function: a pure number that depends on $T$ (German *Zustandssumme*, “sum over states”)' },
    { tex: '\\sum_s', text: 'a sum over every **state** $s$ — a level with $g$ states contributes $g$ equal terms' },
    { tex: 'E(s)', text: 'the energy of state $s$, in J; shifting every energy by $E_0$ multiplies $Z$ by $e^{-E_0/kT}$ and changes no probability' },
    { tex: 'kT', text: 'the thermal energy of the reservoir, in J; often written $1/\\beta$' },
  ],
  why: 'Z is the single function from which statistical mechanics computes everything: average energies and heat capacities (T6.3), the Maxwell distribution (T6.4), free energies and the ideal gas (T6.5), and — with the particle number allowed to vary — quantum gases (T7).',
  visual: {
    type: 'graph',
    title: 'How many states are in play',
    lead: t`Bars are the probabilities of each energy **level** of the chosen system (level number $n$ or $J$ along the bottom). Raise $kT/\varepsilon$ and read $Z$ below: it counts, roughly, how many levels share the probability.`,
    tasks: [
      'Two-level system: Z rises from 1 to at most 2 — there are only two states to share.',
      'Oscillator: at kT/ε = 3 the probability spreads over about three or four levels, and Z ≈ kT/ε + ½.',
      'Rotor: level J has 2J + 1 states, so the most probable level is not the lowest, and Z ≈ kT/ε once kT/ε is a few.',
    ],
    params: {
      x: [-0.6, 10.6], y: [0, 1.05], aspect: 'wide', axesAt: 'edge', xlabel: 'level number (n or J)', ylabel: 'probability of the level', xticks: 11,
      choices: [{ key: 'sys', label: 'System', options: [[0, 'two-level'], [1, 'oscillator'], [2, 'rotor']], value: 1, explain: 'Two-level: states at 0 and ε. Oscillator: one state at each nε. Rotor: 2J + 1 states at J(J + 1)ε.' }],
      sliders: [{ key: 'tau', label: 'Temperature, $kT/\\varepsilon$', min: 0.2, max: 12, step: 0.1, value: 1.5, explain: 'The thermal energy in units of the system’s energy scale ε.' }],
      shade,
      readouts: SYS.map((s) => ({ label: '$Z$', expr: s.Z, digits: 4, when: `step(0.5 - abs(sys - ${s.key}))` })).concat([{ label: '$kT/\\varepsilon$', expr: 'tau', digits: 3 }]),
    },
    caption: 'Exact Boltzmann probabilities; the rotor’s 2J + 1 states per level are already added into its bars. Bars beyond n or J = 10 are left off (their share is small except for the hottest oscillator).',
  },
  example: {
    prompt: t`HCl’s rotational levels are $E_J = J(J+1)\varepsilon$ with $\varepsilon = hcB$, $B = ${B_HCL}\ \text{cm}^{-1}$, and level $J$ has $2J + 1$ states. At $${EX.T}$ K, find $Z_\text{rot}$ and the probability of the $J = 0$ state; which level is most populated?`,
    visual: { type: 'graph', params: { x: [-0.6, 10.6], y: [0, 0.23], aspect: 'wide', axesAt: 'edge', xlabel: 'rotational level J', ylabel: 'share of molecules', xticks: 11, shade: Array.from({ length: 11 }, (_, J) => ({ fn: String(r4(EX.p(J))), lower: '0', from: J - 0.38, to: J + 0.38, color: J === 3 ? 'gold' : 'violet', alpha: 0.6 })) }, caption: 'HCl’s rotational populations at 300 K, from the sum (rigid rotor: centrifugal stretching shifts the levels by under 0.1 % here).' },
    steps: [
      { label: 'Energy scale', text: t`$\varepsilon/k = hcB/k = ${B_HCL}\times1.4388 = ${fmt(TH_HCL, 4)}$ K, so $kT/\varepsilon = ${fmt(EX.tau, 4)}$.` },
      { label: 'Sum', text: t`$Z = \sum_J (2J+1)e^{-J(J+1)\varepsilon/kT} = 1 + 3e^{-${fmt(2 / EX.tau, 3)}} + 5e^{-${fmt(6 / EX.tau, 3)}} + \cdots = ${fmt(EX.Z, 4)}$, summed until the terms vanish.` },
      { label: 'Approximate', text: t`When $kT \gg \varepsilon$ the sum becomes an integral: $\int_0^\infty (2J+1)e^{-J(J+1)\varepsilon/kT}dJ = kT/\varepsilon = ${fmt(EX.tau, 4)}$. The exact sum is about $\tfrac13$ more.` },
      { label: 'Probabilities', text: t`$P(J{=}0\ \text{state}) = 1/Z = ${fmt(1 / EX.Z, 3)}$. Level $J$ holds $(2J+1)e^{-J(J+1)\varepsilon/kT}/Z$: $${[0, 1, 2, 3, 4].map((J) => fmt(EX.p(J), 3)).join(',\\ ')}$ for $J = 0$ to 4. The peak is at $J = 3$.` },
      { label: 'Sense check', text: t`About 20 states share the probability, and $Z \approx 20$: the partition function counts accessible states.` },
    ],
    answer: t`$Z_\text{rot} = ${fmt(EX.Z, 4)}$ (against $kT/\varepsilon = ${fmt(EX.tau, 4)}$); $P = ${fmt(1 / EX.Z, 3)}$ for the $J = 0$ state; $J = 3$ is most populated.`,
  },
  practice: [
    num({
      id: 'two-level', difficulty: 1,
      gen(r) {
        const x = r.pick([0.5, 1, 2, 3]), Z = 1 + Math.exp(-x), v = 1 / Z;
        return {
          prompt: t`A two-level system has states at $0$ and $\varepsilon$, with $\varepsilon/kT = ${x}$. What is the probability that it is in the **lower** state?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1 - v, feedback: 'That is the upper state’s probability.' }, { value: Math.exp(0), feedback: 'Divide the Boltzmann factor by Z.' }, { value: Z, feedback: 'That is Z itself. The probability is 1/Z for the state at zero energy.' }], v),
          hints: [t`$Z = 1 + e^{-\varepsilon/kT}$.`, t`$P(\text{lower}) = 1/Z = 1/(1 + e^{-${x}})$.`],
          teach: t`$P(s) = e^{-E(s)/kT}/Z$; for a state at zero energy that is just $1/Z$.`,
          explain: t`$Z = 1 + e^{-${x}} = ${fmt(Z, 4)}$, so $P = ${fmt(v, 3)}$.`,
          visual: ladderPic([{ E: 0, p: v, label: 'lower' }, { E: x, p: 1 - v, label: 'upper' }], { y: [-0.4, x + 0.8], xlabel: 'probability', ylabel: 'energy (units of kT)', caption: 'The two states, bars drawn to their probabilities (the answer is the lower bar’s length).' }),
        };
      },
    }),
    num({
      id: 'oscillator-Z', difficulty: 2,
      gen(r) {
        const tau = r.pick([0.5, 1, 2, 4]), Z = zOsc(tau);
        return {
          prompt: t`A harmonic oscillator has states at $0, \varepsilon, 2\varepsilon, \ldots$ (energies measured from the ground state). At $kT = ${tau}\,\varepsilon$, what is its partition function?`,
          answer: Z, tol: { rel: 0.01 },
          errors: apart([{ value: 1 + Math.exp(-1 / tau), feedback: 'That stops after two states. Sum the whole geometric series.' }, { value: tau, feedback: t`$kT/\varepsilon$ is the high-temperature limit; the exact sum is $1/(1 - e^{-\varepsilon/kT})$.` }, { value: 1 / (1 - Math.exp(-tau)), feedback: t`The exponent is $-\varepsilon/kT = -1/${tau}$.` }], Z),
          hints: [t`$Z = 1 + x + x^2 + \cdots$ with $x = e^{-\varepsilon/kT}$.`, t`A geometric series: $Z = 1/(1 - e^{-\varepsilon/kT})$.`],
          teach: t`The oscillator’s $Z = 1/(1 - e^{-\varepsilon/kT})$, a geometric series; when hot, $Z \approx kT/\varepsilon + \tfrac12$.`,
          explain: t`$e^{-1/${tau}} = ${fmt(Math.exp(-1 / tau), 4)}$, so $Z = 1/(1 - ${fmt(Math.exp(-1 / tau), 4)}) = ${fmt(Z, 4)}$.`,
          visual: zPic({ which: ['osc'], mark: tau, ymax: 6, caption: 'Z of an oscillator against temperature (solid), approaching kT/ε + ½ (dashed). Gold: this temperature.' }),
        };
      },
    }),
    num({
      id: 'rotor-hot', difficulty: 2,
      gen(r) {
        const g = r.pick([['CO', TH_CO, 1, 'carbon monoxide'], ['N2', TH_N2, 2, 'nitrogen']]), T = r.pick([200, 300, 500]), v = T / (g[2] * g[1]);
        return {
          prompt: t`The rotational energy scale $\varepsilon/k$ is $${fmt(g[1], 4)}$ K for ${g[3]} (${g[0] === 'CO' ? 'CO, two different nuclei' : 'N₂, two identical nuclei'}). Using the high-temperature approximation, what is $Z_\text{rot}$ at $${T}$ K?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart(g[2] === 2 ? [{ value: T / g[1], feedback: 'With identical nuclei only half the rotational states exist (a quantum symmetry requirement): divide by 2.' }] : [{ value: T / (2 * g[1]), feedback: 'The factor ½ is only for identical nuclei. CO’s two nuclei differ.' }], v),
          hints: [t`For $kT \gg \varepsilon$, $Z_\text{rot} \approx kT/\varepsilon$ for different nuclei and $kT/2\varepsilon$ for identical ones.`],
          teach: t`Hot rotor: $Z_\text{rot} \approx kT/\sigma\varepsilon$, with symmetry number $\sigma = 2$ for identical nuclei.`,
          explain: t`$Z \approx ${T}/(${g[2] === 2 ? '2\\times' : ''}${fmt(g[1], 4)}) = ${fmt(v, 3)}$. ${g[2] === 2 ? 'For N₂ the exchange symmetry of the two ¹⁴N nuclei allows each rotational level only with matching nuclear-spin states; once hot, the net effect is to halve the count.' : 'The exact sum adds about ⅓, a correction under 1 % here.'}`,
          visual: zPic({ which: ['rot'], caption: 'Z of a rigid rotor (no symmetry factor) against kT/ε, approaching kT/ε (dashed) once kT/ε is a few. Real gases at room temperature sit far off the right edge.', ymax: 11 }),
        };
      },
    }),
    mcq({
      id: 'meaning', difficulty: 2,
      prompt: t`With the ground state at zero energy, a system has $Z = 1.02$ at one temperature and $Z = 40$ at a higher one. What does that say?`,
      choices: ['When cold it is almost certainly in its ground state; when hot about 40 states share the probability', 'When cold it has 2 % of its energy; when hot 40 times as much energy', 'Z is a probability, so the value 40 means the calculation has gone wrong', 'Nothing physical: Z only normalises the probabilities'],
      answer: 0,
      why: { 1: 'Z is not an energy. The energy comes from how Z changes with T (next lesson).', 2: 'Z is a sum of Boltzmann factors, each up to 1; it can be any number from the ground-state degeneracy upward.', 3: 'Its size is meaningful: 1/Z is the ground state’s probability, and Z counts the states effectively in play.' },
      hints: ['What is the ground state’s probability, 1/Z, in each case?'],
      teach: 'Z is the effective number of accessible states; 1/Z is the ground state’s probability.',
      explain: t`$P(\text{ground}) = 1/Z$: $98\,\%$ when $Z = 1.02$, and $2.5\,\%$ when $Z = 40$, the probability then being spread over about 40 states.`,
      visual: zPic({ which: ['osc', 'rot', 'two'], caption: 'Z for three systems against temperature: all start at 1, and grow as more states come into reach — except the two-level system, which stops at 2.' }),
    }),
    mcq({
      id: 'zero-shift', difficulty: 3,
      prompt: t`You redo a calculation measuring every energy from a new zero, so every $E(s)$ increases by the same $E_0$. What happens?`,
      choices: [t`$Z$ is multiplied by $e^{-E_0/kT}$; every probability is unchanged`, 'Z is unchanged and so are the probabilities', t`$Z$ is multiplied by $e^{-E_0/kT}$, so every probability falls by that factor`, 'The probabilities of the higher states rise, because their energies are now further from zero'],
      answer: 0,
      why: { 1: t`Each term $e^{-(E + E_0)/kT}$ carries the factor $e^{-E_0/kT}$, so the sum does too.`, 2: 'The same factor sits in the numerator: it cancels from every probability.', 3: 'Every state moved by the same amount; their differences, which are all that matter, are unchanged.' },
      hints: [t`Factor $e^{-E_0/kT}$ out of every term of the sum.`, 'Now look at $P(s) = e^{-E(s)/kT}/Z$: the factor appears above and below.'],
      teach: 'Z depends on where you put the zero of energy; probabilities and everything measurable do not.',
      explain: t`$Z' = \sum e^{-(E_s + E_0)/kT} = e^{-E_0/kT}Z$, and $P'(s) = e^{-(E_s + E_0)/kT}/Z' = P(s)$. Including an oscillator’s zero-point energy $\tfrac12\hbar\omega$ is exactly such a shift; it will reappear as a constant in the energy and the free energy, never in a probability.`,
      visual: ladderPic([0, 1, 2, 3].map((n) => ({ E: n + 0.5, p: 0.5 * 0.5 ** n, label: `n = ${n}` })), { y: [-0.3, 4.2], x: [0, 0.7], showG: false, ylabel: 'energy (units of ħω, zero-point included)', xlabel: 'probability', caption: 'An oscillator’s levels with the zero-point energy ½ħω included: every level is lifted equally, and the probabilities (bars, at kT = 1.44ħω) are unchanged.', extra: { curves: [{ fn: '0', domain: [0, 0.7], color: 'ink2', width: 1 }], points: [tag(0.62, 0, 'E = 0', 'ink2', -8, -8)] } }),
    }),
    code({
      id: 'rotor-sum', difficulty: 3,
      prompt: t`Write \`Z_rot(tau)\` that **returns** the rigid rotor’s partition function $\sum_{J=0}^{\infty}(2J+1)e^{-J(J+1)/\tau}$ at $\tau = kT/\varepsilon$ (sum enough terms that the rest are negligible), and \`P_level(J, tau)\` that returns the probability of the **level** $J$. Then print $Z$ at $\tau = 1$ and $\tau = 20$.`,
      starter: t`import math

def Z_rot(tau):
    pass

def P_level(J, tau):
    pass

print(Z_rot(1), Z_rot(20))
`,
      answer: t`import math

def Z_rot(tau):
    return sum((2*J + 1) * math.exp(-J*(J + 1) / tau) for J in range(400))

def P_level(J, tau):
    return (2*J + 1) * math.exp(-J*(J + 1) / tau) / Z_rot(tau)

print(Z_rot(1), Z_rot(20))`,
      tests: [
        { name: t`$Z$ at $\tau = 1$ is $${fmt(zRot(1), 5)}$`, code: `abs(Z_rot(1) - ${zRot(1)}) < 1e-6` },
        { name: t`$Z$ at $\tau = 20$ is $${fmt(zRot(20), 6)}$, about $\tau + \tfrac13$`, code: `abs(Z_rot(20) - ${zRot(20)}) < 1e-6` },
        { name: 'the level probabilities add up to 1 at τ = 5', code: 'abs(sum(P_level(J, 5) for J in range(100)) - 1) < 1e-9' },
        { name: t`at $\tau = 20$ the most probable level is $J = 3$`, code: 'max(range(30), key=lambda J: P_level(J, 20)) == 3' },
      ],
      hints: [t`A generator inside \`sum(...)\` over \`range(400)\` is plenty: for $\tau \le 100$ the terms die long before $J = 400$.`, t`\`P_level\` is the level’s term — degeneracy times Boltzmann factor — divided by \`Z_rot(tau)\`.`],
      teach: 'A partition function is a sum you can always do numerically; the integral approximation kT/ε is its high-temperature limit.',
      explain: t`The sum converges fast because the exponent grows like $J^2$. $Z(20) = ${fmt(zRot(20), 6)}$ against the integral’s $20$: the Euler–Maclaurin correction $\tfrac13 + \tfrac{1}{15\tau}$ accounts for the difference.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-titan', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([90, 94, 100]), v = T / (2 * TH_N2);
        return {
          prompt: t`Titan’s lower atmosphere is mostly nitrogen at about $${T}$ K. N₂’s rotational energy scale is $\varepsilon/k = ${fmt(TH_N2, 4)}$ K, and its two nuclei are identical. Estimate N₂’s rotational partition function there.`,
          answer: v, tol: { rel: 0.015 },
          errors: apart([{ value: T / TH_N2, feedback: 'Identical nuclei: half the rotational states are missing. Divide by 2.' }, { value: TH_N2 / T, feedback: 'Upside down: Z grows with temperature, Z ≈ kT/2ε.' }], v),
          hints: [t`$kT/\varepsilon = ${fmt(T / TH_N2, 3)}$: hot enough for the integral approximation.`, t`$Z \approx kT/(2\varepsilon)$ for a molecule with identical nuclei.`],
          teach: t`$Z_\text{rot} \approx kT/\sigma\varepsilon$ whenever $kT$ is many times $\varepsilon$ — true for all common gases except hydrogen, even at Titan’s 94 K.`,
          explain: t`$Z \approx ${T}/(2\times${fmt(TH_N2, 4)}) = ${fmt(v, 3)}$: even on frigid Titan, about 16 rotational states per molecule are in play, so N₂’s rotation is fully classical there.`,
          visual: zPic({ which: ['rot'], caption: 'Z of a rigid rotor (without the symmetry factor) against kT/ε; Titan’s nitrogen is at kT/ε ≈ 33, far to the right.', ymax: 11 }),
        };
      },
    }),
    num({
      id: 'cp-ground', difficulty: 3,
      gen(r) {
        const T = r.pick([500, 1000, 1500, 2500]), th = DIATOMIC.O2.nu * HCK, v = 1 - Math.exp(-th / T);
        return {
          prompt: t`O₂’s vibration is close to a harmonic oscillator with quantum $\varepsilon/k = ${fmt(th, 4)}$ K. In oxygen gas at $${T}$ K, what fraction of the molecules is in the vibrational ground state?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / (1 + Math.exp(-th / T)), feedback: 'That treats the oscillator as two-level. It has a whole ladder: $Z = 1/(1 - e^{-\\varepsilon/kT})$.' }, { value: Math.exp(-th / T), feedback: 'That is the ratio P(1)/P(0).' }], v),
          hints: [t`$P(0) = 1/Z$ with $Z = 1/(1 - e^{-\varepsilon/kT})$.`, t`$P(0) = 1 - e^{-${fmt(th, 4)}/${T}}$.`],
          teach: t`An oscillator’s ground-state probability is $1/Z = 1 - e^{-\varepsilon/kT}$.`,
          explain: t`$e^{-${fmt(th / T, 3)}} = ${fmt(Math.exp(-th / T), 3)}$, so $P(0) = ${fmt(v, 3)}$. (Real O₂ is slightly anharmonic, which matters only for the higher levels.)`,
          visual: zPic({ which: ['osc'], mark: T / th, ymax: 3, caption: 'Z of an oscillator against kT/ε; gold marks this temperature. 1/Z is the ground state’s share.' }),
        };
      },
    }),
    mcq({
      id: 'cp-range', difficulty: 2,
      prompt: t`A system has a nondegenerate ground state (energy 0) and a single excited state. Over all positive temperatures, what values can its $Z$ take?`,
      choices: ['Between 1 and 2', 'Between 0 and 1', 'From 1 upward without limit', 'Exactly 2 at every temperature'],
      answer: 0,
      why: { 1: 'Z is a sum of probabilities’ numerators, not a probability; the ground-state term alone is 1.', 2: 'With only two states, Z can never pass 2: each Boltzmann factor is at most 1.', 3: 'That is the infinite-temperature limit, where both states are equally likely.' },
      hints: [t`$Z = 1 + e^{-\varepsilon/kT}$. What is the second term at $T \to 0$ and $T \to \infty$?`],
      teach: 'Z runs from the ground-state degeneracy (cold) to the total number of states (hot).',
      explain: t`$Z = 1 + e^{-\varepsilon/kT}$: 1 at $T \to 0$, 2 at $T \to \infty$. In general $Z$ climbs from the number of ground states toward the number of all states.`,
      visual: zPic({ which: ['two'], ymax: 2.5, caption: 'Z of a two-level system against kT/ε.' }),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §§6.1–6.2', url: 'https://physics.weber.edu/thermal/' },
    { label: 'NIST Chemistry WebBook: hydrogen chloride, diatomic constants', url: 'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7647010&Mask=1000' },
    { label: 'NIST Chemistry WebBook: carbon monoxide, diatomic constants', url: 'https://webbook.nist.gov/cgi/cbook.cgi?ID=C630080&Mask=1000' },
    { label: 'NASA, Titan fact sheet', url: 'https://science.nasa.gov/saturn/moons/titan/' },
  ],
});
