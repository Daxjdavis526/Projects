// Real integrals of rational functions by residues: close [−R, R] with the
// upper semicircle, let R → ∞. The arc dies when deg Q ≥ deg P + 2 (the ML
// bound πR·C/R²), so ∫ P/Q dx = 2πi Σ Res over the poles in the upper
// half-plane. The catalogue: one simple pole, two, a double pole, poles off
// the imaginary axis, a quartic; the condition that makes it work; the
// classic slip of adding the lower poles too. Transfer: the mean-square
// response of a lightly damped mode to white noise (launch vibration) is a
// rational integral equal to π/2ζ — the root of the √Q in Miles' equation.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { num as nm, apart } from './_cx.js';
import { C, contour, integral } from './_cx2.js';
import { D, pole, iPlain, plane, realPic } from './_cx3.js';

const t = String.raw;
const PI = Math.PI;
const pm = (b, lab = true) => [pole(0, b, lab ? iPlain(b) : ''), pole(0, -b, lab ? iPlain(-b) : '')];

export default lesson({
  id: 'st-d.D9.1',
  title: 'Rational functions on the real line',
  minutes: 14, difficulty: 3,
  intro: t`Some real integrals defeat every trick of calculus but fall at once to residues. Take a rational function $P(x)/Q(x)$ with no poles on the real axis, and walk the real segment $[-R, R]$ and then back along the upper semicircle $C_R$. The residue theorem (D8.2) prices that closed walk at $2\pi i$ times the residues inside. If the arc’s share dies as $R \to \infty$, the real line alone carries the whole value:

$$\int_{-\infty}^{\infty} \frac{P(x)}{Q(x)}\,dx = 2\pi i \sum_{\operatorname{Im} a_k > 0} \operatorname{Res}\!\left(\frac{P}{Q},\ a_k\right)$$

The arc dies when $Q$’s degree beats $P$’s by **at least 2**: then $|P/Q| \le C/R^2$ on $C_R$, and the ML bound (D5.2) gives $\pi R\cdot C/R^2 \to 0$. Only the poles in the **upper** half-plane count — the lower ones are outside the contour.`,
  symbols: [
    { tex: 'P, Q', text: t`polynomials with real coefficients; $\deg Q \ge \deg P + 2$, and $Q$ has no real zeros` },
    { tex: 'a_k', text: t`the zeros of $Q$ — the poles of $P/Q$ — with $\operatorname{Im} a_k > 0$ (they come in conjugate pairs; one of each pair is above the axis)` },
    { tex: t`\operatorname{Res}`, text: t`the residue at a pole: $P(a)/Q'(a)$ at a simple pole, a derivative formula at a repeated one` },
    { tex: 'C_R', text: t`the upper semicircle $|z| = R$, $\operatorname{Im} z \ge 0$, walked from $R$ to $-R$` },
    { tex: 'R', text: t`the radius of the closing arc, taken larger than every $|a_k|$ and then sent to infinity` },
  ],
  why: t`Integrals of rational functions over the whole line are everywhere physics squares a response: the power in a filter’s output, the mean-square shake of a structure in random vibration, the width of a spectral line — and each is a sum of residues.`,
  visual: {
    type: 'cx2-contour',
    title: 'Close the line, let the arc die',
    lead: t`The real segment $[-R, R]$ closed by the upper semicircle, with the arrows $f\,\Delta z$ coloured from blue (the start of the segment) to orange (the end of the arc). On the right, the same arrows head to tail: the chain ends at the closed integral. Slide $R$.`,
    tasks: [
      t`With $1/(z^2 + 1)^2$, move $R$ anywhere above $1$: the chain always ends at $\pi/2 \approx 1.571$. Push $R$ below $1$ and the contour encloses nothing: the end jumps to $0$.`,
      t`Watch the orange arrows (the arc) as $R$ grows: they shrink to nothing, and the blue ones (the real segment) carry the whole value.`,
      t`With $1/(z^4 + 1)$ two poles are enclosed, and the chain ends at $\pi/\sqrt2 \approx 2.221$ — the sum of both residues times $2\pi i$.`,
    ],
    params: {
      fns: [
        { f: '1/(z^2 + 1)^2', label: '$1/(z^2 + 1)^2$', marks: pm(1) },
        { f: '1/((z^2 + 1)*(z^2 + 4))', label: t`$\frac{1}{(z^2 + 1)(z^2 + 4)}$`, marks: [...pm(1), ...pm(2)] },
        { f: '1/(z^4 + 1)', label: '$1/(z^4 + 1)$', marks: [1, 3, 5, 7].map((k) => pole(Math.cos((k * PI) / 4), Math.sin((k * PI) / 4))) },
      ],
      sliders: [{ key: 'R', label: 'arc radius $R$', min: 0.5, max: 4, step: 0.05, value: 2.5, explain: t`The radius of the closing semicircle; the segment runs from $-R$ to $R$.` }],
      contour: { kind: 'path', parts: [{ kind: 'segment', from: ['-R', 0], to: ['R', 0] }, { kind: 'arc', c: [0, 0], r: 'R', from: 0, to: PI }] },
      x: [-4.4, 4.4], y: [-1.8, 4.6], n: 40, readout: ['I'],
    },
    caption: t`The arrows on the contour are drawn longer than true, all by one factor; the chain on the right is to scale and its window rescales as $R$ changes. At $R = 1$ (or $R = 2$) the arc runs through a pole and the integral is not defined.`,
  },
  example: {
    prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty} \frac{dx}{(x^2 + 1)(x^2 + 4)}$.`,
    visual: contour({ f: '1/((z^2 + 1)*(z^2 + 4))', contour: D(3), marks: [...pm(1), ...pm(2)], x: [-3.6, 3.6], y: [-2.4, 3.6], n: 36, readout: ['I'] }, t`The D contour with $R = 3$: it encloses $i$ and $2i$, and its chain ends at $\pi/6 \approx 0.524$.`),
    steps: [
      { label: 'Check', text: t`$\deg Q = 4 \ge \deg P + 2 = 2$, and $Q$ has no real zeros. The arc will die, and the integral converges.` },
      { label: 'Poles', text: t`$Q = (z - i)(z + i)(z - 2i)(z + 2i)$. In the upper half-plane: $i$ and $2i$, both simple.` },
      { label: 'Residue at i', text: t`$\operatorname{Res} = \dfrac{1}{(z + i)(z^2 + 4)}\Big|_{z = i} = \dfrac{1}{2i\cdot 3} = \dfrac{1}{6i}$.` },
      { label: 'Residue at 2i', text: t`$\operatorname{Res} = \dfrac{1}{(z^2 + 1)(z + 2i)}\Big|_{z = 2i} = \dfrac{1}{(-3)(4i)} = -\dfrac{1}{12i}$.` },
      { label: 'Add', text: t`$2\pi i\left(\dfrac{1}{6i} - \dfrac{1}{12i}\right) = 2\pi i\cdot\dfrac{1}{12i} = \dfrac{\pi}{6} \approx 0.5236$. The $i$’s cancel, as they must: the integral of a positive real function is a positive real number.` },
      { label: 'Sense check', text: t`Partial fractions give $\frac13\left(\frac{1}{x^2 + 1} - \frac{1}{x^2 + 4}\right)$, which integrates to $\frac13\left(\pi - \frac{\pi}{2}\right) = \frac{\pi}{6}$. Same answer.` },
    ],
    answer: t`$\dfrac{\pi}{6} \approx 0.5236$`,
  },
  practice: [
    mcq({
      id: 'which-closes', difficulty: 2,
      prompt: t`For which integral does closing $[-R, R]$ with the upper semicircle and letting $R \to \infty$ work exactly as stated in the introduction?`,
      visual: { type: 'graph', params: { x: [1, 10], y: [0, 4], aspect: 'wide', xlabel: 'arc radius R', ylabel: 'ML bound on the arc', axesAt: 'edge',
        curves: [{ fn: 'pi', color: 'bad', width: 2.4, label: '|f| ~ 1/R: stays near π', labelAt: 6.5 }, { fn: 'pi/x', color: 'accent', width: 2.4, label: '|f| ~ 1/R²', labelAt: 2.2, labelDx: 8, labelDy: -2 }, { fn: 'pi/x^2', color: 'good', width: 2.4, label: '|f| ~ 1/R³', labelAt: 1.6, labelDx: 8, labelDy: 12 }] },
        caption: t`The ML bound $\pi R\cdot M$ on the arc when $|f|$ falls like $1/R$, $1/R^2$ or $1/R^3$ there (constants set to 1). Only a fall of $1/R^2$ or faster beats the arc’s growing length.` },
      choices: [
        t`$\displaystyle\int_{-\infty}^{\infty} \frac{x^2}{x^4 + 1}\,dx$`,
        t`$\displaystyle\int_{-\infty}^{\infty} \frac{x^3}{x^4 + 1}\,dx$`,
        t`$\displaystyle\int_{-\infty}^{\infty} \frac{dx}{x^2 - 1}$`,
        t`$\displaystyle\int_{-\infty}^{\infty} \frac{x^2}{x^2 + 1}\,dx$`,
      ],
      answer: 0,
      why: {
        1: t`The degrees differ by only 1: $|f| \sim 1/R$ on the arc, so the bound stays near $\pi$ and the arc does not die. (The integral itself diverges: $x^3/(x^4 + 1) \sim 1/x$.)`,
        2: t`$x^2 - 1$ vanishes at $x = \pm1$: there are poles **on** the path. That needs an indented contour and a principal value (D9.3), not the plain method.`,
        3: t`Equal degrees: $f \to 1$ at infinity, so the integral diverges and the arc blows up.`,
      },
      hints: [t`On the arc $|z| = R$, how fast does each integrand shrink? Compare $\deg Q - \deg P$.`, t`The arc’s length grows like $\pi R$; the integrand must shrink like $1/R^2$ or faster. Also check $Q$ for real zeros.`],
      teach: t`The semicircle method needs $\deg Q \ge \deg P + 2$ and no real poles: then $|f| \le C/R^2$ on the arc and ML gives $\pi C/R \to 0$.`,
      explain: t`For $x^2/(x^4 + 1)$ the degrees differ by 2 and $x^4 + 1 > 0$: the arc’s bound is about $\pi R\cdot R^2/R^4 = \pi/R \to 0$. Its value is $\pi/\sqrt2$.`,
    }),
    num({
      id: 'one-pole', difficulty: 1,
      gen(r) {
        const a = r.pick([0.5, 2, 3, 4, 5]);
        const ans = PI / a;
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty} \frac{dx}{x^2 + ${nm(a * a, 3)}}$. (3 significant figures.)`,
          visual: plane({ f: `1/(z^2 + ${a * a})`, contour: D(1.8 * a), marks: pm(a), x: [-2.2 * a, 2.2 * a], y: [-1.5 * a, 2.2 * a] }, t`The D contour encloses the pole at $${nm(a, 3)}i$ only. Arrows drawn longer than true.`),
          answer: ans, tol: { rel: 0.005 }, integrand: `1/(x^2 + ${a * a})`, limits: ['-inf', 'inf'], vars: { x: [-5, 5] },
          errors: apart(ans, [{ value: PI / (a * a), feedback: t`The residue at $${nm(a, 3)}i$ is $\frac{1}{2\cdot${nm(a, 3)}i}$: the $2z$ from $h'$ brings one power of $a$, not two.` }, { value: 2 * PI / a, feedback: t`$\operatorname{Res} = \frac{1}{2ai}$ — keep the 2 in $h'(z) = 2z$.` }]),
          hints: [t`The upper pole is $z = ${nm(a, 3)}i$. For $1/h$ with a simple zero, $\operatorname{Res} = 1/h'$.`, t`$\operatorname{Res} = \dfrac{1}{2\cdot ${nm(a, 3)}i}$; multiply by $2\pi i$.`],
          teach: t`One simple pole above the axis: $\int dx/(x^2 + a^2) = 2\pi i\cdot\frac{1}{2ai} = \pi/a$.`,
          explain: t`$2\pi i\cdot\dfrac{1}{${nm(2 * a, 3)}i} = \dfrac{\pi}{${nm(a, 3)}} = ${nm(ans, 4)}$. Check: the antiderivative is $\frac{1}{a}\arctan\frac{x}{a}$, which climbs by $\pi/a$ along the whole line.`,
        };
      },
    }),
    num({
      id: 'two-poles', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 3], [2, 3], [1, 4], [0.5, 1], [2, 5]]);
        const ans = PI / (a * b * (a + b));
        const f = `1/((x^2 + ${a * a})*(x^2 + ${b * b}))`;
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty} \frac{dx}{(x^2 + ${nm(a * a, 3)})(x^2 + ${nm(b * b, 3)})}$. (3 significant figures.)`,
          visual: realPic({ fn: f, x: [-3 * b, 3 * b], y: [0, 1.15 / (a * a * b * b)], caption: t`The integrand, a positive bump: the shaded area is the integral.` }),
          answer: ans, tol: { rel: 0.005 }, integrand: f, limits: ['-inf', 'inf'], vars: { x: [-5, 5] },
          errors: apart(ans, [
            { value: PI / (a * (b * b - a * a)), feedback: t`That is only the pole at $${nm(a, 3)}i$. The pole at $${nm(b, 3)}i$ is in the upper half-plane too.` },
            { value: 0, feedback: 'Adding the residues of all four poles gives 0: only the two above the axis are inside the contour.' },
          ]),
          hints: [t`Upper poles: $${nm(a, 3)}i$ and $${nm(b, 3)}i$. At $${nm(a, 3)}i$: $\operatorname{Res} = \dfrac{1}{2\cdot${nm(a, 3)}i\,(${nm(b * b, 3)} - ${nm(a * a, 3)})}$.`, t`At $${nm(b, 3)}i$: $\operatorname{Res} = \dfrac{1}{2\cdot${nm(b, 3)}i\,(${nm(a * a, 3)} - ${nm(b * b, 3)})}$. Add, then multiply by $2\pi i$.`],
          teach: 'Add the residues of every pole in the upper half-plane — and only those.',
          explain: t`The two residues add to $\dfrac{1}{2i(b^2 - a^2)}\left(\dfrac1a - \dfrac1b\right) = \dfrac{1}{2iab(a + b)}$, so the integral is $\dfrac{\pi}{ab(a + b)} = \dfrac{\pi}{${nm(a * b * (a + b), 4)}} = ${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'double', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, 3, 0.5]);
        const ans = PI / (2 * a ** 3);
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty} \frac{dx}{(x^2 + ${nm(a * a, 3)})^2}$. (3 significant figures.)`,
          visual: plane({ f: `1/(z^2 + ${a * a})^2`, contour: D(1.8 * a), marks: pm(a), view: 'colour', arrowsOn: false, x: [-2.2 * a, 2.2 * a], y: [-1.5 * a, 2.2 * a] }, t`Coloured by the value of the integrand: the colours circle each pole twice — double poles. The D contour encloses the upper one.`),
          answer: ans, tol: { rel: 0.005 }, integrand: `1/(x^2 + ${a * a})^2`, limits: ['-inf', 'inf'], vars: { x: [-5, 5] },
          errors: apart(ans, [
            { value: PI / (4 * a ** 3), feedback: t`$\frac{d}{dz}(z + ${nm(a, 3)}i)^{-2} = -2(z + ${nm(a, 3)}i)^{-3}$: keep the factor 2 the derivative brings down.` },
            { value: PI / (a * a), feedback: t`The pole is double: $\operatorname{Res} = \frac{d}{dz}\big[(z - ai)^2 f\big]$ at $ai$, not $\big[(z - ai)f\big]$.` },
          ]),
          hints: [t`$(z^2 + a^2)^2 = (z - ai)^2(z + ai)^2$: a double pole at $ai$. $\operatorname{Res} = \dfrac{d}{dz}(z + ai)^{-2}\Big|_{z = ai}$.`, t`$= -2(2ai)^{-3} = \dfrac{-2}{-8a^3 i} = \dfrac{1}{4a^3 i}$. Multiply by $2\pi i$.`],
          teach: t`At a double pole, differentiate what is left after removing $(z - a)^2$.`,
          explain: t`$\operatorname{Res} = \dfrac{1}{4a^3 i}$ with $a = ${nm(a, 3)}$, so the integral is $\dfrac{2\pi i}{4a^3 i} = \dfrac{\pi}{2a^3} = ${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'shifted', difficulty: 3,
      gen(r) {
        const b = r.pick([1, 2, -1, 3, -2]), q = r.pick([1, 2, 3]);
        const c = b * b + q * q, ans = PI / q, qi = q === 1 ? 'i' : `${q}i`;
        const f = `1/(x^2 ${b < 0 ? '-' : '+'} ${2 * Math.abs(b)}x + ${c})`;
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty} \frac{dx}{x^2 ${b < 0 ? '-' : '+'} ${2 * Math.abs(b)}x + ${c}}$. (3 significant figures.)`,
          visual: realPic({ fn: f, x: [-b - 5 * q, -b + 5 * q], y: [0, 1.15 / (q * q)], points: [{ x: -b, y: 1 / (q * q), label: `peak at x = ${String(-b).replace('-', '−')}`, color: 'ink2', r: 3 }], caption: 'The integrand: a bump centred off zero. Shifting it sideways does not change its area.' }),
          answer: ans, tol: { rel: 0.005 }, integrand: f, limits: ['-inf', 'inf'], vars: { x: [-5, 5] },
          errors: apart(ans, [{ value: PI / Math.sqrt(c), feedback: t`The poles are at $${-b} \pm ${qi}$, not $\pm\sqrt{${c}}\,i$: complete the square first.` }, { value: (2 * PI) / q, feedback: t`$h'(z) = 2z ${b < 0 ? '-' : '+'} ${2 * Math.abs(b)}$, which is $${2 * q}i$ at the upper pole: keep the 2.` }]),
          hints: [t`Complete the square: $(x ${b < 0 ? '-' : '+'} ${Math.abs(b)})^2 + ${q * q}$. The poles are $${-b} \pm ${qi}$; the upper one is $${-b} + ${qi}$.`, t`$\operatorname{Res} = \dfrac{1}{h'(a)}$ with $h' = 2z ${b < 0 ? '-' : '+'} ${2 * Math.abs(b)} = ${2 * q}i$ at the upper pole.`],
          teach: 'Poles off the imaginary axis are no harder: find them, keep the upper ones, add residues.',
          explain: t`$\operatorname{Res} = \frac{1}{${2 * q}i}$, so the integral is $\frac{2\pi i}{${2 * q}i} = \frac{\pi}{${q}} = ${nm(ans, 4)}$ — the same as for $1/(x^2 + ${q * q})$, as a sideways shift should leave the area alone.`,
        };
      },
    }),
    num({
      id: 'quartic', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, 3]);
        const ans = PI / (Math.SQRT2 * a);
        const f = `x^2/(x^4 + ${a ** 4})`;
        const marks = [1, 3, 5, 7].map((k) => pole(a * Math.cos((k * PI) / 4), a * Math.sin((k * PI) / 4)));
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty} \frac{x^2}{x^4 + ${a ** 4}}\,dx$. (3 significant figures.)`,
          visual: plane({ f: `z^2/(z^4 + ${a ** 4})`, contour: D(1.8 * a), marks, x: [-2.3 * a, 2.3 * a], y: [-1.5 * a, 2.2 * a] }, t`The four poles sit on the circle $|z| = ${a}$ at $45^\circ$, $135^\circ$, $225^\circ$, $315^\circ$; the D contour encloses the upper two.`),
          answer: ans, tol: { rel: 0.005 }, integrand: f, limits: ['-inf', 'inf'], vars: { x: [-5, 5] },
          errors: apart(ans, [{ value: PI / (2 * Math.SQRT2 * a), feedback: 'That is one pole’s worth. Two of the four poles lie above the axis.' }, { value: 0, feedback: 'Including the two lower poles makes the residues cancel: only the upper two are inside.' }]),
          hints: [t`The poles are $${a}e^{i\pi/4}$, $${a}e^{3i\pi/4}$ (upper) and two below. At a pole $p$: $\operatorname{Res} = \dfrac{p^2}{4p^3} = \dfrac{1}{4p}$.`, t`$\dfrac{1}{4p_1} + \dfrac{1}{4p_2} = \dfrac{1}{4\cdot${a}}\left(e^{-i\pi/4} + e^{-3i\pi/4}\right) = \dfrac{-i\sqrt2}{4\cdot${a}}$. Multiply by $2\pi i$.`],
          teach: t`For $P/Q$ at a simple pole, $\operatorname{Res} = P(p)/Q'(p)$, then simplify with the equation $p$ satisfies.`,
          explain: t`$2\pi i\cdot\dfrac{-i\sqrt2}{4\cdot${a}} = \dfrac{\pi\sqrt2}{2\cdot${a}} = \dfrac{\pi}{\sqrt2\cdot${a}} = ${nm(ans, 4)}$.`,
        };
      },
    }),
    order({
      id: 'method', difficulty: 2,
      prompt: t`Put the steps of the method in order for $\displaystyle\int_{-\infty}^{\infty}\frac{dx}{x^4 + 1}$.`,
      visual: contour({ f: '1/(z^4 + 1)', contour: D(2), marks: [1, 3, 5, 7].map((k) => pole(Math.cos((k * PI) / 4), Math.sin((k * PI) / 4))), x: [-2.6, 2.6], y: [-1.6, 2.6], n: 36, readout: ['I'] }, t`The contour for $R = 2$ and its chain: it ends at $\pi/\sqrt2 \approx 2.22$.`),
      items: [
        t`Check $\deg Q \ge \deg P + 2$ and that $Q$ has no real zeros`,
        t`Find the zeros of $z^4 + 1$ and keep the two above the axis`,
        t`Compute the residues there, $1/(4p^3)$`,
        t`Multiply their sum by $2\pi i$`,
        t`Note the arc’s share $\to 0$ (ML), so this is the real integral`,
      ],
      hints: ['First make sure the method applies at all.', 'The limit R → ∞ is what turns the closed integral into the real one, so it comes last.'],
      teach: 'Check the degrees, find the upper poles, add residues, multiply by 2πi, and let the arc vanish.',
      explain: t`The value is $\pi/\sqrt2 \approx 2.221$. The order matters only in that the check must come first: if the degrees differ by 1 the arc does not die and the closed integral is not the real one.`,
    }),
    mcq({
      id: 'all-four', difficulty: 3, kind: 'error',
      prompt: t`A student evaluates $\displaystyle\int_{-\infty}^{\infty}\frac{dx}{x^4 + 1}$: “The four poles $e^{i\pi/4}, e^{3i\pi/4}, e^{5i\pi/4}, e^{7i\pi/4}$ have residues adding up to $0$, so the integral is $2\pi i\cdot 0 = 0$.” The integrand is positive everywhere, so $0$ is impossible. What went wrong?`,
      visual: realPic({ fn: '1/(x^4 + 1)', x: [-3, 3], y: [0, 1.15], caption: t`$1/(x^4 + 1)$ is positive everywhere, so its integral cannot be $0$.` }),
      choices: [
        t`The D contour encloses only the two poles in the upper half-plane; adding the lower two is the error`,
        t`The residues were computed wrongly: they do not add to $0$`,
        t`The method needs $\deg Q \ge \deg P + 3$, so it does not apply`,
        t`A positive function can have a zero integral when its poles are complex`,
      ],
      answer: 0,
      why: {
        1: t`They do add to $0$ — that is why a circle enclosing all four gives $0$. The mistake is which poles the contour encloses.`,
        2: t`Two is enough: here $\deg Q - \deg P = 4$, more than enough.`,
        3: 'The integral of a positive function over a line is positive, whatever the poles do.',
      },
      hints: ['Draw the contour: the real line and a big upper semicircle.', 'Which poles lie inside it?'],
      teach: 'Only the poles inside the contour count — for the upper semicircle, those with positive imaginary part.',
      explain: t`Inside are $e^{i\pi/4}$ and $e^{3i\pi/4}$; their residues $-e^{i\pi/4}/4$ and $-e^{3i\pi/4}/4$ add to $-i\sqrt2/4$, and $2\pi i$ times that is $\pi/\sqrt2 \approx 2.221$. Enclosing all four would need a contour that also wraps the lower half-plane — a full circle, whose integral really is $0$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-x2', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [1, 3], [2, 3], [0.5, 2], [3, 4]]);
        const ans = PI / (a + b);
        const f = `x^2/((x^2 + ${a * a})*(x^2 + ${b * b}))`;
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty} \frac{x^2\,dx}{(x^2 + ${nm(a * a, 3)})(x^2 + ${nm(b * b, 3)})}$. (3 significant figures.)`,
          visual: realPic({ fn: f, x: [-4 * b, 4 * b], y: [0, 1.2 / ((a + b) ** 2)], caption: 'The integrand: zero at the origin, two humps, and tails falling like 1/x².' }),
          answer: ans, tol: { rel: 0.005 }, integrand: f, limits: ['-inf', 'inf'], vars: { x: [-5, 5] },
          errors: apart(ans, [{ value: PI / (a * b * (a + b)), feedback: t`That is $\int dx/((x^2 + a^2)(x^2 + b^2))$: the $z^2$ on top changes each residue.` }, { value: -PI * a / (b * b - a * a), feedback: 'Include the residue at the second upper pole as well.' }, { value: PI * b / (b * b - a * a), feedback: 'Include the residue at the first upper pole as well.' }]),
          hints: [t`Upper poles $${nm(a, 3)}i$, $${nm(b, 3)}i$. At $ai$: $\operatorname{Res} = \dfrac{(ai)^2}{2ai\,(b^2 - a^2)} = \dfrac{-a^2}{2ai(b^2 - a^2)}$.`, t`Adding both residues gives $\dfrac{1}{2i(a + b)}$.`],
          teach: 'The same recipe works with any numerator of low enough degree: P(a)/Q′(a) at each upper simple pole.',
          explain: t`The residues add to $\dfrac{1}{2i}\cdot\dfrac{b - a}{b^2 - a^2} = \dfrac{1}{2i(a + b)}$, so the integral is $\dfrac{\pi}{a + b} = \dfrac{\pi}{${nm(a + b, 3)}} = ${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-double-x2', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, 3, 0.5, 4]);
        const ans = PI / (2 * a);
        const f = `x^2/(x^2 + ${a * a})^2`;
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty} \frac{x^2\,dx}{(x^2 + ${nm(a * a, 3)})^2}$. (3 significant figures.)`,
          visual: plane({ f: `z^2/(z^2 + ${a * a})^2`, contour: D(1.8 * a), marks: pm(a), x: [-2.2 * a, 2.2 * a], y: [-1.5 * a, 2.2 * a] }, t`Double poles at $\pm${nm(a, 3)}i$; the D contour encloses the upper one.`),
          answer: ans, tol: { rel: 0.005 }, integrand: f, limits: ['-inf', 'inf'], vars: { x: [-5, 5] },
          errors: apart(ans, [{ value: PI / (2 * a ** 3), feedback: t`That is $\int dx/(x^2 + a^2)^2$; the $z^2$ on top must be differentiated too.` }, { value: PI / a, feedback: t`Differentiate $z^2/(z + ai)^2$ with the quotient rule: two terms, not one.` }]),
          hints: [t`Double pole at $ai$: $\operatorname{Res} = \dfrac{d}{dz}\dfrac{z^2}{(z + ai)^2}\Big|_{z = ai}$.`, t`The derivative is $\dfrac{2z(z + ai) - 2z^2}{(z + ai)^3} = \dfrac{2aiz}{(z + ai)^3}$; at $z = ai$ that is $\dfrac{-2a^2}{-8a^3 i} = \dfrac{1}{4ai}$.`],
          teach: 'At a double pole, the residue is the derivative of (z − a)²f evaluated at a.',
          explain: t`$\operatorname{Res} = \frac{1}{4ai}$, so the integral is $\frac{2\pi i}{4ai} = \frac{\pi}{2a} = ${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-miles', difficulty: 3, transfer: true,
      gen(r) {
        const z = r.pick([0.02, 0.03, 0.05, 0.08, 0.1]);   // the key is checked by quadrature in the course’s check script (too sharp a peak for the content test’s)
        const ans = PI / (2 * z), Q = 1 / (2 * z);
        const f = `1/((1 - x^2)^2 + ${+(4 * z * z).toFixed(6)}*x^2)`;
        return {
          prompt: t`During launch, a satellite’s instrument panel rides on a mode of the structure with damping ratio $\zeta = ${z}$ (quality factor $Q = 1/2\zeta = ${nm(Q, 3)}$). Shaken by random vibration with a flat spectrum, its mean-square response is proportional to $$I = \int_{-\infty}^{\infty} \frac{du}{(1 - u^2)^2 + (2\zeta u)^2},$$ where $u = \omega/\omega_n$ is the forcing frequency over the natural one. Evaluate $I$. (3 significant figures.)`,
          visual: realPic({ fn: f, x: [-2.5, 2.5], y: [0, 1.1 * Q * Q], xlabel: 'u = ω/ωₙ', caption: t`The squared gain $|H|^2$ of the mode: two resonant peaks of height $Q^2$ and width about $2\zeta$. The shaded area is $I$.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: PI / z, feedback: 'The four poles are ±√(1 − ζ²) ± iζ; only the two above the axis count, and each contributes half of the total.' }, { value: Q * Q, feedback: t`$Q^2$ is the peak height; the area is height times width, roughly $Q^2\cdot\zeta\pi$.` }]),
          hints: [t`The denominator is $|1 - u^2 + 2i\zeta u|^2$; its zeros are $u = \pm\sqrt{1 - \zeta^2} \pm i\zeta$. The upper two are $\pm\sqrt{1 - \zeta^2} + i\zeta$.`, t`Residue at a simple pole $p$ of $1/Q(u)$ is $1/Q'(p)$. The two upper residues add to $\dfrac{1}{4i\zeta}$.`, t`So $I = 2\pi i\cdot\dfrac{1}{4i\zeta} = \dfrac{\pi}{2\zeta}$.`],
          teach: t`The area under a resonance’s squared gain is $\pi/2\zeta = \pi Q$: the mean-square response grows in proportion to $Q$, the rms response like $\sqrt Q$.`,
          explain: t`$I = \pi/2\zeta = ${nm(ans, 4)}$, i.e. $\pi Q$. That is why **Miles’ equation**, the launch-vibration engineer’s rule for the rms acceleration of a mode, $$a_{\text{rms}} = \sqrt{\tfrac{\pi}{2} f_n\,Q\cdot\text{ASD}},$$ (with $f_n$ the natural frequency and ASD the input’s acceleration spectral density) carries a $\sqrt Q$: halving the damping raises the rms response by $\sqrt2$, not by 2. (The peak of $|H|^2$ is $Q^2$, but its width shrinks like $1/Q$.) The flat spectrum is an idealisation of real launch environments; real structures have many modes.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), §§85–86 (improper integrals by residues)', url: 'https://openlibrary.org/isbn/9780073383170' },
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 9', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Miles, “On structural fatigue under random loading”, J. Aeronautical Sciences 21, 753 (1954)', url: 'https://scholar.google.com/scholar?q=Miles+%22On+structural+fatigue+under+random+loading%22' },
  ],
});
