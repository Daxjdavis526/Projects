// The residue theorem: ∮ f dz = 2πi Σ Res(f, aₖ) over the singularities
// inside. Geometrically, a lap kills every power (z − a)ⁿ except n = −1, so
// what survives is a₋₁ — the residue — from each enclosed singularity
// (deform the contour into small circles round each). Rules: simple pole
// Res = lim (z − a)f = g(a)/h′(a); pole of order m by a derivative. One
// teaser of D9: ∫ dx/(1 + x²) = π by closing in the upper half-plane. And
// the argument principle — residues of p′/p count zeros — is the Nyquist
// stability criterion of control engineering.
import { lesson, mcq, num } from '../../src/core/content.js';
import { cTeX, num as nm, apart } from './_cx.js';
import { C, contour, integral, residue, circle } from './_cx2.js';

const t = String.raw;
const PI = Math.PI;
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const pm = [{ x: 0, y: 1, label: 'i', kind: 'pole' }, { x: 0, y: -1, label: '−i', kind: 'pole' }];
const pent = (r, c) => [0, 1, 2, 3, 4].map((k) => [c[0] + r * Math.cos((2 * k * PI) / 5 + 0.3), c[1] + r * Math.sin((2 * k * PI) / 5 + 0.3)].map((v) => +v.toFixed(3)));
const D = (R) => ({ kind: 'path', parts: [{ kind: 'segment', from: [-R, 0], to: [R, 0] }, { kind: 'arc', c: [0, 0], r: R, from: 0, to: PI }] });

export default lesson({
  id: 'st-d.D8.2',
  title: 'The residue theorem',
  minutes: 15, difficulty: 3,
  intro: t`Walk once round a singularity $a$ and integrate its Laurent series term by term. Every power $(z - a)^n$ comes back to zero (D5.1) — except $n = -1$, which leaves $2\pi i$. So **the only thing that survives a lap is the coefficient $a_{-1}$**, called the **residue** of $f$ at $a$. Deform any contour into small circles round each singularity it encloses (D6.1), and add:

$$\oint_\gamma f(z)\,dz = 2\pi i \sum_{k} \operatorname{Res}(f, a_k)$$

over the singularities $a_k$ inside $\gamma$. You rarely need the whole Laurent series. At a **simple pole**, $\operatorname{Res}(f, a) = \lim_{z \to a}(z - a)f(z)$, which for $f = g/h$ with $h(a) = 0 \ne h'(a)$ is $g(a)/h'(a)$. At a **pole of order $m$**, $\operatorname{Res}(f, a) = \dfrac{1}{(m - 1)!}\lim_{z \to a}\dfrac{d^{m - 1}}{dz^{m - 1}}\big[(z - a)^m f(z)\big]$.`,
  symbols: [
    { tex: t`\gamma`, text: 'a simple closed contour, anticlockwise, passing through no singularity' },
    { tex: 'a_k', text: t`the isolated singularities of $f$ inside $\gamma$ (only finitely many may be inside)` },
    { tex: t`\operatorname{Res}(f, a)`, text: t`the residue: the coefficient $a_{-1}$ of $(z - a)^{-1}$ in the Laurent series of $f$ on a punctured disc round $a$` },
    { tex: t`2\pi i`, text: t`what one anticlockwise lap of $\oint dz/(z - a)$ gives` },
  ],
  why: t`The residue theorem evaluates real integrals that defeat every calculus trick (D9), inverts Laplace and Fourier transforms into sums over poles, and — as the argument principle — counts unstable modes in a feedback loop.`,
  visual: {
    type: 'cx2-contour',
    title: 'What survives a lap',
    lead: t`A pentagonal contour you can reshape (drag its corners). The chain on the right is divided by $2\pi i$, so its end is the **sum of the residues** of the poles inside. The readout counts the laps round each pole.`,
    tasks: [
      t`With $\cot\pi z$ (simple poles at every integer, each with residue $1/\pi \approx 0.318$): enclose one pole, then two, then three — the end of the chain steps $0.318$, $0.637$, $0.955$.`,
      t`With $1/(z^4 + 1)$: enclose one pole at a time and read off its residue; then enclose all four — the residues add to $0$.`,
      t`With $e^z/(z(z - 1.5))$: the residue at $0$ is $-1/1.5 \approx -0.667$; at $1.5$ it is $e^{1.5}/1.5 \approx 2.99$. Enclose both and the chain ends at their sum.`,
    ],
    params: {
      fns: [
        { f: 'cot(pi*z)', label: t`$\cot \pi z$`, marks: [-2, -1, 0, 1, 2].map((k) => ({ x: k, y: 0, label: String(k).replace('-', '−'), kind: 'pole' })) },
        { f: '1/(z^4 + 1)', label: '$1/(z^4 + 1)$', marks: [1, 3, 5, 7].map((k) => ({ x: +Math.cos((k * PI) / 4).toFixed(4), y: +Math.sin((k * PI) / 4).toFixed(4), label: ['P', 'Q', 'R', 'S'][(k - 1) / 2], kind: 'pole' })) },
        { f: 'exp(z)/(z*(z - 1.5))', label: t`$e^z/(z(z - 1.5))$`, marks: [{ x: 0, y: 0, label: '0', kind: 'pole' }, { x: 1.5, y: 0, label: '1.5', kind: 'pole' }] },
      ],
      contour: { kind: 'poly', pts: pent(0.75, [0.75, 0.4]) }, drag: true, x: [-2.6, 2.6], y: [-2, 2], n: 30, scaleBy: 'twopii',
      readout: ['I', 'wind'], iLabel: t`$\tfrac{1}{2\pi i}\oint f\,dz$ (sum of residues)`,
    },
    caption: t`The arrows on the left are drawn larger or smaller than true, all by one factor; the chain is to scale and its window rescales as you drag. A side that runs through a pole makes the integral undefined.`,
  },
  example: {
    prompt: t`Compute $\displaystyle\oint_{|z - i| = 1} \frac{dz}{z^2 + 1}$ — then use the same residue to evaluate $\displaystyle\int_{-\infty}^{\infty}\frac{dx}{1 + x^2}$.`,
    visual: contour({ f: '1/(z^2 + 1)', contour: D(3), marks: pm, x: [-3.6, 3.6], y: [-1.6, 3.6], n: 30, readout: ['I'] }, t`The real segment $[-3, 3]$ closed by the upper semicircle: the chain of $\Delta z/(z^2 + 1)$ ends at $\pi$, which is $2\pi i$ times the residue at $i$.`),
    steps: [
      { label: 'Poles', text: t`$z^2 + 1 = (z - i)(z + i)$: simple poles at $\pm i$. The circle $|z - i| = 1$ encloses $i$ only.` },
      { label: 'Residue', text: t`$\operatorname{Res}(f, i) = \lim_{z \to i}(z - i)\dfrac{1}{(z - i)(z + i)} = \dfrac{1}{2i}$. (Or $g/h' = 1/(2z)$ at $z = i$.)` },
      { label: 'Theorem', text: t`$\oint = 2\pi i\cdot\dfrac{1}{2i} = \pi$.` },
      { label: 'Close the line', text: t`Now take the contour in the picture: $[-R, R]$ plus the upper semicircle $C_R$, with $R > 1$. It encloses $i$ only, so $\int_{-R}^{R}\frac{dx}{1 + x^2} + \int_{C_R}\frac{dz}{1 + z^2} = \pi$.` },
      { label: 'Let R grow', text: t`D5.2’s ML bound gives $\left|\int_{C_R}\right| \le \pi R/(R^2 - 1) \to 0$. So $\displaystyle\int_{-\infty}^{\infty}\frac{dx}{1 + x^2} = \pi$ — which you can confirm with $\arctan$. This is the first of the D9 methods; that lesson does the rest.` },
    ],
    answer: t`$\oint_{|z - i| = 1}\frac{dz}{z^2 + 1} = \pi$, and $\int_{-\infty}^{\infty}\frac{dx}{1 + x^2} = \pi$.`,
  },
  practice: [
    num({
      id: 'res-simple', difficulty: 2,
      gen(r) {
        const b = r.pick([1, 2, 3, 0.5]);
        const res = residue(`1/(z^2 + ${b * b})`, [0, b]);
        const ans = res[1];
        return {
          prompt: t`Find $\operatorname{Im}\operatorname{Res}\left(\dfrac{1}{z^2 + ${nm(b * b, 3)}},\ ${nm(b, 3)}i\right)$. (3 significant figures.)`,
          visual: contour({ f: `1/(z^2 + ${b * b})`, contour: circle(0.3 * b, [0, b]), marks: [{ x: 0, y: b, label: `${b}i`, kind: 'pole' }, { x: 0, y: -b, label: `−${b}i`, kind: 'pole' }], x: [-2.2 * b, 2.2 * b], y: [-1.6 * b, 1.6 * b], panel: 'none', arrowsOn: false }, t`The two poles, with a small circle round the one at $${b}i$.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: 1 / (2 * b), feedback: t`$\frac{1}{2bi} = -\frac{i}{2b}$: dividing by $i$ turns the arrow by $-90^\circ$.` }, { value: -1 / b, feedback: t`$h'(z) = 2z$, so the residue is $\frac{1}{2\cdot ${b}i}$ — keep the 2.` }]),
          hints: [t`A simple pole of $g/h$: $\operatorname{Res} = g(a)/h'(a)$ with $h = z^2 + ${nm(b * b, 3)}$, $h' = 2z$.`, t`$\dfrac{1}{2\cdot ${b}i} = -\dfrac{i}{${2 * b}}$.`],
          teach: t`At a simple pole of $g/h$, the residue is $g(a)/h'(a)$.`,
          explain: t`$\operatorname{Res} = \frac{1}{${2 * b}i} = -\frac{i}{${2 * b}}$: imaginary part $${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'res-order3', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3, -2, 4]), m = r.pick([2, 3]);
        const ans = residue(`exp(${k}*z)/z^${m + 1}`, [0, 0])[0];
        return {
          prompt: t`Find $\operatorname{Res}\left(\dfrac{e^{${k}z}}{z^{${m + 1}}},\ 0\right)$. (3 significant figures.)`,
          visual: contour({ f: `exp(${k}*z)/z^${m + 1}`, contour: null, panel: 'none', view: 'colour', arrowsOn: false, marks: [{ x: 0, y: 0, label: '0', kind: 'pole' }], x: [-1.6, 1.6], y: [-1.2, 1.2] }, t`The colour picture: a pole of order $${m + 1}$ at $0$ (the colours circle it ${m + 1} times, backwards).`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: k ** m, feedback: t`Divide by $${m}! = ${fact(m)}$.` }, { value: k ** (m + 1) / fact(m + 1), feedback: t`You want the coefficient of $z^{-1}$, which comes from the $z^{${m}}$ term of $e^{${k}z}$ — not $z^{${m + 1}}$.` }]),
          hints: [t`$e^{${k}z} = \sum_j \dfrac{(${k}z)^j}{j!}$; dividing by $z^{${m + 1}}$, the $z^{-1}$ term comes from $j = ${m}$.`, t`So the residue is $\dfrac{${k < 0 ? `(${k})` : k}^{${m}}}{${m}!}$.`],
          teach: t`The residue is just the $z^{-1}$ coefficient: often quickest straight from a known series.`,
          explain: t`$\operatorname{Res} = \frac{(${k})^{${m}}}{${m}!} = ${nm(ans, 4)}$ — the same as the order-$m$ formula, $\frac{1}{${m}!}\frac{d^{${m}}}{dz^{${m}}}e^{${k}z}$ at $0$.`,
        };
      },
    }),
    num({
      id: 'inside-outside', difficulty: 2,
      gen(r) {
        const p = r.pick([0.5, -0.5, 1]), q = r.pick([3, -3, 4]), R = 2;
        const ans = integral(`1/((z - (${p}))*(z - (${q})))`, circle(R))[1];
        return {
          prompt: t`Compute $\operatorname{Im}\displaystyle\oint_{|z| = ${R}} \frac{dz}{(z ${p < 0 ? '+' : '-'} ${Math.abs(p)})(z ${q < 0 ? '+' : '-'} ${Math.abs(q)})}$. (3 significant figures.)`,
          visual: contour({ f: `1/((z - (${p}))*(z - (${q})))`, contour: circle(R), marks: [{ x: p, y: 0, label: String(p).replace('-', '−'), kind: 'pole' }, { x: q, y: 0, label: String(q).replace('-', '−'), kind: 'pole' }], x: [-4.6, 4.6], y: [-2.6, 2.6], panel: 'none' }, t`The circle $|z| = ${R}$, one pole inside and one outside. Arrows drawn larger or smaller than true.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: -ans, feedback: t`The residue at $${p}$ is $\frac{1}{${p} - (${q})}$: check the order of subtraction.` }, { value: 0, feedback: 'Only the enclosed pole counts — and it does count.' }]),
          hints: [t`Only $z = ${p}$ is inside. $\operatorname{Res} = \lim_{z \to ${p}} \dfrac{1}{z - (${q})}$.`, t`$\oint = 2\pi i\cdot\dfrac{1}{${p} - (${q})}$.`],
          teach: 'Only the residues of the enclosed singularities enter the residue theorem.',
          explain: t`$2\pi i/(${p} - (${q})) = ${nm(ans, 4)}\,i$.`,
        };
      },
    }),
    {
      type: 'point', id: 'enclose-i', difficulty: 3,
      gen(r) {
        const target = r.pick(['pi', 'minus']);
        const c = target === 'pi' ? [0, 1] : [0, -1];
        return {
          prompt: t`Drag the circle (by its centre) so that $\displaystyle\oint \frac{dz}{z^2 + 1} = ${target === 'pi' ? '' : '-'}\pi$ round it.`,
          visual: contour({ f: '1/(z^2 + 1)', contour: circle(0.6, [1.8, 0]), drag: true, dragRadius: false, marks: pm, x: [-2.6, 2.6], y: [-2, 2], panel: 'none', arrowsOn: false }, t`A circle of radius $0.6$ you can move, and the poles $\pm i$. No readout: decide from the residues.`),
          answer: { x: c[0], y: c[1] }, tol: { x: 0.4, y: 0.4 },
          instruction: 'Drag the centre of the circle, then check.',
          hints: [t`$\operatorname{Res}(f, i) = \frac{1}{2i}$ and $\operatorname{Res}(f, -i) = -\frac{1}{2i}$.`, t`$2\pi i\cdot\frac{1}{2i} = \pi$ and $2\pi i\cdot\left(-\frac{1}{2i}\right) = -\pi$. Enclose the right pole, alone.`],
          teach: 'Each enclosed pole adds 2πi times its residue; choose which poles to enclose.',
          explain: t`Enclosing only $${target === 'pi' ? '' : '-'}i$ gives $2\pi i\cdot\left(${target === 'pi' ? '' : '-'}\frac{1}{2i}\right) = ${target === 'pi' ? '' : '-'}\pi$. Enclosing both gives $0$; enclosing neither, $0$.`,
        };
      },
    },
    mcq({
      id: 'survives', difficulty: 2,
      prompt: t`Round the unit circle, $f(z) = 3 + \dfrac{2}{z} + \dfrac{5}{z^2} + z$ gives the chain in the picture, ending at $4\pi i$. Why does only the $\frac2z$ term matter?`,
      visual: contour({ f: '3 + 2/z + 5/z^2 + z', contour: circle(1), marks: [{ x: 0, y: 0, label: '0', kind: 'pole' }], x: [-1.6, 1.6], y: [-1.6, 1.6], n: 30, readout: ['I'] }, t`The arrows $f\,\Delta z$ round the unit circle and their chain.`),
      choices: [
        t`For every whole $n \ne -1$, the arrows of $z^n\,dz$ turn round $n + 1$ times and cancel; only $z^{-1}\,dz = i\,d\theta$ always points the same way`,
        t`Because $\frac2z$ is the largest term on the unit circle`,
        t`Because $3$ and $z$ are analytic, while $\frac{5}{z^2}$ cancels with $\frac2z$`,
        t`Because the residue theorem only applies to simple poles`,
      ],
      answer: 0,
      why: {
        1: t`$5/z^2$ is bigger there, and still contributes nothing: size does not matter, turning does.`,
        2: t`$5/z^2$ is not analytic at $0$ either; it vanishes on its own, without cancelling anything.`,
        3: t`$5/z^2$ makes $0$ a pole of order 2, and the theorem handles it: its residue is still the $z^{-1}$ coefficient.`,
      },
      hints: [t`On the circle, $z^n\,dz = i e^{i(n + 1)\theta}\,d\theta$.`, t`When does $e^{i(n + 1)\theta}$ not turn at all?`],
      teach: t`A lap kills every power except $z^{-1}$: that is why the residue — the $z^{-1}$ coefficient — is all that survives.`,
      explain: t`$\oint z^n\,dz = \int_0^{2\pi} ie^{i(n + 1)\theta}\,d\theta = 0$ unless $n = -1$, when it is $2\pi i$. So $\oint f\,dz = 2\pi i\times2 = 4\pi i$.`,
    }),
    num({
      id: 'quartic-res', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 3, 5, 7]);
        const a = [Math.cos((k * PI) / 4), Math.sin((k * PI) / 4)];
        const res = residue('1/(z^4 + 1)', a);
        const ans = res[0];
        const aT = { 1: t`e^{i\pi/4}`, 3: t`e^{3i\pi/4}`, 5: t`e^{5i\pi/4}`, 7: t`e^{7i\pi/4}` }[k];
        return {
          prompt: t`Find $\operatorname{Re}\operatorname{Res}\left(\dfrac{1}{z^4 + 1},\ ${aT}\right)$. (3 significant figures.)`,
          visual: contour({ f: '1/(z^4 + 1)', contour: circle(0.3, a.map((v) => +v.toFixed(4))), marks: [1, 3, 5, 7].map((j) => ({ x: +Math.cos((j * PI) / 4).toFixed(4), y: +Math.sin((j * PI) / 4).toFixed(4), label: j === k ? 'a' : '', kind: 'pole' })), x: [-1.8, 1.8], y: [-1.4, 1.4], panel: 'none', arrowsOn: false }, t`The four poles of $1/(z^4 + 1)$ on the unit circle; the small circle surrounds $a = ${aT}$.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: -ans, feedback: t`$\frac{1}{4a^3} = \frac{a}{4a^4} = -\frac{a}{4}$, since $a^4 = -1$.` }, { value: a[0] / 4, feedback: t`Use $a^4 = -1$: the residue is $-a/4$, not $a/4$.` }].filter((e) => Math.abs(e.value - ans) > 1e-6)),
          hints: [t`$\operatorname{Res} = \dfrac{1}{h'(a)} = \dfrac{1}{4a^3}$.`, t`Multiply top and bottom by $a$: $\dfrac{a}{4a^4} = -\dfrac{a}{4}$, since $a^4 = -1$.`],
          teach: t`For a simple pole of $1/h$, the residue is $1/h'(a)$; simplify with the equation the pole satisfies.`,
          explain: t`$\operatorname{Res} = -\frac{a}{4} = -\frac14\left(${cTeX(a.map((v) => +v.toFixed(4)))}\right)$, real part $${nm(ans, 4)}$. The four residues add up to $0$ — so $\oint$ round a circle enclosing all four is $0$, as $1/(z^4 + 1)$ falls off like $1/z^4$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-two-poles', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 3, 1]), b = r.pick([1, -2, 4]), c = r.pick([1, 2]), R = r.pick([0.5, 3]);
        const src = `(${a}*z + ${b})/(z*(z - ${c}))`;
        const ans = integral(src, circle(R))[1];
        return {
          prompt: t`Compute $\operatorname{Im}\displaystyle\oint_{|z| = ${R}} \frac{${a}z ${b < 0 ? '-' : '+'} ${Math.abs(b)}}{z(z - ${c})}\,dz$. (3 significant figures.)`,
          visual: contour({ f: src, contour: circle(R), marks: [{ x: 0, y: 0, label: '0', kind: 'pole' }, { x: c, y: 0, label: String(c), kind: 'pole' }], x: [-3.6, 3.6], y: [-3.4, 3.4], panel: 'none' }, t`The circle $|z| = ${R}$ and the two poles. Arrows drawn larger or smaller than true.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: 2 * PI * a, feedback: t`That is the sum of both residues; check which poles $|z| = ${R}$ encloses.` }, { value: (2 * PI * b) / c, feedback: t`The residue at $0$ is $\frac{${b}}{0 - ${c}}$: watch the sign.` }]),
          hints: [t`$\operatorname{Res}(f, 0) = \dfrac{${b}}{-${c}}$ and $\operatorname{Res}(f, ${c}) = \dfrac{${a}\cdot${c} ${b < 0 ? '-' : '+'} ${Math.abs(b)}}{${c}}$.`, t`Add the residues of the poles inside $|z| = ${R}$ and multiply by $2\pi i$.`],
          teach: 'List the poles, keep those inside, add their residues, multiply by 2πi.',
          explain: t`${R < c ? t`Only $0$ is inside: $2\pi i\cdot\left(-\frac{${b}}{${c}}\right)$` : t`Both poles are inside: the residues add to $${a}$, so $2\pi i\cdot${a}$`}, imaginary part $${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-double', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, 3]), p = r.pick([1, -1, 0.5]);
        const src = `exp(${k}*z)/(z - (${p}))^2`;
        const ans = integral(src, circle(2))[1];
        return {
          prompt: t`Compute $\operatorname{Im}\displaystyle\oint_{|z| = 2} \frac{e^{${k === 1 ? '' : k}z}}{(z ${p < 0 ? '+' : '-'} ${Math.abs(p)})^2}\,dz$. (3 significant figures.)`,
          visual: contour({ f: src, contour: circle(2), marks: [{ x: p, y: 0, label: String(p).replace('-', '−'), kind: 'pole' }], x: [-2.6, 2.6], y: [-2.6, 2.6], panel: 'none' }, t`The circle and the double pole inside it.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: 2 * PI * Math.exp(k * p), feedback: t`At a double pole the residue is the **derivative** of $e^{${k}z}$ at $${p}$, which brings down a factor $${k}$.` }]),
          hints: [t`A pole of order 2: $\operatorname{Res} = \dfrac{d}{dz}\Big[(z - a)^2 f(z)\Big]_{z = a} = \dfrac{d}{dz}e^{${k}z}\Big|_{z = ${p}}$.`, t`$= ${k}e^{${nm(k * p, 3)}}$; multiply by $2\pi i$.`],
          teach: t`At a double pole, $\operatorname{Res} = \frac{d}{dz}[(z - a)^2f]$ at $a$ — the Cauchy formula for the first derivative in disguise.`,
          explain: t`$2\pi i\cdot${k}e^{${nm(k * p, 3)}} = ${nm(ans, 4)}\,i$.`,
        };
      },
    }),
    mcq({
      id: 'cp-nyquist', difficulty: 3, transfer: true,
      gen(r) {
        const K = r.pick([4, 6, 10, 12, 20]);
        const big = K > 8;
        let ymax = 0;
        for (let j = 0; j <= 2000; j++) { const u = -PI / 2 + (PI * j) / 2000, c = Math.cos(u), sn = Math.sin(u); ymax = Math.max(ymax, Math.abs(K * sn * c ** 3 * (3 * c * c - sn * sn))); }
        ymax = +(1.1 * ymax).toFixed(2);
        return {
          prompt: t`A satellite’s attitude loop has open-loop transfer function $L(s) = \dfrac{${K}}{(s + 1)^3}$, stable on its own (no poles with $\operatorname{Re} s > 0$, so $P = 0$). Closing the loop, its modes are the zeros of $1 + L(s)$. The **argument principle** — the residue theorem applied to $\frac{(1 + L)'}{1 + L}$, whose residues count zeros minus poles — gives Nyquist’s rule: if the curve $L(i\omega)$, $-\infty < \omega < \infty$, encircles $-1$ clockwise $N$ times, then $Z = N + P$ closed-loop modes are unstable. The curve crosses the negative real axis at $L = -${K}/8$. How many unstable closed-loop modes are there?`,
          visual: { type: 'graph', params: { x: [-3.5, K + 1], y: [-ymax, ymax], equal: true, xlabel: 'Re L', ylabel: 'Im L', curves: [{ param: [`${K}*(cos(t)^2 - 3*sin(t)^2)*cos(t)^4`, `-${K}*sin(t)*cos(t)^3*(3*cos(t)^2 - sin(t)^2)`], t: [-1.5708, 1.5708], color: 'accent', width: 2.4 }], points: [{ x: -1, y: 0, label: '−1', color: 'bad' }, { x: -K / 8, y: 0, label: '', color: 'accent', r: 3 }] }, caption: t`The Nyquist plot, drawn with $\omega = \tan u$: the image of the imaginary axis $s = i\omega$ under $L$ (the contour’s infinite arc maps to $0$), with the critical point $-1$ marked. A model loop: real attitude dynamics have more poles, but the counting rule is the same.` },
          choices: ['0', '1', '2', '3'],
          answer: big ? 2 : 0,
          fixedOrder: true,
          why: big
            ? { 0: t`The crossing at $-${K}/8 = ${nm(-K / 8, 3)}$ lies left of $-1$, so the curve does wrap round it.`, 1: t`The curve’s two lobes take it round $-1$ twice, so $N = 2$ — the two unstable modes are a complex-conjugate pair.`, 3: t`Only two encirclements: $Z = N + P = 2 + 0$.` }
            : { 1: t`The crossing at $-${K}/8 = ${nm(-K / 8, 3)}$ is to the right of $-1$: the curve never goes round it.`, 2: t`Two would need the curve to wrap round $-1$, which needs the crossing to lie left of $-1$, i.e. $K > 8$.`, 3: 'Nothing encircles −1 here, so N = 0.' },
          hints: [t`Does the crossing point $-${K}/8$ lie to the left of $-1$ (so the curve wraps round it) or to the right?`, t`If it wraps, the two lobes of the curve take it round $-1$ twice clockwise: $N = 2$.`],
          teach: t`Nyquist’s criterion is the residue theorem counting zeros: encirclements of $-1$ by $L(i\omega)$ equal unstable closed-loop poles minus unstable open-loop poles.`,
          explain: big
            ? t`$-${K}/8 < -1$, so $N = 2$ and $Z = 2$: two unstable modes. Check: $1 + L = 0$ means $(s + 1)^3 = -${K}$, $s = -1 + ${nm(Math.cbrt(K), 3)}e^{\pm i\pi/3}$, with real part $${nm(-1 + Math.cbrt(K) / 2, 3)} > 0$. The gain margin is $8$: the loop goes unstable once $K > 8$.`
            : t`$-${K}/8 > -1$, so $N = 0$ and $Z = 0$: stable. Check: $(s + 1)^3 = -${K}$ gives $s = -1 + ${nm(Math.cbrt(K), 3)}e^{\pm i\pi/3}$, real part $${nm(-1 + Math.cbrt(K) / 2, 3)} < 0$. The gain margin is $8/${K}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 9 (residues) and ch. 7 (the argument principle)', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), §§76–80 (residues and poles)', url: 'https://openlibrary.org/isbn/9780073383170' },
    { label: 'Åström & Murray, Feedback Systems (2nd ed.), ch. 10 (the Nyquist criterion)', url: 'https://fbswiki.org/wiki/index.php/Feedback_Systems:_An_Introduction_for_Scientists_and_Engineers' },
  ],
});
