// Conditioning and stability — the analyst's view: the condition number
// κ = |x f′(x)/f(x)| of a problem, backward stability of an algorithm, and
// the rule forward error ≲ κ × backward error. A well-conditioned integral
// computed by an unstable recursion; Wilkinson's polynomial; the Hilbert
// matrix; GPS geometry; clocks near a horizon.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { U, n12, lg } from './_num.js';
import { eigSym } from '../prog/_solvers.js';

const t = String.raw;

// ── I_n = ∫₀¹ xⁿ e^(x−1) dx: forward (unstable) and backward (stable) recursions, in float64 ──
const FW = [1 - 1 / Math.E];
for (let n = 1; n <= 25; n++) FW.push(1 - n * FW[n - 1]);
const BW = new Array(41).fill(0);
{ let J = 0; for (let n = 40; n >= 1; n--) { BW[n] = J; J = (1 - J) / n; } BW[0] = J; }
const FIRST_NEG = FW.findIndex((v) => v < 0);
let FACT20 = 1; for (let k = 2; k <= 20; k++) FACT20 *= k;

// ── condition numbers of Hilbert matrices H_ij = 1/(i + j − 1), by Jacobi eigenvalues ──
const hilbertCond = (n) => { const { w } = eigSym(Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => 1 / (i + j + 1)))); return w[n - 1] / w[0]; };
const HCOND = Object.fromEntries([4, 6, 8, 10].map((n) => [n, hilbertCond(n)]));

// Jₙ(1) from its power series Σ (−1)ᵏ (1/2)^(2k+n) / (k! (k+n)!)
const JN1 = Array.from({ length: 13 }, (_, n) => { let s = 0, term = 0.5 ** n; for (let k = 1; k <= n; k++) term /= k; for (let k = 0; k < 30; k++) { s += term; term *= -0.25 / ((k + 1) * (k + 1 + n)); } return s; });

// condition numbers for the Explore: [key, label, f(x) for the curve, κ(x)]
const KAPPA = [
  [1, 'ln x', 'abs(1/ln(x))'],
  [2, 'eˣ', 'abs(x)'],
  [3, '√x', '0.5 + 0*x'],
  [4, 'cos x', 'abs(x*tan(x))'],
  [5, 'x − 1', 'abs(x/(x - 1))'],
];

export default lesson({
  id: 'st-f.F2.2',
  title: 'Conditioning and stability',
  minutes: 13, difficulty: 3,
  intro: t`Two different things can make a computed answer wrong. A **problem** can be *ill-conditioned*: its answer is so sensitive to its input that the unavoidable rounding of the input already spoils it. An **algorithm** can be *unstable*: it amplifies its own rounding errors even when the problem is benign. For evaluating $y = f(x)$ the sensitivity is measured by the **relative condition number**

$$\kappa_f(x) = \left\lvert\frac{x\,f'(x)}{f(x)}\right\rvert, \qquad \frac{\lvert\Delta y\rvert}{\lvert y\rvert} \approx \kappa_f(x)\,\frac{\lvert\Delta x\rvert}{\lvert x\rvert}.$$

A **backward-stable** algorithm returns the exact answer to an input perturbed by a few $u$. Then the rule of thumb that organises all of numerical analysis follows: **forward error $\lesssim$ condition number $\times$ backward error** — about $\kappa u$. Conditioning is the problem’s fault; instability is the algorithm’s, and only that one you can fix.`,
  symbols: [
    { tex: t`\kappa_f(x)`, text: 'the relative condition number: how many times a small relative change in $x$ is magnified in $f(x)$. A pure number; $\\log_{10}\\kappa$ is roughly the number of digits you can lose' },
    { tex: t`f'(x)`, text: 'the derivative: the absolute sensitivity. Multiplying by $x/f$ turns it into a ratio of *relative* changes' },
    { tex: t`\Delta x`, text: 'a perturbation of the input: rounding (at least $u\\lvert x\\rvert$), measurement error, an earlier step’s error' },
    { tex: t`\Delta y`, text: 'the change it causes in the answer — the **forward error** if $\\Delta x$ is what the algorithm effectively perturbed' },
    { tex: t`u`, text: 'unit roundoff, $2^{-53}$: the backward error of a backward-stable algorithm is a small multiple of it' },
  ],
  why: 'Before you blame an integrator, a solver or a fit, you must know whether the question itself can be answered to the precision you want; the condition number tells you, and every later module (linear systems, eigenvalues, ODEs) has its own.',
  visual: {
    type: 'graph',
    title: 'Where is a problem sensitive?',
    lead: t`Pick a function and slide $x$. The curve is the condition number $\kappa(x) = \lvert xf'(x)/f(x)\rvert$ on a logarithmic axis; the readout gives it at your $x$ and the digits a float64 evaluation can lose there.`,
    tasks: [
      t`For $\ln x$, slide towards $x = 1$: $\ln x \to 0$ while its input stays near 1, so $\kappa \to \infty$.`,
      t`For $x - 1$ the same happens at $x = 1$: that is catastrophic cancellation, seen as conditioning.`,
      t`$\sqrt x$ has $\kappa = \tfrac12$ everywhere: it *halves* relative errors. Where is $e^x$ ill-conditioned?`,
    ],
    params: {
      x: [0, 4.1], y: [-2, 5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'κ(x)',
      choices: [{ key: 'fn', label: 'Function', options: KAPPA.map(([k, l]) => [k, l]), value: 1, explain: 'The problem: evaluate this function at x.' }],
      sliders: [{ key: 'x0', label: 'Input $x$', min: 0.055, max: 4, step: 0.01, value: 2.5, explain: 'The point where the function is evaluated.' }],
      curves: KAPPA.map(([k, , kap]) => ({ fn: `log10(${kap})`, color: 'accent', width: 2.2, domain: [0.02, 4.1], when: `step(0.5 - abs(fn - ${k}))` })),
      points: KAPPA.map(([k, , kap]) => ({ x: 'x0', y: `log10(${kap.replace(/x/g, 'x0')})`, r: 5, color: 'gold', when: `step(0.5 - abs(fn - ${k}))` })),
      hlines: [{ y: 0, label: 'κ = 1', color: 'ink3' }],
      readouts: [{ label: 'κ at this x', expr: KAPPA.map(([k, , kap]) => `step(0.5 - abs(fn - ${k}))*(${kap.replace(/x/g, 'x0')})`).join(' + '), digits: 3 }, { label: 'digits at risk, log₁₀ κ', expr: `max(0, log10(${KAPPA.map(([k, , kap]) => `step(0.5 - abs(fn - ${k}))*(${kap.replace(/x/g, 'x0')})`).join(' + ')}))`, digits: 2 }],
    },
    caption: 'Exact condition numbers of the five functions; the gold dot marks your input. They describe the problem, not any particular way of computing it. log₁₀ κ is roughly the number of digits lost.',
  },
  example: {
    prompt: t`The integrals $I_n = \int_0^1 x^n e^{x-1}\,dx$ satisfy $I_n = 1 - nI_{n-1}$ (integrate by parts) with $I_0 = 1 - 1/e$. Every $I_n$ is positive and smaller than $\tfrac{1}{n+1}$. Compute $I_{20}$ with the recursion in float64, explain what happens, and fix it.`,
    visual: {
      type: 'graph',
      params: { x: [-0.5, 21], y: [-0.25, 1.05], aspect: 'wide', axesAt: 'edge', xlabel: 'n', ylabel: 'Iₙ',
        points: FW.slice(0, 21).map((v, n) => ({ x: n, y: n12(Math.max(-0.24, Math.min(1.04, v))), r: 4, color: 'bad', hollow: Math.abs(v) > 1.04 })).concat(BW.slice(0, 21).map((v, n) => ({ x: n, y: n12(v), r: 3, color: 'accent' }))),
        curves: [{ fn: '1/(x + 1)', color: 'ink3', dash: true, domain: [0, 20.5], label: '1/(n + 1)', labelAt: 3, labelDx: 6, labelDy: -12 }],
        legend: [{ label: 'forward: Iₙ = 1 − n Iₙ₋₁', color: 'bad', point: true }, { label: 'backward from I₄₀ = 0', color: 'accent', point: true }], legendAt: 'tr' },
      caption: 'The two recursions in float64. Red dots beyond the frame are drawn on its edge (hollow): the forward values reach −30 at n = 20. The dashed curve is the upper bound 1/(n + 1).',
    },
    steps: [
      { label: 'Is the problem sensitive?', text: t`No. $I_n$ is the integral of a positive function; a relative change $\epsilon$ in the integrand changes $I_n$ by at most $\epsilon$ relative. The problem is perfectly well-conditioned.` },
      { label: 'Run it forward', text: t`The recursion gives sensible values up to $I_{17} = ${FW[17].toFixed(4)}$, then $I_{${FIRST_NEG}} = ${FW[FIRST_NEG].toFixed(4)}$ — negative, impossible — and $I_{20} = ${FW[20].toFixed(1)}$.` },
      { label: 'Follow one error', text: t`Let $e_n$ be the error in the computed $I_n$. Subtracting the exact recursion from the computed one gives $e_n = -n\,e_{n-1}$, so $\lvert e_n\rvert = n!\,\lvert e_0\rvert$. Storing $1 - 1/e$ errs by about $10^{-17}$, and $20! = ${tex(FACT20, 3)}$: an error near 30, as seen. The algorithm is **unstable**: it multiplies errors by $n$ at every step.` },
      { label: 'Turn it around', text: t`Run the recursion backwards, $I_{n-1} = (1 - I_n)/n$: now every step *divides* the error by $n$. Start from the crude guess $I_{40} = 0$ (wrong by about $0.024$). Twenty steps down, that error has been divided by $40!/20! \approx 3\times10^{29}$, and $I_{20} = ${BW[20].toFixed(15)}$, correct to all 15 digits shown — and $I_0$ comes back as $1 - 1/e$ to the last bit.` },
      { label: 'The lesson', text: t`The same mathematics, run in two directions, is one stable and one unstable algorithm for a well-conditioned problem. Conditioning bounds what any method can achieve; stability decides whether yours achieves it.` },
    ],
    answer: t`Forward: $I_{20} \approx ${FW[20].toFixed(1)}$ (garbage, error $\sim 20!\,u$). Backward from $I_{40} = 0$: $I_{20} = ${BW[20].toFixed(12)}$.`,
  },
  practice: [
    mcq({
      id: 'problem-or-method', difficulty: 1,
      prompt: 'Which of these is a statement about the **conditioning of a problem**, rather than the stability of an algorithm?',
      visual: {
        type: 'graph',
        params: { x: [0.86, 1.14], y: [-0.004, 0.02], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'p(x)',
          curves: [{ fn: '(x - 1)^2', color: 'accent', width: 2, label: '(x − 1)²', labelAt: 1.11, labelDx: 8, labelDy: 0 }, { fn: '(x - 1)^2 - 0.0025', color: 'warn', width: 2, dash: true, label: 'constant lowered by 0.0025', labelAt: 0.895, labelDx: 10, labelDy: 6 }] },
        caption: 'A double root, and the same polynomial with its constant term lowered by 0.0025: the roots move by 0.05, twenty times more than the change. (Exaggerated sizes for visibility.)',
      },
      choices: [
        t`A change of $10^{-10}$ in the constant term of $(x - 1)^2$ moves its roots by $10^{-5}$`,
        t`The textbook quadratic formula loses half the digits of the small root of $x^2 + 10^8x + 1$`,
        t`The recursion $I_n = 1 - nI_{n-1}$ returns negative values`,
        'Gaussian elimination without row swaps divides by zero on a matrix whose first entry is 0',
      ],
      answer: 0,
      why: {
        1: 'The small root is perfectly well-conditioned; a different formula computes it to full precision. That is a property of the algorithm.',
        2: 'The integrals are well-conditioned; running the recursion backwards fixes it. Instability.',
        3: 'Swapping rows (pivoting) fixes it without changing the problem: an algorithm issue.',
      },
      hints: ['Ask of each: would a different method fix it?', 'If the answer itself moves a lot when the data move a little, no method can help: that is conditioning.'],
      teach: 'Conditioning is a property of the problem (how much its exact answer moves when its data move); stability is a property of an algorithm (whether it adds more error than the conditioning forces).',
      explain: t`At a double root, a change $\epsilon$ in the data moves the roots by $\sqrt\epsilon$: $10^{-10}$ becomes $10^{-5}$, whatever method you use. The other three are failures of particular methods, each cured by a better one.`,
    }),
    num({
      id: 'kappa-exp', difficulty: 2,
      gen(r) {
        const z = r.pick([80, 100, 120]), H = r.pick([6, 7, 8]), [d, dTeX] = r.pick([[1e-4, '10^{-4}'], [1e-3, '10^{-3}']]);
        const ans = (z / H) * d;
        return {
          prompt: t`Model the upper atmosphere as $\rho(z) = \rho_0e^{-z/H}$ with scale height $H = ${H}$ km. A re-entering capsule's altitude $z = ${z}$ km is known with relative error $${dTeX}$. Using the condition number of $\rho$ as a function of $z$, what relative error does that cause in $\rho$?`,
          visual: {
            type: 'graph',
            params: { x: [0, 140], y: [-9, 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'altitude z (km)', ylabel: 'ρ / ρ₀',
              curves: [{ fn: `-x/(${H}*ln(10))`, color: 'accent', width: 2 }],
              vlines: [{ x: z, label: `${z} km`, color: 'gold' }] },
            caption: t`The model density on a logarithmic axis: a straight line falling one factor of $e$ per $${H}$ km. Real density also varies with solar activity by large factors.`,
          },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: d, feedback: t`That would be true for $\kappa = 1$. Here $\kappa = \lvert z\rho'/\rho\rvert = z/H$.` }, { value: d / H, feedback: 'Use relative changes on both sides: κ = |z ρ′/ρ| = z/H, a pure number.' }],
          hints: [t`$\rho' = -\rho/H$, so $\kappa = \left\lvert\dfrac{z\rho'}{\rho}\right\rvert = \dfrac zH$.`, t`Relative error in $\rho$ $\approx \kappa \times {${dTeX}}$ with $\kappa = ${z}/${H}$.`],
          teach: 'The exponential magnifies relative errors in its argument by the size of the argument: κ(eˣ) = |x|.',
          explain: t`$\kappa = z/H = ${z}/${H} = ${tex(z / H, 3)}$, so the density is uncertain by about $${tex(z / H, 3)} \times ${dTeX} = ${tex(ans, 2)}$ relative. A small relative error in a large altitude is a large absolute one, and density cares about absolute metres.`,
        };
      },
    }),
    num({
      id: 'kappa-ln', difficulty: 2,
      gen(r) {
        const k = r.int(4, 9);
        const x = 1 + 10 ** -k;
        const ans = 1 / Math.abs(Math.log(x));
        return {
          prompt: t`An experiment compares two clocks and needs $\ln(f_1/f_0)$, where the frequency ratio is $f_1/f_0 = 1 + 10^{-${k}}$. What is the condition number of $\ln$ at that input?`,
          visual: {
            type: 'graph',
            params: { x: [0.3, 2.6], y: [-1.3, 1], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'ln x',
              curves: [{ fn: 'ln(x)', color: 'accent', width: 2, domain: [0.3, 2.6] }],
              points: [{ x: 1, y: 0, r: 5, color: 'gold', label: 'x = 1', labelDx: 8, labelDy: -12 }] },
            caption: 'y = ln x. Near x = 1 the output is near 0 while the input is near 1: tiny relative changes of x are huge relative changes of ln x.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: 1 / x, feedback: t`$1/x$ is the derivative. The condition number is $\lvert x f'(x)/f(x)\rvert = 1/\lvert\ln x\rvert$.` }],
          hints: [t`$\kappa = \left\lvert\dfrac{x\cdot(1/x)}{\ln x}\right\rvert = \dfrac{1}{\lvert\ln x\rvert}$.`, t`For a small $\epsilon$, $\ln(1 + \epsilon) \approx \epsilon$.`],
          teach: 'ln x is ill-conditioned near x = 1: an input 1 + ε already carries an error of order u in its ε, and κ ≈ 1/ε multiplies that into the answer.',
          explain: t`$\kappa = 1/\ln(1 + 10^{-${k}}) \approx ${tex(ans, 3)}$: about ${k} of the 16 digits are at risk. This is why the ratio should be carried as $\epsilon = f_1/f_0 - 1$ (computed directly from the frequency difference) and the log taken with \`math.log1p(eps)\`, whose input is the small number itself.`,
        };
      },
    }),
    num({
      id: 'hilbert', difficulty: 2,
      gen(r) {
        const n = r.pick([4, 6, 8, 10]);
        const k = HCOND[n];
        const ans = -lg(k * U);
        return {
          prompt: t`The $${n}\times${n}$ Hilbert matrix $H_{ij} = \dfrac{1}{i + j - 1}$ has condition number $\kappa(H) = ${tex(k, 3)}$. Solving $Hx = b$ with a backward-stable method in float64, about how many correct significant digits can you expect in $x$? (Use relative error $\approx \kappa u$.)`,
          visual: {
            type: 'graph',
            params: { x: [0.8, n + 0.2], y: [0, 1.05], aspect: 'wide', axesAt: 'edge', xlabel: 'column entry index i', ylabel: 'Hᵢⱼ',
              curves: Array.from({ length: n }, (_, j) => ({ fn: `1/(x + ${j})`, color: j ? 'accent' : 'gold', width: 1.6, domain: [1, n] })) },
            caption: t`The ${n} columns of the Hilbert matrix drawn as curves $1/(i + j - 1)$: nearly the same shape, so nearly linearly dependent — which is what a large condition number means.`,
          },
          answer: ans, tol: { rel: 0, abs: 0.7 },
          errors: [{ value: lg(k), feedback: t`$\log_{10}\kappa$ is roughly the number of digits *lost*. Subtract it from the about 16 that float64 carries.` }],
          hints: [t`Relative error $\approx \kappa u$ with $u = 1.1\times10^{-16}$.`, t`Correct digits $\approx -\log_{10}(\kappa u) \approx 16 - \log_{10}\kappa$.`],
          teach: 'A backward-stable solver leaves a relative error of about κu: you lose about log₁₀ κ of the 16 digits, through no fault of the solver.',
          explain: t`$\kappa u = ${tex(k, 3)} \times 1.11\times10^{-16} = ${tex(k * U, 2)}$, so about $${ans.toFixed(1)}$ digits survive. By $n = 12$, $\kappa(H) \approx 1.6\times10^{16}$ and nothing is left: the matrix is singular to working precision.`,
        };
      },
    }),
    mcq({
      id: 'wilkinson', difficulty: 3,
      prompt: t`Wilkinson’s polynomial $w(x) = (x - 1)(x - 2)\cdots(x - 20)$ has well-separated roots $1, 2, \ldots, 20$. Written out, its $x^{19}$ coefficient is $-210$. Change that one coefficient to $-210 - 2^{-23}$ (a relative change of $6\times10^{-10}$) and solve exactly: the roots near 16 and 17 become the complex pair $16.73 \pm 2.81i$. What does this show?`,
      visual: {
        type: 'graph',
        params: { x: [0, 22], y: [-3.4, 3.4], aspect: 'wide', axesAt: 'edge', xlabel: 'Re x', ylabel: 'Im x',
          points: Array.from({ length: 20 }, (_, k) => ({ x: k + 1, y: 0, r: 3.5, color: 'ink3' })).concat([[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8.0073, 0], [8.9173, 0], [10.0953, 0.6435], [10.0953, -0.6435], [11.7936, 1.6523], [11.7936, -1.6523], [13.9924, 2.5188], [13.9924, -2.5188], [16.7307, 2.8126], [16.7307, -2.8126], [19.5024, 1.9403], [19.5024, -1.9403], [20.8469, 0]].map(([x, y]) => ({ x, y, r: 4.5, color: 'bad', hollow: true }))) },
        caption: 'The roots of w (grey) and of the perturbed polynomial (red rings), computed in 50-digit arithmetic so that no rounding is involved: the movement is all conditioning.',
      },
      choices: [
        'Roots are extremely ill-conditioned functions of a polynomial’s coefficients: the problem itself, posed this way, is sensitive',
        'The root-finding algorithm was unstable',
        'Double precision is not enough to store −210',
        'High-degree polynomials always have complex roots',
      ],
      answer: 0,
      why: {
        1: 'The perturbed roots were computed in 50-digit arithmetic; any accurate method finds the same ones.',
        2: '−210 and −210 − 2⁻²³ are both exact float64 numbers; the change is in the data, not its storage.',
        3: 'The unperturbed polynomial has 20 real roots; it is the tiny perturbation that moves them.',
      },
      hints: ['Was any rounding involved in finding the perturbed roots?', 'If exact arithmetic gives the same disaster, the sensitivity belongs to the problem.'],
      teach: 'Polynomial roots as functions of the coefficients can be catastrophically ill-conditioned even when they are well separated — so do not hand a computer a polynomial in expanded form if you can avoid it.',
      explain: t`The relative condition number of the root $r = 16$ with respect to that coefficient is $\lvert 210 \cdot 16^{18}/w'(16)\rvert \approx 3\times10^{10}$, with $w'(16) = 15!\cdot4!$. Wilkinson (1959) called this discovery “the most traumatic experience in my career as a numerical analyst.” The lesson for physics: find eigenvalues from a matrix, not from its characteristic polynomial.`,
    }),
    mcq({
      id: 'residual', difficulty: 2,
      prompt: t`A backward-stable solver returns $\hat x$ for $Ax = b$ with a tiny residual, $\lVert b - A\hat x\rVert/\lVert b\rVert \approx 10^{-16}$, yet $\hat x$ is wrong in its fourth digit. What explains it?`,
      visual: {
        type: 'graph',
        params: { x: [-1, 3], y: [-1, 3], aspect: 'wide', axesAt: 'edge', xlabel: 'x₁', ylabel: 'x₂', equal: true,
          curves: [{ fn: '2 - x', color: 'accent', width: 2, label: 'equation 1', labelAt: -0.6, labelDx: 4, labelDy: -12 }, { fn: '2.2 - 1.1*x', color: 'warn', width: 2, dash: true, label: 'equation 2', labelAt: 2.6, labelDx: 6, labelDy: 14 }],
          points: [{ x: 2, y: 0, r: 4.5, color: 'gold', label: 'solution', labelDx: 8, labelDy: -12 }] },
        caption: 'A 2 × 2 system as two lines: nearly parallel, so their crossing slides far along them when either line moves slightly. Any point near both lines has a small residual.',
      },
      choices: [
        'The system is ill-conditioned (κ ≈ 10¹² or so): a small backward error still allows a large forward error',
        'The solver is unstable: a stable one would give 16 correct digits',
        'The residual was computed wrongly: a small residual guarantees an accurate solution',
        'The matrix must be singular',
      ],
      answer: 0,
      why: {
        1: 'A small residual is exactly what a stable solver promises; it cannot promise more than κu in the solution.',
        2: 'Forward error ≤ κ × backward error: only for κ near 1 does a small residual mean a small error.',
        3: 'A singular matrix has no unique solution; this one has a solution that is merely very sensitive.',
      },
      hints: ['A small residual means x̂ exactly solves a nearby system. How different can the solution of a nearby system be?', 'Forward error ≈ κ × backward error: 10⁻⁴ ≈ κ × 10⁻¹⁶.'],
      teach: 'The residual measures backward error; the forward error can be κ times larger, so check the condition number before trusting digits.',
      explain: t`$10^{-4} \approx \kappa \times 10^{-16}$ means $\kappa \approx 10^{12}$. The solver did its job: $\hat x$ solves a system within rounding of yours. With nearly parallel equations, many points satisfy both nearly as well — $\texttt{np.linalg.cond(A)}$ would have warned you.`,
    }),
    code({
      id: 'backward-recursion', difficulty: 3,
      prompt: t`Write \`I_backward(n, N=40)\` that computes $I_n = \int_0^1 x^ne^{x-1}\,dx$ by running $I_{k-1} = (1 - I_k)/k$ **downwards** from the guess $I_N = 0$ until it reaches $I_n$, and returns it. The program then compares it with the forward recursion.`,
      starter: t`import math

def I_forward(n):
    I = 1 - 1 / math.e
    for k in range(1, n + 1):
        I = 1 - k * I
    return I

def I_backward(n, N=40):
    I = 0.0          # the guess for I_N
    # step down from k = N to k = n + 1, each time turning I_k into I_(k-1)
    return I

for n in [5, 10, 15, 20]:
    print(n, I_forward(n), I_backward(n))
`,
      answer: t`import math

def I_forward(n):
    I = 1 - 1 / math.e
    for k in range(1, n + 1):
        I = 1 - k * I
    return I

def I_backward(n, N=40):
    I = 0.0
    for k in range(N, n, -1):
        I = (1 - I) / k
    return I

for n in [5, 10, 15, 20]:
    print(n, I_forward(n), I_backward(n))`,
      tests: [
        { name: t`$I_{20} = 0.0455448840758180\ldots$ to 14 digits`, code: 'abs(I_backward(20) - 0.04554488407581805) < 1e-15' },
        { name: t`$I_0$ comes back as $1 - 1/e$`, code: 'abs(I_backward(0) - (1 - 1 / math.e)) < 1e-16' },
        { name: t`the guess for $I_N$ hardly matters: $N = 40$ and $N = 60$ agree`, code: 'abs(I_backward(10) - I_backward(10, 60)) < 1e-16' },
        { name: t`$I_n$ stays between 0 and $1/(n+1)$`, code: 'all(0 < I_backward(n) < 1 / (n + 1) for n in range(30))' },
      ],
      hints: ['Loop `for k in range(N, n, -1):` — that runs k = N, N − 1, …, n + 1.', 'Inside: `I = (1 - I) / k` turns Iₖ into Iₖ₋₁.'],
      teach: 'Running a recursion in the direction that divides errors instead of multiplying them turns an unstable algorithm into a stable one.',
      explain: t`Each backward step divides the inherited error by $k$, so the bad starting guess is forgotten geometrically fast — $N = 40$ and $N = 60$ give the same digits. Forward, the error $e_0 \approx 10^{-17}$ grows to $20!\,e_0 \approx 30$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-horizon', difficulty: 3, transfer: true,
      gen(r) {
        const q = r.pick([1.001, 1.01, 1.1, 1.5, 3]);
        const ans = 1 / (2 * (q - 1));
        return {
          prompt: t`A static clock at radius $r$ outside a black hole runs at $f(r) = \sqrt{1 - r_s/r}$ times the rate of a distant one ($r_s$ is the Schwarzschild radius). What is the condition number $\kappa = \lvert r f'(r)/f(r)\rvert$ at $r = ${q}\,r_s$ — the factor by which a relative error in $r$ is magnified in the clock rate?`,
          visual: {
            type: 'graph',
            params: { x: [0.9, 4.1], y: [0, 1.05], aspect: 'wide', axesAt: 'edge', xlabel: 'r / rₛ', ylabel: 'clock rate √(1 − rₛ/r)',
              curves: [{ fn: 'sqrt(1 - 1/x)', color: 'accent', width: 2, domain: [1, 4.1] }],
              vlines: [{ x: 1, label: 'horizon', color: 'bad' }] },
            caption: 'The rate of a static clock against its radius (Schwarzschild exterior, valid outside rₛ only). Near the horizon the curve is vertical.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: 1 / (2 * q * Math.sqrt(1 - 1 / q)), feedback: t`That is $f'(r)$ in units of $1/r_s$. Multiply by $r/f(r)$ to get the *relative* sensitivity.` }],
          hints: [t`$f' = \dfrac{r_s/r^2}{2\sqrt{1 - r_s/r}}$, so $\dfrac{rf'}{f} = \dfrac{r_s/r}{2(1 - r_s/r)}$.`, t`That simplifies to $\kappa = \dfrac{1}{2(r/r_s - 1)}$.`],
          teach: 'Near a horizon the clock rate is ill-conditioned in r: κ = 1/(2(r/rₛ − 1)) diverges, so tiny position errors become large rate errors.',
          explain: t`$\kappa = \dfrac{1}{2(${q} - 1)} = ${tex(ans, 3)}$. ${ans > 10 ? t`Close to the horizon, a radius known to one part in a million gives a clock rate known only to about $${tex(ans * 1e-6, 1)}$ relative — the problem, not any code, is to blame.` : t`Far from the horizon the rate is insensitive: $\kappa$ falls like $r_s/(2r)$.`} The same factor $1/(r - r_s)$ appears in the Schwarzschild metric itself, which is why codes working near horizons use coordinates that remove it.`,
        };
      },
    }),
    mcq({
      id: 'cp-gdop', difficulty: 2, transfer: true,
      prompt: t`A GPS receiver sees four satellites, all bunched in one small patch of sky. It solves for position with a numerically excellent least-squares method, yet its fix wanders by tens of metres while range errors are only a few metres. What is the right diagnosis?`,
      visual: {
        type: 'graph',
        params: { x: [-3.2, 3.2], y: [-1.7, 1.7], aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0, equal: true,
          curves: [
            { param: ['-8 + 8.0225*cos(t)', '0.6 + 8.0225*sin(t)'], t: [-0.3, 0.16], color: 'accent', width: 2 },
            { param: ['-8 + 8.1725*cos(t)', '0.6 + 8.1725*sin(t)'], t: [-0.3, 0.16], color: 'accent', width: 1.4, dash: true },
            { param: ['-8 + 8.0225*cos(t)', '-0.6 + 8.0225*sin(t)'], t: [-0.16, 0.3], color: 'warn', width: 2 },
          ],
          points: [{ x: 0, y: 0, r: 5, color: 'gold', label: 'true position', labelDx: 10, labelDy: -10 }, { x: 0.012, y: -1.0125, r: 5, color: 'bad', label: 'fix with one range 0.15 long', labelDx: 10, labelDy: 4 }] },
        caption: 'Schematic, in two dimensions and arbitrary units: two range circles from satellites about 9° apart in the sky cross at a shallow angle. Lengthen one range by 0.15 (dashed) and the crossing slides 1.0 sideways — an error magnified about seven times.',
      },
      choices: [
        'Poor geometry makes the position problem ill-conditioned (a large dilution of precision): no algorithm can fix it, only better-spread satellites',
        'The least-squares algorithm is unstable and should be replaced',
        'Float64 does not have enough digits for GPS ranges',
        'Four satellites are always too few for a fix',
      ],
      answer: 0,
      why: {
        1: 'A stable method gives the exact solution of a nearby problem — and nearby problems here have far-apart solutions.',
        2: 'Ranges of 2 × 10⁷ m in float64 are stored to about 4 nm; storage is not the issue.',
        3: 'Four is the minimum (three coordinates and the clock offset) and works well when the satellites are spread out.',
      },
      hints: ['Would the problem stay sensitive if you solved it in exact arithmetic?', 'GPS calls the condition number of its geometry the “dilution of precision”.'],
      teach: 'The dilution of precision is a condition number: position error ≈ DOP × range error, a property of the satellites’ geometry, not of the solver.',
      explain: 'With the satellites in one direction, the rows of the geometry matrix are nearly parallel and its condition number is large, so metre-level range errors become tens of metres of position error. Receivers choose widely spread satellites to keep the DOP near 1–2.',
    }),
    mcq({
      id: 'cp-bessel', difficulty: 3,
      prompt: t`The diffraction pattern of a circular aperture needs the Bessel functions $J_n(1)$. A code builds them from $J_0(1)$ and $J_1(1)$ with the exact identity $J_{n+1}(x) = \frac{2n}{x}J_n(x) - J_{n-1}(x)$. It matches tables to 15 digits at $n = 2$, but by $n = 10$ it returns $-6.9\times10^{-9}$ for the true $2.6\times10^{-10}$. What is going on, and what is the fix?`,
      visual: {
        type: 'graph',
        params: { x: [-0.3, 12.3], y: [-13.5, 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'n', ylabel: '|Jₙ(1)|',
          points: JN1.map((v, n) => ({ x: n, y: n12(lg(v)), r: 4.5, color: 'accent' })) },
        caption: 'The true Jₙ(1) for n = 0 … 12 (logarithmic axis), falling like (1/2)ⁿ/n!. The recurrence must produce these tiny numbers as differences of much larger ones.',
      },
      choices: [
        'The recurrence run upward is unstable for these values (it amplifies errors like the growing second solution Yₙ); run it downward from large n, as Miller’s algorithm does',
        'Jₙ(1) is ill-conditioned for large n, so no method can compute it',
        'The identity is only approximate for large n',
        'Float64 underflows below 10⁻⁸',
      ],
      answer: 0,
      why: {
        1: 'Library routines return Jₙ(1) to full precision for any n — the downward recurrence does it — so the values themselves are well-conditioned.',
        2: 'It is exact for every n; the trouble is the rounding it amplifies.',
        3: 'Float64 reaches down to 10⁻³⁰⁸; nothing here underflows.',
      },
      hints: ['Compare with the integrals Iₙ: was the problem or the direction of the recursion at fault there?', 'The same recurrence is satisfied by Yₙ, which grows like n!(2/x)ⁿ: any rounding error excites that growing solution.'],
      teach: 'A recurrence with a growing and a decaying solution is stable only in the direction in which the wanted solution grows; to compute the decaying one, run it the other way.',
      explain: t`Rounding errors in $J_0$ and $J_1$ excite a small multiple of $Y_n$, which grows by a factor of about $2n$ per step while $J_n$ shrinks by the same factor. By $n = 10$ the error dominates. Downward, $J_n$ is the growing solution, so errors die out — the same reversal that rescued $I_n$.`,
    }),
  ],
  sources: [
    { label: 'Trefethen & Bau (1997), Numerical Linear Algebra, SIAM, lectures 12–15 (conditioning, stability, backward stability)', url: 'https://doi.org/10.1137/1.9780898719574' },
    { label: 'Higham (2002), Accuracy and Stability of Numerical Algorithms, 2nd ed., SIAM, ch. 1', url: 'https://doi.org/10.1137/1.9780898718027' },
    { label: 'Wilkinson (1984), The perfidious polynomial, in Studies in Numerical Analysis, MAA', url: 'https://openlibrary.org/search?q=Studies+in+Numerical+Analysis+Golub' },
    { label: 'Gautschi (1967), Computational aspects of three-term recurrence relations, SIAM Review 9, 24', url: 'https://doi.org/10.1137/1009002' },
  ],
});
