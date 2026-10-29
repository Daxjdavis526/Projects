// Chebyshev expansions as Fourier series in disguise: Tₙ(cos θ) = cos nθ, so
// the Chebyshev coefficients of f are the cosine coefficients of f(cos θ) —
// smooth and periodic, hence no Gibbs at ±1. Decay rates: geometric ρ⁻ⁿ for
// analytic f with ρ set by the largest Bernstein ellipse free of
// singularities (|aₙ| ≤ 2Mρ⁻ⁿ), faster for entire functions, algebraic
// n^{−k−1} for limited smoothness. Overlaps: st-f F4.2 (Chebyshev nodes,
// Runge) and F12.1 (spectral differentiation) and st-d D7.1 (radius of
// convergence) are linked; Runge's function and e^x sin 5x are not reused.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SF, SRC, gpic, chebExpr, r3, r4, PI } from './_sf.js';

const t = String.raw;
const NMAX = 30;
const lg = Math.log10;
const CE = SF.chebCoeffs(Math.exp, NMAX);                       // e^x
const CA = SF.chebCoeffs(Math.abs, NMAX, 8192);                 // |x|
const R = 2 - Math.sqrt(3);                                     // 1/ρ for 1/(2 − x)
const NEX = (() => { let N = 0; while ((2 / Math.sqrt(3)) * R ** (N + 1) / (1 - R) >= 1e-10) N++; return N; })();
const NTAY = (() => { let N = 0; while (2 ** (-N - 1) >= 1e-10) N++; return N; })();
const ns = [...Array(NMAX + 1).keys()];
const whenF = (k) => `step(0.5 - abs(fn - ${k}))`;
const PTS = [
  ...ns.map((n) => ({ x: n, y: n === 0 ? 'log10(1/sqrt(a^2 - 1))' : `log10(2/sqrt(a^2 - 1)) - ${n}*log10(a + sqrt(a^2 - 1))`, color: 'accent', r: 3.5, when: whenF(1) })),
  ...ns.filter((n) => Math.abs(CE[n]) > 1e-16).map((n) => ({ x: n, y: +lg(Math.abs(CE[n])).toFixed(6), color: 'good', r: 3.5, when: whenF(2) })),
  ...ns.filter((n) => n % 2 === 0).map((n) => ({ x: n, y: +lg(Math.abs(CA[n])).toFixed(6), color: 'warn', r: 3.5, when: whenF(3) })),
];

export default lesson({
  id: 'st-e.E12.1',
  title: 'Chebyshev expansions and exponential convergence',
  minutes: 17, difficulty: 3,
  intro: t`The Chebyshev polynomials are cosines in disguise: with $x = \cos\theta$, $T_n(x) = \cos n\theta$. So expanding $f$ on $[-1, 1]$ in them is just a **Fourier cosine series** of the periodic function $g(\theta) = f(\cos\theta)$ ([E1](#/lesson/st-e.E1.2)):

$$f(x) = \frac{a_0}{2} + \sum_{n \ge 1}a_nT_n(x), \qquad a_n = \frac2\pi\int_0^\pi f(\cos\theta)\cos n\theta\,d\theta, \qquad |a_n| \le 2M\rho^{-n}.$$

(Equivalently they are orthogonal on $[-1, 1]$ with weight $1/\sqrt{1 - x^2}$.) Because $g$ is even and periodic, a smooth $f$ gives a smooth $g$ — no Gibbs ringing at $x = \pm1$, unlike a Fourier series of the non-periodic $f$. How fast the coefficients fall is set by **analyticity** ([ST-D](#/lesson/st-d.D7.1)): if $f$ extends analytically, with $|f| \le M$, inside the **Bernstein ellipse** $E_\rho$ — foci $\pm1$, semi-axes summing to $\rho > 1$ — then $|a_n| \le 2M\rho^{-n}$, and the truncation error after $N$ terms is at most $2M\rho^{-N}/(\rho - 1)$. The largest admissible $\rho$ is fixed by the nearest complex singularity $z_0$: $\rho = |z_0 + \sqrt{z_0^2 - 1}|$. That geometric convergence is what spectral methods ([ST-F](#/lesson/st-f.F12.1)) and Chebyshev interpolation ([ST-F](#/lesson/st-f.F4.2)) exploit.`,
  symbols: [
    { tex: 'T_n(x)', text: 'the Chebyshev polynomial, $\\cos(n\\arccos x)$ on $[-1, 1]$: degree $n$, bounded by 1' },
    { tex: 'a_n', text: 'the Chebyshev coefficients (the series halves $a_0$, as Fourier series do)' },
    { tex: '\\rho', text: 'the Bernstein parameter $> 1$: the ellipse $E_\\rho$ has semi-axes $\\frac12(\\rho + \\rho^{-1})$ and $\\frac12(\\rho - \\rho^{-1})$' },
    { tex: 'M', text: 'a bound on $|f|$ inside $E_\\rho$' },
    { tex: '\\theta', text: 'the angle with $x = \\cos\\theta$, from $0$ to $\\pi$' },
  ],
  why: t`Spectral codes — including those that produced the binary-black-hole waveforms LIGO compares its data with — represent fields by Chebyshev series, because for smooth fields the error falls exponentially with the number of terms.`,
  visual: {
    type: 'graph',
    title: 'Decay rates you can read off a log plot',
    lead: t`Dots: $\log_{10}|a_n|$ against $n$ for the chosen function. For $f = 1/(a - x)$ the coefficients are exactly $\frac{2}{\sqrt{a^2 - 1}}\rho^{-n}$ with $\rho = a + \sqrt{a^2 - 1}$: a straight line of slope $-\log_{10}\rho$ (dashed).`,
    tasks: [
      'Pole: slide a toward 1 — the pole approaches the interval, ρ → 1 and the line flattens. At a = 3 you gain about 0.77 digits per term.',
      'Switch to eˣ: no singularity anywhere, and the dots curve downward — faster than any straight line (super-geometric), until round-off near 10⁻¹⁶.',
      'Switch to |x|: a kink, not analytic at 0. Only even n appear, falling like n⁻² — a straight line on log–log axes, a slow curve here.',
    ],
    params: {
      x: [0, NMAX], y: [-17, 1], xlabel: 'n', ylabel: 'log₁₀|aₙ|', aspect: 'wide', axesAt: 'edge',
      choices: [{ key: 'fn', label: 'Function', options: [[1, t`$1/(a - x)$`], [2, t`$e^x$`], [3, t`$|x|$`]], value: 1, explain: 'A pole off the interval, an entire function, a kink.' }],
      sliders: [{ key: 'a', label: 'Pole position $a$', min: 1.02, max: 4, step: 0.01, value: 2, unit: '', explain: 'Only for $1/(a - x)$: the pole sits at $x = a$ on the real axis.' }],
      curves: [{ fn: 'log10(2/sqrt(a^2 - 1)) - x*log10(a + sqrt(a^2 - 1))', color: 'ink3', width: 1.4, dash: [6, 4], when: whenF(1) }],
      points: PTS,
      readouts: [{ label: '$\\rho = a + \\sqrt{a^2 - 1} =$', expr: 'a + sqrt(a^2 - 1)', digits: 4 }],
    },
    caption: 'Pole: exact coefficients. eˣ and |x|: coefficients computed by the trapezoid rule on f(cos θ) cos nθ (accurate to rounding); values below 10⁻¹⁶ are rounding noise and are not plotted.',
  },
  example: {
    prompt: t`Find the Chebyshev coefficients of $f(x) = \dfrac{1}{2 - x}$ exactly, check them against the Bernstein bound, and count the terms needed for accuracy $10^{-10}$ on $[-1, 1]$ — against a Taylor series about 0.`,
    visual: gpic({ x: [-4.2, 4.2], y: [-2.4, 2.4], equal: true, xlabel: 'Re z', ylabel: 'Im z', curves: [{ param: [`${(2 + Math.sqrt(3) + 1 / (2 + Math.sqrt(3))) / 2}*cos(t)`, `${(2 + Math.sqrt(3) - 1 / (2 + Math.sqrt(3))) / 2}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 2.3 }, { param: ['2*cos(t)', '2*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.3, dash: [5, 4] }], points: [{ x: 2, y: 0, color: 'bad', r: 5, label: 'pole', labelDy: -12 }, { x: -1, y: 0, color: 'gold', r: 4 }, { x: 1, y: 0, color: 'gold', r: 4 }] }, 'The Bernstein ellipse through the pole at z = 2 (blue; foci ±1, gold) and the Taylor disc |z| < 2 (dashed). The ellipse hugs the interval more tightly, so it is the better measure of convergence on [−1, 1].'),
    steps: [
      { label: 'Go to θ', text: t`With $x = \cos\theta$ the $a_n$ are the cosine coefficients of $g(\theta) = \dfrac{1}{2 - \cos\theta}$.` },
      { label: 'A known series', text: t`For $|r| < 1$: $\dfrac{1 - r^2}{1 - 2r\cos\theta + r^2} = 1 + 2\sum_{n \ge 1}r^n\cos n\theta$. Choose $r$ so that $1 - 2r\cos\theta + r^2 = 2r(2 - \cos\theta)$: $r^2 - 4r + 1 = 0$, $r = 2 - \sqrt3$.` },
      { label: 'Coefficients', text: t`$\dfrac{1}{2 - \cos\theta} = \dfrac{2r}{1 - r^2}\Big(1 + 2\sum r^n\cos n\theta\Big)$ and $\dfrac{2r}{1 - r^2} = \dfrac{1}{\sqrt3}$, so $a_n = \dfrac{2}{\sqrt3}(2 - \sqrt3)^n$: $a_1 = ${r4((2 / Math.sqrt(3)) * R)}$, $a_5 = ${r4((2 / Math.sqrt(3)) * R ** 5)}$.` },
      { label: 'Bernstein', text: t`The pole is at $z_0 = 2$: $\rho = 2 + \sqrt{3} = ${r4(2 + Math.sqrt(3))} = 1/r$. The decay rate is exactly the bound’s $\rho^{-n}$ — each term gains $\log_{10}\rho = ${r3(lg(2 + Math.sqrt(3)))}$ digits.` },
      { label: 'Count terms', text: t`The tail after $N$ terms is at most $\sum_{n > N}a_n = \dfrac{2}{\sqrt3}\dfrac{r^{N+1}}{1 - r}$, below $10^{-10}$ from $N = ${NEX}$. Taylor about 0, $\sum x^n/2^{n+1}$, has error $2^{-N-1}$ at $x = 1$ and needs $N = ${NTAY}$.` },
    ],
    answer: t`$a_n = \frac{2}{\sqrt3}(2 - \sqrt3)^n$, decaying like $\rho^{-n}$ with $\rho = 2 + \sqrt3$ set by the pole; $N = ${NEX}$ Chebyshev terms against $${NTAY}$ Taylor terms for $10^{-10}$. Taylor’s rate is set by the largest **disc** about 0, Chebyshev’s by the largest **ellipse** about $[-1, 1]$.`,
  },
  practice: [
    num({
      id: 'tn', difficulty: 1,
      gen(r) {
        const n = r.int(3, 9), x = r.pick([0.2, 0.35, 0.6, 0.8, -0.45]), ans = SF.chebT(n, x);
        return {
          prompt: t`Evaluate $T_{${n}}(${x})$ using $T_n(\cos\theta) = \cos n\theta$.`,
          visual: gpic({ x: [-1, 1], y: [-1.15, 1.15], xlabel: 'x', curves: [{ fn: chebExpr(n), color: 'accent', width: 2.2 }], vlines: [{ x, color: 'gold' }] }, t`$T_{${n}}$ on $[-1, 1]$: it oscillates between $\pm1$, with its extremes crowding toward the ends.`),
          answer: ans, tol: { rel: 0.003, abs: 0.002 },
          errors: [{ value: Math.cos(n * x), feedback: t`First find $\theta = \arccos ${x}$; $T_n(x) \ne \cos(nx)$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\theta = \arccos(${x}) = ${r4(Math.acos(x))}$ rad.`],
          teach: 'Tₙ(x) = cos(n arccos x): a polynomial that is a cosine in the angle θ.',
          explain: t`$\cos\big(${n}\times${r4(Math.acos(x))}\big) = ${r4(ans)}$ — the same as running $T_{k+1} = 2xT_k - T_{k-1}$.`,
        };
      },
    }),
    num({
      id: 'rho-real', difficulty: 2,
      gen(r) {
        const a = r.pick([1.1, 1.25, 1.5, 3, -2]), ans = SF.bernsteinRho(a, 0);
        const A = Math.abs(a);
        return {
          prompt: t`$f(x) = \ln(${a < 0 ? `x + ${A}` : `${a} - x`})$ is analytic except for a branch point at $x = ${a}$. What is the Bernstein parameter $\rho$ governing the decay of its Chebyshev coefficients on $[-1, 1]$?`,
          visual: gpic({ x: [-1.2 * Math.max(A, 1.3), 1.2 * Math.max(A, 1.3)], y: [-0.8 * Math.max(A, 1.3), 0.8 * Math.max(A, 1.3)], equal: true, xlabel: 'Re z', ylabel: 'Im z', points: [{ x: a, y: 0, color: 'bad', r: 5, label: 'singularity', labelDy: -12 }, { x: -1, y: 0, color: 'gold', r: 4 }, { x: 1, y: 0, color: 'gold', r: 4 }], arrows: [{ from: [-1, 0], to: [1, 0], color: 'accent', width: 3 }] }, 'The interval [−1, 1] (blue, foci gold) and the singularity (red). The ellipse that just reaches it is not drawn.'),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: A, feedback: t`That is the semi-major axis of the ellipse. $\rho$ is the sum of both semi-axes: $\rho = |a| + \sqrt{a^2 - 1}$.` }, { value: A - Math.sqrt(A * A - 1), feedback: t`That root is $1/\rho$; take the one greater than 1.` }],
          hints: [t`For a real singularity at $x = a$ (with $|a| > 1$) the ellipse through it has semi-major axis $|a|$ and $\rho = |a| + \sqrt{a^2 - 1}$.`, t`$\sqrt{${A}^2 - 1} = ${r4(Math.sqrt(A * A - 1))}$.`],
          teach: 'The Bernstein ellipse through the nearest singularity sets the geometric rate ρ⁻ⁿ.',
          explain: t`$\rho = ${A} + \sqrt{${A}^2 - 1} = ${r4(ans)}$: the coefficients shrink by about $1/${r3(ans)}$ per term, ${r3(lg(ans))} decimal digits each.`,
        };
      },
    }),
    num({
      id: 'rho-imag', difficulty: 3,
      gen(r) {
        const b = r.pick([0.1, 0.3, 0.5, 1, 2]), ans = SF.bernsteinRho(0, b);
        return {
          prompt: t`$f(x) = \dfrac{1}{x^2 + ${r4(b * b)}}$ has poles at $x = \pm${b}i$. Find the Bernstein parameter $\rho$ of the largest ellipse about $[-1, 1]$ free of them.`,
          visual: gpic({ x: [-1.8, 1.8], y: [-Math.max(1.2, 1.3 * b), Math.max(1.2, 1.3 * b)], equal: true, xlabel: 'Re z', ylabel: 'Im z', points: [{ x: 0, y: b, color: 'bad', r: 5, label: 'pole', labelDx: 8 }, { x: 0, y: -b, color: 'bad', r: 5 }, { x: -1, y: 0, color: 'gold', r: 4 }, { x: 1, y: 0, color: 'gold', r: 4 }], arrows: [{ from: [-1, 0], to: [1, 0], color: 'accent', width: 3 }] }, 'The interval and the two poles on the imaginary axis.'),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: 1 + b, feedback: t`An ellipse with foci $\pm1$ through $ib$ has semi-minor axis $b$ and semi-major $\sqrt{1 + b^2}$; $\rho$ is their sum.` }, { value: b + Math.sqrt(b * b - 1 + 2), feedback: 'Recheck: the semi-axes satisfy (major)² − (minor)² = 1 (focal distance 1).' }].filter((e) => Math.abs(e.value - ans) > 0.004 * ans),
          hints: [t`Semi-axes $A$ and $B$ of an ellipse with foci $\pm1$ satisfy $A^2 - B^2 = 1$, and $\rho = A + B$.`, t`Through $\pm${b}i$: $B = ${b}$, $A = \sqrt{1 + ${r4(b * b)}}$.`],
          teach: 'Poles near the interval in the imaginary direction choke convergence: ρ = β + √(1 + β²) is close to 1 when β is small.',
          explain: t`$\rho = ${b} + \sqrt{1 + ${r4(b * b)}} = ${r4(ans)}$. Small $\beta$ (a sharp but smooth feature of width $\beta$) means $\rho \approx 1 + \beta$: about $2.3/\beta$ terms per factor of 10.`,
        };
      },
    }),
    num({
      id: 'terms', difficulty: 2,
      gen(r) {
        const rho = r.pick([1.2, 1.5, 2, 3.7, 6]), tol = r.pick([1e-6, 1e-10, 1e-12]), e = Math.round(-lg(tol));
        const ans = Math.ceil(e / lg(rho));
        return {
          prompt: t`A function’s Chebyshev coefficients behave like $|a_n| \approx \rho^{-n}$ with $\rho = ${rho}$. Roughly how many terms $N$ are needed before $|a_N|$ falls below $10^{-${e}}$?`,
          visual: gpic({ x: [0, Math.min(200, 1.4 * ans)], y: [-e - 2, 0.5], xlabel: 'n', ylabel: 'log₁₀|aₙ|', curves: [{ fn: `-x*${lg(rho)}`, color: 'accent', width: 2.2 }], hlines: [{ y: -e, color: 'gold' }] }, 'Geometric decay on a log scale, and the target level (gold).'),
          answer: ans, tol: { rel: 0, abs: 1.5 },
          errors: [{ value: Math.ceil(e * lg(rho)), feedback: t`Divide by $\log_{10}\rho$: each term gains $\log_{10}\rho$ digits.` }, { value: Math.ceil(e / Math.log(rho)), feedback: 'Use base-10 logs for decimal digits (or convert both sides consistently).' }].filter((x) => Math.abs(x.value - ans) > 2),
          hints: [t`Solve $\rho^{-N} = 10^{-${e}}$: $N = ${e}/\log_{10}\rho$.`],
          teach: 'Geometric convergence buys a fixed number of digits per term: log₁₀ ρ.',
          explain: t`$N = ${e}/\log_{10}${rho} = ${r3(e / lg(rho))}$, so about ${ans} terms.`,
        };
      },
    }),
    mcq({
      id: 'algebraic', difficulty: 2,
      prompt: t`$f(x) = |x|^3$ has two continuous derivatives on $[-1, 1]$; the third jumps at $x = 0$. How fast do its Chebyshev coefficients fall?`,
      visual: gpic({ x: [-1, 1], y: [-0.05, 1.05], xlabel: 'x', curves: [{ fn: 'abs(x)^3', color: 'accent', width: 2.3 }] }, '|x|³: smooth to the eye, but its third derivative jumps at the origin.'),
      choices: [t`Like $n^{-4}$`, t`Like $n^{-2}$`, t`Like $\rho^{-n}$ for some $\rho > 1$`, t`Like $n^{-3}$`],
      answer: 0,
      why: { 1: t`$n^{-2}$ is the rate for $|x|$, whose first derivative jumps.`, 2: t`Geometric decay needs analyticity in an ellipse; $|x|^3$ is not analytic at 0.`, 3: t`Each extra derivative of smoothness gains one power of $n$: a jump in the $k$-th derivative gives $n^{-k-1}$.` },
      hints: ['Integrate by parts in θ: each integration gains a factor 1/n until the jump stops you.', 'A jump in the k-th derivative gives coefficients like $n^{-k-1}$.'],
      teach: 'Limited smoothness gives algebraic decay: a jump in the k-th derivative means coefficients $\\sim n^{-k-1}$.',
      explain: t`The third derivative jumps, so $a_n = O(n^{-4})$ (only even $n$ are nonzero). Compare $|x|$: $n^{-2}$. Analyticity is what turns algebraic into geometric convergence.`,
    }),
    mcq({
      id: 'no-gibbs', difficulty: 3,
      prompt: t`Expand $f(x) = e^x$ on $[-1, 1]$ two ways: as a Fourier series of period 2, and as a Chebyshev series. Why does only the Fourier series ring (Gibbs) near $x = \pm1$?`,
      visual: gpic({ x: [-1, 1], y: [0, 3.2], xlabel: 'x', curves: [{ fn: 'e^x', color: 'ink3', width: 1.6, dash: [5, 4] }, { sum: '2*(-1)^k*sinh(1)*(cos(k*pi*x) - k*pi*sin(k*pi*x))/(1 + (k*pi)^2) + sinh(1)*step(1.5 - k)', k: [1, 8], color: 'warn', width: 1.8 }] }, 'eˣ (dashed) and its Fourier partial sum of period 2 through k = 8 (orange), ringing at the ends.'),
      choices: [
        'The periodic extension of eˣ jumps at x = ±1, but $g(\\theta) = e^{\\cos\\theta}$ is smooth and periodic — Chebyshev series see no jump',
        'Chebyshev polynomials are bounded by 1 while sines are not',
        'Chebyshev series use more terms near the ends',
        'Gibbs ringing appears for Chebyshev series too, but only for even functions',
      ],
      answer: 0,
      why: {
        1: 'Sines and cosines are bounded by 1 too; boundedness is not the issue.',
        2: 'The number of terms is the same; what differs is the smoothness of the function being expanded.',
        3: 'Chebyshev series ring only where f itself has a jump (or a kink, mildly) inside the interval.',
      },
      hints: ['A Fourier series of period 2 expands the periodic extension of f. Is it continuous at x = 1?', 'What does x = cos θ do at θ = 0 and π?'],
      teach: 'Chebyshev series are Fourier series of f(cos θ), which is automatically smooth and periodic if f is smooth.',
      explain: t`$e^x$ repeated with period 2 jumps from $e$ to $1/e$ at $x = \pm1$: Gibbs. The substitution $x = \cos\theta$ folds the interval so both ends meet themselves smoothly — $g(\theta) = e^{\cos\theta}$ is entire and periodic — so the Chebyshev coefficients of $e^x$ fall super-geometrically.`,
    }),
    code({
      id: 'cheb-code', difficulty: 3,
      prompt: t`Compute Chebyshev coefficients numerically. Write \`cheb_coeffs(f, N, M=1000)\`: $a_n$ for $n = 0 \dots N$ from the trapezoid rule on $\frac2\pi\int_0^\pi f(\cos\theta)\cos n\theta\,d\theta$ with $M$ intervals (return the full $a_0$, not halved). Then write \`rho_fit(a, n1, n2)\`, the decay rate $\rho$ estimated from $|a_{n_1}|/|a_{n_2}| = \rho^{n_2 - n_1}$, and check it for $\tanh 5x$ against the Bernstein prediction: poles at $\pm i\pi/10$, so $\rho = \frac{\pi}{10} + \sqrt{1 + (\pi/10)^2}$.`,
      starter: t`import numpy as np

def cheb_coeffs(f, N, M=1000):
    pass

def rho_fit(a, n1, n2):
    pass

a = cheb_coeffs(lambda x: np.tanh(5 * x), 60)
print("odd coefficients:", a[1:12:2])
print("fitted rho:", rho_fit(a, 21, 41), " predicted:", np.pi / 10 + np.sqrt(1 + (np.pi / 10)**2))
`,
      answer: t`import numpy as np

def cheb_coeffs(f, N, M=1000):
    th = np.pi * np.arange(M + 1) / M
    w = np.ones(M + 1); w[0] = w[-1] = 0.5
    g = f(np.cos(th)) * w
    return np.array([2 / M * np.sum(g * np.cos(n * th)) for n in range(N + 1)])

def rho_fit(a, n1, n2):
    return (abs(a[n1]) / abs(a[n2])) ** (1 / (n2 - n1))

a = cheb_coeffs(lambda x: np.tanh(5 * x), 60)
print("odd coefficients:", a[1:12:2])
print("fitted rho:", rho_fit(a, 21, 41), " predicted:", np.pi / 10 + np.sqrt(1 + (np.pi / 10)**2))
`,
      tests: [
        { name: 'coefficients of 1/(2 − x) are (2/√3)(2 − √3)ⁿ', code: 'np.allclose(cheb_coeffs(lambda x: 1 / (2 - x), 10)[1:], 2 / np.sqrt(3) * (2 - np.sqrt(3))**np.arange(1, 11), atol=1e-12)' },
        { name: 'the full a₀ of 1/(2 − x) is 2/√3', code: 'abs(cheb_coeffs(lambda x: 1 / (2 - x), 3)[0] - 2 / np.sqrt(3)) < 1e-12' },
        { name: 'even coefficients of tanh 5x vanish', code: 'np.all(np.abs(cheb_coeffs(lambda x: np.tanh(5 * x), 20)[0::2]) < 1e-12)' },
        { name: 'fitted ρ for tanh 5x within 3% of π/10 + √(1 + (π/10)²)', code: 'abs(rho_fit(cheb_coeffs(lambda x: np.tanh(5 * x), 60), 21, 41) / (np.pi / 10 + np.sqrt(1 + (np.pi / 10)**2)) - 1) < 0.03' },
      ],
      hints: ['Sample θ = πj/M, weight the end points by ½, and sum f(cos θ)·cos(nθ).', 'For tanh 5x only odd n are nonzero — fit between two odd indices.'],
      teach: 'The trapezoid rule on a smooth periodic integrand is spectrally accurate, so Chebyshev coefficients are cheap to compute (an FFT does all of them at once).',
      explain: t`The fit gives $\rho \approx ${r4(SF.bernsteinRho(0, PI / 10))}$, matching the poles of $\tanh 5x$ at $\pm i\pi/10$: about ${r3(lg(SF.bernsteinRho(0, PI / 10)))} digits per term. Steep fronts (large $k$ in $\tanh kx$) bring the poles close and slow everything down — the reason spectral codes refine near shocks or switch methods there.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-flyby', difficulty: 3, transfer: true,
      gen(r) {
        const b = r.pick([500, 1000, 2000]), v = r.pick([5, 10, 15]), T = r.pick([600, 1800, 3600]);
        const beta = b / (v * T), rho = beta + Math.sqrt(1 + beta * beta), ans = Math.ceil(12 / lg(rho));
        return {
          prompt: t`A spacecraft flies past a moon on a straight line with closest approach $b = ${b}$ km at speed $v = ${v}$ km/s. An orbit code stores the moon’s pull, $\propto 1/r(t)$ with $r = \sqrt{b^2 + v^2t^2}$, as a Chebyshev series over $-T \le t \le T$, $T = ${T}$ s. With $t = Tx$, $1/r$ has branch points at $x = \pm i\,b/(vT)$. Estimate how many terms bring the coefficients below $10^{-12}$ of the leading ones, assuming $|a_n| \sim \rho^{-n}$.`,
          visual: gpic({ x: [-1, 1], y: [0, 1.1], xlabel: 'x = t / T', curves: [{ fn: `1/sqrt(1 + (x/${beta})^2)`, color: 'accent', width: 2.3 }] }, 'The pull during the flyby, scaled to 1 at closest approach: a narrow peak when b/vT is small.'),
          answer: ans, tol: { rel: 0, abs: 1.5 },
          errors: [{ value: Math.ceil(12 / lg(1 + beta)), feedback: t`$\rho = \beta + \sqrt{1 + \beta^2}$, not $1 + \beta$ (they agree only for small $\beta$).` }, { value: Math.ceil(12 * lg(rho)), feedback: t`$N = 12/\log_{10}\rho$: divide.` }].filter((e) => Math.abs(e.value - ans) > 2),
          hints: [t`$\beta = b/(vT) = ${r4(beta)}$ and $\rho = \beta + \sqrt{1 + \beta^2}$.`, t`$N \approx 12/\log_{10}\rho$.`],
          teach: 'The closer a singularity sits to the interval, the more terms a Chebyshev series needs: a short, sharp encounter in a long window is expensive.',
          explain: t`$\rho = ${r4(rho)}$, so $N \approx 12/${r4(lg(rho))} \approx ${ans}$ terms. Splitting the window into shorter pieces (smaller $T$, larger $\beta$) cuts the count per piece — which is what ephemeris and orbit codes do.`,
        };
      },
    }),
    mcq({
      id: 'cp-entire', difficulty: 2,
      prompt: t`The Chebyshev coefficients of $e^x$ are $a_n = 2I_n(1) \approx \dfrac{1}{2^{n-1}n!}$. What does the Bernstein theorem say about this?`,
      visual: gpic({ x: [0, 16], y: [-17, 1], xlabel: 'n', ylabel: 'log₁₀|aₙ|', points: ns.filter((n) => n <= 15).map((n) => ({ x: n, y: +lg(CE[n]).toFixed(6), color: 'good', r: 3.5 })) }, 'log₁₀ aₙ for eˣ: the dots bend downward.'),
      choices: [
        'eˣ is entire, so the bound |aₙ| ≤ 2Mρ⁻ⁿ holds for every ρ: the decay beats every geometric rate',
        'The decay is geometric with ρ = e',
        'The theorem does not apply because eˣ grows without bound',
        'The decay is algebraic because n! grows slower than ρⁿ',
      ],
      answer: 0,
      why: {
        1: 'No single ρ describes it: the ratio aₙ₊₁/aₙ ≈ 1/(2n) keeps shrinking.',
        2: 'Only boundedness inside each ellipse is needed, and eˣ is bounded on every bounded set.',
        3: 'n! grows faster than any ρⁿ, so 1/n! decays faster than any geometric sequence.',
      },
      hints: ['Where are the singularities of eˣ in the complex plane?', 'If the bound holds for every ρ, what does that say about the decay rate?'],
      teach: 'Entire functions have super-geometric Chebyshev decay; the Bernstein bound applies for every ρ.',
      explain: t`With no singularities, any ellipse works; the optimal $\rho$ grows with $n$ and the coefficients fall like $1/(2^{n-1}n!)$ — $10^{-16}$ by $n \approx 15$. In practice round-off then sets the floor, near machine epsilon.`,
    }),
    num({
      id: 'cp-bound', difficulty: 3,
      gen(r) {
        const rho = r.pick([1.5, 2, 3]), M = r.pick([2, 5, 10]), N = r.pick([10, 20, 30]);
        const ans = (2 * M * rho ** -N) / (rho - 1);
        return {
          prompt: t`A function is analytic inside the Bernstein ellipse $E_{${rho}}$ and bounded there by $M = ${M}$. Bound the error of its Chebyshev series truncated after $N = ${N}$ terms, $\max_{[-1,1]}|f - f_N| \le \dfrac{2M\rho^{-N}}{\rho - 1}$.`,
          visual: gpic({ x: [-2, 2], y: [-1.4, 1.4], equal: true, xlabel: 'Re z', ylabel: 'Im z', curves: [{ param: [`${(rho + 1 / rho) / 2}*cos(t)`, `${(rho - 1 / rho) / 2}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 2.3 }], arrows: [{ from: [-1, 0], to: [1, 0], color: 'gold', width: 3 }] }, `The Bernstein ellipse with ρ = ${rho} around [−1, 1] (gold).`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 2 * M * rho ** -N, feedback: t`That bounds one coefficient; the tail sums a geometric series, adding $1/(\rho - 1)$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\rho^{-N} = ${rho}^{-${N}}$.`, t`Multiply by $2M/(\rho - 1) = ${r4((2 * M) / (rho - 1))}$.`],
          teach: 'The Bernstein bound turns analyticity into a guaranteed, computable error.',
          explain: t`$\dfrac{2\times${M}\times${rho}^{-${N}}}{${rho} - 1} = ${tex(ans)}$. Doubling $N$ squares $\rho^{-N}$: the hallmark of spectral accuracy.`,
        };
      },
    }),
  ],
  sources: [SRC.trefethen, SRC.boyd, SRC.dlmf18],
});
