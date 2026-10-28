// Entropy as missing information: Shannon's H = −Σ p log₂ p in bits, Gibbs's
// S = −k Σ p ln p, so one bit is k ln 2 of entropy; S = k ln Ω when every
// state is equally likely; maximum entropy at fixed mean energy gives the
// Boltzmann distribution (Lagrange multipliers); Landauer's kT ln 2 per
// erased bit, its experimental test (Bérut et al. 2012), Maxwell's demon; and
// a gas's entropy read as bits of missing information per atom.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, LN2, r4, texNum, apart } from './_th4.js';
import { sackurTetrode, bars } from './_count.js';
import { MASS } from './_stat.js';

const t = String.raw;
const H2 = (p) => (p <= 0 || p >= 1 ? 0 : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p));
const H2_EXPR = '-(x*log2(x) + (1 - x)*log2(1 - x))';
const ZJ = 1e-21;

/** The binary entropy curve with an optional marked p. */
function binPic({ p = null, caption } = {}) {
  return {
    type: 'graph',
    params: { x: [0, 1], y: [0, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'probability of heads p', ylabel: 'H (bits)', curves: [{ fn: H2_EXPR, domain: [0.0005, 0.9995], color: 'accent', width: 2.4 }], vlines: p === null ? [] : [{ x: p, color: 'gold', label: `p = ${p}` }] },
    caption: caption || 'Shannon entropy of a coin that lands heads with probability p: one bit when the coin is fair, none when the outcome is certain.',
  };
}

const CODE = t`import numpy as np

def entropy_bits(p):
    """Shannon entropy in bits of a probability array p, with 0 log 0 = 0."""
    p = np.asarray(p, dtype=float)
    q = p[p > 0]
    return float(-np.sum(q * np.log2(q)))

def boltzmann(E, kT):
    """Boltzmann probabilities for energies E at temperature kT (same units)."""
    w = np.exp(-(np.asarray(E, dtype=float) - np.min(E)) / kT)
    return w / w.sum()

print(entropy_bits([0.5, 0.5]), entropy_bits([1, 0]), entropy_bits(np.ones(8) / 8))
print(boltzmann([0, 1, 2], 1.0))
`;

export default lesson({
  id: 'phys3700.T9.2',
  title: 'Entropy as missing information',
  minutes: 18, difficulty: 3,
  intro: t`Entropy has a second meaning that turns out to be the same as the first: it measures **how much you do not know** about which microstate a system is in. Claude Shannon (1948) showed that the missing information in a probability distribution is $H = -\sum_i p_i\log_2 p_i$ bits — one bit for a fair coin, none for a certain outcome. Gibbs’s entropy is the same sum with natural logs and Boltzmann’s constant:

$$S = -k\sum_i p_i\ln p_i .$$

When all $\Omega$ states are equally likely this is $k\ln\Omega$ (T2.4); for Boltzmann probabilities it is the canonical entropy. So **one bit of missing information is $k\ln 2$ of entropy**, and erasing a bit has a thermodynamic price — at least $kT\ln 2$ of heat (Landauer, 1961), a bound first checked in the laboratory in 2012.`,
  symbols: [
    { tex: 'S', text: 'the entropy of the distribution, in J/K' },
    { tex: 'k', text: 'Boltzmann’s constant, $1.380\\,649\\times10^{-23}$ J/K (exact)' },
    { tex: 'p_i', text: 'the probability of microstate $i$; the $p_i$ add up to 1 (terms with $p_i = 0$ contribute nothing, since $p\\ln p \\to 0$)' },
    { tex: '\\ln', text: 'the natural logarithm; with $\\log_2$ instead and no $k$, the same sum counts bits: $S = (k\\ln 2)\\,H$' },
  ],
  why: 'Information entropy links thermodynamics to computing, communication and black holes: it sets the minimum energy cost of computation and, in T11.2, counts the hidden states of a horizon.',
  visual: {
    type: 'graph',
    title: 'How uncertain is a coin?',
    lead: t`A coin lands heads with probability $p$. The curve is its Shannon entropy $H(p)$ in bits; the readouts convert it to Gibbs entropy. Drag $p$ and see where the missing information is largest.`,
    tasks: [
      'At p = 0.5 you know nothing in advance: exactly 1 bit, or k ln 2 = 9.57 × 10⁻²⁴ J/K.',
      'At p = 0.9 the coin is predictable: only 0.47 bits per toss — the reason a biased source can be compressed.',
      'As p → 0 or 1 the entropy falls to zero: a certain outcome carries no information.',
    ],
    params: {
      x: [0, 1], y: [0, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'probability of heads p', ylabel: 'H (bits)',
      sliders: [{ key: 'p', label: 'Probability of heads $p$', min: 0.01, max: 0.99, step: 0.01, value: 0.5, explain: 'How biased the coin is. A fair coin has $p = 0.5$.' }],
      curves: [{ fn: H2_EXPR, domain: [0.0005, 0.9995], color: 'accent', width: 2.4 }],
      points: [{ x: 'p', y: '-(p*log2(p) + (1 - p)*log2(1 - p))', r: 6, color: 'gold' }],
      readouts: [
        { label: '$H$ (bits)', expr: '-(p*log2(p) + (1 - p)*log2(1 - p))', digits: 3 },
        { label: '$S/k = H\\ln 2$', expr: '-(p*ln(p) + (1 - p)*ln(1 - p))', digits: 3 },
        { label: '$S$ (J/K)', expr: `-(p*ln(p) + (1 - p)*ln(1 - p))*${KB}`, digits: 3, zero: 0 },
      ],
    },
    caption: 'Shannon entropy of a two-outcome distribution. Exact; no approximation.',
  },
  example: {
    prompt: t`**Maximum entropy.** A system has states of energy $E_i$. Among all probability distributions with a given average energy $U$, which one has the most missing information? Show it is the Boltzmann distribution.`,
    visual: bars([0, 1, 2, 3, 4, 5].map((E) => ({ x: E, y: r4(Math.exp(-E / 1.5) / [0, 1, 2, 3, 4, 5].reduce((s, e) => s + Math.exp(-e / 1.5), 0)) })), { x: [-0.7, 5.7], y: [0, 0.6], xlabel: 'state energy Eᵢ (units of ε)', ylabel: 'probability pᵢ', hlines: [{ y: r4(1 / 6), color: 'ink3', label: 'uniform' }], caption: 'The maximum-entropy distribution at fixed average energy (here kT = 1.5ε over six evenly spaced states): a Boltzmann exponential. The uniform distribution has more entropy, but a higher average energy.' }),
    steps: [
      { label: 'The problem', text: t`Maximize $S = -k\sum_i p_i\ln p_i$ subject to two constraints: $\sum_i p_i = 1$ and $\sum_i p_iE_i = U$. Without the energy constraint the answer would be uniform, $p_i = 1/\Omega$.` },
      { label: 'Lagrange multipliers', text: t`Maximize $\mathcal L = -\sum_i p_i\ln p_i - \alpha\bigl(\sum_i p_i - 1\bigr) - \beta\bigl(\sum_i p_iE_i - U\bigr)$ (dividing $S$ by $k$). Set $\partial\mathcal L/\partial p_i = 0$: $-\ln p_i - 1 - \alpha - \beta E_i = 0$.` },
      { label: 'Solve', text: t`$p_i = e^{-1-\alpha}e^{-\beta E_i}$. Normalizing fixes $e^{1+\alpha} = \sum_i e^{-\beta E_i} = Z$, so $p_i = e^{-\beta E_i}/Z$.` },
      { label: 'Identify beta', text: t`At the maximum, $S/k = \beta U + \ln Z$, so $\dfrac{\partial S}{\partial U} = k\beta$. But $\partial S/\partial U = 1/T$ (T3.1), so $\beta = 1/kT$: the multiplier that enforces the average energy **is** the inverse temperature.` },
    ],
    answer: t`$p_i = e^{-E_i/kT}/Z$: the Boltzmann distribution is the least-committal distribution consistent with a known average energy (Jaynes, 1957).`,
  },
  practice: [
    num({
      id: 'biased-coin', difficulty: 1,
      gen(r) {
        const p = r.pick([0.1, 0.2, 0.25, 0.3, 0.75, 0.8, 0.9, 0.95]), v = H2(p);
        return {
          prompt: t`A bent coin lands heads with probability $${p}$. How many bits of information does one toss give, on average?`,
          answer: v, units: '', tol: { rel: 0.005 },
          errors: apart([{ value: -p * Math.log2(p), feedback: 'Add the term for tails as well: −(1 − p) log₂(1 − p).' }, { value: -(p * Math.log(p) + (1 - p) * Math.log(1 - p)), feedback: 'That uses natural logs (it is S/k). Bits need log₂.' }], v),
          hints: [t`$H = -p\log_2 p - (1 - p)\log_2(1 - p)$.`, t`$\log_2 x = \ln x/\ln 2$.`],
          teach: 'Shannon entropy H = −Σ p log₂ p: the average information an outcome carries, in bits.',
          explain: t`$H = -${p}\log_2 ${p} - ${fmt(1 - p, 3)}\log_2 ${fmt(1 - p, 3)} = ${fmt(v, 4)}$ bits — less than the 1 bit of a fair coin, because you can already guess the outcome.`,
          visual: binPic({ p }),
        };
      },
    }),
    num({
      id: 'password', difficulty: 2,
      gen(r) {
        const [A, what] = r.pick([[10, 'decimal digits'], [26, 'lower-case letters'], [62, 'letters and digits (upper and lower case)'], [16, 'hexadecimal digits']]), L = r.pick([4, 6, 8, 12]);
        const v = L * Math.log2(A);
        return {
          prompt: t`A code of $${L}$ characters is chosen at random, each independently and uniformly from the ${A} ${what}. How many bits of entropy does it have?`,
          answer: v, units: '', tol: { rel: 0.005 },
          errors: apart([{ value: Math.log2(A * L), feedback: 'There are A to the power L codes, not A × L.' }, { value: L * Math.log10(A), feedback: 'Use log₂ for bits.' }, { value: L * Math.log(A), feedback: 'That is in natural units (nats). Use log₂ for bits.' }], v),
          hints: [t`There are $${A}^{${L}}$ equally likely codes, and $H = \log_2\Omega$ when all $\Omega$ outcomes are equally likely.`, t`$\log_2 ${A}^{${L}} = ${L}\log_2 ${A}$.`],
          teach: 'For Ω equally likely outcomes, H = log₂ Ω bits — the information-theory twin of S = k ln Ω.',
          explain: t`$H = ${L}\log_2 ${A} = ${L}\times${fmt(Math.log2(A), 4)} = ${fmt(v, 4)}$ bits. Each bit doubles the number of guesses an attacker needs.`,
          visual: bars(Array.from({ length: 12 }, (_, i) => ({ x: i + 1, y: 1 / 12 })), { x: [0.2, 12.8], y: [0, 0.14], xlabel: 'outcome (the first few of many)', ylabel: 'probability', caption: 'Uniform probabilities: every outcome equally likely, which maximizes the entropy for a given number of outcomes. (Only a few outcomes are drawn.)' }),
        };
      },
    }),
    num({
      id: 'bits-to-JK', difficulty: 1,
      gen(r) {
        const [b, what] = r.pick([[8e3, 'a kilobyte (8 000 bits)'], [8e9, 'a gigabyte (8 × 10⁹ bits)'], [8e12, 'a terabyte (8 × 10¹² bits)']]), v = b * KB * LN2;
        return {
          prompt: t`How much entropy, in J/K, corresponds to ${what} of completely unknown information?`,
          answer: v, units: 'J/K', tol: { rel: 0.005 },
          errors: apart([{ value: b * KB, feedback: 'One bit is k ln 2, not k.' }, { value: b * KB * Math.log10(2), feedback: 'Use the natural log: ln 2 = 0.693.' }], v),
          hints: [t`Each bit of missing information is $k\ln 2$ of entropy.`],
          teach: 'One bit of missing information is k ln 2 = 9.57 × 10⁻²⁴ J/K of entropy.',
          explain: t`$S = N k\ln 2 = (${texNum(b, 2)})(1.3806\times10^{-23})(0.6931) = ${texNum(v, 3)}$ J/K. Compare a gram of water warmed by 1 K at room temperature: $\Delta S \approx 4.18/298 = 0.014$ J/K. Thermal entropy dwarfs any stored data.`,
          visual: { type: 'graph', params: { x: [0, 14], y: [-24, -9], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'bits of missing information', ylabel: 'entropy (J/K)', curves: [{ fn: `${r4(Math.log10(KB * LN2))} + x`, domain: [0, 14], color: 'accent' }], vlines: [{ x: r4(Math.log10(b)), color: 'gold' }] }, caption: 'Entropy against bits of missing information: a straight line, S = (k ln 2) × bits.' },
        };
      },
    }),
    num({
      id: 'landauer', difficulty: 2,
      gen(r) {
        const T = r.pick([4.2, 77, 300, 350]), v = (KB * T * LN2) / ZJ;
        return {
          prompt: t`By Landauer’s principle, what is the least heat that must be released into surroundings at $${T}$ K to erase one bit of memory? Give it in zeptojoules ($1\ \text{zJ} = 10^{-21}$ J).`,
          answer: v, units: 'zJ', tol: { rel: 0.005 },
          errors: apart([{ value: (KB * T) / ZJ, feedback: 'The bound is kT ln 2: one bit of entropy, k ln 2, times T.' }, { value: (KB * LN2) / ZJ, feedback: 'Multiply the entropy of one bit, k ln 2, by the temperature of the surroundings.' }], v),
          hints: [t`Erasing a bit removes $k\ln 2$ of entropy from the memory; the second law makes the surroundings gain at least that much.`, t`Heat $Q \ge T\Delta S = kT\ln 2$.`],
          teach: 'Landauer: erasing one bit releases at least kT ln 2 of heat — the second law applied to information.',
          explain: t`$Q_{\min} = kT\ln 2 = (1.3806\times10^{-23})(${T})(0.6931) = ${texNum(v * ZJ, 3)}$ J $= ${fmt(v, 3)}$ zJ, or $${texNum((v * ZJ) / 1.602176634e-19, 3)}$ eV. Colder surroundings make erasure cheaper — in principle.`,
          visual: { type: 'graph', params: { x: [0, 400], y: [0, 4], aspect: 'wide', axesAt: 'edge', xlabel: 'temperature of the surroundings (K)', ylabel: 'kT ln 2 (zJ)', curves: [{ fn: `${(KB * LN2) / ZJ}*x`, domain: [0, 400], color: 'accent', label: 'Landauer bound', labelAt: 120, labelDy: -12 }], vlines: [{ x: T, color: 'gold' }] }, caption: 'The Landauer bound against the temperature of the surroundings. Real electronics dissipate far more per operation.' },
        };
      },
    }),
    mcq({
      id: 'demon', difficulty: 3,
      prompt: 'Maxwell’s demon watches molecules and opens a trapdoor to let only fast ones through, apparently making heat flow from cold to hot for free. Where does the modern resolution (Landauer, Bennett) put the entropy cost?',
      choices: [
        'In resetting the demon’s memory: to keep working it must erase the bits it recorded, releasing at least kT ln 2 of heat per bit',
        'In the work needed to open and close the frictionless trapdoor',
        'In the light the demon needs to see the molecules — measurement always costs at least kT ln 2',
        'Nowhere: the demon really does violate the second law, but only for a few molecules',
      ],
      answer: 0,
      why: { 1: 'A frictionless door can in principle be moved with as little work as you like.', 2: 'This was Brillouin’s answer, but Bennett showed that measurement can be done reversibly; it is the erasure that cannot.', 3: 'Fluctuations can briefly run backwards, but on average the second law holds once the demon’s memory is included.' },
      hints: ['A demon with a finite memory must eventually make room for new observations.', 'Which step of “observe, act, record, reset” is logically irreversible — many memory states mapped onto one?'],
      teach: 'The demon’s bill comes due when it erases its memory: at least kT ln 2 per bit, which saves the second law.',
      explain: 'Bennett (1982) showed measurement and record-keeping can be thermodynamically reversible; erasure cannot, because it maps two memory states onto one. The heat released in erasing the demon’s records at least cancels what it gained by sorting molecules.',
      visual: binPic({ p: 0.5, caption: 'Each binary record the demon keeps holds up to one bit — at most k ln 2 of entropy, and at least kT ln 2 of heat to erase.' }),
    }),
    code({
      id: 'entropy-code', difficulty: 2,
      prompt: t`Write \`entropy_bits(p)\`, the Shannon entropy in bits of a probability array, treating $0\log 0$ as $0$ **without** NumPy warnings (\`np.log2(0)\` is $-\infty$, and $0\times(-\infty)$ is NaN, with a warning printed in red). Then write \`boltzmann(E, kT)\`, which returns normalized Boltzmann probabilities for an array of energies.`,
      starter: t`import numpy as np

def entropy_bits(p):
    p = np.asarray(p, dtype=float)
    # keep only the nonzero probabilities, then sum -q log2 q
    pass

def boltzmann(E, kT):
    # weights e^(-E/kT), divided by their sum
    pass

print(entropy_bits([0.5, 0.5]), entropy_bits([1, 0]), entropy_bits(np.ones(8) / 8))
print(boltzmann([0, 1, 2], 1.0))
`,
      answer: CODE,
      tests: [
        { name: 'a fair coin carries 1 bit', code: 'abs(entropy_bits([0.5, 0.5]) - 1) < 1e-12' },
        { name: 'eight equally likely outcomes carry 3 bits', code: 'abs(entropy_bits(np.ones(8) / 8) - 3) < 1e-12' },
        { name: 'a certain outcome carries 0 bits (and no NaN)', code: 'entropy_bits([1.0, 0.0, 0.0]) == 0' },
        { name: t`a coin with $p = 0.9$ carries 0.469 bits`, code: 'abs(entropy_bits([0.9, 0.1]) - 0.4689955935892812) < 1e-9' },
        { name: 'boltzmann probabilities add up to 1 and fall with energy', code: '(lambda q: abs(q.sum() - 1) < 1e-12 and q[0] > q[1] > q[2])(boltzmann(np.array([0.0, 1.0, 2.0]), 1.0))' },
        { name: 'nudging the Boltzmann distribution while keeping its mean energy lowers its entropy', code: 'entropy_bits(boltzmann(np.array([0.0, 1.0, 2.0]), 1.0)) > entropy_bits(boltzmann(np.array([0.0, 1.0, 2.0]), 1.0) + 0.02 * np.array([1, -2, 1]))' },
      ],
      hints: [t`\`q = p[p > 0]\` keeps the nonzero entries; then \`-np.sum(q * np.log2(q))\`.`, t`\`w = np.exp(-np.asarray(E) / kT)\`; return \`w / w.sum()\`. (Subtracting the smallest energy first avoids overflow when $E/kT$ is large.)`],
      teach: 'Information entropy in code: drop the zero probabilities (0 log 0 = 0), sum −p log₂ p.',
      explain: t`The last test is the maximum-entropy principle at work: adding $0.02(1, -2, 1)$ keeps the total probability and the mean energy ($0 - 2 + 2 = 0$) but moves away from the exponential, and the entropy drops.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gas-bits', difficulty: 3,
      gen(r) {
        const [k, name] = r.pick([['He', 'helium'], ['Ar', 'argon'], ['Xe', 'xenon']]), T = r.pick([298.15, 100, 500]);
        const S = sackurTetrode(MASS[k], T, 1e5), v = S / (8.31446261815324 * LN2);
        return {
          prompt: t`The Sackur–Tetrode equation gives ${name} at $${T}$ K and 1 bar a molar entropy of $${fmt(S, 4)}$ J/(mol K). Read as missing information, how many bits per atom is that?`,
          answer: v, units: '', tol: { rel: 0.005 },
          errors: apart([{ value: S / 8.31446261815324, feedback: 'That is S/(Nk), in natural units. Divide by ln 2 for bits.' }, { value: S / (8.31446261815324 * Math.log10(2)), feedback: 'Divide by ln 2 (0.693), not log₁₀ 2.' }], v),
          hints: [t`Per atom, $S/N = (S_\text{molar}/R)\,k$.`, t`Bits per atom $= \dfrac{S_\text{molar}}{R\ln 2}$, with $R = 8.314$ J/(mol K).`],
          teach: 'A gas’s entropy is a few tens of bits per atom: the information needed to pin down each atom’s position and momentum to quantum precision.',
          explain: t`$\dfrac{${fmt(S, 4)}}{8.314\times0.6931} = ${fmt(v, 3)}$ bits per atom. To specify the gas’s microstate you would need that many yes/no answers for every atom — about $${texNum(v * 6.02214076e23, 2)}$ bits per mole.`,
          visual: { type: 'graph', params: { x: [50, 600], y: [0, 35], aspect: 'wide', axesAt: 'edge', xlabel: 'temperature (K) at 1 bar', ylabel: 'bits per atom', curves: [['He', 'teal'], ['Ar', 'accent'], ['Xe', 'violet']].map(([g, c]) => ({ fn: `(${r4(sackurTetrode(MASS[g], 300, 1e5))} + 8.31446*2.5*ln(x/300))/(8.31446*${LN2})`, domain: [50, 600], color: c, label: g, labelAt: 560, labelDy: -10 })), vlines: [{ x: T, color: 'gold' }] }, caption: 'Missing information per atom of three monatomic ideal gases (Sackur–Tetrode) against temperature at 1 bar.' },
        };
      },
    }),
    mcq({
      id: 'cp-berut', difficulty: 2,
      prompt: 'In 2012 Bérut and colleagues tested Landauer’s principle with a single glass bead, about 2 μm across, held in a laser trap shaped into two wells (“0” and “1”). What did they find?',
      choices: [
        'Erasing the bit released heat on average; as they slowed the erasure, the mean heat fell towards kT ln 2 — never measurably below it',
        'Erasure released exactly kT ln 2 of heat every time, whatever the speed',
        'Erasure could be done with no heat at all if done slowly enough',
        'The heat released grew without limit as the erasure was slowed',
      ],
      answer: 0,
      why: { 1: 'kT ln 2 is a lower bound on the average, approached only for slow (quasi-static) erasure; fast erasure costs more, and single runs scatter.', 2: 'That is what Landauer’s principle forbids: the bound held.', 3: 'Slowing the protocol reduced the excess dissipation; the mean heat levelled off at the bound.' },
      hints: ['Landauer’s bound is like Carnot’s: a limit that real processes approach only when they run slowly.', 'Faster processes are less reversible and waste more.'],
      teach: 'Experiment confirms Landauer: erasing a bit costs at least kT ln 2 on average, a bound reached only by slow erasure.',
      explain: 'The bead’s position was the bit. Lowering the barrier and tilting the potential drove it into one well whatever its start: an erasure. Averaged over hundreds of cycles, the heat approached kT ln 2 for long cycles — the first direct test, published in Nature in 2012 (later experiments with feedback traps came within a few percent of the bound).',
      visual: { type: 'graph', params: { x: [-2, 2], y: [-0.4, 1.4], aspect: 'wide', axesAt: 'edge', xlabel: 'bead position (μm, sketch)', ylabel: 'potential energy (sketch)', xticks: 0, yticks: 0, curves: [{ fn: '(x^2 - 1)^2*0.9', domain: [-1.9, 1.9], color: 'accent', width: 2.4 }], points: [{ x: -1, y: 0.06, r: 6, color: 'gold', label: '0', labelDy: 18, labelDx: -4 }, { x: 1, y: 0.06, r: 0.01, color: 'gold', label: '1', labelDy: 18, labelDx: -4 }] }, caption: 'Sketch of a one-bit memory: a bead in one of two wells. Erasure lowers the barrier and tilts the wells so the bead ends in “0” whatever its start.' },
    }),
    num({
      id: 'cp-probe', difficulty: 3, transfer: true,
      gen(r) {
        const rate = r.pick([1e12, 1e15, 1e18]), T = r.pick([300, 150, 40]), v = rate * KB * T * LN2;
        return {
          prompt: t`A deep-space probe’s processor runs at $${T}$ K and erases $${texNum(rate, 1)}$ bits per second. What is the Landauer minimum power it must reject as heat, in watts?`,
          answer: v, units: 'W', tol: { rel: 0.005 },
          errors: apart([{ value: rate * KB * T, feedback: 'Each erased bit costs kT ln 2, not kT.' }, { value: rate * KB * 2.72548 * LN2, feedback: 'The heat is released at the processor’s own temperature, where the erasure happens.' }], v),
          hints: [t`Power = bits per second × $kT\ln 2$.`, t`$kT\ln 2 = ${texNum(KB * T * LN2, 3)}$ J at $${T}$ K.`],
          teach: 'Landauer sets a floor on computing power: (bits erased per second) × kT ln 2.',
          explain: t`$P = (${texNum(rate, 1)})(${texNum(KB * T * LN2, 3)}\ \text{J}) = ${texNum(v, 3)}$ W. Real processors dissipate thousands of times more per operation than the bound, so on a spacecraft the radiator budget is set by electronics, not by Landauer — though the bound does say a colder computer could, in principle, compute more per joule.`,
          visual: { type: 'graph', params: { x: [10, 20], y: [-12, 0], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'bits erased per second', ylabel: 'minimum power (W)', curves: [[300, 'warn'], [40, 'accent']].map(([TT, c]) => ({ fn: `${r4(Math.log10(KB * TT * LN2))} + x`, domain: [10, 20], color: c, label: `${TT} K`, labelAt: 11, labelDy: -10 })), vlines: [{ x: r4(Math.log10(rate)), color: 'gold' }] }, caption: 'The Landauer minimum power against erasure rate, at 300 K and 40 K, on log axes.' },
        };
      },
    }),
  ],
  sources: [
    { label: 'Shannon, A Mathematical Theory of Communication, Bell Syst. Tech. J. 27, 379 (1948)', url: 'https://doi.org/10.1002/j.1538-7305.1948.tb01338.x' },
    { label: 'Jaynes, Information Theory and Statistical Mechanics, Phys. Rev. 106, 620 (1957)', url: 'https://doi.org/10.1103/PhysRev.106.620' },
    { label: 'Landauer, Irreversibility and Heat Generation in the Computing Process, IBM J. Res. Dev. 5, 183 (1961)', url: 'https://doi.org/10.1147/rd.53.0183' },
    { label: 'Bennett, The thermodynamics of computation — a review, Int. J. Theor. Phys. 21, 905 (1982)', url: 'https://doi.org/10.1007/BF02084158' },
    { label: 'Bérut et al., Experimental verification of Landauer’s principle linking information and thermodynamics, Nature 483, 187 (2012)', url: 'https://doi.org/10.1038/nature10872' },
    { label: 'Jun, Gavrilov & Bechhoefer, High-precision test of Landauer’s principle in a feedback trap, Phys. Rev. Lett. 113, 190601 (2014)', url: 'https://doi.org/10.1103/PhysRevLett.113.190601' },
  ],
});
