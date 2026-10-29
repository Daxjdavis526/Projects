// Liouville's theorem and the fundamental theorem of algebra. The Cauchy
// formula for f′ plus the ML bound gives the Cauchy estimate |f′(a)| ≤ M/R;
// for a bounded entire function let R → ∞: f′ ≡ 0, so f is constant. A
// polynomial with no root would make 1/p bounded and entire — so every
// non-constant polynomial has a root, and by factoring, n of them. The
// picture is Needham's: the image of a circle |z| = R under p winds n times
// round 0 when R is large and 0 times when R is tiny; in between it must
// sweep across 0 — a root.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { cTeX, num as nm, argand, cxmap, apart } from './_cx.js';
import { contour, circle } from './_cx2.js';

const t = String.raw;
const PI = Math.PI;
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const ROOTS = [[-0.6823, 0], [0.3412, 1.1615], [0.3412, -1.1615]];

export default lesson({
  id: 'st-d.D6.3',
  title: 'Liouville’s theorem and the fundamental theorem of algebra',
  minutes: 13, difficulty: 3,
  intro: t`Put the Cauchy formula for $f'$ on a circle of radius $R$ round $a$, and bound it with ML. If $|f| \le M$ on the circle, the **Cauchy estimate** follows:

$$|f'(a)| \le \frac{1}{2\pi}\cdot\frac{M}{R^2}\cdot 2\pi R = \frac{M}{R}$$

Now suppose $f$ is **entire** (analytic on the whole plane) and **bounded**, $|f| \le M$ everywhere. Then the circle can be as big as you like, $M/R \to 0$, so $f'(a) = 0$ at every $a$: $f$ is constant. That is **Liouville’s theorem** — a striking rigidity with no counterpart for real functions ($\sin x$ is smooth and bounded on the real line, but $\sin z$ grows like $\cosh y$). Its most famous consequence: **every polynomial of degree $n \ge 1$ has a root** — and therefore exactly $n$ roots, counted with multiplicity.`,
  symbols: [
    { tex: 'f', text: t`an **entire** function: complex-differentiable at every point of the plane (polynomials, $e^z$, $\sin z$)` },
    { tex: 'M', text: t`a bound on $|f|$ on the circle (for Liouville: on the whole plane)` },
    { tex: 'R', text: t`the radius of the circle round $a$ used in the Cauchy formula` },
    { tex: t`f'(a)`, text: t`the derivative at the centre; more generally $|f^{(n)}(a)| \le n!\,M/R^n$` },
  ],
  why: t`Liouville’s theorem is why every polynomial factors completely over the complex numbers — so every characteristic equation, of an oscillator, a control loop or a launch vehicle’s pitch dynamics, has a full set of roots to analyse.`,
  visual: {
    type: 'cx-map',
    title: 'A circle’s image must cross 0',
    lead: t`Left: a circle $|z| = R$ and the three roots of $p(z) = z^3 + z + 1$ (dots). Right: the image of the circle under $p$. Count how many times the image loop goes round the origin $w = 0$ as you grow $R$.`,
    tasks: [
      t`At $R = 0.5$ the image is a small loop near $p(0) = 1$: it does not go round $0$.`,
      t`Grow $R$ past $0.68$: the image sweeps across $0$ just as the circle crosses the real root, and from then on goes round once.`,
      t`Past $R = 1.21$ it goes round three times, like $z^3$: all three roots are inside. For a huge circle $p(z) \approx z^3$, so the image **must** wind three times — and since it winds $0$ times for a tiny circle, it has to cross $0$ in between. That crossing is a root.`,
    ],
    params: {
      f: 'uv', u: 'x^3 - 3*x*y^2 + x + 1', v: '3*x^2*y - y^3 + y',
      sliders: [{ key: 'R', label: 'circle radius $R$', min: 0.2, max: 1.6, step: 0.01, value: 0.5, explain: t`The radius of the circle $|z| = R$ whose image under $p$ is drawn.` }],
      x: [-1.8, 1.8], y: [-1.8, 1.8], wx: [-6, 6], wy: [-6, 6], grid: 'none', drag: false, readout: false,
      curves: [{ param: ['R*cos(t)', 'R*sin(t)'], t: [0, 6.2832], color: 'violet', label: '|z| = R', wlabel: 'p(circle)' }],
      points: ROOTS.map(([x, y], k) => ({ x, y, label: k === 0 ? 'roots' : '', color: 'gold' })),
      zname: 'z-plane', wname: 'w = p(z) = z³ + z + 1',
    },
    caption: t`The image is computed exactly from $u = \operatorname{Re} p$ and $v = \operatorname{Im} p$. The roots ($-0.682$ and $0.341 \pm 1.162i$) were found numerically; every one of them maps to $w = 0$.`,
  },
  example: {
    prompt: t`Prove that every polynomial $p(z) = z^n + c_{n-1}z^{n-1} + \dots + c_0$ with $n \ge 1$ has a root.`,
    visual: cxmap({ f: 'uv', u: 'x^3 - 3*x*y^2 + x + 1', v: '3*x^2*y - y^3 + y', constants: { R: 1.5 }, x: [-1.8, 1.8], y: [-1.8, 1.8], wx: [-6, 6], wy: [-6, 6], grid: 'none', drag: false, curves: [{ param: ['R*cos(t)', 'R*sin(t)'], t: [0, 6.2832], color: 'violet' }], points: ROOTS.map(([x, y]) => ({ x, y, color: 'gold' })) }, t`For $R = 1.5$ the image of the circle under $z^3 + z + 1$ winds three times round $0$, as $z^3$ would.`),
    steps: [
      { label: 'Suppose not', text: t`If $p(z) \ne 0$ for every $z$, then $g = 1/p$ is analytic everywhere: entire.` },
      { label: 'Far away', text: t`For large $|z|$, $p(z) = z^n\big(1 + c_{n-1}/z + \dots + c_0/z^n\big)$ and the bracket tends to $1$. So beyond some radius $R_0$, $|p(z)| \ge \tfrac12|z|^n \ge \tfrac12R_0^n$, and $|g| \le 2/R_0^n$ there.` },
      { label: 'Nearby', text: t`On the closed disc $|z| \le R_0$, $g$ is continuous, so it is bounded there too (a continuous function on a closed, bounded set has a maximum).` },
      { label: 'Liouville', text: t`So $g$ is bounded and entire, hence constant — and then so is $p = 1/g$. But $p$ has degree $n \ge 1$: contradiction. So $p$ has a root $z_1$.` },
      { label: 'All the roots', text: t`Divide: $p(z) = (z - z_1)\,q(z)$ with $q$ of degree $n - 1$. Repeat until the degree is $0$: $p(z) = (z - z_1)(z - z_2)\cdots(z - z_n)$, exactly $n$ roots counted with multiplicity.` },
    ],
    answer: t`$1/p$ would be bounded and entire, so constant by Liouville — impossible. Every polynomial of degree $n$ has $n$ complex roots.`,
  },
  practice: [
    mcq({
      id: 'bounded', difficulty: 2,
      prompt: t`Which of these functions is bounded on the whole complex plane?`,
      visual: contour({ f: 'sin(z)', contour: null, panel: 'none', view: 'colour', x: [-4, 4], y: [-2.5, 2.5], arrowsOn: false }, t`The colour picture of $\sin z$: the brightness bands (each a doubling of $|\sin z|$) crowd together as you leave the real axis — it grows without bound.`),
      choices: [t`$f(z) = 7$`, t`$\sin z$`, t`$e^{iz}$`, t`$\dfrac{1}{1 + z^2}$`],
      answer: 0,
      why: {
        1: t`$|\sin x| \le 1$ only on the real axis; $|\sin(iy)| = \sinh|y|$ grows exponentially.`,
        2: t`$|e^{iz}| = e^{-y}$, which is huge for $y \to -\infty$.`,
        3: t`It is bounded on the real line, but it is not even defined at $z = \pm i$, where it blows up.`,
      },
      hints: [t`By Liouville, an **entire** function that is bounded must be constant.`, t`Check each candidate off the real axis, and check for poles.`],
      teach: t`Liouville: the only bounded entire functions are the constants; anything else is unbounded somewhere in the plane.`,
      explain: t`Only the constant survives. $\sin z$ and $e^{iz}$ are entire and non-constant, so they must be unbounded (and are, off the real axis); $1/(1 + z^2)$ escapes Liouville only by not being entire.`,
    }),
    num({
      id: 'cauchy-estimate', difficulty: 2,
      gen(r) {
        const M = r.pick([5, 10, 20]), R = r.pick([2, 0.5, 4]), n = r.pick([1, 2, 3]);
        const ans = (fact(n) * M) / R ** n;
        return {
          prompt: t`An analytic function satisfies $|f(z)| \le ${M}$ on the circle $|z - a| = ${R}$ (and is analytic inside it). What is the largest $|f^{(${n})}(a)|$ can be, by the Cauchy estimate $|f^{(n)}(a)| \le n!\,M/R^n$?`,
          visual: contour({ f: '1', contour: circle(R), marks: [{ x: 0, y: 0, label: 'a', kind: 'point' }], x: [-R - 1, R + 1], y: [-R - 1, R + 1], panel: 'none', arrowsOn: false, ticks: false }, t`The circle of radius $${R}$ round $a$ (axes without numbers).`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: M / R ** n, feedback: t`You left out the $n! = ${fact(n)}$.` }, { value: (fact(n) * M) / R, feedback: t`The radius enters as $R^n$, one power per derivative.` }]),
          hints: [t`From $f^{(n)}(a) = \frac{n!}{2\pi i}\oint \frac{f(z)}{(z - a)^{n + 1}}\,dz$ and ML: $|f^{(n)}(a)| \le \frac{n!}{2\pi}\cdot\frac{M}{R^{n + 1}}\cdot 2\pi R$.`, t`$= n!\,M/R^n$ with $n = ${n}$, $M = ${M}$, $R = ${R}$.`],
          teach: t`Cauchy estimate: $|f^{(n)}(a)| \le n!\,M/R^n$ — a bound on a circle controls every derivative at its centre.`,
          explain: t`$${fact(n)}\times${M}/${R}^{${n}} = ${nm(ans, 4)}$. A big circle with a modest bound pins the derivatives down hard — the engine of Liouville’s theorem.`,
        };
      },
    }),
    num({
      id: 'winding-roots', difficulty: 3,
      gen(r) {
        const [n, c, R] = r.pick([[5, 3, 2], [4, 2, 2], [6, 4, 2], [3, 1, 3]]);
        return {
          prompt: t`How many roots does $p(z) = z^{${n}} + ${c}z + 1$ have in the disc $|z| < ${R}$? On the circle $|z| = ${R}$, compare $|z^{${n}}|$ with $|${c}z + 1|$; the picture shows what $z^{${n}}$ alone does to that circle.`,
          visual: cxmap({ f: 'pow', p: [n, 0], x: [-R - 0.5, R + 0.5], y: [-R - 0.5, R + 0.5], wx: [-1.25 * R ** n, 1.25 * R ** n], wy: [-1.25 * R ** n, 1.25 * R ** n], grid: 'none', cut: false, ticks: false, drag: { x: R, y: 0.001, label: 'z', wlabel: `z${'⁰¹²³⁴⁵⁶⁷⁸⁹'[n]}` }, play: true, trail: true, curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 6.2832], color: 'violet' }] }, t`The circle $|z| = ${R}$. Press the button to carry $z$ once round it and watch the image point $z^{${n}}$ (gold trail) go round $0$ — count its laps. Axes without numbers.`),
          answer: n, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: 1, feedback: t`On this circle the $z^{${n}}$ term dominates, so the image of the circle under $p$ winds like that of $z^{${n}}$.` }],
          hints: [t`On $|z| = ${R}$: $|z^{${n}}| = ${R ** n}$, while $|${c}z + 1| \le ${c * R + 1}$.`, t`The small term cannot drag the image across $0$, so $p$’s image winds round $0$ as often as $z^{${n}}$’s does — and each winding is a root inside.`],
          teach: t`If one term dominates all the others on a circle, the image of that circle winds round $0$ as that term’s does — and the number of windings counts the roots inside.`,
          explain: t`$${R ** n} > ${c * R + 1}$, so the image of $|z| = ${R}$ under $p$ winds ${n} times round $0$, like $z^{${n}}$: all $${n}$ roots lie inside $|z| < ${R}$. (This counting rule is the argument principle, which D8.2’s residue theorem proves; here it is the same picture as the explore step.)`,
        };
      },
    }),
    order({
      id: 'liouville-order', difficulty: 3,
      prompt: t`Put the steps of the proof of Liouville’s theorem in order, for an entire $f$ with $|f| \le M$ everywhere.`,
      visual: contour({ f: '1', contour: circle(1.6, [0.3, 0.2]), marks: [{ x: 0.3, y: 0.2, label: 'a', kind: 'point' }], circles: [{ c: [0.3, 0.2], r: 0.8 }, { c: [0.3, 0.2], r: 2.4 }], x: [-3, 3], y: [-3, 3], panel: 'none', arrowsOn: false, ticks: false }, t`Circles of growing radius round the same point $a$: the bound $M/R$ on $|f'(a)|$ shrinks as $R$ grows.`),
      items: [
        t`Write $f'(a) = \frac{1}{2\pi i}\oint_{|z - a| = R} \frac{f(z)}{(z - a)^2}\,dz$`,
        t`Bound it with ML: $|f'(a)| \le M/R$`,
        t`Let $R \to \infty$: $f'(a) = 0$`,
        t`$a$ was any point, so $f' \equiv 0$`,
        t`So $f$ is constant`,
      ],
      hints: ['Start from the Cauchy formula for the derivative.', 'The radius can be as large as you like because f is entire.'],
      teach: t`Liouville in one line: $|f'(a)| \le M/R$ for every $R$, so $f' = 0$.`,
      explain: t`The Cauchy formula for $f'$ plus the ML bound gives $|f'(a)| \le M/R$; an entire function lets $R$ grow without limit, forcing $f'(a) = 0$ everywhere.`,
    }),
    mcq({
      id: 're-bounded', difficulty: 3,
      prompt: t`$f$ is entire and $\operatorname{Re} f(z) \le 3$ for every $z$. Which argument shows $f$ is constant?`,
      visual: { type: 'graph', params: { x: [-3, 6], y: [-3, 3], equal: true, xlabel: 'Re w', ylabel: 'Im w', shade: [{ fn: '3', lower: '-3', from: -3, to: 3, color: 'accent', alpha: 0.15 }], vlines: [{ x: 3, label: 'Re w = 3', color: 'accent' }] }, caption: t`The values of $f$ are confined to the half-plane $\operatorname{Re} w \le 3$ (shaded), which is not bounded.` },
      choices: [
        t`$g = e^{f}$ is entire with $|g| = e^{\operatorname{Re} f} \le e^3$, so $g$ is constant by Liouville, and hence so is $f$`,
        t`$\operatorname{Re} f \le 3$ means $f$ is bounded, so Liouville applies directly`,
        t`$\operatorname{Re} f$ is harmonic and bounded above, so $f = 3$`,
        t`It does not follow: $f(z) = -z^2$ has $\operatorname{Re} f \le 3$`,
      ],
      answer: 0,
      why: {
        1: t`A half-plane is not bounded: $\operatorname{Im} f$ could be anything. Liouville needs $|f|$ bounded.`,
        2: t`$f$ is constant, but not necessarily $3$ — $f = -5 + 2i$ also qualifies.`,
        3: t`$\operatorname{Re}(-z^2) = y^2 - x^2$, which is unbounded above (take $y$ large).`,
      },
      hints: [t`Liouville needs a bounded entire function. Can you build one from $f$?`, t`$|e^{w}| = e^{\operatorname{Re} w}$.`],
      teach: t`To use Liouville on a one-sided bound, compose with a function that turns the half-plane into a bounded set — $e^w$ does.`,
      explain: t`$e^f$ is entire and $|e^f| = e^{\operatorname{Re} f} \le e^3$: bounded, so constant. Then $f' e^f = 0$ forces $f' = 0$. (A conformal map to a disc would do the same job.)`,
    }),
    num({
      id: 'sin-i', difficulty: 2,
      gen(r) {
        const y = r.pick([1, 2, 3, 4]);
        const ans = Math.sinh(y);
        return {
          prompt: t`Liouville says the entire, non-constant $\sin z$ cannot be bounded. Check it: compute $|\sin(${y}i)|$. (3 significant figures.)`,
          visual: contour({ f: 'sin(z)', contour: null, panel: 'none', view: 'colour', marks: [{ x: 0, y, label: `${y}i`, kind: 'point' }], x: [-4, 4], y: [-4.5, 4.5], arrowsOn: false }, t`The colour picture of $\sin z$; the brightness bands mark each doubling of $|\sin z|$, and they crowd together up the imaginary axis.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: Math.sin(y), feedback: t`That is $\sin ${y}$ for the real number ${y}. With $z = ${y}i$, use $\sin(iy) = i\sinh y$.` }, { value: Math.cosh(y), feedback: t`$\sin(iy) = i\sinh y$; it is $\cos(iy)$ that equals $\cosh y$.` }]),
          hints: [t`$\sin z = \dfrac{e^{iz} - e^{-iz}}{2i}$; put $z = ${y}i$.`, t`$\sin(iy) = \dfrac{e^{-y} - e^{y}}{2i} = i\sinh y$.`],
          teach: t`$|\sin(iy)| = \sinh y$ grows like $e^{y}/2$: $\sin z$ is bounded only on the real axis.`,
          explain: t`$|\sin(${y}i)| = \sinh ${y} = ${nm(ans, 4)}$ — far above $1$, as Liouville insists for a non-constant entire function.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-best-R', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, 3]);
        const ans = Math.E * k;
        return {
          prompt: t`For $f(z) = e^{${k === 1 ? '' : k}z}$, the largest $|f|$ on the circle $|z| = R$ is $e^{${k === 1 ? '' : k}R}$, so the Cauchy estimate gives $|f'(0)| \le e^{${k === 1 ? '' : k}R}/R$ for every $R > 0$. What is the best (smallest) bound this family gives? (3 significant figures.)`,
          visual: { type: 'graph', params: { x: [0, 2.5 / k], y: [0, 6 * k], xlabel: 'R', ylabel: 'bound', curves: [{ fn: `e^(${k}*x)/x`, color: 'accent', domain: [0.05 / k, 2.5 / k], label: 'e^(kR)/R'.replace('k', String(k === 1 ? '' : k)) }] }, caption: t`The Cauchy-estimate bound as a function of the radius $R$. Small circles see a tiny $M$ but divide by a tiny $R$; big ones see a huge $M$.` },
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: k, feedback: t`That is the true value $|f'(0)| = ${k}$, not the best bound. Minimise $e^{${k}R}/R$ over $R$.` }, { value: Math.exp(k), feedback: t`That takes $R = 1$; the minimum of $e^{${k}R}/R$ is at $R = 1/${k}$.` }].filter((e) => k !== 1 || e.value !== Math.E)),
          hints: [t`Minimise $B(R) = e^{${k}R}/R$: set $B'(R) = 0$.`, t`$B'(R) = e^{${k}R}(${k}R - 1)/R^2 = 0$ at $R = 1/${k}$.`],
          teach: t`A Cauchy estimate holds for every radius: choose the radius that makes it smallest.`,
          explain: t`At $R = 1/${k}$: $B = e^{1}\cdot${k} = ${nm(ans, 4)}$, against the true $|f'(0)| = ${k}$. The estimate is honest but loose.`,
        };
      },
    }),
    mcq({
      id: 'cp-odd-real', difficulty: 2,
      prompt: t`The polynomial $z^7 - z + 5$ has real coefficients. What can you say for sure about its roots?`,
      visual: argand({ view: 1.8, circles: [{ r: 1.3 }], pts: [{ z: [0.6, 0.9], label: 'r', color: 'gold' }, { z: [0.6, -0.9], label: 'r̄', color: 'gold' }], caption: t`Complex roots of a real polynomial come in mirror-image pairs: if $r$ is a root, so is $\bar r$. (Points for illustration, not this polynomial’s roots.)` }),
      choices: [t`Exactly 7 complex roots counted with multiplicity, at least one of them real`, t`Exactly 7 roots, all real`, t`At most 7 roots, possibly none`, t`Exactly 7 roots, none of them real`],
      answer: 0,
      why: {
        1: t`The fundamental theorem gives 7 complex roots; nothing forces them onto the real line.`,
        2: t`Over the complex numbers there are always exactly 7 (with multiplicity) — never none.`,
        3: t`The non-real roots pair up as $r, \bar r$, so they come in even numbers; with 7 roots, at least one is unpaired — real.`,
      },
      hints: ['The fundamental theorem of algebra fixes the number of complex roots.', t`For real coefficients, $p(\bar r) = \overline{p(r)}$: non-real roots pair up.`],
      teach: t`Degree $n$ means $n$ complex roots; with real coefficients the non-real ones pair up, so odd degree forces a real root.`,
      explain: t`Seven roots in all; non-real ones come in conjugate pairs, an even number; $7$ is odd, so at least one is real. (Here exactly one is real, near $-1.30$: on the real line the polynomial is positive at both of its turning points, $x = \pm7^{-1/6}$, so it crosses zero only once.)`,
    }),
    num({
      id: 'cp-characteristic', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([3, 5, 0.5, 8]);
        // (s + p)(s + 1)((s + 2)² + 9) = (s² + (p + 1)s + p)(s² + 4s + 13)
        const a3 = p + 5, a2 = 13 + 4 * (p + 1) + p, a1 = 13 * (p + 1) + 4 * p, a0 = 13 * p;
        return {
          prompt: t`A launch vehicle’s pitch dynamics, with its autopilot and actuator, have the characteristic polynomial $$s^4 + ${nm(a3, 4)}s^3 + ${nm(a2, 4)}s^2 + ${nm(a1, 4)}s + ${nm(a0, 4)}$$ with $s$ in $\text{s}^{-1}$. An analysis has found three of its roots: $s = -1$ and $s = -2 \pm 3i$. Where is the fourth? (Use the sum of the roots.)`,
          visual: argand({ view: 4, center: [-3, 0], pts: [{ z: [-1, 0], label: '−1', color: 'gold' }, { z: [-2, 3], label: '−2 + 3i', color: 'gold' }, { z: [-2, -3], label: '−2 − 3i', color: 'gold' }], caption: t`The $s$-plane with the three known roots (all in the left half-plane: decaying motions). The fundamental theorem of algebra guarantees a fourth.` }),
          answer: -p, units: 's^-1', tol: { rel: 0.005 },
          errors: apart(-p, [{ value: p, feedback: t`For $s^4 + a_3s^3 + \dots$, the roots add up to $-a_3$, not $+a_3$.` }, { value: -a3, feedback: t`$-a_3$ is the sum of all four roots; subtract the three you know.` }]),
          hints: [t`A monic quartic factors as $(s - s_1)(s - s_2)(s - s_3)(s - s_4)$; expanding, the $s^3$ coefficient is $-(s_1 + s_2 + s_3 + s_4)$.`, t`$s_1 + s_2 + s_3 + s_4 = -${nm(a3, 4)}$, and the known three add to $-5$.`],
          teach: t`The fundamental theorem of algebra says a degree-$n$ characteristic polynomial has exactly $n$ roots; Vieta’s relations then tie them to the coefficients.`,
          explain: t`$s_4 = -${nm(a3, 4)} - (-5) = ${nm(-p, 4)}\ \text{s}^{-1}$: real and negative, so all four modes decay (the vehicle is stable). A real root of the polynomial with real coefficients — as it must be, since the other non-real roots already pair up. (A made-up but representative polynomial.)`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 7 (winding numbers) and ch. 9 (Liouville)', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), §§57–58', url: 'https://openlibrary.org/isbn/9780073383170' },
  ],
});
