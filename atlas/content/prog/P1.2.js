// Conditionals and loops — if/elif/else, for over range and zip, while with
// break, and the float-counter trap; a projectile table and Kepler's equation.
import { lesson, mcq, num, code } from '../../src/core/content.js';

const t = String.raw;

// the bouncing ball of the worked example: rebound to e² of the previous height
const H0 = 2.0, REST = 0.8;
const bounces = (() => { let h = H0, n = 0; while (h >= 0.01) { h *= REST ** 2; n++; } return n; })();
const bouncePts = Array.from({ length: bounces + 2 }, (_, n) => ({ x: n, y: Math.log10(H0 * REST ** (2 * n)), color: n === bounces ? 'gold' : 'accent', r: n === bounces ? 5 : 3.5 }));

// Mercury's eccentric anomaly at mean anomaly 1 rad (checkpoint)
const ECC = 0.20563, MEAN = 1.0;
const KEPLER_E = (() => { let E = MEAN; for (let k = 0; k < 200; k++) E = MEAN + ECC * Math.sin(E); return E; })();

// the projectile of the practice table
const V0 = 20, G = 9.8;
const yAt = (tt) => V0 * tt - 0.5 * G * tt * tt;

const lg = Math.log10;

export default lesson({
  id: 'prog.P1.2',
  title: 'Conditionals and loops',
  minutes: 9, difficulty: 2,
  intro: t`Physics programs are mostly loops: stepping through time, building a table, iterating until an answer stops changing. \`for\` runs once per item of a sequence, \`while\` runs as long as a condition holds, and \`if\`/\`elif\`/\`else\` picks the **first** branch whose condition is true. A projectile table is the classic case:

$$y(t) = v_0\sin\theta\;t - \tfrac12 g t^2, \qquad t_k = k\,\Delta t$$

The second equation is the habit that matters: compute each time from an **integer counter** $k$, rather than adding $\Delta t$ again and again, so round-off cannot pile up and the loop always runs the number of times you meant.`,
  symbols: [
    { tex: 'y(t)', text: 'height of the projectile above the launch point at time $t$, in m' },
    { tex: 'v_0', text: 'launch speed, in m/s' },
    { tex: t`\theta`, text: 'launch angle above the horizontal (Python’s `math.sin` wants radians: `math.radians(50)`)' },
    { tex: 'g', text: 'gravitational acceleration, 9.81 m/s² near Earth’s surface' },
    { tex: 'k', text: 'the loop counter, a whole number 0, 1, 2, …' },
    { tex: t`\Delta t`, text: 'the time step between rows of the table, in s' },
  ],
  why: 'Every simulation in this course — orbits, oscillators, Monte Carlo — is a loop with a stopping condition; getting the count and the stop right is half the battle.',
  visual: {
    type: 'code-runner',
    title: 'A projectile table, row by row',
    lead: t`Press **Run**. The \`while True\` loop computes one row per pass and \`break\`s out when the height goes negative. The plot draws every row the loop kept.`,
    tasks: ['Try angles of 45° and 60°: which lands farther?', 'Make `dt = 0.01` and print only every 100th row (`k % 100 == 0`).', 'Replace `while True:` with `for k in range(10):` — what goes wrong, and why does the `k += 1` now do nothing useful?'],
    params: {
      code: t`import math
import atlas.plot as plt

v0, angle, g = 40.0, 50.0, 9.81            # m/s, degrees, m/s²
vx = v0 * math.cos(math.radians(angle))
vy = v0 * math.sin(math.radians(angle))

dt = 0.25                                   # s
xs, ys = [], []
k = 0
while True:
    t = k * dt                              # time from the counter: no drift
    y = vy * t - 0.5 * g * t**2
    if y < 0:
        break                               # it has landed
    xs.append(vx * t)
    ys.append(y)
    if k % 4 == 0:                          # print every fourth row
        print(f"t = {t:4.1f} s   x = {vx * t:5.1f} m   y = {y:4.1f} m")
    k += 1

print("rows kept:", len(xs))
plt.plot(xs, ys, label="trajectory")
plt.scatter(xs, ys)
plt.xlabel("x (m)")
plt.ylabel("y (m)")
plt.show()`,
    },
    caption: 'No air resistance: a real ball at 40 m/s would fall well short of this parabola. The table stops at the last row above ground, so the true landing point lies between that row and the next.',
  },
  example: {
    prompt: t`A ball dropped from ${H0} m rebounds each time to $e^2$ times the height it fell from, where $e = ${REST}$ is the coefficient of restitution. How many bounces until a rebound is lower than 1 cm (counting that last bounce)?`,
    visual: {
      type: 'graph',
      params: { x: [-0.5, bounces + 1.5], y: [-2.4, 0.5], aspect: 'wide', ylog: true, axesAt: 'edge', xlabel: 'bounce number n', ylabel: 'rebound height (m)', xticks: 8,
        hlines: [{ y: -2, label: '1 cm', color: 'bad' }],
        points: bouncePts },
      caption: t`Rebound heights on a logarithmic axis, where a fixed fraction lost per bounce makes a straight line. The gold point is the first rebound below 1 cm.`,
    },
    steps: [
      { label: 'Choose the loop', text: t`The number of bounces is what we want to *find*, so a \`for\` loop over a known range will not do. A \`while\` loop runs until a condition fails.

\`\`\`python
h = 2.0          # m, the height it falls from
e = 0.8
n = 0            # bounces so far
\`\`\`` },
      { label: 'Write the condition', text: t`Keep bouncing while the ball still rises at least 1 cm. Each pass is one bounce: shrink the height, count it.

\`\`\`python
while h >= 0.01:
    h = h * e**2
    n += 1
print(n, h)
\`\`\`` },
      { label: 'Check the ending', text: t`When the loop stops, \`h\` is the first rebound below 1 cm and \`n\` counts that bounce too. It prints \`${bounces}\` and a height of ${(H0 * REST ** (2 * bounces) * 100).toFixed(2)} cm. Always ask what the variables hold at the moment a \`while\` loop exits — off-by-one errors live there.` },
      { label: 'Sense check', text: t`Algebra agrees: $2.0 \times 0.64^n < 0.01$ needs $n > \ln(0.005)/\ln(0.64) = ${(Math.log(0.005) / Math.log(0.64)).toFixed(2)}$, so $n = ${bounces}$.` },
    ],
    answer: t`${bounces} bounces.`,
  },
  practice: [
    num({
      id: 'range-count', difficulty: 1,
      gen(r) {
        const [top, step] = r.pick([[10000, 500], [8000, 1000], [12000, 1000], [5000, 250], [20000, 2000], [15000, 500]]);
        const n = top / step;
        return {
          prompt: t`A program prints a table of air density at altitudes up to ${top} m. How many rows does this loop print?

\`\`\`python
for h in range(0, ${top}, ${step}):
    print(h, density(h))
\`\`\``,
          answer: n, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: n + 1, feedback: t`\`range\` stops *before* its end: ${top} itself is never reached. The last row is ${top - step} m.` }],
          hints: [t`\`range(start, stop, step)\` gives start, start + step, … while the value is still *below* stop.`, t`The values are 0, ${step}, …, ${top - step}.`],
          teach: '`range(a, b, s)` never includes `b`, so it gives (b − a)/s values when s divides b − a.',
          explain: t`The rows are 0, ${step}, …, ${top - step} m: that is $${top}/${step} = ${n}$ rows. To include the top, write \`range(0, ${top} + ${step}, ${step})\`.`,
        };
      },
    }),
    num({
      id: 'float-while', difficulty: 2,
      prompt: t`How many lines does this print?

\`\`\`python
t = 0.0
while t <= 0.3:
    print(t)
    t += 0.1
\`\`\``,
      answer: 3, tol: { rel: 0, abs: 0.4 },
      errors: [{ value: 4, feedback: t`You expected 0, 0.1, 0.2 and 0.3. But after three additions \`t\` is \`0.30000000000000004\`, which is *not* \`<= 0.3\`.` }],
      hints: ['Floats are binary fractions: 0.1 is stored as a hair more than 0.1.', 'What is `0.1 + 0.1 + 0.1` in Python? Compare it with `0.3`.'],
      teach: 'Adding a float step over and over accumulates round-off, so a loop that tests the running total can run one time too few — or forever.',
      explain: t`It prints 0.0, 0.1 and 0.2, then \`t\` becomes \`0.30000000000000004\` and the test fails: 3 lines. Loop over an integer instead — \`for k in range(4): t = k * 0.1\` — and the count is exact. With \`while t != 1.0\` the same drift makes a loop that never stops.`,
    }),
    code({
      id: 'table-lists', difficulty: 1,
      prompt: t`A ball is thrown straight up at $v_0 = 20$ m/s ($g = 9.8\ \text{m/s}^2$). Fill the lists \`ts\` and \`ys\` with the times $t_k = 0.5k$ s for $k = 0, 1, …, 8$ and the heights $y = v_0 t - \tfrac12 g t^2$ at those times. Compute each time from the counter.`,
      visual: {
        type: 'graph',
        params: { x: [-0.2, 4.3], y: [-2, 23], aspect: 'wide', xlabel: 't (s)', ylabel: 'y (m)',
          curves: [{ fn: '20x - 4.9x^2', color: 'accent', domain: [0, 4.1] }],
          points: Array.from({ length: 9 }, (_, k) => ({ x: k * 0.5, y: yAt(k * 0.5), color: 'gold', r: 3.5 })) },
        caption: 'The height curve and the nine samples your loop should produce, half a second apart. No air resistance.',
      },
      starter: t`v0, g = 20.0, 9.8      # m/s, m/s²
ts = []
ys = []
# loop over k = 0 … 8 here
`,
      answer: t`v0, g = 20.0, 9.8      # m/s, m/s²
ts = []
ys = []
for k in range(9):
    t = 0.5 * k
    ts.append(t)
    ys.append(v0 * t - 0.5 * g * t**2)
print(ts)
print(ys)`,
      tests: [
        { name: 'nine rows, from 0 s to 4.0 s', code: 'len(ts) == 9 and len(ys) == 9 and ts[0] == 0 and ts[-1] == 4.0' },
        { name: t`$y(1.5\ \text{s}) = ${yAt(1.5).toFixed(3)}$ m`, code: `abs(ys[3] - ${yAt(1.5)}) < 1e-9` },
        { name: t`$y(4.0\ \text{s}) = ${yAt(4).toFixed(1)}$ m, still just above the ground`, code: `abs(ys[8] - ${yAt(4)}) < 1e-9` },
      ],
      hints: ['`for k in range(9):` runs k = 0, 1, …, 8.', 'Inside the loop: `t = 0.5 * k`, then append `t` to `ts` and the height to `ys`.'],
      teach: 'Loop over an integer counter and compute the physical variable from it; `append` grows a list one row at a time.',
      explain: t`\`for k in range(9): t = 0.5 * k\` gives exactly 0.0, 0.5, …, 4.0 — no drift, since each time is computed once. The heights rise to $v_0^2/2g = 20.4$ m at 2.04 s and are back down to ${yAt(4).toFixed(1)} m at 4.0 s.`,
    }),
    mcq({
      id: 'mach-elif', difficulty: 2,
      prompt: t`A flight-test script labels each data point by its Mach number \`M\`. What is \`regime\` when \`M = 7\`?

\`\`\`python
if M > 0.8:
    regime = "transonic"
elif M > 1.2:
    regime = "supersonic"
elif M > 5:
    regime = "hypersonic"
else:
    regime = "subsonic"
\`\`\``,
      visual: {
        type: 'graph',
        params: { x: [-0.7, 1], y: [-1, 1], aspect: 'wide', xlog: true, xlabel: 'Mach number M (log scale)', ylabel: '', yticks: 0, grid: false, axesAt: 'edge',
          shade: [
            { fn: '1', lower: '-1', from: -0.7, to: lg(0.8), color: 'good', alpha: 0.14 },
            { fn: '1', lower: '-1', from: lg(0.8), to: lg(1.2), color: 'gold', alpha: 0.2 },
            { fn: '1', lower: '-1', from: lg(1.2), to: lg(5), color: 'warn', alpha: 0.14 },
            { fn: '1', lower: '-1', from: lg(5), to: 1, color: 'bad', alpha: 0.14 }],
          points: [
            { x: -0.4, y: 0.6, r: 0.1, label: 'subsonic', labelDx: 0, labelDy: 0, labelAlign: 'center', color: 'good' },
            { x: lg(0.98), y: -0.6, r: 0.1, label: 'transonic', labelDx: 0, labelDy: 0, labelAlign: 'center', color: 'gold' },
            { x: 0.39, y: 0.6, r: 0.1, label: 'supersonic', labelDx: 0, labelDy: 0, labelAlign: 'center', color: 'warn' },
            { x: 0.85, y: 0.6, r: 0.1, label: 'hypersonic', labelDx: 0, labelDy: 0, labelAlign: 'center', color: 'bad' },
            { x: lg(7), y: 0, r: 5, label: 'M = 7', color: 'ink' }] },
        caption: 'What the programmer meant: the regimes (boundaries 0.8, 1.2 and 5 are conventional, not sharp physics). The question is what the code does.',
      },
      choices: ['`"transonic"`', '`"hypersonic"`', '`"supersonic"`', 'The code stops with an error'],
      answer: 0,
      why: {
        1: 'That is what the programmer meant. But Python tests the conditions top to bottom and takes the first true one.',
        2: '`M > 1.2` is true, but Python never gets that far: an earlier condition was already true.',
        3: 'Every branch is valid Python; the bug is in the logic, which is why it is dangerous.',
      },
      hints: ['An `if`/`elif` chain runs only the *first* branch whose condition is true.', 'Is `7 > 0.8`?'],
      teach: 'In an `if`/`elif` chain only the first true condition runs, so test the most restrictive condition first.',
      explain: t`\`7 > 0.8\` is already true, so \`regime\` becomes \`"transonic"\` and the rest is skipped. Put the tests in descending order — \`M > 5\`, then \`M > 1.2\`, then \`M > 0.8\` — and every Mach number lands in its regime.`,
    }),
    code({
      id: 'half-lives', difficulty: 2,
      prompt: t`A calibration source has an activity of 5.0 Ci, and each half-life halves it. Use a \`while\` loop to count how many half-lives pass before the activity is **below** 1 mCi (0.001 Ci). Store the count in \`n\` and the final activity in \`A\`.`,
      starter: t`A = 5.0       # Ci
n = 0
`,
      answer: t`A = 5.0       # Ci
n = 0
while A >= 0.001:
    A = A / 2
    n += 1
print(n, "half-lives, leaving", A, "Ci")`,
      tests: [
        { name: 'it takes 13 half-lives', code: 'n == 13' },
        { name: 'the final activity is below 1 mCi', code: 'A < 0.001 and A > 0.0005' },
      ],
      hints: ['Loop while the activity is still at least 0.001 Ci.', '`while A >= 0.001:` then halve `A` and add 1 to `n`.'],
      teach: 'A `while` loop is the tool when you know the stopping condition but not the number of steps.',
      explain: t`$5.0/2^{12} = 0.00122$ Ci is still above 1 mCi, and $5.0/2^{13} = 0.00061$ Ci is below, so $n = 13$. The loop's condition is the *opposite* of the stopping rule: it keeps going while $A \ge 0.001$.`,
    }),
    mcq({
      id: 'zip-short', difficulty: 2,
      prompt: t`One thrust reading was lost in transmission. What does this loop do?

\`\`\`python
times = [0.0, 0.1, 0.2, 0.3, 0.4]      # s
thrust = [0.0, 52.1, 49.8, 50.3]       # N
for t, F in zip(times, thrust):
    print(t, F)
\`\`\``,
      choices: [
        'It prints 4 lines: `zip` stops silently at the end of the shorter list',
        'It prints 5 lines, the last with `F` equal to `None`',
        'It stops with a `ValueError`, because the lists differ in length',
        'It prints 4 lines, then stops with an `IndexError`',
      ],
      answer: 0,
      why: {
        1: '`zip` never invents a value. `itertools.zip_longest` pads with `None`, but plain `zip` just stops.',
        2: 'Only `zip(times, thrust, strict=True)` checks the lengths. Without `strict=True` there is no error at all — which is the danger.',
        3: '`zip` never indexes past the end of anything; it simply stops making pairs.',
      },
      hints: ['`zip` makes pairs for as long as *both* lists have items.', 'Does plain `zip` check that the lengths match?'],
      teach: '`zip` stops at the shorter sequence without warning, so lost data can quietly misalign; `zip(..., strict=True)` turns that into an error.',
      explain: t`It prints 4 pairs and silently drops \`0.4\`. Worse, if the *third* reading had been lost, every later thrust would be paired with the wrong time. \`zip(times, thrust, strict=True)\` raises a \`ValueError\` instead — use it whenever the lists must match.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pairs', difficulty: 2,
      gen(r) {
        const n = r.int(5, 12);
        const pairs = (n * (n - 1)) / 2;
        return {
          prompt: t`A gravity code loops over every pair of ${n} bodies. What number does this print?

\`\`\`python
n = ${n}
count = 0
for i in range(n):
    for j in range(i + 1, n):
        count += 1          # one gravitational pull per pair
print(count)
\`\`\``,
          answer: pairs, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: n * n, feedback: t`The inner loop starts at \`i + 1\`, not 0: each pair is counted once and no body pulls on itself.` }, { value: (n * (n + 1)) / 2, feedback: t`For \`i = 0\` the inner loop runs ${n - 1} times, not ${n}: \`j\` starts at \`i + 1\`.` }],
          hints: [t`For \`i = 0\` the inner loop runs ${n - 1} times; for \`i = 1\`, ${n - 2} times; …`, t`Add $${n - 1} + ${n - 2} + \dots + 1 + 0$.`],
          teach: 'A loop over j > i visits each unordered pair once: n(n − 1)/2 pairs for n items.',
          explain: t`$${n - 1} + ${n - 2} + \dots + 0 = \frac{${n}\times${n - 1}}{2} = ${pairs}$. Every pair of bodies feels one mutual pull (Newton's third law gives the reaction for free), which is why the inner loop starts at \`i + 1\`.`,
        };
      },
    }),
    code({
      id: 'cp-kepler', difficulty: 3, transfer: true,
      prompt: t`To place a planet on its orbit you must solve **Kepler's equation** $E - e\sin E = M$ for the eccentric anomaly $E$, given the mean anomaly $M$ (which grows steadily with time) and the eccentricity $e$. Iterate $E \leftarrow M + e\sin E$, starting from $E = M$, until the change in one step is below $10^{-12}$. Mercury has $e = ${ECC}$; take $M = 1$ rad. Store the result in \`E\`.`,
      visual: {
        type: 'calc-series',
        params: { view: 'cobweb', rec: `${MEAN} + ${ECC}*sin(a)`, a1: MEAN, N: 6, readout: false, x: [0.97, 1.23], y: [0.97, 1.23], curveLabel: 'y = M + e sin x' },
        caption: 'The iteration as a cobweb: from each estimate, go up to the curve and across to the line y = x to get the next. Here aₙ is the nth estimate of E; the steps shrink by a factor of about 13 each time.',
      },
      starter: t`import math

e = ${ECC}      # Mercury's eccentricity
M = 1.0          # mean anomaly, rad
E = M
`,
      answer: t`import math

e = ${ECC}      # Mercury's eccentricity
M = 1.0          # mean anomaly, rad
E = M
while True:
    E_new = M + e * math.sin(E)
    if abs(E_new - E) < 1e-12:
        E = E_new
        break
    E = E_new
print(E)`,
      tests: [
        { name: t`$E = ${KEPLER_E.toFixed(10)}$ rad`, code: `abs(E - ${KEPLER_E}) < 1e-10` },
        { name: t`it satisfies Kepler's equation $E - e\sin E = M$`, code: `abs(E - ${ECC} * __import__('math').sin(E) - 1.0) < 1e-10` },
      ],
      hints: ['You do not know how many steps it will take, so use `while`.', 'Compute `E_new = M + e * math.sin(E)` each pass and compare it with `E`.', 'Inside `while True:`, `break` when `abs(E_new - E) < 1e-12`; otherwise set `E = E_new` and go round again.'],
      teach: 'An iteration loop runs until the answer stops changing — a `while` loop with a tolerance, never a test of exact equality.',
      explain: t`It settles to $E = ${KEPLER_E.toFixed(10)}$ rad in about a dozen steps, each shrinking the error by roughly $e\cos E \approx ${(ECC * Math.cos(KEPLER_E)).toFixed(3)}$. The same loop places a satellite on an elliptical orbit; for eccentricities near 1 it converges slowly, and Newton's method (lesson P9) does better.`,
    }),
    mcq({
      id: 'cp-break', difficulty: 1,
      prompt: t`A test stand watches chamber pressure (MPa) and reports the first reading over the 5.0 MPa limit. What does this print?

\`\`\`python
readings = [4.1, 4.4, 5.2, 4.9, 5.6]
for i, p in enumerate(readings):
    if p > 5.0:
        print(i, p)
        break
\`\`\``,
      choices: ['`2 5.2`', '`3 5.2`', '`4 5.6`', '`2 5.2` and then `4 5.6`'],
      answer: 0,
      why: {
        1: '`enumerate` counts from 0, like list indices: 5.2 is at index 2.',
        2: 'That is the last reading over the limit. `break` stops the loop at the first.',
        3: 'Without `break` it would print both; `break` leaves the loop immediately.',
      },
      hints: ['`enumerate` gives (0, 4.1), (1, 4.4), (2, 5.2), …', '`break` ends the loop the first time the condition is true.'],
      teach: '`enumerate` pairs each item with its index from 0, and `break` leaves the loop at once.',
      explain: t`The first reading over 5.0 is 5.2 at index 2; \`break\` stops the loop there, so 5.6 is never examined.`,
    }),
  ],
  sources: [
    { label: 'The Python Tutorial, §4: More control flow tools', url: 'https://docs.python.org/3/tutorial/controlflow.html' },
    { label: 'zip — Python built-in functions', url: 'https://docs.python.org/3/library/functions.html#zip' },
    { label: 'OpenStax University Physics Vol. 1, §13.5: Kepler’s laws of planetary motion', url: 'https://openstax.org/books/university-physics-volume-1/pages/13-5-keplers-laws-of-planetary-motion' },
  ],
});
