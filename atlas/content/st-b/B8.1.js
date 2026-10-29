// Fourier series solutions, the mathematician's view: completeness (every
// square-integrable profile is a sum of eigenfunctions), what kind of
// convergence you get (mean square always; pointwise with a Gibbs overshoot
// at jumps), Parseval's energy bookkeeping, why a heat series converges
// absurdly fast for t > 0 while a wave series keeps its kinks, termwise
// differentiation, and eigenfunction expansion for forced problems.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const r4 = (x) => +x.toPrecision(4);
// Si(π) by Simpson's rule, and the Gibbs numbers that follow from it
const SI_PI = (() => { const n = 20000, h = Math.PI / n; let s = 0; for (let i = 0; i <= n; i++) { const x = i * h; s += (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) * (x ? Math.sin(x) / x : 1); } return (s * h) / 3; })();
const GIBBS_PEAK = (2 / Math.PI) * SI_PI;            // limit of the peak of the ±1 square wave's partial sums
const GIBBS_FRAC = SI_PI / Math.PI - 0.5;           // overshoot as a fraction of the jump
// smallest number K of odd terms with every omitted term below 1e-3, for the rod with uniform start, at τ = Dt/L²
const termsNeeded = (tau) => { for (let k = 1; ; k++) { const n = 2 * k - 1; if ((4 / (n * Math.PI)) * Math.exp(-n * n * Math.PI ** 2 * tau) < 1e-3) return k - 1; } };

export default lesson({
  id: 'st-b.B8.1',
  title: 'Fourier series solutions',
  minutes: 15, difficulty: 3,
  intro: t`Separation hands you modes; a solution needs the initial data written as a sum of them. That this is always possible is a theorem — **completeness**: the eigenfunctions $\sin(n\pi x/L)$ of $X'' + \lambda X = 0$ with fixed ends (and those of every regular Sturm–Liouville problem) can represent any profile $f$ with finite energy $\int f^2\,dx$:

$$f(x) = \sum_{n=1}^\infty b_n\sin\frac{n\pi x}{L}, \qquad b_n = \frac2L\int_0^L f(x)\sin\frac{n\pi x}{L}\,dx .$$

But “represent” needs care. The sum always converges **in mean square** — the energy of the error goes to zero, and **Parseval’s identity** $\tfrac{L}{2}\sum b_n^2 = \int_0^L f^2\,dx$ balances the books. At a jump, though, every partial sum overshoots by about 9% of the jump, however many terms you take: the **Gibbs phenomenon**. Feed the series to the heat equation and the factor $e^{-Dn^2\pi^2t/L^2}$ makes all of this harmless the instant $t > 0$.`,
  symbols: [
    { tex: 'f(x)', text: 'the initial profile on $0 < x < L$ (units of $u$)' },
    { tex: 'b_n', text: 'the $n$-th Fourier sine coefficient: how much of mode $n$ the profile contains' },
    { tex: t`\sin\frac{n\pi x}{L}`, text: 'the $n$-th eigenfunction of $X\'\' + \\lambda X = 0$, $X(0) = X(L) = 0$' },
    { tex: 'L', text: 'the length of the interval (m)' },
  ],
  why: t`Every spectral code in numerical relativity — the SpEC code that computed the waveforms LIGO compares against — expands fields in complete sets of functions like these. Smooth fields converge exponentially fast; a kink or a shock brings back Gibbs ringing, which is why shock-capturing methods exist.`,
  visual: {
    type: 'graph',
    title: 'Gibbs, and how heat erases it',
    lead: t`The partial sums of the Fourier series of a square wave (±1). Add terms: the sum hugs the square more closely, except for a spike beside each jump that never shrinks below the gold line. Then let the heat equation act for a moment.`,
    tasks: [
      'Raise N from 3 to 60 at t = 0: the overshoot narrows toward the jump but keeps its height — about 1.179.',
      'Now raise the time to 0.01: the spike is gone, and N = 10 already matches N = 60.',
      'At the jump itself (x = 0 or π), every partial sum is exactly 0: the series converges to the midpoint of the jump.',
    ],
    params: {
      x: [0, 6.2832], y: [-1.45, 1.45], aspect: 'wide', xlabel: 'x', ylabel: 'u', axesAt: 'edge',
      sliders: [
        { key: 'N', label: 'Odd terms $N$', min: 1, max: 60, step: 1, value: 5, explain: 'The number of nonzero terms, $n = 1, 3, 5, \\dots, 2N - 1$.' },
        { key: 'tau', label: 'Heat time $Dt$', min: 0, max: 0.05, step: 0.0005, value: 0, explain: 'Each term is multiplied by $e^{-n^2Dt}$ (interval of length π).' },
      ],
      curves: [
        { fn: 'step(pi - x)*2 - 1', color: 'ink3', dash: [5, 4], width: 1.3, domain: [0.001, 6.282] },
        { sum: '4/((2k - 1)*pi)*sin((2k - 1)*x)*e^(-(2k - 1)^2*tau)', k: [1, 'N'], color: 'accent', width: 2.4 },
      ],
      hlines: [{ y: GIBBS_PEAK, color: 'gold', label: `Gibbs limit ${r4(GIBBS_PEAK)}` }, { y: -GIBBS_PEAK, color: 'gold' }],
    },
    caption: t`$\sum_{k=1}^{N}\frac{4}{(2k - 1)\pi}e^{-(2k - 1)^2Dt}\sin(2k - 1)x$: the square wave’s series, damped by the heat equation on $[0, \pi]$ with both ends held at 0 (shown over two half-periods). The gold lines are the limit $\tfrac2\pi\operatorname{Si}(\pi) \approx ${r4(GIBBS_PEAK)}$ of the peak as $N \to \infty$.`,
  },
  example: {
    prompt: t`A rod $0 < x < L$ starts at a uniform temperature $u_0$; at $t = 0$ both ends are plunged to 0. Find its Fourier series, check Parseval, and decide how many terms you need at $t = 0$ and at $Dt/L^2 = 0.005$ for an error below $10^{-3}u_0$ in every term left out.`,
    visual: { type: 'graph', params: { x: [0, 1], y: [-0.1, 1.25], aspect: 'wide', xlabel: 'x / L', ylabel: 'u / u₀', axesAt: 'edge', curves: [
      { sum: '4/((2k - 1)*pi)*sin((2k - 1)*pi*x)', k: [1, 15], color: 'violet', width: 1.6, label: 't = 0, 15 terms', labelAt: 0.5, labelDy: -34 },
      { sum: '4/((2k - 1)*pi)*sin((2k - 1)*pi*x)*e^(-(2k - 1)^2*pi^2*0.005)', k: [1, 5], color: 'accent', width: 2.4, label: 'Dt/L² = 0.005, 5 terms', labelAt: 0.5, labelDy: 34 },
    ] }, caption: 'The initial step needs many terms and still overshoots at the ends; a moment later five terms are exact to the width of the line.' },
    steps: [
      { label: 'Coefficients', text: t`$b_n = \dfrac2L\displaystyle\int_0^L u_0\sin\frac{n\pi x}{L}\,dx = \frac{2u_0}{n\pi}\big(1 - \cos n\pi\big)$: $\;\dfrac{4u_0}{n\pi}$ for odd $n$, 0 for even $n$.` },
      { label: 'Solution', text: t`$u = \displaystyle\sum_{n\ \text{odd}}\frac{4u_0}{n\pi}\,e^{-Dn^2\pi^2t/L^2}\sin\frac{n\pi x}{L}$.` },
      { label: 'Parseval', text: t`$\tfrac{L}{2}\sum b_n^2 = \tfrac{L}{2}\cdot\dfrac{16u_0^2}{\pi^2}\sum_{n\ \text{odd}}\dfrac{1}{n^2}$ must equal $\int_0^L u_0^2\,dx = u_0^2L$. So $\sum_{n\ \text{odd}}1/n^2 = \pi^2/8$ — a classical sum, obtained free.` },
      { label: 'At t = 0', text: t`The terms fall only as $1/n$: dropping everything past $n$ leaves terms of size $4/(n\pi)$, so all omitted terms are below $10^{-3}$ only beyond $n \approx 1270$. And near the ends the partial sums overshoot to about $${r4(GIBBS_PEAK)}u_0$ however many you keep — the series does not converge uniformly there.` },
      { label: 'A moment later', text: t`At $Dt/L^2 = 0.005$ term $n$ carries $e^{-0.005\pi^2n^2}$: the first omitted term falls below $10^{-3}$ after only ${termsNeeded(0.005)} odd terms ($n \le ${2 * termsNeeded(0.005) - 1}$).` },
    ],
    answer: t`$u = \sum_{n\ \text{odd}}\frac{4u_0}{n\pi}e^{-Dn^2\pi^2t/L^2}\sin\frac{n\pi x}{L}$. Parseval gives $\sum_{\text{odd}}1/n^2 = \pi^2/8$. At $t = 0$ you would need hundreds of terms and still see Gibbs overshoot at the ends; at $Dt/L^2 = 0.005$, ${termsNeeded(0.005)} terms suffice.`,
  },
  practice: [
    num({
      id: 'gibbs-height', difficulty: 2,
      gen(r) {
        const A = r.pick([1, 2, 5, 10]);
        return {
          prompt: t`A square wave jumps between $-${A}$ and $+${A}$. As more and more terms of its Fourier series are added, what value does the highest point of the partial sums approach?`,
          visual: { type: 'graph', params: { x: [0, 6.2832], y: [-1.45 * A, 1.45 * A], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [{ fn: `${A}*(step(pi - x)*2 - 1)`, color: 'ink3', dash: [5, 4], width: 1.3, domain: [0.001, 6.282] }, { sum: `${A}*4/((2k - 1)*pi)*sin((2k - 1)*x)`, k: [1, 15], color: 'accent', width: 2.2 }] }, caption: 'The square wave (dashed) and its partial sum with 15 terms.' },
          answer: A * GIBBS_PEAK, tol: { rel: 0.003 },
          errors: [{ value: A, feedback: 'The overshoot does not die out as terms are added; it only narrows.' }, { value: A * (1 + GIBBS_FRAC), feedback: t`The overshoot is about 9% of the **jump**, $2\times${A}$, not of the height ${A}.` }],
          hints: ['The overshoot is a fixed fraction, about 9%, of the size of the jump.', t`The jump is $${2 * A}$; the limit of the peak is $\tfrac2\pi\operatorname{Si}(\pi)\times${A} \approx ${r4(GIBBS_PEAK)}\times${A}$.`],
          teach: 'Gibbs: partial sums of a Fourier series overshoot a jump by about 8.95% of the jump, however many terms are taken.',
          explain: t`The peak tends to $${A}\cdot\tfrac{2}{\pi}\operatorname{Si}(\pi) = ${r4(A * GIBBS_PEAK)}$: an overshoot of $${r4(A * (GIBBS_PEAK - 1))}$, which is ${r3(100 * GIBBS_FRAC)}% of the jump $${2 * A}$.`,
        };
      },
    }),
    mcq({
      id: 'converges-how', difficulty: 2,
      prompt: t`The Fourier sine series of a function with a jump is summed with more and more terms. Which statement is true?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-0.2, 1.3], aspect: 'wide', xlabel: 'x (near a jump at x = 0)', ylabel: '', axesAt: 'edge', curves: [5, 20, 80].map((N, i) => ({ sum: '4/((2k - 1)*pi)*sin((2k - 1)*x)', k: [1, N], color: ['violet', 'accent', 'teal'][i], width: 1.8, label: `${N} terms`, labelAt: [0.55, 0.3, 0.12][i], labelDy: -12 })) }, caption: 'Partial sums with 5, 20 and 80 terms near the jump: the bump narrows but stays as tall.' },
      choices: ['The energy of the error, ∫(f − Sₙ)², tends to 0, but the maximum error near the jump does not', 'The maximum error tends to 0 everywhere', 'The series diverges at the jump', 'Nothing converges until infinitely many terms are added'],
      answer: 0,
      why: {
        1: 'The overshoot keeps its height of about 9% of the jump — the convergence is not uniform.',
        2: 'At the jump every partial sum equals the midpoint of the two sides: it converges there, just to neither side’s value.',
        3: 'Mean-square convergence is a statement about the partial sums: their error energy shrinks steadily as N grows.',
      },
      hints: ['The bump narrows as N grows. What happens to its area, and to its height?'],
      teach: 'Fourier series converge in mean square for any finite-energy function; uniform convergence fails at jumps (Gibbs).',
      explain: t`The overshoot region shrinks in width like $1/N$, so its contribution to $\int(f - S_N)^2$ goes to zero — mean-square convergence — while its height stays near 9% of the jump: no uniform convergence. Pointwise, the series converges to $f$ wherever $f$ is smooth, and to the average of the two one-sided values at a jump.`,
    }),
    num({
      id: 'parseval-sum', difficulty: 2,
      prompt: t`On $-\pi < x < \pi$ the function $f(x) = x$ has the Fourier series $\sum_{n \ge 1}\frac{2(-1)^{n+1}}{n}\sin nx$. Parseval’s identity on this interval reads $\sum b_n^2 = \frac1\pi\int_{-\pi}^{\pi}f^2\,dx$. Use it to find $\sum_{n=1}^\infty \dfrac{1}{n^2}$.`,
      visual: { type: 'graph', params: { x: [-3.1416, 3.1416], y: [-3.8, 3.8], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [{ fn: 'x', color: 'ink3', dash: [5, 4], width: 1.3 }, { sum: '2*(-1)^(k + 1)/k*sin(k*x)', k: [1, 12], color: 'accent', width: 2.2 }] }, caption: 'f(x) = x (dashed) and its 12-term Fourier series.' },
      answer: Math.PI ** 2 / 6, tol: { rel: 0.002 },
      errors: [{ value: Math.PI ** 2 / 8, feedback: 'That is the sum over odd n only (from the square wave). Here every n appears.' }, { value: (2 * Math.PI ** 2) / 3, feedback: t`That is $\sum b_n^2$ itself. Each $b_n^2 = 4/n^2$: divide by 4.` }],
      hints: [t`$\frac1\pi\int_{-\pi}^{\pi}x^2\,dx = \frac{2\pi^2}{3}$.`, t`$\sum b_n^2 = 4\sum 1/n^2$.`],
      teach: 'Parseval’s identity turns a Fourier series into an exact sum: the energy in the modes equals the energy in the function.',
      explain: t`$4\sum\frac1{n^2} = \frac{2\pi^2}{3}$, so $\sum\frac1{n^2} = \frac{\pi^2}{6} \approx ${r4(Math.PI ** 2 / 6)}$ — the Basel problem, which Euler solved in 1734, here as an energy balance.`,
    }),
    num({
      id: 'terms-needed', difficulty: 3,
      gen(r) {
        const tau = r.pick([0.0002, 0.001, 0.005, 0.02]);
        const K = termsNeeded(tau);
        return {
          prompt: t`For the rod of the worked example, $u/u_0 = \sum_{n\ \text{odd}}\frac{4}{n\pi}e^{-n^2\pi^2\tau}\sin\frac{n\pi x}{L}$ with $\tau = Dt/L^2 = ${tau}$. Keep the odd terms $n = 1, 3, \dots$ in order. How many terms must you keep so that every term left out has amplitude below $10^{-3}$?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-0.1, 1.25], aspect: 'wide', xlabel: 'x / L', ylabel: 'u / u₀', axesAt: 'edge', curves: [{ sum: `4/((2k - 1)*pi)*sin((2k - 1)*pi*x)*e^(-(2k - 1)^2*pi^2*${tau})`, k: [1, 200], color: 'accent', width: 2.4 }] }, caption: `The rod’s temperature at Dt/L² = ${tau} (200-term sum).` },
          answer: K, tol: { rel: 0, abs: 0.5 },
          errors: K > 1 ? [{ value: 2 * K - 1, feedback: 'That is the largest n kept. The question asks how many (odd) terms that is.' }] : [],
          hints: [t`Term $n$ has amplitude $\frac{4}{n\pi}e^{-n^2\pi^2\tau}$; amplitudes fall as $n$ grows.`, t`Find the first odd $n$ whose amplitude is below $10^{-3}$: all the terms before it must be kept.`],
          teach: 'For t > 0 the heat series converges faster than geometrically: the number of terms needed drops like 1/√t.',
          explain: t`The first odd $n$ with $\frac{4}{n\pi}e^{-n^2\pi^2\cdot${tau}} < 10^{-3}$ is $n = ${2 * K + 1}$, so keep $n = 1, \dots, ${2 * K - 1}$: ${K} term${K === 1 ? '' : 's'}. At $t = 0$ the same criterion would need about 640 terms.`,
        };
      },
    }),
    expr({
      id: 'forced-mode', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3]), q = r.pick([2, 5, 10]), D = r.pick([0.5, 1, 2]);
        const N = n === 1 ? '\\pi' : `${n}\\pi`;
        return {
          prompt: t`A rod $0 < x < 1$ with both ends held at 0 is heated by a source shaped like one mode: $u_t = ${D}\,u_{xx} + ${q}\sin(${N} x)$. What is its steady temperature?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-1.2 * q, 1.2 * q], aspect: 'wide', xlabel: 'x', ylabel: 'source', axesAt: 'edge', curves: [{ fn: `${q}*sin(${n}*pi*x)`, color: 'warn', width: 2.2 }] }, caption: 'The heating, shaped like the eigenfunction sin(nπx).' },
          answer: `${q}*sin(${n}*pi*x)/(${D}*${n * n}*pi^2)`,
          answerTeX: t`\frac{${q}\sin(${N} x)}{${tex(D * n * n)}\pi^2}`,
          lhs: 'u(x)',
          vars: { x: [0.05, 0.95] },
          errors: [{ answer: `${q}*sin(${n}*pi*x)/(${D}*${n}*pi)`, feedback: t`Two derivatives of $\sin(${N} x)$ bring down $(${N})^2$, not $${N}$.` }, { answer: `-${q}*sin(${n}*pi*x)/(${D}*${n * n}*pi^2)`, feedback: t`Sign: steady means $0 = D u'' + q\sin$, and $(\sin kx)'' = -k^2\sin kx$, so $u = +q\sin/(Dk^2)$ — heating makes the rod warmer.` }],
          hints: [t`Steady: $0 = ${D}u'' + ${q}\sin(${N} x)$. Try $u = C\sin(${N} x)$, which already vanishes at both ends.`, t`$${D}\cdot(-(${N})^2)C + ${q} = 0$.`],
          teach: 'Expanding a source in eigenfunctions solves a forced problem mode by mode: each mode’s response is its forcing divided by Dλₙ.',
          explain: t`$C = \dfrac{${q}}{${D}(${N})^2}$, so $u = \dfrac{${q}\sin(${N} x)}{${tex(D * n * n)}\pi^2}$. A general source $q(x) = \sum q_n\sin(n\pi x)$ gives $u = \sum \dfrac{q_n}{Dn^2\pi^2}\sin(n\pi x)$: high modes respond weakly, so the steady state is smoother than its source.`,
        };
      },
    }),
    mcq({
      id: 'termwise', difficulty: 3,
      prompt: t`The square wave’s series is $\sum_{\text{odd } n}\frac{4}{n\pi}\sin nx$. Differentiate it term by term. What do you get, and what does it say about termwise differentiation?`,
      visual: { type: 'graph', params: { x: [0, 6.2832], y: [-28, 28], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [{ sum: '4/pi*cos((2k - 1)*x)', k: [1, 20], color: 'warn', width: 1.6 }] }, caption: 'The termwise derivative cut off at 20 terms: spikes at the jumps that grow with every term, and no settling elsewhere.' },
      choices: [t`$\sum\frac4\pi\cos nx$, whose terms do not shrink: it diverges, so termwise differentiation is not allowed here`, 'Zero, the derivative of a constant on each half', 'A convergent series for the derivative, with Gibbs overshoot', 'Twice the original series'],
      answer: 0,
      why: {
        1: 'The derivative is zero away from the jumps, but the termwise series does not converge to it: its terms never shrink.',
        2: 'A series whose terms all have size 4/π cannot converge anywhere.',
        3: t`Differentiating $\sin nx$ gives $n\cos nx$; the factor $n$ cancels the $1/n$ — it does not double anything.`,
      },
      hints: [t`$\frac{d}{dx}\frac{4}{n\pi}\sin nx = \frac4\pi\cos nx$. Do these terms go to zero?`, 'A series can only converge if its terms tend to zero. Here every term has size 4/π.'],
      teach: 'Termwise differentiation needs the coefficients to fall fast enough; the heat factor $e^{-n^2t}$ provides that for any t > 0.',
      explain: t`The $1/n$ decay of a jump’s coefficients is cancelled by the $n$ from differentiating. For the heat solution at $t > 0$ the terms carry $e^{-n^2\pi^2Dt/L^2}$ as well, which beats any power of $n$: the series can be differentiated as often as you like, which is how one proves the solution is infinitely smooth (lesson B4.3).`,
    }),
    code({
      id: 'gibbs-measure', difficulty: 3,
      prompt: t`Measure the Gibbs overshoot. For the square wave’s partial sum $S_N(x) = \sum_{k=1}^{N}\frac{4}{(2k - 1)\pi}\sin\big((2k - 1)x\big)$, write \`S(x, N)\` and find its maximum on a fine grid of $0 < x < 3/N$, where the first peak lies. Store the maxima for $N = 10, 100, 1000$ in \`peaks\` (a list), and $N\times$ the location of the maximum for $N = 1000$ in \`where\`.`,
      starter: t`import numpy as np

def S(x, N):
    pass

def grid(N):
    return np.linspace(1e-6, 3 / N, 30001)

peaks = None
where = None
print(peaks, where)
`,
      answer: t`import numpy as np

def S(x, N):
    total = np.zeros_like(x)
    for k in range(1, N + 1):
        n = 2 * k - 1
        total += 4 / (n * np.pi) * np.sin(n * x)
    return total

def grid(N):
    return np.linspace(1e-6, 3 / N, 30001)

peaks = [S(grid(N), N).max() for N in (10, 100, 1000)]
x = grid(1000)
where = 1000 * x[np.argmax(S(x, 1000))]
print(peaks, where)`,
      tests: [
        { name: 'the peaks barely change from N = 100 to N = 1000', code: 'peaks is not None and abs(peaks[1] - peaks[2]) < 0.002' },
        { name: t`for $N = 1000$ the peak is within 0.001 of $\tfrac2\pi\operatorname{Si}(\pi) \approx 1.1790$`, code: 'peaks is not None and abs(peaks[2] - 1.17898) < 1e-3' },
        { name: t`the peak sits at $x \approx \pi/(2N)$: $N x_{\max}$ is within 0.01 of $\pi/2$`, code: 'where is not None and abs(where - np.pi / 2) < 0.01' },
      ],
      hints: ['Loop over k from 1 to N, adding `4/(n*np.pi)*np.sin(n*x)` with `n = 2*k - 1` to a running array.', 'Then `peaks = [S(grid(N), N).max() for N in (10, 100, 1000)]`.', 'With `x = grid(1000)`: `where = 1000 * x[np.argmax(S(x, 1000))]`.'],
      teach: 'The Gibbs peak has a fixed height and a width that shrinks like 1/N: it moves toward the jump without going away.',
      explain: t`You should find peaks of 1.1798, 1.1790 and 1.1790, and $Nx_{\max} \approx 1.571 = \pi/2$. The spike’s height converges to $\tfrac2\pi\operatorname{Si}(\pi) = ${r4(GIBBS_PEAK)}$ while its position slides toward the jump like $\pi/(2N)$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pressure-step', difficulty: 2, transfer: true,
      gen(r) {
        const p0 = r.pick([1, 5, 10]), p1 = r.pick([40, 70, 100]);
        const peak = p1 + GIBBS_FRAC * (p1 - p0);
        return {
          prompt: t`On a rocket test stand, chamber pressure steps from ${p0} bar to ${p1} bar at ignition. The record is passed through an ideal “brick-wall” low-pass filter, which keeps every frequency below a cutoff and removes everything above — exactly a truncated Fourier representation. What peak pressure does the filtered trace show just after the step, in bar?`,
          visual: { type: 'graph', params: { x: [-1, 3], y: [p0 - 0.2 * (p1 - p0), p1 + 0.3 * (p1 - p0)], aspect: 'wide', xlabel: 't (ms, illustrative)', ylabel: 'p (bar)', axesAt: 'edge', curves: [{ fn: `${p0} + ${p1 - p0}*step(x)`, color: 'ink3', dash: [5, 4], width: 1.4 }] }, caption: 'The true pressure step (dashed). The filtered trace is not shown.' },
          answer: peak, units: 'bar', tol: { rel: 0.002 },
          errors: [{ value: p1, feedback: 'An ideal sharp-cutoff filter rings: the trace overshoots the final value however high the cutoff.' }, ...(Math.abs(p1 * (1 + GIBBS_FRAC) - peak) > 0.006 * peak ? [{ value: p1 * (1 + GIBBS_FRAC), feedback: 'The overshoot is a fraction of the jump, from the starting pressure, not of the final value.' }] : [])],
          hints: ['The overshoot is about 8.95% of the jump.', t`Peak $= p_1 + ${r4(GIBBS_FRAC)}\,(p_1 - p_0)$.`],
          teach: 'Gibbs ringing is why sharply band-limited records of steps overshoot by ~9% of the step: a property of truncated Fourier representations, not of the hardware.',
          explain: t`Peak $= ${p1} + ${r4(GIBBS_FRAC)}\times${p1 - p0} = ${r3(peak)}$ bar. Raising the cutoff squeezes the ringing closer to the step but never lowers it. Real instrument filters (Bessel, Butterworth) roll off gradually and ring differently — engineers choose them partly to avoid this overshoot.`,
        };
      },
    }),
    num({
      id: 'cp-fundamental-share', difficulty: 2,
      gen(r) {
        const w = r.pick(['square', 'triangle']);
        const share = w === 'square' ? 8 / Math.PI ** 2 : 96 / Math.PI ** 4;
        return {
          prompt: w === 'square'
            ? t`A ${w} wave has odd-$n$ coefficients $b_n = \frac{4}{n\pi}$. Using Parseval’s identity, what fraction of its energy $\int f^2$ is in the fundamental, $n = 1$? (Use $\sum_{n\ \text{odd}}1/n^2 = \pi^2/8$.)`
            : t`A ${w} wave has odd-$n$ coefficients $b_n = \frac{8(-1)^{(n-1)/2}}{n^2\pi^2}$. Using Parseval’s identity, what fraction of its energy $\int f^2$ is in the fundamental, $n = 1$? (Use $\sum_{n\ \text{odd}}1/n^4 = \pi^4/96$.)`,
          visual: { type: 'graph', params: { x: [0, 6.2832], y: [-1.4, 1.4], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [{ fn: w === 'square' ? 'step(pi - x)*2 - 1' : '(1 - 2*abs(x - pi/2)/pi)*step(pi - x) - (1 - 2*abs(x - 3*pi/2)/pi)*step(x - pi)', color: 'ink3', dash: [5, 4], width: 1.4, domain: [0.001, 6.282] }, { fn: w === 'square' ? '4/pi*sin(x)' : '8/pi^2*sin(x)', color: 'accent', width: 2.2 }] }, caption: `The ${w} wave (dashed) and its fundamental alone (blue).` },
          answer: share, tol: { rel: 0.002 },
          hints: [t`Energy in mode $n$ is proportional to $b_n^2$; the total is proportional to $\sum b_n^2$.`, w === 'square' ? t`Fraction $= \dfrac{1}{\sum_{\text{odd}}1/n^2} = \dfrac{8}{\pi^2}$.` : t`Fraction $= \dfrac{1}{\sum_{\text{odd}}1/n^4} = \dfrac{96}{\pi^4}$.`],
          teach: 'Parseval splits a signal’s energy among its modes; smoother signals keep more of it in the fundamental.',
          explain: t`The fraction is $b_1^2/\sum b_n^2 = ${w === 'square' ? t`8/\pi^2` : t`96/\pi^4`} \approx ${r4(share)}$. The ${w === 'square' ? 'square wave’s jumps spread almost a fifth of its energy into overtones' : 'triangle has only kinks, not jumps, so its coefficients fall as 1/n² and 98.6% of its energy sits in the fundamental'}.`,
        };
      },
    }),
    mcq({
      id: 'cp-smooth-later', difficulty: 2,
      prompt: t`The rod of the worked example starts with a jump at each end, yet its series solution is infinitely differentiable at every $t > 0$. Which feature of the heat series is responsible?`,
      visual: { type: 'graph', params: { x: [0, 30], y: [-8, 0.5], aspect: 'wide', xlabel: 'n', ylabel: 'log₁₀ |coefficient|', axesAt: 'edge', curves: [{ fn: 'log10(4/(pi*x))', color: 'ink3', dash: [5, 4], width: 1.6, label: 't = 0: 1/n', labelAt: 24, labelDy: -12, domain: [1, 30] }, { fn: 'log10(4/(pi*x)) - x^2*pi^2*0.002*log10(e)', color: 'accent', width: 2.2, label: 'Dt/L² = 0.002', labelAt: 16, labelDx: 8, domain: [1, 30] }] }, caption: 'The size of the n-th coefficient at t = 0 and a moment later, on a log scale.' },
      choices: [t`each term carries $e^{-Dn^2\pi^2t/L^2}$, which shrinks faster than any power of $n$ grows`, 'the initial coefficients 4/(nπ) are small', 'the end conditions are homogeneous', 'only odd terms appear'],
      answer: 0,
      why: {
        1: t`$4/(n\pi)$ falls only like $1/n$ — too slowly even to differentiate once termwise.`,
        2: 'Homogeneous ends allow the sine expansion but do nothing to its convergence.',
        3: 'Dropping the even terms halves the work; the odd terms alone still fall only like 1/n.',
      },
      hints: ['Differentiating k times multiplies term n by about nᵏ. What must the coefficients do for that series to converge?'],
      teach: 'Diffusion’s factor $e^{-Dn^2\\pi^2t/L^2}$ beats every polynomial in n: that is the smoothing property, in Fourier form.',
      explain: t`The $k$-th derivative’s series has terms of size $n^k\cdot\frac{4}{n\pi}e^{-Dn^2\pi^2t/L^2}$, which converge for every $k$ once $t > 0$. The wave equation has $\cos(n\pi ct/L)$ instead, which never shrinks — so a plucked string keeps its kinks for ever.`,
    }),
  ],
  sources: [SRC.strauss, { label: 'G. B. Folland, Fourier Analysis and Its Applications (AMS, 1992), ch. 2', url: 'https://openlibrary.org/search?q=folland+fourier+analysis+and+its+applications' }, { label: 'E. Hewitt & R. E. Hewitt, The Gibbs–Wilbraham phenomenon, Arch. Hist. Exact Sci. 21, 129 (1979)', url: 'https://doi.org/10.1007/BF00330404' }],
});
