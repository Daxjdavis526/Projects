// How floats work: machine epsilon — IEEE 754 binary64 bit by bit, the
// spacing of floats (ε|x|), what cannot be represented (0.1, 2⁵³ + 1),
// overflow, and the Patriot missile's clock drift at Dhahran in 1991.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { polyline, ulp } from './_numkit.js';

const t = String.raw;
const L2 = Math.log10(2);

// ── the Patriot clock (GAO/IMTEC-92-26; Skeel, SIAM News 1992) ──
const STORED = 838860 / 2 ** 23;                      // 0.1 chopped after 23 binary places
const TICK_ERR = 0.1 - STORED;                        // s per tenth-of-a-second tick: exactly 1/10 485 760
const TICKS_100H = 100 * 3600 * 10;
const DRIFT_100H = TICKS_100H * TICK_ERR;             // s
const SCUD = 1676;                                    // m/s, Skeel's figure
const FL01_ERR = 5.551115123125783e-18;               // the binary64 float 0.1 minus 1/10

// ── formats: [name, exponent bits, fraction bits] ──
const FORMATS = [['half precision (float16)', 5, 10], ['single precision (float32)', 8, 23], ['double precision (float64)', 11, 52], ['bfloat16, used in machine learning', 8, 7]];

// ── a float32 staircase (log–log coordinates) ──
const STAIR32 = polyline(Array.from({ length: 25 }, (_, e) => [[e * L2, (e - 23) * L2], [(e + 1) * L2, (e - 23) * L2]]).flat(), { color: 'accent', width: 2 });

const bitsGraph = (E, F) => {
  const N = 1 + E + F;
  return {
    type: 'graph',
    params: { x: [-0.5, N + 0.5], y: [0, 1.7], aspect: 'wide', axesAt: 'edge', xlabel: 'bit', ylabel: '', yticks: 0, grid: false,
      shade: [{ fn: '1', from: 0, to: 1, color: 'bad', alpha: 0.6 }, { fn: '1', from: 1, to: 1 + E, color: 'gold', alpha: 0.5 }, { fn: '1', from: 1 + E, to: N, color: 'accent', alpha: 0.45 }],
      points: [{ x: 0.5, y: 1, label: 'sign', r: 0, labelDx: -10, labelDy: -8 }, { x: 1 + E / 2, y: 1, label: `exponent: ${E}`, r: 0, labelDx: -30, labelDy: -8 }, { x: 1 + E + F / 2, y: 1, label: `fraction: ${F} bits`, r: 0, labelDx: -40, labelDy: -8 }] },
    caption: `The ${N} bits of the format: 1 sign bit, ${E} exponent bits, ${F} fraction bits (the leading 1 of the significand is not stored).`,
  };
};

export default lesson({
  id: 'prog.P6.1',
  title: 'How floats work: machine epsilon',
  minutes: 11, difficulty: 3,
  intro: t`A Python \`float\` is an IEEE 754 **binary64** number: 64 bits holding a sign, an 11-bit exponent and a 52-bit fraction,

$$x = (-1)^{s}\,\big(1.b_1b_2\ldots b_{52}\big)_2 \times 2^{\,e - 1023}$$

Between one power of two and the next there are exactly $2^{52}$ floats, evenly spaced, so the **spacing grows with the size of the number**. Near 1 it is the **machine epsilon** $\varepsilon = 2^{-52} \approx 2.2\times10^{-16}$; near $x$ it is about $\varepsilon\lvert x\rvert$. Every arithmetic result is rounded to the nearest float, so each operation can be wrong by half a spacing: a *relative* error of at most $\varepsilon/2$, whatever the number's size. Numbers between the floats — including 0.1 — simply do not exist in the machine.`,
  symbols: [
    { tex: 's', text: 'the sign bit: 0 for positive, 1 for negative' },
    { tex: t`b_1 \ldots b_{52}`, text: 'the 52 fraction bits; the leading 1 before the binary point is implied, so the significand has 53 bits of precision' },
    { tex: 'e', text: 'the stored exponent, 1 to 2046 for ordinary numbers (0 and 2047 are kept for zero, tiny subnormals, infinity and NaN)' },
    { tex: '1023', text: 'the bias: subtracting it lets the exponent run from −1022 to +1023' },
    { tex: t`\varepsilon = 2^{-52}`, text: 'machine epsilon, `np.finfo(float).eps`: the gap between 1 and the next larger float' },
    { tex: t`\varepsilon\lvert x\rvert`, text: 'roughly the gap between neighbouring floats near $x$ (exactly `math.ulp(x)`, between $\\tfrac12\\varepsilon\\lvert x\\rvert$ and $\\varepsilon\\lvert x\\rvert$)' },
  ],
  why: 'Every number a simulation produces carries a rounding error of this size; knowing ε is how you tell round-off from a bug, and how you choose tolerances and step sizes in every later module.',
  visual: {
    type: 'code-runner',
    title: 'Inside a float',
    lead: t`Press **Run**. The first lines print the 64 bits of four numbers, split into sign, exponent and fraction; 0.1's fraction is a repeating pattern, cut off and rounded. The plot shows the gap between neighbouring floats: a staircase that doubles at every power of two.`,
    tasks: [
      'Add 0.2 and 0.3 to the list: their fractions repeat too, which is why 0.1 + 0.2 != 0.3.',
      'Print `(0.1).hex()`: the same bits in hexadecimal, ending in …9a — rounded up from …999.',
      'Replace `float` by `np.float32` in `np.finfo`: single precision has ε ≈ 1.2 × 10⁻⁷.',
    ],
    params: {
      rows: 26,
      code: t`import struct
import numpy as np
import matplotlib.pyplot as plt

# the 64 bits of a float: sign | exponent (11 bits) | fraction (52 bits)
for x in [1.0, 2.0, 0.1, -2.5]:
    bits = format(struct.unpack(">Q", struct.pack(">d", x))[0], "064b")
    print(f"{x:>5}  {bits[0]} {bits[1:12]} {bits[12:]}")

eps = np.finfo(float).eps
print("machine epsilon:", eps, "= 2**-52:", eps == 2.0**-52)
print("1 + eps   == 1:", 1.0 + eps == 1.0)
print("1 + eps/2 == 1:", 1.0 + eps / 2 == 1.0)
print("2**53 + 1 as a float:", float(2**53) + 1)
print("largest float:", np.finfo(float).max, "  smallest normal:", np.finfo(float).tiny)

# the gap between neighbouring floats grows with their size
x = np.logspace(-2, 2, 3000)
fig, ax = plt.subplots()
ax.loglog(x, np.spacing(x), label="gap to the next float")
ax.loglog(x, eps * x, "--", label="ε·x")
ax.set_xlabel("x")
ax.set_ylabel("spacing of floats near x")
ax.legend()
plt.show()`,
    },
    caption: 'Real IEEE 754 arithmetic. 1 + ε/2 rounds back to 1 because it lies exactly halfway between two floats and the tie goes to the one whose last bit is 0.',
  },
  example: {
    prompt: t`On 25 February 1991 a Patriot missile battery at Dhahran, Saudi Arabia, failed to intercept an incoming Scud missile, which struck a barracks and killed 28 American soldiers. The battery had been running for about 100 hours. Its clock counted **tenths of a second** as an integer, and the software turned the count into seconds by multiplying by 1/10 held in a 24-bit **fixed-point** register. How far off was the time after 100 hours?`,
    visual: {
      type: 'graph',
      params: { x: [0, 108], y: [0, 0.4], aspect: 'wide', axesAt: 'edge', xlabel: 'hours since the battery was started', ylabel: 'clock error (s)',
        curves: [{ fn: `${TICK_ERR * 36000}*x`, color: 'bad', domain: [0, 106] }],
        points: [8, 20, 48, 72, 100].map((h) => ({ x: h, y: h * 36000 * TICK_ERR, color: 'gold', r: 4, label: h === 100 ? `${(DRIFT_100H).toFixed(3)} s` : undefined, labelDx: -62, labelDy: -6 })) },
      caption: 'The clock error grows in proportion to the number of ticks counted. The dots are the uptimes tabulated in the U.S. General Accounting Office’s report (GAO/IMTEC-92-26).',
    },
    steps: [
      { label: 'One tenth in binary', text: t`$\tfrac{1}{10} = 0.0001100110011001100\ldots_2$: the pattern 0011 repeats forever, so **no finite binary fraction equals 0.1**. Any binary machine must cut it off somewhere. Python's fractions show the exact values involved:

\`\`\`python
from fractions import Fraction
stored = Fraction(int(0.1 * 2**23), 2**23)   # 0.1 chopped after 23 binary places
err = Fraction(1, 10) - stored
print(stored, float(err))                    # 209715/2097152  9.5367431640625e-08
\`\`\`` },
      { label: 'The register', text: t`The register kept $0.00011001100110011001100_2$ — the expansion **chopped** (not rounded) after 23 binary places. Each tick was therefore converted $${tex(TICK_ERR)}$ s short.` },
      { label: 'Multiply by the count', text: t`100 hours is $100 \times 3600 \times 10 = ${TICKS_100H.toLocaleString('en-US').replace(/,/g, '{,}')}$ ticks, and the error is multiplied by the count:

\`\`\`python
ticks = 100 * 3600 * 10
print(ticks * float(err))                    # 0.34332275390625
\`\`\`

The clock was ${DRIFT_100H.toFixed(2)} s behind.` },
      { label: 'What it meant', text: t`A Scud flies at about ${SCUD} m/s, so in ${DRIFT_100H.toFixed(2)} s it covers about ${Math.round(DRIFT_100H * SCUD)} m. The radar predicts where to look for a target it has detected; the GAO put the shift of that search window after 100 hours at 687 m. The Scud was outside it, and the track was dismissed. Worse, an improved conversion had been added to some parts of the software but not all, so the errors in two times that were subtracted no longer cancelled. Corrected software reached Dhahran the next day.` },
      { label: 'Sense check', text: t`The flaw was a 23-bit representation multiplied by a large count, not floating point as such: a binary64 \`0.1\` is off by only $${tex(FL01_ERR, 2)}$, and the same 100-hour count would err by a few times $10^{-11}$ s. The lessons last longer than the hardware: a constant that is not exact in binary carries an error, and **anything multiplied by a large count multiplies its error too**.` },
    ],
    answer: t`$${TICKS_100H.toLocaleString('en-US').replace(/,/g, '{,}')} \times ${tex(TICK_ERR)}\ \text{s} = ${DRIFT_100H.toFixed(4)}$ s — about a third of a second, or more than half a kilometre of Scud flight.`,
  },
  practice: [
    num({
      id: 'eps-format', difficulty: 1,
      gen(r) {
        const [name, E, F] = r.pick(FORMATS);
        return {
          prompt: t`What is the machine epsilon — the gap between 1 and the next larger number — of ${name}, which stores ${F} fraction bits?`,
          visual: bitsGraph(E, F),
          answer: 2 ** -F, tol: { rel: 0.005 },
          errors: [{ value: 2 ** -(F + 1), feedback: `That is half of ε, the largest relative rounding error (the unit roundoff). The gap itself is 2^−${F}.` }, { value: 2 ** -(E + F), feedback: 'Only the fraction bits set the spacing; the exponent bits set the range.' }],
          hints: ['Just above 1, the smallest change you can make is to flip the last fraction bit.', `The last of ${F} fraction bits is worth 2^−${F}.`],
          teach: 'ε = 2⁻ᵖ for p fraction bits: 2⁻⁵² ≈ 2.2 × 10⁻¹⁶ for float64, 2⁻²³ ≈ 1.2 × 10⁻⁷ for float32 — about 16 and 7 significant digits.',
          explain: t`$\varepsilon = 2^{-${F}} = ${tex(2 ** -F)}$, so ${name} keeps about ${Math.round((F + 1) * L2)} significant decimal digits. The exponent bits decide the *range* instead: ${E} bits reach up to about $10^{${Math.floor((2 ** (E - 1)) * L2)}}$.`,
        };
      },
    }),
    num({
      id: 'toy-spacing', difficulty: 2,
      gen(r) {
        const k = r.pick([3, 4, 5, 6, 10]);
        const pts = [];
        for (let e = 0; e < 3; e++) for (let j = 0; j < 8; j++) pts.push(2 ** e * (1 + j / 8));
        pts.push(8);
        return {
          prompt: t`A toy floating-point format keeps 3 fraction bits, so its numbers are $1.b_1b_2b_3 \times 2^{e}$. The picture shows all of them from 1 to 8. Continuing the pattern, what is the gap between neighbouring numbers between $2^{${k}} = ${2 ** k}$ and $2^{${k + 1}} = ${2 ** (k + 1)}$?`,
          visual: {
            type: 'graph',
            params: { x: [0.6, 8.4], y: [-0.6, 0.8], aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', yticks: 0, xticks: 8, grid: false,
              curves: [{ fn: '0', color: 'ink4', width: 1.2, domain: [0.8, 8.2] }],
              points: pts.map((x) => ({ x, y: 0, color: Number.isInteger(Math.log2(x)) ? 'gold' : 'accent', r: 3.5 })) },
            caption: 'Every number of the toy format from 1 to 8. Powers of two in gold: within each band the eight numbers are evenly spaced, and each band’s spacing is twice the last.',
          },
          answer: 2 ** (k - 3), tol: { rel: 0.001 },
          errors: [{ value: 2 ** (k - 2), feedback: `Between 2^${k} and 2^${k + 1} there are 8 numbers (3 fraction bits), so the gap is 2^${k}/8.` }, { value: 1 / 8, feedback: 'That is the spacing near 1. It doubles at every power of two.' }],
          hints: ['Count: between 1 and 2 the spacing is 1/8; between 2 and 4 it is 1/4; between 4 and 8, 1/2.', `Each band from 2^e to 2^(e+1) has 8 evenly spaced numbers, so the gap is 2^e/8.`],
          teach: 'Floats are evenly spaced only between consecutive powers of two; the spacing doubles each time you cross one — constant relative, not absolute, precision.',
          explain: t`$2^{${k}}/8 = ${2 ** (k - 3)}$. Relative to the numbers themselves the gap is always between $\tfrac1{16}$ and $\tfrac18$ — the toy format's $\varepsilon/2$ and $\varepsilon$. Real binary64 works the same way with $2^{52}$ numbers per band instead of 8.`,
        };
      },
    }),
    mcq({
      id: 'eps-loop', difficulty: 2,
      prompt: t`A classic program to find machine epsilon. What does it print?

\`\`\`python
eps = 1.0
while 1.0 + eps > 1.0:
    eps /= 2
print(eps)
\`\`\``,
      choices: ['`1.1102230246251565e-16`, half of ε: the loop halves once more after the last eps that still changed 1.0', '`2.220446049250313e-16`, exactly ε', '`0.0`: eps keeps halving until it underflows', '`5e-324`, the smallest positive float'],
      answer: 0,
      why: {
        1: 'The loop stops when 1 + eps == 1, which first happens for eps = 2⁻⁵³ — one halving past ε = 2⁻⁵².',
        2: 'The test is 1.0 + eps > 1.0, not eps > 0: it stops long before eps underflows.',
        3: 'That would need the loop to test eps itself; it tests whether adding eps to 1 makes a difference.',
      },
      hints: ['When eps = 2⁻⁵² (= ε), is 1 + eps > 1? What happens next?', '1 + 2⁻⁵³ lies exactly halfway between 1 and the next float, and rounds to 1.'],
      teach: 'The smallest eps with 1 + eps > 1 is ε = 2⁻⁵²; a halving loop overshoots by one step, so multiply its result by 2 — or simply use np.finfo(float).eps.',
      explain: t`At eps $= 2^{-52}$, $1 + \varepsilon > 1$ is true, so eps halves to $2^{-53}$; then $1 + 2^{-53}$ rounds to 1 (a tie, broken toward the even neighbour) and the loop stops, printing $2^{-53} = 1.11\times10^{-16}$: the unit roundoff, not ε. Library constants avoid the off-by-one: \`np.finfo(float).eps\`, \`sys.float_info.epsilon\`.`,
    }),
    mcq({
      id: 'big-int', difficulty: 2,
      prompt: t`A count of detected photons is kept as a float. What does this print?

\`\`\`python
n = float(2**53)
print(n + 1 == n, int(n + 2) - int(n))
\`\`\``,
      choices: ['`True 2`: above 2⁵³ the gap between floats is 2, so adding 1 changes nothing', '`False 2`: floats store whole numbers exactly', '`True 1`', '`False 1`'],
      answer: 0,
      why: {
        1: 'Floats store whole numbers exactly only up to 2⁵³ = 9 007 199 254 740 992; beyond it the 53-bit significand runs out.',
        2: 'n + 2 is a float exactly 2 above n, so the difference of the two integers is 2.',
        3: 'Both halves are wrong: adding 1 is lost, adding 2 is not.',
      },
      hints: ['Near x the spacing of floats is about ε·x. What is ε × 2⁵³?', 'n + 1 lies halfway between n and n + 2, and the tie rounds to n (the even one).'],
      teach: 'A float holds every integer up to 2⁵³ exactly; above that, spacing exceeds 1 and counts silently stop increasing — keep counters in Python ints or int64.',
      explain: t`The spacing at $2^{53}$ is $2^{53}\times2^{-52} = 2$. Adding 1 lands halfway and rounds back to $n$, so a float counter would stop counting single events there. Python's \`int\` never has this problem, and NumPy's \`int64\` holds counts up to $9.2\times10^{18}$.`,
    }),
    num({
      id: 'ulp-at', difficulty: 3,
      gen(r) {
        const [what, x, unit, uname] = r.pick([
          ['the Earth–Sun distance in metres', 1.495978707e11, 'm', 'm'],
          ['a GPS-style timestamp: nanoseconds since 1980, about', 1.45e18, 'ns', 'ns'],
          ['the age of the universe in seconds, about', 4.35e17, 's', 's'],
          ['the distance to Proxima Centauri in metres', 4.0175e16, 'm', 'm'],
        ]);
        const e = Math.floor(Math.log2(x)), gap = ulp(x);
        return {
          prompt: t`A program stores ${what} $${tex(x, 6)}$ as a float. What is the gap between that float and the next larger one, in ${uname}?

\`\`\`python
import math
print(math.ulp(${x.toExponential().replace('e+', 'e')}))
\`\`\``,
          answer: gap, units: unit, tol: { rel: 0.005 },
          errors: [{ value: x * 2 ** -52, feedback: 'ε·x is only an estimate (good to a factor of 2). The exact gap is 2^(e − 52), where 2^e is the power of two just below x.' }],
          hints: [t`Find the power of two just below $x$: $2^{e} \le x < 2^{e+1}$, so $e = \lfloor\log_2 x\rfloor$.`, t`Here $\log_2 x = ${Math.log2(x).toFixed(2)}$, so $e = ${e}$ and the gap is $2^{${e} - 52}$.`],
          teach: 'Absolute precision shrinks as numbers grow: the gap near x is 2^(⌊log₂x⌋ − 52), so large magnitudes are resolved only coarsely.',
          explain: t`$e = ${e}$, gap $= 2^{${e - 52}} = ${gap >= 1e5 ? tex(gap) : +gap.toPrecision(6)}$ ${uname}. ${uname === 'ns' ? `256 ns of light travel is ${(256e-9 * 299792458).toFixed(0)} m — far too coarse for positioning, which is why timing software keeps integer nanoseconds or splits the time into whole and fractional parts.` : 'For most purposes that is plenty — but subtract two such numbers that are nearly equal and only this coarse grain survives (next lesson).'}`,
        };
      },
    }),
    code({
      id: 'eps-finder', difficulty: 2,
      prompt: t`Write \`machine_eps(dtype)\` that finds the machine epsilon of a NumPy float type by halving: start with \`one = dtype(1)\` and \`e = dtype(1)\`, and keep halving \`e\` **while** \`one + e / dtype(2) > one\`; return \`e\`. Doing all arithmetic in \`dtype\` matters: a plain Python \`2\` or \`1.0\` would quietly work in float64.`,
      starter: t`import numpy as np

def machine_eps(dtype):
    pass
`,
      answer: t`import numpy as np

def machine_eps(dtype):
    one, two, e = dtype(1), dtype(2), dtype(1)
    while one + e / two > one:
        e = e / two
    return e

print(machine_eps(np.float32), machine_eps(np.float64))`,
      tests: [
        { name: t`float64: $2^{-52} \approx 2.2\times10^{-16}$`, code: 'machine_eps(np.float64) == np.finfo(np.float64).eps' },
        { name: t`float32: $2^{-23} \approx 1.2\times10^{-7}$`, code: 'machine_eps(np.float32) == np.finfo(np.float32).eps' },
        { name: 'the result has the type asked for', code: 'type(machine_eps(np.float32)) is np.float32' },
      ],
      hints: ['Testing `one + e / two > one` (rather than `one + e > one`) stops with e = ε itself, avoiding the classic off-by-one.', 'Write `e = e / two` with `two = dtype(2)` so every step stays in the chosen precision.'],
      teach: 'ε is the last power of two whose addition still changes 1; test the next halving before you take it.',
      explain: t`It returns $2^{-23}$ for float32 and $2^{-52}$ for float64, the values \`np.finfo\` reports. Single precision keeps about 7 digits — enough for a graphics card, not for an orbit integrated over thousands of steps.`,
    }),
    mcq({
      id: 'overflow-ratio', difficulty: 2,
      prompt: t`A ratio of two Boltzmann factors, $e^{800}/e^{799}$, should be $e \approx 2.718$. What does NumPy print?

\`\`\`python
import numpy as np
print(np.exp(800) / np.exp(799))
\`\`\``,
      choices: ['`nan`, with overflow warnings: both exponentials are `inf`, and inf/inf is undefined', '`2.718281828459045`', '`inf`', '`OverflowError` stops the program'],
      answer: 0,
      why: {
        1: 'The exact ratio is e, but neither number in it exists as a float: the largest float is about 1.8 × 10³⁰⁸, and e⁸⁰⁰ ≈ 10³⁴⁷.',
        2: 'Each exponential is inf, but inf divided by inf is not inf: it is undefined, NaN.',
        3: 'That is what `math.exp(800)` does. NumPy returns inf with a warning and carries on.',
      },
      hints: ['What is the largest float? Compare it with e⁸⁰⁰ ≈ 10³⁴⁷.', 'Overflow in NumPy gives inf (with a warning), and inf / inf = nan.'],
      teach: 'Floats top out near 1.8 × 10³⁰⁸; combine exponents before exponentiating — exp(800 − 799) — so huge intermediate values never form.',
      explain: t`\`np.exp(800)\` overflows to \`inf\` (and so does \`np.exp(799)\`), and $\infty/\infty$ is NaN. Rewrite as \`np.exp(800 - 799)\`: the same quantity, with no huge intermediate. Statistical mechanics does this constantly — partition functions are computed with the largest exponent factored out.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-float32-clock', difficulty: 3, transfer: true,
      gen(r) {
        const [thr, thrTeX] = r.pick([[1e-3, '1 ms'], [1e-2, '10 ms'], [1e-1, '0.1 s']]);
        let e = 0;
        while (2 ** (e - 23) <= thr) e++;
        const T = 2 ** e;
        return {
          prompt: t`A small satellite's flight software stores mission elapsed time, in seconds, as a **float32** (23 fraction bits). How many seconds after launch does the gap between successive representable times first exceed ${thrTeX}?`,
          visual: {
            type: 'graph',
            params: { x: [0, 7.6], y: [-7.2, 0.3], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'time since launch (s)', ylabel: 'float32 spacing (s)',
              curves: STAIR32 },
            caption: 'The gap between neighbouring float32 values against the value itself: a staircase that doubles at every power of two.',
          },
          answer: T, units: 's', tol: { rel: 0.001 },
          errors: [{ value: T / 2, feedback: `At 2^${e - 1} s the gap is 2^${e - 24} s = ${(2 ** (e - 24)).toPrecision(3)} s, still below ${thrTeX}. It doubles at the next power of two.` }, { value: thr / 2 ** -23, feedback: 'That is where ε·t reaches the threshold; the real spacing is a staircase that only jumps at powers of two.' }],
          hints: [t`Between $2^e$ and $2^{e+1}$ seconds the float32 spacing is $2^{e - 23}$ s.`, t`Find the smallest $e$ with $2^{e-23} > ${thr}$; the answer is $2^e$ seconds.`],
          teach: 'A float clock loses resolution as it runs: with p fraction bits, the tick size at time t is 2^(⌊log₂t⌋ − p).',
          explain: t`$2^{${e} - 23} = ${(2 ** (e - 23)).toPrecision(4)}$ s first exceeds ${thrTeX} at $t = 2^{${e}} = ${T.toLocaleString('en-US').replace(/,/g, '{,}')}$ s, about ${(T / 3600).toFixed(1)} hours. Below that the spacing is $2^{${e - 24}} = ${(2 ** (e - 24)).toPrecision(4)}$ s. Flight software keeps time as integer counts of ticks for exactly this reason — the Patriot's integer tick counter was sound; its conversion was not.`,
        };
      },
    }),
    mcq({
      id: 'cp-eps-meaning', difficulty: 2,
      prompt: t`Which statement about machine epsilon, $\varepsilon = 2^{-52} \approx 2.2\times10^{-16}$, is true?`,
      visual: {
        type: 'graph',
        params: { x: [0.45, 2.05], y: [-0.6, 0.8], aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', yticks: 0, xticks: 4, grid: false,
          curves: [{ fn: '0', color: 'ink4', width: 1.2, domain: [0.5, 2] }],
          points: [...Array.from({ length: 8 }, (_, j) => 0.5 * (1 + j / 8)), ...Array.from({ length: 9 }, (_, j) => 1 + j / 8)].map((x) => ({ x, y: 0, color: x === 1 ? 'gold' : 'accent', r: 3.5 })) },
        caption: 'The toy 3-bit format again, around 1 (gold): the gaps above 1 are twice those below it. Binary64 is the same with 2⁵² numbers per band.',
      },
      choices: [
        'It is the gap between 1 and the next larger float; near x the gap is roughly ε·|x|',
        'It is the smallest positive float',
        'It is the largest absolute error any float can have',
        'Adding anything smaller than ε to any float leaves it unchanged',
      ],
      answer: 0,
      why: {
        1: 'The smallest positive float is far smaller: about 2.2 × 10⁻³⁰⁸ for normal numbers, 5 × 10⁻³²⁴ for subnormals.',
        2: 'Absolute errors grow with the number: a float near 10³⁰⁰ is off by up to about 10²⁸⁴. It is the *relative* error that ε bounds.',
        3: 'Near 10⁻²⁰, adding 10⁻³⁰ changes the number. Whether an addition is absorbed depends on the size of x.',
      },
      hints: ['Is ε about absolute size, or relative size?', 'The spacing scales with the number.'],
      teach: 'ε measures relative precision: the gap between 1 and the next float, and so the bound on the relative rounding error of any result (ε/2).',
      explain: t`ε is the spacing at 1. Everywhere else the spacing scales with the number, so ε bounds the *relative* error: every correctly rounded result is within a factor $1 \pm \varepsilon/2$ of the exact one. That is why tolerances should usually be relative (\`math.isclose\` uses \`rel_tol\`).`,
    }),
    code({
      id: 'cp-counter', difficulty: 2, transfer: true,
      prompt: t`A particle detector's GPU code keeps a running count of events in a **float32**. Find where it stops counting: starting from \`N = np.float32(1)\`, keep doubling \`N\` while adding one still changes it (\`N + np.float32(1) != N\`). Set \`N_stuck\` to the first power of two at which adding one event has no effect, as a Python \`int\`.`,
      starter: t`import numpy as np

N_stuck = None
`,
      answer: t`import numpy as np

N = np.float32(1)
one = np.float32(1)
while N + one != N:
    N = N * np.float32(2)
N_stuck = int(N)
print(N_stuck)`,
      tests: [
        { name: t`it is $2^{24} = 16\,777\,216$ events`, code: 'N_stuck == 2**24' },
        { name: 'there, one more event is lost in float32', code: 'np.float32(N_stuck) + np.float32(1) == np.float32(N_stuck)' },
      ],
      hints: ['Keep everything in float32: `one = np.float32(1)` and `N = N * np.float32(2)`.', 'Loop `while N + one != N:`, then `N_stuck = int(N)`.'],
      teach: 'A float with p fraction bits counts exactly only up to 2^(p+1): 16.8 million for float32, 9 × 10¹⁵ for float64.',
      explain: t`At $2^{24} = 16\,777\,216$ the float32 spacing becomes 2, and $N + 1$ rounds back to $N$: the counter freezes silently. A detector seeing $10^5$ events a second would stop counting after under three minutes. Use integer types for counts; if a sum of many floats is needed, accumulate in float64 or use \`math.fsum\`.`,
    }),
  ],
  sources: [
    { label: 'U.S. GAO (1992), Patriot Missile Defense: Software Problem Led to System Failure at Dhahran, Saudi Arabia, GAO/IMTEC-92-26', url: 'https://www.gao.gov/products/imtec-92-26' },
    { label: 'Skeel (1992), Roundoff error and the Patriot missile, SIAM News 25(4), 11', url: 'https://www-users.cse.umn.edu/~arnold/disasters/patriot.html' },
    { label: 'Goldberg (1991), What every computer scientist should know about floating-point arithmetic, ACM Computing Surveys 23, 5', url: 'https://doi.org/10.1145/103162.103163' },
    { label: 'Python tutorial, §15: Floating-point arithmetic: issues and limitations', url: 'https://docs.python.org/3/tutorial/floatingpoint.html' },
  ],
});
