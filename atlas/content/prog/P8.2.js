// scipy.integrate.quad — adaptive Gauss–Kronrod quadrature with an error
// estimate; infinite limits, endpoint and interior singularities, points=,
// what the estimate does and does not promise; the large-amplitude pendulum,
// the Stefan–Boltzmann constant, and the Earth falling into the Sun.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { ellipK } from './_numkit.js';

const t = String.raw;

// the pendulum: T/T0 = (2/π) K(m), m = sin²(θ0/2)
const ratio = (th) => (2 / Math.PI) * ellipK(Math.sin(th / 2) ** 2);
const ratioWrongK = (th) => (2 / Math.PI) * ellipK(Math.sin(th / 2));
const R90 = ratio(Math.PI / 2);
// what quad printed for the 90° integral in this Pyodide build (checked by running it)
const QUAD90 = { I: 2.6220575542920246, err: 2.820915501189347e-9 };
const pser = (th) => 1 + th ** 2 / 16 + (11 * th ** 4) / 3072;
const SER90 = 1 + (Math.PI / 2) ** 2 / 16 + (11 * (Math.PI / 2) ** 4) / 3072;

// Stefan–Boltzmann from SI constants (exact since 2019)
const H = 6.62607015e-34, C = 299792458, KB = 1.380649e-23;
const SIGMA = (2 * Math.PI ** 5 * KB ** 4) / (15 * H ** 3 * C ** 2);

// the Earth falling into a point-mass Sun from rest at 1 AU
const GM_SUN = 1.32712440018e20, AU = 1.495978707e11, R_SUN = 6.957e8;
const T_FALL = (Math.PI / 2) * Math.sqrt(AU ** 3 / (2 * GM_SUN));
// time left when the Sun's surface is reached: t(r) = √(R³/2GM) [√(x(1−x)) + acos √x], x = r/R
const tReach = (r) => { const x = r / AU; return Math.sqrt(AU ** 3 / (2 * GM_SUN)) * (Math.sqrt(x * (1 - x)) + Math.acos(Math.sqrt(x))); };
const SURFACE_EARLY = T_FALL - tReach(R_SUN);   // s: the surface is reached this much before the centre

export default lesson({
  id: 'prog.P8.2',
  title: 'scipy.integrate.quad',
  minutes: 11, difficulty: 3,
  intro: t`\`scipy.integrate.quad(f, a, b)\` is the integrator to reach for first. It samples $f$ with a 21-point Gauss–Kronrod rule, estimates the error on each piece, and keeps splitting the pieces where the estimate is largest until the total is below its tolerance (about $1.5\times10^{-8}$ relative by default). It returns **two** numbers: the value and an **estimate of its absolute error**. It takes infinite limits (\`np.inf\`) and integrable endpoint singularities in its stride, which makes it the tool for integrals like the period of a pendulum swinging far from small angles:

$$\frac{T}{T_0} = \frac{\sqrt2}{\pi}\int_0^{\theta_0}\frac{d\theta}{\sqrt{\cos\theta - \cos\theta_0}}$$

The integrand blows up at $\theta = \theta_0$, where the bob momentarily stops — yet the area under it is finite, and \`quad\` finds it to 13 digits.`,
  symbols: [
    { tex: 'T', text: 'the period of a pendulum released from rest at angle $\\theta_0$, in s' },
    { tex: 'T_0 = 2\\pi\\sqrt{L/g}', text: 'the small-angle period, for length $L$ and gravitational acceleration $g$' },
    { tex: t`\theta_0`, text: 'the release angle (the amplitude), in radians' },
    { tex: t`\theta`, text: 'the angle of the pendulum during the swing: the variable of integration' },
    { tex: t`\cos\theta - \cos\theta_0`, text: 'proportional to the kinetic energy at angle $\\theta$; it vanishes at the turning point, which makes the integrand infinite there' },
  ],
  why: 'Normalizations, expectation values, orbital periods, cross-sections and every integral in a cosmology code reach for an adaptive integrator; knowing what its error estimate means is knowing when to believe it.',
  visual: {
    type: 'code-runner',
    title: 'quad at work',
    lead: t`Press **Run**. Three integrals print as \`(value, error estimate)\`: a smooth one, one with a singularity at 0, and the Stefan–Boltzmann integral to infinity. Then \`quad\` computes the pendulum's period for release angles up to 175°, against the elliptic-integral formula and the series from lesson P5.2.`,
    tasks: [
      'Compare each error estimate with the true error: the third value differs from π⁴/15 by about 10⁻¹⁵, far less than its estimate of 3 × 10⁻⁹. The estimate is cautious.',
      `Read where the θ₀⁴ series leaves the exact curve: within 0.1% up to 60°, ${(100 * (1 - pser(2 * Math.PI / 3) / ratio(2 * Math.PI / 3))).toFixed(0)}% low at 120°, ${(100 * (1 - pser(5 * Math.PI / 6) / ratio(5 * Math.PI / 6))).toFixed(0)}% low at 150°.`,
      'Try `print(quad(lambda x: np.sin(x) / x, 0, np.inf))`: a warning, and an error estimate larger than the value.',
    ],
    params: {
      rows: 27,
      code: t`import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import quad
from scipy.special import ellipk

# quad returns the value AND an estimate of its absolute error
print(quad(lambda x: np.exp(-x**2), 0, 1))
print(quad(lambda x: 1 / np.sqrt(x), 0, 1))             # singular at 0: exactly 2
print(quad(lambda x: x**3 / np.expm1(x), 0, np.inf))   # Stefan–Boltzmann: π⁴/15
print(np.pi**4 / 15)

# a pendulum released at θ0: T/T0 = (√2/π) ∫ dθ / √(cos θ − cos θ0), singular at θ0
def ratio(theta0):
    I, err = quad(lambda th: 1 / np.sqrt(np.cos(th) - np.cos(theta0)), 0, theta0)
    return np.sqrt(2) / np.pi * I

deg = np.arange(5, 176, 5)
th = np.radians(deg)
fig, ax = plt.subplots()
ax.plot(deg, [ratio(a) for a in th], "o", ms=4, label="quad")
ax.plot(deg, 2 / np.pi * ellipk(np.sin(th / 2)**2), label="(2/π) K(m), m = sin²(θ₀/2)")
ax.plot(deg, 1 + th**2 / 16 + 11 * th**4 / 3072, "--", label="series to θ₀⁴")
ax.set_xlabel("release angle θ₀ (degrees)")
ax.set_ylabel("T / T₀")
ax.set_ylim(0.95, 3)
ax.legend()
plt.show()`,
    },
    caption: 'A rigid, massless rod and no friction. Near 180° the period grows without bound: a pendulum balanced upside down takes forever to start falling.',
  },
  example: {
    prompt: t`A pendulum is released from horizontal, $\theta_0 = 90°$. How much longer than the small-angle $T_0$ is its period? Use \`quad\` on the singular integral above and check the result two independent ways.`,
    visual: {
      type: 'graph',
      params: { x: [0, 1.85], y: [0, 6], aspect: 'wide', axesAt: 'edge', xlabel: 'θ (rad)', ylabel: '1/√(cos θ − cos θ₀)',
        curves: [{ fn: '1/sqrt(cos(x))', color: 'accent', domain: [0, 1.5636] }],
        shade: [{ fn: 'min(1/sqrt(cos(x)), 6)', from: 0, to: 1.5636, color: 'accent', alpha: 0.18 }],
        vlines: [{ x: Math.PI / 2, label: 'θ₀ = π/2', color: 'gold' }] },
      caption: 'The integrand for θ₀ = 90°: it rises without bound at the turning point, yet like 1/√(θ₀ − θ), so the shaded area is finite.',
    },
    steps: [
      { label: 'Write the integrand', text: t`With $\theta_0 = \pi/2$, $\cos\theta_0 = 0$ and the integrand is $1/\sqrt{\cos\theta}$. Pass $\theta_0$ through \`args\` so the same function serves every amplitude:

\`\`\`python
import numpy as np
from scipy.integrate import quad
f = lambda th, th0: 1 / np.sqrt(np.cos(th) - np.cos(th0))
I, err = quad(f, 0, np.pi / 2, args=(np.pi / 2,))
print(I, err, np.sqrt(2) / np.pi * I)
\`\`\`` },
      { label: 'Read the output', text: t`It prints $I = ${QUAD90.I.toFixed(10)}$ with an error estimate of $${tex(QUAD90.err, 2)}$, so $T/T_0 = ${R90.toFixed(10)}$. Gauss–Kronrod nodes never sit exactly on the endpoints, so the infinity at $\pi/2$ is never evaluated; the adaptive subdivision crowds samples towards it instead.` },
      { label: 'Check against K(m)', text: t`The same integral is a complete elliptic integral: $T/T_0 = \frac2\pi K(m)$ with $m = \sin^2(\theta_0/2)$. SciPy's \`ellipk\` takes the **parameter** $m$, not the modulus $k = \sin(\theta_0/2)$:

\`\`\`python
from scipy.special import ellipk
print(2 / np.pi * ellipk(np.sin(np.pi / 4)**2))     # ${R90.toFixed(10)}
\`\`\`

The two agree to about 13 digits. Passing $k$ by mistake gives ${ratioWrongK(Math.PI / 2).toFixed(4)}, 12% too long.` },
      { label: 'Check against the series', text: t`Lesson P5.2's series, $1 + \theta_0^2/16 + 11\theta_0^4/3072$, gives ${SER90.toFixed(4)} at $\theta_0 = \pi/2$: close, but ${(100 * (R90 - SER90)).toFixed(1)} percentage points short. At 90° the omitted $\theta_0^6$ terms matter; \`quad\` does not truncate anything.` },
    ],
    answer: t`$T = ${R90.toFixed(6)}\,T_0$: released from horizontal, a pendulum takes ${(100 * (R90 - 1)).toFixed(1)}% longer per swing than the small-angle formula says.`,
  },
  practice: [
    mcq({
      id: 'tuple', difficulty: 2,
      prompt: t`A student doubles an integral. What is printed?

\`\`\`python
from scipy.integrate import quad
I = quad(lambda x: x, 0, 1)
print(2 * I)
\`\`\``,
      choices: ['`(0.5, 5.551115123125783e-15, 0.5, 5.551115123125783e-15)`: `quad` returns a tuple, and `2 *` repeats it', '`1.0`', '`(1.0, 1.1102230246251566e-14)`', 'A `TypeError`: a tuple cannot be multiplied'],
      answer: 0,
      why: {
        1: 'I is the tuple (value, error), not the value. Unpack it: `I, err = quad(...)`.',
        2: 'Multiplying a tuple by an integer does not multiply its elements: it repeats the tuple.',
        3: 'Python allows `2 * tuple` — it concatenates two copies, which is why the slip is silent.',
      },
      hints: ['What type does `quad` return?', 'What does `2 * (a, b)` give for a Python tuple?'],
      teach: '`quad` returns (value, abserr): always unpack, `I, err = quad(f, a, b)`, and look at err.',
      explain: t`\`quad\` returns \`(0.5, 5.55e-15)\`; doubling a tuple concatenates it with itself. Unpacking, \`I, err = quad(...)\`, avoids the trap and keeps the error estimate in view, where it belongs.`,
    }),
    code({
      id: 'stefan-boltzmann', difficulty: 2,
      prompt: t`The power a blackbody radiates per square metre is $\sigma T^4$, with $\sigma = \dfrac{2\pi k_B^4}{h^3c^2}\displaystyle\int_0^\infty\frac{x^3}{e^x - 1}\,dx$. Set \`I\` to the integral using \`quad\` (write the denominator with \`np.expm1\`), and \`sigma\` to the Stefan–Boltzmann constant in W m⁻² K⁻⁴.`,
      starter: t`import numpy as np
from scipy.integrate import quad

h, c, kB = 6.62607015e-34, 299792458.0, 1.380649e-23    # SI, exact

I = None
sigma = None
`,
      answer: t`import numpy as np
from scipy.integrate import quad

h, c, kB = 6.62607015e-34, 299792458.0, 1.380649e-23    # SI, exact

I, err = quad(lambda x: x**3 / np.expm1(x), 0, np.inf)
sigma = 2 * np.pi * kB**4 / (h**3 * c**2) * I
print(I, err, sigma)`,
      tests: [
        { name: t`the integral is $\pi^4/15 = 6.4939\ldots$`, code: 'abs(I - np.pi**4 / 15) < 1e-9' },
        { name: t`$\sigma = ${SIGMA.toPrecision(10).replace(/e-8$/, '')}\times10^{-8}$ W m⁻² K⁻⁴`, code: `abs(sigma / ${SIGMA} - 1) < 1e-9` },
      ],
      hints: ['`quad(lambda x: x**3 / np.expm1(x), 0, np.inf)` returns (value, error).', 'Unpack: `I, err = quad(...)`, then multiply by `2 * np.pi * kB**4 / (h**3 * c**2)`.'],
      teach: '`quad` handles infinite limits by mapping them onto a finite interval; pass `np.inf` and let it work.',
      explain: t`\`quad\` returns $6.49393940226683$ — $\pi^4/15$ to 15 digits — and $\sigma = ${tex(SIGMA, 7)}$ W m⁻² K⁻⁴, the CODATA value (exact, since 2019, because $h$, $c$ and $k_B$ are). \`np.expm1(x)\` keeps the integrand accurate at small $x$, where $e^x - 1$ would cancel; at large $x$ it overflows harmlessly to \`inf\`, making the integrand 0.`,
    }),
    mcq({
      id: 'narrow-peak', difficulty: 3,
      prompt: t`A spectral line is modelled as a narrow Gaussian of width 1 (in some frequency unit) centred at $5\times10^{6}$. Its area is $\sqrt{2\pi} \approx 2.5066$. What does \`quad\` return, and what does it mean?

\`\`\`python
f = lambda x: np.exp(-(x - 5e6)**2 / 2)
print(quad(f, 0, 1e10))
\`\`\``,
      choices: [
        '`(0.0, 0.0)`: no sample landed on the peak, so quad saw a function that is zero everywhere — and reported zero error with confidence',
        '`(2.5066282746310002, 1e-9)`: adaptive quadrature always finds the peak',
        'An `IntegrationWarning` and a large error estimate',
        '`(inf, inf)`, because the interval is too long',
      ],
      answer: 0,
      why: {
        1: 'Adaptivity refines where the samples disagree. If every sample is 0, nothing disagrees, and there is nowhere to refine.',
        2: 'No warning: by its own sampling the integral converged at once.',
        3: 'A long interval is fine in itself; the problem is a feature far narrower than the sample spacing.',
      },
      hints: ['The first 21 samples are spread across [0, 10¹⁰]. How likely is one to fall within a few units of 5 × 10⁶?', 'An error estimate is built from the samples: what can it say about a feature no sample saw?'],
      teach: 'An error estimate only covers what the samples saw: tell quad where the action is — sensible limits, or `points=` for known features — and never trust a zero error estimate blindly.',
      explain: t`\`quad\` returns \`(0.0, 0.0)\`. Integrating over \`(5e6 - 50, 5e6 + 50)\` gives 2.50662827465, the right area to 11 digits, at once. The error estimate is a statement about the samples, not about your function: features narrower than the first sampling — spectral lines, resonances, a transit in a long light curve — can be missed silently.`,
    }),
    mcq({
      id: 'ellipk-m', difficulty: 2,
      prompt: t`For a pendulum released at 10°, a program computes $T/T_0 = \frac2\pi K$. Which line is right?

\`\`\`python
from scipy.special import ellipk
th0 = np.radians(10)
a = 2 / np.pi * ellipk(np.sin(th0 / 2))        # (a)
b = 2 / np.pi * ellipk(np.sin(th0 / 2)**2)     # (b)
\`\`\``,
      visual: {
        type: 'graph',
        params: { x: [0, 100], y: [0.99, 1.4], aspect: 'wide', axesAt: 'edge', xlabel: 'release angle θ₀ (degrees)', ylabel: 'T / T₀',
          curves: [{ fn: '1 + (x*pi/180)^2/16 + 11*(x*pi/180)^4/3072', color: 'ink3', dash: true, domain: [0, 95], label: 'small-angle series', labelAt: 62, labelDx: 4, labelDy: 20 }],
          points: [10, 20, 30, 40, 50, 60, 70, 80, 90].flatMap((d) => [{ x: d, y: ratio((d * Math.PI) / 180), color: 'accent', r: 3.5 }, { x: d, y: ratioWrongK((d * Math.PI) / 180), color: 'bad', r: 3.5 }]),
          legend: [{ label: 'one of the two lines', color: 'accent', point: true }, { label: 'the other line', color: 'bad', point: true }], legendAt: 'tl' },
        caption: 'What the two lines give at each release angle, beside the series from lesson P5.2. Which colour is which line is for you to work out.',
      },
      choices: ['(b): SciPy’s `ellipk` takes the parameter m = k² = sin²(θ₀/2)', '(a): K takes the modulus k = sin(θ₀/2)', 'Both: `ellipk` detects which convention you mean', 'Neither: K needs θ₀ in degrees'],
      answer: 0,
      why: {
        1: 'Many tables write K(k) with the modulus; SciPy’s documentation defines ellipk(m) with m = k². Passing k makes a 10° pendulum 2% slow — absurd for so small an angle.',
        2: 'A function cannot know which convention you had in mind; it computes K of whatever number it gets.',
        3: 'The argument is sin(θ₀/2), which numpy computes from radians.',
      },
      hints: ['At 10° the period should exceed T₀ by only about θ₀²/16 ≈ 0.2%. Which line gives that?', 'Read SciPy’s definition: ellipk(m) = ∫ dt/√(1 − m sin²t).'],
      teach: 'Conventions differ between books and libraries: SciPy’s ellipk(m) takes m = k². A sanity check against a known limit catches a wrong convention at once.',
      explain: t`(b) gives ${ratio((10 * Math.PI) / 180).toFixed(6)}, matching $1 + \theta_0^2/16$; (a) gives ${ratioWrongK((10 * Math.PI) / 180).toFixed(4)}, 2% too slow, a gross error for a 10° swing. The check against a known limit — here the small-angle series — is what catches convention errors.`,
    }),
    code({
      id: 'pendulum-quad', difficulty: 3,
      prompt: t`Write \`period_ratio(theta0)\` returning $T/T_0 = \frac{\sqrt2}{\pi}\int_0^{\theta_0}\frac{d\theta}{\sqrt{\cos\theta - \cos\theta_0}}$ for a release angle \`theta0\` in **radians**, computed with \`quad\`. The tests compare with SciPy's elliptic integral at 30°, 120° and 170°.`,
      starter: t`import numpy as np
from scipy.integrate import quad
from scipy.special import ellipk     # for checking

def period_ratio(theta0):
    pass
`,
      answer: t`import numpy as np
from scipy.integrate import quad
from scipy.special import ellipk     # for checking

def period_ratio(theta0):
    I, err = quad(lambda th: 1 / np.sqrt(np.cos(th) - np.cos(theta0)), 0, theta0)
    return np.sqrt(2) / np.pi * I

print(period_ratio(np.radians(120)))`,
      tests: [
        { name: t`30°: $T/T_0 = ${ratio(Math.PI / 6).toFixed(6)}$`, code: 'abs(period_ratio(np.radians(30)) - 2 / np.pi * ellipk(np.sin(np.radians(15))**2)) < 1e-8' },
        { name: t`120°: $T/T_0 = ${ratio((2 * Math.PI) / 3).toFixed(6)}$`, code: 'abs(period_ratio(np.radians(120)) - 2 / np.pi * ellipk(np.sin(np.radians(60))**2)) < 1e-8' },
        { name: t`170°: $T/T_0 = ${ratio((17 * Math.PI) / 18).toFixed(5)}$`, code: 'abs(period_ratio(np.radians(170)) - 2 / np.pi * ellipk(np.sin(np.radians(85))**2)) < 1e-7' },
      ],
      hints: ['`I, err = quad(lambda th: 1 / np.sqrt(np.cos(th) - np.cos(theta0)), 0, theta0)`.', 'Return `np.sqrt(2) / np.pi * I`.'],
      teach: '`quad` integrates through integrable endpoint singularities: its nodes never land on the endpoints, and adaptive subdivision does the rest.',
      explain: t`At 170° the period is ${ratio((17 * Math.PI) / 18).toFixed(3)} times $T_0$. The integrand is infinite at $\theta_0$, but like $1/\sqrt{\theta_0 - \theta}$, which is integrable; \`quad\` reaches 8 or more correct digits without help. (Substituting $\sin(\theta/2) = \sin(\theta_0/2)\sin\phi$ removes the singularity altogether — it is how the elliptic-integral form is derived.)`,
    }),
    mcq({
      id: 'interior', difficulty: 2,
      prompt: t`$\int_{-1}^{1}\frac{dx}{\sqrt{\lvert x\rvert}} = 4$, but \`quad\` returns \`(inf, inf)\`. What fixes it?

\`\`\`python
f = lambda x: 1 / np.sqrt(abs(x))
print(quad(f, -1, 1))                 # (inf, inf), with a warning
\`\`\``,
      visual: {
        type: 'graph',
        params: { x: [-1.1, 1.1], y: [0, 6], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '1/√|x|',
          curves: [{ fn: '1/sqrt(abs(x))', color: 'accent', domain: [-1, -0.028] }, { fn: '1/sqrt(abs(x))', color: 'accent', domain: [0.028, 1] }], vlines: [{ x: 0, color: 'bad' }] },
        caption: 'An integrable singularity in the middle of the interval, where the midpoint sample of the first Gauss–Kronrod rule falls.',
      },
      choices: [
        '`quad(f, -1, 1, points=[0])` — or two integrals, from −1 to 0 and 0 to 1 — so that the singularity sits at an endpoint, where no sample is taken',
        'Raise the subdivision limit: `quad(f, -1, 1, limit=1000)`',
        'Tighten the tolerance: `epsabs=1e-14`',
        'Nothing: the integral diverges',
      ],
      answer: 0,
      why: {
        1: 'More subdivisions do not help when the very first sample is infinite: the result is already inf.',
        2: 'A tolerance cannot repair an infinite sample.',
        3: 'Near 0 the integrand behaves like |x|^(−1/2), which is integrable: each half contributes 2.',
      },
      hints: ['The Gauss–Kronrod rule on [−1, 1] includes the midpoint x = 0. What is f(0)?', 'quad never samples the endpoints of an interval.'],
      teach: 'Put trouble at an endpoint: split the integral, or pass `points=[…]` with the locations of singularities and kinks, so quad treats each piece separately.',
      explain: t`\`quad(f, -1, 1, points=[0])\` returns \`(3.9999999999999813, 5.7e-14)\`. With the singularity at the ends of two subintervals it is never sampled, and the endpoint behaviour is handled as in \`quad(lambda x: 1/np.sqrt(x), 0, 1)\`. Use \`points\` for kinks and jumps too, such as a thrust curve at burnout.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-fall', difficulty: 3, transfer: true,
      prompt: t`If Earth stopped in its orbit, how long would it take to fall into the Sun? Starting from rest at $R = 1$ AU, energy conservation gives the speed at distance $r$, and the fall time is

$$t = \int_0^{R}\frac{dr}{\sqrt{2GM_\odot\left(\dfrac1r - \dfrac1R\right)}}$$

(singular at $r = R$, where the fall starts from rest). Set \`t_days\` to this time in days, using \`quad\`, with $GM_\odot = 1.32712440018\times10^{20}\ \text{m}^3/\text{s}^2$ and $R = 1.495978707\times10^{11}$ m.`,
      starter: t`import numpy as np
from scipy.integrate import quad

GM = 1.32712440018e20       # m³/s²
R = 1.495978707e11          # m

t_days = None
`,
      answer: t`import numpy as np
from scipy.integrate import quad

GM = 1.32712440018e20       # m³/s²
R = 1.495978707e11          # m

t, err = quad(lambda r: 1 / np.sqrt(2 * GM * (1 / r - 1 / R)), 0, R)
t_days = t / 86400
print(t_days, err)`,
      tests: [
        { name: t`the fall takes ${(T_FALL / 86400).toFixed(2)} days`, code: `abs(t_days - ${T_FALL / 86400}) < 0.01` },
      ],
      hints: ['`quad(lambda r: 1 / np.sqrt(2 * GM * (1 / r - 1 / R)), 0, R)` — both endpoints are harmless to quad, which never samples them.', 'Unpack `t, err = ...` and divide t by 86 400 s.'],
      teach: 'An endpoint singularity like 1/√(R − r) needs no special treatment from quad; just check the error estimate it returns.',
      explain: t`$t = ${(T_FALL / 86400).toFixed(2)}$ days. The exact answer is $\frac{\pi}{2}\sqrt{R^3/2GM}$, which is the year divided by $4\sqrt2$: a radial fall is half of a very thin ellipse with semi-major axis $R/2$. Treating the Sun as a point mass is harmless — Earth would reach its surface only about ${Math.round(SURFACE_EARLY / 60)} minutes before reaching the centre.`,
    }),
    mcq({
      id: 'cp-estimate', difficulty: 2,
      prompt: t`What should you conclude from this output? (The true value is $\pi/2 \approx 1.5708$.)

\`\`\`python
>>> quad(lambda x: np.sin(x) / x, 0, np.inf)
IntegrationWarning: The integral is probably divergent, or slowly convergent.
(2.2478679634689205, 3.2903230524472633)
\`\`\``,
      choices: [
        'The value is meaningless: the error estimate is larger than the value, and the warning says the method failed — use a method made for oscillatory integrals',
        'The integral is about 2.25, give or take a little',
        'The integral diverges',
        'The answer is right to 3.29 digits',
      ],
      answer: 0,
      why: {
        1: 'An error estimate of 3.3 on a value of 2.2 means no correct digits at all — and indeed the true value is 1.57.',
        2: 'It converges (to π/2), slowly and with alternating sign — exactly what defeats a general-purpose method on an infinite interval.',
        3: 'The second number is an absolute error estimate, not a count of digits.',
      },
      hints: ['Compare the second number with the first.', 'Is the warning about the integral or about the method?'],
      teach: 'Read both numbers and every warning: an error estimate comparable to the value means no digits can be trusted.',
      explain: t`The estimate (3.3) exceeds the value, and the warning confirms quad gave up. The integrand oscillates forever with slowly shrinking amplitude. Remedies: \`quad(lambda x: 1 / x, 1, np.inf, weight="sin", wvar=1)\` (a Fourier-integral routine) for the tail, plus an ordinary \`quad\` from 0 to 1 — or the known result, $\pi/2$.`,
    }),
    num({
      id: 'cp-swing', difficulty: 2, transfer: true,
      gen(r) {
        const deg = r.pick([60, 90, 120, 150]), L = r.pick([1, 2.5, 10]);
        const th = (deg * Math.PI) / 180, m = Math.sin(th / 2) ** 2, K = ellipK(m);
        const T0 = 2 * Math.PI * Math.sqrt(L / 9.81), T = T0 * (2 / Math.PI) * K;
        return {
          prompt: t`A rigid ${L} m pendulum is released from rest at ${deg}°. A program reports \`ellipk(${m.toFixed(6)})\` $= ${K.toFixed(6)}$ (with $m = \sin^2(\theta_0/2)$). What is its period, with $g = 9.81\ \text{m/s}^2$?`,
          visual: {
            type: 'graph',
            params: { x: [0, 180], y: [0.95, 3.2], aspect: 'wide', axesAt: 'edge', xlabel: 'release angle θ₀ (degrees)', ylabel: 'T / T₀',
              points: Array.from({ length: 34 }, (_, k) => 5 * (k + 1)).map((d) => ({ x: d, y: ratio((d * Math.PI) / 180), color: 'accent', r: 3 })),
              hlines: [{ y: 1, label: 'small-angle T₀', color: 'ink3' }] },
            caption: 'The period ratio from the elliptic integral, every 5°. Rigid, massless rod; no friction.',
          },
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: [{ value: T0, feedback: 'That is the small-angle period. Multiply it by (2/π)K.' }, { value: T0 * K, feedback: 'The ratio is (2/π)K(m), not K(m).' }],
          hints: [t`$T_0 = 2\pi\sqrt{${L}/9.81} = ${T0.toFixed(4)}$ s.`, t`$T = T_0 \times \tfrac2\pi K = ${T0.toFixed(4)} \times \tfrac2\pi \times ${K.toFixed(6)}$.`],
          teach: 'For large swings, T = T₀ · (2/π) K(sin²(θ₀/2)): the elliptic integral is the exact correction factor to 2π√(L/g).',
          explain: t`$T_0 = ${T0.toFixed(4)}$ s and $T/T_0 = \tfrac2\pi(${K.toFixed(6)}) = ${((2 / Math.PI) * K).toFixed(5)}$, so $T = ${T.toFixed(3)}$ s — ${(100 * ((2 / Math.PI) * K - 1)).toFixed(1)}% longer than the small-angle formula. A real swing or a ride with a flexible chain or air drag will differ, but the rigid pendulum is the reference every such correction starts from.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'SciPy: scipy.integrate.quad', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.quad.html' },
    { label: 'SciPy: scipy.special.ellipk (parameter m = k²)', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.special.ellipk.html' },
    { label: 'Piessens et al. (1983), QUADPACK: A Subroutine Package for Automatic Integration (Springer)', url: 'https://doi.org/10.1007/978-3-642-61786-7' },
    { label: 'OpenStax University Physics Vol. 1, §15.4: Pendulums', url: 'https://openstax.org/books/university-physics-volume-1/pages/15-4-pendulums' },
  ],
});
