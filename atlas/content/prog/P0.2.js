// Reading error messages — a traceback read from the bottom up: the last
// line names the exception and what went wrong, the frames above it say
// where, most recent call last. What the code lab trims (file names, source
// lines), the common exception types and their usual causes, syntax errors
// found before anything runs, frames inside a library, and the errors that
// do not stop the program at all: NumPy's silent nan and inf (in this
// browser's NumPy, without even the desktop's RuntimeWarning — WebAssembly
// has no floating-point exception flags).
//
// Every traceback quoted here was produced by running the program in this
// Atlas's Pyodide (Python 3.14) and trimmed exactly as the lab trims it
// (src/lab/harness.js cleanTraceback); the desktop one in the intro by
// CPython on Linux, with the path shortened to the file name.
import { lesson, mcq, num, order, match, code } from '../../src/core/content.js';

const t = String.raw;

// ── numbers the prompts and tests quote ──
const G = 6.674e-11, C = 2.998e8, MSUN = 1.989e30;
const RS_SUN = (2 * G * MSUN) / C ** 2;                                        // m
const MU_MARS = 42828.37, MU_EARTH = 398600.4418, A_PHOBOS = 9376;             // km³/s², km
const T_PHOBOS = 2 * Math.PI * Math.sqrt(A_PHOBOS ** 3 / MU_MARS);              // s
const T_PHOBOS_EARTH = 2 * Math.PI * Math.sqrt(A_PHOBOS ** 3 / MU_EARTH);
const BH = { 'Sgr A*': 4.3e6, 'M87*': 6.5e9, 'GW150914 remnant': 62 };          // solar masses
const GAM = [0.5, 0.9, 0.99].map((f) => (1 / Math.sqrt(1 - (f * 3e8) ** 2 / 2.99792458e8 ** 2)).toFixed(3));   // the fixed silent-nan program
const rsKm = (m) => (2 * G * m * MSUN) / C ** 2 / 1e3;

export default lesson({
  id: 'prog.P0.2',
  title: 'Reading error messages',
  minutes: 10, difficulty: 1,
  intro: t`When Python cannot go on, it stops and prints a **traceback**: the chain of calls that was running when things went wrong. It looks alarming and is the most useful thing Python will ever tell you. **Read it from the bottom up.** The last line names the *type* of problem and what it was about; the lines above it say *where*, with the most recent call last. On your own computer it looks like this:

\`\`\`
Traceback (most recent call last):
  File "gravity.py", line 12, in <module>
    g = gravity(h)
  File "gravity.py", line 9, in gravity
    return g0 * (R / (R + hgt))**2
                          ^^^
NameError: name 'hgt' is not defined
\`\`\`

The program called \`gravity\` from line 12, and inside \`gravity\`, line 9 used a name that has no value. The code lab shows the same traceback trimmed: your program has no file, so you see \`line 12, in <module>\` and \`line 9, in gravity\` without the source lines — count down your editor to find them.`,
  symbols: [
    { tex: t`\texttt{Traceback (most recent call last)}`, text: 'the header: the calls that were running, the oldest first and the one that failed last' },
    { tex: t`\texttt{line 9, in gravity}`, text: 'a **frame**: the line that was running and the function it was in; `<module>` means the top level of your program, outside any function' },
    { tex: t`\texttt{NameError}`, text: 'the exception type: what kind of problem (a name with no value, a wrong type, an index past the end …)' },
    { tex: t`\texttt{name 'hgt' is not defined}`, text: 'the message: the particulars — which name, which types, which index' },
  ],
  why: 'Every program you write in this course will fail many times on the way to working; reading the traceback first turns a mystery into a line number and a reason.',
  visual: {
    type: 'code-runner',
    title: 'A program to break on purpose',
    lead: t`Press **Run**: the program works. Then break it in each of the ways below, run it, and read the error **from the bottom up**. **Reset the code** after each.`,
    tasks: [
      'On line 9, change R + h to R + hgt. The last line names the problem; the two frames above it say the call on line 12 led into gravity, line 9.',
      'Put quotes round 420 on line 5 ("420"). A TypeError names the two types that cannot be added: a float and a str.',
      'Delete the colon at the end of line 7. A SyntaxError points at the spot, and nothing prints at all: Python reads the whole program before it runs a single line.',
    ],
    params: {
      code: t`# Gravity at the height of four orbits: a working program to break on purpose
R = 6371.0       # Earth's mean radius, km
g0 = 9.81        # gravitational acceleration at the surface, m/s²

altitudes = {"ISS": 420, "Hubble": 540, "GPS": 20200, "GEO": 35786}   # km

def gravity(h):
    """Gravitational acceleration (m/s²) at altitude h (km)."""
    return g0 * (R / (R + h))**2

for name, h in altitudes.items():
    g = gravity(h)
    print(f"{name:6s} {h:6d} km   g = {g:4.2f} m/s²  ({100 * g / g0:3.0f}% of g0)")`,
    },
    caption: 'A spherical Earth, with g falling as the inverse square of the distance from its centre. Astronauts on the ISS still feel 88% of surface gravity: they float because they are in free fall with their station, not because gravity has gone.',
  },
  example: {
    prompt: t`A program prints the one-way light time to three spacecraft, with distances (rounded, in km) read from a text file. It stops with this traceback. Find the bug and fix it.

\`\`\`python
C = 299792.458                  # speed of light, km/s

def light_time(d):
    """One-way light time in minutes for a distance d in km."""
    return d / C / 60

def report(probes):
    for name, d in probes.items():
        print(f"{name:10s} {light_time(d):7.1f} min")

probes = {"Psyche": "3.1e8", "Juno": "8.9e8", "Voyager 1": "2.5e10"}   # km, as text
report(probes)
\`\`\`

\`\`\`
  line 12, in <module>
  line 9, in report
  line 5, in light_time
TypeError: unsupported operand type(s) for /: 'str' and 'float'
\`\`\``,
    steps: [
      { label: 'Read the last line', text: t`A **TypeError**: the operation was \`/\`, and its two operands were a \`str\` (a string of text) and a \`float\`. Python will not divide text by a number. So somewhere a distance is still text.` },
      { label: 'Find the deepest frame', text: t`The last frame is \`line 5, in light_time\`: \`return d / C / 60\`. \`C\` is a float, so \`d\` must be the string. Line 5 is where the problem *surfaced* — but line 5 is correct: dividing a distance by $c$ is exactly what it should do.` },
      { label: 'Walk up the stack', text: t`Who passed that \`d\`? The frame above: \`line 9, in report\`, which takes \`d\` from \`probes.items()\`. And \`report\` was called from \`line 12, in <module>\` with \`probes\`, built on line 11 — where every distance is in quotes. The bug is on line 11, three frames away from where Python complained.` },
      { label: 'Fix the cause', text: t`Convert where the text comes in, so every function downstream gets numbers:

\`\`\`python
raw = {"Psyche": "3.1e8", "Juno": "8.9e8", "Voyager 1": "2.5e10"}
probes = {name: float(d) for name, d in raw.items()}
\`\`\`

Converting inside \`light_time\` instead would also run, but would hide the fact that the data are text from every other function that uses them.` },
      { label: 'Sense check', text: t`It prints 17.2 min for Psyche, 49.5 min for Juno and 1389.9 min — about 23 hours — for Voyager 1. A command sent to Voyager 1 arrives the next day: sensible for a probe some 170 times farther from the Sun than Earth.` },
    ],
    answer: t`The distances were strings: convert them with \`float\` where they are read (line 11), not where the error surfaced (line 5).`,
  },
  practice: [
    mcq({
      id: 'read-bottom', difficulty: 1,
      prompt: t`A stage-by-stage $\Delta v$ budget stops with this traceback. Which line should you look at first?

\`\`\`
  line 14, in <module>
  line 9, in delta_v_budget
  line 4, in burn
ZeroDivisionError: division by zero
\`\`\``,
      choices: [
        'Line 4, inside `burn`: the last frame is where the division by zero happened; then ask which call handed it a zero',
        'Line 14: the first frame listed is where the error is',
        '`math.log` inside `burn`: library functions raise most errors',
        'None: the stage list must be empty, so the loop never ran',
      ],
      answer: 0,
      why: {
        1: 'The first frame is the oldest call, where the chain began. "Most recent call last": the failure is at the bottom.',
        2: 'A ZeroDivisionError comes from `/` or `%` with a zero divisor — Python’s own operator on your line, not a library function.',
        3: 'A loop that never runs raises nothing. The frames show that `burn` was called and was running line 4.',
      },
      hints: ['“Most recent call last”: which frame was running when the program stopped?', 'Start at the bottom frame; the frames above say how the program got there.'],
      teach: 'The bottom frame is where the error happened; the frames above it are the calls that led there, oldest at the top.',
      explain: t`Line 4 of \`burn\` divided by zero — probably \`m0 / mf\` with a final mass of zero. That line may be perfectly correct; the zero came from the caller, so the next stop is line 9 in \`delta_v_budget\`, which passed the stage's masses, and then the data built near line 14.`,
    }),
    match({
      id: 'types', difficulty: 2,
      prompt: t`Match each last line of a traceback to its most likely cause.`,
      left: [
        t`\`NameError: name 'thrust_N' is not defined\``,
        t`\`IndexError: list index out of range\``,
        t`\`KeyError: 'Isp'\``,
        t`\`ValueError: could not convert string to float: '12,5'\``,
        t`\`SyntaxError: '(' was never closed\``,
        t`\`TypeError: unsupported operand type(s) for *: 'NoneType' and 'float'\``,
      ],
      right: [
        'a name with no value yet, or misspelled',
        'a position past the end of a list',
        'a dict has no such key',
        'right type, but an unusable value',
        'the program could not be read',
        'a function that returned None',
      ],
      answer: [0, 1, 2, 3, 4, 5],
      hints: ['Each type is named for what went wrong: a name, an index, a key, a value, the syntax, a type.', 'None is what a function returns when it reaches its end without `return`.'],
      teach: 'The exception type alone usually narrows the search to one kind of mistake.',
      explain: t`NameError: no such name yet. IndexError: past the end of a sequence. KeyError: no such key in a dict. ValueError: right type, bad value (a decimal comma is not a float). SyntaxError: the program could not be read. A \`NoneType\` operand almost always means a function fell off its end without \`return\`.`,
    }),
    mcq({
      id: 'syntax-where', difficulty: 2,
      prompt: t`This program should print the Sun's Schwarzschild radius, $r_s = 2GM/c^2$. Nothing prints; instead:

\`\`\`python
G = 6.674e-11
c = 2.998e8
M = 1.989e30
rs = 2 * G * M / (c**2
print(rs)
\`\`\`

\`\`\`
  line 4
    rs = 2 * G * M / (c**2
                     ^
SyntaxError: '(' was never closed
\`\`\`

What fixes it?`,
      choices: [
        'Close the bracket on line 4: `rs = 2 * G * M / (c**2)`',
        'Fix line 5: a syntax error is always reported one line before the real mistake',
        'Write `c^2` instead of `c**2`',
        'Check the values of G, c and M: one of them is out of range',
      ],
      answer: 0,
      why: {
        1: 'Old versions of Python often complained a line late; Python 3.10 and later name the unclosed bracket itself — the caret sits under it.',
        2: '`^` is not a power in Python, and the power was never the problem: the bracket opened before `c` has no partner.',
        3: 'A SyntaxError is found while Python *reads* the program, before any line runs; no value has been computed or checked.',
      },
      hints: ['A SyntaxError means Python could not read the program at all.', 'The caret points at the bracket that was opened and never closed.'],
      teach: 'A SyntaxError stops the program before line 1 runs, and the caret marks where Python could not make sense of it.',
      explain: t`Add the closing bracket: \`(c**2)\`. Then it prints about $${Math.round(RS_SUN)}$ m — the Sun would have to be squeezed to a ball under 3 km across to become a black hole.`,
    }),
    mcq({
      id: 'not-callable', difficulty: 2,
      prompt: t`A sounding rocket's coasting height, $h = h_0 + v_0t - \tfrac12 g t^2$:

\`\`\`python
h0, v0, g, t = 20e3, 1200.0, 9.81, 30.0
h = h0 + v0*t - 0.5*g(t**2)
\`\`\`

\`\`\`
  line 2, in <module>
TypeError: 'float' object is not callable
\`\`\`

What went wrong?`,
      choices: [
        'Writing `g(…)` asks Python to *call* g as if it were a function; multiplication must be written out: `0.5*g*t**2`',
        '`g` was never given a value',
        '`t**2` is too large to store in a float',
        '`0.5` must be written `1/2`',
      ],
      answer: 0,
      why: {
        1: 'An unassigned name gives a NameError. The message says g *is* a float — it has a value.',
        2: '$30^2 = 900$; floats reach about $10^{308}$. A float that is too big gives inf or an OverflowError, never “not callable”.',
        3: 'Both are the same float, 0.5.',
      },
      hints: ['“Callable” means “can be called like a function, with brackets after it”.', 'In mathematics $g(t^2)$ can mean a product; in Python, a name followed by brackets is a function call.'],
      teach: 'Python never multiplies implicitly: a name followed by brackets is a call, and calling a number gives “object is not callable”.',
      explain: t`\`g(t**2)\` means “call g with argument \`t**2\`”, and a float cannot be called. Write \`0.5*g*t**2\`. With the fix, $h = 20\,000 + 36\,000 - 4414.5 = 51\,585.5$ m.`,
    }),
    num({
      id: 'index-off', difficulty: 2,
      gen(r) {
        const n = r.int(5, 9), a = r.float(8.6, 11.8, 0.1);
        const v = Array.from({ length: n }, (_, k) => (k * a + 0.01 * k * k).toFixed(1));
        return {
          prompt: t`A rocket's speed (m/s) is logged once a second. How many lines does this print before it stops with an error?

\`\`\`python
speeds = [${v.join(', ')}]
for i in range(len(speeds)):
    print(speeds[i + 1] - speeds[i])     # the change in speed each second
\`\`\``,
          answer: n - 1, tol: { rel: 0, abs: 0.1 },
          errors: [
            { value: n, feedback: t`\`range(len(speeds))\` does run ${n} times — but on the last pass \`i + 1\` is ${n}, past the end, and that line fails before it prints.` },
            { value: 0, feedback: 'Python runs line by line: everything before the failing line has already run and printed. The error stops the program only where it happens.' },
          ],
          hints: [t`The list has ${n} items, at indices 0 to ${n - 1}.`, t`Which value of \`i\` makes \`speeds[i + 1]\` ask for index ${n}?`],
          teach: 'A list of n items has indices 0 to n − 1, and an error stops a program only at the line where it happens — earlier output stays.',
          explain: t`For $i = 0$ to ${n - 2} it prints ${n - 1} differences. At $i = ${n - 1}$, \`speeds[${n}]\` does not exist: \`IndexError: list index out of range\`. Loop over \`range(len(speeds) - 1)\` — or let NumPy do it: \`np.diff(speeds)\`.`,
        };
      },
    }),
    code({
      id: 'fix-period', difficulty: 2,
      prompt: t`This should print the orbital period of Phobos, which circles **Mars** at $a = 9376$ km. Run it, read the error, and fix the program so that \`T_phobos\` holds the period in seconds, $T = 2\pi\sqrt{a^3/\mu}$.`,
      starter: t`import math
MU_EARTH = 398600.4418    # km³/s²
MU_MARS = 42828.37        # km³/s²

def period(a, mu):
    """Orbital period (s) for semi-major axis a (km) about a body with GM = mu."""
    return 2 * math.pi * math.sqrt(a**3 / mu)

T_phobos = period(9376)          # Phobos orbits Mars at a = 9376 km
print(T_phobos / 3600, "hours")
`,
      answer: t`import math
MU_EARTH = 398600.4418    # km³/s²
MU_MARS = 42828.37        # km³/s²

def period(a, mu):
    """Orbital period (s) for semi-major axis a (km) about a body with GM = mu."""
    return 2 * math.pi * math.sqrt(a**3 / mu)

T_phobos = period(9376, MU_MARS)
print(T_phobos / 3600, "hours")`,
      tests: [
        { name: t`the program runs and \`T_phobos\` is a number`, code: 'isinstance(T_phobos, float)' },
        { name: t`it uses Mars's $\mu$: about ${(T_PHOBOS / 3600).toFixed(2)} hours`, code: `abs(T_phobos - ${T_PHOBOS}) < 1` },
      ],
      hints: [t`The last line reads \`TypeError: period() missing 1 required positional argument: 'mu'\`.`, t`\`period\` takes two arguments; the call on line 9 gives one. Which body does Phobos orbit?`, t`\`T_phobos = period(9376, MU_MARS)\``],
      teach: 'A “missing required positional argument” TypeError means the call gave a function fewer inputs than its definition asks for.',
      explain: t`The call passed only \`a\`. With \`MU_MARS\` it prints ${(T_PHOBOS / 3600).toFixed(2)} hours — Phobos goes round faster than Mars turns. Passing \`MU_EARTH\` would also run, silently, and give ${(T_PHOBOS_EARTH / 3600).toFixed(2)} hours: the error message finds the missing argument, not the wrong one.`,
    }),
    mcq({
      id: 'silent-nan', difficulty: 3,
      prompt: t`Lorentz factors $\gamma = 1/\sqrt{1 - v^2/c^2}$ for three particle speeds. No error appears — only this:

\`\`\`python
import numpy as np
c = 299792.458                            # km/s
v = np.array([0.5, 0.9, 0.99]) * 3e8      # m/s
gamma = 1 / np.sqrt(1 - v**2 / c**2)
print(gamma)
\`\`\`

\`\`\`
[nan nan nan]
\`\`\``,
      choices: [
        'v is in m/s but c in km/s, so $1 - v^2/c^2$ is hugely negative; NumPy returns nan (“not a number”) for its square root instead of stopping',
        'NumPy cannot take the square root of an array: use math.sqrt',
        'Speeds this close to c are beyond what floating point can represent',
        'nan means the result was too large to store',
      ],
      answer: 0,
      why: {
        1: '`np.sqrt` works element by element. `math.sqrt` would actually have *raised* a ValueError on the first negative number — at least it would have been loud.',
        2: 'At $0.99c$, $\\gamma \\approx 7.09$: an ordinary float. The trouble is the size of $v^2/c^2$, about $10^6$ here.',
        3: 'A result too large to store is inf. nan comes from an operation with no answer, such as the square root of a negative number or 0/0.',
      },
      hints: ['Compute $v^2/c^2$ for the first speed by hand, with the numbers as written.', 'What does NumPy give for the square root of a negative float?'],
      teach: 'The worst bugs raise no error: NumPy turns impossible operations into nan or inf and carries on, so check results with np.isfinite and sense checks.',
      explain: t`$v/c = 1.5\times10^{8}/299\,792 \approx 500$, so $1 - v^2/c^2 \approx -2.5\times10^5$ and every root is nan. Use one unit: with \`c = 2.99792458e8\` (m/s) it prints $\gamma = ${GAM.join(',\ ')}$. On a desktop NumPy also prints \`RuntimeWarning: invalid value encountered in sqrt\` — **in this browser's NumPy, even that warning is missing**, because WebAssembly cannot raise floating-point flags. Only a check catches it: \`assert np.all(np.isfinite(gamma))\`.`,
    }),
    order({
      id: 'debug-order', difficulty: 2,
      prompt: t`Put these debugging steps in the order that works best on a traceback like this one.

\`\`\`
  line 31, in <module>
  line 22, in simulate
  line 8, in drag_force
ValueError: math domain error
\`\`\``,
      items: [
        'Read the last line: the exception type and its message',
        'Find the deepest frame in your own code (here line 8, in drag_force)',
        'Print the values used on that line just before it runs',
        'Trace the bad value up the stack to where it was made',
        'Fix the cause, then rerun the whole program',
      ],
      hints: ['Start from what Python tells you, then go to where, then to why.', 'You cannot trace a bad value before you know which value is bad.'],
      teach: 'Debugging goes from the message (what), to the frame (where), to the values (which), to their origin (why).',
      explain: t`The message says what kind of problem (here a function such as \`math.sqrt\` or \`math.log\` was given a value it cannot take). The deepest frame of yours says where; printing its inputs shows which value is wrong; walking up the frames finds who made it — perhaps a negative air density from a bad altitude. Then fix and rerun everything, because one fix often uncovers the next error.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-library', difficulty: 3, transfer: true,
      prompt: t`An ISS orbit integration fails before its first step. Most of the frames are inside SciPy:

\`\`\`python
mu = 398600.4418                       # km³/s²

def rhs(t, s):
    x, y, vx, vy = s
    r3 = (x * x + y * y) ** 1.5
    return [vx, vy, -mu * x / r3, -mu * y / r3]

s0 = [6778.0, 7.67]                    # km, km/s
sol = solve_ivp(rhs, (0, 5554), s0, rtol=1e-9)
\`\`\`

\`\`\`
  line 12, in <module>
  File "/lib/python3.14/site-packages/scipy/integrate/_ivp/ivp.py", line 626, in solve_ivp
    solver = method(fun, t0, y0, tf, vectorized=vectorized, **options)
  File "/lib/python3.14/site-packages/scipy/integrate/_ivp/rk.py", line 94, in __init__
    self.f = self.fun(self.t, self.y)
  ...
  line 7, in rhs
ValueError: not enough values to unpack (expected 4, got 2)
\`\`\`

(The listing starts at line 4 of the program; the imports are above it.) Where is the bug?`,
      choices: [
        'The initial state `s0` has 2 numbers, but `rhs` unpacks 4: give the full state, `[6778.0, 0.0, 0.0, 7.67]`',
        'In SciPy’s rk.py, line 94: most of the frames are there',
        '`rhs` should return 2 values, not 4',
        '`rtol=1e-9` is too tight, so the solver gives up',
      ],
      answer: 0,
      why: {
        1: 'Library frames show the path your call took through SciPy. Well-used library code is rarely the culprit: look for the last frame of *yours*.',
        2: 'The unpacking failed on the *input* `s`, which came from `s0`. The state has four components, so `rhs` must return four derivatives.',
        3: 'A tolerance cannot cause an unpacking error, and the solver has not taken a single step yet: it failed evaluating `rhs` at the start.',
      },
      hints: ['Find the last frame that is your code, and read the message.', '`x, y, vx, vy = s` needs `s` to hold 4 numbers. Where does the first `s` come from?', 'solve_ivp calls `rhs(t0, s0)` first.'],
      teach: 'When most frames are inside a library, the bug is still almost always in what you passed in: read the last frame of your own code and trace its inputs.',
      explain: t`SciPy evaluated \`rhs(0, s0)\` to start, and \`x, y, vx, vy = s\` found only two numbers. The state is $(x, y, v_x, v_y)$: start at $x = 6778$ km on the $x$ axis moving at 7.67 km/s along $y$: \`s0 = [6778.0, 0.0, 0.0, 7.67]\`. (The period, $2\pi\sqrt{6778^3/\mu} \approx 5554$ s, is the time span.)`,
    }),
    code({
      id: 'cp-radii', difficulty: 3, transfer: true,
      prompt: t`This program should tabulate Schwarzschild radii $r_s = 2GM/c^2$ (in km) for three black holes and print the one for M87*. It has **two** bugs; each shows itself only after the one before is fixed. Run, read, fix, and repeat until it prints.`,
      starter: t`G = 6.674e-11                # N m²/kg²
c = 2.998e8                  # m/s
M_sun = 1.989e30             # kg
masses = {"Sgr A*": 4.3e6, "M87*": 6.5e9, "GW150914 remnant": 62}   # solar masses

def schwarzschild_radius(M):
    return 2 * G * M / c**2

radii = {}
for name, m in masses.items:
    radii[name] = schwarzschild_radius(m * M_sun) / 1e3   # km
print(radii["M87"])
`,
      answer: t`G = 6.674e-11                # N m²/kg²
c = 2.998e8                  # m/s
M_sun = 1.989e30             # kg
masses = {"Sgr A*": 4.3e6, "M87*": 6.5e9, "GW150914 remnant": 62}   # solar masses

def schwarzschild_radius(M):
    return 2 * G * M / c**2

radii = {}
for name, m in masses.items():
    radii[name] = schwarzschild_radius(m * M_sun) / 1e3   # km
print(radii["M87*"])`,
      tests: [
        { name: 'all three black holes are in `radii`', code: 'len(radii) == 3' },
        { name: t`Sgr A*: about $${(rsKm(BH['Sgr A*']) / 1e6).toFixed(1)}$ million km`, code: `abs(radii["Sgr A*"] - ${rsKm(BH['Sgr A*'])}) < 1e3` },
        { name: t`the GW150914 remnant: about ${Math.round(rsKm(62))} km`, code: `abs(radii["GW150914 remnant"] - ${rsKm(62)}) < 0.1` },
        { name: 'the program prints the radius of M87*', code: `"${String(rsKm(BH['M87*'])).slice(0, 5)}" in _stdout` },
      ],
      hints: [
        t`The first error: \`TypeError: 'builtin_function_or_method' object is not iterable\` on line 10. \`masses.items\` names the method; it does not call it.`,
        t`Add the brackets: \`masses.items()\`. Then run again and read the second error.`,
        t`\`KeyError: 'M87'\`: the key is spelled \`"M87*"\`, with the asterisk.`,
      ],
      teach: 'Fixing one error often reveals the next: run, read the bottom line, fix, and run again until it is clean.',
      explain: t`Bug 1: \`masses.items\` without brackets is the method itself, which cannot be looped over — call it, \`masses.items()\`. Bug 2: \`KeyError: 'M87'\` — the key is \`"M87*"\`. M87*'s radius is about $${(rsKm(BH['M87*']) / 1e9).toFixed(1)}\times10^{9}$ km, some ${Math.round(rsKm(BH['M87*']) / 1.496e8)} times the Earth–Sun distance; the remnant of the first black-hole merger LIGO heard has a horizon radius of ${Math.round(rsKm(62))} km.`,
    }),
    mcq({
      id: 'cp-indent', difficulty: 2,
      prompt: t`A function for a thruster's specific impulse, $I_{sp} = F/(\dot m g_0)$, will not even start:

\`\`\`python
def isp(F, mdot, g0=9.80665):
    ve = F / mdot
     return ve / g0
\`\`\`

\`\`\`
  line 3
    return ve / g0
IndentationError: unexpected indent
\`\`\``,
      choices: [
        'Line 3 is indented one space more than line 2; the lines of one block must line up exactly',
        '`return` cannot be used in a function with a default argument',
        'Line 2 must be indented further than line 3',
        'Line 1 needs a colon',
      ],
      answer: 0,
      why: {
        1: 'Defaults and `return` go together all the time; the message is about indentation.',
        2: 'Then line 3 would be the odd one out instead. Every statement in a block needs the same indentation.',
        3: t`Line 1 ends with a colon already; a missing one would give \`SyntaxError: expected ':'\`.`,
      },
      hints: ['Indentation is how Python knows which lines belong to the function.', 'Count the spaces before `ve` and before `return`.'],
      teach: 'Python reads a block from its indentation, so every line of one block must start in the same column — four spaces is the convention.',
      explain: t`\`ve = F / mdot\` has four spaces, \`return\` five. Python saw an indent where no new block begins. Line them up at four spaces. (An IndentationError is a kind of SyntaxError: nothing runs until it is fixed.)`,
    }),
  ],
  sources: [
    { label: 'The Python Tutorial, §8: Errors and exceptions', url: 'https://docs.python.org/3/tutorial/errors.html' },
    { label: 'Python documentation: built-in exceptions', url: 'https://docs.python.org/3/library/exceptions.html' },
    { label: 'Software Carpentry, Programming with Python: Errors and exceptions', url: 'https://swcarpentry.github.io/python-novice-inflammation/07-errors.html' },
  ],
});
