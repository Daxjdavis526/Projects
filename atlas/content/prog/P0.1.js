// Running Python here: the first lesson of Scientific Programming, and the
// model for every lesson with coding exercises.
import { lesson, mcq, num, order, code } from '../../src/core/content.js';

const t = String.raw;

export default lesson({
  id: 'prog.P0.1',
  title: 'Running Python here: the code lab',
  minutes: 8, difficulty: 1,
  intro: t`Every program in this course runs **right here, in your browser**: real Python 3.14, compiled to WebAssembly, with NumPy, SciPy, Matplotlib and SymPy available when you import them. Nothing is installed and nothing is sent anywhere.

A program is a list of instructions run **top to bottom**. Python does arithmetic the way a calculator does, with two traps worth meeting on day one: \`**\` is the power operator, and \`/\` always gives a decimal, while \`//\` divides and throws away the remainder.`,
  symbols: [
    { tex: t`\texttt{=}`, text: 'assignment: store the value on the right under the name on the left (it is not an equation)' },
    { tex: t`\texttt{**}`, text: 'power: `2 ** 10` is $2^{10} = 1024$' },
    { tex: t`\texttt{/}`, text: 'true division: always a decimal (`7 / 2` is `3.5`)' },
    { tex: t`\texttt{//}`, text: 'floor division: divide and round down (`7 // 2` is `3`)' },
    { tex: t`\texttt{\%}`, text: 'remainder: what `//` leaves over (`7 % 2` is `1`)' },
    { tex: t`\texttt{print}`, text: 'shows values on the output; separate several with commas' },
  ],
  why: 'Every numerical method in physics — from integrating an orbit to fitting data — will be a few dozen lines like these.',
  visual: {
    type: 'code-runner',
    title: 'Your first program',
    lead: t`Press **Run**. Then change the height and run it again — the program is yours to edit. **Reset the code** puts it back.`,
    tasks: ['Change h to 1000 m and run it.', 'Change g to 1.62 m/s² (the Moon) and compare.', 'Delete a closing bracket and read the error message.'],
    params: {
      code: t`import math

# How long does a dropped tool take to fall, and how fast does it land?
h = 100.0          # height, m
g = 9.8            # gravitational acceleration, m/s²

t = math.sqrt(2 * h / g)     # from h = ½ g t²
v = g * t

print("fall time:", round(t, 2), "s")
print(f"impact speed: {v:.1f} m/s  ({v * 3.6:.0f} km/h)")`,
    },
    caption: 'No air resistance: a real tool falling 100 m would land noticeably slower.',
  },
  example: {
    prompt: t`Write a program that prints Earth's escape speed $v_\text{esc} = \sqrt{2GM/R}$ in km/s, with $G = 6.674\times10^{-11}\ \text{N m}^2/\text{kg}^2$, $M = 5.972\times10^{24}$ kg and $R = 6.371\times10^{6}$ m.`,
    steps: [
      { label: 'Name the inputs', text: t`Give every quantity a name and a unit comment. Python writes $6.674\times10^{-11}$ as \`6.674e-11\`.

\`\`\`python
G = 6.674e-11      # N m²/kg²
M = 5.972e24       # kg
R = 6.371e6        # m
\`\`\`` },
      { label: 'Compute', text: t`Square roots live in the \`math\` module, so import it at the top. Work in SI units throughout.

\`\`\`python
import math
v = math.sqrt(2 * G * M / R)   # m/s
\`\`\`` },
      { label: 'Report', text: t`Convert only when printing, and round to a sensible precision.

\`\`\`python
print(f"escape speed: {v / 1000:.2f} km/s")
\`\`\`` },
      { label: 'Sense check', text: t`It prints \`escape speed: 11.19 km/s\` — the textbook value. A wrong power of ten in \`R\` would have given 3.5 or 354 km/s, which a sense check catches at once.` },
    ],
    answer: t`$v_\text{esc} \approx 11.19$ km/s.`,
  },
  practice: [
    mcq({
      id: 'divisions', difficulty: 1,
      prompt: t`What does this print?

\`\`\`python
print(7 // 2, 7 % 2, 7 / 2)
\`\`\``,
      choices: ['`3 1 3.5`', '`3.5 1 3.5`', '`3 1 3`', '`4 1 3.5`'],
      answer: 0,
      why: { 1: '`//` is floor division: it throws the fractional part away.', 2: '`/` is true division in Python 3: it always gives a decimal.', 3: '`//` rounds *down* (toward minus infinity), so 3.5 becomes 3, not 4.' },
      hints: ['Take the three operators one at a time.', '`//` divides and rounds down; `%` is the remainder; `/` always gives a decimal.'],
      teach: '`//` gives the whole number of times one number goes into another, `%` the remainder, and `/` the exact quotient.',
      explain: '7 // 2 is 3 (2 goes into 7 three whole times), 7 % 2 is the remainder 1, and 7 / 2 is 3.5.',
    }),
    mcq({
      id: 'caret', difficulty: 2,
      prompt: t`A student wants $2^{10}$ and writes \`print(2 ^ 10)\`. What appears?`,
      choices: ['`8`', '`1024`', '`20`', 'An error message'],
      answer: 0,
      why: { 1: 'That is what `2 ** 10` prints. In Python `^` is not a power.', 2: 'Nothing here multiplies.', 3: '`^` is a valid operator, so Python runs it without complaint — which is what makes the slip dangerous.' },
      hints: ['In Python, the power operator is `**`. So `^` must mean something else.', '`^` is bitwise XOR: it compares the binary digits of 2 (0010) and 10 (1010).'],
      teach: 'Python writes powers with `**`; `^` is a different operator that silently gives a wrong number.',
      explain: '`^` is exclusive-or on the binary digits: 0010 XOR 1010 = 1000, which is 8. Write `2 ** 10` for 1024.',
    }),
    code({
      id: 'fall-speed', difficulty: 1,
      prompt: t`A body falls from rest for $t = 3.2$ s with $g = 9.8\ \text{m/s}^2$. Set \`v\` to its speed in m/s ($v = gt$) and print it.`,
      starter: t`g = 9.8
t = 3.2
# set v, then print it
`,
      answer: t`g = 9.8
t = 3.2
v = g * t
print(v)`,
      tests: [
        { name: 'v is g × t (31.36 m/s)', code: 'abs(v - 31.36) < 1e-9' },
        { name: 'the program prints v', code: '"31.36" in _stdout' },
      ],
      hints: ['Multiply the two names: `v = g * t`.', 'Then `print(v)`.'],
      teach: 'Assignment stores a computed value under a name; print shows it.',
      explain: t`\`v = g * t\` stores $9.8 \times 3.2 = 31.36$ under the name \`v\`, and \`print(v)\` shows it.`,
    }),
    code({
      id: 'ke-function', difficulty: 2,
      prompt: t`Write a function \`kinetic_energy(m, v)\` that **returns** the kinetic energy $\tfrac12 m v^2$ (in joules, for $m$ in kg and $v$ in m/s).`,
      starter: t`def kinetic_energy(m, v):
    # return ½ m v²
    pass
`,
      answer: t`def kinetic_energy(m, v):
    return 0.5 * m * v**2`,
      tests: [
        { name: 'kinetic_energy(2, 3) is 9 J', code: 'abs(kinetic_energy(2, 3) - 9) < 1e-12' },
        { name: 'a 1500 kg car at 20 m/s has 300 kJ', code: 'abs(kinetic_energy(1500, 20) - 3e5) < 1e-6' },
        { name: 'no speed, no kinetic energy', code: 'kinetic_energy(5, 0) == 0' },
      ],
      hints: ['Replace `pass` with a `return` line.', 'Square with `**`: `return 0.5 * m * v**2`.'],
      teach: 'A function packages a formula: its parameters are the inputs and `return` hands back the result.',
      explain: t`\`return 0.5 * m * v**2\`. Without \`return\`, a Python function gives back \`None\` — which is why the unfinished starter fails every test.`,
    }),
    order({
      id: 'pendulum-order', difficulty: 2,
      prompt: t`Put these lines in an order that prints the period $T = 2\pi\sqrt{L/g}$ of a 2.0 m pendulum.`,
      items: ['`import math`', '`L = 2.0`', '`g = 9.8`', '`T = 2 * math.pi * math.sqrt(L / g)`', '`print(T)`'],
      hints: ['A name must be given a value before any line uses it.', 'Imports go first; the formula needs L and g; print comes last.'],
      teach: 'Python runs top to bottom, so every name must be defined before the line that uses it.',
      explain: 'The import, then the inputs (L and g in either order), then the formula, then print. Using L before defining it gives a NameError.',
    }),
    num({
      id: 'loop-sum', difficulty: 2,
      gen(r) {
        const n = r.int(3, 7);
        const total = (n * (n + 1) * (2 * n + 1)) / 6;
        return {
          prompt: t`What number does this program print?

\`\`\`python
total = 0
for k in range(1, ${n + 1}):
    total += k ** 2
print(total)
\`\`\``,
          answer: total, tol: { rel: 1e-9 },
          errors: [{ value: total + (n + 1) ** 2, feedback: `\`range(1, ${n + 1})\` stops *before* ${n + 1}: the last k is ${n}.` }, { value: (n * (n + 1)) / 2, feedback: 'That is the sum of k, not of k squared.' }],
          hints: [t`\`range(1, ${n + 1})\` gives k = 1, 2, …, ${n} — it stops before ${n + 1}.`, t`Add up $1^2 + 2^2 + \dots + ${n}^2$.`],
          teach: '`range(a, b)` runs from a up to but not including b.',
          explain: t`$1^2 + 2^2 + \dots + ${n}^2 = ${total}$. \`total += k ** 2\` adds each square in turn.`,
          solution: t`The closed form is $\frac{n(n+1)(2n+1)}{6} = \frac{${n}\cdot${n + 1}\cdot${2 * n + 1}}{6} = ${total}$.`,
        };
      },
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-kelvin', difficulty: 2,
      prompt: t`Write a function \`to_kelvin(celsius)\` that returns the temperature in kelvin ($T_\text{K} = T_\text{C} + 273.15$). Liquid nitrogen boils at −195.8 °C.`,
      starter: t`def to_kelvin(celsius):
    pass
`,
      answer: t`def to_kelvin(celsius):
    return celsius + 273.15`,
      tests: [
        { name: 'water freezes at 273.15 K', code: 'abs(to_kelvin(0) - 273.15) < 1e-9' },
        { name: 'liquid nitrogen boils at 77.35 K', code: 'abs(to_kelvin(-195.8) - 77.35) < 1e-9' },
        { name: 'absolute zero', code: 'abs(to_kelvin(-273.15)) < 1e-9' },
      ],
      hints: ['One `return` line.', '`return celsius + 273.15`'],
      teach: 'A one-line function with return turns a formula into something you can call with any input.',
      explain: '`return celsius + 273.15`. The tests call it with three temperatures.',
    }),
    mcq({
      id: 'cp-nameerror', difficulty: 2, transfer: true,
      prompt: t`A thrust calculation stops with

\`\`\`
line 3, in <module>
NameError: name 'mdot' is not defined
\`\`\`

What is the most likely cause?`,
      choices: ['Line 3 uses `mdot` before any line has assigned it a value (or it is spelled differently there)', 'Python has no variable called `mdot` built in, so it cannot be used', 'The value of `mdot` is too large', '`mdot` was assigned a decimal instead of a whole number'],
      answer: 0,
      why: { 1: 'You may use any name you like — once you have assigned it.', 2: 'Size is never a NameError; huge floats become `inf`.', 3: 'Python does not mind decimals; a type problem would be a TypeError.' },
      hints: ['Read the last line of the message first: the error type and what it is about.', 'A NameError means the name has no value at the moment that line runs.'],
      teach: 'Read an error message from the bottom: the last line names the problem, the line number says where.',
      explain: 'NameError means the name had no value when line 3 ran: it was assigned later, inside a function that was not run, or under a different spelling (`m_dot`, `Mdot`).',
    }),
  ],
  sources: [
    { label: 'The Python Tutorial, §3: An informal introduction', url: 'https://docs.python.org/3/tutorial/introduction.html' },
    { label: 'Pyodide documentation', url: 'https://pyodide.org/en/stable/' },
  ],
});
