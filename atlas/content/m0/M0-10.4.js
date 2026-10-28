// Powers and roots of complex numbers — De Moivre's theorem, and the n nth roots as the corners of a regular polygon.
import { lesson, mcq, num } from '../../src/core/content.js';
import { sig } from '../../src/core/format.js';
import { N, thou } from './_m0kit.js';
import { D2R, deg, wrap180, circ, plane, dot, note, seg } from './_m0geo.js';
import { M, cTeX, argand } from '../st-d/_cx.js';

const t = String.raw;
const roots = (c, n) => { const r = Math.pow(M.abs(c), 1 / n), a = M.arg(c); return Array.from({ length: n }, (_, k) => M.polar(r, (a + 2 * Math.PI * k) / n)); };
// the n roots as a polygon on their circle
const rootPic = (pts, caption, { extra = {}, view, labels = false } = {}) => {
  const rho = M.abs(pts[0]), V = view ?? 1.35 * rho;
  const curves = [circ([0, 0], rho, { color: 'ink4', width: 1, dash: true }), ...pts.map((p, k) => seg(p, pts[(k + 1) % pts.length], { color: 'accent', width: 1.8 }))];
  return plane({ x: [-2 * V, 2 * V], y: [-V, V], xlabel: 'Re', ylabel: 'Im', curves, points: pts.map((p, k) => dot(p, labels ? `w${'₀₁₂₃₄₅₆₇'[k]}` : '', { color: 'gold' })), caption, extra });
};
const POW = [
  { z: [1, 1], zT: '1 + i', n: [4, 8, 12] },
  { z: [1, -1], zT: '1 - i', n: [4, 8] },
  { z: [Math.sqrt(3), 1], zT: '\\sqrt3 + i', n: [6, 12] },
  { z: [1, Math.sqrt(3)], zT: '1 + \\sqrt3\\,i', n: [3, 6] },
];

export default lesson({
  id: 'm0.M0-10.4',
  title: 'Powers and roots of complex numbers',
  minutes: 10, difficulty: 3,
  intro: t`In polar form, powers are easy: multiplying $z = re^{i\theta}$ by itself $n$ times multiplies the length by $r$ and adds $\theta$, $n$ times. That is **De Moivre’s theorem**:

$$z^n = r^n e^{in\theta}, \qquad w_k = r^{1/n} e^{i(\theta + 2\pi k)/n},\ \ k = 0, 1, \ldots, n - 1$$

Roots run it backwards — but there is a twist. The angle of $c = re^{i\theta}$ is only fixed up to whole turns: $\theta$, $\theta + 2\pi$, $\theta + 4\pi, \ldots$ all name the same number. Divided by $n$, those turns become **different** angles, $2\pi/n$ apart. So every nonzero complex number has exactly $n$ distinct $n$th roots $w_k$, all of the same length $r^{1/n}$, spaced evenly round a circle: **the corners of a regular $n$-gon**. The $n$th roots of $1$ (the roots of unity) are the polygon with a corner at $1$.`,
  symbols: [
    { tex: 'z^n', text: 'the $n$th power of $z$ ($n$ a whole number)' },
    { tex: 'r,\\ \\theta', text: 'the modulus and argument of the number being raised or rooted (θ in radians)' },
    { tex: 'w_k', text: 'the $k$th of the $n$ roots; $w_0$ is the **principal** root, at angle $\\theta/n$ with $\\theta$ the principal argument' },
    { tex: 'r^{1/n}', text: 'the common modulus of all the roots: the ordinary positive real $n$th root of $r$' },
    { tex: '2\\pi/n', text: 'the angle between neighbouring roots ($360^\\circ/n$)' },
  ],
  why: t`Roots of unity are the frequencies of the discrete Fourier transform (the FFT behind every spectrum analyser), the symmetric phases of three-phase power, and the arrangement of evenly spaced antennas and satellites. De Moivre’s theorem turns a power of a complex number — say, of a damped oscillator’s phase factor after $n$ cycles — into one multiplication and one addition.`,
  visual: {
    type: 'graph',
    title: 'The n roots make a polygon',
    lead: t`Choose a number $c = Re^{i\varphi}$ and how many roots $n$ to take. The gold dots are the $n$ solutions of $w^n = c$, joined into a polygon; the faint ray shows the direction of $c$ itself.`,
    tasks: [
      t`Set $R = 1$, $\varphi = 0$: the roots of unity. A regular $n$-gon with a corner at $1$, for every $n$.`,
      t`Keep $n = 3$ and turn $\varphi$ from $0^\circ$ to $180^\circ$: the triangle turns only $60^\circ$ — the roots’ angles are $\varphi/3$ plus thirds of a turn.`,
      t`Set $R = 8$, $n = 3$: the roots sit on a circle of radius $8^{1/3} = 2$, much closer in than $c$.`,
    ],
    params: {
      x: [-6.4, 6.4], y: [-3.2, 3.2], equal: true, aspect: 'wide', xlabel: 'Re', ylabel: 'Im',
      sliders: [
        { key: 'n', label: t`Number of roots $n$`, min: 2, max: 8, step: 1, value: 5, explain: t`Solve $w^n = c$.` },
        { key: 'R', label: t`Modulus $R$ of $c$`, min: 1, max: 16, step: 0.5, value: 1, explain: t`The roots have modulus $R^{1/n}$.` },
        { key: 'ph', label: t`Argument $\varphi$ of $c$`, min: -180, max: 180, step: 5, value: 0, unit: '^\\circ', explain: t`The principal root is at $\varphi/n$.` },
      ],
      curves: [
        { param: ['R^(1/n)*cos(t)', 'R^(1/n)*sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: true },
        { param: ['3.1*t*cos(ph*pi/180)', '3.1*t*sin(ph*pi/180)'], t: [0, 1], color: 'ink3', width: 1.2, dash: true },
        {
          param: [
            'R^(1/n)*((1 - (min(t, n) - floor(min(t, n))))*cos((ph + 360*floor(min(t, n)))*pi/180/n) + (min(t, n) - floor(min(t, n)))*cos((ph + 360*(floor(min(t, n)) + 1))*pi/180/n))',
            'R^(1/n)*((1 - (min(t, n) - floor(min(t, n))))*sin((ph + 360*floor(min(t, n)))*pi/180/n) + (min(t, n) - floor(min(t, n)))*sin((ph + 360*(floor(min(t, n)) + 1))*pi/180/n))',
          ], t: [0, 8], color: 'accent', width: 2, samples: 2000,
        },
      ],
      points: Array.from({ length: 8 }, (_, k) => ({ x: `R^(1/n)*cos((ph + 360*${k})*pi/180/n)`, y: `R^(1/n)*sin((ph + 360*${k})*pi/180/n)`, r: k === 0 ? 6.5 : 5, color: 'gold', when: `step(n - ${k} - 0.5)`, ...(k === 0 ? { label: 'w₀', labelDx: 8, labelDy: -8 } : {}) })),
      readouts: [
        { label: t`$|w_k| = R^{1/n}$`, expr: 'R^(1/n)', digits: 4 },
        { label: t`principal angle $\varphi/n$`, expr: 'ph/n', digits: 4, unit: '^\\circ' },
        { label: t`spacing $360^\circ/n$`, expr: '360/n', digits: 4, unit: '^\\circ' },
      ],
    },
    caption: t`To scale for the roots; $c$ itself (modulus up to $16$) is shown only by its direction. Every root, raised to the $n$th power, lands on $c$.`,
  },
  example: {
    prompt: t`Find all three cube roots of $8i$.`,
    visual: rootPic(roots([0, 8], 3), t`The three cube roots of $8i$: an equilateral triangle on the circle of radius $2$.`, { labels: true, extra: { arrows: [{ from: [0, 0], to: [0, 2.6], color: 'ink3', width: 1.6, dash: true, label: 'toward 8i' }] } }),
    steps: [
      { label: 'Polar form', text: t`$8i = 8e^{i\pi/2}$: modulus $8$, argument $\tfrac{\pi}{2}$ ($90^\circ$).` },
      { label: 'Length', text: t`Every cube root has modulus $8^{1/3} = 2$.` },
      { label: 'Angles', text: t`$\dfrac{\pi/2 + 2\pi k}{3}$ for $k = 0, 1, 2$: that is $\tfrac{\pi}{6}$, $\tfrac{5\pi}{6}$ and $\tfrac{3\pi}{2}$ ($30^\circ$, $150^\circ$, $270^\circ$) — $120^\circ$ apart.` },
      { label: 'Rectangular', text: t`$w_0 = 2e^{i\pi/6} = \sqrt3 + i$, $\;w_1 = 2e^{5i\pi/6} = -\sqrt3 + i$, $\;w_2 = 2e^{3i\pi/2} = -2i$.` },
      { label: 'Check', text: t`$(-2i)^3 = -8i^3 = -8(-i) = 8i$ ✓. And $(\sqrt3 + i)^3 = (2 + 2\sqrt3\,i)(\sqrt3 + i) = 8i$ ✓.` },
    ],
    answer: t`$\sqrt3 + i$, $\ -\sqrt3 + i$, $\ -2i$.`,
  },
  practice: [
    num({
      id: 'power', difficulty: 2,
      gen(r) {
        const C = r.pick(POW), n = r.pick(C.n), p = M.polar(M.abs(C.z) ** n, n * M.arg(C.z)), ans = Math.round(p[0]);
        const naive = Math.round(C.z[0] ** n + (n % 4 === 0 ? 1 : n % 4 === 2 ? -1 : 0) * Math.abs(C.z[1]) ** n);
        return {
          prompt: t`$(${C.zT})^{${n}}$ is a real number. Which?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [
            { value: -ans, feedback: t`Right size, wrong sign: the angle is $${n} \times ${sig(deg(M.arg(C.z)), 3)}^\circ = ${sig(n * deg(M.arg(C.z)), 4)}^\circ$ — where on the real axis is that?` },
            { value: naive, feedback: t`$(a + b)^n \neq a^n + b^n$: the cross terms do not vanish. Go to polar form and use $z^n = r^ne^{in\theta}$.` },
          ].filter((e, i, A) => Math.abs(e.value - ans) > 0.01 && A.findIndex((o) => o.value === e.value) === i),
          hints: [t`$${C.zT} = ${sig(M.abs(C.z), 4) === '1.414' ? '\\sqrt2' : sig(M.abs(C.z), 4)}\,e^{i${sig(deg(M.arg(C.z)), 3)}^\circ}$.`, t`Raise the modulus to the $${n}$th power and multiply the angle by $${n}$.`],
          teach: t`De Moivre: $(re^{i\theta})^n = r^n e^{in\theta}$ — power the length, multiply the angle.`,
          explain: t`$|z|^{${n}} = ${thou(Math.abs(ans))}$ and $${n} \times ${sig(deg(M.arg(C.z)), 3)}^\circ = ${sig(n * deg(M.arg(C.z)), 4)}^\circ$, which points along the ${ans > 0 ? 'positive' : 'negative'} real axis: $(${C.zT})^{${n}} = ${ans}$.`,
          visual: argand({ arrows: [{ to: C.z, color: 'accent', label: 'z' }], arcs: [{ r: 0.6, from: Math.min(0, M.arg(C.z)), to: Math.max(0, M.arg(C.z)), color: 'gold' }], circles: [{ r: 1 }], view: 2.4, caption: t`$z$ and its argument; the dashed circle has radius $1$.` }),
        };
      },
    }),
    num({
      id: 'root-modulus', difficulty: 2,
      gen(r) {
        const [n, R] = r.pick([[4, 81], [3, 125], [5, 32], [4, 16], [3, 27], [6, 64]]), ph = r.pick([90, 180, -90, 60]), c = M.polar(R, ph * D2R), ans = Math.pow(R, 1 / n);
        return {
          prompt: t`What is the modulus of each ${['', '', 'square', 'cube', 'fourth', 'fifth', 'sixth'][n]} root of $c = ${R}e^{i\cdot ${ph}^\circ}$?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: R / n, feedback: t`Roots take the $n$th **root** of the modulus, $${R}^{1/${n}}$, not $${R}/${n}$.` }, { value: R, feedback: t`The roots are shorter than $c$: their modulus is $${R}^{1/${n}}$.` }],
          hints: [t`If $w^${n} = c$ then $|w|^${n} = |c| = ${R}$.`],
          teach: t`All $n$ roots share one modulus, $|c|^{1/n}$ — they lie on one circle.`,
          explain: t`$|w| = ${R}^{1/${n}} = ${sig(ans, 4)}$, for every one of the $${n}$ roots.`,
          visual: rootPic(roots(c, n), t`The ${n} roots (to scale) — their common distance from $0$ is what you are finding. Axis numbers hidden.`, { extra: { xticks: 0, yticks: 0 } }),
        };
      },
    }),
    num({
      id: 'principal-angle', difficulty: 3,
      gen(r) {
        const [cT, ph] = r.pick([['-16', 180], ['8i', 90], ['-27i', -90], ['-1', 180], ['4\\sqrt3 + 4i', 30]]), n = r.pick([3, 4, 6]), ans = ph / n;
        return {
          prompt: t`The principal ${n === 3 ? 'cube' : n === 4 ? 'fourth' : 'sixth'} root of $${cT}$ has argument $\varphi/${n}$, where $\varphi$ is the principal argument of $${cT}$. Find it, in degrees.`,
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.3 },
          errors: [{ value: ph, feedback: t`That is the argument of $${cT}$ itself. The root’s angle is that divided by $${n}$.` }, { value: 360 / n, feedback: t`$360^\circ/${n}$ is the spacing between neighbouring roots, not the first root’s angle.` }, { value: ph * n, feedback: t`Powers multiply the angle; roots divide it.` }].filter((e) => Math.abs(e.value - ans) > 0.3),
          hints: [t`Find $\arg(${cT})$ first: where does it point?`, t`$\arg(${cT}) = ${ph}^\circ$; divide by $${n}$.`],
          teach: t`The principal $n$th root sits at $\arg c / n$; the others follow every $360^\circ/n$.`,
          explain: t`$\arg(${cT}) = ${ph}^\circ$, so the principal root is at $${ph}^\circ/${n} = ${sig(ans, 4)}^\circ$; the others are at $${sig(ans, 4)}^\circ + k\cdot${sig(360 / n, 4)}^\circ$.`,
          visual: argand({ arrows: [{ to: M.polar(2, ph * D2R), color: 'accent', label: 'direction of c' }], circles: [{ r: 1 }], view: 2.4, caption: t`The direction of $${cT}$ (not to scale) and the unit circle.` }),
        };
      },
    }),
    {
      type: 'point', id: 'drag-root', difficulty: 3,
      gen(r) {
        const [cT, c, n, q, quad] = r.pick([['-8', [-8, 0], 3, 1, 'first'], ['2i', [0, 2], 2, 1, 'first'], ['-4', [-4, 0], 4, 1, 'second'], ['8i', [0, 8], 3, 1, 'second'], ['-8', [-8, 0], 3, 2, 'fourth']]);
        const W = roots(c, n), w = W.find((p) => (quad === 'first' ? p[0] > 0 && p[1] > 0 : quad === 'second' ? p[0] < 0 && p[1] > 0 : p[0] > 0 && p[1] < 0));
        const v = argand({ circles: [{ r: M.abs(W[0]) }], view: 2.6, caption: t`The dashed circle has radius $|${cT}|^{1/${n}} = ${sig(M.abs(W[0]), 3)}$: every root lies on it. Drag the gold point.` });
        v.params.drag = [{ key: 'p', x: 0.2, y: -0.2, snap: 0.05 }];
        void q;
        return {
          prompt: t`Drag the gold point to the ${n === 2 ? 'square' : n === 3 ? 'cube' : 'fourth'} root of $${cT}$ that lies in the **${quad} quadrant**.`,
          visual: v, answer: { x: +w[0].toFixed(6), y: +w[1].toFixed(6) }, tol: { x: 0.2, y: 0.2 },
          instruction: 'Drag the point to the root, then check.',
          hints: [t`$${cT}$ has argument $${sig(deg(M.arg(c)), 3)}^\circ$; the roots are at $\tfrac{${sig(deg(M.arg(c)), 3)}^\circ + 360^\circ k}{${n}}$.`, t`List those angles for $k = 0, 1${n > 2 ? ', 2' : ''}${n > 3 ? ', 3' : ''}$ and pick the one in the ${quad} quadrant.`],
          teach: t`The $n$th roots sit at $\arg c / n + k \cdot 360^\circ/n$ on the circle of radius $|c|^{1/n}$.`,
          explain: t`The root is $${cTeX(w, 3)}$, at angle $${sig(wrap180(deg(M.arg(w))), 3)}^\circ$. Check: raise it to the $${n}$th power and you get $${cT}$.`,
        };
      },
    },
    mcq({
      id: 'sum-unity', difficulty: 2,
      gen(r) {
        const n = r.pick([5, 6, 7, 8]);
        return {
          prompt: t`What is the sum of all ${n} of the ${n}th roots of unity, $1 + \omega + \omega^2 + \cdots + \omega^{${n - 1}}$ with $\omega = e^{2\pi i/${n}}$?`,
          choices: ['$0$', '$1$', `$${n}$`, '$-1$'],
          answer: 0,
          why: {
            1: t`$1$ is just the first root; the others do not all cancel to nothing — they cancel each other **and** the $1$.`,
            2: t`$${n}$ would need every root to equal $1$. They point in ${n} different directions.`,
            3: t`$-1$ is the sum of all the roots **except** $1$; the question includes $1$.`,
          },
          hints: [t`Think of the roots as arrows from $0$ to the corners of the polygon. Rotate the whole picture by $\omega$: what happens to the sum?`],
          teach: t`The $n$th roots of unity are symmetric about $0$, so their arrows cancel: the sum is $0$ (for $n \ge 2$).`,
          explain: t`Multiplying the sum $S$ by $\omega$ just permutes the roots, so $\omega S = S$; since $\omega \ne 1$, $S = 0$. Physically: ${n} equal forces at equal angles balance.`,
          visual: rootPic(roots([1, 0], n), t`The ${n}th roots of unity: a regular ${n}-gon with a corner at $1$.`),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ring', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([4, 6, 8]), a0 = r.pick([10, 15, 25]), k = r.pick([2, 3]), R = 7000, ang = a0 + (360 * k) / n, ans = R * Math.cos(ang * D2R);
        return {
          prompt: t`${n} relay satellites are spaced evenly round a circular orbit of radius $7\,000$ km. Their positions, as complex numbers in km, are $7\,000\,e^{i\cdot ${a0}^\circ}$ times the ${n}th roots of unity. What is the $x$-coordinate (real part) of the satellite ${k} places on from the one at $${a0}^\circ$, going anticlockwise?`,
          answer: ans, units: 'km', tol: { rel: 0.005, abs: 20 },
          errors: [{ value: R * Math.cos((a0 + 360 / n) * D2R), feedback: t`That is the next satellite, one place on. ${k} places is $${k} \times ${360 / n}^\circ$.` }, { value: R * Math.sin(ang * D2R), feedback: t`That is the $y$-coordinate.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * R),
          hints: [t`Neighbours are $360^\circ/${n} = ${360 / n}^\circ$ apart.`, t`Angle $= ${a0}^\circ + ${k} \times ${360 / n}^\circ = ${ang}^\circ$; $x = 7\,000\cos ${ang}^\circ$.`],
          teach: t`Multiplying by the $k$th root of unity $\omega^k$ turns a position by $k \cdot 360^\circ/n$.`,
          explain: t`$x = 7\,000\cos ${ang}^\circ = ${thou(ans)}$ km.`,
          visual: (() => { const v = rootPic(roots(M.polar(1, n * a0 * D2R), n).map((p) => [7 * p[0], 7 * p[1]]), t`The ring of satellites (in thousands of km), to scale; the gold dot labelled is the one at $${a0}^\circ$.`); v.params.points[0].label = `${a0}°`; return v; })(),
        };
      },
    }),
    mcq({
      id: 'cp-cuberoots', difficulty: 2,
      prompt: t`What are the cube roots of $-8$?`,
      choices: [t`$-2,\ \ 1 + \sqrt3\,i,\ \ 1 - \sqrt3\,i$`, t`$-2$ only`, t`$2,\ \ -1 + \sqrt3\,i,\ \ -1 - \sqrt3\,i$`, t`$-2,\ \ 2i,\ \ -2i$`],
      answer: 0,
      why: {
        1: t`$-2$ is the only **real** cube root, but every nonzero number has three complex cube roots.`,
        2: t`Those are the cube roots of $+8$: the triangle is turned by $60^\circ$.`,
        3: t`$(2i)^3 = -8i$, not $-8$. The roots must be $120^\circ$ apart; $\pm 2i$ and $-2$ are $90^\circ$ apart.`,
      },
      hints: [t`$-8 = 8e^{i\pi}$: modulus $2$, angles $\tfrac{\pi + 2\pi k}{3}$.`],
      teach: t`Three cube roots, $120^\circ$ apart, on the circle of radius $|c|^{1/3}$.`,
      explain: t`Angles $60^\circ$, $180^\circ$, $300^\circ$ at radius $2$: $1 + \sqrt3\,i$, $-2$, $1 - \sqrt3\,i$.`,
      visual: argand({ circles: [{ r: 2 }], arrows: [{ to: [-2.4, 0], color: 'ink3', dash: [5, 4], label: 'toward −8' }], view: 2.6, caption: t`The circle of radius $8^{1/3} = 2$ on which every cube root of $-8$ must lie.` }),
    }),
    num({
      id: 'cp-power', difficulty: 3,
      gen(r) {
        const n = r.pick([3, 6, 9]), z = [1, -Math.sqrt(3)], ans = Math.round(M.polar(2 ** n, n * M.arg(z))[0]);
        return {
          prompt: t`Compute $(1 - \sqrt3\,i)^{${n}}$. (It is real.)`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -ans, feedback: t`Sign: the angle is $${n} \times (-60^\circ) = ${-60 * n}^\circ$.` }, { value: 2 ** n, feedback: t`$2^{${n}}$ is the modulus; the direction at $${-60 * n}^\circ$ decides the sign.` }].filter((e, i, A) => Math.abs(e.value - ans) > 0.01 && A.findIndex((o) => o.value === e.value) === i),
          hints: [t`$1 - \sqrt3\,i = 2e^{-i\pi/3}$.`, t`$(2e^{-i\pi/3})^{${n}} = 2^{${n}}e^{-i${n}\pi/3}$.`],
          teach: t`De Moivre: power the modulus, multiply the argument, then read off the point.`,
          explain: t`$2^{${n}} = ${2 ** n}$ and $${n} \times (-60^\circ) = ${-60 * n}^\circ$, which points ${ans > 0 ? 'along the positive' : 'along the negative'} real axis: $${ans}$.`,
          visual: argand({ arrows: [{ to: z, color: 'accent', label: '1 − √3 i' }], circles: [{ r: 2 }], view: 2.6, caption: t`$1 - \sqrt3\,i$: modulus $2$, argument $-60^\circ$.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §8.5 Polar Form of Complex Numbers (De Moivre’s theorem, nth roots)', url: 'https://openstax.org/books/precalculus-2e/pages/8-5-polar-form-of-complex-numbers' },
  ],
});
void N; void note;
