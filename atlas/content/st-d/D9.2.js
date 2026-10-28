// Integrals over a full turn, ∫₀^{2π} R(cos θ, sin θ) dθ, by z = e^{iθ}: the
// interval becomes the unit circle, cos θ = (z + 1/z)/2, sin θ = (z − 1/z)/2i,
// dθ = dz/(iz), and the integral is 2πi × the residues inside |z| = 1. No
// arcs, no limits. The catalogue: 1/(a + b cos θ) (one pole of a reciprocal
// pair inside), the sine version, the square (a double pole), sin²θ over it
// (a pole at the origin as well), and the Poisson kernel's Fourier
// coefficients 2πpⁿ/(1 − p²). Transfer: the angle-average of a Kepler
// orbit's radius is the semi-minor axis b.
import { lesson, mcq, num } from '../../src/core/content.js';
import { num as nm, apart, argand } from './_cx.js';
import { contour, circle } from './_cx2.js';
import { pole, plane, realPic, r4 } from './_cx3.js';

const t = String.raw;
const PI = Math.PI;
const unit = circle(1);
const thetaPic = (fn, ymax, caption, extra = {}) => realPic({ fn, x: [0, 2 * PI], y: [0, ymax], xlabel: 'θ', caption, extra: { xticks: 4, ...extra } });
const recip = (a, b) => { const s = Math.sqrt(a * a - b * b); return [(-a + s) / b, (-a - s) / b]; };   // zeros of bz² + 2az + b

export default lesson({
  id: 'st-d.D9.2',
  title: 'Trigonometric integrals',
  minutes: 13, difficulty: 3,
  intro: t`An integral over a full turn, $\int_0^{2\pi} R(\cos\theta, \sin\theta)\,d\theta$, is already a contour integral in disguise. As $\theta$ runs from $0$ to $2\pi$, the point $z = e^{i\theta}$ walks once round the **unit circle**. On that circle $1/z = e^{-i\theta}$, so cosine and sine are rational functions of $z$:

$$\cos\theta = \frac{z + z^{-1}}{2},\qquad \sin\theta = \frac{z - z^{-1}}{2i},\qquad d\theta = \frac{dz}{iz}$$

Substitute, and the integral becomes $\oint_{|z| = 1}$ of a rational function — which is $2\pi i$ times the sum of the residues **inside** the unit circle. No arc to kill and no limit to take: the contour is already closed.`,
  symbols: [
    { tex: t`\theta`, text: 'the angle, run once from 0 to 2π' },
    { tex: 'z', text: t`$e^{i\theta}$, a point on the unit circle; $z^{-1} = e^{-i\theta}$ is its mirror image $\bar z$ there` },
    { tex: t`d\theta = dz/(iz)`, text: t`from $dz = ie^{i\theta}\,d\theta = iz\,d\theta$` },
    { tex: 'R', text: t`a rational function of $\cos\theta$ and $\sin\theta$ that stays finite for every real $\theta$ (so no pole lands on the circle)` },
  ],
  why: t`Averages over a cycle — a planet’s orbit, a rotor’s turn, an AC period, a Fourier coefficient — are integrals over a full turn, and this substitution turns each one into a residue sum.`,
  visual: {
    type: 'cx2-contour',
    title: 'A full turn is a closed contour',
    lead: t`The unit circle, walked once anticlockwise as $\theta$ runs from $0$ to $2\pi$, with the transformed integrand. The chain on the right ends at the real integral $\int_0^{2\pi}$. Slide $a$ and watch one pole come in toward the circle while its partner runs away.`,
    tasks: [
      t`With $1/(a + \cos\theta)$ at $a = 2$, the chain ends at $2\pi/\sqrt3 \approx 3.628$. Lower $a$ toward $1$: the inner pole approaches $-1$ and the integral grows without bound, because $a + \cos\theta$ nearly vanishes at $\theta = \pi$.`,
      t`The two poles of $z^2 + 2az + 1$ multiply to $1$: one is always inside, the other outside. Check it for several $a$.`,
      t`Switch to $1/(a + \sin\theta)$: the poles move to the imaginary axis, but the integral is the same, $2\pi/\sqrt{a^2 - 1}$ — a sine is a shifted cosine.`,
    ],
    params: {
      fns: [
        { f: '2/(i*(z^2 + 2*a*z + 1))', label: t`$\frac{1}{a + \cos\theta}$`, marks: [{ x: '-a + sqrt(a^2 - 1)', y: 0, label: 'in', kind: 'pole' }, { x: '-a - sqrt(a^2 - 1)', y: 0, label: 'out', kind: 'pole' }] },
        { f: '2/(z^2 + 2*i*a*z - 1)', label: t`$\frac{1}{a + \sin\theta}$`, marks: [{ x: 0, y: '-a + sqrt(a^2 - 1)', label: 'in', kind: 'pole' }, { x: 0, y: '-a - sqrt(a^2 - 1)', label: 'out', kind: 'pole' }] },
      ],
      sliders: [{ key: 'a', label: '$a$', min: 1.1, max: 4, step: 0.05, value: 2, explain: t`The constant in $a + \cos\theta$; it must exceed 1 so the denominator never vanishes.` }],
      contour: unit, x: [-4.2, 2.2], y: [-2.4, 2.4], n: 32, readout: ['I'],
    },
    caption: t`The integrand shown is the transformed one, $R\cdot\frac{1}{iz}$, so its contour integral is the real integral over $\theta$. Arrows on the circle are drawn longer than true, all by one factor; the chain is to scale.`,
  },
  example: {
    prompt: t`Evaluate $\displaystyle\int_0^{2\pi} \frac{d\theta}{5 + 4\cos\theta}$.`,
    visual: contour({ f: '1/(i*(2*z^2 + 5*z + 2))', contour: unit, marks: [pole(-0.5, 0, '−1/2'), pole(-2, 0, '−2')], x: [-2.6, 1.6], y: [-1.6, 1.6], n: 32, readout: ['I'] }, t`The unit circle encloses $-\tfrac12$ but not $-2$; the chain ends at $2\pi/3 \approx 2.094$.`),
    steps: [
      { label: 'Substitute', text: t`$5 + 4\cos\theta = 5 + 2(z + z^{-1}) = \dfrac{2z^2 + 5z + 2}{z}$, and $d\theta = \dfrac{dz}{iz}$.` },
      { label: 'Simplify', text: t`$\displaystyle\oint \frac{z}{2z^2 + 5z + 2}\cdot\frac{dz}{iz} = \oint\frac{dz}{i(2z + 1)(z + 2)}$. The $z$’s cancel: no pole at the origin.` },
      { label: 'Which poles', text: t`$z = -\tfrac12$ is inside the unit circle; $z = -2$ is outside. (Their product is $1$ — that is no accident: the polynomial’s coefficients read the same backwards.)` },
      { label: 'Residue', text: t`At $-\tfrac12$: $\dfrac{1}{i\cdot h'(-\tfrac12)}$ with $h = 2z^2 + 5z + 2$, $h' = 4z + 5 = 3$. So $\operatorname{Res} = \dfrac{1}{3i}$.` },
      { label: 'Theorem', text: t`$2\pi i\cdot\dfrac{1}{3i} = \dfrac{2\pi}{3} \approx 2.094$.` },
      { label: 'Sense check', text: t`The integrand runs between $\frac19$ (at $\theta = 0$) and $1$ (at $\theta = \pi$), so the integral lies between $2\pi/9 \approx 0.70$ and $2\pi \approx 6.28$. And the general rule $\int_0^{2\pi} d\theta/(a + b\cos\theta) = 2\pi/\sqrt{a^2 - b^2}$ gives $2\pi/3$ too.` },
    ],
    answer: t`$\dfrac{2\pi}{3} \approx 2.094$`,
  },
  practice: [
    mcq({
      id: 'dictionary', difficulty: 1,
      prompt: t`With $z = e^{i\theta}$, which pair of replacements turns $\int_0^{2\pi} R(\cos\theta)\,d\theta$ into a contour integral you can do by residues?`,
      visual: argand({ view: 1.5, circles: [{ r: 1, color: 'ink3' }], arrows: [{ to: [Math.cos(0.7), Math.sin(0.7)], color: 'accent', label: 'z = eⁱᶿ' }, { to: [Math.cos(0.7), -Math.sin(0.7)], color: 'violet', label: '1/z' }], arcs: [{ r: 0.35, from: 0, to: 0.7, label: 'θ' }], pts: [{ z: [Math.cos(0.7), 0], label: 'cos θ', color: 'gold', r: 4 }], curves: [{ param: [`${r4(Math.cos(0.7))}`, `${r4(Math.sin(0.7))}*t`], t: [-1, 1], color: 'gold', dash: [3, 4], width: 1.4 }], caption: t`On the unit circle, $1/z$ is the mirror image of $z$, and $\cos\theta$ is their average — the gold point.` }),
      choices: [
        t`$\cos\theta = \tfrac12(z + z^{-1})$ and $d\theta = \dfrac{dz}{iz}$`,
        t`$\cos\theta = \tfrac12(z + z^{-1})$ and $d\theta = \dfrac{dz}{z}$`,
        t`$\cos\theta = \dfrac{z - z^{-1}}{2i}$ and $d\theta = \dfrac{dz}{iz}$`,
        t`$\cos\theta = \tfrac12(z + \bar z)$ and $d\theta = \dfrac{dz}{iz}$`,
      ],
      answer: 0,
      why: {
        1: t`$dz = ie^{i\theta}d\theta = iz\,d\theta$: dropping the $i$ multiplies the answer by $i$.`,
        2: t`$\frac{z - z^{-1}}{2i}$ is $\sin\theta$.`,
        3: t`On the circle $\bar z = 1/z$, so the value is right — but $\bar z$ is not analytic, and residues need an analytic integrand. Write it as $1/z$.`,
      },
      hints: [t`Differentiate $z = e^{i\theta}$.`, t`On the unit circle $e^{-i\theta} = 1/z$, and $\cos\theta = \tfrac12(e^{i\theta} + e^{-i\theta})$.`],
      teach: t`$z = e^{i\theta}$ gives $\cos\theta = \frac{z + 1/z}{2}$, $\sin\theta = \frac{z - 1/z}{2i}$, $d\theta = \frac{dz}{iz}$ — all analytic away from $0$.`,
      explain: t`$dz = iz\,d\theta$, and $\cos\theta = \frac12(z + z^{-1})$: the pair turns the integral into $\oint$ of a rational function of $z$, ready for residues.`,
    }),
    num({
      id: 'a-b-cos', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[2, 1], [3, 1], [5, 3], [3, 2], [5, 4], [13, 5]]);
        const ans = (2 * PI) / Math.sqrt(a * a - b * b);
        const f = `1/(${a} + ${b}*cos(x))`;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{2\pi} \frac{d\theta}{${a} + ${b === 1 ? '' : b}\cos\theta}$. (3 significant figures.)`,
          visual: thetaPic(f, 1.15 / (a - b), 'The integrand over one turn; the shaded area is the integral. It peaks at θ = π, where the cosine is −1.'),
          answer: ans, tol: { rel: 0.005 }, integrand: f, limits: [0, '2*pi'], vars: { x: [0, 6] },
          errors: apart(ans, [
            { value: (2 * PI) / Math.sqrt(a * a + b * b), feedback: t`The poles solve $${b}z^2 + ${2 * a}z + ${b} = 0$: the square root is $\sqrt{a^2 - b^2}$, not $\sqrt{a^2 + b^2}$.` },
            { value: (2 * PI) / a, feedback: t`That ignores the cosine altogether: its average is $0$, but the average of $1/(a + b\cos\theta)$ is not $1/a$.` },
          ]),
          hints: [t`$${a} + ${b}\cos\theta = \dfrac{${b}z^2 + ${2 * a}z + ${b}}{2z}$, so the integrand becomes $\dfrac{2}{i(${b}z^2 + ${2 * a}z + ${b})}$.`, t`The roots multiply to $1$; the inside one is $z_1 = \dfrac{-${a} + \sqrt{${a * a - b * b}}}{${b}}$, and $\operatorname{Res} = \dfrac{2}{i\,h'(z_1)}$ with $h' = ${2 * b}z + ${2 * a}$.`],
          teach: t`$\int_0^{2\pi}\frac{d\theta}{a + b\cos\theta} = \frac{2\pi}{\sqrt{a^2 - b^2}}$ for $a > |b|$: one pole of a reciprocal pair lies inside the circle.`,
          explain: t`$h'(z_1) = 2\sqrt{${a * a - b * b}}$, so $\operatorname{Res} = \dfrac{1}{i\sqrt{${a * a - b * b}}}$ and the integral is $\dfrac{2\pi}{\sqrt{${a * a - b * b}}} = ${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'sine', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[2, 1], [3, 2], [5, 4], [5, 3], [4, 1]]);
        const ans = (2 * PI) / Math.sqrt(a * a - b * b);
        const y1 = (-a + Math.sqrt(a * a - b * b)) / b, y2 = (-a - Math.sqrt(a * a - b * b)) / b;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{2\pi} \frac{d\theta}{${a} + ${b === 1 ? '' : b}\sin\theta}$. (3 significant figures.)`,
          visual: plane({ f: `2/(${b}*z^2 + 2*i*${a}*z - ${b})`, contour: unit, marks: [pole(0, y1, 'in'), pole(0, y2, 'out')], x: [-2.4, 2.4], y: [Math.min(-1.6, y2 - 0.6), 1.6] }, t`After the substitution the poles sit on the imaginary axis: one inside the unit circle, one outside.`),
          answer: ans, tol: { rel: 0.005 }, integrand: `1/(${a} + ${b}*sin(x))`, limits: [0, '2*pi'], vars: { x: [0, 6] },
          errors: apart(ans, [{ value: (2 * PI) / Math.sqrt(a * a + b * b), feedback: t`Solve $${b}z^2 + ${2 * a}iz - ${b} = 0$ carefully: $z = i\,\dfrac{-${a} \pm \sqrt{${a * a - b * b}}}{${b}}$.` }]),
          hints: [t`$\sin\theta = \frac{z - z^{-1}}{2i}$: the integrand becomes $\dfrac{2}{${b}z^2 + ${2 * a}iz - ${b}}$.`, t`Poles $z = i\left(-${a} \pm \sqrt{${a * a - b * b}}\right)/${b}$; the one with $+$ is inside. $h' = ${2 * b}z + ${2 * a}i$ there equals $2i\sqrt{${a * a - b * b}}$.`],
          teach: 'The sine version has the same value as the cosine one: over a full turn, a sine is just a shifted cosine.',
          explain: t`$\operatorname{Res} = \dfrac{2}{2i\sqrt{${a * a - b * b}}}$, so the integral is $\dfrac{2\pi}{\sqrt{${a * a - b * b}}} = ${nm(ans, 4)}$, as for $\cos\theta$: shifting $\theta$ by $\pi/2$ does not change an integral over a whole period.`,
        };
      },
    }),
    mcq({
      id: 'one-inside', difficulty: 2,
      gen(r) {
        const a = r.pick([1.25, 1.5, 2, 3]);
        const [z1, z2] = recip(a, 1);
        return {
          prompt: t`For $\int_0^{2\pi} d\theta/(${a} + \cos\theta)$ the transformed integrand has poles at the roots of $z^2 + ${2 * a}z + 1$, namely $${nm(z1, 3)}$ and $${nm(z2, 3)}$. Why must exactly one of them lie inside the unit circle, whatever $a > 1$?`,
          visual: plane({ f: `2/(i*(z^2 + ${2 * a}*z + 1))`, contour: unit, marks: [pole(z1, 0, nm(z1, 3).replace('-', '−')), pole(z2, 0, nm(z2, 3).replace('-', '−'))], x: [Math.min(-2, z2 - 0.6), 1.6], y: [-1.6, 1.6] }, 'The two poles and the unit circle.'),
          choices: [
            t`Their product is the constant term over the leading one, $1$: if one has modulus below 1, the other has modulus above 1`,
            t`Their sum is $-${2 * a}$, which is less than $-2$`,
            t`Every quadratic has one root inside the unit circle`,
            t`Because $a > 1$, both roots are negative, and negative numbers are inside the unit circle`,
          ],
          answer: 0,
          why: {
            1: 'The sum alone does not say where each root is: −3 could split as −1.5 and −1.5, both outside.',
            2: t`$z^2 - 5z + 4$ has roots $1$ and $4$, neither inside.`,
            3: 'Negative numbers can have any size: −3.7 is far outside the unit circle.',
          },
          hints: ['For z² + pz + q, the roots multiply to q.', 'Here q = 1. Neither root is on the circle (that would need a + cos θ = 0 somewhere), so one is inside and one outside.'],
          teach: t`The polynomial’s coefficients read the same forwards and backwards, so if $z$ is a root so is $1/z$: the roots come in pairs reflected through the circle.`,
          explain: t`$z_1z_2 = 1$, so $|z_1|\,|z_2| = 1$. Neither can be on the circle, since that would make $a + \cos\theta = 0$ for some real $\theta$, impossible when $a > 1$. So one is inside ($${nm(z1, 3)}$) and the other outside ($${nm(z2, 3)}$).`,
        };
      },
    }),
    num({
      id: 'squared', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[2, 1], [3, 1], [5, 3], [3, 2], [5, 4]]);
        const ans = (2 * PI * a) / (a * a - b * b) ** 1.5;
        const [z1, z2] = recip(a, b);
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{2\pi} \frac{d\theta}{(${a} + ${b === 1 ? '' : b}\cos\theta)^2}$. (3 significant figures.)`,
          visual: plane({ f: `4*z/(i*(${b}*z^2 + ${2 * a}*z + ${b})^2)`, contour: unit, marks: [pole(z1, 0), pole(z2, 0)], view: 'colour', arrowsOn: false, x: [Math.min(-2.2, z2 - 0.6), 1.6], y: [-1.6, 1.6] }, t`The transformed integrand in colour: double poles (the colours circle each twice), one inside the unit circle.`),
          answer: ans, tol: { rel: 0.005 }, integrand: `1/(${a} + ${b}*cos(x))^2`, limits: [0, '2*pi'], vars: { x: [0, 6] },
          errors: apart(ans, [
            { value: (2 * PI) / (a * a - b * b), feedback: t`Squaring the single-pole answer is not right: the pole is now double, and its residue needs a derivative.` },
            { value: (2 * PI) / Math.sqrt(a * a - b * b), feedback: 'That is the integral of 1/(a + b cos θ), without the square.' },
          ]),
          hints: [t`The integrand becomes $\dfrac{4z}{i\,(${b}z^2 + ${2 * a}z + ${b})^2} = \dfrac{4z}{i\cdot${b * b}(z - z_1)^2(z - z_2)^2}$.`, t`$\operatorname{Res} = \dfrac{4}{i\cdot${b * b}}\dfrac{d}{dz}\dfrac{z}{(z - z_2)^2}\Big|_{z_1} = \dfrac{4}{i\cdot${b * b}}\cdot\dfrac{-(z_1 + z_2)}{(z_1 - z_2)^3}$.`, t`$z_1 + z_2 = -${2 * a}/${b}$ and $z_1 - z_2 = 2\sqrt{${a * a - b * b}}/${b}$.`],
          teach: t`Squaring the denominator makes the pole double; the residue then needs one derivative — and gives $2\pi a/(a^2 - b^2)^{3/2}$.`,
          explain: t`$\operatorname{Res} = \dfrac{a}{i(a^2 - b^2)^{3/2}}$, so the integral is $\dfrac{2\pi a}{(a^2 - b^2)^{3/2}} = \dfrac{2\pi\cdot${a}}{${a * a - b * b}^{3/2}} = ${nm(ans, 4)}$. Check: it is $-\frac{\partial}{\partial a}$ of $\frac{2\pi}{\sqrt{a^2 - b^2}}$, as differentiating under the integral sign says it must be.`,
        };
      },
    }),
    num({
      id: 'sin2', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[2, 1], [3, 2], [5, 3], [5, 4], [3, 1]]);
        const s = Math.sqrt(a * a - b * b), ans = ((2 * PI) / (b * b)) * (a - s);
        const [z1, z2] = recip(a, b);
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{2\pi} \frac{\sin^2\theta}{${a} + ${b === 1 ? '' : b}\cos\theta}\,d\theta$. (3 significant figures.)`,
          visual: plane({ f: `-(z^2 - 1)^2/(2*i*z^2*(${b}*z^2 + ${2 * a}*z + ${b}))`, contour: unit, marks: [pole(0, 0, '0'), pole(z1, 0), pole(z2, 0)], view: 'colour', arrowsOn: false, x: [Math.min(-2.2, z2 - 0.6), 1.6], y: [-1.6, 1.6] }, t`The transformed integrand: a pole at the origin as well as the pair on the real axis.`),
          answer: ans, tol: { rel: 0.005 }, integrand: `sin(x)^2/(${a} + ${b}*cos(x))`, limits: [0, '2*pi'], vars: { x: [0, 6] },
          errors: apart(ans, [
            { value: (-2 * PI * s) / (b * b), feedback: t`That is the residue at $z_1$ alone. The origin is a double pole inside the circle too: $\sin^2\theta = -(z^2 - 1)^2/(4z^2)$ brings $z^{-2}$.` },
            { value: (2 * PI * a) / (b * b), feedback: 'That is the origin’s residue alone; add the one at the inner root as well.' },
          ]),
          hints: [t`$\sin^2\theta = -\dfrac{(z^2 - 1)^2}{4z^2}$; the integrand becomes $-\dfrac{(z^2 - 1)^2}{2iz^2(${b}z^2 + ${2 * a}z + ${b})}$.`, t`Inside: the inner root $z_1$ (simple) and $z = 0$ (double). $\operatorname{Res}_0 = -\dfrac{1}{2i}\dfrac{d}{dz}\dfrac{(z^2 - 1)^2}{${b}z^2 + ${2 * a}z + ${b}}\Big|_0 = \dfrac{${a}}{i\cdot${b * b}}$.`, t`Using $z_1z_2 = 1$: $\operatorname{Res}_{z_1} = -\dfrac{\sqrt{${a * a - b * b}}}{i\cdot${b * b}}$.`],
          teach: t`Powers of $\sin\theta$ or $\cos\theta$ on top bring powers of $1/z$: check the origin for a pole.`,
          explain: t`The two residues add to $\dfrac{${a} - \sqrt{${a * a - b * b}}}{i\cdot${b * b}}$, so the integral is $\dfrac{2\pi}{${b * b}}\left(${a} - \sqrt{${a * a - b * b}}\right) = ${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'poisson', difficulty: 3,
      gen(r) {
        const p = r.pick([0.5, 0.3, 0.6, 0.4]), n = r.pick([2, 3, 4]);
        const ans = (2 * PI * p ** n) / (1 - p * p);
        const f = `cos(${n}*x)/(1 - ${2 * p}*cos(x) + ${+(p * p).toFixed(4)})`;
        let lo = 0, hi = 0;
        for (let k = 0; k <= 400; k++) { const x = (2 * PI * k) / 400, y = Math.cos(n * x) / (1 - 2 * p * Math.cos(x) + p * p); lo = Math.min(lo, y); hi = Math.max(hi, y); }
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{2\pi} \frac{\cos ${n}\theta}{1 - ${2 * p}\cos\theta + ${nm(p * p, 3)}}\,d\theta$. (3 significant figures.)`,
          visual: realPic({ fn: f, x: [0, 2 * PI], y: [r4(1.15 * lo), r4(1.15 * hi)], xlabel: 'θ', caption: 'The integrand: the shaded area above the axis counts positive, below it negative.', extra: { xticks: 4 } }),
          answer: ans, tol: { rel: 0.005 }, integrand: f, limits: [0, '2*pi'], vars: { x: [0, 6] },
          errors: apart(ans, [{ value: (2 * PI) / (1 - p * p), feedback: t`That is the $n = 0$ case. Use $\cos ${n}\theta = \operatorname{Re} z^{${n}}$: the residue picks up $p^{${n}}$.` }, { value: 2 * PI * p ** n, feedback: t`Keep the $1/(1 - p^2)$ from $h'$ at the pole.` }]),
          hints: [t`Write $\cos ${n}\theta = \operatorname{Re} e^{${n}i\theta}$ and integrate $\dfrac{z^{${n}}}{1 - 2p\cos\theta + p^2}$ instead, with $p = ${p}$. The denominator is $(1 - pz)(1 - p/z)$.`, t`The integrand becomes $\dfrac{z^{${n}}}{i(1 - pz)(z - p)}$: one pole inside, at $z = p$, with residue $\dfrac{p^{${n}}}{i(1 - p^2)}$.`],
          teach: t`$\cos n\theta$ is the real part of $z^n$: integrate $z^n$ times the rest and take the real part at the end.`,
          explain: t`$2\pi i\cdot\dfrac{p^{${n}}}{i(1 - p^2)} = \dfrac{2\pi\,(${p})^{${n}}}{1 - ${nm(p * p, 3)}} = ${nm(ans, 4)}$. This is the Fourier coefficient of the Poisson kernel: $p^n$ falls off geometrically, which is how a harmonic function inside a disc smooths out its boundary values.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-half', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[2, 1], [5, 3], [3, 2], [5, 4], [13, 12]]);
        const ans = PI / Math.sqrt(a * a - b * b);
        const f = `1/(${a} + ${b}*cos(x))`;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{\pi} \frac{d\theta}{${a} + ${b === 1 ? '' : b}\cos\theta}$ — half a turn. (3 significant figures.)`,
          visual: realPic({ fn: f, x: [0, 2 * PI], y: [0, 1.15 / (a - b)], xlabel: 'θ', shade: false, caption: 'The integrand over a whole turn: mirror-symmetric about θ = π. The asked-for half is shaded.', extra: { xticks: 4, shade: [{ fn: f, from: 0, to: PI, color: 'accent', alpha: 0.2 }], vlines: [{ x: PI, color: 'ink3' }] } }),
          answer: ans, tol: { rel: 0.005 }, integrand: f, limits: [0, 'pi'], vars: { x: [0, 6] },
          errors: apart(ans, [{ value: (2 * PI) / Math.sqrt(a * a - b * b), feedback: 'That is the full turn. The cosine is symmetric about θ = π: the half is half of it.' }]),
          hints: [t`$\cos(2\pi - \theta) = \cos\theta$, so $\int_\pi^{2\pi}$ equals $\int_0^\pi$.`, t`The full turn gives $2\pi/\sqrt{a^2 - b^2}$; take half.`],
          teach: 'Over half a turn, use symmetry to make a full turn, then apply the residue method.',
          explain: t`$\frac12\cdot\frac{2\pi}{\sqrt{${a * a - b * b}}} = ${nm(ans, 4)}$. (This works for cosines, which are even about $\pi$; $\int_0^\pi d\theta/(a + b\sin\theta)$ is not half of the full turn.)`,
        };
      },
    }),
    num({
      id: 'cp-poisson', difficulty: 3,
      gen(r) {
        const p = r.pick([0.2, 0.5, 0.7]), n = r.pick([1, 2, 5]);
        const ans = (2 * PI * p ** n) / (1 - p * p);
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{2\pi} \frac{\cos ${n === 1 ? '' : n}\theta\,d\theta}{1 - ${2 * p}\cos\theta + ${nm(p * p, 3)}}$. (3 significant figures.)`,
          visual: plane({ f: `z^${n}/(i*(1 - ${p}*z)*(z - ${p}))`, contour: unit, marks: [pole(p, 0, String(p)), pole(1 / p, 0, nm(1 / p, 3))], x: [-1.6, Math.max(2, 1 / p + 0.6)], y: [-1.6, 1.6] }, t`With $z = e^{i\theta}$ and $\cos ${n === 1 ? '' : n}\theta = \operatorname{Re} z^{${n}}$: one pole inside the unit circle, one outside.`),
          answer: ans, tol: { rel: 0.005 }, integrand: `cos(${n}*x)/(1 - ${2 * p}*cos(x) + ${+(p * p).toFixed(4)})`, limits: [0, '2*pi'], vars: { x: [0, 6] },
          errors: apart(ans, [{ value: (2 * PI) / (1 - p * p), feedback: t`That is the integral without $\cos ${n}\theta$: the factor $z^{${n}}$ contributes $p^{${n}}$ at the pole.` }]),
          hints: [t`The denominator is $(1 - pz)(1 - p/z)$; with $d\theta = dz/(iz)$ the integrand is $\dfrac{z^{${n}}}{i(1 - pz)(z - p)}$.`, t`Residue at $z = p$: $\dfrac{p^{${n}}}{i(1 - p^2)}$.`],
          teach: t`$\int_0^{2\pi}\frac{\cos n\theta\,d\theta}{1 - 2p\cos\theta + p^2} = \frac{2\pi p^n}{1 - p^2}$ for $|p| < 1$.`,
          explain: t`$\dfrac{2\pi\,(${p})^{${n}}}{1 - ${nm(p * p, 3)}} = ${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-orbit', difficulty: 3, transfer: true,
      gen(r) {
        const [name, a, e, note] = r.pick([
          ['a Molniya communications satellite', 26600, 0.74, 'Molniya orbits hang over high latitudes for most of each 12-hour period'],
          ['a spacecraft in geostationary transfer orbit (perigee 6 578 km, apogee 42 164 km from Earth’s centre)', 24371, 0.7301, 'the transfer orbit that carries a satellite from a 200 km parking orbit up to geostationary height'],
          ['a Tundra-orbit satellite', 42164, 0.27, 'Tundra orbits are geosynchronous but eccentric and inclined, so the satellite lingers over one hemisphere'],
          ['a satellite in a highly eccentric science orbit', 80800, 0.74, 'such orbits keep an X-ray telescope like Chandra above the radiation belts most of the time'],
        ]);
        const p = a * (1 - e * e), ans = p / Math.sqrt(1 - e * e);
        return {
          prompt: t`The orbit of ${name} is $r(\theta) = \dfrac{p}{1 + e\cos\theta}$, with true anomaly $\theta$, semi-major axis $a = ${a}$ km, eccentricity $e = ${e}$ and $p = a(1 - e^2)$. Average its distance over the angle: evaluate $\displaystyle\frac{1}{2\pi}\int_0^{2\pi} r(\theta)\,d\theta$, in km.`,
          visual: { type: 'graph', params: { x: [-a * (1 + e) * 1.08, a * (1 - e) * 1.6], y: [-a * Math.sqrt(1 - e * e) * 1.15, a * Math.sqrt(1 - e * e) * 1.15], equal: true, xlabel: 'km', ylabel: '', axesAt: 'edge', yticks: 0,
            curves: [{ polar: `${r4(p)}/(1 + ${e}*cos(theta))`, theta: [0, 2 * PI], color: 'accent', width: 2.4 }],
            shade: [], points: [{ x: 0, y: 0, label: 'Earth', color: 'teal', r: 5 }, { x: a * (1 - e), y: 0, label: 'perigee', color: 'ink2', r: 3 }, { x: -a * (1 + e), y: 0, label: 'apogee', color: 'ink2', r: 3, labelDx: 8 }],
            arrows: [{ from: [0, 0], to: [r4(p / (1 + e * Math.cos(2.2)) * Math.cos(2.2)), r4(p / (1 + e * Math.cos(2.2)) * Math.sin(2.2))], color: 'gold', label: 'r(θ)' }] },
            caption: 'The orbit to scale, with Earth (not to scale) at the focus.' },
          answer: ans, units: 'km', tol: { rel: 0.005 },
          errors: apart(ans, [
            { value: a, feedback: t`$a$ is the average of the nearest and farthest distances, not the average over angle. The angle-average is $p/\sqrt{1 - e^2}$.` },
            { value: p, feedback: t`$p$ is $r$ at $\theta = 90^\circ$. The average of $1/(1 + e\cos\theta)$ over a turn is $1/\sqrt{1 - e^2}$, not $1$.` },
            { value: a * (1 + (e * e) / 2), feedback: t`$a(1 + e^2/2)$ is the average over **time**, which weights the slow, distant part of the orbit more.` },
          ]),
          hints: [t`$\dfrac{1}{2\pi}\displaystyle\int_0^{2\pi} \frac{p\,d\theta}{1 + e\cos\theta}$ is the integral of this lesson with $a = 1$, $b = e$.`, t`$\displaystyle\int_0^{2\pi}\frac{d\theta}{1 + e\cos\theta} = \frac{2\pi}{\sqrt{1 - e^2}}$.`, t`So the average is $\dfrac{p}{\sqrt{1 - e^2}} = a\sqrt{1 - e^2}$.`],
          teach: t`The angle-average of a Kepler orbit’s radius is $a\sqrt{1 - e^2}$ — the semi-minor axis $b$.`,
          explain: t`$\frac{p}{\sqrt{1 - e^2}} = a\sqrt{1 - e^2} = ${nm(ans, 4)}$ km: exactly the **semi-minor axis** $b$. Averaged over *time* instead, the distance is $a(1 + e^2/2) = ${nm(a * (1 + (e * e) / 2), 4)}$ km — larger, because the satellite dawdles near apogee (${note}).`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), §88 (definite integrals involving sines and cosines)', url: 'https://openlibrary.org/isbn/9780073383170' },
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 9', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Curtis, Orbital Mechanics for Engineering Students (4th ed.), ch. 2–3', url: 'https://openlibrary.org/search?q=Curtis+Orbital+Mechanics+for+Engineering+Students' },
  ],
});
