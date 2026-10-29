// Functions — parameters, return, defaults and keywords, multiple returns,
// scope, and the mutable default argument; the rocket equation as a function.
import { lesson, mcq, num, code } from '../../src/core/content.js';

const t = String.raw;
const G0 = 9.80665;
const GM = 3.986004418e14;

// LEO (300 km) to GEO by a Hohmann transfer (worked example)
const R1 = 6678e3, R2 = 42164e3;
const DV1 = Math.sqrt(GM / R1) * (Math.sqrt((2 * R2) / (R1 + R2)) - 1);
const DV2 = Math.sqrt(GM / R2) * (1 - Math.sqrt((2 * R1) / (R1 + R2)));
const RE = 6371e3, A_T = (R1 + R2) / 2 / RE, E_T = (R2 - R1) / (R2 + R1);

// propellant for a 3.9 km/s burn (practice)
const MP = 3000 * (Math.exp(3900 / (450 * G0)) - 1);
const period = (L, g = 9.81) => 2 * Math.PI * Math.sqrt(L / g);
const circ = (r, gm) => [Math.sqrt(gm / r), 2 * Math.PI * Math.sqrt(r ** 3 / gm)];
const GM_MARS = 4.282837e13;

const defaultCode = ['def log_reading(value, log=[]):', '    log.append(value)', '    return log', '', 'a = log_reading(1.5)', 'b = log_reading(2.0)', 'print(b)'];

export default lesson({
  id: 'prog.P1.3',
  title: 'Functions',
  minutes: 10, difficulty: 2,
  intro: t`A function packages a formula so you can **name it, test it once and call it everywhere**. Its parameters are the inputs, \`return\` hands back the result, defaults fill in arguments you leave out, and the names it creates inside live only while it runs. The rocket equation is the model citizen:

$$\Delta v = I_{\text{sp}}\, g_0 \ln\frac{m_0}{m_f}$$

Written as \`def delta_v(isp, m0, mf, g0=9.80665):\`, it can be checked against a known case, then trusted inside a mission planner, a staging optimizer or a plot.`,
  symbols: [
    { tex: t`\Delta v`, text: 'the velocity change the stage can give, in m/s' },
    { tex: t`I_{\text{sp}}`, text: 'specific impulse: how efficiently the engine uses propellant, in seconds' },
    { tex: 'g_0', text: 'standard gravity, 9.80665 m/s², a fixed conversion constant (not local gravity) — a natural default argument' },
    { tex: 'm_0', text: 'mass at ignition, with all the propellant, in kg' },
    { tex: 'm_f', text: 'mass at burnout, when the propellant is gone, in kg' },
    { tex: t`\ln`, text: 'the natural logarithm — `math.log` in Python' },
  ],
  why: 'Every later lesson hands functions to other functions — an integrator, a root finder, an ODE solver — so a clean function with no hidden state is the unit of scientific code.',
  visual: {
    type: 'code-runner',
    title: 'The rocket equation as a function',
    lead: t`Press **Run**. One definition, called three ways: by position, by keyword, and in a loop that draws the curves. The docstring is the function's built-in manual.`,
    tasks: ['Add a third curve for a cold-gas thruster (Isp ≈ 70 s).', 'Call `delta_v(311, 549_000, 140_000, g0=1.0)` and explain the number you get.', 'Delete the `return` keyword and run it again: what do the prints show?'],
    params: {
      rows: 25,
      code: t`import math
import atlas.plot as plt

def delta_v(isp, m0, mf, g0=9.80665):
    """Velocity change of a rocket stage, in m/s.

    isp: specific impulse (s); m0, mf: mass at ignition and burnout (kg).
    """
    return isp * g0 * math.log(m0 / mf)

print(delta_v.__doc__)
print(delta_v(311, 549_000, 140_000))              # by position
print(delta_v(isp=450, m0=549_000, mf=140_000))    # by keyword

ratios = [1 + 0.25 * k for k in range(37)]         # m0/mf from 1 to 10
for isp in [311, 450]:
    curve = [delta_v(isp, r, 1.0) / 1000 for r in ratios]
    plt.plot(ratios, curve, label=f"Isp {isp} s")
plt.xlabel("mass ratio m0/mf")
plt.ylabel("Δv (km/s)")
plt.legend()
plt.show()`,
    },
    caption: 'Ideal rocket equation: no gravity losses, no drag, constant specific impulse. 311 s and 450 s are typical of kerosene and hydrogen engines in vacuum.',
  },
  example: {
    prompt: t`A Hohmann transfer takes a satellite from a circular orbit of radius $r_1$ to one of radius $r_2$ with two burns. Write a function that returns **both** burns, and use it for a 300 km parking orbit ($r_1 = 6678$ km) to geostationary orbit ($r_2 = 42\,164$ km), with $GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$.

$$\Delta v_1 = \sqrt{\tfrac{GM}{r_1}}\left(\sqrt{\tfrac{2r_2}{r_1 + r_2}} - 1\right), \qquad \Delta v_2 = \sqrt{\tfrac{GM}{r_2}}\left(1 - \sqrt{\tfrac{2r_1}{r_1 + r_2}}\right)$$`,
    visual: {
      type: 'graph',
      params: { x: [-7.6, 7.6], y: [-7.2, 7.2], aspect: 'square', equal: true, xlabel: 'x (Earth radii)', ylabel: '', axes: false, grid: false,
        curves: [
          { polar: '1', theta: [0, '2pi'], color: 'teal', width: 2 },
          { polar: `${R1 / RE}`, theta: [0, '2pi'], color: 'accent', width: 2.4 },
          { polar: `${R2 / RE}`, theta: [0, '2pi'], color: 'violet', width: 1.6 },
          { polar: `${A_T * (1 - E_T ** 2)}/(1 + ${E_T}*cos(theta))`, theta: [0, 'pi'], color: 'gold', width: 2.2, dash: true }],
        points: [{ x: R1 / RE, y: 0, label: 'Δv₁', color: 'gold' }, { x: -R2 / RE, y: 0, label: 'Δv₂', color: 'gold', labelDx: 8, labelDy: -12 },
          { x: 0, y: -R2 / RE, r: 0.1, label: 'geostationary orbit', color: 'violet', labelAlign: 'center', labelDx: 0, labelDy: 14 }] },
      caption: 'To scale: Earth (teal) with the parking orbit hugging it (blue), the transfer half-ellipse (dashed gold) and the target orbit (violet). Both burns point along the direction of motion and are treated as instantaneous.',
    },
    steps: [
      { label: 'Name the inputs', text: t`The two radii change from problem to problem; $GM$ almost never does, so it becomes a **default argument** that a Mars mission can still override.

\`\`\`python
import math

def hohmann(r1, r2, GM=3.986004418e14):
    """The two burns (m/s) of a Hohmann transfer from radius r1 to r2 (m)."""
\`\`\`` },
      { label: 'Return a tuple', text: t`A function can return several values at once: Python packs them into a tuple.

\`\`\`python
    dv1 = math.sqrt(GM / r1) * (math.sqrt(2 * r2 / (r1 + r2)) - 1)
    dv2 = math.sqrt(GM / r2) * (1 - math.sqrt(2 * r1 / (r1 + r2)))
    return dv1, dv2
\`\`\`` },
      { label: 'Unpack at the call', text: t`Two names on the left unpack the tuple. Convert units at the call, not inside the function, so the function stays in SI.

\`\`\`python
dv1, dv2 = hohmann(6678e3, 42164e3)
print(f"{dv1:.0f} m/s + {dv2:.0f} m/s = {dv1 + dv2:.0f} m/s")
\`\`\`` },
      { label: 'Sense check', text: t`It prints \`${DV1.toFixed(0)} m/s + ${DV2.toFixed(0)} m/s = ${(DV1 + DV2).toFixed(0)} m/s\` — the textbook 3.9 km/s from low orbit to GEO. A test worth keeping: \`hohmann(r, r)\` must return \`(0.0, 0.0)\`, since no transfer needs no burn.` },
    ],
    answer: t`$\Delta v_1 \approx ${(DV1 / 1000).toFixed(2)}$ km/s and $\Delta v_2 \approx ${(DV2 / 1000).toFixed(2)}$ km/s, ${((DV1 + DV2) / 1000).toFixed(2)} km/s in all.`,
  },
  practice: [
    mcq({
      id: 'none-return', difficulty: 1,
      prompt: t`What happens when this runs?

\`\`\`python
import math

def disk_area(r):
    math.pi * r**2

print(2 * disk_area(3.0))
\`\`\``,
      choices: ['A `TypeError`: the function returned `None`, which cannot be multiplied', 'It prints `56.548667764616276`', 'It prints `0`', 'It prints `None`'],
      answer: 0,
      why: {
        1: 'That needs `return math.pi * r**2`. The line computes the area and throws it away.',
        2: 'A function without `return` gives back `None`, not zero.',
        3: '`print(disk_area(3.0))` would print `None`; but here `None` is multiplied by 2 first, and that fails.',
      },
      hints: ['What does a Python function give back if it never reaches a `return`?', 'Then what is `2 * None`?'],
      teach: 'A function with no `return` returns `None`, and the error usually appears later, where the result is used.',
      explain: t`The body computes $\pi r^2$ and discards it, so \`disk_area(3.0)\` is \`None\` and \`2 * None\` raises \`TypeError: unsupported operand type(s) for *: 'int' and 'NoneType'\`. The fix is one word: \`return\`.`,
    }),
    code({
      id: 'propellant', difficulty: 2,
      prompt: t`Invert the rocket equation: the propellant a stage needs for a burn is $m_p = m_{\text{dry}}\left(e^{\Delta v/(I_{\text{sp}} g_0)} - 1\right)$, where $m_{\text{dry}}$ is everything that is not propellant. Write \`propellant_mass(dv, isp, m_dry, g0=9.80665)\` that returns $m_p$ in kg.`,
      starter: t`import math

def propellant_mass(dv, isp, m_dry, g0=9.80665):
    pass
`,
      answer: t`import math

def propellant_mass(dv, isp, m_dry, g0=9.80665):
    return m_dry * (math.exp(dv / (isp * g0)) - 1)

print(propellant_mass(3900, 450, 3000))`,
      tests: [
        { name: t`3.9 km/s at $I_{\text{sp}} = 450$ s for a 3000 kg dry stage needs ${MP.toFixed(0)} kg`, code: `abs(propellant_mass(3900, 450, 3000) - ${MP}) < 1e-6` },
        { name: 'no burn, no propellant', code: 'propellant_mass(0, 300, 1000) == 0' },
        { name: t`\`g0\` can be passed by keyword (here $g_0 = 1$, as if $I_{\text{sp}}$ were an exhaust speed)`, code: `abs(propellant_mass(3000, 3000, 1000, g0=1) - ${1000 * (Math.E - 1)}) < 1e-6` },
      ],
      hints: ['`math.exp(x)` is $e^x$.', 'Bracket the denominator: `dv / (isp * g0)`, then `return m_dry * (math.exp(...) - 1)`.'],
      teach: 'A default argument makes the common case short while keeping the constant visible and overridable.',
      explain: t`\`return m_dry * (math.exp(dv / (isp * g0)) - 1)\`. Here $\Delta v/(I_{\text{sp}} g_0) = 0.884$, so the stage needs $e^{0.884} - 1 = 1.42$ times its dry mass in propellant: ${MP.toFixed(0)} kg. Writing \`dv / isp * g0\` would multiply by $g_0$ instead of dividing.`,
    }),
    mcq({
      id: 'mutable-default', difficulty: 3,
      prompt: t`What does the last line print?

\`\`\`python
${defaultCode.join('\n')}
\`\`\``,
      visual: {
        type: 'py-memory',
        params: { steps: [{
          frames: [{ name: 'Global frame', vars: [['log_reading', '@F'], ['a', '@L']] }],
          objects: { F: { type: 'record', label: 'function log_reading(value, log=…)', fields: [['default log', '@L']] }, L: { type: 'list', items: ['1.5'] } } }] },
        caption: 'Memory after the first call. The default list was made once, when `def` ran, and is stored on the function object (CPython keeps it in `log_reading.__defaults__`).',
      },
      choices: ['`[1.5, 2.0]`', '`[2.0]`', '`[1.5]`', '`[[1.5], 2.0]`'],
      answer: 0,
      why: {
        1: 'That assumes a fresh empty list on every call. The default is made **once**, when `def` runs, and reused.',
        2: 'That is `a` only if the second call made its own list — but it appended to the same one, and `a` sees the change too.',
        3: '`append` adds the single value 2.0 to the list; nothing is nested.',
      },
      hints: ['When is the default `[]` created — at each call, or once when `def` runs?', 'Both calls append to the same list object, the one in the picture.'],
      teach: 'A default value is evaluated once, when the function is defined, so a mutable default (a list or dict) is shared by every call.',
      explain: t`Both calls append to the one default list, so \`b\` is \`[1.5, 2.0]\` — and \`a\` is the *same* list, so it shows \`[1.5, 2.0]\` too. The standard fix: \`def log_reading(value, log=None):\` then \`if log is None: log = []\`.`,
    }),
    num({
      id: 'scope', difficulty: 2,
      gen(r) {
        const m = r.int(5, 20);
        const w = m * 1.62, ans = 9.81 * m + w;
        return {
          prompt: t`What number does this print?

\`\`\`python
g = 9.81             # m/s², Earth

def weight(m):
    g = 1.62         # m/s², the Moon
    return m * g

w = weight(${m})
print(g * ${m} + w)
\`\`\``,
          answer: ans, tol: { rel: 1e-6 },
          errors: [
            { value: 2 * w, feedback: t`The \`g = 1.62\` inside the function makes a *new, local* name. The global \`g\` is still 9.81 after the call.` },
            { value: 2 * 9.81 * m, feedback: t`Inside the function, the local \`g = 1.62\` is the one used: \`weight(${m})\` is ${w.toFixed(2)} N, not ${(9.81 * m).toFixed(2)} N.` },
          ],
          hints: ['Assigning to a name inside a function creates a local name that disappears when the function returns.', t`\`weight(${m})\` uses the Moon's g; the \`print\` line uses the global g.`],
          teach: 'An assignment inside a function creates a local variable; it never changes a global of the same name (unless you declare it `global`).',
          explain: t`\`weight(${m})\` $= ${m}\times1.62 = ${w.toFixed(2)}$ N, using its local \`g\`. Outside, \`g\` is still 9.81, so the sum is $${(9.81 * m).toFixed(2)} + ${w.toFixed(2)} = ${ans.toFixed(2)}$.`,
        };
      },
    }),
    code({
      id: 'pendulum-kwargs', difficulty: 2,
      prompt: t`Write \`period(L, g=9.81)\` returning a pendulum's small-angle period $T = 2\pi\sqrt{L/g}$ in seconds. Then set \`T_earth\` to the period of a 2.0 m pendulum on Earth and \`T_moon\` to the same pendulum on the Moon ($g = 1.62\ \text{m/s}^2$), passing \`g\` by keyword.`,
      starter: t`import math

def period(L, g=9.81):
    pass

T_earth = None
T_moon = None
`,
      answer: t`import math

def period(L, g=9.81):
    return 2 * math.pi * math.sqrt(L / g)

T_earth = period(2.0)
T_moon = period(2.0, g=1.62)
print(T_earth, T_moon)`,
      tests: [
        { name: t`\`period(2.0)\` uses Earth's g: ${period(2).toFixed(3)} s`, code: `abs(period(2.0) - ${period(2)}) < 1e-9` },
        { name: t`\`T_earth\` is ${period(2).toFixed(3)} s`, code: `abs(T_earth - ${period(2)}) < 1e-9` },
        { name: t`\`T_moon\` is ${period(2, 1.62).toFixed(3)} s`, code: `abs(T_moon - ${period(2, 1.62)}) < 1e-9` },
      ],
      hints: ['`return 2 * math.pi * math.sqrt(L / g)`.', '`T_moon = period(2.0, g=1.62)` — the keyword makes the call read like the physics.'],
      teach: 'A keyword argument names what it sets, so `period(2.0, g=1.62)` cannot be misread as a length of 1.62 m.',
      explain: t`$T_\oplus = ${period(2).toFixed(3)}$ s and $T_\text{Moon} = ${period(2, 1.62).toFixed(3)}$ s: the Moon's pendulum is $\sqrt{9.81/1.62} = ${Math.sqrt(9.81 / 1.62).toFixed(2)}$ times slower. Small-angle approximation: at large swings the real period is longer.`,
    }),
    mcq({
      id: 'return-tuple', difficulty: 2,
      prompt: t`What does this print?

\`\`\`python
def extremes(readings):
    return min(readings), max(readings)

result = extremes([3.2, 1.8, 2.7])
print(result)
\`\`\``,
      choices: ['`(1.8, 3.2)`', '`1.8`', '`[1.8, 3.2]`', 'An error: a function can only return one value'],
      answer: 0,
      why: {
        1: 'Python does not drop the second value: `return a, b` returns one object, a tuple holding both.',
        2: 'Commas make a tuple, written with round brackets; a list would need `return [lo, hi]`.',
        3: 'Returning several values separated by commas is legal and common — they travel as one tuple.',
      },
      hints: ['What object does the expression `a, b` make?', '`return lo, hi` returns the tuple `(lo, hi)`; one name on the left receives the whole tuple.'],
      teach: '`return a, b` returns one tuple; unpack it with two names (`lo, hi = extremes(x)`) or keep it whole.',
      explain: t`\`result\` is the tuple \`(1.8, 3.2)\`. Writing \`lo, hi = extremes([3.2, 1.8, 2.7])\` would unpack it into two names.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-orbit', difficulty: 2, transfer: true,
      prompt: t`Write \`circular_orbit(r, GM=3.986004418e14)\` that returns **two** values: the speed $v = \sqrt{GM/r}$ (m/s) and the period $T = 2\pi r/v$ (s) of a circular orbit of radius $r$ (m). The default is Earth's $GM$; the tests also call it for Mars ($GM = 4.282837\times10^{13}\ \text{m}^3/\text{s}^2$).`,
      starter: t`import math

def circular_orbit(r, GM=3.986004418e14):
    pass
`,
      answer: t`import math

def circular_orbit(r, GM=3.986004418e14):
    v = math.sqrt(GM / r)
    T = 2 * math.pi * r / v
    return v, T

v, T = circular_orbit(6.778e6)
print(f"ISS: {v:.0f} m/s, {T / 60:.1f} min")`,
      tests: [
        { name: t`the ISS's orbit ($r = 6778$ km): ${circ(6.778e6, GM)[0].toFixed(0)} m/s`, code: `abs(circular_orbit(6.778e6)[0] - ${circ(6.778e6, GM)[0]}) < 1e-6` },
        { name: t`…and a period of ${(circ(6.778e6, GM)[1] / 60).toFixed(1)} min`, code: `abs(circular_orbit(6.778e6)[1] - ${circ(6.778e6, GM)[1]}) < 1e-6` },
        { name: t`400 km above Mars, with \`GM\` given by keyword`, code: `all(abs(a - b) < 1e-6 for a, b in zip(circular_orbit(3.7962e6, GM=4.282837e13), (${circ(3.7962e6, GM_MARS).join(', ')})))` },
      ],
      hints: ['Compute `v` first, then `T` from it.', '`return v, T` — two values, one tuple.'],
      teach: 'Returning a tuple lets one function hand back several related results, unpacked with `v, T = circular_orbit(r)`.',
      explain: t`\`v = math.sqrt(GM / r)\`, \`T = 2 * math.pi * r / v\`, \`return v, T\`. For the ISS that is ${circ(6.778e6, GM)[0].toFixed(0)} m/s and ${(circ(6.778e6, GM)[1] / 60).toFixed(1)} minutes; 400 km above Mars, ${circ(3.7962e6, GM_MARS)[0].toFixed(0)} m/s and ${(circ(3.7962e6, GM_MARS)[1] / 60).toFixed(0)} minutes.`,
    }),
    mcq({
      id: 'cp-default-fix', difficulty: 3,
      prompt: t`This logger shares one list between all its calls:

\`\`\`python
def log_reading(value, log=[]):
    log.append(value)
    return log
\`\`\`

Which version gives every call that omits \`log\` a **fresh** empty list?`,
      choices: [
        '`def log_reading(value, log=None):` and then `if log is None: log = []` inside',
        '`def log_reading(value, log=[]):` and then `log = log` inside',
        '`def log_reading(value, log=list):` and then `log.append(value)` inside',
        '`def log_reading(value, log=[]):` and then `del log` before `return`',
      ],
      answer: 0,
      why: {
        1: 'Rebinding a name to itself changes nothing: it is still the one list made when `def` ran.',
        2: '`list` is the list *type*, not an empty list; `list.append(value)` raises a `TypeError`.',
        3: '`del log` removes the local name only; the function object still holds its default list, and the next call reuses it.',
      },
      hints: ['The default expression runs once. So the default must be something that never changes — and the new list must be made inside the body, at call time.', '`None` is the usual “nothing given” marker.'],
      teach: 'Use `None` as the default and create the mutable object inside the function, so each call makes its own.',
      explain: t`The body runs at every call, so \`if log is None: log = []\` makes a new list each time, while a caller who passes a list still gets it appended to. This idiom is everywhere in the standard library.`,
    }),
    mcq({
      id: 'cp-call-order', difficulty: 2,
      prompt: t`With \`def delta_v(isp, m0, mf, g0=9.80665):\`, what happens here?

\`\`\`python
dv = delta_v(isp=311, 549000, 140000)
\`\`\``,
      choices: ['A `SyntaxError`: a positional argument cannot follow a keyword argument', 'It works: `isp` is 311 and the other two fill `m0` and `mf`', 'A `TypeError`: `isp` is given twice', 'It works, but `549000` goes to `g0`'],
      answer: 0,
      why: {
        1: 'Python refuses to guess: once an argument is named, every later one must be named too.',
        2: 'The program never runs at all — this is caught when the code is read, before any call happens.',
        3: 'Positional arguments always fill parameters from the left; Python does not skip to `g0`.',
      },
      hints: ['Positional arguments must all come before keyword arguments.', 'The error is found before the program runs, when Python reads the code.'],
      teach: 'In a call, positional arguments come first and keyword arguments after them.',
      explain: t`\`SyntaxError: positional argument follows keyword argument\`. Write \`delta_v(311, 549000, 140000)\` or name them all: \`delta_v(isp=311, m0=549000, mf=140000)\`.`,
    }),
  ],
  sources: [
    { label: 'The Python Tutorial, §4.8: Defining functions (and the default-value warning)', url: 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions' },
    { label: 'Tsiolkovsky rocket equation (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Tsiolkovsky_rocket_equation' },
    { label: 'Hohmann transfer orbit (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Hohmann_transfer_orbit' },
  ],
});
