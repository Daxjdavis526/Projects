// Taylor series and the radius of convergence. The Cauchy formula, with
// 1/(z − w) expanded as a geometric series, shows that an analytic f equals
// its Taylor series on the largest disc about a that contains no singularity
// — so the radius is the distance to the nearest singularity, which may sit
// off the real axis. That settles the old real-variable puzzle: 1/(1 + x²) is
// smooth on all of ℝ, yet its Maclaurin series stops at |x| = 1, because of
// the poles at ±i.
import { lesson, mcq, num } from '../../src/core/content.js';
import { cTeX, num as nm, argand, apart } from './_cx.js';
import { C, contour } from './_cx2.js';

const t = String.raw;
const PI = Math.PI;
const pm = [{ x: 0, y: 1, label: 'i', kind: 'pole' }, { x: 0, y: -1, label: '−i', kind: 'pole' }];
const colour = (f, marks, o, caption) => contour({ f, contour: null, panel: 'none', view: 'colour', marks, arrowsOn: false, ...o }, caption);

export default lesson({
  id: 'st-d.D7.1',
  title: 'Taylor series and the radius of convergence',
  minutes: 13, difficulty: 3,
  intro: t`In [Calculus II](#/lesson/math1220.C2-5.1) a power series converges inside an interval and the radius was something you computed with the ratio test. Complex analysis says **where it comes from**. If $f$ is analytic on a disc about $a$, then on that disc

$$f(z) = \sum_{n=0}^{\infty} c_n (z - a)^n, \qquad c_n = \frac{f^{(n)}(a)}{n!} = \frac{1}{2\pi i}\oint \frac{f(w)}{(w - a)^{n + 1}}\,dw$$

and the series converges on the **largest disc about $a$ that contains no singularity of $f$**. The radius of convergence is the distance from $a$ to the nearest singularity — even one that sits off the real axis, where a real-variable course cannot see it.`,
  symbols: [
    { tex: 'a', text: 'the centre of the expansion' },
    { tex: 'c_n', text: t`the $n$-th Taylor coefficient: by the Cauchy formula for derivatives, a contour integral round $a$` },
    { tex: t`(z - a)^n`, text: t`the $n$-th power of the displacement from the centre` },
    { tex: 'R', text: t`the radius of convergence: the series converges for $|z - a| < R$ and diverges for $|z - a| > R$` },
  ],
  why: t`Whenever a physicist expands in a small parameter — $v/c$, $GM/rc^2$, a coupling constant — the radius of convergence is set by the nearest complex singularity, which tells you how far the expansion can be trusted.`,
  visual: {
    type: 'cx2-contour',
    title: 'The disc reaches the nearest singularity',
    lead: t`The plane coloured by $f(z) = 1/(1 + z^2)$, with its poles at $\pm i$ (crosses). The shaded disc is where the Taylor series about the gold point $a$ converges. Move $a$ with the sliders.`,
    tasks: [
      t`With $a = 0$ the disc has radius $1$: on the real axis the series converges only for $-1 < x < 1$, although $1/(1 + x^2)$ is perfectly smooth there.`,
      t`Slide $a$ along the real axis to $2$: the radius grows to $\sqrt5 \approx 2.24$ — the distance to $\pm i$.`,
      t`Move $a$ up towards $i$: the disc shrinks to nothing as $a$ approaches the pole.`,
    ],
    params: {
      f: '1/(1 + z^2)', contour: null, panel: 'none', view: 'colour', arrowsOn: false,
      sliders: [
        { key: 'ax', label: t`$\operatorname{Re} a$`, min: -2.5, max: 2.5, step: 0.05, value: 0, explain: 'The real part of the centre of the expansion.' },
        { key: 'ay', label: t`$\operatorname{Im} a$`, min: -0.9, max: 0.9, step: 0.05, value: 0, explain: 'The imaginary part of the centre.' },
      ],
      marks: [...pm, { x: 'ax', y: 'ay', label: 'a', kind: 'point' }],
      rings: [{ c: ['ax', 'ay'], r0: 0, r1: 'min(sqrt(ax^2 + (ay - 1)^2), sqrt(ax^2 + (ay + 1)^2))', color: 'ink' }],
      x: [-3.2, 3.2], y: [-2.4, 2.4],
    },
    caption: t`Colour: hue gives $\arg f$, the brightness bands step where $|f|$ doubles. The disc’s radius is computed as the distance to the nearer pole; it is drawn, not found by testing the series.`,
  },
  example: {
    prompt: t`Find the radius of convergence of the Taylor series of $f(x) = \dfrac{1}{1 + x^2}$ about $x = 1$, and the real interval on which it converges.`,
    visual: colour('1/(1 + z^2)', [...pm, { x: 1, y: 0, label: '1', kind: 'point' }], { x: [-2.4, 3.4], y: [-2.2, 2.2], rings: [{ c: [1, 0], r0: 0, r1: Math.SQRT2, color: 'ink' }] }, t`The disc about $1$ that just reaches the poles $\pm i$ (radius $\sqrt2$), over the colour picture of $1/(1 + z^2)$.`),
    steps: [
      { label: 'Go complex', text: t`$f(z) = 1/(1 + z^2)$ is analytic except where $z^2 = -1$: the poles $z = \pm i$.` },
      { label: 'Distances', text: t`$|1 - i| = |1 + i| = \sqrt2$. Both poles are equally near.` },
      { label: 'Radius', text: t`The largest disc about $1$ free of singularities has radius $\sqrt2 \approx 1.414$, so $R = \sqrt2$.` },
      { label: 'Real interval', text: t`On the real line: $|x - 1| < \sqrt2$, i.e. $1 - \sqrt2 < x < 1 + \sqrt2$, about $(-0.414, 2.414)$. Nothing on the real line itself goes wrong at the ends — the obstruction is $\sqrt2$ away, off the axis.` },
      { label: 'Check at a = 0', text: t`About $0$ the same reasoning gives $R = 1$, matching the geometric series $1 - x^2 + x^4 - \cdots$, which visibly diverges for $|x| > 1$.` },
    ],
    answer: t`$R = \sqrt2$; the series converges for $1 - \sqrt2 < x < 1 + \sqrt2$.`,
  },
  practice: [
    num({
      id: 'radius-real', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, -3, 0.5]), b = r.pick([1, 2, 3]);
        const ans = Math.hypot(a, b);
        return {
          prompt: t`Find the radius of convergence of the Taylor series of $\dfrac{1}{x^2 + ${b * b}}$ about $x = ${a}$. (3 significant figures.)`,
          visual: colour(`1/(z^2 + ${b * b})`, [{ x: 0, y: b, label: `${b}i`, kind: 'pole' }, { x: 0, y: -b, label: `−${b}i`, kind: 'pole' }, { x: a, y: 0, label: String(a).replace('-', '−'), kind: 'point' }], { x: [-4.5, 4.5], y: [-3.6, 3.6] }, t`The colour picture of $1/(z^2 + ${b * b})$ with its poles and the centre of the expansion.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: b, feedback: t`That is the distance from $0$. Measure from the centre $${a}$.` }, { value: Math.abs(a), feedback: 'The singularities are not on the real axis — they are at ±' + b + 'i.' }, { value: a * a + b * b, feedback: 'You forgot the square root in the distance.' }]),
          hints: [t`The singularities are where $z^2 = -${b * b}$: $z = \pm${b}i$.`, t`The distance from $${a}$ to $${b}i$ is $\sqrt{${a * a} + ${b * b}}$.`],
          teach: t`The radius is the distance from the centre to the nearest complex singularity.`,
          explain: t`$R = \sqrt{${a * a} + ${b * b}} = ${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'nearest', difficulty: 2,
      gen(r) {
        const [fT, src, sing, a] = r.pick([
          [t`\tan z`, 'tan(z)', [[PI / 2, 0], [-PI / 2, 0], [1.5 * PI, 0]], 0.5],
          [t`\dfrac{1}{e^z - 1}`, '1/(exp(z) - 1)', [[0, 0], [0, 2 * PI], [0, -2 * PI]], 1.5],
          [t`\dfrac{e^z}{(z - 3)(z + 2i)}`, 'exp(z)/((z - 3)*(z + 2i))', [[3, 0], [0, -2]], 1],
          [t`\dfrac{1}{z^2 - 2z + 5}`, '1/(z^2 - 2z + 5)', [[1, 2], [1, -2]], -1],
        ]);
        const ans = Math.min(...sing.map((s) => C.abs(C.sub(s, [a, 0]))));
        return {
          prompt: t`Find the radius of convergence of the Taylor series of $f(z) = ${fT}$ about $z = ${a}$. (3 significant figures.)`,
          visual: colour(src, [{ x: a, y: 0, label: 'a', kind: 'point' }], { x: [-4.5, 4.5], y: [-3.6, 3.6] }, t`The colour picture of $f$ — singularities are where every colour meets and the bands crowd — with the centre $a$.`),
          answer: ans, tol: { rel: 0.005 },
          hints: [t`Find every point where $f$ fails to be analytic.`, t`Its singularities near the centre: ${sing.map((s) => `$${cTeX(s, 4)}$`).join(', ')}. Take the nearest.`],
          teach: t`List the singularities, measure each distance from the centre, and take the smallest.`,
          explain: t`The nearest singularity is $${nm(ans, 4)}$ away, so $R = ${nm(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'why-diverge', difficulty: 2,
      prompt: t`$\dfrac{1}{1 + x^2} = 1 - x^2 + x^4 - x^6 + \cdots$ diverges at $x = 2$, though $\dfrac{1}{1 + x^2}$ is smooth on the whole real line. Why?`,
      visual: { type: 'graph', params: { x: [-2.5, 2.5], y: [-1.5, 2], xlabel: 'x', ylabel: 'y', curves: [{ fn: '1/(1 + x^2)', color: 'ink', width: 2.6, label: '1/(1 + x²)', labelAt: 1.6 }, { sum: '(-1)^k*x^(2k)', k: [0, 8], color: 'accent', label: 'up to x¹⁶', labelAt: -1.05, labelDy: -10 }, { sum: '(-1)^k*x^(2k)', k: [0, 9], color: 'warn', label: 'up to x¹⁸', labelAt: 1.05, labelDy: 20 }], vlines: [{ x: -1, color: 'ink3' }, { x: 1, color: 'ink3' }] }, caption: t`$1/(1 + x^2)$ (the thick line) and two partial sums of its Maclaurin series: they hug it for $|x| < 1$ and fly apart beyond.` },
      choices: [
        t`The complex function has poles at $\pm i$, at distance $1$ from $0$; the disc of convergence cannot reach past them`,
        t`The derivatives of $1/(1 + x^2)$ at $0$ are undefined`,
        t`Every Maclaurin series has radius $1$`,
        t`$x = 2$ is a singularity of $1/(1 + x^2)$`,
      ],
      answer: 0,
      why: {
        1: t`All derivatives exist at $0$: they give the coefficients $1, 0, -1, 0, 1, \dots$.`,
        2: t`$e^x$ and $\sin x$ have infinite radius; $\ln(1 + x)$ has radius $1$ because of the singularity at $-1$.`,
        3: t`$1 + 4 = 5 \ne 0$: nothing happens at $x = 2$.`,
      },
      hints: [t`Convergence regions of power series are discs in the complex plane.`, t`Where does $1 + z^2 = 0$?`],
      teach: t`A power series converges on a disc; the disc stops at the nearest complex singularity, even one off the real axis.`,
      explain: t`The series converges on a disc in $\mathbb{C}$, and that disc must avoid the poles at $\pm i$. So its radius is $1$, and on the real line it converges only for $|x| < 1$. (On $|x| = 1$ it diverges too: its terms do not shrink.)`,
    }),
    {
      type: 'point', id: 'limiting', difficulty: 3,
      gen(r) {
        const [p, q, z0] = r.pick([[[1, 2], [1, -2], [0, 2]], [[-1, 1], [2, 0], [0.5, 1.5]], [[0, 1.5], [2, -1], [1.5, -0.5]], [[-2, -1], [1, 1], [-0.5, -1.5]]]);
        const near = C.abs(C.sub(p, z0)) < C.abs(C.sub(q, z0)) ? p : q;
        return {
          prompt: t`$f(z) = \dfrac{1}{(z - p)(z - q)}$ with $p = ${cTeX(p)}$ and $q = ${cTeX(q)}$. Drag the point to the singularity that sets the radius of convergence of the Taylor series of $f$ about $z_0 = ${cTeX(z0)}$.`,
          visual: argand({ view: 3, pts: [{ z: z0, label: 'z₀', color: 'gold' }], extra: { drag: [{ key: 'p', x: -4, y: -2.6, snap: 0.25 }] }, caption: t`The centre $z_0$; the singularities are not marked. The draggable point is your answer (snaps to quarters).` }),
          answer: { x: near[0], y: near[1] }, tol: { x: 0.15, y: 0.15 },
          instruction: 'Drag the point to the singularity that limits the series, then check.',
          hints: [t`The singularities are $p$ and $q$; the radius is the distance from $z_0$ to the nearer one.`, t`Compare $|z_0 - (${cTeX(p)})| = ${nm(C.abs(C.sub(p, z0)), 3)}$ with $|z_0 - (${cTeX(q)})| = ${nm(C.abs(C.sub(q, z0)), 3)}$.`],
          teach: 'The nearer singularity limits the disc of convergence; the farther one does not matter.',
          explain: t`The nearer singularity is $${cTeX(near)}$, at distance $${nm(C.abs(C.sub(near, z0)), 3)}$: that is the radius.`,
        };
      },
    },
    mcq({
      id: 'removable', difficulty: 3,
      prompt: t`What is the radius of convergence of the Maclaurin series of $\dfrac{z}{e^z - 1}$ (the generating function of the Bernoulli numbers)?`,
      visual: colour('z/(exp(z) - 1)', [], { x: [-8, 8], y: [-8, 8] }, t`The colour picture of $z/(e^z - 1)$: smooth at $0$, with singularities up and down the imaginary axis.`),
      choices: [t`$2\pi$`, t`$0$`, t`$1$`, t`$\infty$`],
      answer: 0,
      why: {
        1: t`At $0$ the numerator and denominator both vanish, and the quotient tends to $1$: $0$ is a removable singularity, not a real one.`,
        2: t`$1$ is not special here; the singularities are where $e^z = 1$.`,
        3: t`$e^z - 1 = 0$ at $z = 2\pi ik$ for every whole $k$, and only $k = 0$ is cancelled by the numerator.`,
      },
      hints: [t`$e^z = 1$ exactly when $z = 2\pi ik$, $k$ a whole number.`, t`At $z = 0$, $\frac{z}{e^z - 1} \to 1$: that point is harmless. Which singularities remain?`],
      teach: t`Only genuine singularities limit the radius; a removable one (a $0/0$ with a finite limit) does not.`,
      explain: t`The genuine singularities are at $\pm2\pi i, \pm4\pi i, \dots$; the nearest are $2\pi$ away, so $R = 2\pi \approx 6.28$. (The ratio test on the Bernoulli numbers confirms it, painfully.)`,
    }),
    num({
      id: 'real-end', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3, 0.5]);
        const R = Math.hypot(a, 1), ans = a + R;
        return {
          prompt: t`The Taylor series of $\dfrac{1}{1 + x^2}$ about $x = ${a}$ converges on a real interval $(${a} - R,\ ${a} + R)$. Find its right-hand end, $${a} + R$. (3 significant figures.)`,
          visual: colour('1/(1 + z^2)', [...pm, { x: a, y: 0, label: String(a), kind: 'point' }], { x: [-3, 5], y: [-2.5, 2.5] }, t`The poles $\pm i$ and the centre of the expansion.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: a + 1, feedback: t`The radius is the distance to $\pm i$, $\sqrt{${a}^2 + 1}$, not $1$.` }]),
          hints: [t`$R = |${a} - i| = \sqrt{${a * a} + 1}$.`, t`Add it to the centre.`],
          teach: t`On the real axis, a Taylor series about $a$ converges for $|x - a| < R$ — with $R$ found in the complex plane.`,
          explain: t`$R = \sqrt{${a * a} + 1} = ${nm(R, 4)}$, so the interval ends at $${a} + ${nm(R, 4)} = ${nm(ans, 4)}$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cube-roots', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, -2, 0.5]);
        const ans = C.abs(C.sub([-0.5, Math.sqrt(3) / 2], [a, 0]));
        return {
          prompt: t`Find the radius of convergence of the Taylor series of $\dfrac{1}{z^2 + z + 1}$ about $z = ${a}$. (3 significant figures.)`,
          visual: colour('1/(z^2 + z + 1)', [{ x: a, y: 0, label: String(a).replace('-', '−'), kind: 'point' }], { x: [-3, 3], y: [-2.2, 2.2] }, t`The colour picture of $1/(z^2 + z + 1)$ and the centre of the expansion.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: Math.abs(a), feedback: 'Measure from the centre to the singularities, not from 0.' }, { value: 1, feedback: t`$1$ is the distance from $0$; measure from $${a}$.` }]),
          hints: [t`$z^2 + z + 1 = 0$ at $z = -\tfrac12 \pm \tfrac{\sqrt3}{2}i$.`, t`Distance from $${a}$: $\sqrt{(${a} + \tfrac12)^2 + \tfrac34}$.`],
          teach: 'Radius = distance from the centre to the nearest root of the denominator.',
          explain: t`$R = \sqrt{(${a} + 0.5)^2 + 0.75} = ${nm(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-quartic', difficulty: 2,
      prompt: t`What is the radius of convergence of the Maclaurin series of $\dfrac{1}{1 + x^4}$?`,
      visual: colour('1/(1 + z^4)', [], { x: [-2, 2], y: [-1.6, 1.6] }, t`The colour picture of $1/(1 + z^4)$: four singular points.`),
      choices: ['1', '∞', t`$\tfrac{\sqrt2}{2}$`, '4'],
      answer: 0,
      why: {
        1: t`It is smooth on the real line, but not in the complex plane: $z^4 = -1$ has four solutions.`,
        2: t`$\tfrac{\sqrt2}{2}$ is the real (or imaginary) part of the poles $e^{\pm i\pi/4}$, not their distance from $0$.`,
        3: t`The exponent does not set the radius; the location of the poles does.`,
      },
      hints: [t`Solve $z^4 = -1$: $z = e^{i\pi/4}, e^{3i\pi/4}, \dots$`, t`How far are they from $0$?`],
      teach: t`The poles of $1/(1 + z^4)$ are the four fourth roots of $-1$, all on the unit circle.`,
      explain: t`All four poles $e^{i(2k + 1)\pi/4}$ have modulus $1$, so $R = 1$: the series $1 - x^4 + x^8 - \cdots$ converges only for $|x| < 1$.`,
    }),
    num({
      id: 'cp-gamma', difficulty: 3, transfer: true,
      gen(r) {
        const b0 = r.pick([0.3, 0.5, 0.6, 0.8]);
        const c = 299792.458, ans = (1 - b0) * c;
        return {
          prompt: t`A probe cruises at $\beta_0 = v/c = ${b0}$. To study small speed changes, a physicist expands the Lorentz factor $\gamma(\beta) = (1 - \beta^2)^{-1/2}$ in a Taylor series in powers of $(\beta - ${b0})$. Up to what speed change $|\Delta v|$ does the series converge? Give it in km/s, with $c = 299\,792.458$ km/s.`,
          visual: argand({ view: 1.4, center: [0.2, 0], pts: [{ z: [1, 0], label: 'β = 1', color: 'bad' }, { z: [-1, 0], label: 'β = −1', color: 'bad' }, { z: [b0, 0], label: 'β₀', color: 'gold' }], caption: t`The complex $\beta$-plane: $\gamma$ has branch points at $\beta = \pm1$ (the speed of light, either way), and the expansion is centred at $\beta_0$.` }),
          answer: ans, units: 'km/s', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: c, feedback: t`About $\beta = 0$ the radius is $1$ (that is, $c$); about $\beta_0 = ${b0}$ it is the distance to the nearer branch point.` }, { value: (1 + b0) * c, feedback: t`That is the distance to $\beta = -1$. The nearer singularity is at $\beta = +1$.` }]),
          hints: [t`$\gamma$ is singular where $1 - \beta^2 = 0$: $\beta = \pm1$.`, t`The nearer one to $${b0}$ is $\beta = 1$, at distance $${nm(1 - b0, 3)}$.`],
          teach: t`The radius of a Taylor series in a physical parameter is the distance to the nearest singularity — for $\gamma$, the speed of light.`,
          explain: t`$R = 1 - ${b0} = ${nm(1 - b0, 3)}$ in $\beta$, i.e. $|\Delta v| < ${nm(1 - b0, 3)}c = ${nm(ans, 4)}$ km/s. (Pushed past $c$ the series diverges, as it must: $\gamma$ has no real value there.)`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 2 §II (power series) and ch. 9', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), §§59–64 (Taylor series)', url: 'https://openlibrary.org/isbn/9780073383170' },
  ],
});
