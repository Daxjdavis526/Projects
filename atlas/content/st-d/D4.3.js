// Complex powers and trigonometric functions, both built from exp and log:
// z^c = e^{c log z} (as many values as log has, unless c is an integer or a
// fraction), and sin z, cos z from e^{±iz}. Off the real axis sine and cosine
// grow like cosh and sinh, so cos z = 2 has solutions; i^i is real.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, r6, cTeX, num as nm, argand, cxmap, apart } from './_cx.js';

const t = String.raw;
const PI = Math.PI;

const trigPic = (f, o, caption) => cxmap({ f, x: [-3.3, 3.3], y: [-1.8, 1.8], wx: [-3.5, 3.5], wy: [-3.5, 3.5], grid: 'cartesian', gx: [-PI, PI], gy: [-1.5, 1.5], gn: 9, ...o }, caption);
const sinAbs = (x, y) => Math.hypot(Math.sin(x) * Math.cosh(y), Math.cos(x) * Math.sinh(y));

export default lesson({
  id: 'st-d.D4.3',
  title: 'Complex powers and trigonometric functions',
  minutes: 12, difficulty: 3,
  intro: t`Two families of functions come straight out of the exponential and the logarithm. **Powers**: define $z^c$ for any complex $c$ by

$$z^c = e^{c\log z}, \qquad \sin z = \frac{e^{iz} - e^{-iz}}{2i}, \qquad \cos z = \frac{e^{iz} + e^{-iz}}{2}$$

Because $\log z$ has infinitely many values, so may $z^c$: one value for an integer $c$, $q$ values for a fraction $p/q$, infinitely many otherwise. **Trigonometric functions**: Euler’s formula gives $e^{\pm ix} = \cos x \pm i\sin x$, and solving for $\cos x$ and $\sin x$ gives formulas that make sense for every complex $z$. They agree with the familiar ones on the real axis — but off it they grow exponentially: $\cos(iy) = \cosh y$. So $|\sin z|$ and $|\cos z|$ are **not** bounded by 1.`,
  symbols: [
    { tex: 'z^c', text: t`a complex power: $e^{c\log z}$. The **principal value** uses $\operatorname{Log} z$` },
    { tex: 'c', text: 'the exponent, any complex number' },
    { tex: t`\sin z,\ \cos z`, text: t`sine and cosine of a complex number, defined from $e^{\pm iz}$` },
    { tex: t`\cosh y,\ \sinh y`, text: t`the hyperbolic functions $\frac{e^y + e^{-y}}{2}$ and $\frac{e^y - e^{-y}}{2}$, which appear when $z$ leaves the real axis: $\sin(x + iy) = \sin x\cosh y + i\cos x\sinh y$` },
  ],
  why: t`Complex powers and trig functions appear wherever a real formula is pushed past its limit — the complex angle of refraction behind total internal reflection, the $r^{i\omega}$ of waves near a horizon, the exponent of a damped mode — and the multivaluedness of $z^c$ is exactly that of $\log z$.`,
  visual: {
    type: 'cx-map',
    title: 'Sine and cosine off the real axis',
    lead: t`The strip $-\pi \le x \le \pi$, $-1.5 \le y \le 1.5$ and its image. Under $\sin z$ the vertical lines (orange) become hyperbolas and the horizontal lines (blue) become ellipses that grow as you leave the real axis. Drag $z$, then try $\cos z$, and the power $z^c$ with its own sliders.`,
    tasks: [
      t`For $\sin z$, drag $z$ along the real axis: $f(z)$ shuttles along $[-1, 1]$. Lift it off the axis: $|f(z)|$ quickly passes 1.`,
      t`For $\cos z$, drag $z$ up the imaginary axis: $f(z) = \cosh y$ runs along the real axis, past 2 when $y > 1.32$.`,
      t`For $z^c$, set $c = 0.5$ (a square root) and then $c = i$: the image of the grid wraps very differently, and the red cut matters in both.`,
    ],
    params: {
      f: 'sin', fns: ['sin', 'cos', 'pow'], p: ['pr', 'pim'],
      sliders: [
        { key: 'pr', label: t`$\operatorname{Re} c$ (for $z^c$)`, min: -1, max: 3, step: 0.05, value: 0.5, explain: t`The real part of the exponent: it raises the modulus $|z|$ to this power.` },
        { key: 'pim', label: t`$\operatorname{Im} c$ (for $z^c$)`, min: -1, max: 1, step: 0.05, value: 0, explain: t`The imaginary part of the exponent: it turns the angle of $z$ into a change of size, and $\ln|z|$ into a turn.` },
      ],
      x: [-3.3, 3.3], y: [-1.8, 1.8], wx: [-3.5, 3.5], wy: [-3.5, 3.5], grid: 'cartesian', gx: [-PI, PI], gy: [-1.5, 1.5], gn: 9, showChoice: true,
      drag: { x: 1, y: 0.6 }, readout: ['z', 'w', 'amp'],
    },
    caption: t`The images are exact; $z^c$ uses the principal branch, cut along the negative real axis. The sliders act only on $z^c$.`,
  },
  example: {
    prompt: t`(a) Find all values of $i^i$. (b) Solve $\cos z = 2$.`,
    visual: trigPic('cos', { drag: { x: 0.001, y: Math.acosh(2) }, readout: ['z', 'w'] }, t`$\cos z$ on the strip: the point $z = 1.317i$ lands on $2$.`),
    steps: [
      { label: 'Log of i', text: t`$\log i = \ln 1 + i\left(\frac{\pi}{2} + 2\pi k\right) = i\left(\frac{\pi}{2} + 2\pi k\right)$.` },
      { label: 'Power', text: t`$i^i = e^{i\log i} = e^{i\cdot i(\pi/2 + 2\pi k)} = e^{-\pi/2 - 2\pi k}$: infinitely many values, **all real**. The principal one ($k = 0$) is $e^{-\pi/2} = ${nm(Math.exp(-PI / 2), 4)}$.` },
      { label: 'Cosine equation', text: t`Put $u = e^{iz}$: $\frac{u + 1/u}{2} = 2$, so $u^2 - 4u + 1 = 0$ and $u = 2 \pm \sqrt3$.` },
      { label: 'Take logs', text: t`$iz = \log(2 \pm \sqrt3) = \pm\ln(2 + \sqrt3) + 2\pi ik$ (since $2 - \sqrt3 = 1/(2 + \sqrt3)$). So $z = 2\pi k \mp i\ln(2 + \sqrt3) = 2\pi k \mp ${nm(Math.log(2 + Math.sqrt(3)), 4)}i$.` },
      { label: 'Check', text: t`$\cos(${nm(Math.log(2 + Math.sqrt(3)), 4)}i) = \cosh ${nm(Math.log(2 + Math.sqrt(3)), 4)} = ${nm(Math.cosh(Math.log(2 + Math.sqrt(3))), 4)}$. ✓ No real angle has cosine 2; complex ones do.` },
    ],
    answer: t`$i^i = e^{-\pi/2 - 2\pi k}$, principal value $${nm(Math.exp(-PI / 2), 4)}$; $\;\cos z = 2 \iff z = 2\pi k \pm ${nm(Math.log(2 + Math.sqrt(3)), 4)}\,i$.`,
  },
  practice: [
    num({
      id: 'imag-power', difficulty: 2,
      gen(r) {
        const [b, bt, A] = r.pick([[[0, 1], 'i', PI / 2], [[-1, 0], '(-1)', PI], [[0, -1], '(-i)', -PI / 2]]);
        const a = r.pick([1, 2, 0.5]);
        const ans = Math.exp(-a * A);
        return {
          prompt: t`Find the principal value of $${bt}^{${a === 1 ? '' : a}i}$, to 3 significant figures.`,
          visual: argand({ arrows: [{ to: b, color: 'accent', label: 'base' }], arcs: [{ r: 0.45, from: 0, to: A, color: 'warn' }], circles: [{ r: 1 }], view: 1.4, ticks: false, caption: t`The base on the unit circle and its principal angle (orange).` }),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: Math.exp(a * A), feedback: t`$i\cdot i = -1$: the exponent is $${a === 1 ? '' : a}i\cdot i\operatorname{Arg} = -${a === 1 ? '' : a}\operatorname{Arg}$.` }]),
          hints: [t`$z^c = e^{c\operatorname{Log} z}$, and $\operatorname{Log}${bt} = i(${nm(A, 4)})$ since its modulus is 1.`, t`$c\operatorname{Log} z = ${a === 1 ? '' : a}i\cdot i(${nm(A, 4)}) = ${nm(-a * A, 4)}$.`],
          teach: t`An imaginary power of a number on the unit circle is real: $(e^{i\theta})^{ai} = e^{-a\theta}$.`,
          explain: t`$${bt}^{${a === 1 ? '' : a}i} = e^{-${a === 1 ? '' : a + '\\cdot'}(${nm(A, 4)})} = e^{${nm(-a * A, 4)}} = ${nm(ans, 3)}$ (principal branch).`,
        };
      },
    }),
    num({
      id: 'other-branch', difficulty: 3,
      prompt: t`Using the branch $\log i = i\left(\frac{\pi}{2} - 2\pi\right)$ (one turn below the principal one), what value does $i^i$ take? Give 3 significant figures.`,
      visual: argand({ pts: [{ z: [0, 1], label: 'i', color: 'accent' }], arcs: [{ r: 0.5, from: 0, to: PI / 2 - 2 * PI, color: 'warn' }], circles: [{ r: 1 }], view: 1.4, ticks: false, caption: t`The angle $\frac{\pi}{2} - 2\pi = -\frac{3\pi}{2}$: the same point $i$, reached by turning clockwise.` }),
      answer: Math.exp(3 * PI / 2), tol: { rel: 0.005 },
      errors: [{ value: Math.exp(-PI / 2), feedback: 'That is the principal value. On this branch the angle is −3π/2.' }, { value: Math.exp(-3 * PI / 2), feedback: t`$i\cdot i(-\tfrac{3\pi}{2}) = +\tfrac{3\pi}{2}$: watch the two minus signs.` }],
      hints: [t`$i^i = e^{i\log i}$.`, t`$i\cdot i\left(-\tfrac{3\pi}{2}\right) = \tfrac{3\pi}{2}$.`],
      teach: t`Each branch of $\log z$ gives its own value of $z^c$.`,
      explain: t`$i^i = e^{3\pi/2} = ${nm(Math.exp(3 * PI / 2), 4)}$ on this branch — a quite different real number from the principal $0.208$.`,
    }),
    num({
      id: 'sin-abs', difficulty: 2,
      gen(r) {
        const [x, xt] = r.pick([[PI / 2, t`\pi/2`], [0, '0'], [PI / 6, t`\pi/6`], [PI / 4, t`\pi/4`]]);
        const y = r.pick([1, 1.5, 2]);
        const ans = sinAbs(x, y);
        return {
          prompt: t`Find $|\sin z|$ for $z = ${xt} + ${y}i$, to 3 significant figures.`,
          visual: trigPic('sin', { drag: { x: r6(x), y }, ticks: false, y: [-2.3, 2.3], gy: [-2, 2], wx: [-4.5, 4.5], wy: [-4.5, 4.5] }, t`The point and its image under $\sin z$ (axes without numbers).`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: Math.abs(Math.sin(x)), feedback: t`That ignores the imaginary part: off the real axis, $\sin(x + iy) = \sin x\cosh y + i\cos x\sinh y$.` }, { value: 1, feedback: t`$|\sin z| \le 1$ holds only on the real axis.` }]),
          hints: [t`$\sin(x + iy) = \sin x\cosh y + i\cos x\sinh y$.`, t`$|\sin z|^2 = \sin^2x\cosh^2y + \cos^2x\sinh^2y = \sin^2x + \sinh^2y$.`],
          teach: t`$|\sin(x + iy)| = \sqrt{\sin^2x + \sinh^2y}$: it grows exponentially with $|y|$.`,
          explain: t`$|\sin z| = \sqrt{\sin^2(${xt}) + \sinh^2(${y})} = ${nm(ans, 3)}$.`,
        };
      },
    }),
    mcq({
      id: 'cos-iy', difficulty: 1,
      prompt: t`What is $\cos(iy)$ for real $y$?`,
      visual: trigPic('cos', { drag: { x: 0.001, y: 1.2 } }, t`$z$ on the imaginary axis and its image under $\cos z$: on the real axis, to the right of 1.`),
      choices: [t`$\cosh y$`, t`$\cos y$`, t`$i\sinh y$`, t`$i\cos y$`],
      answer: 0,
      why: { 1: t`Substitute: $\frac{e^{i(iy)} + e^{-i(iy)}}{2} = \frac{e^{-y} + e^{y}}{2}$ — no oscillation left.`, 2: t`That is $\sin(iy)$.`, 3: t`$\cos(iy)$ is real: the two exponentials are real and positive.` },
      hints: [t`Put $z = iy$ in $\frac{e^{iz} + e^{-iz}}{2}$.`],
      teach: t`$\cos(iy) = \cosh y$ and $\sin(iy) = i\sinh y$: along the imaginary axis, trig becomes hyperbolic.`,
      explain: t`$\cos(iy) = \frac{e^{-y} + e^y}{2} = \cosh y \ge 1$ — the picture’s image runs along the real axis from 1 outward.`,
    }),
    num({
      id: 'solve-cos', difficulty: 3,
      gen(r) {
        const a = r.pick([1.5, 3, 5, 10]);
        const ans = Math.log(a + Math.sqrt(a * a - 1));
        return {
          prompt: t`Solve $\cos z = ${a}$: give the imaginary part of the solution that lies on the positive imaginary axis, to 3 significant figures.`,
          visual: trigPic('cos', { drag: { x: 0.001, y: 0.3 }, ticks: false, wx: [-6, 11], wy: [-8, 8], y: [-3.2, 3.2], gy: [-3, 3] }, t`Drag $z$ up the imaginary axis and watch $\cos z$ run along the real axis (axes without numbers).`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: Math.acos(1 / a), feedback: t`On the imaginary axis $\cos(iy) = \cosh y$: solve $\cosh y = ${a}$.` }, { value: Math.log(a), feedback: t`$\cosh y = ${a}$ gives $e^y + e^{-y} = ${2 * a}$; the $e^{-y}$ term matters.` }]),
          hints: [t`On the imaginary axis, $\cos(iy) = \cosh y$.`, t`$\cosh y = a$ gives $y = \ln\big(a + \sqrt{a^2 - 1}\big)$.`],
          teach: t`Real equations with no real solution, like $\cos z = ${a}$, have complex ones.`,
          explain: t`$y = \ln\big(${a} + \sqrt{${a * a - 1}}\big) = ${nm(ans, 3)}$. All solutions: $z = 2\pi k \pm ${nm(ans, 3)}i$.`,
        };
      },
    }),
    mcq({
      id: 'how-many', difficulty: 2,
      prompt: t`How many different values does $i^i$ have, counting every branch of $\log i$?`,
      visual: argand({ arrows: [{ to: [0, 1], color: 'accent', label: 'i' }], circles: [{ r: 1 }], view: 1.3, ticks: false, caption: t`One base, $i$; its angle can be named $\frac{\pi}{2} + 2\pi k$ for every whole number $k$.` }),
      choices: ['Infinitely many, all of them real', 'Exactly one', 'Two, like a square root', 'Infinitely many, all on the unit circle'],
      answer: 0,
      why: { 1: 'One value needs an integer exponent. Here c = i.', 2: t`Two values come from exponents $p/2$; $c = i$ is not a fraction.`, 3: t`$|e^{-\pi/2 - 2\pi k}|$ changes with $k$: the values are real numbers of different sizes, not points on the circle.` },
      hints: [t`$i^i = e^{i\log i} = e^{-\pi/2 - 2\pi k}$.`],
      teach: t`$z^c$ has one value for integer $c$, $q$ values for $c = p/q$, and infinitely many otherwise.`,
      explain: t`$e^{-\pi/2 - 2\pi k}$ for $k = 0, \pm1, \dots$: $0.208$, $111$, $3.9\times10^{-4}$, …, all real and positive, all different.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-power', difficulty: 2,
      gen(r) {
        const [b, bt] = r.pick([[[1, 1], '(1 + i)'], [[1, -1], '(1 - i)'], [[-1, 1], '(-1 + i)']]);
        const w = M.powAt(b, [0, 1]);
        const ans = M.abs(w);
        return {
          prompt: t`Find the modulus of the principal value of $${bt}^{\,i}$, to 3 significant figures.`,
          visual: argand({ arrows: [{ to: b, color: 'accent', label: 'base' }], arcs: [{ r: 0.5, from: 0, to: M.arg(b), color: 'warn' }], circles: [{ r: Math.SQRT2 }], view: 1.7, ticks: false, caption: 'The base and its principal angle.' }),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: Math.exp(M.arg(b)), feedback: t`$i\cdot i\operatorname{Arg} = -\operatorname{Arg}$: the modulus is $e^{-\operatorname{Arg}}$.` }, { value: Math.SQRT2, feedback: t`An imaginary exponent does not keep the modulus: $|z^i| = e^{-\operatorname{Arg} z}$.` }]),
          hints: [t`$z^i = e^{i\operatorname{Log} z} = e^{i\ln|z| - \operatorname{Arg} z}$.`],
          teach: t`$|z^i| = e^{-\operatorname{Arg} z}$; the modulus $|z|$ only turns the result, by $\ln|z|$ radians.`,
          explain: t`$\operatorname{Arg}${bt} = ${nm(M.arg(b), 4)}$, so $|${bt}^i| = e^{-(${nm(M.arg(b), 4)})} = ${nm(ans, 3)}$; the angle of the result is $\ln\sqrt2 = 0.347$ rad.`,
        };
      },
    }),
    num({
      id: 'cp-cos-abs', difficulty: 2,
      gen(r) {
        const x = r.pick([0, PI / 2, PI]), y = r.pick([1, 2, 0.5]);
        const ans = Math.hypot(Math.cos(x) * Math.cosh(y), Math.sin(x) * Math.sinh(y));
        const xt = x === 0 ? '0' : x === PI ? '\\pi' : '\\pi/2';
        return {
          prompt: t`Find $|\cos(${xt} + ${y}i)|$, to 3 significant figures.`,
          visual: trigPic('cos', { drag: { x: r6(x), y }, ticks: false, y: [-2.3, 2.3], gy: [-2, 2], wx: [-4.5, 4.5], wy: [-4.5, 4.5] }, t`The point and its image under $\cos z$ (axes without numbers).`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: Math.abs(Math.cos(x)), feedback: t`Off the real axis, $\cos(x + iy) = \cos x\cosh y - i\sin x\sinh y$.` }]),
          hints: [t`$|\cos(x + iy)|^2 = \cos^2x + \sinh^2y$.`],
          teach: t`$|\cos(x + iy)| = \sqrt{\cos^2x + \sinh^2y}$.`,
          explain: t`$\sqrt{\cos^2(${xt}) + \sinh^2(${y})} = ${nm(ans, 3)}$.`,
        };
      },
    }),
    num({
      id: 'cp-evanescent', difficulty: 3, transfer: true,
      gen(r) {
        const th = r.pick([50, 60, 70]), lam = r.pick([633, 1550]), n = 1.5;
        const s = n * Math.sin(th * PI / 180), k = Math.sqrt(s * s - 1);
        const ans = lam / (2 * PI * k);
        return {
          prompt: t`Light of vacuum wavelength $${lam}$ nm hits a glass–air surface from inside glass ($n = 1.5$) at $${th}^\circ$, beyond the critical angle of $41.8^\circ$. Snell’s law demands $\sin\theta_t = n\sin${th}^\circ = ${nm(s, 4)} > 1$, so the refraction angle is complex, with $\cos\theta_t = \pm i\sqrt{\sin^2\theta_t - 1}$. The field in the air varies as $e^{ik_0x\cos\theta_t}$ with $k_0 = 2\pi/\lambda$; the root that makes it **decay** away from the surface is the physical one. Find the distance over which the field falls by a factor $e$.`,
          visual: { type: 'graph', params: { x: [0, 1.6], y: [-0.2, 1.3], aspect: 'wide', xlabel: 'sin θₜ', ylabel: '|cos θₜ|', curves: [{ fn: 'sqrt(1 - x^2)', domain: [0, 1], color: 'accent', label: 'real angle', labelAt: 0.4 }, { fn: 'sqrt(x^2 - 1)', domain: [1, 1.6], color: 'violet', dash: [6, 4], label: 'imaginary cos θₜ', labelAt: 1.35, labelDy: 14 }], vlines: [{ x: r6(s), color: 'gold', label: 'this ray' }] }, caption: 'The size of cos θₜ against sin θₜ: real below 1, purely imaginary beyond it (dashed). The gold line marks this problem’s value.' },
          answer: ans, units: 'nm', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: lam / k, feedback: t`The decay constant is $k_0\sqrt{\sin^2\theta_t - 1}$ with $k_0 = 2\pi/\lambda$: do not drop the $2\pi$.` }, { value: lam / (2 * PI * Math.sqrt(s * s + 1)), feedback: t`$\cos^2\theta_t = 1 - \sin^2\theta_t$, which is negative here: its size is $\sin^2\theta_t - 1$.` }]),
          hints: [t`With $\cos\theta_t = +i\kappa'$, $e^{ik_0x\cos\theta_t} = e^{-k_0\kappa' x}$, which decays for $x > 0$.`, t`$\kappa' = \sqrt{${nm(s, 4)}^2 - 1} = ${nm(k, 4)}$; the $1/e$ distance is $1/(k_0\kappa') = \lambda/(2\pi\kappa')$.`],
          teach: t`Beyond the critical angle the refraction angle is complex, and choosing the branch of $\cos\theta_t$ that decays gives the evanescent wave.`,
          explain: t`$\delta = \dfrac{${lam}\ \text{nm}}{2\pi\times${nm(k, 4)}} = ${nm(ans, 4)}$ nm. The other root would grow without limit into the air, so physics picks the branch. This sub-wavelength field is what fibre couplers, prism couplers and TIR fluorescence microscopes use.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 2 (complex powers, trigonometric functions)', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Hecht, Optics (5th ed.), ch. 4 (total internal reflection and the evanescent wave)', url: 'https://openlibrary.org/search?q=Hecht+Optics' },
  ],
});
