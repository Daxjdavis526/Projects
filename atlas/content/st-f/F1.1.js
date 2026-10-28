// Binary floating point and machine epsilon — the analyst's view: the set of
// floats, why rounding to nearest gives a relative error of at most
// u = 2⁻⁵³ (the standard model every later error bound starts from), ε
// against u, ties to even, subnormals, and two real failures of
// representation: the Patriot clock (chopping) and Ariane 5 (range).
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { U, n12, ulp } from './_num.js';

const t = String.raw;
const L2 = Math.log10(2);
const C = 299792458;                                   // m/s, exact by definition

// ── the worked example: GPS time of week held as a float64 ──
const TOW = 600000.1;                                  // s, late on a Saturday (a GPS week is 604 800 s)
const TOW_E = Math.floor(Math.log2(TOW));              // 19
const TOW_GAP = ulp(TOW);                              // 2⁻³³ s
const TOW_HALF = TOW_GAP / 2;
const TOW_M = C * TOW_HALF;                            // m of light travel
const TOW_GAP32 = 2 ** (TOW_E - 23);                   // float32 gap there
const TOW_KM32 = (C * TOW_GAP32) / 2 / 1000;

// ── the Patriot register (GAO/IMTEC-92-26; Skeel 1992): 1/10 with 23 fraction bits ──
const SCALE = 2 ** 23;
const CHOP = Math.floor(SCALE / 10), ROUND = Math.round(SCALE / 10);   // 838860, 838861
const CHOP_ERR = 0.1 - CHOP / SCALE;                   // s per tick (0.8 of a gap)
const ROUND_ERR = ROUND / SCALE - 0.1;                 // s per tick (0.2 of a gap)

// a toy format with 3 fraction bits: the relative rounding error, a sawtooth below u = 2⁻⁴
const TOY_FL = 'abs(2^floor(log2(x))*round(8*x/2^floor(log2(x)))/8 - x)/x';

// float64 gap against size, in log–log coordinates (x and y are log₁₀): gap = 2^(e − 52), floored at 2⁻¹⁰⁷⁴
const GAP_EXPR = `max(-1074, floor(x/${n12(L2)}) - 52)*${n12(L2)}`;

const bitsBars = {
  type: 'graph',
  params: { x: [-1, 66], y: [-0.2, 3.1], aspect: 'wide', axesAt: 'edge', xlabel: 'bits', ylabel: '', yticks: 0, grid: false,
    shade: [{ fn: '2.6', lower: '1.9', from: 0, to: 64, color: 'accent', alpha: 0.45 }, { fn: '1.1', lower: '0.4', from: 0, to: 16, color: 'bad', alpha: 0.5 }],
    points: [
      { x: 1, y: 2.25, r: 0, color: 'ink', label: 'float64: up to 1.8×10³⁰⁸', labelDy: 0 },
      { x: 17, y: 0.75, r: 0, color: 'ink', label: '16-bit signed integer: −32 768 to 32 767', labelDy: 0 },
    ] },
  caption: 'Two containers for a number, drawn to scale by bit count. Converting from the top one to the bottom one fails for any value beyond ±32 767.',
};

export default lesson({
  id: 'st-f.F1.1',
  title: 'Binary floating point and machine epsilon',
  minutes: 12, difficulty: 2,
  intro: t`A float64 is a number of the form $\pm(1.b_1b_2\ldots b_{52})_2 \times 2^{e}$. Between $2^e$ and $2^{e+1}$ there are exactly $2^{52}$ of them, evenly spaced $2^{e-52}$ apart. A real number $x$ that falls between two floats is **rounded to the nearest**, so it moves by at most half a gap, $2^{e-53} \le 2^{-53}\lvert x\rvert$. That gives the **standard model** on which every error bound in this course is built:

$$\mathrm{fl}(x) = x\,(1 + \delta), \qquad \lvert\delta\rvert \le u = 2^{-53} \approx 1.11\times10^{-16}$$

IEEE 754 demands the same of arithmetic: $+$, $-$, $\times$, $\div$ and $\sqrt{\ }$ must return the exact result correctly rounded, so $\mathrm{fl}(a \odot b) = (a \odot b)(1 + \delta)$ with the same bound. Your [Scientific Programming lesson on floats](#/lesson/prog.P6.1) showed what this looks like in code; here you prove it and learn to use it.`,
  symbols: [
    { tex: t`\mathrm{fl}(x)`, text: 'the float nearest to the real number $x$: what the machine actually stores' },
    { tex: t`\delta`, text: 'the relative rounding error of that one step, a pure number; it differs from number to number and you never know it exactly, only its bound' },
    { tex: t`u = 2^{-53}`, text: '**unit roundoff**: the largest possible $\\lvert\\delta\\rvert$ for float64 with rounding to nearest (float32: $2^{-24} \\approx 6.0\\times10^{-8}$)' },
    { tex: t`\varepsilon = 2^{-52}`, text: '**machine epsilon**: the gap between 1 and the next float, $2u$. Libraries report this one (`np.finfo(float).eps`), so watch which of the two a book means' },
    { tex: t`e`, text: 'the exponent, an integer from $-1022$ to $1023$ for normal float64 numbers' },
    { tex: t`b_1 \ldots b_{52}`, text: 'the 52 stored fraction bits; with the implied leading 1 the significand has $p = 53$ bits of precision' },
  ],
  why: 'Every bound you will prove — for a sum, a difference quotient, a linear solve, an ODE step — is u multiplied by something; u is the unit in which numerical error is measured.',
  visual: {
    type: 'num-float',
    title: 'A float, bit by bit',
    lead: t`The 64 bits of a float64: sign in red, exponent in gold, fraction in blue. Below, the number line shows this float and its neighbours — nothing between them exists. Where the true value is known, a red tick marks it: the distance to the blue tick is the rounding error.`,
    tasks: [
      t`Start from 0.1: the true $\tfrac1{10}$ sits 0.4 of a gap below the stored float — less than half a gap, as rounding to nearest guarantees.`,
      'Start from 1 and press "next float up": only the last bit changes, and the gap readout is 2⁻⁵², machine epsilon.',
      'Start from 2⁵³ + 1: the gap is now 2, and the true value sits exactly halfway between two floats — a tie, given to the float whose last bit is 0.',
      'Click an exponent bit to flip it: the value doubles or halves, but the fraction bits — and the relative gap — stay put.',
    ],
    params: { value: 0.1, preset: 'tenth' },
    caption: 'Real IEEE 754 bit patterns, computed in your browser. The number line is drawn in units of the local gap, so it is not to scale with the value itself.',
  },
  example: {
    prompt: t`A GPS receiver counts **time of week** in seconds, from 0 at midnight on Saturday–Sunday to $604\,800$ s a week later, and holds it as a float64. Late on a Saturday the true time is $t = 600\,000.1$ s. How large can the rounding error in $t$ be, and how far does light travel in that time?`,
    visual: {
      type: 'num-float',
      params: { value: TOW, controls: false, exact: [6000001, 10] },
      caption: t`The float64 nearest $t = 600\,000.1$ s: its exponent field holds $1042 = 19 + 1023$, and the number line shows its neighbours $2^{-33}$ s away, with the true time in red.`,
    },
    steps: [
      { label: 'Find the binade', text: t`$2^{19} = 524\,288 \le t < 2^{20} = 1\,048\,576$, so $t = (1.b_1\ldots b_{52})_2 \times 2^{19}$ and $e = ${TOW_E}$.` },
      { label: 'The gap there', text: t`The last fraction bit is worth $2^{e-52} = 2^{${TOW_E - 52}} = ${tex(TOW_GAP)}$ s. Every float between $2^{19}$ and $2^{20}$ s is a whole multiple of it.` },
      { label: 'Round to nearest', text: t`A time that falls between two floats moves to the nearer one, by at most half a gap: $2^{${TOW_E - 53}} = ${tex(TOW_HALF)}$ s. Relative to $t$ that is at most $2^{${TOW_E - 53}}/2^{${TOW_E}} = 2^{-53} = u$ — the standard model, at work.` },
      { label: 'Into metres', text: t`A receiver turns time into distance with $c = 299\,792\,458$ m/s, so the worst rounding error is worth $c \times ${tex(TOW_HALF)}\ \text{s} = ${(TOW_M * 100).toFixed(2)}\ \text{cm}$ of light travel.` },
      { label: 'Sense check', text: t`Below 2 cm is far smaller than a standalone receiver's few metres of error, but not negligible for carrier-phase surveying at the millimetre level — which is why precise software keeps whole seconds and the fraction of a second in separate numbers. In **float32**, with 23 fraction bits, the gap would be $2^{${TOW_E - 23}} = ${TOW_GAP32}$ s and half of it worth about $${Math.round(TOW_KM32).toLocaleString('en-US').replace(',', '\\,')}$ km: useless.` },
    ],
    answer: t`At most $2^{${TOW_E - 53}}\ \text{s} \approx ${tex(TOW_HALF)}$ s, a relative error below $u = 2^{-53}$, worth $${(TOW_M * 100).toFixed(2)}$ cm of light travel.`,
  },
  practice: [
    mcq({
      id: 'u-bound', difficulty: 1,
      prompt: t`With rounding to nearest, how large can the **relative** error $\lvert\mathrm{fl}(x) - x\rvert / \lvert x\rvert$ be for a real number $x$ in the normal float64 range?`,
      visual: {
        type: 'graph',
        params: { x: [0.9, 8.3], y: [0, 0.075], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'relative rounding error',
          curves: [{ fn: TOY_FL, color: 'accent', width: 1.8, domain: [1, 8] }],
          hlines: [{ y: 1 / 16, color: 'bad', label: 'u = 2⁻⁴ for this toy format' }],
          vlines: [{ x: 2, color: 'ink4' }, { x: 4, color: 'ink4' }] },
        caption: 'The same proof in a toy format with 3 fraction bits instead of 52: the relative error of rounding every x between 1 and 8. Each binade repeats the same sawtooth, and no tooth reaches the red line.',
      },
      choices: [t`$u = 2^{-53} \approx 1.1\times10^{-16}$, whatever the size of $x$`, t`$\varepsilon = 2^{-52} \approx 2.2\times10^{-16}$`, t`$2^{-53}\lvert x\rvert$, so it grows with $x$`, t`$10^{-16}$, because a float64 holds 16 decimal digits`],
      answer: 0,
      why: {
        1: t`$\varepsilon$ is a whole gap (the gap above 1). Rounding to the *nearest* float moves $x$ by at most half a gap.`,
        2: t`$2^{-53}\lvert x\rvert$ bounds the *absolute* error. Divide by $\lvert x\rvert$ and the size of $x$ cancels: that is the whole point of floating point.`,
        3: t`The bound is a power of two: 53 bits is about 15.95 decimal digits, not exactly 16.`,
      },
      hints: ['Between 2ᵉ and 2ᵉ⁺¹ the gap is 2ᵉ⁻⁵². How far can rounding to the nearest float move x?', t`Half a gap is $2^{e-53}$; divide by $\lvert x\rvert \ge 2^e$.`],
      teach: t`Rounding to nearest moves $x$ by at most half a gap, $2^{e-53}$, and $\lvert x\rvert \ge 2^e$, so $\lvert\delta\rvert \le 2^{-53} = u$.`,
      explain: t`For $2^e \le \lvert x\rvert < 2^{e+1}$, $\lvert\mathrm{fl}(x) - x\rvert \le \tfrac12 \cdot 2^{e-52} = 2^{e-53} \le 2^{-53}\lvert x\rvert$. The relative bound $u = 2^{-53}$ is the same in every binade, which is why one constant describes the whole range.`,
    }),
    num({
      id: 'count-floats', difficulty: 2,
      gen(r) {
        const m = r.int(-3, 4), k = r.int(2, 9), n = m + k;
        const what = r.pick(['lengths in metres', 'times in seconds', 'masses in kilograms']);
        const ans = k * 2 ** 52;
        const uniform = (2 ** n - 2 ** m) / 2 ** -52;
        return {
          prompt: t`A code stores ${what} as float64. How many different floats lie in $[2^{${m}}, 2^{${n}})$, that is from $${2 ** m < 1 ? `\\tfrac{1}{${2 ** -m}}` : 2 ** m}$ up to (not including) $${2 ** n < 1 ? `\\tfrac{1}{${2 ** -n}}` : 2 ** n}$?`,
          visual: {
            type: 'graph',
            params: { x: [-0.05, 1.25], y: [-0.6, 0.8], xlog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x (logarithmic axis)', ylabel: '', yticks: 0, grid: false,
              curves: [{ fn: '0', color: 'ink4', width: 1.2, domain: [0, 1.21] }],
              points: [0, 1, 2, 3].flatMap((e) => Array.from({ length: 8 }, (_, j) => ({ x: n12(Math.log10(2 ** e * (1 + j / 8))), y: 0, r: 3.2, color: j ? 'accent' : 'gold' }))).concat([{ x: n12(Math.log10(16)), y: 0, r: 3.2, color: 'gold' }], [0, 1, 2, 3].map((e) => ({ x: n12(Math.log10(2 ** e * Math.SQRT2)), y: 0.35, r: 0, color: 'ink2', label: `${2 ** e}–${2 ** (e + 1)}: 8`, labelAlign: 'center', labelDx: 0, labelDy: 0 }))) },
            caption: 'A toy format with 3 fraction bits, from 1 to 16 on a logarithmic axis: eight numbers in every binade (powers of two in gold). float64 has 2⁵² in every binade instead of 8.',
          },
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: 2 ** 52, feedback: 'That is the count in one binade. Each power of two you cross starts another binade with the same count.' }, { value: uniform, feedback: 'That assumes the gap is ε everywhere. The gap doubles at each power of two, so the count per binade stays fixed.' }],
          hints: ['From 2ᵐ to 2ᵐ⁺¹ the significand runs over all 2⁵² patterns of its fraction bits, once.', t`There are $${k}$ binades between $2^{${m}}$ and $2^{${n}}$.`],
          teach: 'Every binade [2ᵉ, 2ᵉ⁺¹) holds exactly 2⁵² float64 numbers, whatever e is: the floats are spread evenly on a logarithmic scale.',
          explain: t`$${k}$ binades $\times\ 2^{52} = ${tex(ans, 4)}$ floats. The same count in every binade means floats are spread evenly on a *logarithmic* scale: about half of all positive normal float64 numbers lie below 1, since the exponent runs from $-1022$ to $1023$.`,
        };
      },
    }),
    multi({
      id: 'exact', difficulty: 2,
      prompt: t`Which of these real numbers are stored **exactly** by a float64 (no rounding at all)? Select every one.`,
      visual: { type: 'num-float', params: { value: 0.1, controls: false, decode: false, microscope: false }, caption: t`The bits of the float nearest $0.1$: the fraction repeats $1001\,1001\ldots$ until it runs out of room.` },
      choices: [t`$0.375$`, t`$0.1$`, t`$10^{22}$`, t`$10^{23}$`, t`$2^{53} + 1$`, t`$\tfrac13$`],
      answer: [0, 2],
      why: {
        1: t`$\tfrac1{10} = \tfrac{1}{2\cdot 5}$: the factor 5 in the denominator makes its binary expansion repeat forever.`,
        3: t`$10^{23} = 2^{23}\cdot 5^{23}$, and $5^{23} \approx 1.2\times10^{16}$ needs 54 bits — one more than the significand has. It is stored as $99\,999\,999\,999\,999\,991\,611\,392$.`,
        4: t`Above $2^{53}$ the gap is 2, so only even integers exist there.`,
        5: t`$\tfrac13 = 0.010101\ldots_2$ repeats forever.`,
      },
      hints: ['A float is an integer of at most 53 bits times a power of two.', t`So a number is exact if and only if it is $m \cdot 2^k$ with $\lvert m\rvert < 2^{53}$. Check $10^{22} = 2^{22}\cdot 5^{22}$: how big is $5^{22}$?`],
      teach: t`A real number is a float64 exactly when it equals $m\cdot 2^k$ with an integer $\lvert m\rvert < 2^{53}$ (and $k$ in range) — any other denominator than a power of two makes it repeat.`,
      explain: t`$0.375 = 3\cdot2^{-3}$, and $10^{22} = 5^{22}\cdot 2^{22}$ with $5^{22} = 2\,384\,185\,791\,015\,625 < 2^{53} \approx 9.0\times10^{15}$. The others need either infinitely many bits ($0.1$, $\tfrac13$) or more than 53 ($10^{23}$, $2^{53}+1$).`,
    }),
    num({
      id: 'read-exponent', difficulty: 2,
      gen(r) {
        const [v, what] = r.pick([[9.80665, 'standard gravity in m/s²'], [6.371e6, 'Earth’s mean radius in metres'], [1.496e11, 'one astronomical unit in metres'], [299792458, 'the speed of light in m/s'], [0.0072973525693, 'the fine-structure constant'], [6.6743e-11, 'Newton’s constant G in SI units']]);
        const e = Math.floor(Math.log2(v));
        return {
          prompt: t`The picture shows the 64 bits of a float64 holding ${what}. Its 11 exponent bits (gold) store the integer $e + 1023$. Read them and find $e$, the power of two in $(1.b_1b_2\ldots)_2 \times 2^{e}$.`,
          visual: { type: 'num-float', params: { value: v, controls: false, decode: false, microscope: false }, caption: 'Bits only: red sign, gold exponent (11 bits, most significant first), blue fraction.' },
          answer: e, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: e + 1023, feedback: 'That is the stored field. Subtract the bias, 1023, to get the power of two.' }, { value: e + 1, feedback: t`Check with logarithms: $2^{${e + 1}} = ${tex(2 ** (e + 1), 4)}$ is already larger than the number.` }],
          hints: ['Read the 11 gold bits as a binary integer: the leftmost is worth 1024, then 512, 256, … down to 1.', t`Then subtract 1023. Check: the number should lie between $2^{e}$ and $2^{e+1}$, so $e = \lfloor\log_2 x\rfloor$.`],
          teach: 'The exponent field stores e + 1023, so that the field is never negative; e itself is ⌊log₂|x|⌋ for a normal number.',
          explain: t`The field is $${e + 1023} = ${(e + 1023).toString(2).padStart(11, '0')}_2$, so $e = ${e + 1023} - 1023 = ${e}$. Check: $2^{${e}} = ${tex(2 ** e, 4)} \le ${tex(v, 4)} < ${tex(2 ** (e + 1), 4)} = 2^{${e + 1}}$.`,
        };
      },
    }),
    mcq({
      id: 'tie', difficulty: 3,
      prompt: t`What does Python print for \`1 + 3 * 2**-53\`? (Both operands are exact floats; only the sum is rounded.)`,
      visual: {
        type: 'graph',
        params: { x: [-0.8, 7.4], y: [-0.7, 0.9], aspect: 'wide', axesAt: 'edge', xlabel: 'distance above 1, in units of 2⁻⁵³', ylabel: '', yticks: 0, xticks: 8, grid: false,
          curves: [{ fn: '0', color: 'ink4', width: 1.2, domain: [-0.5, 7.2] }],
          points: [
            { x: 0, y: 0, r: 5, color: 'accent', label: '1', labelDx: -4, labelDy: -14 },
            { x: 2, y: 0, r: 5, color: 'accent', label: '1 + ε', labelDx: -14, labelDy: -14 },
            { x: 4, y: 0, r: 5, color: 'accent', label: '1 + 2ε', labelDx: -18, labelDy: -14 },
            { x: 6, y: 0, r: 5, color: 'accent', label: '1 + 3ε', labelDx: -18, labelDy: -14 },
            { x: 3, y: 0, r: 5, color: 'bad', hollow: true, label: 'exact sum', labelDx: -26, labelDy: 18 },
          ] },
        caption: t`The floats just above 1 (blue, $\varepsilon = 2^{-52}$ apart) and the exact sum $1 + 3\cdot2^{-53}$ (red), which lies exactly halfway between two of them.`,
      },
      choices: ['`1.0000000000000004`, which is 1 + 2ε', '`1.0000000000000002`, which is 1 + ε', '`1.0`: the addend is below machine epsilon', '`1.0000000000000003`'],
      answer: 0,
      why: {
        1: t`$1 + \varepsilon$ is just as near, but its last fraction bit is 1. IEEE 754 breaks a tie toward the neighbour whose last bit is **0** (“round half to even”).`,
        2: t`$3\cdot 2^{-53} = 1.5\varepsilon$ is more than half a gap, so the sum cannot round back to 1.`,
        3: t`No float has that value: between $1 + \varepsilon$ and $1 + 2\varepsilon$ there is nothing.`,
      },
      hints: [t`Write the sum in units of $2^{-53}$: it is $1 + 3$ units, and the floats sit at even numbers of units.`, t`It lies exactly between $1 + 2\cdot2^{-53}$ and $1 + 4\cdot2^{-53}$. IEEE 754 breaks ties toward the float whose last bit is 0. Which of the two is that?`],
      teach: 'Round to nearest, ties to even: a sum exactly halfway between two floats goes to the one whose last significand bit is 0, so ties do not all push the same way.',
      explain: t`The sum is $1 + 1.5\varepsilon$, a tie between $1 + \varepsilon$ (last bit 1) and $1 + 2\varepsilon$ (last bit 0). Ties to even picks $1 + 2\varepsilon = 1 + 2^{-51} = 1.0000000000000004$. Always rounding ties *up* would bias long sums upward; ties-to-even rounds up half the time and down half the time.`,
    }),
    mcq({
      id: 'subnormal', difficulty: 3,
      prompt: t`Below the smallest normal float64, $2^{-1022} \approx 2.2\times10^{-308}$, IEEE 754 continues with **subnormal** numbers $(0.b_1\ldots b_{52})_2\times2^{-1022}$, all $2^{-1074} \approx 4.9\times10^{-324}$ apart. What happens there to the bound $\lvert\delta\rvert \le u$?`,
      visual: {
        type: 'graph',
        params: { x: [-324.5, -300], y: [-325, -310], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'gap between floats near x', xticks: 5, yticks: 4,
          curves: [{ fn: GAP_EXPR, color: 'accent', width: 2, domain: [-323.7, -300] }, { fn: `x + ${n12(Math.log10(2 ** -52))}`, color: 'ink3', dash: true, domain: [-312, -300], label: 'ε·x', labelAt: -303, labelDx: -10, labelDy: 14 }],
          vlines: [{ x: n12(Math.log10(2 ** -1022)), label: 'smallest normal', color: 'gold' }] },
        caption: 'The float64 gap against size near the bottom of the range, both axes logarithmic. Right of the gold line the gap shrinks in proportion to x (the staircase follows ε·x); left of it the gap stops shrinking.',
      },
      choices: [
        'It fails: the gap stays 2⁻¹⁰⁷⁴ while x shrinks, so the relative error grows — up to 100% near the smallest subnormal',
        'It still holds, because IEEE 754 rounds every result correctly',
        'Nothing: IEEE 754 flushes every result below 2⁻¹⁰²² to zero',
        'It improves, because the gaps there are the smallest anywhere',
      ],
      answer: 0,
      why: {
        1: 'Correct rounding still moves x by at most half a gap; but the gap is now fixed, not proportional to x, so half a gap is a larger and larger fraction of x.',
        2: 'Flushing to zero is an optional speed-up mode on some hardware. The IEEE default is gradual underflow through the subnormals.',
        3: 'Small absolute gaps are not small relative ones: near 10⁻³²³ the gap is half the number itself.',
      },
      hints: ['The standard model rests on the gap being proportional to |x|. Is it, left of the gold line?', 'A gap of 2⁻¹⁰⁷⁴ next to x = 3 × 2⁻¹⁰⁷⁴ is a third of x.'],
      teach: t`Subnormals keep an *absolute* error bound $2^{-1075}$ instead of a relative one, so the standard model $\lvert\delta\rvert \le u$ holds only in the normal range.`,
      explain: t`Below $2^{-1022}$ the significand loses its leading 1 and with it precision: a subnormal near $10^{-320}$ has only about 10 significant bits. Gradual underflow keeps $x - y = 0$ only when $x = y$, a property flush-to-zero loses — but error bounds near underflow must be absolute. In physics, rescale the problem (work in units where numbers are near 1) and you will rarely go there.`,
    }),
    code({
      id: 'worst-reciprocal', difficulty: 2,
      prompt: t`Test the standard model on real data. For every $d = 1, 2, \ldots, 1000$, Python's \`1/d\` is the correctly rounded float of $\tfrac1d$. Using \`fractions.Fraction\` (which holds both the float and $\tfrac1d$ **exactly**), set \`worst\` to the largest relative error $\lvert\mathrm{fl}(\tfrac1d) - \tfrac1d\rvert / \tfrac1d$ as a float, and \`ratio\` to \`worst / 2**-53\`.`,
      starter: t`from fractions import Fraction

# Fraction(1/d) is the float's exact value; Fraction(1, d) is exactly 1/d
worst = 0.0
for d in range(1, 1001):
    pass

ratio = worst / 2**-53
print(worst, ratio)
`,
      answer: t`from fractions import Fraction

worst = 0.0
for d in range(1, 1001):
    exact = Fraction(1, d)
    rel = abs(Fraction(1 / d) - exact) / exact
    worst = max(worst, float(rel))

ratio = worst / 2**-53
print(worst, ratio)`,
      tests: [
        { name: t`\`worst\` never exceeds $u = 2^{-53}$`, code: '0 < worst <= 2**-53' },
        { name: 'some reciprocal comes within 5% of the bound', code: 'ratio > 0.95' },
        { name: t`\`worst\` is the true maximum (about $1.058\times10^{-16}$)`, code: 'abs(worst - 1.0581813203458523e-16) < 1e-30' },
      ],
      hints: ['Inside the loop, the exact value is `Fraction(1, d)` and the stored one is `Fraction(1 / d)`.', 'The relative error is `abs(stored - exact) / exact`; keep the largest with `worst = max(worst, float(rel))`.'],
      teach: 'Exact rational arithmetic (Fraction) lets you measure a rounding error without any rounding of your own.',
      explain: t`The worst of the thousand reciprocals is $0.953u$: the bound $u$ is nearly reached but never passed. The bound is sharp — the worst case, a number just above a power of two lying halfway between floats, really happens.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-orbit-store', difficulty: 2, transfer: true,
      gen(r) {
        const [R, what] = r.pick([[42164170, 'a geostationary satellite, $42\\,164\\,170$ m from Earth’s centre'], [384400000, 'the Moon, $384\\,400$ km from Earth’s centre'], [1.5e9, 'a probe at the Sun–Earth L2 point, about $1.5\\times10^{9}$ m from Earth'], [2.4e13, 'Voyager 1, about $2.4\\times10^{13}$ m from the Sun']]);
        const ans = ulp(R) / 2;
        return {
          prompt: t`An orbit propagator stores the distance of ${what}, in metres, as a float64. What is the largest error that storing the distance can introduce, in metres? (Assume rounding to nearest.)`,
          visual: {
            type: 'graph',
            params: { x: [6.5, 13.8], y: [-10, -1], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'distance (m)', ylabel: 'gap between floats (m)', yticks: 5,
              curves: [{ fn: `(floor(x/${n12(L2)}) - 52)*${n12(L2)}`, color: 'accent', width: 2, domain: [6.5, 13.8] }] },
            caption: 'The float64 gap between neighbouring distances, a staircase that doubles at every power of two metres. Both axes are logarithmic.',
          },
          answer: ans, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: 2 * ans, feedback: 'That is the whole gap. Rounding to the nearest float moves a value by at most half of it.' }, { value: R * U, feedback: t`That is the bound $u\lvert r\rvert$, which allows for the worst place in a binade. Find the binade of $r$ and take half of its actual gap $2^{e-52}$.` }],
          hints: [t`Find $e$ with $2^e \le r < 2^{e+1}$: $e = \lfloor\log_2 r\rfloor$.`, t`The gap is $2^{e-52}$; rounding to nearest can move $r$ by half of it, $2^{e-53}$.`],
          teach: 'The absolute storage error is half the local gap, 2ᵉ⁻⁵³ — tiny for orbits, but every arithmetic step adds another of the same size.',
          explain: t`$e = \lfloor\log_2 ${tex(R, 4)}\rfloor = ${Math.floor(Math.log2(R))}$, so the gap is $2^{${Math.floor(Math.log2(R)) - 52}}$ m and the worst rounding error $2^{${Math.floor(Math.log2(R)) - 53}} = ${tex(ans, 3)}$ m. Storage alone is never the problem; a propagator that takes millions of steps adds a rounding of this size at each one, which is where the next lesson begins.`,
        };
      },
    }),
    num({
      id: 'cp-patriot-round', difficulty: 3, transfer: true,
      gen(r) {
        const H = r.pick([8, 20, 48, 72, 100]);
        const ticks = H * 36000;
        const ans = ticks * ROUND_ERR, chop = ticks * CHOP_ERR;
        return {
          prompt: t`The Patriot battery at Dhahran in 1991 (the story is in [Scientific Programming](#/lesson/prog.P6.1)) counted time in tenths of a second and multiplied the count by $\tfrac1{10}$ held with **23 fraction bits** — chopped, not rounded: $838\,860 \times 2^{-23}$, short by $${tex(CHOP_ERR)}$ s per tick. Suppose the last bit had been **rounded to nearest** instead. How far off would the clock have been after ${H} hours of operation, in seconds?`,
          visual: {
            type: 'graph',
            params: { x: [-0.4, 3.4], y: [-0.7, 0.9], aspect: 'wide', axesAt: 'edge', xlabel: 'value in units of 2⁻²³, minus 838 859', ylabel: '', yticks: 0, xticks: 4, grid: false,
              curves: [{ fn: '0', color: 'ink4', width: 1.2, domain: [-0.2, 3.2] }],
              points: [
                { x: 0, y: 0, r: 4.5, color: 'ink3' }, { x: 1, y: 0, r: 5, color: 'gold', label: 'chopped', labelDx: -24, labelDy: -16 },
                { x: 2, y: 0, r: 5, color: 'accent', label: 'rounded', labelDx: -24, labelDy: -16 }, { x: 3, y: 0, r: 4.5, color: 'ink3' },
                { x: 1.8, y: 0, r: 5, color: 'bad', hollow: true, label: 'exactly 1/10', labelDx: -36, labelDy: 18 },
              ] },
            caption: t`Numbers with 23 fraction bits near $\tfrac1{10}$, one gap $2^{-23}$ apart (not to scale with $\tfrac1{10}$ itself). The true $\tfrac1{10}$ lies 0.8 of a gap above the chopped value.`,
          },
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: [{ value: chop, feedback: 'That is the drift the chopped register really produced. Rounding to the nearest value leaves only 0.2 of a gap per tick.' }],
          hints: [t`$\tfrac1{10} \times 2^{23} = 838\,860.8$. Rounding to nearest gives $838\,861$: by how much does that overshoot, per tick?`, t`The error per tick is $0.2 \times 2^{-23} = ${tex(ROUND_ERR)}$ s; multiply by $${H} \times 3600 \times 10$ ticks.`],
          teach: t`Chopping errs by up to a whole gap (relative bound $\varepsilon = 2u$); rounding to nearest by at most half (bound $u$) — but any error per step, multiplied by a large count, still grows in proportion to the count.`,
          explain: t`Rounded, $\tfrac1{10}$ becomes $838\,861\times2^{-23}$, $${tex(ROUND_ERR)}$ s too large per tick. After $${(ticks).toLocaleString('en-US').replace(/,/g, '{,}')}$ ticks that is $${tex(ans)}$ s ahead, against $${tex(chop)}$ s behind for the real, chopped register: four times smaller, but still growing linearly. The real cure was not a better rounding but not multiplying an inexact constant by an ever-growing count.`,
        };
      },
    }),
    mcq({
      id: 'cp-ariane', difficulty: 2, transfer: true,
      prompt: t`On 4 June 1996 the first Ariane 5 veered off course about 37 s after lift-off and was destroyed. Both inertial reference computers had shut down with the same exception. Their software, reused from Ariane 4, converted a 64-bit floating-point value related to the horizontal velocity (the “horizontal bias”) into a **16-bit signed integer**; Ariane 5's faster trajectory produced a value larger than that conversion could hold. What kind of numerical failure was it?`,
      visual: bitsBars,
      choices: [
        'Overflow in a conversion: the value exceeded 32 767, the largest 16-bit signed integer, and the unprotected conversion raised an error',
        'Round-off accumulated over the 37 seconds of flight, like the Patriot clock',
        'The 64-bit floating-point number itself overflowed to infinity',
        'Catastrophic cancellation when two nearly equal velocities were subtracted',
      ],
      answer: 0,
      why: {
        1: 'No error built up over time: one conversion of one value failed outright.',
        2: 'A float64 holds numbers up to 1.8 × 10³⁰⁸; the value was only beyond the 16-bit integer’s range.',
        3: 'Nothing was subtracted: the number was simply too large for the container it was put in.',
      },
      hints: ['Compare the two containers in the picture: what is the largest number each can hold?', 'A 16-bit signed integer stores −32 768 to 32 767. A float64 value larger than that has nowhere to go.'],
      teach: 'Range is part of a format’s specification: every conversion to a narrower type needs either a proof that the value fits or a check that handles it when it does not.',
      explain: 'The inquiry board found that the conversion was left unprotected because the value had been shown to fit on Ariane 4’s trajectory, and the alignment routine that computed it served no purpose after lift-off at all. The overflow raised an operand error, both computers shut down, and their diagnostic output was read as flight data, swinging the nozzles to full deflection. Precision was never the problem; range was.',
    }),
  ],
  sources: [
    { label: 'Higham (2002), Accuracy and Stability of Numerical Algorithms, 2nd ed., SIAM, ch. 2', url: 'https://doi.org/10.1137/1.9780898718027' },
    { label: 'IEEE 754-2019, Standard for Floating-Point Arithmetic', url: 'https://doi.org/10.1109/IEEESTD.2019.8766229' },
    { label: 'Goldberg (1991), What every computer scientist should know about floating-point arithmetic, ACM Computing Surveys 23, 5', url: 'https://doi.org/10.1145/103162.103163' },
    { label: 'U.S. GAO (1992), Patriot Missile Defense: Software Problem Led to System Failure at Dhahran, Saudi Arabia, GAO/IMTEC-92-26', url: 'https://www.gao.gov/products/imtec-92-26' },
    { label: 'Lions et al. (1996), Ariane 5 Flight 501 Failure: Report by the Inquiry Board, ESA', url: 'https://www.esa.int/Newsroom/Press_Releases/Ariane_501_-_Presentation_of_Inquiry_Board_report' },
  ],
});
