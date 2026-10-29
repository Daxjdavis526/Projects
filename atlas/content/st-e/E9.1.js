// The Gamma function: Euler's integral, Γ(x + 1) = xΓ(x) and n!, Γ(½) = √π,
// continuation to negative x by the recurrence (poles with residues
// (−1)ⁿ/n!), the reflection formula, the Beta function, volumes of n-balls,
// Stirling's formula derived by Laplace's method, and Γ(s)ζ(s) in Planck's
// integrals (the cosmic photon density as the transfer).
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { C, HBAR, KB } from '../phys2710/_constants.js';
import { SF, SRC, gpic, r3, r4, PI, SQPI } from './_sf.js';

const t = String.raw;
const G = SF.gammaFn;
const lnFact = (n) => { let s = 0; for (let k = 2; k <= n; k++) s += Math.log(k); return s; };
const stirling = (n) => Math.sqrt(2 * PI * n) * (n / Math.E) ** n;
const dfact = (n) => { let p = 1; for (let k = n; k > 1; k -= 2) p *= k; return p; };   // n!!
const ZETA3 = SF.zeta(3);
const ball = (n) => PI ** (n / 2) / G(n / 2 + 1);

export default lesson({
  id: 'st-e.E9.1',
  title: 'The Gamma function',
  minutes: 15, difficulty: 3,
  intro: t`Euler’s integral extends the factorial to non-integers:

$$\Gamma(x) = \int_0^\infty t^{x - 1}e^{-t}\,dt \quad (x > 0), \qquad \Gamma(x + 1) = x\,\Gamma(x).$$

The recurrence is one integration by parts; with $\Gamma(1) = 1$ it gives $\Gamma(n + 1) = n!$. The substitution $t = u^2$ turns $\Gamma(\tfrac12)$ into the Gaussian integral, so $\Gamma(\tfrac12) = \sqrt\pi$ ([the next lesson](#/lesson/st-e.E9.2)), and every half-integer value follows. Run the recurrence backwards, $\Gamma(x) = \Gamma(x + 1)/x$, and $\Gamma$ is defined for all real $x$ except $0, -1, -2, \dots$, where it has simple poles — the first example of **analytic continuation**. Two more identities do most of the work: the reflection formula $\Gamma(x)\Gamma(1 - x) = \pi/\sin\pi x$ and the Beta integral $\int_0^1t^{a-1}(1 - t)^{b-1}dt = \frac{\Gamma(a)\Gamma(b)}{\Gamma(a + b)}$. For large arguments, **Stirling’s formula** $n! \approx \sqrt{2\pi n}\,(n/e)^n$ is what makes entropy, $\ln N!$, computable.`,
  symbols: [
    { tex: '\\Gamma(x)', text: 'the Gamma function; $\\Gamma(n + 1) = n!$ for whole numbers $n$' },
    { tex: 'x', text: 'its argument, any real number except $0, -1, -2, \\dots$ (complex too, in general)' },
    { tex: 't', text: 'the integration variable of Euler’s integral, from 0 to $\\infty$' },
    { tex: 't^{x-1}e^{-t}', text: 'the integrand: a power that grows, an exponential that wins' },
  ],
  why: t`Gamma functions turn up in every Gaussian, Planck or Maxwell–Boltzmann integral, in volumes of spheres in many dimensions (phase space), in the counting behind entropy, and in dimensional regularization in quantum field theory.`,
  visual: {
    type: 'graph',
    title: 'The factorial, filled in and continued',
    lead: t`$\Gamma(x)$ (blue) with Stirling’s approximation $\sqrt{2\pi/x}\,(x/e)^x$ (dashed, $x > 0$). The two gold points sit at $s$ and $s + 1$; their ratio is always $s$.`,
    tasks: [
      'Put s at 1, 2, 3, 4: the points land on 0!, 1!, 2!, 3!, 4! = 1, 1, 2, 6, 24.',
      'Slide s to 0.5: Γ(0.5) = √π ≈ 1.772, and Γ(1.5) = ½√π.',
      'Look left of zero: Γ alternates sign between poles, and Stirling’s curve (dashed) hugs Γ ever closer as x grows.',
    ],
    params: {
      x: [-4.5, 5.2], y: [-6, 8], xlabel: 'x', ylabel: '', aspect: 'wide', axesAt: 'edge',
      sliders: [{ key: 's', label: 'Point $s$', min: 0.1, max: 4, step: 0.05, value: 2.5, unit: '', explain: 'Compare $\\Gamma(s)$ and $\\Gamma(s + 1)$.' }],
      curves: [{ fn: 'gamma(x)', color: 'accent', width: 2.3, samples: 1500 }, { fn: 'sqrt(2*pi/x)*(x/e)^x', color: 'warn', width: 1.6, dash: [6, 4], domain: [0.05, 5.2] }],
      points: [{ x: 's', y: 'gamma(s)', color: 'gold', r: 5 }, { x: 's + 1', y: 'gamma(s + 1)', color: 'gold', r: 5 }],
      vlines: [0, -1, -2, -3, -4].map((x) => ({ x, color: 'ink4' })),
      readouts: [{ label: '$\\Gamma(s) =$', expr: 'gamma(s)', digits: 4 }, { label: '$\\Gamma(s + 1)/\\Gamma(s) =$', expr: 'gamma(s + 1)/gamma(s)', digits: 4 }],
    },
    caption: 'Γ by the Lanczos approximation (about 15 digits); grey lines mark the poles at 0, −1, −2, …. Stirling’s form is for Γ(x) = Γ(x + 1)/x.',
  },
  example: {
    prompt: t`Derive Stirling’s formula $n! \approx \sqrt{2\pi n}\,(n/e)^n$ by **Laplace’s method**: approximate the integrand of $\Gamma(n + 1)$ near its peak.`,
    visual: gpic({ x: [0, 25], y: [0, 1.1], xlabel: 't', curves: [{ fn: 'e^(10*ln(x/10) - x + 10)', color: 'accent', width: 2.3, domain: [0.01, 25], label: 'tⁿe⁻ᵗ, scaled', labelAt: 15.5, labelDx: 8 }, { fn: 'e^(-(x - 10)^2/20)', color: 'warn', width: 1.6, dash: [6, 4], label: 'Gaussian', labelAt: 4.2, labelDx: -66 }] }, 'n = 10: tⁿe⁻ᵗ divided by its peak value (blue) against the Gaussian of the same peak and curvature (dashed).'),
    steps: [
      { label: 'Write as an exponent', text: t`$n! = \displaystyle\int_0^\infty e^{\varphi(t)}dt$ with $\varphi(t) = n\ln t - t$.` },
      { label: 'Find the peak', text: t`$\varphi'(t) = n/t - 1 = 0$ at $t = n$, where $\varphi(n) = n\ln n - n$ and $\varphi''(n) = -1/n$.` },
      { label: 'Expand', text: t`$\varphi(t) \approx n\ln n - n - \dfrac{(t - n)^2}{2n}$: near its peak the integrand is a Gaussian of width $\sqrt n$, narrow compared with its position $n$.` },
      { label: 'Integrate', text: t`$n! \approx e^{n\ln n - n}\displaystyle\int_{-\infty}^{\infty}e^{-u^2/2n}du = \Big(\frac ne\Big)^n\sqrt{2\pi n}$.` },
      { label: 'Check', text: t`$10! = ${3628800}$; Stirling gives $${Math.round(stirling(10))}$, ${r3(100 * (1 - stirling(10) / 3628800))}% low — close to the next correction, a factor $1 + \frac{1}{12n}$.` },
    ],
    answer: t`$n! \approx \sqrt{2\pi n}\,(n/e)^n\big(1 + \frac1{12n} + \cdots\big)$, so $\ln n! \approx n\ln n - n + \tfrac12\ln(2\pi n)$. The method — expand the exponent to second order about its maximum — works for any integral dominated by a sharp peak.`,
  },
  practice: [
    num({
      id: 'half-int', difficulty: 2,
      gen(r) {
        const n = r.int(1, 5), x = n + 0.5, ans = G(x);
        return {
          prompt: t`Use $\Gamma(x + 1) = x\Gamma(x)$ and $\Gamma(\tfrac12) = \sqrt\pi$ to find $\Gamma(${n}.5)$.`,
          visual: gpic({ x: [0, 6], y: [0, Math.max(3, 1.2 * ans)], xlabel: 'x', curves: [{ fn: 'gamma(x)', color: 'accent', width: 2.2, domain: [0.15, 6] }], points: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5].filter((v) => v < x).map((v) => ({ x: v, y: G(v), color: 'gold', r: 4 })), vlines: [{ x, color: 'ink3' }] }, `Γ on (0, 6), with the half-integer values below x = ${x} marked.`),
          answer: ans, tol: { rel: 0.002 },
          integrand: `x^${n - 0.5}*e^(-x)`, limits: [0, 'inf'], vars: { x: [0.5, 4] },
          errors: [{ value: ans / SQPI, feedback: t`Keep the factor $\Gamma(\tfrac12) = \sqrt\pi$.` }, { value: G(x - 1), feedback: t`That is $\Gamma(${n - 0.5})$: one step of the recurrence too few.` }],
          hints: [t`$\Gamma(${n}.5) = ${Array.from({ length: n }, (_, i) => `${n - i - 0.5}`).join(t`\cdot`)}\cdot\Gamma(\tfrac12)$.`, t`In closed form, $\Gamma(n + \tfrac12) = \dfrac{(2n - 1)!!}{2^n}\sqrt\pi$.`],
          teach: 'The recurrence carries Γ(½) = √π to every half-integer.',
          explain: t`$\Gamma(${n}.5) = \dfrac{${dfact(2 * n - 1)}}{2^{${n}}}\sqrt\pi = ${r4(ans)}$.`,
        };
      },
    }),
    num({
      id: 'negative', difficulty: 2,
      gen(r) {
        const k = r.int(1, 3), x = -k + 0.5, ans = G(x);
        return {
          prompt: t`Continue Γ to negative arguments with $\Gamma(x) = \Gamma(x + 1)/x$: find $\Gamma(${x})$.`,
          visual: gpic({ x: [-3.5, 1.5], y: [-6, 6], xlabel: 'x', curves: [{ fn: 'gamma(x)', color: 'accent', width: 2.2, samples: 1500 }], vlines: [{ x: 0, color: 'ink4' }, { x: -1, color: 'ink4' }, { x: -2, color: 'ink4' }, { x: -3, color: 'ink4' }], points: [{ x: 0.5, y: SQPI, color: 'gold', r: 4, label: '√π', labelDx: 6 }] }, 'Γ near the poles, with Γ(½) = √π marked.'),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: -ans, feedback: t`Each step divides by a negative number: track the sign.` }, { value: SQPI / x, feedback: t`One division is not enough: step down from $\tfrac12$ one unit at a time.` }].filter((e) => Math.abs(e.value - ans) > 0.003 * Math.abs(ans)),
          hints: [t`$\Gamma(-\tfrac12) = \Gamma(\tfrac12)/(-\tfrac12) = -2\sqrt\pi$.`, k > 1 ? t`Then $\Gamma(-\tfrac32) = \Gamma(-\tfrac12)/(-\tfrac32)$, and so on.` : t`That is already the answer for $k = 1$.`],
          teach: 'Running the recurrence backwards continues Γ past the region where Euler’s integral converges.',
          explain: t`$\Gamma(${x}) = ${r4(ans)}$. The sign alternates between successive poles: positive on $(-2, -1)$, negative on $(-1, 0)$ and $(-3, -2)$.`,
        };
      },
    }),
    num({
      id: 'stirling-ln', difficulty: 2,
      gen(r) {
        const n = r.pick([50, 100, 200, 500]);
        const ans = n * Math.log(n) - n + 0.5 * Math.log(2 * PI * n);
        return {
          prompt: t`Estimate $\ln(${n}!)$ with Stirling’s formula $\ln n! \approx n\ln n - n + \tfrac12\ln(2\pi n)$.`,
          visual: gpic({ x: [1, n], y: [0, 1.1 * lnFact(n)], xlabel: 'n', curves: [{ fn: 'x*ln(x) - x + 0.5*ln(2*pi*x)', color: 'accent', width: 2.2 }, { fn: 'x*ln(x) - x', color: 'ink3', width: 1.5, dash: [5, 4] }] }, 'ln n! by Stirling (blue) and the crude n ln n − n (dashed).'),
          answer: ans, tol: { rel: 1e-4 },
          errors: [{ value: n * Math.log(n) - n, feedback: t`Include $\tfrac12\ln(2\pi n)$ — small next to $n\ln n$ but well above the tolerance.` }, { value: n * Math.log10(n) - n, feedback: t`Use the natural logarithm.` }],
          hints: [t`$${n}\ln ${n} = ${r4(n * Math.log(n))}$.`, t`$\tfrac12\ln(2\pi\cdot${n}) = ${r4(0.5 * Math.log(2 * PI * n))}$.`],
          teach: 'Stirling makes logarithms of huge factorials easy, with an error of about 1/(12n).',
          explain: t`$${r4(ans)}$; summing $\ln k$ exactly gives $${r4(lnFact(n))}$ — they differ by about $1/(12\cdot${n}) = ${r3(1 / (12 * n))}$. Statistical mechanics, with $N \sim 10^{23}$, keeps only $N\ln N - N$.`,
        };
      },
    }),
    num({
      id: 'beta', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[0.5, 0.5], [1.5, 0.5], [1, 0.5], [2, 1.5], [0.5, 2], [1.5, 1.5]]);
        const ans = (G(a + 1) * G(b + 1)) / G(a + b + 2);
        const f = `x^${a}*(1 - x)^${b}`;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^1 x^{${a}}(1 - x)^{${b}}\,dx$ with the Beta function, $B(p, q) = \displaystyle\int_0^1x^{p - 1}(1 - x)^{q - 1}dx = \frac{\Gamma(p)\Gamma(q)}{\Gamma(p + q)}$.`,
          visual: gpic({ x: [0, 1], y: [0, 1.15 * Math.max(...Array.from({ length: 101 }, (_, i) => (i / 100) ** a * (1 - i / 100) ** b))], xlabel: 'x', curves: [{ fn: f, color: 'accent', width: 2.2 }], shade: [{ fn: f, from: 0, to: 1, alpha: 0.15 }] }, 'The integrand; the shaded area is asked for.'),
          answer: ans, tol: { rel: 0.002 },
          integrand: f, limits: [0, 1], vars: { x: [0.1, 0.9] },
          errors: [{ value: (G(a) * G(b)) / G(a + b), feedback: t`The exponents are $p - 1$ and $q - 1$: here $p = ${a + 1}$, $q = ${b + 1}$.` }],
          hints: [t`$p = ${a + 1}$ and $q = ${b + 1}$.`, t`You need $\Gamma(${a + 1})$, $\Gamma(${b + 1})$ and $\Gamma(${a + b + 2})$ — half-integers via $\Gamma(\tfrac12) = \sqrt\pi$.`],
          teach: 'The Beta integral converts powers of x and 1 − x into Gamma functions.',
          explain: t`$B(${a + 1}, ${b + 1}) = \dfrac{\Gamma(${a + 1})\Gamma(${b + 1})}{\Gamma(${a + b + 2})} = ${r4(ans)}$.${a === 0.5 && b === 0.5 ? t` (Here $\pi/8$: the area of a half-disk of radius ½.)` : ''}`,
        };
      },
    }),
    num({
      id: 'ball', difficulty: 2,
      gen(r) {
        const n = r.int(4, 10), ans = ball(n);
        return {
          prompt: t`The volume of the unit ball in $n$ dimensions is $V_n = \dfrac{\pi^{n/2}}{\Gamma(n/2 + 1)}$. Find $V_{${n}}$.`,
          visual: gpic({ x: [0, 12], y: [0, 6], xlabel: 'dimension n', curves: [{ fn: 'pi^(x/2)/gamma(x/2 + 1)', color: 'accent', width: 2.2 }], points: [1, 2, 3].map((k) => ({ x: k, y: ball(k), color: 'gold', r: 4 })) }, 'Vₙ as a smooth function of the dimension; the line, disc and ball (n = 1, 2, 3) are marked.'),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: PI ** (n / 2) / G(n / 2), feedback: t`The denominator is $\Gamma(n/2 + 1)$, not $\Gamma(n/2)$.` }],
          hints: [t`$\Gamma(${n / 2 + 1})$ ${n % 2 ? t`is a half-integer value: use $\Gamma(\tfrac12) = \sqrt\pi$` : t`$= ${n / 2}!$`}.`, t`Check with $n = 3$: $\pi^{3/2}/\Gamma(\tfrac52) = \tfrac43\pi$.`],
          teach: 'Gamma functions interpolate between even and odd dimensions in sphere volumes.',
          explain: t`$V_{${n}} = ${r4(ans)}$. The volume peaks near $n \approx 5.26$ and then falls to zero: in high dimensions almost all of a cube’s volume lies in its corners, outside the inscribed ball.`,
        };
      },
    }),
    mcq({
      id: 'poles', difficulty: 3,
      prompt: t`Near $x = -2$, how does $\Gamma(x)$ behave?`,
      visual: gpic({ x: [-2.6, -1.4], y: [-12, 12], xlabel: 'x', curves: [{ fn: 'gamma(x)', color: 'accent', width: 2.2, samples: 1500 }], vlines: [{ x: -2, color: 'ink4' }] }, 'Γ on either side of the pole at x = −2.'),
      choices: [t`$\Gamma(x) \approx \dfrac{1}{2(x + 2)}$`, t`$\Gamma(x) \approx -\dfrac{1}{2(x + 2)}$`, t`$\Gamma(x) \approx \dfrac{1}{x + 2}$`, t`$\Gamma(x) \approx \dfrac{2}{x + 2}$`],
      answer: 0,
      why: {
        1: t`Check the signs: $x(x + 1) \to (-2)(-1) = +2$.`,
        2: t`You dropped the factor $1/\big(x(x + 1)\big) \to \tfrac12$.`,
        3: t`$\Gamma(x + 3) \to \Gamma(1) = 1$ and $x(x + 1) \to 2$: the residue is $\tfrac12$, not 2.`,
      },
      hints: [t`$\Gamma(x) = \dfrac{\Gamma(x + 3)}{x(x + 1)(x + 2)}$.`, t`As $x \to -2$: $\Gamma(x + 3) \to 1$ and $x(x + 1) \to 2$.`],
      teach: 'Γ has simple poles at −n with residue (−1)ⁿ/n!.',
      explain: t`$\Gamma(x) \approx \dfrac{1}{2(x + 2)}$: residue $(-1)^2/2! = \tfrac12$. Right of the pole Γ is large and positive, left of it large and negative — as the graph shows.`,
    }),
    num({
      id: 'reflection', difficulty: 2,
      gen(r) {
        const [p, q] = r.pick([[1, 3], [1, 4], [1, 6], [1, 5], [2, 5]]);
        const x = p / q, ans = PI / Math.sin(PI * x);
        return {
          prompt: t`Use the reflection formula $\Gamma(x)\Gamma(1 - x) = \dfrac{\pi}{\sin\pi x}$ to find $\Gamma(\tfrac{${p}}{${q}})\,\Gamma(\tfrac{${q - p}}{${q}})$.`,
          visual: gpic({ x: [0, 1], y: [0, 10], xlabel: 'x', curves: [{ fn: 'gamma(x)', color: 'accent', width: 2.2, domain: [0.02, 1] }, { fn: 'gamma(1 - x)', color: 'violet', width: 2.2, domain: [0, 0.98] }], vlines: [{ x, color: 'gold' }] }, 'Γ(x) (blue) and Γ(1 − x) (violet) on (0, 1); each blows up at one end.'),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: Math.sin(PI * x) / PI, feedback: 'Upside down: it is π divided by the sine.' }],
          hints: [t`$\sin(\pi\cdot\tfrac{${p}}{${q}}) = ${r4(Math.sin(PI * x))}$.`],
          teach: 'The reflection formula pairs Γ(x) with Γ(1 − x); at x = ½ it gives Γ(½)² = π.',
          explain: t`$\pi/\sin(${p}\pi/${q}) = ${r4(ans)}$ (and $${r4(G(x))}\times${r4(G(1 - x))}$ directly). Put $x = \tfrac12$ and it reproduces $\Gamma(\tfrac12) = \sqrt\pi$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cmb', difficulty: 3, transfer: true,
      gen(r) {
        const [z, T] = r.pick([[0, 2.7255], [1, 2 * 2.7255], [9, 10 * 2.7255]]);
        const ans = ((2 * ZETA3) / (PI * PI)) * ((KB * T) / (HBAR * C)) ** 3 / 1e6;
        return {
          prompt: t`The number density of blackbody photons is $n_\gamma = \dfrac{1}{\pi^2}\Big(\dfrac{k_BT}{\hbar c}\Big)^3\displaystyle\int_0^\infty\frac{x^2}{e^x - 1}dx$, and $\int_0^\infty\frac{x^{s-1}}{e^x - 1}dx = \Gamma(s)\,\zeta(s)$ with $\zeta(3) = ${ZETA3.toFixed(6)}$. For the cosmic microwave background ${z === 0 ? t`today, at $T = ${T}$ K` : t`at redshift $z = ${z}$, when $T = ${r4(T)}$ K`}, how many photons are there per cubic centimetre? ($k_B = 1.380649\times10^{-23}$ J/K, $\hbar = 1.0546\times10^{-34}$ J s, $c = 2.998\times10^8$ m/s.)`,
          visual: gpic({ x: [0, 12], y: [0, 0.7], xlabel: 'x = hν / kT', curves: [{ fn: 'x^2/(e^x - 1)', color: 'gold', width: 2.3, domain: [0.001, 12] }], shade: [{ fn: 'x^2/(e^x - 1)', from: 0.001, to: 12, color: 'gold', alpha: 0.18 }] }, 'The photon-number integrand x²/(eˣ − 1); its area is Γ(3)ζ(3).'),
          answer: ans, units: 'cm^-3', tol: { rel: 0.005 },
          errors: [{ value: ans * 1.5, feedback: t`$\Gamma(3) = 2! = 2$, not 3.` }, { value: ans / 2, feedback: t`Keep both factors: $\int = \Gamma(3)\zeta(3) = 2\zeta(3)$.` }, { value: ans * 1e6, feedback: 'That is per cubic metre; the question asks per cm³.' }],
          hints: [t`$\int_0^\infty\frac{x^2}{e^x - 1}dx = \Gamma(3)\zeta(3) = 2\zeta(3)$.`, t`$k_BT/\hbar c = ${tex((KB * T) / (HBAR * C))}\ \text{m}^{-1}$; cube it and divide by $10^6$ for cm⁻³.`],
          teach: 'Planck integrals are Γ(s)ζ(s): Gamma functions carry the powers, zeta the Bose–Einstein sum.',
          explain: t`$n_\gamma = \dfrac{2\zeta(3)}{\pi^2}\Big(\dfrac{k_BT}{\hbar c}\Big)^3 = ${r4(ans)}$ cm⁻³${z ? t` — $(1 + z)^3$ times today’s value, since $T \propto 1 + z$` : ' — about 411, a billion photons for every proton in the universe'}. (The same integral with $x^3$ gives $\Gamma(4)\zeta(4) = \pi^4/15$, the Stefan–Boltzmann law.)`,
        };
      },
    }),
    num({
      id: 'cp-ratio', difficulty: 2,
      gen(r) {
        const x = r.pick([3.5, 4.5, 5.5, 2.25, 6.5]), ans = G(x + 2) / G(x);
        return {
          prompt: t`Without evaluating either one, find $\dfrac{\Gamma(${x + 2})}{\Gamma(${x})}$.`,
          visual: gpic({ x: [0, 9], y: [0, 1.15 * G(x + 2)], xlabel: 'x', curves: [{ fn: 'gamma(x)', color: 'accent', width: 2.2, domain: [0.2, 9] }], vlines: [{ x, color: 'ink3' }, { x: x + 2, color: 'ink3' }] }, 'Γ, with the two arguments marked.'),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: x * (x + 1) * (x + 2), feedback: 'Two steps of the recurrence, not three.' }, { value: (x + 1) * (x + 2), feedback: t`$\Gamma(x + 2) = (x + 1)\,x\,\Gamma(x)$: the factors are $x + 1$ and $x$.` }],
          hints: [t`$\Gamma(x + 2) = (x + 1)\Gamma(x + 1) = (x + 1)\,x\,\Gamma(x)$.`],
          teach: 'Ratios of Gamma functions with arguments differing by whole numbers are polynomials.',
          explain: t`$${x + 1}\times${x} = ${r4(ans)}$.`,
        };
      },
    }),
    num({
      id: 'cp-power', difficulty: 3,
      gen(r) {
        const [p, q] = r.pick([[2, 3], [3, 2], [1, 4], [4, 4], [2, 1.5], [5, 2]]);
        const ans = G((p + 1) / q) / q;
        const f = `x^${p}*e^(-x^${q})`;
        return {
          prompt: t`Substitute $u = x^{${q}}$ to evaluate $\displaystyle\int_0^\infty x^{${p}}e^{-x^{${q}}}\,dx$ in terms of Γ, then give its value.`,
          visual: gpic({ x: [0, 4], y: [0, 1.2 * Math.max(...Array.from({ length: 200 }, (_, i) => { const v = 0.02 * i; return v ** p * Math.exp(-(v ** q)); }))], xlabel: 'x', curves: [{ fn: f, color: 'accent', width: 2.2 }], shade: [{ fn: f, from: 0, to: 4, alpha: 0.15 }] }, 'The integrand; its area is asked for.'),
          answer: ans, tol: { rel: 0.002 },
          integrand: f, limits: [0, 'inf'], vars: { x: [0.2, 3] },
          errors: [{ value: G((p + 1) / q), feedback: t`$dx = \frac{1}{${q}}u^{1/${q} - 1}du$ brings a factor $1/${q}$.` }, { value: G(p / q) / q, feedback: t`Collect the powers: $x^{${p}}\,dx = \frac1{${q}}u^{(${p} + 1)/${q} - 1}du$.` }].filter((e) => Math.abs(e.value - ans) > 0.003 * ans),
          hints: [t`$x = u^{1/${q}}$, $dx = \frac1{${q}}u^{1/${q} - 1}du$.`, t`The integral becomes $\frac1{${q}}\int_0^\infty u^{(${p} + 1)/${q} - 1}e^{-u}du = \frac1{${q}}\Gamma\big(\tfrac{${p} + 1}{${q}}\big)$.`],
          teach: t`Any $\int_0^\infty x^pe^{-x^q}dx$ is $\Gamma\big(\tfrac{p + 1}{q}\big)/q$.`,
          explain: t`$\dfrac{1}{${q}}\Gamma\Big(\dfrac{${p + 1}}{${q}}\Big) = ${r4(ans)}$.`,
        };
      },
    }),
  ],
  sources: [SRC.dlmf5, SRC.arfken, SRC.boas],
});
