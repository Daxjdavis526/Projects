// Strings and formatting — f-strings with fixed, scientific and significant-
// figure formats, aligned tables, and parsing a data file of thrust readings.
import { lesson, mcq, code } from '../../src/core/content.js';

const t = String.raw;

// the Explore's motor: synthetic readings shaped like a small model-rocket motor
const MOTOR = [[0.0, 0.0], [0.1, 6.2], [0.2, 14.1], [0.3, 11.0], [0.4, 6.3], [0.5, 5.1], [0.6, 4.8], [0.7, 4.6], [0.8, 4.6], [0.9, 4.5], [1.0, 4.5], [1.1, 4.4], [1.2, 4.4], [1.3, 4.4], [1.4, 4.3], [1.5, 4.3], [1.6, 4.2], [1.7, 2.1], [1.8, 0.0]];
const csv = (rows, f = 1) => rows.map(([a, b]) => `${a.toFixed(f)}, ${b.toFixed(f === 1 ? 1 : 2)}`).join('\n');

// the checkpoint's cold-gas thruster pulse (synthetic)
const PULSE = [[0.0, 0.0], [0.05, 0.62], [0.1, 0.98], [0.15, 1.01], [0.2, 1.0], [0.25, 0.99], [0.3, 1.0], [0.35, 0.97], [0.4, 0.41], [0.45, 0.05], [0.5, 0.0]];
const trap = (rows) => rows.slice(1).reduce((s, [tt, F], i) => s + ((tt - rows[i][0]) * (F + rows[i][1])) / 2, 0);
const PULSE_I = trap(PULSE), PULSE_AVG = PULSE_I / (PULSE[PULSE.length - 1][0] - PULSE[0][0]);
const pulseFile = `# cold-gas thruster pulse on a thrust stand (synthetic data)
# t (s), F (N)
${csv(PULSE, 2)}
`;

// US Standard Atmosphere 1976 densities (kg/m³)
const ATM = [[0, 1.225], [10, 0.41351], [20, 0.08891], [30, 0.01841], [40, 0.0039957]];
const sci = (x, n) => { const [m, e] = x.toExponential(n).split('e'); return `${m}e${e[0] === '-' ? '-' : '+'}${String(Math.abs(+e)).padStart(2, '0')}`; };
const atmLine = ([h, rho]) => `${String(h).padStart(5)} km  ${sci(rho, 3)} kg/m3`;

export default lesson({
  id: 'prog.P1.5',
  title: 'Strings and formatting',
  minutes: 9, difficulty: 2,
  intro: t`Data arrive as **text** — a file of readings, a line of telemetry — and results leave as text, in a table or a report. Python's tools for both are string methods (\`strip\`, \`split\`, \`startswith\`), conversions (\`float("2.07")\`) and the **f-string**, which formats a number as it goes into text:

$$\texttt{f"\{x:10.3e\}"} \;\to\; \underbrace{\texttt{10}}_{\text{width}}\ \underbrace{\texttt{.3}}_{\text{precision}}\ \underbrace{\texttt{e}}_{\text{type}}$$

Choosing the type is choosing how a reader sees your number: fixed decimals, scientific notation, or a set number of significant figures.`,
  symbols: [
    { tex: t`\texttt{:.3f}`, text: 'fixed point, 3 digits after the decimal point: `9.38` becomes `9.380` — but $6.674\\times10^{-11}$ becomes `0.000`' },
    { tex: t`\texttt{:.3e}`, text: 'scientific notation, 3 digits after the point (4 significant figures): `6.674e-11`' },
    { tex: t`\texttt{:.3g}`, text: '3 significant figures, switching to scientific notation for very large or small numbers — and dropping trailing zeros' },
    { tex: t`\texttt{:10}`, text: 'a minimum width of 10 characters, numbers right-aligned (`<` aligns left, `>` right, `^` centres)' },
    { tex: t`\texttt{:,}`, text: 'thousands separators: `1,234.6`' },
  ],
  why: 'A number is only as good as the way it is reported: the right significant figures and units in your output are what a reader — or a test report — actually sees.',
  visual: {
    type: 'code-runner',
    title: 'From a data file to a report',
    lead: t`Press **Run**. The program writes a small CSV file (into your browser's memory), reads it back line by line, skips the comments, converts each field with \`float\`, and reports the total impulse — the area under the thrust curve — in three formats.`,
    tasks: ['Change the table to print every reading, and the thrust with 2 decimals.', 'Report the impulse with `:.2g` and with `:#.3g`: which keeps the trailing zero?', 'Break a line of the data (write `0.5, 5,1`) and read the error message.'],
    params: {
      rows: 24,
      code: t`import atlas.plot as plt

DATA = """# static fire, synthetic readings shaped like a small model-rocket motor
# time (s), thrust (N)
${csv(MOTOR)}
"""
with open("thrust.csv", "w") as f:        # a file in the browser's memory
    f.write(DATA)

t, F = [], []
with open("thrust.csv") as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith("#"):
            continue                        # skip blank lines and comments
        a, b = line.split(",")
        t.append(float(a))
        F.append(float(b))

I = sum((t[i + 1] - t[i]) * (F[i] + F[i + 1]) / 2 for i in range(len(t) - 1))
print(f"{'t (s)':>6} {'F (N)':>7}")
for ti, Fi in zip(t[::3], F[::3]):
    print(f"{ti:6.1f} {Fi:7.1f}")
print(f"total impulse: {I:.2f} N s   ({I:.3e} in scientific notation)")
k = F.index(max(F))
print(f"peak thrust:   {F[k]:.3g} N at t = {t[k]:.1f} s")

plt.plot(t, F)
plt.xlabel("t (s)")
plt.ylabel("thrust (N)")
plt.show()`,
    },
    caption: 'Synthetic data, not a real motor’s certification curve. The impulse is a trapezoid-rule area, which assumes the thrust varies linearly between readings.',
  },
  example: {
    prompt: t`Report the gravitational constant $G = 6.674\times10^{-11}$ N m²/kg², the speed of light $c = 299\,792\,458$ m/s and the Sun's Schwarzschild radius $r_s = 2953.25$ m. Which format suits each, and what traps hide in the obvious choices?`,
    steps: [
      { label: 'Fixed decimals fail small numbers', text: t`\`:.3f\` keeps three digits after the point, whatever the size of the number:

\`\`\`python
G = 6.674e-11
print(f"{G:.3f}")     # 0.000  — every digit lost
print(f"{G:.3e}")     # 6.674e-11
\`\`\`

Use \`f\` only when you know the magnitude (a table of temperatures, a time in seconds).` },
      { label: 'Significant figures with g', text: t`\`:.3g\` gives three significant figures and picks fixed or scientific notation by itself — but it **drops trailing zeros**, so $c$ to 3 figures comes out as \`3e+08\`. The \`#\` flag keeps them:

\`\`\`python
c = 299792458
print(f"{c:.3g}")     # 3e+08
print(f"{c:#.3g}")    # 3.00e+08
print(f"{c:.2e}")     # 3.00e+08 — same thing, explicitly
\`\`\`` },
      { label: 'Switching to e', text: t`\`g\` switches to scientific notation once the exponent reaches the precision. For $r_s = 2953.25$ m, three figures means an exponent of 3, so:

\`\`\`python
rs = 2953.25
print(f"{rs:.3g}")    # 2.95e+03
print(f"{rs:.4g}")    # 2953
\`\`\`` },
      { label: 'Line up a table', text: t`A width right-aligns numbers so the decimal points line up — the difference between a table and a list:

\`\`\`python
for name, v in [("G", G), ("c", c), ("rs", rs)]:
    print(f"{name:>3} = {v:10.4e}")
\`\`\`

Sense check: every printed value should have the significant figures the measurement supports, and its unit beside it.` },
    ],
    answer: t`$G$ in \`e\` format, $c$ with \`:.2e\` or \`:#.3g\` (plain \`:.3g\` loses the zeros), $r_s$ with \`:.4g\` or \`:.3e\` — never \`f\` for a number whose size you do not control.`,
  },
  practice: [
    mcq({
      id: 'fmt-e', difficulty: 1,
      prompt: t`What does this print?

\`\`\`python
N_A = 6.02214076e23      # Avogadro's number, 1/mol
print(f"{N_A:.3e}")
\`\`\``,
      choices: ['`6.022e+23`', '`6.02e+23`', '`6.022×10²³`', '`602214076000000000000000.000`'],
      answer: 0,
      why: {
        1: 'For `e`, the precision counts digits *after* the decimal point: `.3e` gives 4 significant figures.',
        2: 'Python prints the exponent in computer notation, `e+23`; a superscript needs your own formatting (or LaTeX).',
        3: 'That would be `.3f`. The `e` type writes a mantissa and an exponent.',
      },
      hints: ['`e` means scientific notation.', 'In `.3e`, the 3 counts the digits after the decimal point.'],
      teach: 'In the `e` format the precision is the number of digits after the point, so `.3e` shows four significant figures.',
      explain: t`\`6.022e+23\`: one digit before the point, three after, then the exponent. For three significant figures write \`.2e\`.`,
    }),
    mcq({
      id: 'fmt-g-zeros', difficulty: 2,
      prompt: t`A report should give the speed of light to three significant figures. What does this print?

\`\`\`python
c = 299792458.0       # m/s
print(f"c = {c:.3g} m/s")
\`\`\``,
      choices: ['`c = 3e+08 m/s`', '`c = 3.00e+08 m/s`', '`c = 300000000 m/s`', '`c = 299792458.000 m/s`'],
      answer: 0,
      why: {
        1: 'That is what `.2e` or `#.3g` give. Plain `g` strips trailing zeros.',
        2: '`g` switches to scientific notation when the exponent (8) is at least the precision (3).',
        3: 'That would be `.3f`. `g` counts significant figures, not decimal places.',
      },
      hints: ['`g` rounds to 3 significant figures: 3.00 × 10⁸.', 'Then it removes trailing zeros unless you add the `#` flag.'],
      teach: 'The `g` format rounds to significant figures but drops trailing zeros, so use `e` (or `#g`) when the zeros carry meaning.',
      explain: t`\`.3g\` rounds to $3.00\times10^{8}$ and then strips the zeros, printing \`3e+08\` — which looks like one significant figure. \`f"{c:.2e}"\` or \`f"{c:#.3g}"\` print \`3.00e+08\`.`,
    }),
    code({
      id: 'parse-telemetry', difficulty: 2,
      prompt: t`Telemetry arrives as lines of \`name=value\` fields separated by spaces, such as \`"t=0.35 F=14.2 Pc=2.07\n"\`. Write \`parse(line)\` that returns a dict mapping each name to its value **as a float**: here \`{"t": 0.35, "F": 14.2, "Pc": 2.07}\`. Extra spaces and the newline must not matter.`,
      starter: t`def parse(line):
    fields = {}
    return fields
`,
      answer: t`def parse(line):
    fields = {}
    for item in line.split():
        name, value = item.split("=")
        fields[name] = float(value)
    return fields

print(parse("t=0.35 F=14.2 Pc=2.07\n"))`,
      tests: [
        { name: 'three fields from a clean line', code: 'parse("t=0.35 F=14.2 Pc=2.07\\n") == {"t": 0.35, "F": 14.2, "Pc": 2.07}' },
        { name: 'extra spaces are ignored', code: 'parse("   t=1.00    F=0.0  \\n") == {"t": 1.0, "F": 0.0}' },
        { name: 'the values are floats, not strings', code: 'all(type(v) is float for v in parse("a=1 b=2").values())' },
      ],
      hints: ['`line.split()` with no argument splits on any run of whitespace and ignores the newline.', 'For each piece, `name, value = item.split("=")`, then store `float(value)`.'],
      teach: '`split()` cuts text into fields, and nothing read from text is a number until you convert it with `float`.',
      explain: t`\`line.split()\` gives \`['t=0.35', 'F=14.2', 'Pc=2.07']\` — no empty strings, whatever the spacing — and splitting each on \`=\` gives the name and the value. \`split(" ")\` with an explicit space would produce empty fields wherever two spaces meet.`,
    }),
    code({
      id: 'atm-table', difficulty: 2,
      prompt: t`Print the US Standard Atmosphere's density at each altitude in \`table\`, one line per altitude, **exactly** in this layout:

\`\`\`
${ATM.slice(0, 2).map(atmLine).join('\n')}
\`\`\`

The altitude is right-aligned in 5 characters, followed by \` km\` and two spaces; the density is in scientific notation with 4 significant figures, followed by \` kg/m3\`.`,
      visual: {
        type: 'graph',
        params: { x: [-2, 42], y: [-2.6, 0.3], aspect: 'wide', ylog: true, axesAt: 'edge', xlabel: 'altitude (km)', ylabel: 'density (kg/m³)',
          points: ATM.map(([hh, rho]) => ({ x: hh, y: Math.log10(rho), color: 'accent' })), curves: [{ fn: 'log10(1.225) - x/(2.303*7.6)', color: 'ink3', dash: true, label: 'scale height 7.6 km', labelAt: 22, labelDy: -14 }] },
        caption: 'The five densities on a logarithmic axis. The dashed line is a single exponential with a 7.6 km scale height — a rough guide, since the real atmosphere’s temperature changes with height.',
      },
      starter: t`# (altitude in km, density in kg/m3)
table = [${ATM.map(([hh, rho]) => `(${hh}, ${rho})`).join(', ')}]
for h, rho in table:
    print(h, rho)
`,
      answer: t`# (altitude in km, density in kg/m3)
table = [${ATM.map(([hh, rho]) => `(${hh}, ${rho})`).join(', ')}]
for h, rho in table:
    print(f"{h:5d} km  {rho:.3e} kg/m3")`,
      tests: ATM.map((row) => ({ name: `the ${row[0]} km line reads \`${atmLine(row).trim()}\``, code: `${JSON.stringify(atmLine(row))} in _stdout.splitlines()` })).filter((x, i) => i % 2 === 0 || i === 1),
      hints: ['Width 5 for an integer: `{h:5d}` (or `{h:>5}`).', 'Four significant figures in scientific notation is `.3e`: `print(f"{h:5d} km  {rho:.3e} kg/m3")`.'],
      teach: 'A format spec sets width, alignment and precision at once, so every row of a table lines up.',
      explain: t`\`f"{h:5d} km  {rho:.3e} kg/m3"\`. The density falls by a factor of ${(ATM[0][1] / ATM[4][1]).toFixed(0)} in 40 km, so fixed decimals would print \`0.004\` at the top — only one significant figure — while \`e\` keeps four everywhere.`,
    }),
    mcq({
      id: 'str-plus-int', difficulty: 1,
      prompt: t`What happens?

\`\`\`python
isp = 311
print("Isp = " + isp + " s")
\`\`\``,
      choices: ['A `TypeError`: a string cannot be joined to an int with `+`', 'It prints `Isp = 311 s`', 'It prints `Isp = isp s`', 'It prints `Isp = 311.0 s`'],
      answer: 0,
      why: {
        1: 'That needs `"Isp = " + str(isp) + " s"`, or better `f"Isp = {isp} s"`. Python never converts silently here.',
        2: 'The name `isp` is outside the quotes, so its value is used — the problem is its type.',
        3: '`isp` is an int, and nothing here would make it a float.',
      },
      hints: ['What type is `isp`? What does `+` mean between a `str` and an `int`?'],
      teach: '`+` joins two strings but will not mix a string with a number; an f-string converts for you.',
      explain: t`\`TypeError: can only concatenate str (not "int") to str\`. Write \`print(f"Isp = {isp} s")\` — or \`print("Isp =", isp, "s")\`, since \`print\` converts and separates its arguments itself.`,
    }),
    mcq({
      id: 'round-vs-format', difficulty: 2,
      prompt: t`A results table needs every pressure with two decimals. What does this print?

\`\`\`python
p = 2.50      # MPa
print(round(p, 2), f"{p:.2f}")
\`\`\``,
      choices: ['`2.5 2.50`', '`2.50 2.50`', '`2.5 2.5`', '`3 2.50`'],
      answer: 0,
      why: {
        1: '`round` returns a *number*, and a float prints without trailing zeros. Only formatting controls the digits shown.',
        2: '`.2f` always shows exactly two decimals.',
        3: '`round(p, 2)` rounds to two decimals, not to a whole number.',
      },
      hints: ['`round` changes a number; formatting changes how a number is written.', 'Does the float 2.5 remember that you typed 2.50?'],
      teach: '`round` gives a number for further computing; a format spec gives text with exactly the digits you ask for.',
      explain: t`\`round(2.50, 2)\` is the float 2.5, printed as \`2.5\`; \`f"{p:.2f}"\` is the text \`2.50\`. Round for the value, format for the display — and keep full precision in anything you compute further.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-pulse', difficulty: 3, transfer: true,
      prompt: t`A cold-gas thruster fires one pulse on a thrust stand, logged to the text \`DATA\` below (comment lines start with \`#\`). Parse it into lists of times and thrusts, then set \`I\` to the total impulse $I = \int F\,dt$ by the trapezoid rule (in N s), and \`F_avg\` to $I$ divided by the logged duration. Print \`I\` as \`I = 0.35 N s\` (two decimals).`,
      visual: {
        type: 'graph',
        params: { x: [-0.02, 0.52], y: [-0.08, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'F (N)',
          curves: PULSE.slice(1).map(([t1, F1], i) => { const [t0, F0] = PULSE[i]; return { fn: `${F0} + (${F1 - F0})*(x - ${t0})/${t1 - t0}`, domain: [t0, t1], color: 'accent', width: 2 }; }),
          shade: PULSE.slice(1).map(([t1, F1], i) => { const [t0, F0] = PULSE[i]; return { fn: `${F0} + (${F1 - F0})*(x - ${t0})/${t1 - t0}`, from: t0, to: t1, color: 'accent', alpha: i % 2 ? 0.14 : 0.24 }; }),
          points: PULSE.map(([tt, F]) => ({ x: tt, y: F, color: 'gold', r: 3.5 })) },
        caption: 'The logged readings. The trapezoid rule joins them with straight lines and adds up the areas under them.',
      },
      starter: t`DATA = """${pulseFile}"""
t, F = [], []
# parse DATA, then compute the impulse and the average thrust
I = 0.0
F_avg = 0.0
`,
      answer: t`DATA = """${pulseFile}"""
t, F = [], []
for line in DATA.splitlines():
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    a, b = line.split(",")
    t.append(float(a))
    F.append(float(b))

I = 0.0
for i in range(len(t) - 1):
    I += (t[i + 1] - t[i]) * (F[i] + F[i + 1]) / 2
F_avg = I / (t[-1] - t[0])
print(f"I = {I:.2f} N s")
print(f"average thrust {F_avg:.3f} N")`,
      tests: [
        { name: t`the data has ${PULSE.length} readings`, code: `len(t) == ${PULSE.length} and len(F) == ${PULSE.length}` },
        { name: t`$I = ${PULSE_I.toFixed(4)}$ N s`, code: `abs(I - ${PULSE_I}) < 1e-9` },
        { name: t`average thrust ${PULSE_AVG.toFixed(3)} N`, code: `abs(F_avg - ${PULSE_AVG}) < 1e-9` },
        { name: t`it prints \`I = ${PULSE_I.toFixed(2)} N s\``, code: `"I = ${PULSE_I.toFixed(2)} N s" in _stdout` },
      ],
      hints: ['Loop over `DATA.splitlines()`, `strip()` each line, skip empty and `#` lines, `split(",")` and convert with `float`.', 'Trapezoid rule: add `(t[i+1] - t[i]) * (F[i] + F[i+1]) / 2` for each interval.', 'The duration is `t[-1] - t[0]`; print with `f"I = {I:.2f} N s"`.'],
      teach: 'Reading a data file is always the same loop — strip, skip comments, split, convert — and the analysis starts only once the numbers are numbers.',
      explain: t`The ${PULSE.length} readings give $I = ${PULSE_I.toFixed(4)}$ N s, and $F_\text{avg} = ${PULSE_AVG.toFixed(3)}$ N over the half-second log. A cold-gas thruster's specific impulse is low (around 70 s for nitrogen), so impulse like this costs about $I/(I_{\text{sp}} g_0) \approx ${(PULSE_I / (70 * 9.80665) * 1000).toFixed(2)}$ g of gas per pulse.`,
    }),
    mcq({
      id: 'cp-g-format', difficulty: 2,
      prompt: t`What does this print for the Sun's Schwarzschild radius?

\`\`\`python
rs = 2953.25      # m
print(f"{rs:.3g}")
\`\`\``,
      choices: ['`2.95e+03`', '`2953`', '`2953.250`', '`2.953e+03`'],
      answer: 0,
      why: {
        1: '`2953` has four significant figures. With three, the last digit cannot be shown in fixed notation, so `g` switches to `e`.',
        2: 'That is `.3f`, three decimal places. `g` counts significant figures.',
        3: 'That is `.3e`, which keeps three digits *after* the point (four figures).',
      },
      hints: ['`.3g` keeps 3 significant figures.', 'The exponent of 2953 is 3; `g` uses scientific notation when the exponent is at least the precision.'],
      teach: 'With `g`, a number whose exponent reaches the precision is written in scientific notation, so `.3g` of 2953 is `2.95e+03`.',
      explain: t`Three significant figures of 2953.25 are $2.95\times10^{3}$, and \`g\` writes that as \`2.95e+03\` because the fixed form \`2950\` would suggest a fourth figure. Use \`.4g\` to get \`2953\`.`,
    }),
    mcq({
      id: 'cp-missing', difficulty: 2, transfer: true,
      prompt: t`A pressure transducer dropped one sample from a CSV row. What happens?

\`\`\`python
row = "1.5,,2.0"           # t (s), p1 (MPa), p2 (MPa)
values = [float(x) for x in row.split(",")]
\`\`\``,
      choices: ['A `ValueError`: the empty field `\'\'` cannot be converted to a float', '`values` is `[1.5, 2.0]`: empty fields are skipped', '`values` is `[1.5, 0.0, 2.0]`', '`values` is `[1.5, None, 2.0]`'],
      answer: 0,
      why: {
        1: '`split(",")` keeps an empty string between two adjacent commas; only `split()` with no argument drops empty fields.',
        2: '`float("")` does not default to zero — and a silent zero would be worse than an error in a pressure log.',
        3: 'Python never turns an empty string into `None` by itself.',
      },
      hints: ['What is `"1.5,,2.0".split(",")`?', 'Can `float("")` succeed?'],
      teach: '`split(",")` keeps empty fields, and `float("")` raises a `ValueError` — decide explicitly how to treat a missing value (for example as `float("nan")`).',
      explain: t`\`"1.5,,2.0".split(",")\` is \`['1.5', '', '2.0']\`, and \`float('')\` raises \`ValueError: could not convert string to float: ''\`. A robust reader maps empty fields to \`float("nan")\`, which later calculations cannot mistake for a real reading.`,
    }),
  ],
  sources: [
    { label: 'Python documentation: Format specification mini-language', url: 'https://docs.python.org/3/library/string.html#format-specification-mini-language' },
    { label: 'The Python Tutorial, §7.2: Reading and writing files', url: 'https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files' },
    { label: 'U.S. Standard Atmosphere, 1976 (NASA TM-X-74335)', url: 'https://ntrs.nasa.gov/citations/19770009539' },
  ],
});
