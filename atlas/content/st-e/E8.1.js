// Bessel's equation as an exercise in the Frobenius method: the indicial
// equation r = ±n, the series for Jₙ, why integer order breaks the second
// series and forces a logarithm (the Neumann function Yₙ), the Wronskian
// 2/(πx), the small- and large-x forms, the recurrences and the generating
// function e^{(x/2)(t − 1/t)}. Overlaps: st-b B7.3 and phys3750 W8.2 own the
// zeros of Jₘ, the circular membrane and McMahon's formula (linked); this
// lesson's examples are the series, Yₙ, and phase-modulation sidebands.
import { lesson, mcq, num } from '../../src/core/content.js';
import { SF, SRC, gpic, r3, r4, PI } from './_sf.js';

const t = String.raw;
const J = SF.besselJ, Y = SF.besselY, Jp = SF.besselJp, Yp = SF.besselYp;
const bes = (params, caption) => ({ type: 'fa2-bessel', params: { controls: false, readout: false, ...params }, caption });
const SUB = '₀₁₂₃₄₅';
const J0series = (x, K) => { let s = 0, term = 1; for (let k = 0; k < K; k++) { s += term; term *= -(x * x) / (4 * (k + 1) * (k + 1)); } return s; };
const yZeros = (n) => SF.roots((x) => Y(n, x), 0.05, 30, 0.05);

export default lesson({
  id: 'st-e.E8.1',
  title: 'Bessel’s equation and its solutions',
  minutes: 17, difficulty: 3,
  intro: t`Separate the wave or heat equation in cylindrical coordinates and the radial part obeys **Bessel’s equation** of order $n$. It has a regular singular point at $x = 0$, so the tool is the **Frobenius method**: try $y = \sum a_kx^{k + r}$. The indicial equation gives $r = \pm n$, and the root $r = n$ gives the Bessel function $J_n(x) = \sum_k\frac{(-1)^k}{k!\,(k + n)!}\big(\frac x2\big)^{2k + n}$. For integer $n$ the other root fails — the two roots differ by the integer $2n$ — and the second solution needs a logarithm: the **Neumann function** $Y_n$, infinite at $x = 0$. So the general solution is

$$x^2y'' + xy' + (x^2 - n^2)\,y = 0 \quad\Longrightarrow\quad y = A\,J_n(x) + B\,Y_n(x).$$

Far from the origin both become damped cosines, $J_n \approx \sqrt{2/\pi x}\cos\big(x - \frac{n\pi}2 - \frac\pi4\big)$ and $Y_n \approx \sqrt{2/\pi x}\sin\big(x - \frac{n\pi}2 - \frac\pi4\big)$ — a cylindrical wave spreading its energy over a growing circle. All the $J_n$ live in one **generating function**, $e^{\frac x2(t - 1/t)} = \sum_{n=-\infty}^{\infty}J_n(x)\,t^n$. The zeros of $J_m$ and the circular drum are in [ST-B](#/lesson/st-b.B7.3) and [PHYS 3750](#/lesson/phys3750.W8.2); this lesson is about where the functions come from.`,
  symbols: [
    { tex: 'J_n(x)', text: 'the Bessel function of the first kind: finite at 0, behaving like $x^n/(2^nn!)$ there' },
    { tex: 'Y_n(x)', text: 'the Neumann function (Bessel function of the second kind): $\\frac2\\pi\\ln x$ or $-x^{-n}$ near 0' },
    { tex: 'n', text: 'the order; separation in an angle $\\theta$ makes it the integer in $\\cos n\\theta$' },
    { tex: 'x', text: 'the scaled radius $kr$, dimensionless' },
    { tex: 'A,\\ B', text: 'constants fixed by the boundary conditions' },
  ],
  why: t`Cylinders are everywhere in engineering — pipes, nozzles, fibres, waveguides, combustion chambers — and phase modulation of light (in every laser interferometer) and of radio splits power among sidebands in exact proportion to $J_n^2$.`,
  visual: {
    type: 'fa2-bessel',
    title: 'Two solutions, one finite at the origin',
    lead: t`$J_n$ (blue) and $Y_n$ (orange) with their large-$x$ forms (dashed) and small-$x$ forms (dotted). The readouts give each function’s first zero.`,
    tasks: [
      'n = 0: Y₀ dives logarithmically at the origin; by x ≈ 5 both are already close to their dashed cosines.',
      'Raise n: both stay near zero (J) or huge (Y) until x ≈ n — the turning point where the term n²/x² stops dominating.',
      'Follow the dashed curves: each order shifts the phase by π/2, and the envelope ±√(2/πx) is the same for all n.',
    ],
    params: { mode: 'functions', n: 0, x: [0, 20], y: [-1, 1.05], show: ['J', 'Y', 'asym', 'small', 'env'], controls: ['n'], readout: true },
    caption: 'Jₙ from Bessel’s integral, Yₙ from its integral representation (both to about 10⁻¹²). Dashed: √(2/πx) cos and sin of x − nπ/2 − π/4; dotted: the leading small-x terms.',
  },
  example: {
    prompt: t`Run the Frobenius method on Bessel’s equation: find the recurrence for the coefficients, the series for $J_n$ and its value $J_0(1)$, and see why a second series fails when $n$ is an integer.`,
    visual: gpic({ x: [0, 6], y: [-0.6, 1.1], xlabel: 'x', curves: [{ fn: 'besselj(0, x)', color: 'accent', width: 2.4, label: 'J₀', labelAt: 0.3, labelDy: -6 }, { fn: '1 - x^2/4 + x^4/64', color: 'violet', width: 1.6, dash: [6, 4], label: '3 terms', labelAt: 3.2, labelDx: 6 }, { fn: '1 - x^2/4 + x^4/64 - x^6/2304', color: 'warn', width: 1.6, dash: [3, 4], label: '4 terms', labelAt: 3.3, labelDx: 8, labelDy: 8 }] }, 'J₀ and its series cut after three and four terms: excellent near the origin, useless beyond x ≈ 3.'),
    steps: [
      { label: 'Substitute', text: t`With $y = \sum_{k \ge 0}a_kx^{k + r}$, the coefficient of $x^{k + r}$ in $x^2y'' + xy' + (x^2 - n^2)y$ is $\big[(k + r)^2 - n^2\big]a_k + a_{k - 2}$.` },
      { label: 'Indicial equation', text: t`At $k = 0$ (with $a_0 \ne 0$): $r^2 = n^2$, so $r = \pm n$. At $k = 1$: $\big[(1 + r)^2 - n^2\big]a_1 = 0$ forces $a_1 = 0$, so only even $k$ survive.` },
      { label: 'Recurrence', text: t`For $r = n$: $a_k = -\dfrac{a_{k - 2}}{k(k + 2n)}$. With the convention $a_0 = 1/(2^nn!)$ this is $J_n(x) = \displaystyle\sum_{j}\frac{(-1)^j}{j!\,(j + n)!}\Big(\frac x2\Big)^{2j + n}$.` },
      { label: 'A number', text: t`$J_0(1) = 1 - \frac14 + \frac1{64} - \frac1{2304} + \cdots = ${r4(J0series(1, 4))}$ after four terms, against $${J(0, 1).toFixed(7)}$: the terms shrink like $1/(j!)^2$.` },
      { label: 'The second root', text: t`For $r = -n$ the factor is $(k - n)^2 - n^2 = k(k - 2n)$, which vanishes at $k = 2n$: there the recurrence demands $0\cdot a_{2n} = -a_{2n - 2}$, impossible once $a_{2n-2} \ne 0$. (For $n = 0$ the two roots coincide.) Either way the second solution is not a power series.` },
      { label: 'The logarithm', text: t`Reduction of order supplies it: $Y_n = \frac2\pi J_n(x)\ln\frac x2 + (\text{a series with } x^{-n} \text{ terms})$. For $n = 0$, $Y_0 \approx \frac2\pi\big(\ln\frac x2 + \gamma\big)$ near the origin, with $\gamma = ${r4(SF.EULER_GAMMA)}$ Euler’s constant.` },
    ],
    answer: t`$a_k = -a_{k-2}/\big(k(k + 2n)\big)$ gives $J_n$; $J_0(1) = ${J(0, 1).toFixed(5)}$. For integer $n$ the second Frobenius series breaks at $k = 2n$, and the independent solution $Y_n$ carries $\ln x$ — which is why it is infinite at the origin and why a full disk keeps only $J_n$.`,
  },
  practice: [
    num({
      id: 'j0-series', difficulty: 2,
      gen(r) {
        const x = r.pick([0.4, 0.6, 0.8, 1.2, 1.5, 2]);
        const ans = J0series(x, 3);
        return {
          prompt: t`Approximate $J_0(${x})$ by its series through the $x^4$ term, $1 - \dfrac{x^2}{4} + \dfrac{x^4}{64}$.`,
          visual: gpic({ x: [0, 3], y: [0, 1.05], xlabel: 'x', curves: [{ fn: 'besselj(0, x)', color: 'accent', width: 2.3 }, { fn: '1 - x^2/4 + x^4/64', color: 'violet', width: 1.6, dash: [6, 4] }], vlines: [{ x, color: 'gold' }] }, t`$J_0$ (blue) and the three-term series (dashed), with $x = ${x}$ marked.`),
          answer: ans, tol: { rel: 0.0005 },
          errors: [{ value: 1 - x * x / 4, feedback: t`Keep the $x^4/64$ term too.` }, { value: 1 - x * x / 2 + x ** 4 / 24, feedback: t`That is the Taylor series of $\cos x$. Bessel’s coefficients are $\frac{(-1)^j}{(j!)^2}\big(\frac x2\big)^{2j}$.` }].filter((e) => Math.abs(e.value - ans) > 0.001 * ans),
          hints: [t`$x^2/4 = ${r4(x * x / 4)}$ and $x^4/64 = ${r4(x ** 4 / 64)}$.`],
          teach: 'Near the origin the Frobenius series converges fast: the terms fall like 1/(j!)².',
          explain: t`$1 - ${r4(x * x / 4)} + ${r4(x ** 4 / 64)} = ${r4(ans)}$; the exact $J_0(${x}) = ${r4(J(0, x))}$. The next term, $-x^6/2304$, is the size of the error.`,
        };
      },
    }),
    mcq({
      id: 'which-log', difficulty: 3,
      prompt: t`For which order $\nu$ does the Frobenius method give **two** independent power-series solutions of Bessel’s equation (no logarithm needed)?`,
      visual: bes({ n: 1, x: [0, 12], y: [-1.2, 1], show: ['J', 'Y'] }, 'J₁ and Y₁: the second solution of integer order is infinite at the origin.'),
      choices: [t`$\nu = 1/3$`, t`$\nu = 0$`, t`$\nu = 1$`, t`$\nu = 2$`],
      answer: 0,
      why: {
        1: 'At ν = 0 the indicial roots coincide (r = 0 twice): the second solution must contain ln x.',
        2: 'The roots ±1 differ by 2: for r = −1 the recurrence at k = 2 reads 0·a₂ = −a₀, impossible with a₀ ≠ 0.',
        3: 'The roots ±2 differ by 4: the r = −2 recurrence divides by zero at k = 4.',
      },
      hints: ['The indicial roots are r = ±ν.', 'Trouble comes when the roots coincide or differ by an even integer (only even k appear).'],
      teach: 'Two Frobenius series exist unless the indicial roots coincide or differ by an integer that the recurrence actually reaches.',
      explain: t`For $\nu = 1/3$ the roots $\pm\frac13$ differ by $\frac23$, so $J_{1/3}$ and $J_{-1/3}$ are both power series (times $x^{\pm1/3}$) and independent. For integer $n$, $J_{-n} = (-1)^nJ_n$ — the same function — so the second solution must be built differently: $Y_n$.`,
    }),
    num({
      id: 'recur', difficulty: 2,
      gen(r) {
        const x = r.pick([1.5, 2.5, 3.5, 4.5, 6, 7.5]);
        const j0 = J(0, x), j1 = J(1, x), ans = (2 / x) * j1 - j0;
        return {
          prompt: t`At $x = ${x}$, $J_0 = ${r4(j0)}$ and $J_1 = ${r4(j1)}$. Use $J_{n - 1}(x) + J_{n + 1}(x) = \dfrac{2n}{x}J_n(x)$ to find $J_2(${x})$.`,
          visual: gpic({ x: [0, 10], y: [-0.5, 1.05], xlabel: 'x', curves: [{ fn: 'besselj(0, x)', color: 'accent', width: 2.2, label: 'J₀', labelAt: 0.2, labelDy: -4 }, { fn: 'besselj(1, x)', color: 'violet', width: 2.2, label: 'J₁', labelAt: 1.8, labelDy: -10 }], vlines: [{ x, color: 'gold' }] }, t`$J_0$ and $J_1$, with $x = ${x}$ marked.`),
          answer: ans, tol: { rel: 0.01, abs: 0.002 },
          errors: [{ value: j1 / x - j0, feedback: t`With $n = 1$ the factor is $2n/x = 2/x$.` }, { value: (2 / x) * j1 + j0, feedback: t`$J_2 = \frac2xJ_1 - J_0$: the $J_0$ moves across with a minus sign.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * Math.max(Math.abs(ans), 0.1)),
          hints: [t`Put $n = 1$: $J_0 + J_2 = \frac2xJ_1$.`],
          teach: 'The three-term recurrence links neighbouring orders, so J₀ and J₁ generate all the others.',
          explain: t`$J_2 = \frac{2}{${x}}(${r4(j1)}) - (${r4(j0)}) = ${r4(ans)}$ (exactly $${r4(J(2, x))}$). It comes from differentiating the generating function in $t$. Run upward for large $n$ and it loses accuracy for $J$ (fine for $Y$): for $J$ one recurs downward.`,
        };
      },
    }),
    num({
      id: 'asym', difficulty: 2,
      gen(r) {
        const n = r.int(0, 2), x = r.pick([8, 10, 12, 15, 20]);
        const ans = Math.sqrt(2 / (PI * x)) * Math.cos(x - (n * PI) / 2 - PI / 4);
        return {
          prompt: t`Use the large-$x$ form $J_n(x) \approx \sqrt{\dfrac{2}{\pi x}}\cos\Big(x - \dfrac{n\pi}{2} - \dfrac\pi4\Big)$ to estimate $J_{${n}}(${x})$.`,
          visual: bes({ n, x: [0, 22], y: [-0.7, 1.05], show: ['J', 'env'] }, t`$J_{${n}}$ and the envelope $\pm\sqrt{2/\pi x}$ (dotted).`),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: Math.sqrt(2 / (PI * x)) * Math.cos(x - PI / 4), feedback: t`Include the phase shift $n\pi/2$ for order $${n}$.` }, { value: Math.sqrt(2 / (PI * x)) * Math.cos(x), feedback: t`The phase is $x - n\pi/2 - \pi/4$, with the $-\pi/4$ even for $n = 0$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 + 0.005 * Math.abs(ans)),
          hints: [t`The phase is $${x} - ${n}\pi/2 - \pi/4$ radians.`],
          teach: 'Far from the origin a Bessel function is a cosine with amplitude √(2/πx) and phase x − nπ/2 − π/4.',
          explain: t`$\sqrt{2/(${x}\pi)} = ${r4(Math.sqrt(2 / (PI * x)))}$ times $\cos(${r4(x - (n * PI) / 2 - PI / 4)}) $ gives $${r4(ans)}$; the exact value is $${r4(J(n, x))}$. The error falls like $x^{-3/2}$: the next term of the expansion.`,
        };
      },
    }),
    num({
      id: 'wronskian', difficulty: 3,
      gen(r) {
        const x = r.pick([1, 1.5, 3, 4, 6.5]);
        const j = J(0, x), jp = Jp(0, x), y = Y(0, x), ans = Yp(0, x);
        return {
          prompt: t`The Wronskian of Bessel’s equation is $J_n(x)Y_n'(x) - J_n'(x)Y_n(x) = \dfrac{2}{\pi x}$. At $x = ${x}$, $J_0 = ${r4(j)}$, $J_0' = ${r4(jp)}$ and $Y_0 = ${r4(y)}$. Find $Y_0'(${x})$.`,
          visual: bes({ n: 0, x: [0, 8], y: [-1.2, 1.05], show: ['J', 'Y'] }, 'J₀ and Y₀: wherever one has a zero, the other has a nonzero slope — the Wronskian never vanishes.'),
          answer: ans, tol: { rel: 0.01, abs: 0.002 },
          errors: [{ value: (jp * y) / j, feedback: t`You dropped the $2/(\pi x)$: the Wronskian is not zero.` }, { value: (2 / (PI * x) - jp * y) / j, feedback: t`Move $J_0'Y_0$ across with the right sign: $J_0Y_0' = \frac{2}{\pi x} + J_0'Y_0$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * Math.max(Math.abs(ans), 0.1)),
          hints: [t`Solve for $Y_0'$: $Y_0' = \dfrac{2/(\pi x) + J_0'Y_0}{J_0}$.`, t`$2/(\pi\cdot${x}) = ${r4(2 / (PI * x))}$.`],
          teach: 'Abel’s theorem fixes the Wronskian up to a constant, C/x for Bessel’s equation; the normalization of Yₙ makes C = 2/π.',
          explain: t`$Y_0' = \big(${r4(2 / (PI * x))} + (${r4(jp)})(${r4(y)})\big)/${r4(j)} = ${r4(ans)}$. Since $p(x) = x$ in Sturm–Liouville form, $x\,W$ is constant (Abel); matching the large-$x$ forms gives the $2/\pi$.`,
        };
      },
    }),
    mcq({
      id: 'genfun', difficulty: 3,
      prompt: t`Put $t = 1$ in the generating function $e^{\frac x2(t - 1/t)} = \sum_{n=-\infty}^{\infty}J_n(x)\,t^n$. What identity results, given $J_{-n} = (-1)^nJ_n$?`,
      visual: gpic({ x: [0, 12], y: [-0.5, 1.05], xlabel: 'x', curves: [{ fn: 'besselj(0, x)', color: 'accent', width: 2.2, label: 'J₀', labelAt: 0.3 }, { fn: 'besselj(2, x)', color: 'violet', width: 2, label: 'J₂', labelAt: 3, labelDy: -8 }, { fn: 'besselj(4, x)', color: 'warn', width: 2, label: 'J₄', labelAt: 5.3, labelDy: -8 }] }, 'J₀, J₂ and J₄.'),
      choices: [t`$J_0(x) + 2\big(J_2(x) + J_4(x) + \cdots\big) = 1$`, t`$J_0(x) + J_1(x) + J_2(x) + \cdots = 1$`, t`$J_0(x) = 1$`, t`$\sum_nJ_n(x) = e^{x}$`],
      answer: 0,
      why: {
        1: t`The sum runs over negative $n$ too, and $J_{-n} = (-1)^nJ_n$: odd orders cancel, even ones double.`,
        2: t`$J_0(x) = 1$ only at $x = 0$; the other orders carry the rest.`,
        3: t`At $t = 1$ the exponent $\frac x2(t - 1/t)$ is 0, not $x$.`,
      },
      hints: [t`At $t = 1$ the left side is $e^0$.`, t`Pair $n$ with $-n$: $J_n + J_{-n} = \big(1 + (-1)^n\big)J_n$.`],
      teach: 'Special values of the variable in a generating function produce sum rules.',
      explain: t`$1 = \sum_nJ_n(x) = J_0 + \sum_{n \ge 1}\big(1 + (-1)^n\big)J_n = J_0 + 2(J_2 + J_4 + \cdots)$. With $t = e^{i\theta}$ instead, the same function gives $e^{ix\sin\theta} = \sum J_ne^{in\theta}$ (Jacobi–Anger) — the sidebands of phase modulation.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sidebands', difficulty: 3, transfer: true,
      gen(r) {
        const beta = r.pick([0.3, 0.5, 0.8, 1.1, 1.4]), ans = J(1, beta) ** 2;
        return {
          prompt: t`An electro-optic modulator (as in the Pound–Drever–Hall locking of an interferometer’s cavities) imprints a phase $\beta\sin\Omega t$ on a laser field: $E \propto e^{i(\omega t + \beta\sin\Omega t)}$. By the Jacobi–Anger expansion $e^{i\beta\sin\Omega t} = \sum_nJ_n(\beta)e^{in\Omega t}$, each sideband at $\omega + n\Omega$ has amplitude $J_n(\beta)$. For modulation depth $\beta = ${beta}$ rad, what fraction of the power goes into **one** first-order sideband?`,
          visual: gpic({ x: [0, 12.57], y: [-1.3, 1.3], xlabel: 'time (arbitrary units)', curves: [{ fn: `cos(6*x + ${beta}*sin(x))`, color: 'accent', width: 1.6, samples: 2000 }, { fn: 'cos(6*x)', color: 'ink4', width: 1.1, dash: [4, 4] }] }, 'A phase-modulated wave (blue) against the unmodulated carrier (dashed); the carrier frequency is drawn far lower than an optical one.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: J(1, beta), feedback: t`That is the amplitude $J_1(\beta)$; power goes as its square.` }, { value: (beta / 2) ** 2, feedback: t`$(\beta/2)^2$ is the small-$\beta$ approximation $J_1(\beta) \approx \beta/2$; at this depth use the actual $J_1$.` }, { value: J(0, beta) ** 2, feedback: t`That is the carrier’s share, $J_0(\beta)^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`Power fraction in sideband $n$: $J_n(\beta)^2$ (the fractions sum to 1, since $\sum J_n^2 = 1$).`, t`$J_1(${beta}) = ${r4(J(1, beta))}$ — from the series $\frac\beta2 - \frac{\beta^3}{16} + \cdots$.`],
          teach: 'Phase modulation spreads power over sidebands in the proportions Jₙ(β)², set by the modulation depth alone.',
          explain: t`$J_1(${beta})^2 = ${r4(ans)}$ per first sideband; the carrier keeps $J_0^2 = ${r4(J(0, beta) ** 2)}$ and the second-order pair gets $${r3(2 * J(2, beta) ** 2)}$. Interferometer locking uses $\beta \approx 1$ or less so that almost all the power sits in the carrier and first sidebands.`,
        };
      },
    }),
    mcq({
      id: 'cp-annulus', difficulty: 2,
      prompt: t`The radial part of a mode is $R(r) = A\,J_m(kr) + B\,Y_m(kr)$. On a full disk $0 \le r \le b$ one sets $B = 0$. On an annulus $a \le r \le b$ with $a > 0$ (a drum with a rigid hub, the gap of a coaxial cable), what is right?`,
      visual: bes({ mode: 'annulus', m: 1, k: 1, q: 0.35, panels: ['top'] }, 'A mode of an annular membrane: no origin in the domain.'),
      choices: ['Keep both: Yₘ is finite on a ≤ r ≤ b, and two rim conditions need two constants', 'Still B = 0, because Yₘ is singular', 'Set A = 0 and keep only Yₘ', 'Neither: an annulus needs sines and cosines in r'],
      answer: 0,
      why: {
        1: 'Yₘ is singular only at r = 0, which is not in the annulus. Dropping it leaves one constant for two conditions.',
        2: 'Jₘ is a perfectly good solution there too; with one function you cannot meet two conditions in general.',
        3: 'The radial equation is still Bessel’s; sines appear only as the large-kr limit.',
      },
      hints: ['Where is Yₘ infinite? Is that point in the domain?', 'Count: two boundary circles, two conditions, two constants.'],
      teach: 'Boundedness removes Yₘ only when the origin is in the domain; otherwise both solutions are needed.',
      explain: t`Both rims impose a condition, so the combination $AJ_m + BY_m$ with a nontrivial $(A, B)$ exists only when a determinant vanishes — the “cross-product” equation of [the next lesson](#/lesson/st-e.E8.2).`,
    }),
    num({
      id: 'cp-yzero', difficulty: 3,
      gen(r) {
        const n = r.int(0, 2), k = r.int(3, 5);
        const ans = (k + n / 2 - 0.75) * PI, exact = yZeros(n)[k - 1];
        return {
          prompt: t`From $Y_n(x) \approx \sqrt{\dfrac{2}{\pi x}}\sin\Big(x - \dfrac{n\pi}2 - \dfrac\pi4\Big)$, estimate the ${['', '', '', 'third', 'fourth', 'fifth'][k]} positive zero of $Y_{${n}}$.`,
          visual: bes({ n, x: [0, 20], y: [-1, 0.8], show: ['Y', 'asym'] }, t`$Y_{${n}}$ and its large-$x$ form (dashed).`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: (k + n / 2 - 0.25) * PI, feedback: t`That is where the cosine — $J_{${n}}$’s form — vanishes. $Y_n$ uses the sine: $x - \frac{n\pi}2 - \frac\pi4 = (k - 1)\pi$.` }, { value: exact, feedback: 'That is the exact zero; the question asks for the asymptotic estimate.' }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`The sine vanishes when $x - \frac{n\pi}2 - \frac\pi4 = 0, \pi, 2\pi, \dots$: the $k$-th zero is the one where it equals $(k - 1)\pi$ (for $n = 2$ the root at $\pi/4$ lies where the form is not valid, $x < n$).`, t`So $x_k \approx \big(k + \frac n2 - \frac34\big)\pi$ (check $k = 1$, $n = 0$: $0.785$, while the true first zero is $${r4(yZeros(0)[0])}$).`],
          teach: 'Asymptotic forms place the zeros of Yₙ a quarter period away from those of Jₙ, spaced by π.',
          explain: t`$x \approx \big(${k} + ${n}/2 - 3/4\big)\pi = ${r4(ans)}$; the exact zero is $${r4(exact)}$. The estimate improves with $k$: the correction is of order $1/x$.`,
        };
      },
    }),
  ],
  sources: [SRC.dlmf10, SRC.watson, SRC.arfken],
});
