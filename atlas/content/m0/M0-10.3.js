// Euler's formula and polar form — e^{iθ} = cos θ + i sin θ; z = r e^{iθ}; multiplying multiplies lengths and adds angles.
import { lesson, mcq, num } from '../../src/core/content.js';
import { sig } from '../../src/core/format.js';
import { N, thou } from './_m0kit.js';
import { D2R, deg, wrap180, circ, plane, dot, note } from './_m0geo.js';
import { piTeX } from './_m0trig.js';
import { M, cTeX, argand } from '../st-d/_cx.js';

const t = String.raw;
// an F-shaped polyline (so turning and mirroring are both visible), as segments
const SHAPE = [[[1, 0], [1, 1.5]], [[1, 1.5], [1.9, 1.5]], [[1, 0.8], [1.6, 0.8]]];
const segExpr = (a, b, map) => { const X = `(${a[0]} + t*(${b[0] - a[0]}))`, Y = `(${a[1]} + t*(${b[1] - a[1]}))`; return map(X, Y); };
const rot = (X, Y) => [`r*(${X}*cos(th*pi/180) - ${Y}*sin(th*pi/180))`, `r*(${X}*sin(th*pi/180) + ${Y}*cos(th*pi/180))`];
const P = (r, th) => M.polar(r, th * D2R);

export default lesson({
  id: 'm0.M0-10.3',
  title: 'Euler’s formula and polar form',
  minutes: 10, difficulty: 3,
  intro: t`The point on the unit circle at angle $\theta$ is $\cos\theta + i\sin\theta$. **Euler’s formula** gives it a compact name:

$$e^{i\theta} = \cos\theta + i\sin\theta, \qquad z = re^{i\theta}$$

So every complex number is $re^{i\theta}$: a length $r = |z|$ times a unit arrow at angle $\theta = \arg z$ (in radians). The pay-off is the exponent law: $r_1e^{i\theta_1}\cdot r_2e^{i\theta_2} = r_1r_2\,e^{i(\theta_1 + \theta_2)}$ — **to multiply, multiply the lengths and add the angles**; to divide, divide the lengths and subtract the angles. Multiplying by $e^{i\theta}$ is a rotation through $\theta$. Here take the formula as given; [Calculus II](#/lesson/math1220.C2-5.4) proves it by adding up the Taylor series of $e^x$, $\cos x$ and $\sin x$, and at $\theta = \pi$ it gives Euler’s identity, $e^{i\pi} = -1$.`,
  symbols: [
    { tex: 'e^{i\\theta}', text: 'the unit complex number at angle $\\theta$: modulus $1$, argument $\\theta$' },
    { tex: 'e', text: 'Euler’s number, $2.71828\\ldots$, the base of natural logarithms' },
    { tex: '\\theta', text: 'the argument, **in radians** (the formula fails in degrees, as calculus results do)' },
    { tex: 'r', text: 'the modulus $|z| \\ge 0$' },
    { tex: 'z = re^{i\\theta}', text: 'the **polar (exponential) form** of $z$; its rectangular form is $r\\cos\\theta + ir\\sin\\theta$' },
  ],
  why: t`This is the formula physics runs on: a spinning phasor $Ae^{i\omega t}$ is an AC signal, a wave is $e^{i(kx - \omega t)}$, and quantum states carry phases $e^{-iEt/\hbar}$. Because multiplication just adds angles, products of oscillations and rotations become additions — the reason complex numbers make waves easy.`,
  visual: {
    type: 'graph',
    title: 'Multiplying by w turns and stretches',
    lead: t`The faint F is a shape made of complex numbers $z$; the gold F is every one of them multiplied by $w = re^{i\theta}$. The arrow is $w$ itself (where $1$ goes, since $1 \cdot w = w$).`,
    tasks: [
      t`Set $r = 1$, $\theta = 90^\circ$: multiplying by $e^{i\pi/2} = i$ turns the whole shape a quarter-turn — the same turn you saw for $i^n z$.`,
      t`Set $\theta = 0$ and slide $r$: the F grows or shrinks about $0$ without turning. Multiplying by a positive real number only scales.`,
      t`Set $r = 1$, $\theta = 180^\circ$: multiplying by $e^{i\pi} = -1$ turns everything a half-turn. That is Euler’s identity, as a picture.`,
    ],
    params: {
      x: [-6, 6], y: [-3, 3], equal: true, aspect: 'wide', xlabel: 'Re', ylabel: 'Im',
      sliders: [
        { key: 'r', label: t`Modulus $r$ of $w$`, min: 0.5, max: 1.6, step: 0.05, value: 1.2, explain: t`How much every length is stretched.` },
        { key: 'th', label: t`Argument $\theta$ of $w$`, min: -180, max: 180, step: 5, value: 60, unit: '^\\circ', explain: t`How far every point is turned about $0$, anticlockwise.` },
      ],
      curves: [
        { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: true },
        ...SHAPE.map(([a, b]) => ({ param: segExpr(a, b, (X, Y) => [X, Y]), t: [0, 1], color: 'ink3', width: 2.4 })),
        ...SHAPE.map(([a, b]) => ({ param: segExpr(a, b, rot), t: [0, 1], color: 'gold', width: 3 })),
        { param: ['0.5*cos(t*th*pi/180)', '0.5*sin(t*th*pi/180)'], t: [0, 1], color: 'accent', width: 1.6 },
      ],
      arrows: [{ from: [0, 0], to: ['r*cos(th*pi/180)', 'r*sin(th*pi/180)'], color: 'accent', width: 2.4, label: 'w' }],
      points: [{ x: 1, y: 0, r: 3.5, color: 'ink2', label: '1', labelDx: 4, labelDy: 12 }],
      readouts: [
        { label: t`$\operatorname{Re} w = r\cos\theta$`, expr: 'r*cos(th*pi/180)', digits: 3 },
        { label: t`$\operatorname{Im} w = r\sin\theta$`, expr: 'r*sin(th*pi/180)', digits: 3 },
        { label: t`$\theta$ in radians`, expr: 'th*pi/180', digits: 3 },
      ],
    },
    caption: t`To scale. The image keeps the F’s shape and orientation (it is not mirrored): multiplication only turns and scales. The dashed circle has radius $1$.`,
  },
  example: {
    prompt: t`Multiply $z_1 = 2e^{i\pi/6}$ by $z_2 = 3e^{i\pi/3}$, then check the answer in rectangular form.`,
    visual: argand({ arrows: [{ to: P(2, 30), color: 'accent', label: 'z₁' }, { to: P(3, 60), color: 'warn', label: 'z₂' }, { to: [0, 6], color: 'gold', label: 'z₁z₂' }], arcs: [{ r: 0.8, from: 0, to: Math.PI / 6, color: 'accent' }, { r: 1.2, from: 0, to: Math.PI / 3, color: 'warn' }], view: 6.6, caption: t`The factors and their product: lengths $2 \times 3 = 6$, angles $30^\circ + 60^\circ = 90^\circ$. To scale.` }),
    steps: [
      { label: 'Lengths multiply', text: t`$|z_1z_2| = 2 \times 3 = 6$.` },
      { label: 'Angles add', text: t`$\arg(z_1z_2) = \tfrac{\pi}{6} + \tfrac{\pi}{3} = \tfrac{\pi}{2}$. So $z_1z_2 = 6e^{i\pi/2} = 6(\cos\tfrac{\pi}{2} + i\sin\tfrac{\pi}{2}) = 6i$.` },
      { label: 'Rectangular', text: t`$z_1 = 2(\cos\tfrac{\pi}{6} + i\sin\tfrac{\pi}{6}) = \sqrt3 + i$ and $z_2 = 3(\cos\tfrac{\pi}{3} + i\sin\tfrac{\pi}{3}) = \tfrac32 + \tfrac{3\sqrt3}{2}i$.` },
      { label: 'Check', text: t`$(\sqrt3 + i)\left(\tfrac32 + \tfrac{3\sqrt3}{2}i\right) = \tfrac{3\sqrt3}{2} + \tfrac92 i + \tfrac32 i + \tfrac{3\sqrt3}{2}i^2 = 0 + 6i$ ✓. Four products and a cancellation, against one multiplication and one addition.` },
    ],
    answer: t`$z_1z_2 = 6e^{i\pi/2} = 6i$.`,
  },
  practice: [
    num({
      id: 'real-part', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 4, 5, 6]), d = r.pick([150, 120, 225, 300, 210, 135]), th = d * D2R, f = r.pick(['Re', 'Im']);
        const ans = f === 'Re' ? R * Math.cos(th) : R * Math.sin(th);
        return {
          prompt: t`Find the ${f === 'Re' ? 'real' : 'imaginary'} part of $${R}e^{i${piTeX(th)}}$.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: f === 'Re' ? R * Math.sin(th) : R * Math.cos(th), feedback: t`That is the ${f === 'Re' ? 'imaginary' : 'real'} part: $re^{i\theta} = r\cos\theta + i\,r\sin\theta$.` },
            { value: f === 'Re' ? R * Math.cos(th * D2R) : R * Math.sin(th * D2R), feedback: t`Your calculator is in degree mode: $${piTeX(th)}$ is in radians.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`$${R}e^{i${piTeX(th)}} = ${R}\left(\cos ${piTeX(th)} + i\sin ${piTeX(th)}\right)$. In degrees the angle is $${d}^\circ$.`],
          teach: t`Euler’s formula turns polar form into rectangular: real part $r\cos\theta$, imaginary part $r\sin\theta$.`,
          explain: t`$${f === 'Re' ? '\\operatorname{Re}' : '\\operatorname{Im}'} = ${R}${f === 'Re' ? '\\cos' : '\\sin'} ${d}^\circ = ${sig(ans, 4)}$.`,
          visual: argand({ arrows: [{ to: P(R, d), color: 'accent', label: 'z' }], arcs: [{ r: 0.25 * R, from: Math.min(0, th > Math.PI ? th - 2 * Math.PI : th), to: Math.max(0, th > Math.PI ? th - 2 * Math.PI : th), color: 'gold' }], circles: [{ r: R }], view: 1.2 * R, caption: t`$z$ on the circle of radius $${R}$, at angle $${piTeX(th)}$ (gold).` }),
        };
      },
    }),
    mcq({
      id: 'to-polar', difficulty: 2,
      prompt: t`Which is $-2 - 2i$ in polar form?`,
      choices: [t`$2\sqrt2\,e^{-3\pi i/4}$`, t`$2\sqrt2\,e^{i\pi/4}$`, t`$4\,e^{-3\pi i/4}$`, t`$2\sqrt2\,e^{-i\pi/4}$`],
      answer: 0,
      why: {
        1: t`$\tan^{-1}\tfrac{-2}{-2} = \tan^{-1}1 = \tfrac{\pi}{4}$ points into the first quadrant; $-2 - 2i$ is in the third. Same ratio, opposite direction.`,
        2: t`The modulus is $\sqrt{4 + 4} = 2\sqrt2$, not $2 + 2$.`,
        3: t`$-\tfrac{\pi}{4}$ is the fourth quadrant (real part positive). Here the real part is negative too.`,
      },
      hints: [t`$r = \sqrt{(-2)^2 + (-2)^2}$; $\theta$ is in the third quadrant.`],
      teach: t`Polar form needs $r = |z|$ and the quadrant-correct argument.`,
      explain: t`$r = 2\sqrt2$, and the arrow points down-left at $45^\circ$ below the negative real axis: $\theta = -\tfrac{3\pi}{4}$ (or $\tfrac{5\pi}{4}$, the same direction).`,
      visual: argand({ arrows: [{ to: [-2, -2], color: 'accent', label: '−2 − 2i' }], view: 2.8, caption: t`The number, as an arrow from $0$.` }),
    }),
    num({
      id: 'arg-product', difficulty: 2,
      gen(r) {
        const a = r.pick([100, 120, 135, 150]), b = r.pick([70, 95, 110, 140]), ra = r.pick([1.5, 2]), rb = r.pick([1.2, 2.5]), ans = wrap180(a + b);
        return {
          prompt: t`$z$ has modulus $${ra}$ and argument $${a}^\circ$; $w$ has modulus $${rb}$ and argument $${b}^\circ$. Find the argument of $zw$, in $(-180^\circ, 180^\circ]$.`,
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: a + b, feedback: t`Right idea — angles add — but $${a + b}^\circ$ is outside $(-180^\circ, 180^\circ]$: subtract $360^\circ$.` }, { value: a - b, feedback: t`Angles subtract for a **quotient**. For a product they add.` }, { value: ra * rb, feedback: t`That is the modulus of $zw$; the question asks for its argument.` }].filter((e) => Math.abs(e.value - ans) > 0.5),
          hints: [t`$re^{i\alpha}\cdot se^{i\beta} = rs\,e^{i(\alpha + \beta)}$.`],
          teach: t`Multiplying complex numbers adds their arguments (and multiplies their moduli).`,
          explain: t`$${a}^\circ + ${b}^\circ = ${a + b}^\circ$, which is $${ans}^\circ$ in the principal range; and $|zw| = ${ra} \times ${rb} = ${sig(ra * rb, 3)}$.`,
          visual: argand({ arrows: [{ to: P(ra, a), color: 'accent', label: 'z' }, { to: P(rb, b), color: 'warn', label: 'w' }], arcs: [{ r: 0.45, from: 0, to: a * D2R, color: 'accent' }, { r: 0.7, from: 0, to: b * D2R, color: 'warn' }], view: 2.9, caption: t`$z$ and $w$ with their arguments marked.` }),
        };
      },
    }),
    {
      type: 'point', id: 'rotate', difficulty: 2,
      gen(r) {
        const z = r.pick([[2, 1], [1, 2], [2, -1], [-1, 2]]), [al, alT] = r.pick([[90, t`e^{i\pi/2}`], [180, t`e^{i\pi}`], [-90, t`e^{-i\pi/2}`], [60, t`e^{i\pi/3}`]]), p = M.mul(z, P(1, al));
        const v = argand({ arrows: [{ to: z, color: 'accent', label: 'z' }], circles: [{ r: Math.hypot(...z) }], view: 2.9, caption: t`$z$ and the circle through it (centred on $0$). Drag the ring.` });
        v.params.drag = [{ key: 'p', x: 0.3, y: -0.3, snap: 0.05 }];
        return {
          prompt: t`Drag the ring to $${alT}\,z$, where $z = ${cTeX(z)}$.`,
          visual: v, answer: { x: +p[0].toFixed(6), y: +p[1].toFixed(6) }, tol: { x: 0.25, y: 0.25 },
          instruction: 'Drag the point to the product, then check.',
          hints: [t`$${alT}$ has modulus $1$ and argument $${al}^\circ$: it turns $z$ without stretching it.`, t`Stay on the dashed circle and turn $${Math.abs(al)}^\circ$ ${al > 0 ? 'anticlockwise' : 'clockwise'} from $z$.`],
          teach: t`Multiplying by $e^{i\alpha}$ rotates a number through $\alpha$ about $0$.`,
          explain: t`$${alT}\,(${cTeX(z)}) = ${cTeX(p, 3)}$ — the same distance from $0$, turned through $${al}^\circ$.`,
        };
      },
    },
    mcq({
      id: 'cos-euler', difficulty: 3,
      prompt: t`Using $e^{\pm i\theta} = \cos\theta \pm i\sin\theta$, which expression equals $\cos\theta$?`,
      choices: [t`$\dfrac{e^{i\theta} + e^{-i\theta}}{2}$`, t`$\dfrac{e^{i\theta} - e^{-i\theta}}{2}$`, t`$\dfrac{e^{i\theta} - e^{-i\theta}}{2i}$`, t`$e^{i\theta} + e^{-i\theta}$`],
      answer: 0,
      why: {
        1: t`Subtracting cancels the cosines and leaves $2i\sin\theta$: this is $i\sin\theta$.`,
        2: t`That is $\sin\theta$ — a correct formula, for the other function.`,
        3: t`Adding gives $2\cos\theta$: you still need to halve it.`,
      },
      hints: [t`Add the two formulas: what cancels?`, t`$e^{i\theta} + e^{-i\theta} = 2\cos\theta$, because the $\pm i\sin\theta$ terms cancel.`],
      teach: t`The two arrows $e^{\pm i\theta}$ are mirror images; their imaginary parts cancel and their real parts add.`,
      explain: t`$e^{i\theta} + e^{-i\theta} = 2\cos\theta$, so $\cos\theta = \tfrac12(e^{i\theta} + e^{-i\theta})$ — the average of the two arrows, which lies on the real axis.`,
      visual: argand({ arrows: [{ to: P(1, 50), color: 'accent', label: 'eⁱᶿ' }, { to: P(1, -50), color: 'warn', label: 'e⁻ⁱᶿ' }], circles: [{ r: 1 }], view: 1.3, caption: t`$e^{i\theta}$ and $e^{-i\theta}$ on the unit circle: mirror images in the real axis.` }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-geo', difficulty: 3, transfer: true,
      gen(r) {
        const R = 42164, th0 = r.pick([10, 20, 35]), dt = r.pick([3, 4, 5, 7]), w = 360 / 23.9345, th = th0 + w * dt, ans = R * Math.cos(th * D2R);
        return {
          prompt: t`A geostationary satellite rides with the Earth at radius $42\,164$ km, one turn per sidereal day ($23.9345$ h). In a non-rotating frame centred on the Earth, write its position as $z = 42\,164\,e^{i\theta}$ km, with $\theta = ${th0}^\circ$ now. Each hour multiplies $z$ by $e^{i\omega}$, $\omega = 360^\circ/23.9345$. What is its $x$-coordinate (the real part) $${dt}$ hours from now, in km?`,
          answer: ans, units: 'km', tol: { rel: 0.005, abs: 50 },
          errors: [{ value: R * Math.cos(th0 * D2R), feedback: t`That is where it is now. After $${dt}$ h it has turned a further $${dt} \times ${sig(w, 4)}^\circ = ${sig(w * dt, 4)}^\circ$.` }, { value: R * Math.sin(th * D2R), feedback: t`That is the $y$-coordinate (imaginary part).` }].filter((e) => Math.abs(e.value - ans) > 0.01 * R),
          hints: [t`Multiplying by $e^{i\omega}$ ${dt} times adds $${dt}\,\omega$ to the angle.`, t`New angle $\theta = ${th0}^\circ + ${dt} \times ${sig(w, 4)}^\circ = ${sig(th, 4)}^\circ$; then take $42\,164\cos\theta$.`],
          teach: t`Repeated multiplication by $e^{i\omega}$ is steady rotation: the angles add up.`,
          explain: t`$\theta = ${sig(th, 4)}^\circ$, so $x = 42\,164\cos ${sig(th, 4)}^\circ = ${thou(ans)}$ km. (Circular orbit, no perturbations — real GEO satellites need station-keeping burns.)`,
          visual: plane({ x: [-96000, 96000], y: [-48000, 48000], ticks: false, xlabel: 'x', ylabel: 'y', curves: [circ([0, 0], R, { color: 'ink3', width: 1.4, dash: true }), circ([0, 0], 6371, { color: 'teal', width: 2 })], points: [dot([R * Math.cos(th0 * D2R), R * Math.sin(th0 * D2R)], 'now', { color: 'gold' }), note([0, -9500], 'Earth', { color: 'teal' })], caption: t`The geostationary orbit to scale with the Earth (teal); the satellite’s present position. Rotation is anticlockwise.` }),
        };
      },
    }),
    mcq({
      id: 'cp-product', difficulty: 2,
      prompt: t`$|z| = 2$ with $\arg z = 40^\circ$, and $|w| = 3$ with $\arg w = 110^\circ$. What are the modulus and argument of $zw$?`,
      choices: [t`$|zw| = 6$, $\arg zw = 150^\circ$`, t`$|zw| = 5$, $\arg zw = 150^\circ$`, t`$|zw| = 6$, $\arg zw = 70^\circ$`, t`$|zw| = 5$, $\arg zw = 70^\circ$`],
      answer: 0,
      why: { 1: t`Moduli **multiply**: $r_1e^{i\alpha}\,r_2e^{i\beta} = r_1r_2\,e^{i(\alpha + \beta)}$.`, 2: t`Arguments **add** for a product; they subtract for a quotient.`, 3: t`Both rules reversed: lengths multiply, angles add.` },
      hints: [t`$2e^{i\cdot 40^\circ}\cdot 3e^{i\cdot 110^\circ}$.`],
      teach: t`Product: multiply moduli, add arguments.`,
      explain: t`$|zw| = 2 \times 3 = 6$ and $\arg zw = 40^\circ + 110^\circ = 150^\circ$.`,
      visual: argand({ arrows: [{ to: P(2, 40), color: 'accent', label: 'z' }, { to: P(3, 110), color: 'warn', label: 'w' }], view: 3.4, caption: t`$z$ and $w$, to scale.` }),
    }),
    num({
      id: 'cp-im-polar', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[Math.PI / 3, Math.PI / 6], [Math.PI / 4, Math.PI / 2], [Math.PI / 6, Math.PI / 2], [2 * Math.PI / 3, Math.PI / 4]]), ra = r.pick([2, 3]), rb = r.pick([2, 4]), z = M.polar(ra * rb, a + b), ans = z[1];
        return {
          prompt: t`Find the imaginary part of $${ra}e^{i${piTeX(a)}}\cdot ${rb}e^{i${piTeX(b)}}$.`,
          answer: ans, tol: { rel: 0.005, abs: 0.005 },
          errors: [{ value: z[0], feedback: t`That is the real part, $r\cos\theta$. The imaginary part is $r\sin\theta$.` }, { value: (ra + rb) * Math.sin(a + b), feedback: t`The moduli multiply: $${ra} \times ${rb} = ${ra * rb}$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.max(1, Math.abs(ans))),
          hints: [t`Combine first: $${ra * rb}e^{i(${piTeX(a)} + ${piTeX(b)})}$.`],
          teach: t`Multiply in polar form, then convert: imaginary part $= r\sin\theta$.`,
          explain: t`$${ra * rb}e^{i${piTeX(a + b)}}$, imaginary part $${ra * rb}\sin ${piTeX(a + b)} = ${sig(ans, 4)}$.`,
          visual: argand({ arrows: [{ to: M.polar(ra, a), color: 'accent', label: 'z₁' }, { to: M.polar(rb, b), color: 'warn', label: 'z₂' }], view: 1.25 * Math.max(ra, rb), caption: t`The two factors, to scale.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §8.5 Polar Form of Complex Numbers', url: 'https://openstax.org/books/precalculus-2e/pages/8-5-polar-form-of-complex-numbers' },
    { label: 'NASA Earth Fact Sheet (sidereal rotation period 23.9345 h)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html' },
  ],
});
void N; void deg;
