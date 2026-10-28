// Arrays and vectorized arithmetic — NumPy arrays, element-wise operations,
// ufuncs, reductions, dtypes; a Planck spectrum computed without a loop.
import { lesson, mcq, num, code } from '../../src/core/content.js';

const t = String.raw;

const H = 6.62607015e-34, C = 299792458, KB = 1.380649e-23, G0 = 9.80665;
const GM = 3.986004418e14, RE = 6371e3;
const planck = (lam, T) => (2 * H * C * C) / lam ** 5 / Math.expm1((H * C) / (lam * KB * T));
const WIEN = 2.897771955e-3;
const orbit = (hkm) => { const r = RE + hkm * 1e3, v = Math.sqrt(GM / r); return [v, (2 * Math.PI * r) / v / 60]; };

// molecular nitrogen at 300 K
const M_N2 = 28.0134 * 1.66053906660e-27;

export default lesson({
  id: 'prog.P3.1',
  title: 'Arrays and vectorized arithmetic',
  minutes: 10, difficulty: 2,
  intro: t`A NumPy **array** holds many numbers of one type in one block of memory, and arithmetic on it acts **element by element** in compiled code: \`B = f(lam)\` evaluates a formula at a million wavelengths with no Python loop. That is *vectorizing*. Planck's law for a blackbody's spectrum is the classic case:

$$B_\lambda(T) = \frac{2hc^2}{\lambda^5}\,\frac{1}{e^{hc/(\lambda k_B T)} - 1}$$

Written with \`np.exp\` instead of \`math.exp\`, one line gives the whole spectrum of the Sun.`,
  symbols: [
    { tex: t`B_\lambda(T)`, text: 'spectral radiance: power per area, per solid angle, per wavelength interval, in W m⁻² sr⁻¹ m⁻¹' },
    { tex: t`\lambda`, text: 'wavelength, in m — here a whole array of them, e.g. `np.linspace(100e-9, 3000e-9, 200_000)`' },
    { tex: 'T', text: 'the blackbody’s temperature, in K (the Sun’s photosphere: about 5772 K)' },
    { tex: 'h', text: 'Planck’s constant, $6.626\\times10^{-34}$ J s' },
    { tex: 'c', text: 'the speed of light, 299 792 458 m/s' },
    { tex: 'k_B', text: 'Boltzmann’s constant, $1.381\\times10^{-23}$ J/K' },
  ],
  why: 'Every scientific Python library is built on arrays; thinking in whole arrays rather than single numbers is the step from scripting to scientific computing.',
  visual: {
    type: 'code-runner',
    title: 'The Sun’s spectrum: a loop against one line',
    lead: t`Press **Run** (NumPy loads the first time). The same formula is evaluated at 200 000 wavelengths, once in a Python loop and once on the whole array. Compare the times, check the answers agree, and find the peak with \`argmax\`.`,
    tasks: ['Set `T = 3000.0` (a red dwarf) and watch the peak move into the infrared.', 'Replace `np.expm1` with `math.exp(...) - 1` in `planck_vec` and read the error.', 'Print `lam.dtype`, `lam.shape` and `lam.nbytes`.'],
    params: {
      rows: 27,
      code: t`import math, time
import numpy as np
import atlas.plot as plt

h, c, k = 6.62607015e-34, 299792458.0, 1.380649e-23     # SI, exact
T = 5772.0                                               # K, the Sun

lam = np.linspace(100e-9, 3000e-9, 200_000)              # m

def planck_loop(lams, T):
    out = []
    for L in lams:
        out.append(2*h*c**2 / L**5 / (math.exp(h*c / (L*k*T)) - 1))
    return out

def planck_vec(lam, T):
    return 2*h*c**2 / lam**5 / np.expm1(h*c / (lam*k*T))

planck_vec(lam, T)                                       # warm up once
t0 = time.perf_counter(); B_loop = planck_loop(lam.tolist(), T)
t1 = time.perf_counter(); B = planck_vec(lam, T)
t2 = time.perf_counter()
print(f"loop {t1 - t0:.3f} s, array {t2 - t1:.4f} s: {(t1 - t0) / (t2 - t1):.0f} times faster")
print("same answer:", np.allclose(B, B_loop))
print(f"peak at {lam[np.argmax(B)] * 1e9:.0f} nm; Wien's law: {2.897771955e-3 / T * 1e9:.0f} nm")

plt.plot(lam[::400] * 1e9, B[::400] / 1e12)
plt.xlabel("wavelength (nm)")
plt.ylabel("B (kW m⁻² sr⁻¹ nm⁻¹)")
plt.show()`,
    },
    caption: 'A blackbody at 5772 K. The real Sun’s spectrum has absorption lines and deviates from a blackbody in the ultraviolet. Speedups depend on the operation and the machine: in this browser’s Python they are often about 10×; plain arithmetic on large arrays gains more.',
  },
  example: {
    prompt: t`Tabulate the speed and period of circular orbits from 200 km to 2000 km above Earth, in steps of 200 km, without writing a loop. Use $v = \sqrt{GM/r}$, $T = 2\pi r/v$, $GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R_\oplus = 6371$ km.`,
    visual: {
      type: 'graph',
      params: { x: [0, 2100], y: [6.7, 8.0], aspect: 'wide', axesAt: 'edge', xlabel: 'altitude (km)', ylabel: 'v (km/s)',
        curves: [{ fn: `sqrt(${GM}/(${RE} + 1000*x))/1000`, color: 'accent', domain: [100, 2100] }],
        points: Array.from({ length: 10 }, (_, i) => ({ x: 200 * (i + 1), y: orbit(200 * (i + 1))[0] / 1000, color: 'gold', r: 3.5 })) },
      caption: 'Circular-orbit speed against altitude, with the ten altitudes the array holds. Higher orbits are slower.',
    },
    steps: [
      { label: 'Make the array', text: t`\`np.arange\` works like \`range\` but makes an array (and accepts floats). Convert units on the whole array at once:

\`\`\`python
import numpy as np
GM, R = 3.986004418e14, 6371e3
h = np.arange(200, 2001, 200)        # km: [200, 400, ..., 2000]
r = R + h * 1e3                      # m, ten radii in one line
\`\`\`` },
      { label: 'Use NumPy functions', text: t`Arithmetic acts element by element, and a scalar like \`GM\` is applied to every element. But \`math.sqrt(r)\` fails with a \`TypeError\`: the \`math\` module handles single numbers only. \`np.sqrt\` is a **ufunc** that acts on every element:

\`\`\`python
v = np.sqrt(GM / r)                  # m/s
T = 2 * np.pi * r / v / 60           # minutes
\`\`\`` },
      { label: 'Reduce and print', text: t`Reductions collapse an array to one number: \`v.max()\`, \`T.mean()\`, \`np.argmax(v)\` (the *index* of the largest). A loop is still fine for printing:

\`\`\`python
for hk, vk, Tk in zip(h, v, T):
    print(f"{hk:5d} km  {vk / 1000:.3f} km/s  {Tk:6.1f} min")
\`\`\`` },
      { label: 'Sense check', text: t`The 400 km row reads ${(orbit(400)[0] / 1000).toFixed(3)} km/s and ${orbit(400)[1].toFixed(1)} min — the ISS's orbit. Speed falls and period grows with height, as Kepler's third law says it must.` },
    ],
    answer: t`From ${(orbit(200)[0] / 1000).toFixed(3)} km/s and ${orbit(200)[1].toFixed(1)} min at 200 km to ${(orbit(2000)[0] / 1000).toFixed(3)} km/s and ${orbit(2000)[1].toFixed(1)} min at 2000 km, each column computed in one line.`,
  },
  practice: [
    mcq({
      id: 'list-vs-array', difficulty: 1,
      prompt: t`What does this print?

\`\`\`python
import numpy as np
print([1, 2, 3] * 2, np.array([1, 2, 3]) * 2)
\`\`\``,
      choices: ['`[1, 2, 3, 1, 2, 3] [2 4 6]`', '`[2, 4, 6] [2 4 6]`', '`[1, 2, 3, 1, 2, 3] [1 2 3 1 2 3]`', '`[2, 4, 6] [1 2 3 1 2 3]`'],
      answer: 0,
      why: {
        1: 'For a list, `*` repeats it — lists are containers, not vectors.',
        2: 'For an array, `*` multiplies every element: arrays behave like vectors.',
        3: 'Both halves are swapped: the list repeats and the array multiplies.',
      },
      hints: ['What does `*` mean for a list? For a string, `"ab" * 2` is `"abab"`.', 'NumPy arrays do arithmetic element by element.'],
      teach: 'Lists are containers (`*` repeats, `+` joins); arrays are numbers (`*` and `+` act element by element).',
      explain: t`The list is repeated, \`[1, 2, 3, 1, 2, 3]\`; the array is doubled, \`[2 4 6]\` (NumPy prints without commas). Convert with \`np.array(...)\` before doing arithmetic on data.`,
    }),
    num({
      id: 'linspace-step', difficulty: 1,
      gen(r) {
        const [a, b] = r.pick([[0, 10], [0, 2], [100, 3000], [0, 1]]), n = r.pick([11, 21, 51, 101, 201]);
        const step = (b - a) / (n - 1);
        return {
          prompt: t`What is the spacing between neighbouring values of this array?

\`\`\`python
x = np.linspace(${a}, ${b}, ${n})
\`\`\``,
          answer: step, tol: { rel: 1e-6 },
          errors: [{ value: (b - a) / n, feedback: t`\`linspace\` includes *both* ends, so ${n} points make ${n - 1} gaps.` }],
          hints: [t`\`np.linspace(a, b, n)\` gives n points from a to b, both included.`, t`n points have n − 1 gaps: spacing $(b - a)/(n - 1)$.`],
          teach: '`np.linspace(a, b, n)` includes both ends, so its spacing is (b − a)/(n − 1); `np.arange(a, b, step)` excludes b.',
          explain: t`$(${b} - ${a})/(${n} - 1) = ${+step.toPrecision(6)}$. This fencepost error is the classic slip with \`linspace\`: ${n} points but ${n - 1} intervals.`,
        };
      },
    }),
    mcq({
      id: 'int-dtype', difficulty: 3,
      prompt: t`A detector's channel counts are stored in an array; one channel is then corrected. What does this print?

\`\`\`python
import numpy as np
counts = np.array([1, 2, 3])
counts[0] = 2.7
print(counts)
\`\`\``,
      choices: ['`[2 2 3]`', '`[2.7 2.  3. ]`', '`[3 2 3]`', 'A `TypeError`: you cannot store a float in an int array'],
      answer: 0,
      why: {
        1: 'An array has one fixed type for all its elements, set when it was made. It does not change to float to hold 2.7.',
        2: 'The conversion truncates toward zero, like `int(2.7)`; it does not round.',
        3: 'NumPy converts silently, which is what makes this dangerous.',
      },
      hints: ['`np.array([1, 2, 3])` makes an integer array (`dtype` int64).', 'What does storing 2.7 into an integer slot do — round, truncate or refuse?'],
      teach: 'An array’s dtype is fixed: a float stored into an integer array is silently truncated — make float arrays with `np.array([1.0, 2, 3])` or `dtype=float`.',
      explain: t`\`counts\` has \`dtype\` int64, so 2.7 is truncated to 2 without a warning. Write \`np.array([1, 2, 3], dtype=float)\` when values may become fractional. The same trap hides in \`np.zeros(n, dtype=int)\` buffers and in images stored as \`uint8\`.`,
    }),
    code({
      id: 'vec-planck', difficulty: 2,
      prompt: t`Write \`planck(lam, T)\` returning $B_\lambda(T) = \dfrac{2hc^2}{\lambda^5}\,\dfrac{1}{e^{hc/(\lambda k_B T)} - 1}$ for a whole **array** of wavelengths \`lam\` (m), with no loop. Then set \`peak\` to the wavelength (m) at which the spectrum of a 3000 K star peaks, using \`np.argmax\` on the array \`lam\` given.`,
      visual: {
        type: 'graph',
        params: { x: [0, 3000], y: [-0.03, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'wavelength (nm)', ylabel: 'B / max',
          curves: [5772, 4500, 3000].map((T, i) => ({ fn: `${1 / planck(WIEN / T, T)}*${2 * H * C * C}/(x*1e-9)^5/(exp(${(H * C) / (KB * T)}/(x*1e-9)) - 1)`, domain: [60, 3000], color: ['gold', 'warn', 'bad'][i], label: `${T} K`, labelAt: WIEN / T * 1e9, labelDx: [-6, 6, 6][i], labelDy: -12, labelAlign: ['right', 'left', 'left'][i] })) },
        caption: 'Blackbody spectra at three temperatures, each scaled to its own peak so the shapes compare. Cooler bodies peak at longer wavelengths.',
      },
      starter: t`import numpy as np

h, c, k = 6.62607015e-34, 299792458.0, 1.380649e-23
lam = np.linspace(200e-9, 5000e-9, 48_001)     # m

def planck(lam, T):
    pass

peak = None
`,
      answer: t`import numpy as np

h, c, k = 6.62607015e-34, 299792458.0, 1.380649e-23
lam = np.linspace(200e-9, 5000e-9, 48_001)     # m

def planck(lam, T):
    return 2 * h * c**2 / lam**5 / (np.exp(h * c / (lam * k * T)) - 1)

peak = lam[np.argmax(planck(lam, 3000.0))]
print(peak)`,
      tests: [
        { name: 'it returns an array, one value per wavelength', code: 'isinstance(planck(lam, 3000.0), np.ndarray) and planck(lam, 3000.0).shape == lam.shape' },
        { name: t`$B_\lambda$ at 500 nm and 5772 K is $${(planck(500e-9, 5772) / 1e13).toFixed(3)}\times10^{13}$ W m⁻² sr⁻¹ m⁻¹`, code: `abs(planck(np.array([500e-9]), 5772.0)[0] / ${planck(500e-9, 5772)} - 1) < 1e-9` },
        { name: t`the 3000 K peak is at ${(WIEN / 3000 * 1e9).toFixed(0)} nm (Wien's law)`, code: `abs(peak - ${WIEN / 3000}) < 2e-10` },
      ],
      hints: ['Write the formula exactly as for one number, but with `np.exp` instead of `math.exp`.', '`np.argmax(B)` is the *index* of the largest value; `lam[np.argmax(B)]` is its wavelength.'],
      teach: 'A formula written with NumPy functions works unchanged on a single number or on an array of a million numbers.',
      explain: t`\`np.exp\` acts on every element, so one expression computes all 48 001 values. The peak lands at ${(WIEN / 3000 * 1e9).toFixed(0)} nm, matching Wien's law $\lambda_{\max} = b/T$ to the 0.1 nm grid spacing. (For very long wavelengths \`np.expm1\` is more accurate than \`np.exp(x) - 1\`, which loses digits when $x$ is small.)`,
    }),
    code({
      id: 'gas-temperature', difficulty: 2,
      prompt: t`A simulation gives the velocity components (m/s) of a million nitrogen molecules ($m = 4.652\times10^{-26}$ kg) as arrays \`vx\`, \`vy\`, \`vz\`. Without a loop, set \`KE\` to the array of each molecule's kinetic energy $\tfrac12 m(v_x^2 + v_y^2 + v_z^2)$, and \`T_gas\` to the temperature from $\langle KE\rangle = \tfrac32 k_B T$.`,
      starter: t`import numpy as np

k_B = 1.380649e-23        # J/K
m = ${M_N2}  # kg, one N2 molecule
rng = np.random.default_rng(2024)
vx, vy, vz = rng.normal(0.0, 298.4, size=(3, 1_000_000))    # m/s

KE = None
T_gas = None
`,
      answer: t`import numpy as np

k_B = 1.380649e-23        # J/K
m = ${M_N2}  # kg, one N2 molecule
rng = np.random.default_rng(2024)
vx, vy, vz = rng.normal(0.0, 298.4, size=(3, 1_000_000))    # m/s

KE = 0.5 * m * (vx**2 + vy**2 + vz**2)
T_gas = 2 * KE.mean() / (3 * k_B)
print(f"T = {T_gas:.1f} K")`,
      tests: [
        { name: 'one kinetic energy per molecule', code: 'isinstance(KE, np.ndarray) and KE.shape == (1_000_000,)' },
        { name: t`the energies are $\tfrac12 m v^2$`, code: 'np.allclose(KE[:5], 0.5 * m * (vx[:5]**2 + vy[:5]**2 + vz[:5]**2))' },
        { name: t`$T$ from the mean energy — close to 300 K`, code: 'abs(T_gas - 2 * (0.5 * m * (vx**2 + vy**2 + vz**2)).mean() / (3 * k_B)) < 1e-9 * T_gas and abs(T_gas - 300) < 3' },
      ],
      hints: ['Square and add whole arrays: `vx**2 + vy**2 + vz**2`.', '`KE.mean()` is the average; then `T_gas = 2 * KE.mean() / (3 * k_B)`.'],
      teach: 'Element-wise arithmetic plus a reduction (`mean`, `sum`, `max`) replaces the loop-and-accumulate pattern.',
      explain: t`Each velocity component was drawn with standard deviation $\sqrt{k_BT/m} = 298.4$ m/s for $T = 300$ K, so the computed temperature lands within a fraction of a kelvin of 300 — the statistical scatter of a million molecules. The whole calculation is three array operations and a mean.`,
    }),
    mcq({
      id: 'star-elementwise', difficulty: 2,
      prompt: t`A force and a displacement are stored as arrays. What does \`W\` hold?

\`\`\`python
F = np.array([3.0, 0.0, -2.0])     # N
d = np.array([4.0, 5.0, 1.0])      # m
W = F * d
\`\`\``,
      choices: ['The array `[12.  0. -2.]`: `*` multiplies element by element', 'The work, `10.0` J: `*` is the dot product', 'An error: vectors cannot be multiplied with `*`', 'The 3 × 3 matrix of all products'],
      answer: 0,
      why: {
        1: 'The dot product is `F @ d` or `np.dot(F, d)`. `*` pairs up elements and multiplies them.',
        2: 'Arrays of the same shape multiply happily — element by element.',
        3: 'That outer product is `np.outer(F, d)`.',
      },
      hints: ['NumPy operators act element by element.', 'Which operator gives the dot product?'],
      teach: '`*` is element-wise; the dot product $\\vec F\\cdot\\vec d$ is `F @ d` (or `np.dot`), and `(F * d).sum()` is the same thing spelled out.',
      explain: t`\`F * d\` is \`[12., 0., -2.]\`; the work $W = \vec F\cdot\vec d = 10$ J is \`F @ d\` — the sum of those products.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-mass-ratio', difficulty: 2, transfer: true,
      prompt: t`Mission planners tabulate the **propellant mass fraction** $1 - e^{-\Delta v/(I_{\text{sp}} g_0)}$ against $\Delta v$. With \`dv = np.linspace(0, 12000, 121)\` (m/s), set \`frac_ker\` and \`frac_hyd\` to the fractions for kerosene ($I_{\text{sp}} = 311$ s) and hydrogen ($I_{\text{sp}} = 450$ s) engines — no loops — and \`saving\` to the largest difference \`frac_ker - frac_hyd\` over the table.`,
      visual: {
        type: 'graph',
        params: { x: [0, 12], y: [0, 1.05], aspect: 'wide', axesAt: 'edge', xlabel: 'Δv (km/s)', ylabel: 'propellant fraction',
          curves: [{ fn: `1 - exp(-1000x/(311*${G0}))`, color: 'warn', label: 'Isp 311 s', labelAt: 3.2, labelDx: -78, labelDy: -6 }, { fn: `1 - exp(-1000x/(450*${G0}))`, color: 'accent', label: 'Isp 450 s', labelAt: 5, labelDy: 16 }] },
        caption: 'Ideal rocket equation, single stage, no gravity or drag losses. Reaching orbit takes about 9.4 km/s of Δv once the losses are included.',
      },
      starter: t`import numpy as np

g0 = 9.80665
dv = np.linspace(0, 12000, 121)     # m/s
frac_ker = None
frac_hyd = None
saving = None
`,
      answer: t`import numpy as np

g0 = 9.80665
dv = np.linspace(0, 12000, 121)     # m/s
frac_ker = 1 - np.exp(-dv / (311 * g0))
frac_hyd = 1 - np.exp(-dv / (450 * g0))
saving = (frac_ker - frac_hyd).max()
print(f"largest saving: {saving:.3f} of the vehicle's mass")`,
      tests: [
        { name: 'two arrays of 121 fractions', code: 'frac_ker.shape == (121,) and frac_hyd.shape == (121,)' },
        { name: t`at 9.4 km/s: ${(1 - Math.exp(-9400 / (311 * G0))).toFixed(3)} (kerosene) and ${(1 - Math.exp(-9400 / (450 * G0))).toFixed(3)} (hydrogen)`, code: `abs(frac_ker[94] - ${1 - Math.exp(-9400 / (311 * G0))}) < 1e-12 and abs(frac_hyd[94] - ${1 - Math.exp(-9400 / (450 * G0))}) < 1e-12` },
        { name: 'the largest difference over the table', code: `abs(saving - ${Math.max(...Array.from({ length: 121 }, (_, i) => Math.exp(-(100 * i) / (450 * G0)) - Math.exp(-(100 * i) / (311 * G0))))}) < 1e-12` },
      ],
      hints: ['`np.exp` acts on the whole `dv` array: `1 - np.exp(-dv / (311 * g0))`.', 'Subtract the two arrays and take `.max()`.'],
      teach: 'A table of a formula is one array expression; questions about the table are reductions like `max`, `argmax` and `mean`.',
      explain: t`At the 9.4 km/s an orbit needs, a kerosene single stage must be ${(100 * (1 - Math.exp(-9400 / (311 * G0)))).toFixed(0)}% propellant, a hydrogen one ${(100 * (1 - Math.exp(-9400 / (450 * G0)))).toFixed(0)}% — the reason real launchers use stages. The hydrogen advantage peaks mid-table, where the two curves are farthest apart.`,
    }),
    mcq({
      id: 'cp-why-fast', difficulty: 2,
      prompt: t`Why does \`np.sum(x * x)\` on a million floats run tens of times faster than this loop?

\`\`\`python
s = 0.0
for v in x_list:
    s += v * v
\`\`\``,
      choices: [
        'The array’s numbers sit side by side with one known type, so a compiled loop runs over them without Python examining each object',
        'NumPy runs the calculation on the graphics card',
        'NumPy skips elements whose square is too small to matter',
        'NumPy always splits the work across every core of the processor',
      ],
      answer: 0,
      why: {
        1: 'Plain NumPy runs on the CPU; GPU array libraries (CuPy, JAX) are separate packages.',
        2: 'NumPy computes every element exactly as asked — it never drops terms.',
        3: 'Element-wise operations in NumPy run on one core; the speed comes from compiled code, not parallelism (only some linear algebra uses several cores).',
      },
      hints: ['What does the Python loop have to do for each `v` before it can multiply?', 'A Python float is a full object with a type to check; an array element is just 8 bytes.'],
      teach: 'Vectorized code is fast because one compiled loop runs over raw, same-typed numbers, avoiding the interpreter’s per-element work.',
      explain: t`Each pass of the Python loop fetches an object, checks its type, dispatches the multiply and creates a new float object. NumPy's loop runs in C over contiguous 8-byte doubles. The cost: arrays have one fixed type and size, and very elementwise-heavy code still benefits from compilers such as Numba.`,
    }),
    num({
      id: 'cp-memory', difficulty: 2,
      gen(r) {
        const [shape, desc] = r.pick([[[4096, 4096], 'a 4096 × 4096 image from a CCD camera'], [[512, 512, 512], 'a 512 × 512 × 512 density grid from a cosmological simulation'], [[1000, 1000, 3], 'the 3-D separation vectors between every pair of 1000 stars, shape (1000, 1000, 3)']]);
        const n = shape.reduce((a, b) => a * b, 1), MB = (8 * n) / 1e6;
        return {
          prompt: t`How many megabytes ($10^6$ bytes) does a float64 array holding ${desc} occupy?

\`\`\`python
a = np.zeros((${shape.join(', ')}))     # dtype float64 by default
print(a.nbytes / 1e6)
\`\`\``,
          answer: MB, tol: { rel: 0.005 },
          errors: [{ value: MB / 2, feedback: 'float64 uses 8 bytes per number, not 4 (that is float32).' }, { value: n / 1e6, feedback: 'That counts the numbers. Each float64 takes 8 bytes.' }],
          hints: ['Count the elements: multiply the dimensions.', 'Each float64 element is 8 bytes.'],
          teach: 'An array’s memory is its number of elements times the bytes per element (8 for float64): check `a.nbytes` before allocating something huge.',
          explain: t`$${shape.join('\\times')} = ${n.toLocaleString('en-US').replace(/,/g, '{,}')}$ elements $\times\,8$ bytes $= ${MB.toFixed(1)}$ MB. Memory, not speed, is often the real limit of array code — a quadratic intermediate array grows fast.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'NumPy: the absolute basics for beginners', url: 'https://numpy.org/doc/stable/user/absolute_beginners.html' },
    { label: 'NumPy: Universal functions (ufunc)', url: 'https://numpy.org/doc/stable/reference/ufuncs.html' },
    { label: 'OpenStax University Physics Vol. 3, §6.1: Blackbody radiation', url: 'https://openstax.org/books/university-physics-volume-3/pages/6-1-blackbody-radiation' },
  ],
});
