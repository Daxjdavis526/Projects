// Improper integrals over infinite intervals: limits of ordinary integrals, p-integrals, escape velocity.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice, frac } from '../../src/core/format.js';
import { fgraph } from './_integration.js';

const t = String.raw;

export default lesson({
  id: 'math1220.C2-2.11',
  title: 'Improper integrals: infinite limits',
  minutes: 10, difficulty: 2,
  intro: t`An integral over an infinite interval is defined as a **limit of ordinary integrals**:

$$\int_a^{\infty} f(x)\,dx = \lim_{t\to\infty}\int_a^{t} f(x)\,dx$$

If the limit exists, the integral **converges**; if not, it **diverges**. The benchmark is $\int_1^\infty x^{-p}\,dx$: it converges, to $\frac{1}{p - 1}$, when $p > 1$, and diverges when $p \le 1$ — the area under $1/x$ is infinite even though the curve sinks to zero. Over $(-\infty, \infty)$, split the integral at any point; it converges only if both halves do. Escaping a planet is an integral to infinity: the work $\int_R^\infty \frac{GMm}{r^2}\,dr$ is finite, which is why there is an escape velocity.`,
  symbols: [
    { tex: 'a', text: 'the fixed lower limit' },
    { tex: 't', text: 'a finite upper limit that you let grow without bound' },
    { tex: t`\infty`, text: t`not a number: “$t \to \infty$” means “as $t$ grows past every bound”` },
    { tex: t`\lim_{t\to\infty}`, text: 'the value the ordinary integrals approach, if they approach one; the integral converges exactly when this limit exists' },
    { tex: 'p', text: t`the power in the benchmark $x^{-p}$; $p = 1$ is the knife-edge between converging and diverging` },
  ],
  why: t`Physical totals out to infinity — the energy to escape a planet, the charge a capacitor releases, the normalisation of a probability distribution — are improper integrals that converge.`,
  visual: {
    type: 'graph',
    title: 'Does the area out to infinity add up?',
    lead: t`The blue curve is $1/x^p$; the shaded area runs from $1$ to $T$ (drawn up to the edge of the view), and the amber curve is the running area $A(x) = \frac{x^{1-p} - 1}{1 - p}$. The dashed grey curve is the knife-edge case $1/x$, whose area to $T$ is $\ln T$.`,
    tasks: [
      'Choose p = 2 and push T up: the area creeps towards 1 = 1/(p − 1) and never passes it.',
      'Choose p = 0.5: the area grows without bound, like 2√T.',
      'Compare p = 0.9 and p = 1.1 at T = 1000: the curves look almost identical, yet one area diverges and the other converges, to 10.',
    ],
    params: {
      x: [0, 12], y: [0, 3.2],
      choices: [{ key: 'p', label: 'Power $p$', options: [[0.5, '0.5'], [0.9, '0.9'], [1.1, '1.1'], [1.5, '1.5'], [2, '2'], [3, '3']], value: 2 }],
      sliders: [{ key: 'T', label: 'Upper limit $T$', min: 1.5, max: 1000, value: 10, logScale: true, explain: t`A logarithmic slider: it reaches $T = 1000$, far beyond the drawn window.` }],
      curves: [
        { fn: '1/x', color: 'ink3', dash: true, width: 1.4, domain: [0.25, 12] },
        { fn: '1/x^p', color: 'accent', domain: [0.25, 12], label: '1/xᵖ', labelAt: 0.75 },
        { fn: '(x^(1-p) - 1)/(1-p)', color: 'warn', domain: [1, 12] },
      ],
      shade: [{ fn: '1/x^p', from: 1, to: 'min(T, 12)', color: 'accent', alpha: 0.25 }],
      hlines: [{ y: '1/(p-1) + 0*sqrt(p-1)', color: 'warn', label: 'limit 1/(p − 1)' }],
      readouts: [
        { label: t`area $\int_1^T x^{-p}dx$`, expr: '(T^(1-p) - 1)/(1-p)' },
        { label: 'limit (— means it diverges)', expr: '1/(p-1) + 0*sqrt(p-1)' },
        { label: t`area under $1/x$: $\ln T$`, expr: 'ln(T)' },
      ],
    },
    caption: 'Exact curves and formulas. Only x up to 12 is drawn; the readouts follow T all the way to 1000. “—” means the limit does not exist.',
  },
  example: {
    title: 'Escape velocity',
    prompt: t`How fast must a probe leave Earth’s surface to coast away for ever? Ignore air resistance and every body except Earth ($GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R = 6.371\times10^{6}$ m).`,
    visual: {
      type: 'graph',
      params: { x: [0, 12], y: [0, 1.15], xlabel: 'r / R', ylabel: 'g / g₀', curves: [{ fn: '1/x^2', color: 'accent', domain: [1, 12] }], shade: [{ fn: '1/x^2', from: 1, to: 12 }], vlines: [{ x: 1, label: 'surface' }] },
      caption: t`Gravity per unit mass, scaled so the surface value is 1 at $r = R$. The shaded area continues to infinity, yet totals exactly 1 in these units: the work to escape is finite.`,
    },
    steps: [
      { label: 'Set up', text: t`Climbing from $r = R$ to infinity against gravity takes work per kilogram $\displaystyle\frac{W}{m} = \int_R^{\infty}\frac{GM}{r^2}\,dr = \lim_{t\to\infty}\int_R^{t}\frac{GM}{r^2}\,dr.$` },
      { label: 'Integrate to a finite t', text: t`$\displaystyle\int_R^{t}\frac{GM}{r^2}\,dr = \Big[-\frac{GM}{r}\Big]_R^{t} = GM\Big(\frac1R - \frac1t\Big).$` },
      { label: 'Take the limit', text: t`As $t \to \infty$, $1/t \to 0$, so $\dfrac{W}{m} = \dfrac{GM}{R}$ — finite. The integral converges ($p = 2 > 1$).` },
      { label: 'Energy balance', text: t`Launch kinetic energy must cover it: $\tfrac12v^2 = \dfrac{GM}{R}$, so $v = \sqrt{\dfrac{2GM}{R}}$.` },
      { label: 'Numbers', text: t`$v = \sqrt{\dfrac{2(3.986\times10^{14})}{6.371\times10^{6}}} = \sqrt{1.251\times10^{8}} = 1.12\times10^{4}$ m/s.` },
      { label: 'Sense check', text: t`About 11.2 km/s — the familiar figure. It does not depend on the probe’s mass, and in practice air resistance and Earth’s rotation shift it a little.` },
    ],
    answer: t`$v_\text{esc} = \sqrt{2GM/R} \approx 11.2$ km/s, because $\int_R^\infty GM/r^2\,dr = GM/R$ converges.`,
  },
  practice: [
    mcq({
      id: 'which-converges', difficulty: 1,
      gen(r) {
        const good = r.pick([[1.5, t`x^{3/2}`], [2, t`x^{2}`], [3, t`x^{3}`], [1.1, t`x^{1.1}`]]);
        const base = [t`$\displaystyle\int_1^\infty \frac{dx}{${good[1]}}$`, t`$\displaystyle\int_1^\infty \frac{dx}{x}$`, t`$\displaystyle\int_1^\infty \frac{dx}{\sqrt{x}}$`, t`$\displaystyle\int_1^\infty \frac{dx}{x^{0.9}}$`];
        const whyBase = [null, t`$p = 1$: $\int_1^t \frac{dx}{x} = \ln t \to \infty$. The knife-edge case diverges.`, t`$p = \tfrac12 < 1$: the area grows like $2\sqrt t$.`, t`$p = 0.9 < 1$: the area grows like $10\,t^{0.1}$ — slowly, but without bound.`];
        const order = r.shuffle([0, 1, 2, 3]);   // authored order varies, so variants differ
        return {
          prompt: 'Which of these integrals converges?',
          choices: order.map((i) => base[i]),
          answer: order.indexOf(0),
          why: Object.fromEntries(order.map((i, k) => [k, whyBase[i]]).filter(([, w]) => w)),
          hints: [t`Compare each with $\int_1^\infty x^{-p}\,dx$, which converges only for $p > 1$.`, 'Read off p from each integrand.'],
          teach: t`$\int_1^\infty x^{-p}\,dx$ converges exactly when $p > 1$.`,
          explain: t`Only $\int_1^\infty dx/${good[1]}$ has $p = ${good[0]} > 1$; it equals $\frac{1}{p - 1} = ${nice(1 / (good[0] - 1))}$.`,
          visual: { type: 'graph', params: { x: [1, 13.2], y: [0, 1.1], curves: [{ fn: `x^(-${good[0]})`, color: 'accent', domain: [1, 12], label: { 1.5: 'x^(−3/2)', 2: 'x^(−2)', 3: 'x^(−3)', 1.1: 'x^(−1.1)' }[good[0]], labelAt: 12, labelDy: { 1.1: 8, 1.5: 0, 2: -8, 3: -8 }[good[0]] }, { fn: '1/x', color: 'warn', domain: [1, 12], label: 'x^(−1)', labelAt: 12, labelDy: 0 }, { fn: '1/sqrt(x)', color: 'good', domain: [1, 12], label: 'x^(−1/2)', labelAt: 12, labelDy: 0 }, { fn: 'x^(-0.9)', color: 'violet', domain: [1, 12], label: 'x^(−0.9)', labelAt: 12, labelDy: -8 }] }, caption: 'The four integrands from x = 1 to 12. Curves that look alike can differ in whether their area out to infinity is finite — the picture alone cannot decide it.' },
        };
      },
    }),
    num({
      id: 'p-integral', difficulty: 2,
      gen(r) {
        const a = r.int(1, 3), [p, pTeX] = r.pick([[2, '2'], [3, '3'], [1.5, '3/2']]);
        const val = a ** (1 - p) / (p - 1);
        return {
          prompt: t`Evaluate $\displaystyle\int_{${a}}^{\infty} x^{-${pTeX}}\,dx$ to 3 significant figures.`,
          answer: val, tol: { rel: 0.005 },
          integrand: `x^(-${p})`, limits: [a, Infinity],
          errors: [{ value: 1 / (p - 1), feedback: t`That is the integral from 1. Here the lower limit is ${a}.` }].filter(() => a !== 1),
          hints: [t`Write it as $\lim_{t\to\infty}\int_{${a}}^{t} x^{-${pTeX}}\,dx$ and integrate with the power rule.`, t`$\int_{${a}}^{t} x^{-${pTeX}}dx = \Big[\frac{x^{1-${pTeX}}}{1 - ${pTeX}}\Big]_{${a}}^{t}$; the $t$ term vanishes as $t\to\infty$.`],
          teach: t`For $p > 1$, $\int_a^\infty x^{-p}\,dx = \frac{a^{1-p}}{p - 1}$: the upper-limit term dies away.`,
          explain: t`$\lim_{t\to\infty}\dfrac{${a}^{1-${pTeX}} - t^{1-${pTeX}}}{${pTeX} - 1} = \dfrac{${a}^{1-${pTeX}}}{${pTeX} - 1} = ${fmt(val, 4)}$.`,
          visual: { type: 'graph', params: { x: [0, 10], y: [0, 1.15], curves: [{ fn: `x^(-${p})`, color: 'accent', domain: [0.3, 10] }], shade: [{ fn: `x^(-${p})`, from: a, to: 10 }], vlines: [{ x: a }] }, caption: t`The shaded region continues to infinity; its total area is finite.` },
        };
      },
    }),
    num({
      id: 'capacitor', difficulty: 2,
      gen(r) {
        const I0 = r.pick([1.5, 2, 2.5, 4]), tau = r.pick([0.5, 1.2, 3, 4.5]);
        const Q = I0 * tau;                                   // mA·s = mC
        return {
          prompt: t`A charged capacitor discharges through a resistor with current $I(t) = I_0e^{-t/\tau}$, where $I_0 = ${I0}$ mA and $\tau = RC = ${tau}$ s. How much charge flows in total, from $t = 0$ onwards? Answer in millicoulombs.`,
          answer: Q, units: 'mC', tol: { rel: 0.005 },
          integrand: `${I0}*exp(-x/${tau})`, limits: [0, Infinity],
          errors: [{ value: I0 / tau, feedback: t`$\int_0^\infty e^{-t/\tau}dt = \tau$, so multiply by $\tau$, not divide.` }],
          hints: [t`Total charge is $Q = \int_0^\infty I\,dt$.`, t`$\int_0^{t} e^{-s/\tau}ds = \tau(1 - e^{-t/\tau}) \to \tau$.`],
          teach: t`An exponential decay $e^{-t/\tau}$ has finite total area $\tau$ out to infinity.`,
          explain: t`$Q = I_0\lim_{t\to\infty}\tau\big(1 - e^{-t/\tau}\big) = I_0\tau = ${I0}\times${tau} = ${nice(Q)}$ mC — the charge the capacitor started with.`,
          visual: { type: 'graph', params: { x: [0, 6 * tau], y: [0, I0 * 1.15], xlabel: 't (s)', ylabel: 'I (mA)', curves: [{ fn: `${I0}*exp(-x/${tau})`, color: 'accent' }], shade: [{ fn: `${I0}*exp(-x/${tau})`, from: 0, to: 6 * tau }] }, caption: 'The current never quite reaches zero, but the area under it is finite. Ideal components assumed.' },
        };
      },
    }),
    mcq({
      id: 'symmetric-trap', difficulty: 2, kind: 'error',
      prompt: t`A student writes: “$\displaystyle\int_{-\infty}^{\infty} x\,dx = 0$, because $x$ is odd and the areas cancel.” What is the truth?`,
      choices: [
        t`It diverges: $\int_0^\infty x\,dx$ is infinite, so the integral does not exist`,
        'The student is right: it equals 0',
        t`It equals $+\infty$, since the right half wins`,
        'It converges, because the integrand is odd',
      ],
      answer: 0,
      why: {
        1: t`$\lim_{t\to\infty}\int_{-t}^{t} x\,dx = 0$, but that symmetric limit (the “principal value”) is not the definition. Each half must converge on its own.`,
        2: 'Neither half wins: ∞ − ∞ has no value, so the integral is undefined, not +∞.',
        3: 'Oddness gives cancellation only when each half is finite.',
      },
      hints: ['Split at 0 and examine each half separately.', t`$\int_0^t x\,dx = \tfrac{t^2}{2} \to \infty$.`],
      teach: t`$\int_{-\infty}^{\infty}$ converges only if both $\int_{-\infty}^{0}$ and $\int_0^{\infty}$ converge separately.`,
      explain: t`$\int_0^\infty x\,dx = \lim \tfrac{t^2}{2} = \infty$, so the integral diverges. Letting both ends go out together ($\int_{-t}^{t}$) is a different, special construction.`,
      visual: fgraph({ f: 'x', x: [-6, 6], y: [-6.5, 6.5], shade: [{ from: -6, to: 0 }, { from: 0, to: 6 }], caption: t`The two halves of $\int_{-\infty}^{\infty} x\,dx$. Each grows without bound as its limit moves out; neither has a finite value to cancel.` }),
    }),
    num({
      id: 'x-exp', difficulty: 3,
      gen(r) {
        const k = r.int(1, 4);
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{\infty} x\,e^{-${k === 1 ? '' : k}x}\,dx$.`,
          answer: 1 / (k * k), tol: { rel: 0.005 },
          integrand: `x*exp(-${k}x)`, limits: [0, Infinity],
          errors: [{ value: 1 / k, feedback: t`That is $\int_0^\infty e^{-${k === 1 ? '' : k}x}dx$. The extra $x$ needs integration by parts.` }].filter(() => k !== 1),
          hints: [
            t`Parts with $u = x$, $dv = e^{-${k === 1 ? '' : k}x}dx$: $\int x e^{-${k === 1 ? '' : k}x}dx = -\tfrac{x}{${k}}e^{-${k === 1 ? '' : k}x} - \tfrac{1}{${k * k}}e^{-${k === 1 ? '' : k}x}$.`,
            t`Evaluate from 0 to $t$ and let $t \to \infty$: $t\,e^{-${k === 1 ? '' : k}t} \to 0$ because the exponential wins (L’Hôpital).`,
          ],
          teach: 'Integrate by parts on [0, t], then take the limit; exponential decay beats any polynomial growth.',
          explain: t`$\Big[-\tfrac{x}{${k}}e^{-${k === 1 ? '' : k}x} - \tfrac{1}{${k * k}}e^{-${k === 1 ? '' : k}x}\Big]_0^{t} \to 0 - \big(-\tfrac{1}{${k * k}}\big) = ${frac(1 / (k * k))}$.`,
          visual: fgraph({ f: `x*exp(-${k}x)`, x: [0, 8 / k], shade: { from: 0, to: 8 / k }, caption: 'The shaded area runs on to infinity; the exponential decay keeps it finite.' }),
        };
      },
    }),
    num({
      id: 'lorentzian-total', difficulty: 2,
      gen(r) {
        const a = r.int(1, 4), A = a * a;
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty} \frac{dx}{x^2 + ${A}}$ to 3 significant figures.`,
          answer: Math.PI / a, tol: { rel: 0.005 },
          integrand: `1/(x^2 + ${A})`, limits: [-Infinity, Infinity],
          errors: [{ value: Math.PI / (2 * a), feedback: 'That is only one half, from 0 to ∞. Add the half from −∞ to 0.' }],
          hints: [t`Split at 0. An antiderivative is $\tfrac{1}{${a}}\arctan\tfrac{x}{${a}}$.`, t`$\arctan u \to \tfrac{\pi}{2}$ as $u \to \infty$, and $\to -\tfrac{\pi}{2}$ as $u \to -\infty$.`],
          teach: t`Both halves converge, each to $\frac{\pi}{2a}$, so the whole Lorentzian has area $\frac{\pi}{a}$.`,
          explain: t`$\tfrac{1}{${a}}\Big(\tfrac{\pi}{2} - \big(-\tfrac{\pi}{2}\big)\Big) = \tfrac{\pi}{${a}} = ${fmt(Math.PI / a, 4)}$.`,
          visual: { type: 'graph', params: { x: [-10, 10], y: [0, 1.15 / A], curves: [{ fn: `1/(x^2 + ${A})`, color: 'accent' }], shade: [{ fn: `1/(x^2 + ${A})`, from: -10, to: 10 }] }, caption: 'Both tails run off to infinity; the total area is still finite.' },
        };
      },
    }),
    mcq({
      id: 'gabriel', difficulty: 3,
      prompt: t`Rotate $y = 1/x$, for $x \ge 1$, about the $x$-axis to make an infinitely long horn (“Gabriel’s horn”). Its volume is $\pi\int_1^\infty \frac{dx}{x^2}$ and its surface area is $2\pi\int_1^\infty \frac1x\sqrt{1 + \frac{1}{x^4}}\,dx$. Which is true?`,
      choices: ['Finite volume (π), but infinite surface area', 'Both are infinite', 'Both are finite', 'Infinite volume, but finite surface area'],
      answer: 0,
      why: {
        1: t`The volume integral has $p = 2 > 1$: it converges, to $\pi$.`,
        2: t`The area integrand is at least $\frac1x$, whose integral to infinity diverges.`,
        3: t`It is the other way round: $\int \frac{dx}{x^2}$ converges while $\int \frac{dx}{x}$ diverges.`,
      },
      hints: ['Compare each integrand with x^(−p) and read off p.', t`$\sqrt{1 + 1/x^4} \ge 1$, so the area integrand is at least $\frac1x$.`],
      teach: t`The same curve can enclose a convergent integral ($1/x^2$) and a divergent one ($1/x$) — the horn holds finite paint but cannot be painted.`,
      explain: t`$V = \pi\int_1^\infty x^{-2}dx = \pi$ converges, but $S \ge 2\pi\int_1^\infty \frac{dx}{x} = \infty$. The “paradox” is a fact about $p$-integrals, not a contradiction.`,
      visual: ({ type: 'graph', params: { x: [0, 10], y: [-1.25, 1.25], curves: [{ fn: '1/x', color: 'accent', width: 2.4, domain: [1, 10] }, { fn: '-1/x', color: 'accent', width: 2.4, domain: [1, 10] }], vlines: [{ x: 1 }] }, caption: t`The horn’s profile $y = \pm 1/x$ from $x = 1$ to $10$ (it goes on for ever). Its cross-sections have area $\pi/x^2$, but its rim has length $2\pi/x$.` }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-p', difficulty: 2,
      gen(r) {
        const a = r.int(2, 3), p = r.int(2, 3), val = a ** (1 - p) / (p - 1);
        return {
          prompt: t`Evaluate $\displaystyle\int_{${a}}^{\infty} \frac{dx}{x^{${p}}}$ to 3 significant figures.`,
          answer: val, tol: { rel: 0.005 },
          integrand: `x^(-${p})`, limits: [a, Infinity],
          hints: [t`$\lim_{t\to\infty}\Big[\frac{x^{1-${p}}}{1 - ${p}}\Big]_{${a}}^{t}$.`],
          teach: 'Integrate to t, then let t → ∞.',
          explain: t`$\dfrac{${a}^{${1 - p}}}{${p - 1}} = ${frac(val)} \approx ${fmt(val, 3)}$.`,
          visual: fgraph({ f: `x^(-${p})`, x: [0.5, 10], y: [0, 1.2], shade: { from: a, to: 10 }, caption: 'The shaded region continues to infinity.' }),
        };
      },
    }),
    mcq({
      id: 'cp-root', difficulty: 2,
      gen(r) {
        const a = r.int(2, 3);
        return {
          prompt: t`What is $\displaystyle\int_{${a}}^{\infty} \frac{dx}{\sqrt{x}}$?`,
          choices: ['It diverges', t`$\frac{2}{\sqrt{${a}}}$`, t`$2\sqrt{${a}}$`, '0'],
          answer: 0,
          why: { 1: t`That would be right for $\int \frac{dx}{x^{3/2}}$. Here $p = \tfrac12 \le 1$.`, 2: t`That is $-$(the value of $2\sqrt x$ at the lower limit) — but $2\sqrt t \to \infty$ at the upper end.`, 3: 'The integrand is positive, so the area cannot be 0.' },
          hints: [t`$p = \tfrac12$.`, t`$\int_{${a}}^{t} x^{-1/2}dx = 2\sqrt t - 2\sqrt{${a}} \to \infty$.`],
          teach: t`With $p = \tfrac12 \le 1$, the area out to infinity is infinite.`,
          explain: t`$2\sqrt t - 2\sqrt{${a}}$ grows without bound, so the integral diverges.`,
          visual: fgraph({ f: '1/sqrt(x)', x: [0, 20], y: [0, 1.25], shade: { from: a, to: 20 }, caption: t`The area under $1/\sqrt{x}$ from ${a} to the edge of the view. The curve continues for ever.` }),
        };
      },
    }),
    num({
      id: 'cp-escape', difficulty: 3, transfer: true,
      gen(r) {
        const [body, GM, R, GMt, Rt] = r.pick([
          ['the Moon', 4.9049e12, 1.7374e6, t`4.905\times10^{12}`, t`1.737\times10^{6}`],
          ['Mars', 4.2828e13, 3.3895e6, t`4.283\times10^{13}`, t`3.390\times10^{6}`],
          ['Mercury', 2.2032e13, 2.4397e6, t`2.203\times10^{13}`, t`2.440\times10^{6}`],
        ]);
        const v = Math.sqrt((2 * GM) / R) / 1000;
        return {
          prompt: t`A sample-return capsule must leave the surface of ${body} and coast away for ever. With $GM = ${GMt}\ \text{m}^3/\text{s}^2$ and radius $R = ${Rt}$ m, and ignoring every other body, what launch speed does it need? Answer in km/s to 3 significant figures.`,
          answer: v, units: 'km/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(GM / R) / 1000, feedback: t`That is $\sqrt{GM/R}$, the speed of a circular orbit skimming the surface. Escape needs $\tfrac12v^2 = GM/R$, so $v = \sqrt{2GM/R}$.` }],
          hints: [t`Work per kilogram to reach infinity: $\int_R^\infty \frac{GM}{r^2}\,dr = \frac{GM}{R}$.`, t`Set $\tfrac12v^2 = \frac{GM}{R}$ and solve for $v$; convert m/s to km/s.`],
          teach: t`Escape speed comes from a convergent improper integral: $\tfrac12v^2 = \int_R^\infty \frac{GM}{r^2}dr = \frac{GM}{R}$.`,
          explain: t`$v = \sqrt{2GM/R} = \sqrt{2(${GMt})/(${Rt})} = ${fmt(v, 3)}$ km/s.`,
          visual: fgraph({ f: '1/x^2', x: [0, 10], y: [0, 1.15], shade: { from: 1, to: 10 }, xlabel: 'r / R', ylabel: 'g / g at surface', vlines: [{ x: 1, label: 'surface' }], caption: 'Gravity per unit mass, scaled to 1 at the surface. The shaded area, continued to infinity, is the work per kilogram needed to escape.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §3.7', url: 'https://openstax.org/books/calculus-volume-2/pages/3-7-improper-integrals' },
    { label: 'NASA planetary fact sheets (GM and mean radii)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
  ],
});
