// Building series by differentiating and integrating — new series from the
// geometric series, term by term, without computing a single derivative of f.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, frac, tex as texNum } from '../../src/core/format.js';
import { ratPoly } from './_powerseries.js';

const t = String.raw;
const DEG = 180 / Math.PI;

export default lesson({
  id: 'math1220.C2-5.3',
  title: 'Building series by differentiating and integrating',
  minutes: 10, difficulty: 2,
  intro: t`Inside its interval of convergence, a power series can be **differentiated and integrated term by term**, exactly like a polynomial — and the new series has the **same radius**. If $f(x) = \sum_{n=0}^{\infty} c_n (x-a)^n$ for $|x - a| < R$, then

$$f'(x) = \sum_{n=1}^{\infty} n\,c_n (x-a)^{n-1}$$

$$\int_a^x f(t)\,dt = \sum_{n=0}^{\infty} \frac{c_n}{n+1}(x-a)^{n+1}$$

So one series you know — the geometric series $\frac{1}{1-x} = \sum x^n$ — becomes a factory: differentiate it, integrate it, substitute into it, and out come series for $\frac{1}{(1-x)^2}$, $\ln(1+x)$ and $\arctan x$.`,
  symbols: [
    { tex: 'f(x)', text: 'the function the series converges to, for $|x - a| < R$' },
    { tex: 'c_n', text: 'the coefficients of the original series' },
    { tex: "f'(x)", text: 'the derivative: each term $c_n(x-a)^n$ becomes $n\\,c_n(x-a)^{n-1}$, by the power rule' },
    { tex: '\\int_a^x f(t)\\,dt', text: 'the integral from the centre: each term becomes $\\frac{c_n}{n+1}(x-a)^{n+1}$; starting at $a$ makes the constant zero' },
    { tex: 'R', text: 'the radius of convergence — **unchanged** by differentiating or integrating; only the endpoints can change' },
  ],
  why: t`This is how physicists actually find series: by manipulating a handful of known ones rather than computing derivatives. The series for $\ln(1+x)$ and $\arctan x$ come straight out of the geometric series.`,
  visual: {
    type: 'graph',
    title: 'Integrating a series term by term',
    lead: t`Gold is the partial sum of $\frac{1}{1+x^2} = \sum_{n=0}^{\infty} (-1)^n x^{2n}$ (the geometric series with ratio $-x^2$). Teal is that same partial sum **integrated term by term** from $0$: $\sum_{n=0}^{N} (-1)^n \frac{x^{2n+1}}{2n+1}$, which converges to $\arctan x$. The grey curves are the two limits: the bump $\frac{1}{1+x^2}$ and the S-shaped $\arctan x$.`,
    tasks: [
      'Raise N: inside (−1, 1) both gold and teal lock onto their grey curves.',
      'Look at x = ±1: the gold sums flip between 0 and 1 for ever, while the teal ones settle on ±π/4 — integrating gained the endpoints.',
      'Beyond |x| = 1 both explode: integration does not change the radius.',
    ],
    params: {
      x: [-1.7, 1.7], y: [-1.6, 2.2],
      sliders: [{ key: 'N', label: 'Highest index $N$', min: 0, max: 30, step: 1, value: 3, explain: 'Keeps the terms $n = 0$ to $N$ of each series.' }],
      curves: [
        { fn: '1/(1 + x^2)', color: 'ink3', width: 1.5 },
        { fn: 'atan(x)', color: 'ink3', width: 1.5 },
        { sum: '(-1)^k x^(2k)', k: [0, 'N'], color: 'gold' },
        { sum: '(-1)^k x^(2k+1)/(2k+1)', k: [0, 'N'], color: 'teal' },
      ],
      vlines: [{ x: -1, label: 'x = −1' }, { x: 1, label: 'x = 1' }],
      points: [{ x: 1, y: 'pi/4', color: 'teal', label: 'π/4' }, { x: -1, y: '-pi/4', color: 'teal', label: '−π/4' }],
    },
    caption: t`Partial sums are exact; gold and teal leaving the plot are clipped. At $x = 1$ the teal series is $1 - \tfrac13 + \tfrac15 - \cdots = \tfrac{\pi}{4}$ (the Leibniz series), which converges, but very slowly.`,
  },
  example: {
    prompt: t`Find a power series for $\ln(1 + x)$, and its interval of convergence.`,
    steps: [
      { label: 'Start from a known series', text: t`The geometric series $\frac{1}{1-u} = \sum_{n=0}^\infty u^n$ holds for $|u| < 1$. Put $u = -t$:
$$\frac{1}{1+t} = \sum_{n=0}^{\infty} (-1)^n t^n = 1 - t + t^2 - t^3 + \cdots, \qquad |t| < 1.$$` },
      { label: 'Integrate from the centre', text: t`$\displaystyle\int_0^x \frac{dt}{1+t} = \ln(1+x)$, and term by term $\displaystyle\int_0^x t^n\,dt = \frac{x^{n+1}}{n+1}$. Starting the integral at the centre $0$ means no constant is left over.` },
      { label: 'Read off the series', text: t`$$\ln(1+x) = \sum_{n=0}^{\infty} \frac{(-1)^n x^{n+1}}{n+1} = x - \frac{x^2}{2} + \frac{x^3}{3} - \frac{x^4}{4} + \cdots$$ The radius is still $1$.` },
      { label: 'Endpoints', text: t`At $x = 1$: $1 - \tfrac12 + \tfrac13 - \cdots$ converges (alternating series test) — to $\ln 2$. At $x = -1$: $-\left(1 + \tfrac12 + \tfrac13 + \cdots\right)$, the harmonic series, diverges. The geometric series converged at neither endpoint; integrating gained one.` },
      { label: 'Sense check', text: t`Three terms at $x = 0.1$: $0.1 - 0.005 + 0.000333 = 0.095333$. A calculator gives $\ln 1.1 = 0.095310$. The error, $2.3\times10^{-5}$, is below the first omitted term $0.1^4/4 = 2.5\times10^{-5}$, as the alternating series bound promises.` },
    ],
    answer: t`$\ln(1+x) = \displaystyle\sum_{n=0}^{\infty} \frac{(-1)^n x^{n+1}}{n+1}$ on the interval $(-1, 1]$.`,
  },
  practice: [
    mcq({
      id: 'differentiate-geometric', difficulty: 1,
      prompt: t`Differentiate $\displaystyle\frac{1}{1-x} = \sum_{n=0}^{\infty} x^n$ term by term. What do you get?`,
      choices: [
        t`$\displaystyle\frac{1}{(1-x)^2} = \sum_{n=1}^{\infty} n\,x^{n-1}$`,
        t`$\displaystyle -\ln(1-x) = \sum_{n=0}^{\infty} \frac{x^{n+1}}{n+1}$`,
        t`$\displaystyle\frac{1}{1-x} = \sum_{n=1}^{\infty} n\,x^{n-1}$`,
        t`$\displaystyle\frac{1}{(1-x)^2} = \sum_{n=1}^{\infty} x^{n-1}$`,
      ],
      answer: 0,
      why: {
        1: 'That is what integrating gives, not differentiating.',
        2: t`The left side must be differentiated too: $\frac{d}{dx}\frac{1}{1-x} = \frac{1}{(1-x)^2}$.`,
        3: t`The power rule brings down the exponent: $\frac{d}{dx}x^n = n\,x^{n-1}$, not $x^{n-1}$.`,
      },
      hints: ['Differentiate both sides: the function on the left, each term on the right.', t`$\frac{d}{dx}x^n = n x^{n-1}$; the $n = 0$ term is a constant and disappears.`],
      teach: 'Term-by-term differentiation is the power rule applied to every term, and the function on the left is differentiated too.',
      visual: { type: 'graph', params: { x: [-1, 1], y: [-1, 10], curves: [{ fn: '1/(1 - x)', domain: [-1, 0.95], color: 'ink3', width: 1.6 }, { sum: 'k x^(k-1)', k: [1, 12], color: 'gold' }] }, caption: t`Grey: $\frac{1}{1-x}$. Gold: its series differentiated term by term, up to $n = 12$. Notice how much faster the gold curve climbs.` },
      explain: t`$\frac{d}{dx}(1-x)^{-1} = (1-x)^{-2}$, and $\frac{d}{dx}\sum x^n = \sum_{n\ge1} n x^{n-1} = 1 + 2x + 3x^2 + \cdots$, valid for $|x| < 1$.`,
    }),
    expr({
      id: 'one-over-square', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4, -2, -3]);
        const key = ratPoly([1, 2 * k, 3 * k * k, 4 * k ** 3]);
        const geo = ratPoly([1, k, k * k, k ** 3]);
        const den = k > 0 ? t`1 - ${k}x` : t`1 + ${-k}x`;
        return {
          prompt: t`Using $\frac{1}{1-u} = \sum u^n$, find the first four terms (up to $x^3$) of the Maclaurin series of
$$\frac{1}{(${den})^2}.$$`,
          answer: key.text, answerTeX: key.tex,
          vars: { x: [-0.2, 0.2] },
          errors: [
            { answer: geo.text, feedback: t`That is the series of $\frac{1}{${den}}$ itself. Differentiating it produces the square — and the factors $n + 1$.` },
            { answer: `${k}*(${key.text})`, feedback: t`Watch the chain rule: $\frac{d}{dx}\frac{1}{${den}} = \frac{${k}}{(${den})^2}$, so divide the derivative’s series by $${k}$.` },
          ],
          hints: [t`$\frac{1}{${den}} = \sum_{n=0}^{\infty} (${k}x)^n$.`, t`Differentiate both sides: $\frac{${k}}{(${den})^2} = \sum_{n=1}^\infty n\,${k}^n x^{n-1}$. Divide by $${k}$.`, t`The coefficient of $x^n$ is $(n+1)\,${k < 0 ? `(${k})` : k}^n$.`],
          teach: t`Differentiating $\frac{1}{1-kx}$ gives $\frac{k}{(1-kx)^2}$, so its series is $\sum (n+1)k^n x^n$.`,
          visual: {
            type: 'graph',
            params: { x: [-2 / Math.abs(k), 2 / Math.abs(k)], y: [-0.5, 6], curves: [{ fn: `1/(1 - ${k}*x)^2`, color: 'accent' }], vlines: [{ x: -1 / Math.abs(k), label: t`−1/${Math.abs(k)}` }, { x: 1 / Math.abs(k), label: t`1/${Math.abs(k)}` }] },
            caption: t`The function, with dashed lines at the distance $\tfrac{1}{${Math.abs(k)}}$ from $0$ where its series stops converging.`,
          },
          explain: t`$\frac{1}{(${den})^2} = \sum_{n=0}^{\infty} (n+1)\,${k < 0 ? `(${k})` : k}^n x^n = ${key.tex} + \cdots$, valid for $|x| < \tfrac{1}{${Math.abs(k)}}$.`,
        };
      },
    }),
    num({
      id: 'ln-coefficient', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3]), m = r.int(3, 5);
        const c = (-1) ** (m + 1) * k ** m / m;
        return {
          prompt: t`What is the coefficient of $x^{${m}}$ in the Maclaurin series of $\ln(1 + ${k}x)$? (A fraction is fine.)`,
          answer: c, tol: { rel: 1e-4 },
          errors: [{ value: (-1) ** (m + 1) / m, feedback: t`Substitute the whole $${k}x$ for $x$: the term $\pm\frac{x^{${m}}}{${m}}$ becomes $\pm\frac{(${k}x)^{${m}}}{${m}}$.` }, { value: (-1) ** (m + 1) * k ** m, feedback: t`Integrating $x^{${m - 1}}$ divides by $${m}$: the coefficient is $\pm\frac{${k}^{${m}}}{${m}}$.` }],
          hints: [t`$\ln(1+u) = u - \frac{u^2}{2} + \frac{u^3}{3} - \frac{u^4}{4} + \cdots$, from the worked example.`, t`Put $u = ${k}x$: the $u^{${m}}$ term is $${m % 2 ? '+' : '-'}\frac{(${k}x)^{${m}}}{${m}}$.`],
          teach: t`Substituting $kx$ into a known series multiplies the coefficient of $x^n$ by $k^n$.`,
          visual: { type: 'graph', params: { x: [-1 / k, 1.5 / k], y: [-3, 2], curves: [{ fn: `ln(1 + ${k}*x)`, domain: [-1 / k + 0.005, 1.5 / k], color: 'ink3', width: 1.6 }, { sum: `(-1)^(k+1)*(${k}*x)^k/k`, k: [1, m], color: 'gold' }] }, caption: t`$\ln(1 + ${k}x)$ (grey) and its series up to $x^{${m}}$ (gold): they agree near $0$, inside $|x| < \tfrac1{${k}}$.` },
          explain: t`The $u^{${m}}$ term of $\ln(1+u)$ is $${m % 2 ? '+' : '-'}\frac{u^{${m}}}{${m}}$; with $u = ${k}x$ it is $${m % 2 ? '' : '-'}\frac{${k ** m}}{${m}}x^{${m}}$, so the coefficient is $${frac(c)}$.`,
        };
      },
    }),
    expr({
      id: 'integrate-series', difficulty: 3,
      gen(r) {
        const p = r.int(3, 6);
        return {
          prompt: t`Find the first three nonzero terms of the Maclaurin series of $\displaystyle F(x) = \int_0^x \frac{dt}{1 + t^{${p}}}$.`,
          answer: `x - x^${p + 1}/${p + 1} + x^${2 * p + 1}/${2 * p + 1}`,
          answerTeX: t`x - \frac{x^{${p + 1}}}{${p + 1}} + \frac{x^{${2 * p + 1}}}{${2 * p + 1}}`,
          vars: { x: [-0.6, 0.6] },
          errors: [
            { answer: `1 - x^${p} + x^${2 * p}`, feedback: t`That is the integrand’s series. Now integrate each term from $0$ to $x$.` },
            { answer: `x - x^${p + 1} + x^${2 * p + 1}`, feedback: t`Integrating $t^{m}$ gives $\frac{x^{m+1}}{m+1}$ — divide by the new power.` },
            { answer: `x + x^${p + 1}/${p + 1} + x^${2 * p + 1}/${2 * p + 1}`, feedback: t`The geometric series with ratio $-t^{${p}}$ alternates in sign.` },
          ],
          hints: [t`Write $\frac{1}{1 + t^{${p}}}$ as a geometric series with ratio $u = -t^{${p}}$.`, t`$\frac{1}{1+t^{${p}}} = 1 - t^{${p}} + t^{${2 * p}} - \cdots$`, t`Integrate each term from $0$ to $x$: $\int_0^x t^m\,dt = \frac{x^{m+1}}{m+1}$.`],
          teach: 'For an integral with no elementary antiderivative, expand the integrand in a series and integrate term by term.',
          visual: {
            type: 'graph',
            params: { x: [-1.3, 1.3], y: [-0.2, 1.3], curves: [{ fn: `1/(1 + x^${p})`, color: 'accent' }], shade: [{ fn: `1/(1 + x^${p})`, from: 0, to: 0.8, color: 'accent', alpha: 0.25 }] },
            caption: t`The integrand $\frac{1}{1+t^{${p}}}$. The shaded area is $F(0.8)$.`,
          },
          explain: t`$\frac{1}{1+t^{${p}}} = \sum_{n=0}^\infty (-1)^n t^{${p}n}$ for $|t| < 1$, so $F(x) = \sum_{n=0}^\infty \frac{(-1)^n x^{${p}n+1}}{${p}n+1} = x - \frac{x^{${p + 1}}}{${p + 1}} + \frac{x^{${2 * p + 1}}}{${2 * p + 1}} - \cdots$`,
        };
      },
    }),
    mcq({
      id: 'radius-after-differentiating', difficulty: 2,
      prompt: t`A power series has radius of convergence $R$. What happens when you differentiate it term by term?`,
      choices: [
        t`The radius stays $R$; convergence at an endpoint can be lost`,
        t`The radius stays $R$, and each endpoint behaves exactly as before`,
        t`The radius shrinks, because each coefficient is multiplied by $n$`,
        t`The radius becomes $R - 1$, because every power drops by one`,
      ],
      answer: 0,
      why: {
        1: t`Not always: $\sum \frac{x^n}{n^2}$ converges at $x = 1$, but its derivative $\sum \frac{x^{n-1}}{n}$ is the harmonic series there.`,
        2: t`A factor of $n$ cannot beat a geometric factor: $\sqrt[n]{n} \to 1$, so the radius is unchanged.`,
        3: 'Shifting every power by one does not change where the terms shrink geometrically.',
      },
      hints: [t`Compare the ratio-test limits of $\sum c_n x^n$ and $\sum n c_n x^{n-1}$.`, t`Try $\sum \frac{x^n}{n^2}$, which converges on $[-1, 1]$.`],
      teach: 'Differentiating or integrating keeps the radius; only endpoint behaviour can change (differentiating can lose an endpoint, integrating can gain one).',
      visual: { type: 'graph', params: { x: [-1.3, 1.3], y: [-2, 5], curves: [{ sum: 'x^k/k^2', k: [1, 40], color: 'gold' }, { sum: 'x^(k-1)/k', k: [1, 40], color: 'teal' }], vlines: [{ x: -1, label: 'x = −1' }, { x: 1, label: 'x = 1' }] }, caption: t`40-term partial sums of $\sum \frac{x^n}{n^2}$ (gold) and of its derivative $\sum \frac{x^{n-1}}{n}$ (teal). Both blow up past $|x| = 1$; at $x = 1$ only the teal one is still climbing.` },
      explain: t`The ratio test gives the same limit for both series, because $\frac{n+1}{n} \to 1$. But endpoints can change: $\sum \frac{x^n}{n^2}$ converges on $[-1, 1]$, while its derivative $\sum \frac{x^{n-1}}{n}$ converges only on $[-1, 1)$.`,
    }),
    num({
      id: 'sum-n-over-b', difficulty: 3,
      gen(r) {
        const b = r.int(3, 6);   // b = 2 would make b/(b−1)² equal the geometric slip b/(b−1)
        const S = b / (b - 1) ** 2;
        return {
          prompt: t`Find the exact sum of $\displaystyle\sum_{n=1}^{\infty} \frac{n}{${b}^n}$. (A fraction is fine.)`,
          answer: S, tol: { rel: 1e-4 },
          errors: [{ value: (b / (b - 1)) ** 2, feedback: t`You found $\sum n x^{n-1}$ at $x = \tfrac1{${b}}$. The series has $x^n$, so multiply by $x = \tfrac1{${b}}$.` }, { value: b / (b - 1), feedback: t`That is $\sum_{n\ge0} (\tfrac1{${b}})^n$, the geometric series without the factor $n$.` }],
          hints: [t`Start from $\sum_{n=0}^\infty x^n = \frac{1}{1-x}$ and differentiate.`, t`$\sum_{n=1}^\infty n x^{n-1} = \frac{1}{(1-x)^2}$. Multiply by $x$ to get $\sum n x^n$.`, t`$\sum_{n=1}^\infty n x^n = \frac{x}{(1-x)^2}$; evaluate at $x = \tfrac{1}{${b}}$.`],
          teach: t`A factor $n$ in front of $x^n$ signals a derivative: $\sum n x^n = x\frac{d}{dx}\frac{1}{1-x} = \frac{x}{(1-x)^2}$.`,
          visual: { type: 'graph', params: { x: [0, 0.8], y: [0, 3.5], curves: [{ fn: 'x/(1 - x)^2', color: 'accent' }], vlines: [{ x: 1 / b, label: t`x = 1/${b}` }] }, caption: t`$y = \frac{x}{(1-x)^2} = \sum n x^n$. Your series is this function at $x = \tfrac1{${b}}$.` },
          explain: t`$\sum_{n=1}^\infty n x^n = \frac{x}{(1-x)^2}$ for $|x|<1$. At $x = \tfrac1{${b}}$: $\frac{1/${b}}{(1 - 1/${b})^2} = \frac{${b}}{${(b - 1) ** 2}}$.`,
        };
      },
    }),
    num({
      id: 'leibniz-terms', difficulty: 3,
      gen(r) {
        const d = r.int(2, 4), tol = 10 ** -d, N = 10 ** d / 2;
        return {
          prompt: t`Integrating $\frac{1}{1+t^2}$ term by term gives $\arctan x = x - \frac{x^3}{3} + \frac{x^5}{5} - \cdots$, and at the endpoint $x = 1$:
$$\frac{\pi}{4} = 1 - \frac13 + \frac15 - \frac17 + \cdots$$
Using the alternating series error bound, how many terms must you add to be sure the error is less than $${nice(tol)}$?`,
          answer: N, tol: { rel: 1e-6, abs: 0.5 },
          errors: [{ value: 10 ** d, feedback: t`The terms are $\frac{1}{2n+1}$, not $\frac1n$: with $N$ terms the first omitted one is $\frac{1}{2N+1}$.` }],
          hints: [t`For an alternating series with decreasing terms, the error after $N$ terms is less than the first omitted term.`, t`With $N$ terms ($n = 0, \ldots, N-1$), the first omitted term is $\frac{1}{2N+1}$.`, t`Solve $\frac{1}{2N+1} < ${nice(tol)}$, i.e. $2N + 1 > ${10 ** d}$.`],
          teach: 'An endpoint series can converge very slowly; the alternating series bound tells you how slowly.',
          explain: t`The error after $N$ terms is below $\frac{1}{2N+1}$. We need $2N + 1 > ${10 ** d}$, so $N > ${nice((10 ** d - 1) / 2)}$: $N = ${N}$ terms. Converging at an endpoint is no guarantee of converging fast.`,
          visual: {
            type: 'graph',
            params: { x: [-0.1, 1.15], y: [-0.05, 1.05], curves: [{ fn: 'atan(x)', color: 'ink3', width: 1.5 }, { sum: '(-1)^k x^(2k+1)/(2k+1)', k: [0, 6], color: 'teal' }], points: [{ x: 1, y: 'pi/4', color: 'teal', label: 'π/4' }] },
            caption: t`The partial sum with 7 terms against $\arctan x$: excellent near $0$, still visibly off at the endpoint $x = 1$.`,
          },
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-one-over-square', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 5]);
        const key = ratPoly([1, -2 * k, 3 * k * k, -4 * k ** 3]);
        return {
          prompt: t`Find the first four terms (up to $x^3$) of the Maclaurin series of
$$\frac{1}{(1 + ${k}x)^2}.$$`,
          answer: key.text, answerTeX: key.tex,
          vars: { x: [-0.15, 0.15] },
          errors: [{ answer: ratPoly([1, -k, k * k, -(k ** 3)]).text, feedback: t`That is the series of $\frac{1}{1 + ${k}x}$; differentiating it brings in the factors $n + 1$.` }],
          hints: [t`Differentiate $\frac{1}{1+${k}x} = \sum (-${k}x)^n$.`],
          teach: t`$\frac{1}{(1+kx)^2} = -\frac1k\frac{d}{dx}\frac{1}{1+kx} = \sum (n+1)(-k)^n x^n$.`,
          visual: { type: 'graph', params: { x: [-2 / k, 2 / k], y: [-0.5, 6], curves: [{ fn: `1/(1 + ${k}*x)^2`, color: 'accent' }], vlines: [{ x: -1 / k, label: t`−1/${k}` }, { x: 1 / k, label: t`1/${k}` }] }, caption: t`The function, with dashed lines where its series stops converging, $|x| = \tfrac1{${k}}$.` },
          explain: t`$\frac{1}{(1+${k}x)^2} = \sum_{n=0}^\infty (n+1)(-${k})^n x^n = ${key.tex} + \cdots$`,
        };
      },
    }),
    num({
      id: 'cp-sum-ln', difficulty: 3,
      gen(r) {
        const b = r.int(2, 5);
        const S = Math.log(b / (b - 1));
        return {
          prompt: t`Find the sum of $\displaystyle\sum_{n=1}^{\infty} \frac{1}{n\,${b}^n}$ to 4 significant figures.`,
          answer: S, tol: { rel: 5e-4 },
          errors: [{ value: Math.log(1 + 1 / b), feedback: t`The terms are all positive, so this is $-\ln(1 - x)$, not $\ln(1 + x)$.` }],
          hints: [t`Integrate $\sum_{n=0}^\infty x^n = \frac{1}{1-x}$ from $0$ to $x$.`, t`$\sum_{n=1}^\infty \frac{x^n}{n} = -\ln(1-x)$; evaluate at $x = \tfrac1{${b}}$.`],
          teach: t`A factor $\frac1n$ signals an integral: $\sum \frac{x^n}{n} = -\ln(1-x)$.`,
          visual: { type: 'graph', params: { x: [-0.2, 0.8], y: [-0.3, 1.8], curves: [{ fn: '-ln(1 - x)', color: 'accent' }], vlines: [{ x: 1 / b, label: t`x = 1/${b}` }] }, caption: t`$y = -\ln(1 - x) = \sum \frac{x^n}{n}$. Your series is its value at $x = \tfrac1{${b}}$.` },
          explain: t`$\sum_{n=1}^\infty \frac{x^n}{n} = -\ln(1-x)$ for $|x| < 1$. At $x = \tfrac1{${b}}$: $-\ln\left(1 - \tfrac1{${b}}\right) = \ln\tfrac{${b}}{${b - 1}} \approx ${nice(S, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-tracking', difficulty: 3, transfer: true,
      gen(r) {
        const u = r.pick([0.1, 0.15, 0.2]);
        const corr = (u ** 3 / 3) * DEG;
        return {
          prompt: t`A ground station tracks a rocket at altitude $h$ and horizontal distance $d$; its elevation angle is $\theta = \arctan(h/d)$. A quick estimate uses only the first term of the series, $\theta \approx h/d$ radians. When $h/d = ${u}$, use the next term of the arctan series to estimate by how many **degrees** the quick estimate overshoots.`,
          answer: corr, units: '°', tol: { rel: 0.03 },
          errors: [{ value: u ** 3 * DEG, feedback: t`The second term of the series is $-\frac{x^3}{3}$: remember the $3$.` }],
          hints: [t`$\arctan x = x - \frac{x^3}{3} + \cdots$, so the quick estimate $x$ overshoots by about $\frac{x^3}{3}$ radians.`, t`Compute $\frac{${u}^3}{3}$ radians and convert: multiply by $\frac{180}{\pi}$.`],
          teach: 'The error of a truncated series is, to a first estimate, the first term you left out.',
          visual: { type: 'graph', params: { x: [0, 0.3], y: [0, 0.3], xlabel: 'h/d', ylabel: 'θ (rad)', curves: [{ fn: 'x', color: 'gold' }, { fn: 'atan(x)', color: 'ink3' }], vlines: [{ x: u, label: t`h/d = ${u}` }] }, caption: t`Gold: the quick estimate $\theta \approx h/d$. Grey: the true $\arctan(h/d)$. The small gap between them at your $h/d$ is the overshoot.` },
          explain: t`The overshoot is about $\frac{(${u})^3}{3} = ${texNum(u ** 3 / 3, 3)}$ rad $= ${nice(corr, 3)}^\circ$. (The exact overshoot, $${u} - \arctan ${u}$ rad, is $${nice((u - Math.atan(u)) * DEG, 3)}^\circ$ — the next term of the series accounts for the difference.)`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §6.2 Properties of Power Series', url: 'https://openstax.org/books/calculus-volume-2/pages/6-2-properties-of-power-series' },
  ],
});
