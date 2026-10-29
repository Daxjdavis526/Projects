// Variables, types and arithmetic — a brisk refresher in a physics voice:
// exact ints, rounded floats, floor division, and comparing with a tolerance.
import { lesson, mcq, num, code } from '../../src/core/content.js';

const t = String.raw;

const E_CHARGE = 1.602176634e-19;     // C, exact (SI 2019)
const K_B = 1.380649e-23;             // J/K, exact (SI 2019)
const G0 = 9.80665;                   // m/s², standard gravity (exact by definition)

// the ISS's period from Kepler's third law (worked example)
const GM_E = 3.986004418e14, R_E = 6371e3, H_ISS = 420e3;
const T_ISS = 2 * Math.PI * Math.sqrt((R_E + H_ISS) ** 3 / GM_E);
const ISS_MIN = Math.floor(T_ISS / 60), ISS_SEC = Math.round(T_ISS % 60);

// a damped oscillator m x'' + b x' + k x = 0 (practice)
const OSC = { m: 0.5, b: 0.4, k: 20 };
const OSC_G = OSC.b / (2 * OSC.m), OSC_W = Math.sqrt(4 * OSC.m * OSC.k - OSC.b ** 2) / (2 * OSC.m);

// a stage burn (checkpoint)
const DV = { isp: 348, m0: 120000, mf: 30000 };
const DV_VAL = DV.isp * G0 * Math.log(DV.m0 / DV.mf);

export default lesson({
  id: 'prog.P1.1',
  title: 'Variables, types and arithmetic',
  minutes: 9, difficulty: 1,
  intro: t`A Python variable is a **name bound to a value**, and every value has a type: \`int\` (whole numbers, exact at any size), \`float\` (64-bit binary numbers with about 16 significant digits), \`complex\`, \`bool\` and \`str\`. Arithmetic works as on a calculator, with a few traps that matter in science. The deepest is that a float holds only the **nearest binary fraction** to the number you meant:

$$\mathrm{fl}(x) = x\,(1 + \delta), \qquad |\delta| \le 2^{-53} \approx 1.1\times10^{-16}$$

So \`0.1 + 0.2 == 0.3\` is \`False\`, and a scientist compares floats with a tolerance, never with \`==\`.`,
  symbols: [
    { tex: t`\mathrm{fl}(x)`, text: 'the float Python actually stores when you type or compute the number $x$' },
    { tex: 'x', text: 'the exact real number you meant, such as 0.1 or the true value of a computed speed' },
    { tex: t`\delta`, text: 'the relative rounding error: different for every number, zero for numbers like 0.5 that are exact binary fractions' },
    { tex: t`2^{-53}`, text: 'the largest relative error one rounding can make (the *unit roundoff*); the gap between 1 and the next float up is twice that, $2^{-52} \\approx 2.2\\times10^{-16}$' },
    { tex: t`\texttt{math.isclose(a, b)}`, text: 'true when $|a - b| \\le 10^{-9}\\max(|a|, |b|)$ by default — a *relative* test; add `abs_tol=…` to compare with zero' },
  ],
  why: 'Every number a simulation produces is a float with a rounding error in it; knowing where exactness ends is what tells a bug from round-off.',
  visual: {
    type: 'code-runner',
    title: 'Types and traps',
    lead: t`Press **Run**, then read the output line by line against the code. Every line is a trap that has bitten a physics program.`,
    tasks: ['Change `2**100` to `2**1000`: an int stays exact, digit for digit.', 'Add a line `print(1e308 * 10)`: a float that overflows becomes `inf`, silently.', 'Check that `(-7 // 3) * 3 + (-7 % 3)` gives back -7.'],
    params: {
      code: t`import math

# every value has a type
for value in [3, 3.0, 2 + 1j, 3 > 2, "3"]:
    print(repr(value), type(value).__name__)

# ints are exact at any size; floats keep about 16 digits
print(2**100)
print(2.0**100)

# a float is the nearest binary fraction to what you typed
print(0.1 + 0.2 == 0.3, 0.1 + 0.2)
print(f"{0.1:.25f}")
print(math.isclose(0.1 + 0.2, 0.3))

# floor division rounds DOWN, even for negative numbers
print(7 // 2, -7 // 2, 7 % 3, -7 % 3)`,
    },
    caption: 'Real Python 3.14 in your browser. A float prints as the shortest decimal that rounds back to the same binary value, which is why 0.1 looks exact until you ask for 25 digits.',
  },
  example: {
    prompt: t`The ISS orbits about 420 km above Earth's surface. Compute its period from Kepler's third law, $T = 2\pi\sqrt{a^3/(GM)}$, with $GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$ and Earth's mean radius $R = 6371$ km, and print it in minutes and seconds.`,
    steps: [
      { label: 'Work in SI units', text: t`Convert kilometres to metres once, at the top. \`6371e3\` is a float meaning $6371\times10^{3}$; mixing ints and floats in arithmetic gives a float.

\`\`\`python
import math
GM = 3.986004418e14     # m³/s²
R = 6371e3              # m
a = R + 420e3           # m, the orbit's radius
\`\`\`` },
      { label: 'Compute with brackets', text: t`The denominator is a product, so bracket it: \`a**3 / G * M\` would divide by $G$ and then *multiply* by $M$, because \`*\` and \`/\` run left to right.

\`\`\`python
T = 2 * math.pi * math.sqrt(a**3 / GM)    # s
\`\`\`` },
      { label: 'Split with // and %', text: t`Floor division counts whole minutes and the remainder is the seconds left over — exactly the job \`//\` and \`%\` are for.

\`\`\`python
minutes = int(T // 60)
seconds = T % 60
print(f"{minutes} min {seconds:.0f} s")
\`\`\`` },
      { label: 'Sense check', text: t`It prints \`${ISS_MIN} min ${ISS_SEC} s\`, about ${Math.round(86400 / T_ISS * 10) / 10} orbits a day — the ISS's published period is close to 93 minutes. Forgetting the 420 km (using $a = R$) would give about 84 minutes, the period of an orbit skimming the ground.` },
    ],
    answer: t`$T \approx ${Math.round(T_ISS)}$ s, printed as \`${ISS_MIN} min ${ISS_SEC} s\`.`,
  },
  practice: [
    mcq({
      id: 'floor-neg', difficulty: 1,
      prompt: t`What does this print?

\`\`\`python
print(-7 // 2, -7 % 2)
\`\`\``,
      visual: {
        type: 'graph',
        params: { x: [-5.6, 1.2], y: [-1, 1], aspect: 'wide', xlabel: '', ylabel: '', yticks: 0, xticks: 7, grid: false, axesAt: 'edge',
          curves: [{ fn: '0', color: 'ink3', width: 1.5 }],
          points: [{ x: -5, y: 0, color: 'ink3', r: 3 }, { x: -4, y: 0, color: 'ink3', r: 3 }, { x: -3, y: 0, color: 'ink3', r: 3 }, { x: -2, y: 0, color: 'ink3', r: 3 }, { x: -1, y: 0, color: 'ink3', r: 3 }, { x: 0, y: 0, color: 'ink3', r: 3 },
            { x: -3.5, y: 0, color: 'gold', r: 5, label: '−7 / 2 = −3.5', labelDx: -40, labelDy: -22 }] },
        caption: 'The exact quotient on the number line, between two whole numbers. Floor division must pick one of them.',
      },
      choices: ['`-4 1`', '`-3 -1`', '`-3 1`', '`-4 -1`'],
      answer: 0,
      why: {
        1: 'That is truncation toward zero, which C and Fortran use. Python’s `//` rounds *down*, toward minus infinity.',
        2: 'With a quotient of −3 the remainder would have to be −1 to give back −7. Python’s `//` rounds down to −4.',
        3: 'In Python the remainder takes the sign of the divisor (here +2), so it is never negative here.',
      },
      hints: ['`//` rounds down, toward minus infinity — and down from −3.5 is not −3.', 'The two always satisfy `(a // b) * b + a % b == a`.'],
      teach: '`//` rounds toward minus infinity, and `%` then takes whatever sign makes `(a // b) * b + a % b == a`.',
      explain: t`$-7/2 = -3.5$ rounds down to $-4$, and $-4 \times 2 + 1 = -7$, so the remainder is 1. A phase angle wrapped with \`theta % (2 * math.pi)\` therefore always lands in $[0, 2\pi)$, even for negative angles — handy.`,
    }),
    num({
      id: 'packets', difficulty: 2,
      gen(r) {
        const size = r.pick([64, 128, 256, 512]);
        const q = r.int(8, 40), rem = r.int(1, size / 2);
        const total = q * size + rem;
        return {
          prompt: t`A ground station packs telemetry samples into packets of fixed size. What does this print?

\`\`\`python
total = ${total}       # samples received
size = ${size}         # samples per packet
n_packets = total // size + (total % size > 0)
print(n_packets)
\`\`\``,
          answer: q + 1, tol: { rel: 0, abs: 0.4 },
          errors: [
            { value: q, feedback: t`That is \`total // size\` alone. The comparison \`total % size > 0\` is \`True\` here, and \`True\` counts as 1 in arithmetic.` },
            { value: total / size, feedback: 'That is the true quotient `total / size`; `//` throws the fraction away, and the comparison then adds one packet for the leftover samples.' },
          ],
          hints: [t`\`${total} // ${size}\` counts the full packets; \`${total} % ${size}\` is what is left over.`, 'A `bool` is an `int` in disguise: `True + 0` is 1.'],
          teach: 'Floor division counts the full packets, the remainder tells you whether a partial one is needed, and a `True` adds 1.',
          explain: t`\`${total} // ${size}\` is ${q} full packets, with ${rem} samples left over; \`${rem} > 0\` is \`True\`, which adds 1: ${q + 1} packets. This is the ceiling of the division, $\lceil ${total}/${size} \rceil$, without leaving whole numbers.`,
        };
      },
    }),
    mcq({
      id: 'isclose-zero', difficulty: 2,
      prompt: t`A test of a statics code checks that the net force on a joint is zero. Round-off left a tiny residue. What does this print?

\`\`\`python
import math
F_net = 1e-17          # N: should be 0, off by round-off
print(math.isclose(F_net, 0.0))
\`\`\``,
      choices: [
        '`False`: the default tolerance is *relative*, so next to zero it shrinks to nothing — pass `abs_tol`',
        '`True`: `1e-17` is far below the default tolerance of `1e-9`',
        '`True`: `isclose` ignores any difference smaller than machine epsilon',
        'An error: `isclose` cannot compare a number with zero',
      ],
      answer: 0,
      why: {
        1: 'The default `rel_tol=1e-9` multiplies `max(|a|, |b|)`, which is `1e-17` here. The allowed gap is `1e-26`, not `1e-9`.',
        2: '`isclose` knows nothing about machine epsilon; it applies the tolerances you give it, relative unless you add `abs_tol`.',
        3: 'It compares with zero happily — it just needs an absolute tolerance to do it usefully.',
      },
      hints: ['By default `isclose(a, b)` asks whether `|a − b| <= 1e-9 * max(|a|, |b|)`.', 'What is `1e-9 * max(1e-17, 0)`?'],
      teach: 'A relative tolerance scales with the numbers being compared, so comparing with zero needs an absolute one: `math.isclose(F_net, 0.0, abs_tol=1e-12)`.',
      explain: t`The allowed difference is $10^{-9} \times 10^{-17} = 10^{-26}$, and the actual difference is $10^{-17}$, so the answer is \`False\`. \`math.isclose(F_net, 0.0, abs_tol=1e-12)\` says \`True\`. Choose \`abs_tol\` from the problem's scale: here, a force far below anything the instrument could measure.`,
    }),
    code({
      id: 'ev-joule', difficulty: 1,
      prompt: t`Atomic physics measures energy in electronvolts: $1\ \text{eV} = 1.602176634\times10^{-19}$ J, exactly. Write \`ev_to_joule(E)\` and \`joule_to_ev(E)\` that convert an energy each way.`,
      starter: t`E_CHARGE = 1.602176634e-19   # C, exact in the SI since 2019

def ev_to_joule(E):
    pass

def joule_to_ev(E):
    pass
`,
      answer: t`E_CHARGE = 1.602176634e-19   # C, exact in the SI since 2019

def ev_to_joule(E):
    return E * E_CHARGE

def joule_to_ev(E):
    return E / E_CHARGE

print(ev_to_joule(13.6), "J")`,
      tests: [
        { name: t`\`ev_to_joule(1)\` is $1.602\times10^{-19}$ J`, code: `abs(ev_to_joule(1) / ${E_CHARGE} - 1) < 1e-12` },
        { name: t`hydrogen's 13.6 eV is $2.179\times10^{-18}$ J`, code: `abs(ev_to_joule(13.6) / ${13.6 * E_CHARGE} - 1) < 1e-12` },
        { name: t`thermal energy $k_B T$ at 300 K is 0.02585 eV`, code: `abs(joule_to_ev(${K_B} * 300) - ${(K_B * 300) / E_CHARGE}) < 1e-12` },
        { name: 'there and back again gives 5 eV', code: 'abs(joule_to_ev(ev_to_joule(5.0)) - 5.0) < 1e-12' },
      ],
      hints: ['Electronvolts to joules: multiply by the charge.', '`return E * E_CHARGE` and `return E / E_CHARGE`.'],
      teach: 'A unit conversion is one multiplication by a named constant, kept in one place so it can never be typed two different ways.',
      explain: t`\`return E * E_CHARGE\` and \`return E / E_CHARGE\`. Naming the constant once means the exponent \`e-19\` is typed once — a wrong power of ten is the commonest slip in unit conversions.`,
    }),
    num({
      id: 'left-to-right', difficulty: 2,
      gen(r) {
        const b = r.pick([2, 3, 4, 5]), m = r.int(2, 9), c = r.int(2, 6), a = b * m;
        return {
          prompt: t`What number does this print?

\`\`\`python
x = ${a} / ${b} * ${c}
print(x)
\`\`\``,
          answer: m * c, tol: { rel: 1e-9 },
          errors: [{ value: a / (b * c), feedback: t`You divided by the product \`${b} * ${c}\`. Python reads \`a / b * c\` left to right, as $(a/b)\,c$.` }],
          hints: ['`*` and `/` have the same precedence, so Python works left to right.', t`First \`${a} / ${b}\`, then multiply by ${c}.`],
          teach: '`*` and `/` bind equally and run left to right, so a denominator that is a product needs brackets.',
          explain: t`\`${a} / ${b}\` is ${m}.0, times ${c} is ${m * c}.0. So \`G * M / r * c**2\` means $\frac{GM}{r}\,c^2$: to divide by $r c^2$, write \`G * M / (r * c**2)\`.`,
        };
      },
    }),
    code({
      id: 'damped-roots', difficulty: 2,
      prompt: t`A damped oscillator $m\ddot x + b\dot x + kx = 0$ moves as $e^{rt}$, where $r$ solves $mr^2 + br + k = 0$:

$$r = \frac{-b \pm \sqrt{b^2 - 4mk}}{2m}$$

With $m = 0.5$ kg, $b = 0.4$ kg/s and $k = 20$ N/m the square root is of a negative number. Set \`r1\` and \`r2\` to the two complex roots. (\`math.sqrt\` refuses negative numbers; \`cmath.sqrt\` does not.)`,
      visual: {
        type: 'graph',
        params: { x: [0, 10], y: [-1.15, 1.15], aspect: 'wide', xlabel: 't (s)', ylabel: 'x / x₀',
          curves: [{ fn: `exp(-${OSC_G}x)*cos(${OSC_W}x)`, color: 'accent' }, { fn: `exp(-${OSC_G}x)`, color: 'gold', dash: true, label: 'envelope', labelAt: 6.5 }, { fn: `-exp(-${OSC_G}x)`, color: 'gold', dash: true }] },
        caption: 'The motion this oscillator makes. The real part of r sets how fast the envelope dies away; the imaginary part sets how fast it swings.',
      },
      starter: t`import cmath

m, b, k = 0.5, 0.4, 20.0     # kg, kg/s, N/m
r1 = None
r2 = None
`,
      answer: t`import cmath

m, b, k = 0.5, 0.4, 20.0     # kg, kg/s, N/m
disc = cmath.sqrt(b**2 - 4*m*k)
r1 = (-b + disc) / (2*m)
r2 = (-b - disc) / (2*m)
print(r1, r2)`,
      tests: [
        { name: t`the real part is $-b/2m = -0.4\ \text{s}^{-1}$ (the decay rate)`, code: `abs(r1.real + ${OSC_G}) < 1e-12 and abs(r2.real + ${OSC_G}) < 1e-12` },
        { name: t`the imaginary part is $\pm 6.312$ rad/s (the oscillation)`, code: `abs(abs(r1.imag) - ${OSC_W}) < 1e-9 and abs(abs(r2.imag) - ${OSC_W}) < 1e-9` },
        { name: 'the two roots are complex conjugates', code: 'abs(r1 - r2.conjugate()) < 1e-12 and abs(r1.imag) > 1' },
      ],
      hints: [t`Compute the square root once: \`disc = cmath.sqrt(b**2 - 4*m*k)\`.`, t`\`r1 = (-b + disc) / (2*m)\` and \`r2 = (-b - disc) / (2*m)\` — bracket the \`2*m\`.`],
      teach: 'Python has complex numbers built in (`1j` is the imaginary unit), and `cmath` gives their square roots, logarithms and exponentials.',
      explain: t`$r = -0.4 \pm ${OSC_W.toFixed(3)}i\ \text{s}^{-1}$: the motion is $e^{-0.4t}\cos(${OSC_W.toFixed(2)}\,t)$, decaying by $e$ every 2.5 s while swinging about once a second. \`math.sqrt(-39.84)\` would have stopped with \`ValueError: math domain error\`.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-round', difficulty: 2,
      prompt: t`What does this print?

\`\`\`python
print(round(0.5), round(1.5), round(2.5))
\`\`\``,
      choices: ['`0 2 2`', '`1 2 3`', '`0 1 2`', '`0.0 2.0 2.0`'],
      answer: 0,
      why: {
        1: 'That is school rounding, halves up. Python rounds an exact half to the nearest *even* number.',
        2: 'That is truncation, what `int()` does. `round` rounds to the nearest whole number.',
        3: '`round(x)` with one argument returns an `int`; `round(x, 1)` would return a float.',
      },
      hints: ['Python 3 uses “banker’s rounding” for exact halves.', 'A half goes to the even neighbour: 0.5 → 0, 1.5 → 2, 2.5 → 2.'],
      teach: 'Python rounds exact halves to the nearest even number, so rounding errors do not pile up in one direction over a long sum.',
      explain: t`0.5, 1.5 and 2.5 are exact binary fractions, so they really are halves, and each goes to its even neighbour: \`0 2 2\`. A number such as 2.675 is *not* stored exactly — it is a hair below — so \`round(2.675, 2)\` gives 2.67.`,
    }),
    mcq({
      id: 'cp-thrust-string', difficulty: 2,
      prompt: t`A thrust reading arrives from a data file as text. What does this print?

\`\`\`python
F = "1250.5"      # N, read from a file
print(F * 2)
\`\`\``,
      choices: ['`1250.51250.5`', '`2501.0`', 'A `TypeError`', '`2501`'],
      answer: 0,
      why: {
        1: 'That would need `float(F) * 2`. `F` is still a string.',
        2: '`"1250.5" + 2` would be a TypeError; but a string times an int is legal — it repeats the string.',
        3: 'Nothing here is converted to a number at all.',
      },
      hints: ['The quotes make `F` a `str`, not a number.', 'For strings, `*` means repeat: `"ab" * 3` is `"ababab"`.'],
      teach: 'Text read from a file stays text until you convert it with `float()` or `int()` — and some string operations, like `*`, silently do something else.',
      explain: t`\`str * int\` repeats the string, so it prints \`1250.51250.5\` without any error. Convert first: \`F = float("1250.5")\`, then \`F * 2\` is \`2501.0\`.`,
    }),
    code({
      id: 'cp-delta-v', difficulty: 2, transfer: true,
      prompt: t`The rocket equation gives a stage's velocity change: $\Delta v = I_{\text{sp}}\,g_0 \ln(m_0/m_f)$, with specific impulse $I_{\text{sp}}$ in seconds, $g_0 = 9.80665\ \text{m/s}^2$, and start and burnout masses $m_0$ and $m_f$. A stage with $I_{\text{sp}} = ${DV.isp}$ s burns from ${DV.m0.toLocaleString('en-US')} kg down to ${DV.mf.toLocaleString('en-US')} kg. Set \`delta_v\` to its $\Delta v$ in m/s and print it in km/s.`,
      visual: {
        type: 'graph',
        params: { x: [1, 10], y: [0, 8.5], aspect: 'wide', xlabel: 'mass ratio (ignition ÷ burnout mass)', ylabel: 'Δv (km/s)',
          curves: [{ fn: `${DV.isp}*${G0}*ln(x)/1000`, color: 'accent', label: 'Isp = 348 s', labelAt: 7.5, labelDy: 14 }] },
        caption: 'The rocket equation for this engine: Δv grows only with the logarithm of the mass ratio, which is why rockets are mostly propellant.',
      },
      starter: t`import math

g0 = 9.80665     # m/s²
isp = ${DV.isp}        # s
m0 = ${DV.m0}     # kg, at ignition
mf = ${DV.mf}      # kg, at burnout
delta_v = 0.0
`,
      answer: t`import math

g0 = 9.80665     # m/s²
isp = ${DV.isp}        # s
m0 = ${DV.m0}     # kg, at ignition
mf = ${DV.mf}      # kg, at burnout
delta_v = isp * g0 * math.log(m0 / mf)
print(f"{delta_v / 1000:.2f} km/s")`,
      tests: [
        { name: t`$\Delta v$ is ${(DV_VAL / 1000).toFixed(2)} km/s, in m/s`, code: `abs(delta_v - ${DV_VAL}) < 1e-6` },
        { name: 'the program prints it', code: `"${(DV_VAL / 1000).toFixed(2)}" in _stdout or "${DV_VAL.toFixed(0)}" in _stdout` },
      ],
      hints: ['`math.log` is the natural logarithm; `math.log10` is base 10.', '`delta_v = isp * g0 * math.log(m0 / mf)`, then `print(delta_v / 1000)`.'],
      teach: 'The rocket equation is one line of Python once every quantity has a name and a unit comment — and `math.log` is ln.',
      explain: t`$\Delta v = ${DV.isp} \times 9.80665 \times \ln 4 = ${DV_VAL.toFixed(0)}$ m/s $\approx ${(DV_VAL / 1000).toFixed(2)}$ km/s. With \`math.log10\` by mistake you would get ${(DV.isp * G0 * Math.log10(4)).toFixed(0)} m/s — a factor $\ln 10 \approx 2.3$ short.`,
    }),
  ],
  sources: [
    { label: 'The Python Tutorial, §3.1: Using Python as a calculator', url: 'https://docs.python.org/3/tutorial/introduction.html#using-python-as-a-calculator' },
    { label: 'The Python Tutorial, §15: Floating-point arithmetic', url: 'https://docs.python.org/3/tutorial/floatingpoint.html' },
    { label: 'math.isclose — Python documentation', url: 'https://docs.python.org/3/library/math.html#math.isclose' },
  ],
});
