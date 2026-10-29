// Constraints in variational problems: δF/δφ = λ δG/δφ for an integral
// constraint G[φ] = g₀, with λ = dF*/dg₀; the isoperimetric inequality
// L² ≥ 4πA proved with Fourier series (Hurwitz 1901: Parseval plus the area
// formula A = πΣk|cₖ|²); eigenvalue problems as constrained minima (the
// multiplier is the eigenvalue); maximum entropy at fixed variance gives the
// Gaussian. Overlaps: phys3550 M3.5 does Dido's semicircle and the hanging
// chain with multipliers (linked, not repeated).
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { SF, SRC, gpic, r3, r4, PI } from './_sf.js';

const t = String.raw;
const G = SF.gammaFn;
const H_GAUSS = 0.5 * Math.log(2 * PI * Math.E);
const ALPHA = 'sqrt(gamma(1/p)/gamma(3/p))';
const DENS = `p/(2*${ALPHA}*gamma(1/p))*e^(-(abs(x)/${ALPHA})^p)`;
// a sample closed curve z(t) = Σ cₖ e^{ikt} for the worked example
const CK = [[1, 1], [-1, 0.25], [2, 0.12]];
const zx = CK.map(([k, c]) => `${c}*cos(${k}*t)`).join(' + '), zy = CK.map(([k, c]) => `${c}*sin(${k}*t)`).join(' + ');
const speed = (tt) => Math.hypot(CK.reduce((s, [k, c]) => s - c * k * Math.sin(k * tt), 0), CK.reduce((s, [k, c]) => s + c * k * Math.cos(k * tt), 0));
const EX_L = SF.integrate(speed, 0, 2 * PI, 40), EX_A = PI * CK.reduce((s, [k, c]) => s + k * c * c, 0);

export default lesson({
  id: 'st-e.E11.2',
  title: 'Constraints and Lagrange multipliers in variational problems',
  minutes: 17, difficulty: 3,
  intro: t`Many variational problems come with a side condition fixed by an integral: a given perimeter, a given total charge, a normalized wavefunction, a fixed variance. To make $F[\varphi]$ stationary while $G[\varphi] = g_0$, the first variation of $F$ must vanish along every variation that keeps $G$ fixed — which happens exactly when the two gradients are parallel:

$$\frac{\delta F}{\delta\varphi(x)} = \lambda\,\frac{\delta G}{\delta\varphi(x)}, \qquad G[\varphi] = g_0.$$

The multiplier $\lambda$ is a single **number** (one constraint, one multiplier), found with everything else, and it has a meaning: $\lambda = dF^*/dg_0$, the rate at which the optimum moves as the constraint is relaxed. Three classics: the **isoperimetric problem** (the circle — and Hurwitz’s Fourier-series proof that it really is the best), **eigenvalue problems** (minimizing energy at fixed norm makes $\lambda$ the eigenvalue, [E5.2](#/lesson/st-e.E5.2)), and **maximum entropy** (fixing the variance makes the Gaussian, [E9.2](#/lesson/st-e.E9.2)). [PHYS 3550](#/lesson/phys3550.M3.5) solves Dido’s problem and the hanging chain this way.`,
  symbols: [
    { tex: 'F[\\varphi]', text: 'the functional to extremize (an area, an energy, an entropy)' },
    { tex: 'G[\\varphi] = g_0', text: 'the constraint, an integral of $\\varphi$ held at the value $g_0$' },
    { tex: '\\lambda', text: 'the Lagrange multiplier, a constant: $\\lambda = dF^*/dg_0$, where $F^*$ is the optimal value' },
    { tex: '\\frac{\\delta}{\\delta\\varphi(x)}', text: 'the functional derivative of [E11.1](#/lesson/st-e.E11.1)' },
  ],
  why: t`Ground states (minimum energy at fixed normalization), thermal equilibrium (maximum entropy at fixed energy, which makes $\lambda$ the inverse temperature), optimal shapes under a mass budget and the Einstein–Hilbert action with a volume constraint are all constrained variational problems.`,
  visual: {
    type: 'graph',
    title: 'The most random distribution with a given spread',
    lead: t`Each curve is a symmetric distribution $\propto e^{-(|x|/\alpha)^p}$ with $\alpha$ chosen so its **variance is 1**. The readouts give the variance (computed numerically, as a check) and the entropy $h = -\int f\ln f\,dx$. Maximizing $h$ at fixed $\int f = 1$ and $\int x^2f = 1$ gives $\delta h/\delta f = \lambda_0 + \lambda_2x^2$, i.e. $f \propto e^{-\lambda_2x^2}$: the Gaussian (dashed).`,
    tasks: [
      'Slide p through 2: the entropy readout peaks there, at ½ ln(2πe) ≈ 1.419, and the curve lands on the dashed Gaussian.',
      'p = 1 is the Laplace (two-sided exponential) distribution: h ≈ 1.347. Large p approaches a uniform block on [−√3, √3], h → ln(2√3) ≈ 1.242.',
      'The variance readout stays at 1 for every p: only the constraint-respecting family is compared.',
    ],
    params: {
      x: [-4, 4], y: [0, 0.75], xlabel: 'x', ylabel: '', aspect: 'wide', axesAt: 'edge',
      sliders: [{ key: 'p', label: 'Shape exponent $p$', min: 0.8, max: 12, step: 0.05, value: 1.2, unit: '', explain: 'The density falls like $e^{-|x|^p}$: $p = 1$ Laplace, $p = 2$ Gaussian, large $p$ nearly uniform.' }],
      curves: [{ fn: DENS, color: 'accent', width: 2.3 }, { fn: 'e^(-x^2/2)/sqrt(2*pi)', color: 'ink3', width: 1.5, dash: [6, 4] }],
      integral: { fn: `x^2*${DENS}`, from: -14, to: 14 },
      readouts: [
        { label: 'variance $=$', expr: 'integral', digits: 4 },
        { label: 'entropy $h =$', expr: `1/p - ln(p/(2*${ALPHA}*gamma(1/p)))`, digits: 4 },
        { label: 'Gaussian $\\tfrac12\\ln 2\\pi e =$', expr: '0.5*ln(2*pi*e)', digits: 4 },
      ],
    },
    caption: 'Generalized normal densities scaled to unit variance; entropies from their closed form through Γ functions (E9.1). The variance is integrated numerically over −14 < x < 14.',
  },
  example: {
    prompt: t`Prove the **isoperimetric inequality**: a closed curve of length $L$ encloses area $A \le L^2/4\pi$, with equality only for a circle. (Hurwitz, 1901.)`,
    visual: gpic({ x: [-1.6, 1.6], y: [-1.4, 1.4], equal: true, xlabel: 'x', ylabel: 'y', curves: [{ param: [zx, zy], t: [0, 6.2832], color: 'accent', width: 2.4 }, { param: [`${EX_L / (2 * PI)}*cos(t)`, `${EX_L / (2 * PI)}*sin(t)`], t: [0, 6.2832], color: 'ink3', width: 1.4, dash: [5, 4] }] }, t`A curve with three Fourier terms (blue) and the circle of the same length (dashed): $L = ${r4(EX_L)}$, $A = ${r4(EX_A)}$, while $L^2/4\pi = ${r4((EX_L * EX_L) / (4 * PI))}$.`),
    steps: [
      { label: 'Parametrize', text: t`Write the curve as a complex function $z(t) = x + iy$, $0 \le t < 2\pi$, traversed at constant speed $|z'| = L/2\pi$ (arc length rescaled).` },
      { label: 'Fourier series', text: t`$z(t) = \sum_kc_ke^{ikt}$, so $z' = \sum_k ik\,c_ke^{ikt}$. Parseval ([E2.3](#/lesson/st-e.E2.3)): $\dfrac1{2\pi}\displaystyle\int_0^{2\pi}|z'|^2dt = \sum_kk^2|c_k|^2 = \Big(\frac{L}{2\pi}\Big)^2$.` },
      { label: 'Area', text: t`$A = \tfrac12\oint(x\,dy - y\,dx) = \tfrac12\operatorname{Im}\displaystyle\int_0^{2\pi}\bar z\,z'\,dt = \pi\sum_kk\,|c_k|^2$ — orthogonality kills every cross term.` },
      { label: 'Subtract', text: t`$\dfrac{L^2}{4\pi} - A = \pi\sum_k\big(k^2 - k\big)|c_k|^2 \ge 0$, because $k^2 \ge k$ for every integer $k$.` },
      { label: 'Equality', text: t`Only $k = 0$ and $k = 1$ have $k^2 = k$. Equality forces $z = c_0 + c_1e^{it}$: a circle of radius $|c_1|$ centred at $c_0$.` },
    ],
    answer: t`$L^2 - 4\pi A = 4\pi^2\sum_k(k^2 - k)|c_k|^2 \ge 0$, so $A \le L^2/4\pi$ with equality only for circles. The Lagrange-multiplier calculation finds the circle as a **stationary** curve; this Fourier argument proves it is the **global maximum** — something the multiplier rule alone cannot do.`,
  },
  practice: [
    num({
      id: 'polygon', difficulty: 2,
      gen(r) {
        const n = r.pick([3, 4, 5, 6, 8, 12]), ans = PI / (n * Math.tan(PI / n));
        return {
          prompt: t`The isoperimetric quotient $Q = 4\pi A/L^2$ is 1 for a circle and less for anything else. What is $Q$ for a regular ${{ 3: 'triangle', 4: 'square', 5: 'pentagon', 6: 'hexagon', 8: 'octagon', 12: 'dodecagon' }[n]}? (Side $a$: $A = \tfrac{n}{4}a^2\cot(\pi/n)$.)`,
          visual: gpic({ x: [-1.3, 1.3], y: [-1.2, 1.2], equal: true, xlabel: '', xticks: 0, yticks: 0, curves: [{ polar: `cos(pi/${n})/cos(theta - ${(2 * PI) / n}*floor(theta/${(2 * PI) / n} + 0.5))`, theta: [0, 6.2832], color: 'accent', width: 2.3, samples: 2000 }, { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.3, dash: [5, 4] }] }, `A regular polygon with ${n} sides inscribed in a circle.`),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: (n * Math.tan(PI / n)) / PI, feedback: 'Upside down: Q must be at most 1.' }],
          hints: [t`$L = na$, so $Q = \dfrac{4\pi\cdot\frac n4a^2\cot(\pi/n)}{n^2a^2}$.`, t`$Q = \dfrac{\pi}{n\tan(\pi/n)}$.`],
          teach: 'Every non-circular shape falls short of the circle’s isoperimetric quotient of 1.',
          explain: t`$Q = \dfrac{\pi}{${n}\tan(\pi/${n})} = ${r4(ans)}$. As $n \to \infty$, $n\tan(\pi/n) \to \pi$ and $Q \to 1$.`,
        };
      },
    }),
    num({
      id: 'multiplier', difficulty: 3,
      gen(r) {
        const A = r.pick([0.5, 1, 2, 3]), ans = 24 * A;
        return {
          prompt: t`Minimize $F[u] = \displaystyle\int_0^1u'^2dx$ subject to $\displaystyle\int_0^1u\,dx = ${A}$ and $u(0) = u(1) = 0$. The condition $\delta F/\delta u = \lambda\,\delta G/\delta u$ reads $-2u'' = \lambda$. Find $\lambda$.`,
          visual: gpic({ x: [0, 1], y: [0, 1.7 * A], xlabel: 'x', curves: [{ fn: `${6 * A}*x*(1 - x)`, color: 'accent', width: 2.3 }, { fn: `${PI * A / 2}*sin(pi*x)`, color: 'ink3', width: 1.4, dash: [5, 4] }], shade: [{ fn: `${6 * A}*x*(1 - x)`, from: 0, to: 1, alpha: 0.12 }] }, 'The optimal shape (blue, area fixed) and a sine with the same area (dashed), which costs more.'),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: 12 * A * A, feedback: t`That is the minimum value $F^*$; the multiplier is its derivative, $dF^*/dA$.` }, { value: 12 * A, feedback: t`From $u = \frac\lambda4x(1 - x)$: $\int u = \lambda/24$, so $\lambda = 24A$.` }].filter((e) => Math.abs(e.value - ans) > 0.004 * ans),
          hints: [t`$u'' = -\lambda/2$ with $u(0) = u(1) = 0$ gives $u = \frac\lambda4x(1 - x)$.`, t`$\int_0^1u\,dx = \lambda/24$; set it equal to $${A}$.`],
          teach: 'The multiplier is found with the solution from the constraint, and it equals the sensitivity dF*/dg₀.',
          explain: t`$\lambda = 24\times${A} = ${ans}$, $u = ${6 * A}x(1 - x)$ and $F^* = 12A^2 = ${12 * A * A}$. Check: $dF^*/dA = 24A = \lambda$ — the multiplier is the price of the constraint.`,
        };
      },
    }),
    mcq({
      id: 'eigen', difficulty: 2,
      prompt: t`Minimize the energy $\int_0^1u'^2dx$ over functions with $u(0) = u(1) = 0$ and the normalization $\int_0^1u^2dx = 1$. What does the Lagrange multiplier turn out to be?`,
      visual: gpic({ x: [0, 1], y: [-1.6, 1.6], xlabel: 'x', curves: [{ fn: 'sqrt(2)*sin(pi*x)', color: 'accent', width: 2.3 }, { fn: 'sqrt(2)*sin(2*pi*x)', color: 'ink3', width: 1.4, dash: [5, 4] }] }, 'The minimizer √2 sin πx (blue) and the next stationary function (dashed).'),
      choices: ['An eigenvalue of −u″ = λu, and the minimum energy itself: λ = π²', 'Zero, because the constraint is already satisfied', 'The norm, 1', 'A function of x that varies along the interval'],
      answer: 0,
      why: {
        1: 'λ = 0 would make u″ = 0, a straight line through two zeros: u ≡ 0, which violates the normalization.',
        2: 'λ multiplies δG/δu = 2u; it is not the constraint value.',
        3: 'One integral constraint means one constant multiplier. (A pointwise constraint would need a multiplier function.)',
      },
      hints: [t`$\delta F/\delta u = -2u''$ and $\delta G/\delta u = 2u$.`, t`Multiply $-u'' = \lambda u$ by $u$ and integrate: $\int u'^2 = \lambda\int u^2$.`],
      teach: 'Minimizing energy at fixed norm is an eigenvalue problem, and the multiplier is the energy.',
      explain: t`$-2u'' = 2\lambda u$: an eigenvalue problem. Integrating $u\cdot(-u'')$ by parts gives $\int u'^2 = \lambda$, so the smallest admissible $\lambda = \pi^2$ is the minimum — the Rayleigh principle of [E5.2](#/lesson/st-e.E5.2). In quantum mechanics the same multiplier is the ground-state energy.`,
    }),
    num({
      id: 'entropy', difficulty: 2,
      gen(r) {
        const s = r.pick([0.5, 2, 3, 10]), ans = 0.5 * Math.log(2 * PI * Math.E * s * s);
        return {
          prompt: t`The maximum-entropy distribution with variance $\sigma^2$ is the Gaussian. What is its entropy $h = -\int f\ln f\,dx$ (in nats) for $\sigma = ${s}$?`,
          visual: gpic({ x: [-4 * s, 4 * s], y: [0, 1.15 / (s * Math.sqrt(2 * PI))], xlabel: 'x', curves: [{ fn: `e^(-x^2/(2*${s * s}))/(${s}*sqrt(2*pi))`, color: 'accent', width: 2.3 }] }, `A Gaussian with σ = ${s}.`),
          answer: ans, tol: { rel: 0.003, abs: 0.002 },
          errors: [{ value: 0.5 * Math.log(2 * PI * Math.E) , feedback: t`That is for $\sigma = 1$. Widening the distribution adds $\ln\sigma$.` }, { value: 0.5 * Math.log(2 * PI * s * s), feedback: t`$-\int f\ln f$ includes $\langle x^2\rangle/2\sigma^2 = \tfrac12$: the argument is $2\pi e\sigma^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * Math.abs(ans) + 0.002),
          hints: [t`$-\ln f = \ln(\sigma\sqrt{2\pi}) + x^2/2\sigma^2$; average it over $f$.`, t`$h = \ln(\sigma\sqrt{2\pi}) + \tfrac12 = \tfrac12\ln(2\pi e\sigma^2)$.`],
          teach: 'A Gaussian’s entropy is ½ ln(2πeσ²); any other distribution with the same variance has less.',
          explain: t`$h = \tfrac12\ln(2\pi e\cdot${s * s}) = ${r4(ans)}$ nats. The constrained maximization ($\delta h/\delta f = \lambda_0 + \lambda_2x^2$) is why noise sums and thermal velocities come out Gaussian when only the energy is known.`,
        };
      },
    }),
    mcq({
      id: 'maxent-mean', difficulty: 3,
      prompt: t`Maximize the entropy $-\int_0^\infty f\ln f\,dx$ of a distribution on $[0, \infty)$ whose **mean** $\int xf\,dx = \mu$ is fixed (plus $\int f = 1$). What is $f$?`,
      visual: gpic({ x: [0, 5], y: [0, 1.1], xlabel: 'x / μ', curves: [{ fn: 'e^(-x)', color: 'accent', width: 2.3 }, { fn: 'e^(-x^2/2)', color: 'ink3', width: 1.4, dash: [5, 4] }] }, 'Two candidate shapes on the half-line.'),
      choices: [t`$f = \dfrac1\mu e^{-x/\mu}$, an exponential (the Boltzmann factor)`, t`A half-Gaussian $\propto e^{-x^2/2\mu^2}$`, t`Uniform on $[0, 2\mu]$`, t`$f \propto x\,e^{-x/\mu}$`],
      answer: 0,
      why: {
        1: t`A Gaussian comes from fixing $\langle x^2\rangle$, not $\langle x\rangle$: the multiplier multiplies whatever is constrained.`,
        2: 'A uniform distribution maximizes entropy only on a bounded interval with no other constraint.',
        3: t`The factor $x$ would come from a $\ln x$ constraint; with only the mean fixed, $\ln f$ is linear in $x$.`,
      },
      hints: [t`$\delta h/\delta f = -\ln f - 1$; set it equal to $\lambda_0 + \lambda_1x$.`, t`Then $\ln f$ is linear in $x$, so $f \propto e^{-\lambda_1x}$; the mean fixes $\lambda_1$.`],
      teach: 'Maximum entropy with a fixed mean gives an exponential: ln f is linear in the constrained quantity.',
      explain: t`$-\ln f - 1 = \lambda_0 + \lambda_1x$ gives $f \propto e^{-\lambda_1x}$, and the mean fixes $\lambda_1 = 1/\mu$. With $x$ an energy and $\mu = k_BT$, this is the Boltzmann distribution — the multiplier is $1/k_BT$.`,
    }),
    order({
      id: 'hurwitz-steps', difficulty: 3,
      prompt: 'Put Hurwitz’s proof of the isoperimetric inequality in order.',
      visual: gpic({ x: [-1.6, 1.6], y: [-1.4, 1.4], equal: true, xlabel: '', xticks: 0, yticks: 0, curves: [{ param: [zx, zy], t: [0, 6.2832], color: 'accent', width: 2.3 }] }, 'A closed curve as a Fourier series.'),
      items: [
        t`Traverse the curve at constant speed: $z(t)$, $|z'| = L/2\pi$.`,
        t`Expand $z = \sum c_ke^{ikt}$; Parseval gives $\sum k^2|c_k|^2 = (L/2\pi)^2$.`,
        t`The area formula gives $A = \pi\sum k|c_k|^2$.`,
        t`Subtract: $L^2/4\pi - A = \pi\sum(k^2 - k)|c_k|^2 \ge 0$.`,
        t`Equality only if $c_k = 0$ for $k \ne 0, 1$: a circle.`,
      ],
      hints: ['Parametrize, expand, compute length and area, compare.', 'Parseval needs the series first; the equality case comes last.'],
      teach: 'Fourier series turn a geometric inequality into k² ≥ k.',
      explain: 'Each step uses one tool: arc-length parametrization, Parseval’s theorem, orthogonality in the area integral, and the integer inequality k² ≥ k.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-habitat', difficulty: 2, transfer: true,
      gen(r) {
        const L = r.pick([20, 25, 30, 40]), ans = (L * L) / (4 * PI);
        return {
          prompt: t`An inflatable space-habitat module has restraint fabric $${L}$ m round its circumference. Pressurized, it takes the cross-section of greatest area for that perimeter. What is that area, in m²?`,
          visual: gpic({ x: [-L / 4, L / 4], y: [-L / 5.5, L / 5.5], equal: true, xlabel: 'm', curves: [{ param: [`${L / (2 * PI)}*cos(t)`, `${L / (2 * PI)}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 2.4 }, { param: [`${L / 8}*sgn(cos(t))*min(1, abs(cos(t))*1.4142)`, `${L / 8}*sgn(sin(t))*min(1, abs(sin(t))*1.4142)`], t: [0, 6.2832], color: 'ink3', width: 1.3, dash: [5, 4] }] }, 'The pressurized cross-section (blue) and a square of the same perimeter (dashed).'),
          answer: ans, units: 'm^2', tol: { rel: 0.003 },
          errors: [{ value: (L * L) / 16, feedback: 'That is a square of the same perimeter — less area than the circle.' }, { value: (L * L) / (2 * PI), feedback: t`With $L = 2\pi R$: $A = \pi R^2 = L^2/4\pi$.` }],
          hints: ['The optimal closed curve for a fixed perimeter is a circle.', t`$R = L/2\pi$, $A = \pi R^2$.`],
          teach: 'For a given perimeter the circle encloses the most area: A = L²/4π.',
          explain: t`$A = ${L}^2/4\pi = ${r4(ans)}$ m², $${r3(((ans - (L * L) / 16) / ((L * L) / 16)) * 100)}\%$ more than a square. Pressure loads the fabric evenly only for the circle: any other shape is pushed toward it.`,
        };
      },
    }),
    num({
      id: 'cp-area', difficulty: 3,
      gen(r) {
        const e = r.pick([0.1, 0.2, 0.25, 0.3]), k = r.pick([-2, 2, 3]);
        const ans = PI * (1 + k * e * e);
        return {
          prompt: t`The closed curve $z(t) = e^{it} + ${e}\,e^{${k}it}$, $0 \le t < 2\pi$, has Fourier coefficients $c_1 = 1$ and $c_{${k}} = ${e}$. Use the area formula $A = \pi\sum_kk\,|c_k|^2$ (valid for any parametrization of a simple closed curve) to find the area it encloses.`,
          visual: gpic({ x: [-1.6, 1.6], y: [-1.5, 1.5], equal: true, xlabel: 'x', ylabel: 'y', curves: [{ param: [`cos(t) + ${e}*cos(${k}*t)`, `sin(t) + ${e}*sin(${k}*t)`], t: [0, 6.2832], color: 'accent', width: 2.3 }, { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.3, dash: [5, 4] }] }, 'The curve (blue) against the unit circle (dashed).'),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: PI * (1 + e * e), feedback: t`The weight is $k$, not 1: the term $${e}e^{${k}it}$ contributes $\pi(${k})(${e})^2$.` }, { value: PI * (1 + k * k * e * e), feedback: t`That is the length-type sum with $k^2$; area uses $k$.` }].filter((e2) => Math.abs(e2.value - ans) > 0.004 * ans),
          hints: [t`Only two coefficients are nonzero: $c_1 = 1$ and $c_{${k}} = ${e}$.`, t`$A = \pi\big(1\cdot1^2 + (${k})\cdot${e}^2\big)$.`],
          teach: 'In Fourier form the enclosed area is π Σ k|cₖ|²: harmonics turning backwards (k < 0) subtract area.',
          explain: t`$A = \pi(1 ${k < 0 ? '-' : '+'} ${Math.abs(k)}\times${r4(e * e)}) = ${r4(ans)}$.${k < 0 ? ' The backward-turning harmonic pinches the curve inward, and costs area.' : ' A forward harmonic adds area — but more length, so the quotient 4πA/L² still drops below 1.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-price', difficulty: 2,
      prompt: t`An engineer maximizes the area enclosed by a closed boom of length $L$; at the optimum $A^* = L^2/4\pi$. What is the Lagrange multiplier of the length constraint, and what does it mean?`,
      visual: gpic({ x: [0, 30], y: [0, 75], xlabel: 'L (m)', ylabel: 'A* (m²)', curves: [{ fn: 'x^2/(4*pi)', color: 'accent', width: 2.3 }], tangent: { fn: 'x^2/(4*pi)', at: 20 } }, 'The optimal area as a function of the length, with its slope at one point.'),
      choices: [t`$\lambda = dA^*/dL = L/2\pi$, the circle’s radius: each extra metre of boom buys $R$ square metres`, t`$\lambda = A^*/L$: the area per metre`, t`$\lambda = 2\pi$: the circle’s circumference per radius`, t`$\lambda = 0$: at the optimum the constraint costs nothing`],
      answer: 0,
      why: {
        1: 'That is an average; the multiplier is the marginal rate dA*/dL.',
        2: 'λ depends on the size of the problem: it scales like L.',
        3: 'The constraint is active — more length would allow more area — so its price is not zero.',
      },
      hints: ['λ = dF*/dg₀ with F* = L²/4π and g₀ = L.'],
      teach: 'A Lagrange multiplier is the sensitivity of the optimum to the constraint.',
      explain: t`$\lambda = \dfrac{d}{dL}\dfrac{L^2}{4\pi} = \dfrac{L}{2\pi} = R$. That is also what the Euler–Lagrange equation says directly: the curvature of the optimal curve is $1/\lambda$.`,
    }),
  ],
  sources: [SRC.hurwitz, SRC.gelfand, SRC.boas],
});
