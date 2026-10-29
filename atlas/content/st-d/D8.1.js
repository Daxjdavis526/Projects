// Isolated singularities, classified by the Laurent series on a punctured
// disc 0 < |z − a| < r: no negative powers — removable (fill in one value);
// finitely many, the lowest (z − a)^(−m) — a pole of order m (|f| → ∞ like
// 1/|z − a|^m); infinitely many — essential (Casorati–Weierstrass: f comes
// arbitrarily close to every value in every neighbourhood). The colour
// picture shows all three at a glance. Physics: a black hole's quasinormal
// modes are poles of its response in the complex frequency plane, each one
// a damped ringing tone.
import { lesson, mcq, num } from '../../src/core/content.js';
import { num as nm, apart } from './_cx.js';
import { contour } from './_cx2.js';

const t = String.raw;
const PI = Math.PI;
const at0 = (label = '0') => [{ x: 0, y: 0, label, kind: 'point' }];
const colour = (f, o, caption) => contour({ f, contour: null, panel: 'none', view: 'colour', arrowsOn: false, x: [-1.6, 1.6], y: [-1.2, 1.2], ...o }, caption);

export default lesson({
  id: 'st-d.D8.1',
  title: 'Poles, essential singularities and removable ones',
  minutes: 13, difficulty: 3,
  intro: t`A point $a$ where $f$ is not analytic, though it is analytic all round it, is an **isolated singularity**. On a punctured disc $0 < |z - a| < r$, $f$ has a Laurent series, and its negative powers — the **principal part** — say what kind of singularity $a$ is:

$$f(z) = \underbrace{\cdots + \frac{a_{-2}}{(z - a)^2} + \frac{a_{-1}}{z - a}}_{\text{principal part}} + a_0 + a_1(z - a) + \cdots$$

- **Removable**: no negative powers. $f$ has a finite limit at $a$; define $f(a)$ as that limit and the singularity disappears ($\sin z/z$ at $0$).
- **Pole of order $m$**: finitely many, the lowest $(z - a)^{-m}$. $|f| \to \infty$ like $1/|z - a|^m$ ($1/z^2$ at $0$ is a pole of order 2).
- **Essential**: infinitely many. Near $a$, $f$ comes arbitrarily close to **every** complex value (Casorati–Weierstrass) — $e^{1/z}$ at $0$.`,
  symbols: [
    { tex: 'a', text: 'the isolated singular point' },
    { tex: t`a_{-k}`, text: t`the Laurent coefficients of the negative powers $(z - a)^{-k}$, read from the series on $0 < |z - a| < r$` },
    { tex: 'm', text: t`the order of a pole: the highest $k$ with $a_{-k} \ne 0$; then $(z - a)^m f(z)$ has a removable singularity with a non-zero value` },
  ],
  why: t`Poles are where a system resonates: the poles of a transfer function are a structure’s or a circuit’s natural modes, and the poles of a black hole’s response are the quasinormal tones of its ringdown.`,
  visual: {
    type: 'cx2-contour',
    title: 'Three kinds of singularity, in colour',
    lead: t`Each point is painted by the value of $f$: the hue gives $\arg f$ (red for positive reals, then yellow-green, blue and violet anticlockwise round the colour wheel) and the brightness bands step where $|f|$ doubles. Choose a function and look at the origin.`,
    tasks: [
      t`$\sin z/z$: nothing happens at $0$ — the colours pass smoothly through. Removable.`,
      t`$1/z$ and $1/z^3$: walking anticlockwise round $0$, the colours run backwards (red, violet, blue, yellow) — once for $1/z$, three times for $1/z^3$ — and the brightness bands crowd into the point. Poles of order 1 and 3. Compare $z^2$: the colours run forwards, twice — a zero of order 2.`,
      t`$e^{1/z}$: every colour and every brightness crowd into $0$ in ever-smaller loops. Essential.`,
    ],
    params: {
      fns: [
        { f: 'sin(z)/z', label: t`$\sin z/z$`, marks: at0() },
        { f: '1/z', label: '$1/z$', marks: at0() },
        { f: '1/z^3', label: '$1/z^3$', marks: at0() },
        { f: 'z^2', label: '$z^2$', marks: at0() },
        { f: 'exp(1/z)', label: '$e^{1/z}$', marks: at0() },
      ],
      contour: null, panel: 'none', view: 'colour', arrowsOn: false, x: [-1.6, 1.6], y: [-1.2, 1.2], fLabel: 'Function $f(z)$',
    },
    caption: t`Enhanced phase portrait (Wegert’s style): hue for the argument, stepped brightness for the size. Near $e^{1/z}$’s essential singularity the pattern is finer than the pixels, so the centre looks noisy — that is the function, not a bug.`,
  },
  example: {
    prompt: t`Classify the singularity of $f(z) = \dfrac{1 - \cos z}{z^4}$ at $0$.`,
    visual: colour('(1 - cos(z))/z^4', { marks: at0() }, t`The colour picture of $(1 - \cos z)/z^4$: the colours circle $0$ twice, backwards, and the bands crowd in — a double pole.`),
    steps: [
      { label: 'Expand', text: t`$\cos z = 1 - \dfrac{z^2}{2} + \dfrac{z^4}{24} - \cdots$, so $1 - \cos z = \dfrac{z^2}{2} - \dfrac{z^4}{24} + \dfrac{z^6}{720} - \cdots$.` },
      { label: 'Divide', text: t`$f(z) = \dfrac{1}{2z^2} - \dfrac{1}{24} + \dfrac{z^2}{720} - \cdots$ on $0 < |z| < \infty$.` },
      { label: 'Read', text: t`The principal part is just $\dfrac{1}{2z^2}$: finitely many negative powers, the lowest $z^{-2}$. A **pole of order 2**.` },
      { label: 'Shortcut', text: t`$1 - \cos z$ has a zero of order 2 at $0$ (it starts with $z^2$), and $z^4$ a zero of order 4: the quotient has a pole of order $4 - 2 = 2$.` },
      { label: 'Note', text: t`There is no $1/z$ term: $a_{-1} = 0$. A pole can have zero residue — so $\oint f\,dz = 0$ round $0$, even though $f$ blows up there.` },
    ],
    answer: t`A pole of order 2, with principal part $\frac{1}{2z^2}$ (and residue $0$).`,
  },
  practice: [
    mcq({
      id: 'sinc', difficulty: 1,
      prompt: t`What kind of singularity does $\dfrac{\sin z}{z}$ have at $0$?`,
      visual: colour('sin(z)/z', { marks: at0() }, t`The colour picture of $\sin z/z$ round $0$.`),
      choices: ['Removable', 'A simple pole', 'A pole of order 2', 'Essential'],
      answer: 0,
      why: {
        1: t`$\sin z \approx z$ near $0$, so the quotient tends to $1$: it does not blow up.`,
        2: t`Nothing blows up; there is not even one negative power.`,
        3: t`The Laurent series $1 - \frac{z^2}{6} + \cdots$ has no negative powers at all.`,
      },
      hints: [t`Expand $\sin z = z - \frac{z^3}{6} + \cdots$ and divide by $z$.`],
      teach: 'No negative powers in the Laurent series: a removable singularity.',
      explain: t`$\frac{\sin z}{z} = 1 - \frac{z^2}{3!} + \frac{z^4}{5!} - \cdots$. Define its value at $0$ as $1$ and it is entire.`,
    }),
    num({
      id: 'order', difficulty: 2,
      gen(r) {
        const [fT, src, m] = r.pick([
          [t`\dfrac{\sin z}{z^4}`, 'sin(z)/z^4', 3],
          [t`\dfrac{\sin z}{z^3}`, 'sin(z)/z^3', 2],
          [t`\dfrac{1 - \cos z}{z^5}`, '(1 - cos(z))/z^5', 3],
          [t`\dfrac{1}{z^2\sin z}`, '1/(z^2*sin(z))', 3],
          [t`\dfrac{z - 2}{z^3(z + 1)}`, '(z - 2)/(z^3*(z + 1))', 3],
          [t`\dfrac{e^z - 1}{z^3}`, '(exp(z) - 1)/z^3', 2],
        ]);
        return {
          prompt: t`What is the order of the pole of $${fT}$ at $z = 0$?`,
          visual: colour(src, { marks: at0() }, t`The colour picture near $0$: count how many times the colours circle the origin.`),
          answer: m, tol: { rel: 0, abs: 0.4 },
          errors: src.startsWith('1/') || src.startsWith('(z - 2)') ? [] : [{ value: m + 1, feedback: t`The numerator vanishes at $0$ too: subtract its zero’s order from the denominator’s.` }],
          hints: [t`Write numerator and denominator as $z^k\times$(something non-zero at $0$).`, t`Order of the pole = (order of the zero of the denominator) − (order of the zero of the numerator).`],
          teach: t`At a quotient $g/h$, a pole’s order is the order of $h$’s zero minus the order of $g$’s.`,
          explain: t`The pole has order $${m}$: the lowest power in the Laurent series is $z^{-${m}}$, and the colours circle $0$ ${m} times.`,
        };
      },
    }),
    mcq({
      id: 'essential', difficulty: 2,
      prompt: t`What kind of singularity does $e^{1/z}$ have at $0$?`,
      visual: colour('exp(1/z)', { marks: at0(), x: [-0.8, 0.8], y: [-0.6, 0.6] }, t`The colour picture of $e^{1/z}$ near $0$: every colour, every brightness.`),
      choices: ['Essential', 'A pole of infinite order, which behaves like a very strong pole', 'A simple pole', 'Removable'],
      answer: 0,
      why: {
        1: t`There is no such thing as a pole of infinite order: $e^{1/z}$ does not tend to $\infty$. Along the negative real axis, $e^{1/x} \to 0$.`,
        2: t`$e^{1/z} = 1 + \frac1z + \frac{1}{2z^2} + \cdots$ has infinitely many negative powers.`,
        3: t`It has no limit at $0$: along the positive real axis it blows up, along the negative one it tends to $0$.`,
      },
      hints: [t`Write the Laurent series: $e^w = \sum w^k/k!$ with $w = 1/z$.`, t`Count the negative powers. Then compare $z \to 0^+$ with $z \to 0^-$ along the real axis.`],
      teach: 'Infinitely many negative powers: an essential singularity — not a pole, however strong.',
      explain: t`$e^{1/z} = \sum_{k \ge 0} \frac{1}{k!\,z^k}$: infinitely many negative powers. As $x \to 0^+$, $e^{1/x} \to \infty$; as $x \to 0^-$, $e^{1/x} \to 0$; along the imaginary axis it circles the unit circle forever. Essential.`,
    }),
    num({
      id: 'fill-in', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 5]), [fT, src, val] = r.pick([[t`\dfrac{e^{${k}z} - 1}{z}`, `(exp(${k}*z) - 1)/z`, k], [t`\dfrac{\sin ${k}z}{z}`, `sin(${k}*z)/z`, k], [t`\dfrac{1 - \cos ${k}z}{z^2}`, `(1 - cos(${k}*z))/z^2`, (k * k) / 2]]);
        return {
          prompt: t`$f(z) = ${fT}$ has a removable singularity at $0$. What value must $f(0)$ be given to make $f$ analytic there?`,
          visual: colour(src, { marks: at0() }, t`The colour picture of $f$: smooth through $0$.`),
          answer: val, tol: { rel: 0.005 },
          errors: apart(val, [{ value: 0, feedback: t`The value is the limit, not $0$: expand the numerator.` }, { value: 1, feedback: t`Keep the $${k}$ from the inner function.` }]),
          hints: [t`Expand the numerator in a Taylor series about $0$.`, t`Divide; the constant term is the limit.`],
          teach: 'At a removable singularity, the right value is the limit — the constant term of the Laurent (now Taylor) series.',
          explain: t`The series starts with the constant $${nm(val, 4)}$, so $f(0) = ${nm(val, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'read-colours', difficulty: 3,
      prompt: t`Walking once anticlockwise round the marked point $P$, you see the colours go red → violet → blue → yellow-green → red **twice**, and the brightness bands crowd into $P$. What is $P$?`,
      visual: colour('(z - 1)/(z + 0.5)^2', { marks: [{ x: -0.5, y: 0, label: 'P', kind: 'point' }], x: [-1.8, 1.8], y: [-1.3, 1.3] }, t`A colour picture with a marked point $P$ (and another feature at $1$).`),
      choices: ['A pole of order 2', 'A zero of order 2', 'A simple pole', 'An essential singularity'],
      answer: 0,
      why: {
        1: t`Round a zero the argument **increases** as you go anticlockwise (red → yellow-green → blue → violet), and the bands thin out towards it, not crowd in.`,
        2: t`A simple pole cycles the colours once.`,
        3: t`An essential singularity shows every colour in ever-tighter loops, not a clean double cycle.`,
      },
      hints: [t`Near a pole of order $m$, $f \approx c/(z - P)^m$, so $\arg f \approx \arg c - m\arg(z - P)$: it decreases $m$ turns per lap.`, 'The colour order red → violet → blue is the backwards order.'],
      teach: t`Colour pictures: $m$ forward colour cycles mark a zero of order $m$; $m$ backward cycles, with crowding bands, a pole of order $m$.`,
      explain: t`Two backward cycles and bands crowding in: a pole of order 2 — here $f = (z - 1)/(z + \tfrac12)^2$. Its zero at $1$ shows one forward cycle.`,
    }),
    num({
      id: 'casorati', difficulty: 3,
      gen(r) {
        const eps = r.pick([0.1, 0.05, 0.01]);
        const k = Math.ceil((1 / (eps * PI) - 1) / 2), ans = 1 / ((2 * k + 1) * PI);
        return {
          prompt: t`The equation $e^{1/z} = -1$ has the solutions $z = \dfrac{1}{(2k + 1)\pi i}$ for every whole $k$ (since $e^{w} = -1$ when $w = (2k + 1)\pi i$). Infinitely many crowd into $0$. What is the size $|z|$ of the largest solution inside the disc $|z| < ${eps}$? (3 significant figures.)`,
          visual: colour('exp(1/z)', { marks: [0, 1, 2, 3].map((j) => ({ x: 0, y: -1 / ((2 * j + 1) * PI), label: j === 0 ? 'solutions' : '', kind: 'zero' })), x: [-0.6, 0.6], y: [-0.45, 0.45] }, t`$e^{1/z}$ near $0$, with the first few solutions of $e^{1/z} = -1$ circled; the others pile up towards $0$.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: eps, feedback: t`The solutions sit at the discrete sizes $1/((2k + 1)\pi)$; find the first below $${eps}$.` }]),
          hints: [t`$|z| = \dfrac{1}{(2k + 1)\pi}$. You need $(2k + 1)\pi > ${nm(1 / eps, 3)}$.`, t`So $2k + 1 > ${nm(1 / (eps * PI), 4)}$: the smallest odd number above that is $${2 * k + 1}$.`],
          teach: t`Near an essential singularity $f$ takes values like $-1$ infinitely often, in every neighbourhood — Picard’s theorem says it takes every value but at most one.`,
          explain: t`$2k + 1 = ${2 * k + 1}$, so $|z| = 1/(${2 * k + 1}\pi) = ${nm(ans, 4)}$. Shrink the disc as you like: there are always more. (Casorati–Weierstrass says $f$ gets arbitrarily close to every value; Picard’s great theorem — enrichment, not proved here — says it hits every value except possibly one. $e^{1/z}$ misses only $0$.)`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-order', difficulty: 2,
      gen(r) {
        const m = r.pick([1, 2, 3]);
        return {
          prompt: t`What is the order of the pole of $\dfrac{1}{z^{${m}}(e^z - 1)}$ at $z = 0$?`,
          visual: colour(`1/(z^${m}*(exp(z) - 1))`, { marks: at0() }, t`The colour picture near $0$.`),
          answer: m + 1, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: m, feedback: t`$e^z - 1$ also vanishes at $0$ (it starts with $z$), adding one to the order.` }],
          hints: [t`$e^z - 1 = z\left(1 + \frac z2 + \cdots\right)$.`],
          teach: 'Orders of zeros in a denominator add up to the order of the pole.',
          explain: t`The denominator is $z^{${m + 1}}(1 + \frac z2 + \cdots)$: a pole of order $${m + 1}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-z-sin', difficulty: 2,
      prompt: t`Classify the singularities of $\dfrac{z}{\sin z}$ at $z = 0$ and at $z = \pi$.`,
      visual: colour('z/sin(z)', { marks: [{ x: 0, y: 0, label: '0', kind: 'point' }, { x: PI, y: 0, label: 'π', kind: 'point' }], x: [-1.2, 4.4], y: [-1.7, 1.7] }, t`The colour picture of $z/\sin z$ from $0$ to just past $\pi$.`),
      choices: [t`Removable at $0$; a simple pole at $\pi$`, t`Simple poles at both`, t`Removable at both`, t`A simple pole at $0$; essential at $\pi$`],
      answer: 0,
      why: {
        1: t`At $0$ the numerator vanishes too: $z/\sin z \to 1$.`,
        2: t`At $\pi$ the numerator is $\pi \ne 0$ while $\sin z$ has a simple zero, so $|f| \to \infty$.`,
        3: t`A quotient of analytic functions never has an essential singularity where the denominator has a zero of finite order.`,
      },
      hints: [t`Near each point, compare the orders of the zeros of numerator and denominator.`, t`$\sin z$ has simple zeros at $0$ and $\pi$; $z$ vanishes only at $0$.`],
      teach: 'A zero of the denominator cancelled by one of the numerator is removable; uncancelled, it is a pole.',
      explain: t`At $0$: both vanish to first order, the limit is $1$ — removable. At $\pi$: only the denominator vanishes, to first order — a simple pole (residue $\pi/\cos\pi = -\pi$).`,
    }),
    num({
      id: 'cp-qnm', difficulty: 3, transfer: true,
      gen(r) {
        const M = r.pick([30, 62, 100]);
        const tM = 1.3271244e20 / 299792458 ** 3 * M, wR = 0.37367168, ans = wR / (2 * PI * tM);
        return {
          prompt: t`Kick a black hole and its gravitational-wave response, as a function of complex frequency $\omega$, has **simple poles** at the quasinormal frequencies, all in the lower half-plane. Each pole $\omega_n$ contributes a ringing term $e^{-i\omega_n t}$ to the signal. For a non-spinning black hole the dominant pole is at $GM\omega/c^3 = 0.37367 - 0.08896\,i$. For $M = ${M}\,M_\odot$ (with $GM_\odot/c^3 = 4.9255\ \mu\text{s}$), what frequency $f = \operatorname{Re}\omega/2\pi$ does the ringdown sound at?`,
          visual: contour({ f: '1/((z - 0.3737 + 0.0890i)*(z + 0.3737 + 0.0890i))', contour: null, panel: 'none', view: 'colour', arrowsOn: false, marks: [{ x: 0.3737, y: -0.089, label: 'ω₀', kind: 'pole' }, { x: -0.3737, y: -0.089, label: 'mirror', kind: 'pole' }], x: [-0.8, 0.8], y: [-0.5, 0.5], zname: 'complex frequency plane, GMω/c³' }, t`A model response with just the dominant pole and its mirror partner (real signals need both), in the plane of $GM\omega/c^3$. Real black holes have infinitely many overtone poles further down; they decay faster and are omitted here.`),
          answer: ans, units: 'Hz', tol: { rel: 0.01 },
          errors: apart(ans, [{ value: wR / tM, feedback: t`That is $\operatorname{Re}\omega$ in rad/s; divide by $2\pi$ for hertz.` }, { value: 0.08896232 / (2 * PI * tM), feedback: t`The imaginary part sets the decay; the real part sets the pitch.` }]),
          hints: [t`$GM/c^3 = ${M}\times4.9255\ \mu\text{s} = ${nm(tM * 1e6, 4)}\ \mu\text{s}$, so $\operatorname{Re}\omega = 0.37367/(${nm(tM * 1e6, 4)}\ \mu\text{s})$.`, t`Then $f = \operatorname{Re}\omega / 2\pi$.`],
          teach: t`A simple pole at $\omega_R - i\omega_I$ is a tone of frequency $\omega_R/2\pi$ dying away in a time $1/\omega_I$: the position of the pole is the sound.`,
          explain: t`$\operatorname{Re}\omega = ${nm(wR / tM, 4)}$ rad/s, so $f = ${nm(ans, 4)}$ Hz, damping time $1/\omega_I = ${nm((tM / 0.08896232) * 1000, 3)}$ ms. Heavier holes ring lower, in proportion to $1/M$. (Non-spinning assumed. GW150914’s remnant, about $62\,M_\odot$, spins with $a \approx 0.67$, which raises its ringdown to about 250 Hz. Mode frequency from Leaver’s continued fraction.)`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), §§72–76 (singular points, zeros and poles)', url: 'https://openlibrary.org/isbn/9780073383170' },
    { label: 'Wegert & Semmler, Phase plots of complex functions, Notices AMS 58(6), 2011', url: 'https://www.ams.org/notices/201106/rtx110600768p.pdf' },
    { label: 'Berti, Cardoso & Starinets, Quasinormal modes of black holes and black branes, CQG 26, 163001 (2009)', url: 'https://arxiv.org/abs/0905.2975' },
  ],
});
