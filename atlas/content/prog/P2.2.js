// Searching and sorting — linear against binary search on a sorted steam table,
// interpolation inside the bracket, insertion sort against Python's sort.
import { lesson, mcq, num, code } from '../../src/core/content.js';

const t = String.raw;

// saturation pressure of water (MPa) from temperature (K): IAPWS-IF97, region 4
const IF97 = [0, 0.11670521452767e4, -0.72421316703206e6, -0.17073846940092e2, 0.12020824702470e5, -0.32325550322333e7, 0.14915108613530e2, -0.48232657361591e4, 0.40511340542057e6, -0.23855557567849, 0.65017534844798e3];
function psat(TK) {
  const n = IF97, th = TK + n[9] / (TK - n[10]);
  const A = th * th + n[1] * th + n[2], B = n[3] * th * th + n[4] * th + n[5], C = n[6] * th * th + n[7] * th + n[8];
  return (2 * C / (-B + Math.sqrt(B * B - 4 * A * C))) ** 4;
}
const T_TAB = Array.from({ length: 21 }, (_, i) => 10 * i);                 // °C
const P_TAB = T_TAB.map((T) => +(psat(T + 273.15) * 1000).toPrecision(5));   // kPa, 5 significant figures
const pList = P_TAB.join(', ');
const X = 147;
const I147 = 14, F147 = (X - T_TAB[I147]) / 10;
const P_INTERP = P_TAB[I147] + F147 * (P_TAB[I147 + 1] - P_TAB[I147]);
const P_EXACT = psat(X + 273.15) * 1000;
const pAt = (T) => { let i = Math.min(19, Math.floor(T / 10)); return P_TAB[i] + ((T - T_TAB[i]) / 10) * (P_TAB[i + 1] - P_TAB[i]); };

// synthetic ascent at a constant 4 m/s² (h = ½at²), every 10 s, in km
const TIMES = Array.from({ length: 26 }, (_, k) => 10 * k);
const ALT = TIMES.map((tt) => +(0.002 * tt * tt).toFixed(1));
const KARMAN = 220 + (10 * (100 - ALT[22])) / (ALT[23] - ALT[22]);

const texN = (N) => { const [m, e] = N.toExponential(1).split('e+'); return `${m}\\times10^{${e}}`; };
const PROBE_CLASS = String.raw`exec("class _Probe(list):\n    reads = 0\n    def __getitem__(self, k):\n        type(self).reads += 1\n        return list.__getitem__(self, k)\n    def __iter__(self):\n        for k in range(len(self)):\n            yield self[k]\n")`;

export default lesson({
  id: 'prog.P2.2',
  title: 'Searching and sorting',
  minutes: 11, difficulty: 3,
  intro: t`Physics runs on tables: steam tables, atmosphere tables, star catalogues, telemetry logs. Finding your place in one by checking every row is a **linear search**, $O(n)$. If the table is **sorted**, a **binary search** probes the middle row, keeps the half that must contain the answer, and repeats — so after $k$ probes only $N/2^k$ candidates remain, and it finishes in

$$k_{\max} = \lceil \log_2 N \rceil$$

probes: 20 for a million rows. Getting data sorted costs $O(n\log n)$ with a good algorithm (Python's \`sorted\`), against $O(n^2)$ for simple ones like insertion sort.`,
  symbols: [
    { tex: t`k_{\max}`, text: 'the largest number of probes (comparisons with a table entry) the search can need' },
    { tex: 'N', text: 'the number of candidates: the rows of the table — or, when looking for the bracket $T_i \\le x < T_{i+1}$, the gaps between rows' },
    { tex: t`\log_2 N`, text: 'how many times $N$ can be halved before one candidate is left ($2^{10} = 1024$, so $\\log_2 1000 \\approx 10$)' },
    { tex: t`\lceil\ \rceil`, text: 'the ceiling: round up to the next whole number, since a probe cannot be split' },
  ],
  why: 'Interpolating a property table, finding when telemetry crosses a threshold and matching stars in a catalogue are all binary searches — and they only work on sorted data.',
  visual: {
    type: 'code-runner',
    title: 'Binary search in a steam table',
    lead: t`Press **Run**. \`bracket\` halves the range until it holds one interval, printing each probe; the standard library's \`bisect\` does the same search; then a straight line between the two rows estimates the saturation pressure at 147 °C.`,
    tasks: ['Search for 3 °C and for 199 °C: still five probes or fewer?', 'Interpolate at 25 °C and compare with the exact 3.1699 kPa.', 'Shuffle `T_tab` (`import random; random.shuffle(T_tab)`) and run again: the search answers confidently — and wrongly.'],
    params: {
      rows: 24,
      code: t`import bisect

# saturation pressure of water (kPa) every 10 °C, from IAPWS-IF97
T_tab = list(range(0, 201, 10))                       # °C, sorted
p_tab = [${pList}]

def bracket(T, x):
    """Index i with T[i] <= x < T[i+1], by halving the range."""
    lo, hi = 0, len(T) - 1
    while hi - lo > 1:
        mid = (lo + hi) // 2
        print(f"  probe T[{mid}] = {T[mid]}")
        if T[mid] <= x:
            lo = mid
        else:
            hi = mid
    return lo

x = ${X}.0
i = bracket(T_tab, x)
print("bracket:", T_tab[i], "to", T_tab[i + 1], "°C")
print("bisect agrees:", bisect.bisect_right(T_tab, x) - 1 == i)

f = (x - T_tab[i]) / (T_tab[i + 1] - T_tab[i])        # fraction of the way
p = p_tab[i] + f * (p_tab[i + 1] - p_tab[i])
print(f"p_sat({x} °C) ≈ {p:.1f} kPa   (IAPWS-IF97: ${P_EXACT.toFixed(1)} kPa)")`,
    },
    caption: 'Pressures from the IAPWS-IF97 saturation equation, rounded to 5 significant figures. Straight-line interpolation overestimates slightly here because the curve bends upward between rows.',
  },
  example: {
    prompt: t`Step through the binary search for the bracket of $x = ${X}$ °C in the 21-row table $T = 0, 10, \dots, 200$ °C. How many probes does it take, and what pressure does linear interpolation give?`,
    visual: {
      type: 'py-sort',
      params: { mode: 'search', values: T_TAB, target: X, unit: '°C', labels: T_TAB.map(String) },
      caption: 'The table’s temperature column as bars. Faded rows have been ruled out; lo and hi bound the rows still in play. Press Next or Play.',
    },
    steps: [
      { label: 'Set up the bracket', text: t`Start with \`lo = 0\` (0 °C) and \`hi = 20\` (200 °C): the answer is one of the $N = 20$ gaps between them. Every probe must halve that number.` },
      { label: 'Probe and halve', text: t`Index 10 holds 100 °C $\le 147$, so \`lo = 10\`. Index 15 holds 150 > 147, so \`hi = 15\`. Then 120 (\`lo = 12\`), 130 (\`lo = 13\`) and 140 (\`lo = 14\`). Now \`hi - lo == 1\`: done after **5 probes**, and $\lceil\log_2 20\rceil = 5$.` },
      { label: 'Interpolate', text: t`Between 140 °C (${P_TAB[14]} kPa) and 150 °C (${P_TAB[15]} kPa), 147 °C is 0.7 of the way along:

$$p \approx ${P_TAB[14]} + 0.7\,(${P_TAB[15]} - ${P_TAB[14]}) = ${P_INTERP.toFixed(1)}\ \text{kPa}$$` },
      { label: 'Sense check', text: t`IAPWS-IF97 gives ${P_EXACT.toFixed(1)} kPa, so the straight line is ${((P_INTERP / P_EXACT - 1) * 100).toFixed(1)}% high — the curve bends upward, and a chord lies above it. A table every 10 °C is good to better than 1% here, but only to about 4% near 25 °C, where the pressure doubles about every 12 °C; a finer table, or interpolating $\ln p$ instead of $p$, does far better. A linear search would have needed 15 comparisons here, and 10,000 in a table of 10,000 rows, where binary search needs 14.` },
    ],
    answer: t`5 probes; $p_\text{sat}(${X}\ ^\circ\text{C}) \approx ${P_INTERP.toFixed(1)}$ kPa by interpolation (${P_EXACT.toFixed(1)} kPa exactly).`,
  },
  practice: [
    num({
      id: 'max-probes', difficulty: 1,
      gen(r) {
        const n = r.pick([100, 371, 1000, 5000, 20000, 50]);
        const k = Math.ceil(Math.log2(n));
        return {
          prompt: t`A property table has ${n.toLocaleString('en-US')} rows, sorted by temperature. At most how many probes does this binary search need to find the row bracketing a temperature?

\`\`\`python
lo, hi = 0, len(T) - 1
while hi - lo > 1:
    mid = (lo + hi) // 2
    if T[mid] <= x:
        lo = mid
    else:
        hi = mid
\`\`\``,
          answer: k, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: n - 1, feedback: 'That is a linear search through every row. Each probe here halves the range.' }, { value: n / 2, feedback: 'That is the *average* cost of a linear search. Binary search halves the range at each probe.' }],
          hints: ['Each probe halves the number of candidates.', t`Find the smallest $k$ with $2^k \ge ${n}$.`],
          teach: 'Halving N candidates down to one takes ⌈log₂ N⌉ probes.',
          explain: t`$2^{${k - 1}} = ${2 ** (k - 1)} < ${n} \le 2^{${k}} = ${2 ** k}$, so at most ${k} probes. Multiplying the table size by 1000 adds only about 10 probes.`,
        };
      },
    }),
    mcq({
      id: 'insertion-trace', difficulty: 2,
      prompt: t`Insertion sort takes each item in turn and walks it left until it sits in order among the items before it. What is the list after the **first two passes** (inserting the items at index 1 and then index 2)?

\`\`\`python
a = [5, 2, 4, 6, 1, 3]
\`\`\``,
      visual: { type: 'py-sort', params: { mode: 'insertion', values: [5, 2, 4, 6, 1, 3], controls: false }, caption: 'The list before sorting, as bars. The first item alone is already a sorted part (blue).' },
      choices: ['`[2, 4, 5, 6, 1, 3]`', '`[2, 5, 4, 6, 1, 3]`', '`[1, 2, 4, 5, 6, 3]`', '`[2, 4, 5, 1, 6, 3]`'],
      answer: 0,
      why: {
        1: 'That is after one pass only: 2 has moved in front of 5, but 4 has not yet been inserted.',
        2: 'That is after four passes: 6 and then 1 have also been inserted.',
        3: 'Insertion sort moves only the item being inserted; the 6 and 1 have not been touched yet.',
      },
      hints: ['Pass 1 inserts the 2 into [5]. Pass 2 inserts the 4 into the sorted part.', 'After pass 1 the list is [2, 5, 4, 6, 1, 3].'],
      teach: 'After k passes of insertion sort the first k + 1 items are sorted among themselves and the rest are untouched.',
      explain: t`Pass 1: 2 < 5, so [2, 5, …]. Pass 2: 4 < 5 but 4 > 2, so [2, 4, 5, 6, 1, 3]. On average each insertion walks halfway back, which is why insertion sort makes about $n^2/4$ comparisons.`,
    }),
    code({
      id: 'bracket-code', difficulty: 3,
      prompt: t`This \`bracket\` is correct but scans the table row by row, $O(n)$. Rewrite it as a binary search, $O(\log n)$, without using the \`bisect\` module. It must return \`i\` with \`T[i] <= x < T[i + 1]\` for a sorted list \`T\` and \`T[0] <= x < T[-1]\`. A test counts how many entries your function reads from a 1000-row table.`,
      visual: { type: 'py-sort', params: { mode: 'search', values: T_TAB, target: X, unit: '°C', labels: T_TAB.map(String), controls: false }, caption: 'The search starts with the whole table in play: lo at the first row, hi at the last.' },
      starter: t`def bracket(T, x):
    for i in range(len(T) - 1):          # a linear scan: correct, but O(n)
        if T[i] <= x < T[i + 1]:
            return i
`,
      answer: t`def bracket(T, x):
    lo, hi = 0, len(T) - 1
    while hi - lo > 1:
        mid = (lo + hi) // 2
        if T[mid] <= x:
            lo = mid
        else:
            hi = mid
    return lo

print(bracket([0, 10, 20, 30], 25))`,
      tests: [
        { name: '147 °C lies between rows 14 and 15 of the steam table', code: 'bracket(list(range(0, 201, 10)), 147.0) == 14' },
        { name: 'a value equal to a row belongs to that row', code: 'bracket([0, 10, 20, 30], 10) == 1 and bracket([0, 10, 20, 30], 0) == 0' },
        { name: 'at most 12 reads from a 1000-row table (a linear scan needs hundreds)', code: `${PROBE_CLASS} or (lambda T: bracket(T, 1000.5) == 500 and type(T).reads <= 12)(_Probe(range(0, 2000, 2)))` },
      ],
      hints: ['Keep two indices, `lo = 0` and `hi = len(T) - 1`, with the answer always between them.', 'Loop `while hi - lo > 1:` and probe `mid = (lo + hi) // 2`.', 'If `T[mid] <= x` the answer is at or above `mid` (`lo = mid`), otherwise below it (`hi = mid`); return `lo`.'],
      teach: 'A binary search keeps an interval that must contain the answer and halves it with each probe; `//` keeps the middle index a whole number.',
      explain: t`Each pass halves \`hi - lo\`, so a 1000-row table needs $\lceil\log_2 999\rceil = 10$ reads. Note \`(lo + hi) // 2\`: with \`/\` the index would be a float, and \`T[7.5]\` is a \`TypeError\`. The standard library's \`bisect.bisect_right(T, x) - 1\` gives the same index.`,
    }),
    mcq({
      id: 'needs-sorted', difficulty: 2,
      prompt: t`A test-stand log is sorted by time, and the thrust rises to a peak and then falls. A student wants the time at which the thrust was 10 N and runs a binary search on the **thrust** column. What goes wrong?`,
      visual: {
        type: 'graph',
        params: { x: [-0.05, 1.85], y: [-1, 15.5], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'thrust (N)',
          curves: [[0, 0], [0.1, 6.2], [0.2, 14.1], [0.3, 11.0], [0.4, 6.3], [0.5, 5.1], [0.6, 4.8], [0.7, 4.6], [0.8, 4.6], [0.9, 4.5], [1.0, 4.5], [1.1, 4.4], [1.2, 4.4], [1.3, 4.4], [1.4, 4.3], [1.5, 4.3], [1.6, 4.2], [1.7, 2.1], [1.8, 0]].slice(1).map(([t1, F1], i, arr) => { const [t0, F0] = i ? arr[i - 1] : [0, 0]; return { fn: `${F0} + (${F1 - F0})*(x - ${t0})/${t1 - t0}`, domain: [t0, t1], color: 'accent' }; }),
          hlines: [{ y: 10, label: '10 N', color: 'gold' }] },
        caption: 'The thrust curve (synthetic). The 10 N level is crossed twice, once rising and once falling.',
      },
      choices: [
        'The thrust column is not sorted, so the halving rule throws away halves that may hold the answer — and 10 N occurs twice anyway',
        'Nothing: binary search works on any column as long as the times are sorted',
        'It works but is no faster than a linear search',
        'Python raises an error because the list is not sorted',
      ],
      answer: 0,
      why: {
        1: 'The search compares thrust values, so it is the thrust column that must be sorted. Being sorted by time does not help.',
        2: 'Speed is not the problem: it can return the wrong answer, confidently.',
        3: 'Neither a hand-written search nor `bisect` checks sortedness; they just give a wrong index.',
      },
      hints: ['Binary search relies on one fact: everything left of the probe is smaller, everything right is larger.', 'Is that true of the thrust column?'],
      teach: 'Binary search needs the searched column to be monotonic; on anything else it silently returns garbage.',
      explain: t`Probing a falling stretch, the rule “too small, go right” sends the search the wrong way. Search the rising part and the falling part separately — each is monotonic — or scan linearly for crossings.`,
    }),
    code({
      id: 'interp-code', difficulty: 2,
      prompt: t`Write \`p_at(T)\` returning the saturation pressure (kPa) at temperature \`T\` (°C, between 0 and 200) by linear interpolation in the steam table. Use \`bisect.bisect_right(T_tab, T) - 1\` to find the row. Take care at exactly 200 °C, the last row.`,
      visual: {
        type: 'graph',
        params: { x: [-5, 205], y: [-60, 1650], aspect: 'wide', axesAt: 'edge', xlabel: 'T (°C)', ylabel: 'p (kPa)',
          curves: T_TAB.slice(1).map((T1, i) => ({ fn: `${P_TAB[i]} + (${P_TAB[i + 1] - P_TAB[i]})*(x - ${T_TAB[i]})/10`, domain: [T_TAB[i], T1], color: 'accent' })),
          points: T_TAB.map((T, i) => ({ x: T, y: P_TAB[i], color: 'gold', r: 3 })) },
        caption: 'The 21 table rows and the straight lines your function draws between them. Saturation pressure grows roughly exponentially with temperature.',
      },
      starter: t`import bisect

T_tab = list(range(0, 201, 10))      # °C
p_tab = [${pList}]   # kPa

def p_at(T):
    pass
`,
      answer: t`import bisect

T_tab = list(range(0, 201, 10))      # °C
p_tab = [${pList}]   # kPa

def p_at(T):
    i = min(bisect.bisect_right(T_tab, T) - 1, len(T_tab) - 2)
    f = (T - T_tab[i]) / (T_tab[i + 1] - T_tab[i])
    return p_tab[i] + f * (p_tab[i + 1] - p_tab[i])

print(p_at(147))`,
      tests: [
        { name: t`$p(147\ ^\circ\text{C}) = ${P_INTERP.toFixed(2)}$ kPa`, code: `abs(p_at(147) - ${P_INTERP}) < 1e-9` },
        { name: 'at a table row it returns that row: 100 °C gives 101.42 kPa', code: `abs(p_at(100) - ${P_TAB[10]}) < 1e-9` },
        { name: 'the last row, 200 °C, works too', code: `abs(p_at(200) - ${P_TAB[20]}) < 1e-9` },
        { name: t`at 25 °C, ${pAt(25).toFixed(3)} kPa — ${((pAt(25) / (psat(298.15) * 1000) - 1) * 100).toFixed(0)}% above IAPWS-IF97's 3.170 kPa`, code: `abs(p_at(25) - ${pAt(25)}) < 1e-9` },
      ],
      hints: ['`i = bisect.bisect_right(T_tab, T) - 1` is the row at or below `T`.', 'At 200 °C that gives the last row, which has no row after it: cap `i` at `len(T_tab) - 2`.', 'Then `f = (T - T_tab[i]) / 10` and `return p_tab[i] + f * (p_tab[i + 1] - p_tab[i])`.'],
      teach: 'Interpolation is a search for the bracketing rows followed by a straight line between them; the end of the table needs care.',
      explain: t`\`bisect_right\` finds the row in $O(\log n)$, and capping \`i\` keeps the last row usable. At 25 °C the line gives ${pAt(25).toFixed(4)} kPa against IAPWS-IF97's ${(psat(298.15) * 1000).toFixed(4)} — ${((pAt(25) / (psat(298.15) * 1000) - 1) * 100).toFixed(1)}% high, the price of drawing chords across a curve. (NumPy's \`np.interp\` does all of this in one call.)`,
    }),
    num({
      id: 'sort-ratio', difficulty: 2,
      gen(r) {
        const e = r.pick([4, 5, 6]), n = 10 ** e;
        const ratio = (n * (n - 1)) / 2 / (n * Math.log2(n));
        return {
          prompt: t`Insertion sort needs up to $n(n-1)/2$ comparisons; merge sort needs about $n\log_2 n$. For $n = 10^{${e}}$ readings, about how many times more comparisons does insertion sort need in the worst case?`,
          visual: {
            type: 'graph',
            params: { x: [1, 6.5], y: [0, 12.5], aspect: 'wide', xlog: true, ylog: true, axesAt: 'edge', xlabel: 'n', ylabel: 'comparisons',
              curves: [{ fn: 'log10(10^x*(10^x - 1)/2)', domain: [1, 6.5], color: 'bad', label: 'insertion: n(n − 1)/2', labelAt: 3.2, labelDx: -150, labelDy: -6 }, { fn: 'x + log10(x*ln(10)/ln(2))', color: 'accent', label: 'merge: n log₂ n', labelAt: 5, labelDy: 14 }] },
            caption: 'Worst-case comparison counts on log–log axes. The gap between the lines is the ratio you want.',
          },
          answer: ratio, tol: { rel: 0.02 },
          errors: [{ value: n / Math.log2(n), feedback: 'Close — but insertion sort makes n(n − 1)/2 comparisons, half of n².' }],
          hints: [t`Divide: $\dfrac{n(n-1)/2}{n\log_2 n} = \dfrac{n-1}{2\log_2 n}$.`, t`$\log_2 10^{${e}} = ${e}\log_2 10 \approx ${(e * Math.log2(10)).toFixed(2)}$.`],
          teach: 'The ratio of an O(n²) cost to an O(n log n) cost grows like n / log n — without limit.',
          explain: t`$\dfrac{n-1}{2\log_2 n} = \dfrac{${n} - 1}{2\times${(e * Math.log2(10)).toFixed(2)}} \approx ${Math.round(ratio).toLocaleString('en-US')}$. Python's \`sorted\` (Timsort) is an $O(n\log n)$ merge sort that also spots runs already in order, so nearly sorted telemetry sorts in almost linear time.`,
        };
      },
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-karman', difficulty: 3, transfer: true,
      prompt: t`A rocket's altitude is logged every 10 s during a straight-up ascent (it only climbs, so \`alt\` is sorted). Find the time at which it crossed the Kármán line, 100 km: binary-search \`alt\` for the bracket (with \`bisect\` or your own search), then interpolate linearly in time. Store the answer in \`t_cross\` (s).`,
      visual: {
        type: 'graph',
        params: { x: [-5, 255], y: [-5, 135], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'altitude (km)',
          points: TIMES.map((tt, k) => ({ x: tt, y: ALT[k], color: 'accent', r: 3 })), hlines: [{ y: 100, label: 'Kármán line, 100 km', color: 'gold' }] },
        caption: 'Synthetic telemetry: a constant net acceleration of 4 m/s² straight up, h = ½at², sampled every 10 s. Real ascents pitch over and are not this simple.',
      },
      starter: t`import bisect

times = list(range(0, 251, 10))                 # s
alt = [${ALT.join(', ')}]   # km

t_cross = None
`,
      answer: t`import bisect

times = list(range(0, 251, 10))                 # s
alt = [${ALT.join(', ')}]   # km

i = bisect.bisect_right(alt, 100.0) - 1          # alt[i] <= 100 < alt[i + 1]
f = (100.0 - alt[i]) / (alt[i + 1] - alt[i])
t_cross = times[i] + f * (times[i + 1] - times[i])
print(f"crossed 100 km at t = {t_cross:.1f} s")`,
      tests: [
        { name: t`crossing at ${KARMAN.toFixed(2)} s by linear interpolation`, code: `abs(t_cross - ${KARMAN}) < 1e-6` },
      ],
      hints: ['`i = bisect.bisect_right(alt, 100.0) - 1` gives `alt[i] <= 100 < alt[i + 1]`.', 'The fraction of the interval: `f = (100.0 - alt[i]) / (alt[i + 1] - alt[i])`.', '`t_cross = times[i] + f * (times[i + 1] - times[i])`.'],
      teach: 'Any monotonic log — altitude on the way up, cumulative propellant used — can be binary-searched for the moment a threshold is crossed.',
      explain: t`The bracket is ${TIMES[22]}–${TIMES[23]} s (${ALT[22]} to ${ALT[23]} km), and interpolation gives ${KARMAN.toFixed(2)} s. The exact crossing of $h = 2t^2$ m is $\sqrt{50\,000} = ${Math.sqrt(50000).toFixed(2)}$ s: the chord is a little off because the curve bends. After apogee the altitude falls again, so only the ascent may be searched.`,
    }),
    num({
      id: 'cp-catalogue', difficulty: 2,
      gen(r) {
        const [N, what] = r.pick([[2.5e6, 'a catalogue of 2.5 million stars'], [1.8e9, 'the Gaia catalogue of about 1.8 billion sources'], [5e5, 'a survey of half a million galaxies']]);
        const k = Math.ceil(Math.log2(N));
        return {
          prompt: t`${what[0].toUpperCase() + what.slice(1)} is sorted by right ascension. At most how many probes does one binary search take to find where a new object's right ascension belongs?

\`\`\`python
i = bisect.bisect_left(ra_sorted, ra)      # ra_sorted holds every object's RA
\`\`\``,
          answer: k, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: N / 2, feedback: 'That is the average cost of a linear search. Each probe of a binary search halves the candidates.' }, { value: Math.ceil(Math.log10(N)), feedback: 'Each probe halves the range, so the logarithm is base 2, not base 10.' }],
          hints: ['Each probe halves the candidates.', t`Find $k$ with $2^k \ge ${texN(N)}$ — note $2^{10} \approx 10^3$.`],
          teach: 'Binary search needs about log₂ N probes, so even billions of entries take only about 30.',
          explain: t`$\log_2(${texN(N)}) = ${Math.log2(N).toFixed(2)}$, so ${k} probes. A linear scan would read about $${texN(N / 2)}$ entries on average — which is why catalogues are sorted (or indexed by a tree) once and then searched many times.`,
        };
      },
    }),
    mcq({
      id: 'cp-sort-once', difficulty: 2,
      prompt: t`You must look up 1000 temperatures in an **unsorted** list of $n = 10^6$ readings. Which plan does less work?

\`\`\`python
# plan A: search the unsorted list each time
for x in queries:
    found = x in readings            # a linear scan

# plan B: sort once, then binary-search
s = sorted(readings)
for x in queries:
    i = bisect.bisect_left(s, x)
\`\`\``,
      choices: [
        t`Plan B: about $n\log_2 n + 1000\log_2 n \approx 2\times10^{7}$ steps, against about $5\times10^{8}$ for plan A`,
        t`Plan A: sorting $10^6$ numbers costs more than any number of searches`,
        'They cost the same: both touch every reading',
        'Plan B, but only because `bisect` is written in C',
      ],
      answer: 0,
      why: {
        1: t`One sort costs $n\log_2 n \approx 2\times10^7$ comparisons; 1000 linear scans cost about $1000\times n/2 = 5\times10^8$.`,
        2: 'After sorting, each binary search touches only about 20 readings, not all of them.',
        3: 'Speed of implementation shifts constants; here the algorithms differ by a factor of 25 in step count before any constant.',
      },
      hints: ['Count comparisons: a linear scan averages n/2, a sort costs about n log₂ n, a binary search log₂ n.', t`$\log_2 10^6 \approx 20$.`],
      teach: 'When you will search many times, paying O(n log n) once to sort makes every later search O(log n).',
      explain: t`Plan A: $1000 \times 5\times10^5 = 5\times10^8$ comparisons. Plan B: $10^6\times20 + 1000\times20 \approx 2\times10^7$. For a few lookups a scan is fine; for many, sort once (or build a \`set\` or \`dict\` for exact matches).`,
    }),
  ],
  sources: [
    { label: 'IAPWS R7-97(2012): Revised release on the IAPWS Industrial Formulation 1997 (saturation-pressure equation, §8)', url: 'http://www.iapws.org/relguide/IF97-Rev.html' },
    { label: 'bisect — Array bisection algorithm (Python documentation)', url: 'https://docs.python.org/3/library/bisect.html' },
    { label: 'Python documentation: Sorting techniques', url: 'https://docs.python.org/3/howto/sorting.html' },
  ],
});
