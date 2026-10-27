// Improper integrals with unbounded integrands, and the comparison test.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt, nice, frac } from '../../src/core/format.js';

const t = String.raw;

export default lesson({
  id: 'math1220.C2-2.12',
  title: 'Improper integrals: unbounded integrands and comparison',
  minutes: 12, difficulty: 3,
  intro: t`The integrand can blow up instead of the interval. If $f$ is unbounded near the endpoint $x = a$, the integral is again a limit:

$$\int_a^b f(x)\,dx = \lim_{t\to a^+}\int_t^b f(x)\,dx$$

The benchmark flips: $\int_0^1 x^{-p}\,dx$ converges, to $\frac{1}{1 - p}$, when $p < 1$, and diverges when $p \ge 1$. A blow-up **inside** the interval must be split off there — integrating straight across it gives nonsense. And when no antiderivative is in reach, **compare**: if $0 \le f \le g$, then a convergent $\int g$ forces $\int f$ to converge, and a divergent $\int f$ forces $\int g$ to diverge.`,
  symbols: [
    { tex: 'a', text: 'the endpoint where f blows up — a vertical asymptote' },
    { tex: 't', text: 'a point inside the interval that slides towards a' },
    { tex: t`t \to a^+`, text: t`$t$ approaches $a$ from the right (from inside $[a, b]$)` },
    { tex: 'p', text: t`the power in $x^{-p}$; near $0$ the integral converges when $p < 1$ — the opposite of the rule at infinity` },
    { tex: t`0 \le f \le g`, text: 'the comparison condition: the smaller function’s area is at most the larger one’s' },
  ],
  why: t`Comparison answers “does it converge?” — often the only question that matters — without ever finding an antiderivative.`,
  visual: {
    type: 'graph',
    title: 'A spike with finite area',
    lead: t`The blue curve $1/x^p$ shoots up at $x = 0$. The shaded area runs from $t$ to $1$; slide $t$ towards $0$ (the slider is logarithmic) and watch whether the area settles. The dashed curve is the knife-edge $1/x$, whose area from $t$ to $1$ is $-\ln t$.`,
    tasks: [
      'Choose p = 0.5 and slide t to its smallest value: the area settles at 2, although the curve is infinite at 0.',
      'Choose p = 1.5: the area grows without bound — the spike is too fat.',
      'Compare with infinite limits: near 0, p < 1 converges; out at infinity, p > 1 converges. Only p = 1 diverges both ways.',
    ],
    params: {
      x: [0, 1.25], y: [0, 6],
      choices: [{ key: 'p', label: 'Power $p$', options: [[0.3, '0.3'], [0.5, '0.5'], [0.8, '0.8'], [1.2, '1.2'], [1.5, '1.5']], value: 0.5 }],
      sliders: [{ key: 't', label: 'Lower limit $t$', min: 0.0001, max: 0.9, value: 0.1, logScale: true, explain: t`The integral runs from $t$ to $1$; the slider reaches $t = 0.0001$.` }],
      curves: [
        { fn: '1/x', color: 'ink3', dash: true, width: 1.4, domain: [0.05, 1.25] },
        { fn: 'x^(-p)', color: 'accent', domain: [0.001, 1.25], label: '1/xᵖ', labelAt: 0.6 },
      ],
      shade: [{ fn: 'min(x^(-p), 50)', from: 't', to: 1, color: 'accent', alpha: 0.28 }],
      vlines: [{ x: 't' }],
      readouts: [
        { label: t`area $\int_t^1 x^{-p}dx$`, expr: '(1 - t^(1-p))/(1-p)' },
        { label: 'limit as t → 0 (— means it diverges)', expr: '1/(1-p) + 0*sqrt(1-p)' },
        { label: t`area under $1/x$: $-\ln t$`, expr: '-ln(t)' },
      ],
    },
    caption: 'Exact formulas. The curve is cut off above the view; the shading is clipped at height 50, far above the frame. “—” means the limit does not exist.',
  },
  example: {
    title: 'A quarter period from an infinite integrand',
    prompt: t`A mass on a spring oscillates with amplitude $A$ and angular frequency $\omega$, so its speed at position $x$ is $v = \omega\sqrt{A^2 - x^2}$. How long does it take to travel from the centre, $x = 0$, to the turning point, $x = A$?`,
    visual: {
      type: 'graph',
      params: { x: [-0.1, 1.2], y: [0, 6], xlabel: 'x / A', ylabel: 'ω dt/dx', curves: [{ fn: '1/sqrt(1 - x^2)', color: 'accent', domain: [0, 0.99999] }], shade: [{ fn: 'min(1/sqrt(1 - x^2), 50)', from: 0, to: 0.99999 }], vlines: [{ x: 1, label: 'turning point' }] },
      caption: t`The time per unit distance, $1/v$, in units with $A = \omega = 1$. It is infinite at the turning point, where the mass stops — yet the shaded area is finite: $\pi/2$.`,
    },
    steps: [
      { label: 'Set up', text: t`Time is distance over speed, piece by piece: $\displaystyle T_1 = \int_0^A \frac{dx}{v} = \int_0^A \frac{dx}{\omega\sqrt{A^2 - x^2}}.$` },
      { label: 'Spot the problem', text: t`At $x = A$ the speed is zero, so the integrand is infinite. The integral is improper: $T_1 = \displaystyle\lim_{s\to A^-}\frac1\omega\int_0^{s}\frac{dx}{\sqrt{A^2 - x^2}}$.` },
      { label: 'Integrate', text: t`With $x = A\sin\theta$ (trig substitution): $\displaystyle\int_0^{s}\frac{dx}{\sqrt{A^2 - x^2}} = \arcsin\frac{s}{A}$.` },
      { label: 'Take the limit', text: t`As $s \to A^-$, $\arcsin(s/A) \to \arcsin 1 = \frac{\pi}{2}$. So $T_1 = \dfrac{\pi}{2\omega}$ — finite.` },
      { label: 'Sense check', text: t`$\dfrac{\pi}{2\omega}$ is a quarter of the period $\dfrac{2\pi}{\omega}$, as it must be. Near $x = A$ the integrand grows like $(A - x)^{-1/2}$: the power $\tfrac12 < 1$ is why the area is finite.` },
    ],
    answer: t`$T_1 = \dfrac{\pi}{2\omega}$, a quarter period — an improper integral that converges.`,
  },
  practice: [
    multi({
      id: 'which-improper', difficulty: 1,
      prompt: 'Select every integral that is improper.',
      choices: [t`$\displaystyle\int_0^1 \ln x\,dx$`, t`$\displaystyle\int_0^2 \frac{dx}{(x - 1)^2}$`, t`$\displaystyle\int_0^{\pi/2} \sec^2 x\,dx$`, t`$\displaystyle\int_0^{\pi/4} \tan x\,dx$`, t`$\displaystyle\int_1^3 \frac{dx}{x}$`],
      answer: [0, 1, 2],
      why: { 3: t`$\tan x$ is finite on $[0, \tfrac{\pi}{4}]$; it only blows up at $\tfrac{\pi}{2}$.`, 4: t`$\tfrac1x$ is finite on $[1, 3]$; its blow-up at 0 is outside the interval.` },
      hints: ['Look for a point in the closed interval where the integrand is infinite.', t`Check the endpoints, and any point inside where a denominator is zero: $\ln 0$, $x = 1$, $\cos\tfrac{\pi}{2} = 0$.`],
      teach: 'An integral is improper if the interval is infinite or the integrand is unbounded somewhere in it — at an endpoint or inside.',
      explain: t`$\ln x \to -\infty$ at 0; $(x - 1)^{-2}$ is infinite at $x = 1$, inside $[0, 2]$; $\sec^2 x \to \infty$ at $\tfrac{\pi}{2}$. The other two integrands are bounded on their intervals.`,
    }),
    num({
      id: 'p-near-zero', difficulty: 2,
      gen(r) {
        const [p, pTeX, b, val] = r.pick([[0.5, t`\tfrac12`, 4, 4], [1 / 3, t`\tfrac13`, 8, 6], [2 / 3, t`\tfrac23`, 8, 6], [0.5, t`\tfrac12`, 9, 6], [1 / 3, t`\tfrac13`, 27, 13.5]]);
        const root = p === 0.5 ? t`\sqrt{x}` : p === 1 / 3 ? t`\sqrt[3]{x}` : t`x^{2/3}`;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{${b}} \frac{dx}{${root}}$.`,
          answer: val, tol: { rel: 0.005 },
          integrand: `x^(-${p})`, limits: [0, b],
          errors: [{ value: val * (1 - p), feedback: t`Divide by the new power: $x^{-${pTeX}}$ integrates to $\dfrac{x^{1 - ${pTeX}}}{1 - ${pTeX}}$.` }],
          hints: [t`Write it as $\lim_{t\to0^+}\int_t^{${b}} x^{-${pTeX}}\,dx$.`, t`$\Big[\dfrac{x^{1-${pTeX}}}{1 - ${pTeX}}\Big]_t^{${b}}$, and $t^{1 - ${pTeX}} \to 0$ as $t \to 0^+$.`],
          teach: t`Near 0, $\int_0^b x^{-p}\,dx = \frac{b^{1-p}}{1 - p}$ converges whenever $p < 1$.`,
          explain: t`$\dfrac{${b}^{1 - ${pTeX}}}{1 - ${pTeX}} - \lim_{t\to0^+}\dfrac{t^{1-${pTeX}}}{1 - ${pTeX}} = ${nice(val)} - 0 = ${nice(val)}$.`,
          visual: { type: 'graph', params: { x: [0, b * 1.1], y: [0, Math.min(6, 4 * b ** -p)], curves: [{ fn: `x^(-${p})`, color: 'accent', domain: [b * 1e-4, b * 1.1] }], shade: [{ fn: `min(x^(-${p}), 100)`, from: b * 1e-6, to: b }] }, caption: 'The spike at x = 0 is infinitely tall, but it is thin enough that the area is finite.' },
        };
      },
    }),
    num({
      id: 'x-ln-x', difficulty: 3,
      gen(r) {
        const n = r.int(0, 2), val = -1 / (n + 1) ** 2;
        const f = n === 0 ? t`\ln x` : n === 1 ? t`x\ln x` : t`x^2\ln x`;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^1 ${f}\,dx$.`,
          answer: val, tol: { rel: 0.005 },
          integrand: `x^${n}*ln(x)`, limits: [0, 1],
          errors: [{ value: -val, feedback: t`Check the sign: $\ln x < 0$ on $(0, 1)$, so the integral is negative.` }],
          hints: [
            t`Parts with $u = \ln x$, $dv = ${n === 0 ? 'dx' : n === 1 ? t`x\,dx` : t`x^2\,dx`}$: an antiderivative is $\dfrac{x^{${n + 1}}\ln x}{${n + 1}} - \dfrac{x^{${n + 1}}}{${(n + 1) ** 2}}$.`,
            t`Evaluate on $[t, 1]$ and let $t \to 0^+$: $t^{${n + 1}}\ln t \to 0$, because the power beats the logarithm (L’Hôpital).`,
          ],
          teach: 'Integrate by parts on [t, 1], then take the limit; any positive power of t beats ln t.',
          explain: t`$\Big[\dfrac{x^{${n + 1}}\ln x}{${n + 1}} - \dfrac{x^{${n + 1}}}{${(n + 1) ** 2}}\Big]_t^1 \to \Big(0 - \dfrac{1}{${(n + 1) ** 2}}\Big) - 0 = ${frac(val)}$.`,
        };
      },
    }),
    mcq({
      id: 'interior', difficulty: 3, kind: 'error',
      prompt: t`A student computes $\displaystyle\int_{-1}^{1}\frac{dx}{x^2} = \Big[-\frac1x\Big]_{-1}^{1} = -1 - 1 = -2$. What is wrong?`,
      choices: [
        t`$1/x^2$ is infinite at $x = 0$, inside the interval: split there. Each half diverges, so the integral diverges`,
        t`A sign slip: the answer is $+2$`,
        t`The antiderivative of $1/x^2$ is $1/x$, not $-1/x$`,
        'Nothing; the integral is −2',
      ],
      answer: 0,
      why: {
        1: t`Even $+2$ is wrong: $\int_0^1 \frac{dx}{x^2} = \lim_{t\to0^+}\big(\tfrac1t - 1\big) = \infty$.`,
        2: t`$\frac{d}{dx}\big(-\tfrac1x\big) = \tfrac{1}{x^2}$: the antiderivative is right; the trouble is using it across $x = 0$.`,
        3: t`A positive integrand cannot have a negative integral — a sure sign that something is wrong.`,
      },
      hints: ['Is the integrand finite everywhere on [−1, 1]?', t`Split at 0: $\int_{-1}^{0} + \int_0^1$, each with a limit.`],
      teach: 'The Fundamental Theorem needs a continuous integrand on the whole interval; a blow-up inside must be split off first.',
      explain: t`$\int_0^1 \frac{dx}{x^2} = \lim_{t\to0^+}\big(\tfrac1t - 1\big) = \infty$ ($p = 2 \ge 1$), so the integral diverges. Applying $[-1/x]$ straight across the asymptote produced the impossible $-2$.`,
    }),
    num({
      id: 'root-endpoint', difficulty: 2,
      gen(r) {
        const kind = r.pick(['sqrt', 'cbrt']), b = kind === 'sqrt' ? r.pick([1, 4, 9]) : r.pick([1, 8, 27]);
        const val = kind === 'sqrt' ? 2 * Math.sqrt(b) : 1.5 * Math.cbrt(b) ** 2;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{${b}} \frac{dx}{${kind === 'sqrt' ? t`\sqrt{${b} - x}` : t`\sqrt[3]{${b} - x}`}}$.`,
          answer: val, tol: { rel: 0.005 },
          integrand: kind === 'sqrt' ? `1/sqrt(${b} - x)` : `1/cbrt(${b} - x)`, limits: [0, b],
          hints: [t`The integrand blows up at the upper end, $x = ${b}$: use $\lim_{s\to${b}^-}\int_0^{s}$.`, t`Substitute $u = ${b} - x$: the integral becomes $\int_0^{${b}} u^{-${kind === 'sqrt' ? t`1/2` : t`1/3`}}\,du$.`],
          teach: 'A blow-up at the upper limit works the same way: integrate to s, then let s approach the endpoint from below.',
          explain: kind === 'sqrt'
            ? t`$\Big[-2\sqrt{${b} - x}\Big]_0^{s} = 2\sqrt{${b}} - 2\sqrt{${b} - s} \to 2\sqrt{${b}} = ${nice(val)}$.`
            : t`$\Big[-\tfrac32(${b} - x)^{2/3}\Big]_0^{s} = \tfrac32\cdot ${b}^{2/3} - \tfrac32(${b} - s)^{2/3} \to ${nice(val)}$.`,
        };
      },
    }),
    mcq({
      id: 'compare-sin', difficulty: 2,
      prompt: t`Why does $\displaystyle\int_1^\infty \frac{\sin^2 x}{x^2}\,dx$ converge?`,
      choices: [
        t`$0 \le \dfrac{\sin^2 x}{x^2} \le \dfrac{1}{x^2}$, and $\displaystyle\int_1^\infty \frac{dx}{x^2}$ converges`,
        t`$\dfrac{\sin^2 x}{x^2} \le 1$, and the integrand is bounded`,
        t`$\dfrac{\sin^2 x}{x^2} \to 0$ as $x \to \infty$`,
        t`It does not: $\sin^2 x$ keeps returning to 1`,
      ],
      answer: 0,
      why: {
        1: t`Being bounded by 1 compares it with $\int_1^\infty 1\,dx = \infty$, which proves nothing.`,
        2: t`Tending to 0 is not enough: $\tfrac1x \to 0$ too, and $\int_1^\infty \frac{dx}{x}$ diverges.`,
        3: t`$\sin^2 x$ does return to 1, but it is divided by $x^2$, which keeps the integrand below $1/x^2$.`,
      },
      hints: ['Find a simpler function that is always at least as big and whose integral you know.', t`$0 \le \sin^2 x \le 1$.`],
      teach: 'To prove convergence, squeeze the integrand under a bigger function whose integral converges.',
      explain: t`Since $0 \le \sin^2 x \le 1$, $\;0 \le \frac{\sin^2 x}{x^2} \le \frac{1}{x^2}$, and $\int_1^\infty \frac{dx}{x^2} = 1$. By comparison the integral converges (to a value below 1).`,
      visual: {
        type: 'graph',
        params: { x: [1, 10], y: [0, 1.05], curves: [{ fn: '1/x^2', color: 'warn', dash: true, label: '1/x²', labelAt: 1.6 }, { fn: 'sin(x)^2/x^2', color: 'accent' }], shade: [{ fn: 'sin(x)^2/x^2', from: 1, to: 10 }] },
        caption: t`The blue integrand never rises above the dashed $1/x^2$, whose total area from 1 to infinity is 1.`,
      },
    }),
    mcq({
      id: 'compare-logic', difficulty: 3,
      prompt: t`On $[1, \infty)$, $0 \le f(x) \le g(x)$, and $\int_1^\infty f\,dx$ converges. What can you conclude about $\int_1^\infty g\,dx$?`,
      choices: ['Nothing: it may converge or diverge', 'It converges', 'It diverges', t`It equals $\int_1^\infty f\,dx$`],
      answer: 0,
      why: {
        1: t`The bigger function can have infinite area: $f = \tfrac1{x^2}$, $g = \tfrac1x$ is an example.`,
        2: t`The bigger function can also have finite area: $f = \tfrac1{x^3}$, $g = \tfrac1{x^2}$.`,
        3: t`$f \le g$ only bounds the integrals one way; they need not be equal.`,
      },
      hints: ['A comparison passes information in one direction only.', 'Small under convergent → convergent; big over divergent → divergent. What about big over convergent?'],
      teach: 'Comparison works only “smaller than convergent” or “bigger than divergent”; any other pairing proves nothing.',
      explain: t`Knowing the smaller area is finite says nothing about the larger one. Examples: $\tfrac1{x^2} \le \tfrac1x$ (the larger diverges) and $\tfrac1{x^3} \le \tfrac1{x^2}$ (the larger converges).`,
    }),
    mcq({
      id: 'compare-root', difficulty: 3,
      gen(r) {
        const c = r.int(1, 5);
        return {
          prompt: t`Does $\displaystyle\int_1^\infty \frac{dx}{\sqrt{x^3 + ${c}}}$ converge?`,
          choices: [
            t`Yes: $\dfrac{1}{\sqrt{x^3 + ${c}}} \le \dfrac{1}{x^{3/2}}$, and $p = \tfrac32 > 1$`,
            t`No: compare with $\dfrac1x$, whose integral diverges`,
            t`No: the integrand is never zero`,
            t`Yes, because $\sqrt{x^3 + ${c}}$ grows without bound`,
          ],
          answer: 0,
          why: {
            1: t`$\frac{1}{\sqrt{x^3 + ${c}}} \le \frac1x$ is true for large $x$, but being smaller than a divergent integral proves nothing.`,
            2: t`Plenty of positive integrands have finite area: $\int_1^\infty \frac{dx}{x^2} = 1$.`,
            3: t`Growth alone is not enough: $\sqrt x$ grows without bound too, yet $\int_1^\infty \frac{dx}{\sqrt x}$ diverges. You need a rate — a comparison.`,
          },
          hints: ['For large x, which power of x does the integrand behave like?', t`Dropping the $${c}$ makes the denominator smaller, so the fraction bigger: $\frac{1}{\sqrt{x^3 + ${c}}} \le \frac{1}{\sqrt{x^3}}$.`],
          teach: 'Find the dominant power, then compare in the direction that proves something.',
          explain: t`$x^3 + ${c} > x^3$, so $\frac{1}{\sqrt{x^3 + ${c}}} < x^{-3/2}$, and $\int_1^\infty x^{-3/2}dx = 2$ converges. So the integral converges (to less than 2).`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cube-root', difficulty: 2,
      gen(r) {
        const b = r.pick([1, 8, 27]), val = 1.5 * Math.cbrt(b) ** 2;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{${b}} \frac{dx}{\sqrt[3]{x}}$.`,
          answer: val, tol: { rel: 0.005 },
          integrand: 'x^(-1/3)', limits: [0, b],
          hints: [t`$\lim_{t\to0^+}\Big[\tfrac32x^{2/3}\Big]_t^{${b}}$.`],
          teach: 'For p < 1 the spike at 0 has finite area.',
          explain: t`$\tfrac32\cdot ${b}^{2/3} = ${nice(val)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-diverges', difficulty: 2,
      prompt: t`Does $\displaystyle\int_1^\infty \frac{1 + e^{-x}}{x}\,dx$ converge?`,
      choices: [t`No: $\dfrac{1 + e^{-x}}{x} \ge \dfrac1x$, and $\int_1^\infty \frac{dx}{x}$ diverges`, t`Yes: compare with $e^{-x}$`, t`Yes: the integrand tends to 0`, t`No, because $e^{-x}$ never reaches zero`],
      answer: 0,
      why: { 1: t`The integrand is not below $e^{-x}$ — the $\frac1x$ part is far bigger for large $x$.`, 2: t`Tending to 0 is not enough; $\frac1x \to 0$ and still diverges.`, 3: t`The $e^{-x}$ term is harmless (its integral converges); the $\frac1x$ term is what diverges.` },
      hints: ['Throw away the part that only makes the integrand bigger.', t`$1 + e^{-x} \ge 1$.`],
      teach: 'To prove divergence, find a smaller function whose integral diverges.',
      explain: t`$\frac{1 + e^{-x}}{x} \ge \frac1x \ge 0$ and $\int_1^\infty \frac{dx}{x} = \infty$, so by comparison the integral diverges.`,
    }),
    mcq({
      id: 'cp-fall', difficulty: 3, transfer: true,
      prompt: t`A probe released from rest at distance $R$ from a planet’s centre falls straight in. At distance $r$ its speed is $v = \sqrt{2GM\left(\frac1r - \frac1R\right)}$, so the fall time is $T = \displaystyle\int_0^R \frac{dr}{v}$ — and $v = 0$ at the start, so the integrand is infinite at $r = R$. Is $T$ finite?`,
      choices: [
        t`Yes: near $r = R$, $v \approx \frac{1}{R}\sqrt{2GM(R - r)}$, so the integrand behaves like $(R - r)^{-1/2}$, and $p = \tfrac12 < 1$`,
        'No: an integrand that is infinite at an endpoint always gives a divergent integral',
        'No: the probe starts at rest, so it never begins to move',
        t`Yes, because $v$ is finite everywhere except $r = R$`,
      ],
      answer: 0,
      why: {
        1: t`Not always: $\int_0^1 x^{-1/2}dx = 2$. What matters is how fast the integrand blows up.`,
        2: 'Gravity acts at once, so the probe accelerates from the first instant; being momentarily at rest is not staying at rest.',
        3: t`Finite elsewhere is not the point: the blow-up at $r = R$ could still make the integral diverge. You need its rate.`,
      },
      hints: [t`Near $r = R$, write $\frac1r - \frac1R = \frac{R - r}{rR} \approx \frac{R - r}{R^2}$.`, t`Then $\frac1v \approx \frac{R}{\sqrt{2GM}}(R - r)^{-1/2}$: compare with the benchmark $p$-integral.`],
      teach: 'Whether an infinite integrand still gives a finite integral depends on how fast it blows up: (R − r)^(−p) is integrable when p < 1.',
      explain: t`The integrand grows like $(R - r)^{-1/2}$, and $p = \tfrac12 < 1$, so $T$ is finite. (It works out to $\tfrac{\pi}{2}\sqrt{R^3/2GM}$: the Moon, stopped in its orbit, would take about 4.8 days to fall to Earth’s centre, treating both as point masses.)`,
      visual: {
        type: 'graph',
        params: { x: [0, 1.15], y: [0, 6], xlabel: 'r / R', ylabel: '1/v (scaled)', curves: [{ fn: 'sqrt(x/(1 - x))', color: 'accent', domain: [0, 0.9999] }], shade: [{ fn: 'min(sqrt(x/(1 - x)), 50)', from: 0, to: 0.99999 }], vlines: [{ x: 1, label: 'release point' }] },
        caption: 'The integrand 1/v, scaled so R = 1 and 2GM = 1. It spikes at the release point, yet the shaded area is finite (π/2 in these units).',
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §3.7', url: 'https://openstax.org/books/calculus-volume-2/pages/3-7-improper-integrals' }],
});
