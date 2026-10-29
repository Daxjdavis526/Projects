// Lists, tuples and dictionaries — containers, slicing, sorting with a key,
// and aliasing: a name is a label on an object, and `=` never copies.
import { lesson, mcq, num, code } from '../../src/core/content.js';

const t = String.raw;

// semi-major axis (AU) and sidereal period (yr): NASA planetary fact sheet, rounded
const PLANETS = [['Mercury', 0.3871, 0.2408], ['Venus', 0.7233, 0.6152], ['Earth', 1.0, 1.0], ['Mars', 1.5237, 1.8809], ['Jupiter', 5.2029, 11.862], ['Saturn', 9.537, 29.457], ['Uranus', 19.19, 84.01], ['Neptune', 30.07, 164.8]];
const planetDict = PLANETS.map(([n, a, T]) => `    "${n}": (${a === 1 ? '1.000' : a}, ${T === 1 ? '1.000' : T}),`).join('\n');
const ratio = Object.fromEntries(PLANETS.map(([n, a, T]) => [n, (T * T) / a ** 3]));
const worst = Object.keys(ratio).reduce((w, n) => (Math.abs(ratio[n] - 1) > Math.abs(ratio[w] - 1) ? n : w));

// nearby stars (light-years), deliberately out of order
const STARS = [['Sirius A', 8.60], ['Proxima Centauri', 4.2465], ["Barnard's Star", 5.96], ['Lalande 21185', 8.31], ['Alpha Centauri A', 4.37], ['Wolf 359', 7.86]];

// rocket engines: approximate published vacuum thrust (kN) and specific impulse (s)
const ENGINES = [['RS-25', 2279, 452], ['RL10B-2', 110, 465.5], ['F-1', 7770, 304], ['Merlin 1D Vacuum', 981, 348], ['RD-180', 4152, 338]];

const cleanCode = ['raw = [4.1, 4.4, 9.9, 4.2]     # kN; 9.9 is a glitch', 'clean = raw', 'clean.remove(9.9)', 'print(raw)'];
const G = 'Global frame';

export default lesson({
  id: 'prog.P1.4',
  title: 'Lists, tuples and dictionaries',
  minutes: 10, difficulty: 2,
  intro: t`Three containers do most of the work in scientific Python. A **list** is an ordered, changeable sequence (a run of readings); a **tuple** is a fixed record that cannot change (a position $(x, y, z)$, a planet's $(a, T)$); a **dict** looks values up by key (a table of planets by name). Checking Kepler's third law needs all three:

$$\frac{T^2}{a^3} = \frac{4\pi^2}{GM_\odot} = 1\ \ \frac{\text{yr}^2}{\text{AU}^3}$$

One idea underlies them all: a name is a **label on an object**, and \`b = a\` sticks a second label on the same object. It never copies.`,
  symbols: [
    { tex: 'T', text: 'a planet’s orbital period, in years' },
    { tex: 'a', text: 'the orbit’s semi-major axis (half its longest diameter), in astronomical units (AU)' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}\\ \\text{N m}^2/\\text{kg}^2$' },
    { tex: t`M_\odot`, text: 'the Sun’s mass, $1.989\\times10^{30}$ kg; in years and AU the right-hand side comes out as exactly 1' },
  ],
  why: 'Data arrive as lists, constants live in dicts, and the aliasing rule explains a whole family of “my data changed by itself” bugs — including NumPy views later on.',
  visual: {
    type: 'code-runner',
    title: 'Kepler’s third law from a dict of planets',
    lead: t`Press **Run**. The dict maps each name to a tuple \`(a, T)\`; \`.items()\` hands back each pair, and the tuple unpacks into two names. On log–log axes Kepler's law is a straight line of slope 3/2.`,
    tasks: ['Add Pluto: a = 39.48 AU, T = 247.9 yr.', 'Sort the planets by period with `sorted(planets.items(), key=lambda kv: kv[1][1])` and print them.', 'Try `planets["Earth"][0] = 2.0`: why does Python refuse?'],
    params: {
      rows: 26,
      code: t`import math
import atlas.plot as plt

planets = {                      # name: (a in AU, T in years)
${planetDict}
}

for name, (a, T) in planets.items():
    print(f"{name:8s}  T²/a³ = {T**2 / a**3:.4f}")

log_a = [math.log10(a) for a, T in planets.values()]
log_T = [math.log10(T) for a, T in planets.values()]
plt.scatter(log_a, log_T, label="planets")
plt.plot([-0.5, 1.6], [-0.75, 2.4], label="slope 3/2", style="--")
plt.xlabel("log10(a / AU)")
plt.ylabel("log10(T / yr)")
plt.legend()
plt.show()`,
    },
    caption: 'Data from NASA’s planetary fact sheet, rounded. The ratios scatter by about 0.1%: rounding of the data, and the planets’ own masses (strictly the law has G(M☉ + m)).',
  },
  example: {
    prompt: t`A cleaning step removes a glitch from a list of thrust readings, but the raw data must be kept for the test report. What goes wrong here, and how do you fix it?

\`\`\`python
${cleanCode.join('\n')}
\`\`\``,
    visual: {
      type: 'py-memory',
      params: {
        code: [...cleanCode.slice(0, 3), 'clean = raw.copy()     # the fix'],
        steps: [
          { line: 0, note: 'A list object is made, and the name `raw` is a label on it.', frames: [{ name: G, vars: [['raw', '@L1']] }], objects: { L1: { type: 'list', items: ['4.1', '4.4', '9.9', '4.2'] } } },
          { line: 1, note: '`clean = raw` sticks a second label on the **same** list. Nothing is copied.', frames: [{ name: G, vars: [['raw', '@L1'], ['clean', '@L1']] }], objects: { L1: { type: 'list', items: ['4.1', '4.4', '9.9', '4.2'] } }, highlight: ['L1'] },
          { line: 2, note: 'Removing through either name changes the one list: the raw data are gone.', frames: [{ name: G, vars: [['raw', '@L1'], ['clean', '@L1']] }], objects: { L1: { type: 'list', items: ['4.1', '4.4', '4.2'] } }, highlight: ['L1'] },
          { line: 3, note: 'Run instead with `.copy()`: a second list, so cleaning one leaves the other alone.', frames: [{ name: G, vars: [['raw', '@L1'], ['clean', '@L2']] }], objects: { L1: { type: 'list', items: ['4.1', '4.4', '9.9', '4.2'] }, L2: { type: 'list', items: ['4.1', '4.4', '9.9', '4.2'] } }, highlight: ['L2'] },
        ],
      },
      caption: 'Names on the left, objects on the right, an arrow for each reference. Step through with Next. The numbers are drawn inside the list for clarity; in CPython each is an object of its own.',
    },
    steps: [
      { label: 'Predict', text: t`\`print(raw)\` shows \`[4.1, 4.4, 4.2]\`: the glitch has vanished from the raw data too.` },
      { label: 'Explain', text: t`Assignment binds a name to an object. After \`clean = raw\` both names point at one list, so \`clean.remove(9.9)\` changes the list that \`raw\` also names. You can test it: \`clean is raw\` is \`True\`.` },
      { label: 'Fix', text: t`Make a new list with the same items:

\`\`\`python
clean = raw.copy()      # or list(raw), or raw[:]
clean.remove(9.9)
\`\`\`

Now \`clean is raw\` is \`False\`, and \`raw\` keeps all four readings.` },
      { label: 'Sense check', text: t`Integers, floats, strings and tuples cannot be changed in place, so sharing them is harmless — \`x = 5; y = x; y += 1\` leaves \`x\` at 5, because \`y += 1\` makes a *new* int. Aliasing bites only with mutable objects: lists, dicts, sets and arrays.` },
    ],
    answer: t`Both names label one list, so the raw data lose the glitch too; \`clean = raw.copy()\` makes an independent list.`,
  },
  practice: [
    num({
      id: 'slice-step', difficulty: 1,
      gen(r) {
        const [n, k] = r.pick([[1000, 3], [1000, 6], [250, 4], [500, 3], [2000, 7], [100, 8]]);
        const len = Math.ceil(n / k);
        return {
          prompt: t`A logger recorded ${n} samples. To plot quickly you keep every ${k === 2 ? '2nd' : k === 3 ? '3rd' : `${k}th`} one. How many does this keep?

\`\`\`python
samples = read_logger()     # a list of ${n} floats
quick = samples[::${k}]
print(len(quick))
\`\`\``,
          answer: len, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: Math.floor(n / k), feedback: t`The slice starts at index 0 and keeps 0, ${k}, ${2 * k}, … up to ${k * (len - 1)}: that is one more than \`${n} // ${k}\` here.` }],
          hints: [t`\`[::${k}]\` keeps indices 0, ${k}, ${2 * k}, …, as long as they are below ${n}.`, t`The last index kept is the largest multiple of ${k} below ${n}.`],
          teach: 'A slice `a[start:stop:step]` keeps start, start + step, … while still below stop — so `a[::k]` keeps ⌈n/k⌉ items.',
          explain: t`Indices $0, ${k}, \dots, ${k * (len - 1)}$: that is $\lceil ${n}/${k} \rceil = ${len}$ samples. Slicing a list makes a *new* list, so changing \`quick\` never touches \`samples\`.`,
        };
      },
    }),
    mcq({
      id: 'copy-nested', difficulty: 3,
      prompt: t`A 2 × 2 grid of cell temperatures is copied before an update. What does the last line print?

\`\`\`python
grid = [[0, 0], [0, 0]]
g2 = grid.copy()
g2[0][0] = 5
print(grid)
\`\`\``,
      visual: {
        type: 'py-memory',
        params: { steps: [{ frames: [{ name: G, vars: [['grid', '@O1'], ['g2', '@O2']] }], objects: { O1: { type: 'list', items: ['@R1', '@R2'] }, O2: { type: 'list', items: ['@R1', '@R2'] }, R1: { type: 'list', items: [0, 0] }, R2: { type: 'list', items: [0, 0] } } }] },
        caption: 'Memory just after `g2 = grid.copy()`, before the update.',
      },
      choices: ['`[[5, 0], [0, 0]]`', '`[[0, 0], [0, 0]]`', '`[[5, 0], [5, 0]]`', '`[5, [0, 0]]`'],
      answer: 0,
      why: {
        1: '`.copy()` copies the outer list only — a *shallow* copy. Its items are references to the same two inner lists, as the picture shows.',
        2: 'The two rows are separate lists; only row 0 is shared between `grid` and `g2`, and row 0 is all that changes.',
        3: '`g2[0][0] = 5` changes item 0 of the inner list `g2[0]`; it does not replace the whole row.',
      },
      hints: ['Follow the arrows: what does `g2[0]` refer to?', '`grid[0]` and `g2[0]` are the same inner list.'],
      teach: 'A shallow copy makes a new outer container that refers to the same inner objects; use `copy.deepcopy` (or a NumPy array) for nested data.',
      explain: t`\`g2\` is a new outer list, but its rows are the very same lists as \`grid\`'s, so \`grid\` shows \`[[5, 0], [0, 0]]\`. \`import copy; g2 = copy.deepcopy(grid)\` copies the rows too; for numerical grids a 2-D NumPy array and \`.copy()\` is the usual answer.`,
    }),
    code({
      id: 'planet-dict', difficulty: 2,
      prompt: t`Using the dict \`planets\` (name → \`(a, T)\` in AU and years), build a dict \`ratio\` mapping each name to $T^2/a^3$, and set \`worst\` to the **name** of the planet whose ratio is farthest from 1.`,
      visual: {
        type: 'graph',
        params: { x: [-0.6, 1.7], y: [-0.9, 2.5], aspect: 'wide', xlog: true, ylog: true, axesAt: 'edge', xlabel: 'a (AU)', ylabel: 'T (years)',
          curves: [{ fn: '1.5x', color: 'ink3', dash: true, label: 'T² = a³', labelAt: 0.35, labelDx: 10, labelDy: -16 }],
          points: PLANETS.map(([n, a, T]) => ({ x: Math.log10(a), y: Math.log10(T), color: 'accent', label: n, labelDx: 8, labelDy: 10 })) },
        caption: 'The eight planets on log–log axes, with the line T² = a³. Every point sits on it to better than 0.2%, far too close to judge by eye.',
      },
      starter: t`planets = {
${planetDict}
}
ratio = {}
worst = None
`,
      answer: t`planets = {
${planetDict}
}
ratio = {}
for name, (a, T) in planets.items():
    ratio[name] = T**2 / a**3
worst = max(ratio, key=lambda name: abs(ratio[name] - 1))
print(ratio)
print(worst)`,
      tests: [
        { name: 'a ratio for every planet', code: 'isinstance(ratio, dict) and set(ratio) == set(planets)' },
        { name: t`Earth's ratio is 1, Jupiter's ${ratio.Jupiter.toFixed(4)}`, code: `abs(ratio["Earth"] - 1) < 1e-12 and abs(ratio["Jupiter"] - ${ratio.Jupiter}) < 1e-9` },
        { name: t`the farthest from 1 is ${worst}`, code: `worst == "${worst}"` },
      ],
      hints: ['Loop with `for name, (a, T) in planets.items():` and store `ratio[name] = T**2 / a**3`.', '`max` takes a `key`: `max(ratio, key=lambda name: abs(ratio[name] - 1))` loops over the keys and compares their scores.'],
      teach: 'A dict is built one key at a time with `d[key] = value`, and `max(d, key=…)` finds the key with the largest score.',
      explain: t`${worst} deviates most, at ${ratio[worst].toFixed(4)} — only 0.13% from 1, the size of the rounding in its four-figure data. Jupiter's ${ratio.Jupiter.toFixed(4)} is real physics: the law strictly reads $T^2/a^3 = 4\pi^2/G(M_\odot + m)$, and Jupiter is a thousandth of the Sun's mass.`,
    }),
    mcq({
      id: 'tuple-fixed', difficulty: 1,
      prompt: t`A spacecraft's position is stored as a tuple. What happens on the second line?

\`\`\`python
r = (7000.0, 0.0, 0.0)      # km
r[0] = 7100.0
\`\`\``,
      choices: ['A `TypeError`: a tuple cannot be changed after it is made', '`r` becomes `(7100.0, 0.0, 0.0)`', 'A new tuple is made and `r` points to it', 'An `IndexError`'],
      answer: 0,
      why: {
        1: 'That works for a list, not a tuple: tuples are immutable.',
        2: '`r = (7100.0, 0.0, 0.0)` would do that. Item assignment on a tuple is simply refused.',
        3: 'Index 0 exists; the problem is that the tuple cannot change at all.',
      },
      hints: ['Lists use square brackets and can change; tuples use round brackets and cannot.'],
      teach: 'Tuples are immutable: use them for fixed records, and build a new tuple when a value changes.',
      explain: t`\`TypeError: 'tuple' object does not support item assignment\`. That is the point of a tuple: a record that no other part of the program can quietly change. To move the spacecraft, make a new tuple: \`r = (7100.0, r[1], r[2])\`.`,
    }),
    code({
      id: 'sort-stars', difficulty: 2,
      prompt: t`The list \`stars\` holds \`(name, distance in light-years)\` tuples in no particular order. Set \`by_distance\` to the list sorted from nearest to farthest, and \`nearest3\` to a list of the **names** of the three nearest stars.`,
      starter: t`stars = [${STARS.map(([n, d]) => `("${n}", ${d})`).join(', ')}]
by_distance = []
nearest3 = []
`,
      answer: t`stars = [${STARS.map(([n, d]) => `("${n}", ${d})`).join(', ')}]
by_distance = sorted(stars, key=lambda s: s[1])
nearest3 = [name for name, d in by_distance[:3]]
print(nearest3)`,
      tests: [
        { name: 'sorted from nearest to farthest', code: '[d for _, d in by_distance] == sorted(d for _, d in stars) and len(by_distance) == len(stars)' },
        { name: 'the three nearest: Proxima Centauri, Alpha Centauri A, Barnard’s Star', code: `nearest3 == ["Proxima Centauri", "Alpha Centauri A", "Barnard's Star"]` },
        { name: '`stars` itself is left in its original order', code: `stars[0][0] == "${STARS[0][0]}"` },
      ],
      hints: ['`sorted(stars, key=lambda s: s[1])` sorts the tuples by their second item.', 'Slice the first three and keep only the names: `[name for name, d in by_distance[:3]]`.'],
      teach: '`sorted(seq, key=f)` returns a new sorted list, comparing `f(item)` — here each star’s distance.',
      explain: t`Without \`key\`, \`sorted\` would compare the tuples by their first item — alphabetically by name. \`sorted\` returns a new list; \`stars.sort(key=…)\` would sort in place and return \`None\`.`,
    }),
    mcq({
      id: 'dict-get', difficulty: 2,
      prompt: t`What does this print?

\`\`\`python
masses = {"Earth": 5.972e24, "Mars": 6.417e23}      # kg
print(masses.get("Venus", 0.0), "Venus" in masses)
\`\`\``,
      choices: ['`0.0 False`', 'A `KeyError`: there is no `"Venus"` key', '`None False`', '`0.0 True`'],
      answer: 0,
      why: {
        1: '`masses["Venus"]` would raise a `KeyError`; `.get` never does.',
        2: '`.get(key)` alone returns `None`, but here a default of `0.0` is given.',
        3: '`.get` does not add the key: `"Venus" in masses` is still `False`.',
      },
      hints: ['`d.get(key, default)` returns the default when the key is missing.', '`in` on a dict tests its keys.'],
      teach: '`d[key]` raises `KeyError` for a missing key, while `d.get(key, default)` returns the default and `key in d` tests without failing.',
      explain: t`\`.get("Venus", 0.0)\` returns the default \`0.0\`, and \`"Venus" in masses\` is \`False\`. Be careful choosing a default: a missing mass quietly treated as zero can hide a typo in a key.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-rows-trap', difficulty: 3,
      prompt: t`What does this print?

\`\`\`python
rows = [[0.0] * 3] * 2
rows[0][0] = 1.0
print(rows)
\`\`\``,
      choices: ['`[[1.0, 0.0, 0.0], [1.0, 0.0, 0.0]]`', '`[[1.0, 0.0, 0.0], [0.0, 0.0, 0.0]]`', '`[[1.0, 1.0, 1.0], [0.0, 0.0, 0.0]]`', '`[1.0, 0.0, 0.0, 0.0, 0.0, 0.0]`'],
      answer: 0,
      why: {
        1: 'That needs two separate rows. `* 2` repeats the *reference* to one inner list.',
        2: '`[0.0] * 3` makes three references to the same float, but floats cannot change in place: assigning `rows[0][0]` replaces one slot only.',
        3: 'The outer `* 2` repeats a list *inside* a list, so it stays nested.',
      },
      hints: ['How many inner list objects does `[[0.0] * 3] * 2` make?', 'Repeating a list with `*` copies references, not the objects they point to.'],
      teach: 'Multiplying a list of lists repeats references to one inner list; build rows with a comprehension: `[[0.0] * 3 for _ in range(2)]`.',
      explain: t`There is one inner list, referenced twice, so changing it shows up in both rows. \`[[0.0] * 3 for _ in range(2)]\` builds a fresh row on each pass — or use \`np.zeros((2, 3))\`.`,
    }),
    mcq({
      id: 'cp-sort-none', difficulty: 2,
      prompt: t`What does this print?

\`\`\`python
temps = [301.2, 288.5, 295.0]      # K
temps_sorted = temps.sort()
print(temps_sorted)
\`\`\``,
      choices: ['`None`', '`[288.5, 295.0, 301.2]`', '`[301.2, 288.5, 295.0]`', 'An error: `sort` needs a key'],
      answer: 0,
      why: {
        1: 'That is what `sorted(temps)` returns, or what `temps` holds afterwards. `.sort()` itself returns `None`.',
        2: '`.sort()` does sort `temps` — in place — but the name `temps_sorted` receives its return value.',
        3: 'Numbers sort without a key.',
      },
      hints: ['`list.sort()` changes the list in place. What does a method that changes its object usually return in Python?'],
      teach: '`lst.sort()` sorts in place and returns `None`; `sorted(lst)` returns a new sorted list and leaves `lst` alone.',
      explain: t`\`temps\` is now sorted, but \`temps_sorted\` is \`None\`. Write \`temps_sorted = sorted(temps)\` to keep both. The same convention holds for \`append\`, \`remove\` and \`reverse\`.`,
    }),
    code({
      id: 'cp-engines', difficulty: 2, transfer: true,
      prompt: t`The dict \`engines\` maps each rocket engine to \`(vacuum thrust in kN, vacuum specific impulse in s)\`. Set \`best_isp\` to the name of the engine with the highest specific impulse, and \`big\` to an **alphabetically sorted** list of the names of engines with more than 1000 kN of thrust.`,
      starter: t`engines = {
${ENGINES.map(([n, F, isp]) => `    "${n}": (${F}, ${isp}),`).join('\n')}
}
best_isp = None
big = []
`,
      answer: t`engines = {
${ENGINES.map(([n, F, isp]) => `    "${n}": (${F}, ${isp}),`).join('\n')}
}
best_isp = max(engines, key=lambda name: engines[name][1])
big = sorted(name for name, (F, isp) in engines.items() if F > 1000)
print(best_isp, big)`,
      tests: [
        { name: 'the most efficient engine is the RL10B-2 (hydrogen, 465.5 s)', code: 'best_isp == "RL10B-2"' },
        { name: 'the engines above 1000 kN, alphabetically', code: 'big == ["F-1", "RD-180", "RS-25"]' },
      ],
      hints: ['`max(engines, key=lambda name: engines[name][1])` compares the engines by their second number.', 'Loop over `engines.items()`, keep the names with `F > 1000`, then `sorted(...)`.'],
      teach: 'Dicts of tuples are small databases: `.items()` walks the records, `max(…, key=…)` and `sorted` answer questions about them.',
      explain: t`\`max(engines, key=lambda name: engines[name][1])\` gives \`"RL10B-2"\`: hydrogen engines win on specific impulse but are small, while the kerosene F-1 has 70 times the thrust at two-thirds the efficiency. Figures are approximate published vacuum values.`,
    }),
  ],
  sources: [
    { label: 'The Python Tutorial, §5: Data structures', url: 'https://docs.python.org/3/tutorial/datastructures.html' },
    { label: 'Python FAQ: Why did changing list ‘y’ also change list ‘x’?', url: 'https://docs.python.org/3/faq/programming.html#why-did-changing-list-y-also-change-list-x' },
    { label: 'NASA Planetary Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
  ],
});
