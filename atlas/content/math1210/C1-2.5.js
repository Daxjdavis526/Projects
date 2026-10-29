// Limits at infinity — where a function settles as its input grows without
// bound: horizontal asymptotes, rational functions, and the growth hierarchy.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt, frac, tex } from '../../src/core/format.js';

const t = String.raw;

const C = 2.99792458e8, G = 9.81, YR = 3.15576e7;   // m/s, m/s², s per Julian year

export default lesson({
  id: 'math1210.C1-2.5',
  title: 'Limits at infinity',
  minutes: 9, difficulty: 2,
  intro: t`A limit at infinity asks where a function settles as its input grows without bound:

$$\lim_{x\to\infty} f(x) = L$$

means that for every tolerance $\varepsilon > 0$ there is a point $M$ beyond which $f(x)$ stays within $\varepsilon$ of $L$. The line $y = L$ is then a **horizontal asymptote**. For a ratio of polynomials, divide top and bottom by the highest power of $x$ in the denominator: equal degrees give the ratio of leading coefficients, a bigger denominator gives $0$, a bigger numerator gives $\pm\infty$. Beyond polynomials there is a **growth hierarchy**: $\ln x \ll x^p \ll e^x$ for every $p > 0$ — any exponential eventually beats any power, and any power beats any logarithm.`,
  symbols: [
    { tex: 'x \\to \\infty', text: '$x$ increases without bound (or $x \\to -\\infty$: decreases without bound)' },
    { tex: 'L', text: 'the value $f$ settles on: the height of the horizontal asymptote' },
    { tex: '\\varepsilon', text: 'a tolerance: how close to $L$ you demand $f$ to stay' },
    { tex: 'M', text: 'a point beyond which $f$ always stays within $\\varepsilon$ of $L$; a smaller $\\varepsilon$ usually needs a larger $M$' },
  ],
  why: t`Terminal speeds, steady states, equilibrium temperatures and the speed of light as an unreachable ceiling are all limits at infinity.`,
  visual: {
    type: 'graph',
    title: 'Terminal speed: settling within a tolerance',
    lead: t`A skydiver’s speed with quadratic drag is $v(t) = v_T\tanh(gt/v_T)$, with terminal speed $v_T = 55$ m/s. The green band is $v_T \pm \varepsilon$; the dashed line marks the time $M$ after which $v$ never leaves the band.`,
    tasks: [
      t`At $\varepsilon = 5$ m/s, $M$ is about $8.5$ s. Halve $\varepsilon$ again and again: $M$ grows, but there is always one. That is what $\lim_{t\to\infty} v(t) = 55$ m/s means.`,
      t`The curve never touches $55$ m/s: the limit is approached forever and reached at no finite time.`,
      t`Note how slowly $M$ grows: each halving of $\varepsilon$ adds only about $1.9$ s, because $\tanh$ closes in exponentially.`,
    ],
    params: {
      x: [-1, 30], y: [-3, 66], aspect: 'wide', xlabel: 't (s)', ylabel: 'v (m/s)',
      sliders: [{ key: 'eps', label: t`Tolerance $\varepsilon$`, min: 0.1, max: 10, step: 0.1, value: 5, unit: t`\text{m/s}`, explain: t`How close to the terminal speed the skydiver must stay.` }],
      curves: [{ fn: '55*tanh(9.81*x/55)', color: 'accent', domain: [0, 30] }],
      shade: [{ fn: '55 + eps', lower: '55 - eps', from: 0, to: 30, color: 'good', alpha: 0.16 }],
      hlines: [{ y: 55, label: 'terminal speed', color: 'ink3' }],
      vlines: [{ x: '(55/9.81)*atanh(1 - eps/55)', label: 'M', color: 'gold' }],
      readouts: [{ label: t`$M$`, expr: '(55/9.81)*atanh(1 - eps/55)', unit: t`\text{s}`, digits: 3 }],
    },
    caption: t`Quadratic drag with a fixed coefficient, starting from rest. A real fall starts high, where thinner air raises the terminal speed; this is a sea-level model.`,
  },
  example: {
    prompt: t`In relativity a particle of mass $m$ and momentum $p$ moves at $v(p) = \dfrac{pc^2}{\sqrt{p^2c^2 + m^2c^4}}$. Find $\displaystyle\lim_{p\to\infty} v(p)$.`,
    visual: { type: 'graph', params: { x: [0, 6], y: [0, 2.2], aspect: 'wide', xlabel: 'p / mc', ylabel: 'v / c', curves: [{ fn: 'x/sqrt(x^2 + 1)', color: 'accent', label: 'relativity', labelAt: 4.5, labelDy: 16 }, { fn: 'x', color: 'warn', dash: true, domain: [0, 2.2], label: 'Newton: v = p/m', labelAt: 1.7, labelDx: 10 }], hlines: [{ y: 1, label: 'v = c', color: 'ink3' }] }, caption: t`Speed against momentum in units with $m = c = 1$. Newton’s $v = p/m$ (dashed) passes $c$; the relativistic curve has $v = c$ as a horizontal asymptote.` },
    steps: [
      { label: 'Spot the form', text: t`Both top and bottom grow like $p$: an $\infty/\infty$ form, undecided as it stands.` },
      { label: 'Divide by the top power', text: t`For $p > 0$, $\sqrt{p^2c^2 + m^2c^4} = p\sqrt{c^2 + m^2c^4/p^2}$. Dividing top and bottom by $p$: $v = \dfrac{c^2}{\sqrt{c^2 + m^2c^4/p^2}}$.` },
      { label: 'Let p grow', text: t`$m^2c^4/p^2 \to 0$, so the denominator tends to $\sqrt{c^2} = c$ and $v \to c^2/c = c$.` },
      { label: 'Read it', text: t`No momentum, however large, gives $v = c$ — the limit is approached, never reached. At low momentum $v \approx p/m$, Newton’s formula.` },
    ],
    answer: t`$\displaystyle\lim_{p\to\infty} v(p) = c$: the speed of light is a horizontal asymptote.`,
  },
  practice: [
    num({
      id: 'rational-equal', difficulty: 1,
      gen(r) {
        const a = r.int(2, 9), c = r.intExcept(2, 9, [a]), b = r.intExcept(-9, 9, [0]), d = r.int(1, 9);
        const A = a / c;
        return {
          prompt: t`Find $\displaystyle\lim_{x\to\infty}\frac{${a}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x}{${c}x^2 + ${d}}$.`,
          answer: A, tol: { rel: 0.002 },
          errors: [{ value: 0, feedback: t`Both top and bottom grow like $x^2$; the ratio does not vanish. Divide each term by $x^2$.` }, { value: a, feedback: t`The bottom also grows like $${c}x^2$: the limit is the ratio of the two leading coefficients.` }],
          hints: [t`Divide top and bottom by $x^2$: $\dfrac{${a} ${b < 0 ? '-' : '+'} ${Math.abs(b)}/x}{${c} + ${d}/x^2}$.`],
          teach: 'When the degrees are equal, the limit at infinity is the ratio of the leading coefficients.',
          explain: t`Every term with $1/x$ or $1/x^2$ vanishes, leaving $${a}/${c} = ${frac(A)}$.`,
          visual: { type: 'graph', params: { x: [0, 40], y: [Math.min(0, A - 1.5), A + 1.5], aspect: 'wide', curves: [{ fn: `(${a}*x^2 + (${b})*x)/(${c}*x^2 + ${d})`, color: 'accent' }] }, caption: 'The rational function for 0 ≤ x ≤ 40; its tail flattens toward the limit.' },
        };
      },
    }),
    mcq({
      id: 'degrees', difficulty: 2,
      prompt: t`What is $\displaystyle\lim_{x\to\infty}\frac{3x^3 - x}{5x^2 + 2}$?`,
      visual: { type: 'graph', params: { x: [0, 12], y: [-1, 8], aspect: 'wide', curves: [{ fn: '(3*x^3 - x)/(5*x^2 + 2)', color: 'accent' }] }, caption: t`The function for $0 \le x \le 12$.` },
      choices: [t`$+\infty$`, t`$\tfrac35$`, t`$0$`, t`$-\infty$`],
      answer: 0,
      why: { 1: t`$\frac35$ would be right if both degrees were 3 (or both 2). The top has degree 3, the bottom degree 2.`, 2: t`$0$ is the answer when the *bottom* has the higher degree.`, 3: t`The leading coefficients $3$ and $5$ are both positive, and $x > 0$: the ratio is positive.` },
      hints: ['Compare the degrees of the top and bottom.', t`Divide by $x^2$: $\dfrac{3x - 1/x}{5 + 2/x^2}$.`],
      teach: 'If the numerator’s degree is higher, the rational function grows without bound (here like 3x/5).',
      explain: t`$\frac{3x - 1/x}{5 + 2/x^2} \approx \frac{3x}{5} \to +\infty$. There is no horizontal asymptote; the graph follows the slant line $y = 0.6x$.`,
    }),
    num({
      id: 'sqrt-diff', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3, 4, 5, 6, 8, 10]);
        return {
          prompt: t`Find $\displaystyle\lim_{x\to\infty}\left(\sqrt{x^2 + ${k}x} - x\right)$.`,
          answer: k / 2, tol: { rel: 0.002 },
          errors: [{ value: 0, feedback: t`$\infty - \infty$ is not $0$: it is undecided. Multiply by the conjugate $\frac{\sqrt{x^2 + ${k}x} + x}{\sqrt{x^2 + ${k}x} + x}$.` }, { value: k, feedback: t`After rationalizing, the denominator is $\sqrt{x^2 + ${k}x} + x \approx 2x$, not $x$.` }],
          hints: [t`Multiply and divide by the conjugate $\sqrt{x^2 + ${k}x} + x$.`, t`The top becomes $${k}x$; then divide top and bottom by $x$: $\dfrac{${k}}{\sqrt{1 + ${k}/x} + 1}$.`],
          teach: 'An ∞ − ∞ form is undecided; rationalizing turns it into a ratio you can evaluate.',
          explain: t`$\dfrac{(x^2 + ${k}x) - x^2}{\sqrt{x^2 + ${k}x} + x} = \dfrac{${k}}{\sqrt{1 + ${k}/x} + 1} \to \dfrac{${k}}{2} = ${nice(k / 2)}$.`,
          visual: { type: 'graph', params: { x: [0, 60], y: [0, k / 2 + 1.5], aspect: 'wide', curves: [{ fn: `sqrt(x^2 + ${k}*x) - x`, color: 'accent' }] }, caption: t`$y = \sqrt{x^2 + ${k}x} - x$ for $0 \le x \le 60$: two huge numbers whose difference stays finite.` },
        };
      },
    }),
    mcq({
      id: 'hierarchy', difficulty: 2,
      prompt: t`What is $\displaystyle\lim_{x\to\infty}\frac{x^{10}}{e^{x}}$?`,
      visual: { type: 'graph', params: { x: [0, 80], y: [-20, 9], aspect: 'wide', ylog: true, xlabel: 'x', ylabel: 'x¹⁰ / eˣ', curves: [{ fn: '10*log10(x) - x*log10(e)', color: 'accent', domain: [0.5, 80] }] }, caption: t`The ratio on a logarithmic vertical axis. It peaks at $x = 10$, near $4.5\times10^{5}$, then falls.` },
      choices: ['0', t`$+\infty$`, '1', 'It does not exist'],
      answer: 0,
      why: { 1: t`The ratio is huge at first — about $4.5\times10^{5}$ at $x = 10$ — but every exponential eventually outgrows every power.`, 2: 'The two functions never settle into a fixed ratio; one wins outright.', 3: 'The ratio settles; it just takes a while to start falling.' },
      hints: [t`Compare logarithms: $\ln(x^{10}) = 10\ln x$ and $\ln(e^x) = x$.`, t`$x - 10\ln x \to \infty$, so the ratio is $e^{-(x - 10\ln x)} \to 0$.`],
      teach: 'Any exponential eˣ eventually outgrows any power xᵖ, however large p is.',
      explain: t`$\frac{x^{10}}{e^x} = e^{10\ln x - x}$, and $10\ln x - x \to -\infty$, so the ratio tends to $0$ — after peaking at $x = 10$.`,
    }),
    num({
      id: 'exp-minus-inf', difficulty: 3,
      gen(r) {
        const a = r.int(2, 6), b = r.int(1, 9), c = r.int(1, 5), d = r.intExcept(1, 9, [b]);
        return {
          prompt: t`Find $\displaystyle\lim_{t\to-\infty}\frac{${a}e^{2t} + ${b}}{${c}e^{2t} - ${d}}$.`,
          answer: -b / d, tol: { rel: 0.002 },
          errors: [{ value: a / c, feedback: t`That is the limit as $t \to +\infty$, where $e^{2t}$ dominates. As $t \to -\infty$, $e^{2t} \to 0$.` }],
          hints: [t`As $t \to -\infty$, what happens to $e^{2t}$?`, t`$e^{2t} \to 0$, so only the constants survive.`],
          teach: t`At $-\infty$ an exponential like $e^{2t}$ vanishes; at $+\infty$ it dominates — the two tails of one function can differ.`,
          explain: t`$e^{2t} \to 0$, so the limit is $\frac{${b}}{-${d}} = ${frac(-b / d)}$. (At $+\infty$ the limit is $${frac(a / c)}$: two different horizontal asymptotes.)`,
          visual: { type: 'graph', params: { x: [0, 4], y: [-1, a / c + 1.5], aspect: 'wide', xlabel: 't', curves: [{ fn: `(${a}*e^(2*x) + ${b})/(${c}*e^(2*x) - ${d})`, color: 'accent', domain: [Math.log(d / c) / 2 + 0.08, 4] }] }, caption: t`The function for $t \ge 0$ only (away from its vertical asymptote at $t = \tfrac12\ln(${d}/${c})$ when that is positive). The left tail is yours to find.` },
        };
      },
    }),
    mcq({
      id: 'neg-inf-root', difficulty: 3,
      prompt: t`Find $\displaystyle\lim_{x\to-\infty}\frac{\sqrt{x^2 + 1}}{x}$.`,
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 3], aspect: 'wide', curves: [{ fn: 'sqrt(x^2 + 1)/x', color: 'accent', domain: [0.35, 10] }] }, caption: t`The function for $x > 0$ only. Its left half is the question.` },
      choices: ['−1', '1', '0', t`$-\infty$`],
      answer: 0,
      why: { 1: t`That is the limit at $+\infty$. For $x < 0$, $\sqrt{x^2} = |x| = -x$, which flips the sign.`, 2: t`Top and bottom both grow like $|x|$; the ratio does not vanish.`, 3: t`Top and bottom grow at the same rate; the ratio stays bounded.` },
      hints: [t`$\sqrt{x^2} = |x|$, not $x$.`, t`For $x < 0$: $\sqrt{x^2 + 1} = |x|\sqrt{1 + 1/x^2} = -x\sqrt{1 + 1/x^2}$.`],
      teach: t`Pulling $x$ out of a square root gives $|x|$; for $x \to -\infty$ that is $-x$.`,
      explain: t`$\dfrac{-x\sqrt{1 + 1/x^2}}{x} = -\sqrt{1 + 1/x^2} \to -1$. The function has two horizontal asymptotes, $y = 1$ on the right and $y = -1$ on the left.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rational', difficulty: 2,
      gen(r) {
        const a = r.int(2, 9), b = r.intExcept(2, 9, [a]), p = r.int(1, 9);
        return {
          prompt: t`Find $\displaystyle\lim_{x\to\infty}\frac{${p} - ${a}x^3}{${b}x^3 + x}$.`,
          answer: -a / b, tol: { rel: 0.002 },
          errors: [{ value: p, feedback: t`The constant $${p}$ is negligible next to $${a}x^3$. Divide everything by $x^3$.` }],
          hints: [t`Divide by $x^3$: $\dfrac{${p}/x^3 - ${a}}{${b} + 1/x^2}$.`],
          teach: 'Equal degrees: the limit is the ratio of leading coefficients, signs included.',
          explain: t`$\to \dfrac{0 - ${a}}{${b} + 0} = ${frac(-a / b)}$.`,
          visual: { type: 'graph', params: { x: [0, 30], y: [-a / b - 1.5, 1.5], aspect: 'wide', curves: [{ fn: `(${p} - ${a}*x^3)/(${b}*x^3 + x)`, color: 'accent', domain: [0.4, 30] }] }, caption: t`The function for $0.4 \le x \le 30$.` },
        };
      },
    }),
    num({
      id: 'cp-rocket-c', difficulty: 3, transfer: true,
      gen(r) {
        const [eps, beta] = r.pick([[t`0.1`, 0.9], [t`0.01`, 0.99], [t`0.001`, 0.999]]);
        const s = beta / Math.sqrt(1 - beta * beta), ans = s * C / G / YR;
        return {
          prompt: t`A starship holds a constant $1g$ ($9.81\ \text{m/s}^2$) as measured on board. In the launch frame its speed is

$$\beta(t) = \frac{v}{c} = \frac{gt/c}{\sqrt{1 + (gt/c)^2}},$$

which tends to $1$ as $t \to \infty$. For the tolerance $\varepsilon = ${eps}$, find the launch-frame time $M$ (in years) after which $1 - \beta < \varepsilon$. Use $c = 2.998\times10^{8}$ m/s and $1\ \text{yr} = 3.156\times10^{7}$ s.`,
          answer: ans, units: 'yr', tol: { rel: 0.005 },
          errors: [{ value: beta * C / G / YR, feedback: t`That is Newton’s $t = v/g$, which ignores relativity. Solve the given $\beta(t)$ for $t$.` }],
          hints: [t`Let $s = gt/c$. Solve $\dfrac{s}{\sqrt{1 + s^2}} = ${nice(beta)}$ for $s$.`, t`Squaring: $s^2 = \dfrac{\beta^2}{1 - \beta^2}$, so $s = ${nice(s, 4)}$. Then $t = sc/g$.`],
          teach: t`For a limit at infinity, the definition asks: given $\varepsilon$, how far out is $M$? Here $M$ is the time to reach $\beta = 1 - \varepsilon$.`,
          explain: t`$s = ${nice(beta)}/\sqrt{1 - ${nice(beta)}^2} = ${nice(s, 4)}$, and $t = sc/g = ${nice(s, 4)}\times\dfrac{2.998\times10^{8}}{9.81}\ \text{s} = ${fmt(ans)}$ yr. Each tenfold tightening of $\varepsilon$ costs about $\sqrt{10} \approx 3.2$ times longer: $c$ is approached, never reached.`,
          visual: { type: 'graph', params: { x: [0, 24], y: [0, 1.15], aspect: 'wide', xlabel: 't (years, launch frame)', ylabel: 'β = v/c', curves: [{ fn: `(x*${G * YR / C})/sqrt(1 + (x*${G * YR / C})^2)`, color: 'accent' }], hlines: [{ y: 1, label: 'c', color: 'ink3' }] }, caption: t`Speed in the launch frame for constant proper acceleration $g$ (“hyperbolic motion”), special relativity exact. No such starship exists: the propellant mass needed is far beyond any known propulsion.` },
        };
      },
    }),
    mcq({
      id: 'cp-growth', difficulty: 2,
      prompt: t`Which ratio tends to $+\infty$ as $x \to \infty$?`,
      choices: [t`$\dfrac{e^{x}}{x^{100}}$`, t`$\dfrac{x^{100}}{e^{x}}$`, t`$\dfrac{(\ln x)^{100}}{x}$`, t`$\dfrac{1000x^2}{x^3}$`],
      answer: 0,
      why: { 1: t`The exponential is in the denominator: this ratio tends to $0$, after an enormous peak near $x = 100$.`, 2: t`Any power of $\ln x$ is eventually beaten by $x$ itself: this tends to $0$.`, 3: t`This is $1000/x \to 0$: the bigger degree is in the denominator.` },
      hints: [t`Use the hierarchy $\ln x \ll x^p \ll e^x$.`],
      teach: 'In a ratio, the faster-growing function decides: exponentials beat powers, and powers beat logarithms.',
      explain: t`$e^x$ outgrows $x^{100}$ (they cross near $x \approx 650$, and the exponential wins from then on), so $e^x/x^{100} \to +\infty$. The others all tend to $0$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 1, §4.6 Limits at infinity and asymptotes', url: 'https://openstax.org/books/calculus-volume-1/pages/4-6-limits-at-infinity-and-asymptotes' },
  ],
});
