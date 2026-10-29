// Laurent series: on an annulus r₁ < |z − a| < r₂ where f is analytic, f is
// a sum of positive AND negative powers of (z − a), with every coefficient a
// contour integral round any circle in the annulus. One function has
// different Laurent series in different annuli: 1/(z(z − 1)) has one series
// on 0 < |z| < 1 and another on |z| > 1. The coefficient a₋₁ is the one that
// survives a lap — next lesson's residue. Applied: the z-transform of a
// digital filter is a Laurent series whose coefficients are its impulse
// response.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { num as nm, apart } from './_cx.js';
import { contour, laurent, circle } from './_cx2.js';

const t = String.raw;
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const p01 = [{ x: 0, y: 0, label: '0', kind: 'pole' }, { x: 1, y: 0, label: '1', kind: 'pole' }];
const annuli = (b, la = 'P', lb = 'Q') => [{ c: [0, 0], r0: 0, r1: b, color: 'teal', label: la }, { c: [0, 0], r0: b, r1: 40, color: 'gold', label: lb }];

export default lesson({
  id: 'st-d.D7.2',
  title: 'Laurent series',
  minutes: 14, difficulty: 3,
  intro: t`A Taylor series needs $f$ analytic on a whole disc. Near a singularity there is no such disc — but there may be a **ring** (annulus) round it where $f$ is analytic. There $f$ has a **Laurent series**, with negative powers as well as positive ones:

$$f(z) = \sum_{n=-\infty}^{\infty} a_n (z - a)^n, \qquad a_n = \frac{1}{2\pi i}\oint_{|z - a| = r} \frac{f(z)}{(z - a)^{n + 1}}\,dz$$

for any circle of radius $r$ inside the annulus $r_1 < |z - a| < r_2$. The ring matters: **one function has a different Laurent series in each annulus** it is analytic in, because the coefficient integrals change when the circle crosses a singularity. In practice you rarely integrate: you build the series from the geometric series $\frac{1}{1 - w} = \sum w^k$ (valid for $|w| < 1$), choosing $w$ so that $|w| < 1$ holds in the annulus you want.`,
  symbols: [
    { tex: 'a', text: 'the centre of the annulus' },
    { tex: t`r_1 < |z - a| < r_2`, text: t`the annulus where $f$ is analytic (with $r_1 = 0$ a punctured disc, $r_2 = \infty$ the outside of a circle)` },
    { tex: 'a_n', text: t`the $n$-th Laurent coefficient, for every whole number $n$, negative ones included` },
    { tex: t`a_{-1}`, text: t`the coefficient of $(z - a)^{-1}$: the only term that survives a lap round $a$ (the **residue**, next lessons)` },
  ],
  why: t`Laurent series classify singularities and give residues, and they appear as multipole expansions far from a source and as the z-transform of every digital filter in a flight computer.`,
  visual: {
    type: 'cx2-contour',
    title: 'One function, two series',
    lead: t`$f(z) = \dfrac{1}{z(z - 1)}$ has poles at $0$ and $1$, so about $0$ it has two annuli: $P$ ($0 < |z| < 1$, teal) and $Q$ ($|z| > 1$, gold). The circle of radius $r$ computes the coefficient $a_n$: the chain on the right is $\frac{1}{2\pi i}\oint f(z)\,z^{-n-1}\,dz$. Choose $n$, then move $r$ across $1$.`,
    tasks: [
      t`With $r$ in $P$, try $n = -1, 0, 1, 2$: every coefficient is $-1$ — the series $-\frac1z - 1 - z - z^2 - \cdots$. And $n = -2$ gives $0$.`,
      t`Now take $r$ into $Q$: the same $n$ give $0$, and $n = -2, -3, -4$ give $1$ — the series $\frac{1}{z^2} + \frac{1}{z^3} + \cdots$.`,
      t`Set $r = 1$ exactly: the circle runs through the pole and no coefficient exists. The two series meet at the singularity that separates them.`,
    ],
    params: {
      f: 'z^(-k - 1)/(z*(z - 1))', contour: { kind: 'circle', c: [0, 0], r: 'r' },
      sliders: [
        { key: 'k', label: 'index $n$', min: -4, max: 3, step: 1, value: -1, explain: t`Which coefficient $a_n$ (the power of $z$) to compute.` },
        { key: 'r', label: 'radius $r$', min: 0.3, max: 2, step: 0.05, value: 0.6, explain: 'The radius of the circle the coefficient is computed on.' },
      ],
      marks: p01, rings: annuli(1), x: [-2.2, 2.2], y: [-2.2, 2.2], scaleBy: 'twopii', n: 24, readout: ['I'], iLabel: '$a_n$',
    },
    caption: t`The coefficient is computed by quadrature on the circle; the arrows on the left are drawn larger or smaller than true, all by one factor. The gold annulus $Q$ continues outside the window.`,
  },
  example: {
    prompt: t`Find the Laurent series of $f(z) = \dfrac{1}{z(z - 1)}$ about $0$ in (a) $0 < |z| < 1$ and (b) $|z| > 1$.`,
    visual: contour({ f: '1/(z*(z - 1))', contour: null, panel: 'none', arrowsOn: false, view: 'colour', marks: p01, rings: annuli(1), x: [-2.2, 2.2], y: [-2.2, 2.2] }, t`The two annuli about $0$, over the colour picture of $f$: inside the unit circle (teal) and outside it (gold).`),
    steps: [
      { label: 'Inner annulus', text: t`For $|z| < 1$ expand in powers of $z$: $\dfrac{1}{z - 1} = -\dfrac{1}{1 - z} = -(1 + z + z^2 + \cdots)$, valid as $|z| < 1$.` },
      { label: 'Divide by z', text: t`$f(z) = -\dfrac1z - 1 - z - z^2 - \cdots$ on $0 < |z| < 1$. One negative power: $a_{-1} = -1$.` },
      { label: 'Outer annulus', text: t`For $|z| > 1$ the geometric series in $z$ diverges; expand in $1/z$ instead: $\dfrac{1}{z - 1} = \dfrac1z\cdot\dfrac{1}{1 - 1/z} = \dfrac1z\left(1 + \dfrac1z + \dfrac1{z^2} + \cdots\right)$, valid as $|1/z| < 1$.` },
      { label: 'Divide by z', text: t`$f(z) = \dfrac{1}{z^2} + \dfrac{1}{z^3} + \dfrac{1}{z^4} + \cdots$ on $|z| > 1$. Infinitely many negative powers — and $a_{-1} = 0$.` },
      { label: 'Check', text: t`On $|z| = 2$: $\oint f\,dz = 2\pi i\,a_{-1} = 0$ by the outer series, and indeed both poles are inside, with contributions $-1$ and $+1$ that cancel (D6.1’s partial fractions).` },
    ],
    answer: t`(a) $-\frac1z - 1 - z - z^2 - \cdots$; (b) $\frac{1}{z^2} + \frac{1}{z^3} + \cdots$ — different series for different annuli.`,
  },
  practice: [
    num({
      id: 'exp-inv', difficulty: 2,
      gen(r) {
        const c = r.pick([1, 2, 3]), k = r.pick([2, 3, 4]);
        const ans = laurent(`exp(${c}/z)`, -k, [0, 0], 1)[0];
        return {
          prompt: t`$e^{${c === 1 ? '' : c}/z}$ has a Laurent series about $0$ valid for $|z| > 0$. Find the coefficient of $z^{-${k}}$. (3 significant figures.)`,
          visual: contour({ f: `exp(${c}/z)`, contour: null, panel: 'none', view: 'colour', arrowsOn: false, marks: [{ x: 0, y: 0, label: '0', kind: 'pole' }], x: [-1.6, 1.6], y: [-1.2, 1.2] }, t`The colour picture of $e^{${c}/z}$ near $0$: every colour, at every brightness, crowds into the origin.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: 1 / fact(k), feedback: t`Substitute $w = ${c}/z$: the $w^${k}/${k}!$ term carries $${c}^${k}$.` }, { value: c ** k, feedback: t`Divide by $${k}! = ${fact(k)}$.` }].filter((e) => c !== 1 || e.value !== ans)),
          hints: [t`$e^w = \sum_k w^k/k!$ for every $w$; put $w = ${c}/z$.`, t`The $z^{-${k}}$ term is $\dfrac{(${c}/z)^{${k}}}{${k}!}$.`],
          teach: t`Substituting into a known series gives a Laurent series directly; $e^{c/z} = \sum c^k z^{-k}/k!$ on $|z| > 0$.`,
          explain: t`$\dfrac{${c}^{${k}}}{${k}!} = ${nm(ans, 4)}$. Infinitely many negative powers: an essential singularity, as the next lesson explains.`,
        };
      },
    }),
    mcq({
      id: 'which-series', difficulty: 2,
      prompt: t`Which series equals $\dfrac{1}{z - 2}$ on the region $|z| > 2$?`,
      visual: contour({ f: '1/(z - 2)', contour: null, panel: 'none', arrowsOn: false, marks: [{ x: 2, y: 0, label: '2', kind: 'pole' }], rings: annuli(2, '', '|z| > 2'), x: [-3.5, 3.5], y: [-3, 3] }, t`The region $|z| > 2$ (gold) and the pole at $2$ on its inner edge.`),
      choices: [t`$\displaystyle\frac1z\sum_{k=0}^\infty \left(\frac2z\right)^k$`, t`$\displaystyle-\frac12\sum_{k=0}^\infty \left(\frac z2\right)^k$`, t`$\displaystyle\sum_{k=0}^\infty 2^k z^k$`, t`$\displaystyle\frac1z\sum_{k=0}^\infty \left(\frac z2\right)^k$`],
      answer: 0,
      why: {
        1: t`That is the Taylor series, valid for $|z| < 2$; for $|z| > 2$ its ratio $z/2$ is bigger than 1 and it diverges.`,
        2: t`That is the expansion of $1/(1 - 2z)$, valid only for $|z| < \tfrac12$.`,
        3: t`Its ratio $z/2$ exceeds 1 in the region, so it diverges there (and it is not equal to $1/(z - 2)$ anywhere).`,
      },
      hints: [t`For $|z| > 2$ you need a geometric series in a ratio smaller than 1 there: $2/z$.`, t`$\frac{1}{z - 2} = \frac1z\cdot\frac{1}{1 - 2/z}$.`],
      teach: t`Outside a pole, factor out $z$ and expand in powers of $1/z$; inside, expand in powers of $z$.`,
      explain: t`$\frac{1}{z - 2} = \frac1z\cdot\frac{1}{1 - 2/z} = \frac1z + \frac{2}{z^2} + \frac{4}{z^3} + \cdots$, which converges because $|2/z| < 1$.`,
    }),
    num({
      id: 'two-regions', difficulty: 3,
      gen(r) {
        const b = r.pick([2, 3]), region = r.pick(['A', 'B']);
        const n = region === 'A' ? r.pick([-1, 0, 1]) : r.pick([-2, -3, -4]);
        const ans = laurent(`1/(z*(z - ${b}))`, n, [0, 0], region === 'A' ? b / 2 : 2 * b)[0];
        return {
          prompt: t`Find the coefficient $a_{${n}}$ of $z^{${n}}$ in the Laurent series of $\dfrac{1}{z(z - ${b})}$ about $0$ valid on ${region === 'A' ? t`$0 < |z| < ${b}$` : t`$|z| > ${b}$`}. (3 significant figures.)`,
          visual: contour({ f: `1/(z*(z - ${b}))`, contour: null, panel: 'none', arrowsOn: false, marks: [{ x: 0, y: 0, label: '0', kind: 'pole' }, { x: b, y: 0, label: String(b), kind: 'pole' }], rings: annuli(b), x: [-b - 1.5, b + 1.5], y: [-b - 1, b + 1] }, t`The annuli about $0$: $P$ inside $|z| = ${b}$ (teal) and $Q$ outside (gold).`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: -ans, feedback: t`Check the sign: $\frac{1}{z - ${b}} = -\frac{1}{${b}}\cdot\frac{1}{1 - z/${b}}$ inside, but $+\frac1z\cdot\frac{1}{1 - ${b}/z}$ outside.` }]),
          hints: [region === 'A' ? t`For $|z| < ${b}$: $\dfrac{1}{z - ${b}} = -\dfrac{1}{${b}}\sum_k \left(\dfrac{z}{${b}}\right)^k$.` : t`For $|z| > ${b}$: $\dfrac{1}{z - ${b}} = \dfrac1z\sum_k \left(\dfrac{${b}}{z}\right)^k$.`, region === 'A' ? t`Dividing by $z$: $f = -\sum_k \dfrac{z^{k - 1}}{${b}^{k + 1}}$, so $a_n = -1/${b}^{n + 2}$ for $n \ge -1$.` : t`Dividing by $z$: $f = \sum_k ${b}^k z^{-k - 2}$, so $a_n = ${b}^{-n - 2}$ for $n \le -2$.`],
          teach: 'Pick the geometric series that converges in the annulus you are asked about: powers of z/b inside, of b/z outside.',
          explain: t`$a_{${n}} = ${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'sin-power', difficulty: 2,
      gen(r) {
        const m = r.pick([1, 2, 3]);
        const ans = laurent(`sin(z)/z^${2 * m}`, -1, [0, 0], 1)[0];
        return {
          prompt: t`Find the coefficient of $z^{-1}$ in the Laurent series of $\dfrac{\sin z}{z^{${2 * m}}}$ about $0$ (on $0 < |z| < \infty$). (3 significant figures.)`,
          visual: contour({ f: `sin(z)/z^${2 * m}`, contour: null, panel: 'none', view: 'colour', arrowsOn: false, marks: [{ x: 0, y: 0, label: '0', kind: 'pole' }], x: [-3, 3], y: [-2.2, 2.2] }, t`The colour picture of $\sin z / z^{${2 * m}}$: one singular point, at $0$.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: -ans, feedback: t`The signs in $\sin z = z - \frac{z^3}{3!} + \frac{z^5}{5!} - \cdots$ alternate.` }]),
          hints: [t`$\sin z = z - \dfrac{z^3}{3!} + \dfrac{z^5}{5!} - \cdots$; divide every term by $z^{${2 * m}}$.`, t`The $z^{-1}$ term comes from $z^{${2 * m - 1}}$ in $\sin z$.`],
          teach: 'Dividing a Taylor series by a power of z shifts every power down: that is a Laurent series at once.',
          explain: t`The $z^{${2 * m - 1}}$ term of $\sin z$ has coefficient $\frac{(-1)^{${m - 1}}}{${2 * m - 1}!} = ${nm(ans, 4)}$; divided by $z^{${2 * m}}$ it becomes the $z^{-1}$ term.`,
        };
      },
    }),
    mcq({
      id: 'not-essential', difficulty: 3, kind: 'error',
      prompt: t`A student reads the series $\dfrac{1}{z(z - 1)} = \dfrac{1}{z^2} + \dfrac{1}{z^3} + \dfrac{1}{z^4} + \cdots$ (valid for $|z| > 1$) and concludes: “infinitely many negative powers, so $0$ is an essential singularity.” What is wrong?`,
      visual: contour({ f: '1/(z*(z - 1))', contour: null, panel: 'none', view: 'colour', arrowsOn: false, marks: p01, rings: annuli(1), x: [-2.2, 2.2], y: [-2.2, 2.2] }, t`The colour picture of $1/(z(z - 1))$: near $0$ the colours circle once, as at a simple pole.`),
      choices: [
        t`The type of the singularity at $0$ is read from the series on a punctured disc $0 < |z| < r$ round it; there the series is $-\frac1z - 1 - z - \cdots$, a simple pole`,
        t`Nothing: $0$ is an essential singularity`,
        t`A Laurent series can only have finitely many negative powers`,
        t`The series is wrong: $\frac{1}{z(z - 1)}$ has no Laurent series for $|z| > 1$`,
      ],
      answer: 0,
      why: {
        1: t`Near $0$, $z(z - 1) \approx -z$, so $f \approx -1/z$: a simple pole, nothing wild.`,
        2: t`$e^{1/z}$ has infinitely many on $|z| > 0$; there is no such rule.`,
        3: t`The series is correct and valid for $|z| > 1$, as the worked example shows.`,
      },
      hints: [t`Which annulus touches the point $0$?`, t`The series valid for $|z| > 1$ describes $f$ far from $0$, not near it.`],
      teach: t`To classify the singularity at $a$, use the Laurent series on the punctured disc $0 < |z - a| < r$ — not one valid on some other annulus.`,
      explain: t`The outer series knows about both poles at once; it says nothing special about $0$. On $0 < |z| < 1$ the series has a single negative power, $-1/z$: a simple pole.`,
    }),
    order({
      id: 'outer-steps', difficulty: 2,
      prompt: t`Order the steps to find the Laurent series of $\dfrac{1}{z - 3}$ valid for $|z| > 3$.`,
      visual: contour({ f: '1/(z - 3)', contour: circle(4), panel: 'none', arrowsOn: false, marks: [{ x: 3, y: 0, label: '3', kind: 'pole' }], rings: annuli(3, '', '|z| > 3'), x: [-5, 5], y: [-4.5, 4.5] }, t`The region $|z| > 3$ and a circle in it (violet).`),
      items: [
        t`Factor out $z$: $\frac{1}{z - 3} = \frac1z\cdot\frac{1}{1 - 3/z}$`,
        t`Note $|3/z| < 1$ in the region`,
        t`Expand $\frac{1}{1 - 3/z} = \sum_k (3/z)^k$`,
        t`Multiply by $\frac1z$: $\sum_k 3^k z^{-k-1}$`,
      ],
      hints: [t`You need a ratio whose size is below 1 where $|z| > 3$.`, t`That ratio is $3/z$.`],
      teach: t`Outside the singularity, write the function in terms of $3/z$, which is small there.`,
      explain: t`$\frac{1}{z - 3} = \frac1z + \frac{3}{z^2} + \frac{9}{z^3} + \cdots$ for $|z| > 3$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-annulus', difficulty: 3,
      gen(r) {
        const n = r.pick([-3, -2, -1, 0, 1, 2]);
        const ans = laurent('1/((z - 1)*(z - 2))', n, [0, 0], 1.5)[0];
        return {
          prompt: t`Find the coefficient $a_{${n}}$ in the Laurent series of $\dfrac{1}{(z - 1)(z - 2)}$ about $0$ valid on the annulus $1 < |z| < 2$. (3 significant figures.)`,
          visual: contour({ f: '1/((z - 1)*(z - 2))', contour: null, panel: 'none', arrowsOn: false, marks: [{ x: 1, y: 0, label: '1', kind: 'pole' }, { x: 2, y: 0, label: '2', kind: 'pole' }], rings: [{ c: [0, 0], r0: 1, r1: 2, color: 'teal', label: '1 < |z| < 2' }], x: [-3, 3], y: [-2.5, 2.5] }, t`The annulus between the two poles.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: -ans, feedback: t`Partial fractions: $\frac{1}{(z - 1)(z - 2)} = \frac{1}{z - 2} - \frac{1}{z - 1}$; watch both signs.` }]),
          hints: [t`$\dfrac{1}{(z - 1)(z - 2)} = \dfrac{1}{z - 2} - \dfrac{1}{z - 1}$.`, t`In the annulus, $|z| < 2$ but $|z| > 1$: expand $\frac{1}{z - 2} = -\frac12\sum (z/2)^k$ and $\frac{1}{z - 1} = \frac1z\sum (1/z)^k$.`],
          teach: 'In an annulus between two poles, expand the inner pole’s term in 1/z and the outer pole’s term in z.',
          explain: t`The series is $\cdots - \frac{1}{z^2} - \frac1z - \frac12 - \frac z4 - \frac{z^2}{8} - \cdots$: $a_n = -1$ for $n \le -1$ and $a_n = -1/2^{n + 1}$ for $n \ge 0$. So $a_{${n}} = ${nm(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-how-many', difficulty: 2,
      prompt: t`$f(z) = \dfrac{1}{(z - 1)(z - 3)}$. How many different Laurent series does $f$ have about the centre $0$?`,
      visual: contour({ f: '1/((z - 1)*(z - 3))', contour: null, panel: 'none', arrowsOn: false, marks: [{ x: 1, y: 0, label: '1', kind: 'pole' }, { x: 3, y: 0, label: '3', kind: 'pole' }], circles: [{ r: 1 }, { r: 3 }], x: [-4, 4], y: [-3.5, 3.5] }, t`The poles at $1$ and $3$, with the circles through them about $0$ (dashed).`),
      choices: ['3', '1', '2', 'Infinitely many'],
      answer: 0,
      why: {
        1: t`A single series cannot work on both sides of a pole: crossing $|z| = 1$ changes the coefficients.`,
        2: t`The disc $|z| < 1$ counts too: there the Laurent series is a Taylor series.`,
        3: t`Only circles through singularities separate regions; there are two such circles.`,
      },
      hints: [t`The regions are separated by the circles $|z| = 1$ and $|z| = 3$.`, t`Count: inside the first, between the two, outside the second.`],
      teach: 'About a centre, each annulus bounded by consecutive singularities carries its own Laurent series.',
      explain: t`$|z| < 1$ (a Taylor series), $1 < |z| < 3$, and $|z| > 3$: three series, each valid only in its own region.`,
    }),
    num({
      id: 'cp-ztransform', difficulty: 3, transfer: true,
      gen(r) {
        const [p, q] = r.pick([[0.9, 0.5], [0.8, 0.4], [0.9, -0.5], [0.7, 0.2]]), n = r.pick([2, 3, 5]);
        const ans = laurent(`z^2/((z - ${p})*(z - (${q})))`, -n, [0, 0], 1.2)[0];
        return {
          prompt: t`A flight computer smooths a gyro signal with a digital filter whose **z-transform** is $H(z) = \dfrac{z^2}{(z - ${p})(z ${q < 0 ? '+' : '-'} ${Math.abs(q)})}$. Its impulse response $h[0], h[1], h[2], \dots$ — the output, one sample at a time, after a single unit kick — is the sequence of Laurent coefficients of $H$ on $|z| > ${p}$: $H(z) = \sum_{n \ge 0} h[n]\,z^{-n}$. Find $h[${n}]$. (3 significant figures.)`,
          visual: contour({ f: `z^2/((z - ${p})*(z - (${q})))`, contour: circle(1.2), panel: 'none', arrowsOn: false, marks: [{ x: p, y: 0, label: String(p), kind: 'pole' }, { x: q, y: 0, label: String(q).replace('-', '−'), kind: 'pole' }], rings: [{ c: [0, 0], r0: p, r1: 40, color: 'gold', label: '|z| > ' + p }], circles: [{ r: 1 }], x: [-1.8, 1.8], y: [-1.5, 1.5], zname: 'z-plane' }, t`The filter’s poles, the region $|z| > ${p}$ (gold) where its Laurent series converges, the unit circle (dashed) and a circle on which the coefficients could be computed (violet).`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: p ** n, feedback: t`That is the response of the single pole at $${p}$; the second pole contributes too.` }, { value: p ** n + q ** n, feedback: t`Close, but the partial-fraction weights are not 1: $h[n] = \frac{${p}^{n+1} - (${q})^{n+1}}{${p} - (${q})}$.` }]),
          hints: [t`Write $H(z) = \dfrac{1}{(1 - ${p}z^{-1})(1 - (${q})z^{-1})}$ and expand each factor as a geometric series in $z^{-1}$ (valid for $|z| > ${p}$).`, t`Multiplying the two series: $h[n] = \sum_{k=0}^{n} ${p}^k\,(${q})^{n - k} = \dfrac{${p}^{n+1} - (${q})^{n+1}}{${p} - (${q})}$.`],
          teach: t`A causal digital filter’s impulse response is the Laurent series of its z-transform on the region outside its outermost pole.`,
          explain: t`$h[${n}] = \frac{${p}^{${n + 1}} - (${q})^{${n + 1}}}{${p} - (${q})} = ${nm(ans, 4)}$. Both poles lie inside the unit circle, so $h[n] \to 0$: the filter is stable. (Engineers write $z^{-n}$ for a delay of $n$ samples; the region $|z| > ${p}$ is what makes the response causal — the series on the inner annuli would describe responses that start before the kick.)`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), §§65–68 (Laurent series)', url: 'https://openlibrary.org/isbn/9780073383170' },
    { label: 'Oppenheim & Schafer, Discrete-Time Signal Processing (3rd ed.), ch. 3 (the z-transform and its region of convergence)', url: 'https://openlibrary.org/search?q=Oppenheim+Schafer+Discrete-Time+Signal+Processing' },
  ],
});
