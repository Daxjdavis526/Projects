// Inverse trigonometric functions — arcsin, arccos and arctan answer from restricted branches; the other solutions are yours to add.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sig } from '../../src/core/format.js';
import { N } from './_m0kit.js';
import { PI, D2R, piTeX, triFig, trigGraph } from './_m0trig.js';

const t = String.raw;
const deg = (x) => x / D2R;
// the launch-azimuth example: Kennedy Space Center to the ISS orbit (no Earth rotation)
const KSC = (() => { const lat = 28.6, inc = 51.6, s = Math.cos(inc * D2R) / Math.cos(lat * D2R), b = deg(Math.asin(s)); return { lat, inc, s, b }; })();
// a compass card with north up and two azimuths (degrees clockwise from north)
const compass = (az, caption, labels = []) => ({
  type: 'graph',
  params: { x: [-1.5, 1.5], y: [-1.25, 1.25], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, N(2 * PI)], color: 'ink4', width: 1.2 }, { param: ['0', 't'], t: [-1, 1], color: 'ink4', width: 1 }, { param: ['t', '0'], t: [-1, 1], color: 'ink4', width: 1 }],
    points: [{ x: 0, y: 1, r: 0, label: 'N', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: -10 }, { x: 1, y: 0, r: 0, label: 'E', color: 'ink2', labelDx: 8, labelDy: 0 }, { x: 0, y: -1, r: 0, label: 'S', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: 12 }, { x: -1, y: 0, r: 0, label: 'W', color: 'ink2', labelAlign: 'right', labelDx: -8, labelDy: 0 }],
    arrows: az.map((a, i) => ({ from: [0, 0], to: [N(0.95 * Math.sin(a * D2R)), N(0.95 * Math.cos(a * D2R))], color: i ? 'violet' : 'gold', width: 2.6, label: labels[i], labelDx: 8, labelDy: i ? 12 : -8 })) },
  caption,
});
// the sine (or cos, tan) curve with its principal branch in green, and the level y = v
const branchGraph = (fnName, v, caption, extra = {}) => {
  const [lo, hi] = fnName === 'cos' ? [0, PI] : [-PI / 2, PI / 2];
  return trigGraph({ curves: [{ fn: `${fnName}(x)`, color: 'ink3', width: 1.4, samples: fnName === 'tan' ? 900 : undefined }, { fn: `${fnName}(x)`, color: 'good', width: 4, domain: [N(fnName === 'tan' ? lo + 0.03 : lo), N(fnName === 'tan' ? hi - 0.03 : hi)] }], lo: -PI, hi: 2 * PI, y: fnName === 'tan' ? [-3.5, 3.5] : [-1.4, 1.4], extra: { ...(v === null ? {} : { hlines: [{ y: N(v), color: 'gold' }] }), ...extra }, caption });
};

export default lesson({
  id: 'm0.M0-8.4',
  title: 'Inverse trigonometric functions',
  minutes: 11, difficulty: 3,
  intro: t`To undo $\sin$ you need a function, and a function must give **one** answer — but $\sin\theta = \tfrac12$ has infinitely many solutions. So each inverse answers only from a restricted **principal range**, where the original is one-to-one:

$$\theta = \arcsin v \iff \sin\theta = v \ \text{ and } \ -\tfrac{\pi}{2} \le \theta \le \tfrac{\pi}{2}$$

Likewise $\arccos v$ lies in $[0, \pi]$ and $\arctan v$ in $\left(-\tfrac{\pi}{2}, \tfrac{\pi}{2}\right)$. Two warnings. **$\sin^{-1} v$ means $\arcsin v$, not $1/\sin v$** (that is $\csc v$). And a calculator returns only the principal angle: **the other solutions are yours to find** — for a sine, $\pi - \theta$ is the second one in each turn. Compositions are easiest with a triangle: $\sin(\arccos x) = \sqrt{1 - x^2}$.`,
  symbols: [
    { tex: 'v', text: 'the value of the sine, cosine or tangent you start from (between $-1$ and $1$ for sine and cosine; any number for tangent)' },
    { tex: '\\theta', text: 'the angle returned, in radians unless stated' },
    { tex: '\\arcsin,\\ \\sin^{-1}', text: 'the inverse sine: the angle in $[-\\pi/2, \\pi/2]$ with sine $v$' },
    { tex: '\\arccos', text: 'the inverse cosine: the angle in $[0, \\pi]$ with cosine $v$' },
    { tex: '\\arctan', text: 'the inverse tangent: the angle in $(-\\pi/2, \\pi/2)$ with tangent $v$' },
  ],
  why: t`Every time you know a ratio and want the angle — a flight-path angle from velocity components, a launch azimuth, a refraction angle from Snell’s law, a phase from two amplitudes — you reach for an inverse trig function. Calculus II integrates with them too: $\int \frac{dx}{1 + x^2} = \arctan x + C$, and trigonometric substitution runs on triangles like the ones here.`,
  visual: {
    type: 'm0-unitcircle',
    title: 'One value, many angles, one answer',
    lead: t`Pick a function and set the value $v$. On the circle, the dashed line marks every point with that sine (or cosine, or slope); the gold point is the one the inverse function returns, on the bold green principal range. On the graph, the green branch is the only part the inverse uses.`,
    tasks: [
      t`arcsin with $v = 0.5$: two points on the circle, $30^\circ$ and $150^\circ$; arcsin returns $30^\circ$, from the right half. The graph crosses $y = 0.5$ again and again — only the green crossing counts.`,
      t`Switch to arccos and make $v$ negative: the answer moves into the second quadrant ($90^\circ$–$180^\circ$), still on the upper half — arccos never returns a negative angle.`,
      t`arctan: the two points are opposite each other, half a turn apart — the tangent repeats every $\pi$, not $2\pi$.`,
    ],
    params: { mode: 'inverse', inv: 'asin', v: 0.5, units: 'both' },
  },
  example: {
    prompt: t`A rocket launched from latitude $\phi$ into an orbit of inclination $i$ must head off at an azimuth $\beta$ (measured clockwise from north) with $\sin\beta = \dfrac{\cos i}{\cos\phi}$. From Kennedy Space Center ($\phi = ${KSC.lat}^\circ$) to the International Space Station’s orbit ($i = ${KSC.inc}^\circ$), which azimuths work?`,
    visual: compass([KSC.b, 180 - KSC.b], t`Azimuths are measured clockwise from north. The two directions with the same sine: northeast and southeast.`, [`${sig(KSC.b, 3)}°`, `${sig(180 - KSC.b, 3)}°`]),
    steps: [
      { label: 'The ratio', text: t`$\sin\beta = \dfrac{\cos ${KSC.inc}^\circ}{\cos ${KSC.lat}^\circ} = \dfrac{${sig(Math.cos(KSC.inc * D2R), 4)}}{${sig(Math.cos(KSC.lat * D2R), 4)}} = ${sig(KSC.s, 4)}$.` },
      { label: 'Principal angle', text: t`$\beta = \arcsin(${sig(KSC.s, 4)}) = ${sig(KSC.b, 3)}^\circ$: northeast.` },
      { label: 'The second solution', text: t`$\sin(180^\circ - \beta) = \sin\beta$, so $\beta = ${sig(180 - KSC.b, 3)}^\circ$ — southeast — works too. On the compass these two headings are mirror images in the east–west line; the calculator shows only the first.` },
      { label: 'Which to fly', text: t`Both reach an orbit of the same inclination; one passes the launch site heading north, the other heading south. Crewed launches to the ISS fly the northeast azimuth, which keeps them over the Atlantic, close to the North American coast.` },
      { label: 'Honest limits', text: t`This formula ignores Earth’s rotation and the rocket’s steering after liftoff; real azimuths differ by a few degrees. And it needs $\cos i \le \cos\phi$: no direct launch reaches an inclination smaller than the site’s latitude.` },
    ],
    answer: t`$\beta \approx ${sig(KSC.b, 3)}^\circ$ (northeast) or $${sig(180 - KSC.b, 3)}^\circ$ (southeast).`,
  },
  practice: [
    mcq({
      id: 'notation', difficulty: 1,
      prompt: t`What is $\sin^{-1}(0.5)$?`,
      visual: branchGraph('sin', 0.5, t`The sine with its principal branch (green) and the level $0.5$.`),
      choices: [t`$\tfrac{\pi}{6}$ ($30^\circ$)`, t`$\dfrac{1}{\sin 0.5} \approx 2.09$`, t`$\tfrac{5\pi}{6}$ ($150^\circ$)`, t`$2$`],
      answer: 0,
      why: {
        1: t`$\sin^{-1}$ is the inverse function, not the reciprocal: $1/\sin 0.5 = \csc 0.5$. The $-1$ on a function name means “undo”.`,
        2: t`$\sin 150^\circ = 0.5$ too, but $150^\circ$ is outside arcsin’s range $[-90^\circ, 90^\circ]$; the inverse returns the green-branch angle.`,
        3: t`That is $1/0.5$: the reciprocal of the *value*. $\sin^{-1}$ asks for an angle.`,
      },
      hints: [t`$\sin^{-1}(0.5)$ asks: which angle between $-90^\circ$ and $90^\circ$ has a sine of $0.5$?`],
      teach: t`$\sin^{-1}v = \arcsin v$: an angle, from $[-\pi/2, \pi/2]$ — never $1/\sin v$.`,
      explain: t`$\sin 30^\circ = 0.5$ and $30^\circ$ lies in $[-90^\circ, 90^\circ]$, so $\sin^{-1}(0.5) = \tfrac{\pi}{6}$.`,
    }),
    num({
      id: 'arcsin-sin', difficulty: 3,
      gen(r) {
        const th = r.pick([(2 * PI) / 3, (3 * PI) / 4, (5 * PI) / 6, (7 * PI) / 6, (5 * PI) / 4]), ans = Math.asin(Math.sin(th));
        return {
          prompt: t`Evaluate $\arcsin\!\big(\sin ${piTeX(th)}\big)$, in radians.`,
          answer: ans, units: 'rad', tol: { rel: 0.005 },
          errors: [{ value: th, feedback: t`$\arcsin$ undoes $\sin$ only on $[-\pi/2, \pi/2]$. $${piTeX(th)}$ is outside it, so the answer is the angle *inside* it with the same sine.` }, { value: -ans, feedback: t`Check the sign: $\sin ${piTeX(th)}$ is ${Math.sin(th) > 0 ? 'positive' : 'negative'}, so its arcsin is too.` }],
          hints: [t`First find $\sin ${piTeX(th)}$ (its reference angle is $${piTeX(Math.abs(ans))}$).`, t`Then ask which angle in $[-\pi/2, \pi/2]$ has that sine.`],
          teach: t`$\arcsin(\sin\theta) = \theta$ only when $-\pi/2 \le \theta \le \pi/2$; otherwise it returns the angle on the principal branch with the same sine.`,
          explain: t`$\sin ${piTeX(th)} = ${sig(Math.sin(th), 4)}$, and the angle in $[-\pi/2, \pi/2]$ with that sine is $${piTeX(ans)} \approx ${sig(ans, 4)}$.`,
          visual: branchGraph('sin', null, t`The sine and its principal branch (green); the gold dot is $x = ${piTeX(th)}$ on the curve.`, { points: [{ x: N(th), y: N(Math.sin(th)), color: 'gold', r: 5.5 }], hlines: [{ y: N(Math.sin(th)), color: 'gold' }] }),
        };
      },
    }),
    num({
      id: 'arccos-neg', difficulty: 2,
      gen(r) {
        const v = r.pick([0.5, 0.3, 0.8, Math.SQRT1_2]), vT = v === Math.SQRT1_2 ? t`\tfrac{\sqrt2}{2}` : `${v}`, ans = deg(Math.acos(-v));
        return {
          prompt: t`Evaluate $\arccos(-${vT})$ in degrees.`,
          answer: ans, units: 'deg', tol: { rel: 0.003 },
          errors: [{ value: -deg(Math.acos(v)), feedback: t`$\arccos$ never returns a negative angle: its range is $[0^\circ, 180^\circ]$. Unlike arcsin, $\arccos(-v) \neq -\arccos v$.` }, { value: deg(Math.acos(v)), feedback: t`That is $\arccos(+${vT})$. A negative cosine means $P$ is left of the centre, in the second quadrant.` }],
          hints: [t`$\arccos(-v) = 180^\circ - \arccos v$: reflect across the $y$-axis.`],
          teach: t`$\arccos$ answers from $[0^\circ, 180^\circ]$, so a negative input gives an obtuse angle: $\arccos(-v) = 180^\circ - \arccos v$.`,
          explain: t`$\arccos ${vT} = ${sig(deg(Math.acos(v)), 4)}^\circ$, so $\arccos(-${vT}) = 180^\circ - ${sig(deg(Math.acos(v)), 4)}^\circ = ${sig(ans, 4)}^\circ$.`,
          visual: branchGraph('cos', -v, t`The cosine with its principal branch $[0, \pi]$ (green) and the level $-${sig(v, 3)}$.`),
        };
      },
    }),
    num({
      id: 'sin-arccos', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]), flip = r.bool(0.5);
        const p = flip ? b : a, q = flip ? a : b, ans = q / c;
        return {
          prompt: t`Find the exact value of $\sin\!\left(\arccos \tfrac{${p}}{${c}}\right)$, as a decimal.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: p / c, feedback: t`That is $\cos$ of the angle — the value you started from. The sine is the *other* leg over the hypotenuse.` }, { value: 1 - p / c, feedback: t`Use squares: $\sin = \sqrt{1 - \cos^2}$, not $1 - \cos$.` }],
          hints: [t`Let $\theta = \arccos\tfrac{${p}}{${c}}$: a right triangle with adjacent $${p}$ and hypotenuse $${c}$.`, t`The opposite side is $\sqrt{${c}^2 - ${p}^2} = ${q}$.`],
          teach: t`To evaluate $\sin(\arccos x)$, draw the triangle the inverse describes and read off the other ratio: $\sqrt{1 - x^2}$.`,
          explain: t`Opposite $= \sqrt{${c * c} - ${p * p}} = ${q}$, so $\sin\theta = \tfrac{${q}}{${c}} = ${sig(ans, 4)}$ — positive, since $\arccos$ of a positive number is acute.`,
          visual: triFig({ v: [[0, 0], [p, 0], [p, q]], right: 1, angleAt: 0, sides: [`${p}`, '?', `${c}`], caption: t`The angle $\theta = \arccos\tfrac{${p}}{${c}}$ as a right triangle.` }),
        };
      },
    }),
    expr({
      id: 'tan-arcsin', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 3, 4, 5]), a2 = a * a;
        return {
          prompt: t`Simplify $\tan\!\left(\arcsin\dfrac{x}{${a}}\right)$ to an algebraic expression in $x$, for $-${a} < x < ${a}$.`,
          answer: `x/sqrt(${a2} - x^2)`, answerTeX: t`\dfrac{x}{\sqrt{${a2} - x^2}}`, vars: { x: [-0.9 * a, 0.9 * a] }, forbid: ['asin', 'tan', 'sin', 'cos'],
          errors: [{ answer: `x/${a}`, feedback: t`$x/${a}$ is the sine of the angle. Tangent is opposite over **adjacent**: find the adjacent side with Pythagoras.` }, { answer: `sqrt(${a2} - x^2)/x`, feedback: t`Upside down: that is the cotangent, adjacent over opposite.` }, { answer: `x/sqrt(${a2} + x^2)`, feedback: t`The hypotenuse is $${a}$, so the adjacent side is $\sqrt{${a}^2 - x^2}$, with a minus.` }],
          hints: [t`Let $\theta = \arcsin(x/${a})$: a right triangle with opposite $x$ and hypotenuse $${a}$.`, t`The adjacent side is $\sqrt{${a2} - x^2}$; then $\tan\theta = \text{opp}/\text{adj}$.`],
          teach: t`Inverse trig inside a trig function: draw the triangle, use Pythagoras, read off the ratio — the seed of trigonometric substitution.`,
          explain: t`Opposite $x$, hypotenuse $${a}$, adjacent $\sqrt{${a2} - x^2}$ (positive, since $\arcsin$ returns an angle with positive cosine): $\tan\theta = \dfrac{x}{\sqrt{${a2} - x^2}}$.`,
          visual: triFig({ v: [[0, 0], [Math.sqrt(a2 - (0.6 * a) ** 2), 0], [Math.sqrt(a2 - (0.6 * a) ** 2), 0.6 * a]], right: 1, angleAt: 0, sides: ['', 'x', `${a}`], caption: t`The angle $\theta = \arcsin(x/${a})$, drawn for one positive $x$.` }),
        };
      },
    }),
    mcq({
      id: 'all-solutions', difficulty: 2,
      gen(r) {
        const C = r.pick([
          { f: 'cos', vT: t`-\tfrac{\sqrt3}{2}`, v: -Math.sqrt(3) / 2, p: t`\tfrac{5\pi}{6}`, ok: t`$\tfrac{5\pi}{6}$ and $\tfrac{7\pi}{6}$`, one: t`only $\tfrac{5\pi}{6}$`, opp: t`$\tfrac{\pi}{6}$ and $\tfrac{11\pi}{6}$`, odd: t`$\tfrac{5\pi}{6}$ and $\tfrac{11\pi}{6}$`, oddWhy: t`$\tfrac{11\pi}{6}$ is $\tfrac{5\pi}{6} + \pi$, and adding $\pi$ flips the sign of the cosine. The mirror image in the $x$-axis is $2\pi - \tfrac{5\pi}{6}$.`, mirror: t`$2\pi - \tfrac{5\pi}{6} = \tfrac{7\pi}{6}$` },
          { f: 'sin', vT: t`-\tfrac{\sqrt2}{2}`, v: -Math.SQRT1_2, p: t`-\tfrac{\pi}{4}`, ok: t`$\tfrac{5\pi}{4}$ and $\tfrac{7\pi}{4}$`, one: t`only $-\tfrac{\pi}{4}$`, opp: t`$\tfrac{\pi}{4}$ and $\tfrac{3\pi}{4}$`, odd: t`$-\tfrac{\pi}{4}$ and $\tfrac{5\pi}{4}$`, oddWhy: t`Both angles have the right sine, but $-\tfrac{\pi}{4}$ is not in $[0, 2\pi)$: add $2\pi$ to get $\tfrac{7\pi}{4}$.`, mirror: t`$\pi - (-\tfrac{\pi}{4}) = \tfrac{5\pi}{4}$, and $-\tfrac{\pi}{4} + 2\pi = \tfrac{7\pi}{4}$` },
          { f: 'cos', vT: t`\tfrac12`, v: 0.5, p: t`\tfrac{\pi}{3}`, ok: t`$\tfrac{\pi}{3}$ and $\tfrac{5\pi}{3}$`, one: t`only $\tfrac{\pi}{3}$`, opp: t`$\tfrac{2\pi}{3}$ and $\tfrac{4\pi}{3}$`, odd: t`$\tfrac{\pi}{3}$ and $\tfrac{2\pi}{3}$`, oddWhy: t`$\pi - x$ keeps the **sine**; it flips the cosine: $\cos\tfrac{2\pi}{3} = -\tfrac12$.`, mirror: t`$2\pi - \tfrac{\pi}{3} = \tfrac{5\pi}{3}$` },
          { f: 'sin', vT: t`\tfrac{\sqrt3}{2}`, v: Math.sqrt(3) / 2, p: t`\tfrac{\pi}{3}`, ok: t`$\tfrac{\pi}{3}$ and $\tfrac{2\pi}{3}$`, one: t`only $\tfrac{\pi}{3}$`, opp: t`$\tfrac{4\pi}{3}$ and $\tfrac{5\pi}{3}$`, odd: t`$\tfrac{\pi}{3}$ and $\tfrac{5\pi}{3}$`, oddWhy: t`$2\pi - x$ keeps the **cosine**; it flips the sine: $\sin\tfrac{5\pi}{3} = -\tfrac{\sqrt3}{2}$.`, mirror: t`$\pi - \tfrac{\pi}{3} = \tfrac{2\pi}{3}$` },
        ]);
        const F = '\\' + C.f;
        return {
          prompt: t`Find all solutions of $${F} x = ${C.vT}$ with $0 \le x < 2\pi$.`,
          visual: branchGraph(C.f, C.v, t`The curve over one and a half periods, the principal branch in green, and the level $${C.vT}$.`),
          choices: [C.ok, C.one, C.opp, C.odd],
          answer: 0,
          why: {
            1: t`That is only what the calculator gives. A level strictly between $-1$ and $1$ is crossed **twice** in each period: find the second crossing too (and make sure both lie in $[0, 2\pi)$).`,
            2: t`Those angles have the opposite ${C.f === 'sin' ? 'sine' : 'cosine'}: check the sign of $${C.vT}$.`,
            3: C.oddWhy,
          },
          hints: [t`The calculator gives $${F}^{-1}(${C.vT}) = ${C.p}$. Where else on the circle is the ${C.f === 'sin' ? 'height' : 'horizontal position'} the same?`],
          teach: t`The inverse function gives one angle; the circle’s symmetry and the period give the rest: $\pi - x$ for a sine, $2\pi - x$ for a cosine.`,
          explain: t`$${F}^{-1}(${C.vT}) = ${C.p}$; the mirror solution: ${C.mirror}. In $[0, 2\pi)$: ${C.ok}.`,
        };
      },
    }),
    num({
      id: 'flight-path', difficulty: 2,
      gen(r) {
        const [vh, vv] = r.pick([[1.2, 0.9], [2.4, 0.7], [0.8, 1.5], [3.0, 0.4]]), ans = deg(Math.atan(vv / vh));
        return {
          prompt: t`Ninety seconds after launch, a rocket’s velocity has a horizontal component of $${vh}$ km/s and a vertical component of $${vv}$ km/s. What is its flight-path angle $\gamma$ above the horizontal?`,
          answer: ans, units: 'deg', tol: { rel: 0.003 },
          errors: [{ value: deg(Math.atan(vh / vv)), feedback: t`That is the angle from the vertical. Above the horizontal, $\tan\gamma = v_{\text{vertical}}/v_{\text{horizontal}}$.` }, { value: Math.atan(vv / vh), feedback: t`That is the angle in radians; the answer box wants degrees.` }],
          hints: [t`The vertical component is opposite $\gamma$, the horizontal adjacent.`, t`$\gamma = \arctan\dfrac{${vv}}{${vh}}$.`],
          teach: t`Direction from components: $\gamma = \arctan(\text{opposite}/\text{adjacent})$ — safe here because both components are positive.`,
          explain: t`$\gamma = \arctan(${vv}/${vh}) = ${sig(ans, 3)}^\circ$. As the rocket pitches over in its gravity turn, $\gamma$ falls from $90^\circ$ towards $0^\circ$ at orbit insertion.`,
          visual: triFig({ v: [[0, 0], [vh, 0], [vh, vv]], right: 1, angleAt: 0, angleLabel: 'γ', sides: [`${vh} km/s`, `${vv} km/s`, 'v'], caption: t`The velocity (hypotenuse) and its components; to scale.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-azimuth', difficulty: 3, transfer: true,
      gen(r) {
        const [site, lat, orbit, inc] = r.pick([['Baikonur Cosmodrome', 45.9, 'the ISS', 51.6], ['Wenchang', 19.6, 'the Tiangong space station', 41.5], ['Tanegashima', 30.4, 'the ISS', 51.6], ['Kennedy Space Center', 28.6, 'a 40° orbit', 40]]);
        const s = Math.cos(inc * D2R) / Math.cos(lat * D2R), b = deg(Math.asin(s)), ans = 180 - b;
        return {
          prompt: t`From ${site} (latitude $${lat}^\circ$), a rocket bound for ${orbit} (inclination $${inc}^\circ$) can head northeast or southeast, at azimuths $\beta$ (clockwise from north) with $\sin\beta = \cos i/\cos\phi$. Find the **southeast** azimuth, in degrees. (Ignore Earth’s rotation.)`,
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.4 },
          errors: [{ value: b, feedback: t`$${sig(b, 3)}^\circ$ is the calculator’s arcsin — the northeast heading. The southeast one has the same sine: $180^\circ - \beta$.` }, { value: 180 + b, feedback: t`$180^\circ + \beta$ is south-west, where the sine is negative. Use $180^\circ - \beta$.` }],
          hints: [t`$\sin\beta = \dfrac{\cos ${inc}^\circ}{\cos ${lat}^\circ} = ${sig(s, 4)}$.`, t`$\arcsin$ gives the northeast heading; the other angle with the same sine is $180^\circ - \beta$.`],
          teach: t`$\sin\beta = k$ has two solutions in a full turn, $\arcsin k$ and $180^\circ - \arcsin k$; a calculator shows only the first.`,
          explain: t`$\arcsin(${sig(s, 4)}) = ${sig(b, 3)}^\circ$ (northeast), so the southeast azimuth is $180^\circ - ${sig(b, 3)}^\circ = ${sig(ans, 4)}^\circ$.`,
          visual: compass([b], t`The northeast heading the calculator gives (gold); the southeast heading with the same sine is for you to find.`),
        };
      },
    }),
    num({
      id: 'cp-lander', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([6000, 9000, 12000]), T = r.pick([20, 25, 30]), W = (m * 1.62) / 1000, ans = deg(Math.acos(W / T));
        return {
          prompt: t`A lunar lander of mass $${m}$ kg ($g = 1.62\ \text{m/s}^2$, so its weight is $${sig(W, 3)}$ kN) tilts its $${T}$ kN engine away from the vertical to move sideways. At what tilt does the vertical component of thrust just balance its weight?`,
          answer: ans, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: deg(Math.asin(W / T)), feedback: t`The vertical component of a thrust tilted $\alpha$ from vertical is $T\cos\alpha$, not $T\sin\alpha$.` }, { value: Math.acos(W / T), feedback: t`That is radians; the box wants degrees.` }],
          hints: [t`Balance: $T\cos\alpha = W$.`, t`$\alpha = \arccos(W/T) = \arccos(${sig(W, 3)}/${T})$.`],
          teach: t`Solve for an angle with the inverse of whichever ratio the geometry gives: here a cosine, so $\arccos$ — principal range $[0^\circ, 180^\circ]$ covers every physical tilt.`,
          explain: t`$\cos\alpha = ${sig(W, 3)}/${T} = ${sig(W / T, 4)}$, so $\alpha = ${sig(ans, 3)}^\circ$. Tilt further and it starts to sink; less, and it climbs.`,
          visual: triFig({ v: [[0, 0], [0, Math.cos(35 * D2R)], [Math.sin(35 * D2R), Math.cos(35 * D2R)]], right: 1, angleAt: 0, angleLabel: 'α', sides: ['vertical', 'sideways', `${T} kN`], caption: t`The thrust (hypotenuse) and its components. Not to scale: the tilt is drawn at an arbitrary $35^\circ$.` }),
        };
      },
    }),
    mcq({
      id: 'cp-arctan', difficulty: 2,
      prompt: t`What is $\arctan\!\big(\tan\tfrac{3\pi}{4}\big)$?`,
      visual: branchGraph('tan', -1, t`The tangent with its principal branch (green, between the asymptotes at $\pm\pi/2$) and the level $-1$.`),
      choices: [t`$-\tfrac{\pi}{4}$`, t`$\tfrac{3\pi}{4}$`, t`$\tfrac{\pi}{4}$`, t`$-\tfrac{3\pi}{4}$`],
      answer: 0,
      why: {
        1: t`$\tfrac{3\pi}{4}$ is outside arctan’s range $(-\tfrac{\pi}{2}, \tfrac{\pi}{2})$. The tangent repeats every $\pi$: $\tfrac{3\pi}{4} - \pi = -\tfrac{\pi}{4}$.`,
        2: t`$\tan\tfrac{3\pi}{4} = -1$, and $\tan\tfrac{\pi}{4} = +1$: wrong sign.`,
        3: t`$-\tfrac{3\pi}{4}$ has $\tan = +1$, and it is outside the principal range anyway.`,
      },
      hints: [t`$\tan\tfrac{3\pi}{4} = -1$. Which angle in $(-\tfrac{\pi}{2}, \tfrac{\pi}{2})$ has tangent $-1$?`],
      teach: t`$\arctan(\tan\theta) = \theta$ only for $-\pi/2 < \theta < \pi/2$; otherwise shift $\theta$ by a multiple of $\pi$ into that range.`,
      explain: t`$\tan\tfrac{3\pi}{4} = -1$, and $\arctan(-1) = -\tfrac{\pi}{4}$, which is $\tfrac{3\pi}{4} - \pi$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §6.3 Inverse Trigonometric Functions', url: 'https://openstax.org/books/precalculus-2e/pages/6-3-inverse-trigonometric-functions' },
    { label: 'R. A. Braeunig, Rocket and Space Technology: Orbital Mechanics (launch azimuth)', url: 'http://www.braeunig.us/space/orbmech.htm' },
  ],
});
