// Gaussian integrals: ∫e^{−ax²} = √(π/a) by squaring into polar coordinates,
// even moments ∫x^{2n}e^{−ax²} by differentiating under the integral sign (and
// as Γ(n + ½)/a^{n+½}), odd moments on the half-line, completing the square,
// the Fourier transform of a Gaussian, the error function, n-dimensional
// Gaussians with a matrix, and the sphere-area formula they imply. Transfers:
// nitrogen molecules in a cold-gas thruster; a Gaussian laser beam through
// an aperture.
import { lesson, mcq, num } from '../../src/core/content.js';
import { KB } from '../phys2710/_constants.js';
import { SF, SRC, gpic, r3, r4, PI, SQPI } from './_sf.js';

const t = String.raw;
const G = SF.gammaFn;
const U = 1.66053906892e-27;                  // kg, atomic mass unit (CODATA 2022)
const M_N2 = 28.0134 * U;                    // kg, N₂ (standard atomic weight of N, 14.0067)
const erf = (x) => SF.integrate((u) => Math.exp(-u * u), 0, x, 20) * 2 / SQPI;
const dfact = (n) => { let p = 1; for (let k = n; k > 1; k -= 2) p *= k; return p; };

export default lesson({
  id: 'st-e.E9.2',
  title: 'Gaussian and related integrals',
  minutes: 15, difficulty: 3,
  intro: t`The Gaussian $e^{-ax^2}$ has no elementary antiderivative, yet its integral over the whole line is known exactly — by a trick that squares it into two dimensions. From that one result, differentiating with respect to $a$ produces every moment:

$$\int_{-\infty}^{\infty}e^{-ax^2}dx = \sqrt{\frac{\pi}{a}}, \qquad \int_{-\infty}^{\infty}x^{2n}e^{-ax^2}dx = \frac{(2n - 1)!!}{(2a)^n}\sqrt{\frac\pi a} = \frac{\Gamma(n + \frac12)}{a^{n + 1/2}}.$$

Odd moments vanish by symmetry; on the half-line they are elementary, $\int_0^\infty xe^{-ax^2}dx = \frac{1}{2a}$. **Completing the square** handles a linear term, $\int e^{-ax^2 + bx}dx = \sqrt{\pi/a}\,e^{b^2/4a}$, and with $b = ik$ it is the Fourier transform of a Gaussian ([E3.3](#/lesson/st-e.E3.3)). Integrals over a finite range need the **error function** $\operatorname{erf}x = \frac{2}{\sqrt\pi}\int_0^xe^{-u^2}du$, and in $n$ dimensions $\int e^{-\mathbf x^{\mathsf T}A\mathbf x}d^nx = \pi^{n/2}/\sqrt{\det A}$. These are the workhorses of statistical mechanics, probability and quantum field theory.`,
  symbols: [
    { tex: 'a', text: 'the Gaussian’s sharpness, $a > 0$; the standard deviation is $\\sigma = 1/\\sqrt{2a}$' },
    { tex: 'n', text: 'half the power of $x$ in an even moment, $n = 0, 1, 2, \\dots$' },
    { tex: '(2n - 1)!!', text: 'the double factorial $1\\cdot3\\cdot5\\cdots(2n - 1)$, with $(-1)!! = 1$' },
    { tex: '\\Gamma(n + \\tfrac12)', text: 'the Gamma function of [E9.1](#/lesson/st-e.E9.1) at a half-integer' },
  ],
  why: t`Every thermal average (Maxwell–Boltzmann), every Gaussian error estimate, the spreading of a wave packet, the width of a laser beam and the path integral of a free field come down to these integrals.`,
  visual: {
    type: 'graph',
    title: 'Moments of a Gaussian',
    lead: t`The curve is $x^{2n}e^{-ax^2}$; the shaded area is computed numerically and compared with the closed form $\Gamma(n + \frac12)/a^{n + 1/2}$.`,
    tasks: [
      'n = 0: the area is √(π/a). Quadruple a and the area halves — the Gaussian is half as wide.',
      'Raise n: the two humps sit at x = ±√(n/a), where the power and the exponential balance.',
      'Compare the readouts for any n and a: they agree to every digit shown.',
    ],
    params: {
      x: [-5, 5], y: [0, 1.6], xlabel: 'x', ylabel: '', aspect: 'wide', axesAt: 'edge',
      sliders: [
        { key: 'n', label: 'Moment $n$ (power $x^{2n}$)', min: 0, max: 4, step: 1, value: 1, unit: '', explain: 'The power of $x$ is $2n$.' },
        { key: 'a', label: 'Sharpness $a$', min: 0.3, max: 3, step: 0.1, value: 1, unit: '', explain: 'Larger $a$: a narrower Gaussian.' },
      ],
      curves: [{ fn: 'x^(2n)*e^(-a*x^2)', color: 'accent', width: 2.3 }, { fn: 'e^(-a*x^2)', color: 'ink4', width: 1.2, dash: [4, 4] }],
      shade: [{ fn: 'x^(2n)*e^(-a*x^2)', from: -5, to: 5, alpha: 0.18 }],
      vlines: [{ x: 'sqrt(n/a)', color: 'gold', when: 'step(n - 0.5)' }, { x: '-sqrt(n/a)', color: 'gold', when: 'step(n - 0.5)' }],
      integral: { fn: 'x^(2n)*e^(-a*x^2)', from: -12, to: 12 },
      readouts: [{ label: 'area (numerical) =', expr: 'integral', digits: 5 }, { label: '$\\Gamma(n + \\frac12)/a^{n + 1/2} =$', expr: 'gamma(n + 0.5)/a^(n + 0.5)', digits: 5 }],
    },
    caption: 'Numerical area by Simpson’s rule over −12 < x < 12, where the tails are negligible; dotted: the bare Gaussian. Gold lines: the peaks at ±√(n/a).',
  },
  example: {
    prompt: t`Prove $\int_{-\infty}^\infty e^{-ax^2}dx = \sqrt{\pi/a}$, then get $\int x^2e^{-ax^2}dx$ and $\int x^4e^{-ax^2}dx$ without integrating by parts.`,
    visual: gpic({ x: [-2.5, 2.5], y: [-2.5, 2.5], equal: true, xlabel: 'x', ylabel: 'y', curves: [0.5, 1, 1.5, 2].map((r0, i) => ({ param: [`${r0}*cos(t)`, `${r0}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 2.4 - 0.4 * i })) }, 'Level circles of e^(−(x² + y²)): in polar coordinates the area element r dr dθ supplies exactly the factor needed to integrate it.'),
    steps: [
      { label: 'Square it', text: t`$I^2 = \displaystyle\int e^{-ax^2}dx\int e^{-ay^2}dy = \iint_{\mathbb R^2}e^{-a(x^2 + y^2)}dx\,dy$.` },
      { label: 'Polar coordinates', text: t`$I^2 = \displaystyle\int_0^{2\pi}\!\!\int_0^\infty e^{-ar^2}\,r\,dr\,d\theta = 2\pi\cdot\frac{1}{2a} = \frac\pi a$ — the $r$ from $dA = r\,dr\,d\theta$ makes it elementary. So $I = \sqrt{\pi/a}$.` },
      { label: 'Differentiate in a', text: t`$-\dfrac{d}{da}\displaystyle\int e^{-ax^2}dx = \int x^2e^{-ax^2}dx$, so $\int x^2e^{-ax^2}dx = -\dfrac{d}{da}\sqrt\pi\,a^{-1/2} = \dfrac{\sqrt\pi}{2}a^{-3/2}$.` },
      { label: 'Again', text: t`$\int x^4e^{-ax^2}dx = -\dfrac{d}{da}\dfrac{\sqrt\pi}{2}a^{-3/2} = \dfrac{3\sqrt\pi}{4}a^{-5/2}$. Each derivative brings down $x^2$ and a factor $(2n - 1)/2a$.` },
      { label: 'Check', text: t`For $a = 1$: $\int x^4e^{-x^2}dx = \frac34\sqrt\pi = ${r4(0.75 * SQPI)}$, and $\Gamma(\tfrac52) = ${r4(G(2.5))}$ — the same, as $u = x^2$ predicts. Quadrature gives $${r4(SF.integrate((x) => x ** 4 * Math.exp(-x * x), -10, 10, 60))}$.` },
    ],
    answer: t`$\sqrt{\pi/a}$, $\;\dfrac{\sqrt\pi}{2a^{3/2}}$, $\;\dfrac{3\sqrt\pi}{4a^{5/2}}$ — and in general $\dfrac{(2n - 1)!!}{(2a)^n}\sqrt{\dfrac\pi a}$. Differentiating under the integral sign is legitimate here because the integrand and its $a$-derivatives are dominated by an integrable Gaussian.`,
  },
  practice: [
    num({
      id: 'moment', difficulty: 2,
      gen(r) {
        const n = r.int(1, 3), a = r.pick([0.5, 2, 3, 4]);
        const ans = (dfact(2 * n - 1) / (2 * a) ** n) * Math.sqrt(PI / a);
        const f = `x^${2 * n}*e^(-${a}*x^2)`;
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty}x^{${2 * n}}e^{-${a}x^2}dx$.`,
          visual: gpic({ x: [-5, 5], y: [0, 1.2 * (n / a) ** n * Math.exp(-n) + 0.05], xlabel: 'x', curves: [{ fn: f, color: 'accent', width: 2.2 }], shade: [{ fn: f, from: -5, to: 5, alpha: 0.15 }] }, 'The integrand; its area is asked for.'),
          answer: ans, tol: { rel: 0.002 },
          integrand: f, limits: ['-inf', 'inf'], vars: { x: [-2, 2] },
          errors: [{ value: (dfact(2 * n - 1) / a ** n) * Math.sqrt(PI / a), feedback: t`Each derivative in $a$ gives $(2n - 1)/(2a)$: the denominator is $(2a)^n$.` }, { value: ans / 2, feedback: 'That is the half-line integral; the integrand is even, so the full line doubles it.' }],
          hints: [t`$\int x^{2n}e^{-ax^2}dx = \dfrac{(2n - 1)!!}{(2a)^n}\sqrt{\dfrac\pi a}$.`, t`Here $(${2 * n - 1})!! = ${dfact(2 * n - 1)}$ and $(2a)^{${n}} = ${(2 * a) ** n}$.`],
          teach: 'Even Gaussian moments follow from √(π/a) by differentiating in a.',
          explain: t`$\dfrac{${dfact(2 * n - 1)}}{${(2 * a) ** n}}\sqrt{\dfrac{\pi}{${a}}} = ${r4(ans)}$. Equivalently $\Gamma(${n} + \tfrac12)/${a}^{${n} + 1/2}$.`,
        };
      },
    }),
    num({
      id: 'square', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 0.5, 3]), b = r.intExcept(-3, 3, [0]);
        const ans = Math.sqrt(PI / a) * Math.exp((b * b) / (4 * a));
        const f = `e^(-${a}*x^2 + ${b}*x)`;
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty}e^{-${a}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x}\,dx$ by completing the square.`,
          visual: gpic({ x: [-6, 6], y: [0, 1.15 * Math.exp((b * b) / (4 * a))], xlabel: 'x', curves: [{ fn: f, color: 'accent', width: 2.2 }, { fn: `e^(-${a}*x^2)`, color: 'ink3', width: 1.4, dash: [5, 4] }], shade: [{ fn: f, from: -6, to: 6, alpha: 0.15 }] }, 'The shifted, raised Gaussian (blue) against e^(−ax²) (dashed).'),
          answer: ans, tol: { rel: 0.002 },
          integrand: f, limits: ['-inf', 'inf'], vars: { x: [-2, 2] },
          errors: [{ value: Math.sqrt(PI / a), feedback: t`The shift does not change the area, but the factor $e^{b^2/4a}$ does: the peak is higher.` }, { value: Math.sqrt(PI / a) * Math.exp(-(b * b) / (4 * a)), feedback: t`Sign: $-ax^2 + bx = -a(x - \frac{b}{2a})^2 + \frac{b^2}{4a}$.` }, { value: Math.sqrt(PI / a) * Math.exp((b * b) / (2 * a)), feedback: t`The constant is $b^2/4a$, not $b^2/2a$.` }],
          hints: [t`$-${a}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x = -${a}\big(x - \tfrac{${b}}{${2 * a}}\big)^2 + \tfrac{${b * b}}{${4 * a}}$.`],
          teach: 'Completing the square turns a Gaussian with a linear term into a shifted Gaussian times a constant.',
          explain: t`$\sqrt{\pi/${a}}\;e^{${b * b}/${4 * a}} = ${r4(ans)}$. With $b$ imaginary the same formula is the Fourier transform of a Gaussian — another Gaussian.`,
        };
      },
    }),
    num({
      id: 'odd-half', difficulty: 2,
      gen(r) {
        const n = r.int(1, 4), ans = SF.fact(n) / 2;
        const f = `x^${2 * n + 1}*e^(-x^2)`;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{\infty}x^{${2 * n + 1}}e^{-x^2}dx$. (Over the whole line it would be zero.)`,
          visual: gpic({ x: [-4, 4], y: [-1.2 * Math.max(...Array.from({ length: 80 }, (_, i) => (0.05 * i) ** (2 * n + 1) * Math.exp(-((0.05 * i) ** 2)))), 1.2 * Math.max(...Array.from({ length: 80 }, (_, i) => (0.05 * i) ** (2 * n + 1) * Math.exp(-((0.05 * i) ** 2))))], xlabel: 'x', curves: [{ fn: f, color: 'accent', width: 2.2 }], shade: [{ fn: f, from: 0, to: 4, alpha: 0.18 }] }, 'An odd integrand: the half-line area (shaded) is asked for; the other half cancels it.'),
          answer: ans, tol: { rel: 0.002 },
          integrand: f, limits: [0, 'inf'], vars: { x: [0.2, 2] },
          errors: [{ value: 0, feedback: 'Zero is the whole-line value; on the half-line every bit of area is positive.' }, { value: SF.fact(n), feedback: t`With $u = x^2$, $x\,dx = \tfrac12du$: there is a factor ½.` }],
          hints: [t`Put $u = x^2$: $x^{${2 * n + 1}}dx = \tfrac12u^{${n}}du$.`, t`$\int_0^\infty u^{${n}}e^{-u}du = ${n}!$.`],
          teach: 'Odd half-line Gaussian moments are factorials: ∫₀^∞ x^(2n+1) e^(−x²) dx = n!/2.',
          explain: t`$\tfrac12\Gamma(${n + 1}) = \tfrac12\cdot${n}! = ${ans}$.`,
        };
      },
    }),
    num({
      id: 'erf', difficulty: 2,
      gen(r) {
        const k = r.pick([0.5, 1, 1.5, 2, 2.5, 3]), ans = erf(k / Math.SQRT2);
        return {
          prompt: t`A measurement error is normally distributed with standard deviation $\sigma$: density $\dfrac{1}{\sigma\sqrt{2\pi}}e^{-x^2/2\sigma^2}$. What is the probability that an error lies within $\pm${k}\sigma$?`,
          visual: gpic({ x: [-4, 4], y: [0, 0.45], xlabel: 'x / σ', curves: [{ fn: 'e^(-x^2/2)/sqrt(2*pi)', color: 'accent', width: 2.2 }], shade: [{ fn: 'e^(-x^2/2)/sqrt(2*pi)', from: -k, to: k, alpha: 0.2 }] }, `The standard normal density; the shaded band is ±${k}σ.`),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: erf(k), feedback: t`Rescale first: $u = x/(\sigma\sqrt2)$, so the limit is $${k}/\sqrt2$, not $${k}$.` }, { value: ans / 2, feedback: 'That is one side only; the band runs from −kσ to +kσ.' }].filter((e) => Math.abs(e.value - ans) > 0.003 * ans),
          hints: [t`$P = \dfrac{2}{\sqrt\pi}\displaystyle\int_0^{k/\sqrt2}e^{-u^2}du = \operatorname{erf}(k/\sqrt2)$.`, t`$k/\sqrt2 = ${r4(k / Math.SQRT2)}$.`],
          teach: 'Gaussian probabilities over a finite interval are values of the error function.',
          explain: t`$\operatorname{erf}(${k}/\sqrt2) = ${r4(ans)}$. The familiar 68–95–99.7 rule is erf(1/√2), erf(2/√2), erf(3/√2).`,
        };
      },
    }),
    num({
      id: 'matrix', difficulty: 3,
      gen(r) {
        const [a, b, c] = r.pick([[2, 1, 2], [3, 1, 1], [1, 0.5, 2], [4, -1, 1], [2, -1, 3]]);
        const det = a * c - b * b, ans = PI / Math.sqrt(det);
        return {
          prompt: t`Evaluate $\displaystyle\iint_{\mathbb R^2}e^{-(${a}x^2 ${b < 0 ? '-' : '+'} ${2 * Math.abs(b)}xy + ${c}y^2)}\,dx\,dy$. (Write the exponent as $-\mathbf x^{\mathsf T}A\mathbf x$ and use $\pi^{n/2}/\sqrt{\det A}$.)`,
          visual: gpic({ x: [-1.6, 1.6], y: [-1.6, 1.6], equal: true, xlabel: 'x', ylabel: 'y', curves: [0.5, 1, 1.5].map((L, i) => ({ polar: `${Math.sqrt(L)}/sqrt(${a}*cos(theta)^2 + ${2 * b}*cos(theta)*sin(theta) + ${c}*sin(theta)^2)`, theta: [0, 6.2832], color: 'accent', width: 2.3 - 0.5 * i })) }, 'Level curves of the exponent: tilted ellipses. Rotating to their axes separates the integral into two 1D Gaussians.'),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: PI / Math.sqrt(a * c - 4 * b * b), feedback: t`The off-diagonal entries of $A$ are half the $xy$ coefficient: $A_{12} = ${b}$.` }, { value: PI / Math.sqrt(a * c), feedback: t`The cross term matters: $\det A = ${a}\cdot${c} - (${b})^2$.` }].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - ans) > 0.003 * ans),
          hints: [t`$A = \begin{pmatrix}${a} & ${b}\\ ${b} & ${c}\end{pmatrix}$, $\det A = ${det}$.`, t`Diagonalize: $\mathbf x^{\mathsf T}A\mathbf x = \lambda_1u^2 + \lambda_2v^2$ and the rotation has Jacobian 1, so the integral is $\sqrt{\pi/\lambda_1}\sqrt{\pi/\lambda_2}$.`],
          teach: 'A multidimensional Gaussian integral is π^(n/2) divided by the square root of the determinant.',
          explain: t`$\pi/\sqrt{${det}} = ${r4(ans)}$. This is why Gaussian path integrals produce determinants of operators.`,
        };
      },
    }),
    num({
      id: 'fourier', difficulty: 3,
      gen(r) {
        const a = r.pick([0.5, 1, 2]), k = r.pick([1, 2, 3]);
        const ans = Math.sqrt(PI / a) * Math.exp(-(k * k) / (4 * a));
        return {
          prompt: t`Using $\int e^{-ax^2 + bx}dx = \sqrt{\pi/a}\,e^{b^2/4a}$ with $b = ik$, evaluate $\displaystyle\int_{-\infty}^{\infty}e^{-${a}x^2}\cos(${k}x)\,dx$.`,
          visual: gpic({ x: [-5, 5], y: [-1.05, 1.05], xlabel: 'x', curves: [{ fn: `e^(-${a}*x^2)*cos(${k}*x)`, color: 'accent', width: 2.2 }, { fn: `e^(-${a}*x^2)`, color: 'ink3', width: 1.4, dash: [5, 4] }, { fn: `-e^(-${a}*x^2)`, color: 'ink3', width: 1.4, dash: [5, 4] }] }, 'The Gaussian (dashed envelope) times a cosine: positive and negative lobes largely cancel.'),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: Math.sqrt(PI / a) * Math.exp((k * k) / (4 * a)), feedback: t`With $b = ik$, $b^2 = -k^2$: the factor is $e^{-k^2/4a}$, a damping.` }, { value: Math.sqrt(PI / a), feedback: 'The oscillation cancels part of the area; the result must be smaller than √(π/a).' }],
          hints: [t`$\cos kx = \operatorname{Re}e^{ikx}$, and the sine part integrates to zero by symmetry.`, t`$e^{b^2/4a} = e^{-k^2/4a}$ with $b = ik$.`],
          teach: 'The Fourier transform of a Gaussian is a Gaussian, with widths in inverse proportion.',
          explain: t`$\sqrt{\pi/${a}}\,e^{-${k * k}/${4 * a}} = ${r4(ans)}$. A narrow Gaussian in $x$ (large $a$) is wide in $k$: the uncertainty relation of [E3.3](#/lesson/st-e.E3.3) with equality.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-n2', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([200, 250, 293, 350]);
        const ans = Math.sqrt((8 * KB * T) / (PI * M_N2));
        return {
          prompt: t`In the plenum of a nitrogen cold-gas thruster at $T = ${T}$ K the molecular speeds follow the Maxwell–Boltzmann distribution $f(v) \propto v^2e^{-mv^2/2k_BT}$ for $v \ge 0$. With the half-line moments $\int_0^\infty v^3e^{-\alpha v^2}dv = \frac{1}{2\alpha^2}$ and $\int_0^\infty v^2e^{-\alpha v^2}dv = \frac{\sqrt\pi}{4\alpha^{3/2}}$, find the mean speed $\langle v\rangle = \int vf\,dv/\int f\,dv$ of N₂ ($m = 28.0134$ u, $1\ \text{u} = 1.6605\times10^{-27}$ kg, $k_B = 1.380649\times10^{-23}$ J/K).`,
          visual: gpic({ x: [0, 1500], y: [0, 1.15], xlabel: 'v (m/s)', curves: [{ fn: `(x/${Math.sqrt((2 * KB * T) / M_N2)})^2*e^(1 - (x/${Math.sqrt((2 * KB * T) / M_N2)})^2)`, color: 'accent', width: 2.3 }] }, 'The Maxwell–Boltzmann speed distribution of N₂ at this temperature, scaled to peak 1.'),
          answer: ans, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt((3 * KB * T) / M_N2), feedback: t`That is the rms speed $\sqrt{3k_BT/m}$, from the $v^4$ moment.` }, { value: Math.sqrt((2 * KB * T) / M_N2), feedback: t`That is the most probable speed, where $v^2e^{-\alpha v^2}$ peaks.` }],
          hints: [t`With $\alpha = m/2k_BT$: $\langle v\rangle = \dfrac{1/(2\alpha^2)}{\sqrt\pi/(4\alpha^{3/2})} = \dfrac{2}{\sqrt{\pi\alpha}}$.`, t`So $\langle v\rangle = \sqrt{\dfrac{8k_BT}{\pi m}}$, with $m = ${(M_N2 * 1e26).toFixed(4)}\times10^{-26}$ kg.`],
          teach: 'Thermal averages are ratios of Gaussian moments.',
          explain: t`$\langle v\rangle = \sqrt{8k_BT/\pi m} = ${r4(ans)}$ m/s; the most probable speed is $${r4(Math.sqrt((2 * KB * T) / M_N2))}$ m/s and the rms $${r4(Math.sqrt((3 * KB * T) / M_N2))}$ m/s. The nozzle converts this random motion into directed exhaust; a cold-gas thruster’s exhaust speed is of the same order, set by the same $\sqrt{k_BT/m}$.`,
        };
      },
    }),
    num({
      id: 'cp-sphere', difficulty: 3,
      gen(r) {
        const n = r.int(3, 6), ans = (2 * PI ** (n / 2)) / G(n / 2);
        return {
          prompt: t`Compute $\int_{\mathbb R^{${n}}}e^{-|\mathbf x|^2}d^{${n}}x$ two ways: as a product of ${n} one-dimensional Gaussians, and in spherical coordinates as $S_{${n - 1}}\int_0^\infty r^{${n - 1}}e^{-r^2}dr$, where $S_{${n - 1}}$ is the area of the unit sphere in $${n}$ dimensions. What is $S_{${n - 1}}$?`,
          visual: gpic({ x: [0, 4], y: [0, 1.2 * Math.max(...Array.from({ length: 80 }, (_, i) => (0.05 * i) ** (n - 1) * Math.exp(-((0.05 * i) ** 2))))], xlabel: 'r', curves: [{ fn: `x^${n - 1}*e^(-x^2)`, color: 'accent', width: 2.2 }], shade: [{ fn: `x^${n - 1}*e^(-x^2)`, from: 0, to: 4, alpha: 0.15 }] }, `The radial integrand r${'⁰¹²³⁴⁵⁶'[n - 1]}e^(−r²): shells of radius r weighted by their area.`),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: PI ** (n / 2) / G(n / 2 + 1), feedback: 'That is the volume of the unit ball; the question asks for the area of its boundary.' }, { value: PI ** (n / 2) / G(n / 2), feedback: t`$\int_0^\infty r^{n-1}e^{-r^2}dr = \tfrac12\Gamma(n/2)$: keep the ½.` }],
          hints: [t`The product is $\big(\sqrt\pi\big)^{${n}} = \pi^{${n}/2}$.`, t`$\int_0^\infty r^{${n - 1}}e^{-r^2}dr = \tfrac12\Gamma\big(\tfrac{${n}}{2}\big)$, so $S_{${n - 1}} = 2\pi^{${n}/2}/\Gamma(${n}/2)$.`],
          teach: 'Equating a Gaussian integral in Cartesian and spherical coordinates gives the area of a sphere in any dimension.',
          explain: t`$S_{${n - 1}} = \dfrac{2\pi^{${n}/2}}{\Gamma(${n}/2)} = ${r4(ans)}$${n === 3 ? ' — 4π, as it must be.' : '.'} Dividing by $n$ gives the ball volumes of [E9.1](#/lesson/st-e.E9.1).`,
        };
      },
    }),
    num({
      id: 'cp-beam', difficulty: 2, transfer: true,
      gen(r) {
        const w = r.pick([2, 3, 5]), R = r.pick([1.5, 2, 3, 4]);
        const ans = 1 - Math.exp((-2 * R * R) / (w * w));
        return {
          prompt: t`A laser beam’s intensity across its cross-section is $I \propto e^{-2\rho^2/w^2}$ with beam radius $w = ${w}$ mm. What fraction of its power passes a circular aperture of radius $${R}$ mm centred on it?`,
          visual: gpic({ x: [-2.2 * w, 2.2 * w], y: [0, 1.1], xlabel: 'ρ (mm)', curves: [{ fn: `e^(-2*x^2/${w * w})`, color: 'accent', width: 2.2 }], shade: [{ fn: `e^(-2*x^2/${w * w})`, from: -R, to: R, alpha: 0.2 }], vlines: [{ x: R, color: 'gold' }, { x: -R, color: 'gold' }] }, 'A slice through the beam profile; the aperture edges are gold.'),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: erf((Math.SQRT2 * R) / w), feedback: 'That is the one-dimensional (slit) answer. A round aperture integrates in polar coordinates, which is elementary.' }, { value: 1 - Math.exp((-R * R) / (w * w)), feedback: t`The exponent is $2\rho^2/w^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.004 * ans),
          hints: [t`Power through radius $R$: $\int_0^R e^{-2\rho^2/w^2}\,2\pi\rho\,d\rho$, divided by the same integral to infinity.`, t`$\int_0^Re^{-2\rho^2/w^2}\rho\,d\rho = \frac{w^2}{4}\big(1 - e^{-2R^2/w^2}\big)$.`],
          teach: 'In two dimensions the factor ρ in the area element makes a Gaussian integral elementary — the same trick that proves √π.',
          explain: t`$1 - e^{-2(${R})^2/(${w})^2} = ${r4(ans)}$. An aperture of radius $w$ passes $1 - e^{-2} \approx 86\%$ — the definition of the beam radius.`,
        };
      },
    }),
  ],
  sources: [SRC.boas, SRC.arfken, SRC.dlmf5],
});
