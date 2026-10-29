// The Cauchy integral formula: an analytic function's value at a is fixed by
// its values on any loop round a — f(a) = (1/2πi)∮ f(z)/(z − a) dz. On a
// circle about a this is literally the average of f round the circle (the
// chain of arrows, divided by 2πi, is N copies of f(zₖ)/N). Differentiating
// under the integral gives every derivative, f⁽ⁿ⁾(a) = n!/(2πi)∮ f/(z − a)ⁿ⁺¹,
// so analytic functions are infinitely differentiable. The real part gives
// the mean-value property of harmonic functions (steady temperatures).
import { lesson, mcq, num } from '../../src/core/content.js';
import { cTeX, num as nm, argand, apart } from './_cx.js';
import { C, contour, integral, circle } from './_cx2.js';

const t = String.raw;
const PI = Math.PI;
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const aMark = [{ x: 'ax', y: 'ay', label: 'a', kind: 'point' }];

export default lesson({
  id: 'st-d.D6.2',
  title: 'The Cauchy integral formula',
  minutes: 14, difficulty: 3,
  intro: t`Cauchy’s theorem says loops see only singularities. Now put one there on purpose: divide an analytic $f$ by $z - a$. The only singularity inside is at $a$, and what it contributes is $f(a)$ itself:

$$f(a) = \frac{1}{2\pi i}\oint_\gamma \frac{f(z)}{z - a}\,dz$$

On a circle $z = a + re^{i\theta}$, $dz/(z - a) = i\,d\theta$, and the formula reads $f(a) = \frac{1}{2\pi}\int_0^{2\pi} f(a + re^{i\theta})\,d\theta$: **the value at the centre is the average of the values round the circle**. The values on the boundary fix everything inside. Differentiate under the integral sign and you get every derivative, $f^{(n)}(a) = \dfrac{n!}{2\pi i}\oint_\gamma \dfrac{f(z)}{(z - a)^{n + 1}}\,dz$ — so an analytic function is automatically infinitely differentiable.`,
  symbols: [
    { tex: 'f', text: t`a function analytic on and inside $\gamma$` },
    { tex: 'a', text: t`a point **inside** $\gamma$, where we want the value` },
    { tex: t`\gamma`, text: t`a simple closed contour round $a$, anticlockwise` },
    { tex: t`\frac{1}{2\pi i}`, text: t`the normalisation: one lap of $\oint dz/(z - a)$ gives $2\pi i$` },
    { tex: t`f^{(n)}(a)`, text: t`the $n$-th derivative of $f$ at $a$; $n! = 1\cdot2\cdots n$` },
  ],
  why: t`The formula turns local questions into boundary integrals: it gives Taylor series and their radius of convergence, bounds on derivatives (Liouville), the residue theorem, and — through its real part — the mean-value property of steady temperatures and potentials.`,
  visual: {
    type: 'cx2-contour',
    title: 'The average round a circle',
    lead: t`A circle of radius $r$ about the point $a$. The integrand is $f(z)/(z - a)$, and the chain on the right is divided by $2\pi i$, so each arrow is $f(z_k)/N$: the chain adds up $N$ values of $f$ round the circle, each shrunk by $1/N$ — their average. Compare its end with $f(a)$ in the readout.`,
    tasks: [
      t`For $e^z$, change $r$: the chain changes shape but always ends at $f(a)$. Move $a$ with its sliders: the end follows.`,
      t`For $1/(z - 1.5)$, grow $r$ until the circle swallows the pole at $1.5$: the average stops being $f(a)$ — there is a second singularity inside now.`,
      t`Set $r$ small: all the values are nearly $f(a)$, and the chain is a nearly straight line of equal arrows.`,
    ],
    params: {
      fns: [
        { f: 'exp(z)/(z - ax - i*ay)', label: '$f = e^z$', marks: aMark, value: 'exp(ax + i*ay)', valueLabel: '$f(a)$' },
        { f: 'cos(2z)/(z - ax - i*ay)', label: t`$f = \cos 2z$`, marks: aMark, value: 'cos(2*(ax + i*ay))', valueLabel: '$f(a)$' },
        { f: '1/((z - 1.5)*(z - ax - i*ay))', label: '$f = 1/(z - 1.5)$', marks: [...aMark, { x: 1.5, y: 0, label: '1.5', kind: 'pole' }], value: '1/(ax + i*ay - 1.5)', valueLabel: '$f(a)$' },
      ],
      sliders: [
        { key: 'ax', label: t`$\operatorname{Re} a$`, min: -1, max: 1, step: 0.05, value: 0, explain: 'The real part of the centre a.' },
        { key: 'ay', label: t`$\operatorname{Im} a$`, min: -1, max: 1, step: 0.05, value: 0.3, explain: 'The imaginary part of the centre a.' },
        { key: 'r', label: 'radius $r$', min: 0.1, max: 2.2, step: 0.05, value: 1, explain: t`The radius of the circle round $a$.` },
      ],
      contour: { kind: 'circle', c: ['ax', 'ay'], r: 'r' }, x: [-3, 3], y: [-3, 3], n: 16, scaleBy: 'twopii', readout: ['I'],
    },
    caption: t`The arrows on the left are drawn larger than true, all by one factor; the chain is to scale, and its window rescales as you move the sliders. Nothing here is approximate except the $N$-piece sum (the gold ring is the exact integral).`,
  },
  example: {
    prompt: t`Compute $\displaystyle\oint_{|z| = 2} \frac{e^z}{z - 1}\,dz$.`,
    visual: contour({ f: 'exp(z)/(z - 1)', contour: circle(2), marks: [{ x: 1, y: 0, label: '1', kind: 'pole' }], x: [-2.6, 2.6], y: [-2.6, 2.6], n: 24, readout: ['I'] }, t`The circle $|z| = 2$ and the chain of $e^z\Delta z/(z - 1)$: it ends at $2\pi i e \approx 17.1i$.`),
    steps: [
      { label: 'Recognise', text: t`The integrand is $\dfrac{f(z)}{z - a}$ with $f(z) = e^z$ (entire) and $a = 1$.` },
      { label: 'Check inside', text: t`$|1| < 2$: the point $a$ is inside the circle, and $f$ is analytic everywhere.` },
      { label: 'Apply', text: t`$\oint \dfrac{f(z)}{z - a}\,dz = 2\pi i\,f(a) = 2\pi i\,e^1$.` },
      { label: 'Number', text: t`$2\pi e\,i \approx ${nm(2 * PI * Math.E, 4)}\,i$ — and a quadrature of the integral agrees to 12 digits.` },
      { label: 'Sense check', text: t`The circle is not centred on $a$, so the formula is no longer a plain average — but deformation lets us shrink the contour to a small circle round $a = 1$, where it is.` },
    ],
    answer: t`$2\pi i e \approx ${nm(2 * PI * Math.E, 4)}\,i$.`,
  },
  practice: [
    num({
      id: 'exp-a', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2, -1, 3]), a = r.pick([0.5, -0.5, 1, 0.25]);
        const src = `exp(${k}*z)/(z - (${a}))`;
        const ans = integral(src, circle(2))[1];
        return {
          prompt: t`Compute $\operatorname{Im}\displaystyle\oint_{|z| = 2} \frac{e^{${k === 1 ? '' : k === -1 ? '-' : k}z}}{z ${a < 0 ? '+' : '-'} ${Math.abs(a)}}\,dz$. (3 significant figures.)`,
          visual: contour({ f: src, contour: circle(2), marks: [{ x: a, y: 0, label: String(a).replace('-', '−'), kind: 'pole' }], x: [-2.6, 2.6], y: [-2.6, 2.6], panel: 'none' }, t`The circle and the one singularity of the integrand, at $${a}$. Arrows drawn larger or smaller than true.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: Math.exp(k * a), feedback: t`That is $f(a)$. The integral is $2\pi i\,f(a)$.` }, { value: 2 * PI * Math.exp(a), feedback: t`$f(z) = e^{${k}z}$, so $f(a) = e^{${k}\times${a}}$.` }]),
          hints: [t`Write it as $\oint \frac{f(z)}{z - a}\,dz$ with $f(z) = e^{${k}z}$ and $a = ${a}$.`, t`The answer is $2\pi i\,e^{${k}\times${a}}$.`],
          teach: t`$\oint \frac{f(z)}{z - a}\,dz = 2\pi i\,f(a)$ whenever $f$ is analytic inside and $a$ is enclosed.`,
          explain: t`$2\pi i\,e^{${nm(k * a, 3)}} = ${nm(ans, 4)}\,i$.`,
        };
      },
    }),
    num({
      id: 'derivative', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, 3]), fn = r.pick(['cos', 'sin']), n = fn === 'cos' ? 2 : 3, fnT = fn === 'cos' ? t`\cos` : t`\sin`;
        const src = `${fn}(${k}*z)/z^${n + 1}`;
        const ans = integral(src, circle(1))[1];
        const dTeX = fn === 'cos' ? `-${k * k === 1 ? '' : k * k}\\cos 0` : `-${k ** 3 === 1 ? '' : k ** 3}\\cos 0`;
        return {
          prompt: t`Compute $\operatorname{Im}\displaystyle\oint_{|z| = 1} \frac{${fnT}(${k === 1 ? '' : k}z)}{z^{${n + 1}}}\,dz$ with the derivative form of the formula. (3 significant figures.)`,
          visual: contour({ f: src, contour: circle(1), marks: [{ x: 0, y: 0, label: '0', kind: 'pole' }], x: [-1.5, 1.5], y: [-1.5, 1.5], panel: 'none' }, t`The unit circle and its arrows (drawn larger or smaller than true): the integrand’s only singularity is at $0$.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: ans * fact(n), feedback: t`Divide by $n!$: $\oint \frac{f}{z^{n+1}}dz = \frac{2\pi i}{n!}f^{(n)}(0)$.` }, { value: -ans, feedback: t`Check the sign of the derivative: $\frac{d^2}{dz^2}\cos kz = -k^2\cos kz$, $\frac{d^3}{dz^3}\sin kz = -k^3\cos kz$.` }]),
          hints: [t`$\oint \frac{f(z)}{z^{n + 1}}\,dz = \frac{2\pi i}{n!}f^{(n)}(0)$ with $n = ${n}$ and $f(z) = ${fnT}(${k}z)$.`, t`$f^{(${n})}(0) = ${dTeX} = -${k ** n}$.`],
          teach: t`The derivative formula: $\oint \frac{f(z)}{(z - a)^{n + 1}}\,dz = \frac{2\pi i}{n!}f^{(n)}(a)$.`,
          explain: t`$\frac{2\pi i}{${fact(n)}}\times(-${k ** n}) = ${nm(ans / PI, 4)}\pi i$: imaginary part $${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'mean-value', difficulty: 2,
      gen(r) {
        const p = r.pick([1, 2, -1]), q = r.pick([1, -1, 2]), R = r.pick([1, 2, 3]);
        let b = r.pick([3, -2, 4]);
        while (p * p - q * q + b * p === 0) b += 1;
        const ans = p * p - q * q + b * p;
        return {
          prompt: t`The function $u(x, y) = x^2 - y^2 + ${b}x$ is harmonic (it is $\operatorname{Re}(z^2 + ${b}z)$). What is its average value round the circle of radius $${R}$ centred at $(${p}, ${q})$?`,
          visual: { type: 'graph', params: { x: [p - R - 1.5, p + R + 1.5], y: [q - R - 1, q + R + 1], equal: true, xlabel: 'x', ylabel: 'y', curves: [{ param: [`${p} + ${R}*cos(t)`, `${q} + ${R}*sin(t)`], t: [0, 2 * PI], color: 'violet', width: 2.4 }], points: [{ x: p, y: q, label: 'centre', color: 'gold' }] }, caption: t`The circle over which $u$ is averaged, and its centre.` },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: apart(ans, [{ value: p * p + q * q + b * p, feedback: t`$u$ has $-y^2$, not $+y^2$.` }]),
          hints: [t`The real part of the Cauchy formula: a harmonic function’s average round a circle equals its value at the centre.`, t`So compute $u(${p}, ${q})$.`],
          teach: t`Mean-value property: the average of a harmonic function round any circle equals its value at the centre.`,
          explain: t`$u(${p}, ${q}) = ${p * p} - ${q * q} + ${b * p} = ${ans}$, whatever the radius. Take real parts of $f(a) = \frac{1}{2\pi}\int f(a + re^{i\theta})\,d\theta$ with $f = z^2 + ${b}z$.`,
        };
      },
    }),
    mcq({
      id: 'outside', difficulty: 2, kind: 'error',
      prompt: t`A student writes: “By the Cauchy integral formula, $\displaystyle\oint_{|z| = 1} \frac{e^z}{z - 2}\,dz = 2\pi i\,e^2$.” What is wrong?`,
      visual: contour({ f: 'exp(z)/(z - 2)', contour: circle(1), marks: [{ x: 2, y: 0, label: '2', kind: 'pole' }], x: [-1.6, 2.8], y: [-1.6, 1.6], n: 20, wx: [-1, 1], wy: [-1, 1] }, t`The unit circle, the singular point $2$ outside it, and the chain, which closes up.`),
      choices: [
        t`The point $2$ is outside the circle, so the integrand is analytic inside and the integral is $0$`,
        t`It should be $2\pi i\,e^{1}$, using the radius`,
        t`It should be $e^2$: the formula has no $2\pi i$`,
        t`The formula needs $f$ to be a polynomial`,
      ],
      answer: 0,
      why: {
        1: t`The radius plays no part: the formula gives $2\pi i f(a)$ for a point $a$ **inside**.`,
        2: t`$\oint \frac{f}{z - a}\,dz = 2\pi i f(a)$; it is $f(a)$ itself that carries the $\frac{1}{2\pi i}$.`,
        3: t`Any $f$ analytic on and inside the contour will do — $e^z$ included.`,
      },
      hints: [t`Where is the point $a = 2$ relative to the circle $|z| = 1$?`, t`If $a$ is outside, which theorem applies to $\frac{e^z}{z - 2}$ inside the circle?`],
      teach: t`The formula needs $a$ inside; if it is outside, $f(z)/(z - a)$ is analytic inside and Cauchy’s theorem gives $0$.`,
      explain: t`$\frac{e^z}{z - 2}$ is analytic on and inside $|z| = 1$, so the integral is $0$ by Cauchy’s theorem. The chain in the picture closes up.`,
    }),
    {
      type: 'point', id: 'cube', difficulty: 2,
      gen(r) {
        const a = r.pick([[1, 0.5], [0.5, 1], [-1, 0.5], [1, -0.5], [0.5, -1]]);
        const ans = C.div(integral(`z^3/(z - (${a[0]}) - (${a[1]})*i)`, circle(2)), [0, 2 * PI]);
        return {
          prompt: t`Find $\dfrac{1}{2\pi i}\displaystyle\oint_{|z| = 2} \frac{z^3}{z - a}\,dz$ for $a = ${cTeX(a)}$, and drag the point to it.`,
          visual: argand({ view: 2.6, circles: [{ r: 2, color: 'violet', dash: [] }], pts: [{ z: a, label: 'a', color: 'gold' }], extra: { drag: [{ key: 'p', x: 2.5, y: -2.3, snap: 0.125 }] }, caption: t`The circle $|z| = 2$ and the point $a$. The draggable point is your answer (snaps to eighths).` }),
          answer: { x: ans[0], y: ans[1] }, tol: { x: 0.15, y: 0.15 },
          instruction: 'Drag the point to the value, then check.',
          hints: [t`The formula gives $f(a)$ with $f(z) = z^3$.`, t`$a^2 = ${cTeX(C.mul(a, a))}$, so $a^3 = (${cTeX(C.mul(a, a))})(${cTeX(a)})$.`],
          teach: t`$\frac{1}{2\pi i}\oint \frac{f(z)}{z - a}\,dz$ is just $f(a)$ — here $a^3$.`,
          explain: t`$a^3 = ${cTeX(ans)}$. (A quadrature of the integral round the circle agrees.)`,
        };
      },
    },
    num({
      id: 'two-points', difficulty: 3,
      gen(r) {
        const b = r.pick([1, 2, -1]);
        const src = `exp(z)/(z*(z - (${b})))`;
        const ans = integral(src, circle(3))[1];
        return {
          prompt: t`Compute $\operatorname{Im}\displaystyle\oint_{|z| = 3} \frac{e^z}{z(z ${b < 0 ? '+' : '-'} ${Math.abs(b)})}\,dz$. (3 significant figures.)`,
          visual: contour({ f: src, contour: circle(3), marks: [{ x: 0, y: 0, label: '0', kind: 'pole' }, { x: b, y: 0, label: String(b).replace('-', '−'), kind: 'pole' }], x: [-3.6, 3.6], y: [-3.6, 3.6], panel: 'none' }, t`The circle encloses both singular points.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: (2 * PI * Math.exp(b)) / b, feedback: t`Both $0$ and $${b}$ are inside: add the contribution of each.` }, { value: (2 * PI * (Math.exp(b) + 1)) / b, feedback: t`Partial fractions: $\frac{1}{z(z - b)} = \frac{1}{b}\left(\frac{1}{z - b} - \frac{1}{z}\right)$ — the second term carries a minus sign.` }]),
          hints: [t`$\dfrac{1}{z(z - ${b})} = \dfrac{1}{${b}}\left(\dfrac{1}{z - ${b}} - \dfrac{1}{z}\right)$.`, t`Apply the formula to each piece: $\frac{2\pi i}{${b}}\left(e^{${b}} - e^0\right)$.`],
          teach: t`Several enclosed points: split by partial fractions and apply the integral formula to each.`,
          explain: t`$\frac{2\pi i}{${b}}(e^{${b}} - 1) = ${nm(ans, 4)}\,i$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-square', difficulty: 2,
      gen(r) {
        const a = r.pick([[1, 1], [1, -1], [2, 1], [-1, 2], [0.5, 1.5]]);
        const ans = integral(`z^2/(z - (${a[0]}) - (${a[1]})*i)`, circle(3))[0];
        return {
          prompt: t`Compute $\operatorname{Re}\displaystyle\oint_{|z| = 3} \frac{z^2}{z - (${cTeX(a)})}\,dz$. (3 significant figures.)`,
          visual: contour({ f: `z^2/(z - (${a[0]}) - (${a[1]})*i)`, contour: circle(3), marks: [{ x: a[0], y: a[1], label: 'a', kind: 'pole' }], x: [-3.6, 3.6], y: [-3.6, 3.6], panel: 'none' }, t`The circle $|z| = 3$ and the point $a$ inside it. Arrows drawn larger or smaller than true.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: 2 * PI * C.mul(a, a)[0], feedback: t`$2\pi i\,w$ has real part $-2\pi\operatorname{Im} w$, not $2\pi\operatorname{Re} w$: multiplying by $i$ turns the arrow $90^\circ$.` }]),
          hints: [t`The integral is $2\pi i\,a^2$, with $a^2 = ${cTeX(C.mul(a, a))}$.`, t`$\operatorname{Re}(2\pi i\,w) = -2\pi\operatorname{Im} w$.`],
          teach: t`$\oint \frac{f(z)}{z - a}dz = 2\pi i f(a)$; the factor $i$ turns the value a quarter turn.`,
          explain: t`$2\pi i(${cTeX(C.mul(a, a))})$ has real part $-2\pi\times${nm(C.mul(a, a)[1], 3)} = ${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-exp-deriv', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3, -2]), n = r.pick([2, 3]);
        const src = `exp(${k}*z)/z^${n + 1}`;
        const ans = integral(src, circle(1))[1];
        return {
          prompt: t`Compute $\operatorname{Im}\displaystyle\oint_{|z| = 1} \frac{e^{${k}z}}{z^{${n + 1}}}\,dz$. (3 significant figures.)`,
          visual: contour({ f: src, contour: circle(1), marks: [{ x: 0, y: 0, label: '0', kind: 'pole' }], x: [-1.5, 1.5], y: [-1.5, 1.5], panel: 'none' }, t`The unit circle round the singular point $0$ (arrows drawn larger or smaller than true).`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: 2 * PI * k ** n, feedback: t`Divide by $${n}! = ${fact(n)}$.` }]),
          hints: [t`$f(z) = e^{${k}z}$ and $n = ${n}$: $\oint \frac{f}{z^{n + 1}}dz = \frac{2\pi i}{n!}f^{(n)}(0)$.`, t`$f^{(${n})}(0) = (${k})^{${n}} = ${k ** n}$.`],
          teach: t`Each derivative of $e^{kz}$ brings down a $k$: $f^{(n)}(0) = k^n$.`,
          explain: t`$\frac{2\pi i}{${fact(n)}}(${k ** n}) = ${nm(ans, 4)}\,i$.`,
        };
      },
    }),
    num({
      id: 'cp-ring', difficulty: 3, transfer: true,
      gen(r) {
        const T0 = r.pick([182, 247, 315, 96]), a = r.pick([4, -3, 6]), b = r.pick([2, -5, 3]), c = r.pick([0.6, -0.4, 0.9]), d = r.pick([0.5, -0.7]), R = 4;
        const T = (x, y) => T0 + a * x + b * y + c * (x * x - y * y) + d * 2 * x * y;
        const read = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const th = (k * PI) / 4; const x = R * Math.cos(th), y = R * Math.sin(th); return { x, y, v: +T(x, y).toFixed(1) }; });
        const ans = read.reduce((s, p) => s + p.v, 0) / 8;
        return {
          prompt: t`A satellite’s engine-mount plate conducts heat steadily, with no sources inside, so its temperature is a harmonic function of position. Eight thermocouples sit evenly round a circle of radius $${R}$ cm and read (°C, anticlockwise from the right): ${read.map((p) => `$${p.v}$`).join(', ')}. Estimate the temperature at the centre of the circle, where no sensor fits.`,
          visual: { type: 'graph', params: { x: [-7.5, 7.5], y: [-6, 6], equal: true, xlabel: 'x (cm)', ylabel: 'y (cm)', curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 2 * PI], color: 'ink3', width: 1.4, dash: [4, 4] }], points: [...read.map((p) => ({ x: +p.x.toFixed(4), y: +p.y.toFixed(4), label: String(p.v), color: 'warn', labelDx: p.x < -1 ? -46 : 8 })), { x: 0, y: 0, label: '?', color: 'gold' }] }, caption: 'Thermocouples (orange) round a 4 cm circle on the plate, with their readings in °C. Steady two-dimensional conduction with no internal heating is assumed.' },
          answer: ans, units: '°C', tol: { rel: 0, abs: 0.3 },
          errors: apart(ans, [{ value: (Math.max(...read.map((p) => p.v)) + Math.min(...read.map((p) => p.v))) / 2, feedback: 'The midpoint of the highest and lowest readings is not the rule: average all eight.' }], 0.003),
          hints: [t`A harmonic function is the real part of an analytic one, and the real part of the Cauchy formula says: value at the centre = average round the circle.`, 'Add the eight readings and divide by 8.'],
          teach: 'The mean-value property: the steady temperature at the centre of a circle is the average of the temperatures round it.',
          explain: t`The average of the eight readings is $${nm(ans, 4)}$ °C. With eight evenly spaced sensors the average is exact for any temperature field made of the harmonics up to $r^7\cos 7\theta$ — so here, for this smooth (quadratic) field, it is exact up to the sensors’ rounding. A real plate has edges and heat sources somewhere; the property holds only for circles inside the source-free region.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 9 (Cauchy’s formula and its applications)', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), §§54–57', url: 'https://openlibrary.org/isbn/9780073383170' },
  ],
});
