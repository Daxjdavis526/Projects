// Recursion — base case and recursive case, the call stack and its limit, the
// exponential trap of naive tree recursion, and when to use a loop instead.
import { lesson, mcq, num, code } from '../../src/core/content.js';

const t = String.raw;
const G = 'Global frame';

const BUDGET = { bus: { structure: 120.0, thermal: 12.0, power: { 'solar arrays': 45.0, battery: 30.0, harness: 6.5 } }, payload: { camera: 18.5, radio: 4.2 }, propulsion: { tanks: 22.0, thrusters: 8.0, propellant: 60.0 } };
const pyDict = (d, ind = '    ') => `{\n${Object.entries(d).map(([k, v]) => `${ind}"${k}": ${typeof v === 'object' ? pyDict(v, ind + '    ') : v.toFixed(1)},`).join('\n')}\n${ind.slice(4)}}`;
const BUDGET_PY = `budget = ${pyDict(BUDGET)}`;
const totalMass = (x) => (typeof x === 'object' ? Object.values(x).reduce((s, v) => s + totalMass(v), 0) : x);
const countParts = (x) => (typeof x === 'object' ? Object.values(x).reduce((s, v) => s + countParts(v), 0) : 1);

const fibCalls = (n) => (n < 2 ? 1 : 1 + fibCalls(n - 1) + fibCalls(n - 2));
const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));

// Wien's displacement law: x = 5(1 − e^(−x)), b = hc/(k x)
const H = 6.62607015e-34, C = 299792458, KB = 1.380649e-23;
const WIEN_X = (() => { let a = 1, b = 10; for (let k = 0; k < 200; k++) { const m = (a + b) / 2; if ((a - 5 * (1 - Math.exp(-a))) * (m - 5 * (1 - Math.exp(-m))) <= 0) b = m; else a = m; } return (a + b) / 2; })();
const WIEN_B = (H * C) / (KB * WIEN_X);

const factCode = ['def fact(n):', '    if n == 0:', '        return 1', '    return n * fact(n - 1)', '', 'print(fact(3))'];

export default lesson({
  id: 'prog.P2.3',
  title: 'Recursion',
  minutes: 10, difficulty: 3,
  intro: t`A **recursive** function solves a problem by calling itself on a smaller version of it, until it reaches a **base case** small enough to answer directly. The factorial is the textbook case:

$$n! = n \times (n-1)!, \qquad 0! = 1$$

Each call waits on the **call stack** while the smaller one runs, and Python allows only about 1000 waiting calls before it stops with a \`RecursionError\`. So recursion suits problems whose *depth* stays small — nested data, divide and conquer — and a loop suits anything that runs step after step, like a time-stepping simulation.`,
  symbols: [
    { tex: 'n', text: 'a whole number, 0 or more — the size of the problem, shrinking by one with each call' },
    { tex: 'n!', text: 'n factorial, $1\\times2\\times\\dots\\times n$: the number of orderings of $n$ things; $10! = 3\\,628\\,800$' },
    { tex: '(n-1)!', text: 'the same problem, one size smaller — the recursive call' },
    { tex: '0! = 1', text: 'the base case: answered directly, it stops the chain of calls' },
  ],
  why: 'Trees of data (a spacecraft’s parts list, an octree of stars in a Barnes–Hut code) and divide-and-conquer algorithms (merge sort, adaptive integration, the FFT) are recursive by nature.',
  visual: {
    type: 'code-runner',
    title: 'Calls going down, answers coming back',
    lead: t`Press **Run**. The indented trace shows each call of \`fact\` waiting for the next, then the answers returning in reverse order. Then a recursive sum hits Python's depth limit, where a loop does not.`,
    tasks: ['Call `fact(10)`: 11 calls deep.', 'Change 5000 to 900 in the last part: does the recursive sum survive?', 'Remove the base case (`if n == 0: return 1`) and run `fact(4)`.'],
    params: {
      rows: 25,
      code: t`import sys

def fact(n, depth=0):
    print("  " * depth + f"fact({n}) called")
    if n == 0:
        return 1                                  # base case
    result = n * fact(n - 1, depth + 1)           # recursive case
    print("  " * depth + f"fact({n}) returns {result}")
    return result

print(fact(4))
print("Python's recursion limit:", sys.getrecursionlimit())

def total(readings):            # recursion where a loop would do
    if not readings:
        return 0.0
    return readings[0] + total(readings[1:])

print(total([1.5, 2.0, 2.5]))
try:
    total([1.0] * 5000)
except RecursionError as err:
    print("RecursionError:", err)
print(sum([1.0] * 5000))        # a loop has no depth limit`,
    },
    caption: 'The limit is a safety net, set to 1000 by default (`sys.setrecursionlimit` can raise it, at your own risk). `total` also copies the list with every slice, so it is slow as well as shallow.',
  },
  example: {
    prompt: t`A spacecraft's mass budget is a nested dict: an assembly maps names to parts, and a part is either a number (a component's mass in kg) or another assembly. Write \`total_mass(item)\` that adds up every component, however deep the nesting.

\`\`\`python
${BUDGET_PY}
\`\`\``,
    visual: {
      type: 'py-memory',
      params: { steps: [{
        frames: [{ name: G, vars: [['budget', '@B']] }],
        objects: {
          B: { type: 'dict', items: [["'bus'", '@BUS'], ["'payload'", '@PAY'], ["'propulsion'", '@PRO']] },
          BUS: { type: 'dict', items: [["'structure'", '120.0'], ["'thermal'", '12.0'], ["'power'", '@POW']] },
          PAY: { type: 'dict', items: [["'camera'", '18.5'], ["'radio'", '4.2']] },
          PRO: { type: 'dict', items: [["'tanks'", '22.0'], ["'thrusters'", '8.0'], ["'propellant'", '60.0']] },
          POW: { type: 'dict', items: [["'solar arrays'", '45.0'], ["'battery'", '30.0'], ["'harness'", '6.5']] },
        } }] },
      caption: 'The budget in memory: dicts that refer to smaller dicts, a tree three levels deep. Recursion follows the arrows.',
    },
    steps: [
      { label: 'Find the base case', text: t`A component is a plain number: its total mass is itself. That needs no further calls.

\`\`\`python
def total_mass(item):
    if not isinstance(item, dict):
        return item              # a component
\`\`\`` },
      { label: 'Find the recursive case', text: t`An assembly's mass is the sum of its parts' masses — and each part is the same kind of problem, one level smaller:

\`\`\`python
    return sum(total_mass(part) for part in item.values())
\`\`\`` },
      { label: 'Trust the recursion', text: t`\`total_mass(budget)\` calls \`total_mass\` on the bus, which calls it on the power assembly, which returns 81.5 kg from its three components. Each call only has to handle its own level. The stack is never deeper than the nesting — four frames here.` },
      { label: 'Sense check', text: t`It returns ${totalMass(BUDGET).toFixed(1)} kg, the sum of all ${countParts(BUDGET)} components. A loop would need its own stack to track where it was in the tree; recursion uses Python's, which is why tree-shaped data is the natural home of recursion.` },
    ],
    answer: t`\`total_mass(budget)\` returns ${totalMass(BUDGET).toFixed(1)} kg.`,
  },
  practice: [
    mcq({
      id: 'base-case', difficulty: 1,
      prompt: t`A countdown for a launch sequence. What happens when this runs?

\`\`\`python
def countdown(n):
    print(n)
    countdown(n - 1)

countdown(10)
\`\`\``,
      choices: ['It prints 10, 9, 8, … far into the negative numbers, then stops with a `RecursionError`', 'It prints 10 down to 0 and stops', 'It runs forever', 'It prints 10 down to 1 and stops'],
      answer: 0,
      why: {
        1: 'Nothing tells it to stop at 0: there is no base case.',
        2: 'Every call waits on the stack, and the stack is limited — about 1000 frames.',
        3: 'That needs a base case such as `if n == 0: return`.',
      },
      hints: ['Where does the function stop calling itself?', 'Each call adds a frame to the call stack. How many can Python hold?'],
      teach: 'Without a base case recursion never stops on its own — Python halts it at the recursion limit.',
      explain: t`With no base case each call makes another, about a thousand deep, then \`RecursionError: maximum recursion depth exceeded\`. Add \`if n < 0: return\` before the \`print\` — or simply write \`for n in range(10, -1, -1)\`.`,
    }),
    num({
      id: 'calls-fact', difficulty: 1,
      gen(r) {
        const n = r.int(4, 12);
        return {
          prompt: t`How many times is \`fact\` called, counting the first call, when this runs?

\`\`\`python
def fact(n):
    if n == 0:
        return 1
    return n * fact(n - 1)

fact(${n})
\`\`\``,
          answer: n + 1, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: n, feedback: t`Count the base case too: \`fact(${n})\`, \`fact(${n - 1})\`, …, \`fact(1)\` and \`fact(0)\`.` }],
          hints: [t`List the calls: \`fact(${n})\`, \`fact(${n - 1})\`, …`, 'The chain stops at `fact(0)`, which is a call too.'],
          teach: 'A recursion that shrinks n by one each time from n down to 0 makes n + 1 calls and stacks n + 1 frames.',
          explain: t`\`fact(${n})\` down to \`fact(0)\` is ${n + 1} calls, all on the stack at once at the deepest point. So \`fact(2000)\` fails with the default limit of 1000, while \`math.factorial(2000)\` — a loop in C — does not.`,
        };
      },
    }),
    mcq({
      id: 'return-order', difficulty: 2,
      prompt: t`The picture shows the call stack at its deepest point while \`fact(3)\` runs: \`fact(0)\` has just reached its base case. In what order do the calls finish, and what does each return?`,
      visual: {
        type: 'py-memory',
        params: { code: factCode, steps: [{ line: 2, frames: [{ name: G, vars: [['fact', '@F']] }, { name: 'fact', vars: [['n', 3]] }, { name: 'fact', vars: [['n', 2]] }, { name: 'fact', vars: [['n', 1]] }, { name: 'fact', vars: [['n', 0], ['Return value', 1]] }], objects: { F: { type: 'record', label: 'function fact(n)', fields: [] } } }] },
        caption: 'Each call has its own frame with its own n; the newest frame is at the bottom.',
      },
      choices: [
        '`fact(0)` → 1, then `fact(1)` → 1, `fact(2)` → 2, `fact(3)` → 6',
        '`fact(3)` → 6 first, then `fact(2)` → 2, `fact(1)` → 1, `fact(0)` → 1',
        '`fact(0)` → 0, then `fact(1)` → 0, `fact(2)` → 0, `fact(3)` → 0',
        'All four frames return 6 at the same moment',
      ],
      answer: 0,
      why: {
        1: '`fact(3)` cannot finish before it has the value of `fact(2)`: the first call made is the last to return.',
        2: 'The base case returns 1, not 0 — and with 0 every factorial would be 0.',
        3: 'Each frame has its own `n`, so each computes its own product: `n * (answer from below)`.',
      },
      hints: ['A call cannot return until the call it is waiting on has returned.', 'Work upward from the bottom frame: `1 * 1`, then `2 * 1`, then `3 * 2`.'],
      teach: 'The call stack is last in, first out: the deepest call returns first and each frame finishes its own multiplication on the way back up.',
      explain: t`\`fact(0)\` returns 1; \`fact(1)\` computes \`1 * 1\`; \`fact(2)\` computes \`2 * 1 = 2\`; \`fact(3)\` computes \`3 * 2 = 6\`. Last in, first out — which is why it is called a stack.`,
    }),
    num({
      id: 'fib-calls', difficulty: 3,
      gen(r) {
        const n = r.int(10, 20);
        return {
          prompt: t`The textbook recursive Fibonacci function calls itself twice. How many calls of \`fib\` does \`fib(${n})\` make in all, counting the first?

\`\`\`python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
\`\`\``,
          answer: fibCalls(n), tol: { rel: 0, abs: 0.4 },
          errors: [{ value: n + 1, feedback: 'That would be true if each call made one smaller call. Here each makes two, and they repeat each other’s work.' }, { value: fib(n), feedback: t`That is $F_{${n}}$, the value returned — the number of calls is larger still.` }],
          hints: [t`Let $C(n)$ be the number of calls. Then $C(0) = C(1) = 1$ and $C(n) = 1 + C(n-1) + C(n-2)$.`, t`Build it up: $C(2) = 3$, $C(3) = 5$, $C(4) = 9$, $C(5) = 15$, … (it equals $2F_{n+1} - 1$).`],
          teach: 'A function that calls itself twice on overlapping subproblems does exponential work; a loop or a cache (`functools.cache`) makes it linear.',
          explain: t`$C(${n}) = 2F_{${n + 1}} - 1 = 2\times${fib(n + 1)} - 1 = ${fibCalls(n)}$ calls, to compute $F_{${n}} = ${fib(n)}$. The count grows by a factor of about 1.618 per step: \`fib(40)\` would need over 300 million calls. The stack, though, is never more than ${n} frames deep — the problem here is time, not depth.`,
        };
      },
    }),
    code({
      id: 'count-parts', difficulty: 2,
      prompt: t`Write a recursive \`count_parts(item)\` that returns the number of **components** (plain numbers) in a nested mass budget like the worked example's: a number counts as 1, and a dict counts as the sum of its parts' counts.`,
      starter: t`${BUDGET_PY}

def count_parts(item):
    pass
`,
      answer: t`${BUDGET_PY}

def count_parts(item):
    if not isinstance(item, dict):
        return 1
    return sum(count_parts(part) for part in item.values())

print(count_parts(budget))`,
      tests: [
        { name: t`the budget has ${countParts(BUDGET)} components`, code: `count_parts(budget) == ${countParts(BUDGET)}` },
        { name: 'a lone component counts as 1', code: 'count_parts(18.5) == 1' },
        { name: 'an empty assembly has none', code: 'count_parts({}) == 0' },
        { name: 'deep nesting works', code: 'count_parts({"a": {"b": {"c": {"d": 1.0, "e": 2.0}}}, "f": 3.0}) == 3' },
      ],
      hints: ['Base case: an item that is not a dict is one component.', 'Recursive case: `return sum(count_parts(part) for part in item.values())`.'],
      teach: 'A recursive function on a tree has two parts: the leaf case, answered directly, and the branch case, built from the answers for its children.',
      explain: t`\`if not isinstance(item, dict): return 1\`, otherwise the sum over the parts. An empty dict gives \`sum\` of nothing, 0 — the base case and the recursive case together handle it with no special code.`,
    }),
    code({
      id: 'iterate-sum', difficulty: 2,
      prompt: t`This recursive \`total\` works on short lists but stops with a \`RecursionError\` on a long one. Rewrite it with a loop, so it can add up 100 000 readings.`,
      starter: t`def total(readings):
    if not readings:
        return 0.0
    return readings[0] + total(readings[1:])
`,
      answer: t`def total(readings):
    s = 0.0
    for r in readings:
        s += r
    return s

print(total([0.5] * 100_000))`,
      tests: [
        { name: 'three readings add up to 6.0', code: 'abs(total([1.5, 2.0, 2.5]) - 6.0) < 1e-12' },
        { name: 'an empty list totals 0', code: 'total([]) == 0' },
        { name: '100 000 readings of 0.5 total 50 000', code: 'abs(total([0.5] * 100_000) - 50_000) < 1e-6' },
      ],
      hints: ['Start a running total at 0.0.', '`for r in readings: s += r`, then `return s`.'],
      teach: 'When the recursion depth would grow with the size of the data, use a loop: it needs no stack at all.',
      explain: t`The loop uses one frame however long the list is. The recursive version needed one frame per reading — and copied the rest of the list each time with \`readings[1:]\`, making it $O(n^2)$ as well. In practice, \`sum(readings)\` or \`math.fsum(readings)\` (which also avoids round-off) is the answer.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-wien', difficulty: 3, transfer: true,
      prompt: t`The peak of a blackbody spectrum, $\lambda_{\max} T = b$, comes from the root of $x = 5(1 - e^{-x})$ with $x = hc/(\lambda k_B T)$. Write a **recursive** bisection \`bisect_root(f, a, b, tol)\`: if the interval is shorter than \`tol\`, return its midpoint; otherwise call itself on the half where \`f\` changes sign. Use it on $f(x) = x - 5(1 - e^{-x})$ over $[1, 10]$ with \`tol = 1e-10\` to set \`x\`, then Wien's constant \`b_wien\` $= hc/(k_B x)$ in m K.`,
      visual: {
        type: 'graph',
        params: { x: [0, 10.5], y: [-3, 6], aspect: 'wide', xlabel: 'x', ylabel: 'f(x)',
          curves: [{ fn: 'x - 5*(1 - exp(-x))', color: 'accent', label: 'f(x) = x − 5(1 − e^(−x))', labelAt: 6.5, labelDx: -40, labelDy: -26 }],
          vlines: [{ x: 1, label: 'a = 1' }, { x: 10, label: 'b = 10' }] },
        caption: 'The function changes sign once between 1 and 10. Each level of the recursion keeps the half where the sign change is.',
      },
      starter: t`import math

h, c, k_B = 6.62607015e-34, 299792458.0, 1.380649e-23    # SI, exact

def bisect_root(f, a, b, tol):
    pass

x = None
b_wien = None
`,
      answer: t`import math

h, c, k_B = 6.62607015e-34, 299792458.0, 1.380649e-23    # SI, exact

def bisect_root(f, a, b, tol):
    m = (a + b) / 2
    if b - a < tol:
        return m
    if f(a) * f(m) <= 0:
        return bisect_root(f, a, m, tol)
    return bisect_root(f, m, b, tol)

x = bisect_root(lambda x: x - 5 * (1 - math.exp(-x)), 1.0, 10.0, 1e-10)
b_wien = h * c / (k_B * x)
print(x, b_wien)`,
      tests: [
        { name: t`$x = ${WIEN_X.toFixed(9)}$`, code: `abs(x - ${WIEN_X}) < 1e-9` },
        { name: t`Wien's constant $b = ${(WIEN_B * 1000).toFixed(6)}\times10^{-3}$ m K`, code: `abs(b_wien / ${WIEN_B} - 1) < 1e-9` },
        { name: 'it finds √2 as the root of x² − 2 on [1, 2]', code: 'abs(bisect_root(lambda x: x * x - 2, 1.0, 2.0, 1e-12) - 2 ** 0.5) < 1e-11' },
      ],
      hints: ['Base case: `if b - a < tol: return (a + b) / 2`.', 'Otherwise compute the midpoint `m` and test `f(a) * f(m) <= 0` (a sign change in the left half).', 'Return the recursive call on `(a, m)` or on `(m, b)` — do not forget the `return`.'],
      teach: 'Bisection is naturally recursive, and safely so: each level halves the interval, so the depth is only log₂((b − a)/tol).',
      explain: t`From width 9 down to $10^{-10}$ takes $\lceil\log_2(9\times10^{10})\rceil = 37$ halvings, so the stack never exceeds about 38 frames. $x = ${WIEN_X.toFixed(9)}$ gives $b = hc/(k_B x) = ${(WIEN_B * 1000).toFixed(7)}\times10^{-3}$ m K, Wien's constant as CODATA lists it. For the Sun's 5772 K, $\lambda_{\max} = b/T = ${(WIEN_B / 5772 * 1e9).toFixed(0)}$ nm.`,
    }),
    mcq({
      id: 'cp-when-loop', difficulty: 2,
      prompt: t`Which of these tasks should **not** be written recursively in Python?

\`\`\`python
# P: step an orbit forward one time step, 10⁶ times
# Q: total the masses in a nested parts list
# R: merge sort a list of 10⁶ readings
# S: refine an adaptive integral by halving intervals
\`\`\``,
      choices: ['P: a million steps would need a million nested calls', 'Q: dictionaries cannot be processed recursively', 'R: merge sort is too deep to recurse on a million items', 'S: recursion cannot be used for numerical work'],
      answer: 0,
      why: {
        1: 'Nested data is the natural home of recursion; its depth is the nesting depth, a handful of levels.',
        2: 'Merge sort halves the list at each level: a million items need only about 20 levels.',
        3: 'Adaptive integration and bisection recurse to a depth set by the accuracy wanted — usually a few dozen levels.',
      },
      hints: ['The question is how deep each recursion would go.', 'Which one shrinks the problem by only one step per call?'],
      teach: 'Recurse when each call shrinks the problem by a factor (depth ~ log n) or follows nested data; loop when the problem shrinks one step at a time.',
      explain: t`Time stepping shrinks “steps remaining” by one per call, so it would need $10^6$ frames — far past the limit of about 1000. Merge sort and adaptive halving need about $\log_2 n$ levels, and a parts list only its nesting depth.`,
    }),
    num({
      id: 'cp-merge-depth', difficulty: 2,
      gen(r) {
        const k = r.int(10, 24);
        return {
          prompt: t`This merge sort is called on a list of $2^{${k}}$ readings. What is the largest number of \`merge_sort\` frames on the call stack at any moment, counting the first call?

\`\`\`python
def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    return merge(merge_sort(a[:mid]), merge_sort(a[mid:]))
\`\`\``,
          answer: k + 1, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: k, feedback: t`Count the bottom call on a one-item list too: sizes $2^{${k}}, 2^{${k - 1}}, \dots, 2^0$.` }, { value: 2 ** k, feedback: 'The two halves are sorted one after the other, not at the same time: only one chain of calls is waiting at any moment.' }],
          hints: ['Each call waits on one smaller call at a time, half its size.', t`The sizes on the stack are $2^{${k}}, 2^{${k - 1}}, \dots, 1$.`],
          teach: 'Halving recursion is only log₂ n + 1 frames deep, so merge sort never troubles the recursion limit.',
          explain: t`The deepest chain runs through sizes $2^{${k}}$ down to $2^0 = 1$: ${k + 1} frames. Even a list of $2^{${k}} \approx ${(2 ** k).toExponential(1).replace('e+', '\\times10^{')}}$ items sits comfortably below the limit of 1000.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Python documentation: sys.getrecursionlimit', url: 'https://docs.python.org/3/library/sys.html#sys.getrecursionlimit' },
    { label: 'functools.cache — memoizing a recursive function', url: 'https://docs.python.org/3/library/functools.html#functools.cache' },
    { label: 'CODATA 2022: Wien wavelength displacement law constant (NIST)', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?bwien' },
  ],
});
