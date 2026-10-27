// Taylor and Maclaurin series — the coefficients of a power series are the
// derivatives of its sum, so a function's derivatives at one point decide it.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, frac } from '../../src/core/format.js';
import { ratPoly, fact } from './_powerseries.js';

const t = String.raw;
const ind = (k) => `1 - min(1, abs(s - ${k}))`;   // 1 when the choice s equals k, else 0

export default lesson({
  id: 'math1220.C2-5.4',
  title: 'Taylor and Maclaurin series',
  minutes: 11, difficulty: 2,
  intro: t`If a function has a power series about $a$, the coefficients are not a free choice: differentiate the series $n$ times and set $x = a$, and only one term survives, giving $c_n = f^{(n)}(a)/n!$. So the series must be the **Taylor series** of $f$:

$$f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n = f(a) + f'(a)(x-a) + \frac{f''(a)}{2!}(x-a)^2 + \cdots$$

Centred at $a = 0$ it is called a **Maclaurin series**. Everything about $f$ near $a$ — its value, slope, curvature and every higher derivative — is packed into the coefficients. For $e^x$, $\sin x$ and $\cos x$ the series converges to the function for every $x$.`,
  symbols: [
    { tex: 'f^{(n)}(a)', text: t`the $n$th derivative of $f$ evaluated at $a$; $f^{(0)} = f$ itself` },
    { tex: 'n!', text: t`$n$ factorial, $1\cdot2\cdots n$, with $0! = 1$; it undoes the factors the power rule brings down` },
    { tex: 'a', text: t`the **centre**, the point where the derivatives are taken; $a = 0$ gives a Maclaurin series` },
    { tex: '(x-a)^n', text: 'powers of the distance from the centre' },
  ],
  why: t`Every physics approximation of the form “to first order” is the start of a Taylor series: the tangent line is its first two terms, and the curvature correction is the third.`,
  visual: {
    type: 'graph',
    title: 'Taylor polynomials hug the function near the centre',
    lead: t`The gold curve is the Taylor polynomial of degree $n$, $\sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}(x-a)^k$, for the function in grey. The dashed line marks the centre $a$.`,
    tasks: [
      'With a = 0, raise n for sin x: each new pair of terms wraps the polynomial around one more hump of the sine wave.',
      'Move the centre a: the polynomial always fits best near x = a and worst far from it.',
      'For eˣ set n = 1: that is the tangent line at a — the linearisation from Calculus I is the first Taylor polynomial.',
    ],
    params: {
      x: [-7, 7], y: [-3, 4],
      choices: [{ key: 's', label: 'Function', options: [[1, 'eˣ'], [2, 'sin x'], [3, 'cos x']], value: 2, explain: 'Each of these equals its Taylor series everywhere.' }],
      sliders: [
        { key: 'n', label: 'Degree $n$', min: 0, max: 20, step: 1, value: 3, explain: 'The highest power of $(x - a)$ kept.' },
        { key: 'a', label: 'Centre $a$', min: -3, max: 3, step: 0.25, value: 0, explain: 'Where the derivatives are taken.' },
      ],
      curves: [
        { fn: 'exp(x)', color: 'ink3', width: 1.6, when: ind(1) },
        { sum: 'exp(a) (x - a)^k/k!', k: [0, 'n'], color: 'gold', when: ind(1) },
        { fn: 'sin(x)', color: 'ink3', width: 1.6, when: ind(2) },
        { sum: 'sin(a + k pi/2) (x - a)^k/k!', k: [0, 'n'], color: 'gold', when: ind(2) },
        { fn: 'cos(x)', color: 'ink3', width: 1.6, when: ind(3) },
        { sum: 'cos(a + k pi/2) (x - a)^k/k!', k: [0, 'n'], color: 'gold', when: ind(3) },
      ],
      vlines: [{ x: 'a', label: 'a', color: 'accent2' }],
      points: [
        { x: 'a', y: 'exp(a)', color: 'gold', when: ind(1) },
        { x: 'a', y: 'sin(a)', color: 'gold', when: ind(2) },
        { x: 'a', y: 'cos(a)', color: 'gold', when: ind(3) },
      ],
    },
    caption: t`The $k$th derivative of $\sin x$ is $\sin(x + k\pi/2)$ and of $\cos x$ is $\cos(x + k\pi/2)$, which is how the coefficients are computed here. Curves are exact and clipped at the edges.`,
  },
  example: {
    prompt: t`Find the Taylor series of $f(x) = \ln x$ about $a = 1$.`,
    steps: [
      { label: 'Differentiate and spot the pattern', text: t`$f = \ln x$, $f' = x^{-1}$, $f'' = -x^{-2}$, $f''' = 2x^{-3}$, $f^{(4)} = -6x^{-4}$. Each step multiplies by the power and lowers it, so for $n \ge 1$: $f^{(n)}(x) = (-1)^{n-1}(n-1)!\,x^{-n}$.` },
      { label: 'Evaluate at the centre', text: t`$f(1) = \ln 1 = 0$, and $f^{(n)}(1) = (-1)^{n-1}(n-1)!$ for $n \ge 1$.` },
      { label: 'Divide by n!', text: t`$c_n = \dfrac{f^{(n)}(1)}{n!} = \dfrac{(-1)^{n-1}(n-1)!}{n!} = \dfrac{(-1)^{n-1}}{n}$.` },
      { label: 'Assemble', text: t`$$\ln x = \sum_{n=1}^{\infty} \frac{(-1)^{n-1}}{n}(x-1)^n = (x-1) - \frac{(x-1)^2}{2} + \frac{(x-1)^3}{3} - \cdots$$` },
      { label: 'Check by uniqueness', text: t`Put $u = x - 1$: this is exactly the series $\ln(1 + u) = u - \frac{u^2}{2} + \frac{u^3}{3} - \cdots$ found by integrating a geometric series. A function has only one power series about a given centre, so two honest routes must agree. Its interval is $0 < x \le 2$.` },
    ],
    answer: t`$\ln x = \displaystyle\sum_{n=1}^{\infty} \frac{(-1)^{n-1}}{n}(x-1)^n$, valid for $0 < x \le 2$.`,
  },
  practice: [
    mcq({
      id: 'coefficient-formula', difficulty: 1,
      prompt: t`In the Taylor series of $f$ about $a$, what is the coefficient $c_n$ of $(x - a)^n$?`,
      choices: [t`$\dfrac{f^{(n)}(a)}{n!}$`, t`$f^{(n)}(a)$`, t`$\dfrac{f^{(n)}(0)}{n!}$`, t`$\dfrac{f^{(n)}(a)}{n}$`],
      answer: 0,
      why: {
        1: t`Differentiating $(x-a)^n$ $n$ times gives $n!$, so you must divide it back out.`,
        2: t`That is the Maclaurin coefficient. About a centre $a$, take the derivatives at $a$.`,
        3: t`The power rule brings down $n$, then $n - 1$, … — all the way to $n!$, not just $n$.`,
      },
      hints: [t`Differentiate $c_n(x-a)^n$ $n$ times. What constant appears?`],
      teach: t`Differentiating $(x-a)^n$ $n$ times gives $n!$, so $c_n = f^{(n)}(a)/n!$.`,
      explain: t`The $n$th derivative of the series at $x = a$ is $n!\,c_n$ (all other terms vanish there), so $c_n = f^{(n)}(a)/n!$.`,
    }),
    num({
      id: 'coefficient-from-derivatives', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, -1, 3]), d3 = r.pick([12, -18, 24, 30, -6, 9]);
        const f0 = r.int(-5, 5), d1 = r.intExcept(-4, 4, [0]), d2 = r.intExcept(-8, 8, [0]);
        const xa = a > 0 ? t`x - ${a}` : t`x + ${-a}`;
        return {
          prompt: t`A function has $f(${a}) = ${f0}$, $f'(${a}) = ${d1}$, $f''(${a}) = ${d2}$ and $f'''(${a}) = ${d3}$. What is the coefficient of $(${xa})^3$ in its Taylor series about $${a}$?`,
          answer: d3 / 6, tol: { rel: 1e-4 },
          errors: [{ value: d3, feedback: t`Divide the derivative by $3! = 6$.` }, { value: d3 / 3, feedback: t`Divide by $3! = 3\cdot2\cdot1 = 6$, not by $3$.` }],
          hints: [t`$c_3 = \dfrac{f'''(${a})}{3!}$.`],
          teach: t`The coefficient of $(x-a)^n$ is the $n$th derivative at $a$ divided by $n!$.`,
          explain: t`$c_3 = \dfrac{f'''(${a})}{3!} = \dfrac{${d3}}{6} = ${frac(d3 / 6)}$. The other values set the lower coefficients: $c_0 = ${f0}$, $c_1 = ${d1}$, $c_2 = ${frac(d2 / 2)}$.`,
        };
      },
    }),
    expr({
      id: 'exp-kx', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, -1, -2]);
        const key = ratPoly([1, k, k * k / 2, k ** 3 / 6]);
        return {
          prompt: t`Find the degree-3 Maclaurin polynomial of $e^{${k}x}$.`,
          answer: key.text, answerTeX: key.tex,
          vars: { x: [-1, 1] },
          errors: [{ answer: ratPoly([1, k, k * k, k ** 3]).text, feedback: t`Divide the $n$th derivative by $n!$: the $x^2$ term needs $\tfrac{1}{2!}$ and the $x^3$ term $\tfrac{1}{3!}$.` }],
          hints: [t`Each derivative of $e^{${k}x}$ brings down a factor $${k}$: $f^{(n)}(0) = ${k < 0 ? `(${k})` : k}^n$.`, t`Or substitute $u = ${k}x$ into $e^u = 1 + u + \frac{u^2}{2!} + \frac{u^3}{3!} + \cdots$`],
          teach: t`Substituting into a known series is usually faster than differentiating: $e^{kx} = \sum \frac{(kx)^n}{n!}$.`,
          explain: t`$e^{${k}x} = \sum_{n=0}^{\infty} \frac{(${k}x)^n}{n!}$, so $P_3(x) = ${key.tex}$.`,
        };
      },
    }),
    expr({
      id: 'sqrt-about-square', difficulty: 2,
      gen(r) {
        const m = r.pick([2, 3, 5]), a = m * m;
        const v = `(x - ${a})`;
        const key = ratPoly([m, 1 / (2 * m), -1 / (8 * m ** 3)], v);
        return {
          prompt: t`Find the degree-2 Taylor polynomial of $f(x) = \sqrt{x}$ about $a = ${a}$.`,
          answer: key.text, answerTeX: key.tex,
          vars: { x: [a - 2, a + 2] },
          errors: [{ answer: ratPoly([m, 1 / (2 * m), -1 / (4 * m ** 3)], v).text, feedback: t`The quadratic coefficient is $f''(${a})$ divided by $2! = 2$.` }],
          hints: [t`$f' = \tfrac12 x^{-1/2}$ and $f'' = -\tfrac14 x^{-3/2}$.`, t`At $x = ${a}$: $f = ${m}$, $f' = \tfrac{1}{${2 * m}}$, $f'' = -\tfrac{1}{${4 * m ** 3}}$. Divide $f''$ by $2!$.`],
          teach: t`A Taylor polynomial about $a$ uses powers of $(x - a)$, with $f^{(n)}(a)/n!$ in front.`,
          explain: t`$f(${a}) = ${m}$, $f'(${a}) = \tfrac{1}{${2 * m}}$, $\tfrac{f''(${a})}{2!} = -\tfrac{1}{${8 * m ** 3}}$, so $P_2(x) = ${key.tex}$.`,
          solution: t`Check at $x = ${a + 1}$: $P_2 = ${nice(m + 1 / (2 * m) - 1 / (8 * m ** 3), 6)}$, while $\sqrt{${a + 1}} = ${nice(Math.sqrt(a + 1), 6)}$.`,
          visual: {
            type: 'graph',
            params: { x: [0, 2 * a + 2], y: [0, m + 2.5], curves: [{ fn: 'sqrt(x)', color: 'accent' }, { fn: `${m} + (x - ${a})/${2 * m}`, color: 'gold', dash: true }], points: [{ x: a, y: m, color: 'gold', label: `(${a}, ${m})` }] },
            caption: t`$\sqrt{x}$ with its tangent line at $x = ${a}$ (dashed) — the degree-1 part. The quadratic term adds the curvature.`,
          },
        };
      },
    }),
    mcq({
      id: 'recognise-cos', difficulty: 2,
      prompt: t`Which function has the Maclaurin series $\displaystyle\sum_{n=0}^{\infty} \frac{(-1)^n x^{2n}}{(2n)!} = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots$?`,
      choices: [t`$\cos x$`, t`$\sin x$`, t`$e^{-x^2}$`, t`$\cosh x$`],
      answer: 0,
      why: {
        1: t`$\sin x$ has only odd powers: $x - \frac{x^3}{3!} + \cdots$`,
        2: t`$e^{-x^2} = \sum \frac{(-x^2)^n}{n!} = 1 - x^2 + \frac{x^4}{2} - \cdots$: the denominators are $n!$, not $(2n)!$.`,
        3: t`$\cosh x = 1 + \frac{x^2}{2!} + \frac{x^4}{4!} + \cdots$ has no alternating signs.`,
      },
      hints: ['Even powers only, so an even function. Alternating signs.', t`Which function has $f(0) = 1$, $f''(0) = -1$ and $f^{(4)}(0) = 1$?`],
      teach: t`$\cos x$: even powers, factorials $(2n)!$, alternating signs; $\sin x$: the odd-power version.`,
      explain: t`The derivatives of $\cos x$ at $0$ cycle $1, 0, -1, 0, 1, \ldots$, which gives exactly $\sum (-1)^n \frac{x^{2n}}{(2n)!}$.`,
    }),
    num({
      id: 'limit-by-series', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3]), kind = r.pick(['sin', 'cos']);
        const sin = kind === 'sin';
        const ans = sin ? -(k ** 3) / 6 : (k * k) / 2;
        return {
          prompt: sin
            ? t`Use the Maclaurin series of $\sin$ to find $\displaystyle\lim_{x\to0} \frac{\sin(${k}x) - ${k}x}{x^3}$.`
            : t`Use the Maclaurin series of $\cos$ to find $\displaystyle\lim_{x\to0} \frac{1 - \cos(${k}x)}{x^2}$.`,
          answer: ans, tol: { rel: 1e-4 },
          errors: sin
            ? [{ value: k ** 3 / 6, feedback: t`Check the sign: $\sin u = u - \frac{u^3}{6} + \cdots$, so $\sin u - u$ is negative for small $u > 0$.` }, { value: -k / 6, feedback: t`Cube the whole $${k}x$: $(${k}x)^3 = ${k ** 3}x^3$.` }]
            : [{ value: k / 2, feedback: t`Square the whole $${k}x$: $(${k}x)^2 = ${k * k}x^2$.` }, { value: k * k, feedback: t`$\cos u = 1 - \frac{u^2}{2!} + \cdots$ — keep the $2!$.` }],
          hints: sin
            ? [t`$\sin u = u - \frac{u^3}{3!} + \frac{u^5}{5!} - \cdots$ with $u = ${k}x$.`, t`$\sin(${k}x) - ${k}x = -\frac{${k ** 3}x^3}{6} + (\text{terms in } x^5, x^7, \ldots)$. Divide by $x^3$.`]
            : [t`$\cos u = 1 - \frac{u^2}{2!} + \frac{u^4}{4!} - \cdots$ with $u = ${k}x$.`, t`$1 - \cos(${k}x) = \frac{${k * k}x^2}{2} - (\text{terms in } x^4, \ldots)$. Divide by $x^2$.`],
          teach: 'Replacing a function by its series turns a 0/0 limit into reading off the first surviving coefficient.',
          explain: sin
            ? t`$\frac{\sin(${k}x) - ${k}x}{x^3} = \frac{-\frac{${k ** 3}}{6}x^3 + O(x^5)}{x^3} \to -\frac{${k ** 3}}{6} = ${frac(ans)}$.`
            : t`$\frac{1 - \cos(${k}x)}{x^2} = \frac{\frac{${k * k}}{2}x^2 - O(x^4)}{x^2} \to \frac{${k * k}}{2} = ${frac(ans)}$.`,
        };
      },
    }),
    num({
      id: 'derivative-from-series', difficulty: 3,
      gen(r) {
        const m = r.int(4, 7);
        return {
          prompt: t`Let $f(x) = x^2 e^x$. Without differentiating, use its Maclaurin series to find $f^{(${m})}(0)$.`,
          answer: m * (m - 1), tol: { rel: 1e-6 },
          errors: [{ value: 1 / fact(m - 2), feedback: t`That is the coefficient $c_{${m}}$. The derivative is $f^{(${m})}(0) = ${m}!\,c_{${m}}$.` }],
          hints: [t`$x^2 e^x = x^2 \sum \frac{x^n}{n!} = \sum \frac{x^{n+2}}{n!}$.`, t`The coefficient of $x^{${m}}$ comes from $n = ${m - 2}$: $c_{${m}} = \frac{1}{${m - 2}!}$.`, t`$f^{(${m})}(0) = ${m}!\,c_{${m}}$.`],
          teach: t`Read derivatives off a series backwards: $f^{(n)}(a) = n!\,c_n$.`,
          explain: t`$c_{${m}} = \frac{1}{${m - 2}!}$, so $f^{(${m})}(0) = \frac{${m}!}{${m - 2}!} = ${m}\cdot${m - 1} = ${m * (m - 1)}$ — no product rule needed.`,
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-cos-kx', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3]);
        const key = ratPoly([1, 0, -(k * k) / 2, 0, k ** 4 / 24]);
        return {
          prompt: t`Find the degree-4 Maclaurin polynomial of $\cos(${k}x)$.`,
          answer: key.text, answerTeX: key.tex,
          vars: { x: [-1, 1] },
          errors: [{ answer: ratPoly([1, 0, -(k * k), 0, k ** 4]).text, feedback: 'Keep the factorials: 2! and 4!.' }],
          hints: [t`Substitute $u = ${k}x$ into $\cos u = 1 - \frac{u^2}{2!} + \frac{u^4}{4!} - \cdots$`],
          teach: t`Substitute into the known $\cos u$ series rather than differentiating.`,
          explain: t`$\cos(${k}x) = 1 - \frac{(${k}x)^2}{2} + \frac{(${k}x)^4}{24} - \cdots = ${key.tex} - \cdots$`,
        };
      },
    }),
    num({
      id: 'cp-derivative-from-series', difficulty: 3,
      gen(r) {
        const m = r.int(3, 5);
        return {
          prompt: t`Let $f(x) = x\,e^{2x}$. Use its Maclaurin series to find $f^{(${m})}(0)$.`,
          answer: m * 2 ** (m - 1), tol: { rel: 1e-6 },
          errors: [{ value: 2 ** (m - 1) / fact(m - 1), feedback: t`That is the coefficient $c_{${m}}$; multiply by $${m}!$.` }],
          hints: [t`$x e^{2x} = \sum \frac{2^n x^{n+1}}{n!}$, so the $x^{${m}}$ term comes from $n = ${m - 1}$.`, t`So $c_{${m}} = \frac{2^{${m - 1}}}{${m - 1}!}$, and $f^{(${m})}(0) = ${m}!\,c_{${m}}$.`],
          teach: t`$f^{(n)}(0) = n!\,c_n$.`,
          explain: t`$c_{${m}} = \frac{2^{${m - 1}}}{${m - 1}!}$, so $f^{(${m})}(0) = ${m}!\cdot\frac{2^{${m - 1}}}{${m - 1}!} = ${m}\cdot 2^{${m - 1}} = ${m * 2 ** (m - 1)}$.`,
        };
      },
    }),
    num({
      id: 'cp-liftoff', difficulty: 3, transfer: true,
      gen(r) {
        const a0 = r.pick([3, 4, 5]), j = r.pick([0.05, 0.08, 0.1]), T = r.pick([15, 20, 25]);
        const h = (a0 * T * T) / 2 + (j * T ** 3) / 6;
        return {
          prompt: t`Just after liftoff a launch vehicle’s altitude $h(t)$ has $h(0) = 0$, $h'(0) = 0$, a net upward acceleration $h''(0) = ${a0}\ \text{m/s}^2$, and a **jerk** $h'''(0) = ${j}\ \text{m/s}^3$ (the acceleration grows as propellant burns off and the vehicle gets lighter). Use the degree-3 Taylor polynomial of $h$ about $t = 0$ to estimate the altitude at $t = ${T}$ s.`,
          answer: h, units: 'm', tol: { rel: 0.005 },
          errors: [
            { value: (a0 * T * T) / 2, feedback: t`You stopped at the $t^2$ term; the jerk adds $\frac{h'''(0)}{3!}t^3$.` },
            { value: (a0 * T * T) / 2 + j * T ** 3, feedback: t`The cubic term is divided by $3! = 6$.` },
            { value: a0 * T * T + (j * T ** 3) / 6, feedback: t`The quadratic term is divided by $2! = 2$.` },
          ],
          hints: [t`$P_3(t) = h(0) + h'(0)t + \frac{h''(0)}{2!}t^2 + \frac{h'''(0)}{3!}t^3$.`, t`$P_3(${T}) = \frac{${a0}}{2}(${T})^2 + \frac{${j}}{6}(${T})^3$.`],
          teach: t`The constant-acceleration formula $\tfrac12at^2$ is a degree-2 Taylor polynomial; the jerk is the next term.`,
          explain: t`$h(${T}) \approx \frac{${a0}}{2}\cdot ${T * T} + \frac{${j}}{6}\cdot ${T ** 3} = ${nice((a0 * T * T) / 2)} + ${nice((j * T ** 3) / 6, 3)} \approx ${nice(h, 4)}$ m. The jerk term adds about ${Math.round((100 * (j * T ** 3) / 6) / ((a0 * T * T) / 2))}% to the constant-acceleration answer. It is still an approximation: the jerk itself changes as the burn goes on.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §6.3 Taylor and Maclaurin Series', url: 'https://openstax.org/books/calculus-volume-2/pages/6-3-taylor-and-maclaurin-series' },
  ],
});
